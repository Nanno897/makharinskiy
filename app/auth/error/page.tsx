import Link from 'next/link'
import { Crest } from '@/components/crest'

export default function AuthErrorPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <Crest size="lg" />
      <h1 className="font-serif text-2xl font-semibold">That link didn&apos;t work</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The confirmation link may have expired or already been used. Try signing in, or sign up again.
      </p>
      <Link href="/auth/login" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
        Back to sign in
      </Link>
    </main>
  )
}
