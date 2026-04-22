"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import {
  Users,
  Wheat,
  BadgeDollarSign,
  Loader2,
  Save,
  RefreshCw,
  UserCircle,
  UserPlus,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  COMMODITIES,
  MOEDAS,
  OfertaFormValues,
  ofertaSchema,
} from "@/lib/schema";
import { buscarCotacao } from "@/actions/cotacao";
import { salvarOferta } from "@/actions/ofertas";
import type { UsuarioRow } from "@/lib/supabase";

type SectionProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
};

function Section({ icon, title, description, children }: SectionProps) {
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-premium-lg">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 border-b border-border/50 bg-gradient-to-b from-primary-soft/40 to-transparent pb-5">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-glow-primary ring-1 ring-white/10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-xl bg-gradient-to-b from-white/15 to-transparent" />
          <div className="relative">{icon}</div>
        </div>
        <div className="space-y-1 pt-0.5">
          <CardTitle className="text-[15px]">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 pt-6 md:grid-cols-2">
        {children}
      </CardContent>
    </Card>
  );
}

export function OfertaForm({ usuarios }: { usuarios: UsuarioRow[] }) {
  const form = useForm<OfertaFormValues>({
    resolver: zodResolver(ofertaSchema),
    defaultValues: {
      criadoPor: undefined as unknown as string,
      nomeParent: "",
      nomeSoldTo: "",
      commodity: "",
      praca: "",
      localRetiradaEntrega: "",
      quantidadeSc: undefined as unknown as number,
      quantidadeTon: 0,
      prazoEntrega: undefined,
      preco: undefined as unknown as number,
      moeda: undefined,
      pagamento: undefined,
    },
  });

  const semUsuarios = usuarios.length === 0;

  const sacas = useWatch({ control: form.control, name: "quantidadeSc" });
  const commodity = useWatch({ control: form.control, name: "commodity" });
  const praca = useWatch({ control: form.control, name: "praca" });

  const [buscandoCotacao, setBuscandoCotacao] = React.useState(false);
  const podeBuscarCotacao =
    Boolean(commodity && commodity.trim()) &&
    Boolean(praca && praca.trim()) &&
    !buscandoCotacao;

  async function handleBuscarCotacao() {
    if (!commodity || !praca) return;
    setBuscandoCotacao(true);
    try {
      const result = await buscarCotacao(commodity, praca);

      if (!result.ok) {
        toast.error("Não foi possível buscar a cotação", {
          description: result.message,
        });
        return;
      }

      form.setValue("preco", result.preco, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      form.setValue("moeda", result.moeda, {
        shouldValidate: true,
        shouldDirty: true,
      });

      const precoFmt = result.preco.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      toast.success(
        result.exact
          ? `Cotação encontrada: R$ ${precoFmt}/sc`
          : `Praça exata não encontrada — referência: R$ ${precoFmt}/sc`,
        {
          description: `${result.matchedPraca} • ${result.source}`,
          duration: 6000,
        }
      );
    } catch (err) {
      console.error("[buscarCotacao] erro inesperado:", err);
      toast.error("Erro inesperado ao buscar cotação. Tente novamente.");
    } finally {
      setBuscandoCotacao(false);
    }
  }

  React.useEffect(() => {
    const sacasNum = Number(sacas);
    const ton =
      Number.isFinite(sacasNum) && sacasNum > 0 ? (sacasNum * 60) / 1000 : 0;
    form.setValue("quantidadeTon", Number(ton.toFixed(3)), {
      shouldValidate: false,
      shouldDirty: false,
    });
  }, [sacas, form]);

  const onSubmit = async (values: OfertaFormValues) => {
    const result = await salvarOferta(values);

    if (!result.ok) {
      toast.error("Não foi possível salvar a oferta.", {
        description: result.message,
      });
      return;
    }

    toast.success("Oferta salva com sucesso!", {
      description: `${values.commodity} — ${values.quantidadeSc} sacas para ${values.nomeSoldTo}`,
    });

    form.reset();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="stagger space-y-6"
      >
        {semUsuarios && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300/50 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm">
            <div className="flex items-start gap-2">
              <UserCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Nenhum usuário cadastrado. Cadastre ao menos um para poder
                registrar ofertas.
              </span>
            </div>
            <Link
              href="/usuarios"
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-900 px-3 py-1.5 text-xs font-medium text-amber-50 hover:bg-amber-800"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Cadastrar usuário
            </Link>
          </div>
        )}

        {/* 1. Cliente */}
        <Section
          icon={<Users className="h-4 w-4" />}
          title="Cliente"
          description="Autor do registro e identificação do grupo comprador."
        >
          <FormField
            control={form.control}
            name="criadoPor"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Criado por</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                  disabled={semUsuarios}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          semUsuarios
                            ? "Cadastre usuários antes de criar ofertas"
                            : "Selecione o responsável pelo registro"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {usuarios.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        <span className="flex items-center gap-2">
                          <span className="font-medium">{u.nome}</span>
                          <span className="text-xs text-muted-foreground">
                            {u.email}
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nomeParent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Parent</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Bunge" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nomeSoldTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Sold To</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Bunge Alimentos S/A"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        {/* 2. Produto & Logística */}
        <Section
          icon={<Wheat className="h-4 w-4" />}
          title="Produto e Logística"
          description="Commodity, quantidade, origem e prazo de entrega."
        >
          <FormField
            control={form.control}
            name="commodity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commodity</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a commodity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COMMODITIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="praca"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Praça</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Sorriso/MT" {...field} />
                </FormControl>
                <FormDescription>Cidade/UF da originação.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="localRetiradaEntrega"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Local de Retirada/Entrega</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Porto de Paranaguá / Armazém XYZ"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantidadeSc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade SC</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step="1"
                    placeholder="Ex: 10000"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>1 saca = 60 kg</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="quantidadeTon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade TON</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    readOnly
                    disabled
                    className="bg-muted/60"
                    value={field.value ?? 0}
                  />
                </FormControl>
                <FormDescription>
                  Calculado: sacas × 60 ÷ 1000
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="prazoEntrega"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Prazo de Entrega</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Selecione a data"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        {/* 3. Comercial */}
        <Section
          icon={<BadgeDollarSign className="h-4 w-4" />}
          title="Comercial"
          description="Preço, moeda e data de pagamento."
        >
          <FormField
            control={form.control}
            name="preco"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Preço</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      step="0.01"
                      placeholder="0,00"
                      className="flex-1"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBuscarCotacao}
                    disabled={!podeBuscarCotacao}
                    className="shrink-0"
                  >
                    {buscandoCotacao ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">
                      {buscandoCotacao ? "Buscando..." : "Buscar Cotação"}
                    </span>
                  </Button>
                </div>
                <FormDescription>
                  {podeBuscarCotacao || buscandoCotacao
                    ? "Busca cotação real do dia (Notícias Agrícolas) — você pode editar manualmente o valor retornado."
                    : "Preencha commodity e praça para habilitar a busca de cotação."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="moeda"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moeda</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a moeda" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {MOEDAS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pagamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pagamento</FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Selecione a data"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <div className="sticky bottom-4 z-10 flex items-center justify-end gap-3 rounded-xl border border-border/60 bg-background/75 p-3 shadow-premium backdrop-blur-md">
          <p className="mr-auto hidden text-xs text-muted-foreground sm:block">
            Confira os dados antes de confirmar a oferta.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={form.formState.isSubmitting}
          >
            Limpar
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting || semUsuarios}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {form.formState.isSubmitting ? "Salvando..." : "Salvar Oferta"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
