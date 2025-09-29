// Client-side API functions for authentication

const API_BASE = "/api/auth"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  full_name: string
  phone: string
  role: "passenger" | "driver" | "admin"
}

export interface AuthResponse {
  success: boolean
  user?: {
    id: string
    email: string
    full_name: string
    phone: string
    role: string
    status: string
  }
  token?: string
  error?: string
  message?: string
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include", // Include cookies
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error || "Login failed",
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Login API error:", error)
    return {
      success: false,
      error: "Network error. Please check your connection.",
    }
  }
}

export async function register(userData: RegisterData): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      credentials: "include", // Include cookies
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error || "Registration failed",
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Registration API error:", error)
    return {
      success: false,
      error: "Network error. Please check your connection.",
    }
  }
}

export async function logout(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/logout`, {
      method: "POST",
      credentials: "include", // Include cookies
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error || "Logout failed",
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Logout API error:", error)
    return {
      success: false,
      error: "Network error. Please check your connection.",
    }
  }
}

export async function verifyToken(): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE}/verify`, {
      method: "GET",
      credentials: "include", // Include cookies
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error || "Token verification failed",
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Token verification API error:", error)
    return {
      success: false,
      error: "Network error. Please check your connection.",
    }
  }
}

export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE}/me`, {
      method: "GET",
      credentials: "include", // Include cookies
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error || "Failed to get user data",
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Get current user API error:", error)
    return {
      success: false,
      error: "Network error. Please check your connection.",
    }
  }
}

// Utility function to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const result = await verifyToken()
  return result.success
}

// Utility function to get user role
export async function getUserRole(): Promise<string | null> {
  const result = await getCurrentUser()
  return result.success && result.user ? result.user.role : null
}

// Utility function to check if user has specific role
export async function hasRole(requiredRole: string): Promise<boolean> {
  const role = await getUserRole()
  return role === requiredRole
}

// Utility function to check if user is admin
export async function isAdmin(): Promise<boolean> {
  return await hasRole("admin")
}

// Utility function to check if user is driver
export async function isDriver(): Promise<boolean> {
  return await hasRole("driver")
}

// Utility function to check if user is passenger
export async function isPassenger(): Promise<boolean> {
  return await hasRole("passenger")
}
