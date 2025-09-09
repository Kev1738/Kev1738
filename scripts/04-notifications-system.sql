-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'ride_request', 'ride_accepted', 'ride_started', 'ride_completed', 'payment', 'rating', 'alert', 'info', 'success'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}', -- Additional data for the notification
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create push_tokens table for device registration
CREATE TABLE IF NOT EXISTS push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    device_type VARCHAR(20) NOT NULL, -- 'ios', 'android', 'web'
    device_id VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, token)
);

-- Create ride_ratings table
CREATE TABLE IF NOT EXISTS ride_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    rater_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rated_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ride_id, rater_id, rated_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_is_active ON push_tokens(is_active);

CREATE INDEX IF NOT EXISTS idx_ride_ratings_ride_id ON ride_ratings(ride_id);
CREATE INDEX IF NOT EXISTS idx_ride_ratings_rated_id ON ride_ratings(rated_id);

-- Insert sample notifications for testing
INSERT INTO notifications (user_id, type, title, message, data) 
SELECT 
    u.id,
    'info',
    'Welcome to RideShare Pro!',
    'Thank you for joining our platform. Start booking rides or driving to earn money.',
    '{"welcome": true}'
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM notifications n WHERE n.user_id = u.id AND n.type = 'info' AND n.title = 'Welcome to RideShare Pro!'
);

-- Insert sample ride notifications for drivers
INSERT INTO notifications (user_id, type, title, message, data)
SELECT 
    u.id,
    'ride_request',
    'New Ride Request Available',
    'A passenger is looking for a ride near your location. Check it out!',
    '{"ride_id": "sample", "location": "Downtown"}'
FROM users u
WHERE u.role = 'driver'
AND NOT EXISTS (
    SELECT 1 FROM notifications n WHERE n.user_id = u.id AND n.type = 'ride_request'
)
LIMIT 3;

-- Insert sample payment notifications for passengers
INSERT INTO notifications (user_id, type, title, message, data)
SELECT 
    u.id,
    'payment',
    'Payment Successful',
    'Your payment of $15.50 for the recent trip has been processed successfully.',
    '{"amount": 15.50, "payment_method": "Credit Card"}'
FROM users u
WHERE u.role = 'passenger'
AND NOT EXISTS (
    SELECT 1 FROM notifications n WHERE n.user_id = u.id AND n.type = 'payment'
)
LIMIT 2;
