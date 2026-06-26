"use client"

import { useState, useCallback, useLayoutEffect, useEffect } from "react"
import { useSession } from "next-auth/react"
import axios from "axios"

function loadLocal(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback
  return localStorage.getItem(key) ?? fallback
}

function saveLocal(key: string, value: string) {
  localStorage.setItem(key, value)
}

function applyTheme(theme: string) {
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  document.documentElement.classList.toggle("dark", isDark)
}

function applyAccent(accent: string) {
  document.documentElement.setAttribute("data-accent", accent)
}

export function usePreferences() {
  const { status } = useSession()
  const isAuthed = status === "authenticated"

  const [theme, setThemeState] = useState(() => loadLocal("theme", "dark"))
  const [accent, setAccentState] = useState(() => loadLocal("accent", "blue"))

  // Hydrate from DB on mount when authenticated
  useEffect(() => {
    if (!isAuthed) return
    axios.get("/api/preferences").then((res) => {
      const data = res.data
      if (data.theme) {
        setThemeState(data.theme)
        saveLocal("theme", data.theme)
        applyTheme(data.theme)
      }
      if (data.accent) {
        setAccentState(data.accent)
        saveLocal("accent", data.accent)
        applyAccent(data.accent)
      }
    }).catch((err) => {
      console.error("Failed to load preferences:", err)
    })
  }, [isAuthed])

  // Listen for OS theme changes when in "system" mode
  useEffect(() => {
    if (theme !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => applyTheme("system")
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [theme])

  // Apply on mount and when values change — useLayoutEffect to prevent flash
  useLayoutEffect(() => { applyTheme(theme) }, [theme])
  useLayoutEffect(() => { applyAccent(accent) }, [accent])

  const setTheme = useCallback(async (value: string) => {
    setThemeState(value)
    saveLocal("theme", value)
    applyTheme(value)
    if (isAuthed) {
      // Await so callers (e.g. Save Settings) can ensure the DB write lands
      // before reloading — otherwise the reload cancels the request and the
      // stale DB value flashes back on rehydration.
      await axios.put("/api/preferences", { theme: value }).catch((err) => {
        console.error("Failed to save theme preference:", err)
      })
    }
  }, [isAuthed])

  const setAccent = useCallback(async (value: string) => {
    setAccentState(value)
    saveLocal("accent", value)
    applyAccent(value)
    if (isAuthed) {
      await axios.put("/api/preferences", { accent: value }).catch((err) => {
        console.error("Failed to save accent preference:", err)
      })
    }
  }, [isAuthed])

  const toggleTheme = useCallback(() => {
    const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light"
    setTheme(next)
  }, [theme, setTheme])

  return { theme, accent, setTheme, setAccent, toggleTheme }
}
