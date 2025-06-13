import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "../models/User";

// JWT payload interface
// Contains user information to be encoded in the token
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  companyId?: string;
  tokenVersion?: number;
}

// JWT token response interface
// Contains the generated token and its expiration time
export interface TokenResponse {
  token: string;
  expiresIn: string;
}

// Generate JWT token
export const generateToken = (payload: JWTPayload): TokenResponse => {
  const expiresIn = "24h";

  const token = jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      companyId: payload.companyId,
      tokenVersion: payload.tokenVersion || 0,
    },
    env.JWT_SECRET,
    {
      expiresIn,
      issuer: "exam-api",
      audience: "exam-client",
    }
  );

  return {
    token,
    expiresIn,
  };
};

// Verify JWT token
export const verifyToken = (token: string): JWTPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET, {
    issuer: "exam-api",
    audience: "exam-client",
  }) as JWTPayload;

  return decoded;
};

// Extract token from Authorization header
export const extractTokenFromHeader = (
  authHeader: string | undefined
): string => {
  if (!authHeader) {
    throw new Error("Authorization header is missing");
  }

  if (!authHeader.startsWith("Bearer ")) {
    throw new Error("Authorization header must start with Bearer");
  }

  const token = authHeader.substring(7);

  if (!token) {
    throw new Error("Token is missing from Authorization header");
  }

  return token;
};

// Generate token for user (helper function)
export const generateUserToken = (user: {
  _id: string;
  email: string;
  role: UserRole;
  companyId?: string;
  tokenVersion?: number;
}): TokenResponse => {
  const payload: JWTPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
    tokenVersion: user.tokenVersion || 0,
  };

  return generateToken(payload);
};
