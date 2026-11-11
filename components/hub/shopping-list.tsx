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
  const [editingId, setEditingId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

  const addItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: name.trim(), quantity: quantity.trim() || '1', completed: false }
    ])
    setName('')
    setQuantity('')
  }

  const toggle = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i)))
  }

  const remove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const saveNote = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, note: noteText.trim() } : i)))
    setEditingId(null)
    setNoteText('')
  }

  return (
    <div className="relative min-h-[calc(100vh-140px)] bg-transparent p-2 sm:p-4 flex flex-col justify-between">
      <div className="space-y-5">
        <div className="pt-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-wide text-white">
            Shopping list
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">Manage items needed for home</p>
        </div>

        <form onSubmit={addItem} className="flex gap-2">
          <Input placeholder="Item name..." value={name} onChange={(e) => setName(e.target.value)} className="flex-1 bg-neutral-950/60 border-rose-950/40 text-white placeholder:text-neutral-500 backdrop-blur-sm" />
          <Input placeholder="Qty" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-20 bg-neutral-950/60 border-rose-950/40 text-white placeholder:text-neutral-500 backdrop-blur-sm" />
          <Button type="submit" size="icon" className="bg-red-600 hover:bg-red-700 text-white shrink-0 shadow-lg">
            <Plus className="size-5" />
          </Button>
        </form>

        <div className="space-y-1">
          {items.length === 0 ? (
            <p className="text-center text-sm text-neutral-400 py-12">No items on the shopping list yet.</p>
          ) : (
            items.map((i) => (
              <div key={i.id} className="flex flex-col gap-1 border-b border-rose-950/30 py-3 px-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input type="checkbox" checked={i.completed} onChange={() => toggle(i.id)} className="size-4 rounded border-neutral-700 bg-neutral-900 text-red-600 focus:ring-red-600" />
                    <span className={`text-base font-medium truncate ${i.completed ? 'line-through text-neutral-500' : 'text-neutral-100'}`}>{i.name}</span>
                    {i.quantity && <span className="text-xs px-2 py-0.5 rounded-full bg-rose-950/40 text-neutral-300 border border-rose-900/30">{i.quantity}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => { setEditingId(i.id); setNoteText(i.note || '') }} className={`size-8 ${i.note ? 'text-amber-400' : 'text-neutral-400'}`}>
                      <FileText className="size-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(i.id)} className="size-8 text-neutral-400 hover:text-red-400">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                {i.note && editingId !== i.id && <p className="text-xs text-neutral-400 pl-7 italic">Note: {i.note}</p>}

                {editingId === i.id && (
                  <div className="flex items-center gap-2 pl-7 pt-1">
                    <Input placeholder="Add a note..." value={noteText} onChange={(e) => setNoteText(e.target.value)} className="flex-1 h-8 text-xs bg-neutral-950/80 border-neutral-700 text-white" autoFocus />
                    <Button type="button" size="icon" onClick={() => saveNote(i.id)} className="size-8 bg-emerald-600 text-white"><Check className="size-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => setEditingId(null)} className="size-8 text-neutral-400"><X className="size-4" /></Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
