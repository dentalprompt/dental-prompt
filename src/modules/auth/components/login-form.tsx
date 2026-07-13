"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Chrome } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginFormValues } from "@/modules/auth/schemas/login-schema";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@dentalprompt.com",
      password: "admin123"
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      const payload = (await response.json()) as { message?: string };
      setServerError(payload.message ?? "Nao foi possivel autenticar.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  });

  return (
    <Card className="border-white/70 bg-white/92 shadow-soft backdrop-blur">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Bem-vindo(a) de volta!</CardTitle>
        <CardDescription>Entre para continuar gerenciando sua clinica com rapidez e organizacao.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="voce@clinica.com.br" {...register("email")} />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" placeholder="Sua senha" {...register("password")} />
            {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
          </div>
          {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
          <Button type="submit" className="h-12 w-full rounded-xl" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Acessar plataforma"}
          </Button>
          <Button asChild type="button" variant="outline" className="h-12 w-full rounded-xl">
            <Link href="/api/auth/google/start?mode=login">
              <Chrome className="size-4" />
              Entrar com o Google
            </Link>
          </Button>
        </form>
        <div className="text-center text-sm text-slate-500">
          Ainda nao tem conta?{" "}
          <Link href="/cadastro" className="font-semibold text-primary hover:underline">
            Criar cadastro
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
