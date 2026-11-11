'use client'

import { useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default function NotificationListener() {
  useEffect(() => {
    // Request permission explicitly
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted') {
        Notification.requestPermission()
      }
    }

    const channel = supabase
      .channel('family-hub-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'shopping_list' },
        (payload: any) => {
          // Fallback visual alert so you see it instantly on screen even if browser notification blocks it
          alert(`Realtime Triggered! New item: ${payload.new.name || 'Check list'}`)

          if (Notification.permission === 'granted') {
            new Notification('Makharinskiy Hub: Shopping List', {
              body: `New item added: ${payload.new.name || 'Check the list'}`,
              icon: '/logo.jpg',
            })
          }
        }
      )
      .subscribe((status) => {
        console.log('Supabase Realtime status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return null
}
