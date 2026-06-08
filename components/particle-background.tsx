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

      if (vibeMode === "sleep") {
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
      } else if (vibeMode === "starry_sky") {
        size = Math.random() * 1.5 + 0.5   // 星星微粒
        speedX = (Math.random() - 0.5) * 0.04
        speedY = (Math.random() - 0.5) * 0.04
        hue = Math.random() * 40 + 260     // 紫藍星光
        opacity = Math.random() * 0.65 + 0.15
      } else if (vibeMode === "stream") {
        size = Math.random() * 1.8 + 1.0   // 浮水光粒
        speedX = Math.random() * 0.12 + 0.04
        speedY = -(Math.random() * 0.15 + 0.05) // 漂浮上升
        hue = Math.random() * 30 + 155     // 碧綠/青翠
        opacity = Math.random() * 0.45 + 0.1
      } else if (vibeMode === "zen_hall") {
        size = Math.random() * 1.3 + 0.6   // 禪堂塵埃微光
        speedX = (Math.random() - 0.5) * 0.03
        speedY = (Math.random() - 0.5) * 0.03
        hue = Math.random() * 20 + 35      // 暖金/石褐
        opacity = Math.random() * 0.25 + 0.05
      } else if (vibeMode === "snow_mountain") {
        size = Math.random() * 2.2 + 0.8   // 雪花
        speedX = (Math.random() - 0.5) * 0.15
        speedY = Math.random() * 0.35 + 0.2  // 向下飄落
        hue = 200                          // 潔白/冰藍
        opacity = Math.random() * 0.5 + 0.15
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

        if (vibeMode === "sleep") {
          waveX *= 1.3   // 螢火蟲飛舞更輕飄
          waveY *= 1.3
        } else if (vibeMode === "snow_mountain") {
          waveX *= 0.8   // 雪花左右輕微晃動
          waveY *= 0.1
        } else if (vibeMode === "starry_sky" || vibeMode === "zen_hall") {
          waveX *= 0.2   // 星空與禪堂幾乎微風徐徐
          waveY *= 0.2
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
  }, [isInSession, vibeMode])

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
