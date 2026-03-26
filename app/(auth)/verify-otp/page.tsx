'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { useAuth } from '@/lib/context/auth-context'
import { toast } from 'sonner'
import { Ambulance, Loader2, RefreshCw } from 'lucide-react'

function VerifyOTPContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { verifyOTP, sendOTP, user } = useAuth()
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const phone = searchParams.get('phone') || ''
  const userId = searchParams.get('userId') || ''

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    setIsLoading(true)
    try {
      const result = await verifyOTP(phone, otp)
      
      if (result.success) {
        toast.success(result.message)
        // Redirect based on role
        if (user?.role === 'provider') {
          toast.info('Your account is pending admin approval.')
          router.push('/login')
        } else {
          router.push('/dashboard')
        }
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsResending(true)
    try {
      const result = await sendOTP(phone, userId)
      if (result.success) {
        toast.success('OTP sent successfully!')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to resend OTP')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Ambulance className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Verify Phone Number</CardTitle>
          <CardDescription>
            {"We've sent a 6-digit OTP to"} <span className="font-medium text-foreground">{phone}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP
              value={otp}
              onChange={setOtp}
              maxLength={6}
              disabled={isLoading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            className="w-full"
            onClick={handleVerify}
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {"Didn't receive the code?"}
            </p>
            <Button
              variant="link"
              className="gap-2"
              onClick={handleResendOTP}
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Resend OTP
                </>
              )}
            </Button>
          </div>

          {/* Demo Note */}
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-center text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Demo Mode:</span> The OTP is shown in a toast notification for testing purposes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  )
}
