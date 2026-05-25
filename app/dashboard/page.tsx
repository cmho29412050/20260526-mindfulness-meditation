"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ParticleBackground } from "@/components/particle-background"
import { getStats, getSessions, UserStats, MeditationSession } from "@/lib/storage"
import { Clock, Calendar, Flame, Activity, ChevronRight } from "lucide-react"

export default function DashboardPage() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [sessions, setSessions] = useState<MeditationSession[]>([])

  useEffect(() => {
    setStats(getStats())
    setSessions(getSessions().slice(0, 5)) // show top 5 recent sessions
  }, [])

  if (!stats) {
    return (
      <main className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-sky-300 rounded-full animate-spin" />
      </main>
    )
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

      <div className="relative z-10 max-w-4xl mx-auto px-6 flex flex-col gap-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mt-6"
        >
          <h1 className="text-3xl md:text-4xl font-light tracking-[0.2em] mb-2 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
            正念旅程
          </h1>
          <p className="text-white/70 font-light tracking-[0.25em] text-xs uppercase drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
            統計數據與歷史
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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

        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="bg-white/85 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-white/50 text-slate-800"
        >
          <h2 className="text-lg font-medium tracking-[0.15em] uppercase mb-6 text-slate-700 border-b border-slate-200/60 pb-3">
            近期冥想記錄
          </h2>
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 font-light text-sm tracking-wider">
                尚無冥想記錄。開始冥想來追蹤您的進度吧！
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <motion.div
                  key={session.id}
                  whileHover={{ x: 4, backgroundColor: "rgba(15, 23, 42, 0.02)" }}
                  className="flex justify-between items-center p-4 rounded-2xl border border-slate-200/50 bg-slate-50/30 transition-all duration-300 hover:border-slate-300"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="text-slate-800 font-normal text-base tracking-wide truncate">
                      {session.durationMinutes} 分鐘冥想練習
                    </p>
                    <p className="text-slate-500 text-xs font-light">
                      {new Date(session.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      ·{" "}
                      {new Date(session.date).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="px-3 py-1 bg-emerald-400/10 border border-emerald-500/20 rounded-full text-[10px] uppercase tracking-wider text-emerald-600 font-normal">
                      已完成
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </motion.div>
              ))}
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
      className="bg-white/85 backdrop-blur-xl rounded-2xl p-5 md:p-6 flex flex-col items-center justify-center gap-3 cursor-default transition-all duration-300 border border-white/50 shadow-xl"
    >
      <div className="p-3 bg-slate-100/80 rounded-full border border-slate-200/50 shadow-inner">
        {icon}
      </div>
      <h3 className="text-2xl md:text-3xl font-light tracking-tight text-slate-800">
        {value}
      </h3>
      <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] text-center font-medium">
        {title}
      </p>
    </motion.div>
  )
}
