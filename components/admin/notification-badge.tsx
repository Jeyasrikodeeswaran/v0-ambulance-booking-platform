'use client'

import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Bell } from 'lucide-react'

interface NotificationBadgeProps {
  variant?: 'icon' | 'badge'
  count?: number
}

export function NotificationBadge({ variant = 'icon', count = 0 }: NotificationBadgeProps) {
  const [pendingCount, setPendingCount] = useState(count)
  const [hasNew, setHasNew] = useState(false)

  useEffect(() => {
    // Poll for new requests
    const fetchPendingCount = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          const newCount = data.pending || 0
          
          if (newCount > pendingCount) {
            setHasNew(true)
            // Auto clear the "new" indicator after 5 seconds
            setTimeout(() => setHasNew(false), 5000)
          }
          
          setPendingCount(newCount)
        }
      } catch (error) {
        console.error('Error fetching pending count:', error)
      }
    }

    // Initial fetch
    fetchPendingCount()

    // Poll every 10 seconds
    const interval = setInterval(fetchPendingCount, 10000)

    return () => clearInterval(interval)
  }, [pendingCount])

  if (variant === 'badge') {
    return (
      <Badge 
        variant={pendingCount > 0 ? 'default' : 'secondary'}
        className="relative"
      >
        <span className="mr-1">{pendingCount}</span>
        Pending
        {hasNew && (
          <span className="absolute -right-1 -top-1 flex h-2 w-2 animate-pulse rounded-full bg-red-600" />
        )}
      </Badge>
    )
  }

  return (
    <div className="relative">
      <Bell className="h-5 w-5" />
      {pendingCount > 0 && (
        <>
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white">
            {pendingCount > 99 ? '99+' : pendingCount}
          </span>
          {hasNew && (
            <span className="absolute -right-1 -top-1 h-5 w-5 animate-pulse rounded-full border-2 border-red-400" />
          )}
        </>
      )}
    </div>
  )
}
