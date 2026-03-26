'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/context/auth-context'
import { providerStore, userStore } from '@/lib/data/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  User,
  Save,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

interface ProfileFormData {
  companyName: string
  ownerName: string
  phone: string
  email: string
  address: string
  serviceArea: string
}

interface BankFormData {
  accountNumber: string
  ifscCode: string
  bankName: string
}

export default function ProviderSettingsPage() {
  const { user, provider, updateUser } = useAuth()
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingBank, setIsSavingBank] = useState(false)
  
  const [profileData, setProfileData] = useState<ProfileFormData>({
    companyName: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    serviceArea: '',
  })

  const [bankData, setBankData] = useState<BankFormData>({
    accountNumber: '',
    ifscCode: '',
    bankName: '',
  })

  // Load provider data
  useEffect(() => {
    if (provider) {
      setProfileData({
        companyName: provider.companyName,
        ownerName: provider.ownerName,
        phone: provider.phone,
        email: provider.email,
        address: provider.address,
        serviceArea: provider.serviceArea,
      })
      setBankData({
        accountNumber: provider.bankDetails.accountNumber,
        ifscCode: provider.bankDetails.ifscCode,
        bankName: provider.bankDetails.bankName,
      })
    }
  }, [provider])

  const handleSaveProfile = async () => {
    if (!provider || !user) return

    setIsSavingProfile(true)

    try {
      // Update provider profile
      providerStore.update(provider.id, {
        companyName: profileData.companyName,
        ownerName: profileData.ownerName,
        phone: profileData.phone,
        email: profileData.email,
        address: profileData.address,
        serviceArea: profileData.serviceArea,
      })

      // Update user phone/email if changed
      if (user.phone !== profileData.phone || user.email !== profileData.email) {
        userStore.update(user.id, {
          phone: profileData.phone,
          email: profileData.email,
        })
        updateUser({ phone: profileData.phone, email: profileData.email })
      }

      toast.success('Profile updated successfully!')
    } catch {
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleSaveBank = async () => {
    if (!provider) return

    setIsSavingBank(true)

    try {
      providerStore.update(provider.id, {
        bankDetails: {
          accountNumber: bankData.accountNumber,
          ifscCode: bankData.ifscCode,
          bankName: bankData.bankName,
        },
      })

      toast.success('Bank details updated successfully!')
    } catch {
      toast.error('Failed to update bank details. Please try again.')
    } finally {
      setIsSavingBank(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Provider Settings</h1>
        <p className="text-muted-foreground">
          Manage your company profile and payment details
        </p>
      </div>

      {/* Company Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Company Profile</CardTitle>
              <CardDescription>Update your company information</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={profileData.companyName}
                onChange={(e) =>
                  setProfileData({ ...profileData, companyName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerName">Owner Name</Label>
              <Input
                id="ownerName"
                value={profileData.ownerName}
                onChange={(e) =>
                  setProfileData({ ...profileData, ownerName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value.replace(/\D/g, '') })
                }
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Business Address</Label>
            <Input
              id="address"
              value={profileData.address}
              onChange={(e) =>
                setProfileData({ ...profileData, address: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceArea">Service Area</Label>
            <Input
              id="serviceArea"
              placeholder="e.g., Chennai, Coimbatore, Madurai"
              value={profileData.serviceArea}
              onChange={(e) =>
                setProfileData({ ...profileData, serviceArea: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
              {isSavingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <CreditCard className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle>Bank Details</CardTitle>
              <CardDescription>Update your payment information for earnings payout</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input
              id="bankName"
              placeholder="e.g., State Bank of India"
              value={bankData.bankName}
              onChange={(e) =>
                setBankData({ ...bankData, bankName: e.target.value })
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="Enter account number"
                value={bankData.accountNumber}
                onChange={(e) =>
                  setBankData({ ...bankData, accountNumber: e.target.value.replace(/\D/g, '') })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <Input
                id="ifscCode"
                placeholder="e.g., SBIN0001234"
                value={bankData.ifscCode}
                onChange={(e) =>
                  setBankData({ ...bankData, ifscCode: e.target.value.toUpperCase() })
                }
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveBank} disabled={isSavingBank}>
              {isSavingBank ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Bank Details
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details and verification status</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium">Account Status</p>
                <p className="text-sm text-muted-foreground">Your provider account status</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${
                  provider?.status === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : provider?.status === 'pending'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {provider?.status}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium">License Number</p>
                <p className="text-sm text-muted-foreground">{provider?.licenseNumber}</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium">Member Since</p>
                <p className="text-sm text-muted-foreground">
                  {provider?.createdAt
                    ? new Date(provider.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
