import Image from "next/image"
import Link from "next/link"
import { MLR_BRAND } from "@/lib/marketing/mlr-brand"

const SIZES = {
  sm: { height: 36, width: 47 },
  md: { height: 48, width: 63 },
  lg: { height: 72, width: 94 },
} as const

export function GladicLogo({
  size = "md",
  showLabel = true,
  variant = "onLight",
  href,
  className = "",
}: {
  size?: keyof typeof SIZES
  showLabel?: boolean
  variant?: "onLight" | "onDark"
  href?: string
  className?: string
}) {
  const dims = SIZES[size]
  const labelClass = variant === "onLight" ? "text-[#526174]" : "text-white/60"

  const logo = (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={
          variant === "onDark"
            ? "shrink-0 overflow-hidden rounded-md bg-white px-1.5 py-1 shadow-sm"
            : "shrink-0"
        }
      >
        <Image
          src="/logo/gladic-ai.png"
          alt="GLADIC AI™"
          width={dims.width}
          height={dims.height}
          className="object-contain"
          style={{ height: dims.height, width: "auto" }}
          priority={size !== "sm"}
        />
      </div>
      {showLabel && (
        <span className={`hidden text-[10px] font-medium leading-tight tracking-wide sm:block ${labelClass}`}>
          {MLR_BRAND.productFull}
        </span>
      )}
    </div>
  )

  if (href !== undefined) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-85">
        {logo}
      </Link>
    )
  }

  return logo
}
