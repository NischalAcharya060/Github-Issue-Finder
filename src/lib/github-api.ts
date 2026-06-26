import axios from "axios"
import type {
  SearchResponse,
  RepoSearchResponse,
  SearchParams,
  GitHubRepo,
  GitHubIssue,
} from "./types"

const githubApi = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github.v3+json",
  },
})

githubApi.interceptors.request.use((config) => {
  let token = null
  if (typeof window !== "undefined") {
    token = localStorage.getItem("github-token")
  }
  if (!token) {
    token = process.env.NEXT_PUBLIC_GITHUB_TOKEN
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function searchIssues(
  params: SearchParams
): Promise<SearchResponse> {
  const headers: Record<string, string> = {}
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("github-token")
    if (token) {
      headers["X-Github-Token"] = token
    }
  }

  const { data } = await axios.get<SearchResponse>("/api/search/issues", {
    params,
    headers,
  })
  return data
}

export async function searchRepositories(
  params: SearchParams
): Promise<RepoSearchResponse> {
  const headers: Record<string, string> = {}
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("github-token")
    if (token) {
      headers["X-Github-Token"] = token
    }
  }

  const { data } = await axios.get<RepoSearchResponse>("/api/search/repos", {
    params,
    headers,
  })
  return data
}

export async function getOrganizationRepos(
  org: string,
  page = 1,
  perPage = 30
): Promise<GitHubRepo[]> {
  const headers: Record<string, string> = {}
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("github-token")
    if (token) {
      headers["X-Github-Token"] = token
    }
  }

  const { data } = await axios.get<GitHubRepo[]>(`/api/search/orgs/${org}`, {
    params: { page, per_page: perPage },
    headers,
  })
  return data
}

export async function getRepoIssues(
  owner: string,
  repo: string,
  page = 1,
  perPage = 30
): Promise<GitHubIssue[]> {
  const { data } = await githubApi.get<GitHubIssue[]>(
    `/repos/${owner}/${repo}/issues`,
    {
      params: { state: "open", page, per_page: perPage, sort: "created" },
    }
  )
  return data
}

export { githubApi }

