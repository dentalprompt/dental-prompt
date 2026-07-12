import jwt from "jsonwebtoken";

import type { AuthTokenPayload } from "@/lib/auth/types";

const FALLBACK_JWT_SECRET = "dental-prompt-preview-secret-change-in-production";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return FALLBACK_JWT_SECRET;
  }

  return secret;
}

export function signAccessToken(payload: AuthTokenPayload, expiresIn: number) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
}
