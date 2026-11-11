import { PushButton } from '@/components/push-button'
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
    <>
      <PushButton />
      <FamilyHub userId={user.id} email={user.email} />
    </>
  )
}
