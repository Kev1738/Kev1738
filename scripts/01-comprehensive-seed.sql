-- Supabase-ready seed runner
-- Wraps your existing seed in a single transaction and defers FK checks.
-- Safe to run multiple times. If tables are empty, it simply inserts; if not, your seed's DELETEs will clear them first.

BEGIN;
SET LOCAL statement_timeout TO '600s';
SET CONSTRAINTS ALL DEFERRED;

-- ===== START OF ORIGINAL SEED =====
-- Comprehensive seed data with proper relationships
-- This creates a realistic dataset for testing all system functionality

-- Clear existing data in proper order
DELETE FROM wallet_transactions;
DELETE FROM ratings;
DELETE FROM payments;
DELETE FROM rides;
DELETE FROM notifications;
DELETE FROM vehicles;
DELETE FROM driver_profiles;
DELETE FROM passenger_profiles;
DELETE FROM wallets;
DELETE FROM uploaded_files;
DELETE FROM sessions;
DELETE FROM users;
DELETE FROM health_check;

-- =============================================
-- USERS (Foundation of the system)
-- =============================================

INSERT INTO users (id, email, password, full_name, phone, role, is_verified, is_active, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone) VALUES
-- Admin users
('550e8400-e29b-41d4-a716-446655440001', 'admin@uberclone.com', 'admin123', 'System Administrator', '+2348012345678', 'admin', true, true, '1985-01-15', 'male', '1 Admin Street, Victoria Island, Lagos, Nigeria', 'Admin Emergency', '+2348012345679'),
('550e8400-e29b-41d4-a716-446655440002', 'superadmin@uberclone.com', 'superadmin123', 'Super Administrator', '+2348012345680', 'admin', true, true, '1980-05-20', 'female', '2 Super Admin Ave, Central Area, Abuja, Nigeria', 'Super Emergency', '+2348012345681'),

-- Driver users
('550e8400-e29b-41d4-a716-446655440003', 'driver1@uberclone.com', 'driver123', 'John Adebayo', '+2348023456789', 'driver', true, true, '1990-03-10', 'male', '10 Driver Street, Ikeja, Lagos, Nigeria', 'Jane Adebayo', '+2348023456790'),
('550e8400-e29b-41d4-a716-446655440004', 'driver2@uberclone.com', 'driver123', 'Mary Okafor', '+2348034567890', 'driver', true, true, '1988-07-22', 'female', '20 Driver Avenue, Port Harcourt, Rivers, Nigeria', 'Peter Okafor', '+2348034567891'),
('550e8400-e29b-41d4-a716-446655440005', 'driver3@uberclone.com', 'driver123', 'Ahmed Hassan', '+2348045678901', 'driver', true, false, '1992-11-05', 'male', '30 Driver Road, Kano, Kano, Nigeria', 'Fatima Hassan', '+2348045678902'),
('550e8400-e29b-41d4-a716-446655440006', 'driver4@uberclone.com', 'driver123', 'Grace Emeka', '+2348056789012', 'driver', false, false, '1995-02-14', 'female', '40 Driver Close, Enugu, Enugu, Nigeria', 'Paul Emeka', '+2348056789013'),
('550e8400-e29b-41d4-a716-446655440007', 'driver5@uberclone.com', 'driver123', 'Ibrahim Musa', '+2348067890123', 'driver', true, true, '1987-08-30', 'male', '50 Driver Lane, Kaduna, Kaduna, Nigeria', 'Aisha Musa', '+2348067890124'),

-- Passenger users
('550e8400-e29b-41d4-a716-446655440008', 'passenger1@uberclone.com', 'passenger123', 'David Ogundimu', '+2348078901234', 'passenger', true, true, '1993-09-18', 'male', '60 Passenger Street, Lekki, Lagos, Nigeria', 'Sarah Ogundimu', '+2348078901235'),
('550e8400-e29b-41d4-a716-446655440009', 'passenger2@uberclone.com', 'passenger123', 'Blessing Okoro', '+2348089012345', 'passenger', true, true, '1991-12-03', 'female', '70 Passenger Avenue, Garki, Abuja, Nigeria', 'Michael Okoro', '+2348089012346'),
('550e8400-e29b-41d4-a716-446655440010', 'passenger3@uberclone.com', 'passenger123', 'Kemi Adeyemi', '+2348090123456', 'passenger', true, false, '1994-06-25', 'female', '80 Passenger Road, Ibadan, Oyo, Nigeria', 'Tunde Adeyemi', '+2348090123457'),
('550e8400-e29b-41d4-a716-446655440011', 'passenger4@uberclone.com', 'passenger123', 'Chidi Nwankwo', '+2348091234567', 'passenger', false, true, '1989-04-12', 'male', '90 Passenger Close, Owerri, Imo, Nigeria', 'Ngozi Nwankwo', '+2348091234568'),
('550e8400-e29b-41d4-a716-446655440012', 'passenger5@uberclone.com', 'passenger123', 'Fatima Aliyu', '+2348092345678', 'passenger', true, true, '1996-01-20', 'female', '100 Passenger Way, Maiduguri, Borno, Nigeria', 'Usman Aliyu', '+2348092345679');

-- =============================================
-- WALLETS (Create for all users)
-- =============================================

INSERT INTO wallets (id, user_id, balance) VALUES
-- Admin wallets
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 100000.00),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 150000.00),

-- Driver wallets (higher balances from earnings)
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 45000.00),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 38000.00),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 22000.00),
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', 15000.00),
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', 52000.00),

-- Passenger wallets
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440008', 12000.00),
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440009', 8500.00),
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', 15000.00),
('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440011', 6000.00),
('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440012', 9500.00);

-- =============================================
-- DRIVER PROFILES (Extended driver information)
-- =============================================

INSERT INTO driver_profiles (id, user_id, license_number, license_expiry, is_online, status, current_location_lat, current_location_lng, rating, total_rides, total_earnings, bio, years_experience, languages, bank_account_number, bank_name) VALUES
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'LIC001234567', '2026-03-10', true, 'online', 6.5244, 3.3792, 4.8, 245, 450000.00, 'Experienced driver with 5 years of safe driving. Friendly and professional service.', 5, ARRAY['English', 'Yoruba', 'Hausa'], '1234567890', 'GTBank'),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'LIC001234568', '2025-07-22', true, 'online', 4.8156, 7.0498, 4.9, 189, 380000.00, 'Professional driver specializing in long-distance trips. Clean vehicle and punctual.', 4, ARRAY['English', 'Igbo'], '2345678901', 'Access Bank'),
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'LIC001234569', '2025-11-05', false, 'offline', 12.0022, 8.5919, 4.6, 98, 220000.00, 'Reliable driver with good knowledge of Kano city routes.', 3, ARRAY['English', 'Hausa', 'Arabic'], '3456789012', 'First Bank'),
('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', 'LIC001234570', '2024-02-14', false, 'offline', 6.8627, 7.3986, 4.7, 67, 150000.00, 'New driver eager to provide excellent service. Safe and courteous.', 2, ARRAY['English', 'Igbo'], '4567890123', 'UBA'),
('770e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', 'LIC001234571', '2026-08-30', true, 'online', 10.5105, 7.4165, 4.9, 312, 520000.00, 'Veteran driver with excellent customer service. Specializes in airport transfers.', 6, ARRAY['English', 'Hausa', 'Fulani'], '5678901234', 'Zenith Bank');

-- =============================================
-- PASSENGER PROFILES (Extended passenger information)
-- =============================================

INSERT INTO passenger_profiles (id, user_id, preferred_payment_method) VALUES
('880e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440008', 'card'),
('880e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440009', 'wallet'),
('880e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', 'card'),
('880e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440011', 'cash'),
('880e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440012', 'wallet');

-- =============================================
-- VEHICLES (Properly linked to driver profiles)
-- =============================================

INSERT INTO vehicles (id, driver_profile_id, vehicle_type, make, model, year, color, plate_number, insurance_expiry, last_maintenance) VALUES
('990e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'car', 'Toyota', 'Corolla', 2020, 'White', 'ABC123XY', '2025-03-10', '2024-01-15'),
('990e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', 'car', 'Honda', 'Civic', 2019, 'Black', 'DEF456XY', '2025-07-22', '2024-02-20'),
('990e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440005', 'keke', 'Bajaj', 'RE Compact', 2021, 'Yellow', 'GHI789XY', '2025-11-05', '2024-03-10'),
('990e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440006', 'bike', 'Honda', 'CB150R', 2022, 'Red', 'JKL012XY', '2025-02-14', '2024-01-05'),
('990e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440007', 'car', 'Hyundai', 'Elantra', 2021, 'Silver', 'MNO345XY', '2026-08-30', '2024-02-28');

-- =============================================
-- RIDES (Central to the ride-sharing system)
-- =============================================

INSERT INTO rides (id, passenger_id, driver_profile_id, vehicle_id, ride_type, vehicle_type, pickup_address, pickup_latitude, pickup_longitude, destination_address, destination_latitude, destination_longitude, distance_km, estimated_duration_minutes, actual_duration_minutes, fare_amount, status, accepted_at, driver_arrived_at, started_at, completed_at, special_instructions) VALUES

-- Completed rides
('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440003', 'private', 'car', 'Victoria Island, Lagos', 6.4281, 3.4219, 'Lekki Phase 1, Lagos', 6.4698, 3.5852, 15.2, 35, 32, 3500.00, 'completed', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2.5 hours', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1.5 hours', 'Please call when you arrive'),

('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440004', 'private', 'car', 'Garki, Abuja', 9.0579, 7.4951, 'Maitama, Abuja', 9.0765, 7.4951, 8.5, 20, 18, 2200.00, 'completed', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4.5 hours', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3.5 hours', NULL),

('aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440007', '990e8400-e29b-41d4-a716-446655440007', 'shared', 'car', 'Ikeja, Lagos', 6.6018, 3.3515, 'Maryland, Lagos', 6.5795, 3.3711, 12.3, 28, 25, 2800.00, 'completed', NOW() - INTERVAL '8 hours', NOW() - INTERVAL '7.5 hours', NOW() - INTERVAL '7 hours', NOW() - INTERVAL '6.5 hours', 'Shared ride - pickup other passengers'),

-- In progress rides
('aa0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440003', 'private', 'car', 'Surulere, Lagos', 6.4969, 3.3534, 'Yaba, Lagos', 6.5158, 3.3784, 7.8, 18, NULL, 1800.00, 'in_progress', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '15 minutes', NULL, NULL),

('aa0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440012', '770e8400-e29b-41d4-a716-446655440005', '990e8400-e29b-41d4-a716-446655440005', 'private', 'keke', 'Wuse, Abuja', 9.0579, 7.4951, 'Asokoro, Abuja', 9.0765, 7.4951, 6.2, 15, NULL, 1500.00, 'in_progress', NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '10 minutes', NULL, 'Keke ride - short distance'),

-- Accepted rides (driver on the way)
('aa0e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440007', '990e8400-e29b-41d4-a716-446655440007', 'private', 'car', 'Ikoyi, Lagos', 6.4474, 3.4553, 'Ajah, Lagos', 6.4698, 3.5852, 18.5, 42, NULL, 4200.00, 'accepted', NOW() - INTERVAL '5 minutes', NULL, NULL, NULL, 'Airport pickup - Terminal 2'),

-- Driver arrived (waiting for passenger)
('aa0e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440011', '770e8400-e29b-41d4-a716-446655440004', '990e8400-e29b-41d4-a716-446655440004', 'private', 'car', 'Central Area, Abuja', 9.0579, 7.4951, 'Kubwa, Abuja', 9.1579, 7.3951, 14.2, 32, NULL, 3200.00, 'driver_arrived', NOW() - INTERVAL '8 minutes', NOW() - INTERVAL '2 minutes', NULL, NULL, NULL),

-- Pending rides (waiting for driver)
('aa0e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440010', NULL, NULL, 'shared', 'car', 'Ogba, Lagos', 6.6372, 3.3318, 'Agege, Lagos', 6.6516, 3.3152, 9.1, 22, NULL, 2100.00, 'pending', NULL, NULL, NULL, NULL, 'Shared ride preferred'),

('aa0e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440008', NULL, NULL, 'private', 'keke', 'Kubwa, Abuja', 9.1579, 7.3951, 'Nyanya, Abuja', 9.2765, 7.4251, 11.3, 26, NULL, 2600.00, 'pending', NULL, NULL, NULL, NULL, NULL),

-- Cancelled rides
('aa0e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440003', '990e8400-e29b-41d4-a716-446655440003', 'private', 'car', 'Allen Avenue, Lagos', 6.6018, 3.3515, 'Computer Village, Lagos', 6.5795, 3.3711, 5.2, 12, NULL, 1200.00, 'cancelled', NOW() - INTERVAL '1 day', NULL, NULL, NULL, 'Driver unavailable'),

('aa0e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440012', '770e8400-e29b-41d4-a716-446655440007', '990e8400-e29b-41d4-a716-446655440007', 'shared', 'car', 'Jabi, Abuja', 9.0879, 7.4251, 'Utako, Abuja', 9.0965, 7.4351, 4.1, 10, NULL, 1000.00, 'cancelled', NOW() - INTERVAL '2 days', NULL, NULL, NULL, 'Passenger cancelled');

-- =============================================
-- PAYMENTS (Linked to rides and users)
-- =============================================

INSERT INTO payments (id, ride_id, passenger_id, driver_profile_id, amount, driver_amount, platform_fee, payment_method, payment_status, transaction_id, processed_at) VALUES
-- Payments for completed rides
('bb0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440003', 3500.00, 2800.00, 700.00, 'card', 'completed', 'TXN1001234567', NOW() - INTERVAL '1.5 hours'),

('bb0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440004', 2200.00, 1760.00, 440.00, 'wallet', 'completed', 'TXN1001234568', NOW() - INTERVAL '3.5 hours'),

('bb0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440007', 2800.00, 2240.00, 560.00, 'card', 'completed', 'TXN1001234569', NOW() - INTERVAL '6.5 hours'),

-- Pending payments for in-progress rides
('bb0e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440003', 1800.00, 1440.00, 360.00, 'card', 'pending', 'TXN1001234570', NULL),

('bb0e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440012', '770e8400-e29b-41d4-a716-446655440005', 1500.00, 1200.00, 300.00, 'cash', 'pending', 'TXN1001234571', NULL);

-- =============================================
-- RATINGS (Bidirectional rating system)
-- =============================================

INSERT INTO ratings (id, ride_id, rater_id, rated_id, rating, comment, rating_type) VALUES
-- Passenger rating driver
('cc0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 5, 'Excellent driver! Very professional and the car was clean. Arrived on time and drove safely.', 'passenger_to_driver'),

('cc0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440004', 5, 'Great service! Mary was very friendly and knew all the shortcuts. Highly recommend.', 'passenger_to_driver'),

('cc0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440007', 4, 'Good driver, smooth ride. Vehicle was comfortable and clean.', 'passenger_to_driver'),

-- Driver rating passenger
('cc0e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440008', 5, 'Polite and respectful passenger. Ready on time and pleasant conversation.', 'driver_to_passenger'),

('cc0e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440009', 5, 'Excellent passenger! Very courteous and patient. Easy pickup and drop-off.', 'driver_to_passenger'),

('cc0e8400-e29b-41d4-a716-446655440006', 'aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440010', 4, 'Good passenger, no issues during the trip.', 'driver_to_passenger');

-- =============================================
-- WALLET TRANSACTIONS (Financial history)
-- =============================================

INSERT INTO wallet_transactions (id, wallet_id, amount, transaction_type, description, reference_id, reference_type, balance_before, balance_after) VALUES
-- Driver earnings from completed rides
('dd0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', 2800.00, 'credit', 'Ride earnings for ride #aa0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 'ride', 42200.00, 45000.00),

('dd0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440004', 1760.00, 'credit', 'Ride earnings for ride #aa0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440002', 'ride', 36240.00, 38000.00),

('dd0e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440007', 2240.00, 'credit', 'Ride earnings for ride #aa0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440003', 'ride', 49760.00, 52000.00),

-- Passenger payments from wallet
('dd0e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440009', -2200.00, 'debit', 'Payment for ride #aa0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440002', 'ride', 10700.00, 8500.00),

-- Wallet top-ups
('dd0e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440008', 5000.00, 'credit', 'Wallet top-up via card', NULL, 'topup', 7000.00, 12000.00),

('dd0e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440010', 10000.00, 'credit', 'Wallet top-up via bank transfer', NULL, 'topup', 5000.00, 15000.00);

-- =============================================
-- NOTIFICATIONS (System communications)
-- =============================================

INSERT INTO notifications (id, user_id, title, message, type, is_read, data) VALUES
-- Ride notifications
('ee0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440008', 'Ride Completed', 'Your ride to Lekki Phase 1 has been completed. Thank you for using our service!', 'ride_update', true, '{"ride_id": "aa0e8400-e29b-41d4-a716-446655440001", "fare": 3500.00}'),

('ee0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'New Ride Request', 'You have a new ride request from Surulere to Yaba. Tap to accept.', 'ride_update', false, '{"ride_id": "aa0e8400-e29b-41d4-a716-446655440004", "pickup": "Surulere, Lagos"}'),

('ee0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440009', 'Driver Assigned', 'Ibrahim has accepted your ride request. He will arrive in 8 minutes.', 'ride_update', false, '{"ride_id": "aa0e8400-e29b-41d4-a716-446655440006", "driver": "Ibrahim Musa", "eta": 8}'),

-- Payment notifications
('ee0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440009', 'Payment Successful', 'Your payment of ₦2,200 for the ride to Maitama has been processed successfully.', 'payment', true, '{"payment_id": "bb0e8400-e29b-41d4-a716-446655440002", "amount": 2200.00}'),

('ee0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', 'Earnings Update', 'You earned ₦1,760 from your recent ride. Keep up the great work!', 'payment', false, '{"payment_id": "bb0e8400-e29b-41d4-a716-446655440002", "earnings": 1760.00}'),

-- System notifications
('ee0e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'System Maintenance', 'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM. Service may be temporarily unavailable.', 'system', false, '{"maintenance_start": "2024-01-20T02:00:00Z", "maintenance_end": "2024-01-20T04:00:00Z"}'),

-- Welcome notifications for new users
('ee0e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440012', 'Welcome to UberClone!', 'Welcome to our ride-sharing platform! Complete your profile to start booking rides.', 'info', false, '{"action": "complete_profile"}');

-- =============================================
-- UPLOADED FILES (Profile images and documents)
-- =============================================

INSERT INTO uploaded_files (id, user_id, file_name, file_type, file_size, file_url, upload_purpose) VALUES
-- Profile images
('ff0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'john_profile.jpg', 'image/jpeg', 245760, '/placeholder.svg?height=100&width=100&text=JA', 'profile_image'),
('ff0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'mary_profile.jpg', 'image/jpeg', 198432, '/placeholder.svg?height=100&width=100&text=MO', 'profile_image'),
('ff0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440008', 'david_profile.jpg', 'image/jpeg', 167890, '/placeholder.svg?height=100&width=100&text=DO', 'profile_image'),

-- Driver documents
('ff0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'john_license.pdf', 'application/pdf', 1024000, '/placeholder.svg?height=100&width=100&text=License', 'license'),
('ff0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', 'mary_license.pdf', 'application/pdf', 987654, '/placeholder.svg?height=100&width=100&text=License', 'license'),

-- Vehicle photos
('ff0e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440003', 'toyota_corolla.jpg', 'image/jpeg', 345678, '/placeholder.svg?height=200&width=300&text=Toyota+Corolla', 'vehicle_photo'),
('ff0e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', 'honda_civic.jpg', 'image/jpeg', 298765, '/placeholder.svg?height=200&width=300&text=Honda+Civic', 'vehicle_photo');

-- =============================================
-- HEALTH CHECK (System monitoring)
-- =============================================

INSERT INTO health_check (status, details) VALUES
('ok', '{"database": "connected", "api": "running", "last_check": "2024-01-19T10:30:00Z"}');

-- =============================================
-- UPDATE CALCULATED FIELDS
-- =============================================

-- Update driver ratings based on actual ratings
UPDATE driver_profiles 
SET rating = subquery.avg_rating,
    total_rides = subquery.ride_count,
    total_earnings = subquery.total_earnings
FROM (
    SELECT 
        dp.id,
        COALESCE(ROUND(AVG(r.rating), 2), 5.00) as avg_rating,
        COUNT(DISTINCT rides.id) as ride_count,
        COALESCE(SUM(p.driver_amount), 0) as total_earnings
    FROM driver_profiles dp
    LEFT JOIN rides ON dp.id = rides.driver_profile_id AND rides.status = 'completed'
    LEFT JOIN ratings r ON rides.id = r.ride_id AND r.rating_type = 'passenger_to_driver'
    LEFT JOIN payments p ON rides.id = p.ride_id AND p.payment_status = 'completed'
    GROUP BY dp.id
) AS subquery
WHERE driver_profiles.id = subquery.id;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Verify data integrity and relationships
SELECT 
    'Users' as table_name, COUNT(*) as count, 
    COUNT(CASE WHEN role = 'driver' THEN 1 END) as drivers,
    COUNT(CASE WHEN role = 'passenger' THEN 1 END) as passengers,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
FROM users
UNION ALL
SELECT 'Driver Profiles', COUNT(*), COUNT(CASE WHEN is_online THEN 1 END), COUNT(CASE WHEN NOT is_online THEN 1 END), 0 FROM driver_profiles
UNION ALL
SELECT 'Passenger Profiles', COUNT(*), 0, 0, 0 FROM passenger_profiles
UNION ALL
SELECT 'Vehicles', COUNT(*), COUNT(CASE WHEN is_active THEN 1 END), COUNT(CASE WHEN NOT is_active THEN 1 END), 0 FROM vehicles
UNION ALL
SELECT 'Rides', COUNT(*), 
    COUNT(CASE WHEN status = 'completed' THEN 1 END),
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END),
    COUNT(CASE WHEN status = 'pending' THEN 1 END)
FROM rides
UNION ALL
SELECT 'Payments', COUNT(*), COUNT(CASE WHEN payment_status = 'completed' THEN 1 END), COUNT(CASE WHEN payment_status = 'pending' THEN 1 END), 0 FROM payments
UNION ALL
SELECT 'Ratings', COUNT(*), COUNT(CASE WHEN rating_type = 'passenger_to_driver' THEN 1 END), COUNT(CASE WHEN rating_type = 'driver_to_passenger' THEN 1 END), 0 FROM ratings
UNION ALL
SELECT 'Wallets', COUNT(*), 0, 0, 0 FROM wallets
UNION ALL
SELECT 'Wallet Transactions', COUNT(*), COUNT(CASE WHEN transaction_type = 'credit' THEN 1 END), COUNT(CASE WHEN transaction_type = 'debit' THEN 1 END), 0 FROM wallet_transactions
UNION ALL
SELECT 'Notifications', COUNT(*), COUNT(CASE WHEN is_read THEN 1 END), COUNT(CASE WHEN NOT is_read THEN 1 END), 0 FROM notifications
UNION ALL
SELECT 'Uploaded Files', COUNT(*), 0, 0, 0 FROM uploaded_files;

-- Test relationship integrity
SELECT 
    'Relationship Check' as test_name,
    'All drivers have user accounts' as description,
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END as result
FROM driver_profiles dp
LEFT JOIN users u ON dp.user_id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 
    'Relationship Check',
    'All vehicles belong to driver profiles',
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END
FROM vehicles v
LEFT JOIN driver_profiles dp ON v.driver_profile_id = dp.id
WHERE dp.id IS NULL

UNION ALL

SELECT 
    'Relationship Check',
    'All rides have valid passengers',
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END
FROM rides r
LEFT JOIN users u ON r.passenger_id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 
    'Relationship Check',
    'All payments have valid rides',
    CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END
FROM payments p
LEFT JOIN rides r ON p.ride_id = r.id
WHERE p.ride_id IS NOT NULL AND r.id IS NULL;

-- ===== END OF ORIGINAL SEED =====
COMMIT;
