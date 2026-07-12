import Link from "next/link";
import { ArrowRight, MessageSquareMore, ShieldCheck, Stethoscope } from "lucide-react";

import { DentalPromptLogo } from "@/components/brand/dental-prompt-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const highlights = [
  {
    title: "Operacao centralizada",
    description: "Pacientes, agenda, financeiro, IA e WhatsApp unidos em um unico CRM.",
    icon: Stethoscope
  },
  {
    title: "Seguranca de ponta",
    description: "Arquitetura multi-tenant com RBAC, auditoria e isolamento completo por clinica.",
    icon: ShieldCheck
  },
  {
    title: "Atendimento inteligente",
    description: "Agentes com OpenAI e integracao com Evolution API preparados para escala.",
    icon: MessageSquareMore
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-hero-grid">
      <section className="container flex min-h-screen flex-col justify-center py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-primary/15 bg-white/85 px-4 py-2 text-sm font-medium text-primary shadow-soft backdrop-blur">
              CRM odontologico SaaS multi-tenant e mobile first
            </div>
            <div className="space-y-5">
              <DentalPromptLogo className="h-16 w-auto sm:h-20" />
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  Gestao inteligente para clinicas que querem crescer sem perder controle.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                  O Dental Prompt unifica agenda, prontuario, conversas, financeiro, servicos
                  e agentes de IA em uma experiencia moderna, rapida e pronta para escalar.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-full px-6">
                <Link href="/login">
                  Entrar no CRM
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 rounded-full px-6">
                <Link href="/dashboard">Ver estrutura inicial</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.title} className="border-white/70 bg-white/90 shadow-soft backdrop-blur">
                  <CardContent className="space-y-4 p-6">
                    <span className="inline-flex rounded-2xl bg-accent p-3 text-primary">
                      <Icon className="size-6" />
                    </span>
                    <div className="space-y-2">
                      <h2 className="text-lg font-semibold text-slate-950">{item.title}</h2>
                      <p className="text-sm leading-6 text-slate-600">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
