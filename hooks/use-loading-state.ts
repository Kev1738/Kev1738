"use client"

import { useState, useCallback, useRef } from "react"

interface LoadingState {
  isLoading: boolean
  error: string | null
  progress: number
  stage: string
  timeoutReached: boolean
}

interface UseLoadingStateOptions {
  timeout?: number
  stages?: string[]
  onTimeout?: () => void
  onError?: (error: string) => void
}

export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const { timeout = 30000, stages = [], onTimeout, onError } = options

  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    progress: 0,
    stage: "",
    timeoutReached: false,
  })

  const timeoutRef = useRef<NodeJS.Timeout>()
  const startTimeRef = useRef<number>()

  const startLoading = useCallback(
    (initialStage = "Starting...") => {
      setState({
        isLoading: true,
        error: null,
        progress: 0,
        stage: initialStage,
        timeoutReached: false,
      })

      startTimeRef.current = Date.now()

      // Set timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          timeoutReached: true,
          stage: "Request timed out",
        }))
        onTimeout?.()
      }, timeout)
    },
    [timeout, onTimeout],
  )

  const updateProgress = useCallback((progress: number, stage?: string) => {
    setState((prev) => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      stage: stage || prev.stage,
    }))
  }, [])

  const setError = useCallback(
    (error: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error,
        stage: "Error occurred",
      }))

      onError?.(error)
    },
    [onError],
  )

  const finishLoading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setState({
      isLoading: false,
      error: null,
      progress: 100,
      stage: "Complete",
      timeoutReached: false,
    })
  }, [])

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setState({
      isLoading: false,
      error: null,
      progress: 0,
      stage: "",
      timeoutReached: false,
    })
  }, [])

  const getElapsedTime = useCallback(() => {
    if (!startTimeRef.current) return 0
    return Date.now() - startTimeRef.current
  }, [])

  return {
    ...state,
    startLoading,
    updateProgress,
    setError,
    finishLoading,
    reset,
    getElapsedTime,
  }
}
