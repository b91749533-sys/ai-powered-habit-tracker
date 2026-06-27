/**
 * Calculates the current active streak and the historical longest streak
 * for a specific habit based on its completion entries.
 */
export function calculateStreak(habitId: string, entries: any[]): { currentStreak: number; longestStreak: number } {
  // Extract completed dates as "YYYY-MM-DD" strings
  const habitEntries = entries
    .filter(e => e.habit_id === habitId && e.completed)
    .map(e => {
      // Handle date format from Supabase (can be Date object or ISO string)
      const d = new Date(e.completed_at)
      return d.toISOString().split('T')[0]
    })
  
  if (habitEntries.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  const datesSet = new Set(habitEntries)
  const sortedDates = Array.from(datesSet).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  let currentStreak = 0
  
  const todayStr = new Date().toISOString().split('T')[0]
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const hasToday = datesSet.has(todayStr)
  const hasYesterday = datesSet.has(yesterdayStr)

  // Calculate current active streak
  if (hasToday || hasYesterday) {
    const checkDate = new Date(hasToday ? todayStr : yesterdayStr)
    let keepGoing = true
    
    while (keepGoing) {
      const dateStr = checkDate.toISOString().split('T')[0]
      if (datesSet.has(dateStr)) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        keepGoing = false
      }
    }
  }

  // Calculate longest historical streak
  let longestStreak = 0
  if (sortedDates.length > 0) {
    let tempStreak = 1
    let maxStreak = 1
    
    // Sort in chronological order (ascending) to count ranges
    const sortedAsc = [...sortedDates].reverse()
    
    for (let i = 1; i < sortedAsc.length; i++) {
      const prev = new Date(sortedAsc[i - 1])
      const curr = new Date(sortedAsc[i])
      
      const diffTime = Math.abs(curr.getTime() - prev.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        tempStreak++
        if (tempStreak > maxStreak) {
          maxStreak = tempStreak
        }
      } else if (diffDays > 1) {
        tempStreak = 1
      }
    }
    longestStreak = maxStreak
  }

  return {
    currentStreak,
    longestStreak: Math.max(currentStreak, longestStreak)
  }
}

/**
 * Aggregates statistics across all habits to find overall streak parameters
 */
export function aggregateStats(habits: any[], entries: any[]) {
  let longestStreak = 0
  let currentStreaksSum = 0

  habits.forEach(habit => {
    const { currentStreak, longestStreak: habitLongest } = calculateStreak(habit.id, entries)
    if (habitLongest > longestStreak) {
      longestStreak = habitLongest
    }
    currentStreaksSum += currentStreak
  })

  const todayStr = new Date().toISOString().split('T')[0]
  const completedToday = entries.filter(e => {
    const entryDate = new Date(e.completed_at).toISOString().split('T')[0]
    return entryDate === todayStr && e.completed
  }).length

  const totalHabits = habits.length
  const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0

  return {
    completedToday,
    longestStreak,
    completionRate
  }
}
