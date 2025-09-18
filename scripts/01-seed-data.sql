-- Insert demo users
INSERT INTO users (email, password, full_name, phone, role, is_active) VALUES
('admin@muf.com', 'admin123', 'Admin User', '+1234567890', 'admin', true),
('driver@muf.com', 'driver123', 'John Driver', '+1234567891', 'driver', true),
('passenger@muf.com', 'passenger123', 'Jane Passenger', '+1234567892', 'passenger', true),
('driver2@muf.com', 'driver123', 'Mike Wilson', '+1234567893', 'driver', true),
('passenger2@muf.com', 'passenger123', 'Sarah Johnson', '+1234567894', 'passenger', true);

-- Insert driver profiles (get user IDs first)
INSERT INTO drivers (user_id, license_number, vehicle_make, vehicle_model, vehicle_year, vehicle_color, vehicle_plate, is_verified, is_available, rating, total_rides)
SELECT 
    u.id,
    'DL123456789',
    'Toyota',
    'Camry',
    2020,
    'Blue',
    'ABC123',
    true,
    true,
    4.8,
    150
FROM users u WHERE u.email = 'driver@muf.com';

INSERT INTO drivers (user_id, license_number, vehicle_make, vehicle_model, vehicle_year, vehicle_color, vehicle_plate, is_verified, is_available, rating, total_rides)
SELECT 
    u.id,
    'DL987654321',
    'Honda',
    'Civic',
    2019,
    'Red',
    'XYZ789',
    true,
    false,
    4.6,
    89
FROM users u WHERE u.email = 'driver2@muf.com';

-- Insert sample rides
INSERT INTO rides (passenger_id, driver_id, pickup_address, destination_address, status, fare, distance, duration, payment_method, payment_status)
SELECT 
    p.id,
    d.id,
    '123 Main St, City',
    '456 Oak Ave, City',
    'completed',
    25.50,
    8.5,
    20,
    'card',
    'completed'
FROM users p, drivers d, users du
WHERE p.email = 'passenger@muf.com' 
AND d.user_id = du.id 
AND du.email = 'driver@muf.com';

INSERT INTO rides (passenger_id, driver_id, pickup_address, destination_address, status, fare, distance, duration, payment_method, payment_status)
SELECT 
    p.id,
    d.id,
    '789 Pine St, City',
    '321 Elm St, City',
    'in_progress',
    18.75,
    6.2,
    15,
    'cash',
    'pending'
FROM users p, drivers d, users du
WHERE p.email = 'passenger2@muf.com' 
AND d.user_id = du.id 
AND du.email = 'driver2@muf.com';

-- Insert sample ride requests
INSERT INTO ride_requests (passenger_id, pickup_address, destination_address, status, estimated_fare)
SELECT 
    u.id,
    '555 Broadway, City',
    '777 Market St, City',
    'pending',
    22.00
FROM users u WHERE u.email = 'passenger@muf.com';

SELECT 'Seed data inserted successfully!' as result;
