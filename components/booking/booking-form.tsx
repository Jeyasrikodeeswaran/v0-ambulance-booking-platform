'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, CalendarIcon, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { AmbulanceType } from '@/lib/data/types'
import { toast } from 'sonner'

interface BookingFormProps {
  onSubmitSuccess?: (bookingId: string) => void
  defaultValues?: {
    patientName?: string
    patientAge?: string
    patientPhone?: string
    pickupLocation?: string
    dropLocation?: string
    date?: Date
    time?: string
    ambulanceType?: AmbulanceType
  }
}

interface BookingFormData {
  patientName: string
  patientAge: string
  patientPhone: string
  patientCondition: string
  pickupLocation: string
  pickupCoordinates: { lat: number; lng: number }
  dropLocation: string
  dropCoordinates: { lat: number; lng: number }
  date: Date
  time: string
  ambulanceType: AmbulanceType
  specialRequirements: string[]
  notes: string
}

export function BookingForm({ onSubmitSuccess, defaultValues }: BookingFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<BookingFormData>({
    patientName: defaultValues?.patientName || '',
    patientAge: defaultValues?.patientAge || '',
    patientPhone: defaultValues?.patientPhone || '',
    patientCondition: '',
    pickupLocation: defaultValues?.pickupLocation || '',
    pickupCoordinates: { lat: 0, lng: 0 },
    dropLocation: defaultValues?.dropLocation || '',
    dropCoordinates: { lat: 0, lng: 0 },
    date: defaultValues?.date || new Date(),
    time: defaultValues?.time || '',
    ambulanceType: defaultValues?.ambulanceType || 'basic',
    specialRequirements: [],
    notes: '',
  })

  const [estimatedCost, setEstimatedCost] = useState<number | null>(null)

  const timeSlots = Array.from({ length: 32 }, (_, i) => {
    const hour = Math.floor(i / 2) + 6
    const minute = i % 2 === 0 ? '00' : '30'
    const time24 = `${String(hour).padStart(2, '0')}:${minute}`
    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    const ampm = hour >= 12 ? 'PM' : 'AM'
    return { value: time24, label: `${hour12}:${minute} ${ampm}` }
  })

  const specialRequirementOptions = [
    { id: 'oxygen', label: 'Oxygen Support' },
    { id: 'wheelchair', label: 'Wheelchair Accessibility' },
    { id: 'stretcher', label: 'Stretcher Required' },
    { id: 'ventilator', label: 'Ventilator Support' },
    { id: 'cardiac', label: 'Cardiac Monitoring' },
  ]

  const handleInputChange = (field: keyof BookingFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Estimate cost when location or type changes
    if (field === 'pickupLocation' || field === 'dropLocation' || field === 'ambulanceType') {
      estimatePricing()
    }
  }

  const handleSpecialRequirementChange = (requirementId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      specialRequirements: checked
        ? [...prev.specialRequirements, requirementId]
        : prev.specialRequirements.filter(r => r !== requirementId)
    }))
  }

  const estimatePricing = () => {
    // Mock pricing estimation based on ambulance type
    const basePrice = {
      basic: 500,
      oxygen: 800,
      icu: 1500,
    }
    
    const estimatedDistance = Math.random() * 20 + 5 // Mock distance
    const typeMultiplier = formData.specialRequirements.length * 100
    const estimated = (basePrice[formData.ambulanceType] + (estimatedDistance * 50)) + typeMultiplier
    
    setEstimatedCost(Math.round(estimated))
  }

  const validateForm = () => {
    const errors: string[] = []
    
    if (!formData.patientName.trim()) errors.push('Patient name is required')
    if (!formData.patientAge) errors.push('Patient age is required')
    if (!formData.patientPhone.trim() || formData.patientPhone.length < 10) {
      errors.push('Valid phone number is required')
    }
    if (!formData.pickupLocation.trim()) errors.push('Pickup location is required')
    if (!formData.dropLocation.trim()) errors.push('Drop location is required')
    if (!formData.time) errors.push('Time is required')
    if (formData.patientCondition.trim().length < 3) errors.push('Please describe patient condition briefly')
    
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Create booking request
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedCost: estimatedCost || 500,
          distance: Math.random() * 20 + 5,
        }),
      })
      
      if (!response.ok) throw new Error('Failed to create booking')
      
      const data = await response.json()
      toast.success('Booking request submitted successfully!')
      
      if (onSubmitSuccess) {
        onSubmitSuccess(data.id)
      } else {
        router.push(`/booking/confirmation/${data.id}`)
      }
    } catch (error) {
      toast.error('Failed to create booking. Please try again.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Provide details about the patient</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="patientName">Patient Name *</Label>
                <Input
                  id="patientName"
                  placeholder="Full name"
                  value={formData.patientName}
                  onChange={(e) => handleInputChange('patientName', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patientAge">Patient Age *</Label>
                <Input
                  id="patientAge"
                  type="number"
                  placeholder="Age in years"
                  min="0"
                  max="150"
                  value={formData.patientAge}
                  onChange={(e) => handleInputChange('patientAge', e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientPhone">Contact Phone Number *</Label>
              <Input
                id="patientPhone"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={formData.patientPhone}
                onChange={(e) => handleInputChange('patientPhone', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientCondition">Medical Condition *</Label>
              <Textarea
                id="patientCondition"
                placeholder="Briefly describe the patient's condition (e.g., accident, chest pain, pregnancy, etc.)"
                value={formData.patientCondition}
                onChange={(e) => handleInputChange('patientCondition', e.target.value)}
                rows={3}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Location & Time Section */}
        <Card>
          <CardHeader>
            <CardTitle>Pickup & Dropoff Details</CardTitle>
            <CardDescription>Enter pickup and destination locations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pickupLocation">Pickup Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="pickupLocation"
                  placeholder="Hospital, home address, or area name"
                  value={formData.pickupLocation}
                  onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dropLocation">Drop Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="dropLocation"
                  placeholder="Destination hospital or address"
                  value={formData.dropLocation}
                  onChange={(e) => handleInputChange('dropLocation', e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Preferred Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => handleInputChange('date', date)}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Preferred Time *</Label>
                <Select value={formData.time} onValueChange={(v) => handleInputChange('time', v)}>
                  <SelectTrigger className="w-full">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ambulance Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Ambulance Type</CardTitle>
            <CardDescription>Choose the type of ambulance based on patient needs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ambulanceType">Ambulance Type *</Label>
              <Select value={formData.ambulanceType} onValueChange={(v) => handleInputChange('ambulanceType', v as AmbulanceType)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select ambulance type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">
                    <div className="flex flex-col">
                      <span>Basic Transport</span>
                      <span className="text-xs text-muted-foreground">For non-emergency patient transport</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="oxygen">
                    <div className="flex flex-col">
                      <span>Oxygen Support</span>
                      <span className="text-xs text-muted-foreground">With oxygen supply and monitoring</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="icu">
                    <div className="flex flex-col">
                      <span>ICU / Critical Care</span>
                      <span className="text-xs text-muted-foreground">Full life support equipment</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Special Requirements */}
            <div className="space-y-3">
              <Label>Special Requirements</Label>
              <div className="grid gap-3 md:grid-cols-2">
                {specialRequirementOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.id}
                      checked={formData.specialRequirements.includes(option.id)}
                      onCheckedChange={(checked) =>
                        handleSpecialRequirementChange(option.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={option.id} className="font-normal cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any other information that might be helpful (e.g., patient preferences, special instructions, etc.)"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Price Estimation */}
        {estimatedCost && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Cost</p>
                  <p className="text-3xl font-bold text-foreground">₹{estimatedCost}</p>
                  <p className="text-xs text-muted-foreground mt-1">Final cost may vary based on distance and demand</p>
                </div>
                <Alert className="flex-1 ml-4 border-primary/20">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Your request will be reviewed by an admin before confirmation. Driver details will be provided upon approval.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Submitting Request...' : 'Submit Booking Request'}
        </Button>
      </form>
    </div>
  )
}
