-- Add baseline quantity tracking and archive support for inventory rows.

alter table if exists public.inventory_stocks
  add column if not exists initial_quantity integer;

update public.inventory_stocks
set initial_quantity = quantity
where initial_quantity is null;

alter table if exists public.inventory_stocks
  alter column initial_quantity set default 0;

alter table if exists public.inventory_stocks
  alter column initial_quantity set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'inventory_initial_quantity_non_negative'
  ) then
    alter table public.inventory_stocks
      add constraint inventory_initial_quantity_non_negative
      check (initial_quantity >= 0);
  end if;
end
$$;

alter table if exists public.inventory_stocks
  add column if not exists archived_at timestamptz null;

create index if not exists inventory_stocks_archived_at_idx
  on public.inventory_stocks (archived_at);
