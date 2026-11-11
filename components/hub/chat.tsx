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

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card">
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
                      <div className="my-4 flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.2em] text-gold/80">
                        <span className="h-px flex-1 bg-border" />
                        {dayLabel(date)}
                        <span className="h-px flex-1 bg-border" />
                      </div>
                    )}
                    <div className={cn('flex items-end gap-2', mine && 'flex-row-reverse', !grouped && 'mt-3')}>
                      {grouped ? (
                        <span className="w-9 shrink-0" />
                      ) : (
                        <MemberAvatar profile={author} gold={mine} />
                      )}
                      <div className={cn('flex max-w-[78%] flex-col', mine ? 'items-end' : 'items-start')}>
                        {!grouped && (
                          <span className="mb-1 flex items-baseline gap-2 px-1 text-xs">
                            <span className="font-medium" style={{ color: author?.badge_color }}>
                              {mine ? 'You' : (author?.display_name ?? 'Member')}
                            </span>
                            <time dateTime={m.created_at} className="text-muted-foreground">
                              {format(date, 'h:mm a')}
                            </time>
                          </span>
                        )}
                        <p
                          className={cn(
                            'whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm',
                            mine ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm bg-secondary'
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

        <div className="relative border-t border-border p-3">
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
              className={cn(pickerOpen ? 'text-gold' : 'text-muted-foreground')}
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
              className="max-h-32 min-h-9 flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button type="submit" size="icon" disabled={sending || !text.trim()} aria-label="Send message" className="glow-red">
              {sending ? <Loader2 className="animate-spin" /> : <SendHorizontal />}
            </Button>
          </form>
          <InlineError message={sendError} />
        </div>
      </div>
    </section>
  )
}
