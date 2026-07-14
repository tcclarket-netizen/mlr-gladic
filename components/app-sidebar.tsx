"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderOpen,
  Mail,
  Building2,
  CreditCard,
  Settings,
  ChevronDown,
  User,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { UserAvatar } from "@/components/user/user-avatar"
import { GLADIC_BRAND } from "@/lib/brand"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Cases", href: "/cases", icon: FolderOpen },
  { label: "Billing", href: "/billing", icon: CreditCard },
  { label: "Settings", href: "/settings", icon: Settings },
  {
    label: "Verified Defense",
    href: "/verified-defense",
    icon: ShieldCheck,
    disabled: true,
    beta: true,
  },
  { label: "Letters", href: "/letters", icon: Mail, disabled: true, beta: true },
  { label: "Agency Filings", href: "/agency-filings", icon: Building2, disabled: true, beta: true },
]

type AppSidebarProps = {
  userId: string
  displayName: string
  accountLabel: string
  email: string
}

export default function AppSidebar({
  userId,
  displayName,
  accountLabel,
  email,
}: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-sidebar-border bg-sidebar">
      <Link
        href="/dashboard"
        className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4 transition-opacity hover:opacity-90"
        aria-label={`${GLADIC_BRAND.full} home`}
      >
        <div className="flex shrink-0 items-center justify-center rounded-lg bg-white px-2 py-1.5 shadow-sm ring-1 ring-black/5">
          <Image
            src="/logo/logo.png"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 object-contain object-center"
            priority
            aria-hidden
          />
        </div>
        <div className="min-w-0 leading-tight">
          <span className="block truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
            {GLADIC_BRAND.full}
          </span>
          <span className="block truncate text-[10px] uppercase tracking-widest text-sidebar-foreground/55">
            {GLADIC_BRAND.navTagline}
          </span>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map(({ label, href, icon: Icon, disabled, beta }) => {
            const active =
              pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
            return (
              <li key={href}>
                {disabled ? (
                  <span className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/35">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{label}</span>
                    {beta ? (
                      <span className="ml-auto rounded border border-sidebar-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-sidebar-foreground/50">
                        Beta
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{label}</span>
                    {beta ? (
                      <span className="ml-auto rounded border border-sidebar-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-sidebar-foreground/65">
                        Beta
                      </span>
                    ) : null}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-sidebar-accent/60">
              <UserAvatar
                seed={userId}
                name={displayName}
                className="h-7 w-7"
                emojiClassName="text-sm"
              />
              <div className="flex-1 text-left">
                <div className="text-xs font-medium text-sidebar-foreground">{displayName}</div>
                <div className="text-[11px] text-sidebar-foreground/50">{accountLabel}</div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-sidebar-foreground/40" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-xs font-medium">{displayName}</p>
              <p className="truncate text-[11px] text-muted-foreground">{email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <SignOutButton />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
