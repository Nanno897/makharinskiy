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

      {/* Layer 1: Subtle smoky burgundy radial gradient base */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(65,10,20,0.45)_0%,rgba(10,5,8,0.85)_60%,rgba(0,0,0,1)_100%)] pointer-events-none z-0" />

      {/* Layer 2: Soft blurred red light in two corners */}
      <div className="absolute -top-32 -left-32 w-[450px] h-[450px] bg-red-950/30 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute -bottom-32 -right-32 w-[450px] h-[450px] bg-red-900/20 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Layer 3: Faint glass-like texture & barely visible gold accents */}
      <div className="absolute inset-0 bg-neutral-950/30 backdrop-blur-[2px] border border-amber-500/[0.03] pointer-events-none z-0" />

      {/* Header */}
      <div className="relative z-20 flex-none bg-neutral-950/40 backdrop-blur-md border-b border-rose-950/30">
        <HubHeader
          userId={userId}
          onOpenProfile={() => setIsProfileOpen(true)}
          userName={userName}
          avatarUrl={avatarUrl}
        />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 overflow-y-auto p-3 sm:p-4 pb-24">
        <div className="h-full bg-transparent p-2 shadow-none">
          {activeTab === 'shopping' && <ShoppingList userId={userId} />}
          {activeTab === 'schedule' && <Schedule userId={userId} />}
          {activeTab === 'todo' && <TodoList userId={userId} />}
          {activeTab === 'chat' && <Chat userId={userId} />}
        </div>
      </main>

      {/* Fixed Bottom Navigation Bar */}
      <nav 
        aria-label="Main Navigation" 
        className="absolute bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-rose-900/40 bg-neutral-950/90 backdrop-blur-xl pt-4 pb-6 px-2 shadow-[0_-15px_30px_rgba(0,0,0,0.9)]"
      >
        <button 
          onClick={() => setActiveTab('shopping')} 
          className={`text-sm font-medium tracking-wide transition-all py-1.5 px-4 rounded-full ${
            activeTab === 'shopping' ? 'text-red-500 font-bold bg-rose-950/50 scale-105 shadow-inner' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Shopping
        </button>
        <button 
          onClick={() => setActiveTab('schedule')} 
          className={`text-sm font-medium tracking-wide transition-all py-1.5 px-4 rounded-full ${
            activeTab === 'schedule' ? 'text-red-500 font-bold bg-rose-950/50 scale-105 shadow-inner' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Schedule
        </button>
        <button 
          onClick={() => setActiveTab('todo')} 
          className={`text-sm font-medium tracking-wide transition-all py-1.5 px-4 rounded-full ${
            activeTab === 'todo' ? 'text-red-500 font-bold bg-rose-950/50 scale-105 shadow-inner' : 'text-neutral-400 hover:text-white'
          }`}
        >
          To-Do
        </button>
        <button 
          onClick={() => setActiveTab('chat')} 
          className={`text-sm font-medium tracking-wide transition-all py-1.5 px-4 rounded-full ${
            activeTab === 'chat' ? 'text-red-500 font-bold bg-rose-950/50 scale-105 shadow-inner' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Chat
        </button>
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
