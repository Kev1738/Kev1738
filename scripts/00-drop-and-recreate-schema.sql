-- Drop existing tables in correct order (reverse dependency order)
DROP TABLE IF EXISTS public.ratings CASCADE;
DROP TABLE IF EXISTS public.wallet_transactions CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.rides CASCADE;
DROP TABLE IF EXISTS public.vehicles CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.uploaded_files CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.wallets CASCADE;
DROP TABLE IF EXISTS public.passenger_profiles CASCADE;
DROP TABLE IF EXISTS public.driver_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.health_check CASCADE;

-- Drop sequences if they exist
DROP SEQUENCE IF EXISTS public.health_check_id_seq CASCADE;

-- Create sequences
CREATE SEQUENCE public.health_check_id_seq;

-- =============================================
-- CORE TABLES
-- =============================================

-- Users table (central table for all user types)
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL UNIQUE,
  password character varying NOT NULL,
  full_name character varying NOT NULL,
  phone character varying,
  role character varying NOT NULL CHECK (role::text = ANY (ARRAY['passenger'::character varying, 'driver'::character varying, 'admin'::character varying]::text[])),
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  profile_image_url text,
  date_of_birth date,
  gender character varying CHECK (gender::text = ANY (ARRAY['male'::character varying, 'female'::character varying, 'other'::character varying]::text[])),
  address text,
  emergency_contact_name character varying,
  emergency_contact_phone character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Driver profiles (extended info for drivers)
CREATE TABLE public.driver_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  license_number character varying,
  license_expiry date,
  is_online boolean DEFAULT false,
  status character varying DEFAULT 'offline'::character varying CHECK (status::text = ANY (ARRAY['offline'::character varying, 'online'::character varying, 'busy'::character varying, 'break'::character varying]::text[])),
  current_location_lat numeric,
  current_location_lng numeric,
  rating numeric DEFAULT 5.0,
  total_rides integer DEFAULT 0,
  total_earnings numeric DEFAULT 0.00,
  bio text,
  years_experience integer DEFAULT 0,
  languages text[] DEFAULT ARRAY[]::text[],
  bank_account_number character varying,
  bank_name character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT driver_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT driver_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT driver_profiles_user_id_unique UNIQUE (user_id)
);

-- Passenger profiles (extended info for passengers)
CREATE TABLE public.passenger_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  preferred_payment_method character varying DEFAULT 'card'::character varying CHECK (preferred_payment_method::text = ANY (ARRAY['card'::character varying, 'wallet'::character varying, 'cash'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT passenger_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT passenger_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT passenger_profiles_user_id_unique UNIQUE (user_id)
);

-- Vehicles (linked to driver profiles)
CREATE TABLE public.vehicles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  driver_profile_id uuid NOT NULL,
  vehicle_type character varying NOT NULL CHECK (vehicle_type::text = ANY (ARRAY['car'::character varying, 'keke'::character varying, 'bike'::character varying]::text[])),
  make character varying NOT NULL,
  model character varying NOT NULL,
  year integer NOT NULL,
  color character varying NOT NULL,
  plate_number character varying NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  insurance_expiry date,
  last_maintenance date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT vehicles_pkey PRIMARY KEY (id),
  CONSTRAINT vehicles_driver_profile_id_fkey FOREIGN KEY (driver_profile_id) REFERENCES public.driver_profiles(id) ON DELETE CASCADE
);

-- Wallets (financial accounts for users)
CREATE TABLE public.wallets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  balance numeric DEFAULT 0.00,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wallets_pkey PRIMARY KEY (id),
  CONSTRAINT wallets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT wallets_user_id_unique UNIQUE (user_id)
);

-- =============================================
-- OPERATIONAL TABLES
-- =============================================

-- Rides (central ride management)
CREATE TABLE public.rides (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  passenger_id uuid NOT NULL,
  driver_profile_id uuid,
  vehicle_id uuid,
  ride_type character varying DEFAULT 'private'::character varying CHECK (ride_type::text = ANY (ARRAY['shared'::character varying, 'private'::character varying]::text[])),
  vehicle_type character varying DEFAULT 'car'::character varying CHECK (vehicle_type::text = ANY (ARRAY['car'::character varying, 'keke'::character varying, 'bike'::character varying]::text[])),
  pickup_address text NOT NULL,
  pickup_latitude numeric,
  pickup_longitude numeric,
  destination_address text NOT NULL,
  destination_latitude numeric,
  destination_longitude numeric,
  distance_km numeric,
  estimated_duration_minutes integer,
  actual_duration_minutes integer,
  fare_amount numeric NOT NULL,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'accepted'::character varying, 'driver_arrived'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'cancelled'::character varying]::text[])),
  scheduled_time timestamp with time zone,
  accepted_at timestamp with time zone,
  driver_arrived_at timestamp with time zone,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  cancellation_reason text,
  special_instructions text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT rides_pkey PRIMARY KEY (id),
  CONSTRAINT rides_passenger_id_fkey FOREIGN KEY (passenger_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT rides_driver_profile_id_fkey FOREIGN KEY (driver_profile_id) REFERENCES public.driver_profiles(id) ON DELETE SET NULL,
  CONSTRAINT rides_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE SET NULL
);

-- Payments (payment processing)
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ride_id uuid,
  passenger_id uuid NOT NULL,
  driver_profile_id uuid,
  amount numeric NOT NULL,
  driver_amount numeric,
  platform_fee numeric,
  payment_method character varying NOT NULL CHECK (payment_method::text = ANY (ARRAY['card'::character varying, 'wallet'::character varying, 'cash'::character varying, 'bank_transfer'::character varying]::text[])),
  payment_status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (payment_status::text = ANY (ARRAY['pending'::character varying, 'processing'::character varying, 'completed'::character varying, 'failed'::character varying, 'refunded'::character varying]::text[])),
  transaction_id character varying,
  gateway_response jsonb,
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_ride_id_fkey FOREIGN KEY (ride_id) REFERENCES public.rides(id) ON DELETE SET NULL,
  CONSTRAINT payments_passenger_id_fkey FOREIGN KEY (passenger_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT payments_driver_profile_id_fkey FOREIGN KEY (driver_profile_id) REFERENCES public.driver_profiles(id) ON DELETE SET NULL
);

-- Wallet transactions (financial transaction history)
CREATE TABLE public.wallet_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL,
  amount numeric NOT NULL,
  transaction_type character varying NOT NULL CHECK (transaction_type::text = ANY (ARRAY['credit'::character varying, 'debit'::character varying]::text[])),
  description text NOT NULL,
  reference_id uuid,
  reference_type character varying,
  balance_before numeric NOT NULL,
  balance_after numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT wallet_transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.wallets(id) ON DELETE CASCADE
);

-- Ratings (bidirectional rating system)
CREATE TABLE public.ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ride_id uuid NOT NULL,
  rater_id uuid NOT NULL,
  rated_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  rating_type character varying NOT NULL CHECK (rating_type::text = ANY (ARRAY['passenger_to_driver'::character varying, 'driver_to_passenger'::character varying]::text[])),
  is_anonymous boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ratings_pkey PRIMARY KEY (id),
  CONSTRAINT ratings_ride_id_fkey FOREIGN KEY (ride_id) REFERENCES public.rides(id) ON DELETE CASCADE,
  CONSTRAINT ratings_rater_id_fkey FOREIGN KEY (rater_id) REFERENCES public.users(id) ON DELETE CASCADE,
  CONSTRAINT ratings_rated_id_fkey FOREIGN KEY (rated_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- =============================================
-- SYSTEM TABLES
-- =============================================

-- Notifications (system communications)
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title character varying NOT NULL,
  message text NOT NULL,
  type character varying DEFAULT 'info'::character varying CHECK (type::text = ANY (ARRAY['info'::character varying, 'success'::character varying, 'warning'::character varying, 'error'::character varying, 'ride_update'::character varying, 'payment'::character varying, 'system'::character varying]::text[])),
  data jsonb,
  is_read boolean DEFAULT false,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Sessions (user authentication)
CREATE TABLE public.sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token character varying NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sessions_pkey PRIMARY KEY (id),
  CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Uploaded files (file management)
CREATE TABLE public.uploaded_files (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  file_name character varying NOT NULL,
  file_type character varying NOT NULL,
  file_size integer NOT NULL,
  file_url text NOT NULL,
  upload_purpose character varying NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT uploaded_files_pkey PRIMARY KEY (id),
  CONSTRAINT uploaded_files_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL
);

-- Health check (system monitoring)
CREATE TABLE public.health_check (
  id integer NOT NULL DEFAULT nextval('health_check_id_seq'::regclass),
  status character varying DEFAULT 'ok'::character varying,
  checked_at timestamp with time zone DEFAULT now(),
  details jsonb,
  CONSTRAINT health_check_pkey PRIMARY KEY (id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_is_active ON public.users(is_active);

-- Driver profile indexes
CREATE INDEX idx_driver_profiles_user_id ON public.driver_profiles(user_id);
CREATE INDEX idx_driver_profiles_is_online ON public.driver_profiles(is_online);
CREATE INDEX idx_driver_profiles_status ON public.driver_profiles(status);
CREATE INDEX idx_driver_profiles_location ON public.driver_profiles(current_location_lat, current_location_lng);

-- Vehicle indexes
CREATE INDEX idx_vehicles_driver_profile_id ON public.vehicles(driver_profile_id);
CREATE INDEX idx_vehicles_plate_number ON public.vehicles(plate_number);
CREATE INDEX idx_vehicles_is_active ON public.vehicles(is_active);

-- Ride indexes
CREATE INDEX idx_rides_passenger_id ON public.rides(passenger_id);
CREATE INDEX idx_rides_driver_profile_id ON public.rides(driver_profile_id);
CREATE INDEX idx_rides_status ON public.rides(status);
CREATE INDEX idx_rides_created_at ON public.rides(created_at);

-- Payment indexes
CREATE INDEX idx_payments_ride_id ON public.payments(ride_id);
CREATE INDEX idx_payments_passenger_id ON public.payments(passenger_id);
CREATE INDEX idx_payments_driver_profile_id ON public.payments(driver_profile_id);
CREATE INDEX idx_payments_status ON public.payments(payment_status);

-- Wallet transaction indexes
CREATE INDEX idx_wallet_transactions_wallet_id ON public.wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_created_at ON public.wallet_transactions(created_at);

-- Notification indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Rating indexes
CREATE INDEX idx_ratings_ride_id ON public.ratings(ride_id);
CREATE INDEX idx_ratings_rater_id ON public.ratings(rater_id);
CREATE INDEX idx_ratings_rated_id ON public.ratings(rated_id);

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_driver_profiles_updated_at BEFORE UPDATE ON public.driver_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_passenger_profiles_updated_at BEFORE UPDATE ON public.passenger_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON public.rides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_uploaded_files_updated_at BEFORE UPDATE ON public.uploaded_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
