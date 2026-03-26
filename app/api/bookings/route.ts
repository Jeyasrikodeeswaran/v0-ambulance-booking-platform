import { NextRequest, NextResponse } from 'next/server'
import type { Booking } from '@/lib/data/types'

// Mock booking storage
let bookings: Map<string, Booking> = new Map()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['patientName', 'patientAge', 'patientPhone', 'pickupLocation', 'dropLocation', 'date', 'time', 'ambulanceType']
    const missing = requiredFields.filter(field => !body[field])
    
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      )
    }
    
    // Validate phone number format
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(body.patientPhone.replace(/\D/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }
    
    // Generate booking ID
    const bookingId = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // Create booking object
    const booking: Booking = {
      id: bookingId,
      userId: 'current-user-id', // This would come from auth context
      providerId: '', // Will be assigned by admin
      ambulanceId: '', // Will be assigned by admin
      patientName: body.patientName,
      patientAge: parseInt(body.patientAge),
      patientPhone: body.patientPhone,
      patientCondition: body.patientCondition || '',
      pickupLocation: {
        address: body.pickupLocation,
        lat: body.pickupCoordinates?.lat || 0,
        lng: body.pickupCoordinates?.lng || 0,
      },
      dropLocation: {
        address: body.dropLocation,
        lat: body.dropCoordinates?.lat || 0,
        lng: body.dropCoordinates?.lng || 0,
      },
      date: body.date,
      time: body.time,
      ambulanceType: body.ambulanceType,
      specialRequirements: body.specialRequirements || [],
      notes: body.notes || '',
      distance: body.distance || 0,
      estimatedCost: body.estimatedCost || 500,
      actualCost: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    // Store booking
    bookings.set(bookingId, booking)
    
    // TODO: Send notification to admin
    // TODO: Send confirmation SMS to user
    
    return NextResponse.json(
      {
        id: booking.id,
        message: 'Booking request created successfully',
        booking,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('id')
    const userId = searchParams.get('userId')
    
    if (bookingId) {
      const booking = bookings.get(bookingId)
      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(booking)
    }
    
    if (userId) {
      const userBookings = Array.from(bookings.values()).filter(b => b.userId === userId)
      return NextResponse.json(userBookings)
    }
    
    // Return all bookings (for admin)
    return NextResponse.json(Array.from(bookings.values()))
  } catch (error) {
    console.error('Booking fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
