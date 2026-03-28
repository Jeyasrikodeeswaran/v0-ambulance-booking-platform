import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a dummy client or valid client depending on env vars existence
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey) 
  : null as any;

// Booking Request Types
export interface BookingRequest {
  id: string;
  user_id: string;
  provider_id: string;
  ambulance_id: string;
  pickup_location: string;
  dropoff_location: string;
  requested_at: string;
  patient_name: string;
  patient_age: number;
  patient_condition: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed';
  notes?: string;
  user?: {
    name: string;
    email: string;
    phone: string;
  };
  provider?: {
    name: string;
    email: string;
    phone: string;
  };
  ambulance?: {
    id: string;
    vehicle_number: string;
    type: string;
    driver_name: string;
    driver_phone: string;
  };
}

export interface AdminFilters {
  status?: string;
  provider_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

/**
 * Helper to map Supabase booking fields to the BookingRequest UI interface
 */
function mapBookingRequest(b: any): BookingRequest {
  if (!b) return b;
  return {
    ...b,
    pickup_location: b.pickup_address,
    dropoff_location: b.drop_address,
    requested_at: b.created_at,
    patient_name: b.patient_name,
    patient_age: b.patient_age,
    patient_condition: b.patient_condition,
    user: b.user ? { 
      name: b.user.full_name, 
      email: b.user.email, 
      phone: b.user.phone 
    } : undefined,
    provider: b.provider ? { 
      name: b.provider.company_name, 
      email: b.provider.email || undefined,
      phone: b.provider.phone 
    } : undefined,
    ambulance: b.ambulance ? {
      id: b.ambulance.id,
      vehicle_number: b.ambulance.vehicle_number,
      type: b.ambulance.type,
      driver_name: b.ambulance.driver_name,
      driver_phone: b.ambulance.driver_phone
    } : undefined
  };
}

// Fetch all booking requests with pagination and filtering
export async function fetchBookingRequests(
  filters: AdminFilters = {},
  page: number = 1,
  pageSize: number = 10
) {
  let query = supabase
    .from('bookings')
    .select(
      `
      *,
      user:user_id(full_name, email, phone),
      provider:provider_id(id, company_name, phone),
      ambulance:ambulance_id(id, vehicle_number, type, driver_name, driver_phone)
    `,
      { count: 'exact' }
    );

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.provider_id) {
    query = query.eq('provider_id', filters.provider_id);
  }

  if (filters.date_from) {
    query = query.gte('created_at', filters.date_from);
  }

  if (filters.date_to) {
    query = query.lte('created_at', filters.date_to);
  }

  if (filters.search) {
    query = query.or(
      `pickup_address.ilike.%${filters.search}%,drop_address.ilike.%${filters.search}%`
    );
  }

  const start = (page - 1) * pageSize;
  query = query.range(start, start + pageSize - 1).order('created_at', { ascending: false });

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    requests: (data || []).map(mapBookingRequest),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

// Fetch a single booking request with all details
export async function fetchBookingRequestById(id: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(
      `
      *,
      user:user_id(full_name, email, phone),
      provider:provider_id(id, company_name, phone),
      ambulance:ambulance_id(id, vehicle_number, type, driver_name, driver_phone)
    `
    )
    .eq('id', id)
    .single();

  if (error) throw error;
  return mapBookingRequest(data);
}

// Accept a booking request
export async function acceptBookingRequest(id: string, notes?: string) {
  // Use special_instructions if notes column is missing, or just update status
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'accepted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  await logAuditAction('accept_request', id, data.provider_id);
  return mapBookingRequest(data);
}

// Reject a booking request
export async function rejectBookingRequest(id: string, reason?: string) {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'rejected',
      rejection_reason: reason || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  await logAuditAction('reject_request', id, data.provider_id);
  return mapBookingRequest(data);
}

// Cancel a booking request
export async function cancelBookingRequest(id: string, reason?: string) {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  await logAuditAction('cancel_request', id, data.provider_id);
  return mapBookingRequest(data);
}

// Get statistics for dashboard
export async function fetchAdminStats() {
  const { data: totalBookings } = await supabase
    .from('bookings')
    .select('id', { count: 'exact' });

  const { data: pendingBookings } = await supabase
    .from('bookings')
    .select('id', { count: 'exact' })
    .eq('status', 'pending');

  const { data: acceptedBookings } = await supabase
    .from('bookings')
    .select('id', { count: 'exact' })
    .eq('status', 'accepted');

  const { data: rejectedBookings } = await supabase
    .from('bookings')
    .select('id', { count: 'exact' })
    .eq('status', 'rejected');

  return {
    total: totalBookings?.length || 0,
    pending: pendingBookings?.length || 0,
    accepted: acceptedBookings?.length || 0,
    rejected: rejectedBookings?.length || 0,
  };
}

// Log audit trail
async function logAuditAction(action: string, booking_id: string, provider_id: string) {
  try {
    const { data: session } = await supabase.auth.getSession();
    let adminId = session?.session?.user?.id;
    
    // Safety check for common "undefined" string issue in mock environments
    const fallbackAdminId = '550e8400-e29b-41d4-a716-446655440005';
    if (!adminId || adminId === 'undefined' || typeof adminId !== 'string' || adminId.length < 32) {
      adminId = fallbackAdminId;
    }

    if (!booking_id || booking_id === 'undefined') {
       console.error('Cant log audit: booking_id is undefined');
       return;
    }
    
    await supabase.from('admin_audit_logs').insert({
      action,
      entity_type: 'booking',
      entity_id: booking_id,
      admin_id: adminId,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log audit action:', error);
  }
}

// Fetch audit logs for a booking
export async function fetchAuditLogs(booking_id: string) {
  const { data, error } = await supabase
    .from('admin_audit_logs')
    .select('*')
    .eq('entity_id', booking_id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Get all providers for filtering (simple list)
export async function fetchProviders() {
  const { data, error } = await supabase
    .from('providers')
    .select('id, company_name')
    .order('company_name');

  if (error) throw error;
  return (data || []).map((p: any) => ({ id: p.id, name: p.company_name }));
}

// Get full provider list with pagination
export async function fetchAllProviders(
  filters: { status?: string; search?: string } = {},
  page: number = 1,
  pageSize: number = 10
) {
  let query = supabase
    .from('providers')
    .select(
      '*, user:user_id(full_name, email, phone)',
      { count: 'exact' }
    );

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.search) {
    query = query.or(`company_name.ilike.%${filters.search}%,owner_name.ilike.%${filters.search}%`);
  }

  const start = (page - 1) * pageSize;
  query = query.range(start, start + pageSize - 1).order('created_at', { ascending: false });

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    providers: data,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

// Update provider status (approve/reject)
export async function updateProviderStatus(id: string, status: 'approved' | 'rejected') {
  const { data, error } = await supabase
    .from('providers')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get full users list with pagination
export async function fetchAllUsers(
  filters: { role?: string; search?: string } = {},
  page: number = 1,
  pageSize: number = 10
) {
  let query = supabase
    .from('users')
    .select('*', { count: 'exact' });

  if (filters.role) {
    query = query.eq('role', filters.role);
  }

  if (filters.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
  }

  const start = (page - 1) * pageSize;
  query = query.range(start, start + pageSize - 1).order('created_at', { ascending: false });

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    users: data,
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

// Fetch all ambulance registration requests
export async function fetchAmbulanceRegistrations(
  filters: { status?: 'pending' | 'approved' | 'rejected'; search?: string } = {},
  page: number = 1,
  pageSize: number = 10
) {
  let query = supabase
    .from('ambulances')
    .select(
      '*, provider:provider_id(id, company_name, phone)',
      { count: 'exact' }
    );

  if (filters.status) {
    query = query.eq('registration_status', filters.status);
  } else {
    // By default, just show pending
    query = query.eq('registration_status', 'pending');
  }

  if (filters.search) {
    query = query.or(`vehicle_number.ilike.%${filters.search}%,driver_name.ilike.%${filters.search}%`);
  }

  const start = (page - 1) * pageSize;
  query = query.range(start, start + pageSize - 1).order('created_at', { ascending: false });

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    registrations: (data || []).map((a: any) => ({
      ...a,
      provider_name: a.provider?.company_name,
      provider_phone: a.provider?.phone
    })),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
}

// Update ambulance registration status
export async function updateAmbulanceRegistrationStatus(id: string, status: 'approved' | 'rejected') {
  const { data, error } = await supabase
    .from('ambulances')
    .update({ 
      registration_status: status,
      // If approved, set initial operational status to available
      status: status === 'approved' ? 'available' : 'maintenance',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  // Log audit action
  await logAuditAction(`ambulance_registration_${status}`, id, data.provider_id);
  
  return data;
}

// Create a new ambulance record
export async function createAmbulanceRecord(ambulance: {
  provider_id: string;
  vehicle_number: string;
  type: string;
  driver_name: string;
  driver_phone: string;
  base_location: string;
  base_charge: number;
  price_per_km: number;
  status: string;
}) {
  // Demo fallback: if the provider_id is a mock ID, use a real one from seed data
  let providerId = ambulance.provider_id;
  if (!providerId || providerId.startsWith('provider-')) {
    providerId = '650e8400-e29b-41d4-a716-446655440001'; // Sample Provider 1
  }

  const { data, error } = await supabase
    .from('ambulances')
    .insert({
      ...ambulance,
      provider_id: providerId,
      registration_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
