"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { User, Phone, Mail, MapPin, Bell, Shield, Star, AlertCircle } from "lucide-react"
import { PassengerLayout } from "@/components/passenger-layout"
import { AuthGuard } from "@/components/auth-guard"
import { useSession } from "@/hooks/use-session"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ImageUpload } from "@/components/image-upload"

export default function PassengerProfilePage() {
  const { session, isLoading: sessionLoading } = useSession()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    profile_image_url: "",
  })
  const [preferences, setPreferences] = useState({
    notifications: true,
    sms_updates: true,
    email_updates: false,
    location_sharing: true,
    ride_sharing: true,
  })

  useEffect(() => {
    // Only load profile when session is available and not loading
    if (session && !sessionLoading) {
      console.log("🔄 Session available, loading profile for:", session.email)
      loadProfile()
    } else if (!sessionLoading && !session) {
      console.log("❌ No session available")
      setError("Please log in to view your profile")
      setLoading(false)
    }
  }, [session, sessionLoading])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("📡 Fetching profile data...")

      const response = await fetch("/api/user/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
      })

      console.log("📡 Profile API response status:", response.status)

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please log in to access your profile")
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("📡 Profile API result:", result.success ? "Success" : "Failed")

      if (result.success) {
        const profileData = result.data
        setProfile(profileData)
        setFormData({
          full_name: profileData.full_name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          date_of_birth: profileData.date_of_birth || "",
          gender: profileData.gender || "",
          address: profileData.address || "",
          emergency_contact_name: profileData.emergency_contact_name || "",
          emergency_contact_phone: profileData.emergency_contact_phone || "",
          profile_image_url: profileData.profile_image_url || "",
        })
        console.log("✅ Profile loaded successfully")
      } else {
        throw new Error(result.error || "Failed to load profile")
      }
    } catch (err) {
      console.error("❌ Load profile error:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load profile"
      setError(errorMessage)

      // If unauthorized, redirect to login
      if (errorMessage.includes("log in") || errorMessage.includes("Unauthorized")) {
        setTimeout(() => {
          window.location.href = "/auth/login"
        }, 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setProfile(result.data)
        alert("Profile updated successfully!")
      } else {
        throw new Error(result.error || "Failed to update profile")
      }
    } catch (err) {
      console.error("Save profile error:", err)
      alert(err instanceof Error ? err.message : "Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleImageUploaded = (imageUrl: string) => {
    setFormData((prev) => ({ ...prev, profile_image_url: imageUrl }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Show loading while session is being verified
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Verifying session..." />
      </div>
    )
  }

  // Show error if no session
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <h2 className="text-xl font-semibold">Authentication Required</h2>
              <p className="text-gray-600">Please log in to access your profile.</p>
              <Button onClick={() => (window.location.href = "/auth/login")}>Go to Login</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <AuthGuard requiredRole="passenger">
      <PassengerLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-gray-600">Manage your account information and preferences</p>
          </div>

          {/* Error State */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="text-red-700">{error}</p>
                </div>
                <Button onClick={loadProfile} variant="outline" size="sm" className="mt-3 bg-transparent">
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" text="Loading profile..." />
            </div>
          )}

          {/* Profile Content */}
          {!loading && profile && (
            <>
              {/* Profile Header */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-6">
                    <ImageUpload
                      currentImage={formData.profile_image_url}
                      onImageUploaded={handleImageUploaded}
                      purpose="profile_image"
                      size="lg"
                      fallbackText={profile.full_name?.charAt(0) || "U"}
                    />
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                      <p className="text-gray-600">{profile.email}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="secondary">
                          Member since {profile.created_at ? formatDate(profile.created_at) : "Recently"}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">4.9</span>
                        </div>
                        <Badge variant="outline">{profile.statistics?.total_rides || 0} rides</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="personal" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="verification">Verification</TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Personal Information
                      </CardTitle>
                      <CardDescription>Update your personal details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="full_name">Full Name</Label>
                          <Input
                            id="full_name"
                            value={formData.full_name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, full_name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="date_of_birth">Date of Birth</Label>
                          <Input
                            id="date_of_birth"
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) => setFormData((prev) => ({ ...prev, date_of_birth: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="gender">Gender</Label>
                          <Select
                            value={formData.gender}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                          <Input
                            id="emergency_contact_name"
                            value={formData.emergency_contact_name}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, emergency_contact_name: e.target.value }))
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                          <Input
                            id="emergency_contact_phone"
                            value={formData.emergency_contact_phone}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, emergency_contact_phone: e.target.value }))
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address">Home Address</Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                          placeholder="Enter your full address"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Notification Preferences
                      </CardTitle>
                      <CardDescription>Choose how you want to be notified</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Push Notifications</p>
                          <p className="text-sm text-gray-600">Receive notifications in the app</p>
                        </div>
                        <Switch
                          checked={preferences.notifications}
                          onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, notifications: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">SMS Updates</p>
                          <p className="text-sm text-gray-600">Get ride updates via text message</p>
                        </div>
                        <Switch
                          checked={preferences.sms_updates}
                          onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, sms_updates: checked }))}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Updates</p>
                          <p className="text-sm text-gray-600">Receive promotional emails and updates</p>
                        </div>
                        <Switch
                          checked={preferences.email_updates}
                          onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, email_updates: checked }))}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Privacy Preferences
                      </CardTitle>
                      <CardDescription>Control your privacy settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Location Sharing</p>
                          <p className="text-sm text-gray-600">Share location with drivers during rides</p>
                        </div>
                        <Switch
                          checked={preferences.location_sharing}
                          onCheckedChange={(checked) =>
                            setPreferences((prev) => ({ ...prev, location_sharing: checked }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Ride Sharing</p>
                          <p className="text-sm text-gray-600">Allow shared rides with other passengers</p>
                        </div>
                        <Switch
                          checked={preferences.ride_sharing}
                          onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, ride_sharing: checked }))}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Security Settings
                      </CardTitle>
                      <CardDescription>Manage your account security</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="current_password">Current Password</Label>
                          <Input id="current_password" type="password" />
                        </div>
                        <div>
                          <Label htmlFor="new_password">New Password</Label>
                          <Input id="new_password" type="password" />
                        </div>
                        <div>
                          <Label htmlFor="confirm_password">Confirm New Password</Label>
                          <Input id="confirm_password" type="password" />
                        </div>
                        <Button>Update Password</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Two-Factor Authentication</CardTitle>
                      <CardDescription>Add an extra layer of security to your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">SMS Authentication</p>
                          <p className="text-sm text-gray-600">Receive verification codes via SMS</p>
                        </div>
                        <Button variant="outline">Enable</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="verification" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Verification</CardTitle>
                      <CardDescription>Verify your account for enhanced security and features</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5" />
                          <div>
                            <p className="font-medium">Phone Number</p>
                            <p className="text-sm text-gray-600">{profile.phone || "Not provided"}</p>
                          </div>
                        </div>
                        <Badge variant={profile.phone ? "default" : "secondary"}>
                          {profile.phone ? "Verified" : "Not Verified"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5" />
                          <div>
                            <p className="font-medium">Email Address</p>
                            <p className="text-sm text-gray-600">{profile.email}</p>
                          </div>
                        </div>
                        <Badge variant="default">Verified</Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5" />
                          <div>
                            <p className="font-medium">Identity Verification</p>
                            <p className="text-sm text-gray-600">Upload government ID for verification</p>
                          </div>
                        </div>
                        <Button variant="outline">Upload ID</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} disabled={saving} size="lg">
                  {saving ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Saving...</span>
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </PassengerLayout>
    </AuthGuard>
  )
}
