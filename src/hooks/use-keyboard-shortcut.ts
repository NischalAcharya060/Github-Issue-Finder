"use client"

import { useEffect } from "react"

export function useKeyboardShortcut(
  key: string,
  handler: () => void,
  options?: { ctrlKey?: boolean; metaKey?: boolean }
) {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (
        e.key === key &&
        (!options?.ctrlKey || e.ctrlKey) &&
        (!options?.metaKey || e.metaKey) &&
        !e.repeat
      ) {
        handler()
      }
    }
    window.addEventListener("keydown", listener)
    return () => window.removeEventListener("keydown", listener)
  }, [key, handler, options])
}
