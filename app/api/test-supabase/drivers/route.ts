import { NextResponse } from "next/server"
import { createUser, createDriver, getAvailableDrivers, deleteUser } from "@/lib/database"
import { hashPassword } from "@/lib/auth"

export async function GET() {
  const testEmail = `driver-test-${Date.now()}@example.com`
  let testUserId: string | null = null

  try {
    const startTime = Date.now()
    const results = []

    // Test 1: Create Driver User
    console.log("Testing driver user creation...")
    const hashedPassword = await hashPassword("testpassword123")
    const createUserResult = await createUser({
      email: testEmail,
      password_hash: hashedPassword,
      full_name: "Test Driver",
      phone: "+23276789012",
      role: "driver",
    })

    if (!createUserResult.success) {
      throw new Error(`Driver user creation failed: ${createUserResult.error}`)
    }

    testUserId = createUserResult.data.id
    results.push({ test: "Create Driver User", status: "success", data: createUserResult.data })

    // Test 2: Create Driver Profile
    console.log("Testing driver profile creation...")
    const createDriverResult = await createDriver({
      user_id: testUserId,
      license_number: "SL123456789",
      vehicle_type: "taxi",
      vehicle_plate: "SL-001-ABC",
      is_available: true,
    })

    if (!createDriverResult.success) {
      throw new Error(`Driver profile creation failed: ${createDriverResult.error}`)
    }

    results.push({ test: "Create Driver Profile", status: "success", data: createDriverResult.data })

    // Test 3: Get Available Drivers
    console.log("Testing get available drivers...")
    const getDriversResult = await getAvailableDrivers()

    if (!getDriversResult.success) {
      throw new Error(`Get available drivers failed: ${getDriversResult.error}`)
    }

    const driverCount = getDriversResult.data?.length || 0
    results.push({
      test: "Get Available Drivers",
      status: "success",
      data: {
        count: driverCount,
        drivers: getDriversResult.data?.slice(0, 3), // Show first 3 drivers
      },
    })

    // Cleanup: Delete test user (will cascade to driver profile)
    console.log("Cleaning up test data...")
    const deleteResult = await deleteUser(testUserId)
    if (deleteResult.success) {
      results.push({ test: "Cleanup Test Data", status: "success" })
    }

    const duration = Date.now() - startTime

    return NextResponse.json({
      success: true,
      message: `All driver operations completed successfully (${duration}ms)`,
      duration,
      data: {
        tests_run: results.length,
        results,
        available_drivers_count: driverCount,
        test_driver_email: testEmail,
      },
    })
  } catch (error) {
    console.error("Driver operations test error:", error)

    // Cleanup: try to delete test user if it was created
    if (testUserId) {
      try {
        await deleteUser(testUserId)
      } catch (cleanupError) {
        console.error("Cleanup error:", cleanupError)
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: `Driver operations test failed: ${error}`,
        details: {
          error_type: error instanceof Error ? error.constructor.name : "Unknown",
          error_message: error instanceof Error ? error.message : String(error),
          test_email: testEmail,
          test_user_id: testUserId,
        },
      },
      { status: 500 },
    )
  }
}
