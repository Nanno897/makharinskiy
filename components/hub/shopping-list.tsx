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
    <div className="relative min-h-[calc(100vh-160px)] bg-transparent p-2 sm:p-4 flex flex-col justify-between pb-16">
      <div className="space-y-5">
        {/* Header with Top-Right Floating Chibi */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h2 className="font-serif text-2
