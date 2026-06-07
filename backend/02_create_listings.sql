
-- Create Listings Table
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    seller_id UUID REFERENCES auth.users(id), -- Optional: Link to auth.users if you have auth set up
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    trim TEXT,
    price NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    mileage INTEGER NOT NULL,
    mileage_unit TEXT DEFAULT 'mi',
    description TEXT,
    location TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'pending')),
    images TEXT[] -- Array of image URLs
);

-- Enable RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read active listings
CREATE POLICY "Public listings are viewable by everyone"
ON public.listings FOR SELECT
USING (status = 'active');

-- Policy: Only authenticated users can insert (Simulated for now, or allow anon for testing)
CREATE POLICY "Users can insert listings"
ON public.listings FOR INSERT
WITH CHECK (true); -- CAUTION: Open for demo. In prod: auth.uid() = seller_id

-- Insert Mock Data
INSERT INTO public.listings (make, model, year, trim, price, mileage, description, location, images, status)
VALUES 
('BMW', 'M3 CSL', 2003, NULL, 85000, 42000, 'Immaculate E46 M3 CSL. Silver Grey Metallic.', 'Los Angeles, CA', ARRAY['https://images.unsplash.com/photo-1605515298946-d062f2e9da53?q=80&w=2600'], 'active'),
('Porsche', '911 GT3', 2022, '992', 185900, 3500, 'Shark Blue 992 GT3. PCCB, Buckets.', 'Miami, FL', ARRAY['https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=2600'], 'active'),
('Nissan', 'Skyline GT-R', 1999, 'V-Spec', 120000, 65000, 'Legal R34 GT-R V-Spec in Bayside Blue.', 'Austin, TX', ARRAY['https://images.unsplash.com/photo-1619623055909-e33a6933c1eb?q=80&w=2600'], 'active');
