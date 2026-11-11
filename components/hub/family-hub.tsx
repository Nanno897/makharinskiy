'use client'

import React, { useState } from 'react'
import { HubHeader as Header } from '@/components/hub/hub-header'
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
      <div className="pointer-events-none absolute bottom-0 right-0 z-0 opacity-75 translate-x-3 translate-y-3">
        <svg width="180" height="180" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="rotate(-15 100 100)">
            <path d="M120 180 Q150 140 180 100" stroke="#881337" strokeWidth="3" strokeLinecap="round" />
            <path d="M140 160 Q170 120 190 80" stroke="#9f1239" strokeWidth="2" strokeLinecap="round" />
            <circle cx="170" cy="95" r="12" fill="#9f1239" />
            <circle cx="158" cy="85" r="10" fill="#be123c" />
            <circle cx="182" cy="85" r="10" fill="#881337" />
            <circle cx="170" cy="75" r="11" fill="#e11d48" />
            <circle cx="170" cy="90" r="4" fill="#fbbf24" />
            <circle cx="135" cy="140" r="14" fill="#881337" />
            <circle cx="120" cy="130" r="11" fill="#9f
