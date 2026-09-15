import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { KpiBar } from "@/components/kpi-bar"
import { AgentBtn } from "@/components/agent-btn"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, Sparkle, TrendingUp, FileText, BarChart2, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { BUDGETS, type Budget } from "@/components/budgets-page"
import { APPRAISALS, type Appraisal } from "@/components/appraisals-page"
import { COMPS, type Comp } from "@/components/comps-page"
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtRent(n: number) { return `$${n.toFixed(0)}/sf` }
function fmtRentFull(n: number) { return `$${n.toFixed(2)}/sf/yr` }

function parseLcd(lcd: string): Date {
  const [m, d, y] = lcd.split("/")
  return new Date(`20${y}-${m}-${d}`)
}

function shortAsset(name: string) {
  return name
    .replace(" Headquarters", "")
    .replace(" Tower", " Twr")
    .replace(" Plaza", " Plz")
    .replace(" Bldg", " Bldg")
    .replace(" Building", " Bldg")
}

// ── Derived data helpers ──────────────────────────────────────────────────────

type NerByAsset = { asset: string; shortAsset: string; ner: number }
type AppraisalNerByAsset = NerByAsset & { budgetNer: number | null; scenarios: number }
type SubmarketRent = { submarket: string; rent: number; count: number }

function computeBudgetNerByAsset(budgets: Budget[]): NerByAsset[] {
  const assets = Array.from(new Set(budgets.map(b => b.asset)))
  return assets.map(asset => {
    const rows = budgets.filter(b => b.asset === asset)
    const totalSf  = rows.reduce((s, b) => s + b.size, 0)
    const totalNer = rows.reduce((s, b) => s + b.nerSizeYr * b.size, 0)
    return { asset, shortAsset: shortAsset(asset), ner: totalSf > 0 ? totalNer / totalSf : 0 }
  })
}

function computeAppraisalNerByAsset(appraisals: Appraisal[], budgets: Budget[]): AppraisalNerByAsset[] {
  const assets = Array.from(new Set(appraisals.map(a => a.asset)))
  return assets.map(asset => {
    const rows = appraisals.filter(a => a.asset === asset)
    const avg = rows.reduce((s, a) => s + a.nerSizeYr, 0) / rows.length
    const budgetRows = budgets.filter(b => b.asset === asset)
    const totalBudgetSf = budgetRows.reduce((s, b) => s + b.size, 0)
    const budgetNer = totalBudgetSf > 0
      ? budgetRows.reduce((s, b) => s + b.nerSizeYr * b.size, 0) / totalBudgetSf
      : null
    return { asset, shortAsset: shortAsset(asset), ner: avg, budgetNer, scenarios: rows.length }
  })
}

function computeRentBySubmarket(comps: Comp[]): SubmarketRent[] {
  const groups = Array.from(new Set(comps.map(c => c.citySubmarket)))
  return groups.map(sm => {
    const rows = comps.filter(c => c.citySubmarket === sm)
    return {
      submarket: sm.replace("New York / ", "NY/").replace("Boston / ", "BOS/"),
      rent: rows.reduce((s, c) => s + c.rent, 0) / rows.length,
      count: rows.length,
    }
  }).sort((a, b) => b.rent - a.rent)
}

// ── Chart components ──────────────────────────────────────────────────────────

function BudgetBarChart({ data }: { data: NerByAsset[] }) {
  if (!data.length) return <div className="h-[140px] flex items-center justify-center text-sm text-muted-foreground">No data</div>
  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={data} barCategoryGap="35%" margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} />
        <XAxis dataKey="shortAsset" tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v => v != null ? `$${Number(v).toFixed(0)}` : ""} width={28} domain={[50, "auto"]} />
        <Tooltip formatter={(v) => [fmtRentFull(Number(v)), "Avg NER"]} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
        <Bar dataKey="ner" fill="var(--color-primary)" radius={[3,3,0,0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function CompsSubmarketChart({ data }: { data: SubmarketRent[] }) {
  if (!data.length) return <div className="h-[140px] flex items-center justify-center text-sm text-muted-foreground">No comps</div>
  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={data} barCategoryGap="35%" margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} />
        <XAxis dataKey="submarket" tick={{ fontSize: 8, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v => v != null ? `$${Number(v).toFixed(0)}` : ""} width={28} domain={[60, "auto"]} />
        <Tooltip formatter={(v, _n, p) => [fmtRentFull(Number(v)), `${p.payload?.count ?? ""} deals`]} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
        <Bar dataKey="rent" fill="var(--color-primary)" radius={[3,3,0,0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── BudgetSummaryCard ─────────────────────────────────────────────────────────

interface BudgetSummaryCardProps {
  nerByAsset: NerByAsset[]
  portfolioAvgNer: number
  onViewAll?: () => void
}

function BudgetSummaryCard({ nerByAsset, portfolioAvgNer, onViewAll }: BudgetSummaryCardProps) {
  return (
    <div className={cardBase}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">2026</p>
          <h2 className="text-xl font-semibold text-foreground">Budget NER</h2>
        </div>
        {onViewAll && (
          <Button variant="outline" size="sm" onClick={onViewAll} className="shrink-0">View budgets</Button>
        )}
      </div>
      <BudgetBarChart data={nerByAsset} />
      {nerByAsset.length > 0 && (
        <div className="space-y-2 mt-3">
          {nerByAsset.map(r => {
            const delta = r.ner - portfolioAvgNer
            const isAbove = delta >= 0
            return (
              <div key={r.asset} className="flex items-center justify-between py-1.5 border-t border-border/50 first:border-0 first:pt-0 group/row">
                <span className="text-sm text-foreground">{r.asset}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm tabular-nums text-foreground">{fmtRentFull(r.ner)}</span>
                  <span className={cn("text-xs tabular-nums font-medium flex items-center gap-0.5", isAbove ? "text-success" : "text-destructive")}>
                    {isAbove ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(delta).toFixed(1)}
                  </span>
                  <AgentBtn entity="budget" label={`Analyze ${r.asset} budget NER`} className="" />
                </div>
              </div>
            )
          })}
          <p className="text-[10px] text-muted-foreground pt-1">Arrow vs portfolio avg ({fmtRent(portfolioAvgNer)})</p>
        </div>
      )}
      {nerByAsset.length === 0 && (
        <p className="text-sm text-muted-foreground mt-4">No budget data for selected asset.</p>
      )}
    </div>
  )
}

// ── AppraisalSummaryCard ──────────────────────────────────────────────────────

interface AppraisalSummaryCardProps {
  nerByAsset: AppraisalNerByAsset[]
  nerRange: { min: number; max: number } | null
  onViewAll?: () => void
}

function AppraisalSummaryCard({ nerByAsset, nerRange, onViewAll }: AppraisalSummaryCardProps) {
  return (
    <div className={cardBase}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">Portfolio</p>
          <h2 className="text-xl font-semibold text-foreground">Appraisal NER</h2>
        </div>
        {onViewAll && (
          <Button variant="outline" size="sm" onClick={onViewAll} className="shrink-0">View appraisals</Button>
        )}
      </div>
      {nerByAsset.length > 0 ? (
        <>
          <div className="flex flex-col gap-3 mb-4">
            {nerByAsset.map((a) => {
              const vsbudget = a.budgetNer != null ? a.ner - a.budgetNer : null
              return (
                <div key={a.asset} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground truncate flex-1 min-w-0">{a.asset}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm tabular-nums font-medium text-foreground">{fmtRentFull(a.ner)}</span>
                      {vsbudget != null && (
                        <span className={cn("text-xs tabular-nums flex items-center gap-0.5", vsbudget >= 0 ? "text-success" : "text-destructive")}>
                          {vsbudget >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {Math.abs(vsbudget).toFixed(1)} vs budget
                        </span>
                      )}
                      <AgentBtn entity="appraisal" label={`Review appraisal scenarios for ${a.asset}`} className="" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{a.scenarios} scenario{a.scenarios !== 1 ? "s" : ""}</p>
                </div>
              )
            })}
          </div>
          {nerRange && (
            <div className="rounded-lg bg-muted/50 px-3 py-2.5 mt-2">
              <p className="text-xs text-muted-foreground">NER range across active scenarios</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {fmtRent(nerRange.min)} &ndash; {fmtRent(nerRange.max)}
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No appraisal data for selected asset.</p>
      )}
    </div>
  )
}

// ── CompsSummaryCard ──────────────────────────────────────────────────────────

interface CompsSummaryCardProps {
  chartData: SubmarketRent[]
  recentComps: Comp[]
  onViewAll?: () => void
}

function CompsSummaryCard({ chartData, recentComps, onViewAll }: CompsSummaryCardProps) {
  return (
    <div className={cardBase}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">Market</p>
          <h2 className="text-xl font-semibold text-foreground">Avg rent</h2>
        </div>
        {onViewAll && (
          <Button variant="outline" size="sm" onClick={onViewAll} className="shrink-0">View comps</Button>
        )}
      </div>
      <CompsSubmarketChart data={chartData} />
      <div className="mt-4">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Most recent deals</p>
        {recentComps.length > 0 ? (
          <div className="space-y-2">
            {recentComps.map(c => (
              <div key={c.id} className="flex items-center gap-2.5 py-1.5 border-t border-border/50 first:border-0 first:pt-0 group/row">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.tenant}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.citySubmarket} &middot; {c.lcd}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{c.sf.toLocaleString()} sf</span>
                <span className="text-sm tabular-nums font-medium text-foreground shrink-0">{fmtRent(c.rent)}</span>
                <AgentBtn entity="comp" label={`Analyze comp: ${c.tenant}`} className="" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No comps for selected market.</p>
        )}
      </div>
    </div>
  )
}

// ── RecentActivityFeed ────────────────────────────────────────────────────────

interface ActivityItem {
  icon: React.ReactNode
  title: string
  asset: string
  time: string
  category: "Budget" | "Appraisal" | "Comp"
}

const CATEGORY_CLS: Record<ActivityItem["category"], string> = {
  "Budget":    "bg-primary/10 text-primary",
  "Appraisal": "bg-success/10 text-success",
  "Comp":      "bg-warning/10 text-warning",
}

function buildActivityItems(
  activeBudgets: Budget[],
  activeAppraisals: Appraisal[],
  activeComps: Comp[],
  portfolioAvgNer: number,
): ActivityItem[] {
  const items: ActivityItem[] = []

  // Most recent comp
  const recentComp = [...activeComps].sort((a, b) => parseLcd(b.lcd).getTime() - parseLcd(a.lcd).getTime())[0]
  if (recentComp) {
    items.push({
      icon: <BarChart2 className="h-3.5 w-3.5 text-warning" />,
      title: `${recentComp.label}: ${fmtRent(recentComp.rent)}, ${recentComp.sf.toLocaleString()} sf`,
      asset: recentComp.citySubmarket,
      time: "2d ago",
      category: "Comp",
    })
  }

  // Highest-NER appraisal scenario
  const topAppraisal = [...activeAppraisals].sort((a, b) => b.nerSizeYr - a.nerSizeYr)[0]
  if (topAppraisal) {
    items.push({
      icon: <FileText className="h-3.5 w-3.5 text-success" />,
      title: `${topAppraisal.label} — ${fmtRentFull(topAppraisal.nerSizeYr)} NER (${topAppraisal.asset})`,
      asset: topAppraisal.asset,
      time: "3d ago",
      category: "Appraisal",
    })
  }

  // Lowest-NER budget
  const lowBudget = [...activeBudgets].sort((a, b) => a.nerSizeYr - b.nerSizeYr)[0]
  if (lowBudget && portfolioAvgNer > 0) {
    const pct = ((portfolioAvgNer - lowBudget.nerSizeYr) / portfolioAvgNer * 100).toFixed(1)
    items.push({
      icon: <AlertTriangle className="h-3.5 w-3.5 text-destructive" />,
      title: `${lowBudget.asset} ${lowBudget.label} — ${fmtRentFull(lowBudget.nerSizeYr)} (${pct}% below avg)`,
      asset: lowBudget.asset,
      time: "4d ago",
      category: "Budget",
    })
  }

  // Second-most recent comp
  const secondComp = [...activeComps].sort((a, b) => parseLcd(b.lcd).getTime() - parseLcd(a.lcd).getTime())[1]
  if (secondComp) {
    items.push({
      icon: <BarChart2 className="h-3.5 w-3.5 text-warning" />,
      title: `${secondComp.label}: ${fmtRent(secondComp.rent)}, ${secondComp.sf.toLocaleString()} sf`,
      asset: secondComp.citySubmarket,
      time: "5d ago",
      category: "Comp",
    })
  }

  // Highest-NER budget
  const topBudget = [...activeBudgets].sort((a, b) => b.nerSizeYr - a.nerSizeYr)[0]
  if (topBudget) {
    items.push({
      icon: <TrendingUp className="h-3.5 w-3.5 text-success" />,
      title: `${topBudget.asset} ${topBudget.label} — high-side NER ${fmtRentFull(topBudget.nerSizeYr)}`,
      asset: topBudget.asset,
      time: "6d ago",
      category: "Budget",
    })
  }

  // Lowest-NER appraisal
  const lowAppraisal = [...activeAppraisals].sort((a, b) => a.nerSizeYr - b.nerSizeYr)[0]
  if (lowAppraisal) {
    items.push({
      icon: <Clock className="h-3.5 w-3.5 text-primary" />,
      title: `${lowAppraisal.asset} ${lowAppraisal.label} — ${fmtRentFull(lowAppraisal.nerSizeYr)} (concession scenario)`,
      asset: lowAppraisal.asset,
      time: "1w ago",
      category: "Appraisal",
    })
  }

  // Third-most recent comp
  const thirdComp = [...activeComps].sort((a, b) => parseLcd(b.lcd).getTime() - parseLcd(a.lcd).getTime())[2]
  if (thirdComp) {
    items.push({
      icon: <BarChart2 className="h-3.5 w-3.5 text-warning" />,
      title: `${thirdComp.label}: ${fmtRent(thirdComp.rent)}, ${thirdComp.sf.toLocaleString()} sf`,
      asset: thirdComp.citySubmarket,
      time: "1w ago",
      category: "Comp",
    })
  }

  // Active appraisal count
  if (activeAppraisals.length > 1) {
    items.push({
      icon: <FileText className="h-3.5 w-3.5 text-success" />,
      title: `${activeAppraisals.length} active appraisal scenarios across portfolio`,
      asset: "Portfolio",
      time: "2w ago",
      category: "Appraisal",
    })
  }

  return items.slice(0, 8)
}

function RecentActivityFeed({ items, className }: { items: ActivityItem[]; className?: string }) {
  return (
    <div className={cn(cardBase, className)}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">Activity</p>
          <h2 className="text-xl font-semibold text-foreground">Recent planning activity</h2>
        </div>
      </div>
      {items.length > 0 ? (
        <div className="space-y-1">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-3 py-2.5 border-t border-border/50 first:border-0 first:pt-0 group/row">
              <div className="mt-0.5 shrink-0">{item.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground leading-snug">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.asset}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground w-10 text-right">{item.time}</span>
                <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", CATEGORY_CLS[item.category])}>
                  {item.category}
                </span>
                <AgentBtn entity={item.category} label={item.title} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No recent activity for selected asset.</p>
      )}
    </div>
  )
}


// ── PlanningAgentsCard ────────────────────────────────────────────────────────

interface PlanningAgentsCardProps {
  className?: string
  lowNerCount: number
  pendingAppraisals: number
  budgetAlerts: { asset: string; desc: string }[]
  appraisalItems: { asset: string; desc: string }[]
  marketInsights: { asset: string; desc: string }[]
}

function PlanningAgentsCard({
  className, lowNerCount, pendingAppraisals,
  budgetAlerts, appraisalItems, marketInsights,
}: PlanningAgentsCardProps) {
  return (
    <div className={cn(cardBase, "border-transparent bg-sidebar-accent flex flex-col gap-4", className)}>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-widest mb-1 text-sidebar-foreground/70">VTS agents</p>
        <h2 className="text-xl font-semibold text-sidebar-foreground">Planning intelligence</h2>
      </div>

      <div className="rounded-lg px-3 py-2 flex items-center gap-2 bg-sidebar-foreground/10">
        <Sparkle className="h-4 w-4 shrink-0 text-sidebar-primary" />
        <p className="text-sm leading-snug text-sidebar-foreground/70">
          {lowNerCount} budget{lowNerCount !== 1 ? "s" : ""} below portfolio avg +{" "}
          <span className="text-sidebar-primary font-medium">{pendingAppraisals} active appraisal{pendingAppraisals !== 1 ? "s" : ""}</span>
        </p>
      </div>

      {budgetAlerts.length > 0 && (
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest mb-2 text-sidebar-foreground/50">Budget alerts</p>
          <div className="flex flex-col gap-2">
            {budgetAlerts.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-lg p-3 group/row border border-primary/25 bg-primary/15">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-sidebar-primary" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-sidebar-foreground/90">{item.asset}</p>
                    <AgentBtn variant="run" entity="Budget" label={`${item.asset}: ${item.desc}`} className="opacity-0 group-hover/row:opacity-100" />
                  </div>
                  <p className="text-sm text-sidebar-foreground/55">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {appraisalItems.length > 0 && (
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest mb-2 text-sidebar-foreground/50">Appraisals active</p>
          <div className="flex flex-col gap-2">
            {appraisalItems.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-lg p-3 group/row border border-primary/25 bg-primary/15">
                <Clock className="h-4 w-4 mt-0.5 shrink-0 text-sidebar-primary" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-sidebar-foreground/90">{item.asset}</p>
                    <AgentBtn variant="run" entity="Appraisal" label={`${item.asset}: ${item.desc}`} className="opacity-0 group-hover/row:opacity-100" />
                  </div>
                  <p className="text-sm text-sidebar-foreground/55">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {marketInsights.length > 0 && (
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest mb-2 text-sidebar-foreground/50">Market insight</p>
          <div className="flex flex-col gap-2">
            {marketInsights.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-lg p-3 group/row border border-primary/25 bg-primary/15">
                <TrendingUp className="h-4 w-4 mt-0.5 shrink-0 text-sidebar-primary" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-sidebar-foreground/90">{item.asset}</p>
                    <AgentBtn variant="run" entity="Comp" label={`${item.asset}: ${item.desc}`} className="opacity-0 group-hover/row:opacity-100" />
                  </div>
                  <p className="text-sm text-sidebar-foreground/55">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {budgetAlerts.length === 0 && appraisalItems.length === 0 && marketInsights.length === 0 && (
        <p className="text-sm text-sidebar-foreground/50">No planning intelligence for selected asset.</p>
      )}
    </div>
  )
}

// ── PlanningPage ──────────────────────────────────────────────────────────────

interface PlanningPageProps {
  onViewBudgets?: () => void
  onViewAppraisals?: () => void
  onViewComps?: () => void
  assetFilter?: string[]
  cityFilter?: string[]
}

export function PlanningPage({ onViewBudgets, onViewAppraisals, onViewComps, assetFilter, cityFilter }: PlanningPageProps) {
  const activeBudgets = React.useMemo(() =>
    (assetFilter?.length ? BUDGETS.filter(b => assetFilter.includes(b.asset)) : BUDGETS).filter(b => !b.archived),
    [assetFilter]
  )
  const activeAppraisals = React.useMemo(() =>
    (assetFilter?.length ? APPRAISALS.filter(a => assetFilter.includes(a.asset)) : APPRAISALS).filter(a => !a.archived),
    [assetFilter]
  )
  const activeComps = React.useMemo(() =>
    (cityFilter?.length ? COMPS.filter(c => cityFilter.some(city => c.citySubmarket.toLowerCase().includes(city.toLowerCase()))) : COMPS).filter(c => !c.archived),
    [cityFilter]
  )

  const budgetNerByAsset    = React.useMemo(() => computeBudgetNerByAsset(activeBudgets), [activeBudgets])
  const appraisalNerByAsset = React.useMemo(() => computeAppraisalNerByAsset(activeAppraisals, activeBudgets), [activeAppraisals, activeBudgets])
  const rentBySubmarket     = React.useMemo(() => computeRentBySubmarket(activeComps), [activeComps])
  const recentComps         = React.useMemo(() =>
    [...activeComps].sort((a, b) => parseLcd(b.lcd).getTime() - parseLcd(a.lcd).getTime()).slice(0, 4),
    [activeComps]
  )

  const totalBudgetSf   = activeBudgets.reduce((s, b) => s + b.size, 0)
  const wtdAvgBudgetNer = totalBudgetSf > 0
    ? activeBudgets.reduce((s, b) => s + b.nerSizeYr * b.size, 0) / totalBudgetSf : 0

  const totalCompSf    = activeComps.reduce((s, c) => s + c.sf, 0)
  const wtdAvgCompRent = totalCompSf > 0
    ? activeComps.reduce((s, c) => s + c.rent * c.sf, 0) / totalCompSf : 0

  const nerValues = activeBudgets.map(b => b.nerSizeYr)
  const minNer = nerValues.length ? Math.min(...nerValues) : 0
  const maxNer = nerValues.length ? Math.max(...nerValues) : 0

  const lowNerCount     = activeBudgets.filter(b => b.nerSizeYr < wtdAvgBudgetNer).length
  const topSubmarket    = rentBySubmarket[0]
  const topSmVsPf       = topSubmarket && wtdAvgBudgetNer > 0
    ? ((topSubmarket.rent - wtdAvgBudgetNer) / wtdAvgBudgetNer * 100) : 0
  const dealTypeCounts  = activeComps.reduce<Record<string, number>>((acc, c) => {
    acc[c.dealType] = (acc[c.dealType] ?? 0) + 1; return acc
  }, {})
  const topDealType = Object.entries(dealTypeCounts).sort((a, b) => b[1] - a[1])[0]
  const sortedByNer = [...budgetNerByAsset].sort((a, b) => a.ner - b.ner)
  const lowestNerRow = sortedByNer[0]

  const budgetAlerts = React.useMemo(() => {
    const alerts: { asset: string; desc: string }[] = []
    if (lowestNerRow && wtdAvgBudgetNer > 0) {
      const pct = ((wtdAvgBudgetNer - lowestNerRow.ner) / wtdAvgBudgetNer * 100).toFixed(1)
      alerts.push({ asset: lowestNerRow.asset, desc: `Avg NER ${fmtRentFull(lowestNerRow.ner)} — ${pct}% below portfolio avg` })
    }
    // Concession vs base-case spread within any asset
    const assets = Array.from(new Set(activeBudgets.map(b => b.asset)))
    for (const asset of assets) {
      const rows = activeBudgets.filter(b => b.asset === asset)
      if (rows.length < 2) continue
      const nerArr = rows.map(b => b.nerSizeYr)
      const spread = Math.max(...nerArr) - Math.min(...nerArr)
      if (spread > 5) {
        alerts.push({ asset, desc: `NER spread ${fmtRent(Math.min(...nerArr))}–${fmtRent(Math.max(...nerArr))} across ${rows.length} scenarios` })
        break
      }
    }
    return alerts.slice(0, 3)
  }, [activeBudgets, lowestNerRow, wtdAvgBudgetNer])

  const appraisalItems = React.useMemo(() =>
    appraisalNerByAsset.slice(0, 2).map(a => ({
      asset: a.asset,
      desc: `${a.scenarios} active scenario${a.scenarios !== 1 ? "s" : ""}, avg NER ${fmtRentFull(a.ner)}${a.budgetNer ? ` (${a.ner >= a.budgetNer ? "+" : ""}${(a.ner - a.budgetNer).toFixed(2)} vs budget)` : ""}`,
    })),
    [appraisalNerByAsset]
  )

  const marketInsights = React.useMemo(() => {
    const insights: { asset: string; desc: string }[] = []
    if (topSubmarket) {
      insights.push({
        asset: topSubmarket.submarket.replace("NY/", "New York / ").replace("BOS/", "Boston / "),
        desc: `Avg comp rent ${fmtRent(topSubmarket.rent)}${topSmVsPf !== 0 ? ` — ${topSmVsPf > 0 ? "+" : ""}${topSmVsPf.toFixed(1)}% vs portfolio NER avg (${fmtRent(wtdAvgBudgetNer)})` : ""}`,
      })
    }
    if (topDealType) {
      insights.push({
        asset: "Market trend",
        desc: `${topDealType[0]} most common (${topDealType[1]} of ${activeComps.length} comps); NER spread ${fmtRent(minNer)}–${fmtRent(maxNer)}`,
      })
    }
    return insights
  }, [topSubmarket, topDealType, activeComps.length, topSmVsPf, wtdAvgBudgetNer, minNer, maxNer])

  const activityItems = React.useMemo(
    () => buildActivityItems(activeBudgets, activeAppraisals, activeComps, wtdAvgBudgetNer),
    [activeBudgets, activeAppraisals, activeComps, wtdAvgBudgetNer]
  )

  const nerRange = nerValues.length ? { min: minNer, max: maxNer } : null

  const kpis = [
    { label: "Active budgets",     value: String(activeBudgets.length) },
    { label: "Active appraisals",  value: String(activeAppraisals.length) },
    { label: "Avg comp rent",      value: activeComps.length ? fmtRent(wtdAvgCompRent) : "$–" },
    { label: "Portfolio NER range", value: nerRange ? `${fmtRent(nerRange.min)} – ${fmtRent(nerRange.max)}` : "$–" },
  ]

  return (
    <div className="space-y-4">
      <KpiBar kpis={kpis} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BudgetSummaryCard nerByAsset={budgetNerByAsset} portfolioAvgNer={wtdAvgBudgetNer} onViewAll={onViewBudgets} />
        <AppraisalSummaryCard nerByAsset={appraisalNerByAsset} nerRange={nerRange} onViewAll={onViewAppraisals} />
        <CompsSummaryCard chartData={rentBySubmarket} recentComps={recentComps} onViewAll={onViewComps} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        <div className="md:col-span-2 flex flex-col">
          <RecentActivityFeed items={activityItems} className="flex-1" />
        </div>
        <div className="md:col-span-1 flex flex-col">
          <PlanningAgentsCard
            lowNerCount={lowNerCount}
            pendingAppraisals={activeAppraisals.length}
            budgetAlerts={budgetAlerts}
            appraisalItems={appraisalItems}
            marketInsights={marketInsights}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  )
}
