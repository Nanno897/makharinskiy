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
    <div className="relative min-h-[calc(100vh-140px)] rounded-2xl border border-neutral-800/60 bg-gradient-to-b from-neutral-900/90 via-neutral-950 to-neutral-950 p-5 shadow-2xl overflow-hidden flex flex-col justify-between">
      {/* Load Cursive Font dynamically */}
      <link
        href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
        rel="stylesheet"
      />

      {/* Subtle Marble Texture Layer */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-10 bg-repeat mix-blend-overlay" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 100 100'%3E%3Cpath d='M10 20 Q 30 50 60 20 T 90 80' stroke='%25FFFFFF' stroke-width='0.5' fill='none'/%3E%3Cpath d='M5 80 Q 40 10 80 50 T 95 10' stroke='%25FFFFFF' stroke-width='0.3' fill='none'/%3E%3C/svg%3E")`
        }}
      />

      <div className="relative z-10 space-y-5">
        {/* Cursive Title Header */}
        <div className="text-center pt-2 pb-1">
          <h2 
            className="text-5xl font-normal text-rose-200/90 tracking-wide drop-shadow-md"
            style={{ fontFamily: "'Great Vibes', cursive" }}
          >
            Shopping list
          </h2>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAddItem} className="flex gap-2">
          <Input
            type="text"
            placeholder="Item name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 bg-neutral-900/90 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-rose-500
