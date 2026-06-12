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

githubApi.interceptors.request.use((config) => {
  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export async function searchIssues(
  params: SearchParams
): Promise<SearchResponse> {
  const { data } = await githubApi.get<SearchResponse>("/search/issues", {
    params,
  })
  return data
}

export async function searchRepositories(
  params: SearchParams
): Promise<RepoSearchResponse> {
  const { data } = await githubApi.get<RepoSearchResponse>(
    "/search/repositories",
    { params }
  )
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
