// supabase/functions/transfer-ownership/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Service role required to call secure function
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { action, vehicle_id, token } = await req.json()
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

        if (userError || !user) throw new Error('Unauthorized')

        // SCENARIO 1: Seller Generates Token
        if (action === 'generate_token') {
            // 1. Verify user owns vehicle
            // (Simplified check, ideally query Database directly)

            const transferToken = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6-char code

            const { error: insertError } = await supabaseClient
                .from('transfer_tokens')
                .insert({
                    vehicle_id,
                    seller_id: user.id,
                    token: transferToken,
                    expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min expiry
                })

            if (insertError) throw insertError

            return new Response(JSON.stringify({ token: transferToken }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // SCENARIO 2: Buyer Claims Vehicle
        if (action === 'claim_vehicle') {
            if (!token) throw new Error("Token required")

            // Call the Atomic Postgres Function
            const { data: rpcData, error: rpcError } = await supabaseClient
                .rpc('process_vehicle_transfer', {
                    p_vehicle_id: vehicle_id,
                    p_buyer_id: user.id,
                    p_transfer_token: token
                })

            if (rpcError) throw rpcError
            if (!rpcData.success) throw new Error(rpcData.error)

            return new Response(JSON.stringify(rpcData), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        throw new Error('Invalid Action')

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
