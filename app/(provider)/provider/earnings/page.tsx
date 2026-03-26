'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import { bookingStore, ambulanceStore, settingsStore } from '@/lib/data/store'
import type { Booking, Ambulance } from '@/lib/data/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AmbulanceTypeBadge } from '@/components/ambulance/ambulance-type-badge'
import {
  IndianRupee,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Clock,
  Navigation,
  Ambulance as AmbulanceIcon,
} from 'lucide-react'

interface EarningsData {
  totalEarnings: number
  platformCommission: number
  netEarnings: number
  totalTrips: number
  averagePerTrip: number
  bookings: BookingWithDetails[]
}

interface BookingWithDetails extends Booking {
  ambulance?: Ambulance
}

export default function EarningsPage() {
  const { provider } = useAuth()
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('month')
  const [commissionRate, setCommissionRate] = useState(0)

  useEffect(() => {
    if (!provider) return

    const settings = settingsStore.get()
    setCommissionRate(settings.commissionPercentage)

    // Get all completed bookings for this provider
    const providerBookings = bookingStore.getByProviderId(provider.id)
    const completedBookings = providerBookings.filter((b) => b.status === 'completed')

    // Filter by time range
    const now = new Date()
    const filteredBookings = completedBookings.filter((booking) => {
      const bookingDate = new Date(booking.date)
      switch (timeRange) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return bookingDate >= weekAgo
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return bookingDate >= monthAgo
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          return bookingDate >= yearAgo
        default:
          return true
      }
    })

    // Enrich with ambulance details
    const enrichedBookings = filteredBookings.map((booking) => ({
      ...booking,
      ambulance: ambulanceStore.getById(booking.ambulanceId),
    }))

    // Sort by date (newest first)
    enrichedBookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Calculate totals
    const totalEarnings = enrichedBookings.reduce((sum, b) => sum + b.estimatedCost, 0)
    const platformCommission = totalEarnings * (settings.commissionPercentage / 100)
    const netEarnings = totalEarnings - platformCommission

    setEarnings({
      totalEarnings,
      platformCommission,
      netEarnings,
      totalTrips: enrichedBookings.length,
      averagePerTrip: enrichedBookings.length > 0 ? netEarnings / enrichedBookings.length : 0,
      bookings: enrichedBookings,
    })
  }, [provider, timeRange])

  // Group bookings by date for chart/breakdown
  const dailyBreakdown = useMemo(() => {
    if (!earnings) return []

    const grouped = earnings.bookings.reduce((acc, booking) => {
      const date = booking.date
      if (!acc[date]) {
        acc[date] = { date, trips: 0, earnings: 0 }
      }
      acc[date].trips += 1
      acc[date].earnings += booking.estimatedCost * (1 - commissionRate / 100)
      return acc
    }, {} as Record<string, { date: string; trips: number; earnings: number }>)

    return Object.values(grouped).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [earnings, commissionRate])

  if (!earnings) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const timeRangeLabel = {
    week: 'This Week',
    month: 'This Month',
    year: 'This Year',
    all: 'All Time',
  }[timeRange]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Earnings</h1>
          <p className="text-muted-foreground">
            Track your revenue and trip earnings
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Earnings
            </CardTitle>
            <div className="rounded-lg bg-green-100 p-2">
              <IndianRupee className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{earnings.totalEarnings.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">Gross earnings {timeRangeLabel.toLowerCase()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Platform Commission
            </CardTitle>
            <div className="rounded-lg bg-red-100 p-2">
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -₹{earnings.platformCommission.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">{commissionRate}% platform fee</p>
          </CardContent>
        </Card>

        <Card className="border-accent/50 bg-accent/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Earnings
            </CardTitle>
            <div className="rounded-lg bg-accent/20 p-2">
              <TrendingUp className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              ₹{earnings.netEarnings.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">Your take-home {timeRangeLabel.toLowerCase()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Trips
            </CardTitle>
            <div className="rounded-lg bg-primary/10 p-2">
              <AmbulanceIcon className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnings.totalTrips}</div>
            <p className="text-xs text-muted-foreground">
              Avg ₹{earnings.averagePerTrip.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/trip
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Breakdown */}
      {dailyBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Breakdown</CardTitle>
            <CardDescription>Earnings grouped by date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dailyBreakdown.slice(0, 7).map((day) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {new Date(day.date).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {day.trips} trip{day.trips > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-accent">
                      ₹{day.earnings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-muted-foreground">Net earnings</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trip History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trip History</CardTitle>
          <CardDescription>Detailed breakdown of all completed trips</CardDescription>
        </CardHeader>
        <CardContent>
          {earnings.bookings.length === 0 ? (
            <div className="py-8 text-center">
              <IndianRupee className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No completed trips {timeRangeLabel.toLowerCase()}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Ambulance</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead className="text-right">Net</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {earnings.bookings.map((booking) => {
                    const gross = booking.estimatedCost
                    const commission = gross * (commissionRate / 100)
                    const net = gross - commission

                    return (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {new Date(booking.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </p>
                            <p className="text-xs text-muted-foreground">{booking.time}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{booking.patientName}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {booking.pickupLocation.address}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {booking.ambulance ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{booking.ambulance.vehicleNumber}</span>
                              <AmbulanceTypeBadge type={booking.ambulance.type} />
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1">
                            <Navigation className="h-3 w-3 text-muted-foreground" />
                            {booking.distance.toFixed(1)} km
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{gross.toLocaleString('en-IN')}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          -₹{commission.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-accent">
                          ₹{net.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
