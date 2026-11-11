'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, ChevronRight, Loader2, LogOut, Share2, Users, ArrowLeft, ShieldCheck, CheckCircle2, Calendar, ShoppingBag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useProfiles } from '@/hooks/use-profiles'
import { useRealtimeTable } from '@/hooks/use-realtime-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MemberAvatar } from './member-avatar'
import { triggerHaptic } from '@/lib/feedback'
import type { TodoItem, FamilyEvent, ShoppingItem } from '@/lib/types'

export function ProfileDialog({
  userId,
  open,
  onOpenChange,
}: {
  userId: string
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const router = useRouter()
  const { profiles, isLoading: profilesLoading } = useProfiles()
  const me = profiles[userId]
  const [signingOut, setSigningOut] = useState(false)
  const [view, setView] = useState<'profile' | 'members'>('profile')

  const { data: todos } = useRealtimeTable<TodoItem>('todo_items')
  const { data: events } = useRealtimeTable<FamilyEvent>('events')
  const { data: shopping } = useRealtimeTable<ShoppingItem>('shopping_items')

  const myTodos = todos?.filter((t) => t.user_id === userId && !t.completed).length ?? 0
  const myEvents = events?.filter((e) => e.user_id === userId).length ?? 0
  const myShopping = shopping?.filter((s) => s.user_id === userId && !s.bought).length ?? 0

  async function signOut() {
    triggerHaptic(20)
    setSigningOut(true)
    await createClient().auth.signOut()
    router.replace('/auth/login')
    router.refresh()
  }

  const requestPermission = async () => {
    triggerHaptic(10)
    if (!('Notification' in window)) {
      alert('Notifications are not supported on this device/browser.')
      return
    }
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        alert('Push notifications enabled successfully!')
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
        // Dismissed
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Hub link copied to clipboard!')
    }
  }

  const memberList = Object.values(profiles)

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setView('profile'); }}>
      <DialogContent className="border border-white/[0.08] bg-neutral-950/95 backdrop-blur-2xl sm:max-w-md text-white shadow-[0_20px_50px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>User Profile & Members</DialogTitle>
        </DialogHeader>

        {view === 'profile' ? (
          <div className="flex flex-col items-center pt-2 pb-4">
            <div className="relative p-1 rounded-full bg-gradient-to-br from-amber-400/40 via-rose-900/40 to-transparent shadow-[0_0_25px_rgba(245,158,11,0.2)]">
              <MemberAvatar profile={me} userId={userId} size="lg" />
            </div>

            <h2 className="mt-3 font-serif text-xl font-bold text-white tracking-wide">
              {me?.display_name || 'Family Member'}
            </h2>
            <p className="text-xs text-amber-400/80 font-medium tracking-widest uppercase mt-0.5">
              Makharinskiy Household
            </p>

            <div className="mt-6 grid grid-cols-3 gap-2.5 w-full">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-neutral-900/50 p-3 backdrop-blur-md">
                <span className="text-lg font-bold text-white">{myTodos}</span>
                <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider mt-0.5">Tasks</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-neutral-900/50 p-3 backdrop-blur-md">
                <span className="text-lg font-bold text-amber-300">{myEvents}</span>
                <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider mt-0.5">Events</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-neutral-900/50 p-3 backdrop-blur-md">
                <span className="text-lg font-bold text-rose-400">{myShopping}</span>
                <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider mt-0.5">Items</span>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-1.5 w-full rounded-2xl border border-white/[0.06] bg-neutral-900/40 p-1.5 backdrop-blur-md">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(10)
                  setView('members')
                }}
                className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-white/[0.04] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-amber-950/40 text-amber-300 border border-amber-500/20">
                    <Users className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Family Members</p>
                    <p className="text-[11px] text-neutral-400">View signed up household users</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-neutral-500" />
              </button>

              <button
                type="button"
                onClick={requestPermission}
                className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-white/[0.04] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-amber-950/40 text-amber-300 border border-amber-500/20">
                    <Bell className="size-4" />
                  </div>
                  <p className="text-sm font-medium text-white">Push Notifications</p>
                </div>
                <ChevronRight className="size-4 text-neutral-500" />
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-white/[0.04] transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-neutral-800 text-neutral-200 border border-white/10">
                    <Share2 className="size-4" />
                  </div>
                  <p className="text-sm font-medium text-white">Share Family Hub</p>
                </div>
                <ChevronRight className="size-4 text-neutral-500" />
              </button>
            </div>

            <div className="mt-3 w-full">
              <button
                type="button"
                onClick={signOut}
                disabled={signingOut}
                className="flex items-center justify-between w-full p-3 rounded-2xl border border-rose-950/50 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-rose-950/60 text-rose-400 border border-rose-800/40">
                    {signingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
                  </div>
                  <span className="text-sm font-medium">Sign Out</span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col pt-2 pb-4">
            <div className="flex items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setView('profile')}
                className="p-2 rounded-xl bg-neutral-900 text-neutral-300 hover:text-white border border-white/[0.06]"
              >
                <ArrowLeft className="size-4" />
              </button>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-amber-400" />
                <h3 className="font-serif text-lg font-bold text-white">Family Members</h3>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {profilesLoading ? (
                <div className="py-8 text-center text-xs text-neutral-400">Loading household profiles...</div>
              ) : !memberList.length ? (
                <div className="py-8 text-center text-xs text-neutral-400">No other members registered yet.</div>
              ) : (
                memberList.map((m) => {
                  const openTasks = todos?.filter((t) => t.user_id === m.id && !t.completed).length ?? 0
                  const upcomingEvents = events?.filter((e) => e.user_id === m.id).length ?? 0
                  const itemsNeeded = shopping?.filter((s) => s.user_id === m.id && !s.bought).length ?? 0

                  return (
                    <div
                      key={m.id}
                      className="flex flex-col gap-2 rounded-2xl border border-white/[0.06] bg-neutral-900/40 p-3.5 backdrop-blur-md shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <MemberAvatar profile={m} userId={m.id} size="md" />
                          <div>
                            <p className="font-medium text-sm text-white">{m.display_name || 'Family Member'}</p>
                            <p className="text-[11px] text-amber-400/80 font-mono">Member Account</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-1 grid grid-cols-3 gap-1.5 pt-2 border-t border-white/[0.04] text-xs text-neutral-400">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="size-3.5 text-neutral-400" />
                          <span>{openTasks} tasks</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-amber-400/80" />
                          <span>{upcomingEvents} events</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ShoppingBag className="size-3.5 text-rose-400/80" />
                          <span>{itemsNeeded} items</span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
