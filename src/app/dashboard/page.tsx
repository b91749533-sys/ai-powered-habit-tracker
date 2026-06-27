'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Sparkles, Smile } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { HabitForm } from '@/components/habits/HabitForm'
import { HabitList } from '@/components/habits/HabitList'
import { StatsOverview } from '@/components/dashboard/StatsOverview'
import { WeeklyCalendar } from '@/components/dashboard/WeeklyCalendar'
import { AchievementsPanel } from '@/components/gamification/AchievementsPanel'
import { aggregateStats } from '@/utils/streaks'
import confetti from 'canvas-confetti'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  // State definitions
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [habits, setHabits] = useState<any[]>([])
  const [entries, setEntries] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<any | null>(null)

  // Fetch initial dashboard state
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Get current user session
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      // 1. Fetch Profile
      const { data: userProfile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()
      
      if (profileErr) throw profileErr
      setProfile(userProfile)

      // 2. Fetch Habits
      const { data: userHabits, error: habitsErr } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (habitsErr) throw habitsErr
      setHabits(userHabits || [])

      // 3. Fetch entries
      const { data: habitEntries, error: entriesErr } = await supabase
        .from('habit_entries')
        .select('*')

      if (entriesErr) throw entriesErr
      setEntries(habitEntries || [])

      // 4. Fetch achievements
      const { data: userAchievements, error: achievementsErr } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', currentUser.id)

      if (achievementsErr) throw achievementsErr
      setAchievements(userAchievements || [])

    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Habit completion toggle
  const handleToggleComplete = async (habitId: string, isCompleted: boolean) => {
    if (!profile || !user) return

    const todayStr = new Date().toISOString().split('T')[0]
    
    // Optimistic state updates
    let updatedEntries = [...entries]
    let newXp = profile.xp
    let newLevel = profile.level
    
    try {
      if (isCompleted) {
        // Toggle Uncomplete: delete entry
        const { error: deleteErr } = await supabase
          .from('habit_entries')
          .delete()
          .eq('habit_id', habitId)
          .eq('completed_at', todayStr)

        if (deleteErr) throw deleteErr

        updatedEntries = entries.filter(
          e => !(e.habit_id === habitId && new Date(e.completed_at).toISOString().split('T')[0] === todayStr)
        )
        
        // Deduct 10 XP
        newXp = Math.max(0, profile.xp - 10)
      } else {
        // Toggle Complete: create entry
        const { error: insertErr } = await supabase
          .from('habit_entries')
          .insert({
            habit_id: habitId,
            completed: true,
            completed_at: todayStr
          })

        if (insertErr) throw insertErr

        updatedEntries = [...entries, {
          habit_id: habitId,
          completed: true,
          completed_at: todayStr
        }]

        // Add 10 XP
        newXp = profile.xp + 10
        const xpNeeded = profile.level * 100
        
        if (newXp >= xpNeeded) {
          // Level up!
          newLevel = profile.level + 1
          newXp = newXp - xpNeeded
          
          // Trigger delightful confetti effect
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
          })
        }
      }

      // Sync user profile updates to database
      const { error: profileUpdateErr } = await supabase
        .from('profiles')
        .update({ xp: newXp, level: newLevel })
        .eq('id', user.id)

      if (profileUpdateErr) throw profileUpdateErr

      // Check for first completed habit achievement (if we checked it off)
      if (!isCompleted && achievements.length === 0) {
        const hasFirstStep = achievements.some(a => a.badge_name === 'First Step')
        if (!hasFirstStep) {
          const { error: achErr } = await supabase
            .from('achievements')
            .insert({
              user_id: user.id,
              badge_name: 'First Step'
            })
          if (!achErr) {
            // Re-fetch achievements list
            const { data: latestAch } = await supabase
              .from('achievements')
              .select('*')
              .eq('user_id', user.id)
            setAchievements(latestAch || [])
          }
        }
      }

      // Update local states
      setEntries(updatedEntries)
      setProfile({ ...profile, xp: newXp, level: newLevel })
      
      // Tell Next.js Server Components (Header, etc.) to refresh
      router.refresh()

    } catch (err: any) {
      alert(err.message || 'Error updating status')
    }
  }

  // Create new habit
  const handleCreateHabit = async (habitData: any) => {
    if (!user) return
    setIsSubmitLoading(true)
    try {
      const { data, error: insertErr } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          ...habitData
        })
        .select()

      if (insertErr) throw insertErr

      if (data) {
        setHabits([data[0], ...habits])
      }
      setIsAddModalOpen(false)
    } catch (err: any) {
      alert(err.message || 'Error creating habit')
    } finally {
      setIsSubmitLoading(false)
    }
  }

  // Update existing habit
  const handleUpdateHabit = async (habitData: any) => {
    if (!editingHabit) return
    setIsSubmitLoading(true)
    try {
      const { data, error: updateErr } = await supabase
        .from('habits')
        .update(habitData)
        .eq('id', editingHabit.id)
        .select()

      if (updateErr) throw updateErr

      if (data) {
        setHabits(habits.map(h => h.id === editingHabit.id ? data[0] : h))
      }
      setEditingHabit(null)
    } catch (err: any) {
      alert(err.message || 'Error updating habit')
    } finally {
      setIsSubmitLoading(false)
    }
  }

  // Delete habit
  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this habit? All historic records will be lost.')) return
    try {
      const { error: deleteErr } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId)

      if (deleteErr) throw deleteErr

      setHabits(habits.filter(h => h.id !== habitId))
      setEntries(entries.filter(e => e.habit_id !== habitId))
    } catch (err: any) {
      alert(err.message || 'Error deleting habit')
    }
  }

  // Compute aggregate stats from helper utility
  const stats = aggregateStats(habits, entries)

  // Get dynamic greeting
  const getGreeting = () => {
    const hr = new Date().getHours()
    if (hr < 12) return 'Good morning'
    if (hr < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs font-semibold text-muted-foreground animate-pulse">Loading habit board...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center space-y-4">
        <p className="text-sm font-semibold text-destructive">{error}</p>
        <Button onClick={fetchDashboardData}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Welcome Title Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-semibold">
            <Smile className="h-4 w-4 text-primary" />
            <span>{getGreeting()}, Explorer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Dashboard Overview
          </h1>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          icon={Plus}
          iconPosition="left"
        >
          Add Habit
        </Button>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Stats & Checklist */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Numerical Analytics Cards & Quote */}
          <StatsOverview
            totalHabits={habits.length}
            completedToday={stats.completedToday}
            longestStreak={stats.longestStreak}
            completionRate={stats.completionRate}
          />

          {/* Todays Checklist habits */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight">Today's Habits</h2>
              <span className="text-xs font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
                {stats.completedToday} / {habits.length} Done
              </span>
            </div>
            <HabitList
              habits={habits}
              entries={entries}
              onToggleComplete={handleToggleComplete}
              onEdit={(habit) => setEditingHabit(habit)}
              onDelete={handleDeleteHabit}
            />
          </div>
        </div>

        {/* Right Columns: Gamification and Weekly logs */}
        <div className="space-y-8">
          
          {/* Trailing Weekly checks */}
          <WeeklyCalendar
            habits={habits}
            entries={entries}
          />

          {/* Gamification Progress achievements */}
          {profile && (
            <AchievementsPanel
              xp={profile.xp}
              level={profile.level}
              unlockedAchievements={achievements}
            />
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Habit"
        description="Configure your targets and build strong daily routines."
      >
        <HabitForm
          onSubmit={handleCreateHabit}
          onCancel={() => setIsAddModalOpen(false)}
          isLoading={isSubmitLoading}
        />
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={editingHabit !== null}
        onClose={() => setEditingHabit(null)}
        title="Edit Habit"
        description="Modify your habit parameters and tracking specifications."
      >
        <HabitForm
          initialData={editingHabit}
          onSubmit={handleUpdateHabit}
          onCancel={() => setEditingHabit(null)}
          isLoading={isSubmitLoading}
        />
      </Modal>
      
    </div>
  )
}
