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
    <section className="flex h-[calc(100svh-16rem)] min-h-[420px] flex-col md:h-[calc(100svh-12rem)]">
      <SectionHeader title="Family Chat" subtitle="Live with everyone at home" />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-neutral-950/40 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4" aria-live="polite" aria-label="Messages">
          {isLoading ? (
            <ListSkeleton rows={4} />
          ) : error ? (
            <ErrorState onRetry={() => mutate()} />
          ) : !messages.length ? (
            <EmptyState icon={MessageCircle} title="No messages yet" hint="Say hello to the family." />
          ) : (
            <ol className="flex flex-col gap-1">
              {messages.map((m, i) => {
                const prev = messages[i - 1]
                const date = parseISO(m.created_at)
                const newDay = !prev || format(parseISO(prev.created_at), 'yyyy-MM-dd') !== format(date, 'yyyy-MM-dd')
                const grouped =
                  !newDay && prev?.user_id === m.user_id && date.getTime() - parseISO(prev.created_at).getTime() < 5 * 60_000
                const mine = m.user_id === userId
                const author = profiles[m.user_id]
                return (
                  <li key={m.id}>
                    {newDay && (
                      <div className="my-4 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.2em] text-amber-300/80">
                        <span className="h-px flex-1 bg-white/[0.06]" />
                        {dayLabel(date)}
                        <span className="h-px flex-1 bg-white/[0.06]" />
                      </div>
                    )}
                    <div className={cn('flex items-end gap-2', mine && 'flex-row-reverse', !grouped && 'mt-3')}>
                      {grouped ? (
                        <span className="w-9 shrink-0" />
                      ) : (
                        <MemberAvatar profile={author} />
                      )}
                      <div className={cn('flex max-w-[78%] flex-col', mine ? 'items-end' : 'items-start')}>
                        {!grouped && (
                          <span className="mb-1 flex items-baseline gap-2 px-1 text-xs">
                            <span className="font-medium" style={{ color: author?.badge_color ?? '#fcd34d' }}>
                              {mine ? 'You' : (author?.display_name ?? 'Member')}
                            </span>
                            <time dateTime={m.created_at} className="text-neutral-500">
                              {format(date, 'h:mm a')}
                            </time>
                          </span>
                        )}
                        <p
                          className={cn(
                            'whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm',
                            mine ? 'rounded-br-sm bg-gradient-to-br from-rose-700 via-rose-900 to-rose-950 text-white shadow-[0_0_15px_rgba(159,18,57,0.3)] border border-rose-800/60' : 'rounded-bl-sm bg-neutral-900/80 border border-white/[0.06] text-neutral-200'
                          )}
                          title={format(date, 'PPpp')}
                        >
                          {m.content}
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>

        <div className="relative border-t border-white/[0.06] p-3 bg-neutral-950/60">
          {pickerOpen && (
            <div className="absolute bottom-full left-3 mb-2">
              <EmojiPicker onSelect={insertEmoji} onClose={() => setPickerOpen(false)} />
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send()
            }}
            className="flex items-end gap-2"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Emoji picker"
              aria-expanded={pickerOpen}
              onClick={() => {
                triggerHaptic(15)
                playChatToggleFeedback()
                setPickerOpen((o) => !o)
              }}
              className={cn('text-neutral-400 hover:text-amber-300 hover:bg-white/[0.04]', pickerOpen && 'text-amber-300')}
            >
              <Smile />
            </Button>
            <label htmlFor="chat-input" className="sr-only">Message</label>
            <textarea
              id="chat-input"
              ref={inputRef}
              rows={1}
              maxLength={2000}
              value={text}
              placeholder="Message the family…"
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  if (e.nativeEvent.isComposing || e.keyCode === 229) return
                  e.preventDefault()
                  send()
                }
              }}
              className="max-h-32 min-h-9 flex-1 resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-rose-700"
            />
            <Button type="submit" size="icon" disabled={sending || !text.trim()} aria-label="Send message" className="bg-rose-700 hover:bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]">
              {sending ? <Loader2 className="animate-spin" /> : <SendHorizontal />}
            </Button>
          </form>
          <InlineError message={sendError} />
        </div>
      </div>
    </section>
  )
}
