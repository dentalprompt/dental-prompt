"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function FinancialFilters() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

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
    <div className="flex flex-col gap-3 lg:flex-row">
      <select
        defaultValue={searchParams.get("type") ?? ""}
        onChange={(event) => updateParam("type", event.target.value)}
        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm lg:max-w-xs"
      >
        <option value="">Todos os tipos</option>
        <option value="INCOME">Receitas</option>
        <option value="EXPENSE">Despesas</option>
      </select>
      <select
        defaultValue={searchParams.get("status") ?? ""}
        onChange={(event) => updateParam("status", event.target.value)}
        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm lg:max-w-xs"
      >
        <option value="">Todos os status</option>
        <option value="PENDING">Pendente</option>
        <option value="PAID">Pago</option>
        <option value="SCHEDULED">Agendado</option>
        <option value="OVERDUE">Em atraso</option>
      </select>
    </div>
  );
}
