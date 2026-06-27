import React from 'react'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Activity, Award, Sparkles, TrendingUp, Bell, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Footer } from '@/components/layout/Footer'

export const metadata = {
  title: 'HabitFlow | Build Better Habits with AI & Gamification',
  description: 'Track habits, earn XP, unlock achievements, and get personalized recommendations from your AI Habit Coach. Beautifully minimalist, Apple-inspired aesthetics.',
}

export default function LandingPage() {
  const features = [
    {
      title: 'Minimalist Tracking',
      description: 'Mark habits as completed with a single tap. High-performance calendar logging and visual weekly status at a glance.',
      icon: Activity
    },
    {
      title: 'Gamified Milestones',
      description: 'Earn XP, level up, and unlock achievements. Build consistency streaks and hit personal best records.',
      icon: Award
    },
    {
      title: 'AI Habit Coach',
      description: 'Receive weekly actionable recommendations. Detect weak habits, analyze trends, and get smart encouragement.',
      icon: Sparkles
    },
    {
      title: 'Deep Analytics',
      description: 'Beautiful charts showing success rates, consistency scores, and completion history over weeks and months.',
      icon: TrendingUp
    },
    {
      title: 'Reminders & Notifications',
      description: 'Get daily summary emails or custom browser notifications at your preferred time to maintain your streaks.',
      icon: Bell
    },
    {
      title: 'Hyper Performance',
      description: 'Zero bloat. Fast loading, responsive layout built with Next.js 15, Tailwind CSS, and Supabase security.',
      icon: Zap
    }
  ]

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background bg-grid-pattern overflow-x-hidden">
      
      {/* Navigation Header */}
      <header className="w-full border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <CheckCircle className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">HabitFlow</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto px-6 py-20 md:py-32 flex flex-col items-center text-center gap-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs text-muted-foreground shadow-sm animate-fade-in">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Supercharged by AI habit insights</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1] animate-slide-up">
          Build habits that <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">actually stick</span>.
        </h1>

        <p className="text-muted-foreground text-base sm:text-xl max-w-2xl leading-relaxed animate-slide-up">
          HabitFlow combines beautiful, Apple-inspired minimalism with advanced gamification mechanics and AI-driven coaching to automate your personal growth.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-6 animate-slide-up">
          <Link href="/register">
            <Button size="lg" icon={ArrowRight} iconPosition="right">
              Start Free Today
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Sign In to Your Dashboard
            </Button>
          </Link>
        </div>

        {/* Feature Preview Mockup */}
        <div className="w-full max-w-5xl mt-16 rounded-3xl border border-border/80 bg-card p-2 sm:p-4 shadow-2xl overflow-hidden aspect-[16/9] flex flex-col gap-2 bg-radial from-card via-muted/20 to-muted/50 animate-fade-in">
          <div className="flex items-center justify-between border-b border-border/40 px-4 py-3 bg-card/65 rounded-t-2xl">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest bg-muted px-2 py-0.5 rounded-md">
              dashboard-preview.png
            </div>
            <div className="w-12" />
          </div>
          <div className="flex-1 flex items-center justify-center p-8 bg-card/40 rounded-b-2xl">
            <div className="space-y-4 max-w-md">
              <div className="h-6 bg-primary/20 w-3/4 rounded-lg mx-auto animate-pulse" />
              <div className="h-3 bg-muted-foreground/20 w-full rounded-md mx-auto animate-pulse" />
              <div className="h-3 bg-muted-foreground/20 w-5/6 rounded-md mx-auto animate-pulse" />
              <div className="h-3 bg-muted-foreground/20 w-4/5 rounded-md mx-auto animate-pulse" />
              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="h-14 bg-muted/60 border border-border rounded-xl animate-pulse" />
                <div className="h-14 bg-muted/60 border border-border rounded-xl animate-pulse" />
                <div className="h-14 bg-muted/60 border border-border rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-card/45 border-t border-b border-border/40 py-24 w-full">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Designed for consistency.
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Every detail is meticulously crafted to support your psychology and keep you motivated.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <Card key={i} className="border-border bg-card/65 backdrop-blur-md rounded-2xl hover:scale-[1.01] transition-transform duration-200">
                  <CardContent className="p-8 space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold tracking-tight">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-32 flex flex-col items-center text-center gap-6">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-xl leading-tight">
          Ready to level up your life?
        </h2>
        <p className="text-muted-foreground text-base max-w-md leading-relaxed">
          Create your account in seconds, define your goals, and let our AI helper keep you on track.
        </p>
        <div className="mt-4">
          <Link href="/register">
            <Button size="lg" icon={ArrowRight} iconPosition="right">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
