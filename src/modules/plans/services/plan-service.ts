import { resolveTenantId } from "@/lib/auth/tenant-resolver";
import { prisma } from "@/lib/db/prisma";
import { mockPlanDetails, mockPlans } from "@/modules/plans/data/mock-plans";
import type {
  CreatePlanInput,
  PlanDetail,
  PlanListItem,
  UpdateProcedureInput
} from "@/modules/plans/types/plan";

function mapPlanListFromDetail(detail: PlanDetail): PlanListItem {
  return {
    id: detail.id,
    name: detail.name,
    description: detail.description,
    isDefault: detail.isDefault,
    isInsurance: detail.isInsurance,
    isActive: detail.isActive,
    proceduresCount: detail.procedures.length
  };
}

export async function listPlans(search?: string): Promise<PlanListItem[]> {
  if (!process.env.DATABASE_URL) {
    if (!search) {
      return mockPlans;
    }

    const term = search.toLowerCase();
    return mockPlans.filter((plan) =>
      [plan.name, plan.description]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }

  const tenantId = await resolveTenantId();

  if (!tenantId) {
    return [];
  }

  const plans = await prisma.plan.findMany({
    where: {
      tenantId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } }
            ]
          }
        : {})
    },
    include: {
      procedures: true
    },
    orderBy: {
      name: "asc"
    }
  });

  return plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    isDefault: plan.isDefault,
    isInsurance: plan.isInsurance,
    isActive: plan.isActive,
    proceduresCount: plan.procedures.length
  }));
}

export async function getPlanDetail(id: string): Promise<PlanDetail | null> {
  if (!process.env.DATABASE_URL) {
    return mockPlanDetails[id] ?? null;
  }

  const tenantId = await resolveTenantId();

  if (!tenantId) {
    return null;
  }

  const plan = await prisma.plan.findUnique({
    where: { id },
    include: {
      procedures: {
        orderBy: [{ specialty: "asc" }, { name: "asc" }]
      }
    }
  });

  if (!plan || plan.tenantId !== tenantId) {
    return null;
  }

  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    isDefault: plan.isDefault,
    isInsurance: plan.isInsurance,
    isActive: plan.isActive,
    procedures: plan.procedures.map((procedure) => ({
      id: procedure.id,
      specialty: procedure.specialty,
      name: procedure.name,
      price: Number(procedure.price),
      cost: Number(procedure.cost),
      isActive: procedure.isActive,
      usesToothFaces: procedure.usesToothFaces,
      notes: procedure.notes
    }))
  };
}

export async function createPlan(input: CreatePlanInput): Promise<PlanListItem> {
  if (!process.env.DATABASE_URL) {
    const detail: PlanDetail = {
      id: `mock_plan_${Date.now()}`,
      name: input.name,
      description: input.description ?? null,
      isDefault: input.isDefault ?? false,
      isInsurance: input.isInsurance ?? false,
      isActive: true,
      procedures: []
    };

    return mapPlanListFromDetail(detail);
  }

  const tenantId = await resolveTenantId();

  if (!tenantId) {
    throw new Error("Tenant nao encontrado para criar plano.");
  }

  const plan = await prisma.plan.create({
    data: {
      tenantId,
      name: input.name,
      description: input.description,
      isDefault: input.isDefault ?? false,
      isInsurance: input.isInsurance ?? false
    },
    include: {
      procedures: true
    }
  });

  return {
    id: plan.id,
    name: plan.name,
    description: plan.description,
    isDefault: plan.isDefault,
    isInsurance: plan.isInsurance,
    isActive: plan.isActive,
    proceduresCount: plan.procedures.length
  };
}

export async function updatePlanProcedure(
  planId: string,
  procedureId: string,
  input: UpdateProcedureInput
) {
  if (!process.env.DATABASE_URL) {
    const detail = mockPlanDetails[planId];
    const procedure = detail?.procedures.find((item) => item.id === procedureId);

    if (!procedure) {
      return null;
    }

    return {
      ...procedure,
      ...input
    };
  }

  const tenantId = await resolveTenantId();

  if (!tenantId) {
    return null;
  }

  const plan = await prisma.plan.findUnique({
    where: { id: planId },
    select: { tenantId: true }
  });

  if (!plan || plan.tenantId !== tenantId) {
    return null;
  }

  const procedure = await prisma.planProcedure.update({
    where: { id: procedureId },
    data: {
      price: input.price,
      cost: input.cost,
      isActive: input.isActive,
      usesToothFaces: input.usesToothFaces,
      notes: input.notes
    }
  });

  return {
    id: procedure.id,
    specialty: procedure.specialty,
    name: procedure.name,
    price: Number(procedure.price),
    cost: Number(procedure.cost),
    isActive: procedure.isActive,
    usesToothFaces: procedure.usesToothFaces,
    notes: procedure.notes
  };
}
