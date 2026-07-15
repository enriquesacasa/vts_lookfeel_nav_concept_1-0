import * as React from "react"
import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer } from "recharts"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Tenant {
  name: string
  pct: number
  value: string
}

interface TopTenantsProps {
  tenants: Tenant[]
  className?: string
}

function NameTick({ x, y, payload }: any) {
  return (
    <text x={x - 4} y={y} textAnchor="end" dominantBaseline="middle"
      style={{ fill: "var(--color-foreground)", fontSize: 12, fontWeight: 500 }}>
      {payload.value}
    </text>
  )
}

function ScaleTick({ x, y, payload }: any) {
  const label = payload.value === 0 ? "0" : `${Math.round(payload.value / 1000)}K sf`
  return (
    <text x={x} y={y} dy={10} textAnchor="middle"
      style={{ fill: "var(--color-muted-foreground)", fontSize: 9 }}>
      {label}
    </text>
  )
}

function ValueLabel({ x, y, width, height, index, data }: any) {
  const tenant = data?.[index]
  if (!tenant) return null
  const lx = Number(x) + Number(width) + 6
  const ly = Number(y) + Number(height) / 2
  return (
    <text x={lx} y={ly} dominantBaseline="middle"
      style={{ fill: "var(--color-muted-foreground)", fontSize: 9 }}>
      {tenant.pct}% · {tenant.value}
    </text>
  )
}

const TopTenants = React.forwardRef<HTMLDivElement, TopTenantsProps>(
  ({ tenants, className }, ref) => {
    const data = tenants.map(t => ({
      name: t.name,
      sf: Math.round((t.pct / 100) * 900000),
      pct: t.pct,
      value: t.value,
    }))

    return (
      <div ref={ref} className={cn(cardBase, className)}>
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 mb-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">Tenants</p>
            <h2 className="text-xl font-semibold text-foreground">Top Tenants by % of RBA</h2>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 text-primary border-primary bg-transparent hover:bg-primary/10 hover:text-primary dark:bg-white/8 dark:border-white/25 dark:text-white dark:hover:bg-white/15">View Tenants</Button>
        </div>

        <ResponsiveContainer width="100%" height={tenants.length * 30 + 32} minWidth={0}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 90, bottom: 8, left: 4 }}
            barSize={24}
          >
            <XAxis
              type="number"
              domain={[0, 81000]}
              ticks={[0, 16000, 32000, 48000, 64000, 80000]}
              tick={<ScaleTick />}
              axisLine={{ stroke: "var(--color-border)" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={120}
              interval={0}
              tick={<NameTick />}
              axisLine={false}
              tickLine={false}
            />
            <Bar
              dataKey="sf"
              radius={[0, 2, 2, 0]}
              background={false}
              isAnimationActive={false}
              label={(props: any) => <ValueLabel {...props} data={data} />}
            >
              {data.map((_, i) => {
                const t = i / Math.max(data.length - 1, 1)
                const opacity = 1 - t * 0.5
                return <Cell key={i} style={{ fill: "var(--color-primary)", fillOpacity: opacity }} />
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }
)
TopTenants.displayName = "TopTenants"

export { TopTenants }
export type { TopTenantsProps, Tenant }
