/**
 * Standard utility cookie getters/setters for client side mock storage.
 */
function getClientCookie(name: string): string | null {
  if (typeof window === 'undefined') return null
  const nameEQ = name + "="
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length))
  }
  return null
}

function setClientCookie(name: string, value: string) {
  if (typeof window === 'undefined') return
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000`
}

/**
 * Clean mock Supabase client mirroring the database schema and RLS behavior.
 */
export function getMockClient(cookieStore?: any) {
  const getData = (key: string, defaultVal: any) => {
    let raw = null
    if (cookieStore) {
      raw = cookieStore.get(key)?.value
    } else {
      raw = getClientCookie(key)
    }
    if (!raw) return defaultVal
    try {
      return JSON.parse(raw)
    } catch {
      return defaultVal
    }
  }

  const saveData = (key: string, data: any) => {
    const val = JSON.stringify(data)
    if (cookieStore) {
      try {
        cookieStore.set(key, val, { path: '/' })
      } catch {
        // Can fail if setting cookies during server rendering phase,
        // which is expected in Next.js Server Components.
      }
    } else {
      setClientCookie(key, val)
    }
  }

  // Pre-seed habits mock dataset helper for first time users
  const getPreseededHabits = (userId: string) => [
    {
      id: 'habit-seed-1',
      user_id: userId,
      title: 'Morning Meditation',
      description: '10 minutes of mindfulness breathing session',
      category: 'Mindfulness',
      icon: 'Smile',
      color: '#8b5cf6',
      frequency: { type: 'daily' },
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString()
    },
    {
      id: 'habit-seed-2',
      user_id: userId,
      title: 'Gym Workout',
      description: '45 minutes weight lifting / strength session',
      category: 'Fitness',
      icon: 'Dumbbell',
      color: '#f43f5e',
      frequency: { type: 'custom', days: ['Monday', 'Wednesday', 'Friday'] },
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString()
    },
    {
      id: 'habit-seed-3',
      user_id: userId,
      title: 'Read Tech Articles',
      description: 'Read 2 articles or chapters from learning books',
      category: 'Work',
      icon: 'BookOpen',
      color: '#3b82f6',
      frequency: { type: 'daily' },
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString()
    },
    {
      id: 'habit-seed-4',
      user_id: userId,
      title: 'Drink 3L Water',
      description: 'Stay hydrated throughout the workday',
      category: 'Health',
      icon: 'Droplet',
      color: '#06b6d4',
      frequency: { type: 'daily' },
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
    }
  ]

  const getPreseededEntries = () => {
    const entriesList = []
    const todayStr = new Date().toISOString().split('T')[0]
    
    // Create trailing dates
    const getDateOffset = (offset: number) => {
      const d = new Date()
      d.setDate(d.getDate() - offset)
      return d.toISOString().split('T')[0]
    }

    // Seed Meditation completions
    for (let i = 0; i <= 6; i++) {
      if (i !== 5) { // Skip day 5 for variability
        entriesList.push({
          id: `entry-seed-med-${i}`,
          habit_id: 'habit-seed-1',
          completed: true,
          completed_at: getDateOffset(i),
          created_at: new Date().toISOString()
        })
      }
    }

    // Seed Gym completions
    entriesList.push(
      { id: 'entry-seed-gym-0', habit_id: 'habit-seed-2', completed: true, completed_at: getDateOffset(0), created_at: new Date().toISOString() },
      { id: 'entry-seed-gym-2', habit_id: 'habit-seed-2', completed: true, completed_at: getDateOffset(2), created_at: new Date().toISOString() },
      { id: 'entry-seed-gym-4', habit_id: 'habit-seed-2', completed: true, completed_at: getDateOffset(4), created_at: new Date().toISOString() }
    )

    // Seed Reading completions
    for (let i = 0; i <= 6; i++) {
      entriesList.push({
        id: `entry-seed-read-${i}`,
        habit_id: 'habit-seed-3',
        completed: true,
        completed_at: getDateOffset(i),
        created_at: new Date().toISOString()
      })
    }

    return entriesList
  }

  const getPreseededAchievements = (userId: string) => [
    {
      id: 'ach-seed-1',
      user_id: userId,
      badge_name: 'First Step',
      unlocked_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString()
    },
    {
      id: 'ach-seed-2',
      user_id: userId,
      badge_name: 'Streak Master',
      unlocked_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString()
    }
  ]

  return {
    auth: {
      getUser: async () => {
        const session = getData('sb-mock-session', null)
        if (session && session.user) {
          return { data: { user: session.user }, error: null }
        }
        return { data: { user: null }, error: null }
      },
      getSession: async () => {
        const session = getData('sb-mock-session', null)
        return { data: { session }, error: null }
      },
      signUp: async ({ email, password }: any) => {
        if (!email || !password) {
          return { data: null, error: { message: 'Email and password are required.' } }
        }
        if (password.length < 6) {
          return { data: null, error: { message: 'Password should be at least 6 characters.' } }
        }
        
        const profiles = getData('sb-mock-profiles', {})
        const emailExists = Object.values(profiles).some((p: any) => p.email.toLowerCase() === email.toLowerCase())
        
        if (emailExists) {
          return { data: null, error: { message: 'User already registered.' } }
        }

        const userId = 'mock-usr-' + Math.random().toString(36).substr(2, 9)
        const newUser = { id: userId, email }
        const session = { user: newUser, access_token: 'mock-access-token' }

        // Setup profile details
        profiles[userId] = {
          id: userId,
          email,
          xp: 40,
          level: 2,
          reminder_time: '08:00:00',
          reminder_enabled: false,
          email_reminder_enabled: false,
          created_at: new Date().toISOString()
        }

        saveData('sb-mock-profiles', profiles)
        saveData('sb-mock-session', session)

        // Seed default dataset for premium feeling right away
        const habits = getData('sb-mock-habits', [])
        const entries = getData('sb-mock-entries', [])
        const achievements = getData('sb-mock-achievements', [])

        habits.push(...getPreseededHabits(userId))
        entries.push(...getPreseededEntries())
        achievements.push(...getPreseededAchievements(userId))

        saveData('sb-mock-habits', habits)
        saveData('sb-mock-entries', entries)
        saveData('sb-mock-achievements', achievements)

        return { data: { user: newUser, session }, error: null }
      },
      signInWithPassword: async ({ email, password }: any) => {
        if (!email || !password) {
          return { data: null, error: { message: 'Email and password are required.' } }
        }

        const profiles = getData('sb-mock-profiles', {})
        const userProfile = Object.values(profiles).find((p: any) => p.email.toLowerCase() === email.toLowerCase()) as any

        if (!userProfile) {
          return { data: null, error: { message: 'Invalid login credentials. User not found.' } }
        }

        const session = { user: { id: userProfile.id, email: userProfile.email }, access_token: 'mock-access-token' }
        saveData('sb-mock-session', session)

        return { data: { user: session.user, session }, error: null }
      },
      signOut: async () => {
        saveData('sb-mock-session', null)
        return { error: null }
      },
      updateUser: async ({ password }: any) => {
        if (password && password.length < 6) {
          return { data: null, error: { message: 'Password should be at least 6 characters.' } }
        }
        return { data: { user: {} }, error: null }
      }
    },

    from: (table: string) => {
      const session = getData('sb-mock-session', null)
      const userId = session?.user?.id || 'anonymous'

      return {
        select: (fields?: string) => {
          let dataList: any[] = []

          if (table === 'profiles') {
            const profiles = getData('sb-mock-profiles', {})
            dataList = Object.values(profiles)
          } else if (table === 'habits') {
            const habits = getData('sb-mock-habits', [])
            dataList = habits.filter((h: any) => h.user_id === userId)
          } else if (table === 'habit_entries') {
            const habits = getData('sb-mock-habits', [])
            const userHabitIds = habits.filter((h: any) => h.user_id === userId).map((h: any) => h.id)
            const entries = getData('sb-mock-entries', [])
            dataList = entries.filter((e: any) => userHabitIds.includes(e.habit_id))
          } else if (table === 'achievements') {
            const achievements = getData('sb-mock-achievements', [])
            dataList = achievements.filter((a: any) => a.user_id === userId)
          }

          const chain = {
            eq: (col: string, val: any) => {
              dataList = dataList.filter(item => item[col] === val)
              return chain
            },
            order: (col: string, opts?: any) => {
              dataList.sort((a, b) => {
                const valA = a[col]
                const valB = b[col]
                if (valA < valB) return opts?.ascending ? -1 : 1
                if (valA > valB) return opts?.ascending ? 1 : -1
                return 0
              })
              return chain
            },
            single: async () => {
              if (dataList.length === 0) {
                return { data: null, error: { message: `Row not found in ${table}` } }
              }
              return { data: dataList[0], error: null }
            },
            then: (resolve: any) => {
              resolve({ data: dataList, error: null })
            }
          }
          return chain
        },

        insert: (rowOrRows: any) => {
          const rows = Array.isArray(rowOrRows) ? rowOrRows : [rowOrRows]

          if (table === 'profiles') {
            const profiles = getData('sb-mock-profiles', {})
            const id = rows[0].id || 'mock-usr-' + Math.random().toString(36).substr(2, 9)
            profiles[id] = {
              id,
              xp: 0,
              level: 1,
              reminder_time: '08:00:00',
              reminder_enabled: false,
              email_reminder_enabled: false,
              created_at: new Date().toISOString(),
              ...rows[0]
            }
            saveData('sb-mock-profiles', profiles)

            const inserted = [profiles[id]]
            const chain = {
              select: () => ({
                single: async () => ({ data: inserted[0], error: null }),
                then: (resolve: any) => resolve({ data: inserted, error: null })
              }),
              then: (resolve: any) => resolve({ data: inserted, error: null })
            }
            return chain
          }

          if (table === 'habits') {
            const habits = getData('sb-mock-habits', [])
            const inserted = rows.map(r => ({
              id: 'habit-' + Math.random().toString(36).substr(2, 9),
              created_at: new Date().toISOString(),
              ...r
            }))
            habits.push(...inserted)
            saveData('sb-mock-habits', habits)

            const chain = {
              select: () => ({
                single: async () => ({ data: inserted[0], error: null }),
                then: (resolve: any) => resolve({ data: inserted, error: null })
              }),
              then: (resolve: any) => resolve({ data: inserted, error: null })
            }
            return chain
          }

          if (table === 'habit_entries') {
            const entries = getData('sb-mock-entries', [])
            const inserted = rows.map(r => ({
              id: 'entry-' + Math.random().toString(36).substr(2, 9),
              created_at: new Date().toISOString(),
              ...r
            }))
            entries.push(...inserted)
            saveData('sb-mock-entries', entries)

            const chain = {
              then: (resolve: any) => resolve({ data: inserted, error: null })
            }
            return chain
          }

          if (table === 'achievements') {
            const achievements = getData('sb-mock-achievements', [])
            const inserted = rows.map(r => ({
              id: 'ach-' + Math.random().toString(36).substr(2, 9),
              unlocked_at: new Date().toISOString(),
              ...r
            }))
            achievements.push(...inserted)
            saveData('sb-mock-achievements', achievements)

            const chain = {
              then: (resolve: any) => resolve({ data: inserted, error: null })
            }
            return chain
          }

          return {
            then: (resolve: any) => resolve({ data: rows, error: null })
          }
        },

        update: (updateFields: any) => {
          const chain = {
            eq: (col: string, val: any) => {
              if (table === 'profiles') {
                const profiles = getData('sb-mock-profiles', {})
                if (profiles[val]) {
                  profiles[val] = { ...profiles[val], ...updateFields }
                  saveData('sb-mock-profiles', profiles)
                }
              } else if (table === 'habits') {
                const habits = getData('sb-mock-habits', [])
                const updated = habits.map((h: any) => h.id === val ? { ...h, ...updateFields } : h)
                saveData('sb-mock-habits', updated)
              }

              const innerChain = {
                select: () => ({
                  single: async () => {
                    if (table === 'profiles') {
                      const profiles = getData('sb-mock-profiles', {})
                      return { data: profiles[val], error: null }
                    }
                    if (table === 'habits') {
                      const habits = getData('sb-mock-habits', [])
                      const habit = habits.find((h: any) => h.id === val)
                      return { data: habit, error: null }
                    }
                    return { data: null, error: null }
                  }
                }),
                then: (resolve: any) => resolve({ error: null })
              }
              return innerChain
            }
          }
          return chain
        },

        delete: () => {
          const chain = {
            eq: (col: string, val: any) => {
              const innerChain = {
                eq: (col2: string, val2: any) => {
                  if (table === 'habit_entries') {
                    const entries = getData('sb-mock-entries', [])
                    // Filter out by habit_id and completed_at
                    const filtered = entries.filter((e: any) => !(e.habit_id === val && e.completed_at === val2))
                    saveData('sb-mock-entries', filtered)
                  }
                  return {
                    then: (resolve: any) => resolve({ error: null })
                  }
                },
                then: (resolve: any) => {
                  if (table === 'habits') {
                    const habits = getData('sb-mock-habits', [])
                    const filtered = habits.filter((h: any) => h.id !== val)
                    saveData('sb-mock-habits', filtered)

                    // Cascade delete habit entries
                    const entries = getData('sb-mock-entries', [])
                    const filteredEntries = entries.filter((e: any) => e.habit_id !== val)
                    saveData('sb-mock-entries', filteredEntries)
                  }
                  resolve({ error: null })
                }
              }
              return innerChain
            }
          }
          return chain
        }
      }
    }
  }
}
