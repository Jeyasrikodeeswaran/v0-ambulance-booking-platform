import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Booking Request Types
export interface BookingRequest {
  id: string;
  user_id: string;
  provider_id: string;
  ambulance_id: string;
  pickup_location: string;
  dropoff_location: string;
  requested_at: string;
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
    name: string;
    license_plate: string;
    vehicle_type: string;
  };
}

export interface AdminFilters {
  status?: string;
  provider_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
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
      user:users(*),
      provider:ambulance_providers(*),
      ambulance:ambulances(*)
    `,
      { count: 'exact' }
    );

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.provider_id) {
    query = query.eq('provider_id', filters.provider_id);
  }

  if (filters.date_from) {
    query = query.gte('requested_at', filters.date_from);
  }

  if (filters.date_to) {
    query = query.lte('requested_at', filters.date_to);
  }

  // Apply search
  if (filters.search) {
    query = query.or(
      `pickup_location.ilike.%${filters.search}%,dropoff_location.ilike.%${filters.search}%`
    );
  }

  // Apply pagination
  const start = (page - 1) * pageSize;
  query = query.range(start, start + pageSize - 1).order('requested_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    requests: data as BookingRequest[],
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
      user:users(*),
      provider:ambulance_providers(*),
      ambulance:ambulances(*)
    `
    )
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as BookingRequest;
}

// Accept a booking request
export async function acceptBookingRequest(id: string, notes?: string) {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'accepted',
      notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Log the action
  await logAuditAction('accept_request', id, data.provider_id);

  return data;
}

// Reject a booking request
export async function rejectBookingRequest(id: string, reason?: string) {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'rejected',
      notes: reason || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Log the action
  await logAuditAction('reject_request', id, data.provider_id);

  return data;
}

// Cancel a booking request
export async function cancelBookingRequest(id: string, reason?: string) {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      notes: reason || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Log the action
  await logAuditAction('cancel_request', id, data.provider_id);

  return data;
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
    await supabase.from('audit_logs').insert({
      action,
      booking_id,
      provider_id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log audit action:', error);
  }
}

// Fetch audit logs for a booking
export async function fetchAuditLogs(booking_id: string) {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('booking_id', booking_id)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data;
}

// Get all providers for filtering
export async function fetchProviders() {
  const { data, error } = await supabase
    .from('ambulance_providers')
    .select('id, name')
    .order('name');

  if (error) throw error;
  return data;
}
