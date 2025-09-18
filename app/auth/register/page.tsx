"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Car, User, Phone, Mail, CreditCard, Calendar, DollarSign } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    phone: "",
    role: "",
    // Driver specific fields
    license_number: "",
    license_expiry: "",
    bio: "",
    years_experience: "",
    languages: "",
    bank_account_number: "",
    bank_name: "",
    // Passenger specific fields
    preferred_payment_method: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    if (!formData.role) {
      setError("Please select a role")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess("Account created successfully! Redirecting to login...")
        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      } else {
        setError(data.error || "Registration failed")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Car className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold">Muf</h1>
          </div>
          <CardTitle className="text-2xl">Create Your Account</CardTitle>
          <CardDescription>Join the Muf ride-sharing platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Full Name *
                </label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                Email Address *
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Password *</label>
                <Input
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password *</label>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Account Type *</label>
              <Select onValueChange={(value) => handleInputChange("role", value)} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your account type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passenger">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Passenger - Book rides
                    </div>
                  </SelectItem>
                  <SelectItem value="driver">
                    <div className="flex items-center">
                      <Car className="h-4 w-4 mr-2" />
                      Driver - Provide rides
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Driver Specific Fields */}
            {formData.role === "driver" && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Car className="h-5 w-5 mr-2" />
                  Driver Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <CreditCard className="h-4 w-4 mr-1" />
                      Driver's License Number
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter your license number"
                      value={formData.license_number}
                      onChange={(e) => handleInputChange("license_number", e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      License Expiry Date
                    </label>
                    <Input
                      type="date"
                      value={formData.license_expiry}
                      onChange={(e) => handleInputChange("license_expiry", e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Bio</label>
                  <Textarea
                    placeholder="Tell passengers about yourself..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    disabled={loading}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Years of Experience</label>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      max="50"
                      value={formData.years_experience}
                      onChange={(e) => handleInputChange("years_experience", e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Languages Spoken</label>
                    <Input
                      type="text"
                      placeholder="English, Spanish, French..."
                      value={formData.languages}
                      onChange={(e) => handleInputChange("languages", e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      Bank Account Number
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter account number"
                      value={formData.bank_account_number}
                      onChange={(e) => handleInputChange("bank_account_number", e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bank Name</label>
                    <Input
                      type="text"
                      placeholder="Enter bank name"
                      value={formData.bank_name}
                      onChange={(e) => handleInputChange("bank_name", e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Passenger Specific Fields */}
            {formData.role === "passenger" && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Passenger Preferences
                </h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Preferred Payment Method</label>
                  <Select
                    onValueChange={(value) => handleInputChange("preferred_payment_method", value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="wallet">Digital Wallet</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
