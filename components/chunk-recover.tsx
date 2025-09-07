"use client"

/**
 * Listens for the classic “Loading chunk <n> failed” error that can be thrown
 * when a code-split JS file can’t be fetched (network timeout, deployment race,
 * etc.).  The handler refreshes the page **once**, which is usually enough to
 * fetch the new chunk after the CDN finishes propagating.
 */
import { useEffect } from "react"

export function ChunkRecover() {
  useEffect(() => {
    let alreadyReloaded = false

    function shouldReload(err: any) {
      // Match both Error.message and stringified reasons from unhandledrejection
      return typeof err?.message === "string" && /Loading chunk [\d]+ failed/i.test(err.message)
    }

    /* global error handler */
    function handleError(event: ErrorEvent) {
      if (!alreadyReloaded && shouldReload(event.error)) {
        alreadyReloaded = true
        window.location.reload()
      }
    }

    /* global unhandled promise-rejection handler */
    function handleRejection(event: PromiseRejectionEvent) {
      if (!alreadyReloaded && shouldReload(event.reason)) {
        alreadyReloaded = true
        window.location.reload()
      }
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleRejection)
    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleRejection)
    }
  }, [])

  // Nothing rendered – this component is purely a side-effect.
  return null
}
