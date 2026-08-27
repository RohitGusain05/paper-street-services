-- Paper Street Services backend schema
-- Run this in a Supabase project's SQL editor.

create extension if not exists pgcrypto;

do $$ begin
  create type public.order_status as enum ('new','paid','in_progress','completed','deleted');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('pending','paid');
exception when duplicate_object then null; end $$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text unique not null default ('PSS-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  customer_name text not null,
  whatsapp text not null,
  service text not null,
  price_inr integer,
  deadline date,
  requirements text,
  payment_status public.payment_status not null default 'pending',
  status public.order_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz,
  completed_at timestamptz,
  deleted_at timestamptz
);

create index if not exists orders_active_deadline_idx
  on public.orders (deadline asc nulls last, created_at asc)
  where status in ('paid','in_progress');
create index if not exists orders_completed_idx
  on public.orders (completed_at desc)
  where status = 'completed';

create table if not exists public.order_files (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create index if not exists order_files_order_idx on public.order_files(order_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders
for each row execute function public.set_updated_at();

alter table public.orders enable row level security;
alter table public.order_files enable row level security;

-- Only authenticated admins can access order records directly.
-- Public customers submit through a server-side Edge Function, not direct table access.
drop policy if exists "authenticated admins can read orders" on public.orders;
create policy "authenticated admins can read orders"
on public.orders for select to authenticated using (true);

drop policy if exists "authenticated admins can update orders" on public.orders;
create policy "authenticated admins can update orders"
on public.orders for update to authenticated using (true) with check (true);

drop policy if exists "authenticated admins can delete orders" on public.orders;
create policy "authenticated admins can delete orders"
on public.orders for delete to authenticated using (true);

drop policy if exists "authenticated admins can read order files" on public.order_files;
create policy "authenticated admins can read order files"
on public.order_files for select to authenticated using (true);

-- Create a PRIVATE Supabase Storage bucket named `order-files`.
-- Never put customer documents in this GitHub repository or a public bucket.
