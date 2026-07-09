"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type BlurIntensity = "default" | "strong"

const BLUR_STYLES: Record<BlurIntensity, { content: string; scrim: string }> = {
  default: {
    content: "blur-[3px]",
    scrim: "bg-background/35",
  },
  strong: {
    content: "blur-[6px]",
    scrim: "bg-background/55",
  },
}

type GatedContentOverlayProps = {
  locked: boolean
  children: ReactNode
  footer?: ReactNode
  className?: string
  intensity?: BlurIntensity
}

export function GatedContentOverlay({
  locked,
  children,
  footer,
  className,
  intensity = "default",
}: GatedContentOverlayProps) {
  if (!locked) {
    return <>{children}</>
  }

  const styles = BLUR_STYLES[intensity]

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      <div className={cn("pointer-events-none select-none", styles.content)} aria-hidden>
        {children}
      </div>
      <div className={cn("absolute inset-0", styles.scrim)} />
      {footer ? (
        <div className="absolute inset-x-0 bottom-0 border-t border-border/60 bg-card/95 p-4">
          {footer}
        </div>
      ) : null}
    </div>
  )
}
