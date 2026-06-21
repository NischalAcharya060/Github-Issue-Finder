"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePreferences } from "@/hooks/use-preferences"

export function ThemeToggle() {
  const { theme, toggleTheme } = usePreferences()
  const isDark = theme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      className="relative overflow-hidden"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={{ y: -16, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 16, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex items-center justify-center"
        >
          {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </motion.span>
      </AnimatePresence>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
