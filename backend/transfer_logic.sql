-- CRANKD Database Schema
-- Ownership Transfer Logic

-- Table to store active transfer tokens (short-lived)
create table public.transfer_tokens (
  id uuid default uuid_generate_v4() primary key,
  vehicle_id uuid references public.vehicles(id) not null,
  seller_id uuid references public.profiles(id) not null,
  token text unique not null, -- 6-digit code or hash
  expires_at timestamp with time zone not null,
  is_used boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Tokens
alter table transfer_tokens enable row level security;
-- Only seller can see their generated tokens
create policy "Sellers can view their tokens" on transfer_tokens
  for select using (auth.uid() = seller_id);


-- FUNCTION: Atomic Transfer
-- This is the critical "Handshake" transaction.
create or replace function public.process_vehicle_transfer(
  p_vehicle_id uuid,
  p_buyer_id uuid,
  p_transfer_token text
) returns jsonb
language plpgsql
security definer -- Runs with elevated privileges to bypass RLS during transaction
as $$
declare
  v_seller_id uuid;
  v_token_id uuid;
  v_current_period_id uuid;
begin
  -- 1. Validate Token
  select seller_id, id into v_seller_id, v_token_id
  from public.transfer_tokens
  where token = p_transfer_token
    and vehicle_id = p_vehicle_id
    and is_used = false
    and expires_at > now();

  if v_token_id is null then
    return jsonb_build_object('success', false, 'error', 'Invalid or expired token');
  end if;

  -- 2. Validate Seller is ACTUALLY the current owner
  select id into v_current_period_id
  from public.ownership_periods
  where vehicle_id = p_vehicle_id
    and user_id = v_seller_id
    and end_date is null;

  if v_current_period_id is null then
    return jsonb_build_object('success', false, 'error', 'Seller is not the current active owner');
  end if;

  -- 3. EXECUTE TRANSFER (The "Soul" Migration)
  
  -- A. Close Seller's Period
  update public.ownership_periods
  set end_date = now()
  where id = v_current_period_id;

  -- B. Open Buyer's Period
  insert into public.ownership_periods (vehicle_id, user_id, start_date, is_verified_transfer)
  values (p_vehicle_id, p_buyer_id, now(), true);

  -- C. Mark Token as Used
  update public.transfer_tokens
  set is_used = true
  where id = v_token_id;

  -- D. (Optional) Create a "Transfer Event" in Logs? 
  -- For now, the ownership_period change is the record.

  return jsonb_build_object('success', true, 'message', 'Transfer complete', 'previous_owner', v_seller_id);

exception when others then
  return jsonb_build_object('success', false, 'error', SQLERRM);
end;
$$;
