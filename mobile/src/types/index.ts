// src/types/index.ts

export interface Vehicle {
    id: string;
    vin: string;
    make: string;
    model: string;
    year: number;
    trim?: string;
    specs?: Record<string, any>;
    health_score: number;
    image_url?: string; // Derived from MediaAssets
}

export interface MaintenanceLog {
    id: string;
    vehicle_id: string;
    occurred_at: string;
    service_type: 'maintenance' | 'modification' | 'repair' | 'detailing';
    title: string;
    description?: string;
    cost_amount?: number;
    cost_currency: string;
    odometer_reading?: number;
    is_verified: boolean;
}

export interface OwnershipPeriod {
    id: string;
    user_id: string;
    vehicle_id: string;
    start_date: string;
    end_date?: string;
    is_verified_transfer: boolean;
}

export interface UserProfile {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    garage_rank: number;
}

export interface Post {
    id: string;
    author_id: string;
    content_type: 'media' | 'maintenance_log' | 'listing' | 'convoy' | 'vehicle_showcase';
    media_id?: string;
    log_id?: string;
    listing_id?: string;
    convoy_id?: string;

    title?: string;
    body?: string;

    view_count: number;
    like_count: number;
    comment_count: number;
    engagement_score: number;
    cohort_level: number;
    tags?: string[];
    created_at: string;

    // Joined Data
    author?: UserProfile;
    vehicle_id?: string;
    vehicle?: Vehicle;
    log?: MaintenanceLog;
}

export interface Listing {
    id: string;
    vehicle_id: string;
    seller_id: string;
    price_amount: number;
    price_currency: string;
    mileage_value: number;
    mileage_unit: 'mi' | 'km';
    status: 'active' | 'pending' | 'sold';
    created_at: string;

    // Joined
    seller?: UserProfile;
    vehicle?: Vehicle;
}
