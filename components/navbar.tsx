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
  const primarySourceNodeRef = useRef<AudioBufferSourceNode | null>(null)
  const primaryGainNodeRef = useRef<GainNode | null>(null)
  const ambientNodesRef = useRef<Record<string, { source: AudioBufferSourceNode; gain: GainNode }>>({})
  const ambientLoadingRef = useRef<Record<string, boolean>>({})
  const currentSrcRef = useRef<string | null>(null)
  const audioBufferCache = useRef<Record<string, AudioBuffer>>({})
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const customObjectURLRef = useRef<string | null>(null)

  const isInSessionRef = useRef(false)
  const isPausedRef = useRef(false)

  const stopPrimaryBgm = () => {
    const source = primarySourceNodeRef.current
    const gainNode = primaryGainNodeRef.current

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

    primarySourceNodeRef.current = null
    currentSrcRef.current = null
  }

  const stopAmbientSound = (type: string) => {
    const node = ambientNodesRef.current[type]
    if (node) {
      const { source, gain } = node
      if (audioCtxRef.current) {
        try {
          const ctx = audioCtxRef.current
          gain.gain.cancelScheduledValues(ctx.currentTime)
          gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime)
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0)
          setTimeout(() => {
            try {
              source.stop()
            } catch (e) {}
          }, 1000)
        } catch (e) {
          try {
            source.stop()
          } catch (err) {}
        }
      } else {
        try {
          source.stop()
        } catch (e) {}
      }
      delete ambientNodesRef.current[type]
    }
  }

  const stopBgm = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current)
      fadeIntervalRef.current = null
    }

    stopPrimaryBgm()

    // Stop all ambient channels
    Object.keys(ambientNodesRef.current).forEach((type) => {
      stopAmbientSound(type)
    })

    if (customObjectURLRef.current) {
      URL.revokeObjectURL(customObjectURLRef.current)
      customObjectURLRef.current = null
    }
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

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    const ctx = audioCtxRef.current
    if (ctx.state === "suspended" && !isPausedRef.current && isInSessionRef.current) {
      ctx.resume()
    }
    return ctx
  }

  const playPrimaryBgm = (src: string, type: string) => {
    currentSrcRef.current = src
    const ctx = getAudioContext()

    const playBuffer = (buffer: AudioBuffer, targetSrc: string) => {
      if (currentSrcRef.current !== targetSrc) return
      if (!isInSessionRef.current) return

      stopPrimaryBgm()

      if (!primaryGainNodeRef.current) {
        primaryGainNodeRef.current = ctx.createGain()
        primaryGainNodeRef.current.connect(ctx.destination)
      }

      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true
      source.connect(primaryGainNodeRef.current)

      const bgmVolumes: Record<string, number> = {
        guide: 0.15,
        piano: 0.6,
        custom: 0.6,
      }
      const storedVol = typeof window !== "undefined"
        ? parseFloat(localStorage.getItem("zenith_bgm_volume") || "60") / 100
        : 0.6
      const targetVolume = (bgmVolumes[type] || 0.6) * storedVol

      primaryGainNodeRef.current.gain.setValueAtTime(0, ctx.currentTime)
      primaryGainNodeRef.current.gain.linearRampToValueAtTime(targetVolume, ctx.currentTime + 1.5)

      source.start(0)
      primarySourceNodeRef.current = source
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
        .catch((e) => console.error("Primary Audio playback failed:", e))
    }
  }

  const playAmbientSound = (type: string) => {
    const bgmSources: Record<string, string> = {
      forest: `${basePath}/audio/forest.mp3`,
      ocean: `${basePath}/audio/ocean.mp3`,
      river: `${basePath}/audio/river.mp3`,
      rain: `${basePath}/audio/rain.mp3`,
    }

    const src = bgmSources[type]
    if (!src) return

    if (ambientLoadingRef.current[type] || ambientNodesRef.current[type]) {
      return
    }
    ambientLoadingRef.current[type] = true

    const ctx = getAudioContext()

    const playBuffer = (buffer: AudioBuffer) => {
      ambientLoadingRef.current[type] = false
      if (!isInSessionRef.current) return

      const isStillEnabled = localStorage.getItem(`zenith_ambient_${type}_enabled`) === "true"
      if (!isStillEnabled) return

      if (ambientNodesRef.current[type]) {
        try {
          ambientNodesRef.current[type].source.stop()
        } catch (e) {}
      }

      const gainNode = ctx.createGain()
      gainNode.connect(ctx.destination)

      const source = ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true
      source.connect(gainNode)

      const ambientBaseVolumes: Record<string, number> = {
        forest: 0.6,
        ocean: 0.7,
        river: 0.6,
        rain: 0.6,
      }
      const storedVol = typeof window !== "undefined"
        ? parseFloat(localStorage.getItem(`zenith_ambient_${type}_volume`) || "40") / 100
        : 0.4
      const targetVolume = (ambientBaseVolumes[type] || 0.6) * storedVol

      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(targetVolume, ctx.currentTime + 1.5)

      source.start(0)
      ambientNodesRef.current[type] = { source, gain: gainNode }
    }

    if (audioBufferCache.current[src]) {
      playBuffer(audioBufferCache.current[src])
    } else {
      fetch(src)
        .then((res) => res.arrayBuffer())
        .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
        .then((decodedBuffer) => {
          audioBufferCache.current[src] = decodedBuffer
          playBuffer(decodedBuffer)
        })
        .catch((e) => {
          console.error(`Ambient Audio (${type}) playback failed:`, e)
          ambientLoadingRef.current[type] = false
        })
    }
  }

  const playBowlWebAudio = (count: number = 1) => {
    const ctx = getAudioContext()
    if (!ctx) return

    const src = `${basePath}/audio/bowl.mp3`
    
    const playNext = (currentCount: number) => {
      if (currentCount >= count) return
      
      const playBuffer = (buffer: AudioBuffer) => {
        // Create dual sources for louder volume, just like the original HTML5 Audio implementation!
        for (let i = 0; i < 2; i++) {
          const source = ctx.createBufferSource()
          source.buffer = buffer
          
          const gainNode = ctx.createGain()
          gainNode.gain.setValueAtTime(1.0, ctx.currentTime)
          
          source.connect(gainNode)
          gainNode.connect(ctx.destination)
          
          if ('preservesPitch' in source) {
            (source as any).preservesPitch = false
          }
          source.playbackRate.value = 0.74
          
          source.start(0)
        }

        if (currentCount + 1 < count) {
          setTimeout(() => playNext(currentCount + 1), 4000)
        }
      }

      if (audioBufferCache.current[src]) {
        playBuffer(audioBufferCache.current[src])
      } else {
        fetch(src)
          .then((res) => res.arrayBuffer())
          .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
          .then((decodedBuffer) => {
            audioBufferCache.current[src] = decodedBuffer
            playBuffer(decodedBuffer)
          })
          .catch((e) => console.error("Bowl chime Web Audio failed:", e))
      }
    }

    playNext(0)
  }

  const syncAudioChannels = () => {
    if (typeof window === "undefined") return

    const active = isInSessionRef.current
    if (!active) {
      stopBgm()
      return
    }

    const storedBgmType = localStorage.getItem('zenith_bgm_type') || "silent"
    const storedBgmVol = parseFloat(localStorage.getItem("zenith_bgm_volume") || "60") / 100

    // 1. Sync Primary BGM
    if (["guide", "piano", "custom"].includes(storedBgmType)) {
      if (storedBgmType === "custom") {
        import("@/lib/db").then(({ getCustomAudio }) => {
          getCustomAudio().then((customAudio) => {
            if (!customAudio) {
              console.error("No custom audio found in IndexedDB")
              return
            }
            if (customObjectURLRef.current) {
              if (primarySourceNodeRef.current && primaryGainNodeRef.current && audioCtxRef.current) {
                const ctx = audioCtxRef.current
                const targetVolume = 0.6 * storedBgmVol
                primaryGainNodeRef.current.gain.cancelScheduledValues(ctx.currentTime)
                primaryGainNodeRef.current.gain.setValueAtTime(primaryGainNodeRef.current.gain.value, ctx.currentTime)
                primaryGainNodeRef.current.gain.linearRampToValueAtTime(targetVolume, ctx.currentTime + 0.3)
              } else {
                playPrimaryBgm(customObjectURLRef.current, "custom")
              }
            } else {
              const customUrl = URL.createObjectURL(customAudio.blob)
              customObjectURLRef.current = customUrl
              playPrimaryBgm(customUrl, "custom")
            }
          }).catch((err) => console.error("Error reading custom audio from IndexedDB:", err))
        })
      } else {
        const src = `${basePath}/audio/piano-bgm.wav`
        if (primarySourceNodeRef.current && primaryGainNodeRef.current && audioCtxRef.current && currentSrcRef.current === src) {
          const ctx = audioCtxRef.current
          const baseVol = storedBgmType === "guide" ? 0.15 : 0.6
          const targetVolume = baseVol * storedBgmVol
          primaryGainNodeRef.current.gain.cancelScheduledValues(ctx.currentTime)
          primaryGainNodeRef.current.gain.setValueAtTime(primaryGainNodeRef.current.gain.value, ctx.currentTime)
          primaryGainNodeRef.current.gain.linearRampToValueAtTime(targetVolume, ctx.currentTime + 0.3)
        } else {
          playPrimaryBgm(src, storedBgmType)
        }
      }
    } else {
      stopPrimaryBgm()
    }

    // 2. Sync Ambient Channels
    const ambientTypes = ["forest", "ocean", "river", "rain"]
    ambientTypes.forEach((type) => {
      const enabled = localStorage.getItem(`zenith_ambient_${type}_enabled`) === "true"
      const storedVol = parseFloat(localStorage.getItem(`zenith_ambient_${type}_volume`) || "40") / 100

      if (enabled) {
        const node = ambientNodesRef.current[type]
        if (node) {
          if (audioCtxRef.current) {
            const ctx = audioCtxRef.current
            const ambientBaseVolumes: Record<string, number> = {
              forest: 0.6,
              ocean: 0.7,
              river: 0.6,
              rain: 0.6,
            }
            const targetVolume = (ambientBaseVolumes[type] || 0.6) * storedVol
            node.gain.gain.cancelScheduledValues(ctx.currentTime)
            node.gain.gain.setValueAtTime(node.gain.gain.value, ctx.currentTime)
            node.gain.gain.linearRampToValueAtTime(targetVolume, ctx.currentTime + 0.3)
          }
        } else {
          playAmbientSound(type)
        }
      } else {
        stopAmbientSound(type)
      }
    })
  }

  const selectBgm = (type: string, skipEventDispatch = false) => {
    setBgmType(type)
    if (!skipEventDispatch && typeof window !== "undefined") {
      localStorage.setItem('zenith_bgm_type', type)
      window.dispatchEvent(new Event('zenith_bgm_change'))
    }
    syncAudioChannels()
  }

  // Listen for audio unlock and custom play audio events (crucial for mobile autoplay policies)
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleUnlock = () => {
      const ctx = getAudioContext()
      if (ctx && ctx.state === "suspended") {
        ctx.resume()
          .then(() => console.log("AudioContext resumed successfully via user gesture"))
          .catch((err) => console.error("AudioContext resume failed:", err))
      }
    }

    const handlePlayAudio = (e: Event) => {
      const customEvent = e as CustomEvent<{ type: string; count: number }>
      const { type, count } = customEvent.detail
      if (type === "bowl") {
        playBowlWebAudio(count)
      }
    }

    window.addEventListener("zenith_audio_unlock", handleUnlock)
    window.addEventListener("zenith_play_audio", handlePlayAudio)
    return () => {
      window.removeEventListener("zenith_audio_unlock", handleUnlock)
      window.removeEventListener("zenith_play_audio", handlePlayAudio)
    }
  }, [])

  // Load BGM preference on mount (only sync channels, but since not active, it stays silent)
  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem('zenith_bgm_type')
    if (stored) {
      setBgmType(stored)
    }
  }, [])

  // Listen to BGM volume change events and ramp volume smoothly
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleVolumeChange = () => {
      syncAudioChannels()
    }

    window.addEventListener("zenith_bgm_volume_change", handleVolumeChange)
    return () => window.removeEventListener("zenith_bgm_volume_change", handleVolumeChange)
  }, [bgmType])

  // Listen for background music changes from other components
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleExternalBgmChange = () => {
      const stored = localStorage.getItem('zenith_bgm_type')
      if (stored && stored !== bgmType) {
        setBgmType(stored)
      }
      syncAudioChannels()
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
      
      isInSessionRef.current = isInSession
      isPausedRef.current = isPaused

      if (!isInSession) {
        stopBgm()
      } else if (isPaused) {
        if (audioCtxRef.current && audioCtxRef.current.state === "running") {
          audioCtxRef.current.suspend().catch((err) => console.error("Audio suspend failed:", err))
        }
      } else {
        if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume().catch((err) => console.error("Audio resume failed:", err))
        } else {
          syncAudioChannels()
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
