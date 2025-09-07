import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, MapPin, Shield, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">RideShare Pro</span>
          </div>
          <div className="space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">Your Ride, Your Way</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Professional ride-sharing platform connecting passengers with drivers. Safe, reliable, and convenient
          transportation at your fingertips.
        </p>
        <div className="space-x-4">
          <Link href="/auth/register?role=passenger">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Book a Ride
            </Button>
          </Link>
          <Link href="/auth/register?role=driver">
            <Button size="lg" variant="outline">
              Drive & Earn
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Real-time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Live location sharing and GPS tracking for safe and efficient rides</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Shared & Private Rides</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Choose between shared rides to save money or private rides for comfort</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Safe & Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Verified drivers, secure payments, and 24/7 support for your safety</CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
