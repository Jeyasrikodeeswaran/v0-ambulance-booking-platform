'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context/auth-context'
import { ambulanceStore } from '@/lib/data/store'
import type { Ambulance, AmbulanceType, AmbulanceStatus } from '@/lib/data/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Ambulance as AmbulanceIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface FormData {
  vehicleNumber: string
  type: AmbulanceType
  driverName: string
  driverPhone: string
  baseLocation: string
  baseCharge: string
  pricePerKm: string
  status: AmbulanceStatus
}

export default function EditAmbulancePage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params)
  const router = useRouter()
  const { provider } = useAuth()
  const [ambulance, setAmbulance] = useState<Ambulance | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    vehicleNumber: '',
    type: 'basic',
    driverName: '',
    driverPhone: '',
    baseLocation: '',
    baseCharge: '',
    pricePerKm: '',
    status: 'available',
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})

  useEffect(() => {
    const data = ambulanceStore.getById(params.id)
    if (data) {
      // Verify ownership
      if (data.providerId !== provider?.id) {
        toast.error('You do not have permission to edit this ambulance')
        router.push('/provider/ambulances')
        return
      }
      setAmbulance(data)
      setFormData({
        vehicleNumber: data.vehicleNumber,
        type: data.type,
        driverName: data.driverName,
        driverPhone: data.driverPhone,
        baseLocation: data.baseLocation,
        baseCharge: data.baseCharge.toString(),
        pricePerKm: data.pricePerKm.toString(),
        status: data.status,
      })
    } else {
      toast.error('Ambulance not found')
      router.push('/provider/ambulances')
    }
  }, [params.id, provider, router])

  const validateForm = () => {
    const newErrors: Partial<FormData> = {}

    if (!formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = 'Vehicle number is required'
    } else {
      // Check if vehicle number already exists (excluding current)
      const existingAmbulances = ambulanceStore.getAll()
      const duplicate = existingAmbulances.find(
        (a) =>
          a.vehicleNumber.toLowerCase() === formData.vehicleNumber.toLowerCase() &&
          a.id !== params.id
      )
      if (duplicate) {
        newErrors.vehicleNumber = 'Vehicle number already registered'
      }
    }

    if (!formData.driverName.trim()) {
      newErrors.driverName = 'Driver name is required'
    }

    if (!formData.driverPhone.trim()) {
      newErrors.driverPhone = 'Driver phone is required'
    } else if (!/^\d{10}$/.test(formData.driverPhone)) {
      newErrors.driverPhone = 'Invalid phone number (10 digits required)'
    }

    if (!formData.baseLocation.trim()) {
      newErrors.baseLocation = 'Base location is required'
    }

    if (!formData.baseCharge) {
      newErrors.baseCharge = 'Base charge is required'
    } else if (parseFloat(formData.baseCharge) < 0) {
      newErrors.baseCharge = 'Base charge cannot be negative'
    }

    if (!formData.pricePerKm) {
      newErrors.pricePerKm = 'Price per km is required'
    } else if (parseFloat(formData.pricePerKm) < 0) {
      newErrors.pricePerKm = 'Price per km cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !ambulance) return

    setIsSubmitting(true)

    try {
      ambulanceStore.update(ambulance.id, {
        vehicleNumber: formData.vehicleNumber.toUpperCase(),
        type: formData.type,
        driverName: formData.driverName,
        driverPhone: formData.driverPhone,
        baseLocation: formData.baseLocation,
        baseCharge: parseFloat(formData.baseCharge),
        pricePerKm: parseFloat(formData.pricePerKm),
        status: formData.status,
      })

      toast.success('Ambulance updated successfully!')
      router.push('/provider/ambulances')
    } catch {
      toast.error('Failed to update ambulance. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  if (!ambulance) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/provider/ambulances">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Ambulance</h1>
          <p className="text-muted-foreground">Update details for {ambulance.vehicleNumber}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <AmbulanceIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Ambulance Details</CardTitle>
              <CardDescription>Update the details of your ambulance</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Vehicle Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
                  <Input
                    id="vehicleNumber"
                    placeholder="TN 01 AB 1234"
                    value={formData.vehicleNumber}
                    onChange={(e) => updateField('vehicleNumber', e.target.value.toUpperCase())}
                    className={errors.vehicleNumber ? 'border-destructive' : ''}
                  />
                  {errors.vehicleNumber && (
                    <p className="text-sm text-destructive">{errors.vehicleNumber}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Ambulance Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => updateField('type', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic - Patient Transport</SelectItem>
                      <SelectItem value="oxygen">Oxygen Supported</SelectItem>
                      <SelectItem value="icu">ICU - Advanced Life Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Driver Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Driver Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="driverName">Driver Name *</Label>
                  <Input
                    id="driverName"
                    placeholder="Enter driver's full name"
                    value={formData.driverName}
                    onChange={(e) => updateField('driverName', e.target.value)}
                    className={errors.driverName ? 'border-destructive' : ''}
                  />
                  {errors.driverName && (
                    <p className="text-sm text-destructive">{errors.driverName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driverPhone">Driver Phone *</Label>
                  <Input
                    id="driverPhone"
                    placeholder="10-digit phone number"
                    value={formData.driverPhone}
                    onChange={(e) => updateField('driverPhone', e.target.value.replace(/\D/g, ''))}
                    maxLength={10}
                    className={errors.driverPhone ? 'border-destructive' : ''}
                  />
                  {errors.driverPhone && (
                    <p className="text-sm text-destructive">{errors.driverPhone}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Location & Pricing */}
            <div className="space-y-4">
              <h3 className="font-medium">Location & Pricing</h3>
              <div className="space-y-2">
                <Label htmlFor="baseLocation">Base Location *</Label>
                <Input
                  id="baseLocation"
                  placeholder="e.g., Chennai, Tamil Nadu"
                  value={formData.baseLocation}
                  onChange={(e) => updateField('baseLocation', e.target.value)}
                  className={errors.baseLocation ? 'border-destructive' : ''}
                />
                {errors.baseLocation && (
                  <p className="text-sm text-destructive">{errors.baseLocation}</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="baseCharge">Base Charge (₹) *</Label>
                  <Input
                    id="baseCharge"
                    type="number"
                    placeholder="e.g., 500"
                    value={formData.baseCharge}
                    onChange={(e) => updateField('baseCharge', e.target.value)}
                    min="0"
                    className={errors.baseCharge ? 'border-destructive' : ''}
                  />
                  {errors.baseCharge && (
                    <p className="text-sm text-destructive">{errors.baseCharge}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricePerKm">Price per KM (₹) *</Label>
                  <Input
                    id="pricePerKm"
                    type="number"
                    placeholder="e.g., 15"
                    value={formData.pricePerKm}
                    onChange={(e) => updateField('pricePerKm', e.target.value)}
                    min="0"
                    step="0.5"
                    className={errors.pricePerKm ? 'border-destructive' : ''}
                  />
                  {errors.pricePerKm && (
                    <p className="text-sm text-destructive">{errors.pricePerKm}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4">
              <h3 className="font-medium">Status</h3>
              <div className="space-y-2">
                <Label htmlFor="status">Availability Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => updateField('status', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available - Ready for bookings</SelectItem>
                    <SelectItem value="booked">Booked - Currently assigned</SelectItem>
                    <SelectItem value="on_trip">On Trip - In transit</SelectItem>
                    <SelectItem value="maintenance">Maintenance - Not accepting bookings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" asChild className="flex-1">
                <Link href="/provider/ambulances">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
