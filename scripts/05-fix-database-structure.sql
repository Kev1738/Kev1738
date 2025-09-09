-- Create execute_sql function for raw SQL queries
CREATE OR REPLACE FUNCTION execute_sql(query_text TEXT, query_params TEXT[] DEFAULT '{}')
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSON;
BEGIN
    -- This is a simplified version - in production you'd want more security
    EXECUTE query_text USING query_params INTO result;
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'SQL execution failed: %', SQLERRM;
END;
$$;

-- Fix driver_profiles table structure
ALTER TABLE driver_profiles 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy'));

-- Ensure all required columns exist in users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender VARCHAR(20),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20);

-- Create passenger_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS passenger_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferred_payment_method VARCHAR(20) DEFAULT 'card',
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_passenger_profiles_user_id ON passenger_profiles(user_id);

-- Update existing driver profiles to have default status
UPDATE driver_profiles SET status = 'offline' WHERE status IS NULL;

-- Create a view for complete user profiles
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
    u.*,
    CASE 
        WHEN u.role = 'driver' THEN json_build_object(
            'id', dp.id,
            'license_number', dp.license_number,
            'license_expiry', dp.license_expiry,
            'is_online', dp.is_online,
            'status', dp.status,
            'rating', dp.rating,
            'total_rides', dp.total_rides,
            'total_earnings', dp.total_earnings,
            'bio', dp.bio,
            'years_experience', dp.years_experience,
            'languages', dp.languages,
            'vehicle_description', dp.vehicle_description,
            'bank_account_number', dp.bank_account_number,
            'bank_name', dp.bank_name
        )
        WHEN u.role = 'passenger' THEN json_build_object(
            'id', pp.id,
            'preferred_payment_method', pp.preferred_payment_method,
            'emergency_contact_name', pp.emergency_contact_name,
            'emergency_contact_phone', pp.emergency_contact_phone
        )
        ELSE NULL
    END as role_profile
FROM users u
LEFT JOIN driver_profiles dp ON u.id = dp.user_id AND u.role = 'driver'
LEFT JOIN passenger_profiles pp ON u.id = pp.user_id AND u.role = 'passenger';
