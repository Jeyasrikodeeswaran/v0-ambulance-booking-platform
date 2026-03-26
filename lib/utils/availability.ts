import type { Booking, Ambulance } from '@/lib/data/types'
import { bookingStore } from '@/lib/data/store'
import { calculateDuration, calculateEndTime } from './pricing'

interface TimeRange {
  start: string // HH:MM format
  end: string // HH:MM format
}

// Convert time string to minutes since midnight for comparison
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Check if two time ranges overlap
function timeRangesOverlap(range1: TimeRange, range2: TimeRange): boolean {
  const start1 = timeToMinutes(range1.start)
  const end1 = timeToMinutes(range1.end)
  const start2 = timeToMinutes(range2.start)
  const end2 = timeToMinutes(range2.end)
  
  return start1 < end2 && end1 > start2
}

// Check if an ambulance is available for a given date and time
export function isAmbulanceAvailable(
  ambulanceId: string,
  requestedDate: string,
  requestedStartTime: string,
  estimatedDurationMinutes: number
): boolean {
  const bookings = bookingStore.getByAmbulanceId(ambulanceId)
  
  // Filter bookings for the requested date that are not cancelled or rejected
  const relevantBookings = bookings.filter(
    b => b.date === requestedDate && 
    (b.status === 'pending' || b.status === 'accepted')
  )
  
  if (relevantBookings.length === 0) return true
  
  const requestedEndTime = calculateEndTime(requestedStartTime, estimatedDurationMinutes)
  const requestedRange: TimeRange = {
    start: requestedStartTime,
    end: requestedEndTime,
  }
  
  // Check for overlap with each existing booking
  for (const booking of relevantBookings) {
    const bookingDuration = calculateDuration(booking.distance)
    const bookingEndTime = booking.endTime || calculateEndTime(booking.time, bookingDuration)
    
    const bookingRange: TimeRange = {
      start: booking.time,
      end: bookingEndTime,
    }
    
    if (timeRangesOverlap(requestedRange, bookingRange)) {
      return false
    }
  }
  
  return true
}

// Get all available time slots for an ambulance on a given date
export function getAvailableTimeSlots(
  ambulanceId: string,
  date: string,
  estimatedDurationMinutes: number,
  startHour: number = 6,
  endHour: number = 22,
  intervalMinutes: number = 30
): string[] {
  const availableSlots: string[] = []
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      if (isAmbulanceAvailable(ambulanceId, date, time, estimatedDurationMinutes)) {
        availableSlots.push(time)
      }
    }
  }
  
  return availableSlots
}

// Get booked time slots for an ambulance on a given date
export function getBookedTimeSlots(
  ambulanceId: string,
  date: string
): Array<{ start: string; end: string; bookingId: string; status: Booking['status'] }> {
  const bookings = bookingStore.getByAmbulanceId(ambulanceId)
  
  return bookings
    .filter(b => b.date === date && b.status !== 'cancelled' && b.status !== 'rejected')
    .map(booking => {
      const duration = calculateDuration(booking.distance)
      const endTime = booking.endTime || calculateEndTime(booking.time, duration)
      
      return {
        start: booking.time,
        end: endTime,
        bookingId: booking.id,
        status: booking.status,
      }
    })
    .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
}

// Check if a date is valid for booking (must be today or future)
export function isValidBookingDate(date: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const bookingDate = new Date(date)
  bookingDate.setHours(0, 0, 0, 0)
  return bookingDate >= today
}

// Check if a time is valid for booking on a given date
export function isValidBookingTime(date: string, time: string): boolean {
  const now = new Date()
  const bookingDate = new Date(date)
  const [hours, minutes] = time.split(':').map(Number)
  bookingDate.setHours(hours, minutes, 0, 0)
  
  // Allow booking at least 1 hour in advance
  const minBookingTime = new Date(now.getTime() + 60 * 60 * 1000)
  
  return bookingDate >= minBookingTime
}

// Filter ambulances by availability for a specific date/time/duration
export function filterAvailableAmbulances(
  ambulances: Ambulance[],
  date: string,
  time: string,
  estimatedDurationMinutes: number
): Ambulance[] {
  return ambulances.filter(ambulance => {
    // Check if ambulance status allows booking
    if (ambulance.status !== 'available') return false
    
    // Check time slot availability
    return isAmbulanceAvailable(ambulance.id, date, time, estimatedDurationMinutes)
  })
}
