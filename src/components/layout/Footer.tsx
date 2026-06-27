import React from 'react'

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 py-6 text-center text-xs text-muted-foreground bg-background">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} HabitFlow. All rights reserved.</p>
        <p className="font-medium tracking-wide">
          made by <span className="text-foreground font-semibold hover:text-primary transition-colors cursor-default">Youssef Manssouri</span>
        </p>
      </div>
    </footer>
  )
}
