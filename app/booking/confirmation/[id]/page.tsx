'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookingConfirmationCard } from '@/components/booking/booking-confirmation-card'
import { Loader2, Home } from 'lucide-react'
import type { Booking } from '@/lib/data/types'

export default function BookingConfirmationPage() {
  const params = useParams()
  const bookingId = params.id as string
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Poll for updates every 5 seconds
  useEffect(() => {
    if (!bookingId || !autoRefresh) return

    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings?id=${bookingId}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Booking not found')
          } else {
            throw new Error('Failed to fetch booking')
          }
          return
        }
        
        const data = await response.json()
        setBooking(data)
        
        // Stop polling once accepted or rejected
        if (data.status !== 'pending') {
          setAutoRefresh(false)
        }
      } catch (err) {
        console.error('Error fetching booking:', err)
        // Fallback to local store if API fails
        const { bookingStore } = await import('@/lib/data/store')
        const bookingData = bookingStore.getById(bookingId)
        if (bookingData) {
          setBooking(bookingData)
        }
      } finally {
        setIsLoading(false)
      }
    }

    // Initial fetch
    fetchBooking()

    // Poll every 5 seconds while pending
    const interval = setInterval(fetchBooking, 5000)

    return () => clearInterval(interval)
  }, [bookingId, autoRefresh])

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Booking Error</h1>
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-600 mb-4">{error}</p>
              <Button asChild>
                <Link href="/dashboard/bookings">View My Bookings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isLoading || !booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Booking Request Submitted</h1>
          <p className="text-muted-foreground mt-2">
            {booking.status === 'pending' 
              ? 'Your request is being reviewed. This page updates automatically every 5 seconds.'
              : booking.status === 'accepted'
              ? 'Your ambulance has been confirmed! Check your booking details below.'
              : 'Unfortunately, your request could not be fulfilled. Please contact support.'}
          </p>
        </div>

        {/* Auto-refresh indicator */}
        {booking.status === 'pending' && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                <p className="text-sm text-blue-700">
                  <strong>Live Updates:</strong> Page refreshes automatically. Expected response: ~10 minutes
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Confirmation Card */}
        <BookingConfirmationCard
          booking={{
            id: booking.id,
            patientName: booking.patientName,
            patientPhone: booking.patientPhone,
            patientAge: booking.patientAge,
            pickupLocation: booking.pickupLocation.address,
            dropLocation: booking.dropLocation.address,
            date: booking.date,
            time: booking.time,
            ambulanceType: booking.ambulanceType,
            status: booking.status as 'pending' | 'accepted' | 'rejected',
            estimatedCost: booking.estimatedCost,
            createdAt: booking.createdAt,
            // Mock driver details when accepted
            driver: booking.status === 'accepted' ? {
              name: 'Raj Kumar',
              phone: '+91 98765 43210',
              vehicleNumber: 'DL-01AB1234',
              vehicleType: 'Oxygen Support Ambulance',
            } : undefined,
          }}
        />

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link href="/dashboard/bookings" className="gap-2">
              <Home className="h-4 w-4" />
              View All Bookings
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
