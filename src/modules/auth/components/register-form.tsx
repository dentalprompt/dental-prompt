"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Chrome } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterFormValues } from "@/modules/auth/schemas/register-schema";

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function RegisterForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: ""
    }
  });

  const phoneRegistration = register("phone");
  const phoneValue = watch("phone");
  const formattedPhone = formatPhone(phoneValue ?? "");

  const onSubmit = handleSubmit(async () => {
    setSuccessMessage("Formulario de cadastro preparado. Na proxima etapa conectaremos a autenticacao real.");
  });

  return (
    <Card className="border-white/70 bg-white/92 shadow-soft backdrop-blur">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Crie sua conta</CardTitle>
        <CardDescription>Cadastre seus dados para iniciar o acesso a plataforma.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Seu nome completo" {...register("name")} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="voce@clinica.com.br" {...register("email")} />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              inputMode="numeric"
              placeholder="(11) 99999-9999"
              name={phoneRegistration.name}
              ref={phoneRegistration.ref}
              onBlur={phoneRegistration.onBlur}
              value={formattedPhone}
              onChange={(event) => {
                setValue("phone", formatPhone(event.target.value), { shouldDirty: true, shouldValidate: true });
              }}
            />
            {errors.phone ? <p className="text-sm text-destructive">{errors.phone.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" placeholder="Crie uma senha" {...register("password")} />
            {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
          </div>
          {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}
          <Button type="submit" className="h-12 w-full rounded-xl" disabled={isSubmitting}>
            {isSubmitting ? "Preparando..." : "Cadastrar"}
          </Button>
          <Button type="button" variant="outline" className="h-12 w-full rounded-xl">
            <Chrome className="size-4" />
            Cadastrar com o Google
          </Button>
        </form>
        <div className="text-center text-sm text-slate-500">
          Ja possui conta?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Entrar
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
