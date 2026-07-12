import { resolveTenantId } from "@/lib/auth/tenant-resolver";
import { prisma } from "@/lib/db/prisma";
import type { UpdateClinicSettingsFormValues } from "@/modules/settings/schemas/clinic-settings-schema";
import type {
  AnamnesisTemplateItem,
  ChairItem,
  ClinicSettingsView,
  ContractTemplateItem,
  FinancialAccountItem
} from "@/modules/settings/types/settings";

function buildFallbackClinicSettings(tenantId: string): ClinicSettingsView {
  return {
    tenantId,
    clinicName: "Dental Prompt Demo",
    legalName: "Dental Prompt Clinica Demonstracao",
    email: "contato@dentalprompt.com",
    phone: "(11) 4000-2026",
    whatsapp: "(11) 99999-2026",
    logoUrl: "",
    primaryColor: "#0A3F9A",
    secondaryColor: "#22C7C7"
  };
}

export async function getClinicSettings(tenantId: string): Promise<ClinicSettingsView> {
  if (!process.env.DATABASE_URL) {
    return buildFallbackClinicSettings(tenantId);
  }

  const settings = await prisma.clinicSettings.findUnique({
    where: {
      tenantId
    }
  });

  if (!settings) {
    return buildFallbackClinicSettings(tenantId);
  }

  return {
    tenantId,
    clinicName: settings.clinicName,
    legalName: settings.legalName ?? "",
    email: settings.email ?? "",
    phone: settings.phone ?? "",
    whatsapp: settings.whatsapp ?? "",
    logoUrl: settings.logoUrl ?? "",
    primaryColor: settings.primaryColor ?? "#0A3F9A",
    secondaryColor: settings.secondaryColor ?? "#22C7C7"
  };
}

export async function updateClinicSettings(tenantId: string, values: UpdateClinicSettingsFormValues) {
  if (!process.env.DATABASE_URL) {
    return {
      ...buildFallbackClinicSettings(tenantId),
      ...values,
      legalName: values.legalName ?? "",
      email: values.email ?? "",
      phone: values.phone ?? "",
      whatsapp: values.whatsapp ?? "",
      logoUrl: values.logoUrl ?? ""
    };
  }

  const settings = await prisma.clinicSettings.upsert({
    where: {
      tenantId
    },
    update: {
      clinicName: values.clinicName,
      legalName: values.legalName || null,
      email: values.email || null,
      phone: values.phone || null,
      whatsapp: values.whatsapp || null,
      logoUrl: values.logoUrl || null,
      primaryColor: values.primaryColor,
      secondaryColor: values.secondaryColor
    },
    create: {
      tenantId,
      clinicName: values.clinicName,
      legalName: values.legalName || null,
      email: values.email || null,
      phone: values.phone || null,
      whatsapp: values.whatsapp || null,
      logoUrl: values.logoUrl || null,
      primaryColor: values.primaryColor,
      secondaryColor: values.secondaryColor
    }
  });

  return {
    tenantId,
    clinicName: settings.clinicName,
    legalName: settings.legalName ?? "",
    email: settings.email ?? "",
    phone: settings.phone ?? "",
    whatsapp: settings.whatsapp ?? "",
    logoUrl: settings.logoUrl ?? "",
    primaryColor: settings.primaryColor ?? "#0A3F9A",
    secondaryColor: settings.secondaryColor ?? "#22C7C7"
  };
}

export async function listAnamnesisTemplates(): Promise<AnamnesisTemplateItem[]> {
  const tenantId = await resolveTenantId();

  if (!tenantId || !process.env.DATABASE_URL) {
    return [];
  }

  const items = await prisma.anamnesisTemplate.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" }
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description ?? "",
    specialty: item.specialty ?? "",
    isActive: item.isActive
  }));
}

export async function createAnamnesisTemplate(values: Omit<AnamnesisTemplateItem, "id" | "isActive">) {
  const tenantId = await resolveTenantId();

  if (!tenantId) {
    throw new Error("Tenant nao encontrado.");
  }

  const item = await prisma.anamnesisTemplate.create({
    data: {
      tenantId,
      name: values.name,
      description: values.description || null,
      specialty: values.specialty || null
    }
  });

  return {
    id: item.id,
    name: item.name,
    description: item.description ?? "",
    specialty: item.specialty ?? "",
    isActive: item.isActive
  };
}

export async function toggleAnamnesisTemplate(id: string) {
  const tenantId = await resolveTenantId();
  const current = await prisma.anamnesisTemplate.findUnique({ where: { id } });

  if (!tenantId || !current || current.tenantId !== tenantId) {
    throw new Error("Registro nao encontrado.");
  }

  return prisma.anamnesisTemplate.update({
    where: { id },
    data: { isActive: !current.isActive }
  });
}

export async function deleteAnamnesisTemplate(id: string) {
  const tenantId = await resolveTenantId();
  const current = await prisma.anamnesisTemplate.findUnique({ where: { id } });

  if (!tenantId || !current || current.tenantId !== tenantId) {
    throw new Error("Registro nao encontrado.");
  }

  await prisma.anamnesisTemplate.delete({ where: { id } });
}

export async function listContractTemplates(): Promise<ContractTemplateItem[]> {
  const tenantId = await resolveTenantId();

  if (!tenantId || !process.env.DATABASE_URL) {
    return [];
  }

  const items = await prisma.contractTemplate.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" }
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description ?? "",
    category: item.category ?? "",
    content: item.content,
    isActive: item.isActive
  }));
}

export async function createContractTemplate(values: Omit<ContractTemplateItem, "id" | "isActive">) {
  const tenantId = await resolveTenantId();

  if (!tenantId) {
    throw new Error("Tenant nao encontrado.");
  }

  const item = await prisma.contractTemplate.create({
    data: {
      tenantId,
      name: values.name,
      description: values.description || null,
      category: values.category || null,
      content: values.content
    }
  });

  return {
    id: item.id,
    name: item.name,
    description: item.description ?? "",
    category: item.category ?? "",
    content: item.content,
    isActive: item.isActive
  };
}

export async function toggleContractTemplate(id: string) {
  const tenantId = await resolveTenantId();
  const current = await prisma.contractTemplate.findUnique({ where: { id } });

  if (!tenantId || !current || current.tenantId !== tenantId) {
    throw new Error("Registro nao encontrado.");
  }

  return prisma.contractTemplate.update({
    where: { id },
    data: { isActive: !current.isActive }
  });
}

export async function deleteContractTemplate(id: string) {
  const tenantId = await resolveTenantId();
  const current = await prisma.contractTemplate.findUnique({ where: { id } });

  if (!tenantId || !current || current.tenantId !== tenantId) {
    throw new Error("Registro nao encontrado.");
  }

  await prisma.contractTemplate.delete({ where: { id } });
}

export async function listFinancialAccounts(): Promise<FinancialAccountItem[]> {
  const tenantId = await resolveTenantId();

  if (!tenantId || !process.env.DATABASE_URL) {
    return [];
  }

  const items = await prisma.financialAccount.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" }
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    bank: item.bank ?? "",
    agency: item.agency ?? "",
    account: item.account ?? "",
    type: item.type,
    initialBalance: Number(item.initialBalance),
    isActive: item.isActive
  }));
}

export async function createFinancialAccount(values: Omit<FinancialAccountItem, "id" | "isActive">) {
  const tenantId = await resolveTenantId();

  if (!tenantId) {
    throw new Error("Tenant nao encontrado.");
  }

  const item = await prisma.financialAccount.create({
    data: {
      tenantId,
      name: values.name,
      bank: values.bank || null,
      agency: values.agency || null,
      account: values.account || null,
      type: values.type,
      initialBalance: values.initialBalance
    }
  });

  return {
    id: item.id,
    name: item.name,
    bank: item.bank ?? "",
    agency: item.agency ?? "",
    account: item.account ?? "",
    type: item.type,
    initialBalance: Number(item.initialBalance),
    isActive: item.isActive
  };
}

export async function toggleFinancialAccount(id: string) {
  const tenantId = await resolveTenantId();
  const current = await prisma.financialAccount.findUnique({ where: { id } });

  if (!tenantId || !current || current.tenantId !== tenantId) {
    throw new Error("Registro nao encontrado.");
  }

  return prisma.financialAccount.update({
    where: { id },
    data: { isActive: !current.isActive }
  });
}

export async function deleteFinancialAccount(id: string) {
  const tenantId = await resolveTenantId();
  const current = await prisma.financialAccount.findUnique({ where: { id } });

  if (!tenantId || !current || current.tenantId !== tenantId) {
    throw new Error("Registro nao encontrado.");
  }

  await prisma.financialAccount.delete({ where: { id } });
}

export async function listChairs(): Promise<ChairItem[]> {
  const tenantId = await resolveTenantId();

  if (!tenantId || !process.env.DATABASE_URL) {
    return [];
  }

  const items = await prisma.chair.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" }
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    code: item.code ?? "",
    room: item.room ?? "",
    color: item.color ?? "",
    notes: item.notes ?? "",
    isActive: item.isActive
  }));
}

export async function createChair(values: Omit<ChairItem, "id" | "isActive">) {
  const tenantId = await resolveTenantId();

  if (!tenantId) {
    throw new Error("Tenant nao encontrado.");
  }

  const item = await prisma.chair.create({
    data: {
      tenantId,
      name: values.name,
      code: values.code || null,
      room: values.room || null,
      color: values.color || null,
      notes: values.notes || null
    }
  });

  return {
    id: item.id,
    name: item.name,
    code: item.code ?? "",
    room: item.room ?? "",
    color: item.color ?? "",
    notes: item.notes ?? "",
    isActive: item.isActive
  };
}

export async function toggleChair(id: string) {
  const tenantId = await resolveTenantId();
  const current = await prisma.chair.findUnique({ where: { id } });

  if (!tenantId || !current || current.tenantId !== tenantId) {
    throw new Error("Registro nao encontrado.");
  }

  return prisma.chair.update({
    where: { id },
    data: { isActive: !current.isActive }
  });
}

export async function deleteChair(id: string) {
  const tenantId = await resolveTenantId();
  const current = await prisma.chair.findUnique({ where: { id } });

  if (!tenantId || !current || current.tenantId !== tenantId) {
    throw new Error("Registro nao encontrado.");
  }

  await prisma.chair.delete({ where: { id } });
}
