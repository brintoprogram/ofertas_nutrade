-- Tabela de usuários (pessoas que podem registrar ofertas) +
-- coluna criado_por em ofertas vinculando ao autor do registro.

create table if not exists public.usuarios (
  id          uuid        primary key default gen_random_uuid(),
  nome        text        not null,
  email       text        not null unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists usuarios_email_idx on public.usuarios (email);

drop trigger if exists usuarios_set_updated_at on public.usuarios;
create trigger usuarios_set_updated_at
  before update on public.usuarios
  for each row execute function public.set_updated_at();

alter table public.usuarios enable row level security;

-- Adiciona criado_por em ofertas (nullable — existentes ficam sem autor).
-- ON DELETE SET NULL: se um usuário for removido, as ofertas dele permanecem
-- com criado_por = null em vez de serem apagadas.
alter table public.ofertas
  add column if not exists criado_por uuid references public.usuarios(id) on delete set null;

create index if not exists ofertas_criado_por_idx on public.ofertas (criado_por);
