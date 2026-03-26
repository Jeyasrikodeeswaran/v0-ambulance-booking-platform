-- Disable Row Level Security (RLS)
-- Since the application currently uses client-side mock authentication instead of Supabase Auth,
-- auth.uid() is always null, causing all queries to fail. 
-- Disabling RLS allows the frontend API to read and write data.

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE ambulances DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs DISABLE ROW LEVEL SECURITY;
