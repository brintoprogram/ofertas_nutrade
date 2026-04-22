"use server";

import { revalidatePath } from "next/cache";
import { format } from "date-fns";

import { ofertaSchema, type OfertaFormValues } from "@/lib/schema";
import { supabaseAdmin } from "@/lib/supabase";

export type SalvarOfertaResult =
  | { ok: true; id: string }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export async function salvarOferta(
  input: OfertaFormValues
): Promise<SalvarOfertaResult> {
  const parsed = ofertaSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Dados inválidos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const { data: inserted, error } = await supabaseAdmin
    .from("ofertas")
    .insert({
      nome_parent: data.nomeParent,
      nome_sold_to: data.nomeSoldTo,
      commodity: data.commodity,
      praca: data.praca,
      local_retirada_entrega: data.localRetiradaEntrega,
      quantidade_sc: data.quantidadeSc,
      quantidade_ton: data.quantidadeTon,
      prazo_entrega: format(data.prazoEntrega, "yyyy-MM-dd"),
      preco: data.preco,
      moeda: data.moeda,
      pagamento: format(data.pagamento, "yyyy-MM-dd"),
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("[salvarOferta] supabase error:", error);
    return {
      ok: false,
      message: error?.message ?? "Não foi possível salvar a oferta.",
    };
  }

  revalidatePath("/dashboard");

  return { ok: true, id: inserted.id };
}
