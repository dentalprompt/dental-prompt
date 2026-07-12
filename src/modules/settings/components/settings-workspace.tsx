"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Activity, FileText, Palette, Rows3, ShieldCheck, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  updateClinicSettingsSchema,
  type UpdateClinicSettingsFormValues
} from "@/modules/settings/schemas/clinic-settings-schema";
import type { ClinicSettingsView } from "@/modules/settings/types/settings";

const settingsRoadmap = [
  {
    value: "anamnese",
    title: "Anamnese",
    description: "Modelos dinamicos por especialidade, campos customizados e ativacao por status.",
    icon: Rows3
  },
  {
    value: "contratos",
    title: "Contratos",
    description: "Modelos com variaveis, exportacao PDF e futura assinatura digital.",
    icon: FileText
  },
  {
    value: "contas",
    title: "Contas financeiras",
    description: "Cadastro das contas que abastecem o modulo financeiro e o fluxo de caixa.",
    icon: Wallet
  },
  {
    value: "cadeiras",
    title: "Cadeiras",
    description: "Estrutura pronta para reserva futura por agenda, profissional e sala.",
    icon: Activity
  }
] as const;

export function SettingsWorkspace({ initialSettings }: { initialSettings: ClinicSettingsView }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<UpdateClinicSettingsFormValues>({
    resolver: zodResolver(updateClinicSettingsSchema),
    defaultValues: initialSettings
  });

  const primaryColor = watch("primaryColor");
  const secondaryColor = watch("secondaryColor");

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setSuccessMessage(null);

    const response = await fetch("/api/settings/clinic", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setServerError(payload.message ?? "Nao foi possivel salvar as configuracoes.");
      return;
    }

    setSuccessMessage("Configuracoes da clinica atualizadas com sucesso.");
    router.refresh();
  });

  return (
    <div className="space-y-4 lg:space-y-6">
      <Card className="border-white/70 bg-white/92">
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <Badge>Configuracoes</Badge>
              <CardTitle>Centro de configuracao da clinica</CardTitle>
              <CardDescription>
                Estrutura organizada por sub abas para crescer com anamnese, contratos, contas, cadeiras e futuras integracoes.
              </CardDescription>
            </div>
            <div className="rounded-[1.25rem] border border-border bg-background p-4">
              <p className="text-sm font-medium text-slate-600">Tenant autenticado</p>
              <p className="mt-1 text-sm text-slate-950">{initialSettings.clinicName}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="clinica">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="clinica">Clinica</TabsTrigger>
          <TabsTrigger value="anamnese">Anamnese</TabsTrigger>
          <TabsTrigger value="contratos">Contratos</TabsTrigger>
          <TabsTrigger value="contas">Contas</TabsTrigger>
          <TabsTrigger value="cadeiras">Cadeiras</TabsTrigger>
        </TabsList>

        <TabsContent value="clinica">
          <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
            <Card className="border-white/70 bg-white/92">
              <CardHeader className="space-y-2">
                <Badge variant="info">Clinica</Badge>
                <CardTitle>Dados principais</CardTitle>
                <CardDescription>
                  Atualize identidade basica, contato e direcao visual usada pela plataforma da clinica.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="clinicName">Nome da clinica</Label>
                    <Input id="clinicName" placeholder="Dental Prompt" {...register("clinicName")} />
                    {errors.clinicName ? (
                      <p className="text-sm text-destructive">{errors.clinicName.message}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="legalName">Razao social</Label>
                    <Input id="legalName" placeholder="Razao social da clinica" {...register("legalName")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" placeholder="contato@clinica.com.br" {...register("email")} />
                    {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" placeholder="(11) 4000-2026" {...register("phone")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input id="whatsapp" placeholder="(11) 99999-2026" {...register("whatsapp")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input id="logoUrl" placeholder="https://..." {...register("logoUrl")} />
                    {errors.logoUrl ? <p className="text-sm text-destructive">{errors.logoUrl.message}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Cor principal</Label>
                    <Input id="primaryColor" type="text" placeholder="#0A3F9A" {...register("primaryColor")} />
                    {errors.primaryColor ? (
                      <p className="text-sm text-destructive">{errors.primaryColor.message}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Cor secundaria</Label>
                    <Input id="secondaryColor" type="text" placeholder="#22C7C7" {...register("secondaryColor")} />
                    {errors.secondaryColor ? (
                      <p className="text-sm text-destructive">{errors.secondaryColor.message}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="identityNotes">Direcao visual</Label>
                    <Textarea
                      id="identityNotes"
                      value="Preparado para futuras configuracoes de tema, favicon, menu e identidade visual por tenant."
                      readOnly
                    />
                  </div>

                  {serverError ? <p className="text-sm text-destructive sm:col-span-2">{serverError}</p> : null}
                  {successMessage ? <p className="text-sm text-emerald-600 sm:col-span-2">{successMessage}</p> : null}

                  <div className="sm:col-span-2 flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Salvando..." : "Salvar configuracoes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="border-white/70 bg-white/92">
                <CardHeader className="space-y-2">
                  <Badge variant="success">Preview</Badge>
                  <CardTitle>Identidade visual</CardTitle>
                  <CardDescription>Leitura rapida da paleta configurada para este tenant.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="rounded-[1.5rem] p-5 text-white"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                    }}
                  >
                    <p className="text-sm text-white/80">Clinica</p>
                    <p className="mt-2 text-2xl font-bold">{watch("clinicName") || "Dental Prompt"}</p>
                    <p className="mt-3 text-sm text-white/90">{watch("email") || "contato@clinica.com.br"}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-[1.25rem] border border-border bg-background p-4">
                      <p className="text-sm text-slate-500">Cor principal</p>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="size-6 rounded-full border" style={{ backgroundColor: primaryColor }} />
                        <span className="font-medium text-slate-950">{primaryColor}</span>
                      </div>
                    </div>
                    <div className="rounded-[1.25rem] border border-border bg-background p-4">
                      <p className="text-sm text-slate-500">Cor secundaria</p>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="size-6 rounded-full border" style={{ backgroundColor: secondaryColor }} />
                        <span className="font-medium text-slate-950">{secondaryColor}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/70 bg-white/92">
                <CardHeader className="space-y-2">
                  <Badge variant="warning">Seguranca</Badge>
                  <CardTitle>Regras ativas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  <div className="rounded-[1.25rem] border border-border bg-background p-4">
                    Toda leitura e escrita devem respeitar o tenant autenticado.
                  </div>
                  <div className="rounded-[1.25rem] border border-border bg-background p-4">
                    Historico e auditoria desta area ainda serao aprofundados nas proximas etapas.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {settingsRoadmap.map((section) => {
          const Icon = section.icon;
          const tabValue =
            section.value === "contas"
              ? "contas"
              : section.value === "cadeiras"
                ? "cadeiras"
                : section.value === "contratos"
                  ? "contratos"
                  : "anamnese";

          return (
            <TabsContent key={section.value} value={tabValue}>
              <Card className="border-white/70 bg-white/92">
                <CardHeader className="space-y-2">
                  <Badge>{section.title}</Badge>
                  <CardTitle>{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-[1.5rem] border border-white/60 bg-gradient-to-br from-white/55 via-cyan-50/70 to-white/45 p-6 text-slate-950 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <span className="rounded-2xl bg-white/70 p-3 text-primary shadow-sm">
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <p className="text-sm text-slate-500">Estrutura preparada</p>
                        <p className="text-xl font-semibold">{section.title}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      Esta sub aba ja tem espaco reservado no CRM e sera a proxima camada de profundidade deste modulo.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      "Carregamento isolado por sub aba",
                      "Escopo restrito ao tenant autenticado",
                      "Arquitetura pronta para auditoria",
                      "Base preparada para filtros e CRUD"
                    ].map((item) => (
                      <div key={item} className="rounded-[1.25rem] border border-border bg-background p-4">
                        <p className="font-medium text-slate-950">{item}</p>
                        <p className="mt-2 text-sm text-slate-500">
                          Evolucao pensada para encaixar no restante do CRM sem retrabalho estrutural.
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>

      <Card className="border-white/70 bg-white/92">
        <CardHeader className="space-y-2">
          <Badge variant="success">Auditoria</Badge>
          <CardTitle>Painel de conformidade</CardTitle>
          <CardDescription>
            Bloco inicial para reforcar que alteracoes futuras aqui vao exigir historico, permissoes e rastreabilidade.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[1.25rem] border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-emerald-600" />
              <p className="font-medium text-slate-950">Tenant validado</p>
            </div>
            <p className="mt-2 text-sm text-slate-500">A configuracao sempre respeita a clinica autenticada.</p>
          </div>
          <div className="rounded-[1.25rem] border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <Rows3 className="size-5 text-primary" />
              <p className="font-medium text-slate-950">Sub abas carregadas sob demanda</p>
            </div>
            <p className="mt-2 text-sm text-slate-500">Preparado para crescer sem carregar tudo de uma vez.</p>
          </div>
          <div className="rounded-[1.25rem] border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <Palette className="size-5 text-cyan-600" />
              <p className="font-medium text-slate-950">Identidade por clinica</p>
            </div>
            <p className="mt-2 text-sm text-slate-500">Base pronta para evoluir tema, favicon e branding por tenant.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
