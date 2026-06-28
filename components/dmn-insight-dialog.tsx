"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Brain, Activity, ShieldCheck, Sparkles } from "lucide-react"

interface DmnInsightDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DmnInsightDialog({ open, onOpenChange }: DmnInsightDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#070b13]/95 text-foreground shadow-2xl backdrop-blur-2xl sm:max-w-2xl rounded-3xl"
        showCloseButton
      >
        <DialogHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center gap-2 text-emerald-400 mb-1 justify-center sm:justify-start">
            <Brain className="w-5 h-5 animate-pulse" />
            <span className="text-xs uppercase tracking-[0.2em] font-semibold">2026 神經科學實證</span>
          </div>
          <DialogTitle className="text-xl font-light tracking-wider text-white text-center sm:text-left">
            冥想如何重塑您的大腦？
          </DialogTitle>
          <DialogDescription className="sr-only">
            探討正念冥想如何影響大腦三網絡模型、情緒調節及自主神經系統。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 text-sm leading-relaxed text-slate-300">
          <p className="text-xs sm:text-sm font-light text-slate-400">
            恭喜您完成本次練習！科學研究顯示，即使是短時間的正念呼吸，也能啟動大腦與自主神經系統的自我修復與結構重塑。以下是核心的神經科學發現：
          </p>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: DMN */}
            <div className="relative overflow-hidden p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2 hover:border-white/20 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 text-emerald-300">
                <Brain className="w-4 h-4" />
                <h4 className="font-medium tracking-wide">預設模式網絡 (DMN) 去活化</h4>
              </div>
              <p className="text-xs font-light text-slate-400 leading-relaxed">
                正念能快速抑制大腦在閒置時的背景噪音（DMN 漫遊），顯著減弱與自傳體記憶反芻相關的 <strong>EEG Microstate C</strong> 訊號，阻斷慣性焦慮與思緒分心。
              </p>
            </div>

            {/* Card 2: 7T-fMRI */}
            <div className="relative overflow-hidden p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2 hover:border-white/20 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 text-amber-300">
                <ShieldCheck className="w-4 h-4" />
                <h4 className="font-medium tracking-wide">7T-fMRI 實證隱性情緒調節</h4>
              </div>
              <p className="text-xs font-light text-slate-400 leading-relaxed">
                高場強磁振造影顯示，正念可直接調控並下調皮質下威脅中心（如<strong>杏仁核、紋狀體</strong>）對刺激的敏感度，不需額外耗費前額葉認知資源即可平復壓力。
              </p>
            </div>

            {/* Card 3: Microstates */}
            <div className="relative overflow-hidden p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2 hover:border-white/20 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 text-teal-300">
                <Activity className="w-4 h-4" />
                <h4 className="font-medium tracking-wide">微觀狀態切換與注意力定向</h4>
              </div>
              <p className="text-xs font-light text-slate-400 leading-relaxed">
                冥想能增強代表注意力重新定向的 <strong>Microstate D (後扣帶迴 PCC)</strong>，並恢復執行網絡（CEN）與 DMN 的健康反相關性，提升大腦認知靈活度。
              </p>
            </div>

            {/* Card 4: HRV */}
            <div className="relative overflow-hidden p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2 hover:border-white/20 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 text-teal-300">
                <Sparkles className="w-4 h-4" />
                <h4 className="font-medium tracking-wide">迷走神經張力與心臟修復</h4>
              </div>
              <p className="text-xs font-light text-slate-400 leading-relaxed">
                呼吸引導能提升心率變異度（HRV）中的高頻 vagal tone（nHF），降低 LF/HF 比值，快速啟動副交感神經以降低血壓與心搏，促使身體從壓力反應中修復。
              </p>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4">
            <p className="text-[10px] text-slate-500 leading-relaxed italic">
              註：本科普基於 2026 年最新臨床腦功能影像與神經電生理研究（如 Rempel et al.、Björkstrand et al.、Tsuji et al. 與 Ngo et al.）。個體效果因練習頻率而異，本內容不作為醫療診斷與心理諮詢替代。
            </p>
          </div>
        </div>
        <DialogFooter className="border-t border-white/5 pt-4">
          <Button
            type="button"
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-normal tracking-widest text-xs py-2 px-6 rounded-xl cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            知道了，保持專注
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
