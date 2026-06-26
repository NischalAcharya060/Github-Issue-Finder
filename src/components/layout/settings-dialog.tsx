"use client"

import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import { Palette, Settings, Shield, Key, CheckCircle2, XCircle, Loader2, Code2, Eye, EyeOff, Sliders, Trash2, Ban, GitPullRequest, Sun, Moon, Monitor } from "lucide-react"
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
import { usePreferences } from "@/hooks/use-preferences"

interface SettingsDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

type TabId = "appearance" | "stack" | "auth" | "ignored"

const tabs: { id: TabId; label: string; icon: typeof Sliders }[] = [
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "stack", label: "Personalization", icon: Sliders },
  { id: "auth", label: "Credentials", icon: Key },
  { id: "ignored", label: "Ignored Repos", icon: Ban },
]

export function SettingsDialog({ open, onOpenChange, trigger }: SettingsDialogProps) {
  const [activeSubTab, setActiveSubTab] = useState<TabId>("appearance")
  const [showToken, setShowToken] = useState(false)
  const { ignoredRepos, removeIgnoredRepo, clear } = useIgnoredRepos()
  const { theme, accent, setTheme, setAccent } = usePreferences()
  const tabsRef = useRef<HTMLDivElement>(null)

  // Staged appearance — selecting only updates the preview here; nothing is
  // applied or persisted until the user clicks "Save Settings".
  const [selectedTheme, setSelectedTheme] = useState(theme)
  const [selectedAccent, setSelectedAccent] = useState(accent)

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

  const accentOptions = [
    { id: "blue", label: "Blue", hex: "#58A6FF" },
    { id: "indigo", label: "Indigo", hex: "#7C6FF7" },
    { id: "purple", label: "Purple", hex: "#BC8CFF" },
    { id: "pink", label: "Pink", hex: "#FF7BB8" },
    { id: "rose", label: "Rose", hex: "#FF7B72" },
    { id: "orange", label: "Orange", hex: "#F0883E" },
    { id: "amber", label: "Amber", hex: "#D29922" },
    { id: "emerald", label: "Emerald", hex: "#3FB950" },
    { id: "teal", label: "Teal", hex: "#56D4DD" },
    { id: "slate", label: "Slate", hex: "#8B949E" },
  ]

  const accentLabel = (id: string) =>
    accentOptions.find((o) => o.id === id)?.label ?? id

  // Toasts shown after a page reload (save/token flows reload the app, which
  // would otherwise discard a toast fired right before it). Queue in
  // sessionStorage and replay once on the next mount.
  const queueToast = (type: "success" | "error", title: string, description?: string) => {
    sessionStorage.setItem("settings-toast", JSON.stringify({ type, title, description }))
  }

  useEffect(() => {
    const raw = sessionStorage.getItem("settings-toast")
    if (!raw) return
    sessionStorage.removeItem("settings-toast")
    try {
      const { type, title, description } = JSON.parse(raw)
      toast[type === "error" ? "error" : "success"](title, description ? { description } : undefined)
    } catch {
      // ignore malformed queued toast
    }
  }, [])

  // Re-sync staged appearance with the live values each time the dialog opens,
  // so an unsaved selection from a previous (cancelled) session is discarded.
  // Adjusting state during render (vs. an effect) is the React-recommended
  // pattern for resetting state when a prop changes.
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setSelectedTheme(theme)
      setSelectedAccent(accent)
    }
  }

  const appearanceChanged =
    selectedTheme !== theme || selectedAccent !== accent

  // Build the "what was saved" description, noting any appearance change.
  const savedDescription = (base: string) => {
    if (!appearanceChanged) return base
    const bits: string[] = []
    if (selectedTheme !== theme) bits.push(`${selectedTheme === "dark" ? "Dark" : "Light"} mode`)
    if (selectedAccent !== accent) bits.push(`${accentLabel(selectedAccent)} accent`)
    return `${bits.join(" & ")} applied. ${base}`
  }

  const handleSave = async () => {
    // Commit staged appearance — applies instantly and persists (DB + local).
    // Await the DB writes so the upcoming reload doesn't cancel them and flash
    // the stale value back after rehydration. Run sequentially: for a brand-new
    // user the first write creates the preferences row and the second updates
    // it, avoiding a parallel-create collision on the userId unique key.
    if (selectedTheme !== theme) await setTheme(selectedTheme)
    if (selectedAccent !== accent) await setAccent(selectedAccent)

    localStorage.setItem("developer-languages", JSON.stringify(languages))
    localStorage.setItem("developer-labels", JSON.stringify(labels))
    localStorage.setItem("developer-experience", experience)

    if (!token.trim()) {
      const hadToken = !!localStorage.getItem("github-token")
      localStorage.removeItem("github-token")
      localStorage.removeItem("github-username")
      setStatus("idle")
      setUsername(null)
      queueToast(
        "success",
        hadToken ? "Token removed & settings saved" : "Settings saved",
        savedDescription(
          hadToken
            ? "You're back to anonymous access (60 requests/hr)."
            : "Your preferences have been updated.",
        ),
      )
      if (onOpenChange) onOpenChange(false)
      window.location.reload()
      return
    }

    const savedToken = localStorage.getItem("github-token") || ""
    if (token.trim() === savedToken) {
      setStatus("success")
      queueToast(
        "success",
        "Settings saved",
        savedDescription("Your preferences have been updated."),
      )
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

      queueToast(
        "success",
        `Connected as ${login}`,
        savedDescription("Token validated & saved — you now have 5,000 requests/hr."),
      )
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
      toast.error("Token validation failed", { description: msg })
    }
  }

  const handleClear = () => {
    localStorage.removeItem("github-token")
    localStorage.removeItem("github-username")
    setToken("")
    setStatus("idle")
    setUsername(null)
    setIsTokenSaved(false)
    queueToast(
      "success",
      "Token removed",
      "You're back to anonymous access (60 requests/hr).",
    )
    setTimeout(() => {
      if (onOpenChange) onOpenChange(false)
      window.location.reload()
    }, 300)
  }

  const scrollTabIntoView = (id: TabId) => {
    setActiveSubTab(id)
    const container = tabsRef.current
    if (!container) return
    const btn = container.querySelector(`[data-tab-id="${id}"]`) as HTMLElement
    btn?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-[calc(100%-1rem)] sm:max-w-xl lg:max-w-4xl border-border/80 bg-card/95 shadow-2xl backdrop-blur-md p-0 gap-0 overflow-hidden max-h-[90dvh]">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-0 shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
              <Settings className="size-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight">Settings</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-medium">
                Manage appearance, credentials, personalization, and ignored repositories.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Mobile tabs — horizontal scroll on small screens, hidden on lg+ */}
        <div
          ref={tabsRef}
          className="flex lg:hidden gap-1 px-5 mt-3 pb-2 overflow-x-auto scrollbar-none border-b border-border/40 shrink-0"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeSubTab === tab.id
            return (
              <button
                key={tab.id}
                data-tab-id={tab.id}
                type="button"
                onClick={() => scrollTabIntoView(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shrink-0",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="size-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Body — sidebar + content */}
        <div className="flex flex-1 flex-col lg:flex-row min-h-0 overflow-hidden">
          {/* Desktop sidebar — hidden on mobile */}
          <nav className="hidden lg:flex flex-col gap-1 w-52 shrink-0 border-r border-border/40 p-4 overflow-y-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeSubTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSubTab(tab.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all cursor-pointer text-left",
                    isActive
                      ? "bg-primary/10 text-primary ring-1 ring-primary/20 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  <span className={cn(
                    "flex size-8 items-center justify-center rounded-lg shrink-0 transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/80 text-muted-foreground"
                  )}>
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{tab.label}</div>
                    <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                      {tab.id === "appearance" && "Theme & accent color"}
                      {tab.id === "stack" && "Languages & labels"}
                      {tab.id === "auth" && "GitHub token"}
                      {tab.id === "ignored" && `${ignoredRepos.length} repo${ignoredRepos.length !== 1 ? "s" : ""}`}
                    </div>
                  </div>
                </button>
              )
            })}
          </nav>

          {/* Content panel */}
          <div className="flex-1 overflow-y-auto p-5">
            <div className="mx-auto max-w-2xl space-y-5">
              {/* Appearance */}
              {activeSubTab === "appearance" && (
                <>
                  <SectionCard icon={Sun} iconColor="text-primary" title="Theme" description="Switch between light, dark, or system-follow appearance. Applies when you save.">
                    <div className="flex gap-2">
                      {[
                        { id: "light", label: "Light", icon: Sun },
                        { id: "dark", label: "Dark", icon: Moon },
                        { id: "system", label: "System", icon: Monitor },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedTheme(opt.id)}
                          className={cn(
                            "flex flex-1 flex-col items-center gap-2 rounded-xl p-3 border transition-colors cursor-pointer",
                            selectedTheme === opt.id
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border/40 bg-background/50 text-muted-foreground hover:border-border/80"
                          )}
                        >
                          <opt.icon className="size-5" />
                          <span className="text-xs font-medium">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard icon={Palette} iconColor="text-primary" title="Accent Color" description="Choose your primary accent color for buttons, links, and highlights. Applies when you save.">
                    <div className="flex flex-wrap gap-3">
                      {accentOptions.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedAccent(opt.id)}
                          className="flex flex-col items-center gap-1.5 cursor-pointer group"
                        >
                          <span
                            className={cn(
                              "size-8 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all",
                              selectedAccent === opt.id ? "ring-current" : "ring-transparent group-hover:ring-muted-foreground/30"
                            )}
                            style={{ backgroundColor: opt.hex, color: opt.hex }}
                          />
                          <span className={cn(
                            "text-[10px] font-medium",
                            selectedAccent === opt.id ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {opt.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </SectionCard>
                </>
              )}

              {/* Personalization */}
              {activeSubTab === "stack" && (
                <>
                  {/* Experience Level */}
                  <SectionCard icon={Sliders} iconColor="text-primary" title="Experience Level" description="Tailors match ratings and recommendation priorities on your For You feed.">
                    <div className="grid grid-cols-3 gap-2 bg-background/50 p-1.5 rounded-xl border border-border/40">
                      {[
                        { id: "beginner", label: "Beginner" },
                        { id: "intermediate", label: "Intermediate" },
                        { id: "advanced", label: "Advanced" },
                      ].map((level) => (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => setExperience(level.id)}
                          className={cn(
                            "rounded-lg py-2 px-3 text-center text-sm font-semibold transition-all cursor-pointer",
                            experience === level.id
                              ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/30"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                        >
                          {level.label}
                        </button>
                      ))}
                    </div>
                  </SectionCard>

                  {/* Programming Languages */}
                  <SectionCard icon={Code2} iconColor="text-primary" title="Programming Languages" description="Select languages that match your stack.">
                    <div className="flex flex-wrap gap-2">
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
                              "rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 border cursor-pointer",
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
                  </SectionCard>

                  {/* Target Labels */}
                  <SectionCard icon={Code2} iconColor="text-muted-foreground" title="Target Issue Labels" description="Preferred labels for your personalized feed.">
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "good first issue", label: "Good First Issue" },
                        { id: "help wanted", label: "Help Wanted" },
                        { id: "beginner", label: "Beginner" },
                        { id: "documentation", label: "Documentation" },
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
                              "rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 border cursor-pointer",
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
                  </SectionCard>
                </>
              )}

              {/* Credentials */}
              {activeSubTab === "auth" && (
                <>
                  <SectionCard icon={Shield} iconColor="text-primary" title="Local Environment Security" description="">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Credential storage is sandboxed in your browser&apos;s <code className="font-mono text-primary bg-primary/5 px-1.5 py-0.5 rounded text-xs">localStorage</code> and only sent directly to GitHub APIs.
                    </p>
                  </SectionCard>

                  <div className="space-y-3 rounded-xl border border-border/60 bg-secondary/20 p-4">
                    <label htmlFor="token-input" className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Key className="size-4 text-muted-foreground" />
                        Personal Access Token (PAT)
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {showToken ? <><EyeOff className="size-3.5" /> Hide</> : <><Eye className="size-3.5" /> Show</>}
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
                      className="h-10 rounded-xl border-border bg-background focus-visible:ring-primary/30 text-sm"
                    />
                    <p className="text-xs text-muted-foreground leading-relaxed">
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
                    <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-4 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      <div className="flex size-9 items-center justify-center rounded-full bg-emerald-500/15">
                        <CheckCircle2 className="size-5 text-emerald-500" />
                      </div>
                      <div>
                        <span className="font-semibold">Connected as </span>
                        <strong className="font-bold text-foreground">{username}</strong>
                        <span className="block text-xs text-muted-foreground mt-0.5">5,000 requests/hr limit</span>
                      </div>
                    </div>
                  )}

                  {status === "error" && (
                    <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/8 p-4 text-sm text-destructive-foreground">
                      <XCircle className="size-5 shrink-0 text-destructive" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                </>
              )}

              {/* Ignored Repos */}
              {activeSubTab === "ignored" && (
                <>
                  <SectionCard icon={Ban} iconColor="text-destructive" title="Ignored Repositories" description="Repositories added here will be hidden from your search results. Click the eye-off icon on any card to add one." />

                  {ignoredRepos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-background/30 p-10 text-center">
                      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/50 mb-3">
                        <Ban className="size-7 text-muted-foreground/40" />
                      </div>
                      <p className="text-sm font-semibold text-muted-foreground">No ignored repositories</p>
                      <p className="text-xs text-muted-foreground/70 mt-1 max-w-xs">
                        Click the <EyeOff className="size-3 inline" /> icon on any issue or repo card to hide results from that repository.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                      {ignoredRepos.map((repo) => (
                        <div
                          key={repo}
                          className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 px-4 py-3 transition-colors hover:bg-background/80"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-muted/60 shrink-0">
                              <GitPullRequest className="size-4 text-muted-foreground" />
                            </div>
                            <span className="text-sm font-medium text-foreground truncate">{repo}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeIgnoredRepo(repo)}
                            className="shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                            title={`Remove ${repo} from ignore list`}
                            aria-label={`Remove ${repo}`}
                          >
                            <Trash2 className="size-3.5" />
                            <span className="hidden sm:inline">Remove</span>
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
                      Clear All ({ignoredRepos.length})
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border/40 px-5 py-3.5 shrink-0">
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
            className="min-w-[100px] cursor-pointer"
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

function SectionCard({
  icon: Icon,
  iconColor,
  title,
  description,
  children,
}: {
  icon: typeof Sliders
  iconColor: string
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-secondary/20 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className={cn("flex size-9 items-center justify-center rounded-lg bg-background/60 ring-1 ring-border/40 shrink-0", iconColor)}>
          <Icon className="size-4.5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      {children && <div className="pl-0">{children}</div>}
    </div>
  )
}
