"use client"

import { motion } from "framer-motion"
import { ParticleBackground } from "@/components/particle-background"
import { Trash2, Bell, Shield, CircleUserRound, ChevronRight, Brain, Sparkles, RotateCcw } from "lucide-react"
import { clearData, getSessions, MeditationSession } from "@/lib/storage"
import { useRouter } from "next/navigation"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts"

import { useState, useEffect } from "react"
import { FfmqAssessmentDialog, FfmqResult } from "@/components/ffmq-assessment-dialog"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const router = useRouter()
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState("21:00")
  const [ffmqResult, setFfmqResult] = useState<FfmqResult | null>(null)
  const [ffmqOpen, setFfmqOpen] = useState(false)
  const [sessions, setSessions] = useState<MeditationSession[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSessions(getSessions())
      setReminderEnabled(localStorage.getItem("zenith_daily_reminder_enabled") === "true")
      setReminderTime(localStorage.getItem("zenith_daily_reminder_time") || "21:00")
      
      const savedFfmq = localStorage.getItem("zenith_ffmq_result")
      if (savedFfmq) {
        try {
          setFfmqResult(JSON.parse(savedFfmq))
        } catch (e) {
          console.error("Parse FFMQ error", e)
        }
      }
    }
  }, [])

  const handleToggleReminder = async () => {
    if (!reminderEnabled) {
      if (!("Notification" in window)) {
        alert("此裝置不支援系統通知。")
        return
      }
      
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        localStorage.setItem("zenith_daily_reminder_enabled", "true")
        setReminderEnabled(true)
        new Notification("老何的正念冥想", {
          body: "每日提醒功能已開啟！將在您設定的時間提醒您。",
          icon: "/icon.svg"
        })
      } else {
        alert("需要開啟通知權限才能使用提醒功能。")
      }
    } else {
      localStorage.setItem("zenith_daily_reminder_enabled", "false")
      setReminderEnabled(false)
    }
  }

  const handleTimeChange = (time: string) => {
    setReminderTime(time)
    localStorage.setItem("zenith_daily_reminder_time", time)
  }

  const handleReset = () => {
    if (confirm("您確定要重設所有冥想統計數據嗎？此操作將永久清除所有歷史記錄且無法還原。")) {
      clearData()
      localStorage.removeItem("zenith_ffmq_result")
      router.push('/')
    }
  }

  const handleFfmqComplete = (result: FfmqResult) => {
    localStorage.setItem("zenith_ffmq_result", JSON.stringify(result))
    setFfmqResult(result)
    setFfmqOpen(false)
  }

  const handleClearFfmq = () => {
    if (confirm("確定要清除您的正念特質評估紀錄嗎？")) {
      localStorage.removeItem("zenith_ffmq_result")
      setFfmqResult(null)
    }
  }

  // Radar Chart calculations
  const radarDimensions = [
    { key: "observing" as const, label: "觀察 Observing", fullLabel: "覺察身體與外界刺激" },
    { key: "describing" as const, label: "描述 Describing", fullLabel: "用言語精確表達感受" },
    { key: "awareness" as const, label: "自覺 Awareness", fullLabel: "做事專注、不自動導航" },
    { key: "nonJudging" as const, label: "不評判 Non-judging", fullLabel: "接納體驗、不作批判" },
    { key: "nonReactivity" as const, label: "不反應 Non-reactivity", fullLabel: "退後一步、不隨心起舞" }
  ]

  const cx = 130
  const cy = 130
  const r = 85
  const angleStep = (2 * Math.PI) / 5

  const getCoordinates = (index: number, score: number) => {
    // Score is 3-15. Map it to 0-1 ratio (min 3 maps to 0.2, max 15 maps to 1.0)
    const ratio = 0.2 + (score - 3) / 12 * 0.8
    const angle = index * angleStep - Math.PI / 2
    const x = cx + r * ratio * Math.cos(angle)
    const y = cy + r * ratio * Math.sin(angle)
    return { x, y }
  }

  const getGridPoints = (levelRatio: number) => {
    return radarDimensions.map((_, i) => {
      const angle = i * angleStep - Math.PI / 2
      const x = cx + r * levelRatio * Math.cos(angle)
      const y = cy + r * levelRatio * Math.sin(angle)
      return `${x},${y}`
    }).join(" ")
  }

  const dataPoints = ffmqResult 
    ? radarDimensions.map((d, i) => {
        const score = ffmqResult[d.key]
        return getCoordinates(i, score)
      })
    : []

  const polygonPoints = dataPoints.map(p => `${p.x},${p.y}`).join(" ")

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
      <div className="fixed inset-0 bg-black/15 backdrop-blur-[2px]" />
      <ParticleBackground isInSession={false} />

      <div className="relative z-10 max-w-3xl mx-auto px-6 flex flex-col gap-10">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mt-6"
        >
          <div className="flex justify-center mb-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-24 h-24 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center backdrop-blur-2xl shadow-[0_0_30px_rgba(255,255,255,0.05)]"
            >
              <CircleUserRound className="w-12 h-12 text-white/50" />
            </motion.div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extralight tracking-[0.2em] mb-2 text-slate-100">
            個人設定
          </h1>
          <p className="text-white/40 font-light tracking-[0.25em] text-xs uppercase">
            Manage your experience
          </p>
        </motion.div>

        {/* FFMQ Radar Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.8 }}
          className="glass-card rounded-3xl p-5 md:p-8 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6">
            <Brain className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-lg font-light tracking-wider text-white">大腦正念特質分析 (FFMQ-15)</h2>
              <p className="text-xs text-white/40 font-light mt-0.5">追蹤大腦由「狀態」向「特質」重塑的神經可塑性進程</p>
            </div>
          </div>

          {!ffmqResult ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-emerald-300">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-light text-slate-200 text-base mb-2">尚未進行正念特質評估</h3>
              <p className="text-xs text-white/40 font-light max-w-sm mb-6 leading-relaxed">
                正念特質代表您在非冥想狀態下，日常面對壓力的自動化大腦模式。完成 15 題科學量表即可解鎖您的正念五維度雷達圖。
              </p>
              <Button
                onClick={() => setFfmqOpen(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-light tracking-widest text-xs py-2 px-6 rounded-xl cursor-pointer"
              >
                開始自我評估
              </Button>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Radar Chart SVG */}
              <div className="relative w-[260px] h-[260px] flex items-center justify-center bg-white/[0.01] border border-white/5 rounded-2xl p-2 shrink-0">
                <svg width="260" height="260" className="overflow-visible">
                  {/* Grid levels (5, 10, 15 scores) */}
                  <polygon points={getGridPoints(0.2)} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <polygon points={getGridPoints(0.6)} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                  <polygon points={getGridPoints(1.0)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  
                  {/* Outer circle guidelines */}
                  <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(52,211,153,0.03)" strokeWidth="1" />

                  {/* Axes */}
                  {radarDimensions.map((_, i) => {
                    const outer = getCoordinates(i, 15)
                    return (
                      <line 
                        key={i} 
                        x1={cx} 
                        y1={cy} 
                        x2={outer.x} 
                        y2={outer.y} 
                        stroke="rgba(255,255,255,0.05)" 
                        strokeWidth="1" 
                      />
                    )
                  })}

                  {/* Filled data polygon */}
                  <polygon 
                    points={polygonPoints} 
                    fill="rgba(16, 185, 129, 0.20)" 
                    stroke="rgba(52, 211, 153, 0.85)" 
                    strokeWidth="1.5" 
                    className="drop-shadow-[0_0_8px_rgba(52,211,153,0.15)]"
                  />

                  {/* Data points */}
                  {dataPoints.map((p, i) => (
                    <circle 
                      key={i} 
                      cx={p.x} 
                      cy={p.y} 
                      r="3.5" 
                      fill="#34d399" 
                      stroke="#070b13" 
                      strokeWidth="1.5" 
                    />
                  ))}

                  {/* Dimension Text Labels */}
                  {radarDimensions.map((d, i) => {
                    const score = ffmqResult[d.key]
                    const pos = getCoordinates(i, 15)
                    
                    // Fine tune text alignments based on quadrant
                    let textAnchor: "inherit" | "end" | "middle" | "start" | undefined = "middle"
                    let dy = "0"
                    
                    if (i === 0) { dy = "-10" } // top
                    else if (i === 1) { textAnchor = "start"; dy = "2" } // top-right
                    else if (i === 2) { textAnchor = "start"; dy = "14" } // bottom-right
                    else if (i === 3) { textAnchor = "end"; dy = "14" } // bottom-left
                    else if (i === 4) { textAnchor = "end"; dy = "2" } // top-left

                    return (
                      <text 
                        key={i} 
                        x={pos.x} 
                        y={pos.y} 
                        fill="rgba(255,255,255,0.6)" 
                        fontSize="9" 
                        fontWeight="200" 
                        textAnchor={textAnchor}
                        dy={dy}
                        className="font-light tracking-wider"
                      >
                        {d.key === "observing" ? "觀察" : 
                         d.key === "describing" ? "描述" : 
                         d.key === "awareness" ? "自覺" : 
                         d.key === "nonJudging" ? "不評判" : "不反應"} ({score})
                      </text>
                    )
                  })}
                </svg>
              </div>

              {/* Descriptions & Scores */}
              <div className="flex-1 space-y-3.5 w-full">
                {radarDimensions.map((d) => {
                  const score = ffmqResult[d.key]
                  // Map score 3-15 to color indicators
                  let scoreColor = "text-emerald-300"
                  if (score >= 12) scoreColor = "text-emerald-300"
                  else if (score >= 8) scoreColor = "text-slate-300"
                  else scoreColor = "text-slate-400"

                  return (
                    <div key={d.key} className="flex justify-between items-start gap-4 border-b border-white/5 pb-2">
                      <div className="min-w-0">
                        <span className="text-xs font-light text-slate-200 tracking-wider flex items-center gap-1.5">
                          {d.label}
                        </span>
                        <p className="text-[10px] text-white/40 font-light mt-0.5">{d.fullLabel}</p>
                      </div>
                      <span className={`text-sm font-light font-mono ${scoreColor}`}>{score} / 15</span>
                    </div>
                  )
                })}

                <div className="flex gap-3 pt-3">
                  <Button
                    onClick={() => setFfmqOpen(true)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white font-light tracking-widest text-[10px] py-2 rounded-xl cursor-pointer border border-white/5 flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> 重新評估
                  </Button>
                  <Button
                    onClick={handleClearFfmq}
                    className="bg-transparent hover:bg-red-500/10 text-slate-400 hover:text-red-300 font-light tracking-widest text-[10px] py-2 px-4 rounded-xl cursor-pointer border border-white/5 hover:border-red-500/20 transition-colors flex items-center justify-center"
                  >
                    清除紀錄
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Weekly Mood Trend Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.8 }}
          className="glass-card rounded-3xl p-5 md:p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-3 border-b border-white/5 pb-4 mb-6 relative z-10">
            <Sparkles className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-lg font-light tracking-wider text-white">一週情緒趨勢圖</h2>
              <p className="text-xs text-white/40 font-light mt-0.5">追蹤您每次冥想後的心境變化</p>
            </div>
          </div>

          <div className="h-64 w-full mt-4">
            {sessions.length > 0 ? (() => {
              const MOOD_SCORES: Record<string, number> = {
                happy: 5, refreshed: 4, calm: 4, neutral: 3, sleepy: 3, emotional: 2, still_stressed: 1
              };
              const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date()
                d.setDate(d.getDate() - (6 - i))
                return d
              })
              const chartData = last7Days.map(date => {
                const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                const daySessions = sessions.filter(s => s.date.startsWith(dateStr) && s.moodAfter);
                const avgScore = daySessions.length > 0 
                  ? daySessions.reduce((sum, s) => sum + (MOOD_SCORES[s.moodAfter!] || 3), 0) / daySessions.length
                  : null;
                return {
                  label: `${date.getMonth() + 1}/${date.getDate()}`,
                  score: avgScore
                }
              });

              return (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis domain={[1, 5]} ticks={[1,2,3,4,5]} stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => {
                      if(val===5) return "開心"; if(val===4) return "平靜"; if(val===3) return "中性"; if(val===2) return "起伏"; if(val===1) return "壓力"; return "";
                    }}/>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                      formatter={(value: number) => [value.toFixed(1), '平均心情指數']}
                    />
                    <Line type="monotone" dataKey="score" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4, fill: '#0f172a', stroke: '#38bdf8', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#38bdf8' }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              );
            })() : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/40">
                <span className="text-sm font-light">完成一次冥想並打卡後，即可查看情緒趨勢</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="glass-card rounded-3xl p-4 md:p-6 shadow-2xl"
        >
          <div className="space-y-2">
            <SettingItem 
              icon={<Bell className="w-5 h-5 text-emerald-300" />} 
              title="每日冥想提醒" 
              description="設定提醒時間，定時收到正念冥想提醒"
              action={
                <div className="flex items-center gap-3">
                  {reminderEnabled && (
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => handleTimeChange(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-400 transition-colors cursor-pointer"
                    />
                  )}
                  <button
                    onClick={handleToggleReminder}
                    className={`w-11 h-6 rounded-full relative transition-colors duration-300 border ${
                      reminderEnabled 
                        ? "bg-emerald-500/35 border-emerald-400/50" 
                        : "bg-white/[0.05] border-white/[0.08]"
                    }`}
                  >
                    <motion.div
                      animate={{ x: reminderEnabled ? 20 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full transition-colors ${
                        reminderEnabled ? "bg-emerald-300" : "bg-white/40"
                      }`}
                    />
                  </button>
                </div>
              }
            />
            
            <SettingItem 
              icon={<Shield className="w-5 h-5 text-teal-300" />} 
              title="隱私與數據保護" 
              description="您的正念歷史紀錄完全安全地保存在本地設備中"
              action={
                <span className="text-[10px] text-emerald-300 uppercase tracking-wider bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20 font-light">
                  僅限本地儲存
                </span>
              }
            />

            <div className="h-px bg-white/5 my-4" />

            <SettingItem 
              icon={<Trash2 className="w-5 h-5 text-red-400/80" />} 
              title="重設所有數據" 
              description="永久清除所有冥想統計數據與歷史紀錄，此操作無法復原"
              action={
                <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(239, 68, 68, 0.25)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReset}
                  className="px-4 py-2 bg-red-500/10 text-red-300 hover:text-red-200 rounded-xl text-xs font-light tracking-wider uppercase transition-colors border border-red-500/20 whitespace-nowrap"
                >
                  重設數據
                </motion.button>
              }
            />
          </div>
        </motion.div>
      </div>

      <FfmqAssessmentDialog
        open={ffmqOpen}
        onOpenChange={setFfmqOpen}
        onComplete={handleFfmqComplete}
      />
    </main>
  )
}

function SettingItem({ 
  icon, 
  title, 
  description, 
  action 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  action: React.ReactNode 
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.02] border border-transparent hover:border-white/[0.04] transition-all duration-300 gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="p-3 bg-white/[0.03] border border-white/[0.05] rounded-xl text-white/80 shrink-0 shadow-inner">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="font-light text-base text-slate-200 tracking-wide">{title}</h3>
          <p className="text-xs text-white/40 font-light mt-0.5 truncate hidden sm:block">{description}</p>
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-2">
        {action}
        {typeof action === "string" && <ChevronRight className="w-4 h-4 text-white/20" />}
      </div>
    </div>
  )
}
