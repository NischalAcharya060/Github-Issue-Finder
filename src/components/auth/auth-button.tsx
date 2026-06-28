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
          className="overflow-hidden rounded-full ring-2 ring-primary/20 hover:ring-primary/60 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shrink-0"
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
            <CircleUserRound className="size-5 text-muted-foreground" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 rounded-2xl border border-border/75 bg-popover/95 p-1.5 shadow-lg backdrop-blur-md transition-all animate-in fade-in-50 zoom-in-95">
        <div className="flex items-center gap-2.5 p-2.5">
          {user.image && (
            <Image
              src={user.image}
              alt={user.name ?? "User"}
              width={36}
              height={36}
              className="size-9 rounded-full ring-2 ring-primary/20 shrink-0"
            />
          )}
          <div className="flex flex-col min-w-0">
            <span className="truncate text-xs font-bold text-foreground leading-snug">
              {user.name ?? "Signed in"}
            </span>
            {user.githubLogin && (
              <span className="truncate text-[10px] text-muted-foreground leading-normal">
                @{user.githubLogin}
              </span>
            )}
          </div>
        </div>
        <DropdownMenuSeparator className="my-1 bg-border/40" />
        <DropdownMenuItem asChild className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer transition-colors focus:bg-secondary/70 focus:text-foreground">
          <Link href="/my-issues" className="gap-2.5">
            <Bookmark className="size-4 text-muted-foreground/80 group-hover:text-primary" />
            My Issues
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-xl px-2.5 py-2 text-xs font-medium cursor-pointer transition-colors focus:bg-secondary/70 focus:text-foreground">
          <Link href="/my-repos" className="gap-2.5">
            <BookOpen className="size-4 text-muted-foreground/80 group-hover:text-primary" />
            My Repos
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1 bg-border/40" />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="rounded-xl px-2.5 py-2 text-xs font-semibold cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors gap-2.5"
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
