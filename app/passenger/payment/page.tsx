"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Wallet, Plus, Trash2, DollarSign, History, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { PassengerLayout } from "@/components/passenger-layout"
import { AuthGuard } from "@/components/auth-guard"
import { useSession } from "@/hooks/use-session"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorAlert } from "@/components/error-alert"

export default function PassengerPaymentPage() {
  const { session } = useSession()
  const [walletBalance, setWalletBalance] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingFunds, setAddingFunds] = useState(false)
  const [fundAmount, setFundAmount] = useState("")

  useEffect(() => {
    if (session) {
      loadPaymentData()
    }
  }, [session])

  const loadPaymentData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load wallet balance
      const walletResponse = await fetch("/api/wallet/balance", {
        credentials: "include",
      })

      if (walletResponse.ok) {
        const walletResult = await walletResponse.json()
        if (walletResult.success) {
          setWalletBalance(walletResult.wallet.balance)
        }
      }

      // Mock payment methods and transactions for now
      setPaymentMethods([
        {
          id: "1",
          type: "card",
          last4: "4242",
          brand: "Visa",
          expiry: "12/25",
          isDefault: true,
        },
        {
          id: "2",
          type: "card",
          last4: "5555",
          brand: "Mastercard",
          expiry: "08/26",
          isDefault: false,
        },
      ])

      setTransactions([
        {
          id: "1",
          type: "credit",
          amount: 25.0,
          description: "Wallet top-up",
          date: "2024-01-15T10:30:00Z",
          status: "completed",
        },
        {
          id: "2",
          type: "debit",
          amount: 18.75,
          description: "Ride payment - Downtown to Airport",
          date: "2024-01-14T15:45:00Z",
          status: "completed",
        },
        {
          id: "3",
          type: "debit",
          amount: 12.5,
          description: "Ride payment - Home to Office",
          date: "2024-01-13T09:15:00Z",
          status: "completed",
        },
      ])
    } catch (err) {
      console.error("Load payment data error:", err)
      setError(err instanceof Error ? err.message : "Failed to load payment data")
    } finally {
      setLoading(false)
    }
  }

  const handleAddFunds = async () => {
    if (!fundAmount || Number.parseFloat(fundAmount) <= 0) {
      alert("Please enter a valid amount")
      return
    }

    try {
      setAddingFunds(true)

      // Simulate adding funds (in real app, this would integrate with payment processor)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const amount = Number.parseFloat(fundAmount)
      setWalletBalance((prev) => prev + amount)
      setFundAmount("")

      // Add transaction record
      const newTransaction = {
        id: Date.now().toString(),
        type: "credit",
        amount,
        description: "Wallet top-up",
        date: new Date().toISOString(),
        status: "completed",
      }
      setTransactions((prev) => [newTransaction, ...prev])
    } catch (err) {
      console.error("Add funds error:", err)
      alert("Failed to add funds. Please try again.")
    } finally {
      setAddingFunds(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!session) return null

  return (
    <AuthGuard requiredRole="passenger">
      <PassengerLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Payment & Wallet</h1>
            <p className="text-gray-600">Manage your payment methods and wallet balance</p>
          </div>

          {/* Error State */}
          {error && <ErrorAlert message={error} onRetry={loadPaymentData} />}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" text="Loading payment data..." />
            </div>
          )}

          {/* Payment Content */}
          {!loading && (
            <>
              {/* Wallet Balance Card */}
              <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-6 w-6" />
                    Wallet Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold">{formatCurrency(walletBalance)}</p>
                      <p className="text-blue-100">Available for rides</p>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={() => setAddingFunds(true)}
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Funds
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="wallet" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="wallet">Wallet</TabsTrigger>
                  <TabsTrigger value="cards">Payment Methods</TabsTrigger>
                  <TabsTrigger value="history">Transaction History</TabsTrigger>
                </TabsList>

                <TabsContent value="wallet" className="space-y-4">
                  {/* Add Funds */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Add Funds to Wallet
                      </CardTitle>
                      <CardDescription>Top up your wallet for seamless ride payments</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <Label htmlFor="amount">Amount</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="Enter amount"
                            value={fundAmount}
                            onChange={(e) => setFundAmount(e.target.value)}
                            min="1"
                            step="0.01"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button onClick={handleAddFunds} disabled={addingFunds || !fundAmount}>
                            {addingFunds ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Funds
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {[10, 25, 50, 100].map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            size="sm"
                            onClick={() => setFundAmount(amount.toString())}
                          >
                            ${amount}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Transactions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Recent Transactions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {transactions.slice(0, 5).map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-full ${
                                  transaction.type === "credit"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {transaction.type === "credit" ? (
                                  <ArrowDownLeft className="h-4 w-4" />
                                ) : (
                                  <ArrowUpRight className="h-4 w-4" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{transaction.description}</p>
                                <p className="text-sm text-gray-600">{formatDate(transaction.date)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={`font-bold ${
                                  transaction.type === "credit" ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {transaction.type === "credit" ? "+" : "-"}
                                {formatCurrency(transaction.amount)}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {transaction.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="cards" className="space-y-4">
                  {/* Payment Methods */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          Payment Methods
                        </div>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Card
                        </Button>
                      </CardTitle>
                      <CardDescription>Manage your saved payment methods</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {paymentMethods.map((method) => (
                          <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gray-100 rounded">
                                <CreditCard className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {method.brand} •••• {method.last4}
                                </p>
                                <p className="text-sm text-gray-600">Expires {method.expiry}</p>
                              </div>
                              {method.isDefault && <Badge variant="secondary">Default</Badge>}
                            </div>
                            <div className="flex gap-2">
                              {!method.isDefault && (
                                <Button variant="outline" size="sm">
                                  Set Default
                                </Button>
                              )}
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Add New Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Add New Payment Method</CardTitle>
                      <CardDescription>Add a credit or debit card for payments</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                        </div>
                        <div>
                          <Label htmlFor="cardName">Cardholder Name</Label>
                          <Input id="cardName" placeholder="John Doe" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input id="expiry" placeholder="MM/YY" />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" placeholder="123" />
                        </div>
                      </div>
                      <Button className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Payment Method
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  {/* Full Transaction History */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Transaction History
                      </CardTitle>
                      <CardDescription>Complete history of all your transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {transactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-full ${
                                  transaction.type === "credit"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {transaction.type === "credit" ? (
                                  <ArrowDownLeft className="h-4 w-4" />
                                ) : (
                                  <ArrowUpRight className="h-4 w-4" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{transaction.description}</p>
                                <p className="text-sm text-gray-600">{formatDate(transaction.date)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={`font-bold ${
                                  transaction.type === "credit" ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {transaction.type === "credit" ? "+" : "-"}
                                {formatCurrency(transaction.amount)}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {transaction.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </PassengerLayout>
    </AuthGuard>
  )
}
