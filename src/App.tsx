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
  const initialSession = db.getSession()
  const [screen, setScreen] = useState<Screen>(initialSession.isAuthenticated ? "app" : "welcome")
  const [lang, setLang] = useState<Lang>("en")
  const [theme, setTheme] = useState<Theme>("light")
  const [activeModule, setActiveModule] = useState<Module>("dashboard")
  const [shopInfo, setShopInfo] = useState<ShopInfo>(initialSession.shopInfo)
  const [online, setOnline] = useState<boolean>(() => db.isOnline())
  const [syncing, setSyncing] = useState<boolean>(false)
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(() => db.getSyncQueue().length)
  const [showThemePage, setShowThemePage] = useState<boolean>(false)
  const [networkToast, setNetworkToast] = useState<string | null>(null)

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
        setNetworkToast("🟢 Back online! Syncing offline transactions with cloud...")
        db.flushSyncQueue().then(() => {
          setPendingQueueCount(db.getSyncQueue().length)
          setSyncing(false)
          setTimeout(() => setNetworkToast(null), 4000)
        })
      } else {
        setNetworkToast("🔴 You are offline. All actions are cached locally and will auto-sync when online.")
        setTimeout(() => setNetworkToast(null), 6000)
      }
    })

    const interval = setInterval(() => {
      const q = db.getSyncQueue()
      setPendingQueueCount(q.length)
      if (db.isOnline() && q.length > 0) {
        setSyncing(true)
        db.flushSyncQueue().then(() => {
          setPendingQueueCount(db.getSyncQueue().length)
          setSyncing(false)
        })
      }
    }, 15000)

    return () => {
      unsub()
      clearInterval(interval)
    }
  }, [])

  function handleLogin(info: ShopInfo) {
    setShopInfo(info)
    setScreen("app")
  }

  function handleLockApp() {
    setScreen("login")
  }

  function handleLogout() {
    setScreen("welcome")
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
    settings: (
      <SettingsModule
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        onLock={handleLockApp}
        onLogout={handleLogout}
      />
    ),
    contact: <ContactModule lang={lang} />,
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300" style={{ background: "var(--background)" }}>
      {/* Network Alert Toast */}
      {networkToast && (
        <div
          className={`px-4 py-2 text-center text-xs font-bold transition-all shadow-md ${
            online ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {networkToast}
        </div>
      )}

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
        pendingSyncCount={pendingQueueCount}
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
