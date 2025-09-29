-- Clear existing data (in correct order to handle foreign keys)
DELETE FROM wallet_transactions;
DELETE FROM wallets;
DELETE FROM ride_messages;
DELETE FROM ratings;
DELETE FROM payments;
DELETE FROM rides;
DELETE FROM vehicles;
DELETE FROM uploaded_files;
DELETE FROM sessions;
DELETE FROM notifications;
DELETE FROM passenger_profiles;
DELETE FROM driver_profiles;
DELETE FROM users;

-- Insert demo users with hashed passwords
-- Note: These are bcrypt hashes for the passwords: admin123, driver123, passenger123
INSERT INTO users (id, email, password, full_name, phone, role, is_verified, is_active, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@muf.com', '$2a$12$LQv3c1yqBw2fyuDjaneOm.vyEtg2TTRDdHT/NjHuO6I/.k3k0Uadu', 'Admin User', '+2348012345678', 'admin', true, true, '1985-01-15', 'male', 'Victoria Island, Lagos', 'Jane Admin', '+2348012345679'),
('550e8400-e29b-41d4-a716-446655440002', 'driver@muf.com', '$2a$12$LQv3c1yqBw2fyuDjaneOm.vyEtg2TTRDdHT/NjHuO6I/.k3k0Uadu', 'John Smith', '+2348012345680', 'driver', true, true, '1990-03-20', 'male', 'Ikeja, Lagos', 'Mary Smith', '+2348012345681'),
('550e8400-e29b-41d4-a716-446655440003', 'driver2@muf.com', '$2a$12$LQv3c1yqBw2fyuDjaneOm.vyEtg2TTRDdHT/NjHuO6I/.k3k0Uadu', 'Mike Johnson', '+2348012345682', 'driver', true, true, '1988-07-10', 'male', 'Surulere, Lagos', 'Lisa Johnson', '+2348012345683'),
('550e8400-e29b-41d4-a716-446655440004', 'driver3@muf.com', '$2a$12$LQv3c1yqBw2fyuDjaneOm.vyEtg2TTRDdHT/NjHuO6I/.k3k0Uadu', 'David Wilson', '+2348012345684', 'driver', true, true, '1992-11-05', 'male', 'Yaba, Lagos', 'Sarah Wilson', '+2348012345685'),
('550e8400-e29b-41d4-a716-446655440005', 'passenger@muf.com', '$2a$12$LQv3c1yqBw2fyuDjaneOm.vyEtg2TTRDdHT/NjHuO6I/.k3k0Uadu', 'Alice Brown', '+2348012345686', 'passenger', true, true, '1995-05-25', 'female', 'Lekki, Lagos', 'Bob Brown', '+2348012345687'),
('550e8400-e29b-41d4-a716-446655440006', 'user2@muf.com', '$2a$12$LQv3c1yqBw2fyuDjaneOm.vyEtg2TTRDdHT/NjHuO6I/.k3k0Uadu', 'Bob Davis', '+2348012345688', 'passenger', true, true, '1993-09-12', 'male', 'Ajah, Lagos', 'Carol Davis', '+2348012345689'),
('550e8400-e29b-41d4-a716-446655440007', 'emma@muf.com', '$2a$12$LQv3c1yqBw2fyuDjaneOm.vyEtg2TTRDdHT/NjHuO6I/.k3k0Uadu', 'Emma Thompson', '+2348012345690', 'passenger', true, true, '1991-12-08', 'female', 'Ikoyi, Lagos', 'James Thompson', '+2348012345691');

-- Insert driver profiles
INSERT INTO driver_profiles (id, user_id, license_number, license_expiry, is_online, status, current_location_lat, current_location_lng, rating, total_rides, total_earnings, bio, years_experience, languages, bank_account_number, bank_name) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'LIC001234567', '2025-12-31', true, 'online', 6.5244, 3.3792, 4.8, 150, 75000.00, 'Experienced driver with 5 years of safe driving', 5, ARRAY['English', 'Yoruba', 'Hausa'], '1234567890', 'First Bank'),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'LIC001234568', '2025-11-30', true, 'online', 6.4581, 3.3947, 4.6, 200, 45000.00, 'Friendly keke driver, knows Lagos very well', 3, ARRAY['English', 'Yoruba'], '1234567891', 'GTBank'),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'LIC001234569', '2025-10-31', false, 'offline', 6.6018, 3.3515, 4.9, 300, 60000.00, 'Professional bike rider, fast and reliable', 7, ARRAY['English', 'Igbo'], '1234567892', 'Access Bank');

-- Insert passenger profiles
INSERT INTO passenger_profiles (id, user_id, preferred_payment_method) VALUES
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'card'),
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', 'wallet'),
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440007', 'card');

-- Insert vehicles
INSERT INTO vehicles (id, driver_profile_id, vehicle_type, make, model, year, color, plate_number, is_active, insurance_expiry, last_maintenance) VALUES
('850e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'car', 'Toyota', 'Corolla', 2020, 'Silver', 'LAG-123-AB', true, '2024-12-31', '2024-01-15'),
('850e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'keke', 'Bajaj', 'RE Compact', 2021, 'Yellow', 'LAG-456-CD', true, '2024-11-30', '2024-02-10'),
('850e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', 'bike', 'Honda', 'CB150R', 2022, 'Red', 'LAG-789-EF', true, '2024-10-31', '2024-03-05');

-- Insert wallets
INSERT INTO wallets (id, user_id, balance, is_active) VALUES
('950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 50000.00, true),
('950e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 25000.00, true),
('950e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 15000.00, true),
('950e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 30000.00, true),
('950e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 5000.00, true),
('950e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', 8000.00, true),
('950e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', 12000.00, true);

-- Insert sample rides
INSERT INTO rides (id, passenger_id, driver_profile_id, vehicle_id, ride_type, vehicle_type, pickup_address, pickup_latitude, pickup_longitude, destination_address, destination_latitude, destination_longitude, distance_km, estimated_duration_minutes, actual_duration_minutes, fare_amount, status, accepted_at, started_at, completed_at, special_instructions) VALUES
('a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'private', 'car', 'Victoria Island, Lagos', 6.4281, 3.4219, 'Ikeja, Lagos', 6.6018, 3.3515, 15.5, 35, 32, 2500.00, 'completed', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 45 minutes', NOW() - INTERVAL '1 hour 13 minutes', 'Please call when you arrive'),
('a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440002', 'private', 'keke', 'Surulere, Lagos', 6.4969, 3.3481, 'Yaba, Lagos', 6.5158, 3.3696, 5.2, 15, NULL, 800.00, 'in_progress', NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '20 minutes', NULL, NULL),
('a50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440007', NULL, NULL, 'private', 'bike', 'Lekki Phase 1, Lagos', 6.4474, 3.4647, 'Ajah, Lagos', 6.4698, 3.5648, 8.3, 20, NULL, 1200.00, 'pending', NULL, NULL, NULL, 'Need helmet'),
('a50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'private', 'car', 'Ikoyi, Lagos', 6.4474, 3.4219, 'Lekki, Lagos', 6.4474, 3.4647, 12.0, 25, 28, 2000.00, 'completed', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days' + INTERVAL '5 minutes', NOW() - INTERVAL '3 days' + INTERVAL '33 minutes', NULL);

-- Insert payments
INSERT INTO payments (id, ride_id, passenger_id, driver_profile_id, amount, driver_amount, platform_fee, payment_method, payment_status, transaction_id, processed_at) VALUES
('b50e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440001', 2500.00, 2125.00, 375.00, 'wallet', 'completed', 'TXN001234567', NOW() - INTERVAL '1 hour 13 minutes'),
('b50e8400-e29b-41d4-a716-446655440002', 'a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440002', 800.00, 680.00, 120.00, 'cash', 'pending', NULL, NULL),
('b50e8400-e29b-41d4-a716-446655440003', 'a50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440001', 2000.00, 1700.00, 300.00, 'card', 'completed', 'TXN001234568', NOW() - INTERVAL '3 days' + INTERVAL '33 minutes');

-- Insert ratings
INSERT INTO ratings (id, ride_id, rater_id, rated_id, rating, comment, rating_type, is_anonymous) VALUES
('c50e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 5, 'Excellent driver, very professional and punctual!', 'passenger_to_driver', false),
('c50e8400-e29b-41d4-a716-446655440002', 'a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 4, 'Good passenger, on time and respectful.', 'driver_to_passenger', false),
('c50e8400-e29b-41d4-a716-446655440003', 'a50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', '550  'a50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 5, 'Great ride, smooth and comfortable car!', 'passenger_to_driver', false);

-- Insert wallet transactions
INSERT INTO wallet_transactions (id, wallet_id, amount, transaction_type, description, reference_id, reference_type, balance_before, balance_after) VALUES
('d50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440005', 10000.00, 'credit', 'Wallet top-up via bank transfer', NULL, 'top_up', 0.00, 10000.00),
('d50e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440005', 2500.00, 'debit', 'Payment for ride to Ikeja', 'a50e8400-e29b-41d4-a716-446655440001', 'ride_payment', 10000.00, 7500.00),
('d50e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440005', 2000.00, 'debit', 'Payment for ride to Lekki', 'a50e8400-e29b-41d4-a716-446655440004', 'ride_payment', 7500.00, 5500.00),
('d50e8400-e29b-41d4-a716-446655440004', '950e8400-e29b-41d4-a716-446655440002', 2125.00, 'credit', 'Earnings from completed ride (85% of ₦2500)', 'a50e8400-e29b-41d4-a716-446655440001', 'ride_earnings', 22875.00, 25000.00),
('d50e8400-e29b-41d4-a716-446655440005', '950e8400-e29b-41d4-a716-446655440002', 1700.00, 'credit', 'Earnings from completed ride (85% of ₦2000)', 'a50e8400-e29b-41d4-a716-446655440004', 'ride_earnings', 23300.00, 25000.00),
('d50e8400-e29b-41d4-a716-446655440006', '950e8400-e29b-41d4-a716-446655440006', 5000.00, 'credit', 'Welcome bonus for new user', NULL, 'bonus', 3000.00, 8000.00);

-- Insert notifications
INSERT INTO notifications (id, user_id, title, message, type, data, is_read) VALUES
('e50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'Ride Completed', 'Your ride to Ikeja has been completed successfully. Thank you for using Muf!', 'ride_update', '{"ride_id": "a50e8400-e29b-41d4-a716-446655440001", "fare": 2500.00}', true),
('e50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'New Ride Request', 'You have a new ride request from Surulere to Yaba. Tap to accept.', 'ride_update', '{"ride_id": "a50e8400-e29b-41d4-a716-446655440002", "pickup": "Surulere, Lagos"}', false),
('e50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', 'Driver Assigned', 'Mike Johnson has accepted your ride request. He will arrive in 5 minutes.', 'ride_update', '{"ride_id": "a50e8400-e29b-41d4-a716-446655440002", "driver_name": "Mike Johnson"}', false),
('e50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440007', 'Welcome to Muf!', 'Welcome to Muf ride-sharing platform. Your account has been created successfully.', 'system', '{"user_type": "passenger"}', false),
('e50e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Earnings Update', 'You have earned ₦2,125 from your recent ride. Keep up the great work!', 'payment', '{"amount": 2125.00, "ride_id": "a50e8400-e29b-41d4-a716-446655440001"}', false);

-- Insert ride messages
INSERT INTO ride_messages (id, ride_id, sender_id, message, is_read) VALUES
('f50e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'I am waiting at the main entrance', true),
('f50e8400-e29b-41d4-a716-446655440002', 'a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'I can see you, coming to pick you up now', true),
('f50e8400-e29b-41d4-a716-446655440003', 'a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'On my way, will be there in 3 minutes', false),
('f50e8400-e29b-41d4-a716-446655440004', 'a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', 'Thank you, I will be waiting', false);

-- Update health check
UPDATE health_check SET status = 'ok', details = '{"message": "Database seeded successfully with demo data", "users_count": 7, "rides_count": 4, "timestamp": "' || NOW() || '"}' WHERE id = 1;
