import {
  Activity,
  CalendarClock,
  CircleDollarSign,
  MessageCircleMore,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  UserRoundPlus,
  UsersRound,
  WalletCards
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatCompactNumber, formatCurrency } from "@/lib/utils";
import { getDashboardMetrics } from "@/modules/dashboard/services/dashboard-metrics";

const appointmentStatusLabel = {
  SCHEDULED: "Agendado",
  CONFIRMED: "Confirmado",
  IN_ATTENDANCE: "Em atendimento",
  COMPLETED: "Concluido",
  CANCELED: "Cancelado",
  NO_SHOW: "Faltou",
  RESCHEDULED: "Reagendado",
  WALK_IN: "Encaixe",
  RETURN: "Retorno"
} as const;

function getBarHeight(value: number, maxValue: number) {
  if (maxValue <= 0) {
    return 22;
  }

  return Math.max((value / maxValue) * 100, 22);
}

export async function DashboardOverview() {
  const metrics = await getDashboardMetrics();
  const highestRevenuePoint = Math.max(...metrics.revenueTrend.map((item) => item.value), 0);

  const cards = [
    {
      title: "Pacientes",
      value: formatCompactNumber(metrics.patients),
      detail: `${metrics.inTreatmentPatients} em tratamento ativo`,
      icon: UsersRound
    },
    {
      title: "Orcamentos e planos",
      value: formatCompactNumber(metrics.plans),
      detail: "Base ativa de planos preparados para expansao",
      icon: WalletCards
    },
    {
      title: "Aniversariantes",
      value: formatCompactNumber(metrics.birthdaysThisMonth),
      detail: "Pacientes com aniversario neste mes",
      icon: Sparkles
    },
    {
      title: "Atendimentos hoje",
      value: formatCompactNumber(metrics.appointmentsToday),
      detail: `${metrics.confirmedToday} confirmados e ${metrics.returnsToday} retornos`,
      icon: CalendarClock
    }
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title} className="border-white/70 bg-white/92">
              <CardContent className="flex items-start justify-between p-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-500">{card.title}</p>
                  <p className="text-3xl font-bold tracking-tight text-slate-950">{card.value}</p>
                  <p className="text-sm text-slate-500">{card.detail}</p>
                </div>
                <span className="rounded-2xl bg-accent p-3 text-primary">
                  <Icon className="size-5" />
                </span>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.55fr_0.95fr]">
        <Card className="border-white/70 bg-white/92">
          <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
            <div className="space-y-2">
              <Badge>Receitas</Badge>
              <CardTitle>Desempenho financeiro</CardTitle>
              <CardDescription>
                Estrutura pronta para evoluir com filtros por profissional, plano, tratamento, especialidade e periodo.
              </CardDescription>
            </div>
            <div className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-slate-600">
              Ultimos 6 meses
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[1.25rem] border border-border/70 bg-background p-4">
                <p className="text-sm text-slate-500">Receitas do periodo</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{formatCurrency(metrics.monthlyRevenue)}</p>
              </div>
              <div className="rounded-[1.25rem] border border-border/70 bg-background p-4">
                <p className="text-sm text-slate-500">Despesas do periodo</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{formatCurrency(metrics.monthlyExpenses)}</p>
              </div>
              <div className="rounded-[1.25rem] border border-border/70 bg-background p-4">
                <p className="text-sm text-slate-500">Saldo</p>
                <p className="mt-2 text-2xl font-bold text-emerald-600">{formatCurrency(metrics.balance)}</p>
              </div>
            </div>

            <div className="flex h-72 items-end gap-3 rounded-[1.5rem] border border-white/60 bg-white/40 p-6 shadow-inner shadow-cyan-100/40 backdrop-blur-md">
              {metrics.revenueTrend.map((item) => (
                <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex h-full w-full items-end">
                    <div
                      className="w-full rounded-t-[1.25rem] bg-gradient-to-t from-secondary via-cyan-400 to-primary transition-all"
                      style={{ height: `${getBarHeight(item.value, highestRevenuePoint)}%` }}
                    />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-xs font-semibold text-slate-800">{item.label}</p>
                    <span className="text-[11px] text-slate-500">{formatCurrency(item.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/92">
          <CardHeader className="space-y-2">
            <Badge variant="success">Meta do mes</Badge>
            <CardTitle>Progresso comercial</CardTitle>
            <CardDescription>
              Base inicial preparada para a futura criacao de metas personalizadas por mes e ano.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-[1.25rem] border border-white/60 bg-gradient-to-br from-white/55 via-cyan-50/75 to-white/45 p-5 text-slate-950 backdrop-blur-md">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Meta atual</p>
                  <p className="mt-2 text-3xl font-bold">{formatCurrency(metrics.monthlyGoal)}</p>
                </div>
                <TrendingUp className="size-8 text-cyan-500" />
              </div>
              <div className="mt-5 h-3 rounded-full bg-slate-200/80">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                  style={{ width: `${Math.min(metrics.monthlyGoalProgress, 100)}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-slate-600">
                {metrics.monthlyGoalProgress.toFixed(1)}% atingido ate agora
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[1.25rem] border border-border bg-background p-4">
                <p className="text-sm text-slate-500">Vendido</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">{formatCurrency(metrics.monthlyRevenue)}</p>
              </div>
              <div className="rounded-[1.25rem] border border-border bg-background p-4">
                <p className="text-sm text-slate-500">Restante</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">
                  {formatCurrency(metrics.monthlyRemainingGoal)}
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-border bg-background p-4">
                <p className="text-sm text-slate-500">Dias restantes</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">{metrics.daysRemainingInMonth}</p>
              </div>
              <div className="rounded-[1.25rem] border border-border bg-background p-4">
                <p className="text-sm text-slate-500">Necessario por dia</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">
                  {formatCurrency(metrics.dailyGoalRequired)}
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-border bg-background p-4">
                <p className="text-sm text-slate-500">Vendas hoje</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">{formatCurrency(metrics.salesToday)}</p>
              </div>
              <div className="rounded-[1.25rem] border border-border bg-background p-4">
                <p className="text-sm text-slate-500">Meta diaria</p>
                <p className="mt-1 text-xl font-semibold text-slate-950">
                  {metrics.dailyGoalProgress.toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr_0.85fr]">
        <Card className="border-white/70 bg-white/92">
          <CardHeader className="space-y-2">
            <Badge variant="info">Pacientes</Badge>
            <CardTitle>Indicadores de pacientes</CardTitle>
            <CardDescription>Panorama clinico com foco em base ativa, crescimento e acompanhamento recente.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <p className="text-sm text-slate-500">Total cadastrados</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">{formatCompactNumber(metrics.patients)}</p>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <p className="text-sm text-slate-500">Aniversariantes do mes</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">
                {formatCompactNumber(metrics.birthdaysThisMonth)}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <p className="text-sm text-slate-500">Atendidos em 6 meses</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">
                {formatCompactNumber(metrics.patientsSeenLastSixMonths)}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <p className="text-sm text-slate-500">Novos no mes</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">
                {formatCompactNumber(metrics.newPatientsThisMonth)}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <p className="text-sm text-slate-500">Em tratamento</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">
                {formatCompactNumber(metrics.inTreatmentPatients)}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <p className="text-sm text-slate-500">Debitos em atraso</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">{formatCurrency(metrics.overdueAmount)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/92">
          <CardHeader className="space-y-2">
            <Badge variant="warning">Atencao</Badge>
            <CardTitle>Pacientes e filas sensiveis</CardTitle>
            <CardDescription>Itens que merecem prioridade da equipe neste momento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.attentionItems.length > 0 ? (
              metrics.attentionItems.map((item) => (
                <div key={item.id} className="rounded-[1.25rem] border border-border bg-background p-4">
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 rounded-xl p-2",
                        item.tone === "warning" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"
                      )}
                    >
                      {item.tone === "warning" ? <TriangleAlert className="size-4" /> : <Activity className="size-4" />}
                    </span>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-950">{item.title}</p>
                      <p className="text-sm text-slate-500">{item.description}</p>
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">{item.actionLabel}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.25rem] border border-dashed border-border bg-background p-4 text-sm text-slate-500">
                Nenhum item critico encontrado no momento.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/92">
          <CardHeader className="space-y-2">
            <Badge>Operacao</Badge>
            <CardTitle>Resumo do dia</CardTitle>
            <CardDescription>Leitura rapida das frentes que estao em andamento agora.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <div className="flex items-center gap-3">
                <MessageCircleMore className="size-5 text-primary" />
                <div>
                  <p className="text-sm text-slate-500">Conversas abertas</p>
                  <p className="text-xl font-semibold text-slate-950">
                    {formatCompactNumber(metrics.conversations)} total
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <div className="flex items-center gap-3">
                <CircleDollarSign className="size-5 text-emerald-600" />
                <div>
                  <p className="text-sm text-slate-500">Recebimentos pendentes</p>
                  <p className="text-xl font-semibold text-slate-950">{formatCurrency(metrics.pendingRevenue)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="size-5 text-cyan-600" />
                <div>
                  <p className="text-sm text-slate-500">Agentes ativos</p>
                  <p className="text-xl font-semibold text-slate-950">{formatCompactNumber(metrics.activeAgents)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <div className="flex items-center gap-3">
                <UserRoundPlus className="size-5 text-primary" />
                <div>
                  <p className="text-sm text-slate-500">Pacientes inativos</p>
                  <p className="text-xl font-semibold text-slate-950">{formatCompactNumber(metrics.inactivePatients)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_1.05fr_0.9fr]">
        <Card className="border-white/70 bg-white/92">
          <CardHeader className="space-y-2">
            <Badge variant="success">Agenda</Badge>
            <CardTitle>Atendimentos de hoje</CardTitle>
            <CardDescription>
              Consultas carregadas de forma independente para manter a home sempre responsiva.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.appointments.length > 0 ? (
              metrics.appointments.map((appointment) => (
                <div key={appointment.id} className="rounded-[1.25rem] border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">{appointment.time}</p>
                      <p className="mt-1 font-medium text-slate-800">{appointment.patientName}</p>
                      <p className="text-sm text-slate-500">{appointment.title}</p>
                      <p className="mt-2 text-sm text-slate-500">{appointment.professionalName}</p>
                    </div>
                    <Badge variant={appointment.status === "CONFIRMED" ? "success" : "default"}>
                      {appointmentStatusLabel[appointment.status]}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.25rem] border border-dashed border-border bg-background p-4 text-sm text-slate-500">
                Nenhum atendimento encontrado para hoje.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/92">
          <CardHeader className="space-y-2">
            <Badge variant="info">Conversas</Badge>
            <CardTitle>Fila do WhatsApp</CardTitle>
            <CardDescription>Leitura da fila com prioridade para contatos recentes e mensagens nao respondidas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.conversationsQueue.length > 0 ? (
              metrics.conversationsQueue.map((conversation) => (
                <div key={conversation.id} className="rounded-[1.25rem] border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-950">{conversation.contactName}</p>
                        {conversation.aiEnabled ? <Badge>IA ativa</Badge> : null}
                      </div>
                      <p className="text-sm text-slate-500">{conversation.lastMessagePreview}</p>
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                        {conversation.channelLabel} • {conversation.lastInteractionLabel}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{conversation.unreadCount}</p>
                      <p className="text-xs text-slate-400">nao lidas</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.25rem] border border-dashed border-border bg-background p-4 text-sm text-slate-500">
                Ainda nao existem conversas suficientes para exibir a fila.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/92">
          <CardHeader className="space-y-2">
            <Badge>Equipe</Badge>
            <CardTitle>Desempenho dos profissionais</CardTitle>
            <CardDescription>Ranking inicial com base em receita acumulada e volume de atendimentos recentes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.professionalPerformance.length > 0 ? (
              metrics.professionalPerformance.map((item, index) => (
                <div key={item.id} className="rounded-[1.25rem] border border-border bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-950">
                        {index + 1}. {item.professionalName}
                      </p>
                      <p className="text-sm text-slate-500">{item.specialty}</p>
                      <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                        {item.appointments} atendimento(s)
                      </p>
                    </div>
                    <p className="text-right text-sm font-semibold text-emerald-600">
                      {formatCurrency(item.revenue)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.25rem] border border-dashed border-border bg-background p-4 text-sm text-slate-500">
                Ainda nao existem dados suficientes para montar o ranking.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
