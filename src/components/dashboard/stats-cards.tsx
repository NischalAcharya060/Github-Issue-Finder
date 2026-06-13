"use client"

import { Bug, GitPullRequest, Activity, Users } from "lucide-react"
import { AnimatedNumber, Stagger, StaggerItem } from "@/components/motion/motion-primitives"
import { cn } from "@/lib/utils"
import type { SearchResponse } from "@/lib/types"

interface StatsCardsProps {
  data: SearchResponse | undefined
  isLoading: boolean
}

const statConfig = [
  {
    title: "Total Issues",
    icon: Bug,
    tint: "from-emerald-500/12 to-transparent",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    ringColor: "ring-emerald-500/20",
  },
  {
    title: "This Page",
    icon: GitPullRequest,
    tint: "from-teal-500/12 to-transparent",
    iconColor: "text-teal-600 dark:text-teal-400",
    ringColor: "ring-teal-500/20",
  },
  {
    title: "Open Issues",
    icon: Activity,
    tint: "from-green-500/12 to-transparent",
    iconColor: "text-green-600 dark:text-green-400",
    ringColor: "ring-green-500/20",
  },
  {
    title: "Contributors",
    icon: Users,
    tint: "from-cyan-500/12 to-transparent",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    ringColor: "ring-cyan-500/20",
  },
]

export function StatsCards({ data, isLoading }: StatsCardsProps) {
  if (isLoading || !data) return null

  const values = [
    data.total_count,
    data.items.length,
    data.items.filter((i) => i.state === "open").length,
    new Set(data.items.map((i) => i.user?.login)).size,
  ]

  return (
    <Stagger stagger={0.06} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statConfig.map((stat, i) => {
        const Icon = stat.icon
        return (
          <StaggerItem key={stat.title}>
            <div className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4 shadow-sm shadow-foreground/[0.03] ring-1 ring-foreground/[0.04] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/5">
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80",
                  stat.tint
                )}
              />
              <div className="relative flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </span>
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-xl bg-background/70 ring-1 backdrop-blur-sm transition-transform group-hover:scale-110",
                    stat.ringColor
                  )}
                >
                  <Icon className={cn("size-4", stat.iconColor)} />
                </div>
              </div>
              <div className="relative mt-3 text-2xl font-bold tracking-tight tabular-nums">
                <AnimatedNumber value={values[i]} />
              </div>
            </div>
          </StaggerItem>
        )
      })}
    </Stagger>
  )
}
