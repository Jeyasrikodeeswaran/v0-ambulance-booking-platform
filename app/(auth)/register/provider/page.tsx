'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/lib/context/auth-context'
import { tamilNaduCities } from '@/lib/data/mock-data'
import { toast } from 'sonner'
import { Ambulance, Eye, EyeOff, Loader2, Building2 } from 'lucide-react'

const providerSchema = z.object({
  // User info
  fullName: z.string().min(2, 'Company name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be 10 digits').max(10, 'Phone number must be 10 digits'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  // Provider info
  ownerName: z.string().min(2, 'Owner name must be at least 2 characters'),
  address: z.string().min(10, 'Please enter a complete address'),
  serviceArea: z.string().min(1, 'Please select a service area'),
  licenseNumber: z.string().min(5, 'Please enter a valid license number'),
  identificationProof: z.string().min(5, 'Please enter identification details'),
  // Bank details
  bankName: z.string().min(2, 'Please enter bank name'),
  accountNumber: z.string().min(8, 'Please enter a valid account number'),
  ifscCode: z.string().min(11, 'Please enter a valid IFSC code').max(11, 'IFSC code must be 11 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type ProviderFormData = z.infer<typeof providerSchema>

export default function ProviderRegisterPage() {
  const router = useRouter()
  const { registerProvider, sendOTP } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState(1)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
  })

  const serviceArea = watch('serviceArea')

  const handleNextStep = async () => {
    const fieldsToValidate = step === 1
      ? ['fullName', 'phone', 'email', 'password', 'confirmPassword'] as const
      : ['ownerName', 'address', 'serviceArea', 'licenseNumber', 'identificationProof'] as const
    
    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setStep(step + 1)
    }
  }

  const onSubmit = async (data: ProviderFormData) => {
    setIsLoading(true)
    try {
      const result = await registerProvider(
        {
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
          password: data.password,
          role: 'provider',
        },
        {
          companyName: data.fullName,
          ownerName: data.ownerName,
          address: data.address,
          serviceArea: data.serviceArea,
          licenseNumber: data.licenseNumber,
          identificationProof: data.identificationProof,
          bankDetails: {
            bankName: data.bankName,
            accountNumber: data.accountNumber,
            ifscCode: data.ifscCode,
          },
        }
      )
      
      if (result.success && result.userId) {
        toast.success(result.message)
        await sendOTP(data.phone, result.userId)
        router.push(`/verify-otp?phone=${data.phone}&userId=${result.userId}`)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Register as Provider</CardTitle>
          <CardDescription>
            Join MediTransit to offer ambulance services
          </CardDescription>
          {/* Step indicator */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  s === step
                    ? 'bg-primary text-primary-foreground'
                    : s < step
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {s}
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Step 1: Account Info */}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Company Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Your ambulance service name"
                    {...register('fullName')}
                    disabled={isLoading}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="9876543210"
                    {...register('phone')}
                    disabled={isLoading}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="company@example.com"
                    {...register('email')}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      {...register('password')}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    {...register('confirmPassword')}
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button type="button" className="w-full" onClick={handleNextStep}>
                  Next: Business Details
                </Button>
              </>
            )}

            {/* Step 2: Business Info */}
            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input
                    id="ownerName"
                    placeholder="Full name of the owner"
                    {...register('ownerName')}
                    disabled={isLoading}
                  />
                  {errors.ownerName && (
                    <p className="text-sm text-destructive">{errors.ownerName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Complete business address"
                    {...register('address')}
                    disabled={isLoading}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">{errors.address.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Service Area (City)</Label>
                  <Select value={serviceArea} onValueChange={(v) => setValue('serviceArea', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your service area" />
                    </SelectTrigger>
                    <SelectContent>
                      {tamilNaduCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.serviceArea && (
                    <p className="text-sm text-destructive">{errors.serviceArea.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Ambulance License Number</Label>
                  <Input
                    id="licenseNumber"
                    placeholder="TN-AMB-2024-XXX"
                    {...register('licenseNumber')}
                    disabled={isLoading}
                  />
                  {errors.licenseNumber && (
                    <p className="text-sm text-destructive">{errors.licenseNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identificationProof">Identification Proof (Aadhar/PAN)</Label>
                  <Input
                    id="identificationProof"
                    placeholder="AADHAR-XXXX-1234"
                    {...register('identificationProof')}
                    disabled={isLoading}
                  />
                  {errors.identificationProof && (
                    <p className="text-sm text-destructive">{errors.identificationProof.message}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="button" className="flex-1" onClick={handleNextStep}>
                    Next: Bank Details
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: Bank Details */}
            {step === 3 && (
              <>
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    Bank details are required for receiving payments. Your information is secure.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    placeholder="State Bank of India"
                    {...register('bankName')}
                    disabled={isLoading}
                  />
                  {errors.bankName && (
                    <p className="text-sm text-destructive">{errors.bankName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="1234567890"
                    {...register('accountNumber')}
                    disabled={isLoading}
                  />
                  {errors.accountNumber && (
                    <p className="text-sm text-destructive">{errors.accountNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    placeholder="SBIN0001234"
                    {...register('ifscCode')}
                    disabled={isLoading}
                  />
                  {errors.ifscCode && (
                    <p className="text-sm text-destructive">{errors.ifscCode.message}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      'Complete Registration'
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
