"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import type { ProfessionalListItem } from "@/modules/team/types/professional";

export function AgendaProfessionalFilter({
  professionals
}: {
  professionals: ProfessionalListItem[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("professionalId") ?? "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set("professionalId", value);
      } else {
        params.delete("professionalId");
      }

      const query = params.toString();
      const nextUrl = `${pathname}${query ? `?${query}` : ""}` as Route;
      router.replace(nextUrl);
    }, 200);

    return () => clearTimeout(timeout);
  }, [pathname, router, searchParams, value]);

  return (
    <select
      value={value}
      onChange={(event) => setValue(event.target.value)}
      className="flex h-11 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm lg:max-w-xs"
    >
      <option value="">Todos os profissionais</option>
      {professionals.map((professional) => (
        <option key={professional.id} value={professional.id}>
          {professional.name}
        </option>
      ))}
    </select>
  );
}
