"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"

type VibeMode = "focus" | "stress" | "sleep" | "home" | "starry_sky" | "stream" | "zen_hall" | "snow_mountain"

interface BreathingSphereProps {
  phase: "inhale" | "hold" | "exhale" | "hold_out" | "idle"
  vibeMode: VibeMode
  isInSession: boolean
  duration: number
}

const vibeColors = {
  focus: {
    primary: "rgba(186, 230, 253, 0.4)",      // Glacier Blue
    secondary: "rgba(125, 211, 252, 0.2)",
    glow: "186, 230, 253",
  },
  stress: {
    primary: "rgba(254, 215, 170, 0.35)",     // Sunset Peach
    secondary: "rgba(253, 186, 116, 0.15)",
    glow: "254, 215, 170",
  },
  sleep: {
    primary: "rgba(199, 210, 254, 0.35)",     // Twilight Indigo
    secondary: "rgba(165, 180, 252, 0.15)",
    glow: "199, 210, 254",
  },
  home: {
    primary: "rgba(251, 113, 133, 0.35)",      // Rose Pink
    secondary: "rgba(254, 205, 211, 0.15)",
    glow: "251, 113, 133",
  },
  starry_sky: {
    primary: "rgba(192, 132, 252, 0.35)",     // Starry Purple
    secondary: "rgba(147, 51, 234, 0.15)",
    glow: "192, 132, 252",
  },
  stream: {
    primary: "rgba(45, 212, 191, 0.35)",      // Teal Stream
    secondary: "rgba(13, 148, 136, 0.15)",
    glow: "45, 212, 191",
  },
  zen_hall: {
    primary: "rgba(214, 211, 209, 0.35)",     // Stone Warm Gray
    secondary: "rgba(120, 113, 108, 0.15)",
    glow: "214, 211, 209",
  },
  snow_mountain: {
    primary: "rgba(224, 242, 254, 0.4)",      // Pure White/Ice Blue
    secondary: "rgba(186, 230, 253, 0.2)",
    glow: "224, 242, 254",
  },
}

export function BreathingSphere({ phase, vibeMode, isInSession, duration }: BreathingSphereProps) {
  const colors = vibeColors[vibeMode] || vibeColors.focus

  const targetScale = useMemo(() => {
    switch (phase) {
      case "inhale":
        return 1.4
      case "hold":
        return 1.4
      case "exhale":
        return 1.0
      case "hold_out":
        return 1.0
      case "idle":
        return 1.1
      default:
        return 1.1
    }
  }, [phase])

  const scaleValue = useMemo(() => {
    if (phase === "hold") return [1.38, 1.42, 1.38]
    if (phase === "hold_out") return [0.98, 1.02, 0.98]
    return targetScale
  }, [phase, targetScale])

  const transitionValue = useMemo(() => {
    const isHold = phase === "hold" || phase === "hold_out"
    if (isHold) {
      return {
        scale: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
        boxShadow: {
          duration: 1.5,
          ease: "easeInOut" as const,
        }
      }
    }
    return {
      duration: duration,
      ease: "easeInOut" as const,
    }
  }, [phase, duration])

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer aura rings */}
      {[...Array(3)].map((_, i) => {
        const ringClasses = [
          "w-[16rem] h-[16rem] md:w-[20rem] md:h-[20rem]",
          "w-[19rem] h-[19rem] md:w-[24rem] md:h-[24rem]",
          "w-[22rem] h-[22rem] md:w-[28rem] md:h-[28rem]",
        ][i]

        return (
          <motion.div
            key={i}
            className={`absolute rounded-full border border-white/[0.03] ${ringClasses}`}
            style={{
              background: `radial-gradient(circle, ${colors.secondary} 0%, transparent 70%)`,
            }}
            animate={{
              scale: [1, 1.05 + i * 0.02, 1],
              opacity: [0.3 - i * 0.08, 0.5 - i * 0.1, 0.3 - i * 0.08],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        )
      })}

      {/* Main breathing sphere */}
      <motion.div
        className="relative w-48 h-48 md:w-64 md:h-64 rounded-full"
        animate={{
          scale: scaleValue,
          boxShadow: phase === "inhale" || phase === "hold"
            ? `0 0 75px rgba(${colors.glow}, 0.55), 0 0 150px rgba(${colors.glow}, 0.3), inset 0 0 65px rgba(255, 255, 255, 0.12)`
            : `0 0 35px rgba(${colors.glow}, 0.35), 0 0 70px rgba(${colors.glow}, 0.15), inset 0 0 45px rgba(255, 255, 255, 0.08)`
        }}
        transition={transitionValue}
        style={{
          background: `
            radial-gradient(circle at 30% 30%, 
              rgba(255, 255, 255, 0.15) 0%, 
              ${colors.primary} 40%, 
              ${colors.secondary} 70%, 
              transparent 100%)
          `,
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Inner glow layer */}
        <motion.div
          className="absolute inset-4 rounded-full"
          style={{
            background: `radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.2) 0%, transparent 60%)`,
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Highlight reflection */}
        <div
          className="absolute top-6 left-8 w-12 h-8 md:w-16 md:h-10 rounded-full opacity-30"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 60%)",
            filter: "blur(4px)",
          }}
        />
      </motion.div>

      {/* Phase indicator text */}
      <motion.div
        className="absolute -bottom-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: isInSession ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.p
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.8, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-base sm:text-lg font-light tracking-[0.25em] text-white"
        >
          {phase === "inhale" && "吸氣 · Inhale"}
          {phase === "hold" && "屏息 · Hold"}
          {phase === "exhale" && "呼氣 · Exhale"}
          {phase === "hold_out" && "屏息 · Hold"}
          {phase === "idle" && "預備 · Ready"}
        </motion.p>
      </motion.div>
    </div>
  )
}
