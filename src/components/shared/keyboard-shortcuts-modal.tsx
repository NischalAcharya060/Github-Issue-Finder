"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Keyboard } from "lucide-react"

const shortcuts = [
  { keys: ["⌘K", "Ctrl+K"], label: "Focus search" },
  { keys: ["Esc"], label: "Close detail / modal" },
  { keys: ["?"], label: "Show keyboard shortcuts" },
  { keys: ["↑", "↓"], label: "Navigate results" },
]

interface KeyboardShortcutsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-6">
        <DialogHeader className="flex flex-row items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Keyboard className="size-5 text-primary" />
          </div>
          <div>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Use these shortcuts to navigate faster
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="space-y-3">
          {shortcuts.map(({ keys, label }) => (
            <div
              key={label}
              className="flex items-center justify-between"
            >
              <span className="text-sm text-muted-foreground">{label}</span>
              <div className="flex gap-1.5">
                {keys.map((key) => (
                  <kbd
                    key={key}
                    className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-md border bg-muted px-2 text-[11px] font-medium text-muted-foreground shadow-xs"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
