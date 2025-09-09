-- Create a more secure execute_sql function
CREATE OR REPLACE FUNCTION execute_sql(query_text TEXT, query_params JSONB DEFAULT '[]'::jsonb)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    param_count INTEGER;
    i INTEGER;
    param_value TEXT;
BEGIN
    -- Basic security check - only allow SELECT, INSERT, UPDATE, DELETE
    IF NOT (query_text ~* '^(SELECT|INSERT|UPDATE|DELETE|WITH)') THEN
        RAISE EXCEPTION 'Only SELECT, INSERT, UPDATE, DELETE queries are allowed';
    END IF;
    
    -- Get parameter count
    param_count := jsonb_array_length(query_params);
    
    -- Execute the query (this is simplified - in production you'd want more robust parameter handling)
    IF param_count = 0 THEN
        EXECUTE query_text INTO result;
    ELSE
        -- For now, we'll use a simpler approach with Supabase's built-in functions
        RAISE EXCEPTION 'Parameterized queries not supported in this simplified version';
    END IF;
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'SQL execution failed: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION execute_sql TO authenticated;

-- Ensure all tables have proper RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE passenger_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for driver_profiles table
CREATE POLICY "Drivers can view own profile" ON driver_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Drivers can update own profile" ON driver_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Drivers can insert own profile" ON driver_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for passenger_profiles table
CREATE POLICY "Passengers can view own profile" ON passenger_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Passengers can update own profile" ON passenger_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Passengers can insert own profile" ON passenger_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for rides table
CREATE POLICY "Users can view own rides" ON rides
    FOR SELECT USING (
        auth.uid() = passenger_id OR 
        auth.uid() IN (SELECT user_id FROM driver_profiles WHERE id = rides.driver_id)
    );

CREATE POLICY "Passengers can create rides" ON rides
    FOR INSERT WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "Drivers and passengers can update rides" ON rides
    FOR UPDATE USING (
        auth.uid() = passenger_id OR 
        auth.uid() IN (SELECT user_id FROM driver_profiles WHERE id = rides.driver_id)
    );

-- Create RLS policies for wallets table
CREATE POLICY "Users can view own wallet" ON wallets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet" ON wallets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet" ON wallets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for notifications table
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Fix the user_profiles view to work with RLS
DROP VIEW IF EXISTS user_profiles;
CREATE VIEW user_profiles AS
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
LEFT JOIN passenger_profiles pp ON u.id = pp.user_id AND u.role = 'passenger'
WHERE u.id = auth.uid();

-- Grant access to the view
GRANT SELECT ON user_profiles TO authenticated;
