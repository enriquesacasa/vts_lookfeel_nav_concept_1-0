import * as React from "react"
import { BarChart, Bar, XAxis, YAxis, Cell, LabelList, ResponsiveContainer } from "recharts"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ExpiringYear {
  year: number
  sf: number
  revenue: string
}

interface ExpiringTenantsProps {
  data: ExpiringYear[]
  className?: string
}

function YearTick({ x, y, payload }: any) {
  return (
    <text x={x} y={y} dy={10} textAnchor="middle" style={{ fill: "var(--color-sidebar-foreground)", opacity: 0.5, fontSize: 9 }}>
      {payload.value}
    </text>
  )
}

function BarLabel({ x, y, width, value: _value, index, data: bars }: any) {
  const bar = bars[index]
  if (!bar || bar.sf === 0) return null
  const cx = x + width / 2
  return (
    <g>
      <text x={cx} y={y - 18} textAnchor="middle" style={{ fill: "var(--color-sidebar-foreground)", fontSize: 12, fontWeight: 500 }}>
        {bar.sf}K
      </text>
      <text x={cx} y={y - 5} textAnchor="middle" style={{ fill: "var(--color-sidebar-foreground)", opacity: 0.55, fontSize: 9 }}>
        {bar.revenue}
      </text>
    </g>
  )
}

const ExpiringTenants = React.forwardRef<HTMLDivElement, ExpiringTenantsProps>(
  ({ data, className }, ref) => {
    return (
      <div ref={ref} className={cn(cardBase, "flex flex-col border-transparent bg-sidebar", className)}>
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 mb-4 shrink-0">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest mb-1 text-sidebar-foreground/75">Leases</p>
            <h2 className="text-xl font-semibold text-sidebar-foreground">Expiring Tenants by SF</h2>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 text-white/80 border-white/25 bg-transparent hover:bg-white/10 hover:text-white dark:bg-white/8 dark:border-white/25 dark:text-white dark:hover:bg-white/15">View Expiring Leases</Button>
        </div>

        <div className="flex-1">
        <ResponsiveContainer width="100%" height={data.length * 24 + 40} minWidth={0}>
          <BarChart data={data} margin={{ top: 28, right: 4, bottom: 4, left: 4 }} barSize={48}>
            <XAxis
              dataKey="year"
              tick={<YearTick />}
              axisLine={{ stroke: "var(--color-sidebar-border)" }}
              tickLine={false}
            />
            <YAxis hide domain={[0, 100]} />
            <Bar
              dataKey="sf"
              radius={[2, 2, 0, 0]}
              isAnimationActive={false}
            >
              {data.map((_, i) => (
                <Cell key={i} style={{ fill: "var(--color-sidebar-foreground)", fillOpacity: 0.85 }} />
              ))}
              <LabelList content={(props: any) => <BarLabel {...props} data={data} />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>
    )
  }
)
ExpiringTenants.displayName = "ExpiringTenants"

export { ExpiringTenants }
export type { ExpiringTenantsProps, ExpiringYear }
