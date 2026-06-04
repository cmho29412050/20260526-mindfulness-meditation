"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ParticleBackground } from "@/components/particle-background"
import { getStats, getSessions, UserStats, MeditationSession } from "@/lib/storage"
import { 
  Clock, 
  Calendar, 
  Flame, 
  Activity, 
  Smile, 
  Brain, 
  Moon, 
  Home as HomeIcon, 
  Sparkles, 
  BookOpen,
  Play,
  CalendarDays
} from "lucide-react"
import Link from "next/link"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from "recharts"

const MINDFULNESS_QUOTES = [
  "呼吸是連結心靈與身體的橋樑。在吸氣與呼氣之間，回到當下。",
  "別去追尋過去，也別去預測未來；過去已不復存在，未來尚未到來。專注於此時此刻。",
  "正念不是要清除大腦的想法，而是靜靜觀察想法的起伏，像看天空中的雲朵一樣。",
  "在大腦紛亂的雜音中，呼吸是您最可靠的錨。溫柔地抓牢它。",
  "靜心一刻，能重塑大腦的神經網路，釋放累積的壓力和疲勞。",
  "當你放慢腳步，你會發現，生活中的美妙都藏在微小的細節中。",
  "不要評判你的情緒，不論焦慮或平靜，都溫柔地對自己說：『我看見你了。』",
  "每一次吸氣都是新的開始，每一次呼氣都是一次放鬆與釋懷。",
  "預設模式網路 (DMN) 的安靜，來自於你對當下呼吸的全然專注。",
  "正念冥想是一場溫柔的革命，用不批判的態度擁抱自己本來的樣子。",
  "靜心坐下，不為追求什麼，只為全然地安頓於當下的存在。",
  "如同水面平靜時能清晰映照天空，心靈平靜時，智慧與喜悅便自然浮現。"
]

const getLocalDateString = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getSessionLocalDateStr = (isoString: string) => {
  const d = new Date(isoString)
  return getLocalDateString(d)
}

export default function DashboardPage() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [sessions, setSessions] = useState<MeditationSession[]>([])
  const [mounted, setMounted] = useState(false)
  const [selectedDateStr, setSelectedDateStr] = useState<string>("")

  useEffect(() => {
    setStats(getStats())
    setSessions(getSessions())
    setMounted(true)
    setSelectedDateStr(getLocalDateString(new Date()))
  }, [])

  if (!stats || !mounted) {
    return (
      <main className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-sky-300 rounded-full animate-spin" />
      </main>
    )
  }

  // Generate past 7 days chronologically (6 days ago -> today)
  const weekdays = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"]
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d
  }).reverse()

  const chartData = last7Days.map(date => {
    const dateStr = getLocalDateString(date)
    const daySessions = sessions.filter(s => getSessionLocalDateStr(s.date) === dateStr)
    const totalMins = daySessions.reduce((sum, s) => sum + s.durationMinutes, 0)
    
    return {
      dateStr,
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      weekday: weekdays[date.getDay()],
      minutes: totalMins,
      sessions: daySessions
    }
  })

  // Calculate past 7 days stats
  const totalMinutesPast7Days = chartData.reduce((sum, d) => sum + d.minutes, 0)
  const dailyAverage = parseFloat((totalMinutesPast7Days / 7).toFixed(1))
  
  const past7DaysSessions = chartData.flatMap(d => d.sessions)
  const longestSessionPast7Days = past7DaysSessions.length > 0
    ? Math.max(...past7DaysSessions.map(s => s.durationMinutes))
    : 0

  // Selected date details helper
  const selectedDayData = chartData.find(d => d.dateStr === selectedDateStr)
  const selectedDaySessions = selectedDayData ? selectedDayData.sessions : []
  const selectedDayMinutes = selectedDayData ? selectedDayData.minutes : 0
  const selectedDayLabel = selectedDayData 
    ? `${selectedDayData.label} (${selectedDayData.weekday})` 
    : ""
  
  const isTodaySelected = selectedDateStr === getLocalDateString(new Date())

  // Daily quote selection
  const quoteIndex = new Date().getDate() % MINDFULNESS_QUOTES.length
  const dailyQuote = MINDFULNESS_QUOTES[quoteIndex]

  // Vibe configuration mapping
  const getVibeInfo = (vibe?: string) => {
    switch (vibe) {
      case "focus":
        return { label: "專注模式", icon: Brain, color: "text-sky-500 bg-sky-500/10 border-sky-500/20" }
      case "stress":
        return { label: "減壓模式", icon: Sparkles, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" }
      case "sleep":
        return { label: "睡眠模式", icon: Moon, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20" }
      case "home":
        return { label: "日常靜心", icon: HomeIcon, color: "text-slate-500 bg-slate-500/10 border-slate-500/20" }
      default:
        return { label: "呼吸練習", icon: Activity, color: "text-teal-500 bg-teal-500/10 border-teal-500/20" }
    }
  }

  // Mood configuration mapping
  const getMoodLabel = (moodId?: string) => {
    if (!moodId) return null
    const moods: Record<string, string> = {
      calm: "平靜 🌬️",
      refreshed: "煥然一新 ⚡",
      sleepy: "放鬆想睡 ☕",
      still_stressed: "仍有壓力 ⚡",
      emotional: "情緒起伏 🌧️",
      neutral: "平常心 😐",
      happy: "快樂 😊",
    }
    return moods[moodId] || moodId
  }

  const formatSessionTime = (isoString: string) => {
    const d = new Date(isoString)
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-white pt-24 pb-32">
      {/* Background Image */}
      <div
        className="fixed inset-0"
        style={{
          backgroundImage: "url('/images/mountain.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />
      <div className="fixed inset-0 bg-black/45 backdrop-blur-[6px]" />
      <ParticleBackground isInSession={false} />

      <div className="relative z-10 max-w-4xl mx-auto px-6 flex flex-col gap-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mt-4"
        >
          <h1 className="text-3xl md:text-4xl font-light tracking-[0.2em] mb-2 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
            正念旅程
          </h1>
          <p className="text-white/70 font-light tracking-[0.25em] text-xs uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
            統計數據與歷史
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="總冥想時間"
            value={`${stats.totalMinutes} 分鐘`}
            icon={<Clock className="w-5 h-5 text-sky-300" />}
            delay={0.1}
          />
          <StatCard
            title="累計次數"
            value={`${stats.totalSessions} 次`}
            icon={<Activity className="w-5 h-5 text-teal-300" />}
            delay={0.2}
          />
          <StatCard
            title="目前連續天數"
            value={`${stats.currentStreak} 天`}
            icon={<Flame className="w-5 h-5 text-amber-300" />}
            delay={0.3}
          />
          <StatCard
            title="最長連續天數"
            value={`${stats.longestStreak} 天`}
            icon={<Calendar className="w-5 h-5 text-indigo-300" />}
            delay={0.4}
          />
        </div>

        {/* Weekly Trend Chart Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/50 text-slate-800 flex flex-col gap-6"
        >
          {/* Header & Metrics */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 pb-4 gap-4">
            <div>
              <h2 className="text-lg font-medium tracking-[0.15em] text-slate-700 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-sky-500" />
                每週冥想時間變化
              </h2>
              <p className="text-slate-400 text-xs font-light mt-0.5 tracking-wider">
                最近 7 天的每日累計冥想時間 (點擊柱狀圖查看每日明細)
              </p>
            </div>
            {/* Short Term Metrics */}
            <div className="flex items-center gap-6 self-start sm:self-center">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">日平均時間</span>
                <span className="text-lg font-light text-sky-600">{dailyAverage} 分鐘</span>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">單次最長</span>
                <span className="text-lg font-light text-teal-600">{longestSessionPast7Days} 分鐘</span>
              </div>
            </div>
          </div>

          {/* Recharts Render */}
          <div className="h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="barGradientActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  unit="分"
                  dx={-4}
                />
                <Tooltip
                  cursor={{ fill: "rgba(15, 23, 42, 0.03)", radius: 8 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-xl text-slate-800 text-xs flex flex-col gap-1">
                          <p className="font-semibold text-slate-600">
                            {data.label} ({data.weekday})
                          </p>
                          <p className="font-semibold text-sky-600 text-sm">
                            累計 {data.minutes} 分鐘
                          </p>
                          <p className="text-[10px] text-slate-400">
                            共 {data.sessions.length} 次冥想 · 點擊查看明細
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar
                  dataKey="minutes"
                  radius={[8, 8, 0, 0]}
                  cursor="pointer"
                  maxBarSize={45}
                >
                  {chartData.map((entry, index) => {
                    const isSelected = entry.dateStr === selectedDateStr
                    return (
                      <Cell
                        key={`cell-${index}`}
                        onClick={() => setSelectedDateStr(entry.dateStr)}
                        fill={isSelected ? "url(#barGradientActive)" : "url(#barGradient)"}
                        stroke={isSelected ? "#0284c7" : "transparent"}
                        strokeWidth={isSelected ? 1.5 : 0}
                        className="transition-all duration-300 hover:opacity-90"
                      />
                    )
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Daily Mindfulness Quote */}
          <div className="bg-slate-50/50 border border-slate-200/50 rounded-2xl p-4 flex gap-3.5 items-start mt-2">
            <div className="p-2.5 bg-sky-500/10 text-sky-600 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">每日正念小語</span>
              <p className="text-slate-600 text-xs sm:text-sm font-light leading-relaxed">
                「{dailyQuote}」
              </p>
            </div>
          </div>
        </motion.div>

        {/* Selected Date Session Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-white/50 text-slate-800"
        >
          <div className="flex justify-between items-center border-b border-slate-200/60 pb-3 mb-5">
            <h2 className="text-lg font-medium tracking-[0.15em] text-slate-700">
              冥想明細：{selectedDayLabel}
            </h2>
            <span className="text-xs font-light text-slate-500 tracking-wider">
              當日累計 {selectedDayMinutes} 分鐘
            </span>
          </div>

          {selectedDaySessions.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center gap-4">
              <p className="text-slate-400 font-light text-sm tracking-wider max-w-sm">
                {isTodaySelected
                  ? "今天尚未進行正念練習。給自己留出幾分鐘的平靜時光吧！"
                  : "該日尚無練習紀錄。每天給自己一段放鬆呼吸的時間吧！"}
              </p>
              {isTodaySelected && (
                <Link href="/">
                  <motion.button
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(15, 23, 42, 0.95)" }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-medium tracking-widest shadow-md transition-all cursor-pointer hover:shadow-lg"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    開始正念呼吸
                  </motion.button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3.5">
              {selectedDaySessions.map((session) => {
                const vibeInfo = getVibeInfo(session.vibeMode)
                const VibeIcon = vibeInfo.icon
                const moodTag = getMoodLabel(session.moodAfter)

                return (
                  <motion.div
                    key={session.id}
                    whileHover={{ x: 4, backgroundColor: "rgba(15, 23, 42, 0.01)" }}
                    className="flex flex-col p-4 rounded-2xl border border-slate-200 bg-slate-50/20 transition-all duration-300 hover:border-slate-300 gap-3"
                  >
                    {/* Top Row: Vibe & Time + Mood + Duration */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Vibe icon + Title + Time */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`p-3 rounded-xl border shrink-0 ${vibeInfo.color}`}>
                          <VibeIcon className="w-5 h-5" strokeWidth={1.8} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-800 font-medium text-base tracking-wide flex items-center gap-2">
                            {vibeInfo.label}
                            <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 font-normal">
                              {formatSessionTime(session.date)}
                            </span>
                          </p>
                          <p className="text-slate-400 text-xs font-light mt-0.5">
                            紀錄 ID: {session.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>

                      {/* Right side: Mood & Duration */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                        {/* Mood after session */}
                        {moodTag ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-light tracking-wide">
                            <Smile className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            心境: <span className="font-normal">{moodTag}</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 italic font-light px-2">
                            無心境回饋
                          </div>
                        )}

                        <div className="h-4 w-px bg-slate-200 hidden sm:block" />

                        <div className="flex items-center gap-1">
                          <span className="text-lg font-light text-slate-800 tracking-tight">
                            {session.durationMinutes}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">分鐘</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Journal Note if exists */}
                    {session.journalNote && (
                      <div className="mt-1 pl-1 border-t border-slate-200/40 pt-3 text-left">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                          正念隨筆 (Journal Note)
                        </span>
                        <p className="text-slate-600 text-xs font-light italic leading-relaxed bg-slate-50/60 p-2.5 rounded-xl border border-slate-200/40">
                          「 {session.journalNote} 」
                        </p>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  )
}

function StatCard({
  title,
  value,
  icon,
  delay,
}: {
  title: string
  value: string
  icon: React.ReactNode
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.6, type: "spring", stiffness: 100 }}
      whileHover={{ y: -4, backgroundColor: "rgba(15, 23, 42, 0.03)" }}
      whileTap={{ scale: 0.98 }}
      style={{ backgroundColor: "rgba(255, 255, 255, 0.85)" }}
      className="backdrop-blur-xl rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2 cursor-default transition-all duration-300 border border-white/50 shadow-xl"
    >
      <div className="p-2.5 bg-slate-100/80 rounded-full border border-slate-200/50 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl sm:text-2xl font-light tracking-tight text-slate-800">
        {value}
      </h3>
      <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-[0.2em] text-center font-medium">
        {title}
      </p>
    </motion.div>
  )
}
