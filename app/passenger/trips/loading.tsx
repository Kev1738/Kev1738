import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function TripsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse" />
          </div>

          {/* Filter Skeleton */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse" />
                <div className="w-40 h-10 bg-gray-200 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>

          {/* Trip Cards Skeleton */}
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
                    <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
                      <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Loading Indicator */}
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading trips...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
