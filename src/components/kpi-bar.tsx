import * as React from "react"
import { cn, cardBase } from "@/lib/utils"

export interface Kpi {
  label: string
  value: string
  subtitle?: string
  trend?: "up" | "down"
}

interface KpiBarProps {
  kpis: Kpi[]
  className?: string
}

const KpiBar = React.forwardRef<HTMLDivElement, KpiBarProps>(
  ({ kpis, className }, ref) => (
    <div ref={ref} className={cn(cardBase, "flex flex-wrap divide-x divide-border/60 !p-0 overflow-hidden", className)}>
      {kpis.map((kpi) => (
        <div key={kpi.label} className="flex-1 min-w-[120px] px-5 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
            {kpi.label}
          </p>
          <p className="text-lg font-semibold text-foreground">{kpi.value}</p>
          {kpi.subtitle && (
            <p className={cn(
              "text-xs font-semibold flex items-center gap-0.5 mt-0.5",
              kpi.trend === "up" ? "text-emerald-500" : kpi.trend === "down" ? "text-rose-500" : "text-muted-foreground"
            )}>
              {kpi.trend === "up" ? "↗" : kpi.trend === "down" ? "↘" : ""}{kpi.trend ? " " : ""}{kpi.subtitle}
            </p>
          )}
        </div>
      ))}
    </div>
  )
)
KpiBar.displayName = "KpiBar"

export { KpiBar }
export type { KpiBarProps }
