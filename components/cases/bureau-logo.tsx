import Image from "next/image"
import type { Bureau } from "@/types/case"
import { BUREAU_LOGO_PATHS } from "@/lib/cases/constants"
import { cn } from "@/lib/utils"

const BUREAU_ALT: Record<Bureau, string> = {
  experian: "Experian",
  equifax: "Equifax",
  transunion: "TransUnion",
}

type BureauLogoProps = {
  bureau: Bureau
  className?: string
  size?: "sm" | "md"
}

export function BureauLogo({ bureau, className, size = "md" }: BureauLogoProps) {
  const box = size === "sm" ? "h-9 w-9" : "h-11 w-11"

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-transparent p-0.5",
        box,
        className
      )}
    >
      <Image
        src={BUREAU_LOGO_PATHS[bureau]}
        alt={BUREAU_ALT[bureau]}
        width={44}
        height={44}
        className="h-full w-full object-contain"
        priority
      />
    </div>
  )
}
