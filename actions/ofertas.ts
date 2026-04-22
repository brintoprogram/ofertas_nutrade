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
      vendedor: data.vendedor,
      cliente_nome: data.clienteNome,
      inscricao_estadual: data.inscricaoEstadual?.trim() || null,
      commodity: data.commodity,
      quantidade_sacas: data.quantidadeSacas,
      quantidade_ton: data.quantidadeTon,
      incoterm: data.incoterm,
      praca: data.praca,
      local_embarque: data.localEmbarque,
      data_embarque: format(data.dataEmbarque, "yyyy-MM-dd"),
      moeda: data.moeda,
      preco: data.preco,
      tipo_preco: data.tipoPreco,
      data_pagamento: format(data.dataPagamento, "yyyy-MM-dd"),
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
