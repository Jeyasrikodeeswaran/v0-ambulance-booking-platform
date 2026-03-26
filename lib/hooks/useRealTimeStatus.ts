import { useEffect, useState, useCallback } from 'react'
import type { Booking } from '@/lib/data/types'

interface UseRealTimeStatusProps {
  bookingId: string
  enabled?: boolean
  pollInterval?: number
}

export function useRealTimeStatus({
  bookingId,
  enabled = true,
  pollInterval = 5000,
}: UseRealTimeStatusProps) {
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasStatusChanged, setHasStatusChanged] = useState(false)

  const fetchBooking = useCallback(async () => {
    try {
      const response = await fetch(`/api/bookings?id=${bookingId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch booking')
      }
      const data = await response.json()
      
      // Check if status changed
      if (booking && booking.status !== data.status) {
        setHasStatusChanged(true)
      }
      
      setBooking(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch booking')
      // Fallback to local store if API fails
      try {
        const { bookingStore } = await import('@/lib/data/store')
        const bookingData = bookingStore.getById(bookingId)
        if (bookingData) {
          setBooking(bookingData)
        }
      } catch {
        console.error('Error fallback to local store:', err)
      }
    } finally {
      setIsLoading(false)
    }
  }, [bookingId, booking])

  useEffect(() => {
    if (!enabled || !bookingId) return

    // Initial fetch
    fetchBooking()

    // Only poll if booking is pending
    let interval: NodeJS.Timeout | undefined
    const setupPolling = async () => {
      await fetchBooking()
      if (booking?.status === 'pending') {
        interval = setInterval(fetchBooking, pollInterval)
      }
    }

    setupPolling()

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [enabled, bookingId, fetchBooking, pollInterval, booking?.status])

  return {
    booking,
    isLoading,
    error,
    hasStatusChanged,
    refetch: fetchBooking,
  }
}
