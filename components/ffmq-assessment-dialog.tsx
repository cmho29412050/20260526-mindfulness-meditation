"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Brain, ArrowLeft, ArrowRight, Sparkles } from "lucide-react"

export interface FfmqResult {
  observing: number
  describing: number
  awareness: number
  nonJudging: number
  nonReactivity: number
  timestamp: number
}

interface FfmqAssessmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (result: FfmqResult) => void
}

type Question = {
  id: number
  text: string
  dimension: "observing" | "describing" | "awareness" | "nonJudging" | "nonReactivity"
  isReverse: boolean
}

const QUESTIONS: Question[] = [
  { id: 1, text: "我會注意到身體的感覺，例如風吹過頭髮或是太陽照在臉上的溫暖。", dimension: "observing", isReverse: false },
  { id: 2, text: "我很容易用言語表達我的感受。", dimension: "describing", isReverse: false },
  { id: 3, text: "我發現自己一邊做事，卻沒有專注在做什麼。", dimension: "awareness", isReverse: true },
  { id: 4, text: "我會批評自己有不理智或是不恰當的想法。", dimension: "nonJudging", isReverse: true },
  { id: 5, text: "當我有令人不舒服的感受時，我能在不立刻反應的情況下保持平靜。", dimension: "nonReactivity", isReverse: false },
  { id: 6, text: "我會注意到食物在口中的質地與味道。", dimension: "observing", isReverse: false },
  { id: 7, text: "我能用詞彙精準描述我內心的精細變化。", dimension: "describing", isReverse: false },
  { id: 8, text: "我在做事情時心不在焉，經常漫不經心。", dimension: "awareness", isReverse: true },
  { id: 9, text: "我覺得自己有些想法是不對的，不應該這樣想。", dimension: "nonJudging", isReverse: true },
  { id: 10, text: "當我有不舒服的想法或感受時，我會退後一步，看著它們而不隨之起舞。", dimension: "nonReactivity", isReverse: false },
  { id: 11, text: "在行走時，我會注意踩在地面上的身體動覺。", dimension: "observing", isReverse: false },
  { id: 12, text: "當有感受浮現時，我會很容易找到字眼去描述它。", dimension: "describing", isReverse: false },
  { id: 13, text: "我發現自己做事情時往往是自動導航，沒有真正意識到自己在做。", dimension: "awareness", isReverse: true },
  { id: 14, text: "我會評判自己的感受是好是壞，或者該不該有。", dimension: "nonJudging", isReverse: true },
  { id: 15, text: "當我有痛苦的想法或情緒時，我能抱持開放，不加評判也不對抗。", dimension: "nonReactivity", isReverse: false }
]

const OPTIONS = [
  { value: 1, label: "從不如此" },
  { value: 2, label: "很少如此" },
  { value: 3, label: "有時如此" },
  { value: 4, label: "經常如此" },
  { value: 5, label: "總是如此" }
]

export function FfmqAssessmentDialog({ open, onOpenChange, onComplete }: FfmqAssessmentDialogProps) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})

  const handleSelectOption = (value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [QUESTIONS[currentIdx].id]: value
    }))

    // Auto advance with small delay for better user feel
    if (currentIdx < QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentIdx((prev) => prev + 1)
      }, 200)
    }
  }

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1)
    }
  }

  const handleNext = () => {
    if (currentIdx < QUESTIONS.length - 1 && answers[QUESTIONS[currentIdx].id] !== undefined) {
      setCurrentIdx((prev) => prev + 1)
    }
  }

  const handleSubmit = () => {
    // Validate all answered
    const allAnswered = QUESTIONS.every((q) => answers[q.id] !== undefined)
    if (!allAnswered) return

    // Calculate score per dimension
    const scores = {
      observing: 0,
      describing: 0,
      awareness: 0,
      nonJudging: 0,
      nonReactivity: 0
    }

    QUESTIONS.forEach((q) => {
      let score = answers[q.id]
      if (q.isReverse) {
        score = 6 - score
      }
      scores[q.dimension] += score
    })

    const result: FfmqResult = {
      ...scores,
      timestamp: Date.now()
    }

    onComplete(result)
    // Reset state after submitting
    setCurrentIdx(0)
    setAnswers({})
  }

  const progressPercentage = ((Object.keys(answers).length) / QUESTIONS.length) * 100
  const isCurrentAnswered = answers[QUESTIONS[currentIdx].id] !== undefined
  const isFinished = Object.keys(answers).length === QUESTIONS.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#070b13]/95 text-foreground shadow-2xl backdrop-blur-2xl sm:max-w-xl rounded-3xl"
        showCloseButton={false}
      >
        <DialogHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center gap-2 text-emerald-400 mb-1 justify-center sm:justify-start">
            <Brain className="w-5 h-5 animate-pulse" />
            <span className="text-xs uppercase tracking-[0.2em] font-semibold">正念特質評估 (FFMQ-15)</span>
          </div>
          <DialogTitle className="text-lg font-light tracking-wider text-white text-center sm:text-left">
            了解您當前的大腦特質狀態
          </DialogTitle>
          <DialogDescription className="text-xs font-light text-slate-400 text-center sm:text-left">
            請根據您過去一週的實際身心體驗回答，沒有對錯之分。
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-2">
          <motion.div
            className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full"
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question Area */}
        <div className="py-6 min-h-[160px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-emerald-400 font-mono tracking-wider">
                  QUESTION {currentIdx + 1} OF {QUESTIONS.length}
                </span>
                <span className="h-px flex-1 bg-white/5" />
              </div>
              <p className="text-base font-light leading-relaxed text-slate-200">
                {QUESTIONS[currentIdx].text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2.5">
          {OPTIONS.map((opt) => {
            const isSelected = answers[QUESTIONS[currentIdx].id] === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => handleSelectOption(opt.value)}
                className={`w-full py-3.5 px-5 rounded-2xl text-sm font-light tracking-wide text-left transition-all border cursor-pointer ${
                  isSelected
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : "bg-white/5 border-white/5 hover:border-white/10 text-slate-300 hover:bg-white/8 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{opt.label}</span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2.5 h-2.5 rounded-full bg-emerald-400"
                    />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <DialogFooter className="border-t border-white/5 pt-5 mt-4 flex items-center justify-between flex-row gap-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={currentIdx === 0}
              onClick={handlePrev}
              className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white text-slate-300 rounded-xl px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> 上一題
            </Button>

            {currentIdx < QUESTIONS.length - 1 && (
              <Button
                type="button"
                variant="outline"
                disabled={!isCurrentAnswered}
                onClick={handleNext}
                className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white text-slate-300 rounded-xl px-4 py-2 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
              >
                下一題 <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {currentIdx === QUESTIONS.length - 1 && (
            <Button
              type="button"
              disabled={!isFinished}
              onClick={handleSubmit}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-normal tracking-wider text-xs py-2 px-6 rounded-xl cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Sparkles className="w-3.5 h-3.5" /> 完成評估
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
