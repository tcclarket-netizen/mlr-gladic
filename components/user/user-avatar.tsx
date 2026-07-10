import { cn } from "@/lib/utils"
import { getInitials, getUserAvatarStyle } from "@/lib/avatar/user-avatar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type UserAvatarProps = {
  seed: string
  name?: string
  className?: string
  emojiClassName?: string
  showEmoji?: boolean
}

export function UserAvatar({
  seed,
  name = "",
  className,
  emojiClassName,
  showEmoji = true,
}: UserAvatarProps) {
  const style = getUserAvatarStyle(seed)
  const initials = getInitials(name)

  return (
    <Avatar className={cn("overflow-hidden", className)}>
      <AvatarFallback
        className="border-0 text-white"
        style={{
          background: `linear-gradient(135deg, ${style.gradientFrom} 0%, ${style.gradientTo} 100%)`,
        }}
      >
        {showEmoji ? (
          <span
            className={cn("select-none leading-none", emojiClassName ?? "text-base")}
            aria-hidden
          >
            {style.emoji}
          </span>
        ) : (
          <span className="text-[10px] font-semibold tracking-tight">{initials}</span>
        )}
      </AvatarFallback>
    </Avatar>
  )
}
