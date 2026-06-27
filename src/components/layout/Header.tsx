'use client'

import React, { useEffect, useState } from 'react'
import { Sun, Moon, LogOut, CheckCircle, Menu } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  userEmail?: string
  xp?: number
  level?: number
  onToggleSidebar?: () => void
}

export function Header({
  userEmail,
  xp = 0,
  level = 1,
  onToggleSidebar
}: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    // Initialize theme based on localStorage or document class
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } else {
      // Default to dark or match preferences
      const isDark = document.documentElement.classList.contains('dark') || 
                     window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(isDark ? 'dark' : 'light')
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Calculate XP threshold for next level
  const xpNeeded = level * 100
  const xpPercentage = Math.min(100, Math.floor((xp / xpNeeded) * 100))

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/85 backdrop-blur-md">
      <div className="h-16 px-4 flex items-center justify-between">
        
        {/* Left section: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <CheckCircle className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:inline-block">
              HabitFlow
            </span>
          </div>
        </div>

        {/* Center/Right section: XP and Actions */}
        <div className="flex items-center gap-4">
          
          {/* XP Bar (only visible on larger screens or compact format on mobile) */}
          {userEmail && (
            <div className="flex items-center gap-2 bg-muted/50 border border-border/40 py-1.5 px-3 rounded-2xl max-w-xs md:max-w-sm">
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                Lv. {level}
              </span>
              <div className="w-16 sm:w-24 bg-border/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground hidden sm:inline-block">
                {xp}/{xpNeeded} XP
              </span>
            </div>
          )}

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl transition-all duration-200 cursor-pointer active:scale-95 border border-border/40 bg-card/50"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          {/* User Signout */}
          {userEmail && (
            <div className="flex items-center gap-2 border-l border-border/60 pl-3">
              <span className="text-xs font-medium text-muted-foreground hidden lg:inline-block max-w-[120px] truncate" title={userEmail}>
                {userEmail}
              </span>
              <button
                onClick={handleSignOut}
                className="p-2.5 text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-200 cursor-pointer active:scale-95"
                title="Sign Out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          )}
          
        </div>
      </div>
    </header>
  )
}
