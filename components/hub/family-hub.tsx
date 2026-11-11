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

      {/* Rich Black & Crimson Red Marble Background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950 via-neutral-900 to-black pointer-events-none z-0" />
      <div className="absolute inset-0 opacity-70 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-950/80 via-rose-950/30 to-black pointer-events-none z-0" />
      
      {/* Dynamic Marble Vein Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-70 pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="luxuryMarbleVein" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#be123c" stopOpacity="0.75" />
            <stop offset="70%" stopColor="#4c0519" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#09090b" stopOpacity="1" />
          </linearGradient>
        </defs>
        <path d="M-100,50 Q350,200 200,600 T1000,200" stroke="url(#luxuryMarbleVein)" strokeWidth="4" fill="none" />
        <path d="M50,-50 Q100,500 500,700 T1200,900" stroke="url(#luxuryMarbleVein)" strokeWidth="3" fill="none" />
        <path d="M200,0 Q600,300 400,900 T800,400" stroke="#e11d48" strokeWidth="2.5" fill="none" opacity="0.7" />
      </svg>

      {/* Header */}
      <div className="relative z-20 flex-none bg-neutral-950/40 backdrop-blur-md border-b border-rose-950/30">
        <HubHeader
          onOpenProfile={() => setIsProfileOpen(true)}
          userName={userName}
          avatarUrl={avatarUrl}
        />
      </div>

      {/* Main Content Area: Completely Borderless & Transparent to Show Marble */}
      <main className="relative z-10 flex-1 overflow-y-auto p-3 sm:p-4 pb-24">
        <div className="h-full bg-transparent p-2 shadow-none">
          {activeTab === 'shopping' && <ShoppingList userId={userId} />}
          {activeTab === 'schedule' && <Schedule userId={userId} />}
          {activeTab === 'todo' && <TodoList userId={userId} />}
          {activeTab === 'chat' && <Chat userId={userId} />}
        </div>
      </main>

      {/* Larger, Fixed Bottom Navigation Bar */}
      <nav aria-label="Main Navigation" className="absolute bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-rose-900/40 bg-neutral-950/90 backdrop-blur-xl pt-4 pb-6 px-2 shadow-[0_-15px_30px_rgba(0,0,0,0.9)]">
        <button onClick={() => setActiveTab('shopping')} className={`text-sm font-medium tracking-wide transition-all py-1.5 px-4 rounded-full ${activeTab === 'shopping' ? 'text-red-500 font-bold bg-rose-950/50 scale-105 shadow-inner' : 'text-neutral-400 hover:text-white'}`}>Shopping</button>
        <button onClick={() => setActiveTab('schedule')} className={`text-sm font-medium tracking-wide transition-all py-1.5 px-4 rounded-full ${activeTab === 'schedule' ? 'text-red-500 font-bold bg-rose-950/50 scale-105 shadow-inner' : 'text-neutral-400 hover:text-white'}`}>Schedule</button>
        <button onClick={() => setActiveTab('todo')} className={`text-sm font-medium tracking-wide transition-all py-1.5 px-4 rounded-full ${activeTab === 'todo' ? 'text-red-500 font-bold bg-rose-950/50 scale-105 shadow-inner' : 'text-neutral-400 hover:text-white'}`}>To-Do</button>
        <button onClick={() => setActiveTab('chat')} className={`text-sm font-medium tracking-wide transition-all py-1.5 px-4 rounded-full ${activeTab === 'chat' ? 'text-red-500 font-bold bg-rose-950/50 scale-105 shadow-inner' : 'text-neutral-400 hover:text-white'}`}>Chat</button>
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
