// web/types/index.ts

export interface Vehicle {
    id: string;
    vin: string;
    make: string;
    model: string;
    year: number;
    trim?: string;
    specs?: Record<string, any>;
    health_score: number;
    image_url?: string; // Derived/Mocked
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
    image_url?: string;

    view_count: number;
    like_count: number;
    comment_count: number;
    engagement_score: number;
    cohort_level: number;
    tags?: string[];
    created_at: string;

    // Joined Data (Supabase Relations)
    author?: UserProfile;
    vehicle_id?: string; // Sometimes linked
    vehicle?: Vehicle;
    log?: MaintenanceLog;
}
