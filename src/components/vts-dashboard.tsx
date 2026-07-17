import * as React from "react"
import buildingImg from "@/assets/building.jpg"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  TrendingUp, TrendingDown, ChevronUp, ChevronDown, ChevronsUpDown,
  ArrowRight, Sparkle,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"

// ── Data ─────────────────────────────────────────────────────────────────────

const KPIS = [
  { label: "In-Place NOI",    value: "$29.1M",   delta: "+9.4% vs budget",   up: true  },
  { label: "Revenue at Risk", value: "$234K/mo", delta: "-$18K vs budget",   up: false },
  { label: "Pipeline Upside", value: "+$89K/mo", delta: "+$12K vs budget",   up: true  },
  { label: "Occupancy",       value: "70.0%",    delta: "-2.1% vs budget",   up: false },
]

const VACANT_SPACES = [
  { space: "Suite 2100",  sf: 34200, daysVacant: 210 },
  { space: "Floor 7",     sf: 52000, daysVacant: 145 },
  { space: "Suite 400B",  sf: 12800, daysVacant: 62  },
  { space: "Floors 9–10", sf: 88000, daysVacant: 30  },
]

const CRITICAL_DATES = [
  { tenant: "Pfizer",           type: "Lease Expiration",          space: "Suite 1200",   sf: 117000, date: "Sep 15, 2026", monthsOut: 2,  category: "expiring" as const },
  { tenant: "Morgan Stanley",   type: "Lease Expiration",          space: "Floors 8–11",  sf: 116000, date: "Nov 1, 2026",  monthsOut: 4,  category: "expiring" as const },
  { tenant: "Deloitte LLP",     type: "Rent Commencement",         space: "Suite 500",    sf: 43000,  date: "Dec 1, 2026",  monthsOut: 5,  category: "expiring" as const },
  { tenant: "KPMG",             type: "Renewal Window Opens",      space: "Suite 3400",   sf: 117000, date: "Jan 31, 2027", monthsOut: 6,  category: "renewal"  as const },
  { tenant: "Ernst & Young",    type: "Contraction Option",        space: "Suite 2200",   sf: 80100,  date: "Mar 1, 2027",  monthsOut: 8,  category: "options"  as const },
  { tenant: "HSBC Holdings",    type: "ROFO Notice Deadline",      space: "Suite 900",    sf: 69300,  date: "Apr 15, 2027", monthsOut: 9,  category: "options"  as const },
  { tenant: "Latham & Watkins", type: "Renewal Window Opens",      space: "Floors 14–15", sf: 119000, date: "May 1, 2027",  monthsOut: 10, category: "renewal"  as const },
  { tenant: "JPMorgan Chase",   type: "Expansion Option Deadline", space: "Floor 6",      sf: 55800,  date: "Jun 30, 2027", monthsOut: 11, category: "options"  as const },
]

const ACTIVE_DEALS = [
  { tenant: "NovaTech Inc.",   space: "Suite 800",  sf: 28500, stage: "LOI"       as const, status: "active"  as const, baseRent: 52.00, budgetRent: 50.00 },
  { tenant: "Apex Capital",    space: "Floor 12",   sf: 45000, stage: "Proposal"  as const, status: "active"  as const, baseRent: 48.00, budgetRent: 52.00, note: "Counter awaiting response" },
  { tenant: "Meridian Health", space: "Suite 1800", sf: 33000, stage: "Lease Out" as const, status: "stalled" as const, baseRent: 55.00, budgetRent: 55.00 },
  { tenant: "Atlas Group",     space: "Floors 2–3", sf: 61000, stage: "Proposal"  as const, status: "at-risk" as const, baseRent: 44.00, budgetRent: 50.00, note: "Considering competitor building" },
  { tenant: "Vertex Studios",  space: "Suite 600",  sf: 19800, stage: "LOI"       as const, status: "active"  as const, baseRent: 58.00, budgetRent: 56.00 },
  { tenant: "Bluewave LLC",    space: "Suite 300",  sf: 12400, stage: "Lease Out" as const, status: "active"  as const, baseRent: 51.00, budgetRent: 51.00 },
]

const NOI_DATA = [
  { month: "Jan", actual: 2.30, budget: 2.20 },
  { month: "Feb", actual: 2.35, budget: 2.22 },
  { month: "Mar", actual: 2.28, budget: 2.24 },
  { month: "Apr", actual: 2.41, budget: 2.26 },
  { month: "May", actual: 2.50, budget: 2.28 },
  { month: "Jun", actual: 2.47, budget: 2.30 },
]

// ── Shared primitives ─────────────────────────────────────────────────────────

const CARD = "bg-card"

const CATEGORY_STYLES = {
  expiring: "bg-destructive/10 text-destructive border-destructive/20",
  renewal:  "bg-primary/10 text-primary border-primary/20",
  options:  "bg-secondary text-secondary-foreground border-border",
} as const

const STAGE_STYLES: Record<string, string> = {
  "LOI":       "bg-primary/10 text-primary border-primary/20",
  "Proposal":  "bg-secondary text-secondary-foreground border-border",
  "Lease Out": "bg-success/10 text-success border-success/20",
}

const STATUS_STYLES: Record<string, string> = {
  "active":  "bg-success/10 text-success border-success/20",
  "stalled": "bg-warning/10 text-warning border-warning/20",
  "at-risk": "bg-destructive/10 text-destructive border-destructive/20",
}

const STAGE_ORDER  = ["LOI", "Proposal", "Lease Out"]
const STATUS_ORDER = ["at-risk", "stalled", "active"]

function AgentBtn({ label }: { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span />}>
        <button className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground transition-all duration-150 shrink-0">
          <Sparkle fill="currentColor" className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-sidebar text-sidebar-foreground border-transparent font-medium text-xs"
        arrowClassName="fill-sidebar"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-1">
      {children}
    </p>
  )
}

function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-3">
      <h2 className="text-xl font-medium text-foreground">{children}</h2>
      {action}
    </div>
  )
}

function ViewAll({ label = "View All" }: { label?: string }) {
  return (
    <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 mt-0.5">
      {label} <ArrowRight className="h-3 w-3" />
    </button>
  )
}

// ── KPI Bar ───────────────────────────────────────────────────────────────────

function KpiBar() {
  return (
    <div className={cn(CARD, "grid grid-cols-2 md:grid-cols-4 divide-x divide-border")}>
      {KPIS.map(kpi => (
        <div key={kpi.label} className="px-6 py-5">
          <Eyebrow>{kpi.label}</Eyebrow>
          <p className="text-3xl font-medium text-foreground tracking-tight mt-1">{kpi.value}</p>
          <p className={cn(
            "text-xs font-medium flex items-center gap-1 mt-1.5",
            kpi.up ? "text-success" : "text-destructive"
          )}>
            {kpi.up
              ? <TrendingUp className="h-3 w-3 shrink-0" />
              : <TrendingDown className="h-3 w-3 shrink-0" />}
            {kpi.delta}
          </p>
        </div>
      ))}
    </div>
  )
}

// ── Agents CTA ────────────────────────────────────────────────────────────────

function AgentsCta() {
  return (
    <div className="border border-sidebar-border bg-sidebar p-4 flex items-center gap-4">
      <div className="h-8 w-8 bg-primary/20 flex items-center justify-center shrink-0">
        <Sparkle fill="currentColor" className="h-5 w-5 text-sidebar-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-sidebar-foreground mb-0.5">VTS Agents Running</p>
        <p className="text-xs text-sidebar-foreground/55">Q3 NOI analysis in progress · 3 deals need attention · 2 approvals pending</p>
      </div>
      <button className="shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/80 transition-colors whitespace-nowrap">
        View Agents <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  )
}

// ── Vacancy card ─────────────────────────────────────────────────────────────

function VacancyCard({ className }: { className?: string }) {
  const total       = 957638 + 410416
  const occupiedPct = Math.round((957638 / total) * 100)

  return (
    <div className={cn(CARD, "p-4", className)}>
      <Eyebrow>Availability</Eyebrow>
      <SectionTitle action={<ViewAll label="All spaces" />}>Vacant spaces</SectionTitle>

      <div className="flex items-end gap-3 mb-4">
        <p className="text-5xl font-medium text-foreground tracking-tight">{occupiedPct}%</p>
        <div className="pb-1.5">
          <p className="text-sm font-medium text-muted-foreground">occupied</p>
          <p className="text-xs text-muted-foreground">957K of 1.37M sf</p>
        </div>
      </div>

      <Progress value={occupiedPct} className="h-2 mb-5" />

      {VACANT_SPACES.map((s, i) => {
        const chip = s.daysVacant > 120
          ? "bg-destructive/10 text-destructive border-destructive/20"
          : s.daysVacant > 60
          ? "bg-warning/10 text-warning border-warning/20"
          : "bg-success/10 text-success border-success/20"
        return (
          <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0 group">
            <div>
              <p className="text-sm font-medium text-foreground">{s.space}</p>
              <p className="text-xs text-muted-foreground">{s.sf.toLocaleString()} sf</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full border", chip)}>
                {s.daysVacant}d vacant
              </span>
              <AgentBtn label="Analyze vacant space" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Critical dates card ───────────────────────────────────────────────────────

function CriticalDatesCard({ className }: { className?: string }) {
  return (
    <div className={cn(CARD, "p-4", className)}>
      <Eyebrow>Upcoming 12 Mo</Eyebrow>
      <SectionTitle action={<ViewAll />}>Critical dates</SectionTitle>

      {CRITICAL_DATES.map((d, i) => {
        const monthChip = d.monthsOut <= 3
          ? "bg-destructive/10 text-destructive border-destructive/20"
          : d.monthsOut <= 6
          ? "bg-warning/10 text-warning border-warning/20"
          : "bg-muted text-muted-foreground border-border"
        return (
          <div
            key={i}
            className="flex items-center gap-4 py-3 border-b border-border last:border-0 group hover:bg-muted/40 -mx-2 px-2 rounded-lg transition-colors"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-medium text-foreground truncate">{d.tenant}</p>
                <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 capitalize", CATEGORY_STYLES[d.category])}>
                  {d.category}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{d.type} · {d.space} · {d.sf.toLocaleString()} sf</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <p className="text-xs font-medium text-foreground">{d.date}</p>
                <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border mt-0.5 inline-block", monthChip)}>
                  {d.monthsOut} mo
                </span>
              </div>
              <AgentBtn label="Analyze critical date" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Financial snapshot ────────────────────────────────────────────────────────

function FinancialCard({ className }: { className?: string }) {
  const maxVal = Math.max(...NOI_DATA.map(d => d.actual))

  return (
    <div className={cn(CARD, "p-4", className)}>
      <Eyebrow>Year to Date</Eyebrow>
      <SectionTitle>NOI Performance</SectionTitle>

      <div className="flex items-end gap-1.5 mb-4">
        {NOI_DATA.map(d => (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end gap-0.5 h-16">
              <div
                className="flex-1 rounded-t-sm bg-primary/20"
                style={{ height: Math.round((d.budget / maxVal) * 64) }}
              />
              <div
                className="flex-1 rounded-t-sm bg-primary"
                style={{ height: Math.round((d.actual / maxVal) * 64) }}
              />
            </div>
            <span className="text-[9px] text-muted-foreground">{d.month}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-5">
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <span className="h-2 w-2 rounded-sm bg-primary inline-block" /> Actual
        </span>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <span className="h-2 w-2 rounded-sm bg-primary/20 inline-block" /> Budget
        </span>
      </div>

      {[
        { label: "YTD NOI",          value: "$14.3M",   delta: "+$1.2M vs budget", pos: true  },
        { label: "Revenue at Risk",  value: "$234K/mo", delta: "3 expiring leases", pos: false },
        { label: "Pipeline Upside",  value: "+$89K/mo", delta: "if LOI+ executes",  pos: true  },
        { label: "Collections Rate", value: "98.7%",    delta: "vs 96% target",     pos: true  },
      ].map(row => (
        <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
          <p className="text-sm text-muted-foreground">{row.label}</p>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{row.value}</p>
              <p className={cn("text-[11px] font-medium", row.pos ? "text-success" : "text-destructive")}>{row.delta}</p>
            </div>
            <AgentBtn label="Analyze metric" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Leasing activity table ────────────────────────────────────────────────────

type SortKey = "tenant" | "sf" | "stage" | "status" | "baseRent"

function LeasingActivityCard({ className }: { className?: string }) {
  const [sortKey, setSortKey] = React.useState<SortKey>("status")
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc")

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
  }

  const sorted = [...ACTIVE_DEALS].sort((a, b) => {
    let va: number | string, vb: number | string
    if      (sortKey === "stage")    { va = STAGE_ORDER.indexOf(a.stage);   vb = STAGE_ORDER.indexOf(b.stage)  }
    else if (sortKey === "status")   { va = STATUS_ORDER.indexOf(a.status); vb = STATUS_ORDER.indexOf(b.status) }
    else if (sortKey === "sf")       { va = a.sf;       vb = b.sf       }
    else if (sortKey === "baseRent") { va = a.baseRent; vb = b.baseRent }
    else                             { va = a.tenant;   vb = b.tenant   }
    const cmp = typeof va === "number" ? va - (vb as number) : String(va).localeCompare(String(vb))
    return sortDir === "asc" ? cmp : -cmp
  })

  function Th({ label, sk }: { label: string; sk?: SortKey }) {
    const active = sk && sortKey === sk
    return (
      <th
        onClick={sk ? () => handleSort(sk) : undefined}
        className={cn(
          "px-4 py-3 text-left text-[11px] font-medium uppercase tracking-widest text-muted-foreground select-none",
          sk && "cursor-pointer hover:text-foreground transition-colors"
        )}
      >
        <span className="flex items-center gap-1">
          {label}
          {sk && (active
            ? sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
            : <ChevronsUpDown className="h-3 w-3 opacity-40" />
          )}
        </span>
      </th>
    )
  }

  return (
    <div className={cn(CARD, "overflow-hidden", className)}>
      <div className="px-4 pt-4 pb-3 flex items-start justify-between">
        <div>
          <Eyebrow>Active pipeline</Eyebrow>
          <h2 className="text-xl font-medium text-foreground">Leasing activity</h2>
        </div>
        <div className="flex items-center gap-2 pt-0.5">
          <span className="text-xs text-muted-foreground">{ACTIVE_DEALS.length} deals</span>
          <ViewAll label="All deals" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <Th label="Tenant"    sk="tenant"   />
              <Th label="Space"                   />
              <Th label="SF"        sk="sf"        />
              <Th label="Stage"     sk="stage"     />
              <Th label="Status"    sk="status"    />
              <Th label="Base rent" sk="baseRent"  />
              <Th label=""                         />
            </tr>
          </thead>
          <tbody>
            {sorted.map((deal, i) => {
              const delta = deal.baseRent - deal.budgetRent
              return (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors group">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground">{deal.tenant}</p>
                    {"note" in deal && deal.note && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">{deal.note}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{deal.space}</td>
                  <td className="px-4 py-3 text-sm text-foreground tabular-nums">{deal.sf.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded border whitespace-nowrap", STAGE_STYLES[deal.stage])}>
                      {deal.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded border capitalize whitespace-nowrap", STATUS_STYLES[deal.status])}>
                      {deal.status.replace("-", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground tabular-nums">${deal.baseRent.toFixed(2)}</p>
                    <p className={cn("text-[11px] font-medium tabular-nums",
                      delta > 0 ? "text-success" : delta < 0 ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {delta > 0 ? `+$${delta.toFixed(2)}` : delta < 0 ? `-$${Math.abs(delta).toFixed(2)}` : "on budget"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AgentBtn label="Analyze deal" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────


export function VtsDashboard({ header }: { header?: React.ReactNode } = {}) {
  return (
    <div className="space-y-3 p-4 sm:p-6">
      {header ?? <PageHeader eyebrow="Asset Dashboard" name="VTS Tower Headquarters" subtitle="114 West 41st Street, New York, NY 10036 · Built 2017 · 52 Floors · Office" image={buildingImg} stats={[{ label: "Total SF", value: "1.37M" }, { label: "Floors", value: "52" }, { label: "Managed", value: "CBRE" }]} />}

      <KpiBar />

      <AgentsCta />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <VacancyCard />
        <CriticalDatesCard className="md:col-span-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LeasingActivityCard className="md:col-span-2" />
        <FinancialCard />
      </div>
    </div>
  )
}
