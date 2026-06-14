"use client"

import { useState, useEffect } from "react"
import { Settings, Shield, Key, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axios from "axios"

interface SettingsDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function SettingsDialog({ open, onOpenChange, trigger }: SettingsDialogProps) {
  const [token, setToken] = useState("")
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [username, setUsername] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [isTokenSaved, setIsTokenSaved] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("github-token") || ""
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(savedToken)
      setIsTokenSaved(!!savedToken)
      if (savedToken) {
        setStatus("success")
        setUsername(localStorage.getItem("github-username") || "Connected")
      }
    }
  }, [open])

  const handleSave = async () => {
    if (!token.trim()) {
      localStorage.removeItem("github-token")
      localStorage.removeItem("github-username")
      setStatus("idle")
      setUsername(null)
      if (onOpenChange) onOpenChange(false)
      window.location.reload() // Reload to clear headers / refresh states
      return
    }

    setStatus("testing")
    setErrorMessage("")

    try {
      const response = await axios.get("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      const login = response.data.login
      localStorage.setItem("github-token", token.trim())
      localStorage.setItem("github-username", login)
      setUsername(login)
      setIsTokenSaved(true)
      setStatus("success")
      
      // Delay closing modal slightly for user feedback
      setTimeout(() => {
        if (onOpenChange) onOpenChange(false)
        window.location.reload()
      }, 800)
    } catch (err: unknown) {
      console.error(err)
      setStatus("error")
      let msg = "Failed to validate token. Check connection and try again."
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message || err.message
      } else if (err instanceof Error) {
        msg = err.message
      }
      setErrorMessage(msg)
    }
  }

  const handleClear = () => {
    localStorage.removeItem("github-token")
    localStorage.removeItem("github-username")
    setToken("")
    setStatus("idle")
    setUsername(null)
    setIsTokenSaved(false)
    setTimeout(() => {
      if (onOpenChange) onOpenChange(false)
      window.location.reload()
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-md border-border/80 bg-card/95 shadow-2xl backdrop-blur-md">
        <DialogHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
            <Settings className="size-5 text-primary animate-spin-slow" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">API Settings</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure your GitHub credentials to bypass API rate limiting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="rounded-xl bg-secondary/35 p-3 text-xs leading-relaxed text-muted-foreground ring-1 ring-border/50">
            <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-foreground">
              <Shield className="size-3.5 text-primary" />
              Security Information
            </div>
            Your token is stored locally in your browser&apos;s <code className="font-mono text-primary bg-primary/5 px-1 py-0.5 rounded">localStorage</code>. It is only sent to GitHub&apos;s server to authenticate search requests.
          </div>

          <div className="space-y-1.5">
            <label htmlFor="token-input" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Key className="size-3.5 text-muted-foreground" />
              Personal Access Token (PAT)
            </label>
            <Input
              id="token-input"
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={token}
              onChange={(e) => {
                setToken(e.target.value)
                if (status === "success" || status === "error") setStatus("idle")
              }}
              className="h-9 rounded-xl border-border bg-background focus-visible:ring-primary/30"
            />
            <p className="text-[10px] text-muted-foreground leading-normal">
              No scopes are required for searching public repositories. Create a token in your{" "}
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                GitHub Developer Settings
              </a>.
            </p>
          </div>

          {status === "success" && username && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>
                Connected as <strong className="font-bold text-foreground">{username}</strong> (5,000 requests/hr limit).
              </span>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/8 p-3 text-xs text-destructive-foreground">
              <XCircle className="size-4 shrink-0 text-destructive" />
              <span className="truncate">{errorMessage}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-3.5">
          {isTokenSaved && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="mr-auto text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            >
              Remove Token
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange?.(false)}
            disabled={status === "testing"}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={status === "testing"}
            className="min-w-[90px]"
          >
            {status === "testing" ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                Testing...
              </>
            ) : (
              "Save Token"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
