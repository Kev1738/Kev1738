"use server"

import { supabase } from "./database"

export async function getWalletBalance(user_id: string) {
  try {
    const { data: wallet, error } = await supabase.from("wallets").select("*").eq("user_id", user_id).single()

    if (error) {
      // If wallet doesn't exist, create one
      if (error.code === "PGRST116") {
        const { data: newWallet, error: createError } = await supabase
          .from("wallets")
          .insert({
            user_id,
            balance: 0.0,
          })
          .select()
          .single()

        if (createError) throw createError

        return { success: true, wallet: newWallet }
      }
      throw error
    }

    return { success: true, wallet }
  } catch (error) {
    console.error("Get wallet balance error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get wallet balance",
    }
  }
}

export async function updateWalletBalance(
  user_id: string,
  amount: number,
  transaction_type: "credit" | "debit",
  description: string,
  reference_id?: string,
) {
  try {
    // Get current wallet
    const walletResult = await getWalletBalance(user_id)
    if (!walletResult.success) {
      throw new Error("Failed to get wallet")
    }

    const currentBalance = walletResult.wallet.balance
    const newBalance = transaction_type === "credit" ? currentBalance + amount : currentBalance - amount

    if (newBalance < 0) {
      throw new Error("Insufficient balance")
    }

    // Update wallet balance
    const { data: updatedWallet, error: updateError } = await supabase
      .from("wallets")
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id)
      .select()
      .single()

    if (updateError) throw updateError

    // Record transaction
    const { error: transactionError } = await supabase.from("wallet_transactions").insert({
      wallet_id: updatedWallet.id,
      amount,
      transaction_type,
      description,
      reference_id,
    })

    if (transactionError) {
      console.error("Failed to record transaction:", transactionError)
      // Don't fail the whole operation for transaction logging
    }

    return { success: true, wallet: updatedWallet }
  } catch (error) {
    console.error("Update wallet balance error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update wallet balance",
    }
  }
}

export async function getWalletTransactions(
  user_id: string,
  options: {
    limit?: number
    offset?: number
  } = {},
) {
  try {
    const { limit = 20, offset = 0 } = options

    // Get wallet first
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("id")
      .eq("user_id", user_id)
      .single()

    if (walletError) throw walletError

    const { data: transactions, error } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("wallet_id", wallet.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return { success: true, transactions }
  } catch (error) {
    console.error("Get wallet transactions error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get wallet transactions",
    }
  }
}
