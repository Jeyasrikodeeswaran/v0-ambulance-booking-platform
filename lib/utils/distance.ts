// Distance calculation utilities using Google Maps API

interface DistanceResult {
  distance: number // in kilometers
  duration: number // in minutes
  distanceText: string
  durationText: string
}

// Calculate straight-line distance between two coordinates (Haversine formula)
// Used as fallback when Google Maps API is not available
export function calculateStraightLineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

// Estimate driving distance from straight-line distance
// Typically driving distance is 1.3-1.5x straight-line distance
export function estimateDrivingDistance(straightLineDistance: number): number {
  const multiplier = 1.4 // Average road-to-straight-line ratio
  return Math.round(straightLineDistance * multiplier * 10) / 10
}

// Calculate distance using Google Maps Distance Matrix API
export async function calculateGoogleMapsDistance(
  origin: { lat: number; lng: number } | string,
  destination: { lat: number; lng: number } | string
): Promise<DistanceResult | null> {
  // Check if Google Maps is loaded
  if (typeof window === 'undefined' || !window.google?.maps) {
    console.warn('Google Maps not loaded, using fallback distance calculation')
    return null
  }

  return new Promise((resolve) => {
    const service = new google.maps.DistanceMatrixService()
    
    const originLatLng = typeof origin === 'string' 
      ? origin 
      : new google.maps.LatLng(origin.lat, origin.lng)
    
    const destLatLng = typeof destination === 'string'
      ? destination
      : new google.maps.LatLng(destination.lat, destination.lng)

    service.getDistanceMatrix(
      {
        origins: [originLatLng],
        destinations: [destLatLng],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status !== 'OK' || !response) {
          console.warn('Distance Matrix API error:', status)
          resolve(null)
          return
        }

        const element = response.rows[0]?.elements[0]
        if (!element || element.status !== 'OK') {
          console.warn('No route found')
          resolve(null)
          return
        }

        resolve({
          distance: element.distance.value / 1000, // Convert meters to km
          duration: Math.ceil(element.duration.value / 60), // Convert seconds to minutes
          distanceText: element.distance.text,
          durationText: element.duration.text,
        })
      }
    )
  })
}

// Calculate distance with fallback
export async function calculateDistance(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<DistanceResult> {
  // Try Google Maps first
  const googleResult = await calculateGoogleMapsDistance(origin, destination)
  
  if (googleResult) {
    return googleResult
  }
  
  // Fallback to straight-line calculation
  const straightLine = calculateStraightLineDistance(
    origin.lat,
    origin.lng,
    destination.lat,
    destination.lng
  )
  
  const drivingDistance = estimateDrivingDistance(straightLine)
  const estimatedDuration = Math.ceil(drivingDistance / 30 * 60) // Assume 30 km/h average
  
  return {
    distance: drivingDistance,
    duration: estimatedDuration,
    distanceText: `${drivingDistance} km (estimated)`,
    durationText: `${estimatedDuration} min (estimated)`,
  }
}

// Parse location string to coordinates (mock implementation)
// In production, use Google Geocoding API
export function parseLocationToCoordinates(address: string): { lat: number; lng: number } | null {
  // Chennai area coordinates for demo
  const chennaiLocations: Record<string, { lat: number; lng: number }> = {
    'chennai': { lat: 13.0827, lng: 80.2707 },
    'anna nagar': { lat: 13.0850, lng: 80.2101 },
    't nagar': { lat: 13.0418, lng: 80.2341 },
    'adyar': { lat: 13.0012, lng: 80.2565 },
    'mylapore': { lat: 13.0368, lng: 80.2676 },
    'velachery': { lat: 12.9815, lng: 80.2180 },
    'porur': { lat: 13.0351, lng: 80.1418 },
    'vadapalani': { lat: 13.0505, lng: 80.2121 },
    'saidapet': { lat: 13.0215, lng: 80.2245 },
    'perumbakkam': { lat: 12.9063, lng: 80.2006 },
    'manapakkam': { lat: 13.0126, lng: 80.1681 },
    'alwarpet': { lat: 13.0336, lng: 80.2495 },
    'greams road': { lat: 13.0607, lng: 80.2501 },
  }
  
  const lowerAddress = address.toLowerCase()
  
  for (const [key, coords] of Object.entries(chennaiLocations)) {
    if (lowerAddress.includes(key)) {
      // Add some randomness to make locations slightly different
      return {
        lat: coords.lat + (Math.random() - 0.5) * 0.01,
        lng: coords.lng + (Math.random() - 0.5) * 0.01,
      }
    }
  }
  
  // Default to Chennai center with random offset
  return {
    lat: 13.0827 + (Math.random() - 0.5) * 0.05,
    lng: 80.2707 + (Math.random() - 0.5) * 0.05,
  }
}
