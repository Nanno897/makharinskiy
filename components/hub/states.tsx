import { AlertTriangle, RotateCw, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SectionHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-serif text-2xl font-semibold md:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-xl bg-card" style={{ animationDelay: `${i * 80}ms` }} />
      ))}
    </div>
  )
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
      <AlertTriangle className="size-8 text-red-500" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">We couldn&apos;t load this right now.</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RotateCw /> Try again
      </Button>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border p-10 text-center">
      <Icon className="size-8 text-gold/70" aria-hidden="true" />
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{hint}</p>
    </div>
  )
}

export function InlineError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="alert" className="mt-2 text-sm text-red-400">
      {message}
    </p>
  )
}
