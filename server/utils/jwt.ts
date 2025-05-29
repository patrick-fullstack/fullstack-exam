import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UserRole } from '../models/User';

// JWT payload interface
// Contains user information to be encoded in the token
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  companyId?: string;
}

// JWT token response interface
// Contains the generated token and its expiration time
export interface TokenResponse {
  token: string;
  expiresIn: string;
}

// Generate JWT token
export const generateToken = (payload: JWTPayload): TokenResponse => {
  try {
    // Token expires in 24 hours
    const expiresIn = '24h';
    
    // Generate token with payload and secret
    const token = jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        companyId: payload.companyId
      },
      env.JWT_SECRET,
      { 
        expiresIn,
        issuer: 'exam-api', // Token issuer
        audience: 'exam-client' // Token audience
      }
    );

    return {
      token,
      expiresIn
    };
  } catch (error) {
    throw new Error('Failed to generate token');
  }
};

// Verify JWT token
export const verifyToken = (token: string): JWTPayload => {
  try {
    // Verify token with secret and options
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'exam-api',
      audience: 'exam-client'
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

// Extract token from Authorization header
export const extractTokenFromHeader = (authHeader: string | undefined): string => {
  if (!authHeader) {
    throw new Error('Authorization header is missing');
  }

  // Check if header starts with 'Bearer '
  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Authorization header must start with Bearer');
  }

  // Extract token part (remove 'Bearer ' prefix)
  const token = authHeader.substring(7);
  
  if (!token) {
    throw new Error('Token is missing from Authorization header');
  }

  return token;
};

// Generate token for user (helper function)
export const generateUserToken = (user: {
  _id: string;
  email: string;
  role: UserRole;
  companyId?: string;
}): TokenResponse => {
  const payload: JWTPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
    companyId: user.companyId
  };

  return generateToken(payload);
};