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
    <div className="relative min-h-[calc(100vh-140px)] rounded-2xl border border-rose-950/40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black p-4 sm:p-6 shadow-2xl overflow-hidden flex flex-col justify-between">
      <link href="https://fonts.googleapis.com/css2?family=Parisienne&display=swap" rel="stylesheet" />
      
      {/* Marble texture overlay effect */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#e11d48_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col">{children}</div>

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
    <div className="flex h-[100dvh] flex-col bg-black text-white overflow-hidden">
      <HubHeader
        onOpenProfile={() => setIsProfileOpen(true)}
        userName={userName}
        avatarUrl={avatarUrl}
      />

      <main className="flex-1 overflow-y-auto p-4">
        <HubBackground>
          {activeTab === 'shopping' && <ShoppingList userId={userId} />}
          {activeTab === 'schedule' && <Schedule userId={userId} />}
          {activeTab === 'todo' && <TodoList userId={userId} />}
          {activeTab === 'chat' && <Chat userId={userId} />}
        </HubBackground>
      </main>

      {/* Bottom Navigation */}
      <nav aria-label="Main Navigation" className="flex items-center justify-around border-t border-neutral-900 bg-neutral-950/90 backdrop-blur-md py-3 shadow-lg">
        <button onClick={() => setActiveTab('shopping')} className={`text-xs font-medium transition-colors ${activeTab === 'shopping' ? 'text-red-500 font-bold scale-105' : 'text-neutral-400 hover:text-white'}`}>Shopping</button>
        <button onClick={() => setActiveTab('schedule')} className={`text-xs font-medium transition-colors ${activeTab === 'schedule' ? 'text-red-500 font-bold scale-105' : 'text-neutral-400 hover:text-white'}`}>Schedule</button>
        <button onClick={() => setActiveTab('todo')} className={`text-xs font-medium transition-colors ${activeTab === 'todo' ? 'text-red-500 font-bold scale-105' : 'text-neutral-400 hover:text-white'}`}>To-Do</button>
        <button onClick={() => setActiveTab('chat')} className={`text-xs font-medium transition-colors ${activeTab === 'chat' ? 'text-red-500 font-bold scale-105' : 'text-neutral-400 hover:text-white'}`}>Chat</button>
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
