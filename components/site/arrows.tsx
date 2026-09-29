"use client"

import { useEffect, useRef, type RefObject } from "react"
import {
  ArrowRightIcon,
  type ArrowRightIconHandle,
} from "@/components/icons/arrow-right"
import {
  ArrowUpRightIcon,
  type ArrowUpRightIconHandle,
} from "@/components/icons/arrow-up-right"

type ArrowHandle = ArrowRightIconHandle | ArrowUpRightIconHandle

function useParentHover<T extends ArrowHandle>(
  elementRef: RefObject<HTMLSpanElement | null>,
  iconRef: RefObject<T | null>
) {
  useEffect(() => {
    const targets: HTMLElement[] = []
    let parent = elementRef.current?.parentElement ?? null
    while (parent) {
      if (parent.matches('a, button, [data-arrow-hover], [class*="card"]')) {
        targets.push(parent)
      }
      parent = parent.parentElement
    }
    if (targets.length === 0) return

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const start = () => {
      if (!reducedMotion.matches) iconRef.current?.startAnimation()
    }
    const stopWhenOutside = (event: Event) => {
      const next =
        event instanceof FocusEvent
          ? event.relatedTarget
          : (event as PointerEvent).relatedTarget
      if (
        next instanceof Node &&
        targets.some((target) => target.contains(next))
      )
        return
      iconRef.current?.stopAnimation()
    }
    for (const target of targets) {
      target.addEventListener("pointerenter", start)
      target.addEventListener("pointerleave", stopWhenOutside)
      target.addEventListener("focusin", start)
      target.addEventListener("focusout", stopWhenOutside)
    }
    return () => {
      for (const target of targets) {
        target.removeEventListener("pointerenter", start)
        target.removeEventListener("pointerleave", stopWhenOutside)
        target.removeEventListener("focusin", start)
        target.removeEventListener("focusout", stopWhenOutside)
      }
    }
  }, [elementRef, iconRef])
}

export function ArrowRight(props: { size?: number; className?: string }) {
  const elementRef = useRef<HTMLSpanElement>(null)
  const iconRef = useRef<ArrowRightIconHandle>(null)
  useParentHover(elementRef, iconRef)
  return (
    <span ref={elementRef} className="contents" aria-hidden="true">
      <ArrowRightIcon ref={iconRef} {...props} />
    </span>
  )
}

export function ArrowUpRight(props: { size?: number; className?: string }) {
  const elementRef = useRef<HTMLSpanElement>(null)
  const iconRef = useRef<ArrowUpRightIconHandle>(null)
  useParentHover(elementRef, iconRef)
  return (
    <span ref={elementRef} className="contents" aria-hidden="true">
      <ArrowUpRightIcon ref={iconRef} {...props} />
    </span>
  )
}
