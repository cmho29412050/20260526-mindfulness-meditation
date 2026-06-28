"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Play, Pause, RotateCcw, Square, VolumeX, Volume2 } from "lucide-react"

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
  const [bgmType, setBgmType] = useState("silent")
  const [volume, setVolume] = useState(60)

  useEffect(() => {
    if (typeof window !== "undefined") {
      setBgmType(localStorage.getItem("zenith_bgm_type") || "silent")
      setVolume(parseInt(localStorage.getItem("zenith_bgm_volume") || "60"))

      const handleBgmChange = () => {
        setBgmType(localStorage.getItem("zenith_bgm_type") || "silent")
      }
      const handleVolumeChange = () => {
        setVolume(parseInt(localStorage.getItem("zenith_bgm_volume") || "60"))
      }

      window.addEventListener("zenith_bgm_change", handleBgmChange)
      window.addEventListener("zenith_bgm_volume_change", handleVolumeChange)

      return () => {
        window.removeEventListener("zenith_bgm_change", handleBgmChange)
        window.removeEventListener("zenith_bgm_volume_change", handleVolumeChange)
      }
    }
  }, [])

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
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
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

          {/* Vertical Divider */}
          {bgmType !== "silent" && (
            <div className="h-6 w-px bg-white/20 mx-1 hidden sm:block" />
          )}

          {/* Inline BGM volume slider */}
          {bgmType !== "silent" && (
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-3.5 py-2.5 border border-white/15">
              <button 
                onClick={() => {
                  const targetVal = volume === 0 ? 60 : 0
                  localStorage.setItem("zenith_bgm_volume", String(targetVal))
                  window.dispatchEvent(new Event("zenith_bgm_volume_change"))
                }}
                className="text-white/70 hover:text-white transition-colors cursor-pointer p-0.5"
              >
                {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={volume}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  localStorage.setItem("zenith_bgm_volume", String(val))
                  window.dispatchEvent(new Event("zenith_bgm_volume_change"))
                }}
                className="w-20 sm:w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-400 hover:accent-emerald-300 transition-all focus:outline-none"
              />
              <span className="text-[10px] text-white/60 font-light w-8 text-right">{volume}%</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
