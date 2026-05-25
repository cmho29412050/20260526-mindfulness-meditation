"use client"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"

interface ParticleBackgroundProps {
  isInSession: boolean
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

export function ParticleBackground({ isInSession }: ParticleBackgroundProps) {
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
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      hue: Math.random() * 60 + 180, // Blue to cyan range
    }))

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        // Alpha wave pattern - slow, rhythmic movement
        const time = Date.now() * 0.0005
        const waveX = Math.sin(time + particle.x * 0.01) * 0.5
        const waveY = Math.cos(time + particle.y * 0.01) * 0.5

        particle.x += particle.speedX + waveX
        particle.y += particle.speedY + waveY

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Pulsing opacity for bio-feedback effect
        const pulseOpacity = particle.opacity * (0.7 + Math.sin(time * 2 + particle.x) * 0.3)

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
