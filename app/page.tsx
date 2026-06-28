"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

import { ParticleBackground } from "@/components/particle-background"
import { MindfulTimer } from "@/components/mindful-timer"
import { DmnInsightDialog } from "@/components/dmn-insight-dialog"
import { PostMoodAssessment } from "@/components/post-mood-assessment"
import { SessionSetup } from "@/components/session-setup"
import { SessionControls } from "@/components/session-controls"
import { PreMoodAssessment } from "@/components/pre-mood-assessment"
import { BreathingSphere } from "@/components/breathing-sphere"
import { BeginnerGuideDialog } from "@/components/beginner-guide-dialog"
import { saveSession, updateLastSessionMoodAfter } from "@/lib/storage"
import { getCustomImage } from "@/lib/db"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

type VibeMode = "focus" | "stress" | "sleep" | "home" | "starry_sky" | "stream" | "zen_hall" | "snow_mountain" | "custom"

const GUIDE_MESSAGES = [
  "深吸一口氣，感受腹部的起伏。緩緩吐氣，放鬆全身。",
  "如果發現大腦開始胡思亂想，沒有關係，溫柔地把注意力帶回呼吸。",
  "保持自然的呼吸，專注於當下的這一刻，不作任何評判。",
  "吸氣時知道自己在吸氣，呼氣時知道自己在呼氣。",
  "感覺雙肩漸漸放鬆，面部肌肉完全舒展，享受此刻的寧靜。"
]

const getBreathingPhase = (elapsedSeconds: number, rhythm: string): {
  phase: "inhale" | "hold" | "exhale" | "hold_out" | "idle"
  duration: number
} => {
  if (rhythm === "natural") {
    // Total cycle is 5s inhale + 5s exhale = 10s
    const cycleTime = elapsedSeconds % 10
    if (cycleTime < 5) {
      return { phase: "inhale", duration: 5 }
    } else {
      return { phase: "exhale", duration: 5 }
    }
  } else if (rhythm === "4-7-8") {
    const cycleTime = elapsedSeconds % 19
    if (cycleTime < 4) {
      return { phase: "inhale", duration: 4 }
    } else if (cycleTime < 11) {
      return { phase: "hold", duration: 7 }
    } else {
      return { phase: "exhale", duration: 8 }
    }
  } else if (rhythm === "4-4-4-4") {
    const cycleTime = elapsedSeconds % 16
    if (cycleTime < 4) {
      return { phase: "inhale", duration: 4 }
    } else if (cycleTime < 8) {
      return { phase: "hold", duration: 4 }
    } else if (cycleTime < 12) {
      return { phase: "exhale", duration: 4 }
    } else {
      return { phase: "hold_out", duration: 4 }
    }
  } else {
    const cycleTime = elapsedSeconds % 16
    if (cycleTime < 4) {
      return { phase: "inhale", duration: 4 }
    } else if (cycleTime < 8) {
      return { phase: "hold", duration: 4 }
    } else {
      return { phase: "exhale", duration: 8 }
    }
  }
}

const getPhaseInstruction = (phase: string, rhythm: string) => {
  if (rhythm === "natural") {
    if (phase === "inhale") return "順應自然，緩緩吸氣"
    if (phase === "exhale") return "順應自然，緩緩吐氣"
  }
  switch (phase) {
    case "inhale":
      return "緩緩吸氣，感受身體的充盈"
    case "hold":
      return "屏息凝神，感受當下的平靜"
    case "exhale":
      return "緩緩吐氣，釋放所有壓力"
    case "hold_out":
      return "屏息靜心，體驗空無的寧靜"
    default:
      return "放鬆身心，準備開始"
  }
}

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
  const [showPreMoodAssessment, setShowPreMoodAssessment] = useState(false)
  const [showBeginnerGuide, setShowBeginnerGuide] = useState(false)
  const [moodBefore, setMoodBefore] = useState<string | null>(null)
  const [breathingRhythm, setBreathingRhythm] = useState<string>("natural")
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null)

  // Load custom image from IndexedDB
  useEffect(() => {
    const loadCustomImage = async () => {
      try {
        const imgData = await getCustomImage()
        if (imgData && imgData.blob) {
          setCustomImageUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev)
            return URL.createObjectURL(imgData.blob)
          })
        }
      } catch (e) {
        console.error("Load custom image error", e)
      }
    }
    loadCustomImage()

    const handleImageChange = () => {
      loadCustomImage()
    }
    window.addEventListener("zenith_custom_image_change", handleImageChange)
    return () => {
      window.removeEventListener("zenith_custom_image_change", handleImageChange)
    }
  }, [])

  // Clean up Object URL
  useEffect(() => {
    return () => {
      if (customImageUrl) {
        URL.revokeObjectURL(customImageUrl)
      }
    }
  }, [customImageUrl])

  // Load breathing rhythm preference on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setBreathingRhythm(localStorage.getItem("zenith_breathing_rhythm") || "natural")
    }
  }, [])

  const selectRhythm = (rhythm: string) => {
    setBreathingRhythm(rhythm)
    if (typeof window !== "undefined") {
      localStorage.setItem("zenith_breathing_rhythm", rhythm)
    }
  }

  const elapsedSeconds = sessionDuration === 0 ? timeRemaining : (sessionDuration - timeRemaining)
  const { phase: currentPhase, duration: phaseDuration } = (!isInSession || isPaused)
    ? { phase: "idle" as const, duration: 2 }
    : getBreathingPhase(elapsedSeconds, breathingRhythm)

  const instructionText = getPhaseInstruction(currentPhase, breathingRhythm)

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

  // Play singing bowl chime using Web Audio API via Navbar (bypasses mobile browser autoplay blocks)
  const playBowlChime = useCallback((count: number = 1) => {
    if (typeof window !== "undefined") {
      const event = new CustomEvent("zenith_play_audio", {
        detail: { type: "bowl", count }
      })
      window.dispatchEvent(event)
    }
  }, [])

  const speakGuidance = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "zh-TW"

    // 篩選最自然的中文合成語音 (Edge/Chrome 通常有較自然的 Microsoft/Google 線上高清人聲)
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(
        (v) =>
          v.lang.includes("zh-TW") &&
          (v.name.includes("Microsoft") || v.name.includes("Google") || v.name.includes("Yating") || v.name.includes("Yaoyao"))
      ) || voices.find((v) => v.lang.includes("zh-TW"))
        || voices.find((v) => v.lang.includes("zh-CN"))

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }
    }

    utterance.rate = 0.80 // 沉靜且自然的緩慢速度，消除因過慢產生的機械碎音與拉伸顫音
    utterance.pitch = 0.95 // 溫和且穩重的語調
    utterance.volume = 0.85 // 合適音量
    window.speechSynthesis.speak(utterance)
  }, [])

  // Cancel guidance speech on pause/stop
  useEffect(() => {
    if ((isPaused || !isInSession) && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }
  }, [isPaused, isInSession])

  // Start of session chime/guidance trigger
  useEffect(() => {
    if (isInSession) {
      if (bgmType === "bowl" || bgmType === "guide") {
        playBowlChime(1)
      }
    }
  }, [isInSession, bgmType, playBowlChime])

  // Timer countdown/count-up and interval chime trigger
  useEffect(() => {
    if (!isInSession || isPaused) return

    const isInfinite = sessionDuration === 0

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (isInfinite) {
          const nextTime = prev + 1
          
          // Strike the bowl once every 30 seconds interval
          if (nextTime > 0) {
            if (nextTime % 30 === 0 && (bgmType === "bowl" || bgmType === "guide")) {
              playBowlChime(1)
            }
          }
          return nextTime
        } else {
          if (prev <= 1) {
            setIsInSession(false)
            setShowPostMoodAssessment(true)
            
            // 播放頌缽磬音提醒結束
            playBowlChime(3)

            // 發送桌面通知（若已獲得權限）
            if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
              new Notification("老何的正念冥想", {
                body: "您的正念冥想課程已圓滿結束。🙏",
                icon: `${basePath}/icon.svg`
              })
            }

            saveSession({
              durationMinutes: Math.max(1, Math.round(sessionDuration / 60)),
              vibeMode: vibeMode,
              moodBefore: moodBefore || undefined
            })
            
            return sessionDuration
          }

          const nextTime = prev - 1
          const elapsed = sessionDuration - nextTime
          
          // Strike the bowl once every 30 seconds interval
          if (elapsed > 0 && nextTime > 0) {
            if (elapsed % 30 === 0 && (bgmType === "bowl" || bgmType === "guide")) {
              playBowlChime(1)
            }
          }

          return nextTime
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isInSession, isPaused, sessionDuration, bgmType, playBowlChime, moodBefore])

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

  const unlockWebAudioAndSpeech = () => {
    if (typeof window === "undefined") return
    
    // Dispatch event to unlock AudioContext in Navbar
    window.dispatchEvent(new Event("zenith_audio_unlock"))
    
    // Unlock SpeechSynthesis on iOS Safari
    if ("speechSynthesis" in window) {
      try {
        const utterance = new SpeechSynthesisUtterance("")
        utterance.volume = 0
        window.speechSynthesis.speak(utterance)
      } catch (e) {
        console.error("SpeechSynthesis silent play failed:", e)
      }
    }
  }

  const startMeditation = (duration: number) => {
    unlockWebAudioAndSpeech()
    setSessionDuration(duration)
    setTimeRemaining(duration === 0 ? 0 : duration)
    setIsInSession(true)
    setIsPaused(false)
  }

  const applyRecommendation = (duration: number, vibe: VibeMode, moodBeforeId: string, autoStart: boolean) => {
    unlockWebAudioAndSpeech()
    setSessionDuration(duration)
    setTimeRemaining(duration === 0 ? 0 : duration)
    setVibeMode(vibe)
    setMoodBefore(moodBeforeId)
    setShowPreMoodAssessment(false)
    selectBgm("piano")

    if (autoStart) {
      setIsInSession(true)
      setIsPaused(false)
    }
  }

  const applyBeginnerRecommendation = (duration: number, vibe: VibeMode, moodBeforeId: string, autoStart: boolean) => {
    unlockWebAudioAndSpeech()
    setSessionDuration(duration)
    setTimeRemaining(duration === 0 ? 0 : duration)
    setVibeMode(vibe)
    setMoodBefore(moodBeforeId)
    setShowBeginnerGuide(false)
    selectBgm("bowl")

    if (autoStart) {
      setIsInSession(true)
      setIsPaused(false)
    }
  }

  const endSessionEarly = useCallback(() => {
    setIsInSession(false)
    setShowPostMoodAssessment(true)

    const elapsedSeconds = sessionDuration === 0 ? timeRemaining : (sessionDuration - timeRemaining)
    saveSession({
      durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
      vibeMode: vibeMode,
      moodBefore: moodBefore || undefined
    })
  }, [sessionDuration, timeRemaining, vibeMode, moodBefore])

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
              ? `${basePath}/images/mountain.png`
              : vibeMode === "stress"
              ? `${basePath}/images/beach.png`
              : vibeMode === "sleep"
              ? `${basePath}/images/forest.png`
              : vibeMode === "custom" && customImageUrl
              ? customImageUrl
              : vibeMode === "starry_sky"
              ? `${basePath}/images/starry_sky.png`
              : vibeMode === "stream"
              ? `${basePath}/images/stream.png`
              : vibeMode === "zen_hall"
              ? `${basePath}/images/zen_hall.png`
              : vibeMode === "snow_mountain"
              ? `${basePath}/images/snow_mountain.png`
              : `${basePath}/images/home.png`
          })`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
        aria-hidden="true"
      />
      {/* Dark overlay to ensure text readability */}
      <div className="fixed inset-0 bg-black/15 backdrop-blur-[2px]" aria-hidden="true" />

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
      <ParticleBackground isInSession={isInSession} vibeMode={vibeMode} />

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
          <div className="flex flex-col items-center justify-center my-auto gap-12 pointer-events-none select-none">
            {/* Breathing Guide text */}
            <motion.div
              key={instructionText}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isPaused ? 0.4 : 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h2 
                className="text-xl md:text-2xl font-light tracking-[0.15em] text-slate-100 text-center px-4 transition-all duration-300"
                style={{
                  textShadow: vibeMode === "focus" 
                    ? "0 0 30px rgba(125,211,252,0.25)" 
                    : vibeMode === "stress" 
                    ? "0 0 30px rgba(253,186,116,0.25)" 
                    : "0 0 30px rgba(165,180,252,0.25)"
                }}
              >
                {instructionText}
              </h2>
            </motion.div>

            {/* Central Breathing Sphere */}
            <div className="my-4">
              <BreathingSphere
                phase={currentPhase}
                vibeMode={vibeMode}
                isInSession={isInSession}
                duration={phaseDuration}
              />
            </div>

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
                setTimeRemaining(dur === 0 ? 0 : dur)
              }}
              bgmType={bgmType}
              onBgmChange={selectBgm}
              onStartSession={() => startMeditation(sessionDuration)}
              onOpenAssessment={() => setShowPreMoodAssessment(true)}
              onOpenBeginnerGuide={() => setShowBeginnerGuide(true)}
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
                onStart={() => {
                  unlockWebAudioAndSpeech()
                  setIsInSession(true)
                }}
                onPause={() => {
                  setIsPaused((p) => {
                    const nextPaused = !p
                    if (!nextPaused) {
                      unlockWebAudioAndSpeech()
                    }
                    return nextPaused
                  })
                }}
                onReset={() => {
                  setTimeRemaining(sessionDuration === 0 ? 0 : sessionDuration)
                  setIsPaused(true)
                }}
                onEndSession={endSessionEarly}
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
          setMoodBefore(null)
        }}
        onComplete={(moodId, stateImprovement, journalNote) => {
          setShowPostMoodAssessment(false)
          setShowDmnInsight(true)
          if (moodId) {
            updateLastSessionMoodAfter(moodId, stateImprovement, journalNote)
          }
          setMoodBefore(null)
        }}
        moodBefore={moodBefore}
      />
      <PreMoodAssessment
        isOpen={showPreMoodAssessment}
        onClose={() => setShowPreMoodAssessment(false)}
        onApply={applyRecommendation}
      />
      <BeginnerGuideDialog
        isOpen={showBeginnerGuide}
        onClose={() => setShowBeginnerGuide(false)}
        onApply={applyBeginnerRecommendation}
      />
      <DmnInsightDialog open={showDmnInsight} onOpenChange={setShowDmnInsight} />
    </main>
  )
}
