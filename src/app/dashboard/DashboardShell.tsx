'use client'

import React, { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

interface DashboardShellProps {
  children: React.ReactNode
  profile: {
    email: string
    xp: number
    level: number
  }
}

export default function DashboardShell({
  children,
  profile
}: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      
      {/* Top Header */}
      <Header
        userEmail={profile.email}
        xp={profile.xp}
        level={profile.level}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Hub: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Navigation Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic Page Scroll Area */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
          
          {/* Dashboard Footer */}
          <Footer />
        </div>
        
      </div>
    </div>
  )
}
