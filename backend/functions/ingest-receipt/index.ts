// supabase/functions/ingest-receipt/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { vehicle_id, storage_path, user_provided_metadata } = await req.json()

        if (!vehicle_id || !storage_path) {
            throw new Error('Missing vehicle_id or storage_path')
        }

        // 1. Simulate Google Document AI OCR Processing
        // In production, we would call the Google Cloud API here.
        console.log(`Processing receipt: ${storage_path}`)

        // MOCK extraction result
        const extractedData = {
            date: new Date().toISOString(),
            vendor: "AutoZone Inc.",
            total: 145.50,
            currency: "USD",
            line_items: [
                { description: "Castrol GTX 5W-40", amount: 45.00 },
                { description: "Oil Filter", amount: 12.50 },
                { description: "Shop Towels", amount: 5.00 }
            ],
            confidence: 0.98
        }

        // 2. Identify the Ownership Period
        // We need to link this content to the correct owner (the caller)
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) throw new Error('Unauthorized')

        // 3. Insert into VERIFICATION_PROOFS (The Evidence)
        // This happens FIRST. We store the raw evidence.
        const { data: proofData, error: proofError } = await supabaseClient
            .from('verification_proofs')
            .insert({
                storage_path: storage_path,
                extracted_data: extractedData,
                manual_review_status: extractedData.confidence > 0.90 ? 'approved' : 'pending' // Auto-approve high confidence
            })
            .select()
            .single()

        if (proofError) throw proofError

        // 4. Create the MAINTENANCE_LOG (The Public Record)
        // If auto-approved, we publish it immediately.
        if (extractedData.confidence > 0.90) {
            const { error: logError } = await supabaseClient
                .from('maintenance_logs')
                .insert({
                    vehicle_id: vehicle_id,
                    performed_by_user_id: user.id,
                    occurred_at: extractedData.date,
                    service_type: 'maintenance', // Inferred or user provided
                    title: `Service at ${extractedData.vendor}`,
                    description: `Auto-imported from receipt. Items: ${extractedData.line_items.map(i => i.description).join(', ')}`,
                    cost_amount: extractedData.total,
                    cost_currency: extractedData.currency,
                    is_verified: true,
                    verification_confidence: extractedData.confidence
                })

            if (logError) throw logError
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: "Receipt processed",
                proof_id: proofData.id,
                auto_verified: extractedData.confidence > 0.90
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
