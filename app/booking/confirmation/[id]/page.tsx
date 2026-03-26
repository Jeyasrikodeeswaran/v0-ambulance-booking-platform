'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookingStatusBadge } from '@/components/booking/booking-status-badge'
import { AmbulanceTypeBadge } from '@/components/ambulance/ambulance-type-badge'
import { bookingStore, ambulanceStore, providerStore } from '@/lib/data/store'
import { formatPrice } from '@/lib/utils/pricing'
import type { Booking, Ambulance, Provider } from '@/lib/data/types'
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  ArrowRight,
  Home,
} from 'lucide-react'
import { format } from 'date-fns'

export default function BookingConfirmationPage() {
  const params = useParams()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [ambulance, setAmbulance] = useState<Ambulance | null>(null)
  const [provider, setProvider] = useState<Provider | null>(null)

  useEffect(() => {
    const bookingId = params.id as string
    const bookingData = bookingStore.getById(bookingId)

    if (bookingData) {
      setBooking(bookingData)
      setAmbulance(ambulanceStore.getById(bookingData.ambulanceId) || null)
      setProvider(providerStore.getById(bookingData.providerId) || null)
    }
  }, [params.id])

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-foreground">Booking Not Found</h2>
        <Button asChild className="mt-4">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Booking Submitted!</h1>
          <p className="mt-2 text-muted-foreground">
            Your booking request has been sent to the provider. You will be notified once it&apos;s confirmed.
          </p>
        </div>

        {/* Booking Summary Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Booking ID</p>
                <p className="font-mono text-foreground">{booking.id}</p>
              </div>
              <BookingStatusBadge status={booking.status} />
            </div>

            <div className="space-y-4">
              {/* Provider & Ambulance */}
              <div className="flex items-start justify-between rounded-lg bg-muted/50 p-4">
                <div>
                  <p className="font-medium text-foreground">{provider?.companyName}</p>
                  <p className="text-sm text-muted-foreground">{ambulance?.vehicleNumber}</p>
                </div>
                {ambulance && <AmbulanceTypeBadge type={ambulance.type} />}
              </div>

              {/* Trip Details */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Pickup</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <p className="text-sm text-foreground">{booking.pickupLocation.address}</p>
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium uppercase text-muted-foreground">Drop</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                    <p className="text-sm text-foreground">{booking.dropLocation.address}</p>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{booking.time}</span>
                </div>
              </div>

              {/* Patient Info */}
              <div className="border-t border-border pt-4">
                <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Patient</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{booking.patientName}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{booking.patientAge} years</span>
                </div>
              </div>

              {/* Driver Contact */}
              {ambulance && (
                <div className="border-t border-border pt-4">
                  <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Driver Contact</p>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-foreground">{ambulance.driverName}</span>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {ambulance.driverPhone}
                    </div>
                  </div>
                </div>
              )}

              {/* Cost */}
              <div className="flex items-center justify-between rounded-lg bg-primary/5 p-4">
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Cost</p>
                  <p className="text-sm text-muted-foreground">{booking.distance} km trip</p>
                </div>
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(booking.estimatedCost)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Notice */}
        <Card className="mb-6 border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <p className="text-sm text-amber-800">
              <strong>What happens next?</strong> The ambulance provider will review your request and confirm the booking. You can track the status in your dashboard.
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="flex-1 gap-2">
            <Link href="/dashboard/bookings">
              View My Bookings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1 gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
