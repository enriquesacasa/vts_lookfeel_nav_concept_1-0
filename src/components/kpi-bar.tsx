import * as React from "react"
import { cn, cardBase } from "@/lib/utils"

export interface Kpi {
  label: string
  value: string
  valueNode?: React.ReactNode
  subtitle?: string
  subtitleNode?: React.ReactNode
  trend?: "up" | "down"
  cellClassName?: string
  onClick?: () => void
}

interface KpiBarProps {
  kpis: Kpi[]
  className?: string
}

const KpiBar = React.forwardRef<HTMLDivElement, KpiBarProps>(
  ({ kpis, className }, ref) => (
    <div ref={ref} className={cn(cardBase, "flex flex-wrap divide-x divide-border/60 !p-0 overflow-hidden", className)}>
      {kpis.map((kpi) => (
        <div key={kpi.label} className={cn("flex-1 min-w-[120px] px-5 py-3 transition-colors", kpi.onClick && "cursor-pointer", kpi.cellClassName, kpi.onClick && !kpi.cellClassName && "hover:bg-muted/40", kpi.onClick && kpi.cellClassName && "hover:brightness-95")} onClick={kpi.onClick}>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">
            {kpi.label}
          </p>
          {kpi.valueNode ? (
            <div className="mt-0.5">{kpi.valueNode}</div>
          ) : (
            <p className="text-xl font-medium text-foreground">{kpi.value}</p>
          )}
          {kpi.subtitleNode ? (
            <div className="mt-1">{kpi.subtitleNode}</div>
          ) : kpi.subtitle ? (
            <p className={cn(
              "text-xs font-medium mt-1",
              kpi.trend === "up" ? "text-success" : kpi.trend === "down" ? "text-destructive" : "text-muted-foreground"
            )}>
              {kpi.subtitle}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  )
)
KpiBar.displayName = "KpiBar"

export { KpiBar }
export type { KpiBarProps }
