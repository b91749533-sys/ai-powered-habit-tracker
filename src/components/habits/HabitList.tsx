'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Edit2, Trash2, Calendar, Sparkles } from 'lucide-react'
import * as Icons from 'lucide-react'

interface Habit {
  id: string
  title: string
  description?: string
  category: string
  icon: string
  color: string
  frequency: {
    type: 'daily' | 'weekly' | 'custom'
    days?: string[]
  }
}

interface HabitListProps {
  habits: Habit[]
  entries: any[]
  onToggleComplete: (habitId: string, isCompleted: boolean) => void
  onEdit: (habit: Habit) => void
  onDelete: (habitId: string) => void
}

export function HabitList({
  habits,
  entries,
  onToggleComplete,
  onEdit,
  onDelete
}: HabitListProps) {
  
  const todayStr = new Date().toISOString().split('T')[0]

  const isCompletedToday = (habitId: string) => {
    return entries.some(
      entry => entry.habit_id === habitId && 
               new Date(entry.completed_at).toISOString().split('T')[0] === todayStr && 
               entry.completed
    )
  }

  // Helper to dynamically resolve the Lucide Icon
  const renderIcon = (iconName: string, color: string) => {
    // Fallback to Activity if not found
    const IconComponent = (Icons as any)[iconName] || Icons.Activity
    return <IconComponent className="h-5 w-5" style={{ color }} />
  }

  const formatFrequency = (freq: Habit['frequency']) => {
    if (freq.type === 'daily') return 'Every day'
    if (freq.type === 'weekly') return 'Once a week'
    if (freq.type === 'custom' && freq.days) {
      return freq.days.map(d => d.slice(0, 3)).join(', ')
    }
    return 'Daily'
  }

  if (habits.length === 0) {
    return (
      <Card className="border border-dashed border-border/80 bg-muted/5 py-12 text-center rounded-2xl">
        <CardContent className="flex flex-col items-center justify-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/40 text-muted-foreground/60 border border-border">
            <Calendar className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">No habits active</h3>
            <p className="text-xs text-muted-foreground max-w-[280px]">
              You haven't created any habits yet. Start tracking your progress today!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3.5">
      {habits.map((habit) => {
        const completed = isCompletedToday(habit.id)

        return (
          <Card
            key={habit.id}
            className={`border transition-all duration-200 ${
              completed 
                ? 'border-emerald-500/20 bg-emerald-500/5' 
                : 'border-border/60 bg-card hover:border-border'
            }`}
          >
            <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">
              
              {/* Left section: Checkbox and Details */}
              <div className="flex items-center gap-4 flex-1">
                
                {/* Clean Custom Checkbox */}
                <button
                  type="button"
                  onClick={() => onToggleComplete(habit.id, completed)}
                  className={`h-7 w-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer ${
                    completed
                      ? 'border-emerald-500 bg-emerald-500 text-white scale-[1.03] shadow-sm shadow-emerald-500/20'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  {completed && <Icons.Check className="h-4.5 w-4.5 stroke-[3]" />}
                </button>

                {/* Habit details */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span 
                      className={`text-sm font-semibold truncate ${
                        completed ? 'line-through text-muted-foreground/60' : 'text-foreground'
                      }`}
                    >
                      {habit.title}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground/65 bg-muted/60 px-2 py-0.5 rounded-md">
                      {habit.category}
                    </span>
                  </div>
                  
                  {habit.description && (
                    <p className={`text-xs truncate ${
                      completed ? 'text-muted-foreground/40' : 'text-muted-foreground'
                    }`}>
                      {habit.description}
                    </p>
                  )}
                  
                  <span className="text-[10px] text-muted-foreground font-medium block">
                    {formatFrequency(habit.frequency)}
                  </span>
                </div>
              </div>

              {/* Right section: Category Icon and Edit/Delete controls */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="p-2 rounded-xl bg-muted/30 border border-border/40">
                  {renderIcon(habit.icon, habit.color)}
                </div>
                
                <div className="flex items-center border-l border-border/60 pl-3 gap-1">
                  <button
                    onClick={() => onEdit(habit)}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                    title="Edit Habit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(habit.id)}
                    className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer"
                    title="Delete Habit"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
