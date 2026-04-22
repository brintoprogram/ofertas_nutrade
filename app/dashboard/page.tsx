import { format, startOfDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileStack, Layers, TrendingUp, Wallet } from "lucide-react";

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
  OfertasPorVendedorChart,
  type DiaDatum,
  type VendedorDatum,
} from "@/components/dashboard-charts";

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

export default async function DashboardPage() {
  const ofertas = await fetchOfertas();

  const totalOfertas = ofertas.length;
  const volumeTon = ofertas.reduce((a, o) => a + Number(o.quantidade_ton), 0);
  const valorTotal = ofertas.reduce(
    (a, o) => a + Number(o.preco) * o.quantidade_sacas,
    0
  );

  const kpis = [
    {
      title: "Total de Ofertas",
      value: num.format(totalOfertas),
      hint: "Ofertas cadastradas",
      icon: <FileStack className="h-5 w-5" />,
    },
    {
      title: "Volume Total",
      value: `${num.format(Math.round(volumeTon))} t`,
      hint: "Toneladas negociadas",
      icon: <Layers className="h-5 w-5" />,
    },
    {
      title: "Valor Total",
      value: brl.format(valorTotal),
      hint: "Somatório estimado em BRL",
      icon: <Wallet className="h-5 w-5" />,
    },
  ];

  const porVendedorMap = ofertas.reduce<Record<string, number>>((acc, o) => {
    acc[o.vendedor] = (acc[o.vendedor] ?? 0) + 1;
    return acc;
  }, {});
  const porVendedor: VendedorDatum[] = Object.entries(porVendedorMap)
    .map(([vendedor, ofertasCount]) => ({ vendedor, ofertas: ofertasCount }))
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
    <section className="container py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Visão geral das ofertas registradas.
          </p>
        </div>
        <div className="hidden items-center gap-2 rounded-md border bg-white px-3 py-2 text-xs text-muted-foreground md:flex">
          <TrendingUp className="h-4 w-4 text-primary" />
          {vazio ? "Nenhuma oferta ainda" : "Dados em tempo real"}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((k) => (
          <Card key={k.title}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardDescription>{k.title}</CardDescription>
                <CardTitle className="mt-1 text-2xl">{k.value}</CardTitle>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                {k.icon}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{k.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ofertas por Vendedor</CardTitle>
            <CardDescription>
              Quantidade de ofertas registradas por cada vendedor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {vazio ? (
              <EmptyState />
            ) : (
              <OfertasPorVendedorChart data={porVendedor} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Evolução — Últimos 7 dias</CardTitle>
            <CardDescription>
              Ofertas criadas por dia na última semana.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
      <div>
        <p>Nenhum dado ainda.</p>
        <p className="mt-1 text-xs">
          Cadastre uma oferta em <span className="font-medium">/ofertas</span>{" "}
          ou rode o seed SQL para popular.
        </p>
      </div>
    </div>
  );
}
