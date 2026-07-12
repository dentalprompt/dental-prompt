"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function FinancialFilters() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentYear = new Date().getFullYear();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    const query = params.toString();
    const nextUrl = `${pathname}${query ? `?${query}` : ""}` as Route;
    router.replace(nextUrl);
  }

  return (
    <div className="grid gap-3 lg:grid-cols-5">
      <select
        defaultValue={searchParams.get("type") ?? ""}
        onChange={(event) => updateParam("type", event.target.value)}
        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="">Todos os tipos</option>
        <option value="INCOME">Receitas</option>
        <option value="EXPENSE">Despesas</option>
      </select>
      <select
        defaultValue={searchParams.get("status") ?? ""}
        onChange={(event) => updateParam("status", event.target.value)}
        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="">Todos os status</option>
        <option value="PENDING">Pendente</option>
        <option value="PAID">Pago</option>
        <option value="SCHEDULED">Agendado</option>
        <option value="OVERDUE">Em atraso</option>
      </select>
      <select
        defaultValue={searchParams.get("month") ?? ""}
        onChange={(event) => updateParam("month", event.target.value)}
        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
      >
        <option value="">Todos os meses</option>
        {[
          "Janeiro",
          "Fevereiro",
          "Marco",
          "Abril",
          "Maio",
          "Junho",
          "Julho",
          "Agosto",
          "Setembro",
          "Outubro",
          "Novembro",
          "Dezembro"
        ].map((label, index) => (
          <option key={label} value={String(index + 1)}>
            {label}
          </option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get("year") ?? String(currentYear)}
        onChange={(event) => updateParam("year", event.target.value)}
        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
      >
        {[currentYear - 1, currentYear, currentYear + 1].map((year) => (
          <option key={year} value={String(year)}>
            {year}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => router.replace(pathname as Route)}
        className="inline-flex h-11 items-center justify-center rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium transition hover:bg-muted"
      >
        Limpar filtros
      </button>
    </div>
  );
}
