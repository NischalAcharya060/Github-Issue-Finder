"use client"

import { useQuery } from "@tanstack/react-query"
import { searchIssues, searchRepositories } from "@/lib/github-api"
import type {
  SearchParams,
  FilterState,
  SearchMode,
  SortOption,
  EntityType,
  SearchResponse,
  RepoSearchResponse,
} from "@/lib/types"

function buildQuery(
  keyword: string,
  mode: SearchMode,
  filters: FilterState,
  entityType: EntityType
): string {
  const parts: string[] = []

  if (keyword.trim()) {
    if (mode === "repo") {
      parts.push(`repo:${keyword}`)
    } else if (mode === "org") {
      parts.push(`org:${keyword}`)
    } else {
      parts.push(keyword)
    }
  }

  if (entityType === "issues") {
    parts.push("is:issue")
    if (filters.labels.length > 0) {
      filters.labels.forEach((label) => {
        parts.push(`label:"${label}"`)
      })
    }

    if (filters.state && filters.state !== "all") {
      parts.push(`state:${filters.state}`)
    }

    if (filters.createdFrom || filters.createdTo) {
      const from = filters.createdFrom || "*"
      const to = filters.createdTo || "*"
      parts.push(`created:${from}..${to}`)
    }

    if (filters.updatedFrom || filters.updatedTo) {
      const from = filters.updatedFrom || "*"
      const to = filters.updatedTo || "*"
      parts.push(`updated:${from}..${to}`)
    }

    if (filters.helpWanted) {
      parts.push('label:"help wanted"')
    }

    if (filters.goodFirstIssue) {
      parts.push('label:"good first issue"')
    }

    if (filters.beginnerFriendly) {
      parts.push("label:beginner")
    }
  }

  if (entityType === "issues" || entityType === "repositories") {
    if (filters.language && filters.language !== "all") {
      parts.push(`language:${filters.language}`)
    }

    if (filters.minStars) {
      parts.push(`stars:>=${filters.minStars}`)
    }

    if (filters.maxStars) {
      parts.push(`stars:<=${filters.maxStars}`)
    }
  }

  return parts.join(" ")
}

function getSortParams(sort: SortOption): Pick<SearchParams, "sort" | "order"> {
  switch (sort) {
    case "created-desc":
      return { sort: "created", order: "desc" }
    case "created-asc":
      return { sort: "created", order: "asc" }
    case "comments-desc":
      return { sort: "comments", order: "desc" }
    case "reactions-desc":
      return { sort: "reactions-+1", order: "desc" }
    case "stars-desc":
      return { sort: "stars", order: "desc" }
    default:
      return { sort: undefined, order: undefined }
  }
}

export function useGithubSearch(
  keyword: string,
  mode: SearchMode,
  entityType: EntityType,
  filters: FilterState,
  sort: SortOption,
  page: number
) {
  const q = buildQuery(keyword, mode, filters, entityType)
  const { sort: sortField, order } = getSortParams(sort)

  const fetchFn = entityType === "repositories"
    ? () =>
        searchRepositories({
          q,
          sort: sortField,
          order,
          page,
          per_page: 30,
        })
    : () =>
        searchIssues({
          q,
          sort: sortField,
          order,
          page,
          per_page: 30,
        })

  return useQuery<SearchResponse | RepoSearchResponse>({
    queryKey: ["github-search", entityType, q, sortField, order, page],
    queryFn: fetchFn,
    enabled: q.length > 0 && entityType !== "foryou" && entityType !== "trending",
    staleTime: 60_000,
  })
}
