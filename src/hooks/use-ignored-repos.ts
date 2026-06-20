"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
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
    onSuccess: (_, repoFullName) => {
      toast.success(`"${repoFullName}" hidden from results`)
    },
    onError: (_err, repoFullName, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["ignored-repos"], ctx.prev)
      toast.error(`Failed to hide "${repoFullName}"`)
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
    onSuccess: (_, repoFullName) => {
      toast.success(`"${repoFullName}" restored to results`)
    },
    onError: (_err, repoFullName, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["ignored-repos"], ctx.prev)
      toast.error(`Failed to restore "${repoFullName}"`)
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
    onSuccess: () => {
      toast.success("All repositories restored to results")
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["ignored-repos"], ctx.prev)
      toast.error("Failed to clear ignored repos")
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
      setLocalIgnored((prev) => {
        if (prev.includes(repoFullName)) return prev
        toast.success(`"${repoFullName}" hidden from results`)
        return [...prev, repoFullName]
      })
    }
  }

  const removeIgnoredRepo = (repoFullName: string) => {
    if (isAuthed) {
      removeMutation.mutate(repoFullName)
    } else {
      setLocalIgnored((prev) => {
        toast.success(`"${repoFullName}" restored to results`)
        return prev.filter((r) => r !== repoFullName)
      })
    }
  }

  const clear = () => {
    if (isAuthed) {
      clearMutation.mutate()
    } else {
      setLocalIgnored([])
      toast.success("All repositories restored to results")
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
