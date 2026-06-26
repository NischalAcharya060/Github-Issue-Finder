"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePreferences } from "@/hooks/use-preferences"

const iconMap: Record<string, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

const labelMap: Record<string, string> = {
  light: "Switch to dark mode",
  dark: "Switch to system mode",
  system: "Switch to light mode",
}

export function ThemeToggle() {
  const { theme, toggleTheme } = usePreferences()
  const Icon = iconMap[theme] ?? Sun

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      className="relative overflow-hidden"
      aria-label={labelMap[theme] ?? "Toggle theme"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: -16, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 16, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex items-center justify-center"
        >
          <Icon className="size-4" />
        </motion.span>
      </AnimatePresence>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
