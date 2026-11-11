'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ChatCharactersProps {
  isSending?: boolean
  className?: string
}

export function ChatCharacters({ isSending = false, className }: ChatCharactersProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 -bottom-2 z-20 flex justify-start px-1',
        className
      )}
    >
      {/* Helcurt - Bottom left */}
      <div
        className={cn(
          'relative h-14 w-14 sm:h-16 sm:w-16 transition-transform duration-300',
          'animate-[float_3s_ease-in-out_infinite]',
          isSending && 'scale-110'
        )}
      >
        <Image
          src="/helcurt-chibi.png"
          alt="Helcurt"
          fill
          className="object-contain drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]"
          priority
        />
      </div>
    </div>
  )
}
