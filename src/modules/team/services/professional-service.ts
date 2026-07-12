import { resolveTenantId } from "@/lib/auth/tenant-resolver";
import { prisma } from "@/lib/db/prisma";
import { mockProfessionals } from "@/modules/team/data/mock-professionals";
import type { ProfessionalListItem } from "@/modules/team/types/professional";

export async function listProfessionals(search?: string): Promise<ProfessionalListItem[]> {
  if (!process.env.DATABASE_URL) {
    if (!search) {
      return mockProfessionals;
    }

    const term = search.toLowerCase();
    return mockProfessionals.filter((professional) =>
      [professional.name, professional.specialty, professional.roleLabel]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }

  const tenantId = await resolveTenantId();

  if (!tenantId) {
    return [];
  }

  const professionals = await prisma.professional.findMany({
    where: {
      tenantId,
      isActive: true,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { specialty: { contains: search, mode: "insensitive" } },
              { roleLabel: { contains: search, mode: "insensitive" } }
            ]
          }
        : {})
    },
    orderBy: {
      name: "asc"
    }
  });

  return professionals.map((professional) => ({
    id: professional.id,
    name: professional.name,
    specialty: professional.specialty,
    roleLabel: professional.roleLabel,
    email: professional.email,
    phone: professional.phone,
    isActive: professional.isActive
  }));
}
