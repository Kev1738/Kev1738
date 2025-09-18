"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminLayout } from "@/components/admin-layout"
import { UserForm } from "@/components/admin/user-form"
import { DeleteConfirmation } from "@/components/admin/delete-confirmation"
import { Plus, Search, Edit, Trash2, Users, UserCheck, UserX, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  role: "passenger" | "driver" | "admin"
  is_verified: boolean
  is_active: boolean
  profile_image_url?: string
  created_at: string
  driver_profiles?: any[]
  passenger_profiles?: any[]
  wallets?: any[]
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showUserForm, setShowUserForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingUser, setDeletingUser] = useState<User | undefined>()

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
      })

      const response = await fetch(`/api/admin/users?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setUsers(Array.isArray(data.data?.users) ? data.data.users : [])
        setTotalPages(data.data?.pagination?.totalPages || 1)
      } else {
        throw new Error(data.error || "Failed to fetch users")
      }
    } catch (error) {
      console.error("Fetch users error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch users"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, search, roleFilter, statusFilter])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value === "all" ? "" : value)
    setPage(1)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value === "all" ? "" : value)
    setPage(1)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowUserForm(true)
  }

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user)
    setShowDeleteDialog(true)
  }

  const getStatusBadge = (user: User) => {
    if (!user.is_active) {
      return <Badge variant="destructive">Inactive</Badge>
    }
    if (!user.is_verified) {
      return <Badge variant="secondary">Unverified</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      admin: "default",
      driver: "secondary",
      passenger: "outline",
    }
    return <Badge variant={variants[role] || "outline"}>{role.toUpperCase()}</Badge>
  }

  // Calculate stats safely
  const totalUsers = Array.isArray(users) ? users.length : 0
  const activeUsers = Array.isArray(users) ? users.filter((u) => u?.is_active).length : 0
  const drivers = Array.isArray(users) ? users.filter((u) => u?.role === "driver").length : 0

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold">Error Loading Users</h2>
          <p className="text-muted-foreground text-center max-w-md">{error}</p>
          <Button onClick={fetchUsers}>Try Again</Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage all users, drivers, and administrators</p>
          </div>
          <Button onClick={() => setShowUserForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drivers</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{drivers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>A list of all users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter || "all"} onValueChange={handleRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="passenger">Passenger</SelectItem>
                  <SelectItem value="driver">Driver</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter || "all"} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Users Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : !Array.isArray(users) || users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user?.id || Math.random()}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user?.full_name || "Unknown"}</div>
                            <div className="text-sm text-muted-foreground">{user?.email || "No email"}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user?.role || "passenger")}</TableCell>
                        <TableCell>{getStatusBadge(user)}</TableCell>
                        <TableCell>{user?.phone || "N/A"}</TableCell>
                        <TableCell>
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
                  Previous
                </Button>
                <span className="flex items-center px-4">
                  Page {page} of {totalPages}
                </span>
                <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Form Dialog */}
      <UserForm
        user={editingUser}
        isOpen={showUserForm}
        onClose={() => {
          setShowUserForm(false)
          setEditingUser(undefined)
        }}
        onSuccess={() => {
          fetchUsers()
          setEditingUser(undefined)
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false)
          setDeletingUser(undefined)
        }}
        onSuccess={() => {
          fetchUsers()
          setDeletingUser(undefined)
        }}
        title="Delete User"
        description={`Are you sure you want to delete ${deletingUser?.full_name}? This action cannot be undone.`}
        itemName="User"
        deleteUrl={`/api/admin/users/${deletingUser?.id}`}
      />
    </AdminLayout>
  )
}
