'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  { label: 'Smileys', emojis: '😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 😉 😍 🥰 😘 😋 😜 🤪 😎 🤩 🥳 😏 😴 🤔 🤗 🙄 😬 😢 😭 😤 😡 🥺 😱 🤯'.split(' ') },
  { label: 'Hearts', emojis: '❤️ 🧡 💛 💚 💙 💜 🖤 🤍 💖 💗 💓 💕 💞 💘 💝 ❣️'.split(' ') },
  { label: 'Gestures', emojis: '👍 👎 👏 🙌 🙏 👋 🤝 💪 ✌️ 🤞 👌 🤙 👊 ✋ 🫶 👀'.split(' ') },
  { label: 'Family', emojis: '👨‍👩‍👧‍👦 👪 👶 🧒 👦 👧 👨 👩 👴 👵 🐶 🐱 🏠 🚗 🎂 🎁'.split(' ') },
  { label: 'Food', emojis: '🍕 🍔 🍟 🌮 🍝 🍣 🥗 🍎 🍌 🍓 🥑 🥐 🍰 🍪 ☕ 🍷'.split(' ') },
  { label: 'Activities', emojis: '🎉 🎊 ⚽ 🏀 🎮 🎬 🎵 📚 ✈️ 🏖️ 🏕️ ⭐ 🔥 ✨ 🏆 👑'.split(' ') },
]

export function EmojiPicker({ onSelect, onClose }: { onSelect: (emoji: string) => void; onClose: () => void }) {
  const [group, setGroup] = useState(0)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-label="Emoji picker"
      className="w-72 rounded-2xl border border-gold/25 bg-popover p-2 shadow-2xl shadow-black/60"
    >
      <div role="tablist" className="mb-2 flex gap-1 overflow-x-auto">
        {EMOJI_GROUPS.map((g, i) => (
          <button
            key={g.label}
            type="button"
            role="tab"
            aria-selected={group === i}
            onClick={() => setGroup(i)}
            className={cn(
              'shrink-0 rounded-md px-2 py-1 text-[11px] font-medium transition-colors',
              group === i ? 'bg-primary/20 text-red-400' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {g.label}
          </button>
        ))}
      </div>
      <div className="grid max-h-48 grid-cols-8 gap-0.5 overflow-y-auto">
        {EMOJI_GROUPS[group].emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelect(emoji)}
            aria-label={`Insert ${emoji}`}
            className="grid aspect-square place-items-center rounded-md text-xl transition-transform hover:scale-125 hover:bg-accent"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  )
}
