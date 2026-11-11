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
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-16 bg-neutral-950/80 backdrop-blur border-b border-neutral-800">
      <div className="flex items-center gap-2">
        <Crest />
        <div>
          <h1 className="text-white font-bold leading-none">Makharinskiy</h1>
          <span className="text-xs text-neutral-400">FAMILY HUB</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <MemberAvatar userId={userId} onClick={onOpenProfile} />

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
