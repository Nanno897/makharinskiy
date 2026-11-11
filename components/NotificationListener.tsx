'use client'

import { useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function NotificationListener() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }

    const channel = supabase
      .channel('family-hub-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload: any) => {
          if (Notification.permission === 'granted') {
            new Notification('Makharinskiy Hub: New Message', {
              body: payload.new.content || 'Someone sent a message!',
              icon: '/icon.png',
            })
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'shopping_list' },
        (payload: any) => {
          if (Notification.permission === 'granted') {
            new Notification('Makharinskiy Hub: Shopping List', {
              body: `New item added: ${payload.new.name || 'Check the list'}`,
              icon: '/icon.png',
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return null
}
