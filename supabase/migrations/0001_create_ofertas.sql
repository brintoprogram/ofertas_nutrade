-- Tabela de ofertas de commodities agrícolas
-- Rode no SQL Editor do Supabase (Project → SQL Editor → New query)

create extension if not exists "pgcrypto";

create table if not exists public.ofertas (
  id                  uuid            primary key default gen_random_uuid(),
  vendedor            text            not null,
  cliente_nome        text            not null,
  inscricao_estadual  text,
  commodity           text            not null,
  quantidade_sacas    integer         not null check (quantidade_sacas > 0),
  quantidade_ton      numeric(12, 3)  not null,
  incoterm            text            not null,
  praca               text            not null,
  local_embarque      text            not null,
  data_embarque       date            not null,
  moeda               text            not null check (moeda in ('BRL', 'USD', 'USc/LB')),
  preco               numeric(14, 4)  not null check (preco > 0),
  tipo_preco          text            not null default 'Farmer Selling',
  data_pagamento      date            not null,
  created_at          timestamptz     not null default now(),
  updated_at          timestamptz     not null default now()
);

create index if not exists ofertas_vendedor_idx   on public.ofertas (vendedor);
create index if not exists ofertas_commodity_idx  on public.ofertas (commodity);
create index if not exists ofertas_created_at_idx on public.ofertas (created_at desc);

-- Trigger para manter updated_at em sync
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ofertas_set_updated_at on public.ofertas;
create trigger ofertas_set_updated_at
  before update on public.ofertas
  for each row execute function public.set_updated_at();

-- Habilita RLS. Sem policies = tudo bloqueado para anon/authenticated.
-- Nossas Server Actions usam a service_role key, que bypassa RLS.
alter table public.ofertas enable row level security;
