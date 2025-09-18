"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, CheckCircle, Clock, ExternalLink } from "lucide-react"

interface TestResult {
  name: string
  url: string
  status: "success" | "warning" | "error"
  loadTime: number
  error?: string
  category: "core" | "auth" | "passenger" | "driver" | "admin" | "api"
}

const TEST_PAGES = [
  // Core Pages
  { name: "Landing Page", url: "/", category: "core" },
  { name: "Test Session", url: "/test-session", category: "core" },

  // Auth Pages
  { name: "Login", url: "/auth/login", category: "auth" },
  { name: "Register", url: "/auth/register", category: "auth" },

  // Passenger Pages
  { name: "Passenger Dashboard", url: "/passenger/dashboard", category: "passenger" },
  { name: "Book Ride", url: "/passenger/book-ride", category: "passenger" },
  { name: "Passenger Trips", url: "/passenger/trips", category: "passenger" },
  { name: "Passenger History", url: "/passenger/history", category: "passenger" },
  { name: "Passenger Payment", url: "/passenger/payment", category: "passenger" },
  { name: "Passenger Profile", url: "/passenger/profile", category: "passenger" },

  // Driver Pages
  { name: "Driver Dashboard", url: "/driver/dashboard", category: "driver" },
  { name: "Driver Rides", url: "/driver/rides", category: "driver" },
  { name: "Driver Earnings", url: "/driver/earnings", category: "driver" },
  { name: "Driver History", url: "/driver/history", category: "driver" },
  { name: "Driver Ratings", url: "/driver/ratings", category: "driver" },
  { name: "Driver Profile", url: "/driver/profile", category: "driver" },

  // Admin Pages
  { name: "Admin Dashboard", url: "/admin/dashboard", category: "admin" },
  { name: "Admin Users", url: "/admin/users", category: "admin" },
  { name: "Admin Drivers", url: "/admin/drivers", category: "admin" },
  { name: "Admin Rides", url: "/admin/rides", category: "admin" },
  { name: "Admin Analytics", url: "/admin/analytics", category: "admin" },
  { name: "Admin Settings", url: "/admin/settings", category: "admin" },

  // API Endpoints
  { name: "Health Check", url: "/api/health", category: "api" },
  { name: "Auth Login API", url: "/api/auth/login", category: "api" },
  { name: "Auth Register API", url: "/api/auth/register", category: "api" },
  { name: "Rides API", url: "/api/rides/active", category: "api" },
  { name: "Driver Profile API", url: "/api/driver/profile", category: "api" },
  { name: "Wallet Balance API", url: "/api/wallet/balance", category: "api" },
]

export default function TestAllPages() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTest, setCurrentTest] = useState("")

  const testPage = async (page: (typeof TEST_PAGES)[0]): Promise<TestResult> => {
    const startTime = Date.now()

    try {
      if (page.category === "api") {
        // Test API endpoints
        const response = await fetch(page.url, {
          method: page.url.includes("login") || page.url.includes("register") ? "POST" : "GET",
          headers: { "Content-Type": "application/json" },
          body:
            page.url.includes("login") || page.url.includes("register")
              ? JSON.stringify({ email: "test@test.com", password: "test123" })
              : undefined,
        })

        const loadTime = Date.now() - startTime

        if (response.ok || response.status === 401 || response.status === 400) {
          return {
            name: page.name,
            url: page.url,
            status: response.ok ? "success" : "warning",
            loadTime,
            error: response.ok ? undefined : `HTTP ${response.status}`,
            category: page.category,
          }
        } else {
          return {
            name: page.name,
            url: page.url,
            status: "error",
            loadTime,
            error: `HTTP ${response.status}: ${response.statusText}`,
            category: page.category,
          }
        }
      } else {
        // Test regular pages by creating a hidden iframe
        return new Promise((resolve) => {
          const iframe = document.createElement("iframe")
          iframe.style.display = "none"
          iframe.style.width = "1px"
          iframe.style.height = "1px"

          const timeout = setTimeout(() => {
            document.body.removeChild(iframe)
            resolve({
              name: page.name,
              url: page.url,
              status: "error",
              loadTime: Date.now() - startTime,
              error: "Page load timeout (5s)",
              category: page.category,
            })
          }, 5000)

          iframe.onload = () => {
            clearTimeout(timeout)
            const loadTime = Date.now() - startTime

            try {
              // Try to access iframe content to check for errors
              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
              if (iframeDoc) {
                const hasError =
                  iframeDoc.querySelector("[data-error]") ||
                  iframeDoc.title.toLowerCase().includes("error") ||
                  iframeDoc.body.textContent?.toLowerCase().includes("error")

                document.body.removeChild(iframe)
                resolve({
                  name: page.name,
                  url: page.url,
                  status: hasError ? "warning" : "success",
                  loadTime,
                  error: hasError ? "Page contains errors" : undefined,
                  category: page.category,
                })
              } else {
                document.body.removeChild(iframe)
                resolve({
                  name: page.name,
                  url: page.url,
                  status: "warning",
                  loadTime,
                  error: "Cannot access page content (CORS)",
                  category: page.category,
                })
              }
            } catch (error) {
              document.body.removeChild(iframe)
              resolve({
                name: page.name,
                url: page.url,
                status: "warning",
                loadTime,
                error: "CORS restriction or security error",
                category: page.category,
              })
            }
          }

          iframe.onerror = () => {
            clearTimeout(timeout)
            document.body.removeChild(iframe)
            resolve({
              name: page.name,
              url: page.url,
              status: "error",
              loadTime: Date.now() - startTime,
              error: "Failed to load page",
              category: page.category,
            })
          }

          document.body.appendChild(iframe)
          iframe.src = page.url
        })
      }
    } catch (error) {
      return {
        name: page.name,
        url: page.url,
        status: "error",
        loadTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error",
        category: page.category,
      }
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setResults([])
    setProgress(0)

    const newResults: TestResult[] = []

    for (let i = 0; i < TEST_PAGES.length; i++) {
      const page = TEST_PAGES[i]
      setCurrentTest(page.name)

      const result = await testPage(page)
      newResults.push(result)
      setResults([...newResults])
      setProgress(((i + 1) / TEST_PAGES.length) * 100)

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    setIsRunning(false)
    setCurrentTest("")
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            Success
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="secondary" className="bg-yellow-500">
            Warning
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Error</Badge>
    }
  }

  const filterResults = (category: string) => {
    if (category === "all") return results
    return results.filter((result) => result.category === category)
  }

  const getStats = () => {
    const success = results.filter((r) => r.status === "success").length
    const warning = results.filter((r) => r.status === "warning").length
    const error = results.filter((r) => r.status === "error").length
    const avgLoadTime =
      results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.loadTime, 0) / results.length) : 0

    return { success, warning, error, avgLoadTime }
  }

  const stats = getStats()

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">System Page Testing</h1>
        <p className="text-muted-foreground">Comprehensive testing of all pages and API endpoints</p>

        <Button onClick={runAllTests} disabled={isRunning} size="lg" className="w-48">
          {isRunning ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            "Run All Tests"
          )}
        </Button>
      </div>

      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle>Testing Progress</CardTitle>
            <CardDescription>Currently testing: {currentTest}</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              {Math.round(progress)}% complete ({results.length}/{TEST_PAGES.length} tests)
            </p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Success</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.success}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Warnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.error}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Load Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgLoadTime}ms</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All ({results.length})</TabsTrigger>
              <TabsTrigger value="core">Core ({filterResults("core").length})</TabsTrigger>
              <TabsTrigger value="auth">Auth ({filterResults("auth").length})</TabsTrigger>
              <TabsTrigger value="passenger">Passenger ({filterResults("passenger").length})</TabsTrigger>
              <TabsTrigger value="driver">Driver ({filterResults("driver").length})</TabsTrigger>
              <TabsTrigger value="admin">Admin ({filterResults("admin").length})</TabsTrigger>
            </TabsList>

            {["all", "core", "auth", "passenger", "driver", "admin"].map((category) => (
              <TabsContent key={category} value={category} className="space-y-4">
                {filterResults(category).map((result, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(result.status)}
                          <div>
                            <h3 className="font-medium">{result.name}</h3>
                            <p className="text-sm text-muted-foreground">{result.url}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-muted-foreground">{result.loadTime}ms</span>
                          {getStatusBadge(result.status)}
                          <Button variant="outline" size="sm" onClick={() => window.open(result.url, "_blank")}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {result.error && (
                        <div className="mt-3 p-3 bg-muted rounded-md">
                          <p className="text-sm text-red-600">{result.error}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  )
}
