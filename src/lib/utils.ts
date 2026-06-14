import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const labelStyles: Record<string, string> = {
  bug: "bg-red-500/12 text-red-600 dark:text-red-400 border-red-500/25",
  enhancement:
    "bg-blue-500/12 text-blue-600 dark:text-blue-400 border-blue-500/25",
  documentation:
    "bg-purple-500/12 text-purple-600 dark:text-purple-400 border-purple-500/25",
  "good first issue":
    "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
  "help wanted":
    "bg-amber-500/12 text-amber-600 dark:text-amber-400 border-amber-500/25",
  beginner:
    "bg-teal-500/12 text-teal-600 dark:text-teal-400 border-teal-500/25",
  question:
    "bg-cyan-500/12 text-cyan-600 dark:text-cyan-400 border-cyan-500/25",
}

export interface LabelStyle {
  className: string
  style?: React.CSSProperties
}

export function getLabelStyle(name: string, hexColor: string): LabelStyle {
  const lower = name.toLowerCase()
  if (labelStyles[lower]) {
    return { className: labelStyles[lower] }
  }
  const cleanColor = hexColor.startsWith("#") ? hexColor : `#${hexColor}`
  return {
    className: "border text-foreground/90 backdrop-blur-[2px]",
    style: {
      backgroundColor: `${cleanColor}1c`, // ~11% opacity
      borderColor: `${cleanColor}40`,     // ~25% opacity
      color: cleanColor,
    },
  }
}
