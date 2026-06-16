"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useMemo } from "react"
import type { GitHubIssue, SavedIssue } from "@/lib/types"

type Filter = "all" | "saved" | "done"

async function fetchSavedIssues(filter: Filter): Promise<SavedIssue[]> {
  const res = await fetch(`/api/saved-issues?filter=${filter}`)
  if (!res.ok) throw new Error("Failed to load saved issues")
  const data = await res.json()
  return data.items as SavedIssue[]
}

/** List of the current user's saved issues for a given filter. */
export function useSavedIssues(filter: Filter = "all") {
  const { status } = useSession()
  return useQuery({
    queryKey: ["saved-issues", filter],
    queryFn: () => fetchSavedIssues(filter),
    enabled: status === "authenticated",
  })
}

/** Map of issueId -> SavedIssue, for quick lookup in cards/buttons. */
export function useSavedIssuesMap() {
  const { data, ...rest } = useSavedIssues("all")
  const map = useMemo(() => {
    const m = new Map<number, SavedIssue>()
    data?.forEach((item) => m.set(item.issueId, item))
    return m
  }, [data])
  return { map, ...rest }
}

function issueSnapshot(issue: GitHubIssue) {
  return {
    issueId: issue.id,
    number: issue.number,
    title: issue.title,
    htmlUrl: issue.html_url,
    repoFullName: issue.repository_url.replace(
      "https://api.github.com/repos/",
      ""
    ),
    state: issue.state,
    labels: issue.labels.map((l) => ({ name: l.name, color: l.color })),
  }
}

/** Toggle saved/done flags for a GitHub issue (optimistic). */
export function useToggleIssue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (vars: {
      issue: GitHubIssue
      saved?: boolean
      done?: boolean
      status?: string
      prUrl?: string | null
    }) => {
      const res = await fetch("/api/saved-issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...issueSnapshot(vars.issue),
          ...(vars.saved !== undefined && { saved: vars.saved }),
          ...(vars.done !== undefined && { done: vars.done }),
          ...(vars.status !== undefined && { status: vars.status }),
          ...(vars.prUrl !== undefined && { prUrl: vars.prUrl }),
        }),
      })
      if (!res.ok) throw new Error("Failed to update issue")
      return (await res.json()).item as SavedIssue
    },
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ["saved-issues", "all"] })
      const prev = queryClient.getQueryData<SavedIssue[]>(["saved-issues", "all"])
      queryClient.setQueryData<SavedIssue[]>(["saved-issues", "all"], (old) => {
        const list = old ? [...old] : []
        const idx = list.findIndex((i) => i.issueId === vars.issue.id)
        const snap = issueSnapshot(vars.issue)

        let expectedStatus = vars.status
        let expectedDone = vars.done
        let expectedSaved = vars.saved

        if (expectedStatus !== undefined) {
          expectedDone = expectedStatus === "DONE"
          expectedSaved = true
        } else if (expectedDone !== undefined) {
          expectedStatus = expectedDone ? "DONE" : "BACKLOG"
          expectedSaved = true
        } else if (expectedSaved !== undefined) {
          if (expectedSaved === false) {
            expectedStatus = "BACKLOG"
            expectedDone = false
          }
        }

        if (idx >= 0) {
          list[idx] = {
            ...list[idx],
            ...(expectedSaved !== undefined && { saved: expectedSaved }),
            ...(expectedDone !== undefined && {
              done: expectedDone,
              doneAt: expectedDone ? new Date().toISOString() : null,
            }),
            ...(expectedStatus !== undefined && { status: expectedStatus }),
            ...(vars.prUrl !== undefined && { prUrl: vars.prUrl }),
          }
        } else {
          list.unshift({
            id: `optimistic-${vars.issue.id}`,
            ...snap,
            saved: expectedSaved ?? true,
            done: expectedDone ?? false,
            doneAt: expectedDone ? new Date().toISOString() : null,
            note: null,
            status: expectedStatus ?? "BACKLOG",
            prUrl: vars.prUrl ?? null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        }
        return list
      })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["saved-issues", "all"], ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-issues"] })
    },
  })
}

/** Patch flags/note on an already-saved issue by issueId (optimistic). */
export function usePatchSavedIssue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (vars: {
      issueId: number
      saved?: boolean
      done?: boolean
      note?: string | null
      status?: string
      prUrl?: string | null
    }) => {
      const { issueId, ...body } = vars
      const res = await fetch(`/api/saved-issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error("Failed to update issue")
      return (await res.json()).item as SavedIssue
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-issues"] })
    },
  })
}

/** Remove a saved issue entirely. */
export function useRemoveSavedIssue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (issueId: number) => {
      const res = await fetch(`/api/saved-issues/${issueId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to remove issue")
      return issueId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-issues"] })
    },
  })
}
