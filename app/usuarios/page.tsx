import { Sparkles } from "lucide-react";

import { UsuariosManager } from "@/components/usuarios-manager";
import { listarUsuarios } from "@/actions/usuarios";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const usuarios = await listarUsuarios();

  return (
    <section className="container relative py-12 lg:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[380px] bg-grid" />

      <div className="mb-10 fade-up">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft/60 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Equipe
        </div>
        <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
          <span className="gradient-text-primary">Usuários</span> da plataforma
        </h1>
        <p className="mt-3 max-w-2xl text-balance text-sm leading-relaxed text-muted-foreground md:text-base">
          Cadastre quem pode registrar ofertas. Cada nova oferta precisa ser
          associada a um usuário desta lista.
        </p>
      </div>

      <UsuariosManager usuarios={usuarios} />
    </section>
  );
}
