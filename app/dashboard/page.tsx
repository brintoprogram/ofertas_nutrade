import { format, startOfDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowUpRight,
  Download,
  FileStack,
  Layers,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabaseAdmin, type OfertaRow } from "@/lib/supabase";
import {
  Evolucao7DiasChart,
  OfertasPorParentChart,
  type DiaDatum,
  type ParentDatum,
} from "@/components/dashboard-charts";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
const num = new Intl.NumberFormat("pt-BR");

async function fetchOfertas(): Promise<OfertaRow[]> {
  const { data, error } = await supabaseAdmin
    .from("ofertas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[dashboard] erro ao buscar ofertas:", error);
    return [];
  }
  return (data ?? []) as OfertaRow[];
}

type KpiTone = "primary" | "gold" | "success";

type KpiCardProps = {
  title: string;
  value: string;
  hint: string;
  trend?: string;
  icon: React.ReactNode;
  tone: KpiTone;
};

function KpiCard({ title, value, hint, trend, icon, tone }: KpiCardProps) {
  const toneClasses: Record<KpiTone, string> = {
    primary:
      "bg-primary/10 text-primary ring-1 ring-primary/15",
    gold:
      "bg-brand-gold-soft text-brand-gold-foreground ring-1 ring-brand-gold/25",
    success:
      "bg-success/10 text-success ring-1 ring-success/20",
  };

  return (
    <Card className="group relative overflow-hidden hover:shadow-premium-lg">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-2xl transition-opacity group-hover:opacity-80" />
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1.5">
          <CardDescription className="text-xs font-medium uppercase tracking-wider">
            {title}
          </CardDescription>
          <CardTitle className="text-3xl font-semibold tracking-tight">
            {value}
          </CardTitle>
        </div>
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            toneClasses[tone]
          )}
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between pt-0">
        <p className="text-xs text-muted-foreground">{hint}</p>
        {trend && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </span>
        )}
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const ofertas = await fetchOfertas();

  const totalOfertas = ofertas.length;
  const volumeTon = ofertas.reduce((a, o) => a + Number(o.quantidade_ton), 0);
  const valorTotal = ofertas.reduce(
    (a, o) => a + Number(o.preco) * o.quantidade_sc,
    0
  );

  const porParentMap = ofertas.reduce<Record<string, number>>((acc, o) => {
    acc[o.nome_parent] = (acc[o.nome_parent] ?? 0) + 1;
    return acc;
  }, {});
  const porParent: ParentDatum[] = Object.entries(porParentMap)
    .map(([parent, ofertasCount]) => ({ parent, ofertas: ofertasCount }))
    .sort((a, b) => b.ofertas - a.ofertas);

  const hoje = startOfDay(new Date());
  const ultimos7: DiaDatum[] = Array.from({ length: 7 }).map((_, i) => {
    const dia = subDays(hoje, 6 - i);
    const count = ofertas.filter((o) => {
      const d = startOfDay(new Date(o.created_at));
      return d.getTime() === dia.getTime();
    }).length;
    return { data: format(dia, "dd/MM", { locale: ptBR }), ofertas: count };
  });

  const vazio = ofertas.length === 0;

  return (
    <section className="container relative py-12 lg:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[380px] bg-grid" />

      <div className="mb-10 flex flex-wrap items-start justify-between gap-4 fade-up">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft/60 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Analytics
          </div>
          <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            <span className="gradient-text-primary">Dashboard</span> de Ofertas
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Visão consolidada dos cadastros em tempo real.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/ofertas/export"
            className="group inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm font-medium shadow-sm transition-all hover:border-primary/40 hover:bg-white hover:shadow-premium"
            aria-disabled={vazio}
          >
            <Download className="h-4 w-4 text-primary" />
            Exportar Excel
          </a>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow-primary transition-all hover:bg-primary-hover hover:shadow-premium-lg"
          >
            Nova Oferta
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 stagger md:grid-cols-3">
        <KpiCard
          title="Total de Ofertas"
          value={num.format(totalOfertas)}
          hint="Ofertas cadastradas"
          trend={totalOfertas > 0 ? "Ativo" : undefined}
          icon={<FileStack className="h-5 w-5" />}
          tone="primary"
        />
        <KpiCard
          title="Volume Total"
          value={`${num.format(Math.round(volumeTon))} t`}
          hint="Toneladas negociadas"
          icon={<Layers className="h-5 w-5" />}
          tone="gold"
        />
        <KpiCard
          title="Valor Total"
          value={brl.format(valorTotal)}
          hint="Somatório estimado em BRL"
          icon={<Wallet className="h-5 w-5" />}
          tone="success"
        />
      </div>

      <div className="mt-6 grid gap-4 stagger lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/60 bg-gradient-to-b from-primary-soft/40 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Ofertas por Parent</CardTitle>
                <CardDescription>
                  Volume de ofertas por grupo comprador
                </CardDescription>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileStack className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {vazio ? (
              <EmptyState />
            ) : (
              <OfertasPorParentChart data={porParent} />
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/60 bg-gradient-to-b from-primary-soft/40 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Evolução — Últimos 7 dias</CardTitle>
                <CardDescription>Ofertas criadas por dia</CardDescription>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {vazio ? (
              <EmptyState />
            ) : (
              <Evolucao7DiasChart data={ultimos7} />
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="flex h-[300px] items-center justify-center text-center text-sm text-muted-foreground">
      <div className="space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium text-foreground">Nenhum dado ainda</p>
          <p className="mt-1 text-xs">
            Cadastre uma oferta em <span className="font-medium">Ofertas</span>{" "}
            ou rode o seed SQL para popular.
          </p>
        </div>
      </div>
    </div>
  );
}
