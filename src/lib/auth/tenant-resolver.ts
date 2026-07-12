import { getTenantContext } from "@/lib/auth/tenant-context";
import { prisma } from "@/lib/db/prisma";

export async function resolveTenantId() {
  const context = await getTenantContext();

  if (context?.tenant?.id) {
    return context.tenant.id;
  }

  const fallbackTenant = await prisma.tenant.findFirst({
    orderBy: {
      createdAt: "asc"
    },
    select: {
      id: true
    }
  });

  return fallbackTenant?.id ?? null;
}
