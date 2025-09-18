import { TestSession } from "@/components/test-session"

export default function TestSessionPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Session Management Test</h1>
          <p className="text-gray-600 mt-2">Debug and test the authentication session system</p>
        </div>

        <TestSession />
      </div>
    </div>
  )
}
