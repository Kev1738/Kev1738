"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { User, Phone, Mail, MapPin, Bell, Shield, Camera, Star } from "lucide-react"
import { PassengerLayout } from "@/components/passenger-layout"
import { AuthGuard } from "@/components/auth-guard"
import { useSession } from "@/hooks/use-session"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorAlert } from "@/components/error-alert"

export default function PassengerProfilePage() {
  const { session } = useSession()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    emergency_contact: "",
    home_address: "",
  })
  const [preferences, setPreferences] = useState({
    notifications: true,
    sms_updates: true,
    email_updates: false,
    location_sharing: true,
    ride_sharing: true,
  })

  useEffect(() => {
    if (session) {
      loadProfile()
    }
  }, [session])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      // For now, use session data and mock additional profile data
      // In a real app, this would fetch from /api/user/profile

      const mockProfile = {
        ...session,
        emergency_contact: "+1 (555) 123-4567",
        home_address: "123 Main St, Downtown, City 12345",
        member_since: "2023-06-15",
        total_rides: 47,
        rating: 4.9,
        verified_phone: true,
        verified_email: true,
      }

      setProfile(mockProfile)
      setFormData({
        full_name: mockProfile.full_name || "",
        email: mockProfile.email || "",
        phone: mockProfile.phone || "",
        emergency_contact: mockProfile.emergency_contact || "",
        home_address: mockProfile.home_address || "",
      })
    } catch (err) {
      console.error("Load profile error:", err)
      setError(err instanceof Error ? err.message : "Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Update profile with form data
      setProfile((prev: any) => ({ ...prev, ...formData }))

      alert("Profile updated successfully!")
    } catch (err) {
      console.error("Save profile error:", err)
      alert("Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (!session) return null

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
          {error && <ErrorAlert message={error} onRetry={loadProfile} />}

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
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profile.profile_image_url || "/placeholder.svg"} />
                        <AvatarFallback className="text-2xl">{profile.full_name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-transparent"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                      <p className="text-gray-600">{profile.email}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="secondary">Member since {formatDate(profile.member_since)}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{profile.rating}</span>
                        </div>
                        <Badge variant="outline">{profile.total_rides} rides</Badge>
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
                          <Label htmlFor="emergency_contact">Emergency Contact</Label>
                          <Input
                            id="emergency_contact"
                            value={formData.emergency_contact}
                            onChange={(e) => setFormData((prev) => ({ ...prev, emergency_contact: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="home_address">Home Address</Label>
                        <Input
                          id="home_address"
                          value={formData.home_address}
                          onChange={(e) => setFormData((prev) => ({ ...prev, home_address: e.target.value }))}
                        />
                      </div>

                      <Button onClick={handleSaveProfile} disabled={saving}>
                        {saving ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span className="ml-2">Saving...</span>
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
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
                            <p className="text-sm text-gray-600">{profile.phone}</p>
                          </div>
                        </div>
                        <Badge variant={profile.verified_phone ? "default" : "secondary"}>
                          {profile.verified_phone ? "Verified" : "Unverified"}
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
                        <Badge variant={profile.verified_email ? "default" : "secondary"}>
                          {profile.verified_email ? "Verified" : "Unverified"}
                        </Badge>
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
            </>
          )}
        </div>
      </PassengerLayout>
    </AuthGuard>
  )
}
