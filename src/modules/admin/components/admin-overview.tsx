import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Building2, ShieldCheck, UserCog, Waypoints } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminOverview } from "@/modules/admin/services/admin-overview-service";

function formatDateTime(value: string) {
  return format(new Date(value), "dd/MM/yyyy 'as' HH:mm", { locale: ptBR });
}

const statusVariantMap: Record<string, "default" | "success" | "warning" | "info"> = {
  ACTIVE: "success",
  TRIAL: "info",
  BLOCKED: "warning",
  SUSPENDED: "warning",
  CANCELED: "default",
  DELINQUENT: "warning"
};

export async function AdminOverview() {
  const overview = await getAdminOverview();

  if (!overview) {
    return (
      <Card className="border-white/70 bg-white/92">
        <CardHeader>
          <CardTitle>Acesso restrito</CardTitle>
          <CardDescription>Esta area esta disponivel apenas para usuarios com perfil de super admin.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const cards = [
    {
      label: "Tenants ativos",
      value: overview.totals.activeTenants,
      helper: `${overview.totals.tenants} tenants monitorados`,
      icon: Building2
    },
    {
      label: "Usuarios ativos",
      value: overview.totals.activeUsers,
      helper: `${overview.totals.users} usuarios globais`,
      icon: UserCog
    },
    {
      label: "Super admins",
      value: overview.totals.superAdmins,
      helper: `${overview.totals.trialTenants} tenants em trial`,
      icon: ShieldCheck
    },
    {
      label: "Auditoria recente",
      value: overview.totals.auditLogs,
      helper: `${overview.totals.blockedTenants} tenants bloqueados`,
      icon: Waypoints
    }
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.label} className="border-white/70 bg-white/92">
              <CardContent className="flex items-start justify-between p-6">
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-950">{card.value}</p>
                  <p className="text-sm text-slate-500">{card.helper}</p>
                </div>
                <span className="rounded-2xl bg-cyan-100/80 p-3 text-primary">
                  <Icon className="size-5" />
                </span>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/70 bg-white/92">
          <CardHeader>
            <CardTitle>Tenants monitorados</CardTitle>
            <CardDescription>Visao global da base com status, volume de usuarios e atividade operacional.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.tenants.map((tenant) => (
              <div key={tenant.id} className="rounded-[1.25rem] border border-border bg-background p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-semibold text-slate-950">{tenant.name}</p>
                      <Badge variant={statusVariantMap[tenant.status] ?? "default"}>{tenant.status}</Badge>
                    </div>
                    <p className="text-sm text-slate-500">{tenant.slug}</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                      Criado em {formatDateTime(tenant.createdAt)}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Usuarios</p>
                      <p className="mt-1 text-lg font-semibold text-slate-950">{tenant.users}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Pacientes</p>
                      <p className="mt-1 text-lg font-semibold text-slate-950">{tenant.patients}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Agenda</p>
                      <p className="mt-1 text-lg font-semibold text-slate-950">{tenant.appointments}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Conversas</p>
                      <p className="mt-1 text-lg font-semibold text-slate-950">{tenant.conversations}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/92">
          <CardHeader>
            <CardTitle>Perfis e permissoes</CardTitle>
            <CardDescription>Matriz inicial de acesso global com leitura rapida por papel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.roles.map((role) => (
              <div key={role.id} className="rounded-[1.25rem] border border-border bg-background p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{role.name}</p>
                    <p className="text-sm text-slate-500">{role.code}</p>
                  </div>
                  <Badge variant="info">{role.users} usuario(s)</Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {role.permissions.map((permission) => (
                    <span
                      key={`${role.id}-${permission}`}
                      className="rounded-full border border-cyan-100 bg-cyan-50/80 px-3 py-1 text-xs font-semibold text-primary"
                    >
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-white/70 bg-white/92">
          <CardHeader>
            <CardTitle>Auditoria recente</CardTitle>
            <CardDescription>Eventos globais recentes consolidados para suporte, seguranca e rastreabilidade.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 xl:grid-cols-2">
            {overview.recentAuditLogs.map((item) => (
              <div key={item.id} className="rounded-[1.25rem] border border-border bg-background p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{item.module}</Badge>
                  <Badge variant="info">{item.action}</Badge>
                  <Badge variant="outline">{item.recordType}</Badge>
                </div>
                <p className="mt-3 font-semibold text-slate-950">{item.tenantName}</p>
                <p className="text-sm text-slate-500">{item.userName}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">{formatDateTime(item.createdAt)}</p>
                <p className="mt-3 text-sm text-slate-600">
                  Resultado: <span className="font-medium text-slate-950">{item.result ?? "Nao informado"}</span>
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
