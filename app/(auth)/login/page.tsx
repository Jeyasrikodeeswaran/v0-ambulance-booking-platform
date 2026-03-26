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
import { useAuth } from '@/lib/context/auth-context'
import { toast } from 'sonner'
import { Ambulance, Eye, EyeOff, Loader2 } from 'lucide-react'

const loginSchema = z.object({
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(10, 'Phone number must be 10 digits'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const result = await login(data.phone, data.password)
      
      if (result.success) {
        toast.success(result.message)
        // Redirect based on role (handled by auth context)
        router.push('/dashboard')
        router.refresh()
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
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Ambulance className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your MediTransit account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              {"Don't have an account?"}{' '}
              <Link href="/register/user" className="font-medium text-primary hover:underline">
                Register as User
              </Link>
            </p>
            <p className="mt-2 text-muted-foreground">
              Want to provide ambulance services?{' '}
              <Link href="/register/provider" className="font-medium text-primary hover:underline">
                Register as Provider
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4">
            <p className="mb-2 text-sm font-medium text-foreground">Demo Credentials</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="font-medium">User:</span> 9876543210 / user123</p>
              <p><span className="font-medium">Provider:</span> 9876500001 / provider123</p>
              <p><span className="font-medium">Admin:</span> 9999999999 / admin123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
