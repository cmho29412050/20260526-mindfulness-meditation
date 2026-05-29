"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Home, BarChart2, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

export function Navbar() {
  const pathname = usePathname()

  const [bgmType, setBgmType] = useState<string>("silent")
  const audioCtxRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const currentSrcRef = useRef<string | null>(null)
  const audioBufferCache = useRef<Record<string, AudioBuffer>>({})
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const stopBgm = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current)
      fadeIntervalRef.current = null
    }

    const source = sourceNodeRef.current
    const gainNode = gainNodeRef.current

    if (source && gainNode && audioCtxRef.current) {
      try {
        const ctx = audioCtxRef.current
        gainNode.gain.cancelScheduledValues(ctx.currentTime)
        gainNode.gain.setValueAtTime(gainNode.gain.value, ctx.currentTime)
        gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2)

        setTimeout(() => {
          try {
            source.stop()
          } catch (e) {
            // Already stopped
          }
        }, 1200)
      } catch (e) {
        try {
          source.stop()
        } catch (err) {}
      }
    }

    sourceNodeRef.current = null
    currentSrcRef.current = null
  }

  useEffect(() => {
    return () => {
      stopBgm()
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch((e) => console.error("AudioContext close failed:", e))
        audioCtxRef.current = null
      }
    }
  }, [])

  const selectBgm = (type: string, skipEventDispatch = false) => {
    stopBgm()

    setBgmType(type)
    if (!skipEventDispatch && typeof window !== "undefined") {
      localStorage.setItem('zenith_bgm_type', type)
      window.dispatchEvent(new Event('zenith_bgm_change'))
    }

    if (type === "silent" || type === "bowl") {
      return
    }

    const bgmSources: Record<string, string> = {
      guide: `${basePath}/audio/piano-bgm.wav`,
      forest: `${basePath}/audio/forest.mp3`,
      ocean: `${basePath}/audio/ocean.wav`,
      river: `${basePath}/audio/river.mp3`,
      rain: `${basePath}/audio/rain.mp3`,
    }

    const src = bgmSources[type]
    if (!src) return
    currentSrcRef.current = src

    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    const ctx = audioCtxRef.current
    if (ctx.state === "suspended") {
      ctx.resume()
    }

    const playBuffer = (buffer: AudioBuffer, targetSrc: string) => {
      if (currentSrcRef.current !== targetSrc) return

      stopBgm()

      if (!gainNodeRef.current) {
        gainNodeRef.current = ctx.createGain()
        gainNodeRef.current.connect(ctx.destination)
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true
      source.connect(gainNodeRef.current)

      const bgmVolumes: Record<string, number> = {
        guide: 0.15,  // Very soft piano volume under voice guide
        forest: 0.6,
        ocean: 0.7,
        river: 0.6,
        rain: 0.6,
      }
      const targetVolume = bgmVolumes[type] || 0.8
      gainNodeRef.current.gain.setValueAtTime(0, ctx.currentTime)
      gainNodeRef.current.gain.linearRampToValueAtTime(targetVolume, ctx.currentTime + 1.5)

      source.start(0)
      sourceNodeRef.current = source
      currentSrcRef.current = targetSrc
    }

    if (audioBufferCache.current[src]) {
      playBuffer(audioBufferCache.current[src], src)
    } else {
      fetch(src)
        .then((res) => res.arrayBuffer())
        .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
        .then((decodedBuffer) => {
          audioBufferCache.current[src] = decodedBuffer
          playBuffer(decodedBuffer, src)
        })
        .catch((e) => console.error("Web Audio playback failed:", e))
    }
  }

  // Load BGM preference on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem('zenith_bgm_type')
    if (stored) {
      setBgmType(stored)
      if (["guide", "forest", "ocean", "river", "rain"].includes(stored)) {
        setTimeout(() => {
          selectBgm(stored)
        }, 1000)
      }
    }
  }, [])

  // Listen for background music changes from other components
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleExternalBgmChange = () => {
      const stored = localStorage.getItem('zenith_bgm_type')
      if (stored && stored !== bgmType) {
        selectBgm(stored, true)
      }
    }

    window.addEventListener('zenith_bgm_change', handleExternalBgmChange)
    return () => window.removeEventListener('zenith_bgm_change', handleExternalBgmChange)
  }, [bgmType])

  // Listen for session state changes to pause/resume background music
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleSessionStateChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ isInSession: boolean; isPaused: boolean }>
      const { isInSession, isPaused } = customEvent.detail
      
      const stored = localStorage.getItem('zenith_bgm_type')
      const isPlayableLoop = stored && ["guide", "forest", "ocean", "river", "rain"].includes(stored)
      
      if (isPlayableLoop) {
        if (!isInSession) {
          stopBgm()
        } else if (isPaused) {
          if (audioCtxRef.current && audioCtxRef.current.state === "running") {
            audioCtxRef.current.suspend().catch((err) => console.error("Audio suspend failed:", err))
          }
        } else {
          if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
            audioCtxRef.current.resume().catch((err) => console.error("Audio resume failed:", err))
          } else if (!sourceNodeRef.current && stored) {
            selectBgm(stored, true)
          }
        }
      }
    }

    window.addEventListener('zenith_session_state' as any, handleSessionStateChange)
    return () => window.removeEventListener('zenith_session_state' as any, handleSessionStateChange)
  }, [])

  // Scheduler for daily reminder notifications
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return

    let lastNotifiedDate = ""

    const checkReminder = () => {
      const enabled = localStorage.getItem("zenith_daily_reminder_enabled") === "true"
      if (!enabled) return

      const targetTime = localStorage.getItem("zenith_daily_reminder_time") || "21:00"
      const now = new Date()
      const currentHourMin = now.toTimeString().slice(0, 5) // "HH:MM"
      const currentDateString = now.toDateString()

      if (currentHourMin === targetTime && lastNotifiedDate !== currentDateString) {
        if (Notification.permission === "granted") {
          new Notification("老何的正念冥想", {
            body: "時間到了，來進行一段放鬆的正念冥想吧！",
            icon: `${basePath}/icon.svg`
          })
          lastNotifiedDate = currentDateString
        }
      }
    }

    // Check immediately and then every 30 seconds
    checkReminder()
    const interval = setInterval(checkReminder, 30000)
    return () => clearInterval(interval)
  }, [])

  const navItems = [
    { id: "home", href: "/", icon: Home, label: "主頁" },
    { id: "dashboard", href: "/dashboard", icon: BarChart2, label: "儀表板" },
    { id: "profile", href: "/profile", icon: User, label: "個人檔案" },
  ]

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      {/* Main Bar */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex items-center gap-2 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
      >
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`relative flex items-center justify-center p-3 sm:p-4 rounded-full transition-all duration-300 group ${
              pathname === item.href ? "text-white" : "text-white/50 hover:text-white/80"
            }`}
            aria-label={item.label}
          >
            {pathname === item.href && (
              <motion.div
                layoutId="active-nav-pill"
                className="absolute inset-0 bg-white/20 rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            <item.icon className="w-5 h-5 relative z-10" />
          </Link>
        ))}
      </motion.div>
    </div>
  )
}
