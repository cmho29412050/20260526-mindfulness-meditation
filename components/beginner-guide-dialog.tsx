"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, 
  Brain, 
  User, 
  Activity, 
  Compass, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Play 
} from "lucide-react"

type VibeMode = "focus" | "stress" | "sleep" | "home" | "starry_sky" | "stream" | "zen_hall" | "snow_mountain"

interface BeginnerGuideDialogProps {
  isOpen: boolean
  onClose: () => void
  onApply: (duration: number, vibe: VibeMode, moodBeforeId: string, autoStart: boolean) => void
}

interface GuideStep {
  title: string
  subtitle: string
  icon: React.ElementType
  iconColor: string
  content: string
  tip?: string
}

const GUIDE_STEPS: GuideStep[] = [
  {
    title: "什麼是正念冥想？",
    subtitle: "大腦的溫和鍛鍊",
    icon: Brain,
    iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    content: "正念（Mindfulness）並非「放空大腦」或「抹除所有思緒」，而是溫柔地將注意力聚焦於此時此刻，不作任何評判。當你發現大腦開始胡思亂想時，這很正常，只需溫和地將注意力帶回呼吸即可。這就像是在給大腦的「注意力肌肉」進行重量訓練。",
    tip: "💡 秘訣：把雜念當作飄過的雲，你只需看著它，不隨它而去。"
  },
  {
    title: "調整舒適的坐姿",
    subtitle: "放鬆與清醒的平衡",
    icon: User,
    iconColor: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    content: "選擇一個安靜、不受打擾的角落。坐在椅子或軟墊上，雙腳著地，挺直脊椎以保持清醒，但記得放鬆雙肩與面部肌肉。雙手自然垂放在膝蓋或大腿上。深吸一口氣，輕輕地閉上雙眼。",
    tip: "💡 秘訣：脊椎像疊好的硬幣一樣挺拔，身體像水一樣放鬆。"
  },
  {
    title: "專注於呼吸引導球",
    subtitle: "視覺與節奏的結合",
    icon: Activity,
    iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    content: "在冥想進行中，螢幕中央的「呼吸引導球」會隨著節奏縮放。引導球膨脹時緩緩吸氣，縮小時緩緩吐氣。App 預設會使用最順暢的自然呼吸節奏。您可以隨時調整，讓視覺引導幫助您專注於每一次的一呼一吸。",
    tip: "💡 秘訣：如果閉上眼，也可以選擇跟隨背景的有聲指導語音。"
  },
  {
    title: "大腦亂想是正常的",
    subtitle: "擁抱漂移的思緒",
    icon: Compass,
    iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    content: "大腦內建的「預設模式網路（DMN）」在閒置時會自動活躍，帶來雜念或焦慮。請記住，在正念中，大腦分心「不是失敗」。每次你覺察到分心，並溫柔地將心念「拉回呼吸」的瞬間，正是重塑大腦、增強心理韌性的關鍵時刻！",
    tip: "💡 秘訣：每一次帶回呼吸，都是對自己的一種溫柔慈悲。"
  },
  {
    title: "開啟您的第一次體驗",
    subtitle: "給自己 2 分鐘的寧靜",
    icon: Sparkles,
    iconColor: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    content: "我們特別為初學者設計了 2 分鐘的「極簡禪堂」體驗。在此模式下，系統會自動配置溫柔的「有聲語音引導」，帶領您進行第一階段的呼吸引導。不用擔心做不對，只需享受這 2 分鐘只屬於您的平靜時光。",
    tip: "💡 建議：點擊下方按鈕，系統將自動設定並立即開啟練習。"
  }
]

export function BeginnerGuideDialog({ isOpen, onClose, onApply }: BeginnerGuideDialogProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(0) // -1 for back, 1 for forward

  const handleNext = () => {
    if (currentStep < GUIDE_STEPS.length - 1) {
      setDirection(1)
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleStartExperience = () => {
    // Apply: 2 minutes (120 seconds), vibe "zen_hall", moodBeforeId "calm" (or special beginner mood), autoStart true
    onApply(2 * 60, "zen_hall", "calm", true)
    // Reset state for next launch
    setTimeout(() => {
      setCurrentStep(0)
      setDirection(0)
    }, 300)
  }

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setCurrentStep(0)
      setDirection(0)
    }, 300)
  }

  const stepInfo = GUIDE_STEPS[currentStep]
  const IconComponent = stepInfo.icon

  // Animation variants for slide transitions
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : dir < 0 ? -100 : 0,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : dir < 0 ? 100 : 0,
      opacity: 0
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xl"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            className="relative w-full max-w-lg bg-slate-950/80 border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden backdrop-blur-2xl text-white flex flex-col min-h-[500px] justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Background Glow matching the active step icon theme */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none transition-all duration-500" />

            {/* Header / Close Button */}
            <div className="flex justify-between items-center z-10">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/40 font-medium">
                初學者正念基礎 · 步驟 {currentStep + 1} / {GUIDE_STEPS.length}
              </span>
              <button
                onClick={handleClose}
                className="p-1.5 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Slider Content */}
            <div className="relative flex-grow flex flex-col justify-center my-6 overflow-hidden min-h-[260px] sm:min-h-[220px]">
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="w-full flex flex-col items-center text-center px-1"
                >
                  {/* Step Icon */}
                  <div className={`p-4 rounded-2xl border ${stepInfo.iconColor} mb-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300`}>
                    <IconComponent className="w-8 h-8" strokeWidth={1.5} />
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-xl font-light tracking-wide text-white">
                    {stepInfo.title}
                  </h3>
                  <span className="text-xs text-emerald-400/80 tracking-widest font-light uppercase mt-1 mb-4">
                    {stepInfo.subtitle}
                  </span>

                  {/* Body Paragraph */}
                  <p className="text-sm font-light text-white/75 leading-relaxed text-justify max-w-sm sm:max-w-md">
                    {stepInfo.content}
                  </p>

                  {/* Highlight Tip Box */}
                  {stepInfo.tip && (
                    <div className="mt-4 px-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-xs font-light text-white/60 max-w-xs text-center italic">
                      {stepInfo.tip}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Navigation Area */}
            <div className="flex flex-col gap-4 border-t border-white/5 pt-4 z-10">
              {/* Dot Indicators */}
              <div className="flex justify-center gap-2">
                {GUIDE_STEPS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDirection(idx > currentStep ? 1 : -1)
                      setCurrentStep(idx)
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentStep ? "w-6 bg-emerald-400" : "w-1.5 bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`Go to step ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 w-full">
                {/* Back Button */}
                <button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-light tracking-wider transition-all border border-white/10 ${
                    currentStep === 0
                      ? "opacity-30 cursor-not-allowed text-white/30"
                      : "text-white/70 hover:bg-white/5 hover:text-white cursor-pointer"
                  }`}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  上一步
                </button>

                {/* Next / Launch CTA Button */}
                {currentStep < GUIDE_STEPS.length - 1 ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1.5 py-2 px-5 rounded-xl text-xs font-medium tracking-wider bg-white text-slate-900 hover:bg-slate-100 transition-colors shadow-lg cursor-pointer"
                  >
                    下一步
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleClose}
                      className="py-2 px-4 rounded-xl text-xs font-light tracking-wider bg-white/10 border border-white/5 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    >
                      暫不體驗
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.03, boxShadow: "0 0 15px rgba(56, 189, 248, 0.25)" }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleStartExperience}
                      className="flex items-center gap-1.5 py-2 px-4 rounded-xl text-xs font-medium tracking-widest bg-gradient-to-r from-emerald-500 to-teal-600 text-white transition-all shadow-lg cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      開啟 2 分鐘體驗
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
