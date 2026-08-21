interface StatCardProps {
  icon: string
  label: string
  value: string
  sub?: string
  color?: string
}

export default function StatCard({ icon, label, value, sub, color }: StatCardProps) {
  return (
    <div
      className="card-hover rounded-2xl p-5 border shadow-sm transition-all"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
            {label}
          </p>
          <p className="text-2xl font-bold mt-1 font-display" style={{ color: color || "var(--foreground)" }}>
            {value}
          </p>
          {sub && (
            <p className="text-xs mt-1 font-medium" style={{ color: "var(--muted-foreground)" }}>
              {sub}
            </p>
          )}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}
