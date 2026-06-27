'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'
import { calculateStreak } from '@/utils/streaks'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { TrendingUp, Calendar, Award, CheckCircle, Activity } from 'lucide-react'

export default function AnalyticsPage() {
  const supabase = createClient()
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const [habits, setHabits] = useState<any[]>([])
  const [entries, setEntries] = useState<any[]>([])
  const [consistencyScore, setConsistencyScore] = useState(0)

  useEffect(() => {
    setIsMounted(true)
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: userHabits } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id)

        const { data: habitEntries } = await supabase
          .from('habit_entries')
          .select('*')

        setHabits(userHabits || [])
        setEntries(habitEntries || [])

        // Calculate general consistency score (past 30 days)
        const activeHabitsCount = userHabits?.length || 0
        if (activeHabitsCount === 0) {
          setConsistencyScore(0)
          return
        }

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const recentEntries = habitEntries?.filter((e: any) => {
          const entryDate = new Date(e.completed_at)
          return entryDate >= thirtyDaysAgo && e.completed
        }) || []

        const totalPotentialCompletions = activeHabitsCount * 30
        const actualCompletions = recentEntries.length
        
        const score = Math.min(100, Math.round((actualCompletions / totalPotentialCompletions) * 100))
        setConsistencyScore(score)

      } catch (err) {
        console.error('Error fetching analytics data', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // 1. Process data for completion rate chart (last 7 days)
  const getWeeklyTrendData = () => {
    const data = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(today.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('en-US', { weekday: 'short' })

      const activeHabits = habits.length
      if (activeHabits === 0) {
        data.push({ name: label, rate: 0 })
        continue
      }

      const completed = entries.filter((e: any) => {
        const entryDate = new Date(e.completed_at).toISOString().split('T')[0]
        return entryDate === dateStr && e.completed
      }).length

      const rate = Math.round((completed / activeHabits) * 100)
      data.push({
        name: label,
        rate
      })
    }
    return data
  }

  // 2. Process data for Category completion count
  const getCategoryData = () => {
    const counts: { [key: string]: number } = {}
    
    // Map habit ids to categories
    const habitCategoryMap = habits.reduce((acc, h: any) => {
      acc[h.id] = h.category
      return acc
    }, {} as { [key: string]: string })

    // Count entries per category
    entries.forEach((e: any) => {
      if (e.completed) {
        const cat = habitCategoryMap[e.habit_id] || 'Other'
        counts[cat] = (counts[cat] || 0) + 1
      }
    })

    return Object.keys(counts).map((cat: string) => ({
      name: cat,
      completions: counts[cat]
    }))
  }

  const weeklyTrendData = getWeeklyTrendData()
  const categoryData = getCategoryData()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs font-semibold text-muted-foreground">Generating analytical reports...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Page Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-semibold">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span>Performance & Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Consistency Reports
        </h1>
      </div>

      {/* Top Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Consistency Index card */}
        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Consistency Score
              </span>
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight">
                {consistencyScore}%
              </span>
            </div>
            <div className="w-full bg-border/60 rounded-full h-2">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${consistencyScore}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground leading-normal">
              Based on completed habits out of potential completions in the last 30 days.
            </p>
          </CardContent>
        </Card>

        {/* Total check-ins card */}
        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Total Check-Ins
              </span>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight">
                {entries.filter(e => e.completed).length}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-normal">
              Lifetime completed habit check-ins synced to Supabase database.
            </p>
          </CardContent>
        </Card>

        {/* Active habits card */}
        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Tracked Habits
              </span>
              <Award className="h-4 w-4 text-violet-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight">
                {habits.length}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-normal">
              Active daily or custom routines defined on your dashboard.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recharts Graphical charts */}
      {isMounted && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Trailing completion rate chart */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Calendar className="h-4.5 w-4.5 text-primary" />
                Completion Rate Trend
              </CardTitle>
              <CardDescription>Daily check-in success rate over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weeklyTrendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(120,120,120,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(120,120,120,0.6)" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="rgba(120,120,120,0.6)" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '0.75rem',
                      color: 'hsl(var(--foreground))',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRate)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category distribution chart */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                <Activity className="h-4.5 w-4.5 text-emerald-500" />
                Category Distribution
              </CardTitle>
              <CardDescription>Total habit completions categorized by category</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(120,120,120,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(120,120,120,0.6)" fontSize={11} tickLine={false} />
                    <YAxis stroke="rgba(120,120,120,0.6)" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.75rem',
                        color: 'hsl(var(--foreground))',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="completions" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground font-semibold">
                  No completions recorded yet. Complete habits to populate this chart.
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      )}

      {/* Habit-by-habit Consistency List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight">Individual Habit Performance</h2>
        
        {habits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {habits.map((habit: any) => {
              const { currentStreak, longestStreak } = calculateStreak(habit.id, entries)
              
              // Calculate completions in last 30 days for this habit
              const thirtyDaysAgo = new Date()
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
              
              const completionsCount = entries.filter(
                (e: any) => e.habit_id === habit.id && new Date(e.completed_at) >= thirtyDaysAgo && e.completed
              ).length

              const consistency = Math.round((completionsCount / 30) * 100)

              return (
                <Card key={habit.id} className="border-border bg-card">
                  <CardContent className="p-5 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: habit.color }} />
                        <h4 className="text-sm font-bold text-foreground truncate max-w-[160px]">{habit.title}</h4>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Streak: <span className="font-semibold text-foreground">{currentStreak} days</span> (Best: {longestStreak})
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-extrabold text-foreground">{consistency}%</span>
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Consistency</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No habits active to generate performance data.</p>
        )}
      </div>

    </div>
  )
}
