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

interface DmnInsightDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DmnInsightDialog({ open, onOpenChange }: DmnInsightDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[85vh] overflow-y-auto border-white/10 bg-[#0d1525]/95 text-foreground shadow-xl backdrop-blur-md sm:max-w-xl"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-base font-normal tracking-wide text-primary/90">
            完成 10 分鐘冥想 · 科學小知識
          </DialogTitle>
          <DialogDescription className="sr-only">
            關於如何調節預設模式網絡（DMN）過度活躍的簡短科學說明與實務建議。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-left text-sm leading-relaxed text-foreground/85">
          <p>
            <span className="font-medium text-foreground">預設模式網絡（DMN）</span>
            在大腦較為「安靜」、未專心做外在任務時往往較活躍，與思緒漫遊、自我相關的內在絮語有關。當 DMN
            過度活躍或與反覆擔憂糾纏在一起時，主觀上常會感到腦中停不下來。
          </p>
          <p>
            神經影像研究指出，正念類型的冥想練習，可能伴隨 DMN
            相關區域（例如後扣帶皮質、內側前額葉等）活動或連結模式的改變；這並非用意志力「硬關掉」大腦，而是透過反覆訓練，讓系統較少自動陷入漫遊。
          </p>
          <p className="font-medium text-foreground/95">實務上可以怎麼做？</p>
          <ul className="list-disc space-y-2 pl-5 marker:text-primary/70">
            <li>
              將注意力溫和地放在當下的錨點（呼吸、身體感覺、聲音），有助徵用與 DMN
              功能性拮抗的注意力網絡。
            </li>
            <li>覺察到心飄走時，不與內容爭辯，輕柔地帶回錨點；「發現—帶回」的重複本身就是關鍵訓練。</li>
            <li>規律練習能提升對自動化反芻的辨識度，縮短被 DMN 慣性拖著走的時間。</li>
          </ul>
          <p className="text-xs text-muted-foreground">
            註：腦科學仍在快速累積證據，不同研究設計與對象會有差異；以上為科普整理，不替代專業醫療或心理諮詢。
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
            知道了
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
