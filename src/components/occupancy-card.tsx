import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export interface MoveEvent {
  tenant: string
  space: string
  sf: number
  date: string
  type: "move-in" | "move-out"
}

export interface VacantSpace {
  space: string
  sf: number
  daysVacant: number
}

export interface NearTermExpiration {
  tenant: string
  space: string
  sf: number
  date: string
}

interface OccupancyCardProps {
  occupiedSf: number
  vacantSf: number
  occupancyTrend?: "up" | "down" | "flat"
  moveEvents: MoveEvent[]
  vacantSpaces: VacantSpace[]
  expirations: NearTermExpiration[]
  className?: string
}

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return n.toLocaleString()
}

const OccupancyCard = React.forwardRef<HTMLDivElement, OccupancyCardProps>(
  ({ occupiedSf, vacantSf, occupancyTrend = "flat", moveEvents, vacantSpaces, expirations, className }, ref) => {
    const totalSf = occupiedSf + vacantSf
    const occupiedPct = Math.round((occupiedSf / totalSf) * 100)
    const vacantPct = 100 - occupiedPct

    const TrendIcon = occupancyTrend === "up" ? TrendingUp : occupancyTrend === "down" ? TrendingDown : Minus
    const trendColor = occupancyTrend === "up" ? "text-success" : occupancyTrend === "down" ? "text-destructive" : "text-muted-foreground"

    return (
      <div ref={ref} className={cn(cardBase, "flex flex-col gap-5", className)}>

        {/* Section 1: Current Occupancy */}
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Occupancy</p>
          <div className="flex items-end justify-between mb-2">
            <div>
              <span className="text-3xl font-medium text-foreground">{occupiedPct}%</span>
              <span className="text-sm text-muted-foreground ml-1.5">occupied</span>
            </div>
            <div className={cn("flex items-center gap-1 text-xs font-medium mb-1", trendColor)}>
              <TrendIcon className="h-3.5 w-3.5" />
              <span>{vacantPct}% vacant</span>
            </div>
          </div>
          {/* Bar */}
          <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${occupiedPct}%` }} />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground tabular-nums">
            <span>{fmt(occupiedSf)} sf occupied</span>
            <span>{fmt(vacantSf)} sf vacant</span>
          </div>
        </div>

        <div className="h-px bg-border/50" />

        {/* Section 2: Upcoming move-ins & move-outs */}
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Upcoming move-ins & move-outs</p>
          <div className="flex flex-col gap-1.5">
            {moveEvents.map((e, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn(
                    "shrink-0 h-1.5 w-1.5 rounded-full",
                    e.type === "move-in" ? "bg-success" : "bg-destructive"
                  )} />
                  <span className="text-xs font-medium text-foreground truncate">{e.tenant}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-[11px] text-muted-foreground tabular-nums">
                  <span>{fmt(e.sf)} sf</span>
                  <span className="text-foreground/60">{e.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-border/50" />

        {/* Section 3: Vacant spaces */}
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Vacant spaces</p>
          <div className="flex flex-col gap-1.5">
            {vacantSpaces.map((v, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-foreground truncate">{v.space}</span>
                <div className="flex items-center gap-2 shrink-0 text-[11px] text-muted-foreground tabular-nums">
                  <span>{fmt(v.sf)} sf</span>
                  <span className={cn(
                    "text-[10px] font-medium",
                    v.daysVacant > 180 ? "text-destructive" : v.daysVacant > 90 ? "text-warning" : "text-muted-foreground"
                  )}>{v.daysVacant} d</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-border/50" />

        {/* Section 4: Near-Term Lease Expirations */}
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Near-Term Expirations</p>
          <div className="flex flex-col gap-1.5">
            {expirations.map((e, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-xs font-medium text-foreground truncate block">{e.tenant}</span>
                  <span className="text-[10px] text-muted-foreground">{e.space}</span>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-[11px] font-medium text-foreground block">{e.date}</span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">{fmt(e.sf)} sf</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    )
  }
)
OccupancyCard.displayName = "OccupancyCard"

export { OccupancyCard }
export type { OccupancyCardProps }
