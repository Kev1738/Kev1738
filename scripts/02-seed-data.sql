-- Insert sample users (password is "123456" hashed with MD5 + salt)
INSERT INTO users (id, email, password_hash, full_name, phone, role, status) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@rideshare.com', 'e10adc3949ba59abbe56e057f20f883e', 'Admin User', '+2348012345678', 'admin', 'active'),
('550e8400-e29b-41d4-a716-446655440002', 'driver1@driver.com', 'e10adc3949ba59abbe56e057f20f883e', 'John Smith', '+2348012345679', 'driver', 'active'),
('550e8400-e29b-41d4-a716-446655440003', 'driver2@driver.com', 'e10adc3949ba59abbe56e057f20f883e', 'Mike Johnson', '+2348012345680', 'driver', 'active'),
('550e8400-e29b-41d4-a716-446655440004', 'driver3@driver.com', 'e10adc3949ba59abbe56e057f20f883e', 'David Wilson', '+2348012345681', 'driver', 'active'),
('550e8400-e29b-41d4-a716-446655440005', 'user1@example.com', 'e10adc3949ba59abbe56e057f20f883e', 'Alice Brown', '+2348012345682', 'passenger', 'active'),
('550e8400-e29b-41d4-a716-446655440006', 'user2@example.com', 'e10adc3949ba59abbe56e057f20f883e', 'Bob Davis', '+2348012345683', 'passenger', 'active');

-- Insert driver profiles
INSERT INTO driver_profiles (id, user_id, license_number, license_expiry, vehicle_type, is_online, current_latitude, current_longitude, rating, total_rides, total_earnings) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'LIC001234', '2025-12-31', 'car', true, 6.5244, 3.3792, 4.8, 150, 75000.00),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'LIC001235', '2025-11-30', 'keke', true, 6.4581, 3.3947, 4.6, 200, 45000.00),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'LIC001236', '2025-10-31', 'bike', false, 6.6018, 3.3515, 4.9, 300, 60000.00);

-- Insert vehicles
INSERT INTO vehicles (id, driver_id, make, model, year, color, plate_number, vehicle_type, is_active) VALUES
('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Toyota', 'Corolla', 2020, 'Silver', 'LAG-123-AB', 'car', true),
('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', 'Bajaj', 'RE Compact', 2021, 'Yellow', 'LAG-456-CD', 'keke', true),
('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', 'Honda', 'CB150R', 2022, 'Red', 'LAG-789-EF', 'bike', true);

-- Insert sample rides
INSERT INTO rides (id, passenger_id, driver_id, pickup_address, pickup_latitude, pickup_longitude, destination_address, destination_latitude, destination_longitude, vehicle_type, status, fare, distance_km, duration_minutes, requested_at, accepted_at, started_at, completed_at) VALUES
('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'Victoria Island, Lagos', 6.4281, 3.4219, 'Ikeja, Lagos', 6.6018, 3.3515, 'car', 'completed', 2500.00, 15.5, 35, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 50 minutes', NOW() - INTERVAL '1 hour 45 minutes', NOW() - INTERVAL '1 hour 10 minutes'),
('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', 'Surulere, Lagos', 6.4969, 3.3481, 'Yaba, Lagos', 6.5158, 3.3696, 'keke', 'in_progress', 800.00, 5.2, 15, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '25 minutes', NOW() - INTERVAL '20 minutes', NULL),
('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005', NULL, 'Lekki Phase 1, Lagos', 6.4474, 3.4647, 'Ajah, Lagos', 6.4698, 3.5648, 'bike', 'pending', NULL, NULL, NULL, NOW() - INTERVAL '5 minutes', NULL, NULL, NULL);

-- Insert payments
INSERT INTO payments (id, ride_id, amount, payment_method, status, processed_at) VALUES
('990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 2500.00, 'wallet', 'completed', NOW() - INTERVAL '1 hour 10 minutes'),
('990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', 800.00, 'cash', 'pending', NULL);

-- Insert ratings
INSERT INTO ratings (id, ride_id, rater_id, rated_id, rating, comment) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 5, 'Excellent driver, very professional!'),
('aa0e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 4, 'Good passenger, on time.');

-- Insert notifications
INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'Ride Completed', 'Your ride to Ikeja has been completed successfully.', 'ride_update', true),
('bb0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'New Ride Request', 'You have a new ride request from Surulere to Yaba.', 'ride_request', false),
('bb0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', 'Driver Assigned', 'Mike Johnson has accepted your ride request.', 'ride_update', false);

-- Insert wallets
INSERT INTO wallets (id, user_id, balance) VALUES
('cc0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 50000.00),
('cc0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 25000.00),
('cc0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 15000.00),
('cc0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 30000.00),
('cc0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 5000.00),
('cc0e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', 8000.00);

-- Insert wallet transactions
INSERT INTO wallet_transactions (id, wallet_id, type, amount, description, balance_after) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', 'cc0e8400-e29b-41d4-a716-446655440005', 'credit', 10000.00, 'Wallet top-up via bank transfer', 10000.00),
('dd0e8400-e29b-41d4-a716-446655440002', 'cc0e8400-e29b-41d4-a716-446655440005', 'debit', 2500.00, 'Payment for ride to Ikeja', 7500.00),
('dd0e8400-e29b-41d4-a716-446655440003', 'cc0e8400-e29b-41d4-a716-446655440005', 'debit', 2500.00, 'Payment for ride to Surulere', 5000.00),
('dd0e8400-e29b-41d4-a716-446655440004', 'cc0e8400-e29b-41d4-a716-446655440002', 'credit', 2125.00, 'Earnings from completed ride (85% of ₦2500)', 27125.00),
('dd0e8400-e29b-41d4-a716-446655440005', 'cc0e8400-e29b-41d4-a716-446655440002', 'debit', 2125.00, 'Withdrawal to bank account', 25000.00);
