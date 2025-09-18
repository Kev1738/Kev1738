-- Drop all existing tables and recreate with proper relationships
-- This ensures a clean slate with proper foreign key constraints

-- Drop existing tables in correct order (reverse dependency order)
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS rides CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS driver_profiles CASCADE;
DROP TABLE IF EXISTS passenger_profiles CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS uploaded_files CASCADE;
DROP TABLE IF EXISTS health_check CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop sequences if they exist
DROP SEQUENCE IF EXISTS health_check_id_seq CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =============================================
-- CORE USER MANAGEMENT TABLES
-- =============================================

-- Users table (central table for all user types)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL DEFAULT 'passenger' CHECK (role IN ('passenger', 'driver', 'admin')),
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    profile_image_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table for authentication
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PROFILE TABLES (ROLE-SPECIFIC)
-- =============================================

-- Driver profiles (extends users for drivers)
CREATE TABLE driver_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    license_number VARCHAR(50) UNIQUE,
    license_expiry DATE,
    is_online BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('offline', 'online', 'busy', 'break')),
    current_location_lat DECIMAL(10, 8),
    current_location_lng DECIMAL(11, 8),
    rating DECIMAL(3, 2) DEFAULT 5.00 CHECK (rating >= 0 AND rating <= 5),
    total_rides INTEGER DEFAULT 0,
    total_earnings DECIMAL(12, 2) DEFAULT 0.00,
    bio TEXT,
    years_experience INTEGER DEFAULT 0,
    languages TEXT[], -- Array of languages spoken
    bank_account_number VARCHAR(20),
    bank_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Passenger profiles (extends users for passengers)
CREATE TABLE passenger_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    preferred_payment_method VARCHAR(20) DEFAULT 'card' CHECK (preferred_payment_method IN ('card', 'wallet', 'cash')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- VEHICLE MANAGEMENT
-- =============================================

-- Vehicles table (properly linked to driver_profiles)
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_profile_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('car', 'keke', 'bike')),
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1990 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
    color VARCHAR(30) NOT NULL,
    plate_number VARCHAR(20) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    insurance_expiry DATE,
    last_maintenance DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- RIDE MANAGEMENT
-- =============================================

-- Rides table (central to the ride-sharing system)
CREATE TABLE rides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    passenger_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    driver_profile_id UUID REFERENCES driver_profiles(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    ride_type VARCHAR(20) DEFAULT 'private' CHECK (ride_type IN ('shared', 'private')),
    vehicle_type VARCHAR(20) NOT NULL CHECK (vehicle_type IN ('car', 'keke', 'bike')),
    
    -- Pickup information
    pickup_address TEXT NOT NULL,
    pickup_latitude DECIMAL(10, 8),
    pickup_longitude DECIMAL(11, 8),
    
    -- Destination information
    destination_address TEXT NOT NULL,
    destination_latitude DECIMAL(10, 8),
    destination_longitude DECIMAL(11, 8),
    
    -- Trip details
    distance_km DECIMAL(8, 2),
    estimated_duration_minutes INTEGER,
    actual_duration_minutes INTEGER,
    fare_amount DECIMAL(10, 2) NOT NULL,
    
    -- Status and timing
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'driver_arrived', 'in_progress', 'completed', 'cancelled')),
    scheduled_time TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    driver_arrived_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    
    -- Special instructions
    special_instructions TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PAYMENT SYSTEM
-- =============================================

-- Wallets table (user financial accounts)
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    balance DECIMAL(12, 2) DEFAULT 0.00 CHECK (balance >= 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallet transactions (all wallet activities)
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
    description TEXT NOT NULL,
    reference_id UUID, -- Can reference rides, payments, etc.
    reference_type VARCHAR(50), -- 'ride', 'topup', 'withdrawal', etc.
    balance_before DECIMAL(12, 2) NOT NULL,
    balance_after DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table (ride payments and other transactions)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
    passenger_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    driver_profile_id UUID REFERENCES driver_profiles(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    driver_amount DECIMAL(10, 2), -- Amount driver receives (after commission)
    platform_fee DECIMAL(10, 2) DEFAULT 0.00,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('card', 'wallet', 'cash', 'bank_transfer')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
    transaction_id VARCHAR(100),
    gateway_response JSONB, -- Store payment gateway response
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- RATING SYSTEM
-- =============================================

-- Ratings table (bidirectional rating system)
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    rater_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rated_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    rating_type VARCHAR(30) NOT NULL CHECK (rating_type IN ('passenger_to_driver', 'driver_to_passenger')),
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one rating per person per ride per type
    UNIQUE(ride_id, rater_id, rating_type)
);

-- =============================================
-- COMMUNICATION SYSTEM
-- =============================================

-- Notifications table (system notifications)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'ride_update', 'payment', 'system')),
    data JSONB, -- Additional structured data
    is_read BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- FILE MANAGEMENT
-- =============================================

-- Uploaded files table (profile images, documents, etc.)
CREATE TABLE uploaded_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    upload_purpose VARCHAR(100) NOT NULL, -- 'profile_image', 'license', 'vehicle_photo', etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SYSTEM MONITORING
-- =============================================

-- Health check table (system monitoring)
CREATE TABLE health_check (
    id SERIAL PRIMARY KEY,
    status VARCHAR(20) DEFAULT 'ok',
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    details JSONB
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Driver profile indexes
CREATE INDEX idx_driver_profiles_user_id ON driver_profiles(user_id);
CREATE INDEX idx_driver_profiles_online ON driver_profiles(is_online);
CREATE INDEX idx_driver_profiles_status ON driver_profiles(status);
CREATE INDEX idx_driver_profiles_location ON driver_profiles(current_location_lat, current_location_lng);

-- Vehicle indexes
CREATE INDEX idx_vehicles_driver_profile_id ON vehicles(driver_profile_id);
CREATE INDEX idx_vehicles_type ON vehicles(vehicle_type);
CREATE INDEX idx_vehicles_active ON vehicles(is_active);

-- Ride indexes
CREATE INDEX idx_rides_passenger_id ON rides(passenger_id);
CREATE INDEX idx_rides_driver_profile_id ON rides(driver_profile_id);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_created_at ON rides(created_at);
CREATE INDEX idx_rides_pickup_location ON rides(pickup_latitude, pickup_longitude);

-- Payment indexes
CREATE INDEX idx_payments_ride_id ON payments(ride_id);
CREATE INDEX idx_payments_passenger_id ON payments(passenger_id);
CREATE INDEX idx_payments_status ON payments(payment_status);

-- Wallet indexes
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_created_at ON wallet_transactions(created_at);

-- Rating indexes
CREATE INDEX idx_ratings_ride_id ON ratings(ride_id);
CREATE INDEX idx_ratings_rated_id ON ratings(rated_id);

-- Notification indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_driver_profiles_updated_at BEFORE UPDATE ON driver_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_passenger_profiles_updated_at BEFORE UPDATE ON passenger_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON rides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_uploaded_files_updated_at BEFORE UPDATE ON uploaded_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE passenger_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized based on requirements)
-- Allow service role to access all data
CREATE POLICY "Service role can access all users" ON users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all driver_profiles" ON driver_profiles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all passenger_profiles" ON passenger_profiles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all vehicles" ON vehicles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all rides" ON rides FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all payments" ON payments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all ratings" ON ratings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all wallets" ON wallets FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all wallet_transactions" ON wallet_transactions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all notifications" ON notifications FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can access all uploaded_files" ON uploaded_files FOR ALL USING (auth.role() = 'service_role');

-- Users can view their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

COMMENT ON TABLE users IS 'Central user table for all user types (passengers, drivers, admins)';
COMMENT ON TABLE driver_profiles IS 'Extended profile information for drivers';
COMMENT ON TABLE passenger_profiles IS 'Extended profile information for passengers';
COMMENT ON TABLE vehicles IS 'Vehicle information linked to driver profiles';
COMMENT ON TABLE rides IS 'Central ride management table';
COMMENT ON TABLE payments IS 'Payment transactions for rides and other services';
COMMENT ON TABLE wallets IS 'User wallet accounts for in-app payments';
COMMENT ON TABLE wallet_transactions IS 'All wallet transaction history';
COMMENT ON TABLE ratings IS 'Bidirectional rating system between passengers and drivers';
COMMENT ON TABLE notifications IS 'System notifications for users';
COMMENT ON TABLE uploaded_files IS 'File storage metadata for user uploads';
