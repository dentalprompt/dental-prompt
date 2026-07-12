import { cache } from "react";

import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

type AdminTenantSummary = {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
  users: number;
  patients: number;
  appointments: number;
  conversations: number;
};

type AdminAuditItem = {
  id: string;
  module: string;
  action: string;
  recordType: string;
  result: string | null;
  createdAt: string;
  tenantName: string;
  userName: string;
};

type AdminRoleSummary = {
  id: string;
  code: string;
  name: string;
  users: number;
  permissions: string[];
};

export type AdminOverviewData = {
  totals: {
    tenants: number;
    activeTenants: number;
    trialTenants: number;
    blockedTenants: number;
    users: number;
    superAdmins: number;
    activeUsers: number;
    auditLogs: number;
  };
  tenants: AdminTenantSummary[];
  recentAuditLogs: AdminAuditItem[];
  roles: AdminRoleSummary[];
};

function buildMockAdminOverview(): AdminOverviewData {
  return {
    totals: {
      tenants: 12,
      activeTenants: 9,
      trialTenants: 2,
      blockedTenants: 1,
      users: 48,
      superAdmins: 2,
      activeUsers: 43,
      auditLogs: 184
    },
    tenants: [
      {
        id: "tenant-1",
        name: "Dental Prompt Demo",
        slug: "dental-prompt-demo",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        users: 8,
        patients: 2847,
        appointments: 412,
        conversations: 189
      },
      {
        id: "tenant-2",
        name: "Clinica Sorriso Vivo",
        slug: "clinica-sorriso-vivo",
        status: "TRIAL",
        createdAt: new Date().toISOString(),
        users: 4,
        patients: 913,
        appointments: 128,
        conversations: 52
      }
    ],
    recentAuditLogs: [
      {
        id: "audit-1",
        module: "patients",
        action: "UPDATE",
        recordType: "Patient",
        result: "success",
        createdAt: new Date().toISOString(),
        tenantName: "Dental Prompt Demo",
        userName: "Administrador Dental Prompt"
      },
      {
        id: "audit-2",
        module: "financial",
        action: "CREATE",
        recordType: "FinancialEntry",
        result: "success",
        createdAt: new Date().toISOString(),
        tenantName: "Clinica Sorriso Vivo",
        userName: "Recepcao Central"
      }
    ],
    roles: [
      {
        id: "role-1",
        code: "super_admin",
        name: "Super Admin",
        users: 2,
        permissions: ["tenants.manage", "users.manage", "audit.view", "billing.view"]
      },
      {
        id: "role-2",
        code: "tenant_admin",
        name: "Administrador da Clinica",
        users: 12,
        permissions: ["dashboard.view", "patients.manage", "appointments.manage", "financial.manage"]
      }
    ]
  };
}

export const getAdminOverview = cache(async (): Promise<AdminOverviewData | null> => {
  const session = await getSession();

  if (!session?.isSuperAdmin) {
    return null;
  }

  if (!process.env.DATABASE_URL) {
    return buildMockAdminOverview();
  }

  const [tenants, users, auditLogs, roles] = await Promise.all([
    prisma.tenant.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: 8,
      include: {
        _count: {
          select: {
            users: true,
            patients: true,
            appointments: true,
            conversations: true
          }
        }
      }
    }),
    prisma.user.findMany({
      select: {
        id: true,
        status: true,
        isSuperAdmin: true
      }
    }),
    prisma.auditLog.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: 12,
      include: {
        tenant: {
          select: {
            name: true
          }
        },
        user: {
          select: {
            name: true
          }
        }
      }
    }),
    prisma.role.findMany({
      orderBy: {
        name: "asc"
      },
      include: {
        users: true,
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })
  ]);

  const totals = {
    tenants: tenants.length,
    activeTenants: tenants.filter((tenant) => tenant.status === "ACTIVE").length,
    trialTenants: tenants.filter((tenant) => tenant.status === "TRIAL").length,
    blockedTenants: tenants.filter((tenant) => tenant.status === "BLOCKED").length,
    users: users.length,
    superAdmins: users.filter((user) => user.isSuperAdmin).length,
    activeUsers: users.filter((user) => user.status === "ACTIVE").length,
    auditLogs: auditLogs.length
  };

  return {
    totals,
    tenants: tenants.map((tenant) => ({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      status: tenant.status,
      createdAt: tenant.createdAt.toISOString(),
      users: tenant._count.users,
      patients: tenant._count.patients,
      appointments: tenant._count.appointments,
      conversations: tenant._count.conversations
    })),
    recentAuditLogs: auditLogs.map((log) => ({
      id: log.id,
      module: log.module,
      action: log.action,
      recordType: log.recordType,
      result: log.result,
      createdAt: log.createdAt.toISOString(),
      tenantName: log.tenant?.name ?? "Tenant nao vinculado",
      userName: log.user?.name ?? "Sistema"
    })),
    roles: roles.map((role) => ({
      id: role.id,
      code: role.code,
      name: role.name,
      users: role.users.length,
      permissions: role.permissions.map((entry) => `${entry.permission.resource}.${entry.permission.action}`)
    }))
  };
});
