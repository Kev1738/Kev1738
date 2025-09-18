"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Save, Bell, Shield, DollarSign, MapPin, Globe, Key } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Badge } from "@/components/ui/badge"

interface SystemSettings {
  general: {
    appName: string
    supportEmail: string
    supportPhone: string
    timezone: string
    currency: string
    language: string
  }
  pricing: {
    baseFare: number
    perKmRate: number
    perMinuteRate: number
    minimumFare: number
    cancellationFee: number
    commissionRate: number
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    rideUpdates: boolean
    promotionalEmails: boolean
    driverAlerts: boolean
  }
  security: {
    twoFactorAuth: boolean
    sessionTimeout: number
    passwordExpiry: number
    maxLoginAttempts: number
    requireEmailVerification: boolean
    requirePhoneVerification: boolean
  }
  maps: {
    provider: string
    apiKey: string
    defaultZoom: number
    enableTraffic: boolean
    enableSatellite: boolean
  }
  payments: {
    stripeEnabled: boolean
    paypalEnabled: boolean
    cashEnabled: boolean
    walletEnabled: boolean
    autoWithdrawal: boolean
    minimumWithdrawal: number
  }
}

const defaultSettings: SystemSettings = {
  general: {
    appName: "UberClone",
    supportEmail: "support@uberclone.com",
    supportPhone: "+1-800-UBER-HELP",
    timezone: "UTC",
    currency: "USD",
    language: "English",
  },
  pricing: {
    baseFare: 2.5,
    perKmRate: 1.2,
    perMinuteRate: 0.25,
    minimumFare: 5.0,
    cancellationFee: 3.0,
    commissionRate: 20,
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    rideUpdates: true,
    promotionalEmails: false,
    driverAlerts: true,
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    maxLoginAttempts: 5,
    requireEmailVerification: true,
    requirePhoneVerification: true,
  },
  maps: {
    provider: "Google Maps",
    apiKey: "AIza*********************",
    defaultZoom: 15,
    enableTraffic: true,
    enableSatellite: false,
  },
  payments: {
    stripeEnabled: true,
    paypalEnabled: false,
    cashEnabled: true,
    walletEnabled: true,
    autoWithdrawal: false,
    minimumWithdrawal: 50,
  },
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }))
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Settings className="mr-3 h-8 w-8" />
              System Settings
            </h1>
            <p className="text-muted-foreground">Configure your application settings</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>

        {saved && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">Settings saved successfully!</p>
          </div>
        )}

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="maps">Maps</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>Basic application configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appName">Application Name</Label>
                    <Input
                      id="appName"
                      value={settings.general.appName}
                      onChange={(e) => updateSetting("general", "appName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      value={settings.general.timezone}
                      onChange={(e) => updateSetting("general", "timezone", e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="GMT">Greenwich Mean Time</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={settings.general.supportEmail}
                      onChange={(e) => updateSetting("general", "supportEmail", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportPhone">Support Phone</Label>
                    <Input
                      id="supportPhone"
                      value={settings.general.supportPhone}
                      onChange={(e) => updateSetting("general", "supportPhone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <select
                      id="currency"
                      value={settings.general.currency}
                      onChange={(e) => updateSetting("general", "currency", e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Default Language</Label>
                    <select
                      id="language"
                      value={settings.general.language}
                      onChange={(e) => updateSetting("general", "language", e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Pricing Configuration
                </CardTitle>
                <CardDescription>Set fare rates and commission structure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="baseFare">Base Fare ($)</Label>
                    <Input
                      id="baseFare"
                      type="number"
                      step="0.01"
                      value={settings.pricing.baseFare}
                      onChange={(e) => updateSetting("pricing", "baseFare", Number.parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perKmRate">Per KM Rate ($)</Label>
                    <Input
                      id="perKmRate"
                      type="number"
                      step="0.01"
                      value={settings.pricing.perKmRate}
                      onChange={(e) => updateSetting("pricing", "perKmRate", Number.parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perMinuteRate">Per Minute Rate ($)</Label>
                    <Input
                      id="perMinuteRate"
                      type="number"
                      step="0.01"
                      value={settings.pricing.perMinuteRate}
                      onChange={(e) => updateSetting("pricing", "perMinuteRate", Number.parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimumFare">Minimum Fare ($)</Label>
                    <Input
                      id="minimumFare"
                      type="number"
                      step="0.01"
                      value={settings.pricing.minimumFare}
                      onChange={(e) => updateSetting("pricing", "minimumFare", Number.parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cancellationFee">Cancellation Fee ($)</Label>
                    <Input
                      id="cancellationFee"
                      type="number"
                      step="0.01"
                      value={settings.pricing.cancellationFee}
                      onChange={(e) => updateSetting("pricing", "cancellationFee", Number.parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                    <Input
                      id="commissionRate"
                      type="number"
                      value={settings.pricing.commissionRate}
                      onChange={(e) => updateSetting("pricing", "commissionRate", Number.parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Pricing Preview</h4>
                  <p className="text-sm text-blue-700">
                    Example 10km, 20-minute ride: Base ${settings.pricing.baseFare} + Distance $
                    {(10 * settings.pricing.perKmRate).toFixed(2)} + Time $
                    {(20 * settings.pricing.perMinuteRate).toFixed(2)} ={" "}
                    <strong>
                      $
                      {(
                        settings.pricing.baseFare +
                        10 * settings.pricing.perKmRate +
                        20 * settings.pricing.perMinuteRate
                      ).toFixed(2)}
                    </strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via email</p>
                    </div>
                    <Switch
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={(checked) => updateSetting("notifications", "emailNotifications", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                    </div>
                    <Switch
                      checked={settings.notifications.smsNotifications}
                      onCheckedChange={(checked) => updateSetting("notifications", "smsNotifications", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send push notifications to mobile apps</p>
                    </div>
                    <Switch
                      checked={settings.notifications.pushNotifications}
                      onCheckedChange={(checked) => updateSetting("notifications", "pushNotifications", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Ride Updates</Label>
                      <p className="text-sm text-muted-foreground">Notify users about ride status changes</p>
                    </div>
                    <Switch
                      checked={settings.notifications.rideUpdates}
                      onCheckedChange={(checked) => updateSetting("notifications", "rideUpdates", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Promotional Emails</Label>
                      <p className="text-sm text-muted-foreground">Send promotional and marketing emails</p>
                    </div>
                    <Switch
                      checked={settings.notifications.promotionalEmails}
                      onCheckedChange={(checked) => updateSetting("notifications", "promotionalEmails", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Driver Alerts</Label>
                      <p className="text-sm text-muted-foreground">Send alerts to drivers about new rides</p>
                    </div>
                    <Switch
                      checked={settings.notifications.driverAlerts}
                      onCheckedChange={(checked) => updateSetting("notifications", "driverAlerts", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Configure security and authentication settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                    </div>
                    <Switch
                      checked={settings.security.twoFactorAuth}
                      onCheckedChange={(checked) => updateSetting("security", "twoFactorAuth", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Verification</Label>
                      <p className="text-sm text-muted-foreground">Require email verification for new accounts</p>
                    </div>
                    <Switch
                      checked={settings.security.requireEmailVerification}
                      onCheckedChange={(checked) => updateSetting("security", "requireEmailVerification", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Phone Verification</Label>
                      <p className="text-sm text-muted-foreground">Require phone verification for new accounts</p>
                    </div>
                    <Switch
                      checked={settings.security.requirePhoneVerification}
                      onCheckedChange={(checked) => updateSetting("security", "requirePhoneVerification", checked)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting("security", "sessionTimeout", Number.parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                    <Input
                      id="passwordExpiry"
                      type="number"
                      value={settings.security.passwordExpiry}
                      onChange={(e) => updateSetting("security", "passwordExpiry", Number.parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => updateSetting("security", "maxLoginAttempts", Number.parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Maps Configuration
                </CardTitle>
                <CardDescription>Configure map provider and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mapProvider">Map Provider</Label>
                    <select
                      id="mapProvider"
                      value={settings.maps.provider}
                      onChange={(e) => updateSetting("maps", "provider", e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="Google Maps">Google Maps</option>
                      <option value="Mapbox">Mapbox</option>
                      <option value="OpenStreetMap">OpenStreetMap</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultZoom">Default Zoom Level</Label>
                    <Input
                      id="defaultZoom"
                      type="number"
                      min="1"
                      max="20"
                      value={settings.maps.defaultZoom}
                      onChange={(e) => updateSetting("maps", "defaultZoom", Number.parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="apiKey"
                      type="password"
                      value={settings.maps.apiKey}
                      onChange={(e) => updateSetting("maps", "apiKey", e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline">
                      <Key className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Enable Traffic Layer</Label>
                      <p className="text-sm text-muted-foreground">Show real-time traffic information</p>
                    </div>
                    <Switch
                      checked={settings.maps.enableTraffic}
                      onCheckedChange={(checked) => updateSetting("maps", "enableTraffic", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Enable Satellite View</Label>
                      <p className="text-sm text-muted-foreground">Allow users to switch to satellite view</p>
                    </div>
                    <Switch
                      checked={settings.maps.enableSatellite}
                      onCheckedChange={(checked) => updateSetting("maps", "enableSatellite", checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Payment Settings
                </CardTitle>
                <CardDescription>Configure payment methods and processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex items-center">
                      <Label className="text-base">Stripe Integration</Label>
                      <Badge variant="secondary" className="ml-2">
                        Recommended
                      </Badge>
                    </div>
                    <Switch
                      checked={settings.payments.stripeEnabled}
                      onCheckedChange={(checked) => updateSetting("payments", "stripeEnabled", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">PayPal Integration</Label>
                      <p className="text-sm text-muted-foreground">Accept PayPal payments</p>
                    </div>
                    <Switch
                      checked={settings.payments.paypalEnabled}
                      onCheckedChange={(checked) => updateSetting("payments", "paypalEnabled", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Cash Payments</Label>
                      <p className="text-sm text-muted-foreground">Allow cash payments</p>
                    </div>
                    <Switch
                      checked={settings.payments.cashEnabled}
                      onCheckedChange={(checked) => updateSetting("payments", "cashEnabled", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Digital Wallet</Label>
                      <p className="text-sm text-muted-foreground">Enable in-app wallet system</p>
                    </div>
                    <Switch
                      checked={settings.payments.walletEnabled}
                      onCheckedChange={(checked) => updateSetting("payments", "walletEnabled", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Auto Withdrawal</Label>
                      <p className="text-sm text-muted-foreground">Automatically withdraw driver earnings</p>
                    </div>
                    <Switch
                      checked={settings.payments.autoWithdrawal}
                      onCheckedChange={(checked) => updateSetting("payments", "autoWithdrawal", checked)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumWithdrawal">Minimum Withdrawal Amount ($)</Label>
                  <Input
                    id="minimumWithdrawal"
                    type="number"
                    value={settings.payments.minimumWithdrawal}
                    onChange={(e) => updateSetting("payments", "minimumWithdrawal", Number.parseInt(e.target.value))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
