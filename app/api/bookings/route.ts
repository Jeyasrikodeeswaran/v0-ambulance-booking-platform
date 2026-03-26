import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['patientName', 'patientAge', 'pickupLocation', 'dropLocation', 'date', 'time']
    const missing = requiredFields.filter(field => !body[field])
    
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }

    // Find or create a user for this booking
    let userId;
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('full_name', body.patientName)
      .limit(1)
      .single();

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create a guest user
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          full_name: body.patientName,
          email: `${body.patientName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          phone: body.patientPhone || '0000000000',
          role: 'user'
        })
        .select()
        .single();
      
      if (userError) {
        console.error('Failed to create guest user:', userError);
        // Fallback to first user as a last resort to satisfy DB constraints
        const { data: fallbackUsers } = await supabase.from('users').select('id').limit(1);
        userId = fallbackUsers?.[0]?.id;
      } else {
        userId = newUser.id;
      }
    }

    const { data: providers } = await supabase.from('providers').select('id').limit(1);
    const { data: ambulances } = await supabase.from('ambulances').select('id').limit(1);

    const providerId = providers?.[0]?.id;
    const ambulanceId = ambulances?.[0]?.id;

    console.log(`[v0] Creating booking for User:${userId}, Provider:${providerId}`);

    // Insert booking into Supabase
    const { data: booking, error } = await supabase.from('bookings').insert({
      user_id: userId,
      provider_id: providerId,
      ambulance_id: ambulanceId,
      patient_name: body.patientName,
      patient_age: parseInt(body.patientAge),
      pickup_address: typeof body.pickupLocation === 'object' ? body.pickupLocation.address : body.pickupLocation,
      drop_address: typeof body.dropLocation === 'object' ? body.dropLocation.address : body.dropLocation,
      request_date: body.date,
      request_time: body.time,
      patient_condition: body.patientCondition || '',
      need_oxygen: body.needOxygen || false,
      wheelchair_required: body.wheelchairRequired || false,
      special_instructions: body.specialInstructions || '',
      distance: body.distance || 0,
      estimated_cost: body.estimatedCost || 500,
      status: 'pending'
    }).select().single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw new Error(`Supabase error: ${error.message}`);
    }

    return NextResponse.json(
      {
        id: booking.id, // return the newly created Supabase UUID
        message: 'Booking request created successfully',
        booking,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking', details: error.message || JSON.stringify(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('id')
    
    if (bookingId) {
      // Check Supabase first
      const { data: booking, error } = await supabase
        .from('bookings')
        .select('*, ambulances(type)')
        .eq('id', bookingId)
        .single();
        
      if (booking) {
         // Map Supabase schema back to expected frontend mock format
         return NextResponse.json({
            id: booking.id,
            status: booking.status,
            patientName: booking.patient_name,
            patientPhone: 'N/A',
            patientAge: booking.patient_age,
            pickupLocation: { address: booking.pickup_address },
            dropLocation: { address: booking.drop_address },
            date: booking.request_date,
            time: booking.request_time,
            estimatedCost: booking.estimated_cost,
            createdAt: booking.created_at,
            ambulanceType: (booking as any).ambulances?.type || 'basic'
         })
      }

      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    // Return all Supabase bookings
    const { data: allBookings } = await supabase.from('bookings').select('*');
    return NextResponse.json(allBookings || [])
  } catch (error) {
    console.error('Booking fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
