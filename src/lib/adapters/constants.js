import { supabase } from '@/lib/supabaseClient';

// ── Database Schema Column Whitelists ──────────────────────────────
export const PROFILE_COLUMNS = new Set([
    'id', 'email', 'name', 'full_name', 'firstName', 'lastName', 'role', 'status',
    'is_approved', 'is_blocked', 'is_verified', 'is_featured', 'phone', 'city',
    'country', 'occupation', 'headline', 'profession', 'rejection_reason', 'block_reason',
    'last_login_at', 'created_at', 'updated_at', 'state', 'zip_code', 'address',
    'street_address', 'whatsapp', 'facebook', 'instagram', 'id_proof_type', 'id_photo',
    'selfie_photo', 'profile_image', 'avatar_url'
]);

export const EVENT_COLUMNS = new Set([
    'id', 'title', 'description', 'category', 'event_mode', 'location', 'venue_name',
    'venue_description', 'city', 'state', 'country', 'zip_code', 'landmark',
    'parking_info', 'accessibility_info', 'start_date', 'end_date', 'time', 'end_time',
    'price', 'capacity', 'organizer_name', 'organizer_email', 'phone', 'event_url',
    'banner_image', 'images', 'what_is_included', 'what_is_not_included', 'status',
    'is_approved', 'created_at', 'updated_at'
]);

export const PROPERTY_COLUMNS = new Set([
    'id', 'host_id', 'host_name', 'hostName', 'user_name', 'phone', 'email', 'title',
    'description', 'category_id', 'property_type', 'privacy_type', 'guests', 'guest_capacity',
    'bedrooms', 'bathrooms', 'pets_allowed', 'area', 'address', 'city', 'state', 'country',
    'zip_code', 'photos', 'images', 'video', 'amenities', 'rules', 'legal_docs',
    'price_per_night', 'price_per_month', 'price_per_hour', 'price', 'currency', 'status',
    'is_approved', 'rejection_reason', 'created_at', 'updated_at'
]);

export const BUY_SELL_COLUMNS = new Set([
    'id', 'title', 'name', 'description', 'category', 'subcategory', 'status', 'price', 'currency',
    'city', 'country', 'zip_code', 'images', 'user_id', 'email', 'phone', 'whatsapp',
    'seller_name', 'seller_email', 'seller_phone', 'seller_whatsapp', 'seller_instagram', 'seller_facebook',
    'condition', 'rejection_reason', 'created_at', 'updated_at'
]);

export const TRAVEL_TRIP_COLUMNS = new Set([
    'id', 'title', 'status', 'price', 'host_id', 'host_name', 'destination', 'origin',
    'travel_date', 'departure_time', 'seats_available', 'created_at', 'updated_at'
]);

export const STAY_REQUEST_COLUMNS = new Set([
    'id', 'user_id', 'user_name', 'username', 'title', 'description',
    'budget', 'currency', 'city', 'country', 'phone', 'email',
    'status', 'is_approved', 'created_at', 'updated_at'
]);

export const JOB_COLUMNS = new Set([
    'id', '_id', 'title', 'job_title', 'company', 'company_name', 'client_name', 'clientName',
    'vendor_name', 'vendorName', 'department', 'category', 'work_style', 'workplace_type',
    'workMode', 'location', 'country', 'state', 'state_name', 'city', 'employment_type',
    'position_type', 'job_type', 'contract_duration', 'duration', 'start_date', 'startDate',
    'experience_level', 'experience', 'visa_status', 'visaStatus', 'pay_type', 'payType',
    'salary_range', 'salaryRange', 'salary_min', 'pay_min', 'salary_max', 'pay_max',
    'currency', 'currencySymbol', 'description', 'requirements', 'responsibilities',
    'benefits', 'preferred_skills', 'skills', 'recruiter_name', 'recruiterName',
    'recruiter_email', 'recruiterEmail', 'recruiter_phone', 'recruiterPhone',
    'recruiter_linkedin', 'recruiterLinkedin', 'company_linkedin', 'companyLinkedin',
    'status', 'created_at', 'updated_at'
]);

export function sanitizePayload(payload, allowedColumns) {
    if (!payload || typeof payload !== 'object') return payload;
    const clean = {};
    for (const [key, value] of Object.entries(payload)) {
        if (allowedColumns.has(key)) {
            clean[key] = value;
        }
    }
    return clean;
}

// Resilient insert helper that retries if non-existent columns are rejected by PostgREST
export async function resilientInsert(tableName, payload) {
    let currentPayload = { ...payload };
    const maxRetries = 10;
    
    for (let i = 0; i < maxRetries; i++) {
        const { data, error } = await supabase.from(tableName).insert(currentPayload).select().maybeSingle();
        if (!error) {
            return { data, error: null };
        }
        
        // Check if error is due to a missing column in PostgREST schema cache
        const colMatch = error.message?.match(/Could not find the '([^']+)' column/) ||
                         error.message?.match(/column "([^"]+)" of relation "[^"]+" does not exist/) ||
                         error.message?.match(/column '([^']+)' of relation '[^']+' does not exist/) ||
                         error.message?.match(/column ([^ ]+) does not exist/);
                         
        if (colMatch && colMatch[1] && currentPayload[colMatch[1]] !== undefined) {
            const badCol = colMatch[1];
            delete currentPayload[badCol];
            continue;
        }
        
        return { data: null, error };
    }
    return { data: null, error: new Error('Max retries exceeded during insert') };
}
