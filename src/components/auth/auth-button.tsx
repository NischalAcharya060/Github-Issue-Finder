"use client"

import Image from "next/image"
import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"
import { GitBranch, LogOut, Bookmark, BookOpen, CircleUserRound, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AuthButton() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <Button variant="ghost" size="icon-sm" disabled aria-label="Loading account">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </Button>
    )
  }

  if (!session?.user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => signIn("github")}
        className="gap-1.5"
      >
        <GitBranch className="size-3.5" />
        <span className="hidden sm:inline">Sign in</span>
      </Button>
    )
  }

  const user = session.user

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="overflow-hidden rounded-full"
          aria-label="Account menu"
        >
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "Account"}
              width={28}
              height={28}
              className="size-7 rounded-full"
            />
          ) : (
            <CircleUserRound className="size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate font-medium">{user.name ?? "Signed in"}</span>
          {user.githubLogin && (
            <span className="truncate text-xs font-normal text-muted-foreground">
              @{user.githubLogin}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/my-issues" className="cursor-pointer gap-2">
            <Bookmark className="size-4" />
            My Issues
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/my-repos" className="cursor-pointer gap-2">
            <BookOpen className="size-4" />
            My Repos
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="cursor-pointer gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
