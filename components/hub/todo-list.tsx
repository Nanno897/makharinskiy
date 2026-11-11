'use client'

import { useMemo, useState } from 'react'
import { format, isBefore, isToday, parseISO, startOfToday } from 'date-fns'
import { CalendarClock, ListTodo, Loader2, Plus, Star, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeTable } from '@/hooks/use-realtime-table'
import { useProfiles } from '@/hooks/use-profiles'
import { friendlyError, type Todo } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { MemberAvatar } from './member-avatar'
import { EmptyState, ErrorState, InlineError, ListSkeleton, SectionHeader } from './states'
import { cn } from '@/lib/utils'

type Filter = 'all' | 'active' | 'mine' | 'priority' | 'done'
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'all', label: 'All' },
  { id: 'mine', label: 'Mine' },
  { id: 'priority', label: 'Priority' },
  { id: 'done', label: 'Done' },
]

export function TodoList({ userId }: { userId: string }) {
  const { data, error, isLoading, mutate } = useRealtimeTable<Todo>('todos', { orderBy: 'created_at' })
  const { profiles } = useProfiles()
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState(false)
  const [filter, setFilter] = useState<Filter>('active')
  const [adding, setAdding] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const visible = useMemo(() => {
    const list = (data ?? []).filter((t) => {
      if (filter === 'active') return !t.completed
      if (filter === 'done') return t.completed
      if (filter === 'mine') return t.user_id === userId && !t.completed
      if (filter === 'priority') return t.priority && !t.completed
      return true
    })
    return list.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      if (a.priority !== b.priority) return a.priority ? -1 : 1
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date)
      if (a.due_date) return -1
      if (b.due_date) return 1
      return b.created_at.localeCompare(a.created_at)
    })
  }, [data, filter, userId])

  async function addTodo(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    setAdding(true)
    setActionError(null)
    const { error } = await createClient()
      .from('todos')
      .insert({ title: trimmed, due_date: dueDate || null, priority, user_id: userId })
    setAdding(false)
    if (error) return setActionError(friendlyError(error))
    setTitle('')
    setDueDate('')
    setPriority(false)
    mutate()
  }

  async function update(todo: Todo, patch: Partial<Todo>) {
    mutate((list) => list?.map((t) => (t.id === todo.id ? { ...t, ...patch } : t)), { revalidate: false })
    const { error } = await createClient().from('todos').update(patch).eq('id', todo.id)
    if (error) setActionError(friendlyError(error))
    mutate()
  }

  async function remove(id: string) {
    mutate((list) => list?.filter((t) => t.id !== id), { revalidate: false })
    const { error } = await createClient().from('todos').delete().eq('id', id)
    if (error) setActionError(friendlyError(error))
    mutate()
  }

  const activeCount = (data ?? []).filter((t) => !t.completed).length

  return (
    <section>
      <SectionHeader title="To-Do" subtitle={data ? `${activeCount} open task${activeCount === 1 ? '' : 's'}` : undefined} />

      {/* Transparent Charcoal Task-Entry Card */}
      <form onSubmit={addTodo} className="mb-4 rounded-2xl border border-white/[0.06] bg-neutral-950/40 backdrop-blur-md p-3 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="todo-title" className="sr-only">Task</label>
          <Input
            id="todo-title"
            placeholder="What needs doing?"
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 border-white/10 bg-black/40 text-white placeholder:text-neutral-500"
          />
          <label htmlFor="todo-due" className="sr-only">Due date</label>
          <Input 
            id="todo-due" 
            type="date" 
            value={dueDate} 
            onChange={(e) => setDueDate(e.target.value)} 
            className="sm:w-40 border-white/10 bg-black/40 text-white [color-scheme:dark]" 
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-pressed={priority}
            aria-label="Mark as priority"
            onClick={() => setPriority((p) => !p)}
            className={cn(
              'border-white/10 bg-black/40 text-neutral-400 hover:text-amber-400',
              priority && 'border-amber-500/50 bg-amber-950/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
            )}
          >
            <Star className={cn(priority && 'fill-amber-400')} />
          </Button>
          {/* Dark Burgundy Gradient Add Task Button */}
          <Button 
            type="submit" 
            disabled={adding || !title.trim()}
            className="bg-gradient-to-br from-rose-800 via-rose-950 to-neutral-950 hover:from-rose-700 hover:to-rose-900 text-white shadow-[0_0_20px_rgba(159,18,57,0.4)] border border-rose-900/50"
          >
            {adding ? <Loader2 className="animate-spin" /> : <Plus />}
            Add task
          </Button>
        </div>
        <InlineError message={actionError} />
      </form>

      {/* Filter Tabs with Wine-Red Outlines on Active */}
      <div role="tablist" aria-label="Filter tasks" className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'rounded-full border px-3.5 py-1 text-xs font-medium transition-all backdrop-blur-md',
              filter === f.id
                ? 'border-rose-900/80 bg-rose-950/40 text-white shadow-[0_0_15px_rgba(159,18,57,0.3)]'
                : 'border-white/[0.06] bg-neutral-950/40 text-neutral-400 hover:text-white',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState onRetry={() => mutate()} />
      ) : !visible.length ? (
        <EmptyState icon={ListTodo} title="Nothing here" hint="Add a task or change the filter." />
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((todo) => {
            const due = todo.due_date ? parseISO(todo.due_date) : null
            const overdue = due && !todo.completed && isBefore(due, startOfToday())
            return (
              <li
                key={todo.id}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border bg-neutral-950/40 backdrop-blur-md px-4 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all',
                  todo.priority && !todo.completed ? 'border-amber-500/40 bg-neutral-900/50' : 'border-white/[0.06]',
                  todo.completed && 'opacity-50 bg-neutral-950/20'
                )}
              >
                <Checkbox
                  id={`todo-${todo.id}`}
                  checked={todo.completed}
                  onCheckedChange={() => update(todo, { completed: !todo.completed })}
                  className="border-white/20 data-[state=checked]:bg-rose-700 data-[state=checked]:border-rose-700"
                />
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor={`todo-${todo.id}`}
                    className={cn('block cursor-pointer truncate text-sm text-white font-medium', todo.completed && 'text-neutral-400 line-through')}
                  >
                    {todo.title}
                  </label>
                  {due && (
                    <span
                      className={cn(
                        'mt-0.5 inline-flex items-center gap-1 text-xs',
                        overdue ? 'text-red-400' : isToday(due) ? 'text-amber-400' : 'text-neutral-400',
                      )}
                    >
                      <CalendarClock className="size-3" aria-hidden="true" />
                      {overdue ? 'Overdue · ' : isToday(due) ? 'Today · ' : ''}
                      {format(due, 'EEE, MMM d')}
                    </span>
                  )}
                </div>
                <MemberAvatar profile={profiles[todo.user_id]} size="sm" />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-pressed={todo.priority}
                  aria-label={todo.priority ? 'Remove priority' : 'Mark as priority'}
                  onClick={() => update(todo, { priority: !todo.priority })}
                  className={cn(todo.priority ? 'text-amber-400 bg-amber-950/30' : 'text-neutral-500 hover:text-amber-400')}
                >
                  <Star className={cn(todo.priority && 'fill-amber-400')} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(todo.id)}
                  aria-label={`Delete ${todo.title}`}
                  className="text-neutral-500 hover:text-red-400 hover:bg-red-950/30"
                >
                  <Trash2 />
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
