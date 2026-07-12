import { prisma } from "@/lib/db/prisma";

export async function getUserPermissions(userId: string) {
  const roles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      }
    }
  });

  return roles.flatMap((entry) => entry.role.permissions.map((permission) => permission.permission));
}

export async function userCan(userId: string, resource: string, action: string) {
  const permissions = await getUserPermissions(userId);

  return permissions.some((permission) => permission.resource === resource && permission.action === action);
}
