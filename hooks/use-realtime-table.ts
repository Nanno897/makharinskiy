'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'

type Options = {
  orderBy: string
  ascending?: boolean
  limit?: number
}

export function useRealtimeTable<T>(table: string, { orderBy, ascending = true, limit }: Options) {
  const key = ['table', table, orderBy, ascending, limit ?? 0] as const

  const swr = useSWR<T[]>(key, async () => {
    const supabase = createClient()
    let query = supabase.from(table).select('*').order(orderBy, { ascending })
    if (limit) query = query.limit(limit)
    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as T[]
  })

  const { mutate } = swr

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`rt-${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        mutate()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, mutate])

  return swr
}
