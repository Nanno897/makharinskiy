/* eslint-disable @next/next/no-img-element */
import type { Profile } from '@/lib/types'
import { cn } from '@/lib/utils'

export function initials(name?: string) {
  return (name ?? '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

export function MemberAvatar({
  profile,
  size = 'md',
  gold = false,
  className,
}: {
  profile?: Profile
  size?: 'sm' | 'md' | 'lg'
  gold?: boolean
  className?: string
}) {
  const dims = { sm: 'size-7 text-[10px]', md: 'size-9 text-xs', lg: 'size-20 text-xl' }[size]
  const color = profile?.badge_color ?? '#eab308'
  return (
    <span
      className={cn(
        'relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full font-semibold',
        gold ? 'ring-2 ring-gold ring-offset-2 ring-offset-background' : 'ring-1 ring-white/10',
        dims,
        className,
      )}
      style={{ backgroundColor: `${color}26`, color }}
    >
      {profile?.avatar_url ? (
        <img src={profile.avatar_url} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <span aria-hidden="true">{initials(profile?.display_name)}</span>
      )}
    </span>
  )
}

export function MemberBadge({ profile }: { profile?: Profile }) {
  const color = profile?.badge_color ?? '#a1a1aa'
  return (
    <span
      className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium"
      style={{ borderColor: `${color}66`, color, backgroundColor: `${color}14` }}
    >
      {profile?.display_name ?? 'Member'}
    </span>
  )
}
