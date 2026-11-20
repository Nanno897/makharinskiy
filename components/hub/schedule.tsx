'use client'

import { useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { CalendarPlus, ChevronLeft, ChevronRight, Clock, Loader2, MapPin, Plus, Sparkles, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeTable } from '@/hooks/use-realtime-table'
import { useProfiles } from '@/hooks/use-profiles'
import { friendlyError, type FamilyEvent } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { MemberBadge } from './member-avatar'
import { EmptyState, ErrorState, InlineError, ListSkeleton, SectionHeader } from './states'
import { cn } from '@/lib/utils'

const EVENT_COLORS = ['#dc2626', '#eab308', '#f59e0b', '#3b82f6', '#10b981', '#a855f7']

function getEasterSunday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

function getGermanHoliday(date: Date): string | null {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()

  if (month === 1 && day === 1) return "Neujahr (New Year's Day)"
  if (month === 5 && day === 1) return "Tag der Arbeit (Labour Day)"
  if (month === 10 && day === 3) return "Tag der Deutschen Einheit"
  if (month === 12 && day === 25) return "1. Weihnachtsfeiertag (Christmas)"
  if (month === 12 && day === 26) return "2. Weihnachtsfeiertag (Boxing Day)"
  if (month === 2 && day === 14) return "Valentinstag (Valentine's Day)"
  if (month === 10 && day === 31) return "Halloween"
  if (month === 12 && day === 6) return "Nikolaus"
  if (month === 12 && day === 31) return "Silvester (New Year's Eve)"

  const easter = getEasterSunday(year)

  const karfreitag = new Date(easter)
  karfreitag.setDate(easter.getDate() - 2)
  if (date.toDateString() === karfreitag.toDateString()) return "Karfreitag (Good Friday)"

  const ostermontag = new Date(easter)
  ostermontag.setDate(easter.getDate() + 1)
  if (date.toDateString() === ostermontag.toDateString()) return "Ostermontag (Easter Monday)"

  const himmelfahrt = new Date(easter)
  himmelfahrt.setDate(easter.getDate() + 39)
  if (date.toDateString() === himmelfahrt.toDateString()) return "Christi Himmelfahrt (Ascension Day)"

  const pfingstmontag = new Date(easter)
  pfingstmontag.setDate(easter.getDate() + 50)
  if (date.toDateString() === pfingstmontag.toDateString()) return "Pfingstmontag (Whit Monday)"

  return null
}

export function Schedule({ userId }: { userId: string }) {
  const { data, error, isLoading, mutate } = useRealtimeTable<FamilyEvent>('events', { orderBy: 'starts_at' })
  const { profiles } = useProfiles()
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [selected, setSelected] = useState(() => new Date())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const days = useMemo(
    () => eachDayOfInterval({ start: startOfWeek(startOfMonth(month)), end: endOfWeek(endOfMonth(month)) }),
    [month],
  )

  // Multi-day support
  const eventsByDay = useMemo(() => {
    const map = new Map<string, FamilyEvent[]>()
    for (const ev of data ?? []) {
      const start = startOfDay(parseISO(ev.starts_at))
      const end = ev.ends_at ? endOfDay(parseISO(ev.ends_at)) : start
      const range = eachDayOfInterval({ start, end })
      for (const day of range) {
        const key = format(day, 'yyyy-MM-dd')
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(ev)
      }
    }
    return map
  }, [data])

  const selectedEvents = eventsByDay.get(format(selected, 'yyyy-MM-dd')) ?? []
  const activeHoliday = getGermanHoliday(selected)

  async function remove(id: string) {
    mutate((list) => list?.filter((e) => e.id !== id), { revalidate: false })
    const { error } = await createClient().from('events').delete().eq('id', id)
    if (error) setActionError(friendlyError(error))
    mutate()
  }

  return (
    <section>
      <SectionHeader title="Family Schedule" subtitle="Shared calendar for everyone">
        <Button onClick={() => setDialogOpen(true)} className="bg-rose-700 hover:bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]">
          <CalendarPlus /> New event
        </Button>
      </SectionHeader>

      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <ErrorState onRetry={() => mutate()} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-white/[0.06] bg-neutral-950/40 backdrop-blur-md p-4 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
            <div className="mb-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMonth((m) => addMonths(m, -1))}
                aria-label="Previous month"
                className="text-amber-300 hover:text-amber-200 hover:bg-white/[0.04]"
              >
                <ChevronLeft />
              </Button>
              <h3 className="font-serif text-lg font-semibold text-white">
                {format(month, 'MMMM yyyy')}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMonth((m) => addMonths(m, 1))}
                aria-label="Next month"
                className="text-amber-300 hover:text-amber-200 hover:bg-white/[0.04]"
              >
                <ChevronRight />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wider text-neutral-400">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {days.map((day) => {
                const evs = eventsByDay.get(format(day, 'yyyy-MM-dd')) ?? []
                const holiday = getGermanHoliday(day)
                const isSel = isSameDay(day, selected)

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setSelected(day)}
                    aria-label={format(day, 'EEEE, MMMM d')}
                    aria-pressed={isSel}
                    className={cn(
                      'flex aspect-square flex-col items-center justify-start gap-1 rounded-xl p-1 text-sm transition-all sm:p-2',
                      !isSameMonth(day, month) && 'text-neutral-600',
                      isSameMonth(day, month) && !isSel && 'text-neutral-200 hover:bg-white/[0.04]',
                      isSel && 'bg-gradient-to-br from-rose-700 via-rose-900 to-rose-950 text-white font-semibold shadow-[0_0_20px_rgba(159,18,57,0.5)] border border-rose-800/60 scale-105 z-10',
                      !isSel && isToday(day) && 'ring-1 ring-amber-400/60 text-amber-300',
                    )}
                  >
                    <span className="font-medium">{format(day, 'd')}</span>
                    <span className="flex gap-0.5 items-center">
                      {holiday && <span className="size-1.5 rounded-full bg-amber-400" title={holiday} />}
                      {evs.slice(0, 3).map((ev) => (
                        <span
                          key={ev.id}
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: ev.color || '#f43f5e' }}
                          title={ev.title}
                        />
                      ))}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                {isToday(selected) ? 'Today' : format(selected, 'EEEE, MMM d')}
              </h3>
              <img
                src="/franco-chibi.png"
                alt="Franco Chibi"
                className="size-14 sm:size-16 object-contain shrink-0 pointer-events-none select-none animate-bounce [animation-duration:3s] drop-shadow
