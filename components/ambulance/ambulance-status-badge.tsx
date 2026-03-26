import { cn } from '@/lib/utils'
import type { AmbulanceStatus } from '@/lib/data/types'

interface AmbulanceStatusBadgeProps {
  status: AmbulanceStatus
  className?: string
}

const statusConfig: Record<AmbulanceStatus, { label: string; className: string }> = {
  available: {
    label: 'Available',
    className: 'bg-emerald-100 text-emerald-800',
  },
  booked: {
    label: 'Booked',
    className: 'bg-amber-100 text-amber-800',
  },
  on_trip: {
    label: 'On Trip',
    className: 'bg-sky-100 text-sky-800',
  },
  maintenance: {
    label: 'Maintenance',
    className: 'bg-slate-100 text-slate-800',
  },
}

export function AmbulanceStatusBadge({ status, className }: AmbulanceStatusBadgeProps) {
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
