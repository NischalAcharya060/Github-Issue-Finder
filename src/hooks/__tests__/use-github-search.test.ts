import { buildQuery, getSortParams } from "@/hooks/use-github-search"
import type { FilterState } from "@/lib/types"

const baseFilters: FilterState = {
  language: "all",
  labels: [],
  state: "all",
  createdFrom: "",
  createdTo: "",
  updatedFrom: "",
  updatedTo: "",
  minStars: "",
  maxStars: "",
  beginnerFriendly: false,
  goodFirstIssue: false,
  helpWanted: false,
}

describe("getSortParams", () => {
  it("returns correct sort/order for created-desc", () => {
    expect(getSortParams("created-desc")).toEqual({ sort: "created", order: "desc" })
  })

  it("returns correct sort/order for created-asc", () => {
    expect(getSortParams("created-asc")).toEqual({ sort: "created", order: "asc" })
  })

  it("returns correct sort/order for comments-desc", () => {
    expect(getSortParams("comments-desc")).toEqual({ sort: "comments", order: "desc" })
  })

  it("returns correct sort/order for reactions-desc", () => {
    expect(getSortParams("reactions-desc")).toEqual({ sort: "reactions-+1", order: "desc" })
  })

  it("returns correct sort/order for stars-desc", () => {
    expect(getSortParams("stars-desc")).toEqual({ sort: "stars", order: "desc" })
  })

  it("returns undefined for relevance", () => {
    expect(getSortParams("relevance")).toEqual({ sort: undefined, order: undefined })
  })
})

describe("buildQuery", () => {
  it("returns keyword as-is in keyword mode", () => {
    const result = buildQuery("react", "keyword", baseFilters, "issues")
    expect(result).toContain("react")
    expect(result).toContain("is:issue")
  })

  it("uses org: prefix in org mode", () => {
    const result = buildQuery("vercel", "org", baseFilters, "issues")
    expect(result).toContain("org:vercel")
  })

  it("adds labels when provided", () => {
    const result = buildQuery("react", "keyword", { ...baseFilters, labels: ["bug", "good first issue"] }, "issues")
    expect(result).toContain('label:"bug"')
    expect(result).toContain('label:"good first issue"')
  })

  it("adds state filter", () => {
    const result = buildQuery("react", "keyword", { ...baseFilters, state: "open" }, "issues")
    expect(result).toContain("state:open")
  })

  it("adds created date range", () => {
    const result = buildQuery("react", "keyword", { ...baseFilters, createdFrom: "2024-01-01", createdTo: "2024-12-31" }, "issues")
    expect(result).toContain("created:2024-01-01..2024-12-31")
  })

  it("adds updated date range", () => {
    const result = buildQuery("react", "keyword", { ...baseFilters, updatedFrom: "2024-01-01" }, "issues")
    expect(result).toContain("updated:2024-01-01..*")
  })

  it("adds helpWanted label", () => {
    const result = buildQuery("react", "keyword", { ...baseFilters, helpWanted: true }, "issues")
    expect(result).toContain('label:"help wanted"')
  })

  it("adds language filter for issues", () => {
    const result = buildQuery("react", "keyword", { ...baseFilters, language: "TypeScript" }, "issues")
    expect(result).toContain("language:TypeScript")
  })

  it("adds minStars", () => {
    const result = buildQuery("react", "keyword", { ...baseFilters, minStars: "100" }, "issues")
    expect(result).toContain("stars:>=100")
  })

  it("skips issue-specific filters for repos", () => {
    const result = buildQuery("react", "keyword", { ...baseFilters, state: "open", labels: ["bug"] }, "repositories")
    expect(result).not.toContain("is:issue")
    expect(result).not.toContain("state:")
    expect(result).not.toContain('label:"bug"')
  })
})
