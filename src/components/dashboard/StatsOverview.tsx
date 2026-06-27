'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Flame, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react'

interface StatsOverviewProps {
  totalHabits: number
  completedToday: number
  longestStreak: number
  completionRate: number
}

// Predefined motivational quotes for healthy habit building
const QUOTES = [
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Habits are the compound interest of self-improvement.", author: "James Clear" },
  { text: "It is easier to prevent bad habits than to break them.", author: "Benjamin Franklin" },
  { text: "Your habits will determine your future.", author: "Jack Canfield" },
  { text: "An ounce of prevention is worth a pound of cure.", author: "Henry Brougham" }
]

export function StatsOverview({
  totalHabits,
  completedToday,
  longestStreak,
  completionRate
}: StatsOverviewProps) {
  // Get a random quote based on the current day
  const dayIndex = new Date().getDate() % QUOTES.length
  const quote = QUOTES[dayIndex]

  const stats = [
    {
      title: 'Habit Streaks',
      value: `${longestStreak} Days`,
      subText: 'Longest active streak',
      icon: Flame,
      color: 'text-amber-500 bg-amber-500/10'
    },
    {
      title: 'Today\'s Progress',
      value: `${completionRate}%`,
      subText: `${completedToday} of ${totalHabits} completed`,
      icon: CheckCircle2,
      color: 'text-primary bg-primary/10'
    },
    {
      title: 'Consistency Index',
      value: totalHabits > 0 ? (completionRate >= 80 ? 'Excellent' : completionRate >= 50 ? 'Steady' : 'Starting') : 'No Habits',
      subText: 'Based on current performance',
      icon: TrendingUp,
      color: 'text-emerald-500 bg-emerald-500/10'
    }
  ]

  return (
    <div className="space-y-6">
      
      {/* Motivational Quote Banner */}
      <Card className="border border-primary/20 bg-primary/5 rounded-2xl relative overflow-hidden shadow-inner">
        <div className="absolute right-4 top-4 text-primary/10 pointer-events-none">
          <Sparkles className="h-20 w-20" />
        </div>
        <CardContent className="p-6">
          <div className="max-w-2xl">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md">
              Daily Focus
            </span>
            <p className="mt-3 text-sm sm:text-base font-medium italic text-foreground/90 leading-relaxed">
              "{quote.text}"
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground font-semibold">
              — {quote.author}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Numerical Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="hover-effect border-border bg-card">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {stat.title}
                  </span>
                  <div className="text-2xl font-bold tracking-tight">
                    {stat.value}
                  </div>
                  <span className="text-[11px] text-muted-foreground block">
                    {stat.subText}
                  </span>
                </div>
                <div className={`p-3.5 rounded-xl ${stat.color} shrink-0`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
    </div>
  )
}
