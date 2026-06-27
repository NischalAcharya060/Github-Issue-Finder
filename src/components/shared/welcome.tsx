"use client"

import { motion, useReducedMotion } from "framer-motion"
import {
  GitBranch,
  Search,
  SlidersHorizontal,
  Sparkles,
  GitFork,
  Code2,
} from "lucide-react"
import { FadeInUp, Stagger, StaggerItem } from "@/components/motion/motion-primitives"

const suggestions = [
  { label: "good first issue", query: "good first issue" },
  { label: "help wanted", query: "help wanted" },
  { label: "beginner friendly", query: "beginner" },
  { label: "bug", query: "bug" },
  { label: "hacktoberfest", query: "hacktoberfest" },
]

const quickLanguages = [
  { label: "Python", query: "language:python" },
  { label: "TypeScript", query: "language:typescript" },
  { label: "Rust", query: "language:rust" },
  { label: "Go", query: "language:go" },
  { label: "JavaScript", query: "language:javascript" },
]

const popularOrgs = [
  { label: "vercel", query: "org:vercel" },
  { label: "facebook", query: "org:facebook" },
  { label: "microsoft", query: "org:microsoft" },
  { label: "google", query: "org:google" },
]

const features = [
  {
    icon: Search,
    title: "Search anything",
    caption: "Query issues by keyword, repository, or organization in seconds.",
  },
  {
    icon: SlidersHorizontal,
    title: "Powerful filters",
    caption: "Narrow by language, labels, stars, and date to find the perfect fit.",
  },
  {
    icon: Sparkles,
    title: "Hidden gems",
    caption: "Surface beginner-friendly and high-impact opportunities to contribute.",
  },
]

interface WelcomeProps {
  onSearch: (query: string) => void
}

function ChipGroup({
  title,
  items,
  icon: Icon,
  onSearch,
}: {
  title: string
  items: { label: string; query: string }[]
  icon: typeof Search
  onSearch: (query: string) => void
}) {
  return (
    <div>
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {title}
      </div>
      <Stagger
        stagger={0.04}
        className="flex flex-wrap justify-center gap-2"
      >
        {items.map((item) => (
          <StaggerItem key={item.query}>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              onClick={() => onSearch(item.query)}
              className="group inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-primary/40 hover:bg-primary/8 hover:text-primary"
            >
              <Icon className="size-3 transition-transform group-hover:scale-110" />
              {item.label}
            </motion.button>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  )
}

export function Welcome({ onSearch }: WelcomeProps) {
  const reduce = useReducedMotion()

  return (
    <div className="flex flex-col items-center justify-center px-2 py-12 text-center sm:py-16">
      {/* Hero mark */}
      <FadeInUp className="relative mb-8">
        <motion.div
          aria-hidden
          className="absolute inset-0 rounded-full bg-primary/20 blur-2xl"
          animate={reduce ? undefined : { scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative flex size-18 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary/55 shadow-xl shadow-primary/25 ring-1 ring-white/15">
          <GitBranch className="size-9 text-primary-foreground" />
        </div>
      </FadeInUp>

      <FadeInUp delay={0.08}>
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-sm">
          <Sparkles className="size-3 text-primary" />
          Explore millions of open-source issues
        </div>
      </FadeInUp>

      <FadeInUp delay={0.1}>
        <div className="mb-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">200M+</span> issues indexed
          <span className="font-semibold text-foreground">5K+</span> contributors
          <span className="font-semibold text-foreground">100%</span> free & open
        </div>
      </FadeInUp>

      <FadeInUp delay={0.14}>
        <h1 className="mb-4 max-w-2xl text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Find issues worth{" "}
          <span className="text-gradient">contributing to</span>
        </h1>
      </FadeInUp>

      <FadeInUp delay={0.17}>
        <p
          data-speakable
          className="mx-auto mb-6 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base"
        >
          Issue Finder is a search tool that helps open-source contributors discover GitHub issues
          matching their skills. Search millions of issues by keyword, filter by language and
          labels, sort by popularity, and save opportunities to track your contributions.
        </p>
      </FadeInUp>

      <FadeInUp delay={0.2}>
        <p className="mb-10 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          Search across every public repository on GitHub. Use the search bar
          above, or jump in with one of these:
        </p>
      </FadeInUp>

      <FadeInUp delay={0.26} className="w-full max-w-2xl space-y-7">
        <ChipGroup
          title="Quick suggestions"
          items={suggestions}
          icon={Search}
          onSearch={onSearch}
        />
        <ChipGroup
          title="Top languages"
          items={quickLanguages}
          icon={Code2}
          onSearch={onSearch}
        />
        <ChipGroup
          title="Popular organizations"
          items={popularOrgs}
          icon={GitFork}
          onSearch={onSearch}
        />
      </FadeInUp>

      {/* Feature cards */}
      <FadeInUp
        delay={0.34}
        className="mt-14 grid w-full max-w-3xl gap-4 sm:grid-cols-3"
      >
        {features.map((f) => {
          const Icon = f.icon
          return (
            <div
              key={f.title}
              className="rounded-2xl border border-border/70 bg-card/60 p-5 text-left shadow-sm backdrop-blur-sm transition-colors hover:border-primary/30"
            >
              <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                <Icon className="size-4.5 text-primary" />
              </div>
              <div className="mb-1 text-sm font-semibold">{f.title}</div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {f.caption}
              </p>
            </div>
          )
        })}
      </FadeInUp>
    </div>
  )
}
