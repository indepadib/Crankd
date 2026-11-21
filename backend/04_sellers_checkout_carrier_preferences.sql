-- VROOQ Parts: seller onboarding + platform-only payment preferences and carrier choice.
-- Apply on the SAME Supabase project as VROOQ, only after backend/03_used_parts_marketplace.sql.
-- Additive / non-destructive. No provider credentials, collections or courier labels are created here.

CREATE TABLE IF NOT EXISTS public.part_sellers (
  seller_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_name text NOT NULL CHECK (char_length(btrim(shop_name)) BETWEEN 3 AND 100),
  seller_kind text NOT NULL CHECK (seller_kind IN ('individual','garage','professional')),
  contact_phone text NOT NULL CHECK (char_length(btrim(contact_phone)) BETWEEN 9 AND 20),
  city text NOT NULL CHECK (char_length(btrim(city)) BETWEEN 2 AND 100),
  returns_policy text NOT NULL CHECK (char_length(btrim(returns_policy)) BETWEEN 15 AND 2000),
  accepts_seller_rules boolean NOT NULL DEFAULT false CHECK (accepts_seller_rules = true),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified','pending','verified','rejected')),
  plan_code text NOT NULL DEFAULT 'free' CHECK (plan_code IN ('free','pro','business')),
  subscription_status text NOT NULL DEFAULT 'not_required' CHECK (subscription_status IN ('not_required','trial','active','past_due','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS part_sellers_active ON public.part_sellers(status) WHERE status = 'active';

ALTER TABLE public.part_sellers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "part_sellers_self_read" ON public.part_sellers;
CREATE POLICY "part_sellers_self_read" ON public.part_sellers
  FOR SELECT TO authenticated USING (seller_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "part_sellers_self_insert" ON public.part_sellers;
CREATE POLICY "part_sellers_self_insert" ON public.part_sellers
  FOR INSERT TO authenticated
  WITH CHECK (
    seller_id = (SELECT auth.uid())
    AND status = 'active'
    AND verification_status = 'unverified'
    AND plan_code = 'free'
    AND subscription_status = 'not_required'
    AND accepts_seller_rules = true
  );
DROP POLICY IF EXISTS "part_sellers_self_update" ON public.part_sellers;
CREATE POLICY "part_sellers_self_update" ON public.part_sellers
  FOR UPDATE TO authenticated
  USING (seller_id = (SELECT auth.uid()))
  WITH CHECK (seller_id = (SELECT auth.uid()));

-- Column-level grants are essential: authenticated users CANNOT self-approve,
-- self-mark KYC as verified, change a paid plan or reinstate suspended accounts.
REVOKE ALL ON public.part_sellers FROM anon, authenticated;
GRANT SELECT ON public.part_sellers TO authenticated;
GRANT INSERT (seller_id, shop_name, seller_kind, contact_phone, city, returns_policy, accepts_seller_rules)
  ON public.part_sellers TO authenticated;
GRANT UPDATE (shop_name, seller_kind, contact_phone, city, returns_policy, updated_at)
  ON public.part_sellers TO authenticated;

-- Only users who explicitly registered as sellers can add NEW part listings.
DROP POLICY IF EXISTS "parts_seller_insert" ON public.part_listings;
CREATE POLICY "parts_seller_insert" ON public.part_listings
  FOR INSERT TO authenticated
  WITH CHECK (
    seller_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.part_sellers s
      WHERE s.seller_id = (SELECT auth.uid()) AND s.status = 'active'
    )
  );

-- These columns describe a *preference only*; a payment method/provider is never
-- marked successful without server-side verified processor callbacks.
ALTER TABLE public.part_orders
  ADD COLUMN IF NOT EXISTS requested_payment_channel text NOT NULL DEFAULT 'card'
    CHECK (requested_payment_channel IN ('card','wallet')),
  ADD COLUMN IF NOT EXISTS requested_carrier text NOT NULL DEFAULT 'unassigned'
    CHECK (requested_carrier IN ('unassigned','cathedis','amana','pickup'));

-- Retire old RPC access: otherwise a client could bypass seller onboarding by
-- calling the legacy reservation endpoint directly.
REVOKE EXECUTE ON FUNCTION public.request_part_order(uuid,uuid,text,jsonb) FROM authenticated, anon, PUBLIC;

-- New request RPC prevents client writes to part_orders and uses the DB as source
-- of truth for prices, quantity, listing owner, existing reservation, and eligibility.
CREATE OR REPLACE FUNCTION public.request_part_order_v2(
  p_listing_id uuid,
  p_client_request_id uuid,
  p_shipping_method text,
  p_buyer_contact jsonb,
  p_payment_channel text,
  p_carrier text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_buyer uuid := (SELECT auth.uid());
  v_existing uuid;
  v_listing public.part_listings%ROWTYPE;
  v_order_id uuid;
BEGIN
  IF v_buyer IS NULL OR COALESCE((SELECT auth.jwt()->>'is_anonymous')::boolean, false) THEN
    RAISE EXCEPTION 'Authentification requise';
  END IF;
  IF p_client_request_id IS NULL OR p_listing_id IS NULL THEN
    RAISE EXCEPTION 'Identifiant de commande invalide';
  END IF;
  IF p_shipping_method NOT IN ('delivery','pickup') OR
     p_payment_channel NOT IN ('card','wallet') OR
     p_carrier NOT IN ('cathedis','amana','pickup') THEN
    RAISE EXCEPTION 'Preferences de commande invalides';
  END IF;
  IF (p_shipping_method = 'pickup' AND p_carrier <> 'pickup') OR
     (p_shipping_method = 'delivery' AND p_carrier = 'pickup') THEN
    RAISE EXCEPTION 'Mode de remise incompatible';
  END IF;
  IF p_buyer_contact IS NULL OR jsonb_typeof(p_buyer_contact) IS DISTINCT FROM 'object' OR
     char_length(btrim(COALESCE(p_buyer_contact->>'name',''))) NOT BETWEEN 3 AND 120 OR
     char_length(btrim(COALESCE(p_buyer_contact->>'phone',''))) NOT BETWEEN 9 AND 20 OR
     char_length(btrim(COALESCE(p_buyer_contact->>'city',''))) NOT BETWEEN 2 AND 100 OR
     char_length(btrim(COALESCE(p_buyer_contact->>'address',''))) NOT BETWEEN 5 AND 300 THEN
    RAISE EXCEPTION 'Coordonnees incompletes';
  END IF;

  -- Serialize duplicate requests across browser retries, including different listings.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext(v_buyer::text),
    pg_catalog.hashtext(p_client_request_id::text)
  );
  SELECT id INTO v_existing FROM public.part_orders
    WHERE buyer_id = v_buyer AND client_request_id = p_client_request_id;
  IF v_existing IS NOT NULL THEN RETURN v_existing; END IF;

  IF (SELECT COUNT(*) FROM public.part_orders
      WHERE buyer_id = v_buyer AND order_status IN ('pending_seller','accepted','shipped')) >= 10 THEN
    RAISE EXCEPTION 'Trop de commandes ouvertes';
  END IF;

  SELECT * INTO v_listing FROM public.part_listings WHERE id = p_listing_id FOR UPDATE;
  IF NOT FOUND OR v_listing.status <> 'active' OR v_listing.quantity < 1 THEN
    RAISE EXCEPTION 'Piece indisponible';
  END IF;
  IF v_listing.seller_id = v_buyer THEN
    RAISE EXCEPTION 'Vous ne pouvez pas acheter votre propre piece';
  END IF;
  IF NOT EXISTS (
      SELECT 1 FROM public.part_sellers s
      WHERE s.seller_id = v_listing.seller_id AND s.status = 'active'
    ) THEN
    RAISE EXCEPTION 'Vendeur non active';
  END IF;
  IF (p_shipping_method = 'delivery' AND NOT v_listing.offers_delivery) OR
     (p_shipping_method = 'pickup' AND NOT v_listing.offers_pickup) THEN
    RAISE EXCEPTION 'Mode de remise indisponible';
  END IF;

  UPDATE public.part_listings
    SET quantity = quantity - 1, updated_at = now()
    WHERE id = p_listing_id;
  INSERT INTO public.part_orders (
    listing_id, buyer_id, seller_id, client_request_id,
    item_title, item_price_mad, quantity,
    shipping_method, buyer_contact, requested_payment_channel,
    requested_carrier, payment_method, payment_status
  ) VALUES (
    p_listing_id, v_buyer, v_listing.seller_id, p_client_request_id,
    v_listing.title, v_listing.price_mad, 1,
    p_shipping_method, p_buyer_contact, p_payment_channel,
    p_carrier, 'unconfigured', 'not_initiated'
  ) RETURNING id INTO v_order_id;
  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.request_part_order_v2(uuid,uuid,text,jsonb,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_part_order_v2(uuid,uuid,text,jsonb,text,text) TO authenticated;

-- Enforce platform-only settlement: sellers cannot declare delivery/collection
-- unless the trusted PSP integration has marked the payment 'paid'.
-- Do not enable any direct buyer/seller payment-status updates.
CREATE OR REPLACE FUNCTION public.transition_part_order(
  p_order_id uuid,
  p_next_status text,
  p_carrier text DEFAULT null,
  p_tracking_number text DEFAULT null
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_actor uuid := (SELECT auth.uid());
  v_order public.part_orders%ROWTYPE;
BEGIN
  IF v_actor IS NULL OR COALESCE((SELECT auth.jwt()->>'is_anonymous')::boolean, false) THEN
    RAISE EXCEPTION 'Authentification requise';
  END IF;
  SELECT * INTO v_order FROM public.part_orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND OR v_actor NOT IN (v_order.buyer_id, v_order.seller_id) THEN
    RAISE EXCEPTION 'Commande introuvable';
  END IF;
  IF p_next_status = 'cancelled' THEN
    IF v_order.order_status NOT IN ('pending_seller','accepted') THEN
      RAISE EXCEPTION 'Annulation impossible apres expedition';
    END IF;
    IF v_order.payment_status = 'paid' THEN
      RAISE EXCEPTION 'Paiement recu : annulation uniquement via remboursement gere par VROOQ';
    END IF;
    UPDATE public.part_orders SET order_status = 'cancelled', updated_at = now() WHERE id = p_order_id;
    UPDATE public.part_listings SET quantity = quantity + 1, updated_at = now() WHERE id = v_order.listing_id;
  ELSIF p_next_status = 'accepted' AND v_actor = v_order.seller_id
    AND v_order.order_status = 'pending_seller' THEN
    UPDATE public.part_orders SET order_status = 'accepted', updated_at = now() WHERE id = p_order_id;
  ELSIF p_next_status = 'shipped' AND v_actor = v_order.seller_id
    AND v_order.order_status = 'accepted'
    AND v_order.shipping_method = 'delivery'
    AND v_order.payment_status = 'paid'
    AND char_length(btrim(COALESCE(p_carrier,''))) BETWEEN 2 AND 80
    AND char_length(btrim(COALESCE(p_tracking_number,''))) BETWEEN 4 AND 120 THEN
    UPDATE public.part_orders
      SET order_status = 'shipped', carrier = btrim(p_carrier),
          tracking_number = btrim(p_tracking_number), updated_at = now()
      WHERE id = p_order_id;
  ELSIF p_next_status = 'delivered' AND v_actor = v_order.buyer_id
    AND v_order.payment_status = 'paid'
    AND (v_order.order_status = 'shipped'
      OR (v_order.order_status = 'accepted' AND v_order.shipping_method = 'pickup')) THEN
    UPDATE public.part_orders SET order_status = 'delivered', updated_at = now() WHERE id = p_order_id;
  ELSE
    RAISE EXCEPTION 'Transition non autorisee ou paiement VROOQ non confirme';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.transition_part_order(uuid,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.transition_part_order(uuid,text,text,text) TO authenticated;

-- Future processor webhook and shipping labels must be handled server-to-server.
-- Never grant clients UPDATE privileges over payment_status, commission or payouts.
NOTIFY pgrst, 'reload schema';
