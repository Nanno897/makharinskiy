import { cn } from '@/lib/utils'

export function Crest({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const lg = size === 'lg'
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative flex items-center justify-center shrink-0',
        lg ? 'w-20 h-20' : 'w-10 h-10',
        className,
      )}
    >
      <img 
        src="/logo.png" 
        alt="Makharinskiy Logo" 
        className="w-full h-full rounded-2xl border border-amber-500/40 object-cover shadow-xl"
      />
    </div>
  )
}
