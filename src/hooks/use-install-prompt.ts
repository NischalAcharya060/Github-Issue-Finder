"use client"

import { useCallback, useEffect, useState } from "react"

/** Minimal shape of the non-standard `beforeinstallprompt` event. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

/**
 * Tracks PWA installability. Exposes whether the app can be installed and a
 * `promptInstall` action that triggers the browser's native install dialog.
 * Returns `canInstall: false` once installed or when unsupported (e.g. iOS Safari).
 */
function getInitialInstalled(): boolean {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    Boolean((window.navigator as unknown as { standalone?: boolean }).standalone)
  )
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(getInitialInstalled)

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const onInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") setIsInstalled(true)
    setDeferredPrompt(null)
  }, [deferredPrompt])

  return {
    canInstall: !isInstalled && deferredPrompt !== null,
    isInstalled,
    promptInstall,
  }
}
