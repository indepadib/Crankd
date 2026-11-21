-- VROOQ / Used parts marketplace (Morocco, MAD)
-- Deploy only after reviewing the target Supabase project and existing policies.
-- Independent of the legacy public.listings vehicle marketplace.
create extension if not exists pgcrypto;

create table if not exists public.part_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users(id),
  title text not null check (char_length(trim(title)) between 8 and 140),
  description text not null check (char_length(trim(description)) between 20 and 4000),
  category text not null check (category in ('moteur','transmission','carrosserie','interieur','electricite','suspension','roues','accessoires','autre')),
  part_condition text not null check (part_condition in ('neuf','excellent','bon','a_reparer')),
  defects text,
  part_brand text,
  oem_reference text,
  compatible_make text not null,
  compatible_model text not null,
  compatible_year_from integer check (compatible_year_from between 1950 and 2100),
  compatible_year_to integer check (compatible_year_to between 1950 and 2100),
  city text not null check (char_length(trim(city)) between 2 and 100),
  price_mad integer not null check (price_mad between 10 and 10000000),
  quantity integer not null default 1 check (quantity between 0 and 100),
  images text[] not null default '{}',
  offers_delivery boolean not null default true,
  offers_pickup boolean not null default false,
  status text not null default 'active' check (status in ('active','paused','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint part_years_consistent check (compatible_year_from is null or compatible_year_to is null or compatible_year_from <= compatible_year_to),
  constraint part_has_fulfilment check (offers_delivery or offers_pickup),
  constraint part_images_limit check (cardinality(images) <= 8)
);

create index if not exists part_listings_active_recent on public.part_listings(created_at desc) where status = 'active';
create index if not exists part_listings_vehicle on public.part_listings(compatible_make, compatible_model);
create index if not exists part_listings_seller on public.part_listings(seller_id, created_at desc);

alter table public.part_listings enable row level security;
drop policy if exists "parts_public_active" on public.part_listings;
create policy "parts_public_active" on public.part_listings for select to anon, authenticated
using (status = 'active' or seller_id = (select auth.uid()));
drop policy if exists "parts_seller_insert" on public.part_listings;
create policy "parts_seller_insert" on public.part_listings for insert to authenticated
with check (seller_id = (select auth.uid()));
drop policy if exists "parts_seller_update" on public.part_listings;
create policy "parts_seller_update" on public.part_listings for update to authenticated
using (seller_id = (select auth.uid()))
with check (seller_id = (select auth.uid()));
drop policy if exists "parts_seller_delete" on public.part_listings;
create policy "parts_seller_delete" on public.part_listings for delete to authenticated
using (seller_id = (select auth.uid()));

grant select on public.part_listings to anon;
grant select, insert, update, delete on public.part_listings to authenticated;

create table if not exists public.part_orders (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.part_listings(id),
  buyer_id uuid not null references auth.users(id),
  seller_id uuid not null references auth.users(id),
  client_request_id uuid not null,
  item_title text not null,
  item_price_mad integer not null check (item_price_mad > 0),
  quantity integer not null default 1 check (quantity = 1),
  shipping_method text not null check (shipping_method in ('delivery','pickup')),
  buyer_contact jsonb not null,
  shipping_fee_mad integer check (shipping_fee_mad >= 0),
  payment_method text not null default 'unconfigured' check (payment_method in ('unconfigured','cod','online')),
  payment_status text not null default 'not_initiated' check (payment_status in ('not_initiated','awaiting_payment','paid','failed','refunded')),
  order_status text not null default 'pending_seller' check (order_status in ('pending_seller','accepted','shipped','delivered','cancelled')),
  carrier text,
  tracking_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (buyer_id, client_request_id),
  constraint valid_order_contact check (
    jsonb_typeof(buyer_contact) = 'object' and
    length(trim(coalesce(buyer_contact->>'name',''))) between 3 and 120 and
    length(trim(coalesce(buyer_contact->>'phone',''))) between 9 and 20 and
    length(trim(coalesce(buyer_contact->>'city',''))) between 2 and 100 and
    length(trim(coalesce(buyer_contact->>'address',''))) between 5 and 300
  )
);

create index if not exists part_orders_buyer on public.part_orders(buyer_id, created_at desc);
create index if not exists part_orders_seller on public.part_orders(seller_id, created_at desc);
alter table public.part_orders enable row level security;
drop policy if exists "orders_participants_read" on public.part_orders;
create policy "orders_participants_read" on public.part_orders for select to authenticated
using (buyer_id = (select auth.uid()) or seller_id = (select auth.uid()));

-- Orders may only be created or transitioned by guarded RPCs. No client write grants.
revoke all on public.part_orders from anon, authenticated;
grant select on public.part_orders to authenticated;

-- Atomic order request: snapshots price, locks one unit, blocks self-buying and duplicates.
-- No payment is implied; logistics and PSP integrations need separate verified callbacks.
create or replace function public.request_part_order(
  p_listing_id uuid,
  p_client_request_id uuid,
  p_shipping_method text,
  p_buyer_contact jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_buyer uuid := (select auth.uid());
  v_existing uuid;
  v_listing public.part_listings%rowtype;
  v_new_order uuid;
begin
  if v_buyer is null or coalesce((select auth.jwt()->>'is_anonymous')::boolean, false) then
    raise exception 'Authentification requise';
  end if;

  select id into v_existing from public.part_orders
    where buyer_id = v_buyer and client_request_id = p_client_request_id;
  if v_existing is not null then return v_existing; end if;

  if p_client_request_id is null then
    raise exception 'Identifiant de demande requis';
  end if;
  if p_shipping_method not in ('delivery','pickup') then
    raise exception 'Mode de remise invalide';
  end if;
  if p_buyer_contact is null or
    jsonb_typeof(p_buyer_contact) is distinct from 'object' or
    length(trim(coalesce(p_buyer_contact->>'name',''))) not between 3 and 120 or
    length(trim(coalesce(p_buyer_contact->>'phone',''))) not between 9 and 20 or
    length(trim(coalesce(p_buyer_contact->>'city',''))) not between 2 and 100 or
    length(trim(coalesce(p_buyer_contact->>'address',''))) not between 5 and 300 then
    raise exception 'Coordonnees de commande incompletes';
  end if;

  if (select count(*) from public.part_orders
      where buyer_id = v_buyer and order_status in ('pending_seller','accepted','shipped')) >= 10 then
    raise exception 'Trop de commandes ouvertes';
  end if;

  -- FOR UPDATE serializes requests; database stock is the only source of truth.
  select * into v_listing from public.part_listings
    where id = p_listing_id for update;
  if not found or v_listing.status <> 'active' or v_listing.quantity < 1 then
    raise exception 'Piece indisponible';
  end if;
  if v_listing.seller_id = v_buyer then
    raise exception 'Impossible de commander sa propre annonce';
  end if;
  if (p_shipping_method = 'delivery' and not v_listing.offers_delivery) or
     (p_shipping_method = 'pickup' and not v_listing.offers_pickup) then
    raise exception 'Mode de remise indisponible';
  end if;

  update public.part_listings set quantity = quantity - 1, updated_at = now()
  where id = p_listing_id and quantity > 0;
  insert into public.part_orders (
    listing_id, buyer_id, seller_id, client_request_id, item_title,
    item_price_mad, shipping_method, buyer_contact
  ) values (
    p_listing_id, v_buyer, v_listing.seller_id, p_client_request_id, v_listing.title,
    v_listing.price_mad, p_shipping_method, p_buyer_contact
  ) returning id into v_new_order;
  return v_new_order;
end;
$$;

-- Only actors can advance the fulfilment workflow. Neither actor can claim payment.
create or replace function public.transition_part_order(
  p_order_id uuid,
  p_next_status text,
  p_carrier text default null,
  p_tracking_number text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_order public.part_orders%rowtype;
begin
  if v_actor is null or coalesce((select auth.jwt()->>'is_anonymous')::boolean, false) then
    raise exception 'Authentification requise';
  end if;
  select * into v_order from public.part_orders where id = p_order_id for update;
  if not found or v_actor not in (v_order.buyer_id, v_order.seller_id) then
    raise exception 'Commande introuvable';
  end if;

  if p_next_status = 'cancelled' then
    if v_order.order_status not in ('pending_seller','accepted') then
      raise exception 'Annulation impossible apres expedition';
    end if;
    update public.part_orders set order_status = 'cancelled', updated_at = now() where id = p_order_id;
    update public.part_listings set quantity = quantity + 1, updated_at = now()
      where id = v_order.listing_id;
  elsif p_next_status = 'accepted' and v_actor = v_order.seller_id and v_order.order_status = 'pending_seller' then
    update public.part_orders set order_status = 'accepted', updated_at = now() where id = p_order_id;
  elsif p_next_status = 'shipped' and v_actor = v_order.seller_id and v_order.order_status = 'accepted'
    and v_order.shipping_method = 'delivery'
    and length(trim(coalesce(p_carrier,''))) between 2 and 80
    and length(trim(coalesce(p_tracking_number,''))) between 4 and 120 then
    update public.part_orders set order_status = 'shipped', carrier = trim(p_carrier),
      tracking_number = trim(p_tracking_number), updated_at = now() where id = p_order_id;
  elsif p_next_status = 'delivered' and v_actor = v_order.buyer_id and
    (v_order.order_status = 'shipped' or (v_order.order_status = 'accepted' and v_order.shipping_method = 'pickup')) then
    update public.part_orders set order_status = 'delivered', updated_at = now() where id = p_order_id;
  else
    raise exception 'Transition non autorisee';
  end if;
end;
$$;

revoke all on function public.request_part_order(uuid,uuid,text,jsonb) from public, anon;
revoke all on function public.transition_part_order(uuid,text,text,text) from public, anon;
grant execute on function public.request_part_order(uuid,uuid,text,jsonb) to authenticated;
grant execute on function public.transition_part_order(uuid,text,text,text) to authenticated;

-- Public product photos. Folder 1 must be the logged-in owner UUID.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('part-listing-images', 'part-listing-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
drop policy if exists "part_images_owner_upload" on storage.objects;
create policy "part_images_owner_upload" on storage.objects for insert to authenticated
with check (bucket_id = 'part-listing-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "part_images_owner_delete" on storage.objects;
create policy "part_images_owner_delete" on storage.objects for delete to authenticated
using (bucket_id = 'part-listing-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- IMPORTANT: Before opening payments, implement PSP-signed webhook verification,
-- server-side amounts and fulfilment reconciliation, buyer refunds/disputes,
-- payout/commission ledger, and courier API; never set paid in the browser.
-- Ask PostgREST to reload after a manual SQL Editor installation.
NOTIFY pgrst, 'reload schema';
