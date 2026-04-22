"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Loader2, Trash2, UserPlus, Users2 } from "lucide-react";

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  criarUsuario,
  removerUsuario,
  usuarioSchema,
  type UsuarioFormValues,
} from "@/actions/usuarios";
import type { UsuarioRow } from "@/lib/supabase";

export function UsuariosManager({ usuarios }: { usuarios: UsuarioRow[] }) {
  const [, startTransition] = React.useTransition();
  const [removingId, setRemovingId] = React.useState<string | null>(null);

  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: { nome: "", email: "" },
  });

  async function onSubmit(values: UsuarioFormValues) {
    const result = await criarUsuario(values);
    if (!result.ok) {
      toast.error("Não foi possível cadastrar.", {
        description: result.message,
      });
      return;
    }
    toast.success("Usuário cadastrado.", {
      description: `${values.nome} • ${values.email}`,
    });
    form.reset();
  }

  function handleRemove(usuario: UsuarioRow) {
    if (
      !confirm(
        `Remover ${usuario.nome}? As ofertas já criadas por ele ficarão sem autor.`
      )
    ) {
      return;
    }
    setRemovingId(usuario.id);
    startTransition(async () => {
      const res = await removerUsuario(usuario.id);
      if (!res.ok) {
        toast.error("Não foi possível remover.", { description: res.message });
      } else {
        toast.success("Usuário removido.");
      }
      setRemovingId(null);
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-start gap-4 space-y-0 border-b border-border/50 bg-gradient-to-b from-primary-soft/40 to-transparent pb-5">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-glow-primary ring-1 ring-white/10">
            <UserPlus className="relative h-4 w-4" />
          </div>
          <div className="space-y-1 pt-0.5">
            <CardTitle className="text-[15px]">Novo Usuário</CardTitle>
            <CardDescription>
              Cadastre quem pode registrar ofertas.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="pessoa@nutrade.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                Cadastrar
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader className="flex flex-row items-start gap-4 space-y-0 border-b border-border/50 bg-gradient-to-b from-primary-soft/40 to-transparent pb-5">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-glow-primary ring-1 ring-white/10">
            <Users2 className="relative h-4 w-4" />
          </div>
          <div className="space-y-1 pt-0.5">
            <CardTitle className="text-[15px]">
              Usuários cadastrados
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                {usuarios.length}
              </span>
            </CardTitle>
            <CardDescription>
              Aparecem no seletor &ldquo;Criado por&rdquo; do formulário de oferta.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {usuarios.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Nenhum usuário ainda. Cadastre ao lado para começar.
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {usuarios.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {u.nome
                        .split(" ")
                        .map((p) => p[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {u.nome}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {u.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="hidden text-right text-[11px] text-muted-foreground sm:block">
                      <div>Desde</div>
                      <div>
                        {format(parseISO(u.created_at), "dd MMM yy", {
                          locale: ptBR,
                        })}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleRemove(u)}
                      disabled={removingId === u.id}
                      aria-label={`Remover ${u.nome}`}
                    >
                      {removingId === u.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
