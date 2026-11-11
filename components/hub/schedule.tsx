'use client'

import { useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
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

// Helper to calculate Easter Sunday for moveable German holidays
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

  // Fixed official & unofficial holidays
  if (month === 1 && day === 1) return "Neujahr (New Year's Day)"
  if (month === 5 && day === 1) return "Tag der Arbeit (Labour Day)"
  if (month === 10 && day === 3) return "Tag der Deutschen Einheit"
  if (month === 12 && day === 25) return "1. Weihnachtsfeiertag (Christmas)"
  if (month === 12 && day === 26) return "2. Weihnachtsfeiertag (Boxing Day)"
  if (month === 2 && day === 14) return "Valentinstag (Valentine's Day)"
  if (month === 10 && day === 31) return "Halloween"
  if (month === 12 && day === 6) return "Nikolaus"
  if (month === 12 && day === 31) return "Silvester (New Year's Eve)"

  // Moveable Easter-based holidays
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

  const eventsByDay = useMemo(() => {
    const map = new Map<string, FamilyEvent[]>()
    for (const ev of data ?? []) {
      const key = format(parseISO(ev.starts_at), 'yyyy-MM-dd')
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(ev)
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
        <Button onClick={() => setDialogOpen(true)}>
          <CalendarPlus /> New event
        </Button>
      </SectionHeader>

      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <ErrorState onRetry={() => mutate()} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-4 flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setMonth((m) => addMonths(m, -1))} aria-label="Previous month">
                <ChevronLeft />
              </Button>
              <h3 className="font-serif text-lg font-semibold" aria-live="polite">
                {format(month, 'MMMM yyyy')}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setMonth((m) => addMonths(m, 1))} aria-label="Next month">
                <ChevronRight />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
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
                    aria-label={`${format(day, 'EEEE, MMMM d')}${holiday ? `, ${holiday}` : ''}${evs.length ? `, ${evs.length} event${evs.length > 1 ? 's' : ''}` : ''}`}
                    aria-pressed={isSel}
                    className={cn(
                      'flex aspect-square flex-col items-center justify-start gap-1 rounded-lg p-1 text-sm transition-colors sm:p-2',
                      !isSameMonth(day, month) && 'text-muted-foreground/40',
                      isSel ? 'bg-primary text-primary-foreground glow-red' : 'hover:bg-accent',
                      !isSel && isToday(day) && 'ring-1 ring-gold text-gold',
                    )}
                  >
                    <span className="font-medium">{format(day, 'd')}</span>
                    <span className="flex gap-0.5 items-center">
                      {holiday && <span className="size-1.5 rounded-full bg-gold" title={holiday} />}
                      {evs.length > 0 && evs.slice(0, 2).map((ev) => (
                        <span
                          key={ev.id}
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: isSel ? '#fff' : ev.color }}
                        />
                      ))}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {isToday(selected) ? 'Today' : format(selected, 'EEEE, MMM d')}
            </h3>
            <InlineError message={actionError} />
            
            <div className="flex flex-col gap-2">
              {activeHoliday && (
                <div className="rounded-xl border border-gold/40 bg-gold/10 p-4">
                  <div className="flex items-center gap-2 text-gold font-medium">
                    <Sparkles className="size-4" />
                    <span>{activeHoliday}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">German Holiday / Observance</p>
                </div>
              )}

              {selectedEvents.length === 0 && !activeHoliday ? (
                <EmptyState icon={CalendarPlus} title="No events" hint="Nothing planned for this day." />
              ) : (
                selectedEvents.map((ev) => (
                  <li
                    key={ev.id}
                    className="list-none rounded-xl border border-border bg-card p-4"
                    style={{ borderLeft: `3px solid ${ev.color}` }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium">{ev.title}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" aria-hidden="true" />
                          {ev.all_day
                            ? 'All day'
                            : `${format(parseISO(ev.starts_at), 'h:mm a')}${ev.ends_at ? ` – ${format(parseISO(ev.ends_at), 'h:mm a')}` : ''}`}
                        </p>
                        {ev.location && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="size-3" aria-hidden="true" />
                            {ev.location}
                          </p>
                        )}
                      </div>
                      {ev.user_id === userId && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => remove(ev.id)}
                          aria-label={`Delete ${ev.title}`}
                          className="text-muted-foreground hover:text-red-500"
                        >
                          <Trash2 />
                        </Button>
                      )}
                    </div>
                    {ev.description && <p className="mt-2 text-sm text-muted-foreground">{ev.description}</p>}
                    <div className="mt-3">
                      <MemberBadge profile={profiles[ev.user_id]} />
                    </div>
                  </li>
                ))
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
  const [date, setDate] = useState('')
  const [start, setStart] = useState('18:00')
  const [end, setEnd] = useState('')
  const [allDay, setAllDay] = useState(false)
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(EVENT_COLORS[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [lastOpen, setLastOpen] = useState(open)
  if (open !== lastOpen) {
    setLastOpen(open)
    if (open) {
      setDate(format(defaultDate, 'yyyy-MM-dd'))
      setError(null)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !date) return setError('Title and date are required.')
    const startsAt = new Date(`${date}T${allDay ? '00:00' : start}`)
    const endsAt = !allDay && end ? new Date(`${date}T${end}`) : null
    if (endsAt && endsAt <= startsAt) return setError('End time must be after start time.')
    setSaving(true)
    setError(null)
    const { error } = await createClient()
      .from('events')
      .insert({
        title: title.trim(),
        starts_at: startsAt.toISOString(),
        ends_at: endsAt?.toISOString() ?? null,
        all_day: allDay,
        location: location.trim() || null,
        description: description.trim() || null,
        color,
        user_id: userId,
      })
    setSaving(false)
    if (error) return setError(friendlyError(error))
    setTitle('')
    setLocation('')
    setDescription('')
    setEnd('')
    onCreated()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-border bg-card sm:max-w-md">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">New event</DialogTitle>
            <DialogDescription>Add something to the family calendar.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="ev-title">Title</Label>
            <Input id="ev-title" required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 grid gap-2">
              <Label htmlFor="ev-date">Date</Label>
              <Input id="ev-date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="[color-scheme:dark]" />
            </div>
            {!allDay && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="ev-start">Start</Label>
                  <Input id="ev-start" type="time" value={start} onChange={(e) => setStart(e.target.value)} className="[color-scheme:dark]" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ev-end">End (optional)</Label>
                  <Input id="ev-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="[color-scheme:dark]" />
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="ev-allday" checked={allDay} onCheckedChange={(v) => setAllDay(v === true)} />
            <Label htmlFor="ev-allday">All day</Label>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ev-location">Location</Label>
            <Input id="ev-location" maxLength={200} value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ev-desc">Notes</Label>
            <Textarea id="ev-desc" maxLength={1000} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Color</legend>
            <div className="flex gap-2">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Event color ${c}`}
                  aria-pressed={color === c}
                  onClick={() => setColor(c)}
                  className={cn('size-7 rounded-full ring-offset-2 ring-offset-card', color === c && 'ring-2 ring-white')}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </fieldset>
          <InlineError message={error} />
          <DialogFooter className="bg-transparent">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : <Plus />}
              Add event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
