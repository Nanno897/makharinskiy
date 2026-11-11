'use client'

import { useState } from 'react'
import { Plus, Trash2, FileText, Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeTable } from '@/hooks/use-realtime-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState, ErrorState, ListSkeleton } from './states'

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
          <EmptyState icon={Plus} title
