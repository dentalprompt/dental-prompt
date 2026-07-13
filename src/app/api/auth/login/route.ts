import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { recordAuditLog } from "@/lib/audit/audit-log";
import { issueSessionResponse } from "@/lib/auth/session-issuer";
import { comparePassword, hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/modules/auth/schemas/login-schema";

const PREVIEW_USERS = [
  {
    id: "preview-user",
    tenantId: "preview-tenant",
    email: "admin@dentalprompt.com",
    password: "admin123",
    isSuperAdmin: false,
    roles: ["tenant_admin"]
  },
  {
    id: "preview-super-admin",
    tenantId: undefined,
    email: "superadmin@dentalprompt.com",
    password: "admin123",
    isSuperAdmin: true,
    roles: ["super_admin"]
  }
] as const;

async function ensureSeedUser(email: string) {
  const admin = await prisma.user.findUnique({
    where: { email },
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

  if (email === "superadmin@dentalprompt.com") {
    const role = await prisma.role.upsert({
      where: { code: "super_admin" },
      update: {},
      create: {
        code: "super_admin",
        name: "Super Admin"
      }
    });

    const permissions = await Promise.all(
      [
        ["tenants", "manage"],
        ["users", "manage"],
        ["audit", "view"],
        ["billing", "view"],
        ["dashboard", "view"]
      ].map(([resource, action]) =>
        prisma.permission.upsert({
          where: { resource_action: { resource, action } },
          update: {},
          create: {
            resource,
            action
          }
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

    return prisma.user.create({
      data: {
        name: "Super Admin Dental Prompt",
        email: "superadmin@dentalprompt.com",
        passwordHash: await hashPassword("admin123"),
        status: "ACTIVE",
        isSuperAdmin: true,
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
  let parsedValues: ReturnType<typeof loginSchema.parse> | null = null;

  try {
    const body = await request.json();
    const values = loginSchema.parse(body);
    parsedValues = values;
    const previewUser = PREVIEW_USERS.find((item) => item.email === values.email);

    if (!process.env.DATABASE_URL) {
      if (!previewUser || values.password !== previewUser.password) {
        return NextResponse.json({ message: "Credenciais invalidas." }, { status: 401 });
      }

      return issueSessionResponse({
        userId: previewUser.id,
        tenantId: previewUser.tenantId,
        email: previewUser.email,
        isSuperAdmin: previewUser.isSuperAdmin,
        roles: [...previewUser.roles],
        persistSession: false
      });
    }

    const seeded = await ensureSeedUser(values.email);
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
    await recordAuditLog({
      session: {
        sub: user.id,
        tenantId: user.tenantId ?? undefined,
        email: user.email,
        isSuperAdmin: user.isSuperAdmin,
        roles
      },
      request,
      module: "auth",
      action: "LOGIN",
      recordType: "Session",
      recordId: user.id,
      result: "success"
    });
    return issueSessionResponse({
      userId: user.id,
      tenantId: user.tenantId ?? undefined,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
      roles,
      persistSession: true
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientInitializationError) {
      const values = parsedValues;
      const previewUser = values ? PREVIEW_USERS.find((item) => item.email === values.email) : null;

      if (!values || !previewUser || values.password !== previewUser.password) {
        return NextResponse.json({ message: "Credenciais invalidas." }, { status: 401 });
      }

      return issueSessionResponse({
        userId: previewUser.id,
        tenantId: previewUser.tenantId,
        email: previewUser.email,
        isSuperAdmin: previewUser.isSuperAdmin,
        roles: [...previewUser.roles],
        persistSession: false
      });
    }

    return NextResponse.json({ message: "Nao foi possivel concluir o login." }, { status: 400 });
  }
}
