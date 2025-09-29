import { NextResponse } from "next/server"
import { supabase } from "@/lib/database"

export async function GET() {
  try {
    const startTime = Date.now()
    const results = []

    // Test 1: Check Realtime Connection
    console.log("Testing realtime connection...")

    // Create a test subscription to check if realtime is working
    const channel = supabase.channel("test-channel").on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "users",
      },
      (payload) => {
        console.log("Realtime event received:", payload)
      },
    )

    // Subscribe and check status
    const subscriptionResult = await new Promise((resolve) => {
      channel.subscribe((status) => {
        console.log("Subscription status:", status)
        resolve(status)
      })

      // Timeout after 5 seconds
      setTimeout(() => {
        resolve("timeout")
      }, 5000)
    })

    if (subscriptionResult === "SUBSCRIBED") {
      results.push({
        test: "Realtime Subscription",
        status: "success",
        message: "Successfully subscribed to realtime channel",
      })
    } else {
      results.push({
        test: "Realtime Subscription",
        status: "warning",
        message: `Subscription status: ${subscriptionResult}`,
      })
    }

    // Test 2: Check Channel Status
    console.log("Checking channel status...")
    const channelState = channel.state
    results.push({
      test: "Channel State",
      status: channelState === "joined" ? "success" : "warning",
      message: `Channel state: ${channelState}`,
    })

    // Test 3: Test Presence (if available)
    console.log("Testing presence features...")
    try {
      const presenceChannel = supabase.channel("presence-test")
      const presenceState = presenceChannel.presenceState()
      results.push({
        test: "Presence Features",
        status: "success",
        message: "Presence features available",
        data: { presence_count: Object.keys(presenceState).length },
      })

      // Cleanup presence channel
      await presenceChannel.unsubscribe()
    } catch (presenceError) {
      results.push({
        test: "Presence Features",
        status: "warning",
        message: `Presence test failed: ${presenceError}`,
      })
    }

    // Cleanup: Unsubscribe from test channel
    await channel.unsubscribe()

    const duration = Date.now() - startTime

    // Determine overall success
    const hasErrors = results.some((r) => r.status === "error")
    const hasWarnings = results.some((r) => r.status === "warning")

    return NextResponse.json({
      success: !hasErrors,
      message: hasErrors
        ? "Realtime tests completed with errors"
        : hasWarnings
          ? "Realtime tests completed with warnings"
          : `All realtime tests passed (${duration}ms)`,
      duration,
      data: {
        tests_run: results.length,
        results,
        realtime_enabled: true,
        websocket_url: process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "wss://") + "/realtime/v1/websocket",
      },
    })
  } catch (error) {
    console.error("Realtime test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Realtime test failed: ${error}`,
        details: {
          error_type: error instanceof Error ? error.constructor.name : "Unknown",
          error_message: error instanceof Error ? error.message : String(error),
          realtime_available: false,
        },
      },
      { status: 500 },
    )
  }
}
