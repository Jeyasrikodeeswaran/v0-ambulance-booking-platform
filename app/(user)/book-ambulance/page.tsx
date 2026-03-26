'use client'

import { useAuth } from '@/lib/context/auth-context'
import { BookingForm } from '@/components/booking/booking-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Shield, Clock, CheckCircle2 } from 'lucide-react'

export default function BookAmbulancePage() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Book an Ambulance</h1>
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700">
            You need to be logged in to book an ambulance. Please log in first.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Request an Ambulance</h1>
        <p className="text-muted-foreground mt-2">
          Fill in the form below to request an ambulance service. Our team will verify and approve your request quickly.
        </p>
      </div>

      {/* Key Features */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Quick Response</p>
                <p className="text-sm text-muted-foreground">Typically within 10 minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Verified Drivers</p>
                <p className="text-sm text-muted-foreground">Background checked & certified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Secure & Safe</p>
                <p className="text-sm text-muted-foreground">Admin verified requests only</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Notice */}
      <Alert className="border-blue-200 bg-blue-50/50">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          <strong>Your Security:</strong> All booking requests are verified by our admin team before processing. You will receive verified driver and vehicle information once your request is approved. This ensures authenticity and prevents spoofing.
        </AlertDescription>
      </Alert>

      {/* Booking Form */}
      <BookingForm />
    </div>
  )
}
