'use client'

import React, { useState } from 'react'
import { HubHeader } from '@/components/hub/hub-header'
import { ShoppingList } from '@/components/hub/shopping-list'
import { Schedule } from '@/components/hub/schedule'
import { TodoList } from '@/components/hub/todo-list'
import { Chat } from '@/components/hub/chat'
import { ProfileDialog } from '@/components/hub/profile-dialog'

export interface FamilyHubProps {
  userId: string
  userName?: string
  avatarUrl?: string
}

export function HubBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-full w-full rounded-2xl border border-rose-900/30 bg-gradient-to-br from-neutral-950 via-rose-950/20 to-neutral-900 p-4 sm:p-6 shadow-2xl overflow-hidden flex flex-col justify-between">
      <link href="https://fonts.googleapis.com/css2?family=Parisienne&display=swap" rel="stylesheet" />
      
      {/* Real Marble Vein Swirl Effect */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-700/30 via-transparent to-neutral-900/80 pointer-events-none" />
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:32px_32px] pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col overflow-y-auto">{children}</div>

      {/* Red Floral Corner Accent */}
      <div className="pointer-events-none absolute bottom-0 right-0 z-0 opacity-80 flex gap-1 p-4">
        <div className="size-12 rounded-full bg-rose-900 blur-md" />
        <div className="size-10 rounded-full bg-red-700 blur-sm mt-4 -ml-5" />
        <div className="size-8 rounded-full bg-rose-600 blur-xs -mt-2 -ml-3" />
      </div>
    </div>
  )
}

export function FamilyHub({ userId, userName, avatarUrl }: FamilyHubProps) {
  const [activeTab, setActiveTab] = useState<'shopping' | 'schedule' | 'todo' | 'chat'>('shopping')
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <div className="flex h-[100dvh] flex-col bg-black text-white overflow-hidden justify-between">
      {/* Header */}
      <div className="flex-none">
        <HubHeader
          onOpenProfile={() => setIsProfileOpen(true)}
          userName={userName}
          avatarUrl={avatarUrl}
        />
      </div>

      {/* Main Tab View with Marble Wrapper */}
      <main className="flex-1 overflow-hidden p-3 sm:p-4">
        <HubBackground>
          {activeTab === 'shopping' && <ShoppingList userId={userId} />}
          {activeTab === 'schedule' && <Schedule userId={userId} />}
          {activeTab === 'todo' && <TodoList userId={userId} />}
          {activeTab === 'chat' && <Chat userId={userId} />}
        </HubBackground>
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <nav aria-label="Main Navigation" className="flex-none flex items-center justify-around border-t border-neutral-900 bg-neutral-950 py-3 shadow-2xl z-50">
        <button onClick={() => setActiveTab('shopping')} className={`text-xs font-medium transition-all ${activeTab === 'shopping' ? 'text-red-500 font-bold scale-105' : 'text-neutral-400 hover:text-white'}`}>Shopping</button>
        <button onClick={() => setActiveTab('schedule')} className={`text-xs font-medium transition-all ${activeTab === 'schedule' ? 'text-red-500 font-bold scale-105' : 'text-neutral-400 hover:text-white'}`}>Schedule</button>
        <button onClick={() => setActiveTab('todo')} className={`text-xs font-medium transition-all ${activeTab === 'todo' ? 'text-red-500 font-bold scale-105' : 'text-neutral-400 hover:text-white'}`}>To-Do</button>
        <button onClick={() => setActiveTab('chat')} className={`text-xs font-medium transition-all ${activeTab === 'chat' ? 'text-red-500 font-bold scale-105' : 'text-neutral-400 hover:text-white'}`}>Chat</button>
      </nav>

      <ProfileDialog
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        userId={userId}
        currentAvatarUrl={avatarUrl}
      />
    </div>
  )
}
