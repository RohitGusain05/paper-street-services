-- Paper Street Services production database schema
-- PostgreSQL/Supabase-compatible. No passwords or customer files belong in this file.

create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity unique,
  customer_name text not null,
  whatsapp_number text not null,
  service text not null,
  price_inr integer,
  deadline date,
  requirements text,
  status text not null default 'new' check (status in ('new','paid','in_progress','completed','deleted')),
  payment_status text not null default 'pending' check (payment_status in ('pending','paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  deleted_at timestamptz
);

create table if not exists public.order_files (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  original_name text not null,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create index if not exists orders_active_deadline_idx
  on public.orders (deadline asc nulls last, created_at asc)
  where status in ('paid','in_progress');

create index if not exists orders_status_idx on public.orders(status);
create index if not exists order_files_order_idx on public.order_files(order_id);

-- Completed history is retained as an order row until the admin deliberately deletes it.
-- This makes customer name + WhatsApp number + project type available for future reference.

create or replace function public.set_order_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  if new.status = 'completed' and old.status <> 'completed' then
    new.completed_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
before update on public.orders
for each row execute function public.set_order_updated_at();

-- Production note:
-- Enable Row Level Security and expose orders/files only to the authenticated admin role.
-- The public order form should submit through a controlled server/API endpoint rather than
-- receiving unrestricted database write access in browser JavaScript.
