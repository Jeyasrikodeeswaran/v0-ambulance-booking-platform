'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookingStatusBadge } from '@/components/booking/booking-status-badge'
import { AmbulanceTypeBadge } from '@/components/ambulance/ambulance-type-badge'
import { useAuth } from '@/lib/context/auth-context'
import { bookingStore, ambulanceStore, providerStore } from '@/lib/data/store'
import { formatPrice } from '@/lib/utils/pricing'
import type { Booking, Ambulance, Provider } from '@/lib/data/types'
import {
  Calendar,
  MapPin,
  Clock,
  Ambulance as AmbulanceIcon,
  ArrowRight,
  Search,
} from 'lucide-react'
import { format } from 'date-fns'

export default function UserDashboardPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [ambulances, setAmbulances] = useState<Map<string, Ambulance>>(new Map())
  const [providers, setProviders] = useState<Map<string, Provider>>(new Map())

  useEffect(() => {
    if (user) {
      const userBookings = bookingStore.getByUserId(user.id)
      setBookings(userBookings.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))

      // Load ambulances and providers
      const allAmbulances = ambulanceStore.getAll()
      const allProviders = providerStore.getAll()
      setAmbulances(new Map(allAmbulances.map(a => [a.id, a])))
      setProviders(new Map(allProviders.map(p => [p.id, p])))
    }
  }, [user])

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    accepted: bookings.filter(b => b.status === 'accepted').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  }

  const recentBookings = bookings.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Welcome back, {user?.fullName}</h2>
          <p className="text-muted-foreground">Here&apos;s an overview of your bookings</p>
        </div>
        <Button asChild>
          <Link href="/search" className="gap-2">
            <Search className="h-4 w-4" />
            Book Ambulance
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <AmbulanceIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.accepted}</p>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100">
                <Calendar className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Bookings</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/bookings">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AmbulanceIcon className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 font-semibold text-foreground">No bookings yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Start by searching for an ambulance
              </p>
              <Button asChild className="mt-4">
                <Link href="/search">Find Ambulance</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => {
                const ambulance = ambulances.get(booking.ambulanceId)
                const provider = providers.get(booking.providerId)

                return (
                  <div
                    key={booking.id}
                    className="flex flex-col gap-4 rounded-lg border border-border p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <BookingStatusBadge status={booking.status} />
                        {ambulance && <AmbulanceTypeBadge type={ambulance.type} />}
                      </div>
                      <p className="font-medium text-foreground">
                        {provider?.companyName || 'Provider'}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(booking.date), 'MMM d, yyyy')}
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
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-foreground">
                          {formatPrice(booking.estimatedCost)}
                        </p>
                        <p className="text-xs text-muted-foreground">Estimated</p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/bookings/${booking.id}`}>
                          Details
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
