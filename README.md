# 🧘 老何的正念冥想 | Zenith Mindfulness Meditation App

> **尋找內心的寧靜，專屬的個人正念呼吸與冥想引導空間。**
> *Discover inner peace with a personalized mindfulness breathing and meditation space.*

這是一款結合現代神經科學與優雅視覺美學的**正念冥想應用程式**。基於 **Next.js 16**、**Tailwind CSS** 與 **Framer Motion** 開發，提供沉浸式的呼吸引導、舒緩的鋼琴背景音樂、情緒狀態追蹤，以及科學化的 **DMN（預設模式網路）** 冥想洞察。此外，本專案已整合 **Electron**，可一鍵打包為 Windows 獨立桌面應用程式！

---

## ✨ 核心特色 / Core Features

### 🌌 1. 沉浸式視覺與動態美學 (Immersive Visuals)
* **極致美感介面**：採用高質感毛玻璃（Glassmorphic）設計、漸層背景與微動畫，營造平靜、和諧的視覺氛圍。
* **動態粒子背景 (Particle Background)**：粒子隨冥想狀態輕柔律動，營造無壓力的放鬆環境。

### 🌬️ 2. 科學化呼吸引導 (Scientific Breathing Sphere)
* **4-4-8 呼吸節奏**：遵循科學實證的「吸氣 4 秒 -> 屏息 4 秒 -> 呼氣 8 秒」循環，協助快速調節副交感神經。
* **動態呼吸球 (Breathing Sphere)**：隨呼吸頻率流暢縮放與色彩漸變，為呼吸練習提供直覺的視覺引導。

### 🎹 3. 療癒鋼琴背景音樂 (Soothing Piano Background Music)
* **流暢淡入效果 (Audio Fade-in)**：音樂啟動時具備漸進式音量淡入功能，避免突兀的聲音干擾冥想體驗。
* **一鍵靜音與循環播放**：精選柔和鋼琴旋律，完美契合正念情境。

### 📊 4. 情緒評估與智能推薦 (Pre- & Post-Session Mood Assessment)
* **冥想前情绪評估**：引導記錄當前情緒狀態（如壓力、焦慮、平靜等），並提供量身定制的冥想時長建議。
* **冥想後情绪對比**：視覺化對比冥想前後的心境變化，協助使用者感受當下的轉變。

### 🧠 5. DMN（預設模式網路）科學洞察 (DMN Scientific Insights)
* **深度自我檢視**：冥想結束後展示專業的 DMN 腦科學解釋，幫助使用者理解冥想如何減緩大腦雜念、重塑神經元連結。

### 🖥️ 6. 桌面端跨平台支援 (Desktop Application Ready)
* **Electron 整合**：預先配置 Electron 架構，可直接編譯包裝為獨立桌面版應用程式，隨時在桌面上開啟冥想練習。

---

## 🛠️ 技術棧 / Tech Stack

* **前端框架 (Frontend Framework)**: Next.js 16 (App Router), React 19, TypeScript
* **動態特效 (Animations)**: Framer Motion 12
* **樣式設計 (Styling)**: Tailwind CSS (v4), Vanilla CSS, Tailwind Merge
* **圖標庫 (Icons)**: Lucide React
* **數據分析 (Analytics)**: Vercel Analytics
* **桌面端包裝 (Desktop Packaging)**: Electron, Electron Packager

---

## 🚀 快速開始 / Getting Started

### 1. 安裝依賴項目 (Install Dependencies)

請在專案根目錄執行以下命令來安裝所有必要的套件：

```bash
npm install
```

### 2. 啟動開發伺服器 (Start Development Server)

啟動 Next.js 本地開發環境：

```bash
npm run dev
```

開啟瀏覽器並造訪 `http://localhost:3000` 即可預覽應用程式！

### 3. 建置與打包桌面版 (Build & Package Desktop App)

若想將此應用程式編譯並打包為獨立的 Windows (64-bit) 桌面版應用程式，請執行：

```bash
npm run build:desktop
```

編譯完成後，安裝檔與應用程式將會輸出於根目錄下的 `dist/` 資料夾中。

---

## 📂 專案架構 / Directory Structure

```text
├── app/                  # Next.js 16 路由與頁面 (Page & Route definitions)
│   ├── dashboard/        # 數據儀表板頁面
│   ├── profile/          # 個人設定頁面
│   ├── layout.tsx        # 全域版面與導覽列
│   └── page.tsx          # 冥想主畫面與狀態控制器
├── components/           # 封裝好的 UI 元件 (Reusable UI Components)
│   ├── breathing-sphere.tsx  # 呼吸引導球
│   ├── mindful-timer.tsx     # 冥想倒數計時器
│   ├── mood-assessment.tsx  # 冥想前情緒評估
│   ├── post-mood-assessment.tsx  # 冥想後情緒評估
│   └── navbar.tsx            # 毛玻璃導覽列與背景音樂控制
├── public/               # 靜態資源 (Audio, Images, Icons)
│   ├── audio/            # 療癒鋼琴音樂檔
│   └── images/           # 背景圖片
├── main.js               # Electron 桌面端主進程入口點
├── package.json          # 專案套件配置與編譯指令
└── tsconfig.json         # TypeScript 設定檔
```

---

## 🔗 如何在 GitHub 上分享此專案？ / How to Share on GitHub

您的本地程式碼已成功與 GitHub 遠端儲存庫完成連接。若您新增或修改了程式碼（例如本說明文件），可以透過以下標準 Git 指令將其推送到 GitHub 上分享：

```bash
# 1. 將變更加入暫存區
git add .

# 2. 提交變更並加上訊息
git commit -m "docs: 建立精美專屬 README.md 說明文件"

# 3. 推送到 GitHub 遠端分支
git push origin main
```

**GitHub 專案網址 / Repository URL**:
👉 [https://github.com/cmho29412050/mindfulness-meditation-app.git](https://github.com/cmho29412050/mindfulness-meditation-app.git)

---

*願你在此找到專屬的平靜與喜悅。🧘✨*
*May you find absolute peace and joy here.*
