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

-- Drop existing recursive policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Providers can view their own data" ON providers;
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can update bookings" ON bookings;
DROP POLICY IF EXISTS "Only admins can view audit logs" ON admin_audit_logs;
DROP POLICY IF EXISTS "Only admins can insert audit logs" ON admin_audit_logs;

-- Apply new non-recursive policies
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
