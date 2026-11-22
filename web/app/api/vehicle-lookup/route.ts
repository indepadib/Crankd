import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const responseHeaders = { 'Cache-Control': 'no-store' };
type NhtsaVehicle = { Make?: string | null; Model?: string | null; ModelYear?: string | null; ErrorCode?: string | null };

export async function POST(request: NextRequest) {
  let payload: { vin?: string; consent?: boolean };
  try { payload = (await request.json()) as { vin?: string; consent?: boolean }; }
  catch { return NextResponse.json({ error: 'Demande invalide.' }, { status: 400, headers: responseHeaders }); }

  const vin = (payload.vin || '').trim().toUpperCase();
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
    return NextResponse.json({ error: 'Le numéro VIN doit contenir exactement 17 caractères (sans I, O ni Q).' }, { status: 400, headers: responseHeaders });
  }
  if (payload.consent !== true) {
    return NextResponse.json({ error: 'Ton accord est nécessaire pour consulter ce service externe.' }, { status: 403, headers: responseHeaders });
  }
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !supabaseUrl || !publicKey) {
    return NextResponse.json({ error: 'Connecte-toi avant de rechercher un VIN.' }, { status: 401, headers: responseHeaders });
  }
  const supabase = createClient(supabaseUrl, publicKey, { auth: { persistSession: false } });
  const { data: identity, error: identityError } = await supabase.auth.getUser(token);
  if (identityError || !identity.user) {
    return NextResponse.json({ error: 'Session expirée. Reconnecte-toi.' }, { status: 401, headers: responseHeaders });
  }
  // NHTSA vPIC is a US public vehicle decoder. This is only a provisional
  // identification aid, NOT an OEM part-fitment or title/registration check.
  // Raw VINs are not saved in VROOQ or sent to analytics by this endpoint.
  try {
    const result = await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/' + encodeURIComponent(vin) + '?format=json', {
      method: 'GET', cache: 'no-store', signal: AbortSignal.timeout(7000),
      headers: { Accept: 'application/json' },
    });
    if (!result.ok) throw new Error('VIN_PROVIDER_FAILED');
    const json: { Results?: NhtsaVehicle[] } = await result.json();
    const match = json.Results?.[0];
    const make = String(match?.Make || '').trim();
    const model = String(match?.Model || '').trim();
    const year = Number(match?.ModelYear || 0);
    if (!make || !model || !Number.isInteger(year) || year < 1950 || year > new Date().getFullYear() + 2) {
      return NextResponse.json({ error: 'VIN non reconnu par ce référentiel. Renseigne ta voiture manuellement.' }, { status: 422, headers: responseHeaders });
    }
    return NextResponse.json({ make, model, year, source: 'NHTSA-vPIC', confidence: 'indicative', warning: 'Résultat issu d’un référentiel américain ; confirme toutes les informations avant enregistrement.' }, { headers: responseHeaders });
  } catch {
    return NextResponse.json({ error: 'Recherche VIN indisponible. Tu peux ajouter ton véhicule manuellement.' }, { status: 503, headers: responseHeaders });
  }
}
