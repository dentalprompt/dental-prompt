import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ACCESS_TOKEN_TTL, AUTH_COOKIE_NAME, REFRESH_TOKEN_TTL, REFRESH_COOKIE_NAME } from "@/lib/auth/constants";
import { signAccessToken } from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { registerSchema } from "@/modules/auth/schemas/register-schema";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function setAuthCookies({
  userId,
  tenantId,
  email,
  roles
}: {
  userId: string;
  tenantId: string;
  email: string;
  roles: string[];
}) {
  const accessToken = signAccessToken(
    {
      sub: userId,
      tenantId,
      email,
      isSuperAdmin: false,
      roles
    },
    ACCESS_TOKEN_TTL
  );

  const refreshToken = randomUUID();

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
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const values = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: values.email }
    });

    if (existingUser) {
      return NextResponse.json({ message: "Ja existe uma conta com este e-mail." }, { status: 409 });
    }

    const role = await prisma.role.upsert({
      where: { code: "tenant_admin" },
      update: {},
      create: {
        code: "tenant_admin",
        name: "Administrador da Clinica",
        description: "Acesso completo ao tenant."
      }
    });

    const permissions = await Promise.all(
      [
        ["dashboard", "view"],
        ["patients", "view"],
        ["patients", "create"],
        ["patients", "update"],
        ["appointments", "view"],
        ["appointments", "create"],
        ["conversations", "view"],
        ["financial", "view"],
        ["services", "view"],
        ["settings", "view"]
      ].map(([resource, action]) =>
        prisma.permission.upsert({
          where: { resource_action: { resource, action } },
          update: {},
          create: { resource, action }
        })
      )
    );

    await Promise.all(
      permissions.map((permission) =>
        prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id
            }
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id
          }
        })
      )
    );

    const baseSlug = slugify(values.name) || "clinica";
    let slug = baseSlug;
    let slugIndex = 1;

    while (await prisma.tenant.findUnique({ where: { slug } })) {
      slugIndex += 1;
      slug = `${baseSlug}-${slugIndex}`;
    }

    const passwordHash = await hashPassword(values.password);

    const tenant = await prisma.tenant.create({
      data: {
        name: `Clinica ${values.name}`,
        legalName: `Clinica ${values.name}`,
        slug,
        status: "ACTIVE",
        settings: {
          create: {
            clinicName: `Clinica ${values.name}`,
            legalName: `Clinica ${values.name}`,
            email: values.email,
            phone: values.phone,
            whatsapp: values.phone
          }
        },
        users: {
          create: {
            name: values.name,
            email: values.email,
            passwordHash,
            status: "ACTIVE",
            roles: {
              create: {
                roleId: role.id
              }
            }
          }
        }
      },
      include: {
        users: {
          include: {
            roles: {
              include: {
                role: true
              }
            }
          }
        }
      }
    });

    const user = tenant.users[0];
    const roles = user.roles.map((item) => item.role.code);

    await setAuthCookies({
      userId: user.id,
      tenantId: tenant.id,
      email: user.email,
      roles
    });

    return NextResponse.json({
      ok: true,
      data: {
        userId: user.id,
        tenantId: tenant.id
      }
    });
  } catch {
    return NextResponse.json({ message: "Nao foi possivel concluir o cadastro." }, { status: 400 });
  }
}
