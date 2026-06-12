"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bug, GitPullRequest, Activity, Users } from "lucide-react"
import type { SearchResponse } from "@/lib/types"

interface StatsCardsProps {
  data: SearchResponse | undefined
  isLoading: boolean
}

const statConfig = [
  {
    title: "Total Issues",
    icon: Bug,
    gradient: "from-blue-500/20 to-blue-600/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    ringColor: "ring-blue-500/20",
  },
  {
    title: "This Page",
    icon: GitPullRequest,
    gradient: "from-violet-500/20 to-violet-600/10",
    iconColor: "text-violet-600 dark:text-violet-400",
    ringColor: "ring-violet-500/20",
  },
  {
    title: "Open Issues",
    icon: Activity,
    gradient: "from-emerald-500/20 to-emerald-600/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    ringColor: "ring-emerald-500/20",
  },
  {
    title: "Contributors",
    icon: Users,
    gradient: "from-amber-500/20 to-amber-600/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    ringColor: "ring-amber-500/20",
  },
]

export function StatsCards({ data, isLoading }: StatsCardsProps) {
  if (isLoading || !data) return null

  const values = [
    data.total_count.toLocaleString(),
    data.items.length.toString(),
    data.items.filter((i) => i.state === "open").length.toLocaleString(),
    new Set(data.items.map((i) => i.user?.login)).size.toString(),
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statConfig.map((stat, i) => {
        const Icon = stat.icon
        return (
          <Card
            key={stat.title}
            size="sm"
            className="relative overflow-hidden transition-shadow hover:shadow-md"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.gradient}`}
            />
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div
                  className={`flex size-7 items-center justify-center rounded-lg bg-background/60 ring-1 ${stat.ringColor}`}
                >
                  <Icon className={`size-3.5 ${stat.iconColor}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold tracking-tight">
                {values[i]}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
