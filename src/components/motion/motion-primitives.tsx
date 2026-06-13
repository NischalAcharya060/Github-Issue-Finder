"use client"

import * as React from "react"
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useTransform,
  animate,
  type Variants,
  type HTMLMotionProps,
} from "framer-motion"

/**
 * Shared motion primitives so animation stays consistent and DRY across the app.
 * Every primitive honors `prefers-reduced-motion` — falling back to instant,
 * transform-free rendering when the user has reduced motion enabled.
 */

const EASE_OUT = [0.22, 1, 0.36, 1] as const

type DivMotionProps = HTMLMotionProps<"div">

interface FadeProps extends DivMotionProps {
  delay?: number
  duration?: number
}

/** Simple opacity fade-in on mount. */
export function FadeIn({ delay = 0, duration = 0.4, ...props }: FadeProps) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay, ease: EASE_OUT }}
      {...props}
    />
  )
}

/** Fade + rise from below on mount. */
export function FadeInUp({
  delay = 0,
  duration = 0.5,
  ...props
}: FadeProps) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: EASE_OUT }}
      {...props}
    />
  )
}

interface StaggerProps extends DivMotionProps {
  /** Delay between each child's entrance. */
  stagger?: number
  /** Delay before the first child animates. */
  delayChildren?: number
}

/**
 * Container that staggers the entrance of its `StaggerItem` children.
 * Use `StaggerItem` for direct children to inherit the animation.
 */
export function Stagger({
  stagger = 0.05,
  delayChildren = 0,
  ...props
}: StaggerProps) {
  const reduce = useReducedMotion()
  const variants: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : stagger,
        delayChildren: reduce ? 0 : delayChildren,
      },
    },
  }
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={variants}
      {...props}
    />
  )
}

/** Child of `Stagger` — fades and rises in sequence. */
export function StaggerItem({ ...props }: DivMotionProps) {
  const reduce = useReducedMotion()
  const variants: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: EASE_OUT },
    },
  }
  return <motion.div variants={variants} {...props} />
}

interface HoverCardProps extends DivMotionProps {
  /** Pixels to lift on hover. */
  lift?: number
}

/** Wrapper that lifts slightly on hover and presses on tap. */
export function HoverCard({ lift = 4, children, ...props }: HoverCardProps) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -lift }}
      whileTap={reduce ? undefined : { scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface AnimatedNumberProps {
  value: number
  /** Animation duration in seconds. */
  duration?: number
  className?: string
  /** Optional formatter; defaults to locale-grouped integer. */
  format?: (n: number) => string
}

/** Counts up to `value` on mount/update. Instant when reduced motion is on. */
export function AnimatedNumber({
  value,
  duration = 1,
  className,
  format = (n) => Math.round(n).toLocaleString(),
}: AnimatedNumberProps) {
  const reduce = useReducedMotion()
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => format(latest))

  React.useEffect(() => {
    if (reduce) {
      count.set(value)
      return
    }
    const controls = animate(count, value, { duration, ease: "easeOut" })
    return () => controls.stop()
  }, [value, duration, reduce, count])

  return <motion.span className={className}>{rounded}</motion.span>
}
