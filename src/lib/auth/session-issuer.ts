import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ACCESS_TOKEN_TTL, AUTH_COOKIE_NAME, REFRESH_TOKEN_TTL, REFRESH_COOKIE_NAME } from "@/lib/auth/constants";
import { signAccessToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db/prisma";

type IssueSessionInput = {
  userId: string;
  tenantId?: string;
  email: string;
  isSuperAdmin: boolean;
  roles: string[];
  persistSession: boolean;
  redirectTo?: string;
};

export async function issueSessionResponse({
  userId,
  tenantId,
  email,
  isSuperAdmin,
  roles,
  persistSession,
  redirectTo
}: IssueSessionInput) {
  const accessToken = signAccessToken(
    {
      sub: userId,
      tenantId,
      email,
      isSuperAdmin,
      roles
    },
    ACCESS_TOKEN_TTL
  );

  const refreshToken = randomUUID();

  if (persistSession && process.env.DATABASE_URL) {
    await prisma.session.create({
      data: {
        userId,
        refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL * 1000)
      }
    });

    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() }
    });
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_TTL
  });
  cookieStore.set(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: REFRESH_TOKEN_TTL
  });

  if (redirectTo) {
    return NextResponse.redirect(new URL(redirectTo, process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  }

  return NextResponse.json({ ok: true, mode: persistSession ? "database" : "preview" });
}
