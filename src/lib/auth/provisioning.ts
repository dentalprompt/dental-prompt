import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

const tenantAdminPermissions: Array<[string, string]> = [
  ["dashboard", "view"],
  ["patients", "view"],
  ["patients", "create"],
  ["patients", "update"],
  ["appointments", "view"],
  ["appointments", "create"],
  ["appointments", "update"],
  ["conversations", "view"],
  ["conversations", "create"],
  ["conversations", "update"],
  ["financial", "view"],
  ["financial", "create"],
  ["financial", "update"],
  ["services", "view"],
  ["services", "create"],
  ["services", "update"],
  ["plans", "view"],
  ["plans", "create"],
  ["plans", "update"],
  ["settings", "view"],
  ["settings", "update"]
];

export async function ensureTenantAdminRole() {
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
    tenantAdminPermissions.map(([resource, action]) =>
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

  return role;
}

export async function createTenantAdminUser({
  name,
  email,
  phone,
  password
}: {
  name: string;
  email: string;
  phone?: string | null;
  password: string;
}) {
  const role = await ensureTenantAdminRole();

  const baseSlug = slugify(name) || "clinica";
  let slug = baseSlug;
  let slugIndex = 1;

  while (await prisma.tenant.findUnique({ where: { slug } })) {
    slugIndex += 1;
    slug = `${baseSlug}-${slugIndex}`;
  }

  const passwordHash = await hashPassword(password);

  const tenant = await prisma.tenant.create({
    data: {
      name: `Clinica ${name}`,
      legalName: `Clinica ${name}`,
      slug,
      status: "ACTIVE",
      settings: {
        create: {
          clinicName: `Clinica ${name}`,
          legalName: `Clinica ${name}`,
          email,
          phone: phone ?? null,
          whatsapp: phone ?? null
        }
      },
      users: {
        create: {
          name,
          email,
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

  return {
    tenant,
    user,
    roles: user.roles.map((item) => item.role.code)
  };
}
