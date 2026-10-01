import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User, {
  type IUser,
  type UserRole,
} from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured.");
}

const SALT_ROUNDS = 12;

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

const mapUser = (user: IUser): AuthUser => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
});

export const registerUser = async (
  data: RegisterUserData,
): Promise<AuthUser> => {
  const name = data.name.trim();
  const email = data.email.trim().toLowerCase();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("A user with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(
    data.password,
    SALT_ROUNDS,
  );

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: data.role ?? "doctor",
    isActive: true,
  });

  return mapUser(user);
};

export const loginUser = async (
  data: LoginUserData,
) => {
  const email = data.email.trim().toLowerCase();

  const user = await User.findOne({ email }).select(
    "+passwordHash",
  );

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  if (!user.isActive) {
    throw new Error("This user account is inactive.");
  }

  const passwordMatches = await bcrypt.compare(
    data.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password.");
  }

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "1h",
    },
  );

  return {
    user: mapUser(user),
    token,
  };
};

export const getUserById = async (
  userId: string,
): Promise<AuthUser | null> => {
  const user = await User.findById(userId);

  if (!user) {
    return null;
  }

  return mapUser(user);
};