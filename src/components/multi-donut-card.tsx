import * as React from "react"
import { PieChart, Pie, Cell } from "recharts"
import { cn, cardBase } from "@/lib/utils"

export interface DonutSegment {
  label: string
  pct: number
  colorVar: string  // e.g. "--color-chart-1"
  dotClass: string
}

interface MultiDonutCardProps {
  eyebrow: string
  title: string
  segments: DonutSegment[]
  centerLabel: string
  centerSub?: string
  className?: string
}

const MultiDonutCard = React.forwardRef<HTMLDivElement, MultiDonutCardProps>(
  ({ eyebrow, title, segments, centerLabel, centerSub, className }, ref) => {
    const data = segments.map(s => ({
      name: s.label,
      value: s.pct === 0 ? 0.001 : s.pct,
    }))

    return (
      <div ref={ref} className={cn(
        cardBase,
        className
      )}>
        <div className="mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">{eyebrow}</p>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative shrink-0 w-[120px] h-[120px]">
            <PieChart width={120} height={120}>
              <Pie
                data={data}
                innerRadius={36} outerRadius={52}
                startAngle={90} endAngle={-270}
                dataKey="value"
                strokeWidth={2}
                stroke="var(--color-background)"
                paddingAngle={1}
                isAnimationActive={false}
              >
                {segments.map((s, i) => (
                  <Cell
                    key={i}
                    style={{
                      fill: `var(${s.colorVar})`,
                      fillOpacity: s.pct === 0 ? 0 : 1,
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[12px] font-bold text-foreground leading-none">{centerLabel}</span>
              {centerSub && (
                <span className="text-[8px] text-muted-foreground mt-0.5">{centerSub}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {segments.map(s => (
              <div key={s.label} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={cn("h-2 w-2 rounded-full shrink-0", s.dotClass)} />
                  <span className="text-[10px] text-muted-foreground truncate">{s.label}</span>
                </div>
                <span className="text-[11px] font-semibold text-foreground tabular-nums shrink-0">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
)
MultiDonutCard.displayName = "MultiDonutCard"

export { MultiDonutCard }
export type { MultiDonutCardProps }
