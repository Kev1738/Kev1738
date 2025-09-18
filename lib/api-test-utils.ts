interface ApiTestConfig {
  baseUrl?: string
  timeout?: number
  retries?: number
}

interface TestResult {
  endpoint: string
  method: string
  status: "success" | "error" | "pending"
  statusCode?: number
  responseTime?: number
  data?: any
  error?: string
}

export class ApiTester {
  private config: ApiTestConfig
  private results: TestResult[] = []

  constructor(config: ApiTestConfig = {}) {
    this.config = {
      baseUrl: "",
      timeout: 10000,
      retries: 1,
      ...config,
    }
  }

  async testEndpoint(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    body?: any,
    headers?: Record<string, string>,
  ): Promise<TestResult> {
    const startTime = Date.now()
    const result: TestResult = {
      endpoint,
      method,
      status: "pending",
    }

    try {
      const url = `${this.config.baseUrl}${endpoint}`
      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      }

      if (body && method !== "GET") {
        options.body = JSON.stringify(body)
      }

      const response = await fetch(url, options)
      const responseTime = Date.now() - startTime

      let data
      try {
        data = await response.json()
      } catch {
        data = await response.text()
      }

      result.status = response.ok ? "success" : "error"
      result.statusCode = response.status
      result.responseTime = responseTime
      result.data = data

      if (!response.ok) {
        result.error = `HTTP ${response.status}: ${response.statusText}`
      }
    } catch (error) {
      result.status = "error"
      result.responseTime = Date.now() - startTime
      result.error = error instanceof Error ? error.message : "Unknown error"
    }

    this.results.push(result)
    return result
  }

  async testCrudOperations(resourcePath: string, createData: any, updateData: any) {
    const results = []
    let createdId: string | null = null

    // Test CREATE
    const createResult = await this.testEndpoint(resourcePath, "POST", createData)
    results.push(createResult)

    if (createResult.status === "success" && createResult.data?.id) {
      createdId = createResult.data.id
    } else if (createResult.status === "success" && createResult.data?.data?.id) {
      createdId = createResult.data.data.id
    }

    if (createdId) {
      // Test READ
      const readResult = await this.testEndpoint(`${resourcePath}/${createdId}`)
      results.push(readResult)

      // Test UPDATE
      const updateResult = await this.testEndpoint(`${resourcePath}/${createdId}`, "PUT", updateData)
      results.push(updateResult)

      // Test DELETE
      const deleteResult = await this.testEndpoint(`${resourcePath}/${createdId}`, "DELETE")
      results.push(deleteResult)
    }

    // Test LIST
    const listResult = await this.testEndpoint(`${resourcePath}?limit=5`)
    results.push(listResult)

    return results
  }

  getResults(): TestResult[] {
    return this.results
  }

  clearResults(): void {
    this.results = []
  }

  getStats() {
    const total = this.results.length
    const successful = this.results.filter((r) => r.status === "success").length
    const failed = this.results.filter((r) => r.status === "error").length
    const avgResponseTime = this.results.reduce((sum, r) => sum + (r.responseTime || 0), 0) / total

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      avgResponseTime: Math.round(avgResponseTime),
    }
  }
}

// Database validation utilities
export const validateDatabaseResponse = (response: any, expectedFields: string[]) => {
  const errors: string[] = []

  if (!response) {
    errors.push("Response is null or undefined")
    return errors
  }

  if (response.success === false && response.error) {
    errors.push(`API Error: ${response.error}`)
    return errors
  }

  const data = response.data || response

  for (const field of expectedFields) {
    if (!(field in data)) {
      errors.push(`Missing required field: ${field}`)
    }
  }

  return errors
}

export const generateTestData = {
  user: () => ({
    email: `test.user.${Date.now()}@example.com`,
    password: "testpassword123",
    full_name: "Test User",
    phone: "+1234567890",
    role: "passenger",
  }),

  driver: () => ({
    email: `test.driver.${Date.now()}@example.com`,
    password: "testpassword123",
    full_name: "Test Driver",
    phone: "+1234567890",
    role: "driver",
  }),

  ride: (passengerId: string, driverId?: string) => ({
    passenger_id: passengerId,
    driver_id: driverId,
    pickup_address: "123 Test Street, Test City",
    destination_address: "456 Destination Ave, Test City",
    pickup_latitude: 6.5244,
    pickup_longitude: 3.3792,
    destination_latitude: 6.4474,
    destination_longitude: 3.3903,
    vehicle_type: "car",
    ride_type: "private",
    fare_amount: 2500,
  }),
}
