"use client"

import { motion } from "framer-motion"
import { Mountain, Waves, Trees, Home } from "lucide-react"

type VibeMode = "focus" | "stress" | "sleep" | "home"

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
]

export function VibeSelector({ selectedVibe, onVibeChange, isVisible }: VibeSelectorProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 1 }}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-slate-500 font-medium mb-2">
        選擇冥想地點
      </p>
      <div className="grid grid-cols-4 gap-2.5 w-full">
        {vibes.map((vibe) => {
          const Icon = vibe.icon
          const isSelected = selectedVibe === vibe.id
 
          return (
            <motion.button
              key={vibe.id}
              onClick={() => onVibeChange(vibe.id)}
              className={`
                relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all duration-300 cursor-pointer group
                ${isSelected 
                  ? "bg-slate-900/[0.04] border-slate-300 text-slate-900 shadow-[0_0_20px_rgba(15,23,42,0.05)]" 
                  : "bg-slate-50/40 border-slate-200/60 text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                }
              `}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Background gradient */}
              <div
                className={`
                  absolute inset-0 rounded-2xl opacity-40 transition-opacity duration-300
                  bg-gradient-to-br ${isSelected ? vibe.activeColor : "from-transparent to-transparent"}
                `}
              />
 
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <motion.div
                  animate={{
                    scale: isSelected ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 2,
                    repeat: isSelected ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                >
                  <Icon
                    className={`w-6 h-6 ${isSelected ? "text-slate-800" : "text-slate-400 group-hover:text-slate-600"}`}
                  />
                </motion.div>
                <span
                  className={`text-xs md:text-sm font-semibold ${isSelected ? "text-slate-800" : "text-slate-500 group-hover:text-slate-700"}`}
                >
                  {vibe.label}
                </span>
                <span className={`text-[10px] hidden md:block ${isSelected ? "text-slate-600" : "text-slate-400"}`}>
                  {vibe.description}
                </span>
              </div>
 
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  className="absolute -bottom-1 left-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500"
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
