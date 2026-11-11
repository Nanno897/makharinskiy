import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FamilyHub } from '@/components/hub/family-hub'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  return (
    <div className="relative h-screen w-full flex flex-col bg-neutral-950 overflow-hidden">
      {/* Soft ambient red/crimson background glows for cozy atmosphere */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-950/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-red-950/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col h-full w-full">
        <FamilyHub userId={user.id} email={user.email} />
      </div>
    </div>
  )
}
