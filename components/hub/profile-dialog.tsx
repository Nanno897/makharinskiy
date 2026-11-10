'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Loader2, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useProfiles } from '@/hooks/use-profiles'
import { BADGE_COLORS, friendlyError, type Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MemberAvatar } from './member-avatar'
import { cn } from '@/lib/utils'

export function ProfileDialog({
  userId,
  open,
  onOpenChange,
}: {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { profiles, mutate } = useProfiles()
  const me = profiles[userId]
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [color, setColor] = useState<string>('#eab308')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setName(me?.display_name ?? '')
      setAvatarUrl(me?.avatar_url ?? '')
      setColor(me?.badge_color ?? '#eab308')
      setError(null)
    }
  }, [open, me])

  async function handleUpload(file: File) {
    if (!file.type.startsWith('image/')) return setError('Please choose an image file.')
    if (file.size > 2 * 1024 * 1024) return setError('Image must be smaller than 2 MB.')
    setUploading(true)
    setError(null)
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png'
      const path = `${userId}/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type })
      if (error) throw error
      setAvatarUrl(supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Upload failed. Try a smaller image or paste a URL.')
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
      const update: Profile = { id: userId, display_name: trimmed, avatar_url: url || null, badge_color: color }
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

  const preview: Profile = { id: userId, display_name: name || 'You', avatar_url: avatarUrl || null, badge_color: color }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border border-gold/20 bg-card sm:max-w-md">
        <form onSubmit={handleSave} className="grid gap-5">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Profile settings</DialogTitle>
            <DialogDescription>How the family sees you across the hub.</DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-4">
            <MemberAvatar profile={preview} size="lg" gold />
            <div className="flex flex-col gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                aria-label="Upload avatar image"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleUpload(f)
                  e.target.value = ''
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
                Upload photo
              </Button>
              {avatarUrl && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setAvatarUrl('')}>
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
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="display-name-edit">Display name</Label>
            <Input id="display-name-edit" required maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
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
                    'grid size-8 place-items-center rounded-full ring-offset-2 ring-offset-card transition',
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
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving && <Loader2 className="animate-spin" />}
              Save profile
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
