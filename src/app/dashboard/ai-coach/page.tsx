'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'
import { Sparkles, Brain, Award, AlertCircle, CheckCircle, Zap } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function AICoachPage() {
  const supabase = createClient()
  
  const [isLoading, setIsLoading] = useState(true)
  const [habits, setHabits] = useState<any[]>([])
  const [entries, setEntries] = useState<any[]>([])
  const [unlockedAchievements, setUnlockedAchievements] = useState<any[]>([])
  const [analysis, setAnalysis] = useState<any>(null)

  useEffect(() => {
    const fetchDataAndAnalyze = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // 1. Fetch habits
        const { data: userHabits } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id)

        // 2. Fetch entries
        const { data: habitEntries } = await supabase
          .from('habit_entries')
          .select('*')

        // 3. Fetch achievements
        const { data: achievements } = await supabase
          .from('achievements')
          .select('*')
          .eq('user_id', user.id)

        setHabits(userHabits || [])
        setEntries(habitEntries || [])
        setUnlockedAchievements(achievements || [])

        // 4. Analyze data and build AI report
        const report = generateAIReport(userHabits || [], habitEntries || [])
        setAnalysis(report)

        // 5. Unlock "AI Follower" achievement if not already unlocked
        const hasAIBadge = achievements?.some((a: any) => a.badge_name === 'AI Follower')
        if (!hasAIBadge) {
          const { error: insertErr } = await supabase
            .from('achievements')
            .insert({
              user_id: user.id,
              badge_name: 'AI Follower'
            })
          
          if (!insertErr) {
            confetti({
              particleCount: 80,
              spread: 60,
              colors: ['#8b5cf6', '#3b82f6']
            })
          }
        }

      } catch (err) {
        console.error('Error generating AI analysis', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDataAndAnalyze()
  }, [])

  // Heuristic-based AI Analysis Engine
  const generateAIReport = (userHabits: any[], habitEntries: any[]) => {
    const totalHabits = userHabits.length
    if (totalHabits === 0) {
      return {
        overallScore: 0,
        motivationalMessage: "Welcome to your AI Coach portal! Before I can analyze your consistency and trends, you need to create at least one habit on your dashboard. Let's get started today!",
        weakHabits: [],
        recommendations: ["Create your first habit", "Aim for a small routine (e.g. drink water)", "Schedule habit check-ins in settings"]
      }
    }

    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    // Calculate completion rates for individual habits in last 14 days
    const habitPerformance = userHabits.map(habit => {
      const completionsCount = habitEntries.filter(
        e => e.habit_id === habit.id && new Date(e.completed_at) >= fourteenDaysAgo && e.completed
      ).length
      
      const completionRate = Math.round((completionsCount / 14) * 100)
      
      return {
        id: habit.id,
        title: habit.title,
        category: habit.category,
        color: habit.color,
        rate: completionRate
      }
    })

    // Weak habits are those with less than 50% completion rate
    const weakHabits = habitPerformance.filter(h => h.rate < 50)
    
    // Average completion rate in the last 14 days
    const overallScore = Math.round(
      habitPerformance.reduce((sum, h) => sum + h.rate, 0) / totalHabits
    )

    let motivationalMessage = ""
    let recommendations: string[] = []

    if (overallScore >= 80) {
      motivationalMessage = "Outstanding performance, Explorer! Your consistency is exceptional. You are building compound momentum that will yield profound long-term results. Focus on maintaining this discipline and avoiding burnout."
      recommendations = [
        "Your routines are stable. Try scaling up a bit (e.g. increase meditation by 5 minutes).",
        "Practice 'habit stacking': link your habits consecutively (e.g. after Workout, immediately read).",
        "Consider mentoring a friend or sharing your consistency streaks to stay accountable."
      ]
    } else if (overallScore >= 50) {
      motivationalMessage = "Solid momentum, but there is room for improvement. You are showing up, but gaps are breaking your momentum. Remember: missing once is an accident; missing twice is the start of a bad habit."
      recommendations = [
        "Focus on your weaker habits by doing them first thing in the morning when your willpower is highest.",
        "Simplify. If a habit feels heavy, reduce the scope (e.g. replace 'Read 1 hour' with 'Read 2 pages').",
        "Ensure your reminders are configured to trigger right at your targeted execution window."
      ]
    } else {
      motivationalMessage = "Do not be discouraged. Consistency is a muscle, and building it takes time. The key is not perfection, but reducing friction to show up. Focus on building the identity of a consistent person first."
      recommendations = [
        "Set micro-habits. Aim for routines that take less than 2 minutes to complete.",
        "Set clear triggers: 'I will [HABIT] at [TIME] in [LOCATION]'. Explicit intentions double success rates.",
        "Focus on just one habit for the next 7 days. Once it becomes automatic, add the next."
      ]
    }

    // Category specific advice for weak habits
    weakHabits.forEach(h => {
      if (h.category === 'Fitness') {
        recommendations.push(`For "${h.title}": Lay out your gym shoes or workout clothes in advance to eliminate morning friction.`)
      } else if (h.category === 'Mindfulness') {
        recommendations.push(`For "${h.title}": Link it with an established routine, like meditating immediately after brewing coffee.`)
      } else if (h.category === 'Work') {
        recommendations.push(`For "${h.title}": Use a site-blocker or put your phone in another room during the first 25 minutes.`)
      } else if (h.category === 'Health') {
        recommendations.push(`For "${h.title}": Place water or vitamins directly on your nightstand so they are the first thing you see.`)
      }
    })

    return {
      overallScore,
      motivationalMessage,
      weakHabits,
      recommendations: Array.from(new Set(recommendations)).slice(0, 5) // unique and capped at 5
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs font-semibold text-muted-foreground animate-pulse font-mono">AI Coach is compiling analytics...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>AI Consultation Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          AI Habit Coach
        </h1>
      </div>

      {/* Main Analysis grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left coach section (card/content) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Coach Advice Card */}
          <Card className="border border-primary/20 bg-primary/5 rounded-2xl relative overflow-hidden">
            <div className="absolute right-4 bottom-4 text-primary/10 pointer-events-none">
              <Brain className="h-32 w-32" />
            </div>
            <CardHeader>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md w-fit">
                Coach Consultation
              </span>
              <CardTitle className="text-lg font-bold mt-2">Personalized Weekly Analysis</CardTitle>
              <CardDescription>Generated based on your trailing 14-day completion logs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground/90 leading-relaxed">
                "{analysis?.motivationalMessage}"
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Zap className="h-4 w-4 fill-primary/10" />
                <span>Coach Status: Active & Monitoring</span>
              </div>
            </CardContent>
          </Card>

          {/* Actionable Recommendations List */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-bold">Actionable Recommendations</CardTitle>
              <CardDescription>Tailored routines modification instructions</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3.5">
                {analysis?.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm font-medium">
                    <span className="flex h-5.5 w-5.5 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-foreground/90 leading-normal">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

        </div>

        {/* Right diagnostic info column */}
        <div className="space-y-6">
          
          {/* Consistency rating */}
          <Card className="border-border bg-card">
            <CardContent className="p-6 text-center space-y-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                Coach Consistency Score
              </span>
              <div className="text-5xl font-extrabold text-foreground tracking-tight">
                {analysis?.overallScore}%
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                Your average habit completion rate in the last 14 days.
              </p>
            </CardContent>
          </Card>

          {/* Detected weak habits panel */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base font-bold">At-Risk Routines</CardTitle>
              <CardDescription>Habits with &lt;50% completion rate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis?.weakHabits.length > 0 ? (
                analysis?.weakHabits.map((h: any) => (
                  <div key={h.id} className="flex items-center justify-between p-3 border border-border/40 bg-muted/10 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: h.color }} />
                      <span className="text-xs font-bold text-foreground truncate max-w-[120px]">{h.title}</span>
                    </div>
                    <span className="text-xs font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded-md">
                      {h.rate}% Rate
                    </span>
                  </div>
                ))
              ) : habits.length > 0 ? (
                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500 rounded-xl text-xs font-semibold">
                  <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>No weak habits detected. Superb consistency!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-muted/30 border border-border/40 text-muted-foreground rounded-xl text-xs font-medium">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>No routines active.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Follower Badge unlocked banner */}
          <Card className="border border-violet-500/20 bg-violet-500/5 rounded-2xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-violet-500 text-white rounded-xl">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-violet-500 uppercase tracking-widest">Achievement Unlocked</span>
                <h4 className="text-xs font-bold text-foreground">AI Follower Badge</h4>
                <p className="text-[9px] text-muted-foreground">Unlocked by consulting the coach report.</p>
              </div>
            </CardContent>
          </Card>

        </div>
        
      </div>
      
    </div>
  )
}
