import { NextResponse } from "next/server"
import { supabase } from "@/lib/database"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"

export async function GET() {
  try {
    console.log("🧪 Database test API called")

    const results = {
      connection: { success: false, message: "" },
      tables: { success: false, tables: [] as any[] },
      sampleData: { success: false, data: {} },
      operations: { success: false, results: [] as any[] },
    }

    // Test 1: Basic connection
    try {
      const { data: healthCheck, error: healthError } = await supabase.from("health_check").select("*").limit(1)

      if (healthError) {
        results.connection = { success: false, message: `Health check failed: ${healthError.message}` }
      } else {
        results.connection = { success: true, message: "Database connection successful" }
      }
    } catch (error) {
      results.connection = {
        success: false,
        message: `Connection test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }
    }

    // Test 2: Check if all tables exist
    const tables = [
      "users",
      "driver_profiles",
      "passenger_profiles",
      "vehicles",
      "rides",
      "payments",
      "wallets",
      "wallet_transactions",
      "ratings",
      "notifications",
      "sessions",
      "uploaded_files",
      "health_check",
    ]

    const tableResults = []
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase.from(table).select("*", { count: "exact" }).limit(1)

        if (error) {
          tableResults.push({
            table,
            exists: false,
            error: error.message,
            count: 0,
          })
        } else {
          tableResults.push({
            table,
            exists: true,
            error: null,
            count: count || 0,
          })
        }
      } catch (err) {
        tableResults.push({
          table,
          exists: false,
          error: err instanceof Error ? err.message : "Unknown error",
          count: 0,
        })
      }
    }

    results.tables = { success: true, tables: tableResults }

    // Test 3: Sample data from each table
    try {
      const sampleQueries = [
        { table: "users", query: supabase.from("users").select("id, email, full_name, role").limit(3) },
        {
          table: "driver_profiles",
          query: supabase.from("driver_profiles").select("id, user_id, license_number, rating, status").limit(3),
        },
        {
          table: "passenger_profiles",
          query: supabase.from("passenger_profiles").select("id, user_id, preferred_payment_method").limit(3),
        },
        { table: "vehicles", query: supabase.from("vehicles").select("id, vehicle_type, make, model, color").limit(3) },
        {
          table: "rides",
          query: supabase.from("rides").select("id, pickup_address, destination_address, status, fare_amount").limit(3),
        },
        { table: "wallets", query: supabase.from("wallets").select("id, user_id, balance, is_active").limit(3) },
        {
          table: "payments",
          query: supabase.from("payments").select("id, amount, payment_method, payment_status").limit(3),
        },
      ]

      const sampleData: any = {}
      for (const { table, query } of sampleQueries) {
        try {
          const { data, error } = await query
          if (error) {
            sampleData[table] = { error: error.message }
          } else {
            sampleData[table] = { count: data?.length || 0, data: data || [] }
          }
        } catch (err) {
          sampleData[table] = { error: err instanceof Error ? err.message : "Unknown error" }
        }
      }

      results.sampleData = { success: true, data: sampleData }
    } catch (error) {
      results.sampleData = {
        success: false,
        data: { error: error instanceof Error ? error.message : "Failed to fetch sample data" },
      }
    }

    // Test 4: Basic CRUD operations
    try {
      const operationResults = []

      // Test user creation
      try {
        const testEmail = `test-${Date.now()}@example.com`
        const { data: testUser, error: createError } = await supabase
          .from("users")
          .insert({
            email: testEmail,
            password: "test123",
            full_name: "Test User",
            role: "passenger",
          })
          .select()
          .single()

        if (createError) {
          operationResults.push({ operation: "create_user", success: false, error: createError.message })
        } else {
          operationResults.push({ operation: "create_user", success: true, data: { id: testUser.id } })

          // Test user update
          const { data: updatedUser, error: updateError } = await supabase
            .from("users")
            .update({ full_name: "Updated Test User" })
            .eq("id", testUser.id)
            .select()
            .single()

          if (updateError) {
            operationResults.push({ operation: "update_user", success: false, error: updateError.message })
          } else {
            operationResults.push({ operation: "update_user", success: true, data: { id: updatedUser.id } })
          }

          // Test user deletion
          const { error: deleteError } = await supabase.from("users").delete().eq("id", testUser.id)

          if (deleteError) {
            operationResults.push({ operation: "delete_user", success: false, error: deleteError.message })
          } else {
            operationResults.push({ operation: "delete_user", success: true })
          }
        }
      } catch (err) {
        operationResults.push({
          operation: "crud_test",
          success: false,
          error: err instanceof Error ? err.message : "CRUD test failed",
        })
      }

      results.operations = { success: true, results: operationResults }
    } catch (error) {
      results.operations = {
        success: false,
        results: [{ error: error instanceof Error ? error.message : "Operations test failed" }],
      }
    }

    // Overall success
    const overallSuccess =
      results.connection.success && results.tables.success && results.sampleData.success && results.operations.success

    return NextResponse.json(
      createSuccessResponse(results, overallSuccess ? "All database tests passed" : "Some database tests failed"),
    )
  } catch (error) {
    console.error("💥 Database test error:", error)
    return NextResponse.json(createErrorResponse(error, "Database test failed"), { status: 500 })
  }
}
