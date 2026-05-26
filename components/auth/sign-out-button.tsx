"use client"

import { LogOut } from "lucide-react"
import { useTransition } from "react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { signOut } from "@/lib/supabase/actions"

export function SignOutButton() {
  const [pending, startTransition] = useTransition()

  return (
    <DropdownMenuItem
      disabled={pending}
      className="flex cursor-pointer items-center gap-2 text-destructive focus:text-destructive"
      onSelect={(event) => {
        event.preventDefault()
        startTransition(() => signOut())
      }}
    >
      <LogOut className="h-4 w-4" /> {pending ? "Signing out…" : "Sign Out"}
    </DropdownMenuItem>
  )
}
