"use client"

import { signIn, useSession } from "next-auth/react"
import { Bookmark, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { ActionToggle } from "@/components/issues/action-toggle"
import {
  useSavedIssuesMap,
  useToggleIssue,
} from "@/hooks/use-saved-issues"
import type { GitHubIssue } from "@/lib/types"

interface IssueActionsProps {
  issue: GitHubIssue
  /**
   * "compact" = icon-only ghost buttons (cards)
   * "full"    = icon + label inline (toolbars)
   * "grid"    = equal-width labeled buttons that fill their container (modal)
   */
  variant?: "compact" | "full" | "grid"
  className?: string
}

export function IssueActions({
  issue,
  variant = "compact",
  className,
}: IssueActionsProps) {
  const { status } = useSession()
  const { map } = useSavedIssuesMap()
  const toggle = useToggleIssue()

  const current = map.get(issue.id)
  const isSaved = current?.saved ?? false
  const isDone = current?.done ?? false

  // Per-action pending: only the button whose flag is in flight shows a spinner.
  const savePending = toggle.isPending && toggle.variables?.saved !== undefined
  const donePending = toggle.isPending && toggle.variables?.done !== undefined

  const requireAuth = (action: () => void) => {
    if (status !== "authenticated") {
      signIn("github")
      return
    }
    action()
  }

  const onSave = () =>
    requireAuth(() => toggle.mutate({ issue, saved: !isSaved }))
  const onDone = () =>
    requireAuth(() => toggle.mutate({ issue, done: !isDone }))

  const grid = variant === "grid"
  const labeled = variant === "full" || grid
  const layout = grid ? "block" : labeled ? "inline" : "icon"

  return (
    <div
      className={cn(
        grid ? "grid grid-cols-2 gap-2" : "flex items-center gap-1",
        className
      )}
    >
      <ActionToggle
        icon={Bookmark}
        active={isSaved}
        onToggle={onSave}
        pending={savePending}
        tone="primary"
        fillWhenActive
        labeled={labeled}
        label={["Save", "Saved"]}
        layout={layout}
        ariaLabel={isSaved ? "Remove bookmark" : "Save issue"}
        title={isSaved ? "Saved" : "Save"}
      />
      <ActionToggle
        icon={Check}
        active={isDone}
        onToggle={onDone}
        pending={donePending}
        tone="emerald"
        labeled={labeled}
        label={["Mark done", "Done"]}
        layout={layout}
        ariaLabel={isDone ? "Mark as not done" : "Mark as done"}
        title={isDone ? "Done" : "Mark done"}
      />
    </div>
  )
}
