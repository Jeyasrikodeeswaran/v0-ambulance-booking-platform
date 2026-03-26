'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import { bookingStore, ambulanceStore, userStore } from '@/lib/data/store'
import type { Booking, Ambulance, User } from '@/lib/data/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AmbulanceTypeBadge } from '@/components/ambulance/ambulance-type-badge'
import {
  Calendar,
  Clock,
  MapPin,
  User as UserIcon,
  Phone,
  Ambulance as AmbulanceIcon,
  Play,
  CheckCircle,
  Navigation,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'

interface BookingWithDetails extends Booking {
  ambulance?: Ambulance
  user?: User
}

export default function ActiveTripsPage() {
  const { provider } = useAuth()
  const [activeTrips, setActiveTrips] = useState<BookingWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTrip, setSelectedTrip] = useState<BookingWithDetails | null>(null)
  const [actionType, setActionType] = useState<'start' | 'complete' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const loadTrips = useCallback(() => {
    if (!provider) return

    const providerBookings = bookingStore.getByProviderId(provider.id)
    
    // Filter accepted bookings (ready to start) and on_trip bookings (in progress)
    const activeBookings = providerBookings.filter(
      (b) => b.status === 'accepted'
    )

    // Enrich with details
    const enrichedBookings = activeBookings.map((booking) => ({
      ...booking,
      ambulance: ambulanceStore.getById(booking.ambulanceId),
      user: userStore.getById(booking.userId),
    }))

    // Sort by date and time
    enrichedBookings.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return dateCompare
      return a.time.localeCompare(b.time)
    })

    setActiveTrips(enrichedBookings)
    setIsLoading(false)
  }, [provider])

  useEffect(() => {
    loadTrips()
  }, [loadTrips])

  // Polling for updates
  useEffect(() => {
    const interval = setInterval(loadTrips, 5000)
    return () => clearInterval(interval)
  }, [loadTrips])

  const handleStartTrip = async () => {
    if (!selectedTrip) return

    setIsProcessing(true)

    try {
      // Update ambulance status to on_trip
      ambulanceStore.update(selectedTrip.ambulanceId, { status: 'on_trip' })

      toast.success('Trip started! Drive safely.')
      loadTrips()
    } catch {
      toast.error('Failed to start trip. Please try again.')
    } finally {
      setIsProcessing(false)
      setSelectedTrip(null)
      setActionType(null)
    }
  }

  const handleCompleteTrip = async () => {
    if (!selectedTrip) return

    setIsProcessing(true)

    try {
      // Update booking status to completed
      bookingStore.update(selectedTrip.id, { status: 'completed' })

      // Update ambulance status back to available
      ambulanceStore.update(selectedTrip.ambulanceId, { status: 'available' })

      toast.success('Trip completed successfully!')
      loadTrips()
    } catch {
      toast.error('Failed to complete trip. Please try again.')
    } finally {
      setIsProcessing(false)
      setSelectedTrip(null)
      setActionType(null)
    }
  }

  // Get trips that haven't started yet (ambulance is 'booked')
  const upcomingTrips = activeTrips.filter(
    (t) => t.ambulance?.status === 'booked'
  )

  // Get trips that are in progress (ambulance is 'on_trip')
  const inProgressTrips = activeTrips.filter(
    (t) => t.ambulance?.status === 'on_trip'
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Active Trips</h1>
          <p className="text-muted-foreground">
            Manage your ongoing and upcoming trips
          </p>
        </div>
        <Button variant="outline" onClick={loadTrips}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* In Progress Section */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <div className="h-3 w-3 animate-pulse rounded-full bg-amber-500" />
          In Progress ({inProgressTrips.length})
        </h2>
        {inProgressTrips.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <AmbulanceIcon className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No trips in progress</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {inProgressTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                isInProgress
                onComplete={() => {
                  setSelectedTrip(trip)
                  setActionType('complete')
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Section */}
      <div>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Clock className="h-5 w-5 text-primary" />
          Upcoming Trips ({upcomingTrips.length})
        </h2>
        {upcomingTrips.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">No upcoming trips</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {upcomingTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                isInProgress={false}
                onStart={() => {
                  setSelectedTrip(trip)
                  setActionType('start')
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Start Trip Dialog */}
      <AlertDialog open={actionType === 'start'} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Are you ready to start the trip for{' '}
              <span className="font-semibold">{selectedTrip?.patientName}</span>? Make sure you have
              arrived at the pickup location.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStartTrip}
              disabled={isProcessing}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Trip
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Trip Dialog */}
      <AlertDialog open={actionType === 'complete'} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Trip</AlertDialogTitle>
            <AlertDialogDescription>
              Have you safely delivered{' '}
              <span className="font-semibold">{selectedTrip?.patientName}</span> to their
              destination? This will mark the trip as completed and the ambulance as available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCompleteTrip}
              disabled={isProcessing}
              className="bg-accent hover:bg-accent/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Complete Trip
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Trip Card Component
function TripCard({
  trip,
  isInProgress,
  onStart,
  onComplete,
}: {
  trip: BookingWithDetails
  isInProgress: boolean
  onStart?: () => void
  onComplete?: () => void
}) {
  return (
    <Card className={isInProgress ? 'border-amber-200 bg-amber-50/50' : ''}>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          {/* Main Info */}
          <div className="flex-1 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{trip.patientName}</h3>
                  {isInProgress && (
                    <Badge className="bg-amber-100 text-amber-700">In Progress</Badge>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {trip.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {trip.time}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">
                  ₹{trip.estimatedCost.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Route */}
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                  <div className="h-2 w-2 rounded-full bg-green-600" />
                </div>
                <div className="h-8 w-0.5 bg-border" />
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
                  <div className="h-2 w-2 rounded-full bg-red-600" />
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">PICKUP</p>
                  <p className="text-sm">{trip.pickupLocation.address}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">DROP</p>
                  <p className="text-sm">{trip.dropLocation.address}</p>
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Navigation className="h-4 w-4" />
                {trip.distance.toFixed(1)} km
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <UserIcon className="h-4 w-4" />
                Age: {trip.patientAge}
              </span>
              {trip.needOxygen && (
                <Badge variant="outline">Oxygen Required</Badge>
              )}
              {trip.wheelchairRequired && (
                <Badge variant="outline">Wheelchair</Badge>
              )}
            </div>

            {/* Ambulance Info */}
            {trip.ambulance && (
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <AmbulanceIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{trip.ambulance.vehicleNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {trip.ambulance.driverName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${trip.ambulance.driverPhone}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {trip.ambulance.driverPhone}
                  </a>
                </div>
                <AmbulanceTypeBadge type={trip.ambulance.type} />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 lg:flex-col">
            {isInProgress ? (
              <Button onClick={onComplete} className="w-full bg-accent hover:bg-accent/90">
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete Trip
              </Button>
            ) : (
              <Button onClick={onStart} className="w-full bg-amber-600 hover:bg-amber-700">
                <Play className="mr-2 h-4 w-4" />
                Start Trip
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
