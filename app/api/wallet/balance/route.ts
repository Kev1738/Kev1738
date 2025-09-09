import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getWalletBalance } from "@/lib/wallet"
import { createErrorResponse } from "@/lib/error-handler"

export async function GET() {
  try {
    console.log("💳 Wallet balance API called")

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const result = await getWalletBalance(user.id)

    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error("Wallet balance API error:", error)
    return NextResponse.json(createErrorResponse(error, "Failed to fetch wallet balance"), { status: 500 })
  }
}
