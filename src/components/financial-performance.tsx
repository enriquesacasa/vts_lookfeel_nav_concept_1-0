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
// 2026 chart data
// Actuals Jan–Jun = collected base rent ($K/mo)
// Projected Jul–Dec split: in-place leases vs late-stage deal revenue
//   In-place drops in Sep/Oct to reflect the Globex expiration (38K sf)
// -------------------------------------------------------------------
interface MonthDatum {
  month: string
  revActual?: number       // collected rent, actual months only
  revInPlace?: number      // in-place lease revenue, projected months only
  revDeals?: number        // Lease Out+ deal revenue, projected months only
  revExpiring?: number     // expiring lease revenue in that projected month
  revBudget: number
}

const CHART_DATA: MonthDatum[] = [
  { month: "Jan", revActual: 4680, revBudget: 4500 },
  { month: "Feb", revActual: 4420, revBudget: 4500 },
  { month: "Mar", revActual: 4890, revBudget: 4600 },
  { month: "Apr", revActual: 4750, revBudget: 4650 },
  { month: "May", revActual: 5010, revBudget: 4700 },
  { month: "Jun", revActual: 4830, revBudget: 4700 },
  // Sep onward: in-place drops ~$165K/mo to reflect Globex expiration (38K sf @ $52/sf ÷ 12)
  // revExpiring shows the lost monthly revenue segment starting from the expiry month
  { month: "Jul", revInPlace: 4720, revDeals:  200,                  revBudget: 4750 },
  { month: "Aug", revInPlace: 4720, revDeals:  380,                  revBudget: 4800 },
  { month: "Sep", revInPlace: 4555, revDeals:  495, revExpiring: 165, revBudget: 4800 },
  { month: "Oct", revInPlace: 4555, revDeals:  425, revExpiring: 165, revBudget: 4850 },
  { month: "Nov", revInPlace: 4555, revDeals:  645, revExpiring: 165, revBudget: 4900 },
  { month: "Dec", revInPlace: 4555, revDeals:  795, revExpiring: 165, revBudget: 4950 },
]

// Lease Out+ threshold — per reviewer guidance (LOI is too early to count)
const CREDIBLE_STAGES = new Set(["Lease Out", "Executed"])

const TODAY_MONTH = "Jun"

// -------------------------------------------------------------------
// Aggregates
// -------------------------------------------------------------------
const _actuals   = CHART_DATA.filter(m => m.revActual != null)
const _projected = CHART_DATA.filter(m => m.revInPlace != null)

const grossRevActual =
  _actuals.reduce((s, m) => s + (m.revActual ?? 0), 0) +
  _projected.reduce((s, m) => s + (m.revInPlace ?? 0) + (m.revDeals ?? 0), 0)
const grossRevBudget = CHART_DATA.reduce((s, m) => s + m.revBudget, 0)

const h2InPlace = _projected.reduce((s, m) => s + (m.revInPlace ?? 0), 0)
const h2Budget  = _projected.reduce((s, m) => s + m.revBudget, 0)

// -------------------------------------------------------------------
// SVG pattern defs
// -------------------------------------------------------------------
function ChartPatternDefs() {
  return (
    <defs>
      <pattern id="stripe-in-place" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
        <rect width="2.5" height="5" fill="var(--color-primary)" fillOpacity={0.85} />
      </pattern>
      <pattern id="stripe-deals" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
        <rect width="2.5" height="5" fill="var(--color-success)" fillOpacity={0.85} />
      </pattern>
      <pattern id="stripe-expiring" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
        <rect width="2.5" height="5" fill="var(--color-destructive)" fillOpacity={0.7} />
      </pattern>
    </defs>
  )
}

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
// Tooltip
// -------------------------------------------------------------------
function ChartTooltip({ active, payload, label, expiryByMonth }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload as MonthDatum & { isProjected?: boolean }
  if (!d) return null

  const isProj  = d.revInPlace != null
  const revenue = isProj ? (d.revInPlace ?? 0) + (d.revDeals ?? 0) : (d.revActual ?? 0)
  const expiry  = expiryByMonth?.[label as string]

  return (
    <div className="rounded-lg border border-border/60 bg-background/95 backdrop-blur-sm px-3 py-2.5 shadow-lg text-xs space-y-1.5 min-w-[200px]">
      <p className="font-medium text-foreground text-sm">{label} 2026{isProj ? " · Projected" : ""}</p>

      {isProj ? (
        <>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <svg width="10" height="10" className="shrink-0 rounded-sm overflow-hidden">
                <rect width="10" height="10" fill="url(#stripe-in-place)" />
              </svg>
              <span className="text-muted-foreground">In-place leases</span>
            </div>
            <span className="font-medium tabular-nums">{fmtM(d.revInPlace ?? 0)}</span>
          </div>
          {(d.revDeals ?? 0) > 0 && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <svg width="10" height="10" className="shrink-0 rounded-sm overflow-hidden">
                  <rect width="10" height="10" fill="url(#stripe-deals)" />
                </svg>
                <span className="text-muted-foreground">Late-stage deals</span>
              </div>
              <span className="font-medium tabular-nums">{fmtM(d.revDeals ?? 0)}</span>
            </div>
          )}
          {(d.revExpiring ?? 0) > 0 && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <svg width="10" height="10" className="shrink-0 rounded-sm overflow-hidden">
                  <rect width="10" height="10" fill="url(#stripe-expiring)" />
                </svg>
                <span className="text-destructive">Expiring leases</span>
              </div>
              <span className="font-medium tabular-nums text-destructive">-{fmtM(d.revExpiring ?? 0)}/mo</span>
            </div>
          )}
          <div className="flex items-center justify-between gap-4 border-t border-border/40 pt-1">
            <span className="text-muted-foreground">Total vs budget</span>
            <span className="font-medium tabular-nums">{fmtM(revenue)} <span className="text-muted-foreground">/ {fmtM(d.revBudget)}</span></span>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm shrink-0 bg-primary" />
            <span className="text-muted-foreground">In-place rent</span>
          </div>
          <span className="font-medium tabular-nums">{fmtM(revenue)} <span className="text-muted-foreground">/ {fmtM(d.revBudget)}</span></span>
        </div>
      )}

      {expiry && (
        <>
          <div className="h-px bg-border/50" />
          <div className="flex items-start gap-1.5">
            <span className="h-2 w-2 rounded-full shrink-0 bg-destructive mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-destructive font-medium">
                Expiring leases — {expiry.totalSf.toLocaleString()} sf · {fmtM(expiry.annualRentK / 12)}/mo
              </p>
              <p className="text-muted-foreground">{expiry.tenants.join(", ")}</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// -------------------------------------------------------------------
// Bridge table rows
// -------------------------------------------------------------------
interface BridgeItem { label: string; budget: number; actual: number; bold?: boolean; swatch?: React.ReactNode }

function BridgeRow({ item }: { item: BridgeItem }) {
  const delta  = item.actual - item.budget
  const isGood = delta >= 0
  const pctVal = pct(item.actual, item.budget)
  return (
    <tr>
      <td className={cn("py-1.5 pr-3 text-sm whitespace-nowrap", item.bold ? "font-medium text-foreground" : "text-muted-foreground")}>
        <div className="flex items-center gap-1.5">
          {item.swatch}
          <span>{item.label}</span>
        </div>
      </td>
      <td className="py-1.5 pr-4 text-right text-sm tabular-nums text-muted-foreground whitespace-nowrap">{fmtM(item.budget)}</td>
      <td className="py-1.5 pr-4 text-right text-sm tabular-nums text-foreground whitespace-nowrap">{fmtM(item.actual)}</td>
      <td className={cn("py-1.5 text-right text-sm font-medium tabular-nums whitespace-nowrap", isGood ? "text-success" : "text-destructive")}>
        {delta > 0 ? "+" : ""}{fmtM(delta)} <span className="opacity-70">({fmtPct(pctVal)})</span>
      </td>
    </tr>
  )
}

interface ForwardItem {
  label: string
  value: number
  sub?: string
  sentiment: "good" | "bad" | "neutral"
  swatch?: React.ReactNode
}

function ForwardRow({ item }: { item: ForwardItem }) {
  const cls = item.sentiment === "good"
    ? "text-success"
    : item.sentiment === "bad"
    ? "text-destructive"
    : "text-foreground"
  const sign = item.value > 0 ? "+" : ""
  return (
    <tr>
      <td className="py-1.5 pr-3 text-sm text-muted-foreground whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          {item.swatch}
          <span>{item.label}</span>
        </div>
        {item.sub && <div className="text-xs text-muted-foreground/70 pl-0">{item.sub}</div>}
      </td>
      <td className="py-1.5 pr-4 text-right text-sm tabular-nums text-muted-foreground/40 whitespace-nowrap">—</td>
      <td className="py-1.5 pr-4 text-right text-sm tabular-nums text-muted-foreground/40 whitespace-nowrap">—</td>
      <td className={cn("py-1.5 text-right text-sm font-medium tabular-nums whitespace-nowrap", cls)}>
        {sign}{fmtM(item.value)}
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

const AVG_RENT_PSF = 52

const FinancialPerformance = React.forwardRef<HTMLDivElement, FinancialPerformanceProps>(
  ({ criticalDates, deals, onViewReport, className }, ref) => {

    // Expiring leases within 12 months — compute sf AND annualized dollar value
    const expiringLeases = React.useMemo(() => {
      return (criticalDates ?? [])
        .filter(d => d.category === "expiring" && d.monthsOut <= 12)
        .map(d => ({
          ...d,
          annualRentK: (d.sf * AVG_RENT_PSF) / 1000,
        }))
    }, [criticalDates])

    const totalExpiringRentK  = expiringLeases.reduce((s, d) => s + d.annualRentK, 0)

    // Late-stage deal revenue: Lease Out+ only, annualized, in $K
    const lateStageDealsK = React.useMemo(() => {
      return (deals ?? [])
        .filter(d => CREDIBLE_STAGES.has(d.stage))
        .reduce((s, d) => s + (d.sf * d.ner) / 1000, 0)
    }, [deals])

    // Expiry lookup by month for chart x-axis markers
    const expiryByMonth = React.useMemo(() => {
      const map: Record<string, { tenants: string[]; totalSf: number; annualRentK: number }> = {}
      for (const d of expiringLeases) {
        const mon = new Date(d.date).toLocaleString("en-US", { month: "short" })
        if (!map[mon]) map[mon] = { tenants: [], totalSf: 0, annualRentK: 0 }
        map[mon].tenants.push(d.tenant)
        map[mon].totalSf    += d.sf
        map[mon].annualRentK += d.annualRentK
      }
      return map
    }, [expiringLeases])

    return (
      <div ref={ref} className={cn(cardBase, className)}>
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 mb-5">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">2026</p>
            <h2 className="text-xl font-semibold text-foreground">Rent performance</h2>
          </div>
          <Button variant="outline" size="sm" className="shrink-0" onClick={onViewReport}>
            View leases
          </Button>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={CHART_DATA} margin={{ top: 6, right: 4, bottom: 0, left: 0 }} barCategoryGap="30%" barGap={2}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} />
            <XAxis dataKey="month" tick={({ x, y, payload }: any) => {
              const hasExpiry = !!expiryByMonth[payload.value]
              return (
                <g transform={`translate(${x},${y})`}>
                  <text x={0} y={0} dy={12} textAnchor="middle" fontSize={14}
                    fill={hasExpiry ? "var(--color-destructive)" : "var(--color-muted-foreground)"}
                    fontWeight={hasExpiry ? 600 : 400}>
                    {payload.value}
                  </text>
                  {hasExpiry && <circle cx={0} cy={22} r={3} fill="var(--color-destructive)" />}
                </g>
              )
            }} axisLine={false} tickLine={false} height={36} />
            <YAxis hide domain={[0, "auto"]} />
            <Tooltip content={<ChartTooltip expiryByMonth={expiryByMonth} />} cursor={{ fill: "var(--color-muted)", fillOpacity: 0.4 }} />
            <Customized component={ChartPatternDefs} />

            {/* Actual months: single collected-rent bar */}
            <Bar dataKey="revActual" name="In-place rent" barSize={20} radius={[2,2,0,0]} isAnimationActive={false}
              fill="var(--color-primary)" stackId="rev" />

            {/* Projected months: stacked — in-place (striped primary) */}
            <Bar dataKey="revInPlace" name="In-place leases" barSize={20} radius={[0,0,0,0]} isAnimationActive={false} stackId="rev">
              {CHART_DATA.map((m, i) => (
                <Cell key={i} fill={m.revInPlace != null ? "url(#stripe-in-place)" : "transparent"} />
              ))}
            </Bar>

            {/* Projected months: stacked — late-stage deals (striped success) */}
            <Bar dataKey="revDeals" name="Late-stage deal revenue" barSize={20} radius={[2,2,0,0]} isAnimationActive={false} stackId="rev">
              {CHART_DATA.map((m, i) => (
                <Cell key={i} fill={m.revDeals != null ? "url(#stripe-deals)" : "transparent"} />
              ))}
            </Bar>

            {/* Projected months: expiring lease revenue segment (destructive striped) */}
            <Bar dataKey="revExpiring" name="Expiring leases" barSize={20} radius={[2,2,0,0]} isAnimationActive={false} stackId="rev">
              {CHART_DATA.map((m, i) => (
                <Cell key={i} fill={m.revExpiring != null ? "url(#stripe-expiring)" : "transparent"} />
              ))}
            </Bar>

            {/* Budget reference bar */}
            <Bar dataKey="revBudget" name="Budget" barSize={20} radius={[2,2,0,0]} isAnimationActive={false}
              fill="var(--color-primary)" fillOpacity={0.18} />

            <ReferenceLine x={TODAY_MONTH} stroke="var(--color-foreground)" strokeOpacity={0.25}
              strokeWidth={1.5} strokeDasharray="3 3" label={<TodayLabel />} />
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 mb-6">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm shrink-0 bg-primary" />
            <span className="text-sm text-muted-foreground">In-place rent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="10" height="10" className="shrink-0 rounded-sm overflow-hidden">
              <defs>
                <pattern id="leg-in-place" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
                  <rect width="2.5" height="5" fill="var(--color-primary)" />
                </pattern>
              </defs>
              <rect width="10" height="10" fill="url(#leg-in-place)" />
            </svg>
            <span className="text-sm text-muted-foreground">In-place projection</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="10" height="10" className="shrink-0 rounded-sm overflow-hidden">
              <defs>
                <pattern id="leg-deals" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
                  <rect width="2.5" height="5" fill="var(--color-success)" />
                </pattern>
              </defs>
              <rect width="10" height="10" fill="url(#leg-deals)" />
            </svg>
            <span className="text-sm text-muted-foreground">Signed deals (Lease Out+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm shrink-0 bg-primary/20" />
            <span className="text-sm text-muted-foreground">Budget</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="10" height="10" className="shrink-0 rounded-sm overflow-hidden">
              <defs>
                <pattern id="leg-expiring" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
                  <rect width="2.5" height="5" fill="var(--color-destructive)" fillOpacity={0.7} />
                </pattern>
              </defs>
              <rect width="10" height="10" fill="url(#leg-expiring)" />
            </svg>
            <span className="text-sm text-muted-foreground">Expiring leases</span>
          </div>
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
                {/* YTD actual vs budget */}
                <BridgeRow item={{ label: "In-place rent (YTD)", budget: grossRevBudget, actual: grossRevActual, swatch: <span className="h-2.5 w-2.5 rounded-sm shrink-0 bg-primary" /> }} />

                <tr><td colSpan={4}><div className="h-px bg-border/50 my-1" /></td></tr>

                {/* H2 in-place projection vs H2 budget */}
                <BridgeRow item={{ label: "In-place projection", budget: h2Budget, actual: h2InPlace, swatch: (
                    <svg width="10" height="10" className="shrink-0 rounded-sm overflow-hidden">
                      <rect width="10" height="10" fill="url(#leg-in-place)" />
                    </svg>
                  ) }} />

                {/* Expirations — show sf AND dollar value */}
                {totalExpiringRentK > 0 && (
                  <ForwardRow item={{
                    label: "Expiring leases",
                    value: -(totalExpiringRentK / 12),
                    sentiment: "bad",
                    swatch: (
                      <svg width="10" height="10" className="shrink-0 rounded-sm overflow-hidden">
                        <rect width="10" height="10" fill="url(#leg-expiring)" />
                      </svg>
                    ),
                  }} />
                )}

                {/* Late-stage deal revenue */}
                {lateStageDealsK > 0 && (
                  <ForwardRow item={{
                    label: "Late-stage deals (Lease Out+)",
                    value: lateStageDealsK / 12,
                    sentiment: "good",
                    swatch: (
                      <svg width="8" height="8" className="shrink-0 rounded-sm overflow-hidden">
                        <rect width="8" height="8" fill="url(#leg-deals)" />
                      </svg>
                    ),
                  }} />
                )}
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
