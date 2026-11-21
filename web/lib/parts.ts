export const PART_CATEGORIES = [
  { value: 'moteur', label: 'Moteur' },
  { value: 'transmission', label: 'Transmission' },
  { value: 'carrosserie', label: 'Carrosserie' },
  { value: 'interieur', label: 'Intérieur' },
  { value: 'electricite', label: 'Électricité' },
  { value: 'suspension', label: 'Suspension & freinage' },
  { value: 'roues', label: 'Roues & pneus' },
  { value: 'accessoires', label: 'Accessoires' },
  { value: 'autre', label: 'Autre' },
] as const;

export const PART_CONDITIONS = [
  { value: 'neuf', label: 'Neuf / jamais monté' },
  { value: 'excellent', label: 'Excellent état' },
  { value: 'bon', label: 'Bon état' },
  { value: 'a_reparer', label: 'À réparer' },
] as const;

export interface PartListing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: string;
  part_condition: string;
  defects: string | null;
  part_brand: string | null;
  oem_reference: string | null;
  compatible_make: string;
  compatible_model: string;
  compatible_year_from: number | null;
  compatible_year_to: number | null;
  city: string;
  price_mad: number;
  quantity: number;
  images: string[];
  offers_delivery: boolean;
  offers_pickup: boolean;
  status: string;
  created_at: string;
}

export interface PartOrder {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  item_title: string;
  item_price_mad: number;
  shipping_method: 'delivery' | 'pickup';
  buyer_contact: { name: string; phone: string; city: string; address: string };
  order_status: 'pending_seller' | 'accepted' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: 'unconfigured' | 'cod' | 'online';
  payment_status: string;
  requested_payment_channel?: 'card' | 'wallet';
  requested_carrier?: 'unassigned' | 'cathedis' | 'amana' | 'pickup';
  shipping_fee_mad?: number | null;
  carrier: string | null;
  tracking_number: string | null;
  created_at: string;
}

export function moneyMAD(value: number) {
  return new Intl.NumberFormat('fr-MA', { maximumFractionDigits: 0 }).format(value) + ' DH';
}

export function partConditionLabel(value: string) {
  return PART_CONDITIONS.find((item) => item.value === value)?.label || value;
}

export function partCategoryLabel(value: string) {
  return PART_CATEGORIES.find((item) => item.value === value)?.label || value;
}

export function readableError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }
  return 'Une erreur est survenue. Réessayez.';
}
export const PAYMENT_CHANNEL_LABELS: Record<string, string> = {
  card: 'Carte bancaire',
  wallet: 'Wallet numérique',
};

export const CARRIER_LABELS: Record<string, string> = {
  cathedis: 'Cathedis (souhaité)',
  amana: 'Amana (souhaité)',
  pickup: 'Remise en main propre',
  unassigned: 'Non sélectionné',
};
