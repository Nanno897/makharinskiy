'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import { Loader2, MessageCircle, SendHorizontal, Smile } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeTable } from '@/hooks/use-realtime-table'
import { useProfiles } from '@/hooks/use-profiles'
import { friendlyError, type Message } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { MemberAvatar } from './member-avatar'
import { EmptyState, ErrorState, InlineError, ListSkeleton, SectionHeader } from './states'
import { EmojiPicker } from './emoji-picker'
import { cn } from '@/lib/utils'
import { playChatToggleFeedback, triggerHaptic } from '@/lib/feedback'

function dayLabel(d: Date) {
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'EEEE, MMM d')
}

export function Chat({ userId }: { userId: string }) {
  const { data, error, isLoading, mutate } = useRealtimeTable<Message>('messages', {
    orderBy: 'created_at',
    ascending: false,
    limit: 200,
  })
  const { profiles } = useProfiles()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const messages = useMemo(() => [...(data ?? [])].reverse(), [data])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  async function send() {
    const content = text.trim()
    if (!content || sending) return
    setSending(true)
    setSendError(null)

    // Trigger subtle haptic and low warm chime on send
    triggerHaptic(25)
    playChatToggleFeedback()

    const { error } = await createClient().from('messages').insert({ content, user_id: userId })
    setSending(false)
    if (error) return setSendError(friendlyError(error))
    setText('')
    setPickerOpen(false)
    mutate()
  }

  function insertEmoji(emoji: string) {
    const el = inputRef.current
    const start = el?.selectionStart ?? text.length
    const end = el?.selectionEnd ?? text.length
    const next = text.slice(0, start) + emoji + text.slice(end)
    setText(next)
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(start + emoji.length, start + emoji.length)
    })
  }

  return (
    <section className="flex h-[calc(100svh-16rem)] min-h-[420px] flex-col md:h-[calc(100svh-1
