-- Comprehensive seed data for testing all CRUD operations

-- Clear existing data (in reverse order of dependencies)
DELETE FROM wallet_transactions;
DELETE FROM ratings;
DELETE FROM payments;
DELETE FROM rides;
DELETE FROM notifications;
DELETE FROM vehicles;
DELETE FROM driver_profiles;
DELETE FROM wallets;
DELETE FROM users;

-- Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE driver_profiles_id_seq RESTART WITH 1;
ALTER SEQUENCE vehicles_id_seq RESTART WITH 1;
ALTER SEQUENCE rides_id_seq RESTART WITH 1;
ALTER SEQUENCE payments_id_seq RESTART WITH 1;
ALTER SEQUENCE ratings_id_seq RESTART WITH 1;
ALTER SEQUENCE notifications_id_seq RESTART WITH 1;
ALTER SEQUENCE wallets_id_seq RESTART WITH 1;
ALTER SEQUENCE wallet_transactions_id_seq RESTART WITH 1;

-- Insert comprehensive test users
INSERT INTO users (email, password, full_name, phone, role, is_active, is_verified, date_of_birth, gender, address, emergency_contact_name, emergency_contact_phone) VALUES
-- Admin users
('admin@uberclone.com', 'admin123', 'System Administrator', '+2348012345678', 'admin', true, true, '1985-01-15', 'male', '1 Admin Street, Lagos, Nigeria', 'Admin Emergency', '+2348012345679'),
('superadmin@uberclone.com', 'superadmin123', 'Super Administrator', '+2348012345680', 'admin', true, true, '1980-05-20', 'female', '2 Super Admin Ave, Abuja, Nigeria', 'Super Emergency', '+2348012345681'),

-- Driver users
('driver1@uberclone.com', 'driver123', 'John Adebayo', '+2348023456789', 'driver', true, true, '1990-03-10', 'male', '10 Driver Street, Lagos, Nigeria', 'Jane Adebayo', '+2348023456790'),
('driver2@uberclone.com', 'driver123', 'Mary Okafor', '+2348034567890', 'driver', true, true, '1988-07-22', 'female', '20 Driver Avenue, Port Harcourt, Nigeria', 'Peter Okafor', '+2348034567891'),
('driver3@uberclone.com', 'driver123', 'Ahmed Hassan', '+2348045678901', 'driver', true, false, '1992-11-05', 'male', '30 Driver Road, Kano, Nigeria', 'Fatima Hassan', '+2348045678902'),
('driver4@uberclone.com', 'driver123', 'Grace Emeka', '+2348056789012', 'driver', false, false, '1995-02-14', 'female', '40 Driver Close, Enugu, Nigeria', 'Paul Emeka', '+2348056789013'),

-- Passenger users
('passenger1@uberclone.com', 'passenger123', 'David Ogundimu', '+2348067890123', 'passenger', true, true, '1993-09-18', 'male', '50 Passenger Street, Lagos, Nigeria', 'Sarah Ogundimu', '+2348067890124'),
('passenger2@uberclone.com', 'passenger123', 'Blessing Okoro', '+2348078901234', 'passenger', true, true, '1991-12-03', 'female', '60 Passenger Avenue, Abuja, Nigeria', 'Michael Okoro', '+2348078901235'),
('passenger3@uberclone.com', 'passenger123', 'Kemi Adeyemi', '+2348089012345', 'passenger', true, false, '1994-06-25', 'female', '70 Passenger Road, Ibadan, Nigeria', 'Tunde Adeyemi', '+2348089012346'),
('passenger4@uberclone.com', 'passenger123', 'Chidi Nwankwo', '+2348090123456', 'passenger', false, true, '1989-04-12', 'male', '80 Passenger Close, Owerri, Nigeria', 'Ngozi Nwankwo', '+2348090123457');

-- Create wallets for all users
INSERT INTO wallets (user_id, balance)
SELECT id, 
  CASE 
    WHEN role = 'driver' THEN RANDOM() * 50000 + 10000  -- Drivers: 10k-60k
    WHEN role = 'passenger' THEN RANDOM() * 20000 + 5000  -- Passengers: 5k-25k
    ELSE 100000  -- Admins: 100k
  END
FROM users;

-- Create comprehensive driver profiles
INSERT INTO driver_profiles (
  user_id, license_number, license_expiry, vehicle_make, vehicle_model, vehicle_year, 
  vehicle_color, vehicle_plate, is_online, status, current_location_lat, current_location_lng,
  rating, total_rides, total_earnings, bio, years_experience, languages, vehicle_description, bank_account_number, bank_name
)
SELECT 
  u.id,
  'LIC' || LPAD(u.id::text, 6, '0'),  -- License number
  CURRENT_DATE + INTERVAL '2 years',   -- License expiry
  CASE (u.id % 4)
    WHEN 1 THEN 'Toyota'
    WHEN 2 THEN 'Honda'
    WHEN 3 THEN 'Hyundai'
    ELSE 'Kia'
  END,  -- Vehicle make
  CASE (u.id % 4)
    WHEN 1 THEN 'Corolla'
    WHEN 2 THEN 'Civic'
    WHEN 3 THEN 'Elantra'
    ELSE 'Rio'
  END,  -- Vehicle model
  2018 + (u.id % 6),  -- Vehicle year (2018-2023)
  CASE (u.id % 5)
    WHEN 1 THEN 'White'
    WHEN 2 THEN 'Black'
    WHEN 3 THEN 'Silver'
    WHEN 4 THEN 'Blue'
    ELSE 'Red'
  END,  -- Vehicle color
  'ABC' || LPAD((100 + u.id)::text, 3, '0') || 'XY',  -- Plate number
  (u.id % 2 = 1),  -- is_online (alternating)
  CASE 
    WHEN u.id % 2 = 1 THEN 'online'
    ELSE 'offline'
  END,  -- status
  6.5244 + (RANDOM() - 0.5) * 0.1,  -- Lagos area latitude
  3.3792 + (RANDOM() - 0.5) * 0.1,  -- Lagos area longitude
  4.0 + RANDOM() * 1.0,  -- Rating between 4.0-5.0
  FLOOR(RANDOM() * 500) + 50,  -- Total rides (50-549)
  FLOOR(RANDOM() * 500000) + 100000,  -- Total earnings (100k-600k)
  'Experienced driver with ' || (2 + u.id % 8) || ' years of safe driving.',  -- Bio
  2 + (u.id % 8),  -- Years experience (2-9)
  ARRAY['English', 'Yoruba', 'Hausa']::text[],  -- Languages
  'Clean, comfortable vehicle with AC and phone charger',  -- Vehicle description
  '12345678' || LPAD(u.id::text, 2, '0'),  -- Bank account
  CASE (u.id % 3)
    WHEN 1 THEN 'GTBank'
    WHEN 2 THEN 'Access Bank'
    ELSE 'First Bank'
  END  -- Bank name
FROM users u 
WHERE u.role = 'driver';

-- Create vehicles for drivers
INSERT INTO vehicles (driver_id, make, model, year, color, plate_number, vehicle_type, is_active)
SELECT 
  dp.id,
  dp.vehicle_make,
  dp.vehicle_model,
  dp.vehicle_year,
  dp.vehicle_color,
  dp.vehicle_plate,
  CASE (dp.id % 3)
    WHEN 1 THEN 'car'
    WHEN 2 THEN 'keke'
    ELSE 'bike'
  END,
  true
FROM driver_profiles dp;

-- Create comprehensive ride data
INSERT INTO rides (
  passenger_id, driver_id, pickup_address, destination_address,
  pickup_latitude, pickup_longitude, destination_latitude, destination_longitude,
  distance_km, estimated_duration_minutes, fare_amount, status, ride_type, vehicle_type,
  scheduled_time, accepted_at, started_at, completed_at, cancelled_at, cancellation_reason
)
VALUES
-- Completed rides
(7, 3, 'Victoria Island, Lagos', 'Lekki Phase 1, Lagos', 6.4281, 3.4219, 6.4698, 3.5852, 15.2, 35, 3500, 'completed', 'private', 'car', NULL, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1.5 hours', NOW() - INTERVAL '1 hour', NULL, NULL),
(8, 4, 'Garki, Abuja', 'Maitama, Abuja', 9.0579, 7.4951, 9.0765, 7.4951, 8.5, 20, 2200, 'completed', 'private', 'car', NULL, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3.5 hours', NOW() - INTERVAL '3 hours', NULL, NULL),
(9, 3, 'Ikeja, Lagos', 'Maryland, Lagos', 6.6018, 3.3515, 6.5795, 3.3711, 12.3, 28, 2800, 'completed', 'shared', 'car', NULL, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5.5 hours', NOW() - INTERVAL '5 hours', NULL, NULL),

-- In progress rides
(7, 4, 'Surulere, Lagos', 'Yaba, Lagos', 6.4969, 3.3534, 6.5158, 3.3784, 7.8, 18, 1800, 'in_progress', 'private', 'car', NULL, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '15 minutes', NULL, NULL, NULL),
(8, 5, 'Wuse, Abuja', 'Asokoro, Abuja', 9.0579, 7.4951, 9.0765, 7.4951, 6.2, 15, 1500, 'in_progress', 'private', 'keke', NULL, NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '10 minutes', NULL, NULL, NULL),

-- Accepted rides
(9, 3, 'Ikoyi, Lagos', 'Ajah, Lagos', 6.4474, 3.4553, 6.4698, 3.5852, 18.5, 42, 4200, 'accepted', 'private', 'car', NULL, NOW() - INTERVAL '5 minutes', NULL, NULL, NULL, NULL),

-- Pending rides
(10, NULL, 'Ogba, Lagos', 'Agege, Lagos', 6.6372, 3.3318, 6.6516, 3.3152, 9.1, 22, 2100, 'pending', 'shared', 'car', NULL, NULL, NULL, NULL, NULL, NULL),
(7, NULL, 'Kubwa, Abuja', 'Nyanya, Abuja', 9.1579, 7.3951, 9.2765, 7.4251, 11.3, 26, 2600, 'pending', 'private', 'keke', NOW() + INTERVAL '2 hours', NULL, NULL, NULL, NULL, NULL),

-- Cancelled rides
(8, 4, 'Allen Avenue, Lagos', 'Computer Village, Lagos', 6.6018, 3.3515, 6.5795, 3.3711, 5.2, 12, 1200, 'cancelled', 'private', 'car', NULL, NOW() - INTERVAL '1 day', NULL, NULL, NOW() - INTERVAL '23 hours', 'Driver unavailable'),
(9, 5, 'Jabi, Abuja', 'Utako, Abuja', 9.0879, 7.4251, 9.0965, 7.4351, 4.1, 10, 1000, 'cancelled', 'shared', 'bike', NULL, NOW() - INTERVAL '2 days', NULL, NULL, NOW() - INTERVAL '2 days', 'Passenger cancelled');

-- Create payments for completed rides
INSERT INTO payments (ride_id, amount, payment_method, status, transaction_id, processed_at)
SELECT 
  r.id,
  r.fare_amount,
  CASE (r.id % 4)
    WHEN 1 THEN 'card'
    WHEN 2 THEN 'wallet'
    WHEN 3 THEN 'cash'
    ELSE 'bank_transfer'
  END,
  'completed',
  'TXN' || LPAD(r.id::text, 10, '0'),
  r.completed_at
FROM rides r 
WHERE r.status = 'completed';

-- Create ratings for completed rides
INSERT INTO ratings (ride_id, rater_id, rated_id, rating, comment, rating_type)
SELECT 
  r.id,
  r.passenger_id,
  r.driver_id,
  4 + RANDOM(),  -- Rating between 4.0-5.0
  CASE (r.id % 5)
    WHEN 1 THEN 'Great driver, very professional!'
    WHEN 2 THEN 'Clean car and safe driving.'
    WHEN 3 THEN 'On time and friendly service.'
    WHEN 4 THEN 'Smooth ride, would recommend.'
    ELSE 'Excellent experience overall.'
  END,
  'passenger_to_driver'
FROM rides r 
WHERE r.status = 'completed';

-- Create driver ratings for passengers
INSERT INTO ratings (ride_id, rater_id, rated_id, rating, comment, rating_type)
SELECT 
  r.id,
  r.driver_id,
  r.passenger_id,
  4 + RANDOM(),  -- Rating between 4.0-5.0
  CASE (r.id % 4)
    WHEN 1 THEN 'Polite and respectful passenger.'
    WHEN 2 THEN 'Ready on time, easy pickup.'
    WHEN 3 THEN 'Pleasant conversation during ride.'
    ELSE 'Good passenger, no issues.'
  END,
  'driver_to_passenger'
FROM rides r 
WHERE r.status = 'completed';

-- Create wallet transactions
INSERT INTO wallet_transactions (wallet_id, amount, transaction_type, description, reference_id)
SELECT 
  w.id,
  p.amount * 0.8,  -- Driver gets 80% of fare
  'credit',
  'Ride earnings for ride #' || p.ride_id,
  'RIDE_' || p.ride_id
FROM wallets w
JOIN users u ON w.user_id = u.id
JOIN driver_profiles dp ON u.id = dp.user_id
JOIN rides r ON dp.user_id = r.driver_id
JOIN payments p ON r.id = p.ride_id
WHERE p.status = 'completed';

-- Debit passenger wallets for wallet payments
INSERT INTO wallet_transactions (wallet_id, amount, transaction_type, description, reference_id)
SELECT 
  w.id,
  -p.amount,
  'debit',
  'Payment for ride #' || p.ride_id,
  'RIDE_' || p.ride_id
FROM wallets w
JOIN users u ON w.user_id = u.id
JOIN rides r ON u.id = r.passenger_id
JOIN payments p ON r.id = p.ride_id
WHERE p.status = 'completed' AND p.payment_method = 'wallet';

-- Create notifications
INSERT INTO notifications (user_id, title, message, type, is_read)
SELECT 
  u.id,
  CASE 
    WHEN u.role = 'driver' THEN 'New Ride Request'
    WHEN u.role = 'passenger' THEN 'Ride Confirmed'
    ELSE 'System Update'
  END,
  CASE 
    WHEN u.role = 'driver' THEN 'You have a new ride request in your area.'
    WHEN u.role = 'passenger' THEN 'Your ride has been confirmed and driver is on the way.'
    ELSE 'System maintenance scheduled for tonight.'
  END,
  CASE 
    WHEN u.role = 'driver' THEN 'ride_request'
    WHEN u.role = 'passenger' THEN 'ride_update'
    ELSE 'system'
  END,
  (u.id % 3 = 0)  -- Some notifications read, some unread
FROM users u;

-- Update driver profiles with calculated ratings
UPDATE driver_profiles 
SET rating = subquery.avg_rating
FROM (
  SELECT 
    dp.id,
    COALESCE(AVG(r.rating), 5.0) as avg_rating
  FROM driver_profiles dp
  LEFT JOIN users u ON dp.user_id = u.id
  LEFT JOIN ratings r ON u.id = r.rated_id AND r.rating_type = 'passenger_to_driver'
  GROUP BY dp.id
) AS subquery
WHERE driver_profiles.id = subquery.id;

-- Update wallet balances based on transactions
UPDATE wallets 
SET balance = subquery.final_balance
FROM (
  SELECT 
    w.id,
    w.balance + COALESCE(SUM(wt.amount), 0) as final_balance
  FROM wallets w
  LEFT JOIN wallet_transactions wt ON w.id = wt.wallet_id
  GROUP BY w.id, w.balance
) AS subquery
WHERE wallets.id = subquery.id;

-- Verify data integrity
SELECT 
  'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Driver Profiles', COUNT(*) FROM driver_profiles
UNION ALL
SELECT 'Vehicles', COUNT(*) FROM vehicles
UNION ALL
SELECT 'Rides', COUNT(*) FROM rides
UNION ALL
SELECT 'Payments', COUNT(*) FROM payments
UNION ALL
SELECT 'Ratings', COUNT(*) FROM ratings
UNION ALL
SELECT 'Wallets', COUNT(*) FROM wallets
UNION ALL
SELECT 'Wallet Transactions', COUNT(*) FROM wallet_transactions
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications;
