import { prisma } from "@/lib/db/prisma";
import type { UpdateClinicSettingsFormValues } from "@/modules/settings/schemas/clinic-settings-schema";
import type { ClinicSettingsView } from "@/modules/settings/types/settings";

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
