import { toast } from 'sonner'
import type { BookingStatus } from '@/lib/data/types'

interface BookingStatusUpdateNotification {
  bookingId: string
  previousStatus: BookingStatus
  newStatus: BookingStatus
  driverName?: string
  vehicleNumber?: string
}

const statusMessages = {
  pending: {
    title: 'Booking Submitted',
    message: 'Your ambulance booking request is being reviewed',
  },
  accepted: {
    title: 'Booking Confirmed',
    message: 'Your ambulance has been confirmed',
    description: 'Driver details have been assigned',
  },
  rejected: {
    title: 'Booking Rejected',
    message: 'Unfortunately, your request could not be fulfilled',
    description: 'Please try again or contact support',
  },
  completed: {
    title: 'Booking Completed',
    message: 'Your ambulance service has been completed',
    description: 'Thank you for using our service',
  },
  cancelled: {
    title: 'Booking Cancelled',
    message: 'Your booking has been cancelled',
    description: 'A refund will be processed soon',
  },
}

export function showBookingStatusNotification({
  bookingId,
  previousStatus,
  newStatus,
  driverName,
  vehicleNumber,
}: BookingStatusUpdateNotification) {
  const statusInfo = statusMessages[newStatus]

  if (!statusInfo) return

  const description = newStatus === 'accepted' && driverName && vehicleNumber
    ? `Driver: ${driverName} | Vehicle: ${vehicleNumber}`
    : statusInfo.description

  const toastConfig = {
    description,
    duration: newStatus === 'accepted' ? 10000 : 5000,
  }

  switch (newStatus) {
    case 'accepted':
      toast.success(statusInfo.title, toastConfig)
      break
    case 'rejected':
    case 'cancelled':
      toast.error(statusInfo.title, toastConfig)
      break
    default:
      toast.info(statusInfo.title, toastConfig)
  }
}

export function showPendingBookingReminder(minutesWaited: number) {
  if (minutesWaited === 5) {
    toast.info('Your request is still being reviewed', {
      description: 'Typically approved within 10 minutes',
      duration: 5000,
    })
  } else if (minutesWaited === 10) {
    toast.warning('Request taking longer than usual', {
      description: 'Our team is reviewing your request. Please wait a bit longer.',
      duration: 5000,
    })
  }
}

export function showAdminNotification(pendingCount: number) {
  if (pendingCount > 0) {
    toast.info(`${pendingCount} pending booking request${pendingCount !== 1 ? 's' : ''}`, {
      description: 'Click to review requests',
      duration: 5000,
    })
  }
}
