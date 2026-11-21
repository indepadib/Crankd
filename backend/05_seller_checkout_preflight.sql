-- VROOQ Parts / additive, read-only seller eligibility for public product details.
-- The only information returned is whether the seller has an active VROOQ shop.
-- Never expose part_sellers.contact_phone or private account details to buyers.
create or replace function public.is_part_seller_available(p_seller_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    exists (
      select 1
      from public.part_sellers s
      where s.seller_id = p_seller_id
        and s.status = 'active'
    ),
    false
  );
$$;
revoke all on function public.is_part_seller_available(uuid) from public, anon, authenticated;
grant execute on function public.is_part_seller_available(uuid) to anon, authenticated;
comment on function public.is_part_seller_available(uuid) is
  'Buyer-safe Boolean indicating whether a listed part seller currently has an active VROOQ shop; no PII exposed.';
notify pgrst, 'reload schema';
