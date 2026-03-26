import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const bookingId = searchParams.get('id')

    // TODO: Add auth check - verify user token
    // if (!isAuthenticatedUser) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    if (bookingId) {
      // Fetch single booking with driver details
      const response = await fetch(`/api/bookings?id=${bookingId}`)
      if (!response.ok) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      }

      const booking = await response.json()

      // Add mock driver details when accepted
      if (booking.status === 'accepted') {
        booking.driver = {
          name: 'Raj Kumar',
          phone: '+91 98765 43210',
          vehicleNumber: 'DL-01AB1234',
          vehicleType: booking.ambulanceType,
          vehicleColor: 'White',
          licensePlate: 'DL-01AB1234',
        }
      }

      return NextResponse.json(booking)
    }

    if (userId) {
      // Fetch all user bookings
      const response = await fetch(`/api/bookings?userId=${userId}`)
      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch bookings' },
          { status: 500 }
        )
      }

      const bookings = await response.json()

      // Add driver details for accepted bookings
      const enrichedBookings = bookings.map((booking: any) => {
        if (booking.status === 'accepted') {
          booking.driver = {
            name: 'Raj Kumar',
            phone: '+91 98765 43210',
            vehicleNumber: 'DL-01AB1234',
            vehicleType: booking.ambulanceType,
            vehicleColor: 'White',
            licensePlate: 'DL-01AB1234',
          }
        }
        return booking
      })

      return NextResponse.json(enrichedBookings)
    }

    return NextResponse.json(
      { error: 'userId or id parameter required' },
      { status: 400 }
    )
  } catch (error) {
    console.error('User bookings API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user bookings' },
      { status: 500 }
    )
  }
}
