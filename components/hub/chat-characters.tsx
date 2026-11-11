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
        'pointer-events-none absolute inset-x-0 bottom-16 z-10 flex justify-between px-2 sm:px-3',
        className
      )}
    >
      {/* Helcurt - Bottom Left */}
      <div
        className={cn(
          'relative h-16 w-16 sm:h-20 sm:w-20 transition-transform duration-300 opacity-90',
          'animate-[float_3s_ease-in-out_infinite]',
          isSending && 'scale-110 opacity-100'
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

      {/* Lunox - Bottom Right */}
      <div
        className={cn(
          'relative h-16 w-16 sm:h-20 sm:w-20 transition-transform duration-300 opacity-90',
          'animate-[float_3.4s_ease-in-out_infinite_0.4s]',
          isSending && 'scale-110 opacity-100'
        )}
      >
        <Image
          src="/lunox-chibi.png"
          alt="Lunox"
          fill
          className="object-contain drop-shadow-[0_0_12px_rgba(147,51,234,0.45)]"
          priority
        />
      </div>
    </div>
  )
}
