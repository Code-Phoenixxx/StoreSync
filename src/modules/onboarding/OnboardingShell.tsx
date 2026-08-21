import React from "react"

export default function OnboardingShell({
  step,
  totalSteps,
  onBack,
  children,
}: {
  step: number
  totalSteps: number
  onBack?: () => void
  children: React.ReactNode
}) {
  const stepLabels = ["Welcome", "Language", "Shop Setup"]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Top nav strip */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b shadow-sm"
        style={{ borderColor: "var(--border)", background: "var(--card)" }}
      >
        {/* Back button */}
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:opacity-80 group cursor-pointer"
            style={{ background: "var(--muted)", color: "var(--foreground)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform group-hover:-translate-x-0.5">
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
