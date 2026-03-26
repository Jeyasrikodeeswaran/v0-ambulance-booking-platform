import { cn } from '@/lib/utils'
import type { AmbulanceType } from '@/lib/data/types'
import { Heart, Wind, Activity } from 'lucide-react'

interface AmbulanceTypeBadgeProps {
  type: AmbulanceType
  showIcon?: boolean
  className?: string
}

const typeConfig: Record<AmbulanceType, { label: string; className: string; icon: React.ElementType }> = {
  basic: {
    label: 'Basic',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: Heart,
  },
  oxygen: {
    label: 'Oxygen',
    className: 'bg-sky-100 text-sky-800 border-sky-200',
    icon: Wind,
  },
  icu: {
    label: 'ICU',
    className: 'bg-rose-100 text-rose-800 border-rose-200',
    icon: Activity,
  },
}

export function AmbulanceTypeBadge({ type, showIcon = true, className }: AmbulanceTypeBadgeProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  )
}
