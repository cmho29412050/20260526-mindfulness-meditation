"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Home, BarChart2, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navbar() {
  const pathname = usePathname()

  const [bgmType, setBgmType] = useState<string>("silent")
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    // Create persistent audio element
    const audio = new Audio()
    audio.loop = true
    audioRef.current = audio

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
        audioRef.current = null
      }
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current)
      }
    }
  }, [])

  const selectBgm = (type: string, skipEventDispatch = false) => {
    if (!audioRef.current) return

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current)
    }

    setBgmType(type)
    if (!skipEventDispatch && typeof window !== "undefined") {
      localStorage.setItem('zenith_bgm_type', type)
      window.dispatchEvent(new Event('zenith_bgm_change'))
    }

    if (type === "silent" || type === "bowl") {
      audioRef.current.pause()
      return
    }

    const bgmSources: Record<string, string> = {
      piano: "/audio/piano-bgm.wav",
      forest: "/audio/forest.mp3",
      ocean: "/audio/ocean.wav",
      river: "/audio/river.mp3",
      rain: "/audio/rain.mp3",
    }

    const src = bgmSources[type]
    if (!src) return
    
    // Don't restart the audio if it's already playing the requested source
    if (audioRef.current.src.endsWith(src) && !audioRef.current.paused) {
      return
    }

    audioRef.current.src = src
    audioRef.current.volume = 0
    
    audioRef.current.play()
      .then(() => {
        let currentVolume = 0
        const targetVolume = 0.8 // Gentle target volume

        fadeIntervalRef.current = setInterval(() => {
          if (currentVolume < targetVolume) {
            currentVolume = Math.min(currentVolume + 0.05, targetVolume)
            if (audioRef.current) {
              audioRef.current.volume = currentVolume
            }
          } else {
            if (fadeIntervalRef.current) {
              clearInterval(fadeIntervalRef.current)
            }
          }
        }, 150)
      })
      .catch((e) => console.error("Audio play failed:", e))
  }

  // Load BGM preference on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem('zenith_bgm_type')
    if (stored) {
      setBgmType(stored)
      if (["piano", "forest", "ocean", "river", "rain"].includes(stored)) {
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
      const isPlayableLoop = stored && ["piano", "forest", "ocean", "river", "rain"].includes(stored)
      if (isPlayableLoop && audioRef.current) {
        if (isInSession && isPaused) {
          audioRef.current.pause()
        } else {
          // Play or resume if paused
          if (audioRef.current.paused) {
            audioRef.current.play().catch(err => console.error("Audio resume failed:", err))
          }
        }
      }
    }

    window.addEventListener('zenith_session_state' as any, handleSessionStateChange)
    return () => window.removeEventListener('zenith_session_state' as any, handleSessionStateChange)
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
