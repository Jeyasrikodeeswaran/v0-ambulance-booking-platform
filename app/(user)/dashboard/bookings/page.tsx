'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BookingStatusBadge } from '@/components/booking/booking-status-badge'
import { AmbulanceTypeBadge } from '@/components/ambulance/ambulance-type-badge'
import { useAuth } from '@/lib/context/auth-context'
import { bookingStore, ambulanceStore, providerStore } from '@/lib/data/store'
import { formatPrice } from '@/lib/utils/pricing'
import type { Booking, Ambulance, Provider, BookingStatus } from '@/lib/data/types'
import {
  Calendar,
  MapPin,
  Clock,
  Ambulance as AmbulanceIcon,
  ArrowRight,
  Search,
  Filter,
} from 'lucide-react'
import { format } from 'date-fns'

export default function UserBookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [ambulances, setAmbulances] = useState<Map<string, Ambulance>>(new Map())
  const [providers, setProviders] = useState<Map<string, Provider>>(new Map())
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (user) {
      const userBookings = bookingStore.getByUserId(user.id)
      setBookings(userBookings.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))

      const allAmbulances = ambulanceStore.getAll()
      const allProviders = providerStore.getAll()
      setAmbulances(new Map(allAmbulances.map(a => [a.id, a])))
      setProviders(new Map(allProviders.map(p => [p.id, p])))
    }
  }, [user])

  useEffect(() => {
    let filtered = [...bookings]

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(b => {
        const provider = providers.get(b.providerId)
        return (
          b.patientName.toLowerCase().includes(query) ||
          b.pickupLocation.address.toLowerCase().includes(query) ||
          b.dropLocation.address.toLowerCase().includes(query) ||
          provider?.companyName.toLowerCase().includes(query)
        )
      })
    }

    setFilteredBookings(filtered)
  }, [bookings, statusFilter, searchQuery, providers])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Bookings</h2>
          <p className="text-muted-foreground">View and manage your booking history</p>
        </div>
        <Button asChild>
          <Link href="/search" className="gap-2">
            <AmbulanceIcon className="h-4 w-4" />
            New Booking
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by patient, location, or provider..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as BookingStatus | 'all')}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AmbulanceIcon className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-xl font-semibold text-foreground">No bookings found</h3>
            <p className="mt-2 text-center text-muted-foreground">
              {bookings.length === 0
                ? "You haven't made any bookings yet."
                : 'No bookings match your filters.'}
            </p>
            {bookings.length === 0 && (
              <Button asChild className="mt-4">
                <Link href="/search">Find Ambulance</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const ambulance = ambulances.get(booking.ambulanceId)
            const provider = providers.get(booking.providerId)

            return (
              <Card key={booking.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    <div className="flex-1 p-5">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <BookingStatusBadge status={booking.status} />
                        {ambulance && <AmbulanceTypeBadge type={ambulance.type} />}
                        <span className="text-sm text-muted-foreground">
                          Booked {format(new Date(booking.createdAt), 'MMM d, yyyy')}
                        </span>
                      </div>

                      <h3 className="mb-2 font-semibold text-foreground">
                        {provider?.companyName || 'Provider'}
                      </h3>

                      <div className="mb-4 grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">PICKUP</p>
                          <p className="text-sm text-foreground">{booking.pickupLocation.address}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">DROP</p>
                          <p className="text-sm text-foreground">{booking.dropLocation.address}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(booking.date), 'EEEE, MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {booking.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {booking.distance} km
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-row items-center justify-between gap-4 border-t border-border bg-muted/30 p-5 lg:w-56 lg:flex-col lg:items-end lg:justify-center lg:border-l lg:border-t-0">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Estimated Cost</p>
                        <p className="text-2xl font-bold text-foreground">
                          {formatPrice(booking.estimatedCost)}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/bookings/${booking.id}`}>
                          View Details
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>

                  {/* Driver Details when accepted */}
                  {booking.status === 'accepted' && (
                    <div className="flex flex-col border-t bg-green-50/50 p-5 md:w-56 md:border-l md:border-t-0">
                      <p className="mb-4 text-xs font-semibold uppercase text-green-900">Driver Details</p>
                      <div className="space-y-3 text-sm">
                        <div>
                          <p className="text-xs text-green-700">Driver Name</p>
                          <p className="font-semibold text-foreground">Raj Kumar</p>
                        </div>
                        <div>
                          <p className="text-xs text-green-700">Vehicle Number</p>
                          <p className="font-mono font-semibold text-foreground">DL-01AB1234</p>
                        </div>
                        <div>
                          <p className="text-xs text-green-700">Contact</p>
                          <p className="font-semibold text-foreground">+91 98765 43210</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
