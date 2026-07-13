import * as React from "react"
import { PieChart, Pie, Cell } from "recharts"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface VacantSpace {
  space: string
  sf: number
  daysVacant: number
}

interface AvailabilityOverviewProps {
  occupiedSf: number
  vacantSf: number
  vacantSpaces?: VacantSpace[]
  className?: string
}

function fmt(n: number) { return n.toLocaleString() }
function fmtM(n: number) { return (n / 1_000_000).toFixed(1) + "M" }

function fmtK(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n.toLocaleString() }

const AvailabilityOverview = React.forwardRef<HTMLDivElement, AvailabilityOverviewProps>(
  ({ occupiedSf, vacantSf, vacantSpaces, className }, ref) => {
    const totalSf = occupiedSf + vacantSf
    const occupiedPct = Math.round((occupiedSf / totalSf) * 100)
    const vacantPct = 100 - occupiedPct
    const data = [
      { name: "Occupied", value: occupiedSf },
      { name: "Vacant",   value: vacantSf },
    ]

    return (
      <div ref={ref} className={cn(
        cardBase,
        className
      )}>
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 mb-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Overview</p>
            <h2 className="text-xl font-semibold text-foreground">Occupancy</h2>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 text-primary border-primary bg-transparent hover:bg-primary/10 hover:text-primary dark:bg-white/8 dark:border-white/25 dark:text-white dark:hover:bg-white/15">
            View Stacking Plan
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-5">
          <div className="relative shrink-0 w-[168px] h-[168px]">
            <PieChart width={168} height={168}>
              <Pie data={data} innerRadius={52} outerRadius={72}
                startAngle={90} endAngle={-270} dataKey="value" strokeWidth={0}
                isAnimationActive={false}>
                <Cell style={{ fill: "var(--color-primary)" }} />
                <Cell style={{ fill: "var(--color-muted-foreground)", fillOpacity: 0.2 }} />
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Total SF</span>
              <span className="text-lg font-bold text-foreground">{fmtM(totalSf)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-5 flex-1">
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ background: "var(--color-primary)" }} />
                  <span className="text-xs text-muted-foreground">Occupied</span>
                </div>
                <span className="text-sm font-semibold text-muted-foreground">{occupiedPct}%</span>
              </div>
              <p className="text-xl font-semibold pl-4 whitespace-nowrap" style={{ color: "var(--color-primary)" }}>
                {fmt(occupiedSf)}<span className="text-xs font-normal text-muted-foreground ml-1">sf</span>
              </p>
            </div>
            <div className="h-px bg-border/60" />
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/30 shrink-0" />
                  <span className="text-xs text-muted-foreground">Vacant</span>
                </div>
                <span className="text-sm font-semibold text-muted-foreground">{vacantPct}%</span>
              </div>
              <p className="text-xl font-semibold text-foreground pl-4 whitespace-nowrap">
                {fmt(vacantSf)}<span className="text-xs font-normal text-muted-foreground ml-1">sf</span>
              </p>
            </div>
          </div>
        </div>

        {vacantSpaces && vacantSpaces.length > 0 && (
          <>
            <div className="h-px bg-border/60 mt-5" />
            <div className="mt-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Vacant Spaces</p>
              <div className="flex flex-col gap-2">
                {vacantSpaces.map((v, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 rounded-md px-2 py-1 -mx-2 cursor-pointer hover:bg-muted/40 dark:hover:bg-white/4 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-foreground truncate">{v.space}</span>
                      <span className="text-sm text-muted-foreground shrink-0">{fmtK(v.sf)} sf</span>
                    </div>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums shrink-0",
                      v.daysVacant > 180
                        ? "bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
                        : v.daysVacant > 90
                          ? "bg-orange-500/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400"
                          : "bg-primary/10 text-primary dark:bg-primary/15"
                    )}>{v.daysVacant} d</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    )
  }
)
AvailabilityOverview.displayName = "AvailabilityOverview"

export { AvailabilityOverview }
export type { AvailabilityOverviewProps }
