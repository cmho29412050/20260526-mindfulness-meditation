"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CloudLightning, Battery, Shuffle, Moon, Smile, X, ArrowRight, Brain } from "lucide-react"

type VibeMode = "focus" | "stress" | "sleep" | "home" | "starry_sky" | "stream" | "zen_hall" | "snow_mountain"

type PreMoodConfig = {
  id: string
  label: string
  icon: React.ElementType
  duration: number // in seconds
  vibe: VibeMode
  vibeLabel: string
  reason: string
}

const PRE_MOODS: PreMoodConfig[] = [
  {
    id: "anxious",
    label: "焦慮緊繃",
    icon: CloudLightning,
    duration: 15 * 60,
    vibe: "stress",
    vibeLabel: "海邊",
    reason: "大腦在焦慮時需要溫柔的引導與調節。15 分鐘的短暫停留能有效幫助您調節呼吸、安定副交感神經，配合溫暖放鬆的「壓力釋放（海邊）」氛圍，有助於舒緩緊繃的身體與神經系統。",
  },
  {
    id: "tired",
    label: "極度疲憊",
    icon: Battery,
    duration: 10 * 60,
    vibe: "sleep",
    vibeLabel: "森林",
    reason: "疲憊時過長的冥想反而容易讓人陷入昏睡或產生挫折感。10 分鐘的短暫放鬆，配合「安穩睡眠（森林）」氛圍，能為疲累的身體提供溫和的能量充電，讓您在清醒與休息之間找到平衡。",
  },
  {
    id: "distracted",
    label: "思緒雜亂",
    icon: Shuffle,
    duration: 15 * 60,
    vibe: "focus",
    vibeLabel: "山上",
    reason: "當心神渙散、大腦有太多思緒在賽跑時，15 分鐘的呼吸練習是收斂注意力的黃金時長。搭配「專注收斂（山上）」氛圍，能溫柔地將大腦從 DMN（預設模式網路）的雜念模式中抽離，重回當下。",
  },
  {
    id: "insomnia",
    label: "睡前助眠",
    icon: Moon,
    duration: 30 * 60,
    vibe: "sleep",
    vibeLabel: "森林",
    reason: "為了幫助您順利過渡到深沉睡眠，30 分鐘的漸進式引導是最理想的時長。配合「安穩睡眠（森林）」氛圍，讓您在輕柔的頻率中慢慢放鬆全身肌肉，自然而然地入睡。",
  },
  {
    id: "calm",
    label: "平靜日常",
    icon: Smile,
    duration: 15 * 60,
    vibe: "home",
    vibeLabel: "家裡",
    reason: "維持每天穩定的正念習慣是重塑大腦神經連結的關鍵。15 分鐘的日常練習，配合「居家安定（家裡）」氛圍，能讓您在平穩的狀態中持續滋養內心的平靜，為一整天注入專注的能量。",
  },
]

interface PreMoodAssessmentProps {
  isOpen: boolean
  onClose: () => void
  onApply: (duration: number, vibe: VibeMode, moodBeforeId: string, autoStart: boolean) => void
}

export function PreMoodAssessment({ isOpen, onClose, onApply }: PreMoodAssessmentProps) {
  const [selectedMood, setSelectedMood] = useState<PreMoodConfig | null>(null)

  const handleApply = (autoStart: boolean) => {
    if (selectedMood) {
      onApply(selectedMood.duration, selectedMood.vibe, selectedMood.id, autoStart)
      // Reset state for next open
      setSelectedMood(null)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-slate-950/75 border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden backdrop-blur-2xl text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setSelectedMood(null)
                onClose()
              }}
              className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10">
              <AnimatePresence mode="wait">
                {!selectedMood ? (
                  <motion.div
                    key="pre-mood-selection"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Brain className="w-5 h-5 text-sky-300" />
                      <h3 className="text-xl font-light text-white tracking-wide">
                        智慧身心評估推薦
                      </h3>
                    </div>
                    <p className="text-sm font-light text-white/60 text-center mb-6">
                      您當前最符合哪種身心狀態？
                    </p>

                    <div className="flex flex-col gap-2.5">
                      {PRE_MOODS.map((mood) => {
                        const Icon = mood.icon
                        return (
                          <motion.button
                            key={mood.id}
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.08)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedMood(mood)}
                            className="flex items-center justify-between p-4 border border-white/5 bg-white/5 rounded-2xl text-white hover:text-white transition-all text-left w-full group cursor-pointer hover:border-white/10"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-white/5 text-sky-300 group-hover:bg-sky-500/20 transition-all">
                                <Icon className="w-5 h-5" strokeWidth={1.5} />
                              </div>
                              <span className="text-sm font-light tracking-wider">
                                {mood.label}
                              </span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-transform group-hover:translate-x-1" />
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="pre-mood-recommendation"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col"
                  >
                    <h3 className="text-lg font-light text-white text-center mb-1 tracking-wide">
                      專屬正念推薦
                    </h3>
                    <p className="text-xs text-white/40 text-center mb-5">
                      評估狀態：{selectedMood.label}
                    </p>

                    {/* Recommendation details card */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 flex flex-col gap-4">
                      <div className="flex items-center justify-around text-center divide-x divide-white/10">
                        <div className="flex-1 flex flex-col items-center">
                          <span className="text-[10px] uppercase tracking-wider text-white/40 mb-1">建議時間</span>
                          <span className="text-sm font-light text-sky-300">{selectedMood.duration / 60} 分鐘</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center px-1">
                          <span className="text-[10px] uppercase tracking-wider text-white/40 mb-1">建議氛圍</span>
                          <span className="text-sm font-light text-sky-300">{selectedMood.vibeLabel}</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center">
                          <span className="text-[10px] uppercase tracking-wider text-white/40 mb-1">建議音樂</span>
                          <span className="text-sm font-light text-sky-300">冥想音樂</span>
                        </div>
                      </div>

                      <p className="text-xs font-light text-white/70 leading-relaxed text-justify border-t border-white/5 pt-3">
                        {selectedMood.reason}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleApply(true)}
                        className="w-full py-3 rounded-xl bg-white text-slate-900 transition-colors font-medium text-sm tracking-widest hover:bg-slate-100 shadow-[0_0_15px_rgba(255,255,255,0.1)] cursor-pointer text-center"
                      >
                        套用並直接開始
                      </motion.button>
                      
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedMood(null)}
                          style={{ backgroundColor: "rgba(255, 255, 255, 0)" }}
                          className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/70 hover:bg-white/5 transition-colors font-light text-xs tracking-wider cursor-pointer"
                        >
                          返回
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.2)" }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleApply(false)}
                          className="flex-1 py-2.5 rounded-xl bg-white/15 border border-white/10 hover:bg-white/25 text-white transition-colors font-light text-xs tracking-wider cursor-pointer"
                        >
                          套用並回首頁
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
