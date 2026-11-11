'use client'

import { useProfiles } from '@/hooks/use-profiles'
import { useRealtimeTable } from '@/hooks/use-realtime-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MemberAvatar } from './member-avatar'
import { ShieldCheck, CheckCircle2, Calendar, ShoppingBag } from 'lucide-react'
import type { Todo, FamilyEvent, ShoppingItem } from '@/lib/types'

export function MembersModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { profiles, isLoading } = useProfiles()
  const { data: todos } = useRealtimeTable<Todo>('todos')
  const { data: events } = useRealtimeTable<FamilyEvent>('events')
  const { data: shopping } = useRealtimeTable<ShoppingItem>('shopping_items')

  const memberList = Object.values(profiles)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-white/[0.08] bg-neutral-950/95 backdrop-blur-2xl sm:max-w-md text-white shadow-[0_20px_50px_rgba(0,0,0,0.9)] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="size-5 text-amber-400" />
            Family Members
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-3">
          {isLoading ? (
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

                  {/* Member Activity Breakdown */}
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
      </DialogContent>
    </Dialog>
  )
}
