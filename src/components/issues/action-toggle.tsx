"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Tone = "primary" | "emerald" | "muted"

const toneActive: Record<Tone, string> = {
  primary:
    "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15",
  emerald:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 dark:text-emerald-400",
  muted: "border-border bg-muted text-foreground hover:bg-muted/70",
}

const toneIdle: Record<Tone, string> = {
  primary: "text-muted-foreground hover:text-primary",
  emerald: "text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400",
  muted: "text-muted-foreground hover:text-foreground",
}

export interface ActionToggleProps {
  icon: React.ComponentType<{ className?: string }>
  active: boolean
  onToggle: () => void
  tone?: Tone
  /** Label shown when labeled=true. Pair [idle, active] or a single string. */
  label?: string | [string, string]
  labeled?: boolean
  /** Fill the icon when active (good for bookmark). */
  fillWhenActive?: boolean
  pending?: boolean
  /** Layout: "icon" small ghost, "inline" labeled sm, "block" full-width labeled. */
  layout?: "icon" | "inline" | "block"
  ariaLabel?: string
  title?: string
  className?: string
}

export function ActionToggle({
  icon: Icon,
  active,
  onToggle,
  tone = "primary",
  label,
  labeled = false,
  fillWhenActive = false,
  pending = false,
  layout = "icon",
  ariaLabel,
  title,
  className,
}: ActionToggleProps) {
  const block = layout === "block"
  const text =
    typeof label === "string" ? label : label?.[active ? 1 : 0] ?? ""
  const size = block ? "default" : labeled ? "sm" : "icon-xs"

  return (
    <Button
      type="button"
      variant={active ? "secondary" : layout === "icon" ? "ghost" : "outline"}
      size={size}
      disabled={pending}
      aria-pressed={active}
      aria-label={ariaLabel}
      title={title}
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className={cn(
        "transition-all active:scale-[0.96]",
        labeled && "gap-1.5",
        block && "w-full",
        active ? toneActive[tone] : toneIdle[tone],
        className
      )}
    >
      {pending ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Icon
          className={cn(
            "transition-transform",
            fillWhenActive && active && "fill-current",
            active && !fillWhenActive && "stroke-[2.5]"
          )}
        />
      )}
      {labeled && <span>{text}</span>}
    </Button>
  )
}
