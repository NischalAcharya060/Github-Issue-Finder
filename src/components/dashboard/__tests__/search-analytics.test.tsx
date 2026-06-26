import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { SearchAnalytics } from "@/components/dashboard/search-analytics"
import type { GitHubIssue } from "@/lib/types"

const mockIssue = (overrides: Partial<GitHubIssue> = {}): GitHubIssue => ({
  id: 1,
  number: 42,
  title: "Test issue",
  body: "Body text",
  state: "open",
  html_url: "https://github.com/owner/repo/issues/42",
  repository_url: "https://api.github.com/repos/owner/repo",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  closed_at: null,
  comments: 3,
  score: 0.9,
  user: { login: "user1", id: 1, avatar_url: "", html_url: "" },
  labels: [{ id: 1, name: "bug", color: "d73a4a", description: null }],
  ...overrides,
})

describe("SearchAnalytics", () => {
  it("returns null when issues array is empty", () => {
    const { container } = render(<SearchAnalytics issues={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it("renders all four chart sections", () => {
    const issues = [
      mockIssue({ id: 1, repository_url: "https://api.github.com/repos/owner/repo-a" }),
      mockIssue({ id: 2, repository_url: "https://api.github.com/repos/owner/repo-b" }),
    ]
    render(<SearchAnalytics issues={issues} />)

    expect(screen.getByText("Repository Share")).toBeInTheDocument()
    expect(screen.getByText("Common Labels")).toBeInTheDocument()
    expect(screen.getByText("Issue Age Distribution")).toBeInTheDocument()
    expect(screen.getByText("Activity & Competition")).toBeInTheDocument()
  })

  it("shows repo names in distribution", () => {
    const issues = [
      mockIssue({ repository_url: "https://api.github.com/repos/owner/repo-a" }),
      mockIssue({ repository_url: "https://api.github.com/repos/owner/repo-b" }),
    ]
    render(<SearchAnalytics issues={issues} />)
    expect(screen.getByText("owner/repo-a")).toBeInTheDocument()
    expect(screen.getByText("owner/repo-b")).toBeInTheDocument()
  })

  it("shows label names in common labels", () => {
    const issues = [mockIssue()]
    render(<SearchAnalytics issues={issues} />)
    expect(screen.getByText("bug")).toBeInTheDocument()
  })
})
