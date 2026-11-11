'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, LogOut, Bell, User } from 'lucide-react'
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
  email?: string
  onOpenProfile: () => void
}) {
  const router = useRouter()
  const { profiles } = useProfiles()
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

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-16 bg-neutral-950/80 backdrop-blur border-b border-rose-950/30">
      <div className="flex items-center gap-2">
        <Crest />
        <div>
          <h1 className="text-white font-bold leading-none">Makharinskiy</h1>
          <span className="text-xs text-neutral-400">FAMILY HUB</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenProfile}
          className="rounded-full p-0.5 transition-transform active:scale-95 hover:ring-2 hover:ring-rose-500/50"
          title="Open Profile Settings"
          aria-label="Open Profile Settings"
        >
          <MemberAvatar userId={userId} />
        </button>

        <Button
          variant="ghost"
          size="icon"
          onClick={requestPermission}
          title="Enable Push Notifications"
          className="text-amber-400 hover:text-amber-300"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={signOut} 
          disabled={signingOut}
          className="text-neutral-400 hover:text-white"
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
