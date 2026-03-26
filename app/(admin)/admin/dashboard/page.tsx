'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { userStore, providerStore, bookingStore, ambulanceStore, settingsStore } from '@/lib/data/store'
import type { AdminStats, Provider, Booking } from '@/lib/data/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookingStatusBadge } from '@/components/booking/booking-status-badge'
import {
  Users,
  Building2,
  Calendar,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProviders: 0,
    pendingApprovals: 0,
    totalBookings: 0,
    totalRevenue: 0,
    platformCommission: 0,
  })
  const [pendingProviders, setPendingProviders] = useState<Provider[]>([])
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])

  useEffect(() => {
    // Load data
    const users = userStore.getAll().filter(u => u.role === 'user')
    const providers = providerStore.getAll()
    const bookings = bookingStore.getAll()
    const settings = settingsStore.get()

    // Calculate stats
    const completedBookings = bookings.filter(b => b.status === 'completed')
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.estimatedCost, 0)
    const platformCommission = totalRevenue * (settings.commissionPercentage / 100)

    setStats({
      totalUsers: users.length,
      totalProviders: providers.filter(p => p.status === 'approved').length,
      pendingApprovals: providers.filter(p => p.status === 'pending').length,
      totalBookings: bookings.length,
      totalRevenue,
      platformCommission,
    })

    // Pending providers
    setPendingProviders(providers.filter(p => p.status === 'pending').slice(0, 3))

    // Recent bookings
    const sorted = [...bookings].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    setRecentBookings(sorted.slice(0, 5))
  }, [])

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      description: 'Registered patients',
      href: '/admin/users',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Approved Providers',
      value: stats.totalProviders,
      icon: Building2,
      description: 'Active ambulance providers',
      href: '/admin/providers/list',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: Calendar,
      description: 'All-time bookings',
      href: '/admin/bookings',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Platform Commission',
      value: `₹${stats.platformCommission.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      description: 'Total earnings',
      href: '/admin/settings',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
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

      {/* Pending Approvals Alert */}
      {stats.pendingApprovals > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-amber-100 p-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-amber-900">
                  {stats.pendingApprovals} Provider{stats.pendingApprovals > 1 ? 's' : ''} Awaiting Approval
                </p>
                <p className="text-sm text-amber-700">
                  Review and approve new provider registrations
                </p>
              </div>
            </div>
            <Button asChild variant="outline" className="border-amber-300 text-amber-900 hover:bg-amber-100">
              <Link href="/admin/providers">
                Review Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Providers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>New provider registrations</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/providers">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pendingProviders.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No pending approvals
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingProviders.map((provider) => (
                  <div
                    key={provider.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                        <Building2 className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium">{provider.companyName}</p>
                        <p className="text-sm text-muted-foreground">{provider.serviceArea}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                      Pending
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest platform activity</CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/bookings">
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

      {/* Revenue Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
          <CardDescription>Platform earnings breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">Gross Revenue</p>
              <p className="mt-1 text-2xl font-bold">
                ₹{stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Total booking value</p>
            </div>
            <div className="rounded-lg border border-accent/50 bg-accent/5 p-4">
              <p className="text-sm text-muted-foreground">Platform Commission</p>
              <p className="mt-1 text-2xl font-bold text-accent">
                ₹{stats.platformCommission.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {settingsStore.get().commissionPercentage}% of total revenue
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">Provider Payouts</p>
              <p className="mt-1 text-2xl font-bold">
                ₹{(stats.totalRevenue - stats.platformCommission).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Amount to providers</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
