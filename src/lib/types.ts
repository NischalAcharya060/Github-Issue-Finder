export interface GitHubUser {
  login: string
  id: number
  avatar_url: string
  html_url: string
}

export interface GitHubLabel {
  id: number
  name: string
  color: string
  description: string | null
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  stargazers_count: number
  forks_count: number
  language: string | null
  owner: GitHubUser
}

export interface GitHubIssue {
  id: number
  number: number
  title: string
  body: string | null
  state: "open" | "closed"
  html_url: string
  repository_url: string
  created_at: string
  updated_at: string
  closed_at: string | null
  comments: number
  score: number
  user: GitHubUser
  labels: GitHubLabel[]
  reactions?: {
    "+1": number
    "-1": number
    laugh: number
    hooray: number
    confused: number
    heart: number
    rocket: number
    eyes: number
    total_count: number
  }
  repository?: GitHubRepo
  pull_request?: unknown
}

export interface SearchResponse {
  total_count: number
  incomplete_results: boolean
  items: GitHubIssue[]
}

export interface RepoSearchResponse {
  total_count: number
  incomplete_results: boolean
  items: GitHubRepo[]
}

export interface SearchParams {
  q: string
  sort?: string
  order?: "desc" | "asc"
  per_page?: number
  page?: number
}

export type EntityType = "issues" | "repositories" | "foryou" | "organizations"

export type SortOption =
  | "relevance"
  | "created-desc"
  | "created-asc"
  | "comments-desc"
  | "reactions-desc"
  | "stars-desc"

export interface FilterState {
  language: string
  labels: string[]
  state: "all" | "open" | "closed"
  createdYear: string
  updatedYear: string
  minStars: string
  maxStars: string
  beginnerFriendly: boolean
  goodFirstIssue: boolean
  helpWanted: boolean
}

export type SearchMode = "keyword" | "repo" | "org"

export interface SavedIssue {
  id: string
  issueId: number
  number: number
  title: string
  htmlUrl: string
  repoFullName: string
  state: string
  labels: { name: string; color: string }[] | null
  saved: boolean
  done: boolean
  doneAt: string | null
  note: string | null
  status: string
  prUrl: string | null
  createdAt: string
  updatedAt: string
}
