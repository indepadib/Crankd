
-- Seed Data Script
-- NOTE: This script assigns all mock data to the most recently created user in your database.
-- Run this AFTER you have signed up at least one user in the app.

DO $$
DECLARE
    v_user_id uuid;
    v_vehicle_id_1 uuid;
    v_vehicle_id_2 uuid;
BEGIN
    -- 1. Get the most recent user
    SELECT id INTO v_user_id FROM public.profiles ORDER BY created_at DESC LIMIT 1;

    IF v_user_id IS NULL THEN
        RAISE NOTICE 'No users found! Please Sign Up in the app first.';
        RETURN;
    END IF;

    RAISE NOTICE 'Seeding data for User ID: %', v_user_id;

    -- 2. Create Vehicles for this user
    INSERT INTO public.vehicles (owner_id, make, model, year, image_url)
    VALUES 
    (v_user_id, 'BMW', 'M3', 2003, 'https://images.unsplash.com/photo-1605515298946-d062f2e9da53?q=80&w=2600'),
    (v_user_id, 'Porsche', '911 GT3', 2022, 'https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=2600')
    RETURNING id INTO v_vehicle_id_1;
    
    -- Need to capture the second ID differently or just fetch them
    SELECT id INTO v_vehicle_id_2 FROM public.vehicles WHERE owner_id = v_user_id AND make = 'Porsche' LIMIT 1;


    -- 3. Create Posts (Feed Content)
    
    -- Post 1: Car Photo
    INSERT INTO public.posts (author_id, vehicle_id, title, body, image_url, content_type, like_count, cohort_level, tags)
    VALUES (
        v_user_id, 
        v_vehicle_id_1, 
        'Sunday Morning Canyon Run', 
        'Took the E46 out to the canyons. The S54 pulls like a freight train.', 
        'https://images.unsplash.com/photo-1605515298946-d062f2e9da53?q=80&w=2600',
        'media',
        42,
        1, -- Rising
        ARRAY['BMW', 'E46', 'Canyon']
    );

    -- Post 2: Maintenance Log
    INSERT INTO public.posts (author_id, vehicle_id, title, body, content_type, like_count, cohort_level, tags)
    VALUES (
        v_user_id, 
        v_vehicle_id_2, 
        'Oil Analysis Results', 
        'Just got the Blackstone report back. Zero lead or copper. This engine is healthy!', 
        'maintenance_log',
        15,
        0,
        ARRAY['Porsche', 'Maintenance', 'Oil']
    );

    -- Post 3: Viral Build Update
    INSERT INTO public.posts (author_id, vehicle_id, title, body, image_url, content_type, like_count, cohort_level, tags)
    VALUES (
        v_user_id, 
        v_vehicle_id_1, 
        'New Wheels Are On! 🛞', 
        'Finally fitted the BBS E88s. What do you think of the fitment?', 
        'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=2600',
        'media',
        890,
        2, -- Trending
        ARRAY['BMW', 'BBS', 'Stance']
    );
    
    -- Post 4: Convoy Invite
    INSERT INTO public.posts (author_id, title, body, content_type, like_count, tags)
    VALUES (
        v_user_id, 
        'Midnight Tokyo Run', 
        'Meeting at Daikoku PA at 11PM. Bringing the R34.', 
        'convoy',
        120,
        ARRAY['JDM', 'Meet', 'NightRun']
    );

END $$;
