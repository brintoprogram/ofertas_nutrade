-- Refactor: novo conjunto de campos conforme especificação da Nutrade.
-- Drop + recreate da tabela. Rode no SQL Editor do Supabase.

drop table if exists public.ofertas cascade;

create table public.ofertas (
  id                      uuid            primary key default gen_random_uuid(),
  nome_parent             text            not null,
  nome_sold_to            text            not null,
  commodity               text            not null,
  praca                   text            not null,
  local_retirada_entrega  text            not null,
  quantidade_sc           integer         not null check (quantidade_sc > 0),
  quantidade_ton          numeric(12, 3)  not null,
  prazo_entrega           date            not null,
  preco                   numeric(14, 4)  not null check (preco > 0),
  moeda                   text            not null check (moeda in ('BRL', 'USD', 'USc/LB')),
  pagamento               date            not null,
  created_at              timestamptz     not null default now(),
  updated_at              timestamptz     not null default now()
);

create index ofertas_commodity_idx    on public.ofertas (commodity);
create index ofertas_nome_parent_idx  on public.ofertas (nome_parent);
create index ofertas_created_at_idx   on public.ofertas (created_at desc);

-- Trigger updated_at (reutiliza função se já existir)
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

alter table public.ofertas enable row level security;
