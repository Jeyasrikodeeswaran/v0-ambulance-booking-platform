import { cn } from '@/lib/utils'
import type { BookingStatus } from '@/lib/data/types'

interface BookingStatusBadgeProps {
  status: BookingStatus
  className?: string
}

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-800',
  },
  accepted: {
    label: 'Accepted',
    className: 'bg-emerald-100 text-emerald-800',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-rose-100 text-rose-800',
  },
  completed: {
    label: 'Completed',
    className: 'bg-sky-100 text-sky-800',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-slate-100 text-slate-800',
  },
}

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
