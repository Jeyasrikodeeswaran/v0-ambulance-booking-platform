-- Seed sample users
INSERT INTO users (id, full_name, phone, email, role, is_verified, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'John Doe', '9876543210', 'john@example.com', 'user', TRUE, NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'Jane Smith', '9876543211', 'jane@example.com', 'user', TRUE, NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'Mike Johnson', '9876543212', 'mike@example.com', 'provider', TRUE, NOW()),
  ('550e8400-e29b-41d4-a716-446655440004', 'Sarah Williams', '9876543213', 'sarah@example.com', 'provider', TRUE, NOW()),
  ('550e8400-e29b-41d4-a716-446655440005', 'Admin User', '9876543214', 'admin@example.com', 'admin', TRUE, NOW());

-- Seed sample providers
INSERT INTO providers (id, user_id, company_name, owner_name, phone, email, address, service_area, license_number, status, created_at) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'MediCare Ambulance', 'Mike Johnson', '9876543212', 'care@medicare.com', '123 Health St, City', 'Downtown Area', 'LIC123456', 'approved', NOW()),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'Emergency Response Unit', 'Sarah Williams', '9876543213', 'erg@erunits.com', '456 Medical Ave, City', 'Suburbs Area', 'LIC789012', 'approved', NOW());

-- Seed sample ambulances
INSERT INTO ambulances (id, provider_id, vehicle_number, type, driver_name, driver_phone, base_location, base_charge, price_per_km, status, created_at) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'MH-01-AB-0001', 'basic', 'Ravi Kumar', '9876543220', 'Downtown Medical Center', 500.00, 25.00, 'available', NOW()),
  ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'MH-01-AB-0002', 'oxygen', 'Anuj Patel', '9876543221', 'Downtown Medical Center', 750.00, 30.00, 'available', NOW()),
  ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', 'MH-01-AB-0003', 'icu', 'Deepak Sharma', '9876543222', 'Downtown Medical Center', 1200.00, 40.00, 'available', NOW()),
  ('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440002', 'MH-02-AB-0001', 'basic', 'Rajesh Singh', '9876543223', 'Suburbs Emergency Hub', 500.00, 25.00, 'available', NOW()),
  ('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440002', 'MH-02-AB-0002', 'oxygen', 'Nitin Verma', '9876543224', 'Suburbs Emergency Hub', 750.00, 30.00, 'available', NOW());

-- Seed sample bookings with various statuses
INSERT INTO bookings (id, user_id, ambulance_id, provider_id, pickup_address, drop_address, request_date, request_time, patient_name, patient_age, patient_condition, need_oxygen, wheelchair_required, distance, estimated_cost, status, created_at) VALUES
  ('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '100 Park Lane, City', 'General Hospital, City', '2026-03-26', '10:30:00', 'Robert Brown', 45, 'Chest pain', FALSE, FALSE, 5.2, 630.00, 'pending', NOW()),
  ('850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', '200 Main St, City', 'City Medical Center, City', '2026-03-26', '11:00:00', 'Alice Green', 62, 'Difficulty breathing', TRUE, FALSE, 8.5, 1035.00, 'pending', NOW()),
  ('850e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440001', '300 Oak Ave, City', 'Emergency Hospital, City', '2026-03-26', '09:15:00', 'Charles White', 78, 'Critical ICU', TRUE, TRUE, 12.0, 1680.00, 'accepted', NOW()),
  ('850e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', NULL, '650e8400-e29b-41d4-a716-446655440002', '400 Pine Rd, City', 'City Hospital, City', '2026-03-25', '14:20:00', 'Diana Lee', 35, 'Accident injury', FALSE, FALSE, 6.8, 920.00, 'rejected', NOW() - INTERVAL '2 days'),
  ('850e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440002', '500 Elm St, City', 'Care Hospital, City', '2026-03-24', '16:45:00', 'Edward King', 55, 'Regular checkup', FALSE, FALSE, 7.2, 860.00, 'completed', NOW() - INTERVAL '3 days');

-- Insert audit log entries
INSERT INTO admin_audit_logs (id, admin_id, action, entity_type, entity_id, changes, created_at) VALUES
  ('950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'accepted_booking', 'booking', '850e8400-e29b-41d4-a716-446655440003', '{"status": "pending -> accepted", "ambulance_assigned": "MH-01-AB-0003"}', NOW() - INTERVAL '1 hour'),
  ('950e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'rejected_booking', 'booking', '850e8400-e29b-41d4-a716-446655440004', '{"status": "pending -> rejected", "reason": "No ambulance available"}', NOW() - INTERVAL '2 days');
