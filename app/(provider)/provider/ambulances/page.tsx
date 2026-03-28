'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth-context'
import { ambulanceStore, bookingStore } from '@/lib/data/store'
import type { Ambulance } from '@/lib/data/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AmbulanceTypeBadge } from '@/components/ambulance/ambulance-type-badge'
import {
  Ambulance as AmbulanceIcon,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MapPin,
  Phone,
  User,
  IndianRupee,
  Wrench,
} from 'lucide-react'
import { toast } from 'sonner'

type FilterStatus = 'all' | 'available' | 'booked' | 'on_trip' | 'maintenance'
type FilterType = 'all' | 'basic' | 'oxygen' | 'icu'

export default function ProviderAmbulancesPage() {
  const { provider } = useAuth()
  const [ambulances, setAmbulances] = useState<Ambulance[]>([])
  const [filteredAmbulances, setFilteredAmbulances] = useState<Ambulance[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [ambulanceToDelete, setAmbulanceToDelete] = useState<Ambulance | null>(null)

  // Load ambulances
  useEffect(() => {
    if (!provider) return
    const data = ambulanceStore.getByProviderId(provider.id)
    setAmbulances(data)
  }, [provider])

  // Filter ambulances
  useEffect(() => {
    let filtered = [...ambulances]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.vehicleNumber.toLowerCase().includes(term) ||
          a.driverName.toLowerCase().includes(term) ||
          a.baseLocation.toLowerCase().includes(term)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((a) => a.status === statusFilter)
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter((a) => a.type === typeFilter)
    }

    setFilteredAmbulances(filtered)
  }, [ambulances, searchTerm, statusFilter, typeFilter])

  const handleToggleStatus = (ambulance: Ambulance) => {
    // Check if ambulance has active bookings
    const activeBookings = bookingStore.getByAmbulanceId(ambulance.id).filter(
      (b) => b.status === 'pending' || b.status === 'accepted'
    )

    if (activeBookings.length > 0 && ambulance.status !== 'maintenance') {
      toast.error('Cannot change status while there are active bookings')
      return
    }

    const newStatus = ambulance.status === 'available' ? 'maintenance' : 'available'
    ambulanceStore.update(ambulance.id, { status: newStatus })
    
    // Refresh list
    const updated = ambulanceStore.getByProviderId(provider!.id)
    setAmbulances(updated)
    
    toast.success(`Ambulance marked as ${newStatus}`)
  }

  const handleDelete = () => {
    if (!ambulanceToDelete) return

    // Check if ambulance has any bookings
    const bookings = bookingStore.getByAmbulanceId(ambulanceToDelete.id)
    const activeBookings = bookings.filter(
      (b) => b.status === 'pending' || b.status === 'accepted'
    )

    if (activeBookings.length > 0) {
      toast.error('Cannot delete ambulance with active bookings')
      setDeleteDialogOpen(false)
      setAmbulanceToDelete(null)
      return
    }

    ambulanceStore.delete(ambulanceToDelete.id)
    
    // Refresh list
    const updated = ambulanceStore.getByProviderId(provider!.id)
    setAmbulances(updated)
    
    toast.success('Ambulance deleted successfully')
    setDeleteDialogOpen(false)
    setAmbulanceToDelete(null)
  }

  const getRegistrationStatusColor = (status: Ambulance['registrationStatus']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return ''
    }
  }

  const getStatusColor = (status: Ambulance['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'booked':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'on_trip':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'maintenance':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Ambulances</h1>
          <p className="text-muted-foreground">
            Manage your fleet of {ambulances.length} ambulance{ambulances.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild>
          <Link href="/provider/ambulances/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Ambulance
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by vehicle, driver, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as FilterStatus)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="on_trip">On Trip</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as FilterType)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="oxygen">Oxygen</SelectItem>
                <SelectItem value="icu">ICU</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Ambulances List */}
      {filteredAmbulances.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AmbulanceIcon className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No ambulances found</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {ambulances.length === 0
                ? "You haven't added any ambulances yet."
                : 'No ambulances match your search criteria.'}
            </p>
            {ambulances.length === 0 && (
              <Button asChild className="mt-4">
                <Link href="/provider/ambulances/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Ambulance
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAmbulances.map((ambulance) => (
            <Card key={ambulance.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <AmbulanceIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{ambulance.vehicleNumber}</CardTitle>
                      <AmbulanceTypeBadge type={ambulance.type} />
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/provider/ambulances/${ambulance.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(ambulance)}>
                        {ambulance.status === 'available' ? (
                          <>
                            <Wrench className="mr-2 h-4 w-4" />
                            Set to Maintenance
                          </>
                        ) : ambulance.status === 'maintenance' ? (
                          <>
                            <ToggleRight className="mr-2 h-4 w-4" />
                            Set to Available
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="mr-2 h-4 w-4" />
                            Toggle Status
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setAmbulanceToDelete(ambulance)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{ambulance.driverName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{ambulance.driverPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{ambulance.baseLocation}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                  <span>
                    ₹{ambulance.baseCharge} base + ₹{ambulance.pricePerKm}/km
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Badge className={`capitalize ${getRegistrationStatusColor(ambulance.registrationStatus)}`}>
                    {ambulance.registrationStatus}
                  </Badge>
                  {ambulance.registrationStatus === 'approved' && (
                    <Badge variant="outline" className={`capitalize ${getStatusColor(ambulance.status)}`}>
                      {ambulance.status.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ambulance</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete ambulance{' '}
              <span className="font-semibold">{ambulanceToDelete?.vehicleNumber}</span>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
