import { AuthForm } from '@/components/auth/auth-form'
import { Crest } from '@/components/crest'

export default function LoginPage() {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-red-600/10 blur-3xl"
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Crest size="lg" />
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-gold">Est. Family</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold text-balance">MAKHARINSKIY</h1>
            <p className="mt-2 text-sm text-muted-foreground">.</p>
          </div>
        </div>
        <AuthForm />
      </div>
    </main>
  )
}
