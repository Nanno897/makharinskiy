'use client'

import Image from 'next/image'
import { MemberAvatar } from './member-avatar'
import { useProfiles } from '@/hooks/use-profiles'

export function HubHeader({
  userId,
  avatarUrl,
  userName,
  onOpenProfile,
}: {
  userId: string
  avatarUrl?: string
  userName?: string
  onOpenProfile: () => void
}) {
  const { profiles } = useProfiles()
  const me = profiles[userId]

  const currentProfile = me || {
    id: userId,
    display_name: userName || 'You',
    avatar_url: avatarUrl || null,
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-5 h-16 bg-neutral-950/80 backdrop-blur-xl border-b border-white/[0.04] shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="relative size-11 sm:size-12 shrink-0">
          <Image
            src="/logo-icon.png"
            alt="Makharinskiy Logo"
            fill
            className="object-contain scale-125 mix-blend-lighten drop-shadow-[0_0_12px_rgba(159,18,57,0.45)]"
            priority
          />
        </div>
        
        <div className="flex flex-col justify-center">
          <h1 className="text-white font-serif text-base sm:text-lg font-bold leading-none tracking-wide">
            Makharinskiy
          </h1>
          <span className="mt-0.5 text-[8.5px] font-medium tracking-[0.22em] text-amber-400/60 uppercase">
            FAMILY HUB
          </span>
        </div>
      </div>

      {/* Profile Trigger */}
      <button
        type="button"
        onClick={onOpenProfile}
        className="rounded-full transition-transform active:scale-95 hover:opacity-90 focus-visible:outline-none"
        title="Open Profile & Settings"
        aria-label="Open Profile & Settings"
      >
        <MemberAvatar profile={currentProfile} userId={userId} size="md" />
      </button>
    </header>
  )
}
