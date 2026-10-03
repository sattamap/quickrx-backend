import type { Request, Response } from "express";
import {
  getUserById,
  loginUser,
  refreshAccessToken,
  registerUser,
  revokeRefreshToken,
} from "../services/authService";

const isProduction = process.env.NODE_ENV === "production";

const refreshCookieName = isProduction
  ? "__Host-quickrx-refresh"
  : "quickrx-refresh";

const csrfCookieName = "quickrx-csrf";

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const csrfCookieOptions = {
  httpOnly: false,
  secure: isProduction,
  sameSite: "strict" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

/**
 * Check the request Origin for state-changing requests.
 *
 * This is an additional CSRF defense alongside:
 * - SameSite cookies
 * - CSRF token
 */
const isAllowedOrigin = (req: Request): boolean => {
  const frontendOrigin = process.env.FRONTEND_ORIGIN;

  if (!frontendOrigin) {
    console.warn(
      "FRONTEND_ORIGIN is not configured.",
    );

    return false;
  }

  const requestOrigin = req.headers.origin;

  return requestOrigin === frontendOrigin;
};

const requireAllowedOrigin = (
  req: Request,
  res: Response,
): boolean => {
  if (!isAllowedOrigin(req)) {
    res.status(403).json({
      success: false,
      message: "Invalid request origin.",
    });

    return false;
  }

  return true;
};

/**
 * Register
 */
export const registerController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!requireAllowedOrigin(req, res)) {
      return;
    }

    const {
      name,
      email,
      password,
    } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).json({
        success: false,
        message:
          "Name, email and password are required.",
      });

      return;
    }

    if (
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      res.status(400).json({
        success: false,
        message:
          "Name, email and password are required.",
      });

      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters long.",
      });

      return;
    }

    /**
     * IMPORTANT:
     *
     * We intentionally do NOT accept `role`
     * from the client.
     *
     * Public registration creates a doctor account.
     */
    const user = await registerUser({
      name,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      data: user,
      message: "User registered successfully.",
    });
  } catch (error) {
    console.error(
      "Register controller error:",
      error,
    );

    res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to register user.",
    });
  }
};

/**
 * Login
 */
export const loginController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!requireAllowedOrigin(req, res)) {
      return;
    }

    const {
      email,
      password,
    } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });

      return;
    }

    const result = await loginUser({
      email,
      password,
    });

    /**
     * Refresh token:
     *
     * HttpOnly means JavaScript cannot read it.
     */
    res.cookie(
      refreshCookieName,
      result.refreshToken,
      refreshCookieOptions,
    );

    /**
     * CSRF token:
     *
     * JavaScript CAN read this cookie and send
     * it back through X-CSRF-Token.
     */
    res.cookie(
      csrfCookieName,
      result.csrfToken,
      csrfCookieOptions,
    );

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshTokenExpiresAt:
          result.refreshTokenExpiresAt,
      },
      message: "Login successful.",
    });
  } catch (error) {
    console.error(
      "Login controller error:",
      error,
    );

    res.status(401).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Invalid email or password.",
    });
  }
};

/**
 * Refresh access token
 */
export const refreshController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!requireAllowedOrigin(req, res)) {
      return;
    }

    const refreshToken =
      req.cookies?.[refreshCookieName];

    const csrfToken =
      req.headers["x-csrf-token"];

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message:
          "Refresh session is missing.",
      });

      return;
    }

    if (
      typeof csrfToken !== "string" ||
      !csrfToken
    ) {
      res.status(403).json({
        success: false,
        message: "CSRF token is missing.",
      });

      return;
    }

    const result = await refreshAccessToken(
      refreshToken,
      csrfToken,
    );

    /**
     * Rotate the refresh cookie.
     */
    res.cookie(
      refreshCookieName,
      result.refreshToken,
      refreshCookieOptions,
    );

    /**
     * Rotate the CSRF cookie as well.
     */
    res.cookie(
      csrfCookieName,
      result.csrfToken,
      csrfCookieOptions,
    );

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshTokenExpiresAt:
          result.refreshTokenExpiresAt,
      },
      message: "Access token refreshed.",
    });
  } catch (error) {
    console.error(
      "Refresh controller error:",
      error,
    );

    /**
     * Clear potentially invalid credentials.
     */
    res.clearCookie(
      refreshCookieName,
      refreshCookieOptions,
    );

    res.clearCookie(
      csrfCookieName,
      csrfCookieOptions,
    );

    res.status(401).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to refresh authentication.",
    });
  }
};

/**
 * Logout
 */
export const logoutController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!requireAllowedOrigin(req, res)) {
      return;
    }

    const refreshToken =
      req.cookies?.[refreshCookieName];

    const csrfToken =
      req.headers["x-csrf-token"];

    if (
      refreshToken &&
      typeof csrfToken === "string" &&
      csrfToken
    ) {
      try {
        await revokeRefreshToken(
          refreshToken,
          csrfToken,
        );
      } catch (error) {
        console.error(
          "Failed to revoke refresh session:",
          error,
        );
      }
    }

    res.clearCookie(
      refreshCookieName,
      refreshCookieOptions,
    );

    res.clearCookie(
      csrfCookieName,
      csrfCookieOptions,
    );

    res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  } catch (error) {
    console.error(
      "Logout controller error:",
      error,
    );

    res.status(500).json({
      success: false,
      message: "Unable to logout.",
    });
  }
};

/**
 * Current authenticated user
 */
export const getCurrentUserController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });

      return;
    }

    const user = await getUserById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(
      "Get current user controller error:",
      error,
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to retrieve current user.",
    });
  }
};