"use client"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"

interface ParticleBackgroundProps {
  isInSession: boolean
  vibeMode?: string
}

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  hue: number
}

export function ParticleBackground({ isInSession, vibeMode }: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Initialize particles - more particles during session for immersion
    const particleCount = isInSession ? 60 : 40
    particlesRef.current = Array.from({ length: particleCount }, () => {
      let size = Math.random() * 3 + 1
      let speedX = (Math.random() - 0.5) * 0.3
      let speedY = (Math.random() - 0.5) * 0.3
      let hue = Math.random() * 60 + 180 // Default Blue to cyan range
      let opacity = Math.random() * 0.5 + 0.1

      if (vibeMode === "rain") {
        size = Math.random() * 1.5 + 0.8   // 雨滴較小較細
        speedX = (Math.random() - 0.5) * 0.08
        speedY = Math.random() * 2.0 + 1.4  // 快速向下滴落
        hue = Math.random() * 15 + 195     // 雨天偏藍灰色
        opacity = Math.random() * 0.4 + 0.15
      } else if (vibeMode === "sleep") {
        size = Math.random() * 2.5 + 2.0   // 螢火蟲稍大
        speedX = (Math.random() - 0.5) * 0.12
        speedY = (Math.random() - 0.5) * 0.12
        hue = Math.random() * 30 + 75      // 螢光黃綠色
        opacity = Math.random() * 0.6 + 0.2
      } else if (vibeMode === "stress") {
        size = Math.random() * 2.0 + 1.2   // 氣泡
        speedX = (Math.random() - 0.5) * 0.15
        speedY = -(Math.random() * 0.5 + 0.2) // 向上升起
        hue = Math.random() * 20 + 180     // 浪花白/淡青色
        opacity = Math.random() * 0.45 + 0.1
      } else if (vibeMode === "focus") {
        size = Math.random() * 2.2 + 1.0   // 山嵐白霧
        speedX = Math.random() * 0.45 + 0.2 // 向右橫向漂移
        speedY = (Math.random() - 0.5) * 0.1
        hue = Math.random() * 20 + 190     // 冷冽冰藍
        opacity = Math.random() * 0.4 + 0.1
      } else if (vibeMode === "home") {
        size = Math.random() * 2.5 + 1.0   // 溫馨暖粒
        speedX = (Math.random() - 0.5) * 0.15
        speedY = (Math.random() - 0.5) * 0.15
        hue = Math.random() * 20 + 25      // 溫馨暖橘
        opacity = Math.random() * 0.55 + 0.15
      }

      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size,
        speedX,
        speedY,
        opacity,
        hue
      }
    })

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        // Alpha wave pattern - slow, rhythmic movement
        const time = Date.now() * 0.0005
        let waveX = Math.sin(time + particle.x * 0.01) * 0.5
        let waveY = Math.cos(time + particle.y * 0.01) * 0.5

        if (vibeMode === "rain") {
          waveX *= 0.15  // 雨滴幾乎直線下落，不易有大晃動
          waveY = 0      // 縱向不擺動
        } else if (vibeMode === "sleep") {
          waveX *= 1.3   // 螢火蟲飛舞更輕飄
          waveY *= 1.3
        }

        particle.x += particle.speedX + waveX
        particle.y += particle.speedY + waveY

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Pulsing opacity for bio-feedback effect - slow breath blinking for sleep mode (fireflies)
        const blinkRate = vibeMode === "sleep" ? 1.0 : 2.0
        const pulseOpacity = particle.opacity * (0.7 + Math.sin(time * blinkRate + particle.x) * 0.3)

        // Draw particle with glow
        ctx.beginPath()
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 3
        )
        gradient.addColorStop(0, `hsla(${particle.hue}, 70%, 60%, ${pulseOpacity})`)
        gradient.addColorStop(0.5, `hsla(${particle.hue}, 70%, 50%, ${pulseOpacity * 0.5})`)
        gradient.addColorStop(1, `hsla(${particle.hue}, 70%, 40%, 0)`)
        ctx.fillStyle = gradient
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationRef.current)
    }
  }, [isInSession])

  return (
    <motion.canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: isInSession ? 0.8 : 0.4 }}
      transition={{ duration: 2 }}
    />
  )
}
