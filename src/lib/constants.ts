export const LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "Go",
  "Rust",
  "C++",
  "C",
  "C#",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "Scala",
  "Elixir",
  "Clojure",
  "Haskell",
  "Lua",
  "Dart",
  "Shell",
] as const

export const SORT_OPTIONS = [
  { value: "created-desc", label: "Most Recent" },
  { value: "comments-desc", label: "Most Commented" },
  { value: "reactions-desc", label: "Most Reactions" },
  { value: "stars-desc", label: "Repository Stars" },
  { value: "created-asc", label: "Least Competition" },
] as const

export const ISSUE_STATES = [
  { value: "", label: "All States" },
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
] as const

export const CURRENT_YEAR = new Date().getFullYear()

export const YEARS = Array.from(
  { length: CURRENT_YEAR - 2014 + 1 },
  (_, i) => String(CURRENT_YEAR - i)
)

export const SEARCH_MODES = [
  { value: "keyword", label: "Keyword" },
  { value: "repo", label: "Repository" },
  { value: "org", label: "Organization" },
] as const

export const DEFAULT_PER_PAGE = 30
