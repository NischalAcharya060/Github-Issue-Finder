"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useMemo } from "react"
import type { GitHubRepo, SavedRepo } from "@/lib/types"

async function fetchSavedRepos(): Promise<SavedRepo[]> {
  const res = await fetch("/api/saved-repos")
  if (!res.ok) throw new Error("Failed to load saved repos")
  const data = await res.json()
  return data.items as SavedRepo[]
}

export function useSavedRepos() {
  const { status } = useSession()
  return useQuery({
    queryKey: ["saved-repos"],
    queryFn: fetchSavedRepos,
    enabled: status === "authenticated",
  })
}

export function useSavedReposMap() {
  const { data, ...rest } = useSavedRepos()
  const map = useMemo(() => {
    const m = new Map<string, SavedRepo>()
    data?.forEach((item) => m.set(item.repoFullName, item))
    return m
  }, [data])
  return { map, ...rest }
}

function repoSavedSnapshot(repo: GitHubRepo) {
  const [owner, name] = repo.full_name.split("/")
  return {
    repoFullName: repo.full_name,
    name,
    owner,
    htmlUrl: repo.html_url,
    description: repo.description,
    language: repo.language,
    stargazersCount: repo.stargazers_count,
    forksCount: repo.forks_count ?? 0,
  }
}

export function useToggleSaveRepo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (vars: { repo: GitHubRepo; saved: boolean }) => {
      if (vars.saved) {
        const res = await fetch("/api/saved-repos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(repoSavedSnapshot(vars.repo)),
        })
        if (!res.ok) throw new Error("Failed to save repo")
        return (await res.json()).item as SavedRepo
      } else {
        const res = await fetch(
          `/api/saved-repos/${encodeURIComponent(vars.repo.full_name)}`,
          { method: "DELETE" }
        )
        if (!res.ok) throw new Error("Failed to unsave repo")
        return null
      }
    },
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ["saved-repos"] })
      const prev = queryClient.getQueryData<SavedRepo[]>(["saved-repos"])
      queryClient.setQueryData<SavedRepo[]>(["saved-repos"], (old) => {
        const list = old ? [...old] : []
        if (vars.saved) {
          const snap = repoSavedSnapshot(vars.repo)
          list.unshift({
            id: `optimistic-${vars.repo.full_name}`,
            ...snap,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        } else {
          return list.filter((r) => r.repoFullName !== vars.repo.full_name)
        }
        return list
      })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev)
        queryClient.setQueryData(["saved-repos"], ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-repos"] })
    },
  })
}
