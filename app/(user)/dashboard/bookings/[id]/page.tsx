'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookingStatusBadge } from '@/components/booking/booking-status-badge'
import { AmbulanceTypeBadge } from '@/components/ambulance/ambulance-type-badge'
import { useAuth } from '@/lib/context/auth-context'
import { bookingStore, ambulanceStore, providerStore } from '@/lib/data/store'
import { formatPrice, formatDuration, calculateDuration } from '@/lib/utils/pricing'
import type { Booking, Ambulance, Provider } from '@/lib/data/types'
import { toast } from 'sonner'
import {
  Calendar,
  MapPin,
  Clock,
  User,
  Phone,
  FileText,
  ArrowLeft,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { format } from 'date-fns'

export default function BookingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [ambulance, setAmbulance] = useState<Ambulance | null>(null)
  const [provider, setProvider] = useState<Provider | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const bookingId = params.id as string
    const bookingData = bookingStore.getById(bookingId)

    if (bookingData && bookingData.userId === user?.id) {
      setBooking(bookingData)
      setAmbulance(ambulanceStore.getById(bookingData.ambulanceId) || null)
      setProvider(providerStore.getById(bookingData.providerId) || null)
    }
    setIsLoading(false)
  }, [params.id, user])

  const handleCancelBooking = () => {
    if (!booking) return

    if (booking.status !== 'pending') {
      toast.error('Only pending bookings can be cancelled')
      return
    }

    bookingStore.update(booking.id, { status: 'cancelled' })
    setBooking({ ...booking, status: 'cancelled' })
    toast.success('Booking cancelled successfully')
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-semibold text-foreground">Booking Not Found</h2>
        <p className="mt-2 text-muted-foreground">This booking does not exist or you don&apos;t have access to it.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/bookings">Back to Bookings</Link>
        </Button>
      </div>
    )
  }

  const estimatedDuration = calculateDuration(booking.distance)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/bookings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-foreground">Booking Details</h2>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Booking ID: {booking.id}
          </p>
        </div>
        {booking.status === 'pending' && (
          <Button variant="destructive" onClick={handleCancelBooking}>
            <X className="mr-2 h-4 w-4" />
            Cancel Booking
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Trip Details */}
          <Card>
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Pickup Location</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <p className="text-foreground">{booking.pickupLocation.address}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase text-muted-foreground">Drop Location</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                    <p className="text-foreground">{booking.dropLocation.address}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">
                    {format(new Date(booking.date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="font-medium text-foreground">{booking.time}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="font-medium text-foreground">{booking.distance} km</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Est. Duration</p>
                  <p className="font-medium text-foreground">{formatDuration(estimatedDuration)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient Details */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Patient Name</p>
                    <p className="font-medium text-foreground">{booking.patientName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Age</p>
                    <p className="font-medium text-foreground">{booking.patientAge} years</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Medical Condition</p>
                <p className="mt-1 text-foreground">{booking.patientCondition}</p>
              </div>

              <div className="flex flex-wrap gap-4">
                {booking.needOxygen && (
                  <div className="flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-sm text-sky-800">
                    <CheckCircle className="h-4 w-4" />
                    Oxygen Required
                  </div>
                )}
                {booking.wheelchairRequired && (
                  <div className="flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">
                    <CheckCircle className="h-4 w-4" />
                    Wheelchair Required
                  </div>
                )}
              </div>

              {booking.specialInstructions && (
                <div>
                  <p className="text-xs text-muted-foreground">Special Instructions</p>
                  <p className="mt-1 text-foreground">{booking.specialInstructions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ambulance Details */}
          <Card>
            <CardHeader>
              <CardTitle>Ambulance Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ambulance && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{ambulance.vehicleNumber}</p>
                    <AmbulanceTypeBadge type={ambulance.type} />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Driver: {ambulance.driverName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{ambulance.driverPhone}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Provider Details */}
          <Card>
            <CardHeader>
              <CardTitle>Provider</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {provider && (
                <>
                  <p className="font-medium text-foreground">{provider.companyName}</p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{provider.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{provider.serviceArea}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Cost Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Base Charge</span>
                <span className="text-foreground">{formatPrice(ambulance?.baseCharge || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Distance ({booking.distance} km)</span>
                <span className="text-foreground">
                  {formatPrice((ambulance?.pricePerKm || 0) * booking.distance)}
                </span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Estimated Total</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(booking.estimatedCost)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
