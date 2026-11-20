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
import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeTable } from '@/hooks/use-realtime-table'
import { useProfiles } from '@/hooks/use-profiles'
import { friendlyError, type FamilyEvent } from '@/lib/types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

  if (month === 1 && day === 1) return "Neujahr"
  if (month === 5 && day === 1) return "Tag der Arbeit"
  if (month === 10 && day === 3) return "Tag der Deutschen Einheit"
  if (month === 12 && day === 25) return "Weihnachten"
  if (month === 12 && day === 26) return "2. Weihnachtsfeiertag"
  if (month === 2 && day === 14) return "Valentinstag"
  if (month === 12 && day === 6) return "Nikolaus"
  if (month === 12 && day === 31) return "Silvester"

  const easter = getEasterSunday(year)
  const karfreitag = new Date(easter)
  karfreitag.setDate(easter.getDate() - 2)
  if (date.toDateString() === karfreitag.toDateString()) return "Karfreitag"

  const ostermontag = new Date(easter)
  ostermontag.setDate(easter.getDate() + 1)
  if (date.toDateString() === ostermontag.toDateString()) return "Ostermontag"

  return null
}

export function Schedule({ userId }: { userId: string }) {
  const { data, error, isLoading, mutate } = useRealtimeTable<FamilyEvent>('events', {
    orderBy: 'starts_at',
  })
  const { profiles } = useProfiles()
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [selected, setSelected] = useState(() => new Date())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(month)),
      end: endOfWeek(endOfMonth(month)),
    })
  }, [month])

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
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-rose-700 hover:bg-rose-600 text-white"
        >
          <CalendarPlus /> New event
        </Button>
      </SectionHeader>

      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <ErrorState onRetry={() => mutate()} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-white/[0.06] bg-neutral-950/40 p-4">
            <div className="mb-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMonth((m) => addMonths(m, -1))}
                className="text-amber-300"
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
                className="text-amber-300"
              >
                <ChevronRight />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-neutral-400">
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
                    className={cn(
                      'flex aspect-square flex-col items-center justify-start gap-1 rounded-xl p-1 text-sm',
                      !isSameMonth(day, month) && 'text-neutral-600',
                      isSameMonth(day, month) && !isSel && 'text-neutral-200',
                      isSel && 'bg-rose-800 text-white font-semibold',
                      !isSel && isToday(day) && 'ring-1 ring-amber-400 text-amber-300',
                    )}
                  >
                    <span>{format(day, 'd')}</span>
                    <span className="flex gap-0.5">
                      {holiday && <span className="size-1.5 rounded-full bg-amber-400" />}
                      {evs.slice(0, 3).map((ev) => (
                        <span
                          key={ev.id}
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: ev.color || '#f43f5e' }}
                        />
                      ))}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-300">
              {isToday(selected) ? 'Today' : format(selected, 'EEEE, MMM d')}
            </h3>

            <InlineError message={actionError} />

            <div className="flex flex-col gap-2">
              {activeHoliday && (
                <div className="rounded-2xl border border-amber-500/30 bg-neutral-950/40 p-4">
                  <div className="flex items-center gap-2 text-amber-300">
                    <Sparkles className="size-4" />
                    <span>{activeHoliday}</span>
                  </div>
                </div>
              )}

              {selectedEvents.length === 0 && !activeHoliday ? (
                <EmptyState icon={CalendarPlus} title="No events" hint="Nothing planned." />
              ) : (
                selectedEvents.map((ev) => {
                  const startDate = parseISO(ev.starts_at)
                  const endDate = ev.ends_at ? parseISO(ev.ends_at) : null
                  const isMultiDay = endDate && !isSameDay(startDate, endDate)

                  let timeText = 'All day'
                  if (ev.all_day) {
                    if (isMultiDay && endDate) {
                      timeText = format(startDate, 'MMM d') + ' - ' + format(endDate, 'MMM d')
                    }
                  } else {
                    timeText = format(startDate, 'h:mm a')
                    if (endDate) {
                      timeText = timeText + ' - ' + format(endDate, 'h:mm a')
                    }
                  }

                  return (
                    <div
                      key={ev.id}
                      className="rounded-2xl border border-white/[0.06] bg-neutral-950/40 p-4"
                      style={{ borderLeft: '3px solid ' + (ev.color || '#f43f5e') }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-white">{ev.title}</p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-neutral-400">
                            <Clock className="size-3" />
                            {timeText}
                          </p>
                          {ev.location && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-neutral-400">
                              <MapPin className="size-3" />
                              {ev.location}
                            </p>
                          )}
                        </div>
                        {ev.user_id === userId && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => remove(ev.id)}
                            className="text-neutral-500"
                          >
                            <Trash2 />
                          </Button>
                        )}
                      </div>

                      {ev.description && (
                        <p className="mt-2 text-sm text-neutral-300">{ev.description}</p>
                      )}

                      <div className="mt-3">
                        <MemberBadge profile={profiles[ev.user_id]} />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      <EventDialog
        userId={userId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultDate={selected}
        onCreated={() => mutate()}
      />
    </section>
  )
}

function EventDialog({
  userId,
  open,
  onOpenChange,
  defaultDate,
  onCreated,
}: {
  userId: string
  open: boolean
  onOpenChange: (o: boolean) => void
  defaultDate: Date
  onCreated: () => void
}) {
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [startTime, setStartTime] = useState('18:00')
  const [endTime, setEndTime] = useState('')
  const [allDay, setAllDay] = useState(true)
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(EVENT_COLORS[4])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [lastOpen, setLastOpen] = useState(open)
  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) {
      const d = format(defaultDate, 'yyyy-MM-dd')
      setStartDate(d)
      setEndDate(d)
      setError(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !startDate) {
      setError('Title and start date are required.')
      return
    }

    const finalEndDate = endDate || startDate
    if (finalEndDate < startDate) {
      setError('End date cannot be before start date.')
      return
    }

    const startsAt = allDay
      ? startOfDay(new Date(startDate))
      : new Date(startDate + 'T' + startTime)

    const endsAt = allDay
      ? endOfDay(new Date(finalEndDate))
      : endTime
        ? new Date(finalEndDate + 'T' + endTime)
        : null

    if (endsAt && endsAt <= startsAt) {
      setError('End time must be after start time.')
      return
    }

    setSaving(true)
    setError(null)

    const { error } = await createClient().from('events').insert({
      title: title.trim(),
      starts_at: startsAt.toISOString(),
      ends_at: endsAt ? endsAt.toISOString() : null,
      all_day: allDay,
      location: location.trim() || null,
      description: description.trim() || null,
      color,
      user_id: userId,
    })

    setSaving(false)
    if (error) {
      setError(friendlyError(error))
      return
    }

    setTitle('')
    setLocation('')
    setDescription('')
    setEndTime('')
    setAllDay(true)
    onCreated()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-white/[0.08] bg-neutral-950/90 text-white max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">New event</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Add something to the family calendar.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label>Title</Label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-white/10 bg-black/40 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>From</Label>
              <Input
                type="date"
                required
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  if (!endDate || endDate < e.target.value) setEndDate(e.target.value)
                }}
                className="border-white/10 bg-black/40 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label>To</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-white/10 bg-black/40 text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={allDay}
              onCheckedChange={(v) => setAllDay(v === true)}
            />
            <Label>All day</Label>
          </div>

          {!allDay && (
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Start time</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="border-white/10 bg-black/40 text-white"
                />
              </div>
              <div className="grid gap-2">
                <Label>End time</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="border-white/10 bg-black/40 text-white"
                />
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label>Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border-white/10 bg-black/40 text-white"
            />
          </div>

          <div className="grid gap-2">
            <Label>Notes</Label>
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-white/10 bg-black/40 text-white"
            />
          </div>

          <div>
            <Label className="mb-2 block">Color</Label>
            <div className="flex gap-2">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'size-7 rounded-full',
                    color === c && 'ring-2 ring-white',
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <InlineError message={error} />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-rose-700 text-white">
              {saving ? <Loader2 className="animate-spin" /> : <Plus />}
              Add event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
