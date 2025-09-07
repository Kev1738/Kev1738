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
import { Separator } from "@/components/ui/separator"
import { User, Car, CreditCard, Star } from "lucide-react"
import { DriverLayout } from "@/components/driver-layout"
import { AuthGuard } from "@/components/auth-guard"
import { useSession } from "@/hooks/use-session"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorAlert } from "@/components/error-alert"
import { ImageUpload } from "@/components/image-upload"

export default function DriverProfilePage() {
  const { session } = useSession()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    // User profile
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    profile_image_url: "",
    // Driver profile
    bio: "",
    years_experience: 0,
    languages: [] as string[],
    vehicle_description: "",
    bank_account_number: "",
    bank_name: "",
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

      const response = await fetch("/api/user/profile")
      const result = await response.json()

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
          bio: profileData.driver_profile?.bio || "",
          years_experience: profileData.driver_profile?.years_experience || 0,
          languages: profileData.driver_profile?.languages || [],
          vehicle_description: profileData.driver_profile?.vehicle_description || "",
          bank_account_number: profileData.driver_profile?.bank_account_number || "",
          bank_name: profileData.driver_profile?.bank_name || "",
        })
      } else {
        throw new Error(result.error || "Failed to load profile")
      }
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

      const { bio, years_experience, languages, vehicle_description, bank_account_number, bank_name, ...userProfile } =
        formData

      const profileData = {
        ...userProfile,
        driver_profile: {
          bio,
          years_experience,
          languages,
          vehicle_description,
          bank_account_number,
          bank_name,
        },
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
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

  const addLanguage = (language: string) => {
    if (language && !formData.languages.includes(language)) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, language],
      }))
    }
  }

  const removeLanguage = (language: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((lang) => lang !== language),
    }))
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
    <AuthGuard requiredRole="driver">
      <DriverLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Driver Profile</h1>
            <p className="text-gray-600">Manage your driver profile and account information</p>
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
                    <ImageUpload
                      currentImage={formData.profile_image_url}
                      onImageUploaded={handleImageUploaded}
                      purpose="profile_image"
                      size="lg"
                      fallbackText={profile.full_name?.charAt(0) || "D"}
                    />
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                      <p className="text-gray-600">{profile.email}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="secondary">Driver since {formatDate(profile.created_at)}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{profile.driver_profile?.rating || "5.0"}</span>
                        </div>
                        <Badge variant="outline">{profile.driver_profile?.total_rides || 0} rides</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="personal" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="driver">Driver Details</TabsTrigger>
                  <TabsTrigger value="vehicle">Vehicle Info</TabsTrigger>
                  <TabsTrigger value="banking">Banking</TabsTrigger>
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
                          <Label htmlFor="years_experience">Years of Driving Experience</Label>
                          <Input
                            id="years_experience"
                            type="number"
                            min="0"
                            value={formData.years_experience}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                years_experience: Number.parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                          placeholder="Enter your full address"
                        />
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="driver" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Driver Information
                      </CardTitle>
                      <CardDescription>Tell passengers about yourself</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                          placeholder="Tell passengers about yourself, your driving style, and what makes you a great driver..."
                          rows={4}
                        />
                      </div>

                      <div>
                        <Label>Languages Spoken</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.languages.map((language) => (
                            <Badge
                              key={language}
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => removeLanguage(language)}
                            >
                              {language} ×
                            </Badge>
                          ))}
                        </div>
                        <Select onValueChange={addLanguage}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Add a language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="English">English</SelectItem>
                            <SelectItem value="Spanish">Spanish</SelectItem>
                            <SelectItem value="French">French</SelectItem>
                            <SelectItem value="German">German</SelectItem>
                            <SelectItem value="Italian">Italian</SelectItem>
                            <SelectItem value="Portuguese">Portuguese</SelectItem>
                            <SelectItem value="Chinese">Chinese</SelectItem>
                            <SelectItem value="Japanese">Japanese</SelectItem>
                            <SelectItem value="Korean">Korean</SelectItem>
                            <SelectItem value="Arabic">Arabic</SelectItem>
                            <SelectItem value="Hindi">Hindi</SelectItem>
                            <SelectItem value="Russian">Russian</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="vehicle" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        Vehicle Information
                      </CardTitle>
                      <CardDescription>Describe your vehicle for passengers</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="vehicle_description">Vehicle Description</Label>
                        <Textarea
                          id="vehicle_description"
                          value={formData.vehicle_description}
                          onChange={(e) => setFormData((prev) => ({ ...prev, vehicle_description: e.target.value }))}
                          placeholder="Describe your vehicle (e.g., 2020 Toyota Camry, Silver, Clean and comfortable with AC, phone chargers available...)"
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="banking" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Banking Information
                      </CardTitle>
                      <CardDescription>Manage your payment details for earnings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="bank_name">Bank Name</Label>
                          <Input
                            id="bank_name"
                            value={formData.bank_name}
                            onChange={(e) => setFormData((prev) => ({ ...prev, bank_name: e.target.value }))}
                            placeholder="e.g., Chase Bank"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bank_account_number">Account Number</Label>
                          <Input
                            id="bank_account_number"
                            value={formData.bank_account_number}
                            onChange={(e) => setFormData((prev) => ({ ...prev, bank_account_number: e.target.value }))}
                            placeholder="Enter your account number"
                            type="password"
                          />
                        </div>
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
      </DriverLayout>
    </AuthGuard>
  )
}
