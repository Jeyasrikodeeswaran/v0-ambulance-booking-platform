import type {
  User,
  Provider,
  Ambulance,
  Booking,
  PlatformSettings,
  OTPSession,
} from './types'
import {
  sampleUsers,
  sampleProviders,
  sampleAmbulances,
  sampleBookings,
  defaultSettings,
} from './mock-data'

const STORAGE_KEYS = {
  USERS: 'meditransit_users',
  PROVIDERS: 'meditransit_providers',
  AMBULANCES: 'meditransit_ambulances',
  BOOKINGS: 'meditransit_bookings',
  SETTINGS: 'meditransit_settings',
  OTP_SESSIONS: 'meditransit_otp_sessions',
  CURRENT_USER: 'meditransit_current_user',
} as const

// Initialize store with sample data if empty
function initializeStore() {
  if (typeof window === 'undefined') return

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(sampleUsers))
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROVIDERS)) {
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(sampleProviders))
  }
  if (!localStorage.getItem(STORAGE_KEYS.AMBULANCES)) {
    localStorage.setItem(STORAGE_KEYS.AMBULANCES, JSON.stringify(sampleAmbulances))
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(sampleBookings))
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings))
  }
  if (!localStorage.getItem(STORAGE_KEYS.OTP_SESSIONS)) {
    localStorage.setItem(STORAGE_KEYS.OTP_SESSIONS, JSON.stringify([]))
  }
}

// Generic getter
function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  initializeStore()
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : fallback
}

// Generic setter
function setToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

// Users
export const userStore = {
  getAll: (): User[] => getFromStorage(STORAGE_KEYS.USERS, sampleUsers),
  
  getById: (id: string): User | undefined => {
    const users = userStore.getAll()
    return users.find(u => u.id === id)
  },
  
  getByPhone: (phone: string): User | undefined => {
    const users = userStore.getAll()
    return users.find(u => u.phone === phone)
  },
  
  getByEmail: (email: string): User | undefined => {
    const users = userStore.getAll()
    return users.find(u => u.email === email)
  },
  
  create: (user: Omit<User, 'id' | 'createdAt'>): User => {
    const users = userStore.getAll()
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    setToStorage(STORAGE_KEYS.USERS, users)
    return newUser
  },
  
  update: (id: string, updates: Partial<User>): User | undefined => {
    const users = userStore.getAll()
    const index = users.findIndex(u => u.id === id)
    if (index === -1) return undefined
    users[index] = { ...users[index], ...updates }
    setToStorage(STORAGE_KEYS.USERS, users)
    return users[index]
  },
  
  delete: (id: string): boolean => {
    const users = userStore.getAll()
    const filtered = users.filter(u => u.id !== id)
    if (filtered.length === users.length) return false
    setToStorage(STORAGE_KEYS.USERS, filtered)
    return true
  },
}

// Providers
export const providerStore = {
  getAll: (): Provider[] => getFromStorage(STORAGE_KEYS.PROVIDERS, sampleProviders),
  
  getById: (id: string): Provider | undefined => {
    const providers = providerStore.getAll()
    return providers.find(p => p.id === id)
  },
  
  getByUserId: (userId: string): Provider | undefined => {
    const providers = providerStore.getAll()
    return providers.find(p => p.userId === userId)
  },
  
  getByStatus: (status: Provider['status']): Provider[] => {
    const providers = providerStore.getAll()
    return providers.filter(p => p.status === status)
  },
  
  create: (provider: Omit<Provider, 'id' | 'createdAt'>): Provider => {
    const providers = providerStore.getAll()
    const newProvider: Provider = {
      ...provider,
      id: `provider-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    providers.push(newProvider)
    setToStorage(STORAGE_KEYS.PROVIDERS, providers)
    return newProvider
  },
  
  update: (id: string, updates: Partial<Provider>): Provider | undefined => {
    const providers = providerStore.getAll()
    const index = providers.findIndex(p => p.id === id)
    if (index === -1) return undefined
    providers[index] = { ...providers[index], ...updates }
    setToStorage(STORAGE_KEYS.PROVIDERS, providers)
    return providers[index]
  },
  
  delete: (id: string): boolean => {
    const providers = providerStore.getAll()
    const filtered = providers.filter(p => p.id !== id)
    if (filtered.length === providers.length) return false
    setToStorage(STORAGE_KEYS.PROVIDERS, filtered)
    return true
  },
}

// Ambulances
export const ambulanceStore = {
  getAll: (): Ambulance[] => getFromStorage(STORAGE_KEYS.AMBULANCES, sampleAmbulances),
  
  getById: (id: string): Ambulance | undefined => {
    const ambulances = ambulanceStore.getAll()
    return ambulances.find(a => a.id === id)
  },
  
  getByProviderId: (providerId: string): Ambulance[] => {
    const ambulances = ambulanceStore.getAll()
    return ambulances.filter(a => a.providerId === providerId)
  },
  
  getAvailable: (type?: Ambulance['type'], location?: string): Ambulance[] => {
    const ambulances = ambulanceStore.getAll()
    const providers = providerStore.getAll()
    const approvedProviderIds = providers.filter(p => p.status === 'approved').map(p => p.id)
    
    return ambulances.filter(a => {
      if (a.status !== 'available') return false
      if (a.registrationStatus !== 'approved') return false
      if (!approvedProviderIds.includes(a.providerId)) return false
      if (type && a.type !== type) return false
      if (location && !a.baseLocation.toLowerCase().includes(location.toLowerCase())) return false
      return true
    })
  },
  
  create: (ambulance: Omit<Ambulance, 'id' | 'createdAt'>): Ambulance => {
    const ambulances = ambulanceStore.getAll()
    const newAmbulance: Ambulance = {
      ...ambulance,
      id: `amb-${Date.now()}`,
      registrationStatus: 'pending',
      createdAt: new Date().toISOString(),
    }
    ambulances.push(newAmbulance)
    setToStorage(STORAGE_KEYS.AMBULANCES, ambulances)
    return newAmbulance
  },
  
  update: (id: string, updates: Partial<Ambulance>): Ambulance | undefined => {
    const ambulances = ambulanceStore.getAll()
    const index = ambulances.findIndex(a => a.id === id)
    if (index === -1) return undefined
    ambulances[index] = { ...ambulances[index], ...updates }
    setToStorage(STORAGE_KEYS.AMBULANCES, ambulances)
    return ambulances[index]
  },
  
  delete: (id: string): boolean => {
    const ambulances = ambulanceStore.getAll()
    const filtered = ambulances.filter(a => a.id !== id)
    if (filtered.length === ambulances.length) return false
    setToStorage(STORAGE_KEYS.AMBULANCES, filtered)
    return true
  },
}

// Bookings
export const bookingStore = {
  getAll: (): Booking[] => getFromStorage(STORAGE_KEYS.BOOKINGS, sampleBookings),
  
  getById: (id: string): Booking | undefined => {
    const bookings = bookingStore.getAll()
    return bookings.find(b => b.id === id)
  },
  
  getByUserId: (userId: string): Booking[] => {
    const bookings = bookingStore.getAll()
    return bookings.filter(b => b.userId === userId)
  },
  
  getByProviderId: (providerId: string): Booking[] => {
    const bookings = bookingStore.getAll()
    return bookings.filter(b => b.providerId === providerId)
  },
  
  getByAmbulanceId: (ambulanceId: string): Booking[] => {
    const bookings = bookingStore.getAll()
    return bookings.filter(b => b.ambulanceId === ambulanceId)
  },
  
  getByStatus: (status: Booking['status']): Booking[] => {
    const bookings = bookingStore.getAll()
    return bookings.filter(b => b.status === status)
  },
  
  create: (booking: Omit<Booking, 'id' | 'createdAt'>): Booking => {
    const bookings = bookingStore.getAll()
    const newBooking: Booking = {
      ...booking,
      id: `booking-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    bookings.push(newBooking)
    setToStorage(STORAGE_KEYS.BOOKINGS, bookings)
    return newBooking
  },
  
  update: (id: string, updates: Partial<Booking>): Booking | undefined => {
    const bookings = bookingStore.getAll()
    const index = bookings.findIndex(b => b.id === id)
    if (index === -1) return undefined
    bookings[index] = { ...bookings[index], ...updates }
    setToStorage(STORAGE_KEYS.BOOKINGS, bookings)
    return bookings[index]
  },
  
  delete: (id: string): boolean => {
    const bookings = bookingStore.getAll()
    const filtered = bookings.filter(b => b.id !== id)
    if (filtered.length === bookings.length) return false
    setToStorage(STORAGE_KEYS.BOOKINGS, filtered)
    return true
  },
}

// Platform Settings
export const settingsStore = {
  get: (): PlatformSettings => getFromStorage(STORAGE_KEYS.SETTINGS, defaultSettings),
  
  update: (updates: Partial<PlatformSettings>): PlatformSettings => {
    const settings = settingsStore.get()
    const newSettings = { ...settings, ...updates }
    setToStorage(STORAGE_KEYS.SETTINGS, newSettings)
    return newSettings
  },
}

// OTP Sessions
export const otpStore = {
  getAll: (): OTPSession[] => getFromStorage(STORAGE_KEYS.OTP_SESSIONS, []),
  
  create: (phone: string, userId?: string): OTPSession => {
    const sessions = otpStore.getAll()
    // Remove any existing session for this phone
    const filtered = sessions.filter(s => s.phone !== phone)
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const session: OTPSession = {
      phone,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      userId,
    }
    
    filtered.push(session)
    setToStorage(STORAGE_KEYS.OTP_SESSIONS, filtered)
    return session
  },
  
  verify: (phone: string, otp: string): { valid: boolean; userId?: string } => {
    const sessions = otpStore.getAll()
    const session = sessions.find(s => s.phone === phone)
    
    if (!session) return { valid: false }
    if (new Date(session.expiresAt) < new Date()) return { valid: false }
    if (session.otp !== otp) return { valid: false }
    
    // Remove the session after successful verification
    const filtered = sessions.filter(s => s.phone !== phone)
    setToStorage(STORAGE_KEYS.OTP_SESSIONS, filtered)
    
    return { valid: true, userId: session.userId }
  },
  
  getByPhone: (phone: string): OTPSession | undefined => {
    const sessions = otpStore.getAll()
    return sessions.find(s => s.phone === phone)
  },
}

// Current User Session
export const sessionStore = {
  get: (): User | null => {
    if (typeof window === 'undefined') return null
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    return data ? JSON.parse(data) : null
  },
  
  set: (user: User): void => {
    setToStorage(STORAGE_KEYS.CURRENT_USER, user)
  },
  
  clear: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  },
}

// Reset store to initial state (useful for testing)
export function resetStore(): void {
  if (typeof window === 'undefined') return
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
  initializeStore()
}
