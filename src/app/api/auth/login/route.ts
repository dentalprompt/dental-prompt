import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { ACCESS_TOKEN_TTL, AUTH_COOKIE_NAME, REFRESH_TOKEN_TTL, REFRESH_COOKIE_NAME } from "@/lib/auth/constants";
import { signAccessToken } from "@/lib/auth/jwt";
import { comparePassword, hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/modules/auth/schemas/login-schema";

async function ensureSeedUser() {
  const admin = await prisma.user.findUnique({
    where: { email: "admin@dentalprompt.com" },
    include: {
      roles: {
        include: {
          role: true
        }
      },
      tenant: true
    }
  });

  if (admin) {
    return admin;
  }

  const tenant = await prisma.tenant.upsert({
    where: { slug: "dental-prompt-demo" },
    update: {},
    create: {
      name: "Dental Prompt Demo",
      slug: "dental-prompt-demo",
      status: "ACTIVE",
      settings: {
        create: {
          clinicName: "Dental Prompt Demo",
          email: "contato@dentalprompt.com"
        }
      }
    }
  });

  const role = await prisma.role.upsert({
    where: { code: "tenant_admin" },
    update: {},
    create: {
      code: "tenant_admin",
      name: "Administrador da Clinica"
    }
  });

  await prisma.permission.upsert({
    where: { resource_action: { resource: "dashboard", action: "view" } },
    update: {},
    create: {
      resource: "dashboard",
      action: "view",
      description: "Acessar o dashboard principal"
    }
  });

  const user = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: "Administrador Dental Prompt",
      email: "admin@dentalprompt.com",
      passwordHash: await hashPassword("admin123"),
      status: "ACTIVE",
      roles: {
        create: {
          roleId: role.id
        }
      }
    },
    include: {
      roles: {
        include: {
          role: true
        }
      },
      tenant: true
    }
  });

  return user;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const values = loginSchema.parse(body);

    const seeded = await ensureSeedUser();
    const user =
      seeded.email === values.email
        ? seeded
        : await prisma.user.findUnique({
            where: { email: values.email },
            include: {
              roles: {
                include: {
                  role: true
                }
              }
            }
          });

    if (!user) {
      return NextResponse.json({ message: "Credenciais invalidas." }, { status: 401 });
    }

    const passwordMatches = await comparePassword(values.password, user.passwordHash);

    if (!passwordMatches) {
      return NextResponse.json({ message: "Credenciais invalidas." }, { status: 401 });
    }

    const roles = user.roles.map((item) => item.role.code);
    const accessToken = signAccessToken(
      {
        sub: user.id,
        tenantId: user.tenantId ?? undefined,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
        roles
      },
      ACCESS_TOKEN_TTL
    );

    const refreshToken = randomUUID();

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL * 1000)
      }
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

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

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        {
          message:
            "DATABASE_URL nao configurada ou banco indisponivel. Configure o ambiente para ativar autenticacao persistente."
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Nao foi possivel concluir o login." }, { status: 400 });
  }
}
