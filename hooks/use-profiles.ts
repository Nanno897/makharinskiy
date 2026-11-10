'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

export function useProfiles() {
  const swr = useSWR<Record<string, Profile>>('profiles', async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, badge_color')
    if (error) throw error
    return Object.fromEntries((data ?? []).map((p) => [p.id, p as Profile]))
  })
  return { profiles: swr.data ?? {}, ...swr }
}
