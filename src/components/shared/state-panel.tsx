"use client"

import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

interface StatePanelProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  tone?: "default" | "error"
  children?: React.ReactNode
}

/** Polished centered panel for empty / error states. */
export function StatePanel({
  icon: Icon,
  title,
  description,
  tone = "default",
  children,
}: StatePanelProps) {
  const reduce = useReducedMotion()
  const isError = tone === "error"

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center px-4 py-20 text-center"
    >
      <div className="relative mb-5">
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-2xl blur-xl",
            isError ? "bg-destructive/20" : "bg-primary/15"
          )}
        />
        <div
          className={cn(
            "relative flex size-16 items-center justify-center rounded-2xl ring-1",
            isError
              ? "bg-destructive/10 ring-destructive/20"
              : "bg-primary/10 ring-primary/20"
          )}
        >
          <Icon
            className={cn(
              "size-7",
              isError ? "text-destructive" : "text-primary"
            )}
          />
        </div>
      </div>
      <h3 className="mb-1.5 text-lg font-semibold">{title}</h3>
      <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {children && <div className="mt-6">{children}</div>}
    </motion.div>
  )
}
