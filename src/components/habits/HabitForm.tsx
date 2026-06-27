'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, Activity, BookOpen, Briefcase, Coffee, Heart, Moon, Smile, Flame, DollarSign, Dumbbell, Droplet, Apple, Brain } from 'lucide-react'

interface HabitFormProps {
  initialData?: any
  onSubmit: (data: any) => void
  onCancel: () => void
  isLoading?: boolean
}

const CATEGORIES = ['Health', 'Fitness', 'Work', 'Mindfulness', 'Finance', 'Social', 'Other']

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#8b5cf6', // violet
  '#f97316', // orange
  '#06b6d4', // cyan
]

const ICONS = [
  { name: 'Activity', component: Activity },
  { name: 'BookOpen', component: BookOpen },
  { name: 'Briefcase', component: Briefcase },
  { name: 'Coffee', component: Coffee },
  { name: 'Heart', component: Heart },
  { name: 'Moon', component: Moon },
  { name: 'Smile', component: Smile },
  { name: 'Flame', component: Flame },
  { name: 'DollarSign', component: DollarSign },
  { name: 'Dumbbell', component: Dumbbell },
  { name: 'Droplet', component: Droplet },
  { name: 'Apple', component: Apple },
  { name: 'Brain', component: Brain },
]

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function HabitForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}: HabitFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Health')
  const [color, setColor] = useState('#3b82f6')
  const [icon, setIcon] = useState('Activity')
  const [freqType, setFreqType] = useState<'daily' | 'weekly' | 'custom'>('daily')
  const [customDays, setCustomDays] = useState<string[]>([])
  
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '')
      setDescription(initialData.description || '')
      setCategory(initialData.category || 'Health')
      setColor(initialData.color || '#3b82f6')
      setIcon(initialData.icon || 'Activity')
      
      const freq = initialData.frequency || { type: 'daily' }
      setFreqType(freq.type || 'daily')
      setCustomDays(freq.days || [])
    }
  }, [initialData])

  const handleWeekdayToggle = (day: string) => {
    if (customDays.includes(day)) {
      setCustomDays(customDays.filter(d => d !== day))
    } else {
      setCustomDays([...customDays, day])
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!title.trim()) {
      setValidationError('Please enter a habit title.')
      return
    }

    if (freqType === 'custom' && customDays.length === 0) {
      setValidationError('Please select at least one day for custom frequency.')
      return
    }

    const frequency = {
      type: freqType,
      ...(freqType === 'custom' ? { days: customDays } : {})
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      category,
      color,
      icon,
      frequency
    })
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5">
      {validationError && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
          {validationError}
        </div>
      )}

      {/* Habit Title */}
      <Input
        label="Habit Name"
        placeholder="e.g. Morning Meditation"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isLoading}
        required
      />

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Description
        </label>
        <textarea
          placeholder="e.g. 10 minutes of mindfulness breathing session"
          rows={2}
          className="flex w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Category Dropdown */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isLoading}
          className="flex h-11 w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary"
        >
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Color Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Select Color
        </label>
        <div className="flex items-center gap-2.5 flex-wrap">
          {COLORS.map(c => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              className="h-8 w-8 rounded-full border border-border/20 transition-transform active:scale-90 flex items-center justify-center cursor-pointer shadow-sm"
              style={{ backgroundColor: c }}
            >
              {color === c && (
                <Check className="h-4.5 w-4.5 text-white stroke-[2.5]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Icon Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Select Icon
        </label>
        <div className="grid grid-cols-7 gap-2">
          {ICONS.map(i => {
            const IconComponent = i.component
            const isSelected = icon === i.name
            return (
              <button
                type="button"
                key={i.name}
                onClick={() => setIcon(i.name)}
                className={`p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary scale-[1.02]'
                    : 'border-border/60 hover:bg-muted text-muted-foreground'
                }`}
              >
                <IconComponent className="h-4.5 w-4.5" />
              </button>
            )
          })}
        </div>
      </div>

      {/* Frequency Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Frequency
        </label>
        <div className="flex rounded-xl border border-border/80 bg-muted/20 p-1">
          {(['daily', 'weekly', 'custom'] as const).map(type => (
            <button
              type="button"
              key={type}
              onClick={() => setFreqType(type)}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer ${
                freqType === type
                  ? 'bg-card text-foreground shadow-sm border border-border/40'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        
        {/* Custom Days Checkbox Panel */}
        {freqType === 'custom' && (
          <div className="grid grid-cols-2 gap-2 mt-2 p-3 bg-muted/30 border border-border/40 rounded-xl animate-fade-in">
            {WEEKDAYS.map(day => {
              const checked = customDays.includes(day)
              return (
                <label
                  key={day}
                  className={`flex items-center gap-2.5 px-3 py-2 border rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    checked
                      ? 'border-primary/30 bg-primary/5 text-primary'
                      : 'border-border/60 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleWeekdayToggle(day)}
                    className="h-3.5 w-3.5 accent-primary rounded border-border"
                  />
                  {day.slice(0, 3)}day
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
        >
          {initialData ? 'Save Changes' : 'Create Habit'}
        </Button>
      </div>
    </form>
  )
}
