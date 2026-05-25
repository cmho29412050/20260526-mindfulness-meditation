"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"

type VibeMode = "focus" | "stress" | "sleep"

interface BreathingSphereProps {
  phase: "inhale" | "hold" | "exhale" | "idle"
  vibeMode: VibeMode
  isInSession: boolean
}

const phaseConfig = {
  inhale: { scale: 1.4, duration: 4 },
  hold: { scale: 1.4, duration: 4 },
  exhale: { scale: 1, duration: 8 },
  idle: { scale: 1.1, duration: 2 },
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
}

export function BreathingSphere({ phase, vibeMode, isInSession }: BreathingSphereProps) {
  const config = phaseConfig[phase]
  const colors = vibeColors[vibeMode]

  const sphereVariants = useMemo(
    () => ({
      animate: {
        scale: config.scale,
        transition: {
          duration: config.duration,
          ease: (phase === "hold" ? "linear" : "easeInOut") as "linear" | "easeInOut",
        },
      },
    }),
    [config.scale, config.duration, phase]
  )

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
        variants={sphereVariants}
        animate="animate"
        style={{
          background: `
            radial-gradient(circle at 30% 30%, 
              rgba(255, 255, 255, 0.15) 0%, 
              ${colors.primary} 40%, 
              ${colors.secondary} 70%, 
              transparent 100%)
          `,
          boxShadow: `
            0 0 60px rgba(${colors.glow}, 0.4),
            0 0 120px rgba(${colors.glow}, 0.2),
            inset 0 0 60px rgba(255, 255, 255, 0.1)
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
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-lg font-light tracking-[0.3em] uppercase text-foreground/60"
        >
          {phase === "idle" ? "ready" : phase}
        </motion.p>
      </motion.div>
    </div>
  )
}
