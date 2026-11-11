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
        'pointer-events-none absolute inset-x-0 bottom-24 z-10 flex justify-between px-3 sm:px-5',
        className
      )}
    >
      {/* Helcurt - Left */}
      <div
        className={cn(
          'relative h-20 w-20 sm:h-24 sm:w-24 transition-transform duration-300',
          'animate-[float_3s_ease-in-out_infinite]',
          isSending && 'scale-110'
        )}
      >
        <Image
          src="/helcurt-chibi.png"
          alt="Helcurt"
          fill
          className="object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.45)]"
          priority
        />
      </div>

      {/* Lunox - Right */}
      <div
        className={cn(
          'relative h-20 w-20 sm:h-24 sm:w-24 transition-transform duration-300',
          'animate-[float_3.4s_ease-in-out_infinite_0.4s]',
          isSending && 'scale-110'
        )}
      >
        <Image
          src="/lunox-chibi.png"
          alt="Lunox"
          fill
          className="object-contain drop-shadow-[0_0_15px_rgba(147,51,234,0.4)]"
          priority
        />
      </div>
    </div>
  )
}
