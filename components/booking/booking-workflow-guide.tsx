'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CheckCircle2,
  Clock,
  Shield,
  Phone,
  MapPin,
  Truck,
  AlertCircle,
  FileCheck,
} from 'lucide-react'

export function BookingWorkflowGuide() {
  const steps = [
    {
      number: 1,
      title: 'Submit Request',
      description: 'Fill in your patient details, location, and preferred ambulance type',
      icon: FileCheck,
      details: [
        'Patient name, age, and medical condition',
        'Pickup and drop-off locations',
        'Preferred date and time',
        'Special requirements (oxygen, wheelchair, etc.)',
      ],
    },
    {
      number: 2,
      title: 'Admin Verification',
      description: 'Our admin team reviews your request for authenticity and accuracy',
      duration: '~10 minutes',
      icon: Shield,
      details: [
        'Verification of patient information',
        'Confirmation of location availability',
        'Selection of appropriate ambulance',
        'Driver assignment and briefing',
      ],
    },
    {
      number: 3,
      title: 'Receive Confirmation',
      description: 'Get verified driver and vehicle details via notification',
      icon: CheckCircle2,
      details: [
        'Driver name and verified contact',
        'Vehicle number and ambulance type',
        'Estimated arrival time',
        'Real-time tracking capability',
      ],
    },
    {
      number: 4,
      title: 'Service Delivery',
      description: 'Ambulance arrives and provides the required medical transport',
      icon: Truck,
      details: [
        'Professional medical staff',
        'Equipment and supplies as required',
        'Patient safety and comfort',
        'Real-time updates during trip',
      ],
    },
  ]

  const securityFeatures = [
    {
      title: 'Two-Layer Verification',
      description: 'User authentication + Admin approval prevents unauthorized requests',
      icon: Shield,
    },
    {
      title: 'Verified Driver Details',
      description: 'All drivers are background-checked and verified before assignment',
      icon: CheckCircle2,
    },
    {
      title: 'Real-time Tracking',
      description: 'Track your ambulance in real-time with live location updates',
      icon: MapPin,
    },
    {
      title: 'Direct Communication',
      description: 'Direct contact with verified driver - no intermediaries',
      icon: Phone,
    },
  ]

  return (
    <div className="space-y-8">
      {/* How It Works */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">How It Works</h2>
        <p className="text-muted-foreground mb-6">
          Our secure booking process ensures authenticity and reliability at every step
        </p>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  {index !== steps.length - 1 && (
                    <div className="mt-2 h-12 w-1 bg-primary/20" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Step {step.number}: {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    </div>
                    {step.duration && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded whitespace-nowrap ml-4">
                        <Clock className="h-3 w-3" />
                        {step.duration}
                      </span>
                    )}
                  </div>
                  {step.details.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary/40 mt-2 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Security Features */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Security & Safety</h2>
        <p className="text-muted-foreground mb-6">
          We prioritize your safety with multiple layers of verification and transparency
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 flex-shrink-0">
                      <Icon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{feature.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Important Information */}
      <Alert className="border-blue-200 bg-blue-50/50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          <strong>Authenticity Assurance:</strong> All booking requests go through admin verification to prevent spoofing. You will only receive confirmed requests with verified driver and vehicle information. This ensures you receive genuine ambulance services from authorized providers.
        </AlertDescription>
      </Alert>

      {/* FAQ-like Information */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Important Details</h2>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What if my request is rejected?</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              If your request cannot be fulfilled (e.g., no ambulances available in your area, incomplete information), you will receive a notification. You can contact our support team for assistance or modify and resubmit your request.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I cancel my booking?</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Yes, you can cancel pending requests anytime. Once accepted and the ambulance is en route, cancellation policies apply. Contact our support team for urgent cancellations.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How do I verify the driver information?</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              All driver details provided after approval are verified by our admin team. You receive the vehicle number, driver name, and contact information. Cross-check these details for your safety before boarding.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What about emergency requests?</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              For critical emergencies, call our emergency hotline directly. While our booking system is optimized for planned requests, emergency dispatch teams can provide faster response for life-threatening situations.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
