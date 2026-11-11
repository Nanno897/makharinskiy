'use client'

import { useState } from 'react'
import { Plus, Trash2, FileText, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeTable } from '@/hooks/use-realtime-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState, ErrorState, ListSkeleton } from './states'
import { playCheckoffFeedback } from '@/lib/feedback'

export interface ShoppingItem {
  id: string
  name: string
  quantity: string
  note?: string | null
  completed: boolean
  user_id?: string
  created_at?: string
}

export function ShoppingList({ userId }: { userId: string }) {
  const { data: items = [], isLoading, error, mutate } = useRealtimeTable<ShoppingItem>('shopping_list', {
    orderBy: 'created_at',
  })

  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    const newItem = {
      name: trimmedName,
      quantity: quantity.trim() || '1',
      completed: false,
      user_id: userId,
    }

    // Optimistic UI update
    const tempId = crypto.randomUUID()
    mutate((prev) => [...(prev ?? []), { ...newItem, id: tempId }], { revalidate: false })
    setName('')
    setQuantity('')

    const { error } = await createClient().from('shopping_list').insert(newItem)
    if (error) {
      console.error('Error adding item:', error)
      mutate()
    }
  }

  const toggle = async (id: string, currentCompleted: boolean) => {
    // Trigger tactile tap & warm audio chime when marking item as completed
    if (!currentCompleted) {
      playCheckoffFeedback()
    }

    mutate((prev) => prev?.map((i) => (i.id === id ? { ...i, completed: !currentCompleted } : i)), {
      revalidate: false,
    })

    const { error } = await createClient()
      .from('shopping_list')
      .update({ completed: !currentCompleted })
      .eq('id', id)

    if (error) {
      console.error('Error toggling item:', error)
      mutate()
    }
  }

  const remove = async (id: string) => {
    mutate((prev) => prev?.filter((i) => i.id !== id), { revalidate: false })

    const { error } = await createClient().from('shopping_list').delete().eq('id', id)
    if (error) {
      console.error('Error removing item:', error)
      mutate()
    }
  }

  const saveNote = async (id: string) => {
    const trimmedNote = noteText.trim()
    mutate((prev) => prev?.map((i) => (i.id === id ? { ...i, note: trimmedNote } : i)), {
      revalidate: false,
    })
    setEditingId(null)
    setNoteText('')

    const { error } = await createClient()
      .from('shopping_list')
      .update({ note: trimmedNote || null })
      .eq('id', id)

    if (error) {
      console.error('Error saving note:', error)
      mutate()
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-160px)] bg-transparent p-2 sm:p-4 flex flex-col justify-between">
      <div className="space-y-5">
        <div className="pt-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-wide text-white">
            Shopping list
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">Manage items needed for home</p>
        </div>

        <form onSubmit={addItem} className="flex gap-2">
          <Input
            placeholder="Item name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-neutral-950/60 border-rose-950/40 text-white placeholder:text-neutral-500 backdrop-blur-sm"
          />
          <Input
            placeholder="Qty"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-20 bg-neutral-950/60 border-rose-950/40 text-white placeholder:text-neutral-500 backdrop-blur-sm"
          />
          <Button type="submit" size="icon" className="bg-red-600 hover:bg-red-700 text-white shrink-0 shadow-lg">
            <Plus className="size-5" />
          </Button>
        </form>

        {isLoading ? (
          <ListSkeleton rows={4} />
        ) : error ? (
          <ErrorState onRetry={() => mutate()} />
        ) : items.length === 0 ? (
          <EmptyState icon={Plus} title="No items on the shopping list yet" hint="Add your first item above." />
        ) : (
          <div className="max-h-[55vh] overflow-y-auto pr-1 space-y-1">
            {items.map((i) => (
              <div key={i.id} className="flex flex-col gap-1 border-b border-rose-950/30 py-3 px-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={i.completed}
                      onChange={() => toggle(i.id, i.completed)}
                      className="size-4 rounded border-neutral-700 bg-neutral-900 text-red-600 focus:ring-red-600 cursor-pointer"
                    />
                    <span
                      className={`text-base font-medium truncate ${
                        i.completed ? 'line-through text-neutral-500' : 'text-neutral-100'
                      }`}
                    >
                      {i.name}
                    </span>
                    {i.quantity && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-rose-950/40 text-neutral-300 border border-rose-900/30">
                        {i.quantity}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingId(i.id)
                        setNoteText(i.note || '')
                      }}
                      className={`size-8 ${i.note ? 'text-amber-400' : 'text-neutral-400'}`}
                    >
                      <FileText className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(i.id)}
                      className="size-8 text-neutral-400 hover:text-red-400"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                {i.note && editingId !== i.id && <p className="text-xs text-neutral-400 pl-7 italic">Note: {i.note}</p>}

                {editingId === i.id && (
                  <div className="flex items-center gap-2 pl-7 pt-1">
                    <Input
                      placeholder="Add a note..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="flex-1 h-8 text-xs bg-neutral-950/80 border-neutral-700 text-white"
                      autoFocus
                    />
                    <Button type="button" size="icon" onClick={() => saveNote(i.id)} className="size-8 bg-emerald-600 text-white">
                      <Check className="size-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setEditingId(null)} className="size-8 text-neutral-400">
                      <X className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
