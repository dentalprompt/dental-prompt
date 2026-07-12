import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <Card className="border-white/70 bg-white/92">
      <CardHeader>
        <CardTitle>Configuracoes</CardTitle>
        <CardDescription>
          Centro de configuracao da clinica com identidade visual, modelos, contratos, contas financeiras e cadeiras.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          "Clinica",
          "Anamnese",
          "Contratos",
          "Contas Financeiras",
          "Cadeiras",
          "Auditoria e historico"
        ].map((item) => (
          <div key={item} className="rounded-[1.25rem] border border-border bg-background p-5">
            <p className="font-semibold text-slate-950">{item}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Estrutura preparada para carregamento isolado por sub aba e validacao estrita de tenant, usuario e permissoes.
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
