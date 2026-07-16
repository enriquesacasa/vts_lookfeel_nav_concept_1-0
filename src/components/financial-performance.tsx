import * as React from "react"
import {
  ComposedChart, Bar, Cell, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Customized,
} from "recharts"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// -------------------------------------------------------------------
// 2026 full-year chart data — actuals Jan–Jun, projected Jul–Dec
// -------------------------------------------------------------------
interface MonthDatum {
  month: string
  revActual?: number
  revProjected?: number
  revBudget: number
  expActual?: number
  expBudget: number
}

const CHART_DATA: MonthDatum[] = [
  { month: "Jan", revActual: 4680, revBudget: 4500, expActual: 2100, expBudget: 2050 },
  { month: "Feb", revActual: 4420, revBudget: 4500, expActual: 2280, expBudget: 2100 },
  { month: "Mar", revActual: 4890, revBudget: 4600, expActual: 2050, expBudget: 2150 },
  { month: "Apr", revActual: 4750, revBudget: 4650, expActual: 2190, expBudget: 2200 },
  { month: "May", revActual: 5010, revBudget: 4700, expActual: 2150, expBudget: 2250 },
  { month: "Jun", revActual: 4830, revBudget: 4700, expActual: 2380, expBudget: 2300 },
  { month: "Jul", revProjected: 4920, revBudget: 4750, expBudget: 2350 },
  { month: "Aug", revProjected: 5100, revBudget: 4800, expBudget: 2300 },
  { month: "Sep", revProjected: 5050, revBudget: 4800, expBudget: 2380 },
  { month: "Oct", revProjected: 4980, revBudget: 4850, expBudget: 2420 },
  { month: "Nov", revProjected: 5200, revBudget: 4900, expBudget: 2400 },
  { month: "Dec", revProjected: 5350, revBudget: 4950, expBudget: 2450 },
]

const CHART_DATA_NOI = CHART_DATA.map((m, i) => {
  const noiActual    = m.revActual    != null ? m.revActual    - (m.expActual ?? m.expBudget) : undefined
  const noiProjected = m.revProjected != null ? m.revProjected - m.expBudget                 : undefined
  const isLastActual = m.revActual != null && CHART_DATA[i + 1]?.revProjected != null
  const expActualVal    = m.expActual    != null ? m.expActual    : undefined
  const expProjectedVal = m.revProjected != null ? m.expBudget   : undefined
  return {
    ...m,
    revValue: m.revActual ?? m.revProjected,
    isProjected: m.revProjected != null,
    noiActual,
    noiProjected: isLastActual ? noiActual : noiProjected,
    noiBudget:    m.revBudget - m.expBudget,
    expActualVal,
    expProjectedVal: isLastActual ? expActualVal : expProjectedVal,
    expBudgetLine: m.expBudget,
    expValue: expActualVal ?? expProjectedVal,
    expIsProjected: m.revProjected != null,
  }
})

// -------------------------------------------------------------------
// Bridge aggregate — full year actuals + projections
// -------------------------------------------------------------------
const _actuals   = CHART_DATA.filter(m => m.revActual    != null)
const _projected = CHART_DATA.filter(m => m.revProjected != null)

const grossRevActual  = _actuals.reduce((s, m) => s + (m.revActual ?? 0), 0)
                      + _projected.reduce((s, m) => s + (m.revProjected ?? 0), 0)
const grossRevBudget  = CHART_DATA.reduce((s, m) => s + m.revBudget, 0)
const vacancyDrag     = grossRevActual * 0.13
const vacancyBudget   = grossRevBudget * 0.13 * 0.9
const netRevActual    = grossRevActual - vacancyDrag
const netRevBudget    = grossRevBudget - vacancyBudget
const expActualTotal  = _actuals.reduce((s, m) => s + (m.expActual ?? m.expBudget), 0)
                      + _projected.reduce((s, m) => s + m.expBudget, 0)
const expBudgetTotal  = CHART_DATA.reduce((s, m) => s + m.expBudget, 0)
const noiActualTotal  = netRevActual - expActualTotal
const noiBudgetTotal  = netRevBudget - expBudgetTotal

// -------------------------------------------------------------------
// Action levers
// -------------------------------------------------------------------
// SVG pattern defs for projected (striped) bars
// -------------------------------------------------------------------
function ChartPatternDefs() {
  return (
    <defs>
      <pattern id="stripe-rev-proj" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
        <rect width="2.5" height="5" fill="var(--color-primary)" fillOpacity={0.85} />
      </pattern>
      <pattern id="stripe-exp-proj" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
        <rect width="2.5" height="5" fill="var(--color-destructive)" fillOpacity={0.85} />
      </pattern>
    </defs>
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
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload as typeof CHART_DATA_NOI[0]
  if (!d) return null
  const rev    = d.revActual ?? d.revProjected
  const exp    = d.expActualVal ?? d.expProjectedVal
  const isProj = d.revProjected != null
  const noi    = d.noiActual ?? d.noiProjected
  return (
    <div className="rounded-lg border border-border/60 bg-background/95 backdrop-blur-sm px-3 py-2.5 shadow-lg text-xs space-y-1.5 min-w-[200px]">
      <p className="font-medium text-foreground text-sm">{label} 2026{isProj ? " · Projected" : ""}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm shrink-0" style={{ background: "var(--color-primary)" }} />
            <span className="text-muted-foreground">Revenue</span>
          </div>
          <span className="font-medium tabular-nums">{rev != null ? fmtM(rev) : "—"} <span className="text-muted-foreground">/ {fmtM(d.revBudget)}</span></span>
        </div>
        {exp != null && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm shrink-0 bg-destructive" />
              <span className="text-muted-foreground">Expenses</span>
            </div>
            <span className="font-medium tabular-nums text-destructive">{fmtM(exp)} <span className="text-muted-foreground font-normal">/ {fmtM(d.expBudgetLine)}</span></span>
          </div>
        )}
        {noi != null && (
          <>
            <div className="h-px bg-border/50 my-0.5" />
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full shrink-0 bg-success" />
                <span className="text-muted-foreground">NOI</span>
              </div>
              <span className="font-medium tabular-nums text-success">{fmtM(noi)} <span className="text-muted-foreground font-normal">/ {fmtM(d.noiBudget)}</span></span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// -------------------------------------------------------------------
// Bridge row
// -------------------------------------------------------------------
interface RevenueItem {
  label: string; budget: number; actual: number
  invertGood?: boolean; bold?: boolean; separatorBefore?: boolean
}

function BridgeRow({ item }: { item: RevenueItem }) {
  const delta = item.actual - item.budget
  const isGood = item.invertGood ? delta <= 0 : delta >= 0
  const pctVal = pct(item.actual, item.budget)
  return (
    <>
      {item.separatorBefore && <tr><td colSpan={4}><div className="h-px bg-border/50 my-1" /></td></tr>}
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
    </>
  )
}

// -------------------------------------------------------------------
// Main component
// -------------------------------------------------------------------
interface FinancialPerformanceProps {
  className?: string
}

const FinancialPerformance = React.forwardRef<HTMLDivElement, FinancialPerformanceProps>(
  ({ className }, ref) => {
    const bridgeRows: RevenueItem[] = [
      { label: "Gross revenue (YTD)",  budget: grossRevBudget,  actual: grossRevActual                        },
      { label: "Total expenses (YTD)", budget: -expBudgetTotal, actual: -expActualTotal, invertGood: true     },
      { label: "NOI (YTD)",            budget: noiBudgetTotal,  actual: noiActualTotal, bold: true, separatorBefore: true },
    ]

    return (
      <div ref={ref} className={cn(cardBase, className)}>
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 mb-5">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">2026</p>
            <h2 className="text-xl font-semibold text-foreground">Financial performance</h2>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 text-primary border-primary bg-transparent hover:bg-primary/10 hover:text-primary dark:bg-white/8 dark:border-white/25 dark:text-white dark:hover:bg-white/15">
            View Full Report
          </Button>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={CHART_DATA_NOI} margin={{ top: 6, right: 4, bottom: 0, left: 0 }} barCategoryGap="30%" barGap={2}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} />
            <XAxis dataKey="month" tick={{ fontSize: 14, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
            <YAxis hide domain={[0, "auto"]} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-muted)", fillOpacity: 0.4 }} />
            <Customized component={ChartPatternDefs} />
            <Bar dataKey="revValue" name="Revenue" barSize={20} radius={[2,2,0,0]} isAnimationActive={false}>
              {CHART_DATA_NOI.map((m, i) => (
                <Cell key={i} fill={m.isProjected ? "url(#stripe-rev-proj)" : "var(--color-primary)"} />
              ))}
            </Bar>
            <Bar dataKey="revBudget"    name="Revenue budget"  barSize={20} radius={[2,2,0,0]} isAnimationActive={false} fill="var(--color-primary)" fillOpacity={0.18} />
            <Bar dataKey="expValue"     name="Total expenses"  barSize={20} radius={[2,2,0,0]} isAnimationActive={false}>
              {CHART_DATA_NOI.map((m, i) => (
                <Cell key={i} fill={m.expIsProjected ? "url(#stripe-exp-proj)" : "var(--color-destructive)"} />
              ))}
            </Bar>
            <Bar dataKey="expBudgetLine" name="Expenses budget" barSize={20} radius={[2,2,0,0]} isAnimationActive={false} fill="var(--color-destructive)" fillOpacity={0.18} />
            <Line dataKey="noiActual"    name="NOI Actual"    type="monotone" stroke="var(--color-success)" strokeWidth={2.5} dot={{ fill: "var(--color-success)", r: 3, strokeWidth: 0 }} activeDot={{ r: 4 }} isAnimationActive={false} connectNulls={false} />
            <Line dataKey="noiProjected" name="NOI Projected" type="monotone" stroke="var(--color-success)" strokeWidth={2} strokeDasharray="4 3" dot={false} isAnimationActive={false} connectNulls={false} />
            <Line dataKey="noiBudget"    name="NOI Budget"    type="monotone" stroke="var(--color-warning)" strokeWidth={2} dot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Chart legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 mb-6">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: "var(--color-primary)" }} />
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
            <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: "var(--color-primary)", opacity: 0.22 }} />
            <span className="text-sm text-muted-foreground">Revenue budget</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm shrink-0 bg-destructive" />
            <span className="text-sm text-muted-foreground">Expenses actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="10" height="10" className="shrink-0 rounded-sm overflow-hidden">
              <defs>
                <pattern id="leg-exp-proj" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
                  <rect width="2.5" height="5" fill="var(--color-destructive)" />
                </pattern>
              </defs>
              <rect width="10" height="10" fill="url(#leg-exp-proj)" />
            </svg>
            <span className="text-sm text-muted-foreground">Expenses projected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm shrink-0 bg-destructive/20" />
            <span className="text-sm text-muted-foreground">Expenses budget</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 shrink-0 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">NOI Actual</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 shrink-0 rounded-full bg-success/70" />
            <span className="text-sm text-muted-foreground">NOI Projected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 shrink-0 rounded-full bg-warning" />
            <span className="text-sm text-muted-foreground">NOI Budget</span>
          </div>
        </div>

        {/* Bridge table */}
        <div className="mb-5">
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full min-w-[400px] text-sm border-collapse">
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
