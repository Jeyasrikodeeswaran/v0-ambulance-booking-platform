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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, notes } = body;

    let result;

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

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}
