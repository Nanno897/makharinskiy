'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, LogOut, Bell } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useProfiles } from '@/hooks/use-profiles'
import { Button } from '@/components/ui/button'
import { MemberAvatar } from './member-avatar'

export function HubHeader({
  userId,
  email,
  avatarUrl,
  userName,
  onOpenProfile,
}: {
  userId: string
  email?: string
  avatarUrl?: string
  userName?: string
  onOpenProfile: () => void
}) {
  const router = useRouter()
  const { profiles } = useProfiles()
  const me = profiles[userId]
  const [signingOut, setSigningOut] = useState(false)

  async function signOut() {
    setSigningOut(true)
    await createClient().auth.signOut()
    router.replace('/auth/login')
    router.refresh()
  }

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Notifications are not supported on this device/browser.')
      return
    }
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        alert('Notifications enabled successfully!')
      } else {
        alert('Permission was denied for notifications.')
      }
    } catch (error) {
      console.error(error)
      alert('Error enabling notifications.')
    }
  }

  const currentProfile = me || {
    id: userId,
    display_name: userName || 'You',
    avatar_url: avatarUrl || null,
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-5 h-20 bg-neutral-950/85 backdrop-blur-md border-b border-white/[0.06] shadow-lg">
      <div className="flex items-center gap-3">
        {/* Custom Logo Graphic */}
        <div className="relative size-11 shrink-0 overflow-hidden rounded-xl border border-amber-400/30 shadow-[0_0_20px_rgba(159,18,57,0.4)]">
          <Image
            src="/icon.png" // Update to your exact uploaded asset name if placed in public folder (e.g. /logo.png)
            alt="Makharinskiy Logo"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h1 className="text-white font-serif text-lg sm:text-xl font-bold leading-tight tracking-wide">Makharinskiy</h1>
          <span className="text-[11px] font-medium tracking-[0.2em] text-amber-400/80">FAMILY HUB</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Profile photo without the golden ring */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="rounded-full p-0.5 transition-transform active:scale-95 hover:opacity-90"
          title="Open Profile Settings"
          aria-label="Open Profile Settings"
        >
          <MemberAvatar profile={currentProfile} userId={userId} size="md" />
        </button>

        {/* Notifications in muted gold */}
        <Button
          variant="ghost"
          size="icon"
          onClick={requestPermission}
          title="Enable Push Notifications"
          className="text-amber-400/80 hover:text-amber-300 hover:bg-white/[0.04] size-10 rounded-xl"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={signOut} 
          disabled={signingOut}
          className="text-neutral-400 hover:text-white hover:bg-white/[0.04] size-10 rounded-xl"
          title="Sign out"
        >
          {signingOut ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  )
}
