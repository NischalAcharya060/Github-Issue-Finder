import axios from "axios"
import type {
  SearchResponse,
  RepoSearchResponse,
  SearchParams,
  GitHubRepo,
} from "./types"

const githubApi = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github.v3+json",
  },
})

// Request interceptor to attach authentication token
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

// Custom retry interceptor for handling server-side network blips or rate limits
githubApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error
    if (!config) return Promise.reject(error)

    config.__retryCount = config.__retryCount || 0
    const maxRetries = 3

    const isNetworkError = !response
    const is5xxServerError = response && response.status >= 500 && response.status <= 599

    if ((isNetworkError || is5xxServerError) && config.__retryCount < maxRetries) {
      config.__retryCount += 1
      const delay = Math.pow(2, config.__retryCount - 1) * 1000 // 1s, 2s, 4s
      await new Promise((resolve) => setTimeout(resolve, delay))
      return axios(config)
    }

    return Promise.reject(error)
  }
)

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
  const { data } = await githubApi.get<GitHubRepo[]>(`/orgs/${org}/repos`, {
    params: { page, per_page: perPage, sort: "updated" },
  })
  return data
}

export { githubApi }

