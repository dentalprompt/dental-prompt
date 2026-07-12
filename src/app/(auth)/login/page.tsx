import { redirect } from "next/navigation";

import { DentalPromptLogo } from "@/components/brand/dental-prompt-logo";
import { LoginForm } from "@/modules/auth/components/login-form";
import { getSession } from "@/lib/auth/session";

export default async function LoginPage() {
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
              Uma plataforma pensada para a operacao real de clinicas odontologicas.
            </h1>
            <p className="max-w-xl text-base leading-8 text-slate-600">
              Multi-tenant, segura, preparada para IA, WhatsApp, financeiro, agenda, prontuario e crescimento em larga escala.
            </p>
          </div>
        </section>
        <LoginForm />
      </div>
    </main>
  );
}
