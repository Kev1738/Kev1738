-- Comprehensive seed data for Uber clone system
-- This script populates the database with realistic test data

-- Clear existing data (in correct order to avoid foreign key constraints)
DELETE FROM ratings;
DELETE FROM wallet_transactions;
DELETE FROM payments;
DELETE FROM rides;
DELETE FROM vehicles;
DELETE FROM notifications;
DELETE FROM uploaded_files;
DELETE FROM sessions;
DELETE FROM wallets;
DELETE FROM passenger_profiles;
DELETE FROM driver_profiles;
DELETE FROM users;
DELETE FROM health_check;

-- Reset sequences
ALTER SEQUENCE health_check_id_seq RESTART WITH 1;

-- =============================================
-- USERS (Admin, Drivers, Passengers)
-- =============================================

-- Admin Users
INSERT INTO users (id, email, password, full_name, phone, role, is_verified, is_active, address, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@uberclone.com', '5d41402abc4b2a76b9719d911017c592', 'System Administrator', '+2348012345678', 'admin', true, true, 'Lagos, Nigeria', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'support@uberclone.com', '5d41402abc4b2a76b9719d911017c592', 'Support Manager', '+2348012345679', 'admin', true, true, 'Abuja, Nigeria', NOW(), NOW());

-- Driver Users
INSERT INTO users (id, email, password, full_name, phone, role, is_verified, is_active, profile_image_url, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'john.driver@email.com', '5d41402abc4b2a76b9719d911017c592', 'John Adebayo', '+2348123456789', 'driver', true, true, '/placeholder.svg?height=100&width=100', '1985-03-15', 'male', '15 Victoria Island, Lagos, Nigeria', 'Mary Adebayo', '+2348123456790', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440011', 'sarah.driver@email.com', '5d41402abc4b2a76b9719d911017c592', 'Sarah Okafor', '+2348123456791', 'driver', true, true, '/placeholder.svg?height=100&width=100', '1990-07-22', 'female', '23 Ikeja GRA, Lagos, Nigeria', 'Peter Okafor', '+2348123456792', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'mike.driver@email.com', '5d41402abc4b2a76b9719d911017c592', 'Michael Emeka', '+2348123456793', 'driver', true, true, '/placeholder.svg?height=100&width=100', '1988-11-08', 'male', '45 Surulere, Lagos, Nigeria', 'Grace Emeka', '+2348123456794', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', 'fatima.driver@email.com', '5d41402abc4b2a76b9719d911017c592', 'Fatima Abdullahi', '+2348123456795', 'driver', true, true, '/placeholder.svg?height=100&width=100', '1992-01-30', 'female', '12 Wuse 2, Abuja, Nigeria', 'Ahmed Abdullahi', '+2348123456796', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', 'david.driver@email.com', '5d41402abc4b2a76b9719d911017c592', 'David Okonkwo', '+2348123456797', 'driver', true, true, '/placeholder.svg?height=100&width=100', '1987-05-12', 'male', '8 New Haven, Enugu, Nigeria', 'Chioma Okonkwo', '+2348123456798', NOW(), NOW());

-- Passenger Users
INSERT INTO users (id, email, password, full_name, phone, role, is_verified, is_active, profile_image_url, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'alice.passenger@email.com', '5d41402abc4b2a76b9719d911017c592', 'Alice Johnson', '+2348234567890', 'passenger', true, true, '/placeholder.svg?height=100&width=100', '1995-06-18', 'female', '10 Lekki Phase 1, Lagos, Nigeria', 'Bob Johnson', '+2348234567891', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440021', 'bob.passenger@email.com', '5d41402abc4b2a76b9719d911017c592', 'Bob Williams', '+2348234567892', 'passenger', true, true, '/placeholder.svg?height=100&width=100', '1993-09-25', 'male', '25 Ikoyi, Lagos, Nigeria', 'Alice Johnson', '+2348234567890', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440022', 'carol.passenger@email.com', '5d41402abc4b2a76b9719d911017c592', 'Carol Brown', '+2348234567893', 'passenger', true, true, '/placeholder.svg?height=100&width=100', '1997-12-03', 'female', '5 Gbagada, Lagos, Nigeria', 'David Brown', '+2348234567894', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440023', 'daniel.passenger@email.com', '5d41402abc4b2a76b9719d911017c592', 'Daniel Davis', '+2348234567895', 'passenger', true, true, '/placeholder.svg?height=100&width=100', '1991-04-14', 'male', '18 Yaba, Lagos, Nigeria', 'Emma Davis', '+2348234567896', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440024', 'emma.passenger@email.com', '5d41402abc4b2a76b9719d911017c592', 'Emma Wilson', '+2348234567897', 'passenger', true, true, '/placeholder.svg?height=100&width=100', '1994-08-27', 'female', '30 Ajah, Lagos, Nigeria', 'Daniel Davis', '+2348234567895', NOW(), NOW());

-- =============================================
-- DRIVER PROFILES
-- =============================================

INSERT INTO driver_profiles (id, user_id, license_number, license_expiry, is_online, status, current_location_lat, current_location_lng, rating, total_rides, total_earnings, bio, years_experience, languages, bank_account_number, bank_name, created_at, updated_at) VALUES
('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', 'LG123456789', '2026-03-15', true, 'online', 6.5244, 3.3792, 4.8, 245, 487500.00, 'Experienced driver with 8 years on Lagos roads. Safe and reliable service.', 8, ARRAY['English', 'Yoruba', 'Igbo'], '1234567890', 'First Bank', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440011', 'LG123456790', '2025-07-22', true, 'online', 6.6018, 3.3515, 4.9, 189, 378000.00, 'Professional female driver. Specializing in safe rides for families and professionals.', 5, ARRAY['English', 'Yoruba'], '1234567891', 'GTBank', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440012', 'LG123456791', '2025-11-08', false, 'offline', 6.5027, 3.3707, 4.7, 312, 624000.00, 'Friendly and punctual driver. Know all Lagos shortcuts!', 6, ARRAY['English', 'Igbo'], '1234567892', 'UBA', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440013', 'AB123456792', '2026-01-30', true, 'online', 9.0579, 7.4951, 4.6, 156, 312000.00, 'Reliable driver in Abuja. Always on time and courteous.', 4, ARRAY['English', 'Hausa'], '1234567893', 'Zenith Bank', NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440014', 'EN123456793', '2025-05-12', true, 'busy', 6.8437, 7.3986, 4.5, 98, 196000.00, 'New to the platform but experienced driver. Serving Enugu and environs.', 3, ARRAY['English', 'Igbo'], '1234567894', 'Access Bank', NOW(), NOW());

-- =============================================
-- PASSENGER PROFILES
-- =============================================

INSERT INTO passenger_profiles (id, user_id, preferred_payment_method, created_at, updated_at) VALUES
('750e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440020', 'card', NOW(), NOW()),
('750e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440021', 'wallet', NOW(), NOW()),
('750e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440022', 'card', NOW(), NOW()),
('750e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440023', 'cash', NOW(), NOW()),
('750e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440024', 'wallet', NOW(), NOW());

-- =============================================
-- VEHICLES
-- =============================================

INSERT INTO vehicles (id, driver_profile_id, vehicle_type, make, model, year, color, plate_number, is_active, insurance_expiry, last_maintenance, created_at, updated_at) VALUES
('850e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440010', 'car', 'Toyota', 'Camry', 2020, 'Silver', 'LG-123-ABC', true, '2024-12-31', '2024-01-15', NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440011', 'car', 'Honda', 'Accord', 2019, 'Black', 'LG-456-DEF', true, '2024-11-30', '2024-02-10', NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440012', 'keke', 'Bajaj', 'RE Compact', 2021, 'Yellow', 'LG-789-GHI', true, '2024-10-31', '2024-01-20', NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440013', 'car', 'Hyundai', 'Elantra', 2018, 'White', 'AB-321-JKL', true, '2024-09-30', '2024-02-05', NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440014', 'bike', 'Honda', 'CB150R', 2022, 'Red', 'EN-654-MNO', true, '2024-08-31', '2024-01-25', NOW(), NOW());

-- =============================================
-- WALLETS
-- =============================================

INSERT INTO wallets (id, user_id, balance, is_active, created_at, updated_at) VALUES
-- Admin wallets
('950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 0.00, true, NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 0.00, true, NOW(), NOW()),
-- Driver wallets
('950e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', 25000.00, true, NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440011', 18500.00, true, NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440012', 32000.00, true, NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440013', 15000.00, true, NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440014', 8500.00, true, NOW(), NOW()),
-- Passenger wallets
('950e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440020', 5000.00, true, NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440021', 12000.00, true, NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440022', 3500.00, true, NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440023', 0.00, true, NOW(), NOW()),
('950e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440024', 7500.00, true, NOW(), NOW());

-- =============================================
-- RIDES (Sample ride history)
-- =============================================

INSERT INTO rides (id, passenger_id, driver_profile_id, vehicle_id, ride_type, vehicle_type, pickup_address, pickup_latitude, pickup_longitude, destination_address, destination_latitude, destination_longitude, distance_km, estimated_duration_minutes, actual_duration_minutes, fare_amount, status, accepted_at, driver_arrived_at, started_at, completed_at, created_at, updated_at) VALUES
-- Completed rides
('a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440020', '650e8400-e29b-41d4-a716-446655440010', '850e8400-e29b-41d4-a716-446655440010', 'private', 'car', 'Lekki Phase 1, Lagos', 6.4698, 3.5852, 'Victoria Island, Lagos', 6.4281, 3.4219, 8.5, 25, 28, 2500.00, 'completed', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 50 minutes', NOW() - INTERVAL '1 hour 45 minutes', NOW() - INTERVAL '1 hour 17 minutes', NOW() - INTERVAL '2 hours', NOW()),
('a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440021', '650e8400-e29b-41d4-a716-446655440011', '850e8400-e29b-41d4-a716-446655440011', 'private', 'car', 'Ikoyi, Lagos', 6.4541, 3.4316, 'Ikeja GRA, Lagos', 6.6018, 3.3515, 12.3, 35, 32, 3200.00, 'completed', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours 50 minutes', NOW() - INTERVAL '3 hours 45 minutes', NOW() - INTERVAL '3 hours 13 minutes', NOW() - INTERVAL '4 hours', NOW()),
('a50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440022', '650e8400-e29b-41d4-a716-446655440012', '850e8400-e29b-41d4-a716-446655440012', 'shared', 'keke', 'Gbagada, Lagos', 6.5569, 3.3898, 'Yaba, Lagos', 6.5158, 3.3696, 5.2, 18, 22, 1200.00, 'completed', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5 hours 50 minutes', NOW() - INTERVAL '5 hours 45 minutes', NOW() - INTERVAL '5 hours 23 minutes', NOW() - INTERVAL '6 hours', NOW()),
-- Active ride
('a50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440023', '650e8400-e29b-41d4-a716-446655440010', '850e8400-e29b-41d4-a716-446655440010', 'private', 'car', 'Yaba, Lagos', 6.5158, 3.3696, 'Surulere, Lagos', 6.5027, 3.3707, 3.8, 15, NULL, 1800.00, 'in_progress', NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '10 minutes', NULL, NOW() - INTERVAL '25 minutes', NOW()),
-- Pending rides
('a50e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440024', NULL, NULL, 'private', 'car', 'Ajah, Lagos', 6.4698, 3.5852, 'Marina, Lagos', 6.4541, 3.3958, 15.2, 45, NULL, 4200.00, 'pending', NULL, NULL, NULL, NULL, NOW() - INTERVAL '5 minutes', NOW()),
('a50e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440020', NULL, NULL, 'shared', 'keke', 'Lekki Phase 1, Lagos', 6.4698, 3.5852, 'Ikeja, Lagos', 6.6018, 3.3515, 18.5, 55, NULL, 2800.00, 'pending', NULL, NULL, NULL, NULL, NOW() - INTERVAL '2 minutes', NOW());

-- =============================================
-- PAYMENTS
-- =============================================

INSERT INTO payments (id, ride_id, passenger_id, driver_profile_id, amount, driver_amount, platform_fee, payment_method, payment_status, transaction_id, processed_at, created_at, updated_at) VALUES
('b50e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440020', '650e8400-e29b-41d4-a716-446655440010', 2500.00, 2125.00, 375.00, 'card', 'completed', 'TXN_001_2024', NOW() - INTERVAL '1 hour 15 minutes', NOW() - INTERVAL '1 hour 17 minutes', NOW()),
('b50e8400-e29b-41d4-a716-446655440002', 'a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440021', '650e8400-e29b-41d4-a716-446655440011', 3200.00, 2720.00, 480.00, 'wallet', 'completed', 'TXN_002_2024', NOW() - INTERVAL '3 hours 10 minutes', NOW() - INTERVAL '3 hours 13 minutes', NOW()),
('b50e8400-e29b-41d4-a716-446655440003', 'a50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440022', '650e8400-e29b-41d4-a716-446655440012', 1200.00, 1020.00, 180.00, 'cash', 'completed', 'TXN_003_2024', NOW() - INTERVAL '5 hours 20 minutes', NOW() - INTERVAL '5 hours 23 minutes', NOW());

-- =============================================
-- WALLET TRANSACTIONS
-- =============================================

INSERT INTO wallet_transactions (id, wallet_id, amount, transaction_type, description, reference_id, reference_type, balance_before, balance_after, created_at) VALUES
-- Driver earnings
('c50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440010', 2125.00, 'credit', 'Ride earnings from completed trip', 'a50e8400-e29b-41d4-a716-446655440001', 'ride', 22875.00, 25000.00, NOW() - INTERVAL '1 hour 15 minutes'),
('c50e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440011', 2720.00, 'credit', 'Ride earnings from completed trip', 'a50e8400-e29b-41d4-a716-446655440002', 'ride', 15780.00, 18500.00, NOW() - INTERVAL '3 hours 10 minutes'),
('c50e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440012', 1020.00, 'credit', 'Ride earnings from completed trip', 'a50e8400-e29b-41d4-a716-446655440003', 'ride', 30980.00, 32000.00, NOW() - INTERVAL '5 hours 20 minutes'),
-- Passenger payments
('c50e8400-e29b-41d4-a716-446655440004', '950e8400-e29b-41d4-a716-446655440021', 3200.00, 'debit', 'Payment for ride to Ikeja GRA', 'a50e8400-e29b-41d4-a716-446655440002', 'ride', 15200.00, 12000.00, NOW() - INTERVAL '3 hours 13 minutes'),
('c50e8400-e29b-41d4-a716-446655440005', '950e8400-e29b-41d4-a716-446655440024', 500.00, 'credit', 'Wallet top-up', NULL, 'topup', 7000.00, 7500.00, NOW() - INTERVAL '1 day');

-- =============================================
-- RATINGS
-- =============================================

INSERT INTO ratings (id, ride_id, rater_id, rated_id, rating, comment, rating_type, is_anonymous, created_at) VALUES
('d50e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440010', 5, 'Excellent driver! Very professional and punctual.', 'passenger_to_driver', false, NOW() - INTERVAL '1 hour 10 minutes'),
('d50e8400-e29b-41d4-a716-446655440002', 'a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440020', 5, 'Great passenger, very respectful and ready on time.', 'driver_to_passenger', false, NOW() - INTERVAL '1 hour 10 minutes'),
('d50e8400-e29b-41d4-a716-446655440003', 'a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 4, 'Good service, clean car. Arrived a bit late but overall good.', 'passenger_to_driver', false, NOW() - INTERVAL '3 hours 5 minutes'),
('d50e8400-e29b-41d4-a716-446655440004', 'a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440021', 5, 'Polite and friendly passenger.', 'driver_to_passenger', false, NOW() - INTERVAL '3 hours 5 minutes'),
('d50e8400-e29b-41d4-a716-446655440005', 'a50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440012', 4, 'Affordable keke ride, driver was friendly.', 'passenger_to_driver', false, NOW() - INTERVAL '5 hours 15 minutes');

-- =============================================
-- NOTIFICATIONS
-- =============================================

INSERT INTO notifications (id, user_id, title, message, type, data, is_read, created_at) VALUES
('e50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010', 'New Ride Request', 'You have a new ride request from Ajah to Marina', 'ride_update', '{"ride_id": "a50e8400-e29b-41d4-a716-446655440005", "pickup": "Ajah, Lagos", "destination": "Marina, Lagos", "fare": 4200}', false, NOW() - INTERVAL '5 minutes'),
('e50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440011', 'New Ride Request', 'You have a new ride request from Lekki Phase 1 to Ikeja', 'ride_update', '{"ride_id": "a50e8400-e29b-41d4-a716-446655440006", "pickup": "Lekki Phase 1, Lagos", "destination": "Ikeja, Lagos", "fare": 2800}', false, NOW() - INTERVAL '2 minutes'),
('e50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440020', 'Ride Completed', 'Your ride to Victoria Island has been completed. Please rate your driver.', 'ride_update', '{"ride_id": "a50e8400-e29b-41d4-a716-446655440001", "status": "completed"}', true, NOW() - INTERVAL '1 hour 17 minutes'),
('e50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440021', 'Payment Successful', 'Your payment of ₦3,200 has been processed successfully.', 'payment', '{"amount": 3200, "method": "wallet", "transaction_id": "TXN_002_2024"}', true, NOW() - INTERVAL '3 hours 10 minutes'),
('e50e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440023', 'Driver Arrived', 'Your driver John Adebayo has arrived at the pickup location.', 'ride_update', '{"ride_id": "a50e8400-e29b-41d4-a716-446655440004", "driver_name": "John Adebayo", "status": "driver_arrived"}', true, NOW() - INTERVAL '15 minutes');

-- =============================================
-- HEALTH CHECK
-- =============================================

INSERT INTO health_check (status, details) VALUES
('ok', '{"timestamp": "' || NOW() || '", "database_status": "connected", "response_time_ms": 45}');

-- =============================================
-- SESSIONS (Demo sessions for testing)
-- =============================================

INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES
('f50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'admin_demo_token_123456789', NOW() + INTERVAL '7 days', NOW()),
('f50e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', 'driver_demo_token_123456789', NOW() + INTERVAL '7 days', NOW()),
('f50e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440020', 'passenger_demo_token_123456789', NOW() + INTERVAL '7 days', NOW());

COMMIT;

-- Display summary
SELECT 
    'Users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'Driver Profiles', COUNT(*) FROM driver_profiles
UNION ALL
SELECT 'Passenger Profiles', COUNT(*) FROM passenger_profiles
UNION ALL
SELECT 'Vehicles', COUNT(*) FROM vehicles
UNION ALL
SELECT 'Wallets', COUNT(*) FROM wallets
UNION ALL
SELECT 'Rides', COUNT(*) FROM rides
UNION ALL
SELECT 'Payments', COUNT(*) FROM payments
UNION ALL
SELECT 'Wallet Transactions', COUNT(*) FROM wallet_transactions
UNION ALL
SELECT 'Ratings', COUNT(*) FROM ratings
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'Sessions', COUNT(*) FROM sessions;
