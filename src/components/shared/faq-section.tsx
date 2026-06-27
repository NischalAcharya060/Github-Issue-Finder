import { JsonLd } from "@/components/shared/json-ld"

const faqs = [
  {
    question: "What is a good first issue?",
    answer:
      "A good first issue is a GitHub issue labeled by maintainers as beginner-friendly. These issues are typically well-documented, have clear scope, and are ideal for new contributors looking to make their first open-source pull request.",
  },
  {
    question: "How do I find beginner-friendly GitHub issues?",
    answer:
      "Use Issue Finder to search for labels like 'good first issue', 'help wanted', or 'beginner friendly'. You can filter by language, repository, and difficulty level to find issues that match your skills and interests.",
  },
  {
    question: "Can I search issues by programming language?",
    answer:
      "Yes. Issue Finder lets you filter issues by any programming language including Python, TypeScript, Rust, Go, JavaScript, and more. You can also combine language filters with labels and other criteria for precise results.",
  },
  {
    question: "How do I save issues to track my contributions?",
    answer:
      "Sign in with GitHub and click the bookmark icon on any issue to save it. Your saved issues appear under My Issues, where you can organize them into a Kanban board, mark them as done, and track your open-source contribution history.",
  },
  {
    question: "Does Issue Finder support organization-wide searches?",
    answer:
      "Yes. You can search for issues across specific GitHub organizations like Vercel, Facebook, Microsoft, or Google, making it easy to find contribution opportunities within the projects and communities you care about.",
  },
  {
    question: "How often is issue data updated?",
    answer:
      "Issue Finder queries the GitHub API in real time, so you always see the latest open issues. Search results reflect the current state of public repositories on GitHub as of your search moment.",
  },
  {
    question: "What makes Issue Finder different from searching GitHub directly?",
    answer:
      "Issue Finder provides a purpose-built interface with advanced filters, sorting by popularity or difficulty, a For You feed with personalized recommendations, and a contribution tracking system that GitHub's native search doesn't offer.",
  },
]

export function FaqSection() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:py-20">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }}
      />
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Frequently asked questions
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Everything you need to know about finding and contributing to open-source issues.
        </p>
      </div>
      <div className="space-y-4">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-2xl border border-border/70 bg-card/50 p-5 transition-colors open:border-primary/30 open:bg-card/80"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold leading-relaxed text-foreground [&::-webkit-details-marker]:hidden">
              {faq.question}
              <span className="size-5 shrink-0 rounded-full bg-muted flex items-center justify-center transition-transform group-open:rotate-180">
                <svg
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                >
                  <path d="M1 1l4 4 4-4" />
                </svg>
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {faq.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
