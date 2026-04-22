import { z } from "zod";

export const MOEDAS = ["BRL", "USD", "USc/LB"] as const;

export const ofertaSchema = z.object({
  criadoPor: z
    .string({ required_error: "Selecione quem está criando a oferta" })
    .uuid({ message: "Selecione um usuário válido" }),
  nomeParent: z.string().min(1, "Informe o Nome Parent"),
  nomeSoldTo: z.string().min(1, "Informe o Nome Sold To"),
  commodity: z.string().min(1, "Selecione a commodity"),
  praca: z.string().min(1, "Informe a praça"),
  localRetiradaEntrega: z.string().min(1, "Informe o local de retirada/entrega"),
  quantidadeSc: z.coerce
    .number({ invalid_type_error: "Informe a quantidade em sacas" })
    .positive("A quantidade deve ser maior que zero"),
  quantidadeTon: z.coerce.number().nonnegative(),
  prazoEntrega: z.date({
    required_error: "Selecione o prazo de entrega",
    invalid_type_error: "Prazo de entrega inválido",
  }),
  preco: z.coerce
    .number({ invalid_type_error: "Informe o preço" })
    .positive("O preço deve ser maior que zero"),
  moeda: z.enum(MOEDAS, { required_error: "Selecione a moeda" }),
  pagamento: z.date({
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
