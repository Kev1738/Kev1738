"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface DeleteConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  title: string
  description: string
  itemName: string
  deleteUrl: string
}

export function DeleteConfirmation({
  isOpen,
  onClose,
  onSuccess,
  title,
  description,
  itemName,
  deleteUrl,
}: DeleteConfirmationProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      const response = await fetch(deleteUrl, {
        method: "DELETE",
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast({
          title: "Success",
          description: result.message || `${itemName} deleted successfully`,
        })
        onSuccess()
        onClose()
      } else {
        throw new Error(result.error || `Failed to delete ${itemName.toLowerCase()}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to delete ${itemName.toLowerCase()}`
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
