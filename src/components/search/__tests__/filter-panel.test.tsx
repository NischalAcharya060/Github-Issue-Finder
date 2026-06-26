import "@testing-library/jest-dom"
import { render, screen } from "@testing-library/react"
import { FilterPanel } from "@/components/search/filter-panel"
import type { FilterState } from "@/lib/types"

const defaultFilters: FilterState = {
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

describe("FilterPanel", () => {
  it("renders filter sections", () => {
    render(<FilterPanel filters={defaultFilters} onChange={() => {}} />)
    expect(screen.getByText("Filters")).toBeInTheDocument()
    expect(screen.getByText("Issue")).toBeInTheDocument()
    expect(screen.getByText("Time")).toBeInTheDocument()
    expect(screen.getByText("Stars")).toBeInTheDocument()
    expect(screen.getByText("Labels")).toBeInTheDocument()
  })

  it("shows active filter count badge", () => {
    const busyFilters: FilterState = { ...defaultFilters, language: "TypeScript", minStars: "100" }
    render(<FilterPanel filters={busyFilters} onChange={() => {}} />)
    expect(screen.getByText("2")).toBeInTheDocument()
  })

  it("shows Reset button when filters are dirty", () => {
    const dirtyFilters: FilterState = { ...defaultFilters, state: "open" }
    render(<FilterPanel filters={dirtyFilters} onChange={() => {}} />)
    expect(screen.getByText("Reset")).toBeInTheDocument()
  })

  it("hides Reset button when filters are default", () => {
    render(<FilterPanel filters={defaultFilters} onChange={() => {}} />)
    expect(screen.queryByText("Reset")).not.toBeInTheDocument()
  })

  it("shows label badges when labels are present", () => {
    const filters: FilterState = { ...defaultFilters, labels: ["bug", "enhancement"] }
    render(<FilterPanel filters={filters} onChange={() => {}} />)
    expect(screen.getByText("bug")).toBeInTheDocument()
    expect(screen.getByText("enhancement")).toBeInTheDocument()
  })

  it("renders checkbox labels for issue types", () => {
    render(<FilterPanel filters={defaultFilters} onChange={() => {}} />)
    expect(screen.getByText("Beginner friendly")).toBeInTheDocument()
    expect(screen.getByText("Good first issue")).toBeInTheDocument()
    expect(screen.getByText("Help wanted")).toBeInTheDocument()
  })
})
