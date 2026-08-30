import { useState, useEffect, useCallback, useRef } from "react"

export interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Generic hook for fetching data from the backend API.
 * Falls back gracefully — if the fetcher throws, `data` stays null and `error` is set.
 * The page component should check `data` and fall back to its mock data if null.
 *
 * @param fetcher  An async function that returns the data (import from apiService.ts)
 * @param deps     Dependency array — refetch when these change
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
): ApiState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Keep a stable ref to the fetcher to avoid stale closures
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcherRef.current()
      setData(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"
      setError(message)
      // Don't clear existing data on refetch errors
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    execute()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error, refetch: execute }
}

/**
 * Tiny loading spinner component (inline, no imports needed).
 * Usage: if (loading && !data) return <LoadingSpinner color={theme.accent} />
 */
export function LoadingSpinner({ color = "#14b8a6", size = 20 }: { color?: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `2px solid ${color}30`,
        borderTop: `2px solid ${color}`,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
        display: "inline-block",
      }}
    />
  )
}
