import { useState, useEffect, useRef } from "react"

// ── Types ──────────────────────────────────────────────────────────────────────
type Screen = "welcome" | "language" | "login" | "app"
type Lang = "en" | "hi" | "bn"
type Theme = "light" | "dark" | "saffron"
type Module =
  | "dashboard" | "catalogue" | "billing" | "pos" | "khata" | "ocr"
  | "supplier" | "analytics" | "copilot" | "voice" | "settings" | "contact"

// ── Translations ───────────────────────────────────────────────────────────────
const TR = {
  en: {
    appName: "DukaanOS",
    tagline: "Your Complete Shop Management Solution",
    enterShop: "Enter Your Shop →",
    chooseLanguage: "Choose Your Language",
    langSubtitle: "Select the language you're most comfortable with",
    continue: "Continue",
    shopName: "Shop Name",
    shopType: "Shop Type",
    ownerName: "Owner / Shopkeeper Name",
    phone: "Phone Number",
    password: "Password",
    signIn: "Sign In",
    welcome: "Welcome back",
    dashboard: "Dashboard",
    catalogue: "Catalogue",
    billing: "Billing & POS",
    khata: "Khata",
    ocr: "Bill Scanner",
    supplier: "Suppliers",
    analytics: "Analytics",
    copilot: "AI Copilot",
    voice: "Voice Assistant",
    settings: "Settings",
    contact: "Contact Us",
    healthScore: "Shop Health Score",
    totalSales: "Today's Sales",
    profit: "Net Profit",
    customers: "Customers",
    stockAlert: "Low Stock Items",
    expiryAlert: "Expiry Alert",
    offlineMode: "Offline Mode",
    syncing: "Syncing...",
    synced: "Synced",
    addProduct: "Add Product",
    searchProduct: "Search products...",
    newBill: "New Bill",
    totalCredit: "Total Credit Given",
    smartRestock: "Smart Restock",
    aiSuggestions: "AI Suggestions",
    motivationPrefix: "Quote of the Day",
    goodMorning: "Good Morning!",
    goodAfternoon: "Good Afternoon!",
    goodEvening: "Good Evening!",
    selectTheme: "Theme",
    lightTheme: "Light",
    darkTheme: "Dark",
    saffronTheme: "Saffron",
    sendMessage: "Send Message",
    yourName: "Your Name",
    email: "Email Address",
    message: "Your Message",
    send: "Send",
    inventory: "Inventory",
    categories: "Categories",
    barcode: "Barcode",
    purchaseHistory: "Purchase History",
    salesReport: "Sales Report",
    profitReport: "Profit Report",
    customerReport: "Customer Report",
    recommendations: "Recommendations",
    alerts: "Alerts",
    newBillPOS: "New Bill / POS",
    creditLedger: "Credit Ledger",
    scanBill: "Scan Bill",
    supplierList: "Supplier List",
    orderNow: "Order Now",
  },
  hi: {
    appName: "दुकानOS",
    tagline: "आपका संपूर्ण दुकान प्रबंधन समाधान",
    enterShop: "अपनी दुकान में प्रवेश करें →",
    chooseLanguage: "अपनी भाषा चुनें",
    langSubtitle: "वह भाषा चुनें जिसमें आप सबसे सहज हों",
    continue: "आगे बढ़ें",
    shopName: "दुकान का नाम",
    shopType: "दुकान का प्रकार",
    ownerName: "मालिक / दुकानदार का नाम",
    phone: "फ़ोन नंबर",
    password: "पासवर्ड",
    signIn: "साइन इन करें",
    welcome: "वापसी पर स्वागत है",
    dashboard: "डैशबोर्ड",
    catalogue: "कैटलॉग",
    billing: "बिलिंग & POS",
    khata: "खाता",
    ocr: "बिल स्कैनर",
    supplier: "सप्लायर",
    analytics: "विश्लेषण",
    copilot: "AI सहायक",
    voice: "वॉयस असिस्टेंट",
    settings: "सेटिंग्स",
    contact: "संपर्क करें",
    healthScore: "दुकान स्वास्थ्य स्कोर",
    totalSales: "आज की बिक्री",
    profit: "शुद्ध लाभ",
    customers: "ग्राहक",
    stockAlert: "कम स्टॉक",
    expiryAlert: "एक्सपायरी अलर्ट",
    offlineMode: "ऑफलाइन मोड",
    syncing: "सिंक हो रहा है...",
    synced: "सिंक हो गया",
    addProduct: "उत्पाद जोड़ें",
    searchProduct: "उत्पाद खोजें...",
    newBill: "नया बिल",
    totalCredit: "कुल उधार दिया",
    smartRestock: "स्मार्ट रिस्टॉक",
    aiSuggestions: "AI सुझाव",
    motivationPrefix: "आज का विचार",
    goodMorning: "सुप्रभात!",
    goodAfternoon: "शुभ दोपहर!",
    goodEvening: "शुभ संध्या!",
    selectTheme: "थीम",
    lightTheme: "लाइट",
    darkTheme: "डार्क",
    saffronTheme: "केसरिया",
    sendMessage: "संदेश भेजें",
    yourName: "आपका नाम",
    email: "ईमेल पता",
    message: "आपका संदेश",
    send: "भेजें",
    inventory: "इन्वेंटरी",
    categories: "श्रेणियां",
    barcode: "बारकोड",
    purchaseHistory: "खरीद इतिहास",
    salesReport: "बिक्री रिपोर्ट",
    profitReport: "लाभ रिपोर्ट",
    customerReport: "ग्राहक रिपोर्ट",
    recommendations: "सुझाव",
    alerts: "अलर्ट",
    newBillPOS: "नया बिल / POS",
    creditLedger: "उधार खाता",
    scanBill: "बिल स्कैन करें",
    supplierList: "सप्लायर सूची",
    orderNow: "अभी ऑर्डर करें",
  },
  bn: {
    appName: "দুকানOS",
    tagline: "আপনার সম্পূর্ণ দোকান ব্যবস্থাপনা সমাধান",
    enterShop: "আপনার দোকানে প্রবেশ করুন →",
    chooseLanguage: "আপনার ভাষা বেছে নিন",
    langSubtitle: "যে ভাষায় আপনি সবচেয়ে স্বাচ্ছন্দ্য বোধ করেন তা বেছে নিন",
    continue: "চালিয়ে যান",
    shopName: "দোকানের নাম",
    shopType: "দোকানের ধরন",
    ownerName: "মালিক / দোকানদারের নাম",
    phone: "ফোন নম্বর",
    password: "পাসওয়ার্ড",
    signIn: "সাইন ইন করুন",
    welcome: "ফিরে আসতে পেরে ভালো লাগছে",
    dashboard: "ড্যাশবোর্ড",
    catalogue: "ক্যাটালগ",
    billing: "বিলিং & POS",
    khata: "খাতা",
    ocr: "বিল স্ক্যানার",
    supplier: "সরবরাহকারী",
    analytics: "বিশ্লেষণ",
    copilot: "AI সহকারী",
    voice: "ভয়েস সহকারী",
    settings: "সেটিংস",
    contact: "যোগাযোগ করুন",
    healthScore: "দোকান স্বাস্থ্য স্কোর",
    totalSales: "আজকের বিক্রয়",
    profit: "নেট লাভ",
    customers: "গ্রাহক",
    stockAlert: "কম স্টক",
    expiryAlert: "মেয়াদ শেষের সতর্কতা",
    offlineMode: "অফলাইন মোড",
    syncing: "সিঙ্ক হচ্ছে...",
    synced: "সিঙ্ক হয়েছে",
    addProduct: "পণ্য যোগ করুন",
    searchProduct: "পণ্য খুঁজুন...",
    newBill: "নতুন বিল",
    totalCredit: "মোট ধার দেওয়া",
    smartRestock: "স্মার্ট রিস্টক",
    aiSuggestions: "AI পরামর্শ",
    motivationPrefix: "আজকের উদ্ধৃতি",
    goodMorning: "শুভ সকাল!",
    goodAfternoon: "শুভ দুপুর!",
    goodEvening: "শুভ সন্ধ্যা!",
    selectTheme: "থিম",
    lightTheme: "আলো",
    darkTheme: "অন্ধকার",
    saffronTheme: "জাফরান",
    sendMessage: "বার্তা পাঠান",
    yourName: "আপনার নাম",
    email: "ইমেইল ঠিকানা",
    message: "আপনার বার্তা",
    send: "পাঠান",
    inventory: "ইনভেন্টরি",
    categories: "বিভাগ",
    barcode: "বারকোড",
    purchaseHistory: "ক্রয় ইতিহাস",
    salesReport: "বিক্রয় প্রতিবেদন",
    profitReport: "লাভের প্রতিবেদন",
    customerReport: "গ্রাহক প্রতিবেদন",
    recommendations: "সুপারিশ",
    alerts: "সতর্কতা",
    newBillPOS: "নতুন বিল / POS",
    creditLedger: "ধার খাতা",
    scanBill: "বিল স্ক্যান করুন",
    supplierList: "সরবরাহকারী তালিকা",
    orderNow: "এখনই অর্ডার করুন",
  },
}

const QUOTES = [
  { quote: "Your shop is your temple. Every customer is your guest.", author: "Ancient Merchant Wisdom" },
  { quote: "Small business isn't small – it is the backbone of every community.", author: "Unknown" },
  { quote: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer" },
  { quote: "A satisfied customer is the best business strategy of all.", author: "Michael LeBoeuf" },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "जब मेहनत और हुनर मिलते हैं, तो दुकान फलती-फूलती है।", author: "लोक ज्ञान" },
  { quote: "ব্যবসায় সাফল্য আসে বিশ্বাস থেকে।", author: "লোকজ্ঞান" },
]

const MOCK_PRODUCTS = [
  { id: 1, name: "Tata Salt 1kg", category: "Grocery", price: 28, stock: 45, minStock: 10, expiry: "2026-12-01", barcode: "8901234567890" },
  { id: 2, name: "Amul Butter 500g", category: "Dairy", price: 270, stock: 8, minStock: 12, expiry: "2026-09-15", barcode: "8901234567891" },
  { id: 3, name: "Parle-G Biscuits", category: "Snacks", price: 10, stock: 120, minStock: 20, expiry: "2026-11-30", barcode: "8901234567892" },
  { id: 4, name: "Colgate Toothpaste", category: "FMCG", price: 95, stock: 3, minStock: 15, expiry: "2027-06-01", barcode: "8901234567893" },
  { id: 5, name: "Maggi Noodles 70g", category: "Instant Food", price: 14, stock: 200, minStock: 30, expiry: "2026-10-20", barcode: "8901234567894" },
  { id: 6, name: "Lifebuoy Soap", category: "Personal Care", price: 45, stock: 60, minStock: 10, expiry: "2028-01-01", barcode: "8901234567895" },
  { id: 7, name: "Aashirvaad Atta 5kg", category: "Grocery", price: 260, stock: 15, minStock: 5, expiry: "2026-08-30", barcode: "8901234567896" },
]

const MOCK_CUSTOMERS = [
  { id: 1, name: "Ramesh Sharma", phone: "9876543210", credit: 1240, lastVisit: "Today" },
  { id: 2, name: "Priya Patel", phone: "9876543211", credit: 0, lastVisit: "Yesterday" },
  { id: 3, name: "Mohd. Akhtar", phone: "9876543212", credit: 580, lastVisit: "2 days ago" },
  { id: 4, name: "Sunita Devi", phone: "9876543213", credit: 2100, lastVisit: "Today" },
  { id: 5, name: "Arjun Singh", phone: "9876543214", credit: 360, lastVisit: "3 days ago" },
]

const MOCK_BILLS = [
  { id: "INV-2847", customer: "Ramesh Sharma", items: 4, total: 342, time: "10:24 AM", paid: true },
  { id: "INV-2848", customer: "Walk-in", items: 2, total: 56, time: "11:05 AM", paid: true },
  { id: "INV-2849", customer: "Sunita Devi", items: 7, total: 890, time: "12:30 PM", paid: false },
  { id: "INV-2850", customer: "Walk-in", items: 1, total: 28, time: "01:15 PM", paid: true },
  { id: "INV-2851", customer: "Mohd. Akhtar", items: 3, total: 215, time: "02:00 PM", paid: false },
]

const MOCK_SUPPLIERS = [
  { id: 1, name: "Metro Cash & Carry", category: "Grocery", rating: 4.8, lastOrder: "3 days ago", contact: "18001234567" },
  { id: 2, name: "Hindustan Unilever Ltd", category: "FMCG", rating: 4.6, lastOrder: "1 week ago", contact: "18001234568" },
  { id: 3, name: "ITC Distributor", category: "Tobacco/Food", rating: 4.3, lastOrder: "2 days ago", contact: "18001234569" },
  { id: 4, name: "Local Dairy Farm", category: "Dairy", rating: 4.9, lastOrder: "Today", contact: "9988776655" },
]

const AI_SUGGESTIONS = [
  { type: "restock", icon: "📦", title: "Restock Colgate Toothpaste", desc: "Only 3 units left. Avg. daily sale: 4 units. Order 24 units.", priority: "high" },
  { type: "restock", icon: "🥛", title: "Order Amul Butter", desc: "Stock below minimum. Place order with HUL distributor today.", priority: "high" },
  { type: "expiry", icon: "⚠️", title: "Aashirvaad Atta expiring soon", desc: "5kg atta expires in 10 days. Run a 5% discount to clear stock.", priority: "medium" },
  { type: "insight", icon: "💡", title: "Best selling time: 6–8 PM", desc: "40% of sales happen in evening. Ensure staff present at peak hours.", priority: "low" },
  { type: "insight", icon: "📈", title: "Biscuits up 22% this week", desc: "Parle-G & Britannia trending. Stock up before weekend.", priority: "medium" },
  { type: "credit", icon: "💳", title: "Collect from Sunita Devi", desc: "₹2,100 credit outstanding for 15 days. Send a reminder.", priority: "high" },
]

// ── Helpers ────────────────────────────────────────────────────────────────────
function getGreeting(lang: Lang): string {
  const h = new Date().getHours()
  if (h < 12) return TR[lang].goodMorning
  if (h < 17) return TR[lang].goodAfternoon
  return TR[lang].goodEvening
}

function getTodayQuote() {
  const idx = new Date().getDate() % QUOTES.length
  return QUOTES[idx]
}

// ── StatCard ──────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }: { icon: string; label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="card-hover rounded-2xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>{label}</p>
          <p className="text-2xl font-bold mt-1 font-display" style={{ color: color || "var(--foreground)" }}>{value}</p>
          {sub && <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{sub}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}

// ── HealthScoreRing ────────────────────────────────────────────────────────────
function HealthScoreRing({ score, lang }: { score: number; lang: Lang }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? "#10B981" : score >= 50 ? "#F59E0B" : "#EF4444"

  return (
    <div className="card-hover rounded-2xl p-6 border flex flex-col items-center justify-center" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <p className="font-display font-bold text-lg mb-4" style={{ color: "var(--foreground)" }}>{TR[lang].healthScore}</p>
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
          <circle cx="64" cy="64" r={r} fill="none" stroke="var(--border)" strokeWidth="12" />
          <circle
            cx="64" cy="64" r={r} fill="none" stroke={color} strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.4s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-black" style={{ color }}>{score}</span>
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>/ 100</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold" style={{ color }}>
        {score >= 75 ? "🟢 Excellent" : score >= 50 ? "🟡 Good" : "🔴 Needs Attention"}
      </p>
    </div>
  )
}

// ── Nav groups (all go in topbar) ─────────────────────────────────────────────
const NAV_GROUPS: {
  label: keyof typeof TR["en"]
  icon: string
  module: Module
  children?: { label: keyof typeof TR["en"]; icon: string; module: Module }[]
}[] = [
  { label: "catalogue", icon: "📦", module: "catalogue" },
  {
    label: "billing", icon: "🧾", module: "billing",
    children: [
      { label: "newBillPOS", icon: "🧾", module: "billing" },
      { label: "khata",      icon: "💳", module: "khata"   },
      { label: "scanBill",   icon: "📸", module: "ocr"     },
    ],
  },
  { label: "supplier",  icon: "🛒", module: "supplier"  },
  { label: "analytics", icon: "📊", module: "analytics" },
  {
    label: "copilot", icon: "🤖", module: "copilot",
    children: [
      { label: "copilot", icon: "🤖", module: "copilot" },
      { label: "voice",   icon: "🎙️", module: "voice"   },
    ],
  },
  { label: "settings", icon: "⚙️", module: "settings" },
]

// ── TopBar ─────────────────────────────────────────────────────────────────────
interface TopBarProps {
  lang: Lang; setLang: (l: Lang) => void
  theme: Theme
  activeModule: Module; setModule: (m: Module) => void
  shopName: string; online: boolean; syncing: boolean
  onOpenTheme: () => void
}

function TopBar({ lang, setLang, theme, activeModule, setModule, shopName, online, syncing, onOpenTheme }: TopBarProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function openDrop(i: number) {
    if (timerRef.current) clearTimeout(timerRef.current)
    setOpenIdx(i)
  }
  function closeDrop() {
    timerRef.current = setTimeout(() => setOpenIdx(null), 140)
  }

  const langs = [
    { value: "en" as Lang, label: "EN" },
    { value: "hi" as Lang, label: "हि" },
    { value: "bn" as Lang, label: "বা" },
  ]
  const themeIcon = theme === "light" ? "☀️" : theme === "dark" ? "🌙" : "🧡"

  return (
    <header className="sticky top-0 z-50" style={{ background: "var(--secondary)" }}>
      <div className="flex items-center h-16 px-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>

        {/* Logo — clicking goes to dashboard */}
        <button
          onClick={() => setModule("dashboard")}
          className="flex items-center gap-2.5 font-display font-black text-xl select-none shrink-0"
          style={{ color: "var(--primary)" }}
          title="Go to Dashboard"
        >
          🏪 <span className="hidden sm:inline" style={{ color: "#fff" }}>{shopName || TR[lang].appName}</span>
        </button>

        {/* ── Spacer between logo and nav ── */}
        <div className="hidden md:block w-16 shrink-0" />

        {/* ── Full nav (all modules) ── */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1">
          {NAV_GROUPS.map((grp, i) => {
            const isActive = grp.module === activeModule ||
              grp.children?.some(c => c.module === activeModule)
            return (
              <div key={i} className="relative"
                onMouseEnter={() => openDrop(i)}
                onMouseLeave={closeDrop}
              >
                <button
                  onClick={() => { setModule(grp.module); setOpenIdx(null) }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
                  style={{
                    color: isActive ? "var(--primary)" : "rgba(255,255,255,0.82)",
                    background: isActive ? "rgba(245,158,11,0.14)" : "transparent",
                  }}
                >
                  <span className="text-sm">{grp.icon}</span>
                  {TR[lang][grp.label]}
                  {grp.children && (
                    <svg width="9" height="6" viewBox="0 0 9 6" fill="none" style={{ opacity: 0.5 }}>
                      <path d="M1 1l3.5 4L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>

                {openIdx === i && grp.children && (
                  <div
                    className="dropdown-enter absolute top-full left-0 mt-2 min-w-44 rounded-2xl shadow-2xl border py-2 z-50"
                    style={{ background: "var(--card)", borderColor: "var(--border)" }}
                    onMouseEnter={() => openDrop(i)}
                    onMouseLeave={closeDrop}
                  >
                    {grp.children.map((sub, j) => (
                      <button key={j}
                        onClick={() => { setModule(sub.module); setOpenIdx(null) }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-left transition-all"
                        style={{
                          color: sub.module === activeModule ? "var(--primary)" : "var(--foreground)",
                          background: sub.module === activeModule ? "var(--muted)" : "transparent",
                        }}
                      >
                        <span className="w-5 text-center">{sub.icon}</span>
                        {TR[lang][sub.label]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* ── Right controls ── */}
        <div className="flex items-center gap-2.5 ml-auto shrink-0">
          {/* Sync pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              background: online ? "rgba(16,185,129,0.14)" : "rgba(239,68,68,0.14)",
              color: online ? "#10B981" : "#EF4444",
            }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: online ? "#10B981" : "#EF4444" }} />
            {online ? (syncing ? TR[lang].syncing : TR[lang].synced) : TR[lang].offlineMode}
          </div>

          {/* Language toggle */}
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "rgba(255,255,255,0.14)" }}>
            {langs.map(l => (
              <button key={l.value} onClick={() => setLang(l.value)}
                className="px-2.5 py-1.5 text-xs font-bold transition-all"
                style={{
                  background: lang === l.value ? "var(--primary)" : "transparent",
                  color: lang === l.value ? "#fff" : "rgba(255,255,255,0.6)",
                }}>
                {l.label}
              </button>
            ))}
          </div>

          {/* Theme button */}
          <button onClick={onOpenTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.12)", color: "#fff" }}
            title="Change theme"
          >
            {themeIcon} <span className="hidden sm:inline text-xs">Theme</span>
          </button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all"
            style={{ color: "#fff" }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Context bar */}
      <div className="hidden md:flex items-center px-6 py-1.5 gap-3 text-xs border-t" style={{ background: "rgba(0,0,0,0.18)", color: "rgba(255,255,255,0.45)", borderColor: "rgba(255,255,255,0.06)" }}>
        <span style={{ color: "rgba(255,255,255,0.65)" }}>
          {new Date().toLocaleDateString(lang === "hi" ? "hi-IN" : lang === "bn" ? "bn-IN" : "en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
        <span className="ml-auto flex items-center gap-1.5 xl:hidden"
          style={{ color: online ? "#10B981" : "#EF4444" }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />
          {online ? (syncing ? TR[lang].syncing : TR[lang].synced) : TR[lang].offlineMode}
        </span>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t" style={{ background: "var(--secondary)", borderColor: "rgba(255,255,255,0.08)" }}>
          {NAV_GROUPS.flatMap(g => g.children ?? [g]).map((item, i) => (
            <button key={i}
              onClick={() => { setModule(item.module); setMobileOpen(false) }}
              className="flex items-center gap-3 w-full px-5 py-3.5 text-sm font-medium text-left border-b"
              style={{ color: "rgba(255,255,255,0.85)", borderColor: "rgba(255,255,255,0.06)" }}>
              <span>{item.icon}</span> {TR[lang][item.label]}
            </button>
          ))}
        </div>
      )}
    </header>
  )
}

// ── ThemePage ──────────────────────────────────────────────────────────────────
function ThemePage({ theme, setTheme, onClose, lang }: { theme: Theme; setTheme: (t: Theme) => void; onClose: () => void; lang: Lang }) {
  const [selected, setSelected] = useState<Theme>(theme)
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 60) }, [])

  const options: { value: Theme; label: string; desc: string; bg: string; accent: string; preview: string[] }[] = [
    {
      value: "light",
      label: TR[lang].lightTheme,
      desc: "Warm cream canvas, easy on the eyes during the day.",
      bg: "#FFFBF3", accent: "#F59E0B",
      preview: ["#FFFBF3", "#FFFFFF", "#F59E0B"],
    },
    {
      value: "dark",
      label: TR[lang].darkTheme,
      desc: "Deep navy background, ideal for evening & night shifts.",
      bg: "#0F172A", accent: "#FBBF24",
      preview: ["#0F172A", "#1E293B", "#FBBF24"],
    },
    {
      value: "saffron",
      label: TR[lang].saffronTheme,
      desc: "Vibrant Indian saffron — bold, warm, and festive.",
      bg: "#FFF7ED", accent: "#EA580C",
      preview: ["#FFF7ED", "#FFFFFF", "#EA580C"],
    },
  ]

  function apply() {
    setTheme(selected)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}>
      <div
        className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl transition-all duration-500"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1) translateY(0)" : "scale(0.94) translateY(20px)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div>
            <h2 className="font-display font-black text-xl" style={{ color: "var(--foreground)" }}>🎨 {TR[lang].selectTheme}</h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>Choose how DukaanOS looks for you</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold transition-all hover:opacity-70"
            style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>✕</button>
        </div>

        {/* Options */}
        <div className="p-5 space-y-3">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all"
              style={{
                borderColor: selected === opt.value ? "var(--primary)" : "var(--border)",
                background: selected === opt.value ? "rgba(245,158,11,0.06)" : "var(--muted)",
                boxShadow: selected === opt.value ? "0 0 0 4px rgba(245,158,11,0.12)" : "none",
              }}
            >
              {/* Colour swatch */}
              <div className="flex rounded-xl overflow-hidden shrink-0 shadow-md" style={{ width: 56, height: 42 }}>
                {opt.preview.map((c, i) => (
                  <div key={i} className="flex-1" style={{ background: c }} />
                ))}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-base" style={{ color: "var(--foreground)" }}>{opt.label}</p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{opt.desc}</p>
              </div>

              {/* Check */}
              <div className="w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all"
                style={{
                  borderColor: selected === opt.value ? "var(--primary)" : "var(--border)",
                  background: selected === opt.value ? "var(--primary)" : "transparent",
                }}>
                {selected === opt.value && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-2xl font-bold text-sm border transition-all hover:opacity-80"
            style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--muted)" }}>
            Cancel
          </button>
          <button onClick={apply}
            className="flex-1 py-3 rounded-2xl font-display font-bold text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: "var(--primary)", color: "#fff" }}>
            Apply Theme ✓
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Footer ─────────────────────────────────────────────────────────────────────
function Footer({ lang, setModule }: { lang: Lang; setModule: (m: Module) => void }) {
  const year = new Date().getFullYear()

  const columns: { heading: string; links: { label: string; module?: Module }[] }[] = [
    {
      heading: "Modules",
      links: [
        { label: TR[lang].catalogue, module: "catalogue" },
        { label: TR[lang].billing,   module: "billing"   },
        { label: TR[lang].khata,     module: "khata"     },
        { label: TR[lang].ocr,       module: "ocr"       },
        { label: TR[lang].supplier,  module: "supplier"  },
      ],
    },
    {
      heading: "Tools",
      links: [
        { label: TR[lang].analytics, module: "analytics" },
        { label: TR[lang].copilot,   module: "copilot"   },
        { label: TR[lang].voice,     module: "voice"     },
        { label: TR[lang].settings,  module: "settings"  },
      ],
    },
    {
      heading: "Support",
      links: [
        { label: TR[lang].contact,   module: "contact"   },
        { label: "Help Center" },
        { label: "Privacy Policy" },
        { label: "Terms of Use" },
        { label: "About Us" },
      ],
    },
    {
      heading: "Contact",
      links: [
        { label: "📞 1800-DUKAAN-OS" },
        { label: "📧 help@dukaanos.in" },
        { label: "💬 WhatsApp Support" },
        { label: "🕐 Mon–Sat, 8AM–9PM" },
      ],
    },
  ]

  return (
    <footer className="border-t mt-8" style={{ background: "var(--secondary)", borderColor: "rgba(255,255,255,0.08)" }}>
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {columns.map(col => (
            <div key={col.heading}>
              <p className="font-display font-bold text-sm mb-4 tracking-wide" style={{ color: "var(--primary)" }}>
                {col.heading}
              </p>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link.label}>
                    {link.module ? (
                      <button
                        onClick={() => setModule(link.module!)}
                        className="text-sm text-left transition-all hover:opacity-100"
                        style={{ color: "rgba(255,255,255,0.55)" }}
                      >
                        {link.label}
                      </button>
                    ) : (
                      <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{link.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t mb-6" style={{ borderColor: "rgba(255,255,255,0.07)" }} />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            <div>
              <p className="font-display font-black text-base" style={{ color: "var(--primary)" }}>DukaanOS</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Offline-first · AI-powered · Made for Bharat</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>🌐 EN · हिंदी · বাংলা</span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>© {year} DukaanOS. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ── WelcomeScreen ──────────────────────────────────────────────────────────────
function WelcomeScreen({ onEnter, lang }: { onEnter: () => void; lang: Lang }) {
  const [step, setStep] = useState(0)
  const quote = getTodayQuote()
  const h = new Date().getHours()
  const timeIcon = h < 12 ? "☀️" : h < 17 ? "⛅" : "🌙"

  // Stagger entrance
  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 80),
      setTimeout(() => setStep(2), 340),
      setTimeout(() => setStep(3), 600),
      setTimeout(() => setStep(4), 860),
      setTimeout(() => setStep(5), 1100),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const show = (n: number) => ({
    opacity: step >= n ? 1 : 0,
    transform: step >= n ? "translateY(0)" : "translateY(24px)",
    transition: "opacity 0.55s ease, transform 0.55s ease",
  })

  const features = [
    { icon: "🧾", label: "Smart Billing" },
    { icon: "📦", label: "Inventory" },
    { icon: "💳", label: "Khata / Credit" },
    { icon: "📊", label: "Analytics" },
    { icon: "🤖", label: "AI Copilot" },
    { icon: "🎙️", label: "Voice Control" },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ background: "#0D1B2A" }}>

      {/* ── Background layers ── */}
      {/* Deep grid */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />
      {/* Amber glow bottom-right */}
      <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full" style={{
        background: "radial-gradient(circle, rgba(245,158,11,0.22) 0%, transparent 70%)",
      }} />
      {/* Navy glow top-left */}
      <div className="absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full" style={{
        background: "radial-gradient(circle, rgba(45,90,160,0.35) 0%, transparent 70%)",
      }} />
      {/* Green accent mid-right */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 rounded-full" style={{
        background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
      }} />

      {/* ── Top bar ── */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-10 pt-6">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🏪</span>
          <span className="font-display font-black text-xl" style={{ color: "#F59E0B" }}>DukaanOS</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}>
          {timeIcon} {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </div>
      </div>

      {/* ── Main hero ── */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 px-6 md:px-10 py-10 max-w-6xl mx-auto w-full">

        {/* Left column — text */}
        <div className="flex-1 text-center lg:text-left max-w-xl">

          {/* Greeting badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
            style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#FCD34D", ...show(1) }}>
            {timeIcon} {getGreeting(lang)}
          </div>

          {/* Headline */}
          <h1 className="font-display font-black leading-tight mb-4"
            style={{ fontSize: "clamp(2.6rem, 6vw, 4.5rem)", color: "#FFFFFF", ...show(2) }}>
            Run your shop<br />
            <span style={{ color: "#F59E0B" }}>smarter.</span>{" "}
            <span style={{ color: "#10B981" }}>faster.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg mb-8 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)", ...show(3) }}>
            {TR[lang].tagline}
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-10" style={show(4)}>
            {features.map(f => (
              <span key={f.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                {f.icon} {f.label}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div style={show(5)} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <button
              onClick={onEnter}
              className="group font-display font-bold text-base px-8 py-4 rounded-2xl transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2"
              style={{ background: "#F59E0B", color: "#1A0E00", boxShadow: "0 0 40px rgba(245,158,11,0.35)" }}
            >
              {TR[lang].enterShop}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition-transform group-hover:translate-x-0.5">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="flex items-center justify-center gap-2 text-xs font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>
              🔒 Offline-first · No internet needed
            </div>
          </div>
        </div>

        {/* Right column — quote + stats card */}
        <div className="w-full lg:w-auto lg:min-w-[340px] max-w-sm space-y-4" style={show(3)}>

          {/* Quote card */}
          <div className="rounded-3xl p-6" style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(16px)",
          }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-8 rounded-full" style={{ background: "#F59E0B" }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#F59E0B" }}>
                {TR[lang].motivationPrefix}
              </span>
            </div>
            <blockquote className="text-base font-medium italic leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.85)" }}>
              "{quote.quote}"
            </blockquote>
            <cite className="text-xs not-italic font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
              — {quote.author}
            </cite>
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "10k+", label: "Shops" },
              { value: "3", label: "Languages" },
              { value: "100%", label: "Offline" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-3 text-center" style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}>
                <p className="font-display font-black text-lg" style={{ color: "#F59E0B" }}>{s.value}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Language hint */}
          <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            🌐 Available in English · हिंदी · বাংলা
          </p>
        </div>
      </div>

      {/* ── Bottom strip ── */}
      <div className="relative z-10 border-t px-6 md:px-10 py-4 flex items-center justify-between gap-4 flex-wrap"
        style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.2)" }}>
        <div className="flex items-center gap-4 flex-wrap">
          {["📦 Catalogue", "🧾 POS Billing", "💳 Khata", "📸 OCR Scanner", "🛒 Suppliers", "📊 Analytics", "🤖 AI Copilot"].map(f => (
            <span key={f} className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>{f}</span>
          ))}
        </div>
        {/* Step indicator */}
        <div className="flex items-center gap-2 shrink-0">
          {["Welcome", "Language", "Login"].map((label, i) => (
            <div key={label} className="flex items-center gap-1.5">
              {i > 0 && <div className="w-5 h-px" style={{ background: "rgba(255,255,255,0.15)" }} />}
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: i === 0 ? "#F59E0B" : "rgba(255,255,255,0.12)",
                    color: i === 0 ? "#1A0E00" : "rgba(255,255,255,0.35)",
                  }}>{i + 1}</div>
                <span className="text-xs hidden md:inline" style={{ color: i === 0 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.25)" }}>{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── OnboardingShell ────────────────────────────────────────────────────────────
function OnboardingShell({
  step, totalSteps, onBack, children,
}: {
  step: number; totalSteps: number; onBack?: () => void; children: React.ReactNode
}) {
  const stepLabels = ["Welcome", "Language", "Shop Setup"]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Top nav strip */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
        {/* Back button */}
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80 group"
            style={{ background: "var(--muted)", color: "var(--foreground)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform group-hover:-translate-x-0.5">
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
        ) : (
          <div className="flex items-center gap-2 font-display font-black text-lg" style={{ color: "var(--primary)" }}>
            🏪 DukaanOS
          </div>
        )}

        {/* Step counter */}
        <span className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>
          Step {step} of {totalSteps}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full" style={{ background: "var(--border)" }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${(step / totalSteps) * 100}%`, background: "var(--primary)" }}
        />
      </div>

      {/* Step breadcrumbs */}
      <div className="flex items-center justify-center gap-6 py-4">
        {stepLabels.map((label, i) => {
          const n = i + 1
          const done = n < step
          const active = n === step
          return (
            <div key={label} className="flex items-center gap-2">
              {i > 0 && (
                <div className="w-8 h-px" style={{ background: done ? "var(--primary)" : "var(--border)" }} />
              )}
              <div className="flex items-center gap-1.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: done ? "var(--primary)" : active ? "var(--primary)" : "var(--muted)",
                    color: done || active ? "#fff" : "var(--muted-foreground)",
                    transform: active ? "scale(1.15)" : "scale(1)",
                  }}
                >
                  {done ? "✓" : n}
                </div>
                <span
                  className="text-xs font-semibold hidden sm:inline"
                  style={{ color: active ? "var(--foreground)" : "var(--muted-foreground)" }}
                >
                  {label}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Page content */}
      <div className="flex-1 flex items-center justify-center px-4 py-6">
        {children}
      </div>
    </div>
  )
}

// ── LanguageScreen ─────────────────────────────────────────────────────────────
function LanguageScreen({ onSelect, onBack, currentLang }: { onSelect: (l: Lang) => void; onBack: () => void; currentLang: Lang }) {
  const [selected, setSelected] = useState<Lang>(currentLang)

  const options: { value: Lang; label: string; native: string; flag: string; desc: string }[] = [
    { value: "en", label: "English", native: "English", flag: "🇬🇧", desc: "Continue in English" },
    { value: "hi", label: "Hindi", native: "हिंदी", flag: "🇮🇳", desc: "हिंदी में जारी रखें" },
    { value: "bn", label: "Bengali", native: "বাংলা", flag: "🇧🇩", desc: "বাংলায় চালিয়ে যান" },
  ]

  return (
    <OnboardingShell step={2} totalSteps={3} onBack={onBack}>
      <div className="w-full max-w-md slide-up">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🌐</div>
          <h2 className="font-display font-black text-3xl mb-2" style={{ color: "var(--foreground)" }}>
            {TR[selected].chooseLanguage}
          </h2>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{TR[selected].langSubtitle}</p>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className="flex items-center gap-4 p-5 rounded-2xl border-2 transition-all"
              style={{
                background: selected === opt.value ? "rgba(245,158,11,0.08)" : "var(--card)",
                borderColor: selected === opt.value ? "var(--primary)" : "var(--border)",
                boxShadow: selected === opt.value ? "0 0 0 4px rgba(245,158,11,0.15)" : "none",
              }}
            >
              <span className="text-3xl">{opt.flag}</span>
              <div className="text-left flex-1">
                <p className="font-display font-bold text-lg" style={{ color: "var(--foreground)" }}>{opt.native}</p>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>{opt.desc}</p>
              </div>
              {selected === opt.value && <span style={{ color: "var(--primary)" }}>✓</span>}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-4 rounded-2xl font-display font-bold text-base border transition-all hover:opacity-80"
            style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--card)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
          <button
            onClick={() => onSelect(selected)}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-display font-bold text-lg transition-all hover:opacity-90 active:scale-95"
            style={{ background: "var(--primary)", color: "#fff" }}
          >
            {TR[selected].continue}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </OnboardingShell>
  )
}

// ── LoginScreen ────────────────────────────────────────────────────────────────
function LoginScreen({ lang, onLogin, onBack }: { lang: Lang; onLogin: (info: { shopName: string; ownerName: string }) => void; onBack: () => void }) {
  const [form, setForm] = useState({ shopName: "", shopType: "Grocery", ownerName: "", phone: "", password: "" })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onLogin({ shopName: form.shopName || "My Shop", ownerName: form.ownerName || "Shopkeeper" })
  }

  const types = ["Grocery", "Pharmacy", "Electronics", "Clothing", "Stationery", "Restaurant", "General Store", "Mobile Shop"]
  const inputStyle = { background: "var(--muted)", border: "1.5px solid var(--border)", color: "var(--foreground)" }

  return (
    <OnboardingShell step={3} totalSteps={3} onBack={onBack}>
      <div className="w-full max-w-md slide-up">
        <div className="rounded-3xl border overflow-hidden shadow-xl" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          {/* Header */}
          <div className="px-8 py-8 text-center" style={{ background: "var(--secondary)" }}>
            <div className="text-4xl mb-3">🏪</div>
            <h2 className="font-display font-black text-2xl mb-1" style={{ color: "#fff" }}>DukaanOS</h2>
            <p className="text-sm opacity-70" style={{ color: "#FDE68A" }}>{TR[lang].tagline}</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>{TR[lang].shopName} *</label>
              <input
                value={form.shopName}
                onChange={e => setForm(p => ({ ...p, shopName: e.target.value }))}
                placeholder="e.g. Sharma General Store"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>{TR[lang].shopType}</label>
              <select
                value={form.shopType}
                onChange={e => setForm(p => ({ ...p, shopType: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none cursor-pointer"
                style={inputStyle}
              >
                {types.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>{TR[lang].ownerName} *</label>
              <input
                value={form.ownerName}
                onChange={e => setForm(p => ({ ...p, ownerName: e.target.value }))}
                placeholder="e.g. Ramesh Sharma"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>{TR[lang].phone}</label>
              <input
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                type="tel"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={inputStyle}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>{TR[lang].password}</label>
              <input
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={inputStyle}
              />
            </div>

            {/* AI tip */}
            <div className="rounded-xl p-4" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <p className="text-xs font-semibold flex items-center gap-2" style={{ color: "var(--primary)" }}>
                🤖 AI Tip: Fill in your shop type for smarter product recommendations!
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-2xl font-display font-bold text-base transition-all hover:opacity-90 active:scale-95"
              style={{ background: "var(--primary)", color: "#fff" }}
            >
              {TR[lang].signIn} →
            </button>
          </form>
        </div>

        <p className="text-center mt-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
          🔒 Your data is stored securely and works offline
        </p>
      </div>
    </OnboardingShell>
  )
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
function Dashboard({ lang, shopInfo }: { lang: Lang; shopInfo: { shopName: string; ownerName: string } }) {
  const lowStock = MOCK_PRODUCTS.filter(p => p.stock <= p.minStock)
  const todaySales = MOCK_BILLS.reduce((s, b) => s + b.total, 0)
  const topSuggestion = AI_SUGGESTIONS[0]

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Welcome header */}
      <div className="rounded-3xl p-6 md:p-8 relative overflow-hidden" style={{ background: "var(--secondary)" }}>
        <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 80% 50%, var(--primary), transparent)" }} />
        <div className="relative">
          <p className="text-sm font-semibold mb-1" style={{ color: "#FDE68A" }}>{getGreeting(lang)}</p>
          <h2 className="font-display font-black text-2xl md:text-3xl mb-1" style={{ color: "#fff" }}>{shopInfo.ownerName}</h2>
          <p className="text-sm opacity-70" style={{ color: "#fff" }}>🏪 {shopInfo.shopName} · {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="💰" label={TR[lang].totalSales} value={`₹${todaySales.toLocaleString("en-IN")}`} sub="↑ 12% vs yesterday" color="var(--accent)" />
        <StatCard icon="📈" label={TR[lang].profit} value="₹931" sub="↑ 8.4% margin" />
        <StatCard icon="👥" label={TR[lang].customers} value="18" sub="Today's visitors" />
        <StatCard icon="⚠️" label={TR[lang].stockAlert} value={`${lowStock.length} items`} sub="Need reorder" color="var(--destructive)" />
      </div>

      {/* Health score + AI suggestion */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HealthScoreRing score={74} lang={lang} />

        {/* AI Suggestion */}
        <div className="md:col-span-2 rounded-2xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🤖</span>
            <h3 className="font-display font-bold" style={{ color: "var(--foreground)" }}>{TR[lang].aiSuggestions}</h3>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: "rgba(245,158,11,0.1)", color: "var(--primary)" }}>{AI_SUGGESTIONS.length} alerts</span>
          </div>
          <div className="space-y-3">
            {AI_SUGGESTIONS.slice(0, 3).map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: s.priority === "high" ? "rgba(239,68,68,0.06)" : s.priority === "medium" ? "rgba(245,158,11,0.06)" : "var(--muted)" }}>
                <span className="text-xl shrink-0">{s.icon}</span>
                <div>
                  <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{s.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{s.desc}</p>
                </div>
                <span className={`ml-auto shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold ${s.priority === "high" ? "bg-red-100 text-red-600" : s.priority === "medium" ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"}`}>
                  {s.priority}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent bills + low stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent bills */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-display font-bold" style={{ color: "var(--foreground)" }}>🧾 Recent Bills</h3>
            <span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>Today</span>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {MOCK_BILLS.map(b => (
              <div key={b.id} className="flex items-center px-5 py-3 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>{b.customer}</p>
                  <p className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>{b.id} · {b.time}</p>
                </div>
                <p className="font-bold font-mono text-sm" style={{ color: "var(--foreground)" }}>₹{b.total}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${b.paid ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                  {b.paid ? "Paid" : "Unpaid"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Low stock */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <h3 className="font-display font-bold" style={{ color: "var(--foreground)" }}>📦 Low Stock Alert</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold">{lowStock.length} items</span>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {lowStock.map(p => (
              <div key={p.id} className="flex items-center px-5 py-3 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>{p.name}</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{p.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-red-500">{p.stock} left</p>
                  <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>min: {p.minStock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Catalogue ──────────────────────────────────────────────────────────────────
function CatalogueModule({ lang }: { lang: Lang }) {
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState("All")
  const cats = ["All", ...Array.from(new Set(MOCK_PRODUCTS.map(p => p.category)))]
  const filtered = MOCK_PRODUCTS.filter(p =>
    (catFilter === "All" || p.category === catFilter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>📦 {TR[lang].catalogue}</h2>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: "var(--primary)", color: "#fff" }}>
          + {TR[lang].addProduct}
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-3 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={TR[lang].searchProduct}
          className="flex-1 min-w-48 px-4 py-2.5 rounded-xl text-sm outline-none border"
          style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
        />
        <div className="flex gap-2 flex-wrap">
          {cats.map(c => (
            <button key={c} onClick={() => setCatFilter(c)}
              className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: catFilter === c ? "var(--primary)" : "var(--card)",
                color: catFilter === c ? "#fff" : "var(--foreground)",
                border: `1px solid ${catFilter === c ? "transparent" : "var(--border)"}`,
              }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(p => {
          const isLow = p.stock <= p.minStock
          const daysToExpiry = Math.round((new Date(p.expiry).getTime() - Date.now()) / 86400000)
          return (
            <div key={p.id} className="card-hover rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
              <div className="h-2" style={{ background: isLow ? "var(--destructive)" : "var(--accent)" }} />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-sm leading-tight" style={{ color: "var(--foreground)" }}>{p.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{p.category}</p>
                  </div>
                  <p className="font-display font-black text-lg" style={{ color: "var(--primary)" }}>₹{p.price}</p>
                </div>
                <div className="space-y-1.5 mt-3">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "var(--muted-foreground)" }}>Stock</span>
                    <span className={`font-semibold font-mono ${isLow ? "text-red-500" : ""}`}>{p.stock} units</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "var(--muted-foreground)" }}>Expiry</span>
                    <span className={`font-mono ${daysToExpiry < 30 ? "text-amber-500 font-bold" : ""}`}>{daysToExpiry}d</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "var(--muted-foreground)" }}>Barcode</span>
                    <span className="font-mono text-xs" style={{ color: "var(--muted-foreground)" }}>{p.barcode.slice(-6)}</span>
                  </div>
                </div>
                {isLow && (
                  <div className="mt-3 text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600 font-semibold">⚠️ Low Stock — Reorder Now</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Billing ────────────────────────────────────────────────────────────────────
function BillingModule({ lang }: { lang: Lang }) {
  const [cart, setCart] = useState<{ product: typeof MOCK_PRODUCTS[0]; qty: number }[]>([])
  const [search, setSearch] = useState("")
  const [customer, setCustomer] = useState("Walk-in")

  function addToCart(p: typeof MOCK_PRODUCTS[0]) {
    setCart(prev => {
      const ex = prev.find(x => x.product.id === p.id)
      if (ex) return prev.map(x => x.product.id === p.id ? { ...x, qty: x.qty + 1 } : x)
      return [...prev, { product: p, qty: 1 }]
    })
  }

  function removeFromCart(id: number) {
    setCart(prev => prev.filter(x => x.product.id !== id))
  }

  const total = cart.reduce((s, x) => s + x.product.price * x.qty, 0)
  const filtered = MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-4 md:p-6">
      <h2 className="font-display font-black text-2xl mb-5" style={{ color: "var(--foreground)" }}>🧾 {TR[lang].billing}</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
        {/* Product picker */}
        <div className="md:col-span-3 space-y-4">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search to add product..."
            className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
            style={{ background: "var(--card)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map(p => (
              <button key={p.id} onClick={() => addToCart(p)}
                className="card-hover text-left p-3 rounded-xl border transition-all"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}>
                <p className="text-xs font-bold truncate" style={{ color: "var(--foreground)" }}>{p.name}</p>
                <p className="font-display font-bold text-base mt-1" style={{ color: "var(--primary)" }}>₹{p.price}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Stock: {p.stock}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Bill cart */}
        <div className="md:col-span-2 rounded-2xl border overflow-hidden flex flex-col" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)", background: "var(--secondary)" }}>
            <p className="font-display font-bold text-white">{TR[lang].newBill}</p>
            <input
              value={customer}
              onChange={e => setCustomer(e.target.value)}
              placeholder="Customer name"
              className="mt-2 w-full px-3 py-1.5 rounded-lg text-sm outline-none"
              style={{ background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: "var(--border)" }}>
            {cart.length === 0 && (
              <p className="text-center py-12 text-sm" style={{ color: "var(--muted-foreground)" }}>Click products to add ↑</p>
            )}
            {cart.map(x => (
              <div key={x.product.id} className="flex items-center px-5 py-3 gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--foreground)" }}>{x.product.name}</p>
                  <p className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>₹{x.product.price} × {x.qty}</p>
                </div>
                <p className="font-bold font-mono" style={{ color: "var(--foreground)" }}>₹{x.product.price * x.qty}</p>
                <button onClick={() => removeFromCart(x.product.id)} className="text-red-400 ml-2 hover:text-red-600">✕</button>
              </div>
            ))}
          </div>

          <div className="border-t p-5 space-y-3" style={{ borderColor: "var(--border)" }}>
            <div className="flex justify-between font-display font-black text-lg">
              <span style={{ color: "var(--foreground)" }}>Total</span>
              <span style={{ color: "var(--primary)" }}>₹{total.toLocaleString("en-IN")}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="py-2.5 rounded-xl text-sm font-bold border transition-all hover:opacity-80"
                style={{ borderColor: "var(--primary)", color: "var(--primary)" }}>💳 {TR[lang].khata}</button>
              <button className="py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{ background: "var(--primary)", color: "#fff" }}>✓ Print Bill</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Khata ──────────────────────────────────────────────────────────────────────
function KhataModule({ lang }: { lang: Lang }) {
  const total = MOCK_CUSTOMERS.reduce((s, c) => s + c.credit, 0)
  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>💳 {TR[lang].khata}</h2>
        <div className="text-right">
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{TR[lang].totalCredit}</p>
          <p className="font-display font-black text-2xl" style={{ color: "var(--destructive)" }}>₹{total.toLocaleString("en-IN")}</p>
        </div>
      </div>
      <div className="space-y-3">
        {MOCK_CUSTOMERS.map(c => (
          <div key={c.id} className="card-hover rounded-2xl border p-5 flex items-center gap-4"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center font-display font-black text-lg"
              style={{ background: c.credit > 0 ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", color: c.credit > 0 ? "var(--destructive)" : "var(--accent)" }}>
              {c.name[0]}
            </div>
            <div className="flex-1">
              <p className="font-bold" style={{ color: "var(--foreground)" }}>{c.name}</p>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>📞 {c.phone} · Last: {c.lastVisit}</p>
            </div>
            <div className="text-right">
              {c.credit > 0 ? (
                <>
                  <p className="font-display font-black text-lg text-red-500">₹{c.credit}</p>
                  <button className="text-xs px-3 py-1 rounded-lg mt-1 font-semibold"
                    style={{ background: "rgba(245,158,11,0.1)", color: "var(--primary)" }}>Send Reminder</button>
                </>
              ) : (
                <p className="font-semibold text-sm" style={{ color: "var(--accent)" }}>✅ Cleared</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── OCR ────────────────────────────────────────────────────────────────────────
function OCRModule({ lang }: { lang: Lang }) {
  const [state, setState] = useState<"idle" | "scanning" | "done">("idle")

  function simulate() {
    setState("scanning")
    setTimeout(() => setState("done"), 2500)
  }

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-xl mx-auto">
      <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>📸 {TR[lang].ocr}</h2>
      <div className="rounded-3xl border-2 border-dashed p-10 text-center flex flex-col items-center gap-4"
        style={{ borderColor: state === "scanning" ? "var(--primary)" : "var(--border)", background: "var(--card)" }}>
        {state === "idle" && <>
          <div className="text-6xl">📷</div>
          <p className="font-display font-bold text-lg" style={{ color: "var(--foreground)" }}>Scan or Upload a Bill</p>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>AI will auto-extract product names, prices, and quantities</p>
          <button onClick={simulate} className="px-6 py-3 rounded-2xl font-bold text-sm mt-2 transition-all hover:opacity-90"
            style={{ background: "var(--primary)", color: "#fff" }}>📷 Start Camera / Upload</button>
        </>}
        {state === "scanning" && <>
          <div className="text-6xl animate-bounce">🔍</div>
          <p className="font-display font-bold" style={{ color: "var(--primary)" }}>Scanning & Extracting...</p>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
            <div className="h-full rounded-full" style={{ background: "var(--primary)", width: "60%", transition: "width 0.5s" }} />
          </div>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>AI OCR processing in progress...</p>
        </>}
        {state === "done" && <>
          <div className="text-6xl">✅</div>
          <p className="font-display font-bold" style={{ color: "var(--accent)" }}>Extraction Complete!</p>
          <div className="w-full text-left space-y-2 mt-2">
            {[
              { name: "Parle-G 1kg", qty: 2, price: 80 },
              { name: "Maggi 70g ×6", qty: 1, price: 84 },
              { name: "Tata Salt 1kg", qty: 3, price: 84 },
            ].map((x, i) => (
              <div key={i} className="flex justify-between px-4 py-2 rounded-xl" style={{ background: "var(--muted)" }}>
                <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{x.name}</span>
                <span className="font-mono text-sm" style={{ color: "var(--primary)" }}>₹{x.price}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-2">
            <button onClick={() => setState("idle")} className="flex-1 py-2.5 rounded-xl text-sm font-bold border"
              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>Scan Another</button>
            <button className="flex-1 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: "var(--primary)", color: "#fff" }}>Add to Inventory</button>
          </div>
        </>}
      </div>
    </div>
  )
}

// ── Supplier ───────────────────────────────────────────────────────────────────
function SupplierModule({ lang }: { lang: Lang }) {
  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>🛒 {TR[lang].supplier}</h2>
        <button className="px-4 py-2 rounded-xl text-sm font-bold"
          style={{ background: "var(--primary)", color: "#fff" }}>+ Add Supplier</button>
      </div>

      {/* Smart restock banner */}
      <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg, var(--secondary), #2D5A8E)" }}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔮</span>
          <div>
            <p className="font-display font-bold text-white mb-1">{TR[lang].smartRestock}</p>
            <p className="text-sm opacity-80 text-white">AI recommends ordering: <strong>Colgate Toothpaste ×24, Amul Butter ×12</strong> before Thursday.</p>
            <button className="mt-3 px-4 py-2 rounded-lg text-sm font-bold"
              style={{ background: "var(--primary)", color: "#fff" }}>Auto-Generate Order</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MOCK_SUPPLIERS.map(s => (
          <div key={s.id} className="card-hover rounded-2xl border p-5 space-y-3"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold font-display" style={{ color: "var(--foreground)" }}>{s.name}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.category}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(16,185,129,0.1)", color: "var(--accent)" }}>
                ⭐ {s.rating}
              </span>
            </div>
            <div className="flex gap-2 text-xs">
              <span style={{ color: "var(--muted-foreground)" }}>Last order:</span>
              <span className="font-semibold" style={{ color: "var(--foreground)" }}>{s.lastOrder}</span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded-xl text-xs font-bold border"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>📞 {s.contact}</button>
              <button className="flex-1 py-2 rounded-xl text-xs font-bold"
                style={{ background: "var(--primary)", color: "#fff" }}>{TR[lang].orderNow}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Analytics ──────────────────────────────────────────────────────────────────
function AnalyticsModule({ lang }: { lang: Lang }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const sales = [1240, 890, 1560, 1100, 2340, 3100, 2800]
  const maxSales = Math.max(...sales)

  return (
    <div className="p-4 md:p-6 space-y-5">
      <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>📊 {TR[lang].analytics}</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="💰" label="Weekly Sales" value="₹13,030" sub="↑ 18% vs last week" color="var(--accent)" />
        <StatCard icon="📦" label="Items Sold" value="486" sub="Avg 69/day" />
        <StatCard icon="💳" label="Credit Sales" value="₹4,100" sub="12 customers" color="var(--destructive)" />
        <StatCard icon="🏆" label="Top Product" value="Parle-G" sub="₹1,960 this week" color="var(--primary)" />
      </div>

      {/* Weekly bar chart */}
      <div className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <h3 className="font-display font-bold mb-5" style={{ color: "var(--foreground)" }}>Weekly Sales Trend</h3>
        <div className="flex items-end gap-3 h-40">
          {days.map((d, i) => (
            <div key={d} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
                ₹{(sales[i] / 1000).toFixed(1)}k
              </span>
              <div className="w-full rounded-t-lg transition-all" style={{
                height: `${(sales[i] / maxSales) * 100}%`,
                background: i === 5 ? "var(--primary)" : "var(--secondary)",
                opacity: i === 5 ? 1 : 0.6,
              }} />
              <span className="text-xs font-semibold" style={{ color: i === 5 ? "var(--primary)" : "var(--muted-foreground)" }}>{d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category breakdown */}
      <div className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <h3 className="font-display font-bold mb-4" style={{ color: "var(--foreground)" }}>Sales by Category</h3>
        <div className="space-y-3">
          {[
            { cat: "Grocery", pct: 38, color: "var(--primary)" },
            { cat: "Snacks", pct: 24, color: "var(--accent)" },
            { cat: "Dairy", pct: 18, color: "var(--secondary)" },
            { cat: "FMCG", pct: 12, color: "#8B5CF6" },
            { cat: "Others", pct: 8, color: "var(--muted-foreground)" },
          ].map(x => (
            <div key={x.cat} className="flex items-center gap-3">
              <span className="w-24 text-sm font-semibold shrink-0" style={{ color: "var(--foreground)" }}>{x.cat}</span>
              <div className="flex-1 h-3 rounded-full" style={{ background: "var(--muted)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${x.pct}%`, background: x.color }} />
              </div>
              <span className="w-10 text-right text-sm font-mono font-bold" style={{ color: x.color }}>{x.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── AICopilot ──────────────────────────────────────────────────────────────────
function AICopilotModule({ lang }: { lang: Lang }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Namaste! 🙏 I'm your DukaanOS AI Copilot. I can help you with inventory, billing advice, customer insights, and business tips. What can I do for you today?" }
  ])
  const [input, setInput] = useState("")

  function sendMessage() {
    if (!input.trim()) return
    const q = input.trim()
    setInput("")
    setMessages(prev => [...prev,
      { role: "user", text: q },
      { role: "assistant", text: "Let me analyze your shop data... Based on your sales trends, I'd recommend focusing on restocking your fast-moving items and considering a promotional offer on slow-moving stock before expiry. Would you like a detailed breakdown?" }
    ])
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>🤖 {TR[lang].copilot}</h2>

      {/* Suggestions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {AI_SUGGESTIONS.map((s, i) => (
          <div key={i} className="card-hover rounded-2xl border p-4 space-y-2"
            style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{s.icon}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${s.priority === "high" ? "bg-red-100 text-red-600" : s.priority === "medium" ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"}`}>
                {s.priority}
              </span>
            </div>
            <p className="font-bold text-sm" style={{ color: "var(--foreground)" }}>{s.title}</p>
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.desc}</p>
            <button className="text-xs font-semibold" style={{ color: "var(--primary)" }}>Take Action →</button>
          </div>
        ))}
      </div>

      {/* Chat */}
      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: "var(--border)", background: "var(--secondary)" }}>
          <span className="text-xl">🤖</span>
          <div>
            <p className="font-display font-bold text-white text-sm">AI Shopkeeper Copilot</p>
            <p className="text-xs opacity-60 text-white">Powered by DukaanOS Intelligence</p>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-green-400" />
        </div>
        <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-xs md:max-w-md px-4 py-2.5 rounded-2xl text-sm"
                style={{
                  background: m.role === "user" ? "var(--primary)" : "var(--muted)",
                  color: m.role === "user" ? "#fff" : "var(--foreground)",
                  borderRadius: m.role === "user" ? "1.5rem 1.5rem 0 1.5rem" : "1.5rem 1.5rem 1.5rem 0",
                }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 pb-4 flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Ask about your shop, inventory, analytics..."
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none border"
            style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
          <button onClick={sendMessage} className="px-4 py-2.5 rounded-xl font-bold text-sm"
            style={{ background: "var(--primary)", color: "#fff" }}>Send</button>
        </div>
      </div>
    </div>
  )
}

// ── Voice ──────────────────────────────────────────────────────────────────────
function VoiceModule({ lang }: { lang: Lang }) {
  const [state, setState] = useState<"idle" | "listening" | "processing" | "done">("idle")
  const [transcript, setTranscript] = useState("")

  function startListening() {
    setState("listening")
    setTimeout(() => {
      setState("processing")
      setTranscript(lang === "hi" ? "कितना स्टॉक बचा है कोलगेट का?" : lang === "bn" ? "কোলগেটের কত স্টক বাকি আছে?" : "How much Colgate stock is remaining?")
      setTimeout(() => setState("done"), 1500)
    }, 2500)
  }

  const responses = {
    en: "Colgate Toothpaste has 3 units remaining. This is below your minimum stock level of 15. I recommend ordering 24 units from HUL distributor.",
    hi: "कोलगेट टूथपेस्ट में 3 यूनिट बची हैं। यह आपके न्यूनतम स्टॉक 15 से कम है। HUL डिस्ट्रीब्यूटर से 24 यूनिट ऑर्डर करने की सलाह है।",
    bn: "কোলগেট টুথপেস্টে ৩টি ইউনিট বাকি আছে। এটি আপনার ন্যূনতম স্টক ১৫-এর নিচে। HUL ডিস্ট্রিবিউটর থেকে ২৪টি ইউনিট অর্ডার করার পরামর্শ।"
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto space-y-6">
      <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>🎙️ {TR[lang].voice}</h2>

      <div className="rounded-3xl border text-center p-10 flex flex-col items-center gap-6"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        {/* Mic button */}
        <button
          onClick={state === "idle" || state === "done" ? startListening : undefined}
          className="relative w-28 h-28 rounded-full flex items-center justify-center text-4xl transition-all"
          style={{
            background: state === "listening" ? "var(--destructive)" : "var(--primary)",
            boxShadow: state === "listening" ? "0 0 0 16px rgba(239,68,68,0.2), 0 0 0 32px rgba(239,68,68,0.1)" : "0 8px 32px rgba(245,158,11,0.4)",
          }}
        >
          🎙️
          {state === "listening" && (
            <span className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping" />
          )}
        </button>

        <div>
          <p className="font-display font-bold text-lg" style={{ color: "var(--foreground)" }}>
            {state === "idle" ? "Tap to speak" : state === "listening" ? "Listening..." : state === "processing" ? "Processing..." : "Response ready"}
          </p>
          {transcript && (
            <div className="mt-3 px-4 py-3 rounded-xl text-left" style={{ background: "var(--muted)" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--muted-foreground)" }}>You said:</p>
              <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>"{transcript}"</p>
            </div>
          )}
          {state === "done" && (
            <div className="mt-3 px-4 py-3 rounded-xl text-left" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--primary)" }}>🤖 AI Response:</p>
              <p className="text-sm" style={{ color: "var(--foreground)" }}>{responses[lang]}</p>
            </div>
          )}
        </div>

        <div className="w-full space-y-2 text-left">
          <p className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>Try saying:</p>
          {[
            lang === "hi" ? "\"आज कितनी बिक्री हुई?\"" : lang === "bn" ? "\"আজ কত বিক্রি হয়েছে?\"" : "\"How much did I sell today?\"",
            lang === "hi" ? "\"रमेश का उधार कितना है?\"" : lang === "bn" ? "\"রমেশের ধার কত?\"" : "\"What is Ramesh's credit balance?\"",
            lang === "hi" ? "\"कोलगेट का ऑर्डर दो\"" : lang === "bn" ? "\"কোলগেট অর্ডার করো\"" : "\"Order more Colgate\"",
          ].map((t, i) => (
            <div key={i} className="px-3 py-2 rounded-lg text-xs font-mono" style={{ background: "var(--muted)", color: "var(--foreground)" }}>{t}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Settings ───────────────────────────────────────────────────────────────────
function SettingsModule({ lang, setLang, theme, setTheme }: { lang: Lang; setLang: (l: Lang) => void; theme: Theme; setTheme: (t: Theme) => void }) {
  const themes: { value: Theme; label: string; desc: string }[] = [
    { value: "light", label: "Light", desc: "Clean warm cream background" },
    { value: "dark", label: "Dark", desc: "Easy on eyes at night" },
    { value: "saffron", label: "Saffron 🧡", desc: "Vibrant Indian saffron palette" },
  ]
  const langs: { value: Lang; label: string; native: string; flag: string }[] = [
    { value: "en", label: "English", native: "English", flag: "🇬🇧" },
    { value: "hi", label: "Hindi", native: "हिंदी", flag: "🇮🇳" },
    { value: "bn", label: "Bengali", native: "বাংলা", flag: "🇧🇩" },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl">
      <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>⚙️ {TR[lang].settings}</h2>

      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-display font-bold" style={{ color: "var(--foreground)" }}>{TR[lang].selectTheme}</h3>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {themes.map(t => (
            <button key={t.value} onClick={() => setTheme(t.value)}
              className="flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left"
              style={{
                borderColor: theme === t.value ? "var(--primary)" : "var(--border)",
                background: theme === t.value ? "rgba(245,158,11,0.06)" : "transparent",
              }}>
              <div className="w-8 h-8 rounded-full border-2" style={{
                background: t.value === "light" ? "#FFFBF3" : t.value === "dark" ? "#0F172A" : "#FFF7ED",
                borderColor: t.value === "light" ? "#F59E0B" : t.value === "dark" ? "#FBBF24" : "#EA580C",
              }} />
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: "var(--foreground)" }}>{t.label}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{t.desc}</p>
              </div>
              {theme === t.value && <span style={{ color: "var(--primary)" }}>✓</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-display font-bold" style={{ color: "var(--foreground)" }}>🌐 {TR[lang].chooseLanguage}</h3>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {langs.map(l => (
            <button key={l.value} onClick={() => setLang(l.value)}
              className="flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left"
              style={{
                borderColor: lang === l.value ? "var(--primary)" : "var(--border)",
                background: lang === l.value ? "rgba(245,158,11,0.06)" : "transparent",
              }}>
              <span className="text-2xl">{l.flag}</span>
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: "var(--foreground)" }}>{l.native}</p>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{l.label}</p>
              </div>
              {lang === l.value && <span style={{ color: "var(--primary)" }}>✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Contact ────────────────────────────────────────────────────────────────────
function ContactModule({ lang }: { lang: Lang }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" })
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
    setTimeout(() => setSent(false), 3000)
    setForm({ name: "", email: "", message: "" })
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <h2 className="font-display font-black text-2xl" style={{ color: "var(--foreground)" }}>📞 {TR[lang].contact}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact info */}
        <div className="space-y-4">
          <div className="rounded-2xl p-6" style={{ background: "var(--secondary)" }}>
            <h3 className="font-display font-bold text-xl text-white mb-4">DukaanOS Support</h3>
            <div className="space-y-3">
              {[
                { icon: "📞", label: "Phone", value: "1800-DUKAAN-OS (Free)" },
                { icon: "📧", label: "Email", value: "help@dukaanos.in" },
                { icon: "💬", label: "WhatsApp", value: "+91 98765 00000" },
                { icon: "🕐", label: "Hours", value: "Mon–Sat, 8 AM – 9 PM" },
              ].map(x => (
                <div key={x.label} className="flex items-center gap-3">
                  <span className="text-xl">{x.icon}</span>
                  <div>
                    <p className="text-xs opacity-60 text-white">{x.label}</p>
                    <p className="text-sm font-semibold text-white">{x.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border p-5" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <h3 className="font-display font-bold mb-3" style={{ color: "var(--foreground)" }}>Quick Help</h3>
            <div className="space-y-2">
              {["How to add products?", "Set up printer?", "Export sales report", "Backup & sync data"].map(q => (
                <button key={q} className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-between"
                  style={{ background: "var(--muted)", color: "var(--foreground)" }}>
                  {q} <span style={{ color: "var(--primary)" }}>→</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contact form */}
        <form onSubmit={handleSubmit} className="rounded-2xl border p-6 space-y-4"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <h3 className="font-display font-bold" style={{ color: "var(--foreground)" }}>{TR[lang].sendMessage}</h3>

          {[
            { key: "name" as const, label: TR[lang].yourName, type: "text" },
            { key: "email" as const, label: TR[lang].email, type: "email" },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>{f.label}</label>
              <input
                type={f.type}
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none border"
                style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--foreground)" }}>{TR[lang].message}</label>
            <textarea
              value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none border resize-none"
              style={{ background: "var(--muted)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
          </div>

          {sent && (
            <div className="px-4 py-3 rounded-xl text-sm font-semibold" style={{ background: "rgba(16,185,129,0.1)", color: "var(--accent)" }}>
              ✅ Message sent! We'll respond within 24 hours.
            </div>
          )}

          <button type="submit" className="w-full py-3 rounded-xl font-bold transition-all hover:opacity-90"
            style={{ background: "var(--primary)", color: "#fff" }}>
            {TR[lang].send} →
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Module order for prev/next navigation ─────────────────────────────────────

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome")
  const [lang, setLang] = useState<Lang>("en")
  const [theme, setTheme] = useState<Theme>("light")
  const [activeModule, setActiveModule] = useState<Module>("dashboard")
  const [shopInfo, setShopInfo] = useState({ shopName: "My Shop", ownerName: "Shopkeeper" })
  const [online, setOnline] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [showThemePage, setShowThemePage] = useState(false)

  useEffect(() => {
    const body = document.documentElement
    body.classList.remove("dark", "theme-saffron")
    if (theme === "dark") body.classList.add("dark")
    if (theme === "saffron") body.classList.add("theme-saffron")
  }, [theme])

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncing(true)
      setTimeout(() => setSyncing(false), 1500)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  function handleLogin(info: { shopName: string; ownerName: string }) {
    setShopInfo(info)
    setScreen("app")
  }

  if (screen === "welcome") {
    return <WelcomeScreen onEnter={() => setScreen("language")} lang={lang} />
  }
  if (screen === "language") {
    return (
      <LanguageScreen
        currentLang={lang}
        onSelect={l => { setLang(l); setScreen("login") }}
        onBack={() => setScreen("welcome")}
      />
    )
  }
  if (screen === "login") {
    return <LoginScreen lang={lang} onLogin={handleLogin} onBack={() => setScreen("language")} />
  }

  const moduleMap: Record<Module, React.ReactNode> = {
    dashboard: <Dashboard lang={lang} shopInfo={shopInfo} />,
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
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      <TopBar
        lang={lang} setLang={setLang}
        theme={theme}
        activeModule={activeModule} setModule={setActiveModule}
        shopName={shopInfo.shopName}
        online={online} syncing={syncing}
        onOpenTheme={() => setShowThemePage(true)}
      />

      <main className="flex-1 max-w-6xl mx-auto w-full">
        {moduleMap[activeModule]}
      </main>

      <Footer lang={lang} setModule={setActiveModule} />

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
