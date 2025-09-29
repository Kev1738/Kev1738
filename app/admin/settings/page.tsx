"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, MapPin, DollarSign, Shield, Bell, Car } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { SIERRA_LEONE_CONFIG, formatCurrency } from "@/lib/sierra-leone-config"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    platformName: "Muf Sierra Leone",
    supportEmail: "support@muf.sl",
    supportPhone: "+232 XX XXX XXXX",

    // Pricing Settings
    commissionRate: 15,
    surgeMultiplier: 30,
    sharedRideDiscount: 15,
    cancellationFee: 2000,
    minimumFare: 3000,
    waitingTimeRate: 500,

    // Geographic Settings
    defaultCity: "Freetown",
    operatingRadius: 50, // km from city center

    // Driver Settings
    driverApprovalRequired: true,
    minimumDriverRating: 4.0,
    backgroundCheckRequired: true,
    vehicleInspectionRequired: true,

    // Passenger Settings
    rideRatingRequired: true,
    multipleBookingsAllowed: false,

    // Notification Settings
    smsNotifications: true,
    emailNotifications: true,
    pushNotifications: true,

    // Payment Settings
    orangeMoneyEnabled: true,
    afrimoneyEnabled: true,
    cashPaymentEnabled: true,

    // Safety Settings
    emergencyContactsEnabled: true,
    rideTrackingEnabled: true,
    driverPhotoRequired: true,
    vehiclePhotoRequired: true,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    // Load settings from API
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSettings({ ...settings, ...data.settings })
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify(settings),
      })

      const data = await response.json()

      if (data.success) {
        setLastSaved(new Date())
        alert("Settings saved successfully!")
      } else {
        alert(data.error || "Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="h-8 w-8" />
              Platform Settings
            </h1>
            <p className="text-gray-600 mt-1">Configure Muf Sierra Leone platform settings</p>
          </div>

          <div className="flex items-center gap-4">
            {lastSaved && <span className="text-sm text-gray-500">Last saved: {lastSaved.toLocaleTimeString()}</span>}
            <Button onClick={saveSettings} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="platformName">Platform Name</Label>
                <Input
                  id="platformName"
                  value={settings.platformName}
                  onChange={(e) => updateSetting("platformName", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => updateSetting("supportEmail", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="supportPhone">Support Phone</Label>
                <Input
                  id="supportPhone"
                  value={settings.supportPhone}
                  onChange={(e) => updateSetting("supportPhone", e.target.value)}
                  placeholder="+232 XX XXX XXXX"
                />
              </div>
            </CardContent>
          </Card>

          {/* Geographic Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Geographic Settings
              </CardTitle>
              <CardDescription>Location and coverage area settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="defaultCity">Default City</Label>
                <Select value={settings.defaultCity} onValueChange={(value) => updateSetting("defaultCity", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIERRA_LEONE_CONFIG.cities.map((city) => (
                      <SelectItem key={city.name} value={city.name}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="operatingRadius">Operating Radius (km)</Label>
                <Input
                  id="operatingRadius"
                  type="number"
                  value={settings.operatingRadius}
                  onChange={(e) => updateSetting("operatingRadius", Number.parseInt(e.target.value))}
                />
              </div>

              <div className="pt-2">
                <h4 className="font-medium mb-2">Covered Cities</h4>
                <div className="flex flex-wrap gap-2">
                  {SIERRA_LEONE_CONFIG.cities.map((city) => (
                    <Badge key={city.name} variant="secondary">
                      {city.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Settings
              </CardTitle>
              <CardDescription>Configure fares and commission rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  value={settings.commissionRate}
                  onChange={(e) => updateSetting("commissionRate", Number.parseInt(e.target.value))}
                  min="0"
                  max="50"
                />
              </div>

              <div>
                <Label htmlFor="surgeMultiplier">Surge Pricing (%)</Label>
                <Input
                  id="surgeMultiplier"
                  type="number"
                  value={settings.surgeMultiplier}
                  onChange={(e) => updateSetting("surgeMultiplier", Number.parseInt(e.target.value))}
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <Label htmlFor="minimumFare">Minimum Fare</Label>
                <Input
                  id="minimumFare"
                  type="number"
                  value={settings.minimumFare}
                  onChange={(e) => updateSetting("minimumFare", Number.parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500 mt-1">{formatCurrency(settings.minimumFare)}</p>
              </div>

              <div>
                <Label htmlFor="cancellationFee">Cancellation Fee</Label>
                <Input
                  id="cancellationFee"
                  type="number"
                  value={settings.cancellationFee}
                  onChange={(e) => updateSetting("cancellationFee", Number.parseInt(e.target.value))}
                />
                <p className="text-sm text-gray-500 mt-1">{formatCurrency(settings.cancellationFee)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment Methods
              </CardTitle>
              <CardDescription>Enable/disable payment options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {SIERRA_LEONE_CONFIG.paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{method.icon}</span>
                    <div>
                      <span className="font-medium">{method.name}</span>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings[`${method.id.replace("_", "")}Enabled` as keyof typeof settings] as boolean}
                    onCheckedChange={(checked) => updateSetting(`${method.id.replace("_", "")}Enabled`, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Driver Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Driver Settings
              </CardTitle>
              <CardDescription>Driver verification and requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Manual Approval Required</span>
                  <p className="text-sm text-gray-500">Require admin approval for new drivers</p>
                </div>
                <Switch
                  checked={settings.driverApprovalRequired}
                  onCheckedChange={(checked) => updateSetting("driverApprovalRequired", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Background Check Required</span>
                  <p className="text-sm text-gray-500">Require background verification</p>
                </div>
                <Switch
                  checked={settings.backgroundCheckRequired}
                  onCheckedChange={(checked) => updateSetting("backgroundCheckRequired", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Vehicle Inspection Required</span>
                  <p className="text-sm text-gray-500">Require vehicle safety inspection</p>
                </div>
                <Switch
                  checked={settings.vehicleInspectionRequired}
                  onCheckedChange={(checked) => updateSetting("vehicleInspectionRequired", checked)}
                />
              </div>

              <div>
                <Label htmlFor="minimumDriverRating">Minimum Driver Rating</Label>
                <Input
                  id="minimumDriverRating"
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={settings.minimumDriverRating}
                  onChange={(e) => updateSetting("minimumDriverRating", Number.parseFloat(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Safety Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Safety & Security
              </CardTitle>
              <CardDescription>Safety features and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Emergency Contacts</span>
                  <p className="text-sm text-gray-500">Enable emergency contact features</p>
                </div>
                <Switch
                  checked={settings.emergencyContactsEnabled}
                  onCheckedChange={(checked) => updateSetting("emergencyContactsEnabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Real-time Ride Tracking</span>
                  <p className="text-sm text-gray-500">Track rides in real-time</p>
                </div>
                <Switch
                  checked={settings.rideTrackingEnabled}
                  onCheckedChange={(checked) => updateSetting("rideTrackingEnabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Driver Photo Required</span>
                  <p className="text-sm text-gray-500">Require driver profile photos</p>
                </div>
                <Switch
                  checked={settings.driverPhotoRequired}
                  onCheckedChange={(checked) => updateSetting("driverPhotoRequired", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Configure notification channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">SMS Notifications</span>
                  <p className="text-sm text-gray-500">Send SMS updates to users</p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => updateSetting("smsNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Email Notifications</span>
                  <p className="text-sm text-gray-500">Send email updates to users</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">Push Notifications</span>
                  <p className="text-sm text-gray-500">Send push notifications via app</p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => updateSetting("pushNotifications", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Types */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Vehicle Types & Pricing</CardTitle>
              <CardDescription>Configure available vehicle types and their pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SIERRA_LEONE_CONFIG.vehicleTypes.map((vehicle) => (
                  <div key={vehicle.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{vehicle.icon}</span>
                      <div>
                        <h4 className="font-semibold">{vehicle.name}</h4>
                        {vehicle.popular && (
                          <Badge variant="secondary" className="text-xs">
                            Popular
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{vehicle.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base Fare:</span>
                        <span className="font-medium">{formatCurrency(vehicle.baseFare)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Per KM:</span>
                        <span className="font-medium">{formatCurrency(vehicle.perKmRate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Capacity:</span>
                        <span className="font-medium">
                          {vehicle.capacity} passenger{vehicle.capacity > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Emergency Information
            </CardTitle>
            <CardDescription>Sierra Leone emergency contact numbers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <h4 className="font-semibold text-red-800">Police</h4>
                <p className="text-2xl font-bold text-red-600">{SIERRA_LEONE_CONFIG.emergency.police}</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800">Ambulance</h4>
                <p className="text-2xl font-bold text-blue-600">{SIERRA_LEONE_CONFIG.emergency.ambulance}</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <h4 className="font-semibold text-orange-800">Fire Service</h4>
                <p className="text-2xl font-bold text-orange-600">{SIERRA_LEONE_CONFIG.emergency.fire}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800">Muf Support</h4>
                <p className="text-lg font-bold text-green-600">{SIERRA_LEONE_CONFIG.emergency.support}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
