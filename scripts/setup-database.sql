-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'provider', 'admin')),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Providers Table
CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  owner_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT NOT NULL,
  service_area TEXT NOT NULL,
  license_number VARCHAR(255) NOT NULL UNIQUE,
  identification_proof VARCHAR(255),
  bank_details JSONB,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_providers_user_id ON providers(user_id);
CREATE INDEX idx_providers_status ON providers(status);

-- Ambulances Table
CREATE TABLE IF NOT EXISTS ambulances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  vehicle_number VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('basic', 'oxygen', 'icu')),
  driver_name VARCHAR(255) NOT NULL,
  driver_phone VARCHAR(20) NOT NULL,
  base_location TEXT NOT NULL,
  base_charge DECIMAL(10, 2) NOT NULL,
  price_per_km DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'on_trip', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ambulances_provider_id ON ambulances(provider_id);
CREATE INDEX idx_ambulances_status ON ambulances(status);

-- Bookings Table (Ambulance Requests)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ambulance_id UUID REFERENCES ambulances(id) ON DELETE SET NULL,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  pickup_address TEXT NOT NULL,
  pickup_lat DECIMAL(10, 8),
  pickup_lng DECIMAL(11, 8),
  drop_address TEXT NOT NULL,
  drop_lat DECIMAL(10, 8),
  drop_lng DECIMAL(11, 8),
  request_date DATE NOT NULL,
  request_time TIME NOT NULL,
  end_time TIME,
  patient_name VARCHAR(255) NOT NULL,
  patient_age INT,
  patient_condition TEXT,
 );

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX idx_bookings_ambulance_id ON bookings(ambulance_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_bookings_request_date ON bookings(request_date);

-- Admin Audit Log Table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX idx_audit_logs_entity ON admin_audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON admin_audit_logs(created_at);

-- Row Level Security Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambulances ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role securely without triggering RLS recursion
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS VARCHAR
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role VARCHAR;
BEGIN
  SELECT role INTO user_role FROM public.users WHERE id = auth.uid();
  RETURN user_role;
END;
$$;

-- Users RLS Policies
CREATE POLICY "Users can view their own data or admins can view all" ON users
  FOR SELECT USING (
    auth.uid() = id OR
    get_user_role() = 'admin'
  );

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Providers RLS Policies
CREATE POLICY "Providers can view their own data or admins can view all" ON providers
  FOR SELECT USING (
    user_id = auth.uid() OR
    get_user_role() = 'admin'
  );

-- Bookings RLS Policies
CREATE POLICY "Users, assigned providers, and admins can view bookings" ON bookings
  FOR SELECT USING (
    user_id = auth.uid() OR
    provider_id = (SELECT id FROM providers WHERE user_id = auth.uid()) OR
    get_user_role() = 'admin'
  );

CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

CREATE POLICY "Admins can update bookings" ON bookings
  FOR UPDATE USING (
    get_user_role() = 'admin'
  );

-- Audit Logs RLS Policies
CREATE POLICY "Only admins can view audit logs" ON admin_audit_logs
  FOR SELECT USING (
    get_user_role() = 'admin'
  );

CREATE POLICY "Only admins can insert audit logs" ON admin_audit_logs
  FOR INSERT WITH CHECK (
    get_user_role() = 'admin'
  );
