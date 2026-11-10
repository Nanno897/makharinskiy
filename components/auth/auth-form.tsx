'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, MailCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type Mode = 'signin' | 'signup'

function authErrorMessage(error: unknown, mode: Mode): string {
  const { code, status } = (error ?? {}) as { code?: string; status?: number }
  if (code === 'email_not_confirmed') return 'Please confirm your email — check your inbox for the link.'
  if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit' || status === 429)
    return 'Too many attempts. Please wait a moment and try again.'
  if (code === 'weak_password') return 'Password is too weak. Use at least 6 characters.'
  if (code === 'email_address_invalid') return 'Please use a valid email address.'
  if (code === 'invalid_credentials') return 'Invalid email or password.'
  if (mode === 'signup' && code === 'user_already_exists') return 'Could not create the account. Try signing in instead.'
  return 'Something went wrong. Please try again.'
}

export function AuthForm() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.replace('/')
        router.refresh()
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo:
              process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
            data: { display_name: displayName.trim() },
          },
        })
        if (error) throw error
        if (data.session) {
          router.replace('/')
          router.refresh()
        } else {
          setSentTo(email)
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError(authErrorMessage(err, mode))
    } finally {
      setLoading(false)
    }
  }

  if (sentTo) {
    return (
      <div className="rounded-2xl border border-gold/30 bg-card p-6 text-center">
        <MailCheck className="mx-auto size-10 text-gold" aria-hidden="true" />
        <h2 className="mt-4 font-serif text-xl font-semibold">Check your inbox</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a confirmation link to <span className="text-foreground">{sentTo}</span>. Confirm it, then sign in.
        </p>
        <Button
          variant="outline"
          className="mt-6 w-full"
          onClick={() => {
            setSentTo(null)
            setMode('signin')
          }}
        >
          Back to sign in
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-black/50">
      <div role="tablist" aria-label="Authentication mode" className="mb-6 grid grid-cols-2 rounded-lg bg-muted p-1">
        {(['signin', 'signup'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m)
              setError(null)
            }}
            className={cn(
              'rounded-md py-2 text-sm font-medium transition-colors',
              mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {m === 'signin' ? 'Sign in' : 'Sign up'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === 'signup' && (
          <div className="grid gap-2">
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              required
              maxLength={40}
              autoComplete="nickname"
              placeholder="Mom, Dad, Alex…"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && (
          <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="mt-2 w-full glow-red" disabled={loading}>
          {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
          {mode === 'signin' ? 'Enter the Hub' : 'Create account'}
        </Button>
      </form>
    </div>
  )
}
