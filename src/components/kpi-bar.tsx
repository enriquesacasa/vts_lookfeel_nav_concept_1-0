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
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">
            {kpi.label}
          </p>
          <p className="text-lg font-medium text-foreground">{kpi.value}</p>
        </div>
      ))}
    </div>
  )
)
KpiBar.displayName = "KpiBar"

export { KpiBar }
export type { KpiBarProps }
