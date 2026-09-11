import * as React from "react"
import {
  BarChart, Bar, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Customized, ReferenceLine,
} from "recharts"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { CriticalDate } from "@/components/critical-dates"
import type { Deal } from "@/components/leasing-activity"

// -------------------------------------------------------------------
// 2026 revenue chart data — actuals Jan–Jun, projected Jul–Dec
// rent roll sourced from active leases in VTS
// -------------------------------------------------------------------
interface MonthDatum {
  month: string
  revActual?: number
  revProjected?: number
  revBudget: number
}

const CHART_DATA: MonthDatum[] = [
  { month: "Jan", revActual: 4680, revBudget: 4500 },
  { month: "Feb", revActual: 4420, revBudget: 4500 },
  { month: "Mar", revActual: 4890, revBudget: 4600 },
  { month: "Apr", revActual: 4750, revBudget: 4650 },
  { month: "May", revActual: 5010, revBudget: 4700 },
  { month: "Jun", revActual: 4830, revBudget: 4700 },
  { month: "Jul", revProjected: 4920, revBudget: 4750 },
  { month: "Aug", revProjected: 5100, revBudget: 4800 },
  { month: "Sep", revProjected: 5050, revBudget: 4800 },
  { month: "Oct", revProjected: 4980, revBudget: 4850 },
  { month: "Nov", revProjected: 5200, revBudget: 4900 },
  { month: "Dec", revProjected: 5350, revBudget: 4950 },
]

const CHART_DATA_REV = CHART_DATA.map(m => ({
  ...m,
  revValue: m.revActual ?? m.revProjected,
  isProjected: m.revProjected != null,
}))

// -------------------------------------------------------------------
// Bridge aggregate — revenue only
// -------------------------------------------------------------------
const _actuals   = CHART_DATA.filter(m => m.revActual    != null)
const _projected = CHART_DATA.filter(m => m.revProjected != null)

const grossRevActual = _actuals.reduce((s, m) => s + (m.revActual ?? 0), 0)
                     + _projected.reduce((s, m) => s + (m.revProjected ?? 0), 0)
const grossRevBudget = CHART_DATA.reduce((s, m) => s + m.revBudget, 0)

// current month index (0-based) — Jun = 5
const TODAY_MONTH = "Jun"

// -------------------------------------------------------------------
// SVG pattern def for projected bars
// -------------------------------------------------------------------
function ChartPatternDefs() {
  return (
    <defs>
      <pattern id="stripe-rev-proj" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
        <rect width="2.5" height="5" fill="var(--color-primary)" fillOpacity={0.85} />
      </pattern>
    </defs>
  )
}

// -------------------------------------------------------------------
// "Today" reference line label
// -------------------------------------------------------------------
function TodayLabel({ viewBox }: any) {
  if (!viewBox) return null
  const { x, y } = viewBox
  return (
    <g>
      <text x={x + 4} y={y + 12} fontSize={9} fontWeight={600}
        fill="var(--color-foreground)" opacity={0.5} style={{ fontFamily: "inherit" }}>
        Today
      </text>
    </g>
  )
}

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------
function fmtM(k: number) {
  const abs = Math.abs(k)
  const sign = k < 0 ? "-" : ""
  return abs >= 1000 ? `${sign}$${(abs / 1000).toFixed(1)}M` : `${sign}$${Math.round(abs)}K`
}
function pct(actual: number, budget: number) { return ((actual - budget) / budget) * 100 }
function fmtPct(n: number) { return (n > 0 ? "+" : "") + n.toFixed(1) + "%" }

// -------------------------------------------------------------------
// Chart tooltip
// -------------------------------------------------------------------
function ChartTooltip({ active, payload, label, expiryByMonth }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload as typeof CHART_DATA_REV[0]
  if (!d) return null
  const rev    = d.revActual ?? d.revProjected
  const isProj = d.revProjected != null
  const expiry = expiryByMonth?.[label as string]
  return (
    <div className="rounded-lg border border-border/60 bg-background/95 backdrop-blur-sm px-3 py-2.5 shadow-lg text-xs space-y-1.5 min-w-[180px]">
      <p className="font-medium text-foreground text-sm">{label} 2026{isProj ? " · Projected" : ""}</p>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm shrink-0 bg-primary" />
          <span className="text-muted-foreground">Revenue</span>
        </div>
        <span className="font-medium tabular-nums">{rev != null ? fmtM(rev) : "—"} <span className="text-muted-foreground">/ {fmtM(d.revBudget)}</span></span>
      </div>
      {expiry && (
        <>
          <div className="h-px bg-border/50" />
          <div className="flex items-start gap-1.5">
            <span className="h-2 w-2 rounded-full shrink-0 bg-destructive mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-destructive font-medium">Lease expiry — {expiry.totalSf.toLocaleString()} sf</p>
              <p className="text-muted-foreground">{expiry.tenants.join(", ")}</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// -------------------------------------------------------------------
// Bridge row
// -------------------------------------------------------------------
interface RevenueItem {
  label: string; budget: number; actual: number
  bold?: boolean
}

function BridgeRow({ item }: { item: RevenueItem }) {
  const delta = item.actual - item.budget
  const isGood = delta >= 0
  const pctVal = pct(item.actual, item.budget)
  return (
    <tr>
      <td className={cn("py-1.5 pr-3 text-sm whitespace-nowrap", item.bold ? "font-medium text-foreground" : "text-muted-foreground")}>
        {item.label}
      </td>
      <td className="py-1.5 pr-4 text-right text-sm tabular-nums text-muted-foreground whitespace-nowrap">{fmtM(item.budget)}</td>
      <td className="py-1.5 pr-4 text-right text-sm tabular-nums text-foreground whitespace-nowrap">{fmtM(item.actual)}</td>
      <td className={cn("py-1.5 text-right text-sm font-medium tabular-nums whitespace-nowrap", isGood ? "text-success" : "text-destructive")}>
        {delta > 0 ? "+" : ""}{fmtM(delta)} <span className="opacity-70">({fmtPct(pctVal)})</span>
      </td>
    </tr>
  )
}

const STAGE_PROB: Record<string, number> = { "LOI": 0.6, "Lease Out": 0.85, "Executed": 1.0 }
const AVG_RENT_PSF = 52

// -------------------------------------------------------------------
// Forward-looking row (no budget comparison — single value + sentiment)
// -------------------------------------------------------------------
function ForwardRow({ label, value, sentiment }: { label: string; value: number; sentiment: "good" | "bad" }) {
  const cls = sentiment === "good" ? "text-success" : "text-destructive"
  const sign = value > 0 ? "+" : ""
  return (
    <tr>
      <td className="py-1.5 pr-3 text-sm text-muted-foreground whitespace-nowrap">{label}</td>
      <td className="py-1.5 pr-4 text-right text-sm tabular-nums text-muted-foreground/40 whitespace-nowrap">—</td>
      <td className="py-1.5 pr-4 text-right text-sm tabular-nums text-foreground whitespace-nowrap">—</td>
      <td className={cn("py-1.5 text-right text-sm font-medium tabular-nums whitespace-nowrap", cls)}>
        {sign}{fmtM(value)}
      </td>
    </tr>
  )
}

// -------------------------------------------------------------------
// Main component
// -------------------------------------------------------------------
interface FinancialPerformanceProps {
  criticalDates?: CriticalDate[]
  deals?: Deal[]
  onViewReport?: () => void
  onNavigate?: (page: string) => void
  className?: string
}

const FinancialPerformance = React.forwardRef<HTMLDivElement, FinancialPerformanceProps>(
  ({ criticalDates, deals, onViewReport, className }, ref) => {
    // Revenue at risk: annualized rent from leases expiring within 12 months, in $K
    const revenueAtRisk = React.useMemo(() => {
      return (criticalDates ?? [])
        .filter(d => d.category === "expiring" && d.monthsOut <= 12)
        .reduce((s, d) => s + (d.sf * AVG_RENT_PSF) / 1000, 0)
    }, [criticalDates])

    // Pipeline uplift: probability-weighted annualized revenue from LOI+ deals, in $K
    const pipelineUplift = React.useMemo(() => {
      return (deals ?? [])
        .filter(d => d.stage in STAGE_PROB)
        .reduce((s, d) => s + (d.sf * d.ner * STAGE_PROB[d.stage]) / 1000, 0)
    }, [deals])

    const bridgeRows: RevenueItem[] = [
      { label: "Gross revenue (YTD)", budget: grossRevBudget, actual: grossRevActual },
    ]

    // months that have lease expirations, keyed by month abbreviation
    const expiryByMonth = React.useMemo(() => {
      const map: Record<string, { tenants: string[]; totalSf: number }> = {}
      for (const d of criticalDates ?? []) {
        if (d.category !== "expiring") continue
        const mon = new Date(d.date).toLocaleString("en-US", { month: "short" })
        if (!map[mon]) map[mon] = { tenants: [], totalSf: 0 }
        map[mon].tenants.push(d.tenant)
        map[mon].totalSf += d.sf
      }
      return map
    }, [criticalDates])

    return (
      <div ref={ref} className={cn(cardBase, className)}>
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 mb-5">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">2026</p>
            <h2 className="text-xl font-semibold text-foreground">Revenue performance</h2>
          </div>
          <Button variant="outline" size="sm" className="shrink-0" onClick={onViewReport}>
            View leases
          </Button>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={CHART_DATA_REV} margin={{ top: 6, right: 4, bottom: 0, left: 0 }} barCategoryGap="30%" barGap={2}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} />
            <XAxis dataKey="month" tick={({ x, y, payload }: any) => {
              const hasExpiry = !!expiryByMonth[payload.value]
              return (
                <g transform={`translate(${x},${y})`}>
                  <text x={0} y={0} dy={12} textAnchor="middle" fontSize={14} fill={hasExpiry ? "var(--color-destructive)" : "var(--color-muted-foreground)"} fontWeight={hasExpiry ? 600 : 400}>
                    {payload.value}
                  </text>
                  {hasExpiry && <circle cx={0} cy={22} r={3} fill="var(--color-destructive)" />}
                </g>
              )
            }} axisLine={false} tickLine={false} height={36} />
            <YAxis hide domain={[0, "auto"]} />
            <Tooltip content={<ChartTooltip expiryByMonth={expiryByMonth} />} cursor={{ fill: "var(--color-muted)", fillOpacity: 0.4 }} />
            <Customized component={ChartPatternDefs} />
            <Bar dataKey="revValue" name="Revenue" barSize={20} radius={[2,2,0,0]} isAnimationActive={false}>
              {CHART_DATA_REV.map((m, i) => (
                <Cell key={i} fill={m.isProjected ? "url(#stripe-rev-proj)" : "var(--color-primary)"} />
              ))}
            </Bar>
            <Bar dataKey="revBudget" name="Revenue budget" barSize={20} radius={[2,2,0,0]} isAnimationActive={false} fill="var(--color-primary)" fillOpacity={0.18} />
            <ReferenceLine x={TODAY_MONTH} stroke="var(--color-foreground)" strokeOpacity={0.25} strokeWidth={1.5} strokeDasharray="3 3" label={<TodayLabel />} />
          </BarChart>
        </ResponsiveContainer>

        {/* Chart legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 mb-6">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm shrink-0 bg-primary" />
            <span className="text-sm text-muted-foreground">Revenue actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="10" height="10" className="shrink-0 rounded-sm overflow-hidden">
              <defs>
                <pattern id="leg-rev-proj" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
                  <rect width="2.5" height="5" fill="var(--color-primary)" />
                </pattern>
              </defs>
              <rect width="10" height="10" fill="url(#leg-rev-proj)" />
            </svg>
            <span className="text-sm text-muted-foreground">Revenue projected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm shrink-0 bg-primary/20" />
            <span className="text-sm text-muted-foreground">Revenue budget</span>
          </div>
          {Object.keys(expiryByMonth).length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full shrink-0 bg-destructive" />
              <span className="text-sm text-muted-foreground">Lease expiry</span>
            </div>
          )}
        </div>

        {/* Bridge table */}
        <div className="mb-5">
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full min-w-[360px] text-sm border-collapse">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="pb-2 text-left text-[10px] font-medium uppercase tracking-widest text-foreground/40 w-full">Line item</th>
                  <th className="pb-2 pr-4 text-right text-[10px] font-medium uppercase tracking-widest text-foreground/40 whitespace-nowrap">Budget</th>
                  <th className="pb-2 pr-4 text-right text-[10px] font-medium uppercase tracking-widest text-foreground/40 whitespace-nowrap">Actual</th>
                  <th className="pb-2 text-right text-[10px] font-medium uppercase tracking-widest text-foreground/40 whitespace-nowrap">vs Budget</th>
                </tr>
              </thead>
              <tbody>
                {bridgeRows.map((row, i) => <BridgeRow key={i} item={row} />)}
                <tr><td colSpan={4}><div className="h-px bg-border/50 my-1" /></td></tr>
                <ForwardRow label="Revenue at risk (next 12 mo)" value={-revenueAtRisk} sentiment="bad" />
                <ForwardRow label="Pipeline uplift (LOI+)" value={pipelineUplift} sentiment="good" />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }
)
FinancialPerformance.displayName = "FinancialPerformance"

export { FinancialPerformance }
export type { FinancialPerformanceProps }
