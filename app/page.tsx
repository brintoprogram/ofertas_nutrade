import { ArrowRight, BarChart3, Sparkles } from "lucide-react";
import Link from "next/link";

import { OfertaForm } from "@/components/oferta-form";
import { listarUsuarios } from "@/actions/usuarios";

export const dynamic = "force-dynamic";

export default async function Home() {
  const usuarios = await listarUsuarios();
  return (
    <section className="container relative py-12 lg:py-16">
      {/* decorative grid background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] bg-grid" />

      <div className="mx-auto max-w-4xl fade-up">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft/60 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Plataforma de Ofertas
          </div>

          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Registre uma{" "}
            <span className="gradient-text-primary">nova oferta</span> de
            commodity.
          </h1>
          <p className="mt-4 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground">
            Capture cliente, logística e precificação em um único fluxo. Os
            dados alimentam o dashboard em tempo real e ficam prontos para a
            integração com mesa de negociação.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4 py-2 text-sm font-medium shadow-sm transition-all hover:border-primary/40 hover:bg-white hover:shadow-premium"
            >
              <BarChart3 className="h-4 w-4 text-primary" />
              Ver Dashboard
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <OfertaForm usuarios={usuarios} />
      </div>
    </section>
  );
}
