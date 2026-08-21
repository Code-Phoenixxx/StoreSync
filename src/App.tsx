import { useState, useEffect } from "react"
import { Lang, Module, Screen, ShopInfo, Theme } from "./types"
import { db } from "./services/storage"
import TopBar from "./components/common/TopBar"
import Footer from "./components/common/Footer"
import ThemePage from "./components/common/ThemePage"

// Onboarding Modules
import WelcomeScreen from "./modules/onboarding/WelcomeScreen"
import LanguageScreen from "./modules/onboarding/LanguageScreen"
import LoginScreen from "./modules/onboarding/LoginScreen"

// Tradable Feature Modules
import DashboardModule from "./modules/dashboard/DashboardModule"
import CatalogueModule from "./modules/catalogue/CatalogueModule"
import BillingModule from "./modules/billing/BillingModule"
import KhataModule from "./modules/khata/KhataModule"
import OCRModule from "./modules/ocr/OCRModule"
import SupplierModule from "./modules/supplier/SupplierModule"
import AnalyticsModule from "./modules/analytics/AnalyticsModule"
import AICopilotModule from "./modules/copilot/AICopilotModule"
import VoiceModule from "./modules/voice/VoiceModule"
import SettingsModule from "./modules/settings/SettingsModule"
import ContactModule from "./modules/contact/ContactModule"

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome")
  const [lang, setLang] = useState<Lang>("en")
  const [theme, setTheme] = useState<Theme>("light")
  const [activeModule, setActiveModule] = useState<Module>("dashboard")
  const [shopInfo, setShopInfo] = useState<ShopInfo>(() => db.getShopInfo())
  const [online, setOnline] = useState<boolean>(() => db.isOnline())
  const [syncing, setSyncing] = useState<boolean>(false)
  const [showThemePage, setShowThemePage] = useState<boolean>(false)

  // Manage Theme Classes
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("dark", "theme-saffron")
    if (theme === "dark") root.classList.add("dark")
    if (theme === "saffron") root.classList.add("theme-saffron")
  }, [theme])

  // Online / Offline listener & Periodic auto-sync
  useEffect(() => {
    const unsub = db.onSyncStatusChange(status => {
      setOnline(status)
      if (status) {
        setSyncing(true)
        setTimeout(() => setSyncing(false), 1200)
      }
    })

    const interval = setInterval(() => {
      if (db.isOnline()) {
        setSyncing(true)
        db.flushSyncQueue()
        setTimeout(() => setSyncing(false), 1000)
      }
    }, 25000)

    return () => {
      unsub()
      clearInterval(interval)
    }
  }, [])

  function handleLogin(info: ShopInfo) {
    setShopInfo(info)
    setScreen("app")
  }

  // ── Onboarding Flows ──
  if (screen === "welcome") {
    return <WelcomeScreen onEnter={() => setScreen("language")} lang={lang} />
  }

  if (screen === "language") {
    return (
      <LanguageScreen
        currentLang={lang}
        onSelect={l => {
          setLang(l)
          setScreen("login")
        }}
        onBack={() => setScreen("welcome")}
      />
    )
  }

  if (screen === "login") {
    return (
      <LoginScreen
        lang={lang}
        onLogin={handleLogin}
        onBack={() => setScreen("language")}
      />
    )
  }

  // ── Main App Shell with Tradable Modules ──
  const moduleMap: Record<Module, React.ReactNode> = {
    dashboard: <DashboardModule lang={lang} shopInfo={shopInfo} onNavigate={m => setActiveModule(m as Module)} />,
    catalogue: <CatalogueModule lang={lang} />,
    billing: <BillingModule lang={lang} />,
    pos: <BillingModule lang={lang} />,
    khata: <KhataModule lang={lang} />,
    ocr: <OCRModule lang={lang} />,
    supplier: <SupplierModule lang={lang} />,
    analytics: <AnalyticsModule lang={lang} />,
    copilot: <AICopilotModule lang={lang} />,
    voice: <VoiceModule lang={lang} />,
    settings: <SettingsModule lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />,
    contact: <ContactModule lang={lang} />,
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300" style={{ background: "var(--background)" }}>
      {/* Top Navigation Bar */}
      <TopBar
        lang={lang}
        setLang={setLang}
        theme={theme}
        activeModule={activeModule}
        setModule={setActiveModule}
        shopName={shopInfo.shopName}
        online={online}
        syncing={syncing}
        onOpenTheme={() => setShowThemePage(true)}
      />

      {/* Dynamic Module Body */}
      <main className="flex-1 max-w-6xl mx-auto w-full">
        {moduleMap[activeModule]}
      </main>

      {/* Global Footer */}
      <Footer lang={lang} setModule={setActiveModule} />

      {/* Quick Theme Modal */}
      {showThemePage && (
        <ThemePage
          theme={theme}
          setTheme={setTheme}
          onClose={() => setShowThemePage(false)}
          lang={lang}
        />
      )}
    </div>
  )
}
