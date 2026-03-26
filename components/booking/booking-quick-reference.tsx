'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  MapPin,
  User,
  Ambulance,
} from 'lucide-react'

interface QuickReferenceProps {
  bookingId?: string
  status?: 'pending' | 'accepted' | 'rejected'
  driverName?: string
  vehicleNumber?: string
  driverPhone?: string
}

export function BookingQuickReference({
  bookingId,
  status,
  driverName,
  vehicleNumber,
  driverPhone,
}: QuickReferenceProps) {
  const statusConfig = {
    pending: {
      label: 'Pending Review',
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      bgColor: 'bg-yellow-50',
    },
    accepted: {
      label: 'Confirmed',
      icon: CheckCircle2,
      color: 'bg-green-100 text-green-800 border-green-300',
      bgColor: 'bg-green-50',
    },
    rejected: {
      label: 'Rejected',
      icon: AlertCircle,
      color: 'bg-red-100 text-red-800 border-red-300',
      bgColor: 'bg-red-50',
    },
  }

  if (!status) return null

  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <Card className={`border-l-4 ${config.bgColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Booking Status</CardTitle>
          <Badge className={config.color}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Booking ID */}
        {bookingId && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Booking ID</span>
            <code className="font-mono font-semibold text-foreground">{bookingId}</code>
          </div>
        )}

        {/* Status-specific information */}
        {status === 'pending' && (
          <div className="rounded-lg bg-white/50 p-3 text-sm">
            <p className="font-medium text-foreground mb-2">What to expect:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Review in progress (typically ~10 minutes)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3" />
                You'll receive driver details once approved
              </li>
            </ul>
          </div>
        )}

        {status === 'accepted' && driverName && vehicleNumber && (
          <div className="space-y-3 rounded-lg bg-white/50 p-3">
            <div className="flex items-start gap-3">
              <User className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Driver</p>
                <p className="font-semibold text-foreground">{driverName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Ambulance className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Vehicle Number</p>
                <p className="font-mono font-semibold text-foreground">{vehicleNumber}</p>
              </div>
            </div>

            {driverPhone && (
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Contact</p>
                  <a
                    href={`tel:${driverPhone}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    {driverPhone}
                  </a>
                </div>
              </div>
            )}

            <div className="mt-3 rounded border border-green-200 bg-green-50 p-2 text-xs text-green-700">
              Your ambulance is confirmed and on the way. Safe travels!
            </div>
          </div>
        )}

        {status === 'rejected' && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <p className="font-medium mb-2">Unfortunately, we couldn't fulfill this request.</p>
            <p className="text-xs">
              Please contact our support team for more information or try booking again with different parameters.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
