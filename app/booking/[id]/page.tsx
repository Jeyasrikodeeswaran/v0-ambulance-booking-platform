'use client'

import { useEffect, useState, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { AmbulanceTypeBadge } from '@/components/ambulance/ambulance-type-badge'
import { useAuth } from '@/lib/context/auth-context'
import { ambulanceStore, providerStore, bookingStore } from '@/lib/data/store'
import { formatPrice, calculatePrice, calculateDuration, formatDuration } from '@/lib/utils/pricing'
import { parseLocationToCoordinates, calculateStraightLineDistance, estimateDrivingDistance } from '@/lib/utils/distance'
import type { Ambulance, Provider } from '@/lib/data/types'
import { toast } from 'sonner'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Loader2,
  CheckCircle,
} from 'lucide-react'
import { format } from 'date-fns'

const bookingSchema = z.object({
  patientName: z.string().min(2, 'Patient name is required'),
  patientAge: z.coerce.number().min(1, 'Age must be at least 1').max(150, 'Invalid age'),
  patientCondition: z.string().min(5, 'Please describe the medical condition'),
  needOxygen: z.boolean(),
  wheelchairRequired: z.boolean(),
  specialInstructions: z.string().optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

function BookingFormContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()
  
  const [ambulance, setAmbulance] = useState<Ambulance | null>(null)
  const [provider, setProvider] = useState<Provider | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [distance, setDistance] = useState(10)
  
  const pickup = searchParams.get('pickup') || ''
  const drop = searchParams.get('drop') || ''
  const date = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd')
  const time = searchParams.get('time') || '10:00'

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      needOxygen: false,
      wheelchairRequired: false,
    },
  })

  const needOxygen = watch('needOxygen')
  const wheelchairRequired = watch('wheelchairRequired')

  useEffect(() => {
    const ambulanceId = params.id as string
    const ambulanceData = ambulanceStore.getById(ambulanceId)

    if (ambulanceData) {
      setAmbulance(ambulanceData)
      const providerData = providerStore.getById(ambulanceData.providerId)
      setProvider(providerData || null)
    }

    // Calculate distance
    if (pickup && drop) {
      const pickupCoords = parseLocationToCoordinates(pickup)
      const dropCoords = parseLocationToCoordinates(drop)
      
      if (pickupCoords && dropCoords) {
        const straightLine = calculateStraightLineDistance(
          pickupCoords.lat,
          pickupCoords.lng,
          dropCoords.lat,
          dropCoords.lng
        )
        setDistance(estimateDrivingDistance(straightLine))
      }
    }

    setIsLoading(false)
  }, [params.id, pickup, drop])

  const estimatedCost = ambulance
    ? calculatePrice(ambulance.baseCharge, ambulance.pricePerKm, distance)
    : 0
  
  const estimatedDuration = calculateDuration(distance)

  const onSubmit = async (data: BookingFormData) => {
    if (!isAuthenticated) {
      toast.error('Please login to book an ambulance')
      router.push(`/login?redirect=/booking/${params.id}?${searchParams.toString()}`)
      return
    }

    if (!ambulance || !provider || !user) return

    setIsSubmitting(true)

    try {
      const pickupCoords = parseLocationToCoordinates(pickup) || { lat: 13.0827, lng: 80.2707 }
      const dropCoords = parseLocationToCoordinates(drop) || { lat: 13.0067, lng: 80.2552 }

      const newBooking = bookingStore.create({
        userId: user.id,
        ambulanceId: ambulance.id,
        providerId: provider.id,
        pickupLocation: {
          address: pickup || 'Chennai',
          lat: pickupCoords.lat,
          lng: pickupCoords.lng,
        },
        dropLocation: {
          address: drop || 'Chennai',
          lat: dropCoords.lat,
          lng: dropCoords.lng,
        },
        date,
        time,
        patientName: data.patientName,
        patientAge: data.patientAge,
        patientCondition: data.patientCondition,
        needOxygen: data.needOxygen,
        wheelchairRequired: data.wheelchairRequired,
        specialInstructions: data.specialInstructions,
        distance,
        estimatedCost,
        status: 'pending',
      })

      toast.success('Booking request submitted successfully!')
      router.push(`/booking/confirmation/${newBooking.id}`)
    } catch (error) {
      toast.error('Failed to submit booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!ambulance || !provider) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-foreground">Ambulance Not Found</h2>
        <p className="mt-2 text-muted-foreground">This ambulance is not available.</p>
        <Button asChild className="mt-4">
          <Link href="/search">Back to Search</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/search">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Complete Your Booking</h1>
          <p className="text-muted-foreground">Enter patient details to confirm your request</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="patientName">Patient Name</Label>
                    <Input
                      id="patientName"
                      placeholder="Full name of the patient"
                      {...register('patientName')}
                    />
                    {errors.patientName && (
                      <p className="text-sm text-destructive">{errors.patientName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patientAge">Patient Age</Label>
                    <Input
                      id="patientAge"
                      type="number"
                      placeholder="Age in years"
                      {...register('patientAge')}
                    />
                    {errors.patientAge && (
                      <p className="text-sm text-destructive">{errors.patientAge.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patientCondition">Medical Condition</Label>
                  <Textarea
                    id="patientCondition"
                    placeholder="Describe the patient's medical condition (e.g., post-surgery recovery, dialysis patient, etc.)"
                    rows={3}
                    {...register('patientCondition')}
                  />
                  {errors.patientCondition && (
                    <p className="text-sm text-destructive">{errors.patientCondition.message}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <Label>Special Requirements</Label>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="needOxygen"
                        checked={needOxygen}
                        onCheckedChange={(checked) => setValue('needOxygen', checked as boolean)}
                      />
                      <Label htmlFor="needOxygen" className="cursor-pointer font-normal">
                        Oxygen Support Required
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="wheelchairRequired"
                        checked={wheelchairRequired}
                        onCheckedChange={(checked) => setValue('wheelchairRequired', checked as boolean)}
                      />
                      <Label htmlFor="wheelchairRequired" className="cursor-pointer font-normal">
                        Wheelchair Required
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
                  <Textarea
                    id="specialInstructions"
                    placeholder="Any additional instructions for the ambulance team"
                    rows={2}
                    {...register('specialInstructions')}
                  />
                </div>

                {!isAuthenticated && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-amber-800">
                      Please <Link href="/login" className="font-medium underline">login</Link> or{' '}
                      <Link href="/register/user" className="font-medium underline">register</Link> to complete your booking.
                    </p>
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirm Booking Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          {/* Trip Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Trip Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">PICKUP</p>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="h-4 w-4 shrink-0 text-emerald-500" />
                    <p className="text-sm text-foreground">{pickup || 'Chennai'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">DROP</p>
                  <div className="flex items-start gap-2 mt-1">
                    <MapPin className="h-4 w-4 shrink-0 text-rose-500" />
                    <p className="text-sm text-foreground">{drop || 'Chennai'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Date
                  </div>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {format(new Date(date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Time
                  </div>
                  <p className="mt-1 text-sm font-medium text-foreground">{time}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ambulance Details */}
          <Card>
            <CardHeader>
              <CardTitle>Ambulance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">{ambulance.vehicleNumber}</p>
                <AmbulanceTypeBadge type={ambulance.type} />
              </div>
              <p className="text-sm text-muted-foreground">{provider.companyName}</p>
              <div className="text-sm text-muted-foreground">
                <p>Driver: {ambulance.driverName}</p>
                <p>Contact: {ambulance.driverPhone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Cost Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Cost Estimate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Base Charge</span>
                <span className="text-foreground">{formatPrice(ambulance.baseCharge)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Distance ({distance.toFixed(1)} km x {formatPrice(ambulance.pricePerKm)})
                </span>
                <span className="text-foreground">
                  {formatPrice(ambulance.pricePerKm * distance)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Est. Duration</span>
                <span className="text-foreground">{formatDuration(estimatedDuration)}</span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">Estimated Total</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(estimatedCost)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Final amount may vary based on actual distance
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <BookingFormContent />
    </Suspense>
  )
}
