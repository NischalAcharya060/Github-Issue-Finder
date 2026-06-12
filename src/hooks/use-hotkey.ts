"use client"

import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut"

export function useHotkey(
  key: string,
  handler: () => void,
  modifiers: { ctrlKey?: boolean; metaKey?: boolean } = {}
) {
  useKeyboardShortcut(key, handler, modifiers)
}
