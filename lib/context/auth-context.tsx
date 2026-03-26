'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { User, Provider, UserRole } from '@/lib/data/types'
import { userStore, providerStore, sessionStore, otpStore } from '@/lib/data/store'
import { toast } from 'sonner'

interface AuthContextType {
  user: User | null
  provider: Provider | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (phone: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  register: (data: RegisterData) => Promise<{ success: boolean; message: string; userId?: string }>
  registerProvider: (userData: RegisterData, providerData: ProviderRegisterData) => Promise<{ success: boolean; message: string; userId?: string }>
  sendOTP: (phone: string, userId?: string) => Promise<{ success: boolean; otp?: string; message: string }>
  verifyOTP: (phone: string, otp: string) => Promise<{ success: boolean; message: string }>
  updateUser: (updates: Partial<User>) => void
}

interface RegisterData {
  fullName: string
  phone: string
  email?: string
  password: string
  role: UserRole
}

interface ProviderRegisterData {
  companyName: string
  ownerName: string
  address: string
  serviceArea: string
  licenseNumber: string
  identificationProof: string
  bankDetails: {
    accountNumber: string
    ifscCode: string
    bankName: string
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [provider, setProvider] = useState<Provider | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from session on mount
  useEffect(() => {
    const storedUser = sessionStore.get()
    if (storedUser) {
      setUser(storedUser)
      if (storedUser.role === 'provider') {
        const providerData = providerStore.getByUserId(storedUser.id)
        setProvider(providerData || null)
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (phone: string, password: string): Promise<{ success: boolean; message: string }> => {
    const foundUser = userStore.getByPhone(phone)
    
    if (!foundUser) {
      return { success: false, message: 'User not found. Please register first.' }
    }
    
    if (foundUser.password !== password) {
      return { success: false, message: 'Invalid password. Please try again.' }
    }
    
    if (!foundUser.isVerified) {
      return { success: false, message: 'Please verify your phone number first.' }
    }
    
    // Check if provider is approved
    if (foundUser.role === 'provider') {
      const providerData = providerStore.getByUserId(foundUser.id)
      if (!providerData) {
        return { success: false, message: 'Provider profile not found.' }
      }
      if (providerData.status === 'pending') {
        return { success: false, message: 'Your provider account is pending approval. Please wait for admin verification.' }
      }
      if (providerData.status === 'rejected') {
        return { success: false, message: 'Your provider account has been rejected. Please contact support.' }
      }
      setProvider(providerData)
    }
    
    setUser(foundUser)
    sessionStore.set(foundUser)
    
    return { success: true, message: 'Login successful!' }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setProvider(null)
    sessionStore.clear()
    toast.success('Logged out successfully')
  }, [])

  const register = useCallback(async (data: RegisterData): Promise<{ success: boolean; message: string; userId?: string }> => {
    // Check if phone already exists
    const existingUser = userStore.getByPhone(data.phone)
    if (existingUser) {
      return { success: false, message: 'Phone number already registered. Please login.' }
    }
    
    // Check if email already exists
    if (data.email) {
      const existingEmail = userStore.getByEmail(data.email)
      if (existingEmail) {
        return { success: false, message: 'Email already registered.' }
      }
    }
    
    const newUser = userStore.create({
      ...data,
      isVerified: false,
    })
    
    return { success: true, message: 'Registration successful! Please verify your phone number.', userId: newUser.id }
  }, [])

  const registerProvider = useCallback(async (
    userData: RegisterData,
    providerData: ProviderRegisterData
  ): Promise<{ success: boolean; message: string; userId?: string }> => {
    // Register user first
    const userResult = await register({ ...userData, role: 'provider' })
    if (!userResult.success || !userResult.userId) {
      return userResult
    }
    
    // Create provider profile
    providerStore.create({
      userId: userResult.userId,
      companyName: providerData.companyName,
      ownerName: providerData.ownerName,
      phone: userData.phone,
      email: userData.email || '',
      address: providerData.address,
      serviceArea: providerData.serviceArea,
      licenseNumber: providerData.licenseNumber,
      identificationProof: providerData.identificationProof,
      bankDetails: providerData.bankDetails,
      status: 'pending',
    })
    
    return { 
      success: true, 
      message: 'Provider registration successful! Please verify your phone number. Your account will be reviewed by admin.',
      userId: userResult.userId,
    }
  }, [register])

  const sendOTP = useCallback(async (phone: string, userId?: string): Promise<{ success: boolean; otp?: string; message: string }> => {
    const session = otpStore.create(phone, userId)
    
    // In a real app, you would send SMS here
    // For demo, we show the OTP in a toast
    toast.info(`Demo OTP: ${session.otp}`, {
      duration: 10000,
      description: 'This OTP is shown for demo purposes only.',
    })
    
    return { 
      success: true, 
      otp: session.otp, // Only for demo purposes
      message: 'OTP sent successfully!' 
    }
  }, [])

  const verifyOTP = useCallback(async (phone: string, otp: string): Promise<{ success: boolean; message: string }> => {
    const result = otpStore.verify(phone, otp)
    
    if (!result.valid) {
      return { success: false, message: 'Invalid or expired OTP. Please try again.' }
    }
    
    // Mark user as verified
    if (result.userId) {
      const updatedUser = userStore.update(result.userId, { isVerified: true })
      if (updatedUser) {
        setUser(updatedUser)
        sessionStore.set(updatedUser)
        
        // Load provider data if applicable
        if (updatedUser.role === 'provider') {
          const providerData = providerStore.getByUserId(updatedUser.id)
          setProvider(providerData || null)
        }
      }
    }
    
    return { success: true, message: 'Phone number verified successfully!' }
  }, [])

  const updateUser = useCallback((updates: Partial<User>) => {
    if (!user) return
    const updatedUser = userStore.update(user.id, updates)
    if (updatedUser) {
      setUser(updatedUser)
      sessionStore.set(updatedUser)
    }
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        provider,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
        registerProvider,
        sendOTP,
        verifyOTP,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
