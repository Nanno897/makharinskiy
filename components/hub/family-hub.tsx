'use client'

import { useState } from 'react'
import { ShoppingCart, CalendarDays, CheckSquare, MessageCircle, LucideIcon } from 'lucide-react'
import { HubHeader } from './hub-header'
import { ShoppingView } from './shopping-view'
import { ScheduleView } from './schedule-view'
import { TodosView } from './todos-view'
import { ChatView } from './chat-view'
import { cn } from '@/lib/utils'

type Tab = 'shopping' | 'schedule' | 'todos' | 'chat'

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'shopping', label: 'Shopping', icon: ShoppingCart },
  { id: 'schedule', label: 'Schedule', icon: CalendarDays },
  { id: 'todos', label: 'To-Do', icon: CheckSquare },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
]

export function FamilyHub({ userId, email }: { userId: string; email: string }) {
  const [tab, setTab] = useState<Tab>('shopping')
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-neutral-950 text-white">
      {/* 1. Header locked at top */}
      <HubHeader userId={userId} email={email} onOpenProfile={() => setProfileOpen(true)} />

      {/* 2. Main content area takes remaining space and scrolls internally */}
      <main className="flex-1 overflow-y-auto px-4 py-3">
        {tab === 'shopping' && <ShoppingView />}
        {tab === 'schedule' && <ScheduleView />}
        {tab === 'todos' && <TodosView />}
        {tab === 'chat' && <ChatView />}
      </main>

      {/* 3. Navigation Bar locked at bottom */}
      <nav aria-label="Modules" className="shrink-0 border-t border-neutral-800 bg-neutral-950 px-4 py-2">
        <div className="mx-auto flex max-w-5xl justify-around gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs transition-colors',
                tab === id
                  ? 'text-amber-400 bg-neutral-900'
                  : 'text-neutral-400 hover:text-white'
              )}
            >
              <Icon className="size-5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
