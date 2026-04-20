create extension if not exists pgcrypto;

-- 1. Automatic Timestamp Function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. Tables Setup
-- Changed owner_user_id to default to auth.uid() for seamless future auth integration
create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid default auth.uid(), 
  name text not null,
  contact_person text not null,
  email text not null,
  phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists suppliers_name_unique_idx on public.suppliers (lower(name));

create table if not exists public.supplier_products (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid default auth.uid(),
  supplier_id uuid not null references public.suppliers(id) on delete cascade,
  name text not null,
  sku text not null,
  category text null,
  unit text null,
  price numeric(12, 2) not null check (price > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists supplier_products_sku_unique_idx on public.supplier_products (lower(sku));
create unique index if not exists supplier_products_supplier_name_unique_idx on public.supplier_products (supplier_id, lower(name));

create table if not exists public.inventory_stocks (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid default auth.uid(),
  supplier_product_id uuid not null references public.supplier_products(id) on delete cascade,
  quantity integer not null check (quantity >= 0),
  batch_id text not null,
  expiration date null,
  reorder_level integer not null default 10 check (reorder_level >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists inventory_sku_batch_unique_idx on public.inventory_stocks (supplier_product_id, lower(batch_id));

create table if not exists public.checkout_orders (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid default auth.uid(),
  total_items integer not null check (total_items > 0),
  total_amount numeric(12, 2) not null check (total_amount > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.checkout_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.checkout_orders(id) on delete cascade,
  inventory_stock_id uuid not null references public.inventory_stocks(id),
  supplier_product_id uuid not null references public.supplier_products(id),
  sku text not null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit text null,
  price numeric(12, 2) not null check (price > 0),
  line_total numeric(12, 2) not null check (line_total > 0),
  created_at timestamptz not null default now()
);

-- 3. Triggers for updated_at
create or replace trigger suppliers_set_updated_at before update on public.suppliers for each row execute function public.set_updated_at();
create or replace trigger supplier_products_set_updated_at before update on public.supplier_products for each row execute function public.set_updated_at();
create or replace trigger inventory_stocks_set_updated_at before update on public.inventory_stocks for each row execute function public.set_updated_at();

-- 4. Row Level Security (RLS)
alter table public.suppliers enable row level security;
alter table public.supplier_products enable row level security;
alter table public.inventory_stocks enable row level security;
alter table public.checkout_orders enable row level security;
alter table public.checkout_order_items enable row level security;

-- Policy: Allow all authenticated users to see and edit everything
-- This is great for group projects so you all see the same data.
create policy group_access_suppliers on public.suppliers for all to authenticated using (true) with check (true);
create policy group_access_products on public.supplier_products for all to authenticated using (true) with check (true);
create policy group_access_inventory on public.inventory_stocks for all to authenticated using (true) with check (true);
create policy group_access_orders on public.checkout_orders for all to authenticated using (true) with check (true);
create policy group_access_order_items on public.checkout_order_items for all to authenticated using (true) with check (true);

-- 5. Permissions
-- Grant access to authenticated users (your groupmates)
grant select, insert, update, delete on all tables in schema public to authenticated;

-- 6. Checkout Function (Optimized to prevent race conditions)
create or replace function public.confirm_checkout(p_items jsonb)
returns table(order_id uuid, total_items integer, total_amount numeric)
language plpgsql
as $$
declare
  v_item jsonb;
  v_order_id uuid;
  v_total_items integer := 0;
  v_total_amount numeric(12, 2) := 0;
  v_row record;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Checkout items are required';
  end if;

  -- Create order record
  insert into public.checkout_orders (total_items, total_amount)
  values (1, 1) -- placeholders
  returning id into v_order_id;

  for v_item in select jsonb_array_elements(p_items) loop
    -- Lock row for update to prevent multiple people buying the same stock at once
    select inv.id, inv.quantity, inv.supplier_product_id, sp.sku, sp.name, sp.unit, sp.price
    into v_row
    from public.inventory_stocks inv
    join public.supplier_products sp on sp.id = inv.supplier_product_id
    where inv.id = (v_item->>'inventory_id')::uuid
    for update;

    if not found then raise exception 'Inventory item not found'; end if;
    if v_row.quantity < (v_item->>'quantity')::integer then 
      raise exception 'Insufficient stock for %', v_row.name; 
    end if;

    -- Deduct stock
    update public.inventory_stocks 
    set quantity = quantity - (v_item->>'quantity')::integer 
    where id = v_row.id;

    -- Add line item
    insert into public.checkout_order_items (
      order_id, inventory_stock_id, supplier_product_id, sku, product_name, quantity, unit, price, line_total
    ) values (
      v_order_id, v_row.id, v_row.supplier_product_id, v_row.sku, v_row.name, 
      (v_item->>'quantity')::integer, v_row.unit, v_row.price, 
      (v_row.price * (v_item->>'quantity')::integer)
    );

    v_total_items := v_total_items + (v_item->>'quantity')::integer;
    v_total_amount := v_total_amount + (v_row.price * (v_item->>'quantity')::integer);
  end loop;

  -- Finalize order
  update public.checkout_orders 
  set total_items = v_total_items, total_amount = v_total_amount 
  where id = v_order_id;

  return query select v_order_id, v_total_items, v_total_amount;
end;
$$;