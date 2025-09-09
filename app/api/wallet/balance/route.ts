import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createErrorResponse, createSuccessResponse } from "@/lib/error-handler"
import { supabase } from "@/lib/database"

export async function GET() {
  try {
    console.log("💳 Wallet balance API called")

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    console.log("🔍 Fetching wallet for user:", user.id)

    // Get or create wallet
    let { data: wallet, error } = await supabase.from("wallets").select("*").eq("user_id", user.id).single()

    if (error) {
      if (error.code === "PGRST116") {
        // Wallet doesn't exist, create one
        console.log("🔧 Creating wallet for user:", user.id)

        const { data: newWallet, error: createError } = await supabase
          .from("wallets")
          .insert({
            user_id: user.id,
            balance: 0.0,
          })
          .select()
          .single()

        if (createError) {
          console.error("❌ Failed to create wallet:", createError)
          throw createError
        }

        wallet = newWallet
      } else {
        console.error("❌ Wallet fetch error:", error)
        throw error
      }
    }

    console.log("✅ Wallet balance fetched successfully:", wallet.balance)
    return NextResponse.json(createSuccessResponse(wallet), { status: 200 })
  } catch (error) {
    console.error("💥 Wallet balance API error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to fetch wallet balance"), { status: 500 })
  }
}
