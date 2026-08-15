import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  ChevronRight, Check, X, Clock, CheckCircle2, Circle,
  AlertCircle, Eye, FileText, MessageSquare,
  ArrowDownLeft, ArrowUpRight, Sparkle, Plus,
} from "lucide-react"
import type { Deal } from "@/components/deals-page"

// ─── Tenant logo ──────────────────────────────────────────────────────────────

const TENANT_LOGO: Record<string, string> = {
  "Starbucks Corporation": "/vts_lookfeel_nav_concept_1-0/logos/starbucks.png",
  "Pfizer Inc.":           "/vts_lookfeel_nav_concept_1-0/logos/pfizer.png",
  "Morgan Stanley":        "/vts_lookfeel_nav_concept_1-0/logos/morganstanley.png",
  "Deloitte LLP":          "/vts_lookfeel_nav_concept_1-0/logos/deloitte.png",
  "KPMG":                  "/vts_lookfeel_nav_concept_1-0/logos/kpmg.png",
  "Ernst & Young":         "/vts_lookfeel_nav_concept_1-0/logos/ey.png",
  "HSBC Holdings":         "/vts_lookfeel_nav_concept_1-0/logos/hsbc.png",
  "Latham & Watkins":      "/vts_lookfeel_nav_concept_1-0/logos/lw.png",
  "JPMorgan Chase":        "/vts_lookfeel_nav_concept_1-0/logos/jpmorgan.png",
}

export function TenantLogoImage({ name }: { name: string }) {
  const [failed, setFailed] = React.useState(false)
  const src = TENANT_LOGO[name]
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  if (src && !failed) {
    return (
      <div className="h-full w-full bg-background flex items-center justify-center p-2">
        <img src={src} alt={name} className="max-h-full max-w-full object-contain" onError={() => setFailed(true)} />
      </div>
    )
  }
  return (
    <div className="h-full w-full flex items-center justify-center text-primary-foreground font-semibold text-lg bg-primary/80">
      {initials}
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

type CashFlowRow = {
  label: string
  indent?: boolean
  subtotal?: boolean    // single underline
  total?: boolean       // double underline
  positive?: boolean    // NOI / Net Cash Flow green
  section?: "income" | "expense" | "capital"
  budget: string | null
  prevLease: string | null
  prop1: string | null
  prop2: string | null
  prop3: string | null
  marketComp?: string | null
  renewalScenario?: string | null
  askingRent?: string | null
}

type ActivityEvent = {
  date: string
  type: "tour" | "proposal" | "call" | "doc" | "status"
  label: string
  detail?: string
  from?: "tenant" | "landlord"
}

type Approver = {
  name: string
  title: string
  status: "approved" | "pending" | "waiting"
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const CASH_FLOW: CashFlowRow[] = [
  { label: "Start Date",                  budget: "Mar 1, 2026",   prevLease: "Jun 1, 2019",    prop1: "Apr 1, 2026",    prop2: "Mar 1, 2026",    prop3: "Mar 1, 2026",   marketComp: "Mar 1, 2026",   renewalScenario: "Jun 1, 2026",  askingRent: "Mar 1, 2026",   section: "income"  },
  { label: "Base Rent",                   budget: "$964,191",      prevLease: "$872,400",        prop1: "$936,000",       prop2: "$1,002,000",     prop3: "$972,000",      marketComp: "$1,020,000",    renewalScenario: "$912,000",     askingRent: "$1,080,000",    section: "income"  },
  { label: "Abated Base Rent",   indent:true, budget: "($75,000)", prevLease: "($90,000)",       prop1: "($150,000)",     prop2: "($75,000)",      prop3: "($112,500)",    marketComp: "($85,000)",     renewalScenario: "($60,000)",    askingRent: "($90,000)",     section: "income"  },
  { label: "RE Tax Recovery",    indent:true, budget: "$99,000",   prevLease: "$88,400",         prop1: "$99,000",        prop2: "$99,000",        prop3: "$99,000",       marketComp: "$99,000",       renewalScenario: "$99,000",      askingRent: "$99,000",       section: "income"  },
  { label: "CAM Recovery",       indent:true, budget: "$225,000",  prevLease: "$198,000",        prop1: "$225,000",       prop2: "$225,000",       prop3: "$225,000",      marketComp: "$225,000",      renewalScenario: "$225,000",     askingRent: "$225,000",      section: "income"  },
  { label: "Insurance Recovery", indent:true, budget: "$45,000",   prevLease: "$38,500",         prop1: "$45,000",        prop2: "$45,000",        prop3: "$45,000",       marketComp: "$45,000",       renewalScenario: "$45,000",      askingRent: "$45,000",       section: "income"  },
  { label: "Promo Charges Rev.", indent:true, budget: "$16,070",   prevLease: "$14,200",         prop1: "$16,070",        prop2: "$16,070",        prop3: "$16,070",       marketComp: "$16,070",       renewalScenario: "$16,070",      askingRent: "$16,070",       section: "income"  },
  { label: "Abated Recoveries",  indent:true, budget: "$0",        prevLease: "$0",              prop1: "$0",             prop2: "$0",             prop3: "$0",            marketComp: "$0",            renewalScenario: "$0",           askingRent: "$0",            section: "income"  },
  { label: "Gross Revenue",      subtotal:true, budget: "$1,274,261", prevLease: "$1,121,500",   prop1: "$1,171,070",     prop2: "$1,312,070",     prop3: "$1,244,570",    marketComp: "$1,320,070",    renewalScenario: "$1,237,070",   askingRent: "$1,375,070",    section: "income"  },
  { label: "Real Estate Taxes",  indent:true, budget: "($99,000)", prevLease: "($88,400)",       prop1: "($99,000)",      prop2: "($99,000)",      prop3: "($99,000)",     marketComp: "($99,000)",     renewalScenario: "($99,000)",    askingRent: "($99,000)",     section: "expense" },
  { label: "CAM",                indent:true, budget: "($225,000)",prevLease: "($198,000)",      prop1: "($225,000)",     prop2: "($225,000)",     prop3: "($225,000)",    marketComp: "($225,000)",    renewalScenario: "($225,000)",   askingRent: "($225,000)",    section: "expense" },
  { label: "Insurance",          indent:true, budget: "($45,000)", prevLease: "($38,500)",       prop1: "($45,000)",      prop2: "($45,000)",      prop3: "($45,000)",     marketComp: "($45,000)",     renewalScenario: "($45,000)",    askingRent: "($45,000)",     section: "expense" },
  { label: "Total Expenses",     subtotal:true, budget: "($369,000)", prevLease: "($324,900)",   prop1: "($369,000)",     prop2: "($369,000)",     prop3: "($369,000)",    marketComp: "($369,000)",    renewalScenario: "($369,000)",   askingRent: "($369,000)",    section: "expense" },
  { label: "Net Operating Income", total:true, positive:true, budget: "$905,261", prevLease: "$796,600", prop1: "$802,070", prop2: "$943,070", prop3: "$875,570", marketComp: "$951,070", renewalScenario: "$868,070", askingRent: "$1,006,070", section: "income" },
  { label: "Tenant Improvements",indent:true, budget: "($225,000)",prevLease: "($150,000)",      prop1: "($275,000)",     prop2: "($225,000)",     prop3: "($250,000)",    marketComp: "($200,000)",    renewalScenario: "($175,000)",   askingRent: "($150,000)",    section: "capital" },
  { label: "Capital",            indent:true, budget: "($225,000)",prevLease: "($180,000)",      prop1: "($225,000)",     prop2: "($225,000)",     prop3: "($225,000)",    marketComp: "($225,000)",    renewalScenario: "($225,000)",   askingRent: "($225,000)",    section: "capital" },
  { label: "Net Cash Flow",      total:true,  positive:true, budget: "$680,261", prevLease: "$466,600", prop1: "$302,070", prop2: "$493,070", prop3: "$400,570", marketComp: "$526,070", renewalScenario: "$468,070", askingRent: "$631,070", section: "capital" },
]

const ACTIVITY: ActivityEvent[] = [
  { date: "Nov 14, 2025", type: "status",   label: "Deal opened",                   detail: "Inbound interest via broker — JLL" },
  { date: "Nov 21, 2025", type: "tour",     label: "Tour — floors 18–20",           detail: "NovaTech team of 6 · 90 min" },
  { date: "Dec 3, 2025",  type: "tour",     label: "Second tour — floors 14 & 18",  detail: "Brought in IT and facilities leads · 120 min" },
  { date: "Dec 12, 2025", type: "proposal", label: "Proposal 1 submitted",          detail: "$78.00 PSF · 7 yrs · $110 TI · 8 mo free rent", from: "tenant" },
  { date: "Jan 6, 2026",  type: "call",     label: "Broker call — term discussion", detail: "Discussed term length and TI budget" },
  { date: "Jan 14, 2026", type: "proposal", label: "Proposal 2 submitted",          detail: "$83.50 PSF · 10 yrs · $85 TI · 4 mo free rent", from: "landlord" },
  { date: "Jan 29, 2026", type: "doc",      label: "Space plan distributed",        detail: "Draft floor plan — 22,500 RSF" },
  { date: "Feb 11, 2026", type: "proposal", label: "Proposal 3 submitted",          detail: "$81.00 PSF · 10 yrs · $95 TI · 6 mo free rent", from: "tenant" },
  { date: "Feb 14, 2026", type: "status",   label: "Sent for approval",             detail: "Pending asset manager review" },
]

const APPROVERS: Approver[] = [
  { name: "Sarah Chen",    title: "Leasing Director", status: "approved" },
  { name: "Marcus Wright", title: "Asset Manager",    status: "pending"  },
  { name: "Diana Okafor",  title: "CFO",              status: "waiting"  },
]

// ─── Micro components ─────────────────────────────────────────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-3">
      {children}
    </p>
  )
}

function ActivityDot({ type }: { type: ActivityEvent["type"] }) {
  const base = "h-3.5 w-3.5"
  if (type === "tour")     return <Eye className={cn(base, "text-primary")} />
  if (type === "proposal") return <FileText className={cn(base, "text-primary")} />
  if (type === "call")     return <MessageSquare className={cn(base, "text-muted-foreground")} />
  if (type === "doc")      return <FileText className={cn(base, "text-muted-foreground")} />
  return <Circle className={cn(base, "text-border")} />
}

function ProposalTag({ from }: { from?: "tenant" | "landlord" }) {
  if (!from) return null
  return (
    <span className={cn(
      "ml-1.5 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-medium",
      from === "tenant" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"
    )}>
      {from === "tenant" ? <ArrowDownLeft className="h-2.5 w-2.5" /> : <ArrowUpRight className="h-2.5 w-2.5" />}
      {from === "tenant" ? "Tenant" : "Landlord"}
    </span>
  )
}

// ─── Column header ─────────────────────────────────────────────────────────────

function ColHead({ label, sub, variant, status }: {
  label: string; sub?: string
  variant?: "active" | "approval" | "tenant" | "muted"
  status?: "declined" | "approval"
}) {
  return (
    <div className={cn(
      "px-3 py-2.5 rounded-t-lg min-h-[72px] flex flex-col justify-between",
      variant === "active"   && "bg-primary/8 border-b-2 border-primary",
      variant === "approval" && "bg-warning/8 border-b-2 border-warning",
      variant === "tenant"   && "bg-warning/8 border-b-2 border-warning",
      (variant === "muted" || !variant) && "bg-muted/50",
    )}>
      <div>
        <p className={cn("text-sm font-semibold",
          variant === "active"                             ? "text-primary" :
          variant === "approval" || variant === "tenant"   ? "text-warning" :
          "text-foreground"
        )}>{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <div className="mt-1">
        {status === "approval" && (
          <Badge variant="outline" className="gap-1 bg-warning/15 border-warning/30 text-warning">
            <Clock className="h-3 w-3" /> In Approval
          </Badge>
        )}
        {status === "declined" && (
          <Badge variant="outline" className="gap-1 bg-destructive/15 border-destructive/30 text-destructive">
            <X className="h-3 w-3" /> Declined
          </Badge>
        )}
      </div>
    </div>
  )
}

// ─── Cash flow table ───────────────────────────────────────────────────────────

type ColDef = { key: keyof CashFlowRow; label: string; sub: string; variant?: "active" | "approval" | "tenant" | "muted"; status?: "declined" | "approval" }

const EXTRA_SOURCES: ColDef[] = [
  { key: "marketComp",      label: "Market Comp",      sub: "Midtown avg · Q1 2026", variant: "muted" },
  { key: "renewalScenario", label: "Renewal Scenario", sub: "Status quo terms",       variant: "muted" },
  { key: "askingRent",      label: "Asking Rent",      sub: "Landlord initial ask",   variant: "muted" },
]

const COLS: ColDef[] = [
  { key: "budget",    label: "Budget",     sub: "Internal target",  variant: "muted"    },
  { key: "prevLease", label: "Prior Lease",sub: "Expired Apr 2024", variant: "muted"    },
  { key: "prop1",     label: "Proposal 1", sub: "Dec 12 · Tenant",  variant: "muted",   status: "declined" },
  { key: "prop2",     label: "Proposal 2", sub: "Jan 14 · Landlord",variant: "muted",   status: "declined" },
  { key: "prop3",     label: "Proposal 3", sub: "Feb 11 · Tenant",  variant: "approval", status: "approval" },
]

function parseDollar(v: string | null): number | null {
  if (!v || v === "—") return null
  const neg = v.startsWith("(")
  const n = parseFloat(v.replace(/[^0-9.]/g, ""))
  return isNaN(n) ? null : (neg ? -n : n)
}

function formatVariance(n: number, unitMode: UnitMode = "total"): string {
  const sf = unitMode === "perSfYr" ? DEAL_SF : unitMode === "perSfMo" ? DEAL_SF * 12 : 1
  const v = n / sf
  const abs = Math.abs(v)
  const sign = v >= 0 ? "+" : "−"
  if (unitMode !== "total") return `${sign}$${abs.toFixed(2)}`
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000)     return `${sign}$${Math.round(abs).toLocaleString()}`
  return `${sign}$${abs.toFixed(0)}`
}

function varianceColor(variance: number | null, positive: boolean): string {
  if (variance === null) return "text-muted-foreground"
  if (variance === 0) return "text-muted-foreground"
  return positive
    ? variance > 0 ? "text-success" : "text-destructive/80"
    : variance < 0 ? "text-success" : "text-destructive/80"
}

type VarianceMode = null | "budget" | "prevLease" | "prevProposal"
type UnitMode = "total" | "perSfYr" | "perSfMo"

const DEAL_SF = 10_000

function formatCell(val: string | null, unitMode: UnitMode): string {
  if (!val || val === "—") return "—"
  const n = parseDollar(val)
  if (n === null || unitMode === "total") return val
  const sf = unitMode === "perSfYr" ? DEAL_SF : DEAL_SF * 12
  const converted = Math.abs(n) / sf
  const fmt = `$${converted.toFixed(2)}`
  return n < 0 ? `(${fmt})` : fmt
}

function getBaselineVal(row: CashFlowRow, colKey: keyof CashFlowRow, mode: VarianceMode): number | null {
  if (!mode) return null
  if (mode === "budget") return colKey !== "budget" ? parseDollar(row.budget) : null
  if (mode === "prevLease") return colKey !== "prevLease" ? parseDollar(row.prevLease) : null
  if (mode === "prevProposal") {
    const prev: Record<string, keyof CashFlowRow> = { prop2: "prop1", prop3: "prop2" }
    const prevKey = prev[String(colKey)]
    return prevKey ? parseDollar(row[prevKey] as string | null) : null
  }
  return null
}

function CashFlowTable({ varianceMode, unitMode, extraCols }: { varianceMode: VarianceMode; unitMode: UnitMode; extraCols: string[] }) {
  const showVariance = varianceMode !== null
  const activeCols = [...COLS, ...EXTRA_SOURCES.filter(s => extraCols.includes(String(s.key)))]
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full text-sm border-separate border-spacing-0", showVariance ? "min-w-[1100px]" : "min-w-[700px]")}>
        <thead>
          <tr>
            <th className="w-[160px] pb-0 pr-3 align-bottom" />
            {activeCols.map((c, ci) => (
              <React.Fragment key={String(c.key)}>
                <th className="pb-0 px-0 w-[110px] align-bottom">
                  <div className={cn("mx-0.5", ci > 0 && "border-l border-border/30")}>
                    <ColHead label={c.label} sub={c.sub} variant={c.variant} status={c.status} />
                  </div>
                </th>
                {showVariance && getBaselineVal(CASH_FLOW[1], c.key, varianceMode) !== null && c.key !== "budget" && c.key !== "prevLease" && (
                  <th className="pb-0 px-0 w-[80px] align-bottom">
                    <div className="mx-0.5 px-2 py-2.5 rounded-t-lg bg-muted/30 min-h-[72px] flex flex-col justify-end border-l border-border/20">
                      <p className="text-[10px] font-medium text-muted-foreground">Δ</p>
                    </div>
                  </th>
                )}
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {CASH_FLOW.map((row, i) => {
            const even = i % 2 === 0
            const isNoi = row.total || row.subtotal
            return (
              <tr key={row.label} className={cn(even && !isNoi ? "bg-muted/20" : "")}>
                <td className={cn(
                  "py-2 pr-3 text-xs whitespace-nowrap",
                  row.indent  ? "pl-4 text-muted-foreground" : "font-medium text-foreground",
                  isNoi ? "border-t border-border/60 font-semibold text-foreground" : "",
                  row.total ? "border-t-2 border-border" : "",
                )}>{row.label}</td>
                {activeCols.map((c, ci) => {
                  const val = row[c.key] as string | null
                  const colVal = parseDollar(val)
                  const baselineVal = getBaselineVal(row, c.key, varianceMode)
                  const variance = baselineVal !== null && colVal !== null ? colVal - baselineVal : null
                  return (
                    <React.Fragment key={String(c.key)}>
                      <td className={cn(
                        "py-2 px-3 text-xs text-right tabular-nums whitespace-nowrap text-foreground",
                        ci > 0 && "border-l border-border/30",
                        c.variant === "active"                          && "bg-primary/5",
                        (c.variant === "approval" || c.variant === "tenant") && "bg-warning/5 border-l border-warning/20",
                        isNoi ? "border-t border-border/60" : "",
                        row.total ? "border-t-2 border-border font-semibold" : "",
                        isNoi ? "font-semibold" : "",
                      )}>
                        {formatCell(val, unitMode)}
                      </td>
                      {showVariance && c.key !== "budget" && c.key !== "prevLease" && getBaselineVal(row, c.key, varianceMode) !== null && (
                        <td className={cn(
                          "py-2 px-2 text-xs text-right tabular-nums whitespace-nowrap border-l border-border/20",
                          isNoi ? "border-t border-border/60 font-semibold" : "",
                          row.total ? "border-t-2 border-border" : "",
                          varianceColor(variance, !!row.positive),
                        )}>
                          {variance !== null ? formatVariance(variance, unitMode) : "—"}
                        </td>
                      )}
                    </React.Fragment>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Approval card ─────────────────────────────────────────────────────────────

function ApprovalCard({ onApprove, onDecline }: { onApprove: () => void; onDecline: () => void }) {
  return (
    <div className={cn(cardBase, "border-2 border-warning/60 !p-0 overflow-hidden h-full flex flex-col")}>

      {/* Card header */}
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border/50">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">Approval required</p>
          <h2 className="text-xl font-semibold text-foreground">Proposal 3</h2>
        </div>
        <Badge variant="outline" className="text-warning border-warning/40 bg-warning/10 shrink-0 text-xs mt-1">
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>
      </div>

      {/* Key terms */}
      <div className="flex flex-wrap divide-x divide-border/60 border-b border-border/40">
        {[
          { label: "Base Rent",     value: "$81.00 PSF/yr", delta: "−$4.00 vs budget",    good: false },
          { label: "Lease Term",    value: "10 Years",       delta: "On target",            good: true  },
          { label: "TI Allowance",  value: "$95.00 PSF",    delta: "+$10.00 vs budget",    good: false },
          { label: "Free Rent",     value: "6 Months",      delta: "+2 mo vs budget",      good: false },
          { label: "Abatement",     value: "$37,500",       delta: "+$7,500 vs budget",    good: false },
          { label: "Net Cash Flow", value: "$400,570",      delta: "−$279,691 vs budget",  good: false },
        ].map(({ label, value, delta, good }) => (
          <div key={label} className="flex-1 min-w-[100px] px-5 py-4">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
            <p className="text-base font-medium text-foreground tabular-nums">{value}</p>
            <p className={cn("text-xs font-medium mt-0.5 tabular-nums", good ? "text-success" : "text-destructive/70")}>{delta}</p>
          </div>
        ))}
      </div>

      {/* Approver rows — grow to fill remaining card height */}
      <div className="flex flex-col flex-1">
      {APPROVERS.map((a, i) => (
        <div key={a.name} className={cn(
          "flex flex-1 items-center gap-4 px-5 py-3.5",
          i < APPROVERS.length - 1 && "border-b border-border/40",
          a.status === "approved" && "bg-success/3",
          a.status === "pending"  && "bg-warning/3",
        )}>
          {/* Step indicator */}
          <div className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center border-2 shrink-0",
            a.status === "approved" ? "bg-success/15 border-success" :
            a.status === "pending"  ? "bg-warning/15 border-warning" :
            "bg-muted border-border/60"
          )}>
            {a.status === "approved" ? <Check className="h-3.5 w-3.5 text-success" /> :
             a.status === "pending"  ? <Clock className="h-3.5 w-3.5 text-warning" /> :
             <span className="text-[10px] font-semibold text-muted-foreground">{i + 1}</span>}
          </div>

          {/* Name + title */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground leading-none">{a.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{a.title}</p>
          </div>

          {/* Status / action */}
          {a.status === "approved" && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success shrink-0">
              <CheckCircle2 className="h-4 w-4" /> Approved
            </span>
          )}
          {a.status === "pending" && (
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" className="gap-1.5" onClick={onDecline}>
                <X className="h-4 w-4" /> Decline
              </Button>
              <Button className="gap-1.5" onClick={onApprove}>
                <Check className="h-4 w-4" /> Approve
              </Button>
            </div>
          )}
          {a.status === "waiting" && (
            <Badge variant="outline" className="gap-1 text-muted-foreground border-border shrink-0">
              <Circle className="h-3 w-3" /> Pending
            </Badge>
          )}
        </div>
      ))}
      </div>

    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface DealProfileProps {
  deal: Deal
  onBack: () => void
}

export function DealProfile({ deal, onBack }: DealProfileProps) {
  const [varianceMode, setVarianceMode] = React.useState<null | "budget" | "prevLease" | "prevProposal">(null)
  const [unitMode, setUnitMode] = React.useState<UnitMode>("total")
  const [approval, setApproval]  = React.useState<null | "approved" | "declined">(null)
  const [extraCols, setExtraCols] = React.useState<string[]>([])

  function toggleSource(key: string) {
    setExtraCols(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  return (
    <div className="flex flex-col gap-4 mt-4 pb-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-muted-foreground px-1">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-auto p-0 text-xs font-normal text-muted-foreground hover:text-foreground hover:bg-transparent">Deals</Button>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <span className="text-foreground font-medium">{deal.tenant}</span>
      </nav>

      {/* KPI bar */}
      <div className={cn(cardBase, "flex flex-wrap divide-x divide-border/60 !p-0 overflow-hidden")}>
        {[
          { label: "Stage",         value: "Counter received" },
          { label: "Proposals",     value: "3 rounds"         },
          { label: "Net Eff. Rent", value: "$76.20 PSF"       },
          { label: "Lease Comm.",   value: "Mar 1, 2026"      },
          { label: "Status",        value: "In approval", badge: true },
        ].map(k => (
          <div key={k.label} className="flex-1 min-w-[120px] px-5 py-4">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">{k.label}</p>
            {k.badge
              ? <p className="text-2xl font-medium text-warning flex items-center gap-1.5 mt-0.5">
                  <Clock className="h-5 w-5" /> {k.value}
                </p>
              : <p className="text-2xl font-medium text-foreground tabular-nums">{k.value}</p>
            }
          </div>
        ))}
      </div>

      {/* Approval + VTS Agents side by side */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch">

        {/* Approval (left, 2/3) */}
        <div className="flex-1 min-w-0">
          {approval === null && (
            <ApprovalCard
              onApprove={() => setApproval("approved")}
              onDecline={() => setApproval("declined")}
            />
          )}
          {approval === "approved" && (
            <div className={cn(cardBase, "flex items-center gap-3 border border-success/30 h-full")}>
              <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Approved by Marcus Wright</p>
                <p className="text-xs text-muted-foreground">Forwarded to Diana Okafor (CFO) for final sign-off</p>
              </div>
            </div>
          )}
          {approval === "declined" && (
            <div className={cn(cardBase, "flex items-center gap-3 border border-destructive/30 h-full")}>
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Declined by Marcus Wright</p>
                <p className="text-xs text-muted-foreground">Returned to leasing team for revision</p>
              </div>
            </div>
          )}
        </div>

        {/* VTS Agents (right, 1/3) */}
        <div className="sm:w-1/3 shrink-0">
      <div className={cn(cardBase, "border-transparent flex flex-col gap-4 bg-sidebar-accent h-full")}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest mb-1 text-sidebar-foreground/70">VTS Agents</p>
            <h2 className="text-xl font-semibold text-sidebar-foreground">Deal Actions</h2>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 text-white border-white/30 hover:bg-white/10 hover:text-white">
            View All Agents
          </Button>
        </div>

        {/* Summary bar */}
        <div className="rounded-lg px-3 py-2 flex items-center gap-2 bg-sidebar-foreground/10">
          <Sparkle className="h-4 w-4 shrink-0 text-sidebar-primary" />
          <p className="text-sm leading-snug text-sidebar-foreground/70">
            Proposal 3 is in approval —{" "}
            <span className="text-sidebar-primary font-medium">3 suggested actions ready</span>
          </p>
        </div>

        {/* Suggested tasks */}
        <div className="flex flex-col gap-2">
          {([
            {
              icon: FileText,
              title: "Draft Counter-Proposal",
              detail: "Generate a revised Proposal 4 based on the landlord's Proposal 3 terms and market comps",
            },
            {
              icon: Eye,
              title: "Run Market Comp Analysis",
              detail: "Find comparable Midtown Manhattan leases in the 10–15K SF range to benchmark net effective rent",
            },
            {
              icon: MessageSquare,
              title: "Summarize Negotiation History",
              detail: "Summarize 3 rounds of proposals with key concessions and outstanding open items",
            },
          ] as { icon: React.ElementType; title: string; detail: string }[]).map(({ icon: Icon, title, detail }) => (
            <div key={title} className="flex items-start gap-2.5 rounded-lg border border-primary/25 bg-primary/15 p-3 group/row">
              <Icon className="h-4 w-4 mt-0.5 shrink-0 text-sidebar-primary" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-sidebar-foreground/90">{title}</p>
                  <Button variant="outline" size="sm" className="opacity-0 group-hover/row:opacity-100 gap-1 shrink-0 text-white border-white/30 hover:bg-white/10 hover:text-white">
                    <Sparkle className="h-3 w-3" />
                    Run Agent
                  </Button>
                </div>
                <p className="text-sm text-sidebar-foreground/55">{detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
        </div>
      </div>

      {/* Cash flow comparison */}
      <div className={cardBase}>
        <div className="flex items-center flex-wrap gap-x-5 gap-y-2 mb-4">
          <div className="shrink-0">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-0.5">Comparison</p>
            <h2 className="text-xl font-medium text-foreground leading-none">Proposals</h2>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs ml-auto">
                <Plus className="h-3.5 w-3.5" /> Add Source
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
              {EXTRA_SOURCES.map(src => (
                <DropdownMenuCheckboxItem
                  key={String(src.key)}
                  checked={extraCols.includes(String(src.key))}
                  onCheckedChange={() => toggleSource(String(src.key))}
                >
                  <div>
                    <p className="leading-none">{src.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{src.sub}</p>
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ToggleGroup
            type="single"
            value={unitMode}
            onValueChange={v => v && setUnitMode(v as UnitMode)}
            className="bg-muted/60 dark:bg-white/6 p-1 rounded-lg gap-0"
          >
            {([
              { value: "total",   label: "Total $"  },
              { value: "perSfYr", label: "$/SF/Yr"  },
              { value: "perSfMo", label: "$/SF/Mo"  },
            ] as { value: UnitMode; label: string }[]).map(opt => (
              <ToggleGroupItem key={opt.value} value={opt.value} size="sm" className="text-xs px-3 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm">
                {opt.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <ToggleGroup
            type="single"
            value={String(varianceMode)}
            onValueChange={v => setVarianceMode(v === "null" ? null : v as VarianceMode)}
            className="bg-muted/60 dark:bg-white/6 p-1 rounded-lg gap-0"
          >
            {([
              { value: "null",          label: "Δ Off"             },
              { value: "budget",        label: "Δ vs Budget"       },
              { value: "prevLease",     label: "Δ vs Prior Lease"  },
              { value: "prevProposal",  label: "Δ vs Prev Proposal"},
            ]).map(opt => (
              <ToggleGroupItem key={opt.value} value={opt.value} size="sm" className="text-xs px-3 rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-sm">
                {opt.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <CashFlowTable varianceMode={varianceMode} unitMode={unitMode} extraCols={extraCols} />
      </div>

      {/* Activity */}
      <div className={cardBase}>
        <Eyebrow>Activity</Eyebrow>
        <div className="flex flex-col">
          {[...ACTIVITY].reverse().map((event, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "mt-0.5 h-7 w-7 rounded-full flex items-center justify-center shrink-0 border",
                  event.type === "tour" || event.type === "proposal"
                    ? "bg-primary/10 border-primary/20"
                    : "bg-muted border-border"
                )}>
                  <ActivityDot type={event.type} />
                </div>
                {i < ACTIVITY.length - 1 && (
                  <div className="w-px bg-border/40 my-1 min-h-5" />
                )}
              </div>
              <div className="pb-4 flex-1 min-w-0 pt-0.5">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm font-medium text-foreground">
                    {event.label}
                    <ProposalTag from={event.from} />
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">{event.date}</span>
                </div>
                {event.detail && (
                  <p className="text-xs text-muted-foreground mt-0.5">{event.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
