"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type GatedContentOverlayProps = {
  locked: boolean
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function GatedContentOverlay({
  locked,
  children,
  footer,
  className,
}: GatedContentOverlayProps) {
  if (!locked) {
    return <>{children}</>
  }

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      <div className="pointer-events-none select-none blur-sm" aria-hidden>
        {children}
      </div>
      <div className="absolute inset-0 bg-background/55 backdrop-blur-[2px]" />
      {footer ? (
        <div className="absolute inset-x-0 bottom-0 border-t border-border/60 bg-card/95 p-4 backdrop-blur-sm">
          {footer}
        </div>
      ) : null}
    </div>
  )
}
