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

      <form onSubmit={addTodo} className="mb-4 rounded-2xl border border-border bg-card p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="todo-title" className="sr-only">Task</label>
          <Input
            id="todo-title"
            placeholder="What needs doing?"
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1"
          />
          <label htmlFor="todo-due" className="sr-only">Due date</label>
          <Input id="todo-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="sm:w-40 [color-scheme:dark]" />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-pressed={priority}
            aria-label="Mark as priority"
            onClick={() => setPriority((p) => !p)}
            className={cn(priority && 'border-gold/60 text-gold')}
          >
            <Star className={cn(priority && 'fill-gold')} />
          </Button>
          <Button type="submit" disabled={adding || !title.trim()}>
            {adding ? <Loader2 className="animate-spin" /> : <Plus />}
            Add task
          </Button>
        </div>
        <InlineError message={actionError} />
      </form>

      <div role="tablist" aria-label="Filter tasks" className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              filter === f.id
                ? 'border-primary bg-primary/15 text-red-400'
                : 'border-border text-muted-foreground hover:text-foreground',
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
                  'flex items-center gap-3 rounded-xl border bg-card px-4 py-3',
                  todo.priority && !todo.completed ? 'border-gold/30' : 'border-border',
                )}
              >
                <Checkbox
                  id={`todo-${todo.id}`}
                  checked={todo.completed}
                  onCheckedChange={() => update(todo, { completed: !todo.completed })}
                  className="data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                />
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor={`todo-${todo.id}`}
                    className={cn('block cursor-pointer truncate text-sm', todo.completed && 'text-muted-foreground line-through')}
                  >
                    {todo.title}
                  </label>
                  {due && (
                    <span
                      className={cn(
                        'mt-0.5 inline-flex items-center gap-1 text-xs',
                        overdue ? 'text-red-400' : isToday(due) ? 'text-gold' : 'text-muted-foreground',
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
                  className={todo.priority ? 'text-gold' : 'text-muted-foreground'}
                >
                  <Star className={cn(todo.priority && 'fill-gold')} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(todo.id)}
                  aria-label={`Delete ${todo.title}`}
                  className="text-muted-foreground hover:text-red-500"
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
