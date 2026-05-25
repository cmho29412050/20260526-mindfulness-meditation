export interface MeditationSession {
  id: string
  date: string // ISO string
  durationMinutes: number
  moodBefore?: string
  moodAfter?: string
  vibeMode?: string
}

export interface UserStats {
  totalSessions: number
  totalMinutes: number
  currentStreak: number
  longestStreak: number
  lastSessionDate: string | null
}

const STORAGE_KEYS = {
  SESSIONS: 'zenith_sessions',
  STATS: 'zenith_stats',
  PREFS: 'zenith_prefs'
}

export const getSessions = (): MeditationSession[] => {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error("Error reading sessions from local storage", e)
    return []
  }
}

export const saveSession = (session: Omit<MeditationSession, 'id' | 'date'>) => {
  if (typeof window === 'undefined') return null
  
  try {
    const sessions = getSessions()
    const newSession: MeditationSession = {
      ...session,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    }
    
    sessions.unshift(newSession)
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))
    
    updateStats(newSession)
    return newSession
  } catch (e) {
    console.error("Error saving session to local storage", e)
    return null
  }
}

const updateStats = (newSession: MeditationSession) => {
  try {
    const stats = getStats()
    const sessionDate = new Date(newSession.date)
    
    // Update totals
    stats.totalSessions += 1
    stats.totalMinutes += newSession.durationMinutes
    
    // Update streak
    if (stats.lastSessionDate) {
      const lastDate = new Date(stats.lastSessionDate)
      
      // Normalize dates to midnight for accurate day difference
      const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate())
      const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate())
      
      const diffTime = Math.abs(sessionDay.getTime() - lastDay.getTime())
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        stats.currentStreak += 1
      } else if (diffDays > 1) {
        stats.currentStreak = 1 // Reset streak if more than 1 day missed
      }
      // if diffDays === 0, it's the same day, streak doesn't increase but doesn't break
    } else {
      stats.currentStreak = 1
    }
    
    stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak)
    stats.lastSessionDate = newSession.date
    
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats))
  } catch (e) {
    console.error("Error updating stats", e)
  }
}

export const getStats = (): UserStats => {
  const defaultStats = { totalSessions: 0, totalMinutes: 0, currentStreak: 0, longestStreak: 0, lastSessionDate: null }
  if (typeof window === 'undefined') {
    return defaultStats
  }
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.STATS)
    if (data) return JSON.parse(data)
  } catch (e) {
    console.error("Error reading stats from local storage", e)
  }
  
  return defaultStats
}

export const clearData = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEYS.SESSIONS)
  localStorage.removeItem(STORAGE_KEYS.STATS)
}
