'use client'

import React, { useState } from 'react'
import { HubHeader } from '@/components/hub/hub-header'
import { Navigation } from '@/components/hub/navigation'
import { ShoppingList } from '@/components/hub/shopping-list'
import { ProfileDialog } from '@/components/hub/profile-dialog'

export interface FamilyHubProps {
  userId: string
  userName?: string
  avatarUrl?: string
}

export function HubBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[calc(100vh-140px)] rounded-2xl border border-rose-950/40 bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 p-4 sm:p-6 shadow-2xl overflow-hidden flex flex-col justify-between">
      <link href="https://fonts.googleapis.com/css2?family=Parisienne&display=swap" rel="stylesheet" />
      
      <div className="relative z-10 flex-1 flex flex-col">{children}</div>

      {/* Red Floral Corner Accent */}
      <div className="pointer-events-none absolute bottom-0 right-0 z-0 opacity-70 flex gap-1 p-4">
        <div className="size-10 rounded-full bg-rose-900 blur-sm" />
        <div className="size-8 rounded-full bg-red-700 blur-xs mt-4 -ml-4" />
        <div className="size-6 rounded-full bg-rose-800 blur-xs -mt-2 -ml-2" />
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
          {activeTab === 'schedule' && (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
              <h3 className="text-xl font-semibold text-white mb-2">Schedule & Calendar</h3>
            </div>
          )}
          {activeTab === 'todo' && (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
              <h3 className="text-xl font-semibold text-white mb-2">To-Do Tasks</h3>
            </div>
          )}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
              <h3 className="text-xl font-semibold text-white mb-2">Family Chat</h3>
            </div>
          )}
        </HubBackground>
      </main>

      <Navigation activeTab={activeTab} onTabChange={(tab: any) => setActiveTab(tab)} />

      <ProfileDialog
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        userId={userId}
        currentAvatarUrl={avatarUrl}
      />
    </div>
  )
}
