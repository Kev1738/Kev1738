"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Users, Shield, Clock, Star, Phone } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [selectedVehicle, setSelectedVehicle] = useState("okada")

  const vehicleTypes = [
    {
      id: "okada",
      name: "Okada",
      description: "Motorcycle ride - Quick and affordable",
      price: "Le 5,000",
      icon: "🏍️",
      popular: true,
    },
    {
      id: "keke",
      name: "Keke",
      description: "Tricycle - Comfortable for short trips",
      price: "Le 8,000",
      icon: "🛺",
      popular: false,
    },
    {
      id: "car",
      name: "Car",
      description: "Private car - Premium comfort",
      price: "Le 15,000",
      icon: "🚗",
      popular: false,
    },
  ]

  const features = [
    {
      icon: <MapPin className="h-8 w-8 text-green-600" />,
      title: "Real-time Tracking",
      description: "Track your ride in real-time across Freetown and major cities in Sierra Leone",
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Trusted Drivers",
      description: "All drivers are verified and rated by the Sierra Leone community",
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-600" />,
      title: "Safe & Secure",
      description: "Your safety is our priority with 24/7 support and emergency features",
    },
    {
      icon: <Clock className="h-8 w-8 text-orange-600" />,
      title: "Quick Booking",
      description: "Book your ride in seconds and get picked up within minutes",
    },
  ]

  const cities = ["Freetown", "Bo", "Kenema", "Makeni", "Koidu", "Port Loko", "Waterloo", "Mile 91"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Muf</span>
              <span className="text-sm text-gray-500 bg-green-100 px-2 py-1 rounded-full">Sierra Leone</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-green-600 hover:bg-green-700">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Your Ride, Your Way
              <span className="block text-green-600">Across Sierra Leone</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Safe, reliable, and affordable transportation connecting you to every corner of Sierra Leone. From
              Freetown to Bo, Kenema to Makeni - we've got you covered.
            </p>

            {/* Vehicle Selection */}
            <div className="max-w-4xl mx-auto mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Ride</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {vehicleTypes.map((vehicle) => (
                  <Card
                    key={vehicle.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedVehicle === vehicle.id ? "ring-2 ring-green-500 bg-green-50" : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedVehicle(vehicle.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">{vehicle.icon}</div>
                      <h4 className="font-semibold text-gray-900 flex items-center justify-center gap-2">
                        {vehicle.name}
                        {vehicle.popular && (
                          <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">Popular</span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">{vehicle.description}</p>
                      <p className="text-lg font-bold text-green-600">{vehicle.price}</p>
                      <p className="text-xs text-gray-500">Starting fare</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register?role=passenger">
                <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3">
                  Book a Ride
                </Button>
              </Link>
              <Link href="/auth/register?role=driver">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-3 border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
                >
                  Drive with Muf
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Muf?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for Sierra Leone, by Sierra Leoneans. Experience transportation that understands your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Available Across Sierra Leone</h2>
            <p className="text-xl text-gray-600">Connecting major cities and communities nationwide</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cities.map((city, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <MapPin className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <span className="font-medium text-gray-900">{city}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-green-100">Happy Riders</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-green-100">Verified Drivers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">8</div>
              <div className="text-green-100">Cities Covered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.8</div>
              <div className="text-green-100 flex items-center justify-center gap-1">
                <Star className="h-5 w-5 fill-current" />
                Average Rating
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of Sierra Leoneans who trust Muf for their daily transportation needs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/auth/register?role=passenger">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3">
                Start Riding Today
              </Button>
            </Link>
            <Link href="/auth/register?role=driver">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
              >
                Become a Driver
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Phone className="h-5 w-5" />
            <span>Need help? Call us at +232 XX XXX XXXX</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="text-2xl font-bold">Muf</span>
              </div>
              <p className="text-gray-400">
                Sierra Leone's trusted ride-sharing platform, connecting communities across the nation.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Riders</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/auth/register?role=passenger" className="hover:text-white">
                    Book a Ride
                  </Link>
                </li>
                <li>
                  <Link href="/passenger/history" className="hover:text-white">
                    Ride History
                  </Link>
                </li>
                <li>
                  <Link href="/passenger/payment" className="hover:text-white">
                    Payment Methods
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">For Drivers</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/auth/register?role=driver" className="hover:text-white">
                    Drive with Muf
                  </Link>
                </li>
                <li>
                  <Link href="/driver/earnings" className="hover:text-white">
                    Earnings
                  </Link>
                </li>
                <li>
                  <Link href="/driver/profile" className="hover:text-white">
                    Driver Profile
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>+232 XX XXX XXXX</li>
                <li>support@muf.sl</li>
                <li>24/7 Customer Service</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2025 Muf Sierra Leone. All rights reserved. | Supporting local communities across Sierra Leone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
