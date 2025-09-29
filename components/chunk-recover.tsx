"use client"

import { useEffect } from "react"

export function ChunkRecover() {
  useEffect(() => {
    let alreadyReloaded = false

    function shouldReload(err: any) {
      return typeof err?.message === "string" && /Loading chunk [\d]+ failed/i.test(err.message)
    }

    function handleError(event: ErrorEvent) {
      if (!alreadyReloaded && shouldReload(event.error)) {
        alreadyReloaded = true
        console.log("Chunk loading failed, reloading page...")
        window.location.reload()
      }
    }

    function handleRejection(event: PromiseRejectionEvent) {
      if (!alreadyReloaded && shouldReload(event.reason)) {
        alreadyReloaded = true
        console.log("Chunk loading failed (promise), reloading page...")
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

  return null
}
