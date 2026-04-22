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

export type UsuarioRow = {
  id: string;
  nome: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type OfertaRow = {
  id: string;
  nome_parent: string;
  nome_sold_to: string;
  commodity: string;
  praca: string;
  local_retirada_entrega: string;
  quantidade_sc: number;
  quantidade_ton: number;
  prazo_entrega: string;
  preco: number;
  moeda: "BRL" | "USD" | "USc/LB";
  pagamento: string;
  criado_por: string | null;
  created_at: string;
  updated_at: string;
};

export type OfertaRowComCriador = OfertaRow & {
  criador: Pick<UsuarioRow, "id" | "nome" | "email"> | null;
};
