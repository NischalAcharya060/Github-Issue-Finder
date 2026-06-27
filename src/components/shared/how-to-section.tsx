import { JsonLd } from "@/components/shared/json-ld"
import { Search, SlidersHorizontal, Sparkles, ArrowUpDown, Eye, Bookmark } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "Search for issues",
    description:
      "Type a keyword, repository name, or GitHub organization into the search bar. Issue Finder queries the GitHub API in real time across millions of public repositories.",
  },
  {
    icon: SlidersHorizontal,
    title: "Apply filters",
    description:
      "Narrow results by programming language, labels, issue state (open/closed), date range, and star count. Toggle beginner-friendly, good first issue, or help wanted labels.",
  },
  {
    icon: ArrowUpDown,
    title: "Sort by priority",
    description:
      "Sort results by newest created, most commented, most reactions, or repository stars. The least competition sort surfaces issues with fewest concurrent contributors.",
  },
  {
    icon: Eye,
    title: "Preview & evaluate",
    description:
      "Click any issue to open a detail modal with the full description, labels, reactions, and a direct link to GitHub. Check if the issue matches your skills before committing.",
  },
  {
    icon: Bookmark,
    title: "Save and track",
    description:
      "Sign in with GitHub to bookmark issues, organize them on a Kanban board, and mark them as done. Track your open-source contribution history across sessions.",
  },
]

export function HowToSection() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:py-20">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "How to find open-source issues to contribute to",
          description:
            "A step-by-step guide to discovering GitHub issues worth contributing to using Issue Finder's search and filtering tools.",
          step: steps.map((step, i) => ({
            "@type": "HowToStep",
            position: i + 1,
            name: step.title,
            text: step.description,
          })),
          totalTime: "PT1M",
          tool: {
            "@type": "HowToTool",
            name: "Issue Finder",
          },
        }}
      />
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          How to find open-source issues to contribute to
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Five simple steps to discover your next contribution opportunity.
        </p>
      </div>
      <div className="space-y-4">
        {steps.map((step, i) => {
          const Icon = step.icon
          return (
            <div
              key={step.title}
              className="relative flex gap-5 rounded-2xl border border-border/70 bg-card/50 p-5 transition-colors hover:border-primary/20"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/20">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <Icon className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold">{step.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
