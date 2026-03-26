'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { SearchForm } from '@/components/search/search-form'
import { AmbulanceCard } from '@/components/ambulance/ambulance-card'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ambulanceStore, providerStore } from '@/lib/data/store'
import { calculatePrice } from '@/lib/utils/pricing'
import { parseLocationToCoordinates, calculateStraightLineDistance, estimateDrivingDistance } from '@/lib/utils/distance'
import type { Ambulance, Provider, AmbulanceType } from '@/lib/data/types'
import { Ambulance as AmbulanceIcon, Filter, SortAsc } from 'lucide-react'

function SearchResultsContent() {
  const searchParams = useSearchParams()
  const [ambulances, setAmbulances] = useState<Ambulance[]>([])
  const [providers, setProviders] = useState<Map<string, Provider>>(new Map())
  const [sortBy, setSortBy] = useState<'price' | 'distance'>('price')
  const [isLoading, setIsLoading] = useState(true)
  const [distance, setDistance] = useState<number>(10) // Default distance

  const pickup = searchParams.get('pickup') || ''
  const drop = searchParams.get('drop') || ''
  const date = searchParams.get('date') || ''
  const time = searchParams.get('time') || ''
  const type = searchParams.get('type') as AmbulanceType | null

  useEffect(() => {
    // Calculate distance between pickup and drop
    if (pickup && drop) {
      const pickupCoords = parseLocationToCoordinates(pickup)
      const dropCoords = parseLocationToCoordinates(drop)
      
      if (pickupCoords && dropCoords) {
        const straightLine = calculateStraightLineDistance(
          pickupCoords.lat,
          pickupCoords.lng,
          dropCoords.lat,
          dropCoords.lng
        )
        setDistance(estimateDrivingDistance(straightLine))
      }
    }

    // Get available ambulances
    const availableAmbulances = ambulanceStore.getAvailable(type || undefined)
    
    // Get all providers
    const allProviders = providerStore.getAll()
    const providerMap = new Map(allProviders.map(p => [p.id, p]))
    
    setAmbulances(availableAmbulances)
    setProviders(providerMap)
    setIsLoading(false)
  }, [pickup, drop, type])

  // Sort ambulances
  const sortedAmbulances = [...ambulances].sort((a, b) => {
    if (sortBy === 'price') {
      const priceA = calculatePrice(a.baseCharge, a.pricePerKm, distance)
      const priceB = calculatePrice(b.baseCharge, b.pricePerKm, distance)
      return priceA - priceB
    }
    return 0
  })

  const searchParamsString = searchParams.toString()

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <AmbulanceIcon className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Searching for available ambulances...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Form */}
      <Card className="mb-8">
        <CardContent className="p-4 md:p-6">
          <SearchForm
            variant="compact"
            defaultValues={{
              pickup,
              drop,
              date: date ? new Date(date) : undefined,
              time,
              type: type || 'all',
            }}
          />
        </CardContent>
      </Card>

      {/* Results Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Available Ambulances</h1>
          <p className="text-muted-foreground">
            {sortedAmbulances.length} ambulance{sortedAmbulances.length !== 1 ? 's' : ''} found
            {pickup && drop && (
              <span className="ml-1">
                for {distance.toFixed(1)} km trip
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'price' | 'distance')}>
            <SelectTrigger className="w-[180px]">
              <SortAsc className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price">Price: Low to High</SelectItem>
              <SelectItem value="distance">Distance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {sortedAmbulances.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AmbulanceIcon className="h-16 w-16 text-muted-foreground/50" />
            <h2 className="mt-4 text-xl font-semibold text-foreground">No Ambulances Available</h2>
            <p className="mt-2 text-center text-muted-foreground">
              No ambulances match your search criteria. Try adjusting your filters or search for a different date/time.
            </p>
            <Button variant="outline" className="mt-6" onClick={() => window.location.href = '/'}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedAmbulances.map((ambulance) => {
            const provider = providers.get(ambulance.providerId)
            if (!provider) return null

            const estimatedPrice = calculatePrice(
              ambulance.baseCharge,
              ambulance.pricePerKm,
              distance
            )

            return (
              <AmbulanceCard
                key={ambulance.id}
                ambulance={ambulance}
                provider={provider}
                distance={distance}
                estimatedPrice={estimatedPrice}
                searchParams={searchParamsString}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <AmbulanceIcon className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  )
}
