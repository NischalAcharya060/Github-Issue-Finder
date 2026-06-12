"use client"

import { useState, useCallback } from "react"

function readStorage<T>(key: string, initialValue: T): T {
  if (typeof window === "undefined") return initialValue
  try {
    const item = localStorage.getItem(key)
    if (item) return JSON.parse(item)
  } catch {
    /* empty */
  }
  return initialValue
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() =>
    readStorage(key, initialValue)
  )

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const newValue = value instanceof Function ? value(prev) : value
        localStorage.setItem(key, JSON.stringify(newValue))
        return newValue
      })
    },
    [key]
  )

  const removeValue = useCallback(() => {
    localStorage.removeItem(key)
    setStoredValue(initialValue)
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}
