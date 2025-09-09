import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Users, MapPin, Shield, Clock, Star } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">RideShare Pro</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Ride, Your Way
            <span className="block text-blue-600">Anywhere in Sierra Leone</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience seamless transportation with cars, keke, and bikes. Safe, reliable, and affordable rides at your
            fingertips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register?role=passenger">
              <Button size="lg" className="w-full sm:w-auto">
                Book a Ride
              </Button>
            </Link>
            <Link href="/auth/register?role=driver">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                Drive & Earn
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose RideShare Pro?</h2>
            <p className="text-xl text-gray-600">Built for Sierra Leone, designed for everyone</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <MapPin className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Multiple Vehicle Options</CardTitle>
                <CardDescription>
                  Choose from cars, keke (tricycles), and bikes based on your needs and budget
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Safe & Secure</CardTitle>
                <CardDescription>
                  All drivers are verified with proper documentation and background checks
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Real-time Tracking</CardTitle>
                <CardDescription>
                  Track your ride in real-time and share your trip with family and friends
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Shared Rides</CardTitle>
                <CardDescription>Save money with shared rides while meeting new people on your route</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Star className="h-12 w-12 text-yellow-600 mb-4" />
                <CardTitle>Rating System</CardTitle>
                <CardDescription>
                  Rate your experience and help maintain high service quality for everyone
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Car className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Flexible Payment</CardTitle>
                <CardDescription>Pay with cash, card, or digital wallet - whatever works best for you</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Transparent Pricing</h2>
            <p className="text-xl text-gray-600">No hidden fees, just fair prices</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 border-blue-200">
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">🏍️</div>
                <CardTitle>Bike</CardTitle>
                <CardDescription>Quick and affordable for short distances</CardDescription>
                <div className="text-3xl font-bold text-blue-600 mt-4">Le50</div>
                <div className="text-sm text-gray-500">Base fare + Le20/km</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Perfect for traffic</li>
                  <li>✓ Eco-friendly</li>
                  <li>✓ Fast delivery</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">🛺</div>
                <CardTitle>Keke</CardTitle>
                <CardDescription>Comfortable ride for 2-3 passengers</CardDescription>
                <div className="text-3xl font-bold text-green-600 mt-4">Le100</div>
                <div className="text-sm text-gray-500">Base fare + Le30/km</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Weather protection</li>
                  <li>✓ Affordable</li>
                  <li>✓ Local favorite</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200">
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">🚗</div>
                <CardTitle>Car</CardTitle>
                <CardDescription>Premium comfort for longer journeys</CardDescription>
                <div className="text-3xl font-bold text-purple-600 mt-4">Le200</div>
                <div className="text-sm text-gray-500">Base fare + Le50/km</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Air conditioning</li>
                  <li>✓ Spacious</li>
                  <li>✓ Professional drivers</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of satisfied riders and drivers across Sierra Leone</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register?role=passenger">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Start Riding Today
              </Button>
            </Link>
            <Link href="/auth/register?role=driver">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                Become a Driver
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Car className="h-6 w-6" />
                <span className="text-xl font-bold">RideShare Pro</span>
              </div>
              <p className="text-gray-400">Making transportation accessible and affordable for everyone in Salon.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Riders</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Book a Ride</li>
                <li>Safety</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">For Drivers</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Drive & Earn</li>
                <li>Requirements</li>
                <li>Resources</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Contact</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 RideShare Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
