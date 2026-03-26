import { NextRequest, NextResponse } from 'next/server';
import {
  fetchBookingRequestById,
  acceptBookingRequest,
  rejectBookingRequest,
  cancelBookingRequest,
  fetchAuditLogs,
} from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const request_details = await fetchBookingRequestById(id);
    const audit_logs = await fetchAuditLogs(id);

    return NextResponse.json({
      request: request_details,
      audit_logs,
    });
  } catch (error) {
    console.error('Error fetching request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch request details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, notes } = body;

    console.log(`[v0] Admin action: ${action} on ID: "${id}"`);

    if (!id || id === 'undefined') {
      return NextResponse.json({ error: 'Missing or invalid ID' }, { status: 400 });
    }

    let result;

    try {
      switch (action) {
        case 'accept':
          result = await acceptBookingRequest(id, notes);
          break;
        case 'reject':
          result = await rejectBookingRequest(id, notes);
          break;
        case 'cancel':
          result = await cancelBookingRequest(id, notes);
          break;
        default:
          return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
          );
      }
    } catch (innerError: any) {
      console.error(`[v0] Error in ${action} operation:`, innerError);
      throw innerError;
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error updating request:', error);
    return NextResponse.json(
      { error: 'Failed to update request', details: error.message || JSON.stringify(error) },
      { status: 500 }
    );
  }
}
