'end'
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
    <div className="relative h-full w-full rounded-2xl border border-rose-900/40 bg-black p-4 sm:p-6 shadow-2xl overflow-hidden flex flex-col justify-between">
      <link href="https://fonts.googleapis.com/css2?family=Parisienne&display=swap" rel="stylesheet" />
      
      {/* Realistic Flowing Dark Marble & Deep Red Vein Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-black to-neutral-900 pointer-events-none" />
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-950/60 via-transparent to-neutral-950/90 pointer-events-none" />
      
      {/* Organic Marble Vein Lines Simulation */}
      <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="veinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e11d48" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#4c0519" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <path d="M-100,50 Q200,300 400,100 T900,600" stroke="url(#veinGrad)" strokeWidth="2.5" fill="none" />
        <path d="M50,-50 Q300,400 150,700 T800,900" stroke="url(#veinGrad)" strokeWidth="1.5" fill="none" />
        <path d="M300,0 Q500,200 700,50 T1000,400" stroke="#881337" strokeWidth="2" fill="none" opacity="0.5" />
      </svg>

      {/* Semi-transparent container wrapper forcing inner cards to reveal background */}
      <div className="relative z-10 flex-1 flex flex-col overflow-y-auto [&_div[class*='bg-neutral']]:bg-neutral-950/40 [&_div[class*='bg-neutral']]:backdrop-blur-md [&_div[class*='bg-neutral']]:border-rose-950/30">
        {children}
      </div>

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
      <div className="flex-none bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900">
        <HubHeader
          onOpenProfile={() => setIsProfileOpen(true)}
          userName={userName}
          avatarUrl={avatarUrl}
        />
      </div>

      {/* Main Tab View */}
      <main className="flex-1 overflow-hidden p-3 sm:p-4">
        <HubBackground>
          {activeTab === 'shopping' && <ShoppingList userId={userId} />}
          {activeTab === 'schedule' && <Schedule userId={userId} />}
          {activeTab === 'todo' && <TodoList userId={userId} />}
          {activeTab === 'chat' && <Chat userId={userId} />}
        </HubBackground>
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <nav aria-label="Main Navigation" className="flex-none flex items-center justify-around border-t border-rose-950/40 bg-neutral-950/90 backdrop-blur-md py-3 shadow-2xl z-50">
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
