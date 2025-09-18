"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: "admin" | "driver" | "passenger"
  status: "active" | "inactive"
  created_at: string
}

interface DeleteConfirmationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onConfirm: () => void
}

export function DeleteConfirmation({ open, onOpenChange, user, onConfirm }: DeleteConfirmationProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete user")
      }

      onConfirm()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Delete User</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className="py-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p>
                <strong>Name:</strong> {user.name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Role:</strong> {user.role}
              </p>
            </div>
          </div>
        )}

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Delete User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
