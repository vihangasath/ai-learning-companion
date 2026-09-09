import { useEffect, useState } from "react"
import { authApi, clearToken, getToken } from "../services/apiService"
import type { User } from "../services/apiService"

let cachedUser: User | null = null
let cachedLoading = false
let fetchPromise: Promise<User | null> | null = null
let listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function fetchUser(): Promise<User | null> {
  const token = getToken()
  if (!token) {
    cachedUser = null
    cachedLoading = false
    emit()
    return Promise.resolve(null)
  }
  if (fetchPromise) return fetchPromise
  cachedLoading = true
  emit()
  fetchPromise = (async () => {
    try {
      const me = await authApi.getMe()
      cachedUser = me
    } catch (e) {
      if (e instanceof Error && e.message.includes("401") && getToken()) clearToken()
      cachedUser = null
    } finally {
      cachedLoading = false
      fetchPromise = null
      emit()
    }
    return cachedUser
  })()
  return fetchPromise
}

export function useCurrentUser(): { user: User | null; loading: boolean } {
  const [state, setState] = useState({ user: cachedUser, loading: cachedLoading })
  useEffect(() => {
    const update = () => setState({ user: cachedUser, loading: cachedLoading })
    listeners.add(update)
    fetchUser()
    return () => {
      listeners.delete(update)
    }
  }, [])
  return state
}

export function refreshCurrentUser() {
  return fetchUser()
}

export function initialsFor(name: string | null | undefined): string {
  if (!name) return "LF"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
}