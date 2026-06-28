"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Mountain, Waves, Trees, Compass } from "lucide-react"
import { saveCustomImage } from "@/lib/db"

type VibeMode = "focus" | "stress" | "sleep" | "home" | "starry_sky" | "stream" | "zen_hall" | "snow_mountain" | "custom"

interface VibeSelectorProps {
  selectedVibe: VibeMode
  onVibeChange: (vibe: VibeMode) => void
  isVisible: boolean
}

export function VibeSelector({ selectedVibe, onVibeChange, isVisible }: VibeSelectorProps) {
  const [customImageName, setCustomImageName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCustomImageName(localStorage.getItem("zenith_custom_image_name"))
    }
  }, [])

  const vibes = [
    {
      id: "focus" as VibeMode,
      label: "山上",
      icon: Mountain,
      description: "寧靜群山",
      color: "from-cyan-400/20 to-blue-500/20",
      activeColor: "from-cyan-400/40 to-blue-500/40",
      glowColor: "rgba(56, 189, 248, 0.5)",
    },
    {
      id: "stress" as VibeMode,
      label: "海邊",
      icon: Waves,
      description: "靜謐沙灘",
      color: "from-amber-400/20 to-orange-500/20",
      activeColor: "from-amber-400/40 to-orange-500/40",
      glowColor: "rgba(251, 191, 36, 0.5)",
    },
    {
      id: "sleep" as VibeMode,
      label: "森林",
      icon: Trees,
      description: "深邃幽林",
      color: "from-violet-400/20 to-purple-500/20",
      activeColor: "from-violet-400/40 to-purple-500/40",
      glowColor: "rgba(139, 92, 246, 0.5)",
    },
    {
      id: "custom" as VibeMode,
      label: customImageName || "自訂地點",
      icon: Compass,
      description: "上傳背景圖",
      color: "from-purple-400/20 to-pink-500/20",
      activeColor: "from-purple-400/40 to-pink-500/40",
      glowColor: "rgba(236, 72, 153, 0.5)",
    },
  ]

  const handleVibeClick = (vibeId: VibeMode) => {
    if (vibeId === "custom") {
      if (!customImageName) {
        fileInputRef.current?.click()
      } else {
        onVibeChange("custom")
      }
    } else {
      onVibeChange(vibeId)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const fileName = file.name.length > 10 ? file.name.substring(0, 7) + "..." : file.name
      localStorage.setItem("zenith_custom_image_name", fileName)
      setCustomImageName(fileName)

      await saveCustomImage(file.name, file)

      onVibeChange("custom")
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("zenith_custom_image_change"))
      }
    } catch (err) {
      console.error("Failed to save custom image:", err)
    }
  }

  const handleReuploadClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    fileInputRef.current?.click()
  }

  return (
    <motion.div
      className="flex flex-col items-center gap-3 w-full"
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 1 }}
    >
      <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-white/40 font-medium mb-1">
        選擇冥想地點
      </p>
      <div className="grid grid-cols-4 gap-2 w-full">
        {vibes.map((vibe) => {
          const Icon = vibe.icon
          const isSelected = selectedVibe === vibe.id

          return (
            <motion.button
              key={vibe.id}
              onClick={() => handleVibeClick(vibe.id)}
              className={`
                relative flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all duration-300 cursor-pointer group overflow-hidden select-none w-full
                ${isSelected 
                  ? "border-white/25 text-white shadow-[0_4px_20px_rgba(255,255,255,0.04)]" 
                  : "bg-white/5 border-white/5 text-white/40 hover:text-white hover:bg-white/10 hover:border-white/10"
                }
              `}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Background gradient Shared Layout */}
              {isSelected && (
                <motion.div
                  layoutId="activeVibeBg"
                  className={`absolute inset-0 bg-gradient-to-br ${vibe.activeColor} opacity-40`}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                />
              )}

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <motion.div
                  animate={{
                    scale: isSelected ? [1, 1.08, 1] : 1,
                  }}
                  transition={{
                    duration: 3,
                    repeat: isSelected ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                >
                  <Icon
                    className={`w-5 h-5 ${isSelected ? "text-white" : "text-white/45 group-hover:text-white/70"}`}
                  />
                </motion.div>
                <span
                  className={`text-xs font-semibold ${isSelected ? "text-white" : "text-white/55 group-hover:text-white/80"}`}
                >
                  {vibe.label}
                </span>
                <span className={`text-[9px] font-light tracking-wider ${isSelected ? "text-white/60" : "text-white/30"}`}>
                  {vibe.description}
                </span>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  className="absolute -bottom-1 left-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
                  layoutId="vibeIndicator"
                  initial={{ x: "-50%" }}
                  animate={{ x: "-50%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
      {selectedVibe === "custom" && customImageName && (
        <div className="flex items-center gap-2 mt-1 text-[10px] text-white/45">
          <span>背景圖：{customImageName}</span>
          <button
            onClick={handleReuploadClick}
            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors cursor-pointer"
          >
            重新上傳
          </button>
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </motion.div>
  )
}



