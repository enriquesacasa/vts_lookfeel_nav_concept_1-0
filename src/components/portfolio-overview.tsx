import * as React from "react"
import { cn } from "@/lib/utils"
import {
  ArrowRight, Sparkle,
  ChevronUp, ChevronDown, ChevronsUpDown, AlertTriangle,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PortfolioAsset {
  id: string
  name: string
  address: string
  occupancy: number
  noi: string
  noiBudgetDelta: string
  noiBudgetUp: boolean
  expiring12mo: number
  activeDeals: number
  alert?: string
}

interface PortfolioOverviewProps {
  assets: PortfolioAsset[]
  label?: string           // "All assets" or portfolio name
  onAssetClick?: (id: string) => void
}

// ── Static portfolio-level data ───────────────────────────────────────────────

const PORTFOLIO_CRITICAL_DATES = [
  { asset: "VTS Tower",    tenant: "Pfizer",         type: "Lease Expiration",        date: "Sep 15, 2026", monthsOut: 2,  category: "expiring" as const },
  { asset: "Willis Tower", tenant: "Goldman Sachs",  type: "Lease Expiration",        date: "Oct 1, 2026",  monthsOut: 3,  category: "expiring" as const },
  { asset: "Empire State", tenant: "Deloitte LLP",   type: "Contraction Option",      date: "Nov 15, 2026", monthsOut: 4,  category: "options"  as const },
  { asset: "VTS Tower",    tenant: "Morgan Stanley", type: "Lease Expiration",        date: "Nov 1, 2026",  monthsOut: 4,  category: "expiring" as const },
  { asset: "Salesforce",   tenant: "Stripe Inc.",    type: "Renewal Window Opens",    date: "Jan 31, 2027", monthsOut: 6,  category: "renewal"  as const },
  { asset: "Hudson Yards", tenant: "BlackRock",      type: "Expansion Option",        date: "Mar 1, 2027",  monthsOut: 8,  category: "options"  as const },
  { asset: "One WTC",      tenant: "Latham & Watkins", type: "Renewal Window Opens",  date: "May 1, 2027",  monthsOut: 10, category: "renewal"  as const },
  { asset: "Transamerica", tenant: "Wells Fargo",    type: "Lease Expiration",        date: "Jun 30, 2027", monthsOut: 11, category: "expiring" as const },
]

const PIPELINE_DEALS = [
  { asset: "VTS Tower",    tenant: "NovaTech Inc.",   sf: 28500, stage: "LOI"       as const, status: "active"  as const, rent: 52.00 },
  { asset: "Empire State", tenant: "Atlas Group",     sf: 61000, stage: "Proposal"  as const, status: "at-risk" as const, rent: 44.00, note: "Considering competitor" },
  { asset: "Hudson Yards", tenant: "Vertex Studios",  sf: 19800, stage: "LOI"       as const, status: "active"  as const, rent: 58.00 },
  { asset: "Salesforce",   tenant: "Meridian Health", sf: 33000, stage: "Lease Out" as const, status: "stalled" as const, rent: 55.00, stalledDays: 18 },
  { asset: "Willis Tower", tenant: "Apex Capital",    sf: 45000, stage: "Proposal"  as const, status: "active"  as const, rent: 48.00 },
  { asset: "One WTC",      tenant: "Bluewave LLC",    sf: 12400, stage: "Lease Out" as const, status: "active"  as const, rent: 51.00 },
]

const NOI_BY_MONTH = [
  { month: "Jan", actual: 26.1, budget: 25.0 },
  { month: "Feb", actual: 26.8, budget: 25.4 },
  { month: "Mar", actual: 25.9, budget: 25.8 },
  { month: "Apr", actual: 27.4, budget: 26.2 },
  { month: "May", actual: 28.1, budget: 26.6 },
  { month: "Jun", actual: 27.7, budget: 27.0 },
]

// ── Shared primitives ─────────────────────────────────────────────────────────

const CARD = "bg-card rounded-2xl"

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

function AgentBtn({ label }: { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span />}>
        <button className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground transition-all duration-150 shrink-0">
          <Sparkle fill="currentColor" className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-sidebar text-sidebar-foreground border-transparent font-medium text-xs" arrowClassName="fill-sidebar">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-1">{children}</p>
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

// ── Agents CTA ────────────────────────────────────────────────────────────────

function AgentsCta() {
  return (
    <div className="border border-sidebar-border bg-sidebar rounded-2xl p-4 flex items-center gap-4">
      <div className="h-8 w-8 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
        <Sparkle fill="currentColor" className="h-5 w-5 text-sidebar-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-sidebar-foreground mb-0.5">VTS Agents Running</p>
        <p className="text-xs text-sidebar-foreground/55">Portfolio NOI analysis in progress · 5 deals need attention · 3 approvals pending across assets</p>
      </div>
      <button className="shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-primary-foreground bg-primary hover:bg-primary/80 rounded-lg transition-colors whitespace-nowrap">
        View Agents <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  )
}

// ── Asset performance card ────────────────────────────────────────────────────

function AssetPerformanceCard({ assets, onAssetClick, className }: {
  assets: PortfolioAsset[]
  onAssetClick?: (id: string) => void
  className?: string
}) {
  const maxNoi = Math.max(...assets.map(a => parseFloat(a.noi.replace(/[$M]/g, ""))))

  return (
    <div className={cn(CARD, "p-4 overflow-hidden", className)}>
      <Eyebrow>Portfolio breakdown</Eyebrow>
      <SectionTitle action={<ViewAll label="All assets" />}>Asset performance</SectionTitle>

      <div className="space-y-3">
        {assets.map(asset => {
          const noiNum = parseFloat(asset.noi.replace(/[$M]/g, ""))
          const barW = Math.round((noiNum / maxNoi) * 100)
          const shortName = asset.name.replace("Headquarters", "HQ").split(" ").slice(0, 3).join(" ")
          return (
            <div
              key={asset.id}
              className="group cursor-pointer hover:bg-muted/40 -mx-2 px-2 py-2 rounded-lg transition-colors"
              onClick={() => onAssetClick?.(asset.id)}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{shortName}</p>
                  {asset.alert && (
                    <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-full px-1.5 py-0.5">
                      <AlertTriangle className="h-2.5 w-2.5" /> Alert
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className={cn("text-xs font-medium", asset.noiBudgetUp ? "text-success" : "text-destructive")}>
                    {asset.noiBudgetDelta}
                  </span>
                  <span className="text-sm font-semibold text-foreground tabular-nums w-12 text-right">{asset.noi}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-500", asset.noiBudgetUp ? "bg-primary" : "bg-destructive/60")}
                    style={{ width: `${barW}%` }}
                  />
                </div>
                <span className={cn(
                  "text-[10px] font-medium tabular-nums shrink-0 w-14 text-right",
                  asset.occupancy >= 90 ? "text-success" : asset.occupancy >= 75 ? "text-foreground" : "text-warning"
                )}>
                  {asset.occupancy}% occ.
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Asset watchlist card ──────────────────────────────────────────────────────

function AssetWatchlistCard({ assets, onAssetClick, className }: {
  assets: PortfolioAsset[]
  onAssetClick?: (id: string) => void
  className?: string
}) {
  const watchlist = assets
    .filter(a => a.alert || !a.noiBudgetUp || a.occupancy < 80)
    .sort((a, b) => {
      const scoreA = (a.alert ? 2 : 0) + (!a.noiBudgetUp ? 1 : 0)
      const scoreB = (b.alert ? 2 : 0) + (!b.noiBudgetUp ? 1 : 0)
      return scoreB - scoreA
    })
    .slice(0, 5)

  return (
    <div className={cn(CARD, "p-4", className)}>
      <Eyebrow>Needs attention</Eyebrow>
      <SectionTitle>Asset watchlist</SectionTitle>

      {watchlist.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-success font-medium">All assets on track</p>
          <p className="text-xs text-muted-foreground mt-1">No assets currently flagged</p>
        </div>
      )}

      {watchlist.map(asset => {
        const issues: string[] = []
        if (asset.alert) issues.push(asset.alert)
        if (!asset.noiBudgetUp) issues.push(`NOI ${asset.noiBudgetDelta} vs budget`)
        if (asset.occupancy < 80) issues.push(`${asset.occupancy}% occupancy`)
        const shortName = asset.name.replace("Headquarters", "HQ").split(" ").slice(0, 3).join(" ")
        const severity = asset.alert ? "destructive" : "warning"

        return (
          <div
            key={asset.id}
            className="flex items-start gap-3 py-3 border-b border-border last:border-0 group cursor-pointer hover:bg-muted/40 -mx-2 px-2 rounded-lg transition-colors"
            onClick={() => onAssetClick?.(asset.id)}
          >
            <div className={cn(
              "mt-0.5 h-6 w-6 rounded-full flex items-center justify-center shrink-0",
              severity === "destructive" ? "bg-destructive/10" : "bg-warning/10"
            )}>
              <AlertTriangle className={cn("h-3 w-3", severity === "destructive" ? "text-destructive" : "text-warning")} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{shortName}</p>
              <p className={cn("text-xs font-medium mt-0.5", severity === "destructive" ? "text-destructive" : "text-warning")}>
                {issues[0]}
              </p>
              {issues.length > 1 && (
                <p className="text-[11px] text-muted-foreground mt-0.5">{issues.slice(1).join(" · ")}</p>
              )}
            </div>
            <AgentBtn label="Analyze asset" />
          </div>
        )
      })}
    </div>
  )
}

// ── NOI performance card ──────────────────────────────────────────────────────

function NoiPerformanceCard({ className }: { className?: string }) {
  const maxVal = Math.max(...NOI_BY_MONTH.map(d => d.actual))

  return (
    <div className={cn(CARD, "p-4", className)}>
      <Eyebrow>Year to Date</Eyebrow>
      <SectionTitle>NOI Performance</SectionTitle>

      <div className="flex items-end gap-1.5 mb-4">
        {NOI_BY_MONTH.map(d => (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end gap-0.5 h-16">
              <div className="flex-1 rounded-t-sm bg-primary/20" style={{ height: Math.round((d.budget / maxVal) * 64) }} />
              <div className="flex-1 rounded-t-sm bg-primary"    style={{ height: Math.round((d.actual / maxVal) * 64) }} />
            </div>
            <span className="text-[9px] text-muted-foreground">{d.month}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <span className="h-2 w-2 rounded-sm bg-primary inline-block" /> Actual
        </span>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <span className="h-2 w-2 rounded-sm bg-primary/20 inline-block" /> Budget
        </span>
      </div>

      {[
        { label: "YTD Portfolio NOI",   value: "$162.2M",  delta: "+$6.1M vs budget",       pos: true  },
        { label: "Revenue at Risk",     value: "$1.9M/mo", delta: "23 expiring leases",      pos: false },
        { label: "Pipeline Upside",     value: "+$612K/mo", delta: "if LOI+ executes",       pos: true  },
        { label: "Avg. Collections",    value: "98.2%",    delta: "vs 96% target",           pos: true  },
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

// ── Cross-portfolio critical dates ────────────────────────────────────────────

function CriticalDatesCard({ className }: { className?: string }) {
  const [filter, setFilter] = React.useState<"all" | "expiring" | "renewal" | "options">("all")
  const filtered = filter === "all" ? PORTFOLIO_CRITICAL_DATES : PORTFOLIO_CRITICAL_DATES.filter(d => d.category === filter)

  return (
    <div className={cn(CARD, "overflow-hidden", className)}>
      <div className="px-4 pt-4 pb-3 flex items-start justify-between">
        <div>
          <Eyebrow>Upcoming 12 Mo</Eyebrow>
          <h2 className="text-xl font-medium text-foreground">Critical dates</h2>
        </div>
        <ViewAll />
      </div>

      <div className="flex gap-1 px-4 pb-3">
        {(["all", "expiring", "renewal", "options"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors",
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="divide-y divide-border">
        {filtered.map((d, i) => {
          const monthChip = d.monthsOut <= 3
            ? "bg-destructive/10 text-destructive border-destructive/20"
            : d.monthsOut <= 6
            ? "bg-warning/10 text-warning border-warning/20"
            : "bg-muted text-muted-foreground border-border"
          return (
            <div key={i} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/40 transition-colors group">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-medium text-foreground truncate">{d.tenant}</p>
                  <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 capitalize", CATEGORY_STYLES[d.category])}>
                    {d.category}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{d.type} · <span className="text-primary/80">{d.asset}</span></p>
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
    </div>
  )
}

// ── Pipeline summary card ─────────────────────────────────────────────────────

type PipelineSortKey = "tenant" | "sf" | "stage" | "status" | "rent"

function PipelineCard({ className }: { className?: string }) {
  const [sortKey, setSortKey] = React.useState<PipelineSortKey>("status")
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc")

  const STAGE_ORDER  = ["LOI", "Proposal", "Lease Out"]
  const STATUS_ORDER = ["at-risk", "stalled", "active"]

  const handleSort = (key: PipelineSortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
  }

  const sorted = [...PIPELINE_DEALS].sort((a, b) => {
    let va: number | string, vb: number | string
    if      (sortKey === "stage")  { va = STAGE_ORDER.indexOf(a.stage);   vb = STAGE_ORDER.indexOf(b.stage)  }
    else if (sortKey === "status") { va = STATUS_ORDER.indexOf(a.status); vb = STATUS_ORDER.indexOf(b.status) }
    else if (sortKey === "sf")     { va = a.sf;   vb = b.sf   }
    else if (sortKey === "rent")   { va = a.rent; vb = b.rent }
    else                           { va = a.tenant; vb = b.tenant }
    const cmp = typeof va === "number" ? va - (vb as number) : String(va).localeCompare(String(vb))
    return sortDir === "asc" ? cmp : -cmp
  })

  function Th({ label, sk }: { label: string; sk?: PipelineSortKey }) {
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
          <span className="text-xs text-muted-foreground">{PIPELINE_DEALS.length} deals</span>
          <ViewAll label="All deals" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <Th label="Tenant"  sk="tenant" />
              <Th label="Asset"              />
              <Th label="SF"      sk="sf"     />
              <Th label="Stage"   sk="stage"  />
              <Th label="Status"  sk="status" />
              <Th label="Rent"    sk="rent"   />
              <Th label=""                    />
            </tr>
          </thead>
          <tbody>
            {sorted.map((deal, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/40 transition-colors group">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-foreground">{deal.tenant}</p>
                  {"note" in deal && deal.note && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">{deal.note}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-primary/80 font-medium whitespace-nowrap">{deal.asset}</td>
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
                <td className="px-4 py-3 text-sm font-medium text-foreground tabular-nums">${deal.rent.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">
                  <AgentBtn label="Analyze deal" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

export function PortfolioOverview({ assets, onAssetClick }: PortfolioOverviewProps) {
  return (
    <div className="space-y-4">
      <AgentsCta />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AssetPerformanceCard assets={assets} onAssetClick={onAssetClick} className="md:col-span-2" />
        <AssetWatchlistCard   assets={assets} onAssetClick={onAssetClick} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CriticalDatesCard className="md:col-span-2" />
        <NoiPerformanceCard />
      </div>

      <PipelineCard />
    </div>
  )
}
