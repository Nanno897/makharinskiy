'use client'

import { useState } from 'react'
import { Plus, Trash2, FileText, Check, X, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface ShoppingItem {
  id: string
  name: string
  quantity: string
  note?: string
  completed: boolean
}

export function ShoppingList({ userId }: { userId: string }) {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  
  // Note editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const newItem: ShoppingItem = {
      id: crypto.randomUUID(),
      name: name.trim(),
      quantity: quantity.trim() || '1',
      completed: false,
    }

    setItems((prev) => [...prev, newItem])
    setName('')
    setQuantity('')
  }

  const toggleComplete = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const startEditingNote = (item: ShoppingItem) => {
    setEditingNoteId(item.id)
    setNoteText(item.note || '')
  }

  const saveNote = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, note: noteText.trim() } : item
      )
    )
    setEditingNoteId(null)
    setNoteText('')
  }

  return (
    <div className="space-y-4">
      {/* Title Header */}
      <div className="flex items-center gap-2 pb-1 border-b border-neutral-800">
        <ShoppingCart className="size-5 text-red-500" />
        <h2 className="text-lg font-semibold text-white">Shopping List</h2>
      </div>

      {/* Input form for adding new item & quantity */}
      <form onSubmit={handleAddItem} className="flex gap-2">
        <Input
          type="text"
          placeholder="Item name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 bg-neutral-900 border-neutral-800 text-white"
        />
        <Input
          type="text"
          placeholder="Qty"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-20 bg-neutral-900 border-neutral-800 text-white"
        />
        <Button type="submit" size="icon" className="bg-red-600 hover:bg-red-700 text-white shrink-0">
          <Plus className="size-5" />
        </Button>
      </form>

      {/* Flat Item List (No Categories) */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-center text-sm text-neutral-500 py-6">No items on the shopping list yet.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 rounded-lg border border-neutral-800 bg-neutral-900/50 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                {/* Checkbox + Name + Quantity */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleComplete(item.id)}
                    className="size-4 rounded border-neutral-700 bg-neutral-800 text-red-600 focus:ring-0"
                  />
                  <span
                    className={`font-medium truncate ${
                      item.completed ? 'line-through text-neutral-500' : 'text-white'
                    }`}
                  >
                    {item.name}
                  </span>
                  {item.quantity && (
                    <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 shrink-0">
                      {item.quantity}
                    </span>
                  )}
                </div>

                {/* Actions: Note button & Delete */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => startEditingNote(item)}
                    className={`size-8 hover:bg-neutral-800 ${
                      item.note ? 'text-amber-400' : 'text-neutral-400'
                    }`}
                    title="Add / Edit Note"
                  >
                    <FileText className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    className="size-8 text-neutral-400 hover:text-red-400 hover:bg-neutral-800"
                  >
                    <Trash2 className="size-4" />
