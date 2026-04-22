import { z } from "zod";

export const MOEDAS = ["BRL", "USD", "USc/LB"] as const;

export const ofertaSchema = z.object({
  vendedor: z.string().min(1, "Informe o vendedor"),
  clienteNome: z.string().min(1, "Informe o nome do cliente"),
  inscricaoEstadual: z.string().optional(),
  commodity: z.string().min(1, "Selecione a commodity"),
  quantidadeSacas: z.coerce
    .number({ invalid_type_error: "Informe a quantidade em sacas" })
    .positive("A quantidade deve ser maior que zero"),
  quantidadeTon: z.coerce.number().nonnegative(),
  incoterm: z.string().min(1, "Selecione o Incoterm"),
  praca: z.string().min(1, "Informe a praça"),
  localEmbarque: z.string().min(1, "Informe o local de embarque"),
  dataEmbarque: z.date({
    required_error: "Selecione a data de embarque",
    invalid_type_error: "Data de embarque inválida",
  }),
  moeda: z.enum(MOEDAS, { required_error: "Selecione a moeda" }),
  preco: z.coerce
    .number({ invalid_type_error: "Informe o preço" })
    .positive("O preço deve ser maior que zero"),
  tipoPreco: z.string().min(1).default("Farmer Selling"),
  dataPagamento: z.date({
    required_error: "Selecione a data de pagamento",
    invalid_type_error: "Data de pagamento inválida",
  }),
});

export type OfertaFormValues = z.infer<typeof ofertaSchema>;

export const COMMODITIES = [
  "Soja",
  "Milho",
  "Café Arábica",
  "Café Robusta",
  "Açúcar",
  "Algodão",
  "Trigo",
  "Sorgo",
];

export const INCOTERMS = [
  "FOB",
  "CIF",
  "CFR",
  "EXW",
  "FCA",
  "CPT",
  "CIP",
  "DAP",
  "DPU",
  "DDP",
];
