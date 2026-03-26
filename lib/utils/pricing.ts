import type { Ambulance, AmbulanceType } from '@/lib/data/types'

// Calculate estimated price for a trip
export function calculatePrice(
  baseCharge: number,
  pricePerKm: number,
  distance: number
): number {
  return Math.round((baseCharge + pricePerKm * distance) * 100) / 100
}

// Calculate estimated trip duration (assuming average speed of 30 km/h in city traffic)
export function calculateDuration(distance: number): number {
  const averageSpeedKmh = 30
  return Math.ceil((distance / averageSpeedKmh) * 60) // Returns minutes
}

// Format duration to human readable string
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours} hr`
  }
  return `${hours} hr ${remainingMinutes} min`
}

// Calculate end time based on start time and duration
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number)
  const startDate = new Date()
  startDate.setHours(hours, minutes, 0, 0)
  startDate.setMinutes(startDate.getMinutes() + durationMinutes)
  
  return `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`
}

// Format price to INR
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// Get ambulance type details
export function getAmbulanceTypeDetails(type: AmbulanceType): {
  label: string
  description: string
  color: string
} {
  const typeMap = {
    basic: {
      label: 'Basic',
      description: 'Standard patient transport without medical equipment',
      color: 'bg-emerald-100 text-emerald-800',
    },
    oxygen: {
      label: 'Oxygen Support',
      description: 'Equipped with oxygen supply for respiratory support',
      color: 'bg-sky-100 text-sky-800',
    },
    icu: {
      label: 'ICU/Critical',
      description: 'Full ICU equipment for critical care transport',
      color: 'bg-rose-100 text-rose-800',
    },
  }
  return typeMap[type]
}

// Compare ambulances by price for a given distance
export function compareAmbulancesByPrice(
  ambulances: Ambulance[],
  distance: number
): Array<Ambulance & { estimatedPrice: number }> {
  return ambulances
    .map(ambulance => ({
      ...ambulance,
      estimatedPrice: calculatePrice(ambulance.baseCharge, ambulance.pricePerKm, distance),
    }))
    .sort((a, b) => a.estimatedPrice - b.estimatedPrice)
}

// Calculate commission amount
export function calculateCommission(totalAmount: number, commissionPercentage: number): number {
  return Math.round((totalAmount * commissionPercentage) / 100)
}

// Calculate provider earnings after commission
export function calculateProviderEarnings(totalAmount: number, commissionPercentage: number): number {
  return totalAmount - calculateCommission(totalAmount, commissionPercentage)
}
