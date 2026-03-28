// User Types
export type UserRole = 'user' | 'provider' | 'admin'

export interface User {
  id: string
  fullName: string
  phone: string
  email?: string
  password: string
  role: UserRole
  createdAt: string
  isVerified: boolean
}

// Provider Types
export type ProviderStatus = 'pending' | 'approved' | 'rejected'

export interface BankDetails {
  accountNumber: string
  ifscCode: string
  bankName: string
}

export interface Provider {
  id: string
  userId: string
  companyName: string
  ownerName: string
  phone: string
  email: string
  address: string
  serviceArea: string
  licenseNumber: string
  identificationProof: string
  bankDetails: BankDetails
  status: ProviderStatus
  createdAt: string
}

// Ambulance Types
export type AmbulanceType = 'basic' | 'oxygen' | 'icu'
export type AmbulanceStatus = 'available' | 'booked' | 'on_trip' | 'maintenance'

export interface Ambulance {
  id: string
  providerId: string
  vehicleNumber: string
  type: AmbulanceType
  driverName: string
  driverPhone: string
  baseLocation: string
  baseCharge: number
  pricePerKm: number
  status: AmbulanceStatus
  registrationStatus: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

// Booking Types
export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled'

export interface Location {
  address: string
  lat: number
  lng: number
}

export interface Booking {
  id: string
  userId: string
  ambulanceId: string
  providerId: string
  pickupLocation: Location
  dropLocation: Location
  date: string
  time: string
  endTime?: string
  patientName: string
  patientAge: number
  patientCondition: string
  needOxygen: boolean
  wheelchairRequired: boolean
  specialInstructions?: string
  distance: number
  estimatedCost: number
  status: BookingStatus
  createdAt: string
}

// Platform Settings
export interface PlatformSettings {
  commissionPercentage: number
}

// Search and Filter Types
export interface SearchFilters {
  pickupLocation: string
  dropLocation: string
  date: string
  time: string
  ambulanceType?: AmbulanceType
}

// OTP Verification
export interface OTPSession {
  phone: string
  otp: string
  expiresAt: string
  userId?: string
}

// Dashboard Stats
export interface UserStats {
  totalBookings: number
  completedTrips: number
  pendingBookings: number
}

export interface ProviderStats {
  totalAmbulances: number
  activeBookings: number
  completedTrips: number
  pendingRequests: number
  totalRevenue: number
}

export interface AdminStats {
  totalUsers: number
  totalProviders: number
  pendingApprovals: number
  totalBookings: number
  totalRevenue: number
  platformCommission: number
}
