import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import User, {
  type IUser,
  type UserRole,
} from "../models/User";

import RefreshSession from "../models/RefreshSession";

import type { Types } from "mongoose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured.");
}

const PASSWORD_SALT_ROUNDS = 12;

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 7;

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

interface AccessTokenPayload {
  userId: string;
  role: UserRole;
}

/**
 * Convert a MongoDB user document into the safe user object
 * returned to the frontend.
 */
const mapUser = (user: IUser): AuthUser => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
});

/**
 * Generate a cryptographically secure refresh token.
 */
const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString("hex");
};

/**
 * Generate a cryptographically secure CSRF token.
 */
const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Hash a token before storing it in MongoDB.
 */
const hashToken = (token: string): string => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

/**
 * Compare two hashes safely.
 *
 * crypto.timingSafeEqual helps prevent timing-based
 * comparisons when checking token hashes.
 */
const tokensMatch = (
  tokenA: string,
  tokenB: string,
): boolean => {
  const bufferA = Buffer.from(tokenA, "hex");
  const bufferB = Buffer.from(tokenB, "hex");

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
};

/**
 * Generate a short-lived access token.
 */
const generateAccessToken = (user: IUser): string => {
  const payload: AccessTokenPayload = {
    userId: user._id.toString(),
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};

/**
 * Create a refresh session.
 *
 * Important:
 * - Raw refresh token is returned only once.
 * - Only its SHA-256 hash is stored in MongoDB.
 * - Raw CSRF token is returned to the controller.
 * - Only its hash is stored in MongoDB.
 * - familyId links rotated refresh sessions together.
 *
 * A new familyId is generated when the user logs in.
 * During refresh-token rotation, the existing familyId
 * is passed in so the new session remains in the same family.
 */
const createRefreshSession = async (
  user: IUser,
  familyId: string = crypto.randomUUID(),
) => {
  const refreshToken = generateRefreshToken();
  const csrfToken = generateCsrfToken();

  const refreshTokenHash = hashToken(refreshToken);
  const csrfTokenHash = hashToken(csrfToken);

  const expiresAt = new Date(
    Date.now() +
      REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
  );

  await RefreshSession.create({
    userId: user._id,
    tokenHash: refreshTokenHash,
    csrfTokenHash,
    familyId,
    expiresAt,
  });

  return {
    refreshToken,
    csrfToken,
    expiresAt,
    familyId,
  };
};

/**
 * Register a new user.
 */
export const registerUser = async (
  data: RegisterUserData,
): Promise<AuthUser> => {
  const normalizedEmail = data.email.toLowerCase().trim();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new Error("A user with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(
    data.password,
    PASSWORD_SALT_ROUNDS,
  );

  const user = await User.create({
    name: data.name.trim(),
    email: normalizedEmail,
    passwordHash,

    // Public registration should create doctors by default.
    // The controller should not accept a role from the client.
    role: data.role ?? "doctor",

    isActive: true,
  });

  return mapUser(user);
};

/**
 * Login user and create a new refresh-token family.
 */
export const loginUser = async (
  data: LoginUserData,
) => {
  const normalizedEmail = data.email.toLowerCase().trim();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+passwordHash");

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  if (!user.isActive) {
    throw new Error(
      "This user account has been deactivated.",
    );
  }

  const passwordMatches = await bcrypt.compare(
    data.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password.");
  }

  const accessToken = generateAccessToken(user);

  /**
   * A new login starts a completely new refresh-token family.
   */
  const refreshSession = await createRefreshSession(user);

  return {
    user: mapUser(user),
    accessToken,

    refreshToken: refreshSession.refreshToken,

    csrfToken: refreshSession.csrfToken,

    refreshTokenExpiresAt:
      refreshSession.expiresAt,
  };
};

/**
 * Rotate a refresh session and issue a new
 * access token + refresh token + CSRF token.
 *
 * Refresh-token reuse protection:
 *
 * Every refresh session belongs to a family.
 *
 * Example:
 *
 * Login
 *   ↓
 * Token A (family-1)
 *   ↓ refresh
 * Token B (family-1)
 *   ↓ refresh
 * Token C (family-1)
 *
 * Token A is now revoked.
 *
 * If someone later attempts to use Token A,
 * that indicates possible refresh-token theft/reuse.
 *
 * In that situation, every still-active session in
 * family-1 is revoked.
 */
export const refreshAccessToken = async (
  refreshToken: string,
  csrfToken: string,
) => {
  const tokenHash = hashToken(refreshToken);

  /**
   * IMPORTANT:
   *
   * We intentionally do NOT filter revokedAt here.
   *
   * We need to be able to detect whether the supplied
   * refresh token has already been revoked.
   */
  const session = await RefreshSession.findOne({
    tokenHash,
  });

  if (!session) {
    throw new Error(
      "Invalid or expired refresh session.",
    );
  }

  /**
   * Refresh-token reuse detection.
   *
   * If this token was already rotated/revoked, somebody
   * is trying to use an old refresh token.
   *
   * Revoke every active session belonging to the same
   * token family.
   */
  if (session.revokedAt) {
    await RefreshSession.updateMany(
      {
        userId: session.userId,
        familyId: session.familyId,
        revokedAt: {
          $exists: false,
        },
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
    );

    throw new Error(
      "Refresh token reuse detected.",
    );
  }

  /**
   * Check refresh-token expiration.
   */
  if (session.expiresAt <= new Date()) {
    /**
     * Mark the expired session as revoked.
     */
    session.revokedAt = new Date();

    await session.save();

    throw new Error(
      "Invalid or expired refresh session.",
    );
  }

  /**
   * Verify the CSRF token against the hash stored
   * with this refresh session.
   */
  const csrfTokenHash = hashToken(csrfToken);

  if (
    !tokensMatch(
      csrfTokenHash,
      session.csrfTokenHash,
    )
  ) {
    throw new Error("Invalid CSRF token.");
  }

  /**
   * Verify that the user still exists.
   */
  const user = await User.findById(session.userId);

  if (!user) {
    throw new Error(
      "User account no longer exists.",
    );
  }

  /**
   * Verify that the account is still active.
   */
  if (!user.isActive) {
    throw new Error(
      "This user account has been deactivated.",
    );
  }

  /**
   * Revoke the old refresh session.
   */
  session.revokedAt = new Date();

  await session.save();

  /**
   * Generate a new short-lived access token.
   */
  const accessToken = generateAccessToken(user);

  /**
   * IMPORTANT:
   *
   * Keep the SAME familyId.
   *
   * This allows us to detect reuse of any old token
   * belonging to this refresh-token rotation chain.
   */
  const newRefreshSession =
    await createRefreshSession(
      user,
      session.familyId,
    );

  return {
    user: mapUser(user),

    accessToken,

    refreshToken:
      newRefreshSession.refreshToken,

    csrfToken:
      newRefreshSession.csrfToken,

    refreshTokenExpiresAt:
      newRefreshSession.expiresAt,
  };
};

/**
 * Revoke a refresh session during logout.
 */
export const revokeRefreshToken = async (
  refreshToken: string,
  csrfToken: string,
): Promise<void> => {
  const tokenHash = hashToken(refreshToken);

  const session = await RefreshSession.findOne({
    tokenHash,
    revokedAt: {
      $exists: false,
    },
  });

  /**
   * Logout should be idempotent.
   *
   * If the session doesn't exist or is already revoked,
   * there is nothing more to do.
   */
  if (!session) {
    return;
  }

  const csrfTokenHash = hashToken(csrfToken);

  if (
    !tokensMatch(
      csrfTokenHash,
      session.csrfTokenHash,
    )
  ) {
    throw new Error("Invalid CSRF token.");
  }

  session.revokedAt = new Date();

  await session.save();
};

/**
 * Revoke all refresh sessions belonging to a user.
 *
 * Useful when:
 * - password is changed
 * - account is compromised
 * - administrator disables sessions
 * - all devices need to be logged out
 */
export const revokeAllUserSessions = async (
  userId: Types.ObjectId,
): Promise<void> => {
  await RefreshSession.updateMany(
    {
      userId,
      revokedAt: {
        $exists: false,
      },
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );
};

/**
 * Get the current user.
 */
export const getUserById = async (
  userId: string,
): Promise<AuthUser | null> => {
  const user = await User.findById(userId);

  if (!user) {
    return null;
  }

  return mapUser(user);
};