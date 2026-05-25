"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CloudLightning, Wind, Coffee, CloudRain, Meh, Smile, Zap, X } from "lucide-react"

type Mood = {
  id: string
  label: string
  icon: React.ElementType
  message: string
}

const POST_MOODS: Mood[] = [
  {
    id: "calm",
    label: "平靜",
    icon: Wind,
    message: "太好了，您找到了片刻的安寧。請帶著這份寧靜，繼續溫和地前行。",
  },
  {
    id: "refreshed",
    label: "煥然一新",
    icon: Zap,
    message: "太棒了！帶著這份重新注入的能量，開啟您充實的剩餘時光。",
  },
  {
    id: "sleepy",
    label: "放鬆想睡",
    icon: Coffee,
    message: "正念冥想能深層放鬆身體。若身體需要休息，請順應它的呼喚入睡。",
  },
  {
    id: "still_stressed",
    label: "仍有壓力",
    icon: CloudLightning,
    message: "沒關係的。大腦調適有時需要更長的時間。今天，請對自己特別溫柔。",
  },
  {
    id: "emotional",
    label: "情緒起伏",
    icon: CloudRain,
    message: "冥想會喚醒內心深處的感受。溫和地觀察它、允許它，不作任何批判。",
  },
  {
    id: "neutral",
    label: "平常心",
    icon: Meh,
    message: "平穩的心境是最好的基石。繼續維持這種平靜的觀察即可。",
  },
  {
    id: "happy",
    label: "快樂",
    icon: Smile,
    message: "太美好了！讓這份溫暖喜悅的正能量，傳遞並感染您身邊的每一個人。",
  },
]

interface PostMoodAssessmentProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function PostMoodAssessment({ isOpen, onClose, onComplete }: PostMoodAssessmentProps) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)

  const handleFinish = () => {
    setSelectedMood(null)
    onComplete()
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
            // Don't close on background click to encourage filling it out
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
                {!selectedMood ? (
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
                          whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedMood(mood)}
                          className="flex flex-col items-center justify-center p-4 gap-3 bg-white/5 border border-white/10 rounded-2xl text-white/80 hover:text-white transition-all"
                        >
                          <mood.icon className="w-6 h-6" strokeWidth={1.5} />
                          <span className="text-xs tracking-wider uppercase font-light text-center">
                            {mood.label}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="mood-message"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="text-center"
                  >
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <selectedMood.icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                      </div>
                    </div>
                    <h3 className="text-xl font-light text-white mb-2">
                      現在感到：{selectedMood.label}
                    </h3>
                    <p className="text-white/60 font-light mb-8 leading-relaxed">
                      {selectedMood.message}
                    </p>
                    
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedMood(null)}
                        className="flex-1 py-3 px-4 rounded-xl border border-white/20 text-white/80 hover:bg-white/5 transition-colors font-light text-sm tracking-wide uppercase"
                      >
                        返回
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleFinish}
                        className="flex-[2] py-3 px-4 rounded-xl bg-white/20 hover:bg-white/30 border border-emerald-500/30 text-white transition-colors font-medium text-sm tracking-wide uppercase shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
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
