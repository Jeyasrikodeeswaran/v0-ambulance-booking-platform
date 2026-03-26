'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AmbulanceTypeBadge } from './ambulance-type-badge'
import type { Ambulance, Provider } from '@/lib/data/types'
import { formatPrice } from '@/lib/utils/pricing'
import { MapPin, Phone, User, ArrowRight } from 'lucide-react'

interface AmbulanceCardProps {
  ambulance: Ambulance
  provider: Provider
  distance?: number
  estimatedPrice?: number
  searchParams?: string
}

export function AmbulanceCard({
  ambulance,
  provider,
  distance,
  estimatedPrice,
  searchParams,
}: AmbulanceCardProps) {
  const bookingUrl = searchParams
    ? `/booking/${ambulance.id}?${searchParams}`
    : `/booking/${ambulance.id}`

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          {/* Left Section - Ambulance Info */}
          <div className="flex-1 p-5">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{ambulance.vehicleNumber}</h3>
                  <AmbulanceTypeBadge type={ambulance.type} />
                </div>
                <p className="text-sm text-muted-foreground">{provider.companyName}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>Based in {ambulance.baseLocation}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4 shrink-0" />
                <span>Driver: {ambulance.driverName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{ambulance.driverPhone}</span>
              </div>
            </div>
          </div>

          {/* Right Section - Pricing */}
          <div className="flex flex-col justify-between border-t border-border bg-muted/30 p-5 md:w-64 md:border-l md:border-t-0">
            <div>
              <p className="text-sm text-muted-foreground">Base Charge</p>
              <p className="text-lg font-semibold text-foreground">
                {formatPrice(ambulance.baseCharge)}
              </p>
              <p className="text-sm text-muted-foreground">
                + {formatPrice(ambulance.pricePerKm)}/km
              </p>
            </div>

            {distance !== undefined && estimatedPrice !== undefined && (
              <div className="mt-3 rounded-lg bg-primary/5 p-3">
                <p className="text-xs text-muted-foreground">Estimated for {distance} km</p>
                <p className="text-xl font-bold text-primary">
                  {formatPrice(estimatedPrice)}
                </p>
              </div>
            )}

            <Button asChild className="mt-4 w-full gap-2">
              <Link href={bookingUrl}>
                Book Now
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
