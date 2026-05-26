-- CenterShip Financeiro - Supabase schema inicial
-- Execute no Supabase > SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.cadastros (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('cliente', 'fornecedor', 'colaborador_mei')),
  nome text not null,
  documento text,
  email text,
  telefone text,
  pix text,
  diaria_padrao numeric(12,2),
  observacoes text,
  status text default 'ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recibos (
  id uuid primary key default gen_random_uuid(),
  numero text,
  prestador_nome text,
  prestador_documento text,
  periodo text,
  servico text,
  diarias numeric(12,2),
  valor_diaria numeric(12,2),
  adicional numeric(12,2),
  desconto numeric(12,2),
  total numeric(12,2),
  forma_pagamento text,
  chave_pix text,
  data_pagamento date,
  created_at timestamptz not null default now()
);

create table if not exists public.documentos (
  id uuid primary key default gen_random_uuid(),
  cadastro_id uuid references public.cadastros(id) on delete set null,
  tipo text,
  nome_arquivo text,
  storage_path text,
  status text default 'enviado',
  created_at timestamptz not null default now()
);

alter table public.cadastros enable row level security;
alter table public.recibos enable row level security;
alter table public.documentos enable row level security;

-- Política rápida para equipe autenticada.
-- Para produção com múltiplos níveis de acesso, trocar por roles/perfis.
do $$ begin
  create policy "Equipe autenticada pode ler cadastros" on public.cadastros for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Equipe autenticada pode inserir cadastros" on public.cadastros for insert to authenticated with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Equipe autenticada pode atualizar cadastros" on public.cadastros for update to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Equipe autenticada pode ler recibos" on public.recibos for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Equipe autenticada pode inserir recibos" on public.recibos for insert to authenticated with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Equipe autenticada pode ler documentos" on public.documentos for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Equipe autenticada pode inserir documentos" on public.documentos for insert to authenticated with check (true);
exception when duplicate_object then null; end $$;

insert into public.cadastros (tipo, nome, documento, email, telefone, pix, diaria_padrao, observacoes, status)
values
('colaborador_mei', 'João Silva', 'CPF 123.456.789-00 / CNPJ 43.228.119/0001-02', 'joao@exemplo.com', '(21) 99999-0000', '2199999-0000', 180.00, 'Prestador MEI exemplo', 'ativo'),
('cliente', 'Edifício Atlântico', 'CNPJ 12.345.678/0001-10', 'contato@edificio.com.br', '', '', null, 'Manutenção mensal', 'ativo'),
('fornecedor', 'Elev Parts Brasil', 'CNPJ 22.555.111/0001-80', 'financeiro@elevparts.com.br', '', '', null, 'Peças e sensores', 'pendente')
on conflict do nothing;

create table if not exists public.propostas (
  id uuid primary key default gen_random_uuid(),
  numero_proposta text,
  cliente_id uuid references public.cadastros(id) on delete set null,
  servico_descricao text not null,
  valor numeric(12,2) not null,
  data_validade date,
  forma_pagamento text,
  itens text,
  observacoes text,
  status text default 'pendente' check (status in ('pendente', 'aprovada', 'rejeitada', 'cancelada')),
  created_at timestamptz not null default now()
);

alter table public.propostas enable row level security;

do $$ begin
  create policy "Equipe autenticada pode ler propostas" on public.propostas for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Equipe autenticada pode inserir propostas" on public.propostas for insert to authenticated with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Equipe autenticada pode atualizar propostas" on public.propostas for update to authenticated using (true) with check (true);
exception when duplicate_object then null; end $$;

