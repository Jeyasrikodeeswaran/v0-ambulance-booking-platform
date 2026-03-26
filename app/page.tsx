import { SearchForm } from '@/components/search/search-form'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Ambulance,
  Shield,
  Clock,
  MapPin,
  Phone,
  CheckCircle,
  ArrowRight,
  Heart,
  Wind,
  Activity,
  Users,
  Building2,
  Star,
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium text-primary">Trusted Medical Transport in Tamil Nadu</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
              Reliable Non-Emergency Ambulance Services
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground text-pretty">
              Connect with verified ambulance providers for safe patient transport. 
              Book hospital transfers, dialysis trips, and medical appointments with ease.
            </p>

            {/* Search Form Card */}
            <Card className="mx-auto max-w-3xl border-border/50 shadow-xl">
              <CardContent className="p-6 md:p-8">
                <h2 className="mb-6 text-lg font-semibold text-foreground">Find an Ambulance</h2>
                <SearchForm />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
      </section>

      {/* Trust Indicators */}
      <section className="border-y border-border bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">500+</p>
                <p className="text-sm text-muted-foreground">Happy Patients</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Ambulance className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">50+</p>
                <p className="text-sm text-muted-foreground">Ambulances</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">20+</p>
                <p className="text-sm text-muted-foreground">Cities Covered</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Star className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">4.8</p>
                <p className="text-sm text-muted-foreground">User Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ambulance Types */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Choose the Right Ambulance</h2>
            <p className="text-muted-foreground">
              We offer different types of ambulances to match your specific medical transport needs
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Basic Ambulance */}
            <Card className="group overflow-hidden transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100">
                  <Heart className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">Basic Transport</h3>
                <p className="mb-4 text-muted-foreground">
                  Standard patient transport for stable patients. Ideal for hospital discharges and routine transfers.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Stretcher and wheelchair
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Trained attendant
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    First aid kit
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">Starting from</p>
                  <p className="text-2xl font-bold text-foreground">&#8377;450 <span className="text-sm font-normal text-muted-foreground">+ &#8377;14/km</span></p>
                </div>
              </CardContent>
            </Card>

            {/* Oxygen Ambulance */}
            <Card className="group overflow-hidden border-2 border-primary transition-all hover:shadow-lg">
              <div className="bg-primary px-4 py-1 text-center text-xs font-medium text-primary-foreground">
                Most Popular
              </div>
              <CardContent className="p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-sky-100">
                  <Wind className="h-7 w-7 text-sky-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">Oxygen Support</h3>
                <p className="mb-4 text-muted-foreground">
                  For patients requiring continuous oxygen supply. Perfect for respiratory conditions.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-sky-500" />
                    Portable oxygen cylinders
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-sky-500" />
                    Pulse oximeter
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-sky-500" />
                    Trained paramedic
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">Starting from</p>
                  <p className="text-2xl font-bold text-foreground">&#8377;750 <span className="text-sm font-normal text-muted-foreground">+ &#8377;18/km</span></p>
                </div>
              </CardContent>
            </Card>

            {/* ICU Ambulance */}
            <Card className="group overflow-hidden transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-rose-100">
                  <Activity className="h-7 w-7 text-rose-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">ICU / Critical Care</h3>
                <p className="mb-4 text-muted-foreground">
                  Advanced life support for critical patients. Full ICU equipment on board.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-rose-500" />
                    Ventilator support
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-rose-500" />
                    Cardiac monitor
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-rose-500" />
                    Doctor & nurse team
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">Starting from</p>
                  <p className="text-2xl font-bold text-foreground">&#8377;1,400 <span className="text-sm font-normal text-muted-foreground">+ &#8377;28/km</span></p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">How It Works</h2>
            <p className="text-muted-foreground">
              Book your ambulance in 4 simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            <div className="relative text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="mb-2 font-semibold text-foreground">Enter Locations</h3>
              <p className="text-sm text-muted-foreground">
                Provide pickup and drop-off addresses with preferred date and time
              </p>
              <ArrowRight className="absolute -right-4 top-8 hidden h-6 w-6 text-muted-foreground/30 md:block" />
            </div>

            <div className="relative text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="mb-2 font-semibold text-foreground">Choose Ambulance</h3>
              <p className="text-sm text-muted-foreground">
                Compare available options based on type, price, and provider ratings
              </p>
              <ArrowRight className="absolute -right-4 top-8 hidden h-6 w-6 text-muted-foreground/30 md:block" />
            </div>

            <div className="relative text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="mb-2 font-semibold text-foreground">Confirm Booking</h3>
              <p className="text-sm text-muted-foreground">
                Enter patient details and submit your booking request
              </p>
              <ArrowRight className="absolute -right-4 top-8 hidden h-6 w-6 text-muted-foreground/30 md:block" />
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl font-bold text-accent-foreground">
                4
              </div>
              <h3 className="mb-2 font-semibold text-foreground">Get Picked Up</h3>
              <p className="text-sm text-muted-foreground">
                Provider confirms your booking and arrives at scheduled time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">Why Choose MediTransit?</h2>
            <p className="text-muted-foreground">
              We ensure safe and comfortable medical transportation for your loved ones
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 bg-transparent shadow-none">
              <CardContent className="p-4 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Verified Providers</h3>
                <p className="text-sm text-muted-foreground">
                  All ambulance providers are verified with valid licenses and documentation
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-transparent shadow-none">
              <CardContent className="p-4 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                  <Clock className="h-7 w-7 text-accent" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">On-Time Service</h3>
                <p className="text-sm text-muted-foreground">
                  Punctual pickups with real-time tracking for your peace of mind
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-transparent shadow-none">
              <CardContent className="p-4 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <MapPin className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Wide Coverage</h3>
                <p className="text-sm text-muted-foreground">
                  Serving all major cities and districts across Tamil Nadu
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-transparent shadow-none">
              <CardContent className="p-4 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                  <Phone className="h-7 w-7 text-accent" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">24/7 Support</h3>
                <p className="text-sm text-muted-foreground">
                  Round-the-clock customer support for any assistance you need
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
            Are You an Ambulance Service Provider?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-primary-foreground/80">
            Join our platform to reach more patients and grow your business. 
            Get verified and start receiving booking requests today.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register/provider" className="gap-2">
              Register as Provider
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
