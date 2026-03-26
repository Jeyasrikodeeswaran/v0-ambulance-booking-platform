'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Loader2, ShieldCheck } from 'lucide-react'
import { providerStore } from '@/lib/data/store'

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [pendingApprovals, setPendingApprovals] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (user?.role === 'user') {
        router.push('/dashboard')
      } else if (user?.role === 'provider') {
        router.push('/provider/dashboard')
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  // Count pending provider approvals
  useEffect(() => {
    const pending = providerStore.getByStatus('pending').length
    setPendingApprovals(pending)
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'admin') {
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
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            {pendingApprovals > 0 && (
              <Badge variant="destructive">
                {pendingApprovals} pending approval{pendingApprovals > 1 ? 's' : ''}
              </Badge>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Administrator</span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
