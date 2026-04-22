"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { supabaseAdmin, type UsuarioRow } from "@/lib/supabase";

export const usuarioSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome completo"),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
});

export type UsuarioFormValues = z.infer<typeof usuarioSchema>;

export type CriarUsuarioResult =
  | { ok: true; id: string }
  | {
      ok: false;
      message: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export async function listarUsuarios(): Promise<UsuarioRow[]> {
  const { data, error } = await supabaseAdmin
    .from("usuarios")
    .select("*")
    .order("nome", { ascending: true });

  if (error) {
    console.error("[listarUsuarios] erro:", error);
    return [];
  }
  return (data ?? []) as UsuarioRow[];
}

export async function criarUsuario(
  input: UsuarioFormValues
): Promise<CriarUsuarioResult> {
  const parsed = usuarioSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Dados inválidos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { data, error } = await supabaseAdmin
    .from("usuarios")
    .insert({ nome: parsed.data.nome, email: parsed.data.email })
    .select("id")
    .single();

  if (error || !data) {
    const msg = error?.message ?? "Não foi possível cadastrar o usuário.";
    const dup =
      error?.code === "23505" || msg.toLowerCase().includes("duplicate");
    return {
      ok: false,
      message: dup ? "Já existe um usuário com esse e-mail." : msg,
    };
  }

  revalidatePath("/usuarios");
  revalidatePath("/");
  return { ok: true, id: data.id };
}

export async function removerUsuario(
  id: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabaseAdmin.from("usuarios").delete().eq("id", id);

  if (error) {
    console.error("[removerUsuario] erro:", error);
    return {
      ok: false,
      message: error.message ?? "Não foi possível remover o usuário.",
    };
  }

  revalidatePath("/usuarios");
  revalidatePath("/");
  return { ok: true };
}
