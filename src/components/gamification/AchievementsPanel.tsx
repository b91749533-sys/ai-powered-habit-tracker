'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Award, Lock, CheckCircle2 } from 'lucide-react'

interface Achievement {
  id?: string
  badge_name: string
  unlocked_at?: string
}

interface AchievementsPanelProps {
  xp: number
  level: number
  unlockedAchievements: Achievement[]
}

const BADGES = [
  {
    name: 'First Step',
    description: 'Check off your first habit entry.',
    icon: CheckCircle2,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  },
  {
    name: 'Streak Master',
    description: 'Achieve a 7-day consistency streak.',
    icon: Award,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
  },
  {
    name: 'Habit Guru',
    description: 'Maintain a habit for 30 consecutive days.',
    icon: Award,
    color: 'text-violet-500 bg-violet-500/10 border-violet-500/20'
  },
  {
    name: 'AI Follower',
    description: 'Consult your AI coach advisor.',
    icon: Award,
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'
  }
]

export function AchievementsPanel({
  xp,
  level,
  unlockedAchievements = []
}: AchievementsPanelProps) {
  // Check if a badge is unlocked
  const isUnlocked = (badgeName: string) => {
    return unlockedAchievements.some(
      a => a.badge_name.toLowerCase() === badgeName.toLowerCase()
    )
  }

  const getUnlockDate = (badgeName: string) => {
    const ach = unlockedAchievements.find(
      a => a.badge_name.toLowerCase() === badgeName.toLowerCase()
    )
    if (ach && ach.unlocked_at) {
      return new Date(ach.unlocked_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }
    return null
  }

  const xpNeeded = level * 100
  const xpPercentage = Math.min(100, Math.floor((xp / xpNeeded) * 100))

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Achievements & Milestones</CardTitle>
        <CardDescription>Level up your character by building habits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* XP Status Level Info */}
        <div className="bg-muted/30 border border-border/40 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Level {level} Explorer</span>
            <span className="text-xs font-semibold text-muted-foreground">{xp} / {xpNeeded} XP</span>
          </div>
          <div className="w-full bg-border/60 rounded-full h-3.5 overflow-hidden p-[2px]">
            <div
              className="bg-gradient-to-r from-primary to-blue-500 h-full rounded-full transition-all duration-700 ease-out shadow-sm"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            Complete habits daily to earn +10 XP. Reach 100% on the XP bar to level up!
          </p>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 gap-3.5">
          {BADGES.map((badge, i) => {
            const unlocked = isUnlocked(badge.name)
            const unlockDate = getUnlockDate(badge.name)
            const BadgeIcon = badge.icon

            return (
              <div
                key={i}
                className={`relative flex flex-col items-center text-center p-4 rounded-xl border transition-all duration-300 ${
                  unlocked
                    ? `${badge.color} scale-[1.02]`
                    : 'bg-muted/10 border-border/30 grayscale opacity-60'
                }`}
              >
                {!unlocked && (
                  <div className="absolute top-2 right-2 p-1 bg-muted rounded-md text-muted-foreground">
                    <Lock className="h-3 w-3" />
                  </div>
                )}
                
                <div className={`p-2.5 rounded-xl mb-2 ${unlocked ? 'bg-card' : 'bg-muted'}`}>
                  <BadgeIcon className="h-5 w-5" />
                </div>
                
                <span className="text-xs font-bold text-foreground">
                  {badge.name}
                </span>
                
                <span className="text-[9px] text-muted-foreground leading-normal mt-1 max-w-[120px]">
                  {badge.description}
                </span>

                {unlocked && unlockDate && (
                  <span className="text-[8px] font-bold uppercase tracking-wider text-primary mt-2">
                    Unlocked {unlockDate}
                  </span>
                )}
              </div>
            )
          })}
        </div>

      </CardContent>
    </Card>
  )
}
