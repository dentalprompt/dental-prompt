"use client";

import { useState } from "react";
import { Download, LoaderCircle, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminBackupPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRestore(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setError("Selecione um arquivo JSON para restaurar.");
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const content = await file.text();
      const payload = JSON.parse(content) as Record<string, unknown>;

      const response = await fetch("/api/admin/backup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = (await response.json()) as { message?: string; restoredTenants?: number };

      if (!response.ok) {
        throw new Error(data.message || "Nao foi possivel restaurar o backup.");
      }

      setMessage(data.message || `Backup restaurado com ${data.restoredTenants ?? 0} tenant(s).`);
      setFile(null);
    } catch (restoreError) {
      setError(restoreError instanceof Error ? restoreError.message : "Falha ao restaurar o backup.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-white/70 bg-white/92">
      <CardHeader>
        <CardTitle>Backups e restauracao</CardTitle>
        <CardDescription>
          Exporte um snapshot do ambiente atual ou restaure um arquivo JSON gerado pelo proprio painel.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4 rounded-[1.5rem] border border-border bg-background p-5">
          <p className="text-sm font-medium text-slate-950">Exportacao imediata</p>
          <p className="text-sm leading-6 text-slate-500">
            Gera um backup consolidado com dados operacionais, configuracoes, templates e estrutura administrativa.
          </p>
          <a href="/api/admin/backup" className="inline-flex">
            <Button>
              <Download className="mr-2 size-4" />
              Baixar backup atual
            </Button>
          </a>
        </div>

        <form className="space-y-4 rounded-[1.5rem] border border-border bg-background p-5" onSubmit={handleRestore}>
          <div className="space-y-2">
            <Label htmlFor="backup-file">Arquivo de backup</Label>
            <Input
              id="backup-file"
              type="file"
              accept="application/json"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Upload className="mr-2 size-4" />}
            Restaurar backup
          </Button>

          {message ? (
            <div className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
