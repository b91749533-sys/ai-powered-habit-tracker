'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { Settings, Bell, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react'

export default function SettingsPage() {
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  
  // Settings state values
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [emailReminderEnabled, setEmailReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState('08:00')
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        setUserEmail(user.email!)

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error

        if (profile) {
          setReminderEnabled(profile.reminder_enabled || false)
          setEmailReminderEnabled(profile.email_reminder_enabled || false)
          
          // Format SQL TIME '08:00:00' to input '08:00'
          if (profile.reminder_time) {
            setReminderTime(profile.reminder_time.slice(0, 5))
          }
        }
      } catch (err) {
        console.error('Error loading settings', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitLoading(true)
    setSuccessMsg(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Update profiles settings in Supabase database
      const { error } = await supabase
        .from('profiles')
        .update({
          reminder_enabled: reminderEnabled,
          email_reminder_enabled: emailReminderEnabled,
          reminder_time: `${reminderTime}:00` // Store with seconds
        })
        .eq('id', user.id)

      if (error) throw error
      
      setSuccessMsg('Your preferences have been successfully updated.')
      setTimeout(() => setSuccessMsg(null), 3000)

    } catch (err: any) {
      alert(err.message || 'Error updating settings')
    } finally {
      setIsSubmitLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs font-semibold text-muted-foreground animate-pulse">Loading settings...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-semibold">
          <Settings className="h-4 w-4 text-primary" />
          <span>System Configurations</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Account Settings
        </h1>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {successMsg && (
          <div className="flex items-center gap-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-600 dark:text-emerald-500 font-semibold animate-fade-in">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Section 1: Reminders & Alerts */}
        <Card className="border border-border/80 bg-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <Bell className="h-4.5 w-4.5 text-primary" />
              Notifications & Alerts
            </CardTitle>
            <CardDescription>Configure when and where you want to be reminded to perform your habits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            
            {/* Browser reminders toggle */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border/40 bg-muted/10">
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-bold text-foreground">Browser Reminders</label>
                <p className="text-[11px] text-muted-foreground">Receive desktop notifications to complete daily checklist tasks.</p>
              </div>
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="h-5 w-5 rounded border-border accent-primary cursor-pointer mt-1"
              />
            </div>

            {/* Email digest toggle */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border/40 bg-muted/10">
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email Reminders
                </label>
                <p className="text-[11px] text-muted-foreground">Receive daily performance digest summaries to: {userEmail}</p>
              </div>
              <input
                type="checkbox"
                checked={emailReminderEnabled}
                onChange={(e) => setEmailReminderEnabled(e.target.checked)}
                className="h-5 w-5 rounded border-border accent-primary cursor-pointer mt-1"
              />
            </div>

            {/* Notification Time field */}
            <div className="space-y-1.5 max-w-xs">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Preferred Reminder Time
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
              />
            </div>

          </CardContent>
        </Card>

        {/* Section 2: Supabase Security Info */}
        <Card className="border border-border/80 bg-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-1.5">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
              Database Protection Status
            </CardTitle>
            <CardDescription>Security overview of your profile and data layers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs text-muted-foreground">
            <p>
              Your data is locked under **Row Level Security (RLS)** in Supabase. Only your authenticated user account can access, create, edit, or delete records.
            </p>
            <div className="flex flex-col gap-2 p-3 bg-muted/20 border border-border/40 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-foreground">RLS active on table: habits</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-foreground">RLS active on table: habit_entries</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-foreground">RLS active on table: profiles</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex items-center justify-end">
          <Button
            type="submit"
            isLoading={isSubmitLoading}
          >
            Save Changes
          </Button>
        </div>
        
      </form>
      
    </div>
  )
}
