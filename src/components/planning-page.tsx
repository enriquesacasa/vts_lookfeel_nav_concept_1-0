import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { KpiBar } from "@/components/kpi-bar"
import { AgentBtn } from "@/components/agent-btn"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, Sparkle, TrendingUp, FileText, BarChart2 } from "lucide-react"
import { BUDGETS } from "@/components/budgets-page"
import { APPRAISALS } from "@/components/appraisals-page"
import { COMPS } from "@/components/comps-page"
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtM(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  return `$${(n / 1_000_000).toFixed(1)}M`
}

function fmtRent(n: number) {
  return `$${n.toFixed(0)}/sf`
}

// ── Inline SVG: Budget grouped bar chart ─────────────────────────────────────

function BudgetBarChart() {
  const data = (["Revenue", "Expense", "CapEx"] as const).map(cat => {
    const rows = BUDGETS.filter(b => b.category === cat)
    return {
      cat,
      Budget: rows.reduce((a, b) => a + b.budget, 0) / 1_000_000,
      Actual: rows.reduce((a, b) => a + b.actual, 0) / 1_000_000,
    }
  })
  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={data} barCategoryGap="28%" barGap={2} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} />
        <XAxis dataKey="cat" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}M`} width={32} />
        <Tooltip formatter={(v) => [`$${Number(v).toFixed(0)}M`]} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
        <Bar dataKey="Budget" fill="var(--color-primary)" radius={[3,3,0,0]} isAnimationActive={false} />
        <Bar dataKey="Actual" fill="var(--color-primary)" fillOpacity={0.45} radius={[3,3,0,0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Inline SVG: Appraisal sparkline ──────────────────────────────────────────

const APPRAISAL_TREND = [
  { q: "Q1 25", v: 2_410_000_000 },
  { q: "Q2 25", v: 2_450_000_000 },
  { q: "Q3 25", v: 2_480_000_000 },
  { q: "Q4 25", v: 2_510_000_000 },
  { q: "Q1 26", v: 2_580_000_000 },
  { q: "Q2 26", v: 2_625_000_000 },
]

function AppraisalSparkline() {
  const data = APPRAISAL_TREND.map(d => ({ q: d.q, value: d.v / 1_000_000_000 }))
  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.18} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} />
        <XAxis dataKey="q" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v.toFixed(1)}B`} width={36} domain={["auto", "auto"]} />
        <Tooltip formatter={(v) => [`$${Number(v).toFixed(2)}B`, "Value"]} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
        <Area dataKey="value" stroke="var(--color-primary)" strokeWidth={2} fill="url(#sparkGrad)" dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ── Inline SVG: Comps effective rent bar chart ────────────────────────────────

const COMPS_TREND = [
  { q: "Q3 25", rent: 92 },
  { q: "Q4 25", rent: 95 },
  { q: "Q1 26", rent: 98 },
  { q: "Q2 26", rent: 102 },
]

function CompsBarChart() {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <BarChart data={COMPS_TREND} barCategoryGap="35%" margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.5} />
        <XAxis dataKey="q" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 9, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} width={28} domain={[0, "auto"]} />
        <Tooltip formatter={(v) => [`$${v}/sf`, "Eff. rent"]} contentStyle={{ fontSize: 11, borderRadius: 6 }} />
        <Bar dataKey="rent" fill="var(--color-primary)" radius={[3,3,0,0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── BudgetSummaryCard ─────────────────────────────────────────────────────────

function BudgetSummaryCard({ onViewAll }: { onViewAll?: () => void }) {
  const categories = ["Revenue", "Expense", "CapEx"] as const
  const summaryRows = categories.map(cat => {
    const rows = BUDGETS.filter(b => b.category === cat)
    const varDollar = rows.reduce((a, b) => a + b.varianceDollar, 0)
    const varPct = rows.reduce((a, b) => a + b.variancePct, 0) / rows.length
    return { cat, varDollar, varPct }
  })

  return (
    <div className={cardBase}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">2026</p>
          <h2 className="text-xl font-semibold text-foreground">Budget performance</h2>
        </div>
        {onViewAll && (
          <Button variant="outline" size="sm" onClick={onViewAll} className="shrink-0">View budgets</Button>
        )}
      </div>
      <BudgetBarChart />
      <div className="flex items-center gap-3 mt-2 mb-4">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-primary" />
          <span className="text-xs text-muted-foreground">Budget</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-sm bg-primary opacity-45" />
          <span className="text-xs text-muted-foreground">Actual</span>
        </div>
      </div>
      <div className="space-y-2">
        {summaryRows.map(r => (
          <div key={r.cat} className="flex items-center justify-between py-1.5 border-t border-border/50 first:border-0 first:pt-0 group/row">
            <span className="text-sm text-foreground">{r.cat}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm tabular-nums text-foreground">
                {r.varDollar >= 0 ? "+" : ""}${Math.abs(r.varDollar / 1_000_000).toFixed(1)}M
              </span>
              <span className={cn("text-sm tabular-nums font-medium w-14 text-right", r.varPct >= 0 ? "text-success" : "text-destructive")}>
                {r.varPct >= 0 ? "+" : ""}{r.varPct.toFixed(1)}%
              </span>
              <AgentBtn entity="budget" label={`Analyze ${r.cat} budget variance`} className="" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── AppraisalSummaryCard ──────────────────────────────────────────────────────

function AppraisalSummaryCard({ onViewAll }: { onViewAll?: () => void }) {
  const seen = new Set<string>()
  const assetRows = APPRAISALS.filter(a => {
    if (seen.has(a.asset)) return false
    seen.add(a.asset)
    return true
  })

  const STATUS_DOT: Record<string, string> = {
    "Current": "bg-success",
    "Pending": "bg-warning",
    "Stale":   "bg-destructive",
  }

  function fmtVal(n: number) {
    if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
    return `$${(n / 1_000_000).toFixed(0)}M`
  }

  return (
    <div className={cardBase}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">Portfolio</p>
          <h2 className="text-xl font-semibold text-foreground">Appraisals</h2>
        </div>
        {onViewAll && (
          <Button variant="outline" size="sm" onClick={onViewAll} className="shrink-0">View appraisals</Button>
        )}
      </div>
      <AppraisalSparkline />
      <div className="space-y-2 mt-4">
        {assetRows.map(a => (
          <div key={a.id} className="flex items-center gap-2.5 py-1.5 border-t border-border/50 first:border-0 first:pt-0 group/row">
            <span className={cn("inline-block w-2 h-2 rounded-full shrink-0", STATUS_DOT[a.status] ?? "bg-muted")} />
            <span className="text-sm text-foreground truncate flex-1 min-w-0">{a.asset}</span>
            <span className="text-sm tabular-nums font-medium text-foreground shrink-0">{fmtVal(a.appraisedValue)}</span>
            <span className="text-sm text-muted-foreground shrink-0">{a.capRate.toFixed(1)}%</span>
            <AgentBtn entity="appraisal" label={`Review appraisal for ${a.asset}`} className="" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── CompsSummaryCard ──────────────────────────────────────────────────────────

function CompsSummaryCard({ onViewAll }: { onViewAll?: () => void }) {
  const recent = [...COMPS].slice(0, 4)

  return (
    <div className={cardBase}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">Market</p>
          <h2 className="text-xl font-semibold text-foreground">Recent comps</h2>
        </div>
        {onViewAll && (
          <Button variant="outline" size="sm" onClick={onViewAll} className="shrink-0">View comps</Button>
        )}
      </div>
      <CompsBarChart />
      <div className="space-y-2 mt-4">
        {recent.map(c => (
          <div key={c.id} className="flex items-center gap-2.5 py-1.5 border-t border-border/50 first:border-0 first:pt-0 group/row">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{c.tenant}</p>
              <p className="text-xs text-muted-foreground truncate">{c.building}</p>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">{c.sf.toLocaleString()} sf</span>
            <span className="text-sm tabular-nums font-medium text-foreground shrink-0">{fmtRent(c.effectiveRent)}</span>
            <AgentBtn entity="comp" label={`Analyze comp: ${c.tenant} at ${c.building}`} className="" />
          </div>
        ))}
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

const ACTIVITY_ITEMS: ActivityItem[] = [
  { icon: <AlertTriangle className="h-3.5 w-3.5 text-destructive" />, title: "CapEx budget exceeded by $650K", asset: "VTS Tower Headquarters", time: "2h ago", category: "Budget" },
  { icon: <FileText className="h-3.5 w-3.5 text-success" />,          title: "Appraisal filed at $1.24B",     asset: "VTS Tower Headquarters", time: "1d ago", category: "Appraisal" },
  { icon: <BarChart2 className="h-3.5 w-3.5 text-warning" />,         title: "New comp added: Goldman Sachs 45K sf at $96/sf", asset: "VTS Tower Headquarters", time: "2d ago", category: "Comp" },
  { icon: <AlertTriangle className="h-3.5 w-3.5 text-warning" />,     title: "Revenue budget at risk, Q1 -2.2%", asset: "VTS Tower Headquarters", time: "3d ago", category: "Budget" },
  { icon: <FileText className="h-3.5 w-3.5 text-success" />,          title: "Appraisal filed at $520M",       asset: "One Financial Plaza",    time: "4d ago", category: "Appraisal" },
  { icon: <AlertTriangle className="h-3.5 w-3.5 text-destructive" />, title: "CapEx over budget by $150K",     asset: "One Financial Plaza",    time: "5d ago", category: "Budget" },
  { icon: <BarChart2 className="h-3.5 w-3.5 text-warning" />,         title: "New comp added: KKR 80K sf at $118/sf", asset: "30 Hudson Yards", time: "6d ago", category: "Comp" },
  { icon: <Clock className="h-3.5 w-3.5 text-primary" />,             title: "Appraisal pending review",       asset: "Salesforce Tower",       time: "1w ago", category: "Appraisal" },
]

function RecentActivityFeed({ className }: { className?: string }) {
  return (
    <div className={cn(cardBase, className)}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">Activity</p>
          <h2 className="text-xl font-semibold text-foreground">Recent planning activity</h2>
        </div>
      </div>
      <div className="space-y-1">
        {ACTIVITY_ITEMS.map((item, i) => (
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
              <AgentBtn
                entity={item.category}
                label={item.title}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── PlanningAgentsCard ────────────────────────────────────────────────────────

function PlanningAgentsCard({ className }: { className?: string }) {
  const overBudgetCount = BUDGETS.filter(b => b.status === "Over budget").length
  const pendingAppraisals = APPRAISALS.filter(a => a.status === "Pending").length

  const budgetAlerts = [
    { asset: "VTS Tower Headquarters", desc: "CapEx over budget by $650K (+20.3%)" },
    { asset: "One Financial Plaza",    desc: "CapEx over budget by $150K (+15.8%)" },
    { asset: "VTS Tower Headquarters", desc: "Expense at risk Q2 (+4.2%)" },
  ]

  const appraisalsDue = [
    { asset: "VTS Tower Headquarters", desc: "Pending review, due Dec 20, 2026" },
    { asset: "One Financial Plaza",    desc: "Pending review, due Nov 01, 2026" },
  ]

  const marketInsights = [
    { asset: "Hudson Yards",           desc: "Market rents up 4.2% vs portfolio avg, 3 leases below market" },
    { asset: "Midtown Manhattan",      desc: "Effective rents at $96/sf, 8% above portfolio avg" },
  ]

  return (
    <div className={cn(cardBase, "border-transparent bg-sidebar-accent flex flex-col gap-4", className)}>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-widest mb-1 text-sidebar-foreground/70">VTS agents</p>
        <h2 className="text-xl font-semibold text-sidebar-foreground">Planning intelligence</h2>
      </div>

      <div className="rounded-lg px-3 py-2 flex items-center gap-2 bg-sidebar-foreground/10">
        <Sparkle className="h-4 w-4 shrink-0 text-sidebar-primary" />
        <p className="text-sm leading-snug text-sidebar-foreground/70">
          {overBudgetCount} budget variance{overBudgetCount !== 1 ? "s" : ""} detected +{" "}
          <span className="text-sidebar-primary font-medium">{pendingAppraisals} appraisal{pendingAppraisals !== 1 ? "s" : ""} due</span>
        </p>
      </div>

      {/* Budget alerts */}
      <div>
        <p className="text-[10px] font-medium uppercase tracking-widest mb-2 text-sidebar-foreground/50">Budget alerts</p>
        <div className="flex flex-col gap-2">
          {budgetAlerts.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-lg p-3 group/row border border-primary/25 bg-primary/15">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-sidebar-primary" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-sidebar-foreground/90">{item.asset}</p>
                  <AgentBtn variant="run" entity="Budget" label={`${item.asset} · ${item.desc}`} className="opacity-0 group-hover/row:opacity-100" />
                </div>
                <p className="text-sm text-sidebar-foreground/55">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Appraisals due */}
      <div>
        <p className="text-[10px] font-medium uppercase tracking-widest mb-2 text-sidebar-foreground/50">Appraisals due</p>
        <div className="flex flex-col gap-2">
          {appraisalsDue.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-lg p-3 group/row border border-primary/25 bg-primary/15">
              <Clock className="h-4 w-4 mt-0.5 shrink-0 text-sidebar-primary" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-sidebar-foreground/90">{item.asset}</p>
                  <AgentBtn variant="run" entity="Appraisal" label={`${item.asset} · ${item.desc}`} className="opacity-0 group-hover/row:opacity-100" />
                </div>
                <p className="text-sm text-sidebar-foreground/55">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market insight */}
      <div>
        <p className="text-[10px] font-medium uppercase tracking-widest mb-2 text-sidebar-foreground/50">Market insight</p>
        <div className="flex flex-col gap-2">
          {marketInsights.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded-lg p-3 group/row border border-primary/25 bg-primary/15">
              <TrendingUp className="h-4 w-4 mt-0.5 shrink-0 text-sidebar-primary" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-sidebar-foreground/90">{item.asset}</p>
                  <AgentBtn variant="run" entity="Comp" label={`${item.asset} · ${item.desc}`} className="opacity-0 group-hover/row:opacity-100" />
                </div>
                <p className="text-sm text-sidebar-foreground/55">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── PlanningPage ──────────────────────────────────────────────────────────────

interface PlanningPageProps {
  onViewBudgets?: () => void
  onViewAppraisals?: () => void
  onViewComps?: () => void
}

export function PlanningPage({ onViewBudgets, onViewAppraisals, onViewComps }: PlanningPageProps) {
  // KPI computations
  const totalNoiBudget = BUDGETS.filter(b => b.category === "Revenue").reduce((a, b) => a + b.budget, 0)

  // Deduplicated portfolio appraised value (max per asset)
  const assetMaxVal = new Map<string, number>()
  for (const a of APPRAISALS) {
    assetMaxVal.set(a.asset, Math.max(assetMaxVal.get(a.asset) ?? 0, a.appraisedValue))
  }
  const portfolioValue = Array.from(assetMaxVal.values()).reduce((a, v) => a + v, 0)

  const totalSf = COMPS.reduce((a, c) => a + c.sf, 0)
  const avgEffective = COMPS.reduce((a, c) => a + c.effectiveRent * c.sf, 0) / totalSf

  const capExCommitted = BUDGETS.filter(b => b.category === "CapEx").reduce((a, b) => a + b.actual, 0)

  const kpis = [
    { label: "Total NOI budget",          value: fmtM(totalNoiBudget) },
    { label: "Portfolio appraised value", value: fmtM(portfolioValue) },
    { label: "Avg effective rent",        value: fmtRent(avgEffective) },
    { label: "CapEx committed",           value: fmtM(capExCommitted) },
  ]

  return (
    <div className="space-y-4">
      <KpiBar kpis={kpis} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BudgetSummaryCard onViewAll={onViewBudgets} />
        <AppraisalSummaryCard onViewAll={onViewAppraisals} />
        <CompsSummaryCard onViewAll={onViewComps} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        <div className="md:col-span-2 flex flex-col">
          <RecentActivityFeed className="flex-1" />
        </div>
        <div className="md:col-span-1 flex flex-col">
          <PlanningAgentsCard className="flex-1" />
        </div>
      </div>
    </div>
  )
}
