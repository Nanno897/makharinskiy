import { AlertTriangle, RotateCw, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SectionHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-serif text-2xl font-semibold md:text-3xl text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-neutral-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div 
          key={i} 
          className="h-14 animate-pulse rounded-2xl bg-neutral-900/40 backdrop-blur-md border border-white/[0.04] shadow-[0_4px_20px_rgb(0,0,0,0.4)]" 
          style={{ animationDelay: `${i * 80}ms` }} 
        />
      ))}
    </div>
  )
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl border border-red-900/30 bg-neutral-950/40 backdrop-blur-md p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
      <div className="rounded-2xl bg-red-950/30 p-3 text-red-400 border border-red-900/40">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </div>
      <p className="text-sm text-neutral-400">We couldn&apos;t load this right now.</p>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRetry}
        className="gap-2 border-white/10 bg-neutral-900/60 text-white hover:bg-neutral-800"
      >
        <RotateCw className="size-3.5" /> Try again
      </Button>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, hint }: { icon: LucideIcon; title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/[0.06] bg-neutral-950/40 backdrop-blur-md p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
      <div className="mb-2 rounded-2xl bg-rose-950/30 p-3.5 text-rose-300 border border-rose-900/30 shadow-[0_0_20px_rgba(159,18,57,0.2)]">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <p className="font-medium text-white">{title}</p>
      <p className="text-sm text-neutral-400">{hint}</p>
    </div>
  )
}

export function InlineError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="alert" className="mt-2 text-sm text-red-400 px-1 flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
      {message}
    </p>
  )
}
