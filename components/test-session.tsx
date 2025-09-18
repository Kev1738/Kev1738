"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, User, Shield, Car } from "lucide-react"
import { sessionManager } from "@/lib/session-manager"

export function TestSession() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [apiTest, setApiTest] = useState<any>(null)
  const [apiLoading, setApiLoading] = useState(false)

  useEffect(() => {
    // Subscribe to session changes
    const unsubscribe = sessionManager.subscribe((newSession) => {
      setSession(newSession)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const testApiVerification = async () => {
    setApiLoading(true)
    setApiTest(null)

    try {
      const response = await fetch("/api/auth/verify", {
        credentials: "include",
      })

      const data = await response.json()

      setApiTest({
        status: response.status,
        success: data.success,
        data: data.data,
        message: data.message,
      })
    } catch (error) {
      setApiTest({
        status: 500,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setApiLoading(false)
    }
  }

  const refreshSession = async () => {
    setLoading(true)
    // Force session refresh
    window.location.reload()
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading session...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Session Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {session ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            Session Status
          </CardTitle>
          <CardDescription>Current authentication session information</CardDescription>
        </CardHeader>
        <CardContent>
          {session ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">User ID</p>
                  <p className="font-mono text-sm">{session.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-sm">{session.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Name</p>
                  <p className="text-sm">{session.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Role</p>
                  <Badge
                    variant={
                      session.role === "admin" ? "destructive" : session.role === "driver" ? "default" : "secondary"
                    }
                  >
                    {session.role}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Authenticated
                </Badge>
                {session.isAuthenticated && (
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    <Shield className="h-3 w-3 mr-1" />
                    Session Active
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>No active session found. Please log in.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* API Verification Test */}
      <Card>
        <CardHeader>
          <CardTitle>API Verification Test</CardTitle>
          <CardDescription>Test server-side session verification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testApiVerification} disabled={apiLoading}>
            {apiLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              "Test API Verification"
            )}
          </Button>

          {apiTest && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={apiTest.success ? "default" : "destructive"}>Status: {apiTest.status}</Badge>
                <Badge variant={apiTest.success ? "default" : "destructive"}>
                  {apiTest.success ? "Success" : "Failed"}
                </Badge>
              </div>

              {apiTest.data && (
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p className="font-medium">Server Response:</p>
                  <pre className="mt-1 text-xs">{JSON.stringify(apiTest.data, null, 2)}</pre>
                </div>
              )}

              {apiTest.error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{apiTest.error}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Session Actions</CardTitle>
          <CardDescription>Test session management functions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" onClick={refreshSession}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Session
            </Button>

            {session && (
              <Button
                variant="outline"
                onClick={() => {
                  const dashboardUrl = `/${session.role}/dashboard`
                  window.location.href = dashboardUrl
                }}
              >
                {session.role === "admin" ? (
                  <Shield className="h-4 w-4 mr-2" />
                ) : session.role === "driver" ? (
                  <Car className="h-4 w-4 mr-2" />
                ) : (
                  <User className="h-4 w-4 mr-2" />
                )}
                Go to Dashboard
              </Button>
            )}

            <Button
              variant="destructive"
              onClick={() => {
                sessionManager.clearSession()
                window.location.href = "/auth/login"
              }}
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Local Storage Debug */}
      <Card>
        <CardHeader>
          <CardTitle>Local Storage Debug</CardTitle>
          <CardDescription>Current localStorage values</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <p className="font-medium">user:</p>
              <pre className="bg-gray-50 p-2 rounded text-xs overflow-auto">
                {localStorage.getItem("user") || "null"}
              </pre>
            </div>
            <div>
              <p className="font-medium">userId:</p>
              <pre className="bg-gray-50 p-2 rounded text-xs">{localStorage.getItem("userId") || "null"}</pre>
            </div>
            <div>
              <p className="font-medium">token:</p>
              <pre className="bg-gray-50 p-2 rounded text-xs">{localStorage.getItem("token") || "null"}</pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
