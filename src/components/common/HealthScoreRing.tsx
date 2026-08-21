import { Lang } from "../../types"
import { TR } from "../../constants/translations"

export default function HealthScoreRing({ score, lang }: { score: number; lang: Lang }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? "#10B981" : score >= 50 ? "#F59E0B" : "#EF4444"

  return (
    <div
      className="card-hover rounded-2xl p-6 border flex flex-col items-center justify-center shadow-sm"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <p className="font-display font-bold text-lg mb-4" style={{ color: "var(--foreground)" }}>
        {TR[lang].healthScore}
      </p>
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
          <circle cx="64" cy="64" r={r} fill="none" stroke="var(--border)" strokeWidth="12" />
          <circle
            cx="64"
            cy="64"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.4s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-black" style={{ color }}>
            {score}
          </span>
          <span className="text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>
            / 100
          </span>
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold" style={{ color }}>
        {score >= 75 ? "🟢 Excellent" : score >= 50 ? "🟡 Good" : "🔴 Needs Attention"}
      </p>
    </div>
  )
}
