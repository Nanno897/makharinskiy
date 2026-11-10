export type Profile = {
  id: string
  display_name: string
  avatar_url: string | null
  badge_color: string
}

export type ShoppingItem = {
  id: string
  user_id: string
  name: string
  category: string
  quantity: string | null
  completed: boolean
  created_at: string
}

export type FamilyEvent = {
  id: string
  user_id: string
  title: string
  description: string | null
  location: string | null
  starts_at: string
  ends_at: string | null
  all_day: boolean
  color: string
  created_at: string
}

export type Todo = {
  id: string
  user_id: string
  title: string
  due_date: string | null
  priority: boolean
  completed: boolean
  created_at: string
}

export type Message = {
  id: string
  user_id: string
  content: string
  created_at: string
}

export const BADGE_COLORS = [
  '#eab308',
  '#f59e0b',
  '#dc2626',
  '#ef4444',
  '#e11d48',
  '#a855f7',
  '#3b82f6',
  '#10b981',
  '#f5f5f4',
] as const

export const SHOPPING_CATEGORIES = [
  'Produce',
  'Dairy',
  'Meat & Fish',
  'Bakery',
  'Pantry',
  'Frozen',
  'Household',
  'Other',
] as const

export function friendlyError(error: unknown): string {
  const e = (error ?? {}) as { message?: string; code?: string; status?: number }
  if (e.status === 429 || e.code === 'over_request_rate_limit') return 'Too many requests. Please wait a moment.'
  if (e.code === '42501') return 'You do not have permission to do that.'
  if (e.code === '23514') return 'Some values are invalid or too long.'
  if (typeof navigator !== 'undefined' && !navigator.onLine) return 'You appear to be offline.'
  return 'Something went wrong. Please try again.'
}
