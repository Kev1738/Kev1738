-- Complete database setup with all required tables and demo data
-- This script ensures all tables exist and are properly configured

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS rides CASCADE;
DROP TABLE IF EXISTS driver_profiles CASCADE;
DROP TABLE IF EXISTS passenger_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('passenger', 'driver', 'admin')),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    profile_image_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create passenger_profiles table
CREATE TABLE passenger_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferred_payment_method VARCHAR(50) DEFAULT 'card',
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create driver_profiles table
CREATE TABLE driver_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100),
    license_expiry DATE,
    vehicle_make VARCHAR(100),
    vehicle_model VARCHAR(100),
    vehicle_year INTEGER,
    vehicle_color VARCHAR(50),
    vehicle_plate VARCHAR(20),
    is_online BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('offline', 'online', 'busy', 'break')),
    current_location_lat DECIMAL(10, 8),
    current_location_lng DECIMAL(11, 8),
    rating DECIMAL(3, 2) DEFAULT 5.0,
    total_rides INTEGER DEFAULT 0,
    total_earnings DECIMAL(10, 2) DEFAULT 0.00,
    bio TEXT,
    years_experience INTEGER,
    languages TEXT[],
    vehicle_description TEXT,
    bank_account_number VARCHAR(50),
    bank_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rides table
CREATE TABLE rides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    passenger_id UUID NOT NULL REFERENCES users(id),
    driver_id UUID REFERENCES users(id),
    vehicle_id UUID,
    ride_type VARCHAR(20) DEFAULT 'private' CHECK (ride_type IN ('shared', 'private')),
    vehicle_type VARCHAR(20) DEFAULT 'car' CHECK (vehicle_type IN ('car', 'keke', 'bike')),
    pickup_address TEXT NOT NULL,
    pickup_latitude DECIMAL(10, 8),
    pickup_longitude DECIMAL(11, 8),
    destination_address TEXT NOT NULL,
    destination_latitude DECIMAL(10, 8),
    destination_longitude DECIMAL(11, 8),
    distance_km DECIMAL(8, 2),
    estimated_duration_minutes INTEGER,
    fare_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'driver_arrived', 'in_progress', 'completed', 'cancelled')),
    scheduled_time TIMESTAMP WITH TIME ZONE,
    accepted_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wallets table
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_driver_profiles_user_id ON driver_profiles(user_id);
CREATE INDEX idx_driver_profiles_status ON driver_profiles(status);
CREATE INDEX idx_passenger_profiles_user_id ON passenger_profiles(user_id);
CREATE INDEX idx_rides_passenger_id ON rides(passenger_id);
CREATE INDEX idx_rides_driver_id ON rides(driver_id);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Insert demo users with MD5 hashed passwords (password: 123456)
INSERT INTO users (id, email, password, full_name, phone, role, is_verified, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@rideshare.com', 'e10adc3949ba59abbe56e057f20f883e', 'Admin User', '+1234567890', 'admin', true, true),
('550e8400-e29b-41d4-a716-446655440002', 'driver@driver.com', 'e10adc3949ba59abbe56e057f20f883e', 'John Driver', '+1234567891', 'driver', true, true),
('550e8400-e29b-41d4-a716-446655440003', 'user@example.com', 'e10adc3949ba59abbe56e057f20f883e', 'Jane Passenger', '+1234567892', 'passenger', true, true),
('550e8400-e29b-41d4-a716-446655440004', 'driver2@example.com', 'e10adc3949ba59abbe56e057f20f883e', 'Mike Driver', '+1234567893', 'driver', true, true),
('550e8400-e29b-41d4-a716-446655440005', 'passenger2@example.com', 'e10adc3949ba59abbe56e057f20f883e', 'Sarah Passenger', '+1234567894', 'passenger', true, true);

-- Insert driver profiles
INSERT INTO driver_profiles (user_id, license_number, vehicle_make, vehicle_model, vehicle_year, vehicle_color, vehicle_plate, status, rating, total_rides, total_earnings) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'DL123456789', 'Toyota', 'Camry', 2020, 'Blue', 'ABC123', 'offline', 4.8, 150, 2500.00),
('550e8400-e29b-41d4-a716-446655440004', 'DL987654321', 'Honda', 'Civic', 2019, 'White', 'XYZ789', 'offline', 4.9, 200, 3200.00);

-- Insert passenger profiles
INSERT INTO passenger_profiles (user_id, preferred_payment_method) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'card'),
('550e8400-e29b-41d4-a716-446655440005', 'wallet');

-- Insert wallets for all users
INSERT INTO wallets (user_id, balance) VALUES
('550e8400-e29b-41d4-a716-446655440001', 1000.00),
('550e8400-e29b-41d4-a716-446655440002', 500.00),
('550e8400-e29b-41d4-a716-446655440003', 250.00),
('550e8400-e29b-41d4-a716-446655440004', 750.00),
('550e8400-e29b-41d4-a716-446655440005', 100.00);

-- Insert sample rides
INSERT INTO rides (passenger_id, driver_id, pickup_address, destination_address, fare_amount, status) VALUES
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '123 Main St, City', '456 Oak Ave, City', 25.50, 'completed'),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', '789 Pine St, City', '321 Elm St, City', 18.75, 'completed'),
('550e8400-e29b-41d4-a716-446655440003', NULL, '555 Broadway, City', '777 Park Ave, City', 32.00, 'pending');

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'Welcome!', 'Welcome to RideShare! Your driver account is now active.', 'success'),
('550e8400-e29b-41d4-a716-446655440003', 'Ride Completed', 'Your ride to 456 Oak Ave has been completed. Thank you for using RideShare!', 'info'),
('550e8400-e29b-41d4-a716-446655440004', 'New Ride Request', 'You have a new ride request nearby. Check your dashboard!', 'info');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_driver_profiles_updated_at BEFORE UPDATE ON driver_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_passenger_profiles_updated_at BEFORE UPDATE ON passenger_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON rides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a health check table for connection testing
CREATE TABLE IF NOT EXISTS health_check (
    id SERIAL PRIMARY KEY,
    status VARCHAR(10) DEFAULT 'ok',
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO health_check (status) VALUES ('ok');

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

COMMIT;
