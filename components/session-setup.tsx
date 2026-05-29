"use client"

import { motion } from "framer-motion"
import { VibeSelector } from "./vibe-selector"
import { Play, VolumeX, Music, Bell, Trees, Waves, Droplet, CloudRain } from "lucide-react"

type VibeMode = "focus" | "stress" | "sleep" | "home"

interface SessionSetupProps {
  vibeMode: VibeMode
  onVibeChange: (vibe: VibeMode) => void
  sessionDuration: number
  onDurationChange: (duration: number) => void
  bgmType: string
  onBgmChange: (bgm: string) => void
  onStartSession: () => void
}

export function SessionSetup({
  vibeMode,
  onVibeChange,
  sessionDuration,
  onDurationChange,
  bgmType,
  onBgmChange,
  onStartSession,
}: SessionSetupProps) {
  const durations = [3, 15, 30, 60, 0]
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="w-full max-w-lg flex flex-col gap-5 items-center bg-white/85 border border-white/50 p-5 sm:p-6 rounded-3xl backdrop-blur-xl shadow-2xl z-20 pointer-events-auto text-slate-800"
    >
      {/* Vibe Selection */}
      <VibeSelector
        selectedVibe={vibeMode}
        onVibeChange={onVibeChange}
        isVisible={true}
      />
 
      {/* Duration Selection */}
      <div className="flex flex-col items-center gap-2 w-full">
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-slate-500 font-medium">
          選擇冥想時間
        </p>
        <div className="grid grid-cols-5 gap-1.5 w-full px-1">
          {durations.map((mins) => {
            const isSelected = sessionDuration === mins * 60
            return (
              <motion.button
                key={mins}
                whileHover={{ scale: 1.05, backgroundColor: "rgba(15, 23, 42, 0.05)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDurationChange(mins * 60)}
                className={`py-2 rounded-full border transition-all duration-300 backdrop-blur-md text-[11px] sm:text-xs font-normal cursor-pointer text-center w-full ${
                  isSelected
                    ? "border-sky-500 bg-sky-100/60 text-sky-700 shadow-[0_0_15px_rgba(14,165,233,0.15)] font-medium"
                    : "border-slate-200 bg-slate-50/50 text-slate-600 hover:text-slate-800"
                }`}
              >
                {mins === 0 ? "無限制" : `${mins} 分`}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Background Music Selection */}
      <div className="flex flex-col items-center gap-2 w-full">
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-slate-500 font-medium">
          選擇背景音樂
        </p>
        <div className="grid grid-cols-3 gap-2 w-full px-1">
          {[
            { id: "silent", label: "無聲", icon: VolumeX },
            { id: "guide", label: "有聲指導", icon: Music },
            { id: "bowl", label: "頌缽磬音", icon: Bell },
            { id: "forest", label: "蟲鳴鳥叫", icon: Trees },
            { id: "ocean", label: "海浪聲音", icon: Waves },
            { id: "river", label: "流水聲音", icon: Droplet },
          ].map((item) => {
            const Icon = item.icon
            const isSelected = bgmType === item.id
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.03, backgroundColor: "rgba(15, 23, 42, 0.05)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onBgmChange(item.id)}
                className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-full border transition-all duration-300 backdrop-blur-md text-xs font-normal cursor-pointer w-full text-center ${
                  isSelected
                    ? "border-sky-500 bg-sky-100/60 text-sky-700 shadow-[0_0_15px_rgba(14,165,233,0.15)] font-medium"
                    : "border-slate-200 bg-slate-50/50 text-slate-600 hover:text-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>
  
      {/* Start Button */}
      <motion.button
        whileHover={{ scale: 1.01, backgroundColor: "rgba(15, 23, 42, 0.95)" }}
        whileTap={{ scale: 0.99 }}
        onClick={onStartSession}
        className="w-full py-3 rounded-2xl bg-slate-800 text-white text-sm font-medium tracking-[0.2em] uppercase hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
      >
        <Play className="w-4 h-4 text-sky-300 fill-sky-300/20" />
        開始正念冥想
      </motion.button>
    </motion.div>
  )
}
