"use client"
import { useEffect, useRef, type ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"
/** Move focus with the result, so keyboard and screen-reader users don't lose their place. */
export function FormFeedback({
  children,
  className,
  role,
}: {
  children: ReactNode
  className: string
  role: "alert" | "status"
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  useEffect(() => {
    ref.current?.focus()
  }, [])
  return (
    <motion.div
      ref={ref}
      tabIndex={-1}
      role={role}
      className={className}
      initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
