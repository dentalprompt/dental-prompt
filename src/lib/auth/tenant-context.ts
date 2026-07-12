import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function getTenantContext() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  if (session.isSuperAdmin || !session.tenantId) {
    return {
      session,
      tenant: null
    };
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId }
  });

  return {
    session,
    tenant
  };
}
