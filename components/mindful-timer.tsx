"use client"

import { motion } from "framer-motion"

interface MindfulTimerProps {
  timeRemaining: number
  totalTime: number
  isVisible: boolean
}

export function MindfulTimer({ timeRemaining, totalTime, isVisible }: MindfulTimerProps) {
  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const progress = totalTime > 0 ? (totalTime - timeRemaining) / totalTime : 0

  return (
    <motion.div
      className="flex flex-col items-center gap-4"
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 1 }}
    >
      {/* Time display */}
      <div className="relative">
        <motion.span
          className="text-5xl md:text-7xl font-extralight tracking-wider text-foreground/80 tabular-nums"
          style={{
            textShadow: "0 0 40px rgba(56, 189, 248, 0.3)",
          }}
        >
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </motion.span>
      </div>

      {/* Progress bar */}
      <div className="w-48 md:w-64 h-0.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary/60 to-accent/60 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: "linear" }}
        />
      </div>
    </motion.div>
  )
}
