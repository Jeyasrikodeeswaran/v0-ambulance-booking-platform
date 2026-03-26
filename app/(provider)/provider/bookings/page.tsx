'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth-context'
import { bookingStore, ambulanceStore, userStore } from '@/lib/data/store'
import { isAmbulanceAvailable } from '@/lib/utils/availability'
import { calculateDuration } from '@/lib/utils/pricing'
import type { Booking, Ambulance, User } from '@/lib/data/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { BookingStatusBadge } from '@/components/booking/booking-status-badge'
import {
  Calendar,
  Clock,
  MapPin,
  User as UserIcon,
  Phone,
  Ambulance as AmbulanceIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  IndianRupee,
  Navigation,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'

interface BookingWithDetails extends Booking {
  ambulance?: Ambulance
  user?: User
}

export default function ProviderBookingsPage() {
  const { provider } = useAuth()
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [activeTab, setActiveTab] = useState('pending')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null)
  const [actionType, setActionType] = useState<'accept' | 'reject' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Load bookings with details
  const loadBookings = useCallback(() => {
    if (!provider) return

    const providerBookings = bookingStore.getByProviderId(provider.id)
    
    // Enrich with ambulance and user details
    const enrichedBookings = providerBookings.map((booking) => ({
      ...booking,
      ambulance: ambulanceStore.getById(booking.ambulanceId),
      user: userStore.getById(booking.userId),
    }))

    // Sort by creation date (newest first)
    enrichedBookings.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    setBookings(enrichedBookings)
    setIsLoading(false)
  }, [provider])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  // Polling for new requests
  useEffect(() => {
    const interval = setInterval(loadBookings, 5000)
    return () => clearInterval(interval)
  }, [loadBookings])

  const handleAccept = async () => {
    if (!selectedBooking || !selectedBooking.ambulance) return

    setIsProcessing(true)

    // Check for time slot conflicts
    const duration = calculateDuration(selectedBooking.distance)
    const isAvailable = isAmbulanceAvailable(
      selectedBooking.ambulanceId,
      selectedBooking.date,
      selectedBooking.time,
      duration
    )

    if (!isAvailable) {
      toast.error('Time slot conflict detected. This ambulance is already booked for this time.')
      setIsProcessing(false)
      setSelectedBooking(null)
      setActionType(null)
      return
    }

    try {
      // Update booking status
      bookingStore.update(selectedBooking.id, { status: 'accepted' })

      // Update ambulance status to booked
      ambulanceStore.update(selectedBooking.ambulanceId, { status: 'booked' })

      toast.success('Booking accepted successfully!')
      loadBookings()
    } catch {
      toast.error('Failed to accept booking. Please try again.')
    } finally {
      setIsProcessing(false)
      setSelectedBooking(null)
      setActionType(null)
    }
  }

  const handleReject = async () => {
    if (!selectedBooking) return

    setIsProcessing(true)

    try {
      // Update booking status
      bookingStore.update(selectedBooking.id, { status: 'rejected' })

      toast.success('Booking rejected')
      loadBookings()
    } catch {
      toast.error('Failed to reject booking. Please try again.')
    } finally {
      setIsProcessing(false)
      setSelectedBooking(null)
      setActionType(null)
    }
  }

  const getFilteredBookings = (status: string) => {
    switch (status) {
      case 'pending':
        return bookings.filter((b) => b.status === 'pending')
      case 'accepted':
        return bookings.filter((b) => b.status === 'accepted')
      case 'completed':
        return bookings.filter((b) => b.status === 'completed')
      case 'rejected':
        return bookings.filter((b) => b.status === 'rejected' || b.status === 'cancelled')
      default:
        return bookings
    }
  }

  const pendingCount = bookings.filter((b) => b.status === 'pending').length
  const acceptedCount = bookings.filter((b) => b.status === 'accepted').length

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
          <h1 className="text-2xl font-bold">Booking Requests</h1>
          <p className="text-muted-foreground">
            Manage incoming booking requests and track their status
          </p>
        </div>
        <Button variant="outline" onClick={loadBookings}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingCount > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs" variant="destructive">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted
            {acceptedCount > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs" variant="default">
                {acceptedCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        {['pending', 'accepted', 'completed', 'rejected'].map((status) => (
          <TabsContent key={status} value={status} className="mt-6">
            {getFilteredBookings(status).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-16 w-16 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No {status} bookings</h3>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    {status === 'pending'
                      ? 'New booking requests will appear here'
                      : `Your ${status} bookings will appear here`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {getFilteredBookings(status).map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onAccept={() => {
                      setSelectedBooking(booking)
                      setActionType('accept')
                    }}
                    onReject={() => {
                      setSelectedBooking(booking)
                      setActionType('reject')
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Accept Confirmation Dialog */}
      <AlertDialog open={actionType === 'accept'} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Booking Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to accept this booking for{' '}
              <span className="font-semibold">{selectedBooking?.patientName}</span>? The ambulance
              will be marked as booked and the customer will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAccept}
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
                  Accept Booking
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={actionType === 'reject'} onOpenChange={() => setActionType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Booking Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this booking request? The customer will be notified
              and can choose another provider.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Booking
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Booking Card Component
function BookingCard({
  booking,
  onAccept,
  onReject,
}: {
  booking: BookingWithDetails
  onAccept: () => void
  onReject: () => void
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Main Content */}
          <div className="flex-1 p-6">
            {/* Header */}
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{booking.patientName}</h3>
                  <BookingStatusBadge status={booking.status} />
                </div>
                <p className="text-sm text-muted-foreground">
                  Booking ID: {booking.id.slice(0, 12)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  ₹{booking.estimatedCost.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-muted-foreground">Estimated fare</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Locations */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                    <div className="h-2 w-2 rounded-full bg-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">PICKUP</p>
                    <p className="text-sm">{booking.pickupLocation.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
                    <div className="h-2 w-2 rounded-full bg-red-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">DROP</p>
                    <p className="text-sm">{booking.dropLocation.address}</p>
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Navigation className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.distance.toFixed(1)} km</span>
                </div>
              </div>
            </div>

            {/* Patient Details */}
            <div className="mt-4 rounded-lg bg-muted/50 p-3">
              <h4 className="mb-2 text-sm font-medium">Patient Details</h4>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Age: {booking.patientAge} years</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{booking.patientCondition}</span>
                </div>
                {booking.needOxygen && (
                  <Badge variant="outline" className="w-fit">
                    Oxygen Required
                  </Badge>
                )}
                {booking.wheelchairRequired && (
                  <Badge variant="outline" className="w-fit">
                    Wheelchair Required
                  </Badge>
                )}
              </div>
              {booking.specialInstructions && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Note: {booking.specialInstructions}
                </p>
              )}
            </div>

            {/* Ambulance Info */}
            {booking.ambulance && (
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <AmbulanceIcon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{booking.ambulance.vehicleNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.ambulance.driverName} - {booking.ambulance.driverPhone}
                  </p>
                </div>
                <AmbulanceTypeBadge type={booking.ambulance.type} />
              </div>
            )}
          </div>

          {/* Action Sidebar for Pending */}
          {booking.status === 'pending' && (
            <div className="flex flex-col justify-center gap-3 border-t border-border bg-muted/30 p-6 lg:w-48 lg:border-l lg:border-t-0">
              <Button onClick={onAccept} className="w-full bg-accent hover:bg-accent/90">
                <CheckCircle className="mr-2 h-4 w-4" />
                Accept
              </Button>
              <Button onClick={onReject} variant="outline" className="w-full">
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
