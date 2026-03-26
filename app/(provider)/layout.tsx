'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Loader2, Bell } from 'lucide-react'
import { bookingStore } from '@/lib/data/store'

export default function ProviderDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, provider, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (user?.role === 'user') {
        router.push('/dashboard')
      } else if (user?.role === 'admin') {
        router.push('/admin/dashboard')
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  // Fetch pending booking requests count
  useEffect(() => {
    if (provider) {
      const bookings = bookingStore.getByProviderId(provider.id)
      const pending = bookings.filter(b => b.status === 'pending').length
      setPendingCount(pending)
    }
  }, [provider])

  // Polling for new booking requests (simulates real-time)
  useEffect(() => {
    if (!provider) return
    
    const interval = setInterval(() => {
      const bookings = bookingStore.getByProviderId(provider.id)
      const pending = bookings.filter(b => b.status === 'pending').length
      setPendingCount(pending)
    }, 5000)

    return () => clearInterval(interval)
  }, [provider])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'provider') {
    return null
  }

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-4 border-b border-border bg-background px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-2" />
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-lg font-semibold">Provider Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1">
                <Bell className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-accent">
                  {pendingCount} new request{pendingCount > 1 ? 's' : ''}
                </span>
              </div>
            )}
            <Badge variant={provider?.status === 'approved' ? 'default' : 'secondary'} className="capitalize">
              {provider?.status}
            </Badge>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
