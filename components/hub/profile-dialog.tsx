'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, Link2, Loader2, LogOut, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useProfiles } from '@/hooks/use-profiles'
import { BADGE_COLORS, friendlyError, type Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MemberAvatar } from './member-avatar'
import { cn } from '@/lib/utils'

// Client-side helper to resize and compress large images before uploading
async function compressImage(file: File, maxSide = 600, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img
      if (width > maxSide || height > maxSide) {
        if (width > height) {
          height = Math.round((height * maxSide) / width)
          width = maxSide
        } else {
          width = Math.round((width * maxSide) / height)
          height = maxSide
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas context unavailable'))
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Image compression failed'))
        },
        'image/webp',
        quality,
      )
    }
    img.onerror = () => reject(new Error('Failed to load image file'))
    img.src = URL.createObjectURL(file)
  })
}

export function ProfileDialog({
  userId,
  open,
  onOpenChange,
}: {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const { profiles, mutate } = useProfiles()
  const me = profiles[userId]
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [color, setColor] = useState<string>('#eab308')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notifStatus, setNotifStatus] = useState<'unknown' | 'granted' | 'denied' | 'unsupported'>('unknown')
  const [copied, setCopied] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setName(me?.display_name ?? '')
      setAvatarUrl(me?.avatar_url ?? '')
      setColor(me?.badge_color ?? '#eab308')
      setError(null)
      setCopied(false)

      // Check current notification permission
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setNotifStatus(Notification.permission as 'granted' | 'denied')
      } else {
        setNotifStatus('unsupported')
      }
    }
  }, [open, me])

  async function handleUpload(file: File) {
    if (!file.type.startsWith('image/')) return setError('Please choose an image file.')
    setUploading(true)
    setError(null)
    try {
      const compressedBlob = await compressImage(file, 600, 0.85)
      const supabase = createClient()
      const path = `\( {userId}/ \){Date.now()}.webp`
      const { error } = await supabase.storage
        .from('avatars')
        .upload(path, compressedBlob, { upsert: true, contentType: 'image/webp' })
      if (error) throw error
      const publicUrl = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
      setAvatarUrl(publicUrl)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Upload failed. Please try a different photo or URL.')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return setError('Display name is required.')
    const url = avatarUrl.trim()
    if (url && !/^https:\/\//i.test(url)) return setError('Avatar URL must start with https://')
    setSaving(true)
    setError(null)
    try {
      const update: Profile = {
        id: userId,
        display_name: trimmed,
        avatar_url: url || null,
        badge_color: color,
      }
      const { error } = await createClient()
        .from('profiles')
        .upsert({ ...update, updated_at: new Date().toISOString() })
      if (error) throw error
      await mutate()
      onOpenChange(false)
    } catch (err) {
      console.error('Profile save error:', err)
      setError(friendlyError(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleEnableNotifications() {
    if (!('Notification' in window)) {
      setNotifStatus('unsupported')
      return
    }
    try {
      const permission = await Notification.requestPermission()
      setNotifStatus(permission === 'granted' ? 'granted' : 'denied')
    } catch {
      setNotifStatus('denied')
    }
  }

  async function handleShareInvite() {
    const inviteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://makharinskiy-nanno897.vercel.app'
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      prompt('Copy this invite link:', inviteUrl)
    }
  }

  async function handleLogout() {
    setLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      onOpenChange(false)
      router.replace('/auth/login')
      router.refresh()
    } catch (err) {
      console.error('Logout error:', err)
      setError('Could not log out. Please try again.')
      setLoggingOut(false)
    }
  }

  const preview: Profile = {
    id: userId,
    display_name: name || 'You',
    avatar_url: avatarUrl || null,
    badge_color: color,
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-rose-900/40 bg-neutral-950 text-white sm:max-w-md max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSave} className="grid gap-5">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Profile settings</DialogTitle>
            <DialogDescription className="text-neutral-400">
              How the family sees you across the hub.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-4">
            <MemberAvatar profile={preview} size="lg" gold />
            <div className="flex flex-col gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                aria-label="Upload avatar image"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleUpload(f)
                  e.target.value = ''
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
                {uploading ? 'Processing...' : 'Upload photo'}
              </Button>
              {avatarUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAvatarUrl('')}
                  className="text-neutral-400 hover:text-white"
                >
                  Remove photo
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="avatar-url">Or paste an image URL</Label>
            <Input
              id="avatar-url"
              type="url"
              placeholder="https://…"
              maxLength={1000}
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="bg-neutral-900 border-neutral-800 text-white"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="display-name-edit">Display name</Label>
            <Input
              id="display-name-edit"
              required
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-neutral-900 border-neutral-800 text-white"
            />
          </div>

          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium">Badge color</legend>
            <div className="flex flex-wrap gap-2">
              {BADGE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Badge color ${c}`}
                  aria-pressed={color === c}
                  className={cn(
                    'grid size-8 place-items-center rounded-full ring-offset-2 ring-offset-neutral-950 transition',
                    color === c ? 'ring-2 ring-white' : 'hover:scale-110',
                  )}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="size-4 text-black/80" aria-hidden="true" />}
                </button>
              ))}
            </div>
          </fieldset>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <DialogFooter className="bg-transparent">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-neutral-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || uploading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {saving && <Loader2 className="animate-spin" />}
              Save profile
            </Button>
          </DialogFooter>
        </form>

        {/* ─── Bottom actions: Notifications · Invite · Logout ─── */}
        <div className="mt-2 border-t border-white/10 pt-4 space-y-2">
          {/* Enable Notifications */}
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-3 border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 text-left"
            onClick={handleEnableNotifications}
            disabled={notifStatus === 'granted' || notifStatus === 'unsupported'}
          >
            <Bell className="size-4 shrink-0 text-amber-400" />
            <span className="flex-1">
              {notifStatus === 'granted'
                ? 'Notifications enabled'
                : notifStatus === 'denied'
                  ? 'Notifications blocked (check browser settings)'
                  : notifStatus === 'unsupported'
                    ? 'Notifications not supported'
                    : 'Enable notifications'}
            </span>
          </Button>

          {/* Share / Invite link */}
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-3 border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 text-left"
            onClick={handleShareInvite}
          >
            <Link2 className="size-4 shrink-0 text-amber-400" />
            <span className="flex-1">{copied ? 'Link copied!' : 'Share / Invite link'}</span>
          </Button>

          {/* Logout */}
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-3 border-red-900/50 bg-red-950/30 hover:bg-red-950/50 text-red-300 hover:text-red-200"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <Loader2 className="size-4 shrink-0 animate-spin" />
            ) : (
              <LogOut className="size-4 shrink-0" />
            )}
            <span className="flex-1">{loggingOut ? 'Signing out…' : 'Log out'}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
