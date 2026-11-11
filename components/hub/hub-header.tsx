'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, LogOut, Bell, Share2 } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useProfiles } from '@/hooks/use-profiles'
import { Button } from '@/components/ui/button'
import { MemberAvatar } from './member-avatar'
import { triggerHaptic } from '@/lib/feedback'

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

  const handleShare = async () => {
    triggerHaptic(10)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Makharinskiy Family Hub',
          url: window.location.href,
        })
      } catch (err) {
        // Share sheet dismissed
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Hub link copied to clipboard!')
    }
  }

  const currentProfile = me || {
    id: userId,
    display_name: userName || 'You',
    avatar_url: avatarUrl || null,
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-5 sm:px-6 h-20 bg-neutral-950/80 backdrop-blur-xl border-b border-white/[0.04] shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3.5">
        {/* Logo Graphic: Slightly reduced size & weight */}
        <div className="relative size-9 shrink-0 overflow-hidden rounded-xl opacity-90 shadow-[0_0_15px_rgba(159,18,57,0.3)] transition-opacity hover:opacity-100">
          <Image
            src="/logo.jpg"
            alt="Makharinskiy Logo"
            fill
            className="object-cover"
          />
        </div>
        
        <div className="flex flex-col justify-center">
          <h1 className="text-white font-serif text-lg sm:text-xl font-bold leading-none tracking-wide">
            Makharinskiy
          </h1>
          {/* Softened Subtitle */}
          <span className="mt-1 text-[9.5px] font-medium tracking-[0.22em] text-amber-400/60 uppercase">
            FAMILY HUB
          </span>
        </div>
      </div>

      {/* Action Controls with Added Breathing Room */}
      <div className="flex items-center gap-3 sm:gap-3.5">
        {/* Profile Photo */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic(10)
            onOpenProfile()
          }}
          className="rounded-full p-0.5 transition-transform active:scale-95 hover:opacity-90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-400/50"
          title="Open Profile Settings"
          aria-label="Open Profile Settings"
        >
          <MemberAvatar profile={currentProfile} userId={userId} size="md" />
        </button>

        {/* Share Icon */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
          title="Share Hub Link"
          className="text-neutral-400 hover:text-amber-300 hover:bg-white/[0.04] size-9 rounded-xl transition-colors"
        >
          <Share2 className="h-4.5 w-4.5" />
        </Button>

        {/* Notification Bell */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            triggerHaptic(10)
            requestPermission()
          }}
          title="Enable Push Notifications"
          className="text-amber-400/70 hover:text-amber-300 hover:bg-white/[0.04] size-9 rounded-xl transition-colors"
        >
          <Bell className="h-4.5 w-4.5" />
        </Button>

        {/* Sign Out Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={signOut} 
          disabled={signingOut}
          className="text-neutral-500 hover:text-white hover:bg-white/[0.04] size-9 rounded-xl transition-colors"
          title="Sign out"
        >
          {signingOut ? (
            <Loader2 className="h-4.5 w-4.5 animate-spin" />
          ) : (
            <LogOut className="h-4.5 w-4.5" />
          )}
        </Button>
      </div>
    </header>
  )
}
