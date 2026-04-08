-- ============================================================
--  POLPA DE MARACUJÁ — Schema Supabase
--  Execute este arquivo no SQL Editor do Supabase
-- ============================================================

-- PRODUTOS
create table if not exists produtos (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  tipo        text not null check (tipo in ('pote','sache','pacote','outro')),
  peso_g      integer not null check (peso_g > 0),
  qtd_estoque integer not null default 0 check (qtd_estoque >= 0),
  preco_sug   numeric(10,2) default 0,
  ativo       boolean default true,
  criado_em   timestamptz default now()
);

-- MOVIMENTAÇÕES (entradas e saídas)
create table if not exists movimentacoes (
  id            uuid primary key default gen_random_uuid(),
  tipo          text not null check (tipo in ('entrada','saida')),
  qty_kg        numeric(10,3) not null check (qty_kg > 0),
  produto_id    uuid references produtos(id) on delete set null,
  produto_nome  text,
  unidades      integer,
  preco_kg      numeric(10,2),
  preco_total   numeric(10,2),
  vendedor      text,
  conta         text,
  cliente       text,
  descricao     text,
  criado_em     timestamptz default now()
);

-- ÍNDICES para relatórios rápidos
create index if not exists idx_movs_tipo      on movimentacoes(tipo);
create index if not exists idx_movs_criado_em on movimentacoes(criado_em);
create index if not exists idx_movs_vendedor  on movimentacoes(vendedor);
create index if not exists idx_movs_conta     on movimentacoes(conta);
create index if not exists idx_movs_produto   on movimentacoes(produto_id);

-- ============================================================
--  ROW LEVEL SECURITY — permite acesso público autenticado
--  (todos os usuários logados veem e editam os mesmos dados,
--   ideal para uso familiar compartilhado)
-- ============================================================
alter table produtos        enable row level security;
alter table movimentacoes   enable row level security;

-- Qualquer usuário autenticado pode ler e escrever
create policy "autenticados_leem_produtos"
  on produtos for select using (auth.role() = 'authenticated');

create policy "autenticados_escrevem_produtos"
  on produtos for all using (auth.role() = 'authenticated');

create policy "autenticados_leem_movs"
  on movimentacoes for select using (auth.role() = 'authenticated');

create policy "autenticados_escrevem_movs"
  on movimentacoes for all using (auth.role() = 'authenticated');
