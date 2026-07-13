import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { issueSessionResponse } from "@/lib/auth/session-issuer";
import { createTenantAdminUser, ensureTenantAdminRole } from "@/lib/auth/provisioning";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";

const GOOGLE_STATE_COOKIE = "dp_google_oauth_state";

type GoogleTokenResponse = {
  access_token: string;
  id_token: string;
};

type GoogleUserProfile = {
  email: string;
  email_verified: boolean;
  name: string;
};

async function exchangeCodeForTokens(code: string) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: process.env.GOOGLE_REDIRECT_URI ?? "",
      grant_type: "authorization_code"
    })
  });

  if (!response.ok) {
    throw new Error("Falha ao trocar o codigo OAuth do Google.");
  }

  return (await response.json()) as GoogleTokenResponse;
}

async function fetchGoogleUserProfile(accessToken: string) {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Falha ao consultar o perfil do Google.");
  }

  return (await response.json()) as GoogleUserProfile;
}

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const state = requestUrl.searchParams.get("state");
    const error = requestUrl.searchParams.get("error");

    if (error) {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, request.url));
    }

    if (!code || !state) {
      return NextResponse.redirect(new URL("/login?error=google_callback_invalido", request.url));
    }

    const cookieStore = await cookies();
    const storedState = cookieStore.get(GOOGLE_STATE_COOKIE)?.value;
    cookieStore.delete(GOOGLE_STATE_COOKIE);

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(new URL("/login?error=google_state_invalido", request.url));
    }

    const [, mode = "login", encodedNext = encodeURIComponent("/dashboard")] = state.split(":");
    const next = decodeURIComponent(encodedNext || encodeURIComponent("/dashboard"));

    if (!process.env.DATABASE_URL) {
      return NextResponse.redirect(new URL("/login?error=google_sem_banco", request.url));
    }

    const tokens = await exchangeCodeForTokens(code);
    const profile = await fetchGoogleUserProfile(tokens.access_token);

    if (!profile.email || !profile.email_verified) {
      return NextResponse.redirect(new URL("/login?error=google_email_nao_verificado", request.url));
    }

    let user = await prisma.user.findUnique({
      where: { email: profile.email },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    let roles: string[] = [];

    if (!user) {
      if (mode === "login") {
        return NextResponse.redirect(new URL("/login?error=google_conta_nao_encontrada", request.url));
      }

      const created = await createTenantAdminUser({
        name: profile.name || profile.email.split("@")[0],
        email: profile.email,
        phone: null,
        password: randomUUID()
      });

      user = created.user;
      roles = created.roles;
    } else if (!user.tenantId && !user.isSuperAdmin) {
      const role = await ensureTenantAdminRole();
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: user.passwordHash || (await hashPassword(randomUUID())),
          roles: {
            connectOrCreate: {
              where: {
                userId_roleId: {
                  userId: user.id,
                  roleId: role.id
                }
              },
              create: {
                roleId: role.id
              }
            }
          }
        },
        include: {
          roles: {
            include: {
              role: true
            }
          }
        }
      });
      user = updatedUser;
      roles = updatedUser.roles.map((item) => item.role.code);
    } else {
      roles = user.roles.map((item) => item.role.code);
    }

    return issueSessionResponse({
      userId: user.id,
      tenantId: user.tenantId ?? undefined,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
      roles,
      persistSession: true,
      redirectTo: next || "/dashboard"
    });
  } catch {
    return NextResponse.redirect(new URL("/login?error=google_falhou", request.url));
  }
}
