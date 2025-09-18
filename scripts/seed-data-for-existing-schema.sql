-- Seed data for existing schema
-- This adds demo accounts to your existing database structure

-- Insert demo users (using ON CONFLICT to avoid duplicates)
INSERT INTO users (id, email, password, full_name, phone, role, is_verified, is_active, profile_image_url, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@muf.com', 'admin123', 'Admin User', '+1234567890', 'admin', true, true, null, '1985-01-15', 'male', '123 Admin St, City', 'Emergency Admin', '+1234567891', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440002', 'driver@muf.com', 'driver123', 'John Driver', '+1234567892', 'driver', true, true, null, '1990-05-20', 'male', '456 Driver Ave, City', 'Emergency Driver', '+1234567893', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440003', 'passenger@muf.com', 'passenger123', 'Jane Passenger', '+1234567894', 'passenger', true, true, null, '1995-08-10', 'female', '789 Passenger Blvd, City', 'Emergency Passenger', '+1234567895', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440004', 'driver1@uberclone.com', 'driver123', 'Mike Driver', '+1234567896', 'driver', true, true, null, '1988-03-12', 'male', '321 Second Driver St, City', 'Emergency Mike', '+1234567897', now(), now()),
  ('550e8400-e29b-41d4-a716-446655440005', 'passenger1@uberclone.com', 'passenger123', 'Sarah Passenger', '+1234567898', 'passenger', true, true, null, '1992-11-25', 'female', '654 Second Passenger Ave, City', 'Emergency Sarah', '+1234567899', now(), now())
ON CONFLICT (email) DO NOTHING;

-- Insert wallets for all users
INSERT INTO wallets (id, user_id, balance, is_active, created_at, updated_at)
VALUES 
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 1000.00, true, now(), now()),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 250.50, true, now(), now()),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 75.25, true, now(), now()),
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 450.00, true, now(), now()),
  ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 125.75, true, now(), now())
ON CONFLICT (user_id) DO NOTHING;

-- Insert driver profiles
INSERT INTO driver_profiles (id, user_id, license_number, license_expiry, is_online, status, rating, total_rides, total_earnings, bio, years_experience, languages, bank_account_number, bank_name, created_at, updated_at)
VALUES 
  ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'DL123456789', '2025-12-31', false, 'offline', 4.8, 150, 2500.00, 'Experienced driver with 5 years of safe driving', 5, ARRAY['English', 'Spanish'], '1234567890', 'First Bank', now(), now()),
  ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'DL987654321', '2026-06-30', false, 'offline', 4.9, 200, 3200.00, 'Professional driver, always on time', 7, ARRAY['English', 'French'], '0987654321', 'Second Bank', now(), now())
ON CONFLICT (user_id) DO NOTHING;

-- Insert passenger profiles
INSERT INTO passenger_profiles (id, user_id, preferred_payment_method, created_at, updated_at)
VALUES 
  ('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'card', now(), now()),
  ('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'wallet', now(), now())
ON CONFLICT (user_id) DO NOTHING;

-- Insert vehicles
INSERT INTO vehicles (id, driver_profile_id, vehicle_type, make, model, year, color, plate_number, is_active, insurance_expiry, last_maintenance, created_at, updated_at)
VALUES 
  ('990e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'car', 'Toyota', 'Camry', 2020, 'Blue', 'ABC123', true, '2024-12-31', '2024-01-15', now(), now()),
  ('990e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'car', 'Honda', 'Accord', 2021, 'White', 'XYZ789', true, '2025-06-30', '2024-02-10', now(), now())
ON CONFLICT (plate_number) DO NOTHING;

-- Insert sample rides
INSERT INTO rides (id, passenger_id, driver_profile_id, vehicle_id, ride_type, vehicle_type, pickup_address, pickup_latitude, pickup_longitude, destination_address, destination_latitude, destination_longitude, distance_km, estimated_duration_minutes, fare_amount, status, created_at, updated_at)
VALUES 
  ('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', 'private', 'car', '123 Main St, City', 40.7128, -74.0060, '456 Oak Ave, City', 40.7589, -73.9851, 8.5, 25, 15.50, 'completed', now() - interval '2 hours', now() - interval '1 hour'),
  ('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440002', 'private', 'car', '789 Pine St, City', 40.7505, -73.9934, '321 Elm St, City', 40.7282, -74.0776, 12.3, 35, 22.75, 'completed', now() - interval '1 day', now() - interval '23 hours')
ON CONFLICT (id) DO NOTHING;

-- Insert sample payments
INSERT INTO payments (id, ride_id, passenger_id, driver_profile_id, amount, driver_amount, platform_fee, payment_method, payment_status, processed_at, created_at, updated_at)
VALUES 
  ('bb0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 15.50, 13.95, 1.55, 'card', 'completed', now() - interval '1 hour', now() - interval '2 hours', now() - interval '1 hour'),
  ('bb0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440002', 22.75, 20.48, 2.27, 'wallet', 'completed', now() - interval '23 hours', now() - interval '1 day', now() - interval '23 hours')
ON CONFLICT (id) DO NOTHING;

-- Insert sample ratings
INSERT INTO ratings (id, ride_id, rater_id, rated_id, rating, comment, rating_type, created_at)
VALUES 
  ('cc0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 5, 'Great driver, very professional!', 'passenger_to_driver', now() - interval '1 hour'),
  ('cc0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 5, 'Polite passenger, on time', 'driver_to_passenger', now() - interval '1 hour')
ON CONFLICT (id) DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
VALUES 
  ('dd0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Welcome to Muf!', 'Your driver account has been activated. Start earning today!', 'system', false, now()),
  ('dd0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'Ride Completed', 'Your ride to 456 Oak Ave has been completed. Thank you for using Muf!', 'ride_update', true, now() - interval '1 hour'),
  ('dd0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 'Payment Received', 'You have received $20.48 for your recent ride.', 'payment', false, now() - interval '23 hours')
ON CONFLICT (id) DO NOTHING;

-- Insert health check record
INSERT INTO health_check (status, checked_at, details)
VALUES ('ok', now(), '{"message": "Database seeded successfully", "tables_populated": 9}')
ON CONFLICT (id) DO NOTHING;

-- Success message
SELECT 'Demo data has been successfully loaded into your existing database!' as message;
