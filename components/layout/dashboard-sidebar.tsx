'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/context/auth-context'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import {
  Ambulance,
  LayoutDashboard,
  Calendar,
  Settings,
  LogOut,
  Plus,
  List,
  Users,
  Building2,
  BarChart3,
  CheckCircle,
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const userNav: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'My Bookings', href: '/dashboard/bookings', icon: Calendar },
  { label: 'Find Ambulance', href: '/search', icon: Ambulance },
]

const providerNav: NavItem[] = [
  { label: 'Dashboard', href: '/provider/dashboard', icon: LayoutDashboard },
  { label: 'My Ambulances', href: '/provider/ambulances', icon: Ambulance },
  { label: 'Add Ambulance', href: '/provider/ambulances/new', icon: Plus },
  { label: 'Booking Requests', href: '/provider/bookings', icon: Calendar },
  { label: 'Active Trips', href: '/provider/trips', icon: List },
  { label: 'Earnings', href: '/provider/earnings', icon: BarChart3 },
  { label: 'Settings', href: '/provider/settings', icon: Settings },
]

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Provider Approvals', href: '/admin/providers', icon: CheckCircle },
  { label: 'All Providers', href: '/admin/providers/list', icon: Building2 },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'All Bookings', href: '/admin/bookings', icon: Calendar },
  { label: 'Platform Settings', href: '/admin/settings', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const getNavItems = () => {
    switch (user?.role) {
      case 'admin':
        return adminNav
      case 'provider':
        return providerNav
      default:
        return userNav
    }
  }

  const navItems = getNavItems()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
            <Ambulance className="h-4 w-4 text-sidebar-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">
            MediTransit
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="mb-3">
          <p className="text-sm font-medium text-sidebar-foreground">{user?.fullName}</p>
          <p className="text-xs text-sidebar-foreground/60 capitalize">{user?.role}</p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
