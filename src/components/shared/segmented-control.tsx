"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface SegmentOption<T extends string> {
  value: T
  label: string
  icon?: React.ComponentType<{ className?: string }>
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
  /** Unique id so the sliding indicator's layoutId doesn't collide across instances. */
  layoutGroup: string
  /** Hide labels below the sm breakpoint. */
  responsiveLabels?: boolean
  className?: string
}

/**
 * Pill segmented control with a spring-animated active indicator (shared layout).
 * Used for entity-type and search-mode toggles for a premium, cohesive tab feel.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  layoutGroup,
  responsiveLabels = true,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-xl bg-secondary/60 p-1 ring-1 ring-border/60",
        className
      )}
    >
      {options.map((opt) => {
        const Icon = opt.icon
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors",
              active
                ? "text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId={`segmented-${layoutGroup}`}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="absolute inset-0 -z-10 rounded-lg bg-primary shadow-sm shadow-primary/30"
              />
            )}
            {Icon && <Icon className="size-3.5 shrink-0" />}
            <span className={cn(responsiveLabels && "hidden sm:inline")}>
              {opt.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
