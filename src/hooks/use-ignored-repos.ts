"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useMemo } from "react"
import { useLocalStorage } from "./use-local-storage"

async function fetchIgnoredRepos(): Promise<string[]> {
  const res = await fetch("/api/ignored-repos")
  if (!res.ok) throw new Error("Failed to load ignored repos")
  const data = await res.json()
  return data.items as string[]
}

async function addRepoApi(repoFullName: string): Promise<string> {
  const res = await fetch("/api/ignored-repos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoFullName }),
  })
  if (!res.ok) throw new Error("Failed to add ignored repo")
  const data = await res.json()
  return data.item as string
}

async function removeRepoApi(repoFullName: string): Promise<void> {
  const res = await fetch(`/api/ignored-repos?repo=${encodeURIComponent(repoFullName)}`, {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to remove ignored repo")
}

async function clearAllApi(): Promise<void> {
  const res = await fetch("/api/ignored-repos?all=true", {
    method: "DELETE",
  })
  if (!res.ok) throw new Error("Failed to clear ignored repos")
}

export function useIgnoredRepos() {
  const { status } = useSession()
  const isAuthed = status === "authenticated"
  const queryClient = useQueryClient()

  // localStorage fallback for unauthenticated users
  const [localIgnored, setLocalIgnored] = useLocalStorage<string[]>("ignored-repos", [])

  const { data: remoteIgnored } = useQuery({
    queryKey: ["ignored-repos"],
    queryFn: fetchIgnoredRepos,
    enabled: isAuthed,
    staleTime: 60_000,
  })

  const ignoredRepos = isAuthed ? (remoteIgnored ?? []) : localIgnored

  const addMutation = useMutation({
    mutationFn: addRepoApi,
    onMutate: async (repoFullName) => {
      await queryClient.cancelQueries({ queryKey: ["ignored-repos"] })
      const prev = queryClient.getQueryData<string[]>(["ignored-repos"])
      queryClient.setQueryData<string[]>(["ignored-repos"], (old) =>
        old ? [...old, repoFullName] : [repoFullName]
      )
      return { prev }
    },
    onError: (_err, _repo, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["ignored-repos"], ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["ignored-repos"] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: removeRepoApi,
    onMutate: async (repoFullName) => {
      await queryClient.cancelQueries({ queryKey: ["ignored-repos"] })
      const prev = queryClient.getQueryData<string[]>(["ignored-repos"])
      queryClient.setQueryData<string[]>(["ignored-repos"], (old) =>
        old ? old.filter((r) => r !== repoFullName) : []
      )
      return { prev }
    },
    onError: (_err, _repo, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["ignored-repos"], ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["ignored-repos"] })
    },
  })

  const clearMutation = useMutation({
    mutationFn: clearAllApi,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["ignored-repos"] })
      const prev = queryClient.getQueryData<string[]>(["ignored-repos"])
      queryClient.setQueryData<string[]>(["ignored-repos"], [])
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["ignored-repos"], ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["ignored-repos"] })
    },
  })

  const isIgnored = (repoFullName: string): boolean => {
    return ignoredRepos.includes(repoFullName)
  }

  const addIgnoredRepo = (repoFullName: string) => {
    if (isAuthed) {
      addMutation.mutate(repoFullName)
    } else {
      setLocalIgnored((prev) =>
        prev.includes(repoFullName) ? prev : [...prev, repoFullName]
      )
    }
  }

  const removeIgnoredRepo = (repoFullName: string) => {
    if (isAuthed) {
      removeMutation.mutate(repoFullName)
    } else {
      setLocalIgnored((prev) => prev.filter((r) => r !== repoFullName))
    }
  }

  const clear = () => {
    if (isAuthed) {
      clearMutation.mutate()
    } else {
      setLocalIgnored([])
    }
  }

  return {
    ignoredRepos,
    addIgnoredRepo,
    removeIgnoredRepo,
    isIgnored,
    clear,
  }
}
