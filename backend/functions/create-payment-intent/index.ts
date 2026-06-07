// supabase/functions/create-payment-intent/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// import Stripe from 'stripe' // Would import real stripe in prod
// const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { listing_id, promo_type } = await req.json()
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

        if (userError || !user) throw new Error('Unauthorized')

        // 1. Calculate Price
        let amount = 0;
        if (promo_type === 'verified_listing') {
            amount = 4900; // $49.00
        } else {
            throw new Error('Invalid promo type')
        }

        // 2. Create Stripe Payment Intent (Mock)
        console.log(`Creating Payment Intent for ${listing_id}: $${amount / 100}`)

        // const paymentIntent = await stripe.paymentIntents.create({
        //   amount,
        //   currency: 'usd',
        //   automatic_payment_methods: { enabled: true },
        //   metadata: { listing_id, user_id: user.id }
        // })

        const mockClientSecret = `pi_mock_${Math.random().toString(36).substring(7)}_secret_${Math.random().toString(36).substring(7)}`;

        // 3. Return Client Secret to Frontend
        return new Response(
            JSON.stringify({
                clientSecret: mockClientSecret,
                amount: amount,
                currency: 'USD'
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
