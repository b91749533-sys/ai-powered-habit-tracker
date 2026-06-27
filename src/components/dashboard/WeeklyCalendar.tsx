'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Check } from 'lucide-react'

interface WeeklyCalendarProps {
  habits: any[]
  entries: any[]
}

export function WeeklyCalendar({ habits, entries }: WeeklyCalendarProps) {
  // Generate the last 7 days (including today)
  const getTrailingDays = () => {
    const days = []
    const today = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(today.getDate() - i)
      days.push(d)
    }
    return days
  }

  const trailingDays = getTrailingDays()

  // Calculate completion statistics for a specific date
  const getDayStats = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    
    // Total habits active on this day (for simplicity, we assume all current habits were active)
    const habitsCount = habits.length
    if (habitsCount === 0) return { completed: 0, total: 0, percentage: 0 }

    // Count how many habits have a completion entry for this date
    const completedCount = entries.filter(entry => {
      const entryDate = new Date(entry.completed_at).toISOString().split('T')[0]
      return entryDate === dateString && entry.completed
    }).length

    const percentage = Math.round((completedCount / habitsCount) * 100)
    return {
      completed: completedCount,
      total: habitsCount,
      percentage
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Weekly Report</CardTitle>
        <CardDescription>Visual tracker of the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {trailingDays.map((date, i) => {
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
            const dayNum = date.getDate()
            const isToday = date.toDateString() === new Date().toDateString()
            const stats = getDayStats(date)
            
            return (
              <div
                key={i}
                className={`flex flex-col items-center p-2 rounded-xl border ${
                  isToday 
                    ? 'border-primary bg-primary/5 text-foreground' 
                    : 'border-border/40 bg-muted/20 text-muted-foreground'
                }`}
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  {dayName.slice(0, 3)}
                </span>
                <span className={`text-sm font-bold my-1 ${isToday ? 'text-primary' : 'text-foreground'}`}>
                  {dayNum}
                </span>

                {/* Progress Visualizer Ring or Circle */}
                <div className="mt-1 flex items-center justify-center h-8 w-8 rounded-full border border-border relative">
                  {habits.length > 0 ? (
                    stats.percentage === 100 ? (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                        <Check className="h-4 w-4 stroke-[3]" />
                      </div>
                    ) : stats.percentage > 0 ? (
                      <div 
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[10px]"
                        style={{ border: `2px solid hsl(var(--primary))` }}
                      >
                        {stats.percentage}%
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/60 font-medium">-</span>
                    )
                  ) : (
                    <span className="text-[10px] text-muted-foreground/40 font-medium">-</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
