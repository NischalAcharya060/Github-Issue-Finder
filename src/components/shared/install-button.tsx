"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useInstallPrompt } from "@/hooks/use-install-prompt"

/**
 * Appears only when the browser reports the app is installable
 * (after `beforeinstallprompt` fires). Triggers the native install dialog.
 */
export function InstallButton() {
  const { canInstall, promptInstall } = useInstallPrompt()

  return (
    <AnimatePresence>
      {canInstall && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, width: 0 }}
          animate={{ opacity: 1, scale: 1, width: "auto" }}
          exit={{ opacity: 0, scale: 0.9, width: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={promptInstall}
            className="gap-1.5 whitespace-nowrap text-primary"
            title="Install Issue Finder"
          >
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Install</span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
