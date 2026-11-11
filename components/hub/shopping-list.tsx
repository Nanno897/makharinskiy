'use client'

import { useState } from 'react'
import { Plus, Trash2, FileText, Check, X } from 'lucide-react'
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
    <div className="space-y-6">
      {/* Script Title Header */}
      <div className="text-center py-2">
        <h2 className="text-4xl font-serif tracking-wide text-rose-300 italic">
          Shopping list
        </h2>
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

      {/* Lined-style Flat Item List */}
      <div className="space-y-1">
        {items.length === 0 ? (
          <p className="text-center text-sm text-neutral-500 py-8">No items on the shopping list yet.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-1 border-b border-neutral-800/80 py-3 px-1 transition-colors hover:bg-neutral-900/30"
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
                    className={`text-base font-medium truncate ${
                      item.completed ? 'line-through text-neutral-500' : 'text-neutral-100'
                    }`}
                  >
                    {item.name}
                  </span>
                  {item.quantity && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 shrink-0">
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
                      item.note ? 'text-rose-400' : 'text-neutral-500'
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
                    className="size-8 text-neutral-500 hover:text-red-400 hover:bg-neutral-800"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Display existing note if not editing */}
              {item.note && editingNoteId !== item.id && (
                <p className="text-xs text-neutral-400 pl-7 italic">
                  Note: {item.note}
                </p>
              )}

              {/* Inline Note Editor */}
              {editingNoteId === item.id && (
                <div className="flex items-center gap-2 pl-7 pt-1">
                  <Input
                    type="text"
                    placeholder="Add a note (brand, size, etc.)..."
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="flex-1 h-8 text-xs bg-neutral-900 border-neutral-700 text-white"
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={() => saveNote(item.id)}
                    className="size-8 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                  >
                    <Check className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingNoteId(null)}
                    className="size-8 text-neutral-400 hover:bg-neutral-800 shrink-0"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
