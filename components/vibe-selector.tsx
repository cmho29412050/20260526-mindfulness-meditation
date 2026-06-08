"use client"

import { motion } from "framer-motion"
import { Mountain, Waves, Trees, Home, Sparkles, Droplets, Compass, Snowflake } from "lucide-react"

type VibeMode = "focus" | "stress" | "sleep" | "home" | "starry_sky" | "stream" | "zen_hall" | "snow_mountain"

interface VibeSelectorProps {
  selectedVibe: VibeMode
  onVibeChange: (vibe: VibeMode) => void
  isVisible: boolean
}

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
    id: "home" as VibeMode,
    label: "家裡",
    icon: Home,
    description: "溫馨居所",
    color: "from-rose-400/20 to-orange-400/20",
    activeColor: "from-rose-400/40 to-orange-400/40",
    glowColor: "rgba(244, 63, 94, 0.5)",
  },
  {
    id: "starry_sky" as VibeMode,
    label: "星空",
    icon: Sparkles,
    description: "浩瀚星空",
    color: "from-indigo-400/20 to-purple-500/20",
    activeColor: "from-indigo-400/40 to-purple-500/40",
    glowColor: "rgba(99, 102, 241, 0.5)",
  },
  {
    id: "stream" as VibeMode,
    label: "溪流",
    icon: Droplets,
    description: "山谷溪流",
    color: "from-teal-400/20 to-emerald-500/20",
    activeColor: "from-teal-400/40 to-emerald-500/40",
    glowColor: "rgba(20, 184, 166, 0.5)",
  },
  {
    id: "zen_hall" as VibeMode,
    label: "禪堂",
    icon: Compass,
    description: "靜心禪堂",
    color: "from-stone-400/20 to-neutral-500/20",
    activeColor: "from-stone-400/40 to-neutral-500/40",
    glowColor: "rgba(120, 113, 108, 0.5)",
  },
  {
    id: "snow_mountain" as VibeMode,
    label: "雪山",
    icon: Snowflake,
    description: "純淨雪山",
    color: "from-sky-200/20 to-blue-300/20",
    activeColor: "from-sky-200/40 to-blue-300/40",
    glowColor: "rgba(186, 230, 253, 0.5)",
  },
]

export function VibeSelector({ selectedVibe, onVibeChange, isVisible }: VibeSelectorProps) {
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
              onClick={() => onVibeChange(vibe.id)}
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
                  className="absolute -bottom-1 left-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-sky-400 to-indigo-400"
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
    </motion.div>
  )
}
