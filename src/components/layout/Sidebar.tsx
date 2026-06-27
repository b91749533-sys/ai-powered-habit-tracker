'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, TrendingUp, Sparkles, Settings, X, ShieldAlert } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  const navItems = [
    {
      label: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      label: 'Analytics',
      href: '/dashboard/analytics',
      icon: TrendingUp
    },
    {
      label: 'AI Habit Coach',
      href: '/dashboard/ai-coach',
      icon: Sparkles
    },
    {
      label: 'Settings',
      href: '/dashboard/settings',
      icon: Settings
    }
  ]

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/40 bg-card/65 backdrop-blur-md transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header (Close Button) */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-border/40 lg:hidden">
          <span className="font-bold text-sm tracking-wider uppercase text-muted-foreground">Menu</span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3.5 px-4 h-11 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                }`} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer info (Youssef credit in sidebar too) */}
        <div className="p-4 border-t border-border/40 bg-muted/20">
          <div className="rounded-xl bg-card border border-border/40 p-3.5 flex items-start gap-2.5">
            <ShieldAlert className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-foreground">RLS Guard Active</h4>
              <p className="text-[10px] text-muted-foreground leading-normal">
                Your habits database is fully secured with Supabase Row Level Security.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
