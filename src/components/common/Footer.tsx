import { Lang, Module } from "../../types"
import { TR } from "../../constants/translations"

export default function Footer({ lang, setModule }: { lang: Lang; setModule: (m: Module) => void }) {
  const year = new Date().getFullYear()

  const columns: { heading: string; links: { label: string; module?: Module }[] }[] = [
    {
      heading: "Modules",
      links: [
        { label: TR[lang].catalogue, module: "catalogue" },
        { label: TR[lang].billing, module: "billing" },
        { label: TR[lang].khata, module: "khata" },
        { label: TR[lang].ocr, module: "ocr" },
        { label: TR[lang].supplier, module: "supplier" },
      ],
    },
    {
      heading: "Tools",
      links: [
        { label: TR[lang].analytics, module: "analytics" },
        { label: TR[lang].copilot, module: "copilot" },
        { label: TR[lang].voice, module: "voice" },
        { label: TR[lang].settings, module: "settings" },
      ],
    },
    {
      heading: "Support",
      links: [
        { label: TR[lang].contact, module: "contact" },
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
    <footer className="border-t mt-12 shadow-2xl" style={{ background: "var(--secondary)", borderColor: "rgba(255,255,255,0.08)" }}>
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
                        style={{ color: "rgba(255,255,255,0.65)" }}
                      >
                        {link.label}
                      </button>
                    ) : (
                      <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {link.label}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t mb-6" style={{ borderColor: "rgba(255,255,255,0.08)" }} />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            <div>
              <p className="font-display font-black text-base" style={{ color: "var(--primary)" }}>
                DukaanOS
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                Offline-first · AI-powered · Made for Bharat
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
              🌐 EN · हिंदी · বাংলা
            </span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              © {year} DukaanOS. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
