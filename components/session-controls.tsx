"use client"

import { motion } from "framer-motion"
import { Play, Pause, RotateCcw, Square } from "lucide-react"

interface SessionControlsProps {
  isInSession: boolean
  isPaused: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onEndSession: () => void
  isVisible: boolean
}

export function SessionControls({
  isInSession,
  isPaused,
  onStart,
  onPause,
  onReset,
  onEndSession,
  isVisible,
}: SessionControlsProps) {
  return (
    <motion.div
      className="flex items-center gap-4"
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 1 }}
    >
      {!isInSession ? (
        <motion.button
          onClick={onStart}
          className="
            relative px-8 py-4 rounded-full
            glass-card overflow-hidden
            group cursor-pointer
          "
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Animated gradient background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          {/* Button content */}
          <div className="relative flex items-center gap-3">
            <Play className="w-5 h-5 text-foreground" />
            <span className="text-sm font-medium tracking-wider uppercase text-foreground">
              Start Session
            </span>
          </div>

          {/* Glow effect on hover */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              boxShadow: "inset 0 0 30px rgba(56, 189, 248, 0.3)",
            }}
          />
        </motion.button>
      ) : (
        <div className="flex items-center gap-3">
          {/* Pause/Resume button */}
          <motion.button
            onClick={onPause}
            className="
              p-4 rounded-full glass-card
              hover:bg-white/10 transition-colors cursor-pointer
            "
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPaused ? (
              <Play className="w-5 h-5 text-foreground" />
            ) : (
              <Pause className="w-5 h-5 text-foreground" />
            )}
          </motion.button>

          {/* End/Stop button */}
          <motion.button
            onClick={onEndSession}
            className="
              p-4 rounded-full glass-card
              hover:bg-red-500/10 hover:border-red-500/30 transition-colors cursor-pointer
            "
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="結束並結算"
          >
            <Square className="w-5 h-5 text-red-400 fill-red-400/20" />
          </motion.button>

          {/* Reset button */}
          <motion.button
            onClick={onReset}
            className="
              p-4 rounded-full glass-card
              hover:bg-white/10 transition-colors cursor-pointer
            "
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-5 h-5 text-foreground" />
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}
