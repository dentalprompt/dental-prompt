"use client";

import type { Route } from "next";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";

export function AgentSearch() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }

      const query = params.toString();
      const nextUrl = `${pathname}${query ? `?${query}` : ""}` as Route;
      router.replace(nextUrl);
    }, 250);

    return () => clearTimeout(timeout);
  }, [pathname, router, searchParams, value]);

  return (
    <div className="relative w-full max-w-xl">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Pesquisar por nome, numero, status ou modelo"
        className="pl-9"
      />
    </div>
  );
}
