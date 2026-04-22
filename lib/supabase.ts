import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL não configurada.");
}
if (!serviceKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
}

/**
 * Client Supabase para uso EXCLUSIVO no servidor (Server Actions, Route
 * Handlers, Server Components). Usa a service_role key — bypassa RLS.
 * NUNCA importar este módulo em código que rode no browser.
 */
export const supabaseAdmin = createClient(url, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export type OfertaRow = {
  id: string;
  vendedor: string;
  cliente_nome: string;
  inscricao_estadual: string | null;
  commodity: string;
  quantidade_sacas: number;
  quantidade_ton: number;
  incoterm: string;
  praca: string;
  local_embarque: string;
  data_embarque: string;
  moeda: "BRL" | "USD" | "USc/LB";
  preco: number;
  tipo_preco: string;
  data_pagamento: string;
  created_at: string;
  updated_at: string;
};
