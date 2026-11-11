'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, LogOut, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useProfiles } from '@/hooks/use-profiles'
import { Button } from '@/components/ui/button'
import { Crest } from '@/components/crest'
import { MemberAvatar } from './member-avatar'

export function HubHeader({
  userId,
  email,
  onOpenProfile,
}: {
  userId: string
  email: string
  onOpenProfile: () => void
}) {
  const router = useRouter()
  const { profiles, isLoading } = useProfiles()
  const me = profiles[userId]
  const [signingOut, setSigningOut] = useState(false)

  async function signOut() {
    setSigningOut(true)
    await createClient().auth.signOut()
    router.replace('/auth/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Crest />
          <div className="min-w-0 leading-tight">
            <p className="truncate font-serif text-lg font-semibold">Makharinskiy</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-gold">Family Hub</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-3 rounded-full py-1 pr-1 pl-3 transition-colors hover:bg-accent"
            aria-label="Open profile settings"
          >
            <span className="hidden text-right leading-tight sm:block">
              <span className="block text-sm font-medium">
                {isLoading ? 'Loading…' : (me?.display_name ?? email.split('@')[0])}
              </span>
              <span className="block text-[11px] text-muted-foreground">Edit profile</span>
            </span>
            <MemberAvatar profile={me} gold />
          </button>
          <Button variant="ghost" size="icon" onClick={signOut} disabled={signingOut} aria-label="Sign out">
            {signingOut ? <Loader2 className="animate-spin" /> : <LogOut />}
          </Button>
        </div>
      </div>
    </header>
  )
}
