import { redirect } from "next/navigation";

import { DentalPromptLogo } from "@/components/brand/dental-prompt-logo";
import { getSession } from "@/lib/auth/session";
import { RegisterForm } from "@/modules/auth/components/register-form";

export default async function RegisterPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-hero-grid">
      <div className="container grid min-h-screen items-center gap-8 py-10 lg:grid-cols-[1fr_480px]">
        <section className="space-y-6">
          <DentalPromptLogo className="h-auto w-full" showTagline={false} />
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              Comece a estruturar a operacao da sua clinica em uma plataforma unica.
            </h1>
            <p className="max-w-xl text-base leading-8 text-slate-600">
              Cadastro inicial pronto para evoluir com autenticacao Google, onboarding e ativacao completa do tenant.
            </p>
          </div>
        </section>
        <RegisterForm />
      </div>
    </main>
  );
}
