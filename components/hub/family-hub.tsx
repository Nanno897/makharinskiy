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

export function FamilyHub({ userId, userName, avatarUrl }: FamilyHubProps) {
  const [activeTab, setActiveTab] = useState<'shopping' | 'schedule' | 'todo' | 'chat'>('shopping')
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <div className="fixed inset-0 flex flex-col bg-black text-white overflow-hidden select-none">
      <link href="https://fonts.googleapis.com/css2?family=Parisienne&display=swap" rel="stylesheet" />

      {/* Luxury Black & Red Marble Background Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-black to-neutral-900 pointer-events-none z-0" />
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-950/70 via-transparent to-neutral-950 pointer-events-none z-0" />
      
      {/* Marble Vein Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-35 pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="marbleVein" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e11d48" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#881337" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <path d="M-50,200 Q300,100 600,400 T1100,100" stroke="url(#marbleVein)" strokeWidth="3" fill="none" />
        <path d="M100,-50 Q400,600 200,800 T900,1000" stroke="url(#marbleVein)" strokeWidth="2" fill="none" />
      </svg>

      {/* Header */}
      <div className="relative z-20 flex-none bg-neutral-950/70 backdrop-blur-md border-b border-rose-950/40">
        <HubHeader
          onOpenProfile={() => setIsProfileOpen(true)}
          userName={userName}
          avatarUrl={avatarUrl}
        />
      </div>

      {/* Main Content Area (Scrollable with translucent cards) */}
      <main className="relative z-10 flex-1 overflow-y-auto p-3 sm:p-4 pb-20">
        <div className="h-full rounded-2xl border border-rose-950/50 bg-neutral-950/40 backdrop-blur-md p-4 shadow-2xl">
          {activeTab === 'shopping' && <ShoppingList userId={userId} />}
          {activeTab === 'schedule' && <Schedule userId={userId} />}
          {activeTab === 'todo' && <TodoList userId={userId} />}
          {activeTab === 'chat' && <Chat userId={userId} />}
        </div>
      </main>

      {/* Fixed Bottom Navigation Bar (Guaranteed visible on screen) */}
      <nav aria-label="Main Navigation" className="absolute bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-rose-950/50 bg-neutral-950/95 backdrop-blur-lg py-3 shadow-[0_-10px_25px_rgba(0,0,0,0.8)]">
        <button onClick={() => setActiveTab('shopping')} className={`text-xs font-medium transition-all ${activeTab === 'shopping' ? 'text-red-500 font-bold scale-105' : 'text-neutral-400 hover:text-white'}`}>Shopping</button>
        <button onClick={() => setActiveTab('schedule')} className={`text-xs font-medium transition-all ${activeTab === 'schedule' ? 'text-red-500 font-bold scale-105' : 'text-neutral-400 hover:text-white'}`}>Schedule</button>
        <button onClick={() => setActiveTab('todo')} className={`text-xs font-medium transition-all ${activeTab === 'todo' ? 'text-red-500 font-bold scale-105' : 'text-neutral-400 hover:text-white'}`}>To-Do</button>
        <button onClick={() => setActiveTab('chat')} className={`text-xs font-medium transition-all ${activeTab === 'chat' ? 'text-red-500 font-bold scale-105' : 'text-neutral-400 hover:text-white'}`}>Chat</button>
      </nav>

      {/* Profile Dialog */}
      <ProfileDialog
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        userId={userId}
        currentAvatarUrl={avatarUrl}
      />
    </div>
  )
}
