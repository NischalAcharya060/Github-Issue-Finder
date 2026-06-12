"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bug, GitPullRequest, Users, Activity } from "lucide-react"
import type { SearchResponse } from "@/lib/types"

interface StatsCardsProps {
  data: SearchResponse | undefined
  isLoading: boolean
}

export function StatsCards({ data, isLoading }: StatsCardsProps) {
  if (isLoading || !data) return null

  const stats = [
    {
      title: "Total Issues",
      value: data.total_count.toLocaleString(),
      icon: Bug,
    },
    {
      title: "This Page",
      value: data.items.length.toString(),
      icon: GitPullRequest,
    },
    {
      title: "Open Issues",
      value: data.items
        .filter((i) => i.state === "open")
        .length.toLocaleString(),
      icon: Activity,
    },
    {
      title: "Contributors",
      value: new Set(data.items.map((i) => i.user?.login)).size.toString(),
      icon: Users,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} size="sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
