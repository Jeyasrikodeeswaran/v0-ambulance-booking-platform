'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, Clock, AlertCircle, MapPin, User, Phone, Ambulance } from 'lucide-react'
import { format } from 'date-fns'

interface ConfirmationDetails {
  id: string
  patientName: string
  patientPhone: string
  patientAge: number
  pickupLocation: string
  dropLocation: string
  date: string
  time: string
  ambulanceType: string
  status: 'pending' | 'accepted' | 'rejected'
  estimatedCost: number
  createdAt: string
  driver?: {
    name: string
    phone: string
    vehicleNumber: string
    vehicleType: string
  }
}

interface BookingConfirmationCardProps {
  booking: ConfirmationDetails
}

export function BookingConfirmationCard({ booking }: BookingConfirmationCardProps) {
  const statusConfig = {
    pending: {
      label: 'Pending Review',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: Clock,
      description: 'Your request is being reviewed by our admin team',
    },
    accepted: {
      label: 'Confirmed',
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: CheckCircle2,
      description: 'Your ambulance has been confirmed',
    },
    rejected: {
      label: 'Rejected',
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: AlertCircle,
      description: 'Your request could not be fulfilled',
    },
  }

  const config = statusConfig[booking.status]
  const StatusIcon = config.icon

  return (
    <div className="space-y-6">
      {/* Main Confirmation Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Booking Confirmation</CardTitle>
              <CardDescription>Request ID: {booking.id}</CardDescription>
            </div>
            <Badge className={config.color}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {config.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Message */}
          <Alert className={`border ${config.color}`}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {config.description}
              {booking.status === 'pending' && ' - Expected response within 10 minutes'}
            </AlertDescription>
          </Alert>

          {/* Patient Details */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Patient Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex gap-3">
                <User className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">PATIENT NAME</p>
                  <p className="text-sm font-medium text-foreground">{booking.patientName}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">AGE</p>
                  <p className="text-sm font-medium text-foreground">{booking.patientAge} years</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">CONTACT</p>
                  <p className="text-sm font-medium text-foreground">{booking.patientPhone}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Ambulance className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">AMBULANCE TYPE</p>
                  <p className="text-sm font-medium text-foreground capitalize">{booking.ambulanceType}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Journey Details */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Journey Details</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground">PICKUP LOCATION</p>
                  <p className="text-sm font-medium text-foreground">{booking.pickupLocation}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground">DROP LOCATION</p>
                  <p className="text-sm font-medium text-foreground">{booking.dropLocation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Details */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Scheduled Time</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">DATE</p>
                <p className="text-sm font-medium text-foreground">
                  {format(new Date(booking.date), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">TIME</p>
                <p className="text-sm font-medium text-foreground">{booking.time}</p>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Estimated Cost</p>
              <p className="text-2xl font-bold text-foreground">₹{booking.estimatedCost}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Final cost may vary based on actual distance and demand surge pricing
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Driver Details Card (shown when accepted) */}
      {booking.status === 'accepted' && booking.driver && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-green-900">Driver & Vehicle Details</CardTitle>
            <CardDescription className="text-green-700">Your ambulance is on the way</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">DRIVER NAME</p>
                <p className="text-sm font-semibold text-foreground">{booking.driver.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">DRIVER CONTACT</p>
                <p className="text-sm font-semibold text-foreground">{booking.driver.phone}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">VEHICLE NUMBER</p>
                <p className="text-sm font-semibold text-foreground font-mono">{booking.driver.vehicleNumber}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">VEHICLE TYPE</p>
                <p className="text-sm font-semibold text-foreground capitalize">{booking.driver.vehicleType}</p>
              </div>
            </div>
            <Alert className="border-green-200 bg-white">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Share this vehicle number with the patient and emergency contact for safety verification.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Pending Information */}
      {booking.status === 'pending' && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="text-blue-900">What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-200 text-blue-900 text-sm font-semibold flex-shrink-0">1</span>
                <span className="text-sm text-foreground">Your request has been submitted for review</span>
              </li>
              <li className="flex gap-3">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-200 text-blue-900 text-sm font-semibold flex-shrink-0">2</span>
                <span className="text-sm text-foreground">Admin team will verify your request within minutes</span>
              </li>
              <li className="flex gap-3">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-200 text-blue-900 text-sm font-semibold flex-shrink-0">3</span>
                <span className="text-sm text-foreground">Upon approval, you will receive driver and vehicle details</span>
              </li>
              <li className="flex gap-3">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-200 text-blue-900 text-sm font-semibold flex-shrink-0">4</span>
                <span className="text-sm text-foreground">Real-time updates will be shown on this page</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
