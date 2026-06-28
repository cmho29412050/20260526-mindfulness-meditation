"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { VibeSelector } from "./vibe-selector"
import { 
  Play, 
  VolumeX, 
  Volume2, 
  Music, 
  Sparkles,
  Mic,
  Compass,
  Upload as UploadIcon,
  Bell
} from "lucide-react"
import { saveCustomAudio } from "@/lib/db"

type VibeMode = "focus" | "stress" | "sleep" | "home" | "starry_sky" | "stream" | "zen_hall" | "snow_mountain" | "custom"

interface SessionSetupProps {
  vibeMode: VibeMode
  onVibeChange: (vibe: VibeMode) => void
  sessionDuration: number
  onDurationChange: (duration: number) => void
  bgmType: string
  onBgmChange: (bgm: string) => void
  onStartSession: () => void
  onOpenAssessment: () => void
  onOpenBeginnerGuide: () => void
}

export function SessionSetup({
  vibeMode,
  onVibeChange,
  sessionDuration,
  onDurationChange,
  bgmType,
  onBgmChange,
  onStartSession,
  onOpenAssessment,
  onOpenBeginnerGuide,
}: SessionSetupProps) {
  const durations = [3, 15, 30, -1]
  const [volume, setVolume] = useState(60)
  const [customAudioName, setCustomAudioName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("zenith_bgm_volume")
      if (stored) {
        setVolume(parseInt(stored))
      }
      setCustomAudioName(localStorage.getItem("zenith_custom_bgm_name"))
    }
  }, [])

  const handleVolumeSliderChange = (newVal: number) => {
    setVolume(newVal)
    localStorage.setItem("zenith_bgm_volume", String(newVal))
    window.dispatchEvent(new Event("zenith_bgm_volume_change"))
  }

  const handleBgmClick = (id: string) => {
    if (id === "custom") {
      if (!customAudioName) {
        fileInputRef.current?.click()
      } else {
        onBgmChange("custom")
      }
    } else {
      onBgmChange(id)
    }
  }

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const fileName = file.name.length > 20 ? file.name.substring(0, 17) + "..." : file.name
      localStorage.setItem("zenith_custom_bgm_name", fileName)
      setCustomAudioName(fileName)

      await saveCustomAudio(file.name, file)

      onBgmChange("custom")
      if (typeof window !== "undefined") {
        localStorage.setItem("zenith_bgm_type", "custom")
        window.dispatchEvent(new Event("zenith_bgm_change"))
      }
    } catch (err) {
      console.error("Failed to save custom audio:", err)
    }
  }

  const handleReuploadClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    fileInputRef.current?.click()
  }

  const isCustomSelected = ! [3 * 60, 15 * 60, 30 * 60].includes(sessionDuration)
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="w-full max-w-3xl flex flex-col gap-6 items-center bg-slate-950/45 border border-white/10 p-6 sm:p-8 rounded-3xl backdrop-blur-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] z-20 pointer-events-auto text-white"
    >
      {/* Beginner Guide & Smart Recommendation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        <motion.button
          whileHover={{ scale: 1.01, backgroundColor: "rgba(14, 165, 233, 0.12)" }}
          whileTap={{ scale: 0.99 }}
          onClick={onOpenAssessment}
          className="w-full py-2.5 rounded-2xl border border-dashed border-emerald-500/30 text-emerald-300 text-xs font-light tracking-[0.2em] flex items-center justify-center gap-2 cursor-pointer transition-all bg-emerald-500/5 hover:border-emerald-400/60 hover:text-emerald-200"
        >
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          智慧身心評估推薦
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.01, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
          whileTap={{ scale: 0.99 }}
          onClick={onOpenBeginnerGuide}
          className="w-full py-2.5 rounded-2xl border border-white/10 text-white/80 text-xs font-light tracking-[0.2em] flex items-center justify-center gap-2 cursor-pointer transition-all bg-white/5 hover:border-white/20 hover:text-white"
        >
          <Compass className="w-4 h-4 text-emerald-400 animate-pulse" />
          初學者入門指南 🧘
        </motion.button>
      </div>

      {/* Grid Settings Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full border-t border-white/5 pt-5">
        
        {/* Left Column: Location & Duration */}
        <div className="flex flex-col gap-6 w-full">
          {/* Vibe Selection */}
          <VibeSelector
            selectedVibe={vibeMode}
            onVibeChange={onVibeChange}
            isVisible={true}
          />
     
          {/* Duration Selection */}
          <div className="flex flex-col items-center gap-2 w-full mt-2">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-white/40 font-medium mb-1">
              選擇冥想時間
            </p>
            <div className="grid grid-cols-4 gap-2 w-full">
              {durations.map((mins) => {
                const isSelected = mins === -1 
                  ? isCustomSelected
                  : (sessionDuration === mins * 60)
                
                const label = mins === -1 ? "自訂" : `${mins} 分`
                return (
                  <motion.button
                    key={mins}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      if (mins === -1) {
                        const lastCustom = parseInt(localStorage.getItem("zenith_custom_duration") || "5")
                        onDurationChange(lastCustom * 60)
                      } else {
                        onDurationChange(mins * 60)
                      }
                    }}
                    className={`relative py-2 rounded-full border transition-all duration-300 text-xs font-normal cursor-pointer text-center w-full overflow-hidden select-none ${
                      isSelected
                        ? "border-emerald-500/30 text-emerald-300 font-medium shadow-[0_0_12px_rgba(14,165,233,0.05)]"
                        : "border-white/5 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/10"
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeDurationBg"
                        className="absolute inset-0 bg-emerald-500/20"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{label}</span>
                  </motion.button>
                )
              })}
            </div>
            <AnimatePresence>
              {isCustomSelected && (
                <motion.div
                  initial={{ height: 0, opacity: 0, marginTop: 0 }}
                  animate={{ height: "auto", opacity: 1, marginTop: 8 }}
                  exit={{ height: 0, opacity: 0, marginTop: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden w-full flex flex-col gap-2 bg-white/5 border border-white/5 p-3.5 rounded-2xl"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] sm:text-xs text-white/50 font-medium">調整自訂時間</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="180"
                        value={isCustomSelected ? Math.round(sessionDuration / 60) : 5}
                        onChange={(e) => {
                          const val = Math.max(1, Math.min(180, parseInt(e.target.value) || 1))
                          onDurationChange(val * 60)
                          localStorage.setItem("zenith_custom_duration", String(val))
                        }}
                        className="w-12 h-6 bg-white/10 border border-white/10 rounded text-center text-xs font-medium text-emerald-400 focus:outline-none focus:border-emerald-400"
                      />
                      <span className="text-xs text-white/40 font-light">分鐘</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="120"
                    step="1"
                    value={isCustomSelected ? Math.round(sessionDuration / 60) : 5}
                    onChange={(e) => {
                      const val = parseInt(e.target.value)
                      onDurationChange(val * 60)
                      localStorage.setItem("zenith_custom_duration", String(val))
                    }}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400 hover:accent-emerald-500 transition-all focus:outline-none"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: BGM & Ambient Sounds */}
        <div className="flex flex-col gap-6 w-full">
          {/* Background Music Selection */}
          <div className="flex flex-col items-center gap-2 w-full">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-white/40 font-medium mb-1">
              選擇背景音樂
            </p>
            <div className="grid grid-cols-4 gap-2 w-full">
              {[
                { id: "silent", label: "無聲", icon: VolumeX },
                { id: "bowl", label: "頌缽引導", icon: Bell },
                { id: "piano", label: "冥想音樂", icon: Music },
                { id: "custom", label: customAudioName || "自訂音樂", icon: UploadIcon },
              ].map((item) => {
                const Icon = item.icon
                const isSelected = bgmType === item.id
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleBgmClick(item.id)}
                    className={`relative flex items-center justify-center gap-1.5 py-2 px-1 rounded-full border transition-all duration-300 text-xs font-normal cursor-pointer w-full text-center overflow-hidden select-none ${
                      isSelected
                        ? "border-emerald-500/30 text-emerald-300 font-medium shadow-[0_0_12px_rgba(14,165,233,0.05)]"
                        : "border-white/5 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 hover:border-white/10"
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeBgmBg"
                        className="absolute inset-0 bg-emerald-500/20"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon className="w-3.5 h-3.5 flex-shrink-0 relative z-10" />
                    <span className="truncate relative z-10">{item.label}</span>
                  </motion.button>
                )
              })}
            </div>
            {customAudioName && bgmType === "custom" && (
              <div className="flex items-center justify-between w-full px-1 text-[10px] text-white/45 font-light border-t border-white/5 pt-2 mt-1">
                <span>已上傳音訊：{customAudioName}</span>
                <button
                  onClick={handleReuploadClick}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium cursor-pointer"
                >
                  重新上傳
                </button>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept="audio/*"
              onChange={handleAudioUpload}
              className="hidden"
            />
          </div>

          {/* Background Music Volume Slider */}
          {bgmType !== "silent" && (
            <div className="flex flex-col items-center gap-2 w-full mt-1 border-t border-white/5 pt-3">
              <div className="flex items-center justify-between w-full px-1">
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-white/40 font-medium">
                  背景音樂音量
                </span>
                <span className="text-xs text-emerald-400 font-light tracking-wide">{volume}%</span>
              </div>
              <div className="flex items-center gap-3 w-full px-1">
                <button 
                  onClick={() => handleVolumeSliderChange(volume === 0 ? 60 : 0)}
                  className="text-white/40 hover:text-white transition-colors p-1"
                >
                  {volume === 0 ? <VolumeX className="w-4 h-4 text-white/40" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={volume}
                  onChange={(e) => handleVolumeSliderChange(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400 hover:accent-emerald-500 transition-all focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
  
      {/* Start Button */}
      <motion.button
        whileHover={{ scale: 1.01, boxShadow: "0 0 20px rgba(56, 189, 248, 0.2)" }}
        whileTap={{ scale: 0.99 }}
        onClick={onStartSession}
        className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:from-emerald-400 hover:to-teal-500"
      >
        <Play className="w-4 h-4 text-white fill-white/20 animate-pulse" />
        開始正念冥想
      </motion.button>
    </motion.div>
  )
}
