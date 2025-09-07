-- Insert sample users
INSERT INTO users (id, email, password_hash, full_name, phone, role) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@rideshare.com', '$2b$10$hash1', 'Admin User', '+1234567890', 'admin'),
('550e8400-e29b-41d4-a716-446655440002', 'driver1@driver.com', '$2b$10$hash2', 'John Smith', '+1234567891', 'driver'),
('550e8400-e29b-41d4-a716-446655440003', 'driver2@driver.com', '$2b$10$hash3', 'Sarah Wilson', '+1234567892', 'driver'),
('550e8400-e29b-41d4-a716-446655440004', 'driver3@driver.com', '$2b$10$hash4', 'Mike Johnson', '+1234567893', 'driver'),
('550e8400-e29b-41d4-a716-446655440005', 'user1@example.com', '$2b$10$hash5', 'Alice Brown', '+1234567894', 'passenger'),
('550e8400-e29b-41d4-a716-446655440006', 'user2@example.com', '$2b$10$hash6', 'Bob Davis', '+1234567895', 'passenger');

-- Insert driver profiles
INSERT INTO driver_profiles (id, user_id, license_number, license_expiry, is_online, rating, total_rides) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'DL123456789', '2025-12-31', true, 4.8, 156),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'DL987654321', '2025-11-30', true, 4.9, 234),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'DL456789123', '2025-10-15', false, 4.6, 89);

-- Insert vehicles with different types
INSERT INTO vehicles (driver_id, vehicle_type, make, model, year, color, plate_number) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'car', 'Toyota', 'Camry', 2020, 'Blue', 'ABC-123'),
('660e8400-e29b-41d4-a716-446655440002', 'keke', 'Bajaj', 'RE Compact', 2021, 'Yellow', 'KEK-456'),
('660e8400-e29b-41d4-a716-446655440003', 'bike', 'Honda', 'CBR150R', 2022, 'Red', 'BIK-789');

-- Insert wallets for all users
INSERT INTO wallets (user_id, balance) VALUES
('550e8400-e29b-41d4-a716-446655440001', 0.00),
('550e8400-e29b-41d4-a716-446655440002', 150.75),
('550e8400-e29b-41d4-a716-446655440003', 89.50),
('550e8400-e29b-41d4-a716-446655440004', 234.25),
('550e8400-e29b-41d4-a716-446655440005', 45.20),
('550e8400-e29b-41d4-a716-446655440006', 78.90);

-- Insert sample rides
INSERT INTO rides (passenger_id, driver_id, vehicle_id, ride_type, vehicle_type, pickup_address, pickup_latitude, pickup_longitude, destination_address, destination_latitude, destination_longitude, fare_amount, status) VALUES
('550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', (SELECT id FROM vehicles WHERE plate_number = 'ABC-123'), 'private', 'car', '123 Main St, Downtown', 40.7128, -74.0060, '456 Oak Ave, Uptown', 40.7589, -73.9851, 24.50, 'completed'),
('550e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', (SELECT id FROM vehicles WHERE plate_number = 'KEK-456'), 'shared', 'keke', '789 Pine St, Midtown', 40.7505, -73.9934, '321 Elm St, Westside', 40.7282, -74.0776, 12.75, 'completed');
