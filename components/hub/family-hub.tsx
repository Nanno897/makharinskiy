'use client'

import { useState } from 'react'
import { CalendarDays, CheckSquare, MessageCircle, ShoppingCart, type LucideIcon } from 'lucide-react'
import { HubHeader } from './hub-header'
import { ShoppingList } from './shopping-list'
import { Schedule } from './schedule'
import { TodoList } from './todo-list'
import { Chat } from './chat'
import { ProfileDialog } from './profile-dialog'
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
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-neutral-950">
      <HubHeader userId={userId} email={email} onOpenProfile={() => setProfileOpen(true)} />

      <nav aria-label="Modules" className="sticky top-16 z-30 hidden border-b border-border bg-background/80 backdrop-blur md:block">
        <div className="mx-auto flex max-w-5xl gap-1 px-4">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                tab === id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className={cn('size-4', tab === id && 'text-red-500')} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-28 md:pb-10">
        {tab === 'shopping' && <ShoppingList userId={userId} />}
        {tab === 'schedule' && <Schedule userId={userId} />}
        {tab === 'todos' && <TodoList userId={userId} />}
        {tab === 'chat' && <Chat userId={userId} />}
      </main>

      <nav
        aria-label="Modules"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <div className="grid grid-cols-4">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors',
                tab === id ? 'text-red-500' : 'text-muted-foreground',
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      <ProfileDialog userId={userId} open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  )
}
