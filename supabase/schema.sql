-- Paper Street Services database schema
-- Run this in the Supabase SQL editor when the project is created.

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  whatsapp text not null,
  service text not null,
  deadline date,
  requirements text,
  status text not null default 'new' check (status in ('new','paid','in_progress','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.order_files (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists orders_status_deadline_idx on public.orders(status, deadline);
create index if not exists orders_completed_at_idx on public.orders(completed_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

-- The browser should never receive unrestricted database access.
-- Enable Row Level Security and add narrowly-scoped policies only after
-- the authenticated admin and public order-submission flow are configured.
alter table public.orders enable row level security;
alter table public.order_files enable row level security;
