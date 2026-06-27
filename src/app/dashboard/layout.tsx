import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import DashboardShell from './DashboardShell'

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Double check auth user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // Fetch user profile (XP, level, notification settings)
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // In case user profile is missing (e.g. trigger didn't run during dev / seed error)
  if (!profile) {
    // Attempt to self-heal by creating the profile row
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email!,
        xp: 0,
        level: 1
      })
      .select()
      .single()
      
    profile = newProfile || { id: user.id, email: user.email!, xp: 0, level: 1 }
  }

  return (
    <DashboardShell profile={profile}>
      {children}
    </DashboardShell>
  )
}
