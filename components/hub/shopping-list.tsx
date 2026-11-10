'use client'

import { useMemo, useState } from 'react'
import { Loader2, Plus, ShoppingBasket, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeTable } from '@/hooks/use-realtime-table'
import { useProfiles } from '@/hooks/use-profiles'
import { SHOPPING_CATEGORIES, friendlyError, type ShoppingItem } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { MemberBadge } from './member-avatar'
import { EmptyState, ErrorState, InlineError, ListSkeleton, SectionHeader } from './states'
import { cn } from '@/lib/utils'

export function ShoppingList({ userId }: { userId: string }) {
  const { data, error, isLoading, mutate } = useRealtimeTable<ShoppingItem>('shopping_list', { orderBy: 'created_at' })
  const { profiles } = useProfiles()
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [category, setCategory] = useState<string>('Produce')
  const [adding, setAdding] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const grouped = useMemo(() => {
    const map = new Map<string, ShoppingItem[]>()
    for (const item of data ?? []) {
      if (!map.has(item.category)) map.set(item.category, [])
      map.get(item.category)!.push(item)
    }
    return [...map.entries()].sort(
      ([a], [b]) =>
        (SHOPPING_CATEGORIES as readonly string[]).indexOf(a) - (SHOPPING_CATEGORIES as readonly string[]).indexOf(b),
    )
  }, [data])

  const remaining = (data ?? []).filter((i) => !i.completed).length
  const doneCount = (data ?? []).length - remaining

  async function addItem(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setAdding(true)
    setActionError(null)
    const { error } = await createClient()
      .from('shopping_list')
      .insert({ name: trimmed, category, quantity: quantity.trim() || null, user_id: userId })
    setAdding(false)
    if (error) return setActionError(friendlyError(error))
    setName('')
    setQuantity('')
    mutate()
  }

  async function toggle(item: ShoppingItem) {
    mutate((items) => items?.map((i) => (i.id === item.id ? { ...i, completed: !i.completed } : i)), { revalidate: false })
    const { error } = await createClient().from('shopping_list').update({ completed: !item.completed }).eq('id', item.id)
    if (error) setActionError(friendlyError(error))
    mutate()
  }

  async function remove(id: string) {
    mutate((items) => items?.filter((i) => i.id !== id), { revalidate: false })
    const { error } = await createClient().from('shopping_list').delete().eq('id', id)
    if (error) setActionError(friendlyError(error))
    mutate()
  }

  async function clearDone() {
    const ids = (data ?? []).filter((i) => i.completed).map((i) => i.id)
    if (!ids.length) return
    mutate((items) => items?.filter((i) => !i.completed), { revalidate: false })
    const { error } = await createClient().from('shopping_list').delete().in('id', ids)
    if (error) setActionError(friendlyError(error))
    mutate()
  }

  return (
    <section aria-labelledby="shopping-heading">
      <SectionHeader title="Shopping List" subtitle={data ? `${remaining} item${remaining === 1 ? '' : 's'} to get` : undefined}>
        {doneCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearDone}>
            Clear {doneCount} done
          </Button>
        )}
      </SectionHeader>
      <h2 id="shopping-heading" className="sr-only">Shopping List</h2>

      <form onSubmit={addItem} className="mb-6 rounded-2xl border border-border bg-card p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="item-name" className="sr-only">Item</label>
          <Input
            id="item-name"
            placeholder="Add an item…"
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1"
          />
          <label htmlFor="item-qty" className="sr-only">Quantity</label>
          <Input
            id="item-qty"
            placeholder="Qty"
            maxLength={30}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="sm:w-24"
          />
          <label htmlFor="item-category" className="sr-only">Category</label>
          <select
            id="item-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {SHOPPING_CATEGORIES.map((c) => (
              <option key={c} value={c} className="bg-card">
                {c}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={adding || !name.trim()}>
            {adding ? <Loader2 className="animate-spin" /> : <Plus />}
            Add
          </Button>
        </div>
        <InlineError message={actionError} />
      </form>

      {isLoading ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState onRetry={() => mutate()} />
      ) : !data?.length ? (
        <EmptyState icon={ShoppingBasket} title="The list is empty" hint="Add the first item above." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {grouped.map(([cat, items]) => (
            <div key={cat} className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{cat}</h3>
                <span className="text-xs text-muted-foreground">
                  {items.filter((i) => !i.completed).length}/{items.length}
                </span>
              </div>
              <ul className="flex flex-col">
                {items.map((item) => (
                  <li key={item.id} className="group flex items-center gap-3 border-t border-border py-2.5 first:border-t-0">
                    <Checkbox
                      id={`shop-${item.id}`}
                      checked={item.completed}
                      onCheckedChange={() => toggle(item)}
                      className="data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                    />
                    <label
                      htmlFor={`shop-${item.id}`}
                      className={cn('min-w-0 flex-1 cursor-pointer', item.completed && 'text-muted-foreground line-through')}
                    >
                      <span className="block truncate text-sm">
                        {item.name}
                        {item.quantity && <span className="ml-2 text-xs text-gold/80">× {item.quantity}</span>}
                      </span>
                    </label>
                    <span className="hidden sm:inline">
                      <MemberBadge profile={profiles[item.user_id]} />
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => remove(item.id)}
                      aria-label={`Delete ${item.name}`}
                      className="text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
