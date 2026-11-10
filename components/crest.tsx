import { Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Crest({ size = 'md', className }: { size?: 'md' | 'lg'; className?: string }) {
  const lg = size === 'lg'
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-200 via-yellow-500 to-amber-700 p-[2px] shadow-[0_0_20px_-6px_rgba(234,179,8,0.7)]',
        lg ? 'size-20' : 'size-10',
        className,
      )}
    >
      <div className="grid size-full place-items-center rounded-full bg-background">
        <div className="flex flex-col items-center leading-none">
          <Crown className={cn('text-gold', lg ? 'size-4' : 'size-2.5')} strokeWidth={2.5} />
          <span className={cn('font-serif font-bold text-gold-metal', lg ? 'text-3xl' : 'text-base')}>M</span>
        </div>
      </div>
    </div>
  )
}
