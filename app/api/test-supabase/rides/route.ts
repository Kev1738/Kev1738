import { NextResponse } from "next/server"
import { createUser, createRide, updateRideStatus, getRideHistory, deleteUser } from "@/lib/database"
import { hashPassword } from "@/lib/auth"

export async function GET() {
  const testPassengerEmail = `passenger-test-${Date.now()}@example.com`
  const testDriverEmail = `driver-test-${Date.now()}@example.com`
  let testPassengerId: string | null = null
  let testDriverId: string | null = null
  let testRideId: string | null = null

  try {
    const startTime = Date.now()
    const results = []

    // Test 1: Create Test Passenger
    console.log("Creating test passenger...")
    const hashedPassword = await hashPassword("testpassword123")
    const createPassengerResult = await createUser({
      email: testPassengerEmail,
      password_hash: hashedPassword,
      full_name: "Test Passenger",
      phone: "+23276111111",
      role: "passenger",
    })

    if (!createPassengerResult.success) {
      throw new Error(`Passenger creation failed: ${createPassengerResult.error}`)
    }

    testPassengerId = createPassengerResult.data.id
    results.push({ test: "Create Test Passenger", status: "success" })

    // Test 2: Create Test Driver
    console.log("Creating test driver...")
    const createDriverResult = await createUser({
      email: testDriverEmail,
      password_hash: hashedPassword,
      full_name: "Test Driver",
      phone: "+23276222222",
      role: "driver",
    })

    if (!createDriverResult.success) {
      throw new Error(`Driver creation failed: ${createDriverResult.error}`)
    }

    testDriverId = createDriverResult.data.id
    results.push({ test: "Create Test Driver", status: "success" })

    // Test 3: Create Ride
    console.log("Testing ride creation...")
    const createRideResult = await createRide({
      passenger_id: testPassengerId,
      pickup_location: "Cotton Tree, Freetown",
      destination: "Lumley Beach, Freetown",
      pickup_coordinates: [8.484, -13.2299],
      destination_coordinates: [8.4219, -13.2846],
      vehicle_type: "taxi",
      estimated_fare: 25000,
      status: "pending",
    })

    if (!createRideResult.success) {
      throw new Error(`Ride creation failed: ${createRideResult.error}`)
    }

    testRideId = createRideResult.data.id
    results.push({ test: "Create Ride", status: "success", data: createRideResult.data })

    // Test 4: Update Ride Status
    console.log("Testing ride status update...")
    const updateStatusResult = await updateRideStatus(testRideId, "accepted", testDriverId)

    if (!updateStatusResult.success) {
      throw new Error(`Ride status update failed: ${updateStatusResult.error}`)
    }

    results.push({ test: "Update Ride Status", status: "success", data: updateStatusResult.data })

    // Test 5: Get Passenger Ride History
    console.log("Testing passenger ride history...")
    const passengerHistoryResult = await getRideHistory(testPassengerId, "passenger")

    if (!passengerHistoryResult.success) {
      throw new Error(`Get passenger ride history failed: ${passengerHistoryResult.error}`)
    }

    results.push({
      test: "Get Passenger Ride History",
      status: "success",
      data: {
        count: passengerHistoryResult.data?.length || 0,
        rides: passengerHistoryResult.data?.slice(0, 2),
      },
    })

    // Test 6: Get Driver Ride History
    console.log("Testing driver ride history...")
    const driverHistoryResult = await getRideHistory(testDriverId, "driver")

    if (!driverHistoryResult.success) {
      throw new Error(`Get driver ride history failed: ${driverHistoryResult.error}`)
    }

    results.push({
      test: "Get Driver Ride History",
      status: "success",
      data: {
        count: driverHistoryResult.data?.length || 0,
        rides: driverHistoryResult.data?.slice(0, 2),
      },
    })

    // Cleanup
    console.log("Cleaning up test data...")
    if (testPassengerId) {
      await deleteUser(testPassengerId)
    }
    if (testDriverId) {
      await deleteUser(testDriverId)
    }
    results.push({ test: "Cleanup Test Data", status: "success" })

    const duration = Date.now() - startTime

    return NextResponse.json({
      success: true,
      message: `All ride operations completed successfully (${duration}ms)`,
      duration,
      data: {
        tests_run: results.length,
        results,
        test_ride_id: testRideId,
      },
    })
  } catch (error) {
    console.error("Ride operations test error:", error)

    // Cleanup
    try {
      if (testPassengerId) await deleteUser(testPassengerId)
      if (testDriverId) await deleteUser(testDriverId)
    } catch (cleanupError) {
      console.error("Cleanup error:", cleanupError)
    }

    return NextResponse.json(
      {
        success: false,
        error: `Ride operations test failed: ${error}`,
        details: {
          error_type: error instanceof Error ? error.constructor.name : "Unknown",
          error_message: error instanceof Error ? error.message : String(error),
          test_passenger_email: testPassengerEmail,
          test_driver_email: testDriverEmail,
        },
      },
      { status: 500 },
    )
  }
}
