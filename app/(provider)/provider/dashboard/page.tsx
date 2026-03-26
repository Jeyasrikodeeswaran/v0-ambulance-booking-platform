'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth-context'
import { ambulanceStore, bookingStore, settingsStore } from '@/lib/data/store'
import type { ProviderStats, Ambulance, Booking } from '@/lib/data/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AmbulanceTypeBadge } from '@/components/ambulance/ambulance-type-badge'
import { BookingStatusBadge } from '@/components/booking/booking-status-badge'
import {
  Ambulance as AmbulanceIcon,
  Calendar,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  IndianRupee,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'

export default function ProviderDashboardPage() {
  const { provider } = useAuth()
  const [stats, setStats] = useState<ProviderStats>({
    totalAmbulances: 0,
    activeBookings: 0,
    completedTrips: 0,
    pendingRequests: 0,
    totalRevenue: 0,
  })
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [ambulances, setAmbulances] = useState<Ambulance[]>([])

  useEffect(() => {
    if (!provider) return

    // Load ambulances
    const providerAmbulances = ambulanceStore.getByProviderId(provider.id)
    setAmbulances(providerAmbulances)

    // Load bookings
    const providerBookings = bookingStore.getByProviderId(provider.id)
    
    // Calculate stats
    const settings = settingsStore.get()
    const completedBookings = providerBookings.filter(b => b.status === 'completed')
    const grossRevenue = completedBookings.reduce((sum, b) => sum + b.estimatedCost, 0)
    const netRevenue = grossRevenue * (1 - settings.commissionPercentage / 100)

    setStats({
      totalAmbulances: providerAmbulances.length,
      activeBookings: providerBookings.filter(b => b.status === 'accepted').length,
      completedTrips: completedBookings.length,
      pendingRequests: providerBookings.filter(b => b.status === 'pending').length,
      totalRevenue: netRevenue,
    })

    // Recent bookings (last 5)
    const sorted = [...providerBookings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    setRecentBookings(sorted.slice(0, 5))
  }, [provider])

  const statCards = [
    {
      title: 'Total Ambulances',
      value: stats.totalAmbulances,
      icon: AmbulanceIcon,
      description: 'Registered vehicles',
      href: '/provider/ambulances',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Active Bookings',
      value: stats.activeBookings,
      icon: Calendar,
      description: 'Currently accepted',
      href: '/provider/trips',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Completed Trips',
      value: stats.completedTrips,
      icon: CheckCircle,
      description: 'Successfully delivered',
      href: '/provider/earnings',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Earnings',
      value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      description: 'After platform commission',
      href: '/provider/earnings',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="transition-all hover:shadow-md hover:border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pending Requests Alert */}
      {stats.pendingRequests > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-amber-100 p-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-amber-900">
                  {stats.pendingRequests} Pending Booking Request{stats.pendingRequests > 1 ? 's' : ''}
                </p>
                <p className="text-sm text-amber-700">
                  Review and respond to new booking requests
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="border-amber-300 text-amber-900 hover:bg-amber-100">
              <Link href="/provider/bookings">
                View Requests
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ambulances Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Ambulances</CardTitle>
              <CardDescription>Quick overview of your fleet</CardDescription>
            </div>
            <Button asChild size="sm">
              <Link href="/provider/ambulances/new">
                <Plus className="mr-2 h-4 w-4" />
                Add New
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {ambulances.length === 0 ? (
              <div className="py-8 text-center">
                <AmbulanceIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No ambulances registered yet</p>
                <Button asChild size="sm" className="mt-4">
                  <Link href="/provider/ambulances/new">Add Your First Ambulance</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {ambulances.slice(0, 4).map((ambulance) => (
                  <div
                    key={ambulance.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <AmbulanceIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{ambulance.vehicleNumber}</p>
                        <p className="text-sm text-muted-foreground">{ambulance.driverName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AmbulanceTypeBadge type={ambulance.type} />
                      <Badge
                        variant={
                          ambulance.status === 'available'
                            ? 'default'
                            : ambulance.status === 'booked'
                            ? 'secondary'
                            : ambulance.status === 'on_trip'
                            ? 'outline'
                            : 'destructive'
                        }
                        className="capitalize"
                      >
                        {ambulance.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
                {ambulances.length > 4 && (
                  <Button asChild variant="ghost" className="w-full">
                    <Link href="/provider/ambulances">
                      View All ({ambulances.length})
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest booking activity</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/provider/bookings">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No bookings yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{booking.patientName}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {booking.pickupLocation.address}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {booking.date} at {booking.time}
                      </div>
                    </div>
                    <div className="ml-4 flex flex-col items-end gap-1">
                      <BookingStatusBadge status={booking.status} />
                      <span className="text-sm font-medium text-primary">
                        ₹{booking.estimatedCost.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
              <Link href="/provider/ambulances/new">
                <Plus className="h-6 w-6" />
                <span>Add Ambulance</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
              <Link href="/provider/bookings">
                <Calendar className="h-6 w-6" />
                <span>View Requests</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
              <Link href="/provider/trips">
                <Clock className="h-6 w-6" />
                <span>Active Trips</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
              <Link href="/provider/earnings">
                <TrendingUp className="h-6 w-6" />
                <span>View Earnings</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
