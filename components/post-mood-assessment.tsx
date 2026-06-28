"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CloudLightning, Wind, Coffee, CloudRain, Meh, Smile, Zap, X } from "lucide-react"

type Mood = {
  id: string
  label: string
  icon: React.ElementType
  message: string
}

const POST_MOODS: (Mood & { colorClass: string, bgHoverClass: string })[] = [
  {
    id: "calm",
    label: "平靜",
    icon: Wind,
    message: "太好了，您找到了片刻的安寧。請帶著這份寧靜，繼續溫和地前行。",
    colorClass: "text-emotion-calm",
    bgHoverClass: "hover:bg-emotion-calm/20",
  },
  {
    id: "refreshed",
    label: "煥然一新",
    icon: Zap,
    message: "太棒了！帶著這份重新注入的能量，開啟您充實的剩餘時光。",
    colorClass: "text-emerald-400",
    bgHoverClass: "hover:bg-emerald-400/20",
  },
  {
    id: "sleepy",
    label: "放鬆想睡",
    icon: Coffee,
    message: "正念冥想能深層放鬆身體。若身體需要休息，請順應它的呼喚入睡。",
    colorClass: "text-emotion-tired",
    bgHoverClass: "hover:bg-emotion-tired/20",
  },
  {
    id: "still_stressed",
    label: "仍有壓力",
    icon: CloudLightning,
    message: "沒關係的。大腦調適有時需要更長的時間。今天，請對自己特別溫柔。",
    colorClass: "text-emotion-anxious",
    bgHoverClass: "hover:bg-emotion-anxious/20",
  },
  {
    id: "emotional",
    label: "情緒起伏",
    icon: CloudRain,
    message: "冥想會喚醒內心深處的感受。溫和地觀察它、允許它，不作任何批判。",
    colorClass: "text-emotion-distracted",
    bgHoverClass: "hover:bg-emotion-distracted/20",
  },
  {
    id: "neutral",
    label: "平常心",
    icon: Meh,
    message: "平穩的心境是最好的基石。繼續維持這種平靜的觀察即可。",
    colorClass: "text-slate-300",
    bgHoverClass: "hover:bg-slate-300/20",
  },
  {
    id: "happy",
    label: "快樂",
    icon: Smile,
    message: "太美好了！讓這份溫暖喜悅的正能量，傳遞並感染您身邊的每一個人。",
    colorClass: "text-amber-300",
    bgHoverClass: "hover:bg-amber-300/20",
  },
]

const IMPROVEMENT_OPTIONS = [
  { id: "sig_improved", label: "✨ 顯著改善", color: "hover:bg-emerald-500/20 hover:border-emerald-500/40 text-emerald-300" },
  { id: "slight_improved", label: "👍 有些改善", color: "hover:bg-teal-500/20 hover:border-teal-500/40 text-teal-300" },
  { id: "no_change", label: "😐 沒有差別", color: "hover:bg-slate-500/20 hover:border-slate-500/40 text-slate-300" },
  { id: "worse", label: "👎 變得更糟", color: "hover:bg-rose-500/20 hover:border-rose-500/40 text-rose-300" },
]

const PRE_MOOD_MAP: Record<string, string> = {
  anxious: "焦慮緊繃",
  tired: "極度疲憊",
  distracted: "思緒雜亂",
  insomnia: "睡前助眠",
  calm: "平靜日常",
}

interface PostMoodAssessmentProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (moodId?: string, stateImprovement?: string, journalNote?: string) => void
  moodBefore?: string | null
}

export function PostMoodAssessment({ isOpen, onClose, onComplete, moodBefore }: PostMoodAssessmentProps) {
  const [step, setStep] = useState<"improvement" | "mood">("improvement")
  const [improvement, setImprovement] = useState<string | null>(null)
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)
  const [journalNote, setJournalNote] = useState("")

  // Reset steps and choices when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(moodBefore ? "improvement" : "mood")
      setImprovement(null)
      setSelectedMood(null)
      setJournalNote("")
    }
  }, [isOpen, moodBefore])

  const handleFinish = () => {
    onComplete(selectedMood?.id, improvement || undefined, journalNote.trim() || undefined)
    setSelectedMood(null)
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
            className="relative w-full max-w-md bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10">
              <AnimatePresence mode="wait">
                {step === "improvement" && moodBefore ? (
                  <motion.div
                    key="improvement-assessment"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col"
                  >
                    <h3 className="text-xl font-light text-white text-center mb-2 tracking-wide">
                      身心狀態評估
                    </h3>
                    <p className="text-sm font-light text-white/70 text-center mb-6 leading-relaxed">
                      您在開始前感到「<span className="text-sky-300 font-normal">{PRE_MOOD_MAP[moodBefore] || "..."}</span>」。<br />
                      經過這段正念冥想，您覺得身心狀態有改善嗎？
                    </p>

                    <div className="flex flex-col gap-3">
                      {IMPROVEMENT_OPTIONS.map((opt) => (
                        <motion.button
                          key={opt.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setImprovement(opt.id)
                            setStep("mood")
                          }}
                          className={`w-full py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/80 transition-all font-light text-sm tracking-widest cursor-pointer text-center ${opt.color}`}
                        >
                          {opt.label}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : !selectedMood ? (
                  <motion.div
                    key="mood-selection"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <h3 className="text-xl font-light text-white text-center mb-2 tracking-wide">
                      冥想完成
                    </h3>
                    <p className="text-sm font-light text-white/60 text-center mb-6">
                      您現在感覺如何？
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {POST_MOODS.map((mood) => (
                        <motion.button
                          key={mood.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedMood(mood)}
                          className={`flex flex-col items-center justify-center p-4 gap-3 border border-white/10 rounded-2xl transition-all cursor-pointer bg-white/5 ${mood.bgHoverClass} ${mood.colorClass || 'text-white/80 hover:text-white'}`}
                        >
                          <mood.icon className="w-6 h-6" strokeWidth={1.5} />
                          <span className="text-xs tracking-wider uppercase font-light text-center">
                            {mood.label}
                          </span>
                        </motion.button>

                      ))}
                    </div>

                    {moodBefore && (
                      <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setStep("improvement")}
                        style={{ backgroundColor: "rgba(255, 255, 255, 0)" }}
                        className="w-full mt-5 py-2.5 rounded-xl border border-white/10 text-white/50 hover:text-white transition-colors font-light text-xs tracking-wider cursor-pointer"
                      >
                        返回上一步 (身心評估)
                      </motion.button>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="mood-message"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="text-center"
                  >
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <selectedMood.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                      </div>
                    </div>
                    <h3 className="text-lg font-light text-white mb-1">
                      現在感到：{selectedMood.label}
                    </h3>
                    <p className="text-white/60 text-xs font-light mb-4 leading-relaxed px-2">
                      {selectedMood.message}
                    </p>

                    {/* Before vs After Transition Card */}
                    <div className="flex items-center justify-center gap-4 mb-6 py-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                      {moodBefore && (
                        <>
                          <div className="flex flex-col items-center flex-1">
                            <span className="text-[10px] text-white/40 mb-2 uppercase tracking-wider font-light">冥想前</span>
                            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white/60 font-light">
                              {PRE_MOOD_MAP[moodBefore] || "未知狀態"}
                            </div>
                          </div>
                          <div className="flex flex-col items-center justify-center">
                            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent mb-1" />
                            <ArrowRight className="w-4 h-4 text-white/20" />
                            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent mt-1" />
                          </div>
                        </>
                      )}
                      <div className="flex flex-col items-center flex-1">
                        <span className="text-[10px] text-white/70 mb-2 uppercase tracking-wider font-light">冥想後</span>
                        <div className={`px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-xs font-medium ${selectedMood.colorClass}`}>
                          {selectedMood.label}
                        </div>
                      </div>
                    </div>

                    {/* Mindfulness Journaling Textarea */}
                    <div className="flex flex-col text-left gap-1 mb-4 w-full">
                      <span className="text-[10px] sm:text-xs uppercase tracking-wider text-white/40 font-light">
                        寫下當下隨筆（選填）
                      </span>
                      <textarea
                        value={journalNote}
                        onChange={(e) => setJournalNote(e.target.value)}
                        placeholder="寫下您此刻的思緒、感受，或是今天練習的心得..."
                        rows={3}
                        maxLength={150}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white/80 font-light focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-white/20 resize-none"
                      />
                      <span className="text-[9px] text-right text-white/30 font-light">
                        {journalNote.length} / 150
                      </span>
                    </div>
                    
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedMood(null)}
                        style={{ backgroundColor: "rgba(255, 255, 255, 0)" }}
                        className="flex-1 py-3 px-4 rounded-xl border border-white/20 text-white/80 transition-colors font-light text-sm tracking-wide uppercase cursor-pointer"
                      >
                        返回
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleFinish}
                        className="flex-[2] py-3 px-4 rounded-xl bg-white/20 hover:bg-white/30 border border-emerald-500/30 text-white transition-colors font-medium text-sm tracking-wide uppercase shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer"
                      >
                        完成並查看科學洞察
                      </motion.button>
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
