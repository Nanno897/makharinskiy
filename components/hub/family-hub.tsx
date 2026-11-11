'use client'

import React, { useState } from 'react'
import { ShoppingCart, Calendar, CheckSquare, MessageSquare } from 'lucide-react'
import { HubHeader } from '@/components/hub/hub-header'
import { ShoppingList } from '@/components/hub/shopping-list'
import { Schedule } from '@/components/hub/schedule'
import { TodoList } from '@/components/hub/todo-list'
import { Chat } from '@/components/hub/chat'
import { ProfileDialog } from '@/components/hub/profile-dialog'
import { MembersModal } from '@/components/hub/members-modal'

export interface FamilyHubProps {
  userId: string
  userName?: string
  avatarUrl?: string
}

export function FamilyHub({ userId, userName, avatarUrl }: FamilyHubProps) {
  const [activeTab, setActiveTab] = useState<'shopping' | 'schedule' | 'todo' | 'chat'>('shopping')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isMembersOpen, setIsMembersOpen] = useState(false)

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
      <main className="relative z-10 flex-1 overflow-y-auto p-3 sm:p-4 pb-28">
        <div className="h-full bg-transparent p-2 shadow-none">
          {activeTab === 'shopping' && <ShoppingList userId={userId} />}
          {activeTab === 'schedule' && <Schedule userId={userId} />}
          {activeTab === 'todo' && <TodoList userId={userId} />}
          {activeTab === 'chat' && <Chat userId={userId} />}
        </div>
      </main>

      {/* Floating Glass Navigation Bar (Icons Only) */}
      <nav aria-label="Main Navigation" className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-around gap-2 rounded-2xl border border-white/[0.08] bg-neutral-950/60 backdrop-blur-2xl py-2.5 px-4 shadow-[0_15px_35px_rgba(0,0,0,0.85)]">
        <button onClick={() => setActiveTab('shopping')} aria-label="Shopping" className={`p-3 rounded-xl transition-all ${activeTab === 'shopping' ? 'text-white bg-rose-950/60 shadow-[0_0_20px_rgba(159,18,57,0.5)] border border-rose-900/40 scale-105' : 'text-white/60 hover:text-white hover:bg-white/[0.04]'}`}>
          <ShoppingCart className="w-5 h-5" />
        </button>
        <button onClick={() => setActiveTab('schedule')} aria-label="Schedule" className={`p-3 rounded-xl transition-all ${activeTab === 'schedule' ? 'text-white bg-rose-950/60 shadow-[0_0_20px_rgba(159,18,57,0.5)] border border-rose-900/40 scale-105' : 'text-white/60 hover:text-white hover:bg-white/[0.04]'}`}>
          <Calendar className="w-5 h-5" />
        </button>
        <button onClick={() => setActiveTab('todo')} aria-label="To-Do" className={`p-3 rounded-xl transition-all ${activeTab === 'todo' ? 'text-white bg-rose-950/60 shadow-[0_0_20px_rgba(159,18,57,0.5)] border border-rose-900/40 scale-105' : 'text-white/60 hover:text-white hover:bg-white/[0.04]'}`}>
          <CheckSquare className="w-5 h-5" />
        </button>
        <button onClick={() => setActiveTab('chat')} aria-label="Chat" className={`p-3 rounded-xl transition-all ${activeTab === 'chat' ? 'text-white bg-rose-950/60 shadow-[0_0_20px_rgba(159,18,57,0.5)] border border-rose-900/40 scale-105' : 'text-white/60 hover:text-white hover:bg-white/[0.04]'}`}>
          <MessageSquare className="w-5 h-5" />
        </button>
      </nav>

      {/* Profile Dialog */}
      <ProfileDialog
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        userId={userId}
        onOpenMembers={() => setIsMembersOpen(true)}
      />

      {/* Members Directory Modal */}
      <MembersModal
        open={isMembersOpen}
        onOpenChange={setIsMembersOpen}
      />
    </div>
  )
}
