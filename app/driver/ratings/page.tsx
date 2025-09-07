"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Star, TrendingUp, Award, MessageSquare } from "lucide-react"
import { DriverLayout } from "@/components/driver-layout"
import { AuthGuard } from "@/components/auth-guard"
import { useSession } from "@/hooks/use-session"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorAlert } from "@/components/error-alert"

export default function DriverRatingsPage() {
  const { session } = useSession()
  const [ratingsData, setRatingsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session) {
      loadRatings()
    }
  }, [session])

  const loadRatings = async () => {
    try {
      setLoading(true)
      setError(null)

      // For now, we'll use mock data since we haven't implemented the ratings API yet
      // In a real implementation, this would fetch from /api/driver/ratings

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockData = {
        averageRating: 4.8,
        totalRatings: 156,
        ratingDistribution: {
          5: 120,
          4: 25,
          3: 8,
          2: 2,
          1: 1,
        },
        recentReviews: [
          {
            id: "1",
            rating: 5,
            comment: "Excellent driver! Very professional and safe driving.",
            passenger: "Sarah Johnson",
            date: "2024-01-15T10:30:00Z",
            ride: {
              pickup: "Downtown Mall",
              destination: "Airport Terminal 1",
            },
          },
          {
            id: "2",
            rating: 5,
            comment: "Great conversation and arrived exactly on time.",
            passenger: "Mike Chen",
            date: "2024-01-14T15:45:00Z",
            ride: {
              pickup: "Central Station",
              destination: "Business District",
            },
          },
          {
            id: "3",
            rating: 4,
            comment: "Good ride, clean car. Could improve on route knowledge.",
            passenger: "Lisa Brown",
            date: "2024-01-13T09:15:00Z",
            ride: {
              pickup: "University Campus",
              destination: "Shopping Center",
            },
          },
          {
            id: "4",
            rating: 5,
            comment: "Amazing service! Will definitely request again.",
            passenger: "David Wilson",
            date: "2024-01-12T18:20:00Z",
            ride: {
              pickup: "Hotel Plaza",
              destination: "Conference Center",
            },
          },
        ],
        achievements: [
          { name: "5-Star Driver", description: "Maintained 4.8+ rating", icon: "⭐" },
          { name: "Safe Driver", description: "No incidents in 6 months", icon: "🛡️" },
          { name: "Punctual Pro", description: "95% on-time arrivals", icon: "⏰" },
          { name: "Customer Favorite", description: "100+ positive reviews", icon: "❤️" },
        ],
      }

      setRatingsData(mockData)
    } catch (err) {
      console.error("Load ratings error:", err)
      setError(err instanceof Error ? err.message : "Failed to load ratings")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  if (!session) return null

  return (
    <AuthGuard requiredRole="driver">
      <DriverLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Ratings & Reviews</h1>
            <p className="text-gray-600">See what passengers think about your service</p>
          </div>

          {/* Error State */}
          {error && <ErrorAlert message={error} onRetry={loadRatings} />}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" text="Loading ratings..." />
            </div>
          )}

          {/* Ratings Content */}
          {!loading && ratingsData && (
            <>
              {/* Rating Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="text-4xl font-bold text-yellow-600">{ratingsData.averageRating}</CardTitle>
                    <CardDescription>
                      <div className="flex justify-center gap-1 mb-2">
                        {renderStars(Math.round(ratingsData.averageRating))}
                      </div>
                      Based on {ratingsData.totalRatings} ratings
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Rating Trend</span>
                        <span className="text-green-600">+0.2 this month</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Response Rate</span>
                        <span>98%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Completion Rate</span>
                        <span>96%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {ratingsData.achievements.slice(0, 4).map((achievement: any, index: number) => (
                        <div key={index} className="text-center">
                          <div className="text-2xl mb-1">{achievement.icon}</div>
                          <div className="text-xs font-medium">{achievement.name}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Rating Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Rating Distribution</CardTitle>
                  <CardDescription>Breakdown of your ratings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = ratingsData.ratingDistribution[stars] || 0
                      const percentage = (count / ratingsData.totalRatings) * 100

                      return (
                        <div key={stars} className="flex items-center gap-4">
                          <div className="flex items-center gap-1 w-16">
                            <span className="text-sm font-medium">{stars}</span>
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          </div>
                          <div className="flex-1">
                            <Progress value={percentage} className="h-2" />
                          </div>
                          <div className="w-16 text-right">
                            <span className="text-sm text-gray-600">{count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Recent Reviews
                  </CardTitle>
                  <CardDescription>What passengers are saying about you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {ratingsData.recentReviews.map((review: any) => (
                      <div key={review.id} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex gap-1">{renderStars(review.rating)}</div>
                              <Badge variant="outline">{review.rating}/5</Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              by {review.passenger} • {formatDate(review.date)}
                            </p>
                          </div>
                        </div>

                        <p className="text-gray-900 mb-3">{review.comment}</p>

                        <div className="text-sm text-gray-500">
                          <span className="font-medium">Trip:</span> {review.ride.pickup} → {review.ride.destination}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Achievements Detail */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Achievements</CardTitle>
                  <CardDescription>Badges you've earned for excellent service</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ratingsData.achievements.map((achievement: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div>
                          <h4 className="font-medium">{achievement.name}</h4>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DriverLayout>
    </AuthGuard>
  )
}
