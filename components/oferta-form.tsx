"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Users,
  Package,
  Truck,
  BadgeDollarSign,
  Loader2,
  Save,
  RefreshCw,
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
  INCOTERMS,
  MOEDAS,
  OfertaFormValues,
  ofertaSchema,
} from "@/lib/schema";
import { buscarCotacao } from "@/lib/cotacao";
import { salvarOferta } from "@/actions/ofertas";

type SectionProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
};

function Section({ icon, title, description, children }: SectionProps) {
  return (
    <Card className="border-border/70">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-4">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 md:grid-cols-2">{children}</CardContent>
    </Card>
  );
}

export function OfertaForm() {
  const form = useForm<OfertaFormValues>({
    resolver: zodResolver(ofertaSchema),
    defaultValues: {
      vendedor: "",
      clienteNome: "",
      inscricaoEstadual: "",
      commodity: "",
      quantidadeSacas: undefined as unknown as number,
      quantidadeTon: 0,
      incoterm: "",
      praca: "",
      localEmbarque: "",
      dataEmbarque: undefined,
      moeda: undefined,
      preco: undefined as unknown as number,
      tipoPreco: "Farmer Selling",
      dataPagamento: undefined,
    },
  });

  const sacas = useWatch({ control: form.control, name: "quantidadeSacas" });
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
      const valor = await buscarCotacao(commodity, praca);
      form.setValue("preco", valor, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
      toast.success("Cotação do dia atualizada", {
        description: `${commodity} em ${praca}: R$ ${valor.toLocaleString(
          "pt-BR",
          { minimumFractionDigits: 2, maximumFractionDigits: 2 }
        )} — você pode editar o valor.`,
      });
    } catch {
      toast.error("Não foi possível buscar a cotação. Tente novamente.");
    } finally {
      setBuscandoCotacao(false);
    }
  }

  React.useEffect(() => {
    const sacasNum = Number(sacas);
    const ton = Number.isFinite(sacasNum) && sacasNum > 0
      ? (sacasNum * 60) / 1000
      : 0;
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
      description: `${values.commodity} — ${values.quantidadeSacas} sacas para ${values.clienteNome}`,
    });

    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 1. Dados do Cliente */}
        <Section
          icon={<Users className="h-4 w-4" />}
          title="Dados do Cliente"
          description="Identificação do comprador e responsável pela oferta."
        >
          <FormField
            control={form.control}
            name="vendedor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendedor</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do vendedor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clienteNome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Cliente</FormLabel>
                <FormControl>
                  <Input placeholder="Razão social / Nome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="inscricaoEstadual"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Inscrição Estadual</FormLabel>
                <FormControl>
                  <Input placeholder="Opcional" {...field} />
                </FormControl>
                <FormDescription>
                  Campo opcional — deixe em branco caso não se aplique.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        {/* 2. Detalhes da Carga */}
        <Section
          icon={<Package className="h-4 w-4" />}
          title="Detalhes da Carga"
          description="Commodity e volume negociado."
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

          <div className="hidden md:block" aria-hidden />

          <FormField
            control={form.control}
            name="quantidadeSacas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade (sacas)</FormLabel>
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
                <FormLabel>Quantidade (toneladas)</FormLabel>
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
                  Calculado automaticamente: sacas × 60 ÷ 1000
                </FormDescription>
              </FormItem>
            )}
          />
        </Section>

        {/* 3. Logística */}
        <Section
          icon={<Truck className="h-4 w-4" />}
          title="Logística"
          description="Condições de entrega e embarque."
        >
          <FormField
            control={form.control}
            name="incoterm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Incoterm</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o Incoterm" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INCOTERMS.map((i) => (
                      <SelectItem key={i} value={i}>
                        {i}
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
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="localEmbarque"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Local de Embarque</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Porto de Santos"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dataEmbarque"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Embarque</FormLabel>
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

        {/* 4. Precificação */}
        <Section
          icon={<BadgeDollarSign className="h-4 w-4" />}
          title="Precificação"
          description="Valores, moeda e prazo de pagamento."
        >
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
            name="preco"
            render={({ field }) => (
              <FormItem>
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
                      Buscar Cotação do Dia
                    </span>
                  </Button>
                </div>
                <FormDescription>
                  {podeBuscarCotacao || buscandoCotacao
                    ? "O valor sugerido pode ser editado manualmente."
                    : "Preencha commodity e praça para habilitar a busca de cotação."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tipoPreco"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Preço</FormLabel>
                <FormControl>
                  <Input placeholder="Farmer Selling" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dataPagamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Pagamento</FormLabel>
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

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={form.formState.isSubmitting}
          >
            Limpar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar Oferta
          </Button>
        </div>
      </form>
    </Form>
  );
}
