"use client"

import { useState } from "react"
import { Settings, Shield, Key, CheckCircle2, XCircle, Loader2, Code2, Eye, EyeOff, Sliders, Trash2, Ban } from "lucide-react"
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
import { cn } from "@/lib/utils"
import { useIgnoredRepos } from "@/hooks/use-ignored-repos"

interface SettingsDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function SettingsDialog({ open, onOpenChange, trigger }: SettingsDialogProps) {
  const [activeSubTab, setActiveSubTab] = useState<"stack" | "auth" | "ignored">("stack")
  const [showToken, setShowToken] = useState(false)
  const { ignoredRepos, removeIgnoredRepo, clear } = useIgnoredRepos()

  const [token, setToken] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("github-token") || ""
    }
    return ""
  })
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">(() => {
    if (typeof window !== "undefined" && localStorage.getItem("github-token")) {
      return "success"
    }
    return "idle"
  })
  const [username, setUsername] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("github-username") || null
    }
    return null
  })
  const [errorMessage, setErrorMessage] = useState("")
  const [isTokenSaved, setIsTokenSaved] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("github-token")
    }
    return false
  })
  const [languages, setLanguages] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const savedLangs = localStorage.getItem("developer-languages")
      return savedLangs ? JSON.parse(savedLangs) : ["typescript", "javascript"]
    }
    return ["typescript", "javascript"]
  })
  const [labels, setLabels] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const savedLabels = localStorage.getItem("developer-labels")
      return savedLabels ? JSON.parse(savedLabels) : ["good first issue"]
    }
    return ["good first issue"]
  })
  const [experience, setExperience] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("developer-experience") || "beginner"
    }
    return "beginner"
  })

  const handleSave = async () => {
    // Save tech stack settings
    localStorage.setItem("developer-languages", JSON.stringify(languages))
    localStorage.setItem("developer-labels", JSON.stringify(labels))
    localStorage.setItem("developer-experience", experience)

    if (!token.trim()) {
      localStorage.removeItem("github-token")
      localStorage.removeItem("github-username")
      setStatus("idle")
      setUsername(null)
      if (onOpenChange) onOpenChange(false)
      window.location.reload()
      return
    }

    const savedToken = localStorage.getItem("github-token") || ""
    if (token.trim() === savedToken) {
      // Token didn't change, just close and reload
      setStatus("success")
      setTimeout(() => {
        if (onOpenChange) onOpenChange(false)
        window.location.reload()
      }, 300)
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
          <DialogTitle className="text-xl font-bold tracking-tight">Settings</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-medium">
            Manage your credentials and personalization preferences.
          </DialogDescription>
        </DialogHeader>

        {/* Tab Selection */}
        <div className="flex border-b border-border/40 pb-px mb-2 gap-4">
          <button
            type="button"
            onClick={() => setActiveSubTab("stack")}
            className={cn(
              "text-xs font-semibold pb-1.5 border-b-2 transition-all cursor-pointer",
              activeSubTab === "stack"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            🎨 Personalization
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("auth")}
            className={cn(
              "text-xs font-semibold pb-1.5 border-b-2 transition-all cursor-pointer",
              activeSubTab === "auth"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            🔑 Credentials & Rate limits
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("ignored")}
            className={cn(
              "text-xs font-semibold pb-1.5 border-b-2 transition-all cursor-pointer",
              activeSubTab === "ignored"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            🚫 Ignored Repos
          </button>
        </div>

        <div className="space-y-4 py-2 min-h-[280px]">
          {/* Sub-Tab 1: Tech Stack & Experience */}
          {activeSubTab === "stack" && (
            <div className="space-y-3.5">
              {/* Experience Level selection */}
              <div className="rounded-xl bg-secondary/20 p-3.5 space-y-2 border border-border/60">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sliders className="size-3.5 text-primary" />
                  Experience Level
                </span>
                <span className="text-[10px] text-muted-foreground block leading-relaxed">
                  Tailors match ratings and recommendation priorities on your For You feed.
                </span>
                <div className="grid grid-cols-3 gap-1.5 mt-1 bg-background/50 p-1 rounded-lg border border-border/40">
                  {[
                    { id: "beginner", label: "Beginner" },
                    { id: "intermediate", label: "Intermediate" },
                    { id: "advanced", label: "Advanced" }
                  ].map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      onClick={() => setExperience(level.id)}
                      className={cn(
                        "rounded-md py-1 px-1.5 text-center text-xs font-semibold transition-all cursor-pointer",
                        experience === level.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tech Stack Customizer */}
              <div className="rounded-xl bg-secondary/20 p-3.5 space-y-3.5 border border-border/60">
                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5 border-b border-border/40 pb-2">
                  <Code2 className="size-4 text-primary" />
                  Programming Languages
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex flex-wrap gap-1">
                    {["typescript", "javascript", "python", "go", "rust", "cpp", "java", "ruby"].map((lang) => {
                      const active = languages.includes(lang)
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => {
                            setLanguages(prev => 
                              prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
                            )
                          }}
                          className={cn(
                            "rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-200 border cursor-pointer",
                            active 
                              ? "bg-primary/15 text-primary border-primary/45 shadow-sm font-semibold" 
                              : "bg-background/50 text-muted-foreground border-border/60 hover:border-muted-foreground/40 hover:text-foreground"
                          )}
                        >
                          {lang === "cpp" ? "C++" : lang === "typescript" ? "TypeScript" : lang === "javascript" ? "JavaScript" : lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-border/40">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Target Issue Labels</span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: "good first issue", label: "Good First Issue" },
                      { id: "help wanted", label: "Help Wanted" },
                      { id: "beginner", label: "Beginner" },
                      { id: "documentation", label: "Documentation" }
                    ].map((item) => {
                      const active = labels.includes(item.id)
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setLabels(prev => 
                              prev.includes(item.id) ? prev.filter(l => l !== item.id) : [...prev, item.id]
                            )
                          }}
                          className={cn(
                            "rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-200 border cursor-pointer",
                            active 
                              ? "bg-primary/15 text-primary border-primary/45 shadow-sm font-semibold" 
                              : "bg-background/50 text-muted-foreground border-border/60 hover:border-muted-foreground/40 hover:text-foreground"
                          )}
                        >
                          {item.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 3: Ignored Repositories */}
          {activeSubTab === "ignored" && (
            <div className="space-y-3.5">
              <div className="rounded-xl bg-secondary/20 p-3.5 space-y-2 border border-border/60">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Ban className="size-3.5 text-destructive" />
                  Ignored Repositories
                </span>
                <span className="text-[10px] text-muted-foreground block leading-relaxed">
                  Repositories added here will be hidden from your search results. Click the eye-off icon on any issue or repo card to add it.
                </span>
              </div>

              {ignoredRepos.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-background/30 p-6 text-center">
                  <Ban className="size-8 text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground font-medium">No ignored repositories</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">
                    Click the <EyeOff className="size-3 inline" /> icon on any card to ignore a repository.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                  {ignoredRepos.map((repo) => (
                    <div
                      key={repo}
                      className="flex items-center justify-between rounded-lg border border-border/60 bg-background/50 px-3 py-2"
                    >
                      <span className="text-xs font-medium text-foreground truncate">{repo}</span>
                      <button
                        type="button"
                        onClick={() => removeIgnoredRepo(repo)}
                        className="shrink-0 text-muted-foreground hover:text-destructive transition-colors cursor-pointer ml-2"
                        title={`Remove ${repo} from ignore list`}
                        aria-label={`Remove ${repo}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {ignoredRepos.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clear}
                  className="w-full text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 cursor-pointer"
                >
                  Clear All
                </Button>
              )}
            </div>
          )}

          {/* Sub-Tab 2: GitHub API PAT Authentications */}
          {activeSubTab === "auth" && (
            <div className="space-y-4">
              <div className="rounded-xl bg-secondary/35 p-3 text-xs leading-relaxed text-muted-foreground border border-border/60">
                <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-foreground">
                  <Shield className="size-3.5 text-primary" />
                  Local Environment Security
                </div>
                Credential storage is sandboxed in your browser&apos;s <code className="font-mono text-primary bg-primary/5 px-1 py-0.5 rounded">localStorage</code> and only sent directly to GitHub APIs.
              </div>

              <div className="space-y-1.5">
                <label htmlFor="token-input" className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="size-3.5 text-muted-foreground" />
                    Personal Access Token (PAT)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="text-[10px] text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {showToken ? (
                      <>
                        <EyeOff className="size-3" /> Hide Token
                      </>
                    ) : (
                      <>
                        <Eye className="size-3" /> Show Token
                      </>
                    )}
                  </button>
                </label>
                <Input
                  id="token-input"
                  type={showToken ? "text" : "password"}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value)
                    if (status === "success" || status === "error") setStatus("idle")
                  }}
                  className="h-9 rounded-xl border-border bg-background focus-visible:ring-primary/30"
                />
                <p className="text-[10px] text-muted-foreground leading-normal">
                  Create a token under{" "}
                  <a
                    href="https://github.com/settings/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    GitHub Developer settings
                  </a>. No scopes are required for searching public repositories.
                </p>
              </div>

              {status === "success" && username && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-500 animate-pulse" />
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
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/40 pt-3.5">
          {isTokenSaved && activeSubTab === "auth" && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="mr-auto text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 cursor-pointer"
            >
              Remove Token
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange?.(false)}
            disabled={status === "testing"}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={status === "testing"}
            className="min-w-[90px] cursor-pointer"
          >
            {status === "testing" ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                Testing...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
