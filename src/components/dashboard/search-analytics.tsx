"use client"

import { useMemo } from "react"
import { BarChart3, PieChart, Calendar, Flame } from "lucide-react"
import type { GitHubIssue } from "@/lib/types"

const NOW_MS = typeof window !== "undefined" ? Date.now() : 0

interface SearchAnalyticsProps {
  issues: GitHubIssue[]
}

export function SearchAnalytics({ issues }: SearchAnalyticsProps) {
  // 1. Top Repositories (Donut Chart Data)
  const repoData = useMemo(() => {
    const counts: Record<string, number> = {}
    issues.forEach(issue => {
      const repo = issue.repository_url.replace("https://api.github.com/repos/", "")
      counts[repo] = (counts[repo] || 0) + 1
    })

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      
    const top = sorted.slice(0, 4)
    const otherCount = sorted.slice(4).reduce((sum, item) => sum + item[1], 0)
    
    const result = top.map(([name, count]) => ({ name, count }))
    if (otherCount > 0) {
      result.push({ name: "Other Repos", count: otherCount })
    }

    // Calculate angles and coordinates for SVG Donut
    const total = issues.length
    const finalItems = []
    let accumulatedPercent = 0
    
    for (let idx = 0; idx < result.length; idx++) {
      const item = result[idx]
      const percent = (item.count / total) * 100
      const startAngle = (accumulatedPercent / 100) * 360
      const endAngle = ((accumulatedPercent + percent) / 100) * 360
      accumulatedPercent += percent

      // SVG Arc calculations
      const x1 = Math.cos((startAngle - 90) * Math.PI / 180) * 40 + 50
      const y1 = Math.sin((startAngle - 90) * Math.PI / 180) * 40 + 50
      const x2 = Math.cos((endAngle - 90) * Math.PI / 180) * 40 + 50
      const y2 = Math.sin((endAngle - 90) * Math.PI / 180) * 40 + 50
      const largeArc = percent > 50 ? 1 : 0

      // Color mapping
      const colors = [
        "stroke-primary",
        "stroke-amber-500",
        "stroke-emerald-500",
        "stroke-blue-500",
        "stroke-muted-foreground/40"
      ]

      const textColors = [
        "text-primary",
        "text-amber-500",
        "text-emerald-500",
        "text-blue-500",
        "text-muted-foreground"
      ]

      finalItems.push({
        ...item,
        percent,
        path: `M ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2}`,
        color: colors[idx % colors.length],
        textColor: textColors[idx % textColors.length]
      })
    }

    return finalItems
  }, [issues])

  // 2. Top Labels (Bar Chart Data)
  const labelData = useMemo(() => {
    const counts: Record<string, number> = {}
    issues.forEach(issue => {
      issue.labels.forEach(label => {
        counts[label.name] = (counts[label.name] || 0) + 1
      })
    })

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    const max = sorted.length > 0 ? sorted[0][1] : 1
    return sorted.map(([name, count]) => ({
      name,
      count,
      percent: (count / max) * 100
    }))
  }, [issues])

  // 3. Issue Age (Timeline Area Chart Data)
  const ageData = useMemo(() => {
    let fresh = 0     // < 3 days
    let recent = 0    // 3-10 days
    let moderate = 0  // 10-30 days
    let old = 0       // > 30 days

    issues.forEach(issue => {
      const days = (NOW_MS - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24)
      if (days < 3) fresh++
      else if (days < 10) recent++
      else if (days < 30) moderate++
      else old++
    })

    const counts = [fresh, recent, moderate, old]
    const max = Math.max(...counts, 1)
    
    // Create points for SVG path (width: 120, height: 50)
    const points = counts.map((count, i) => {
      const x = i * 40
      const y = 50 - (count / max) * 40
      return { x, y, count }
    })

    const pathData = `M 0 50 ${points.map(p => `L ${p.x} ${p.y}`).join(" ")} L 120 50 Z`
    const lineData = `M 0 ${points[0].y} ${points.map(p => `L ${p.x} ${p.y}`).join(" ")}`

    return {
      groups: [
        { label: "< 3d", count: fresh },
        { label: "3-10d", count: recent },
        { label: "10-30d", count: moderate },
        { label: "> 30d", count: old }
      ],
      pathData,
      lineData,
      points
    }
  }, [issues])

  // 4. Activity Meter (Gauge Needle)
  const activityData = useMemo(() => {
    const totalComments = issues.reduce((sum, issue) => sum + (issue.comments || 0), 0)
    const avgComments = issues.length > 0 ? totalComments / issues.length : 0
    
    // Angle from -90 deg (left) to +90 deg (right)
    // Map avg comments (0 to 10) to angle (-90 to +90)
    const cappedAvg = Math.min(avgComments, 10)
    const angle = (cappedAvg / 10) * 180 - 90
    
    const x = Math.cos((angle - 90) * Math.PI / 180) * 35 + 50
    const y = Math.sin((angle - 90) * Math.PI / 180) * 35 + 50

    let rating = "Low Competition"
    let ratingColor = "text-emerald-500"
    let ratingDesc = "Fewer comments. Easier to claim and get approved!"

    if (avgComments > 5) {
      rating = "Hot Discussion"
      ratingColor = "text-rose-500 animate-pulse"
      ratingDesc = "High discussion. Check PR history before jumping in."
    } else if (avgComments > 2) {
      rating = "Active Discussion"
      ratingColor = "text-amber-500"
      ratingDesc = "Moderate discussion. Collaboration is active."
    }

    return {
      avgComments: avgComments.toFixed(1),
      angle,
      linePath: `M 50 50 L ${x} ${y}`,
      rating,
      ratingColor,
      ratingDesc
    }
  }, [issues])

  if (issues.length === 0) return null

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 rounded-2xl border border-border/70 bg-card/45 p-5 shadow-sm shadow-foreground/[0.02]">
      {/* 1. Repository Share */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
          <PieChart className="size-3.5 text-primary" />
          Repository Share
        </h3>
        <div className="flex items-center gap-4">
          <svg className="size-20 shrink-0" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" className="stroke-secondary" strokeWidth="12" />
            {repoData.map((item) => (
              <path
                key={item.name}
                d={item.path}
                fill="none"
                className={item.color}
                strokeWidth="12"
                strokeLinecap={repoData.length === 1 ? "butt" : "round"}
              />
            ))}
          </svg>
          <div className="min-w-0 flex-1 space-y-1.5">
            {repoData.slice(0, 3).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-[11px] gap-2">
                <span className="truncate font-semibold text-foreground/80">{item.name}</span>
                <span className={`tabular-nums font-bold shrink-0 ${item.textColor}`}>
                  {Math.round(item.percent)}%
                </span>
              </div>
            ))}
            {repoData.length > 3 && (
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="italic">Other repos</span>
                <span className="tabular-nums font-bold">
                  {Math.round(repoData.slice(3).reduce((sum, i) => sum + i.percent, 0))}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top Labels */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
          <BarChart3 className="size-3.5 text-primary" />
          Common Labels
        </h3>
        <div className="space-y-2.5">
          {labelData.length === 0 ? (
            <p className="text-[11px] text-muted-foreground/60 italic py-2">No labeled issues found.</p>
          ) : (
            labelData.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-foreground/80">
                  <span className="truncate max-w-[150px]">{item.name}</span>
                  <span className="tabular-nums text-muted-foreground font-bold">{item.count}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary/80 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/80 transition-all duration-500"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Issue Age Timeline */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
          <Calendar className="size-3.5 text-primary" />
          Issue Age Distribution
        </h3>
        <div className="flex items-end gap-3.5">
          <svg className="h-12 w-32 overflow-visible shrink-0" viewBox="0 0 120 50">
            {/* Area Path */}
            <path d={ageData.pathData} className="fill-primary/10" />
            {/* Line Path */}
            <path d={ageData.lineData} fill="none" className="stroke-primary" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Data Points */}
            {ageData.points.map((p, idx) => (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r="3"
                className="fill-background stroke-primary stroke-[1.5]"
              />
            ))}
          </svg>
          <div className="flex-1 grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] leading-tight text-muted-foreground">
            {ageData.groups.map((g) => (
              <div key={g.label} className="flex justify-between gap-1 border-b border-border/30 pb-0.5">
                <span className="font-medium">{g.label}:</span>
                <span className="tabular-nums font-bold text-foreground/80">{g.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Activity/Competition Meter */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
          <Flame className="size-3.5 text-primary" />
          Activity & Competition
        </h3>
        <div className="flex items-center gap-3">
          <svg className="size-16 overflow-visible shrink-0" viewBox="0 0 100 100">
            {/* Background Arc */}
            <path d="M 15 50 A 35 35 0 0 1 85 50" fill="none" className="stroke-secondary" strokeWidth="8" strokeLinecap="round" />
            {/* Colored Segments */}
            <path d="M 15 50 A 35 35 0 0 1 35 24" fill="none" className="stroke-emerald-500/40" strokeWidth="8" />
            <path d="M 35 24 A 35 35 0 0 1 65 24" fill="none" className="stroke-amber-500/40" strokeWidth="8" />
            <path d="M 65 24 A 35 35 0 0 1 85 50" fill="none" className="stroke-rose-500/40" strokeWidth="8" />
            {/* Center Pivot */}
            <circle cx="50" cy="50" r="4.5" className="fill-foreground" />
            {/* Needle */}
            <path d={activityData.linePath} className="stroke-foreground" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="text-[10px] text-muted-foreground font-semibold">Average Comments</div>
            <div className="text-sm font-bold text-foreground flex items-baseline gap-1">
              <span className="tabular-nums text-lg leading-none">{activityData.avgComments}</span>
              <span className="text-[10px] text-muted-foreground font-normal">/ issue</span>
            </div>
            <div className={`text-[10px] font-bold ${activityData.ratingColor}`}>
              {activityData.rating}
            </div>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground leading-normal italic">
          {activityData.ratingDesc}
        </p>
      </div>
    </div>
  )
}
