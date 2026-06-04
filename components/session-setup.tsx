"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { VibeSelector } from "./vibe-selector"
import { 
  Play, 
  VolumeX, 
  Volume2, 
  Music, 
  Bell, 
  Trees, 
  Waves, 
  Droplet, 
  CloudRain, 
  Moon,
  Sparkles,
  Mic,
  Upload as UploadIcon
} from "lucide-react"
import { saveCustomAudio } from "@/lib/db"

type VibeMode = "focus" | "stress" | "sleep" | "home" | "rain"

interface SessionSetupProps {
  vibeMode: VibeMode
  onVibeChange: (vibe: VibeMode) => void
  sessionDuration: number
  onDurationChange: (duration: number) => void
  bgmType: string
  onBgmChange: (bgm: string) => void
  onStartSession: () => void
  onOpenAssessment: () => void
  selectedRhythm: string
  onRhythmChange: (rhythm: string) => void
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
  selectedRhythm,
  onRhythmChange,
}: SessionSetupProps) {
  const durations = [3, 15, 30, 60, 0, -1]
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

  const isCustomSelected = ! [3 * 60, 15 * 60, 30 * 60, 60 * 60, 0].includes(sessionDuration)
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="w-full max-w-lg flex flex-col gap-5 items-center bg-white/45 border border-white/60 p-5 sm:p-6 rounded-3xl backdrop-blur-xl shadow-[0_8px_32px_0_rgba(15,23,42,0.08)] z-20 pointer-events-auto text-slate-800"
    >
      {/* Smart Recommendation Button */}
      <motion.button
        whileHover={{ scale: 1.02, backgroundColor: "rgba(14, 165, 233, 0.08)" }}
        whileTap={{ scale: 0.99 }}
        onClick={onOpenAssessment}
        style={{ backgroundColor: "rgba(240, 249, 255, 0.3)" }}
        className="w-full py-2.5 rounded-2xl border border-dashed border-sky-400/50 text-sky-700 text-xs font-light tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm hover:border-sky-500 hover:text-sky-800"
      >
        <Sparkles className="w-4 h-4 text-sky-500 animate-pulse" />
        智慧身心評估推薦
      </motion.button>

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
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 w-full px-1">
          {durations.map((mins) => {
            const isSelected = mins === -1 
              ? isCustomSelected
              : (mins === 0 ? sessionDuration === 0 : sessionDuration === mins * 60)
            
            const label = mins === -1 ? "自訂" : (mins === 0 ? "無限制" : `${mins} 分`)
            return (
              <motion.button
                key={mins}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  if (mins === -1) {
                    const lastCustom = parseInt(localStorage.getItem("zenith_custom_duration") || "5")
                    onDurationChange(lastCustom * 60)
                  } else {
                    onDurationChange(mins * 60)
                  }
                }}
                className={`relative py-2 rounded-full border transition-all duration-300 text-[11px] sm:text-xs font-normal cursor-pointer text-center w-full overflow-hidden select-none ${
                  isSelected
                    ? "border-sky-400 text-sky-700 font-medium shadow-[0_0_12px_rgba(14,165,233,0.08)]"
                    : "border-slate-200/50 bg-slate-50/20 text-slate-600 hover:text-slate-800 hover:bg-slate-100/20"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeDurationBg"
                    className="absolute inset-0 bg-sky-200/40"
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
              className="overflow-hidden w-full flex flex-col gap-2 bg-slate-50/40 border border-slate-200/50 p-3.5 rounded-2xl"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] sm:text-xs text-slate-500 font-medium">調整自訂時間</span>
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
                    className="w-12 h-6 bg-white/70 border border-slate-200 rounded text-center text-xs font-medium text-sky-600 focus:outline-none focus:border-sky-400"
                  />
                  <span className="text-xs text-slate-400 font-light">分鐘</span>
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
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:accent-sky-600 transition-all focus:outline-none"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Breathing Rhythm Selection */}
      <div className="flex flex-col items-center gap-2 w-full">
        <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-slate-500 font-medium">
          選擇呼吸律動
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full px-1">
          {[
            { id: "natural", label: "自然呼吸", desc: "順其自然" },
            { id: "4-4-8", label: "4-4-8 平衡", desc: "調節神經" },
            { id: "4-7-8", label: "4-7-8 助眠", desc: "深層放鬆" },
            { id: "4-4-4-4", label: "4-4-4-4 專注", desc: "箱式呼吸" }
          ].map((item) => {
            const isSelected = selectedRhythm === item.id
            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onRhythmChange(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl border transition-all duration-300 cursor-pointer w-full text-center overflow-hidden select-none ${
                  isSelected
                    ? "border-sky-400 text-sky-700 font-medium shadow-[0_0_12px_rgba(14,165,233,0.08)]"
                    : "border-slate-200/50 bg-slate-50/20 text-slate-600 hover:text-slate-800 hover:bg-slate-100/20"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeRhythmBg"
                    className="absolute inset-0 bg-sky-200/40"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="text-xs font-semibold relative z-10">{item.label}</span>
                <span className={`text-[9px] mt-0.5 relative z-10 ${isSelected ? "text-sky-600/85" : "text-slate-400"}`}>
                  {item.desc}
                </span>
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
            { id: "guide", label: "有聲指導", icon: Mic },
            { id: "piano", label: "冥想音樂", icon: Music },
            { id: "bowl", label: "頌缽磬音", icon: Bell },
            { id: "forest", label: "蟲鳴鳥叫", icon: Trees },
            { id: "ocean", label: "海浪聲音", icon: Waves },
            { id: "river", label: "流水聲音", icon: Droplet },
            { id: "rain", label: "雨天聲音", icon: CloudRain },
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
                    ? "border-sky-400 text-sky-700 font-medium shadow-[0_0_12px_rgba(14,165,233,0.08)]"
                    : "border-slate-200/50 bg-slate-50/20 text-slate-600 hover:text-slate-800 hover:bg-slate-100/20"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeBgmBg"
                    className="absolute inset-0 bg-sky-200/40"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="w-3.5 h-3.5 flex-shrink-0 relative z-10" />
                <span className="truncate relative z-10">{item.label}</span>
              </motion.button>
            )
          })}
        </div>
        {customAudioName && (
          <div className="flex items-center justify-between w-full px-1 text-[10px] text-slate-400 font-light border-t border-slate-200/20 pt-2.5 mt-1">
            <span>已上傳音訊：{customAudioName}</span>
            <button
              onClick={handleReuploadClick}
              className="text-sky-600 hover:text-sky-700 transition-colors font-medium cursor-pointer"
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
        <div className="flex flex-col items-center gap-2 w-full mt-1 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between w-full px-1">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-slate-500 font-medium">
              背景音樂音量
            </span>
            <span className="text-xs text-sky-600 font-light tracking-wide">{volume}%</span>
          </div>
          <div className="flex items-center gap-3 w-full px-1">
            <button 
              onClick={() => handleVolumeSliderChange(volume === 0 ? 60 : 0)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-sky-500" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={volume}
              onChange={(e) => handleVolumeSliderChange(parseInt(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500 hover:accent-sky-600 transition-all focus:outline-none"
            />
          </div>
        </div>
      )}
  
      {/* Start Button */}
      <motion.button
        whileHover={{ scale: 1.01, backgroundColor: "rgba(15, 23, 42, 0.95)" }}
        whileTap={{ scale: 0.99 }}
        onClick={onStartSession}
        style={{ backgroundColor: "rgb(30, 41, 59)" }}
        className="w-full py-3 rounded-2xl text-white text-sm font-medium tracking-[0.2em] uppercase hover:bg-slate-900 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
      >
        <Play className="w-4 h-4 text-sky-300 fill-sky-300/20" />
        開始正念冥想
      </motion.button>
    </motion.div>
  )
}
