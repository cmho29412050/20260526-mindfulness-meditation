"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { ParticleBackground } from "@/components/particle-background"
import { MindfulTimer } from "@/components/mindful-timer"
import { DmnInsightDialog } from "@/components/dmn-insight-dialog"
import { PostMoodAssessment } from "@/components/post-mood-assessment"
import { SessionSetup } from "@/components/session-setup"
import { SessionControls } from "@/components/session-controls"
import { saveSession } from "@/lib/storage"

type VibeMode = "focus" | "stress" | "sleep" | "home"

export default function MeditationApp() {
  const [vibeMode, setVibeMode] = useState<VibeMode>("focus")
  const [isInSession, setIsInSession] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [sessionDuration, setSessionDuration] = useState(15 * 60)
  const [timeRemaining, setTimeRemaining] = useState(15 * 60)
  const [showDmnInsight, setShowDmnInsight] = useState(false)
  const [showPostMoodAssessment, setShowPostMoodAssessment] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [bgmType, setBgmType] = useState<string>("silent")

  // Sync BGM preference
  useEffect(() => {
    if (typeof window === "undefined") return
    const handleBgmChange = () => {
      setBgmType(localStorage.getItem('zenith_bgm_type') || "silent")
    }
    handleBgmChange()
    window.addEventListener('zenith_bgm_change', handleBgmChange)
    return () => window.removeEventListener('zenith_bgm_change', handleBgmChange)
  }, [])

  const selectBgm = (type: string) => {
    setBgmType(type)
    if (typeof window !== "undefined") {
      localStorage.setItem('zenith_bgm_type', type)
      window.dispatchEvent(new Event('zenith_bgm_change'))
    }
  }
 
  // Dispatch session state changes to control BGM audio playback (e.g. pause BGM when meditation is paused)
  useEffect(() => {
    if (typeof window === "undefined") return
    const event = new CustomEvent("zenith_session_state", {
      detail: { isInSession, isPaused }
    })
    window.dispatchEvent(event)
  }, [isInSession, isPaused])

  // Play singing bowl chime helper (louder volume using dual instances)
  const playBowlChime = useCallback((count: number = 1) => {
    let playCount = 0
    const playNext = () => {
      if (playCount >= count) return
      // 播放兩個重疊的音訊實體以增大音量
      const audio1 = new Audio("/audio/bowl.mp3")
      audio1.volume = 1.0
      audio1.play().catch(e => console.error("Bowl chime play failed:", e))

      const audio2 = new Audio("/audio/bowl.mp3")
      audio2.volume = 1.0
      audio2.play().catch(e => console.error("Bowl chime play failed:", e))

      playCount++
      if (playCount < count) {
        setTimeout(playNext, 4000)
      }
    }
    playNext()
  }, [])

  // Start of session chime trigger
  useEffect(() => {
    if (isInSession && bgmType === "bowl") {
      playBowlChime(1)
    }
  }, [isInSession, bgmType, playBowlChime])

  // Timer countdown and interval chime trigger
  useEffect(() => {
    if (!isInSession || isPaused) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsInSession(false)
          setShowPostMoodAssessment(true)
          
          if (bgmType === "bowl") {
            playBowlChime(3)
          }

          saveSession({
            durationMinutes: Math.max(1, Math.round(sessionDuration / 60))
          })
          
          return sessionDuration
        }

        const nextTime = prev - 1
        const elapsed = sessionDuration - nextTime
        
        // Strike the bowl once every 20 seconds interval
        if (elapsed > 0 && elapsed % 20 === 0 && nextTime > 0) {
          if (bgmType === "bowl") {
            playBowlChime(1)
          }
        }

        return nextTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isInSession, isPaused, sessionDuration, bgmType, playBowlChime])

  // Hide controls on inactivity during session
  useEffect(() => {
    if (!isInSession) {
      setControlsVisible(true)
      return
    }

    let timeoutId: NodeJS.Timeout

    const handleInteraction = () => {
      setControlsVisible(true)
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setControlsVisible(false)
      }, 3000)
    }

    timeoutId = setTimeout(() => {
      setControlsVisible(false)
    }, 3000)

    window.addEventListener("mousemove", handleInteraction)
    window.addEventListener("touchstart", handleInteraction)
    window.addEventListener("keydown", handleInteraction)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener("mousemove", handleInteraction)
      window.removeEventListener("touchstart", handleInteraction)
      window.removeEventListener("keydown", handleInteraction)
    }
  }, [isInSession])

  const handleScreenClick = useCallback(() => {
    if (isInSession) {
      setIsPaused((prev) => !prev)
    }
  }, [isInSession])

  const startMeditation = (duration: number) => {
    setSessionDuration(duration)
    setTimeRemaining(duration)
    setIsInSession(true)
    setIsPaused(false)
  }

  return (
    <main 
      className="relative min-h-screen overflow-hidden cursor-pointer"
      onClick={handleScreenClick}
    >
      {/* Background Image with Smooth Crossfade */}
      <div
        className="fixed inset-0 transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${
            vibeMode === "focus"
              ? "/images/mountain.png"
              : vibeMode === "stress"
              ? "/images/beach.png"
              : vibeMode === "sleep"
              ? "/images/forest.png"
              : "/images/home.png"
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
        aria-hidden="true"
      />
      {/* Dark overlay to ensure text readability */}
      <div className="fixed inset-0 bg-black/45 backdrop-blur-[2px]" aria-hidden="true" />

      {/* Subtle radial gradient overlay */}
      <div
        className="fixed inset-0 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(176, 224, 230, 0.05) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Particle background */}
      <ParticleBackground isInSession={isInSession} />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-between pt-16 pb-28 px-4">
        {/* Branding Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isInSession ? 0.05 : 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-center z-20 pointer-events-none select-none"
        >
          <h1 className="text-2xl sm:text-3xl font-extralight tracking-[0.25em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
            老何的正念冥想
          </h1>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-white/50 mt-2 font-light">
            Mindfulness Meditation App
          </p>
        </motion.div>

        {/* Active Session Content */}
        {isInSession && (
          <div className="flex flex-col items-center justify-center my-auto gap-8 pointer-events-none select-none">
            {/* Breathing Guide gently pulsing */}
            <motion.div
              animate={{
                opacity: isPaused ? 0.3 : [0.4, 0.8, 0.4],
                scale: isPaused ? 0.98 : [0.98, 1.02, 0.98],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-center"
            >
              <h2 
                className="text-2xl md:text-3xl font-light tracking-[0.15em] text-slate-100 text-center px-4"
                style={{
                  textShadow: vibeMode === "focus" 
                    ? "0 0 30px rgba(125,211,252,0.25)" 
                    : vibeMode === "stress" 
                    ? "0 0 30px rgba(253,186,116,0.25)" 
                    : "0 0 30px rgba(165,180,252,0.25)"
                }}
              >
                正常呼吸，專注數息
              </h2>
            </motion.div>

            {/* Central Timer */}
            <MindfulTimer
              timeRemaining={timeRemaining}
              totalTime={sessionDuration}
              isVisible={true}
            />

            <AnimatePresence>
              {isPaused && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="text-sm tracking-[0.25em] text-white/50 font-light"
                >
                  已暫停
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Settings pane or session control panel */}
        <AnimatePresence mode="wait">
          {!isInSession ? (
            <SessionSetup
              key="setup"
              vibeMode={vibeMode}
              onVibeChange={setVibeMode}
              sessionDuration={sessionDuration}
              onDurationChange={(dur) => {
                setSessionDuration(dur)
                setTimeRemaining(dur)
              }}
              bgmType={bgmType}
              onBgmChange={selectBgm}
              onStartSession={() => startMeditation(sessionDuration)}
            />
          ) : (
            <motion.div
              key="controls"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: controlsVisible ? 1 : 0, y: controlsVisible ? 0 : 20 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="z-20 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <SessionControls
                isInSession={isInSession}
                isPaused={isPaused}
                onStart={() => setIsInSession(true)}
                onPause={() => setIsPaused((p) => !p)}
                onReset={() => {
                  setTimeRemaining(sessionDuration)
                  setIsPaused(true)
                }}
                isVisible={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <PostMoodAssessment
        isOpen={showPostMoodAssessment}
        onClose={() => {
          setShowPostMoodAssessment(false)
          setShowDmnInsight(true)
        }}
        onComplete={() => {
          setShowPostMoodAssessment(false)
          setShowDmnInsight(true)
        }}
      />
      <DmnInsightDialog open={showDmnInsight} onOpenChange={setShowDmnInsight} />
    </main>
  )
}
