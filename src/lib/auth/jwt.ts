import jwt from "jsonwebtoken";

import type { AuthTokenPayload } from "@/lib/auth/types";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return secret;
}

export function signAccessToken(payload: AuthTokenPayload, expiresIn: number) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
}
