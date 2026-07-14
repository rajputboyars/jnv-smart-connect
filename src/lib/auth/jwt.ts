import jwt, { type SignOptions } from "jsonwebtoken";
import type { Role } from "@/types/roles";

export interface AccessTokenPayload {
  sub: string;
  role: Role;
  school?: string;
  name: string;
  email: string;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenVersion?: number;
}

function getAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error("Missing JWT_ACCESS_SECRET environment variable");
  return secret;
}

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("Missing JWT_REFRESH_SECRET environment variable");
  return secret;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ??
      "15m") as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, getAccessSecret(), options);
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ??
      "7d") as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, getRefreshSecret(), options);
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    return jwt.verify(token, getAccessSecret()) as AccessTokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    return jwt.verify(token, getRefreshSecret()) as RefreshTokenPayload;
  } catch {
    return null;
  }
}
