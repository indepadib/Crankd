-- VROOQ Maroc: non-transactional used-parts RFQ + multiple competing seller quotes.
-- No payment, notification fanout, verified fitment or SLA is implied.
-- All owner/seller access is enforced by RLS, not user metadata.
create extension if not exists pgcrypto;

create table if not exists public.part_seller_specialties (
  seller_id uuid not null references public.part_sellers(seller_id) on delete cascade,
  category text not null check (category in
    ('moteur','transmission','carrosserie','interieur','electricite','suspension','roues','accessoires','autre')),
  brands text[] not null default '{}'::text[],
  updated_at timestamptz not null default now(),
  primary key (seller_id,category),
  constraint specialty_max_brands check (coalesce(cardinality(brands),0) <= 40)
);
create index if not exists part_specialties_category on public.part_seller_specialties(category);
alter table public.part_seller_specialties enable row level security;

create policy "specialty_owner_read" on public.part_seller_specialties for select to authenticated
  using (seller_id=(select auth.uid()));
create policy "specialty_owner_insert" on public.part_seller_specialties for insert to authenticated
  with check (seller_id=(select auth.uid()) and exists (
    select 1 from public.part_sellers s
    where s.seller_id=(select auth.uid()) and s.status='active'
  ));
create policy "specialty_owner_update" on public.part_seller_specialties for update to authenticated
  using (seller_id=(select auth.uid()))
  with check (seller_id=(select auth.uid()) and exists (
    select 1 from public.part_sellers s
    where s.seller_id=(select auth.uid()) and s.status='active'
  ));
create policy "specialty_owner_delete" on public.part_seller_specialties for delete to authenticated
  using (seller_id=(select auth.uid()));
revoke all on public.part_seller_specialties from anon,authenticated;
grant select,insert,delete on public.part_seller_specialties to authenticated;
grant update (brands,updated_at) on public.part_seller_specialties to authenticated;

create table if not exists public.part_requests (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references auth.users(id) on delete cascade,
  client_request_id uuid not null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  make text not null check (char_length(trim(make)) between 2 and 90),
  model text not null check (char_length(trim(model)) between 1 and 90),
  year integer check (year between 1950 and 2100),
  fuel_type text check (fuel_type in ('petrol','diesel','hybrid','phev','electric','lpg','other')),
  engine_code text check (char_length(engine_code)<=60),
  category text not null check (category in
    ('moteur','transmission','carrosserie','interieur','electricite','suspension','roues','accessoires','autre')),
  part_name text not null check (char_length(trim(part_name)) between 3 and 140),
  oem_reference text check (char_length(oem_reference)<=100),
  quantity integer not null default 1 check (quantity between 1 and 10),
  desired_condition text not null default 'any' check (desired_condition in ('any','new','used')),
  buyer_city text not null check (char_length(trim(buyer_city)) between 2 and 100),
  details text not null default '' check (char_length(details)<=2000),
  status text not null default 'open' check (status in ('open','closed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (buyer_id,client_request_id)
);
create index if not exists part_requests_buyer on public.part_requests(buyer_id,created_at desc);
create index if not exists part_requests_category on public.part_requests(category,status,created_at desc);
alter table public.part_requests enable row level security;

-- Seller sees only anonymous demand details for requested categories and
-- compatible makes based on his active shop specialties. No phone/email field exists.
create policy "rfq_read_authorized" on public.part_requests for select to authenticated
  using (
    buyer_id=(select auth.uid())
    or (
      status='open'
      and exists (
        select 1 from public.part_seller_specialties spec
        join public.part_sellers seller on seller.seller_id=spec.seller_id
        where spec.seller_id=(select auth.uid()) and seller.status='active'
          and spec.category=part_requests.category
          and (cardinality(spec.brands)=0 or exists (
            select 1 from unnest(spec.brands) brand
            where lower(trim(brand))=lower(trim(part_requests.make))
          ))
      )
    )
  );
create policy "rfq_buyer_create" on public.part_requests for insert to authenticated
  with check (
    buyer_id=(select auth.uid()) and status='open'
    and (vehicle_id is null or exists(
      select 1 from public.vehicles vehicle
      where vehicle.id=vehicle_id and vehicle.owner_id=(select auth.uid())
    ))
  );
create policy "rfq_buyer_update_status" on public.part_requests for update to authenticated
  using (buyer_id=(select auth.uid()))
  with check (buyer_id=(select auth.uid()) and status in ('open','closed','cancelled'));

revoke all on public.part_requests from anon,authenticated;
grant select,insert on public.part_requests to authenticated;
grant update(status,updated_at) on public.part_requests to authenticated;

create table if not exists public.part_quotes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.part_requests(id) on delete cascade,
  seller_id uuid not null references public.part_sellers(seller_id),
  price_mad integer not null check (price_mad>=10 and price_mad<=10000000),
  shipping_fee_mad integer check (shipping_fee_mad between 0 and 100000),
  availability_days integer not null default 2 check (availability_days between 0 and 45),
  part_condition text not null check (part_condition in ('new','used','refurbished')),
  part_reference text check (char_length(part_reference)<=100),
  message text not null check (char_length(trim(message)) between 10 and 1500),
  quote_status text not null default 'sent' check (quote_status in ('sent','withdrawn','selected')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now()+interval '7 days'),
  unique (request_id,seller_id)
);
create index if not exists part_quotes_request on public.part_quotes(request_id,created_at desc);
create index if not exists part_quotes_seller on public.part_quotes(seller_id,created_at desc);
alter table public.part_quotes enable row level security;

create policy "quotes_read_buyer_or_seller" on public.part_quotes for select to authenticated
  using (seller_id=(select auth.uid()) or exists(
    select 1 from public.part_requests r
    where r.id=request_id and r.buyer_id=(select auth.uid())
  ));
create policy "quotes_send_matching_seller" on public.part_quotes for insert to authenticated
  with check (
    seller_id=(select auth.uid()) and quote_status='sent'
    and exists (
      select 1 from public.part_requests r
      join public.part_seller_specialties spec on spec.category=r.category
      join public.part_sellers seller on seller.seller_id=spec.seller_id
      where r.id=request_id and r.status='open'
        and r.buyer_id<>(select auth.uid())
        and spec.seller_id=(select auth.uid())
        and seller.status='active'
        and (cardinality(spec.brands)=0 or exists(
          select 1 from unnest(spec.brands) brand
          where lower(trim(brand))=lower(trim(r.make))
        ))
    )
  );
-- Quotes are immutable client-side once submitted, preventing after-the-fact
-- price alteration. Payment/quote selection requires a future audited RPC.
revoke all on public.part_quotes from anon,authenticated;
grant select,insert on public.part_quotes to authenticated;

comment on table public.part_requests is 'Anonymous used-part buyer requests visible only to active matching shops; no PII or payment authorization.';
comment on table public.part_quotes is 'Non-binding seller quotes in MAD; no checkout/payment and no delivery promise.';
comment on table public.part_seller_specialties is 'Shop opt-in categories/brands; empty brands means all makes including imports.';
notify pgrst, 'reload schema';
