# VROOQ Parts — Marketplace de pièces automobiles d’occasion

Status: **MVP code / not deployed to production** · 21 November 2026
Repository: indepadib/Crankd · Branch: feat/vrooq-used-parts-marketplace-20261121

## Product goal

Enable Moroccan drivers, enthusiasts, garages and dismantlers to publish used spare parts, match parts with registered vehicles, request an order and follow fulfilment within VROOQ. The old vehicle-listing marketplace remains available.

## Built in this branch

- /marketplace/parts: real Supabase catalogue, query, category, condition, city, sort and saved-garage filtering. No fake listings.
- /marketplace/parts/new: authenticated publishing, OEM reference, condition, known defects, compatibility, quantity, city, 1–8 JPEG/PNG/WebP photos uploaded to Supabase Storage.
- /marketplace/parts/[id]: photo gallery, seller-declared compatibility, request form, choice of delivery vs pickup.
- /marketplace/parts/orders: buyer/seller orders, acceptance, refusal/cancellation, declared shipment with carrier and tracking reference, buyer delivery confirmation.
- /marketplace/parts/mine: seller inventory editing (price, availability, visibility).
- backend/03_used_parts_marketplace.sql: independently versioned part tables, minimal grants, RLS, owner-restricted photos and RPCs for atomic one-unit reservation / controlled status transitions.
- Existing /marketplace entry page highlights VROOQ Parts. /marketplace still sells cars.

## What is NOT live / must not be represented as implemented

- Payment processing, authorized payment capture, card storage, bank transfers, marketplace split settlements, payout escrow, verified payment callbacks.
- Courier booking, negotiated shipping rates, printed label, courier tracking webhooks, delivery proof / refusal returns, COD reconciliation.
- KYC/KYB seller onboarding, seller verifications, moderation, disputes, refunds, seller payouts, commission ledger, fraud and risk engine.
- End-to-end validation against the *real* VROOQ Supabase production project: currently not available among connected projects.
- .ma domain configuration: needs separate confirmation.

The request-order button creates a reserved request **without money movement**. The SQL payment_method defaults to unconfigured and payment_status to not_initiated; never display "paid". The shipping reference currently comes from a seller and is *not* carrier-verified. Shipping_fee_mad is unknown until a carrier quotes; the UI explicitly excludes it.

## Security contract

- Listings publicly readable only while active; only the owner can insert/change/delete their listings. Real authenticated Supabase user ID is used.
- Orders may only be read by buyer or seller. No direct client INSERT/UPDATE/DELETE privileges.
- The request_part_order RPC obtains auth.uid(), blocks self-purchases, locks the listing FOR UPDATE, snapshots the stored MAD price and decrements available stock atomically.
- Repeated client_request_id for the same buyer returns the already-created order, avoiding accidental duplicate checkout.
- Order status changes are restricted to buyer/seller and valid transitions. Cancellation before shipment returns one unit. Neither buyer nor seller can set the payment state through these RPCs.
- Storage uploads are scoped to the user's UUID folder, restricted to JPEG/PNG/WebP ≤5 MB.
- Buyer contact details are private to buyer/seller under RLS; production privacy policy and retention schedule are required.
- A *real* PSP integration must be server-side with signed/verified callbacks, unique transaction identifiers, idempotency, amount and currency reconciliation and audited state changes.

### Known follow-up risks

1. The legacy INIT_DATABASE.sql contains permissive policies on other tables; audit the deployed DB independently before launch.
2. An untrusted seller can claim shipment using an arbitrary tracking number in this MVP. The UI says "déclaré" to distinguish it from verified courier events.
3. Seller-managed stock adjustment is allowed for correct inventory; inventory reservations and external platform sales require reconciliation.
4. Production must add anti-fraud controls, prohibited-parts policy (especially airbags, unsafe safety-critical components, stolen goods), moderation/reporting and seller verification.
5. The production release needs real service-provider contracts and tests covering refunds/chargebacks and COD refusals.

## Integration design for real "payment + shipping handled by VROOQ"

**Phase A – contracting and flows:** select a licensed PSP whose contract explicitly covers a multi-vendor marketplace (onboarding KYC/KYB, commissions/splits, payouts, refunds and disputes). Do not escrow or custody buyer funds in VROOQ's own accounts by default. Candidate to evaluate in Morocco: Chari Money/Chari Pay; compare NAPS/Payzone through actual commercial and technical agreements. Bank Al-Maghrib / payment-acquiring context must be verified for the selected contract.

**Phase B – delivery:** partner with courier(s) offering contracted API pickup, label generation, address validation, proof of delivery and COD reconciliation. Cathedis, Amana and Sendit are candidates, not configured partners. Rates must be calculated server-side from geography, parcel weight/dimensions and partner quote, not trusted from client inputs.

**Phase C – checkout:** on the server, get the locked part + fee quote, create payment session using provider credentials, store a merchant transaction/PSP ID server-side and redirect to the provider's hosted payment. Finalize only after verified webhook; never trust browser redirect to mark payment successful. Record commissions, payout schedule, refund state and disputes in an immutable ledger.

**Phase D – logistics:** after payment is confirmed or verified COD acceptance is supported, book an official shipment and label; ingest signed courier webhooks, allow returns and inspect proof of delivery. Distinguish "collected by courier", "in transit", "delivered", "refused/returned" and "received by buyer".

**Phase E – quality/launch:** legal terms, CNDP/privacy, return rules for used parts, seller identity checks, prohibited-item policy, appeal/dispute handling, observability, PII retention and resilience. Test two simultaneous orders for quantity=1, cancellation inventory restoration, duplicate PSP notifications, network timeout, lost parcel, COD refusal and refunds.

## Deployment steps

1. Identify the *correct* Supabase project for VROOQ; inspect existing live schema/table naming for conflicts and RLS status.
2. Run **backend/03_used_parts_marketplace.sql** in a controlled environment after a database backup and review; it has not been executed by the assistant.
3. Confirm Storage public URL and access controls by uploading with authenticated test account A and ensuring account B cannot upload to A's prefix.
4. Run SQL permission checks using anon, authenticated-A, authenticated-B; verify listings and order isolation.
5. Create users A/B, post one part, search by garage vehicle, submit an order, attempt a double order, accept and mark shipped, confirm delivery, cancel other request, inspect all inventory.
6. Run GitHub CI and build; smoke test desktop/mobile with keyboard and reduced motion.
7. Configure PSP and courier agreements before enabling any real checkout or COD dispatch. Production release only after payment/logistics verification.

## Free skill references (product workflow)

Use Apple-design for input contrast, responsiveness and state feedback; Grill-me for critical product decisions; Humanizer for natural French copy; marketing skills for SEO, trust pages and acquisition; Video-agent-skills when creating marketing assets. Refer to the separately proposed VROOQ foundation AGENTS.md for upstream verified links and licenses. Do not copy skill repositories blindly into this application.