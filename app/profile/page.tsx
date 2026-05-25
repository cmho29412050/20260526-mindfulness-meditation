"use client"

import { motion } from "framer-motion"
import { ParticleBackground } from "@/components/particle-background"
import { Trash2, Bell, Shield, CircleUserRound, ChevronRight } from "lucide-react"
import { clearData } from "@/lib/storage"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const router = useRouter()

  const handleReset = () => {
    if (confirm("您確定要重設所有冥想統計數據嗎？此操作將永久清除所有歷史記錄且無法還原。")) {
      clearData()
      router.push('/')
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-white pt-24 pb-32">
      {/* Background Image */}
      <div
        className="fixed inset-0"
        style={{
          backgroundImage: "url('/images/mountain.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />
      <div className="fixed inset-0 bg-black/45 backdrop-blur-[6px]" />
      <ParticleBackground isInSession={false} />

      <div className="relative z-10 max-w-3xl mx-auto px-6 flex flex-col gap-10">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mt-6"
        >
          <div className="flex justify-center mb-6">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-24 h-24 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center backdrop-blur-2xl shadow-[0_0_30px_rgba(255,255,255,0.05)]"
            >
              <CircleUserRound className="w-12 h-12 text-white/50" />
            </motion.div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extralight tracking-[0.2em] mb-2 text-slate-100">
            個人設定
          </h1>
          <p className="text-white/40 font-light tracking-[0.25em] text-xs uppercase">
            Manage your experience
          </p>
        </motion.div>

        {/* Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="glass-card rounded-3xl p-4 md:p-6 shadow-2xl"
        >
          <div className="space-y-2">
            <SettingItem 
              icon={<Bell className="w-5 h-5 text-sky-300" />} 
              title="每日冥想提醒" 
              description="設定提醒時間，定時收到正念冥想提醒"
              action={
                <div className="w-11 h-6 bg-white/[0.05] border border-white/[0.08] rounded-full relative cursor-not-allowed opacity-40">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white/40 rounded-full" />
                </div>
              }
            />
            
            <SettingItem 
              icon={<Shield className="w-5 h-5 text-teal-300" />} 
              title="隱私與數據保護" 
              description="您的正念歷史紀錄完全安全地保存在本地設備中"
              action={
                <span className="text-[10px] text-emerald-300 uppercase tracking-wider bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20 font-light">
                  僅限本地儲存
                </span>
              }
            />

            <div className="h-px bg-white/5 my-4" />

            <SettingItem 
              icon={<Trash2 className="w-5 h-5 text-red-400/80" />} 
              title="重設所有數據" 
              description="永久清除所有冥想統計數據與歷史紀錄，此操作無法復原"
              action={
                <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(239, 68, 68, 0.25)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleReset}
                  className="px-4 py-2 bg-red-500/10 text-red-300 hover:text-red-200 rounded-xl text-xs font-light tracking-wider uppercase transition-colors border border-red-500/20 whitespace-nowrap"
                >
                  重設數據
                </motion.button>
              }
            />
          </div>
        </motion.div>
      </div>
    </main>
  )
}

function SettingItem({ 
  icon, 
  title, 
  description, 
  action 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  action: React.ReactNode 
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.02] border border-transparent hover:border-white/[0.04] transition-all duration-300 gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="p-3 bg-white/[0.03] border border-white/[0.05] rounded-xl text-white/80 shrink-0 shadow-inner">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="font-light text-base text-slate-200 tracking-wide">{title}</h3>
          <p className="text-xs text-white/40 font-light mt-0.5 truncate hidden sm:block">{description}</p>
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-2">
        {action}
        {typeof action === "string" && <ChevronRight className="w-4 h-4 text-white/20" />}
      </div>
    </div>
  )
}
