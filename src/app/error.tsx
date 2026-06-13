"use client"

import { AlertTriangle, RotateCcw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 py-24">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-5">
          <div
            aria-hidden
            className="absolute inset-0 rounded-2xl bg-destructive/20 blur-xl"
          />
          <div className="relative flex size-16 items-center justify-center rounded-2xl bg-destructive/10 ring-1 ring-destructive/20">
            <AlertTriangle className="size-7 text-destructive" />
          </div>
        </div>
        <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
        <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-md"
        >
          <RotateCcw className="size-3.5" />
          Try again
        </button>
      </div>
    </div>
  )
}
