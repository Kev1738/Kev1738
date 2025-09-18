"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ImageUpload } from "@/components/image-upload"
import { useSession } from "@/hooks/use-session"
import { User, Mail, MapPin, Calendar, Star, Settings, Camera, Save, AlertCircle, CheckCircle } from "lucide-react"

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone: string
  role: string
  profile_image_url?: string
  created_at: string
  updated_at: string
  address?: string
  emergency_contact_name?: string
  preferred_payment_method?: string
  rating?: number
  total_rides?: number
  wallet_balance?: number
}

export default function PassengerProfile() {
  const router = useRouter()
  const { session, loading: sessionLoading } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    emergency_contact: "",
    home_address: "",
    work_address: "",
    preferred_payment_method: "card",
  })

  useEffect(() => {
    if (!sessionLoading) {
      if (!session) {
        console.log("No session found, redirecting to login")
        router.push("/auth/login")
        return
      }

      if (session.role !== "passenger") {
        console.log("User is not a passenger, redirecting")
        router.push(`/${session.role}/dashboard`)
        return
      }

      loadProfile()
    }
  }, [session, sessionLoading, router])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Loading passenger profile...")

      const response = await fetch("/api/user/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      })

      console.log("Profile response status:", response.status)

      if (!response.ok) {
        if (response.status === 401) {
          console.log("Unauthorized, redirecting to login")
          router.push("/auth/login")
          return
        }
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("Profile fetch failed:", response.status, errorData)
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log("Profile data received:", data)

      if (data.success) {
        setProfile(data.data)
        setFormData({
          full_name: data.data.full_name || "",
          phone: data.data.phone || "",
          emergency_contact: data.data.emergency_contact_name || "",
          home_address: data.data.address || "",
          work_address: data.data.work_address || "",
          preferred_payment_method: data.data.preferred_payment_method || "card",
        })
      } else {
        setError(data.error || "Failed to load profile")
      }
    } catch (err) {
      console.error("Load profile error:", err)
      setError(err instanceof Error ? err.message : "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setProfile(data.data)
        setSuccess("Profile updated successfully!")
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || "Failed to save profile")
      }
    } catch (err) {
      console.error("Save profile error:", err)
      setError(err instanceof Error ? err.message : "Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (imageUrl: string) => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          profile_image_url: imageUrl,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProfile(data.data)
          setSuccess("Profile image updated!")
          setTimeout(() => setSuccess(null), 3000)
        }
      }
    } catch (err) {
      console.error("Image upload error:", err)
      setError("Failed to update profile image")
    }
  }

  if (sessionLoading || loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2">Loading profile...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Profile</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="space-x-2">
                <Button onClick={loadProfile} variant="outline">
                  Try Again
                </Button>
                <Button onClick={() => router.push("/auth/login")} variant="default">
                  Go to Login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p>Profile not found</p>
              <Button onClick={loadProfile} className="mt-4">
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>
        <Badge variant="secondary" className="capitalize">
          {profile.role}
        </Badge>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span>{success}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture and Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Picture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.profile_image_url || "/placeholder.svg?height=96&width=96"} />
                <AvatarFallback className="text-lg">
                  {profile.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <ImageUpload onUpload={handleImageUpload}>
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
              </ImageUpload>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Member since {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
              {profile.rating && (
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>{profile.rating.toFixed(1)} rating</span>
                </div>
              )}
              {profile.total_rides !== undefined && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{profile.total_rides} total rides</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>Update your personal details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact">Emergency Contact</Label>
                <Input
                  id="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  placeholder="Emergency contact number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred_payment_method">Preferred Payment</Label>
                <select
                  id="preferred_payment_method"
                  value={formData.preferred_payment_method}
                  onChange={(e) => setFormData({ ...formData, preferred_payment_method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="cash">Cash</option>
                  <option value="wallet">Digital Wallet</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="home_address">Home Address</Label>
                <Input
                  id="home_address"
                  value={formData.home_address}
                  onChange={(e) => setFormData({ ...formData, home_address: e.target.value })}
                  placeholder="Enter your home address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="work_address">Work Address</Label>
                <Input
                  id="work_address"
                  value={formData.work_address}
                  onChange={(e) => setFormData({ ...formData, work_address: e.target.value })}
                  placeholder="Enter your work address"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Account Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{profile.total_rides || 0}</div>
              <div className="text-sm text-gray-600">Total Rides</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {profile.rating ? profile.rating.toFixed(1) : "N/A"}
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 capitalize">
                {profile.preferred_payment_method || "Not Set"}
              </div>
              <div className="text-sm text-gray-600">Payment Method</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">${profile.wallet_balance?.toFixed(2) || "0.00"}</div>
              <div className="text-sm text-gray-600">Wallet Balance</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
