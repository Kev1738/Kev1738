"use client"

interface ApiRequestOptions {
  timeout?: number
  retries?: number
  onProgress?: (progress: number, stage: string) => void
  signal?: AbortSignal
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl = "") {
    this.baseUrl = baseUrl
  }

  async request<T = any>(url: string, options: RequestInit & ApiRequestOptions = {}): Promise<T> {
    const { timeout = 30000, retries = 3, onProgress, signal, ...fetchOptions } = options

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        onProgress?.(10 + attempt * 20, `Attempt ${attempt + 1}/${retries + 1}`)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        // Combine signals if provided
        const combinedSignal = signal ? this.combineAbortSignals([signal, controller.signal]) : controller.signal

        onProgress?.(30, "Sending request...")

        const response = await fetch(`${this.baseUrl}${url}`, {
          ...fetchOptions,
          signal: combinedSignal,
          headers: {
            "Content-Type": "application/json",
            ...fetchOptions.headers,
          },
        })

        clearTimeout(timeoutId)
        onProgress?.(60, "Processing response...")

        if (!response.ok) {
          const errorText = await response.text()
          let errorData: any

          try {
            errorData = JSON.parse(errorText)
          } catch {
            errorData = { error: errorText || `HTTP ${response.status}` }
          }

          throw new Error(errorData.error || `Request failed with status ${response.status}`)
        }

        onProgress?.(80, "Parsing response...")

        const contentType = response.headers.get("content-type")
        let data: T

        if (contentType?.includes("application/json")) {
          data = await response.json()
        } else {
          data = (await response.text()) as T
        }

        onProgress?.(100, "Complete")
        return data
      } catch (error) {
        lastError = error as Error
        console.error(`API request attempt ${attempt + 1} failed:`, error)

        if (error instanceof Error && error.name === "AbortError") {
          throw new Error("Request was cancelled or timed out")
        }

        if (attempt === retries) {
          break
        }

        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000)
        onProgress?.(10, `Retrying in ${delay / 1000}s...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    throw lastError || new Error("Request failed after all retries")
  }

  private combineAbortSignals(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController()

    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort()
        break
      }
      signal.addEventListener("abort", () => controller.abort())
    }

    return controller.signal
  }

  async post<T = any>(url: string, data?: any, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
  }

  async get<T = any>(url: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(url, {
      method: "GET",
      ...options,
    })
  }
}

export const apiClient = new ApiClient()
