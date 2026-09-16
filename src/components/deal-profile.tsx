import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import {
  ChevronDown, Check, FileText, Download, Send,
  Building2, User, MapPin, Ruler, Tag, Calendar,
  CheckCircle2, Clock, AlertTriangle, HeartPulse, Zap, Dot,
  Bot, LayoutGrid, Table2, ArrowUpDown,
  Briefcase, Globe, Mail, DollarSign, Layers, Target,
  Star, Home, SquareStack, Scale, Trophy, Plus, Paperclip, X,
  ChevronRight,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { AGENT_ICON_MAP, AGENTS } from "@/components/agents-page"
import { type Deal } from "@/components/deals-page"
import { TENANT_LOGO } from "@/components/tenant-avatar"
import { TENANT_DOMAIN } from "@/lib/tenant-data"
import { KpiBar } from "@/components/kpi-bar"

export function TenantLogoImage({ name }: { name: string }) {
  const domain = TENANT_DOMAIN[name]
  const brandfetchSrc = domain ? `https://cdn.brandfetch.io/${domain}/w/256/h/256` : null
  const localSrc = TENANT_LOGO[name] || null
  const sources = [brandfetchSrc, localSrc].filter(Boolean) as string[]
  const [srcIdx, setSrcIdx] = React.useState(0)
  const src = sources[srcIdx] ?? null
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  const handleError = () => {
    if (srcIdx < sources.length - 1) setSrcIdx(i => i + 1)
    else setSrcIdx(sources.length)
  }

  if (src) {
    return (
      <div className="h-full w-full bg-background flex items-center justify-center">
        <img src={src} alt={name} className="h-full w-full object-contain" onError={handleError} />
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

type StageValue = "Inquiry" | "Touring" | "Proposal" | "LOI" | "Legal" | "Lease Out" | "Executed"
export type DealStatus = "active" | "stalled" | "at-risk" | "executed"

const ALL_STAGES: StageValue[] = ["Inquiry", "Touring", "Proposal", "LOI", "Legal", "Lease Out", "Executed"]

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<DealStatus, { label: string; Icon: React.ElementType; cls: string; dot: string }> = {
  active:    { label: "Active",   Icon: CheckCircle2,  cls: "text-success bg-success/10 border-success/20",         dot: "bg-success" },
  stalled:   { label: "Caution",  Icon: Clock,         cls: "text-warning bg-warning/10 border-warning/20",          dot: "bg-warning" },
  "at-risk": { label: "At risk",  Icon: AlertTriangle, cls: "text-destructive bg-destructive/10 border-destructive/20", dot: "bg-destructive" },
  executed:  { label: "Executed", Icon: CheckCircle2,  cls: "text-success bg-success/10 border-success/20",         dot: "bg-success" },
}

export function StatusBadge({ status, onChange }: { status: DealStatus; onChange: (s: DealStatus) => void }) {
  const [open, setOpen] = React.useState(false)
  const cfg = STATUS_CONFIG[status]
  const options: DealStatus[] = ["active", "stalled", "at-risk"]
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" className={cn("gap-1.5", cfg.cls)} />}>
        {cfg.label}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </PopoverTrigger>
      <PopoverContent className="w-40 p-1" align="start">
        {options.map(opt => {
          const c = STATUS_CONFIG[opt]
          return (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false) }}
              className={cn(
                "w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted",
                opt === status && "bg-muted"
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
              {c.label}
              {opt === status && <Check className="h-3 w-3 ml-auto text-foreground" />}
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}

// ─── Stage journey ────────────────────────────────────────────────────────────

function StageJourneyBar({ currentStage, onChange }: { currentStage: StageValue; onChange: (s: StageValue) => void }) {
  const currentIdx = ALL_STAGES.indexOf(currentStage)
  return (
    <div className="rounded-xl bg-primary px-4 py-3">
      <TooltipProvider>
        <div className="flex items-center flex-wrap gap-y-2">
          {ALL_STAGES.map((stage, i) => {
            const isPast   = i < currentIdx
            const isActive = stage === currentStage
            const tooltipLabel = isPast ? `Back to ${stage}` : isActive ? "Current stage" : `Advance to ${stage}`
            return (
              <React.Fragment key={stage}>
                {i > 0 && (
                  <div className={cn("flex-1 h-px min-w-3 mx-1.5 transition-colors duration-150", isPast || isActive ? "bg-primary-foreground" : "bg-primary-foreground/30")} />
                )}
                <Tooltip>
                  <TooltipTrigger render={
                    <button
                      onClick={() => onChange(stage)}
                      className="flex items-center gap-1.5 shrink-0 group cursor-pointer"
                    >
                      <div className={cn(
                        "h-5 w-5 rounded-full flex items-center justify-center transition-all duration-150",
                        isPast || isActive
                          ? "bg-primary-foreground group-hover:scale-110 group-hover:bg-primary-foreground/80"
                          : "bg-transparent border-2 border-primary-foreground/30 group-hover:border-primary-foreground/70 group-hover:bg-primary-foreground/15",
                      )}>
                        {isPast   && <Check className="h-2.5 w-2.5 text-primary" />}
                        {isActive && <div className="h-2 w-2 rounded-full bg-primary" />}
                      </div>
                      <span className={cn(
                        "text-xs font-semibold whitespace-nowrap transition-colors duration-150",
                        isPast || isActive
                          ? "text-primary-foreground group-hover:text-primary-foreground/80"
                          : "text-primary-foreground/40 group-hover:text-primary-foreground/75",
                      )}>
                        {stage}
                      </span>
                    </button>
                  } />
                  <TooltipContent side="bottom" className="text-xs font-medium">
                    {tooltipLabel}
                  </TooltipContent>
                </Tooltip>
              </React.Fragment>
            )
          })}
        </div>
      </TooltipProvider>
    </div>
  )
}

// ─── Financial KPI bar ────────────────────────────────────────────────────────

function delta(actual: number, budget: number): { dir: "up" | "down" | "flat"; pct: string } {
  if (!actual || !budget) return { dir: "flat", pct: "—" }
  const p = ((actual - budget) / budget) * 100
  if (Math.abs(p) < 0.5) return { dir: "flat", pct: "±0%" }
  return { dir: p > 0 ? "up" : "down", pct: `${p > 0 ? "+" : ""}${p.toFixed(1)}%` }
}

function FinancialBar({ deal, stageIdx, onHealthClick }: { deal: Deal; stageIdx: number; onHealthClick: () => void }) {
  const nerDelta = delta(deal.ner, deal.budgetNer)
  const tlv = deal.ner && deal.term ? (deal.ner * deal.sf * (deal.term / 12) / 1_000_000) : null
  const tiCost = stageIdx >= 2 ? deal.sf * 80 : null
  const stage = ALL_STAGES[stageIdx] ?? "Inquiry"
  const health = getDealHealth(deal.id, stage)

  const kpis = [
    {
      label: "Deal health",
      value: health.label,
      valueNode: (
        <div className="flex items-center gap-1.5">
          {(health.score === "caution" || health.score === "at-risk") && (
            <AlertTriangle className={cn("h-4 w-4 shrink-0", health.textCls)} />
          )}
          <p className={cn("text-xl font-medium", health.textCls)}>{health.label}</p>
        </div>
      ),
      subtitle: health.context,
      onClick: onHealthClick,
    },
    ...(deal.budgetNer > 0 ? [{
      label: "NER",
      value: deal.ner ? `$${deal.ner.toFixed(2)}` : "—",
      subtitle: deal.ner ? `${nerDelta.pct} vs budget` : `Budget $${deal.budgetNer.toFixed(2)}`,
      trend: deal.ner && nerDelta.dir !== "flat" ? nerDelta.dir : undefined,
    }] : []),
    ...(tlv ? [{ label: "Total lease value", value: `$${tlv.toFixed(1)}M`, subtitle: `${deal.term} months` }] : []),
    ...(tiCost ? [{ label: "TI investment", value: `$${(tiCost / 1_000_000).toFixed(2)}M`, subtitle: "$80/sf est." }] : []),
  ]

  return <KpiBar kpis={kpis} />
}

// ─── Agent strip ──────────────────────────────────────────────────────────────



// Featured agents per deal — one is the spotlight


// ─── Field row ────────────────────────────────────────────────────────────────

function FieldRow({ icon: Icon, label, children }: { icon?: React.ElementType; label: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
      <div className="w-4 shrink-0 mt-0.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
      </div>
      <span className="text-xs text-muted-foreground w-24 shrink-0 pt-px">{label}</span>
      <div className="text-sm text-foreground font-medium flex-1">
        {children ?? <span className="text-muted-foreground/40 font-normal">—</span>}
      </div>
    </div>
  )
}

// ─── Info tab ─────────────────────────────────────────────────────────────────



function OverviewTab({ deal, stageIdx }: { deal: Deal; stageIdx: number }) {
  return (
    <div>
        <FieldRow icon={User}      label="Tenant">{deal.tenant}</FieldRow>
        <FieldRow icon={Building2} label="Asset">{deal.asset}</FieldRow>
        <FieldRow icon={MapPin}    label="Space">{deal.space}</FieldRow>
        <FieldRow icon={Ruler}     label="Size">{deal.sf.toLocaleString()} sf</FieldRow>
        <FieldRow icon={Tag}       label="Type">{deal.dealType}</FieldRow>
        {deal.contact && <FieldRow icon={User}      label="Contact">{deal.contact}</FieldRow>}
        <FieldRow icon={Briefcase}  label="Broker">CBRE</FieldRow>
        <FieldRow icon={Layers}     label="Industry">Technology</FieldRow>
        <FieldRow icon={Globe}      label="City / submarket">Midtown Manhattan</FieldRow>
        {deal.term && <FieldRow icon={Calendar} label="Term">{deal.term} months ({(deal.term / 12).toFixed(0)} yrs)</FieldRow>}
        <FieldRow icon={Mail}       label="Source">Email inbound</FieldRow>

        <div className="mt-4 mb-1"><p className="text-sm font-semibold text-foreground">Requirements</p></div>
        <FieldRow icon={Ruler}      label="Size range">16,000 – 20,000 sf</FieldRow>
        <FieldRow icon={User}       label="Size (desks)" />
        <FieldRow icon={SquareStack}label="Floors">6th floor or above</FieldRow>
        <FieldRow icon={DollarSign} label="Target price">Up to ${deal.budgetNer.toFixed(2)} PSF/yr</FieldRow>
        <FieldRow icon={Calendar}   label="Target LCD" />
        <FieldRow icon={Target}     label="Target occupancy">Q1 2027</FieldRow>
        <FieldRow icon={Star}       label="Special">Dedicated server room · Open plan · 4:1,000 parking</FieldRow>

        <div className="mt-4 mb-1"><p className="text-sm font-semibold text-foreground">Current lease</p></div>
        <FieldRow icon={Home}       label="Current address" />
        <FieldRow icon={Ruler}      label="Current size" />
        <FieldRow icon={DollarSign} label="Current rent" />
        <FieldRow icon={Calendar}   label="Current LXD" />

        {stageIdx >= 1 && (<>
          <div className="mt-4 mb-1"><p className="text-sm font-semibold text-foreground">Tour</p></div>
          <FieldRow icon={Calendar}   label="Tour date">Sep 3, 2026 · 10:00 AM</FieldRow>
          <FieldRow icon={MapPin}     label="Spaces toured">Space 0800 – Floor 8 · Space 0900 – Floor 9</FieldRow>
        </>)}
        {stageIdx >= 2 && (<>
          <div className="mt-4 mb-1"><p className="text-sm font-semibold text-foreground">Proposal</p></div>
          <FieldRow icon={DollarSign} label="Asking rent">$98.00 PSF/yr</FieldRow>
          <FieldRow icon={Building2}  label="TI package">$80.00 PSF</FieldRow>
          <FieldRow icon={Calendar}   label="Free rent">4 months</FieldRow>
          <FieldRow icon={FileText}   label="Lease term">8 years</FieldRow>
        </>)}
        {stageIdx >= 3 && (<>
          <div className="mt-4 mb-1"><p className="text-sm font-semibold text-foreground">LOI</p></div>
          <FieldRow icon={Calendar}   label="LOI date">Oct 15, 2026</FieldRow>
          <FieldRow icon={FileText}   label="LOI terms">$94.00 PSF · 8 yrs · $80 TI · 4 mo free rent</FieldRow>
          <FieldRow icon={Tag}        label="Counters">1 counter received</FieldRow>
          <FieldRow icon={Scale}      label="Legal counsel">Skadden Arps (Tenant) · Willkie Farr (Landlord)</FieldRow>
        </>)}
        {stageIdx >= 4 && (<>
          <div className="mt-4 mb-1"><p className="text-sm font-semibold text-foreground">Legal</p></div>
          <FieldRow icon={Calendar}   label="Execution target">Dec 1, 2026</FieldRow>
          <FieldRow icon={AlertTriangle} label="Open items">2 redlines · 1 insurance item</FieldRow>
        </>)}
        {stageIdx >= 5 && (<>
          <div className="mt-4 mb-1"><p className="text-sm font-semibold text-foreground">Execution</p></div>
          <FieldRow icon={Calendar}   label="Execution date">Dec 15, 2026</FieldRow>
          <FieldRow icon={Calendar}   label="Effective date">Jan 1, 2027</FieldRow>
          <FieldRow icon={Calendar}   label="Expiry">Dec 31, 2034</FieldRow>
        </>)}

        <div className="mt-4 mb-1"><p className="text-sm font-semibold text-foreground">Competitive set</p></div>
        <FieldRow icon={Trophy} label="Competitive set"><span className="text-muted-foreground/50 font-normal text-sm">Not set</span></FieldRow>
    </div>
  )
}

// ─── Proposals tab ────────────────────────────────────────────────────────────

type ProposalRound = {
  label: string
  party: "landlord" | "tenant" | "agreed" | "prior"
  date: string
  rent: number
  ti: number
  freeRent: number
  term: number
  escalation: string
  options: string
}

function buildProposals(deal: Deal): ProposalRound[] {
  // Renewal: show prior lease + negotiation rounds
  if (deal.dealType === "Renewal") {
    const priorRent = deal.budgetNer * 0.72
    return [
      { label: "Prior lease",        party: "prior"    as const, date: "2018-06-01", rent: priorRent, ti: 35, freeRent: 2, term: 84, escalation: "2.5% fixed", options: "None" },
      { label: "Landlord proposal 1",party: "landlord" as const, date: "2026-04-10", rent: deal.budgetNer, ti: 65, freeRent: 4, term: deal.term ?? 84, escalation: "3.5% fixed", options: "1×5yr" },
      { label: "Tenant counter 1",   party: "tenant"   as const, date: "2026-05-02", rent: deal.budgetNer * 0.91, ti: 85, freeRent: 6, term: (deal.term ?? 84) - 12, escalation: "CPI cap 3%", options: "2×5yr" },
      { label: "Landlord counter 2", party: "landlord" as const, date: "2026-05-28", rent: deal.budgetNer * 0.95, ti: 75, freeRent: 5, term: deal.term ?? 84, escalation: "3.0% fixed", options: "1×5yr" },
      ...(deal.ner > 0 ? [{ label: "Agreed terms", party: "agreed" as const, date: deal.lastUpdated, rent: deal.ner, ti: 80, freeRent: 4, term: deal.term ?? 84, escalation: "3.0% fixed", options: "1×5yr" }] : []),
    ]
  }
  // New deal / expansion
  return [
    { label: "Landlord proposal 1", party: "landlord" as const, date: "2026-09-18", rent: deal.budgetNer, ti: 75, freeRent: 3, term: deal.term ?? 84, escalation: "3.5% fixed", options: "None" },
    { label: "Tenant counter 1",    party: "tenant"   as const, date: "2026-10-01", rent: deal.budgetNer * 0.92, ti: 95, freeRent: 6, term: (deal.term ?? 84) - 12, escalation: "CPI cap 3%", options: "1×5yr" },
    ...(deal.ner > 0 ? [
      { label: "Landlord counter 2", party: "landlord" as const, date: "2026-10-15", rent: deal.budgetNer * 0.96, ti: 80, freeRent: 4, term: deal.term ?? 84, escalation: "3.0% fixed", options: "1×5yr" },
      { label: "Agreed terms",       party: "agreed"   as const, date: deal.lastUpdated, rent: deal.ner, ti: 80, freeRent: 4, term: deal.term ?? 84, escalation: "3.0% fixed", options: "1×5yr" },
    ] : []),
  ]
}


// Financial statement lines per proposal card
type FinLine = {
  label: string
  value: string
  prefix?: "$"
  bold?: boolean
  dividerAbove?: "single" | "double"
  color?: "success"
}

function buildLines(r: ProposalRound, sf: number, measure: ProposalMeasure): FinLine[] {
  const yrs = r.term / 12

  // All figures computed on a total-term basis first
  const baseRentTotal = r.rent * sf * yrs
  const abated = -(r.rent * sf * r.freeRent / 12)
  const opex = sf * 18.5 * yrs
  const retax = sf * 6.0 * yrs
  const grossRev = baseRentTotal + abated + opex + retax
  const totalExp = -(opex + retax)
  const netRev = grossRev + totalExp
  const ti = -(r.ti * sf)
  const commission = -(r.rent * sf * yrs * 0.03)
  const capital = ti + commission
  const ncf = netRev + capital

  // Scale factor to selected measure
  const scale = measure === "psf-yr" ? 1 / (sf * yrs)
              : measure === "annual"  ? 1 / yrs
              : measure === "monthly" ? 1 / (yrs * 12)
              : 1 // total

  const fmt = (n: number) => {
    const v = n * scale
    const abs = Math.abs(v)
    const s = abs >= 1_000_000
      ? `${(abs / 1_000_000).toFixed(2)}M`
      : abs >= 1_000
      ? abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : abs.toFixed(2)
    return v < 0 ? `(${s})` : s
  }

  return [
    { label: "Base rent",            value: fmt(baseRentTotal), prefix: "$" },
    { label: "Abated base rent",     value: fmt(abated) },
    { label: "Opex recovery",        value: fmt(opex) },
    { label: "RE tax recovery",      value: fmt(retax) },
    { label: "Abated recoveries",    value: fmt(0) },
    { label: "Gross revenue",        value: fmt(grossRev),  bold: true, dividerAbove: "single" },
    { label: "Opex",                 value: fmt(-opex) },
    { label: "Real estate taxes",    value: fmt(-retax) },
    { label: "Total expenses",       value: fmt(totalExp),  bold: true, dividerAbove: "single" },
    { label: "Net revenue",          value: fmt(netRev),    bold: true, dividerAbove: "double", prefix: "$" },
    { label: "Tenant improvements",  value: fmt(ti) },
    { label: "Commissions",          value: fmt(commission) },
    { label: "Capital",              value: fmt(capital),   bold: true, dividerAbove: "single" },
    { label: "Net cash flow",        value: fmt(ncf),       bold: true, dividerAbove: "single", prefix: "$", color: ncf > 0 ? "success" : undefined },
  ]
}

const PARTY_CONFIG: Record<ProposalRound["party"], { divider: string; pill: string; pillText: string }> = {
  prior:    { divider: "border-b-2 border-b-border",           pill: "bg-muted text-muted-foreground",  pillText: "Budget" },
  landlord: { divider: "border-b-2 border-b-primary",          pill: "bg-primary/10 text-primary",      pillText: "Landlord"        },
  tenant:   { divider: "border-b-2 border-b-foreground/30",    pill: "bg-muted text-foreground",        pillText: "Tenant"          },
  agreed:   { divider: "border-b-2 border-b-success",          pill: "bg-success/10 text-success",      pillText: "Agreed"          },
}

function fmtDate(d: string): string {
  // Handle label-style values like "Budget" that aren't dates
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return d
  const [y, m, mo] = d.split("-").map(Number)
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  return `${months[m - 1]} ${mo}, ${y}`
}

const MEASURE_SUBLABEL: Record<ProposalMeasure, string> = {
  "psf-yr":  "/sf/yr",
  "annual":  "/yr",
  "total":   "total",
  "monthly": "/mo",
}

function ProposalCard({ round, sf, base, measure }: { round: ProposalRound; sf: number; base: ProposalRound | null; measure: ProposalMeasure }) {
  const lines = buildLines(round, sf, measure)
  const cfg = PARTY_CONFIG[round.party]

  const rentDiff = base ? ((round.rent - base.rent) / base.rent) * 100 : null
  const termYrs = round.term / 12
  const termLabel = Number.isInteger(termYrs) ? `${termYrs} yr` : `${round.term} mo`

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shrink-0 w-[240px] flex flex-col">
      {/* Header */}
      <div className={cn("px-4 pt-4 pb-3 space-y-2.5", cfg.divider)}>
        <div className="flex items-center justify-between gap-2">
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide", cfg.pill)}>
            {cfg.pillText}
          </span>
          <span className="text-xs text-muted-foreground">{fmtDate(round.date)}</span>
        </div>
        <p className="text-sm font-semibold text-foreground leading-tight">{round.label}</p>
        <div className="flex items-end justify-between gap-1">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">NER</p>
            <p className="text-2xl font-bold text-foreground tabular-nums">${round.rent.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{MEASURE_SUBLABEL[measure]} · {termLabel}</p>
          </div>
          {rentDiff !== null && (
            <p className={cn("text-sm font-bold pb-0.5 tabular-nums", rentDiff >= 0 ? "text-success" : "text-destructive")}>
              {rentDiff >= 0 ? "+" : ""}{rentDiff.toFixed(1)}%
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 pb-2 flex items-center border-b border-border/40">
        <Button variant="link" size="sm" className="flex-1 h-auto text-sm text-primary">Details</Button>
        <div className="w-px h-4 bg-border/60" />
        <Button variant="link" size="sm" className="flex-1 h-auto text-sm text-primary">Cash flow</Button>
      </div>

      {/* Financial statement */}
      <div className="px-4 py-3 flex flex-col flex-1">
        {lines.map((line, i) => {
          const valueColor = line.color === "success" ? "text-success" : line.bold ? "text-foreground" : "text-foreground/80"
          const labelColor = line.bold ? "text-foreground" : "text-muted-foreground"
          return (
            <div key={i}>
              {line.dividerAbove === "double" && (
                <div className="mt-1.5 mb-0.5 space-y-px">
                  <div className="border-t border-border/60" />
                  <div className="border-t border-border/60" />
                </div>
              )}
              {line.dividerAbove === "single" && (
                <div className="border-t border-border/40 mt-1.5 mb-0.5" />
              )}
              <div className="flex items-baseline gap-2 py-[3px]">
                {/* Label */}
                <span className={cn("text-xs flex-1 leading-snug", labelColor, line.bold && "font-semibold")}>
                  {line.label}
                </span>
                {/* $ column — fixed width, only shown if prefix present */}
                <span className={cn("text-xs w-3 text-left shrink-0 tabular-nums", line.prefix ? valueColor : "", line.bold && "font-semibold")}>
                  {line.prefix ?? ""}
                </span>
                {/* Value column — right-aligned */}
                <span className={cn("text-xs tabular-nums text-right whitespace-nowrap w-20 shrink-0", valueColor, line.bold && "font-semibold")}>
                  {line.value}
                </span>
              </div>
              {line.dividerAbove === "single" && i === lines.length - 1 && (
                <div className="border-t border-border/40 mt-0.5" />
              )}
            </div>
          )
        })}
      </div>

    </div>
  )
}

type ProposalMeasure = "psf-yr" | "annual" | "total" | "monthly"
type ProposalSort = "asc" | "desc"
type ProposalView = "cards" | "table"

const MEASURE_LABELS: Record<ProposalMeasure, string> = {
  "psf-yr":  "$/sf/yr",
  "annual":  "Annual",
  "total":   "Total term",
  "monthly": "Monthly",
}

type ReferenceCardDef = { id: string; group: string; label: string; round: ProposalRound }

const REFERENCE_POOL: ReferenceCardDef[] = [
  {
    id: "budget-2025", group: "Budget", label: "FY 2025 Budget",
    round: { label: "FY 2025 Budget", party: "prior", date: "FY 2025", rent: 68.50, ti: 65, freeRent: 3, term: 84, escalation: "3.0% fixed", options: "None" },
  },
  {
    id: "budget-2024", group: "Budget", label: "FY 2024 Budget",
    round: { label: "FY 2024 Budget", party: "prior", date: "FY 2024", rent: 64.00, ti: 60, freeRent: 2, term: 84, escalation: "3.0% fixed", options: "None" },
  },
  {
    id: "prev-lease-2019", group: "Prior lease", label: "Prior lease (2019)",
    round: { label: "Prior lease (2019)", party: "prior", date: "2019-06-01", rent: 52.00, ti: 45, freeRent: 6, term: 120, escalation: "2.5% fixed", options: "1x5yr @ FMV" },
  },
  {
    id: "prev-lease-2012", group: "Prior lease", label: "Prior lease (2012)",
    round: { label: "Prior lease (2012)", party: "prior", date: "2012-01-15", rent: 38.50, ti: 30, freeRent: 4, term: 120, escalation: "2.0% fixed", options: "None" },
  },
  {
    id: "comp-1", group: "Market comp", label: "Comp: 250 Park Ave",
    round: { label: "250 Park Ave", party: "prior", date: "2025-03-10", rent: 76.00, ti: 80, freeRent: 5, term: 96, escalation: "3.0% fixed", options: "None" },
  },
  {
    id: "comp-2", group: "Market comp", label: "Comp: 1 Vanderbilt",
    round: { label: "1 Vanderbilt", party: "prior", date: "2025-01-20", rent: 88.50, ti: 90, freeRent: 6, term: 120, escalation: "3.5% fixed", options: "1x5yr @ FMV" },
  },
  {
    id: "appraisal-2025", group: "Appraisal", label: "Appraisal (Q1 2025)",
    round: { label: "Appraisal Q1 2025", party: "prior", date: "2025-02-01", rent: 74.00, ti: 75, freeRent: 4, term: 96, escalation: "3.0% fixed", options: "None" },
  },
  {
    id: "appraisal-2023", group: "Appraisal", label: "Appraisal (Q2 2023)",
    round: { label: "Appraisal Q2 2023", party: "prior", date: "2023-05-15", rent: 67.50, ti: 68, freeRent: 3, term: 96, escalation: "2.75% fixed", options: "None" },
  },
]

const REF_GROUPS = Array.from(new Set(REFERENCE_POOL.map(r => r.group)))

function ProposalsTab({ deal, stageIdx, onAddProposal }: { deal: Deal; stageIdx: number; onAddProposal?: () => void }) {
  const [measure, setMeasure] = React.useState<ProposalMeasure>("psf-yr")
  const [sortOrder, setSortOrder] = React.useState<ProposalSort>("desc")
  const [view, setView] = React.useState<ProposalView>("cards")
  const [selectedRefs, setSelectedRefs] = React.useState<Set<string>>(new Set())
  const [refOpen, setRefOpen] = React.useState(false)

  const AddProposalBtn = (
    <Button size="sm" className="gap-1.5" onClick={onAddProposal}>
      <Plus className="h-3 w-3" />
      Add proposal
    </Button>
  )

  if (stageIdx < 2) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex justify-end">
          {AddProposalBtn}
        </div>
        <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
          <FileText className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No proposals yet. This deal is at the {deal.stage} stage.</p>
          <p className="text-xs text-muted-foreground/60">Proposals will appear here once the deal reaches the Proposal stage.</p>
        </div>
      </div>
    )
  }

  const rounds = buildProposals(deal)

  const budget: ProposalRound = {
    label: "Budget",
    party: "prior",
    date: "FY 2026",
    rent: deal.budgetNer,
    ti: 70,
    freeRent: 3,
    term: deal.term ?? 84,
    escalation: "3.5% fixed",
    options: "None",
  }

  const sorted = sortOrder === "asc" ? rounds : [...rounds].reverse()
  const refCards = REFERENCE_POOL.filter(r => selectedRefs.has(r.id)).map(r => r.round)
  const cards = [...refCards, budget, ...sorted]

  function toggleRef(id: string) {
    setSelectedRefs(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Measure chips */}
        {(Object.keys(MEASURE_LABELS) as ProposalMeasure[]).map(m => (
          <Button key={m} variant="outline" size="sm"
            onClick={() => setMeasure(m)}
            className={cn("gap-1 font-normal text-primary border-primary/30 hover:bg-primary/5", measure === m && "bg-primary/10 font-medium")}>
            {MEASURE_LABELS[m]}
          </Button>
        ))}

        {/* Sort chip */}
        <Button variant="outline" size="sm"
          onClick={() => setSortOrder(o => o === "asc" ? "desc" : "asc")}
          className="gap-1.5 font-normal text-primary border-primary/30 hover:bg-primary/5">
          <ArrowUpDown className="h-3 w-3" />
          {sortOrder === "asc" ? "Oldest" : "Newest"}
        </Button>

        {/* Compare chip — add reference cards */}
        <Popover open={refOpen} onOpenChange={setRefOpen}>
          <PopoverTrigger render={<Button
            variant="outline" size="sm"
            className={cn("gap-1.5 font-normal text-primary border-primary/30 hover:bg-primary/5", selectedRefs.size > 0 && "bg-primary/10 font-medium")}
          />}>
            <Plus className="h-3 w-3" />
            Compare
            {selectedRefs.size > 0 && (
              <span className="inline-flex items-center justify-center size-4 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                {selectedRefs.size}
              </span>
            )}
          </PopoverTrigger>
          <PopoverContent align="start" className="w-60 p-2">
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-xs font-semibold text-foreground">Add reference cards</span>
              {selectedRefs.size > 0 && (
                <button
                  onClick={() => setSelectedRefs(new Set())}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
            {REF_GROUPS.map(group => (
              <div key={group} className="mb-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 pb-1">{group}</p>
                {REFERENCE_POOL.filter(r => r.group === group).map(ref => (
                  <label key={ref.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer text-sm">
                    <Checkbox
                      checked={selectedRefs.has(ref.id)}
                      onCheckedChange={() => toggleRef(ref.id)}
                      className="size-3.5"
                    />
                    {ref.label}
                  </label>
                ))}
              </div>
            ))}
          </PopoverContent>
        </Popover>

        {AddProposalBtn}

        <div className="ml-auto flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => setView("cards")}
            className={cn("h-7 w-7 text-primary border-primary/30 hover:bg-primary/5", view === "cards" && "bg-primary/10")}>
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setView("table")}
            className={cn("h-7 w-7 text-primary border-primary/30 hover:bg-primary/5", view === "table" && "bg-primary/10")}>
            <Table2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {view === "cards" && (
        <div className="flex flex-wrap gap-3">
          {cards.map((r, i) => (
            <ProposalCard key={i} round={r} sf={deal.sf} base={i === 0 ? null : cards[0]} measure={measure} />
          ))}
        </div>
      )}

      {view === "table" && (() => {
        const rows = ["Base rent","Abated base rent","Opex recovery","RE tax recovery","Abated recoveries","Gross revenue","Opex","Real estate taxes","Total expenses","Net operating income","Tenant improvements","Commissions","Capital","Net cash flow"]
        const allLines = cards.map(r => buildLines(r, deal.sf, measure))
        return (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-44 py-4">Line item</TableHead>
                    {cards.map((r, i) => {
                      const cfg = PARTY_CONFIG[r.party]
                      const textCls = cfg.pill.includes("primary") ? "text-primary" : cfg.pill.includes("success") ? "text-success" : "text-muted-foreground"
                      return (
                        <TableHead key={i} className="text-right whitespace-nowrap py-4">
                          <div className="font-semibold text-foreground">{r.label}</div>
                          <div className={cn("text-[10px] font-medium", textCls)}>{cfg.pillText}</div>
                        </TableHead>
                      )
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, ri) => {
                    const isBold = ["Gross revenue","Total expenses","Net operating income","Capital","Net cash flow"].includes(row)
                    const isNcf = row === "Net cash flow"
                    return (
                      <TableRow key={ri} className={ri % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                        <TableCell className={cn(isBold ? "font-semibold text-foreground" : "text-muted-foreground")}>
                          {row.charAt(0).toUpperCase() + row.slice(1)}
                        </TableCell>
                        {allLines.map((lines, ci) => {
                          const line = lines[ri]
                          return (
                            <TableCell key={ci} className={cn(
                              "text-right tabular-nums whitespace-nowrap",
                              isBold ? "font-semibold text-foreground" : "text-foreground/80",
                              isNcf && "text-success font-bold"
                            )}>
                              {line?.prefix}{line?.value}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ─── Tasks tab ────────────────────────────────────────────────────────────────

type TaskItem = { id: number; label: string; done: boolean; required?: boolean; due?: string; assignee?: string }

const STAGE_TASKS: Record<StageValue, TaskItem[]> = {
  "Inquiry":   [
    { id: 1,  label: "Qualify tenant requirements",      done: false, required: true },
    { id: 2,  label: "Schedule intro call",              done: false, required: true },
    { id: 3,  label: "Add to deal pipeline",             done: true },
  ],
  "Touring":   [
    { id: 4,  label: "Prepare tour itinerary",           done: true,  required: true },
    { id: 5,  label: "Collect tenant feedback",          done: false, required: true },
    { id: 6,  label: "Shortlist top 2 spaces",            done: false },
    { id: 7,  label: "Schedule follow-up tour",          done: false },
  ],
  "Proposal":  [
    { id: 8,  label: "Draft initial proposal",           done: true,  required: true },
    { id: 9,  label: "Review proposal with landlord",    done: false, required: true },
    { id: 10, label: "Send proposal to tenant",          done: false, required: true },
  ],
  "LOI":       [
    { id: 11, label: "Counter lease terms",              done: false, required: true },
    { id: 12, label: "Align on TI allowance",            done: false, required: true },
    { id: 13, label: "Confirm free rent period",         done: true },
    { id: 14, label: "Get legal review of redlines",     done: false },
  ],
  "Legal":     [
    { id: 15, label: "Review redlines with counsel",     done: false, required: true },
    { id: 16, label: "Resolve subleasing rights flag",   done: false, required: true },
    { id: 17, label: "Confirm TI escalation clause",     done: true },
  ],
  "Lease Out": [
    { id: 18, label: "Collect signatures from tenant",   done: false, required: true },
    { id: 19, label: "Collect signatures from landlord", done: false, required: true },
    { id: 20, label: "File executed lease",              done: false },
  ],
  "Executed":  [
    { id: 21, label: "Archive deal documents",           done: true },
    { id: 22, label: "Send close announcement",          done: false },
    { id: 23, label: "Log commission details",           done: false },
  ],
}

const TASKS_SHOW_STAGES: StageValue[] = ["Proposal", "LOI", "Legal", "Lease Out"]

function TasksTab({ stage, dealId }: { stage: StageValue; status?: DealStatus; dealId?: string }) {
  const [doneMap, setDoneMap] = React.useState<Record<number, boolean>>(() => {
    const m: Record<number, boolean> = {}
    ALL_STAGES.forEach(s => STAGE_TASKS[s].forEach(t => { m[t.id] = t.done }))
    return m
  })
  const [showCompleted, setShowCompleted] = React.useState(false)

  const toggle = (id: number) => setDoneMap(prev => ({ ...prev, [id]: !prev[id] }))
  const reset = () => {
    const m: Record<number, boolean> = {}
    ALL_STAGES.forEach(s => STAGE_TASKS[s].forEach(t => { m[t.id] = t.done }))
    setDoneMap(m)
  }

  const currentIdx = ALL_STAGES.indexOf(stage)
  const visibleStages = TASKS_SHOW_STAGES.filter(s => ALL_STAGES.indexOf(s) >= currentIdx - 1)

  const health = getDealHealth(dealId, stage)
  const healthRecs = health.recs

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCompleted(v => !v)}
            className={cn("h-7 px-2.5 text-xs gap-1 font-normal text-primary border-primary/30 hover:bg-primary/5", showCompleted && "bg-primary/10 font-medium")}
          >
            Show completed
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            className="h-7 px-2.5 text-xs gap-1 font-normal text-primary border-primary/30 hover:bg-primary/5 ml-auto"
          >
            Reset all tasks
          </Button>
        </div>

        <div className="flex flex-col gap-3 pt-3">
          {/* Deal Health suggestions — styled as agent card, matching UpdateCard agent style */}
          {healthRecs.length > 0 && (
            <div className="mx-0 rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <HeartPulse className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground leading-none">Deal Health</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{health.label}</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                  <Zap className="h-2.5 w-2.5 text-primary" />
                  <span className="text-xs font-medium text-primary">Agent</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 pl-[42px]">
                {healthRecs.map(r => {
                  const agent = AGENTS.find(a => a.id === r.agentId)
                  const AgentIcon = agent ? (AGENT_ICON_MAP[agent.name] ?? Bot) : Bot
                  return (
                    <div key={r.action} className="flex items-center gap-2">
                      <p className="text-sm text-foreground/80 flex-1 leading-snug">{r.action}</p>
                      {agent && (
                        <Button variant="outline" size="sm" className="gap-1.5 shrink-0 h-7 text-xs text-primary border-primary/30 hover:bg-primary/5">
                          <AgentIcon className="h-3 w-3" />
                          {agent.name}
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Stage sections */}
          {visibleStages.map(s => {
            const tasks = STAGE_TASKS[s]
            const filtered = showCompleted ? tasks : tasks.filter(t => !doneMap[t.id])
            if (filtered.length === 0) return null
            const isCurrent = s === stage
            return (
              <div key={s} className="flex flex-col gap-1">
                <div className="flex items-center gap-2 px-0.5 pb-1">
                  <span className={cn("text-sm font-semibold", isCurrent ? "text-foreground" : "text-muted-foreground")}>{s}</span>
                  {isCurrent && (
                    <span className="text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Current</span>
                  )}
                </div>
                {filtered.map(task => {
                  const done = doneMap[task.id]
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggle(task.id)}
                      className={cn(
                        "flex items-start gap-3 px-3 py-2.5 rounded-xl border bg-card cursor-pointer transition-colors hover:bg-muted/40 group",
                        done ? "border-border/50" : "border-border"
                      )}
                    >
                      {/* Circle checkbox */}
                      <div className={cn(
                        "mt-0.5 shrink-0 h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors",
                        done ? "bg-primary border-primary" : "border-border group-hover:border-primary/60"
                      )}>
                        {done && <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />}
                      </div>

                      {/* Label + subtext */}
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium leading-snug", done ? "line-through text-muted-foreground" : "text-foreground")}>
                          {task.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">Assign task</p>
                      </div>

                      {/* Required indicator */}
                      {task.required && !done && (
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="shrink-0 mt-0.5 flex items-center gap-1">
                              <span className="text-sm font-bold text-warning leading-none">*</span>
                              <span className="text-xs font-medium text-warning">Required</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-[200px] text-xs">
                            Must be complete to advance to the next stage
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}

// ─── Encumbrances tab ─────────────────────────────────────────────────────────

type EncumbranceItem = {
  optionType: string
  holder: string
  suite: string
  floor: string
  sf: number
  priority: number
  expiry?: string
  notes?: string
}

const DEAL_ENCUMBRANCES: Record<string, EncumbranceItem[]> = {
  "d00": [
    { optionType: "ROFO", holder: "Sullivan & Cromwell", suite: "Space 0800", floor: "Floor 8", sf: 18000, priority: 1, expiry: "Apr 30, 2029", notes: "Must be exercised within 30 days of landlord offering the space to market" },
    { optionType: "Expansion Option", holder: "Meridian Health Partners", suite: "Space 0800", floor: "Floor 8", sf: 18000, priority: 2, expiry: "Mar 31, 2028", notes: "One-time right; exercisable during the 6-month window before the triggering event" },
  ],
  "d01": [
    { optionType: "ROFO", holder: "Starbucks Corporation", suite: "Space 750", floor: "Floor 7", sf: 8200, priority: 1, expiry: "Dec 31, 2027", notes: "Must exercise within 30 days of landlord notice" },
    { optionType: "Expansion Option", holder: "Starbucks Corporation", suite: "Space 900", floor: "Floor 9", sf: 12000, priority: 1, expiry: "Jun 30, 2028" },
  ],
  "d02": [
    { optionType: "ROFO", holder: "Apex Capital", suite: "Floor 11", floor: "Floor 11", sf: 45000, priority: 1, expiry: "Mar 15, 2027" },
    { optionType: "Contraction Option", holder: "Apex Capital", suite: "Floor 12 – North Wing", floor: "Floor 12", sf: 18000, priority: 1, notes: "One-time right, exercisable at 36-month mark" },
  ],
  "d04": [
    { optionType: "ROFO", holder: "Atlas Group", suite: "Floors 4–5", floor: "Floors 4–5", sf: 61000, priority: 1, expiry: "Jan 1, 2028" },
    { optionType: "Expansion Option", holder: "Atlas Group", suite: "Floor 6", floor: "Floor 6", sf: 30500, priority: 2, expiry: "Jan 1, 2029", notes: "Subject to landlord availability" },
    { optionType: "ROFR", holder: "Third-party tenant", suite: "Floor 4", floor: "Floor 4", sf: 30500, priority: 1, notes: "Existing ROFR from Horizon Ventures; may conflict" },
  ],
  "d05": [
    { optionType: "Expansion Option", holder: "Vertex Studios", suite: "Space 650", floor: "Floor 6", sf: 9800, priority: 1, expiry: "Sep 30, 2027" },
  ],
}



function EncumbrancesTab({ deal }: { deal: Deal }) {
  const items = DEAL_ENCUMBRANCES[deal.id] ?? []

  if (!items.length) {
    return <p className="text-sm text-muted-foreground py-8 text-center">No encumbrances on file for this deal.</p>
  }

  return (
    <div className="flex flex-col divide-y divide-border">
      {items.map((enc, i) => (
        <div key={i} className={cn("py-4", i === 0 ? "pt-0" : "")}>
          <div className="flex items-start gap-3 mb-3">
            <span className="mt-0.5 size-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-primary-foreground bg-destructive">{enc.priority}</span>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold leading-tight text-foreground">{enc.optionType}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{enc.holder} · {enc.suite}</p>
            </div>
          </div>
          <div className="ml-9 flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <Button variant="link" size="sm" className="px-0 h-auto text-sm text-primary">View in abstract</Button>
              <Button variant="link" size="sm" className="px-0 h-auto text-sm text-primary">View in lease</Button>
            </div>
            <div className="rounded-md border border-border overflow-hidden">
              {[
                { label: "Space", value: `${enc.suite} · ${enc.sf.toLocaleString()} sf` },
                { label: "Floor", value: enc.floor },
                ...(enc.expiry ? [{ label: "Expires", value: enc.expiry }] : []),
                { label: "Priority", value: `${enc.priority}${enc.priority === 1 ? "st" : enc.priority === 2 ? "nd" : "rd"} right` },
              ].map(({ label, value }, fi) => (
                <div key={label} className={cn("flex items-baseline gap-3 px-3 py-2", fi % 2 === 0 ? "bg-muted/50" : "bg-background")}>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap w-20 shrink-0">{label}</span>
                  <span className="text-sm text-foreground font-medium">{value}</span>
                </div>
              ))}
            </div>
            {enc.notes && (
              <div className="rounded-md bg-muted/50 border border-border px-3 py-2.5">
                <p className="text-sm text-foreground leading-relaxed italic">&ldquo;{enc.notes}&rdquo;</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Documents tab ────────────────────────────────────────────────────────────

type DocItem = { name: string; type: string; date: string }

function getDocuments(stage: StageValue): DocItem[] {
  const stageIdx = ALL_STAGES.indexOf(stage)
  const docs: DocItem[] = [
    { name: "Inquiry email.pdf",               type: "Correspondence", date: "Aug 25, 2026" },
    { name: "VTS Tower floorplan – FL8.pdf",   type: "Floor plan",     date: "Aug 25, 2026" },
  ]
  if (stageIdx >= 1) {
    docs.push({ name: "Tour confirmation – Sep 3.pdf", type: "Correspondence", date: "Aug 28, 2026" })
    docs.push({ name: "Space 0800 space plan.pdf",     type: "Floor plan",     date: "Sep 3, 2026"  })
  }
  if (stageIdx >= 2) {
    docs.push({ name: "Proposal 1 – VTS Tower.pdf",   type: "Proposal",   date: "Sep 18, 2026" })
    docs.push({ name: "Proposal 2 – revised.pdf",     type: "Proposal",   date: "Oct 4, 2026"  })
  }
  if (stageIdx >= 3) {
    docs.push({ name: "Letter of intent – signed.pdf", type: "LOI",        date: "Oct 15, 2026" })
    docs.push({ name: "Comparables report.pdf",        type: "Market data", date: "Oct 16, 2026" })
    docs.push({ name: "Credit brief.pdf",              type: "Due diligence", date: "Oct 17, 2026" })
  }
  if (stageIdx >= 4) {
    docs.push({ name: "First draft lease.docx",        type: "Legal",      date: "Nov 1, 2026" })
    docs.push({ name: "Redline v2 – tenant.docx",      type: "Legal",      date: "Nov 14, 2026" })
    docs.push({ name: "Counsel handoff brief.pdf",     type: "Legal",      date: "Nov 2, 2026" })
  }
  if (stageIdx >= 5) {
    docs.push({ name: "Final lease – execution set.pdf", type: "Executed", date: "Dec 15, 2026" })
    docs.push({ name: "TI work letter.pdf",              type: "Executed", date: "Dec 15, 2026" })
  }
  return docs
}

const DOC_TYPE_STYLE: Record<string, string> = {
  "Correspondence": "bg-primary/10 text-primary border-primary/20",
  "Floor plan":     "bg-chart-1/10 text-chart-1 border-chart-1/20",
  "Proposal":       "bg-warning/10 text-warning border-warning/20",
  "LOI":            "bg-warning/10 text-warning border-warning/20",
  "Legal":          "bg-primary/10 text-primary border-primary/20",
  "Executed":       "bg-success/10 text-success border-success/20",
  "Market data":    "bg-chart-2/10 text-chart-2 border-chart-2/20",
  "Due diligence":  "bg-destructive/10 text-destructive border-destructive/20",
}

function DocumentsTab({ stage }: { stage: StageValue }) {
  const docs = getDocuments(stage)
  const byType = docs.reduce<Record<string, DocItem[]>>((acc, d) => {
    ;(acc[d.type] = acc[d.type] ?? []).push(d)
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(byType).map(([type, items]) => (
        <div key={type}>
          <p className="text-xs font-semibold text-muted-foreground mb-2">{type}</p>
          <div className="flex flex-col gap-1">
            {items.map((doc, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-lg border border-border/60 bg-card hover:bg-muted/40 transition-colors">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{doc.date}</p>
                </div>
                <Badge variant="outline" className={cn("text-[10px] shrink-0 border", DOC_TYPE_STYLE[doc.type] ?? "")}>{type}</Badge>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Activity feed ────────────────────────────────────────────────────────────

type FeedEntry = { initials: string; name: string; timestamp: string; message: string; kind: "update" | "comment" | "agent" }

const DEAL_FEEDS: Record<string, FeedEntry[]> = {
  "d00": [
    { initials: "SO",  name: "Sarah Okonkwo",  timestamp: "Today · 9:14 AM", message: "Confirmed with the Amazon team — they want to move forward. Initial tour request submitted for Sep 3.", kind: "comment" },
    { initials: "AI",  name: "Deal Capture",   timestamp: "Today · 9:02 AM", message: "Deal created from inbound email. Stage set to Inquiry. Budget NER set to $98.00 based on current market rate.", kind: "agent"  },
    { initials: "RC",  name: "Ryan Chen",      timestamp: "Today · 8:55 AM", message: "Forwarded the inquiry to Sarah Okonkwo at CBRE.", kind: "comment" },
    { initials: "JL",  name: "Jessica Lee",    timestamp: "Today · 8:47 AM", message: "Received inbound inquiry from Amazon.com. 18,000 sf request on Floor 8, VTS Tower.", kind: "comment" },
  ],
  "d08": [
    { initials: "AI",  name: "Space Match",    timestamp: "Today · 2:05 PM", message: "Ranked 14 available floors. Space 2100 flagged as best fit — 54,000 sf uninterrupted, open plan, no column interference.", kind: "agent"  },
    { initials: "DC",  name: "Derek Chan",     timestamp: "Today · 1:40 PM", message: "Morgan Stanley team confirmed tour interest. Coordinating schedule with facilities for Space 2100 and 2200.", kind: "comment" },
    { initials: "AI",  name: "Tour Coordinator", timestamp: "Today · 1:45 PM", message: "Tour scheduled Sep 10 · 10:00 AM. Confirmation sent to Derek Chan and Morgan Stanley facilities team.", kind: "agent"  },
    { initials: "VTS", name: "VTS system",     timestamp: "Yesterday · 4:12 PM", message: "Stage updated: Inquiry → Touring.", kind: "update" },
  ],
  "d10": [
    { initials: "AI",  name: "Deal Monitor",  timestamp: "Today · 11:00 AM", message: "Stalled 26 days. Cost of delay: $3,705/day ($96,330 total). Follow-up drafted — awaiting your approval before sending.", kind: "agent"  },
    { initials: "PS",  name: "Paul Simmons",   timestamp: "Jun 25 · 3:10 PM", message: "KPMG board review has been pushed to mid-August. Will revert once we have a date.", kind: "comment" },
    { initials: "VTS", name: "VTS system",     timestamp: "Jun 20 · 8:00 AM", message: "Stage updated: Inquiry → Proposal. Stall flag set at day 10.", kind: "update" },
    { initials: "MT",  name: "Mark Torres",    timestamp: "Jun 20 · 7:55 AM", message: "Proposal delivered to KPMG. Waiting on board sign-off for renewal authority.", kind: "comment" },
  ],
  "d09": [
    { initials: "AI",  name: "Counsel Handoff",timestamp: "Today · 10:30 AM", message: "LOI terms extracted (18 fields). 2 flags raised: TI escalation clause and subleasing rights at 75% (market 85%). Legal brief ready.", kind: "agent"  },
    { initials: "SL",  name: "Sandra Li",      timestamp: "Today · 9:00 AM", message: "LOI executed this morning. Routing to outside counsel — Skadden on tenant side, Willkie Farr on landlord side.", kind: "comment" },
    { initials: "AI",  name: "Negotiation Guidance", timestamp: "Jul 14 · 3:00 PM", message: "Tracking 12 open redlines. Scope drift detected on subleasing rights — moved without agreement in round 2.", kind: "agent"  },
    { initials: "VTS", name: "VTS system",     timestamp: "Jul 10 · 8:00 AM", message: "Stage updated: LOI → Legal.", kind: "update" },
  ],
  "d20": [
    { initials: "AI",  name: "Execution Management", timestamp: "Today · 3:00 PM", message: "Signatory verified. Execution package assembled: lease + exhibits A–D. 2 outstanding signatures — Salesforce CFO and Landlord VP.", kind: "agent"  },
    { initials: "LG",  name: "Luis Garcia",    timestamp: "Today · 11:30 AM", message: "Final terms agreed with landlord. Routing execution package today.", kind: "comment" },
    { initials: "AI",  name: "Approval Readiness", timestamp: "Jul 12 · 4:00 PM", message: "Approval package assembled — economics, scenarios, risk summary, and precedent. Routed to Salesforce VP Real Estate.", kind: "agent"  },
    { initials: "VTS", name: "VTS system",     timestamp: "Jul 10 · 8:00 AM", message: "Stage updated: LOI → Legal.", kind: "update" },
  ],
  "d22": [
    { initials: "AI",  name: "Data Writeback", timestamp: "Jul 2 · 8:30 AM", message: "24 final terms extracted and synced. VTS ✓ · Financial model ✓ · Reporting ✓. Zero discrepancies detected.", kind: "agent"  },
    { initials: "AI",  name: "Operational Handoff", timestamp: "Jul 1 · 5:00 PM", message: "Notified property management. 16 buildout and compliance tasks created. Key dates and owners loaded into PMS.", kind: "agent"  },
    { initials: "AC",  name: "Adam Chen",      timestamp: "Jul 1 · 4:00 PM", message: "Goldman Sachs lease executed. All parties signed. Effective date Jan 1, 2027.", kind: "comment" },
    { initials: "VTS", name: "VTS system",     timestamp: "Jul 1 · 4:05 PM", message: "Stage updated: Lease Out → Executed.", kind: "update" },
  ],
}

const GENERIC_FEED: FeedEntry[] = [
  { initials: "AI",  name: "Deal Health",   timestamp: "Today · 9:00 AM", message: "Deal is progressing normally. No action required at this time.", kind: "agent"  },
  { initials: "VTS", name: "VTS system",    timestamp: "Yesterday",       message: "Stage updated to current stage.", kind: "update" },
]

const STAGE_FEEDS: Record<StageValue, FeedEntry[]> = {
  "Inquiry": [
    { initials: "AI",  name: "Deal Capture",     timestamp: "Today · 9:02 AM",  message: "Deal created from inbound email. Stage set to Inquiry. Budget NER set to $98.00 based on current market rate.", kind: "agent" },
    { initials: "JL",  name: "Jessica Lee",      timestamp: "Today · 8:47 AM",  message: "Received inbound inquiry from Amazon.com. 18,000 sf request on Floor 8, VTS Tower.", kind: "comment" },
    { initials: "RC",  name: "Ryan Chen",        timestamp: "Today · 8:55 AM",  message: "Forwarded the inquiry to Sarah Okonkwo at CBRE.", kind: "comment" },
  ],
  "Touring": [
    { initials: "AI",  name: "Space Match",      timestamp: "Today · 2:05 PM",  message: "Ranked 14 available floors. Space 2100 flagged as best fit — 54,000 sf uninterrupted, open plan, no column interference.", kind: "agent" },
    { initials: "AI",  name: "Tour Coordinator", timestamp: "Today · 1:45 PM",  message: "Tour scheduled Sep 10 · 10:00 AM. Confirmation sent to Derek Chan and Morgan Stanley facilities team.", kind: "agent" },
    { initials: "DC",  name: "Derek Chan",       timestamp: "Today · 1:40 PM",  message: "Morgan Stanley team confirmed tour interest. Coordinating schedule with facilities for Space 2100 and 2200.", kind: "comment" },
    { initials: "VTS", name: "VTS system",       timestamp: "Yesterday · 4:12 PM", message: "Stage updated: Inquiry → Touring.", kind: "update" },
  ],
  "Proposal": [
    { initials: "AI",  name: "Proposal Builder", timestamp: "Today · 11:00 AM", message: "Proposal assembled for Space 2100: 54,000 sf · $98 NER · 10-year term · $120 TI allowance. Ready for review.", kind: "agent" },
    { initials: "SO",  name: "Sarah Okonkwo",    timestamp: "Today · 9:14 AM",  message: "Confirmed with the Amazon team — they want to move forward. Initial proposal request submitted.", kind: "comment" },
    { initials: "VTS", name: "VTS system",       timestamp: "Yesterday · 8:00 AM", message: "Stage updated: Touring → Proposal.", kind: "update" },
  ],
  "LOI": [
    { initials: "AI",  name: "Counsel Handoff",  timestamp: "Today · 10:30 AM", message: "LOI terms extracted (18 fields). 2 flags raised: TI escalation clause and subleasing rights at 75% (market 85%). Legal brief ready.", kind: "agent" },
    { initials: "SL",  name: "Sandra Li",        timestamp: "Today · 9:00 AM",  message: "LOI executed this morning. Routing to outside counsel — Skadden on tenant side, Willkie Farr on landlord side.", kind: "comment" },
    { initials: "VTS", name: "VTS system",       timestamp: "Yesterday · 8:00 AM", message: "Stage updated: Proposal → LOI.", kind: "update" },
  ],
  "Legal": [
    { initials: "AI",  name: "Negotiation Guidance", timestamp: "Today · 3:00 PM", message: "Tracking 12 open redlines. Scope drift detected on subleasing rights — moved without agreement in round 2.", kind: "agent" },
    { initials: "MT",  name: "Mark Torres",      timestamp: "Today · 2:00 PM",  message: "Round 2 redlines received from Skadden. Key open items: subleasing rights, TI escalation, and renewal option window.", kind: "comment" },
    { initials: "VTS", name: "VTS system",       timestamp: "Yesterday · 8:00 AM", message: "Stage updated: LOI → Legal.", kind: "update" },
  ],
  "Lease Out": [
    { initials: "AI",  name: "Execution Management", timestamp: "Today · 3:00 PM", message: "Signatory verified. Execution package assembled: lease + exhibits A–D. 2 outstanding signatures — Tenant CFO and Landlord VP.", kind: "agent" },
    { initials: "LG",  name: "Luis Garcia",      timestamp: "Today · 11:30 AM", message: "Final terms agreed with landlord. Routing execution package today.", kind: "comment" },
    { initials: "VTS", name: "VTS system",       timestamp: "Yesterday · 8:00 AM", message: "Stage updated: Legal → Lease Out.", kind: "update" },
  ],
  "Executed": [
    { initials: "AI",  name: "Operational Handoff", timestamp: "Today · 5:00 PM", message: "Notified property management. 16 buildout and compliance tasks created. Key dates and owners loaded into PMS.", kind: "agent" },
    { initials: "AI",  name: "Data Writeback",   timestamp: "Today · 4:30 PM",  message: "24 final terms extracted and synced. VTS ✓ · Financial model ✓ · Reporting ✓. Zero discrepancies detected.", kind: "agent" },
    { initials: "AC",  name: "Adam Chen",        timestamp: "Today · 4:00 PM",  message: "Lease executed. All parties signed. Effective date Jan 1, 2027.", kind: "comment" },
    { initials: "VTS", name: "VTS system",       timestamp: "Today · 4:05 PM",  message: "Stage updated: Lease Out → Executed.", kind: "update" },
  ],
}

function getStageFeeds(stage: StageValue): FeedEntry[] {
  return STAGE_FEEDS[stage] ?? GENERIC_FEED
}

export function getEncumbranceCount(dealId: string): number {
  return (DEAL_ENCUMBRANCES[dealId] ?? []).length
}

// Encumbrances that affect a specific space (keyed by space ID from spaces-page)
const SPACE_ENCUMBRANCES: Record<string, number> = {
  "s26": 2, // Space 0800 Floor 8 — ROFO + expansion option (d00)
  "s27": 1, // Suite 0700 Floor 7 — ROFO held by Starbucks (d01)
  "s03": 1, // Suite 0900 Floor 9 — expansion option held by Starbucks (d01)
  "s24": 1, // Suite 1100 Floor 11 — ROFO held by Apex Capital (d02)
  "s23": 1, // Suite 1200 Floor 12 — contraction option held by Apex Capital (d02)
  "s29": 3, // Suite 0400 Floors 4-5 — ROFO + expansion option + ROFR (d04)
  "s28": 1, // Suite 0500 Floor 5 — covered by Atlas Group expansion (d04)
  "s04": 1, // Suite 0600 Floor 6 — expansion option held by Vertex Studios (d05)
}

export function getSpaceEncumbranceCount(spaceId: string): number {
  return SPACE_ENCUMBRANCES[spaceId] ?? 0
}

export function getLatestHumanUpdate(dealId: string, stage: string): { message: string; name: string; timestamp: string } | null {
  const feed = DEAL_FEEDS[dealId] ?? getStageFeeds(stage as StageValue)
  const entry = feed.find(e => e.kind === "comment")
  if (!entry) return null
  return { message: entry.message, name: entry.name, timestamp: entry.timestamp }
}

const REACTIONS = ["👍", "👏", "🎉", "❤️"]

function UpdateCard({ entry }: { entry: FeedEntry }) {
  const [reactions, setReactions] = React.useState<Record<string, number>>({})
  const toggle = (r: string) => setReactions(prev => ({ ...prev, [r]: (prev[r] ?? 0) === 1 ? 0 : 1 }))

  if (entry.kind === "update") {
    return (
      <div className="rounded-lg bg-muted/50 px-3 py-2.5 flex items-center gap-2">
        <div className="h-5 w-5 rounded-full bg-muted-foreground/15 text-muted-foreground flex items-center justify-center shrink-0">
          <span className="text-[8px] font-bold">VTS</span>
        </div>
        <span className="text-xs text-foreground/75 flex-1">{entry.message}</span>
        <span className="text-xs text-muted-foreground shrink-0">{entry.timestamp}</span>
      </div>
    )
  }

  if (entry.kind === "agent") {
    const AgentIcon = AGENT_ICON_MAP[entry.name] ?? Bot
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <AgentIcon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground leading-none">{entry.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{entry.timestamp}</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
            <Zap className="h-2.5 w-2.5 text-primary" />
            <span className="text-xs font-medium text-primary">Agent</span>
          </div>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed pl-[42px]">{entry.message}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
            {entry.initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-none">{entry.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{entry.timestamp}</p>
          </div>
        </div>
      </div>
      <p className="text-sm text-foreground leading-relaxed">{entry.message}</p>
      <div className="flex items-center gap-3 pt-1 border-t border-border/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <button className="hover:text-foreground transition-colors">Share</button>
          <span className="opacity-40">·</span>
          <button className="hover:text-foreground transition-colors">Edit</button>
          <span className="opacity-40">·</span>
          <button className="hover:text-destructive transition-colors">Delete</button>
          <span className="opacity-40">·</span>
        </div>
        <div className="flex items-center gap-1.5">
          {REACTIONS.map(r => (
            <button key={r} onClick={() => toggle(r)}
              className={cn("h-7 px-2 rounded-md text-sm transition-colors flex items-center gap-1",
                reactions[r] ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
              )}>
              {r}{reactions[r] ? <span className="text-xs font-medium">{reactions[r]}</span> : null}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[9px] font-semibold shrink-0">ES</div>
        <input className="flex-1 text-xs bg-muted/50 rounded-lg px-3 py-1.5 text-muted-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-1 focus:ring-border" placeholder="Add a comment…" />
      </div>
    </div>
  )
}


function ActivityFeed({ deal, stage }: { deal: Deal; stage: StageValue }) {
  const [draft, setDraft] = React.useState("")
  const [logAsTour, setLogAsTour] = React.useState(false)
  const today = new Date().toISOString().slice(0, 10)
  const [updateDate, setUpdateDate] = React.useState(today)
  const fileRef = React.useRef<HTMLInputElement>(null)
  const dateRef = React.useRef<HTMLInputElement>(null)
  const stageFeed = getStageFeeds(stage)
  const dealFeed = DEAL_FEEDS[deal.id] ?? []
  const seen = new Set(stageFeed.map(e => e.message))
  const feed = [...stageFeed, ...dealFeed.filter(e => !seen.has(e.message))]

  return (
    <div className="flex flex-col gap-0">
      <div className="flex flex-col gap-3">
        {/* Composer */}
        <div className="rounded-xl border border-primary/30 bg-card p-3 flex flex-col gap-2">
          <Textarea value={draft} onChange={e => setDraft(e.target.value)}
            placeholder={logAsTour ? "Describe the tour…" : "Post an update…"}
            className="resize-none text-sm min-h-[90px] border-0 bg-transparent p-0 focus-visible:ring-0 shadow-none"
            rows={3}
          />
          {/* Toolbar: draft + attach + date + tour toggle + post */}
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline" className="gap-1.5 text-primary border-primary/30 hover:bg-primary/5"
              onClick={() => setDraft("Draft a deal update for Amazon.com summarizing current stage, recent activity, and next steps.")}>
              <Zap className="h-3.5 w-3.5" />
              Draft with VTS
            </Button>
            <Button size="sm" variant="outline" className="text-primary border-primary/30 hover:bg-primary/5 h-8 w-8 p-0 rounded-full"
              onClick={() => fileRef.current?.click()}>
              <Paperclip className="h-3.5 w-3.5" />
              <input ref={fileRef} type="file" className="sr-only" />
            </Button>
            <Button size="sm" variant="outline" className="text-primary border-primary/30 hover:bg-primary/5 h-8 w-8 p-0 rounded-full"
              onClick={() => (dateRef.current as any)?.showPicker?.()}>
              <Calendar className="h-3.5 w-3.5" />
              <input ref={dateRef} type="date" value={updateDate} onChange={e => setUpdateDate(e.target.value)} className="sr-only" />
            </Button>
            <Button size="sm" variant="outline"
              onClick={() => setLogAsTour(v => !v)}
              className={cn("gap-1.5 text-primary border-primary/30 hover:bg-primary/5", logAsTour && "bg-primary/10")}>
              <MapPin className="h-3.5 w-3.5" />
              Log tour
            </Button>
            <Button size="sm" disabled={!draft.trim()} className="gap-1.5 ml-auto" onClick={() => setDraft("")}>
              <Send className="h-3.5 w-3.5" />
              Post
            </Button>
          </div>
        </div>

        {feed.length === 0
          ? <p className="text-sm text-muted-foreground py-4 text-center">No updates yet.</p>
          : feed.map((e, i) => <UpdateCard key={i} entry={e} />)
        }
      </div>
    </div>
  )
}

// ─── Deal Health system ───────────────────────────────────────────────────────

type HealthScore = "strong" | "on-track" | "caution" | "at-risk"

const HEALTH_SCORE_CONFIG: Record<HealthScore, { label: string; cls: string; textCls: string; bgCls: string }> = {
  "strong":   { label: "Strong",   cls: "text-success bg-success/10 border-success/20",             textCls: "text-success",     bgCls: "bg-success/8"      },
  "on-track": { label: "On track", cls: "text-primary bg-primary/10 border-primary/20",             textCls: "text-primary",     bgCls: ""                  },
  "caution":  { label: "Caution",  cls: "text-warning bg-warning/10 border-warning/20",             textCls: "text-warning",     bgCls: "bg-warning/8"      },
  "at-risk":  { label: "At risk",  cls: "text-destructive bg-destructive/10 border-destructive/20", textCls: "text-destructive", bgCls: "bg-destructive/8"  },
}

type HealthEntry = {
  score: HealthScore
  context: string
  summary: string
  signals: string[]
  recs: { action: string; urgency: string; agentId: string }[]
}

const HEALTH_BY_STAGE: Record<StageValue, Record<HealthScore, HealthEntry>> = {
  "Inquiry": {
    "strong":   { score: "strong",   context: "3 spaces matched, tour confirmed", summary: "Requirement captured and acted on immediately. Tour confirmed and spaces matched to requirements.", signals: ["Inquiry parsed and logged within 1 hour", "Tenant rep identified: Sarah Okonkwo at CBRE", "3 spaces matched to requirement", "Tour confirmed Sep 18 · 10:00 AM"], recs: [{ action: "Prepare space shortlist for tour", urgency: "Before tour", agentId: "tour-agent" }] },
    "on-track": { score: "on-track", context: "3 spaces matched, tours pending", summary: "Requirement captured. Coordinating tour schedule with the tenant team.", signals: ["Inbound inquiry parsed and logged", "Tenant rep identified: Sarah Okonkwo at CBRE", "Space requirement matched to 3 available spaces"], recs: [{ action: "Schedule initial tours", urgency: "This week", agentId: "tour-agent" }] },
    "caution":  { score: "caution",  context: "No tour yet — 8 days old", summary: "No tour scheduled yet. Inquiry risks going cold without follow-up.", signals: ["Requirement captured 8 days ago", "No tour date confirmed", "Tenant rep has not responded to last outreach", "Competing buildings may be scheduling faster"], recs: [{ action: "Re-engage tenant rep", urgency: "Today", agentId: "deal-momentum" }, { action: "Schedule tour", urgency: "Today", agentId: "tour-agent" }] },
    "at-risk":  { score: "at-risk",  context: "No response, competitor touring", summary: "Inquiry has not progressed. Tenant may be disengaging. Competitor activity detected.", signals: ["12 days since inquiry with no forward progress", "No response to outreach attempts", "Competitor tour detected at 2 buildings", "Encumbrances on target space require rights holder notification before proceeding"], recs: [{ action: "Send urgent re-engagement", urgency: "Today", agentId: "deal-momentum" }, { action: "Notify rights holders on encumbered space", urgency: "Before proceeding", agentId: "doc-drafting" }] },
  },
  "Touring": {
    "strong":   { score: "strong",   context: "Space 2100 top-ranked, ready", summary: "Tour cycle complete with strong tenant feedback. Top space identified and proposal ready to deliver.", signals: ["3 tours completed across 2 buildings", "Space 2100 ranked top by tenant team", "Feedback captured: prefers higher floors, natural light", "No competitor tours detected"], recs: [{ action: "Deliver proposal for Space 2100", urgency: "This week", agentId: "proposal-builder" }] },
    "on-track": { score: "on-track", context: "Tour Sep 18 · 2 spaces shortlisted", summary: "Tours underway. Capturing tenant feedback and matching spaces to requirements.", signals: ["Tour scheduled for Sep 18 · 10:00 AM", "Space 2100 ranked best fit so far", "No competing tour detected"], recs: [{ action: "Prepare proposal for top-ranked space", urgency: "This week", agentId: "proposal-builder" }] },
    "caution":  { score: "caution",  context: "No follow-up in 9 days", summary: "Tour completed but no follow-up from tenant rep. Proposal not yet requested.", signals: ["Tour completed 9 days ago", "No feedback received from tenant team", "Proposal not yet requested"], recs: [{ action: "Follow up on tour feedback", urgency: "Today", agentId: "deal-momentum" }, { action: "Prepare proactive proposal", urgency: "This week", agentId: "proposal-builder" }] },
    "at-risk":  { score: "at-risk",  context: "Competitor tours, silent 14 days", summary: "Tenant toured competitor properties. Engagement declining. Intervention recommended.", signals: ["Competitor tour detected at 2 other buildings", "Last communication 14 days ago", "No proposal request received", "Tenant rep unreachable"], recs: [{ action: "Model concession scenarios", urgency: "Today", agentId: "scenario-modeling" }, { action: "Send differentiation brief", urgency: "Today", agentId: "deal-momentum" }] },
  },
  "Proposal": {
    "strong":   { score: "strong",   context: "Counter received, 4% gap", summary: "Proposal delivered and counter received. Terms are close. Deal is progressing to LOI.", signals: ["Proposal delivered Sep 5", "Counter received Sep 12", "Budget gap: 4% — within negotiable range", "Key terms aligned: TI, free rent, term length"], recs: [{ action: "Prepare LOI draft", urgency: "This week", agentId: "proposal-builder" }] },
    "on-track": { score: "on-track", context: "Delivered Sep 5, awaiting counter", summary: "Proposal delivered. Monitoring for counter and tracking engagement signals.", signals: ["Proposal sent to tenant team Sep 5", "No counter overdue", "Deal Monitor watching engagement signals"], recs: [{ action: "Prepare counter-proposal scenarios", urgency: "This week", agentId: "scenario-modeling" }] },
    "caution":  { score: "caution",  context: "No counter — 11 days old", summary: "Proposal sent with no counter received. Follow-up needed to keep momentum.", signals: ["Proposal delivered 11 days ago", "No counter received", "Board review may be causing delay", "Tenant rep last active 5 days ago"], recs: [{ action: "Send follow-up on proposal", urgency: "Today", agentId: "deal-momentum" }, { action: "Model alternative proposal terms", urgency: "This week", agentId: "scenario-modeling" }] },
    "at-risk":  { score: "at-risk",  context: "12% gap, silent 14 days", summary: "Multiple risk signals detected. Intervention required to salvage this deal.", signals: ["Tenant seen touring competitor buildings", "Budget gap of 12% vs market rate", "Last communication 14 days ago", "No counter received"], recs: [{ action: "Model concession scenarios", urgency: "Today", agentId: "scenario-modeling" }, { action: "Analyze deal intelligence", urgency: "Today", agentId: "deal-intelligence" }] },
  },
  "LOI": {
    "strong":   { score: "strong",   context: "LOI signed, counsel engaged", summary: "LOI executed with clean terms. Legal package initiated and counsel engaged promptly.", signals: ["LOI signed by all parties Sep 8", "Key terms extracted: 18 fields, 0 flags", "Counsel engaged — package delivered Sep 9", "Exclusivity window: 30 days remaining"], recs: [{ action: "Monitor counsel progress", urgency: "This week", agentId: "counsel-handoff" }] },
    "on-track": { score: "on-track", context: "LOI executed, preparing package", summary: "LOI executed. Preparing legal package for counsel handoff.", signals: ["LOI signed by all parties", "Key terms extracted: 18 fields", "2 flags raised: TI escalation and subleasing rights"], recs: [{ action: "Prepare counsel handoff package", urgency: "This week", agentId: "counsel-handoff" }] },
    "caution":  { score: "caution",  context: "No counsel — 7 days since LOI", summary: "LOI signed but legal package not yet initiated. Exclusivity window is running.", signals: ["LOI executed 7 days ago", "No counsel engaged yet", "Clock running on exclusivity window"], recs: [{ action: "Initiate counsel handoff", urgency: "Today", agentId: "counsel-handoff" }, { action: "Flag exclusivity timeline risk", urgency: "Today", agentId: "deal-momentum" }] },
    "at-risk":  { score: "at-risk",  context: "Exclusivity closes in 5 days", summary: "LOI terms at risk. Open items need immediate resolution before exclusivity expires.", signals: ["Subleasing rights dispute unresolved", "TI escalation clause flagged by tenant", "Exclusivity window closing in 5 days"], recs: [{ action: "Escalate flagged terms to counsel", urgency: "Today", agentId: "counsel-handoff" }, { action: "Prepare negotiation guidance", urgency: "Today", agentId: "negotiation-guidance" }] },
  },
  "Legal": {
    "strong":   { score: "strong",   context: "8 of 12 redlines closed this week", summary: "Legal review progressing well. Both counsel engaged and redlines closing on schedule.", signals: ["8 of 12 redlines resolved this week", "Both counsel parties engaged and responsive", "No scope drift detected", "On track for execution by Oct 15"], recs: [{ action: "Monitor remaining redlines", urgency: "This week", agentId: "negotiation-guidance" }] },
    "on-track": { score: "on-track", context: "12 open redlines, both counsel on", summary: "Legal review underway. Tracking open redlines with both counsel engaged.", signals: ["12 open redlines tracked", "Both counsel parties engaged", "No scope drift detected"], recs: [{ action: "Monitor redline resolution progress", urgency: "This week", agentId: "negotiation-guidance" }] },
    "caution":  { score: "caution",  context: "No redline movement in 8 days", summary: "Legal review stalled. Redlines not progressing and scope drift detected.", signals: ["No redline movement in 8 days", "Scope drift detected on subleasing rights", "Tenant counsel unresponsive to last 2 emails"], recs: [{ action: "Escalate stalled redlines", urgency: "Today", agentId: "negotiation-guidance" }, { action: "Prepare concession on open items", urgency: "Today", agentId: "scenario-modeling" }] },
    "at-risk":  { score: "at-risk",  context: "3 rounds unresolved, walk risk", summary: "Critical legal issues detected. Immediate escalation required.", signals: ["Subleasing rights moved without agreement", "3 rounds of redlines unresolved", "Tenant threatening to terminate negotiations"], recs: [{ action: "Convene negotiation call", urgency: "Today", agentId: "negotiation-guidance" }, { action: "Escalate to senior leadership", urgency: "Today", agentId: "deal-health" }] },
  },
  "Lease Out": {
    "strong":   { score: "strong",   context: "Both signatures received", summary: "Both signatures collected. Lease ready for filing and effective date confirmed.", signals: ["Tenant CFO signed Sep 10", "Landlord VP signed Sep 11", "Effective date Jan 1, 2027 confirmed", "Filing package assembled"], recs: [{ action: "File executed lease", urgency: "Today", agentId: "execution-management" }] },
    "on-track": { score: "on-track", context: "2 signatures outstanding", summary: "Lease out for signature. Tracking outstanding signatures from both parties.", signals: ["2 outstanding signatures: Tenant CFO and Landlord VP", "Execution package assembled", "Effective date confirmed"], recs: [{ action: "Track signature completion", urgency: "This week", agentId: "execution-management" }] },
    "caution":  { score: "caution",  context: "No signatures — sent 6 days ago", summary: "Lease out but no signatures received yet. Follow-up needed.", signals: ["Lease sent 6 days ago", "No signatures returned", "Signatory availability unconfirmed"], recs: [{ action: "Follow up with signatories", urgency: "Today", agentId: "execution-management" }, { action: "Re-engage tenant rep", urgency: "Today", agentId: "deal-momentum" }] },
    "at-risk":  { score: "at-risk",  context: "Delays, competing opportunity", summary: "Signature process at risk. Delays and competing opportunity may jeopardize close.", signals: ["Tenant CFO travel delay — unavailable until Sep 22", "Landlord VP approval pending board sign-off", "Competing lease opportunity detected"], recs: [{ action: "Escalate signature urgency", urgency: "Today", agentId: "execution-management" }, { action: "Prepare contingency scenarios", urgency: "Today", agentId: "scenario-modeling" }] },
  },
  "Executed": {
    "strong":   { score: "strong",   context: "Handoff complete, buildout on track", summary: "Execution complete and full operational handoff finished. Tenant onboarded and buildout proceeding on schedule.", signals: ["All 16 handoff tasks completed", "Property management notified and briefed", "Buildout permit approved", "Move-in confirmed Jan 1, 2027"], recs: [{ action: "Archive deal documentation", urgency: "This week", agentId: "data-writeback" }] },
    "on-track": { score: "on-track", context: "16 handoff tasks in progress", summary: "Lease executed. Operational handoff underway with 16 tasks created.", signals: ["Lease signed by all parties", "Effective date Jan 1, 2027", "16 operational tasks created and assigned"], recs: [{ action: "Complete operational handoff", urgency: "This week", agentId: "operational-handoff" }, { action: "Sync final terms to all systems", urgency: "This week", agentId: "data-writeback" }] },
    "caution":  { score: "caution",  context: "Handoff not started, 3 days out", summary: "Execution complete but handoff tasks not yet initiated. Key notifications overdue.", signals: ["Lease executed 3 days ago", "Property management not notified", "Buildout tasks not created"], recs: [{ action: "Initiate operational handoff", urgency: "Today", agentId: "operational-handoff" }, { action: "Sync final terms", urgency: "Today", agentId: "data-writeback" }] },
    "at-risk":  { score: "at-risk",  context: "Permit delayed, move-in at risk", summary: "Post-execution tasks falling behind. Tenant move-in date at risk.", signals: ["Buildout permit delayed — city review backlog", "Property management handoff incomplete", "Move-in date conflicts detected"], recs: [{ action: "Escalate buildout timeline", urgency: "Today", agentId: "operational-handoff" }, { action: "Resolve move-in conflicts", urgency: "Today", agentId: "data-writeback" }] },
  },
}

const HEALTH_OVERRIDES: Record<string, HealthEntry> = {
  // d00 — Amazon.com · Inquiry · 2 encumbrances on Space 0800
  "d00": {
    score: "at-risk",
    context: "2 encumbrances on target space",
    summary: "Two encumbrances detected on Space 0800. Rights holders must be notified before the space can be offered to Amazon.",
    signals: [
      "ROFO held by Sullivan & Cromwell — 1st priority, expires Apr 30, 2029",
      "Expansion option held by Meridian Health Partners — 2nd priority, expires Mar 31, 2028",
      "Both rights encumber Space 0800 · 18,000 sf — Amazon's target space",
    ],
    recs: [
      { action: "Draft ROFO notice to Sullivan & Cromwell for Space 0800", urgency: "Before proceeding", agentId: "doc-drafting" },
      { action: "Draft expansion option notice to Meridian Health Partners for Space 0800", urgency: "This week", agentId: "doc-drafting" },
    ],
  },
  // d01 — Starbucks · Legal · 2 encumbrances on adjacent spaces; NER above budget
  "d01": {
    score: "at-risk",
    context: "2 encumbrances — ROFO + expansion option",
    summary: "Two encumbrances held by Starbucks on adjacent spaces require resolution before legal package can close.",
    signals: [
      "ROFO on Space 750 held by Starbucks Corporation — expires Dec 31, 2027",
      "Expansion option on Space 900 held by Starbucks Corporation — expires Jun 30, 2028",
      "Encumbered spaces are adjacent to Suite 800 — legal review required before proceeding",
    ],
    recs: [
      { action: "Resolve ROFO and expansion option with Starbucks before lease execution", urgency: "Before proceeding", agentId: "doc-drafting" },
    ],
  },
  // d02 — Apex Capital · Proposal · 2 encumbrances; counter awaiting response; NER 8% below budget
  "d02": {
    score: "at-risk",
    context: "2 encumbrances + counter pending + 8% below budget",
    summary: "Two encumbrances on target floors, counter proposal unanswered, and NER 8% below budget — multiple compounding risks.",
    signals: [
      "ROFO held by Apex Capital on Floor 11 — expires Mar 15, 2027",
      "Contraction option on Floor 12 North Wing — must be resolved before lease can execute",
      "Counter proposal delivered — no response received",
      "NER at $48/sf vs $52/sf budget — 8% shortfall",
    ],
    recs: [
      { action: "Follow up on counter proposal immediately", urgency: "Today", agentId: "deal-momentum" },
      { action: "Draft encumbrance notices for both rights holders", urgency: "This week", agentId: "doc-drafting" },
    ],
  },
  // d03 — Meridian Health · Lease Out · stalled 18 days
  "d03": {
    score: "caution",
    context: "Stalled 18 days at lease-out",
    summary: "Lease out package has been with the tenant team for 18 days without response. Risk of further delay.",
    signals: [
      "Lease out sent 18 days ago — no tenant response",
      "NER on budget at $55/sf — terms are aligned",
      "No competing offers identified, but momentum is slowing",
    ],
    recs: [
      { action: "Follow up with Priya Nair to confirm receipt and timeline", urgency: "Today", agentId: "deal-momentum" },
    ],
  },
  // d04 — Atlas Group · Proposal · at-risk status · 3 encumbrances · competitor
  "d04": {
    score: "at-risk",
    context: "Competitor touring, 3 encumbrances, 12% below budget",
    summary: "Tenant is considering a competitor. Three encumbrances on target floors and a 12% NER gap make this deal a priority intervention.",
    signals: [
      "Tenant reported considering a competitor building",
      "NER at $44/sf vs $50/sf budget — 12% shortfall",
      "ROFO on Floors 4–5 held by Atlas Group — expires Jan 1, 2028",
      "Expansion option on Floor 6 plus conflicting ROFR from Horizon Ventures",
    ],
    recs: [
      { action: "Model concession scenarios to close NER gap", urgency: "Today", agentId: "scenario-modeling" },
      { action: "Resolve conflicting ROFR before proceeding", urgency: "Before proceeding", agentId: "doc-drafting" },
    ],
  },
  // d05 — Vertex Studios · LOI · 1 encumbrance; NER slightly above budget
  "d05": {
    score: "at-risk",
    context: "1 encumbrance on adjacent space — must resolve before LOI executes",
    summary: "Expansion option on the adjacent space must be resolved before LOI can execute. Disclosure required and timeline uncertain.",
    signals: [
      "Expansion option held by Vertex Studios on Space 650 — expires Sep 30, 2027",
      "Encumbrance blocks adjacent space — rights holder must be notified before execution",
      "LOI terms otherwise aligned — NER $2/sf above budget",
      "Delay risk if rights holder exercises option",
    ],
    recs: [
      { action: "Draft expansion option notice to rights holder for Space 650", urgency: "Before LOI execution", agentId: "doc-drafting" },
    ],
  },
  // d06 — Bluewave LLC · Lease Out · active · on budget
  "d06": {
    score: "on-track",
    context: "Lease out delivered, on budget",
    summary: "Lease out package delivered and terms are on budget. Awaiting tenant signature.",
    signals: [
      "Lease out sent to Tom Reyes — awaiting countersignature",
      "NER at $51/sf — exactly on budget",
      "No encumbrances on Suite 300",
    ],
    recs: [],
  },
  // d07 — Pfizer · LOI · NER 3% above budget · strong momentum
  "d07": {
    score: "strong",
    context: "LOI signed, NER above budget",
    summary: "LOI executed with terms above budget. Counsel engaged and legal package in preparation.",
    signals: [
      "LOI signed by all parties",
      "NER at $62/sf vs $60/sf budget — 3% above budget",
      "No encumbrances on target floors",
      "Counsel engaged — Pfizer legal team responsive",
    ],
    recs: [],
  },
  // d08 — Morgan Stanley · Touring · no proposal submitted yet · competitor activity
  "d08": {
    score: "caution",
    context: "No proposal yet — competitor tours reported",
    summary: "Tour completed but no proposal delivered. Competitor activity reported on the same floor — urgency to move forward.",
    signals: [
      "Tour completed — no proposal submitted yet",
      "Competitor building reported touring the same requirement",
      "Suite 2200 top-ranked but no formal commitment from tenant team",
      "180,000 sf requirement makes this a high-priority deal to protect",
    ],
    recs: [{ action: "Submit proposal for Suite 2200 before competitor advances", urgency: "Today", agentId: "proposal-builder" }],
  },
  // d09 — Deloitte · Legal · NER 3% above budget · expansion · active
  "d09": {
    score: "strong",
    context: "Legal progressing, NER 3% above budget",
    summary: "Legal package advancing with terms above budget. Expansion deal with strong tenant engagement.",
    signals: [
      "NER at $72/sf vs $70/sf budget — 3% above target",
      "Legal package with counsel — no open flags",
      "Expansion into Suite 500 aligns with tenant's existing footprint",
      "No encumbrances on target space",
    ],
    recs: [],
  },
  // d10 — KPMG · Proposal · stalled 26 days · NER 11% below budget
  "d10": {
    score: "at-risk",
    context: "Stalled 26 days, board delay, 11% below budget",
    summary: "Proposal stalled for 26 days pending KPMG board approval. NER shortfall and prolonged silence increase execution risk.",
    signals: [
      "Proposal stalled 26 days — board review ongoing",
      "NER at $49/sf vs $55/sf budget — 11% below target",
      "No counter received — last contact 26 days ago",
      "Board approval timeline unknown",
    ],
    recs: [
      { action: "Request board meeting timeline from Paul Simmons", urgency: "Today", agentId: "deal-momentum" },
      { action: "Model revised proposal at $52/sf to bridge NER gap", urgency: "This week", agentId: "scenario-modeling" },
    ],
  },
  // d11 — Ernst & Young · Proposal · no response in 11 days
  "d11": {
    score: "caution",
    context: "Proposal unanswered for 11 days",
    summary: "Proposal delivered 11 days ago with no counter received. Silence from Claire Marsh's team warrants a follow-up.",
    signals: [
      "Proposal sent 11 days ago — no counter received from Claire Marsh",
      "NER at $58/sf vs $57/sf budget — terms are competitive",
      "No encumbrances on Suite 2200",
      "Risk of deal going cold without outreach",
    ],
    recs: [{ action: "Follow up with Claire Marsh on proposal status", urgency: "Today", agentId: "deal-momentum" }],
  },
  // d12 — HSBC · Inquiry · active · renewal
  "d12": {
    score: "on-track",
    context: "Inquiry received, coordinating tour",
    summary: "Renewal inquiry received and logged. Coordinating tour schedule with HSBC facilities team.",
    signals: [
      "Renewal inquiry received from Frank Lee",
      "Suite 900 available — matches HSBC's existing footprint",
      "No encumbrances on target space",
    ],
    recs: [{ action: "Schedule renewal tour with Frank Lee", urgency: "This week", agentId: "tour-agent" }],
  },
  // d13 — Latham & Watkins · LOI · at-risk · competitor offering lower TI
  "d13": {
    score: "at-risk",
    context: "Competitor undercutting TI, LOI stalled",
    summary: "Competitor offering lower tenant improvement allowance. LOI terms at risk of being undercut — intervention needed.",
    signals: [
      "Competitor building offering lower TI package — reported by Grace Yu",
      "NER at $65/sf vs $66/sf budget — 2% shortfall",
      "LOI not yet executed — tenant team reviewing alternatives",
      "Last communication 12 days ago",
    ],
    recs: [
      { action: "Model revised TI package to match competitor offer", urgency: "Today", agentId: "scenario-modeling" },
      { action: "Reach out to Grace Yu with updated terms", urgency: "Today", agentId: "deal-momentum" },
    ],
  },
  // d14 — JPMorgan · Legal · NER 4% above budget · expansion
  "d14": {
    score: "strong",
    context: "Legal advancing, NER 4% above budget",
    summary: "Legal package progressing well with NER above budget. Expansion deal with aligned terms and no encumbrances.",
    signals: [
      "NER at $75/sf vs $72/sf budget — 4% above target",
      "Legal package underway — no open items flagged",
      "Expansion on Floor 6 aligned with JPMorgan's existing footprint",
      "No encumbrances on target floor",
    ],
    recs: [],
  },
  // d15 — Amazon.com · Touring · active · large deal · no encumbrances
  "d15": {
    score: "on-track",
    context: "Tours underway, large block requirement",
    summary: "Tour cycle underway for a 150,000 sf block requirement. Spaces on Floors 4–6 shortlisted.",
    signals: [
      "Tour scheduled with Mia Zhao — facilities and brokerage team confirmed",
      "3 floors shortlisted for review — Floors 4, 5, 6",
      "No encumbrances on target floors",
      "No competitor tours detected",
    ],
    recs: [{ action: "Prepare block space proposal after tour", urgency: "This week", agentId: "proposal-builder" }],
  },
  // d16 — WeWork · Lease Out · stalled 28 days · NER 5% below budget
  "d16": {
    score: "at-risk",
    context: "Stalled 28 days, budget constraints",
    summary: "Lease out stalled for 28 days. WeWork citing budget constraints — NER gap and extended silence signal execution risk.",
    signals: [
      "Lease out stalled 28 days — WeWork team unresponsive",
      "NER at $38/sf vs $40/sf budget — 5% below target",
      "Tenant cited budget constraints as primary concern",
      "No encumbrances on target floors",
    ],
    recs: [
      { action: "Re-engage Ethan Ross with revised terms", urgency: "Today", agentId: "deal-momentum" },
      { action: "Model reduced TI or free rent to bridge budget gap", urgency: "This week", agentId: "scenario-modeling" },
    ],
  },
  // d17 — Google · LOI · NER 3% above budget · large deal
  "d17": {
    score: "strong",
    context: "LOI signed, NER above budget",
    summary: "LOI executed on strong terms. Google's 200,000 sf deal is advancing with terms above budget and counsel engaged.",
    signals: [
      "LOI signed — all parties aligned on key terms",
      "NER at $82/sf vs $80/sf budget — 3% above target",
      "No encumbrances on Floors 5–8",
      "Counsel handoff package initiated",
    ],
    recs: [],
  },
  // d18 — Tesla · Proposal · NER 6% above budget · active
  "d18": {
    score: "on-track",
    context: "Proposal delivered, NER above budget",
    summary: "Proposal delivered with NER above budget. Awaiting counter from Omar Khalid.",
    signals: [
      "Proposal sent to Omar Khalid — response expected",
      "NER at $35/sf vs $33/sf budget — 6% above target",
      "No encumbrances on Suite 1100",
    ],
    recs: [],
  },
  // d19 — Cisco · LOI · NER 5% above budget · active renewal
  "d19": {
    score: "strong",
    context: "LOI advancing, NER 5% above budget",
    summary: "LOI in progress with terms well above budget. Renewal deal with aligned terms and strong engagement.",
    signals: [
      "LOI terms agreed — NER at $58/sf vs $55/sf budget",
      "Renewal covers Floors 20–22 — aligned with existing footprint",
      "No encumbrances on target floors",
      "Jenny Park responsive — execution on track",
    ],
    recs: [],
  },
  // d20 — Salesforce · Legal · NER 2% above budget · expansion
  "d20": {
    score: "strong",
    context: "Legal progressing, NER above budget",
    summary: "Legal package advancing with NER above budget. Expansion at home tower with fully aligned terms.",
    signals: [
      "NER at $90/sf vs $88/sf budget — 2% above target",
      "Legal package with counsel — no open items",
      "Salesforce expansion at Salesforce Tower — home tower advantage",
      "No encumbrances on Floor 30",
    ],
    recs: [],
  },
  // d21 — BlackRock · Proposal · at-risk · slow responses · NER below budget
  "d21": {
    score: "at-risk",
    context: "Slow responses, 16-day gap, NER below budget",
    summary: "BlackRock engagement declining. No counter received and NER below budget. Intervention needed to keep deal alive.",
    signals: [
      "Last communication 16 days ago — tenant team unresponsive",
      "NER at $78/sf vs $80/sf budget — 2% below target",
      "No counter received since proposal delivery",
      "Risk of deal going cold without outreach",
    ],
    recs: [
      { action: "Re-engage Kate Morrison with updated proposal", urgency: "Today", agentId: "deal-momentum" },
    ],
  },
  // d22 — Goldman Sachs · Executed
  "d22": {
    score: "strong",
    context: "Executed — NER 4% above budget",
    summary: "Lease executed with all parties signed. NER 4% above budget. Effective date Jan 1, 2027.",
    signals: [
      "Lease executed — all parties signed Jul 1, 2026",
      "NER at $88/sf vs $85/sf budget — 4% above target",
      "185,000 sf renewal at 30 Hudson Yards — flagship execution",
    ],
    recs: [],
  },
  // d23 — McKinsey · LOI · NER 1% above budget · active
  "d23": {
    score: "on-track",
    context: "LOI advancing, terms aligned",
    summary: "LOI in progress with terms on budget. McKinsey team engaged and moving toward legal.",
    signals: [
      "LOI terms largely aligned — NER 1% above budget",
      "Tara Singh responsive — legal team on standby",
      "No encumbrances on Suite 4200",
    ],
    recs: [],
  },
  // d24 — Spotify · Touring · active
  "d24": {
    score: "on-track",
    context: "Tours scheduled, tenant engaged",
    summary: "Tour cycle initiated with Spotify's broker. Tenant engaged and spaces under review.",
    signals: [
      "Tour scheduled with Ben Walsh — broker confirmed",
      "Suite 700 shortlisted as primary option",
      "No encumbrances on target space",
      "No competitor tours detected",
    ],
    recs: [],
  },
  // d25 — Airbnb · Inquiry · active
  "d25": {
    score: "on-track",
    context: "Inquiry captured, spaces being matched",
    summary: "Inquiry captured and being processed. Spaces at Salesforce Tower being matched to requirements.",
    signals: [
      "Inquiry received from Lily Chen — requirement logged",
      "Floor 25 being prepared for proposal",
      "No encumbrances on target floor",
    ],
    recs: [{ action: "Schedule initial tour with Lily Chen", urgency: "This week", agentId: "tour-agent" }],
  },
  // d26 — Stripe · Proposal · NER above budget but TI ask higher than expected
  "d26": {
    score: "caution",
    context: "TI ask above standard — NER impact unclear",
    summary: "Proposal delivered above NER budget, but Stripe's TI request is above standard. Net economics need remodeling before counter.",
    signals: [
      "Proposal sent to Raj Mehta — counter expected",
      "NER at $62/sf vs $60/sf budget — 3% above target on face rent",
      "TI ask flagged as above-standard — net impact on effective NER TBD",
      "No encumbrances on Floor 15",
    ],
    recs: [{ action: "Model effective NER with Stripe's TI ask before counter", urgency: "This week", agentId: "scenario-modeling" }],
  },
  // d27 — Twitter/X · LOI · stalled 31 days · NER 13% below budget · seeking concessions
  "d27": {
    score: "at-risk",
    context: "Stalled 31 days, seeking major concessions",
    summary: "LOI stalled for 31 days. Twitter/X seeking major rent concessions with NER 13% below budget. Deal at serious risk.",
    signals: [
      "LOI stalled 31 days — tenant requesting major concessions",
      "NER at $45/sf vs $52/sf budget — 13% below target",
      "Dana Fox unresponsive for 2 weeks",
      "Cost of delay: $2,400/day based on current lease gap",
    ],
    recs: [
      { action: "Escalate concession decision to ownership", urgency: "Today", agentId: "deal-momentum" },
      { action: "Model minimum acceptable terms for Twitter/X", urgency: "Today", agentId: "scenario-modeling" },
    ],
  },
  // d28 — Uber · Proposal · NER 6% above budget · active
  "d28": {
    score: "on-track",
    context: "Proposal delivered, NER above budget",
    summary: "Proposal delivered with NER above budget. Uber team reviewing terms.",
    signals: [
      "Proposal sent to Kai Brown — under review",
      "NER at $38/sf vs $36/sf budget — 6% above target",
      "No encumbrances on Suite 800",
    ],
    recs: [],
  },
  // d29 — Microsoft · Legal · NER 2% above budget · large deal
  "d29": {
    score: "strong",
    context: "Legal advancing, NER above budget",
    summary: "Legal package progressing well on a landmark 250,000 sf deal. NER above budget with no open flags.",
    signals: [
      "NER at $92/sf vs $90/sf budget — 2% above target",
      "Legal package with counsel — Skadden engaged on tenant side",
      "No encumbrances on Floors 60–65",
      "Largest active deal in the portfolio",
    ],
    recs: [],
  },
  // d30 — Meta · Executed
  "d30": {
    score: "strong",
    context: "Executed — NER 3% above budget",
    summary: "Lease executed with all parties signed. NER above budget on a 130,000 sf expansion.",
    signals: [
      "Lease executed — all parties signed",
      "NER at $75/sf vs $73/sf budget — 3% above target",
      "130,000 sf expansion at 30 Hudson Yards",
    ],
    recs: [],
  },

  // --- VTS Tower HQ additions ---
  // d39 — Hogan Lovells · Caution (stalled 14d)
  "d39": {
    score: "caution",
    context: "Stalled 14 days — no response since counter",
    summary: "Counter proposal sent 14 days ago with no response. Risk of losing momentum before LOI.",
    signals: [
      "Counter sent 7/1 — no follow-up in 14 days",
      "Decision-maker travel cited as reason for delay",
      "Competing building has been touring same prospect",
    ],
    recs: [
      { action: "Re-engage tenant rep with new availability update", urgency: "This week", agentId: "deal-momentum" },
      { action: "Offer incentive to accelerate LOI execution", urgency: "This week", agentId: "deal-momentum" },
    ],
  },
  // d40 — Boston Consulting Group · At risk (competitor shortlisted)
  "d40": {
    score: "at-risk",
    context: "Competitor shortlisted — touring paused",
    summary: "Prospect is actively evaluating a competing building with superior views and lower TI ask. Tour cadence has stopped.",
    signals: [
      "Prospect toured competitor twice in past 3 weeks",
      "No second tour scheduled at VTS Tower",
      "Broker confirmed competitor is shortlisted",
    ],
    recs: [
      { action: "Schedule executive-level meeting to differentiate value", urgency: "This week", agentId: "deal-momentum" },
      { action: "Revisit TI package to close gap with competitor", urgency: "This week", agentId: "deal-momentum" },
      { action: "Offer naming rights on floor as differentiator", urgency: "This week", agentId: "deal-momentum" },
    ],
  },

  // --- Empire State Building additions ---
  // d43 — Verizon · At risk (stalled 22d, board approval)
  "d43": {
    score: "at-risk",
    context: "Stalled 22 days — board approval pending",
    summary: "Renewal is stalled while Verizon awaits internal board sign-off. Budget window closes in Q3 and risk of rollover is high.",
    signals: [
      "No activity for 22 days since initial proposal",
      "Tenant rep confirmed board vote not scheduled",
      "Competing buildings are actively soliciting tenant",
    ],
    recs: [
      { action: "Escalate to ownership for direct C-suite outreach", urgency: "This week", agentId: "deal-momentum" },
      { action: "Provide timeline pressure data on space alternatives", urgency: "This week", agentId: "deal-momentum" },
    ],
  },
  // d44 — PVH Corp · Caution (no proposal yet)
  "d44": {
    score: "caution",
    context: "Touring complete — proposal not yet requested",
    summary: "Tours wrapped up 10 days ago but tenant has not requested a proposal. Engagement is passive and needs a push.",
    signals: [
      "Two tours completed; third not scheduled",
      "No RFP or proposal requested in 10 days post-tour",
      "Broker responsiveness has slowed",
    ],
    recs: [
      { action: "Proactively send proposal to maintain momentum", urgency: "This week", agentId: "deal-momentum" },
      { action: "Follow up with space planning study to deepen engagement", urgency: "This week", agentId: "deal-momentum" },
    ],
  },

  // --- Salesforce Tower additions ---
  // d50 — Lyft · Caution (stalled 12d)
  "d50": {
    score: "caution",
    context: "Stalled 12 days — decision on hold",
    summary: "Lyft paused touring activity citing internal reorganization. No next steps agreed upon after initial walkthrough.",
    signals: [
      "Last contact 12 days ago following first tour",
      "Tenant cited internal headcount uncertainty",
      "No follow-up tour or proposal requested",
    ],
    recs: [
      { action: "Send curated spec suite option to re-engage", urgency: "This week", agentId: "deal-momentum" },
      { action: "Propose shorter initial term to reduce commitment risk", urgency: "This week", agentId: "deal-momentum" },
    ],
  },

  // --- One Financial Plaza additions ---
  // d55 — State Street · At risk (budget cuts, possible footprint reduction)
  "d55": {
    score: "at-risk",
    context: "Budget cuts — possible 20% footprint reduction",
    summary: "State Street is in renewal discussions but internal cost initiatives may reduce their required space by 20%, jeopardizing deal economics.",
    signals: [
      "Tenant confirmed budget review underway",
      "Initial renewal proposal significantly above budget expectation",
      "Space committee recommending hybrid-first policy reducing needs",
    ],
    recs: [
      { action: "Model reduced-footprint scenario to retain tenant at lower sf", urgency: "This week", agentId: "deal-momentum" },
      { action: "Prepare tiered proposal options by square footage", urgency: "This week", agentId: "deal-momentum" },
    ],
  },
  // d56 — Liberty Mutual · Caution (stalled 16d)
  "d56": {
    score: "caution",
    context: "Stalled 16 days at LOI",
    summary: "LOI submitted but Liberty Mutual legal team has not responded. Internal approval process appears slower than anticipated.",
    signals: [
      "LOI sent 16 days ago with no redlines returned",
      "Tenant rep citing internal review backlog",
      "No scheduled call or meeting on calendar",
    ],
    recs: [
      { action: "Request status call with tenant's legal and real estate team", urgency: "This week", agentId: "deal-momentum" },
      { action: "Set hard expiration on LOI terms to create urgency", urgency: "This week", agentId: "deal-momentum" },
    ],
  },
  // d57 — John Hancock · At risk (stalled 21d)
  "d57": {
    score: "at-risk",
    context: "Stalled 21 days — no contact after tour",
    summary: "Prospect went cold after an initial tour 21 days ago. No proposal has been requested and broker has become difficult to reach.",
    signals: [
      "No outreach or follow-up in 21 days",
      "Broker not returning calls",
      "One Financial Plaza not on prospect's shortlist per market intel",
    ],
    recs: [
      { action: "Escalate to senior broker relationship contact", urgency: "This week", agentId: "deal-momentum" },
      { action: "Submit unsolicited spec suite proposal with creative terms", urgency: "This week", agentId: "deal-momentum" },
    ],
  },

  // --- Willis Tower additions ---
  // d62 — United Airlines · At risk (cost program, stalled 24d)
  "d62": {
    score: "at-risk",
    context: "Cost-reduction program — stalled 24 days",
    summary: "United Airlines is undergoing a corporate cost-reduction program that has frozen real estate decisions. Renewal is at risk of lapsing.",
    signals: [
      "No activity in 24 days following proposal submission",
      "Tenant confirmed cost freeze affecting all capital commitments",
      "Space consolidation to other Chicago locations is under review",
    ],
    recs: [
      { action: "Propose phased renewal with flexible break clause", urgency: "This week", agentId: "deal-momentum" },
      { action: "Model blend-and-extend option to reduce near-term cash impact", urgency: "This week", agentId: "deal-momentum" },
    ],
  },
  // d63 — Exelon · At risk (competitor building)
  "d63": {
    score: "at-risk",
    context: "Competitor building actively competing",
    summary: "Exelon is deep in LOI discussions but has revealed it is simultaneously pursuing a competing building with a more aggressive TI package.",
    signals: [
      "Prospect toured competitor building twice in last 3 weeks",
      "Broker confirmed competing LOI submitted",
      "Willis Tower TI offer is $15/sf below competitor",
    ],
    recs: [
      { action: "Close TI gap with targeted improvement to offer", urgency: "This week", agentId: "deal-momentum" },
      { action: "Leverage Willis Tower amenity advantage in executive presentation", urgency: "This week", agentId: "deal-momentum" },
    ],
  },
  // d64 — Hyatt Hotels · Caution (stalled 13d)
  "d64": {
    score: "caution",
    context: "Stalled 13 days after expansion tour",
    summary: "Post-tour follow-up has been unresponsive. Hyatt's real estate team appears to be evaluating multiple options without committing.",
    signals: [
      "Last contact 13 days ago following expansion tour",
      "No proposal requested despite expressed interest",
      "Competing submarkets also under evaluation",
    ],
    recs: [
      { action: "Send targeted proposal with expansion options and phasing", urgency: "This week", agentId: "deal-momentum" },
      { action: "Offer test-fit at no charge to advance decision", urgency: "This week", agentId: "deal-momentum" },
    ],
  },
  // d65 — Aon · Caution (stalled 17d)
  "d65": {
    score: "caution",
    context: "Stalled 17 days — renewal proposal pending internal review",
    summary: "Renewal proposal is with Aon's internal real estate committee but no feedback has been received in 17 days.",
    signals: [
      "Proposal submitted 17 days ago; no response",
      "Committee meeting reportedly scheduled but not confirmed",
      "Broker flagged competing buildings circling the tenant",
    ],
    recs: [
      { action: "Request status update call within the week", urgency: "This week", agentId: "deal-momentum" },
      { action: "Prepare updated market comp analysis to support pricing", urgency: "This week", agentId: "deal-momentum" },
    ],
  },

  // --- 30 Hudson Yards additions ---
  // d69 — Apollo Global · At risk (competitor)
  "d69": {
    score: "at-risk",
    context: "Competitor building under active evaluation",
    summary: "Apollo is evaluating an adjacent Hudson Yards tower with lower base rent and more aggressive TI. Deal is at risk of being lost.",
    signals: [
      "Broker confirmed Apollo has toured two other Hudson Yards buildings",
      "Competing LOI rumored in market",
      "Apollo rep has not responded to latest proposal follow-up",
    ],
    recs: [
      { action: "Pursue direct outreach to Apollo CFO", urgency: "This week", agentId: "deal-momentum" },
      { action: "Prepare competitive counter with enhanced concessions", urgency: "This week", agentId: "deal-momentum" },
    ],
  },
  // d70 — KKR · At risk (stalled 19d)
  "d70": {
    score: "at-risk",
    context: "Stalled 19 days — LOI terms under internal debate",
    summary: "KKR submitted redlines on the LOI 19 days ago but internal alignment issues have stalled execution. Risk of deal timing out.",
    signals: [
      "LOI redlines received; counter not yet sent",
      "KKR legal team and real estate team reportedly misaligned",
      "Market timing pressure — competing tenants eyeing same floors",
    ],
    recs: [
      { action: "Set firm deadline on LOI counter to maintain leverage", urgency: "This week", agentId: "deal-momentum" },
      { action: "Escalate to KKR real estate decision-maker directly", urgency: "This week", agentId: "deal-momentum" },
    ],
  },
  // d71 — Blackstone · Caution (stalled 15d)
  "d71": {
    score: "caution",
    context: "Stalled 15 days post-tour",
    summary: "Blackstone showed strong interest during touring but has gone quiet. No proposal has been requested in 15 days.",
    signals: [
      "Tour completed with positive feedback; no follow-up in 15 days",
      "Broker not actively pushing deal",
      "Deal not on Blackstone's internal priority list per intel",
    ],
    recs: [
      { action: "Arrange exclusive floor access with building amenity tour", urgency: "This week", agentId: "deal-momentum" },
      { action: "Submit proactive proposal to re-engage", urgency: "This week", agentId: "deal-momentum" },
    ],
  },

  // --- One World Trade Center additions ---
  // d75 — Conde Nast WTC · At risk (budget cuts)
  "d75": {
    score: "at-risk",
    context: "Content budget cuts threatening renewal size",
    summary: "Conde Nast is facing significant media industry headwinds and may reduce its footprint by up to 25% at renewal.",
    signals: [
      "Tenant confirmed editorial headcount reductions underway",
      "Broker flagged possible downsizing by 40,000–50,000 sf",
      "Renewal proposal above tenant's revised budget target",
    ],
    recs: [
      { action: "Model downsized renewal scenario to retain tenant at reduced sf", urgency: "This week", agentId: "deal-momentum" },
      { action: "Explore subleasing of excess space to offset deal economics", urgency: "This week", agentId: "deal-momentum" },
    ],
  },
  // d76 — Spotify WTC · Caution (stalled 11d)
  "d76": {
    score: "caution",
    context: "Stalled 11 days after first tour",
    summary: "Spotify toured One WTC but has not followed up. Decision timeline is unclear and engagement has slowed.",
    signals: [
      "Tour completed; no second tour or proposal request in 11 days",
      "Broker cited Spotify's internal real estate team restructuring",
      "Two competing buildings also under consideration",
    ],
    recs: [
      { action: "Follow up with personalized view-of-downtown pitch", urgency: "This week", agentId: "deal-momentum" },
      { action: "Propose informal roundtable with building management", urgency: "This week", agentId: "deal-momentum" },
    ],
  },

  // --- Transamerica Pyramid additions ---
  // d82 — DocuSign · At risk (remote work reducing footprint)
  "d82": {
    score: "at-risk",
    context: "Remote-first policy cutting required footprint",
    summary: "DocuSign's shift to a remote-first policy means renewal is likely to happen at a significantly reduced square footage.",
    signals: [
      "Tenant announced remote-first policy for most roles",
      "Current 41,000 sf likely targeted for reduction to 20–25,000 sf",
      "Renewal NER negotiation far below budgeted rate",
    ],
    recs: [
      { action: "Model reduced-footprint renewal to retain tenant", urgency: "This week", agentId: "deal-momentum" },
      { action: "Explore backfill options for vacated floors proactively", urgency: "This week", agentId: "deal-momentum" },
    ],
  },
  // d83 — Levi Strauss · Caution (stalled 14d)
  "d83": {
    score: "caution",
    context: "Stalled 14 days at LOI",
    summary: "LOI terms are agreed in principle but execution has stalled while Levi's internal approvals are pending.",
    signals: [
      "LOI agreed verbally; not yet signed after 14 days",
      "Internal approval committee meeting delayed twice",
      "Broker confident on deal but cannot force timeline",
    ],
    recs: [
      { action: "Set LOI expiration to drive execution", urgency: "This week", agentId: "deal-momentum" },
      { action: "Schedule weekly check-in call with tenant and broker", urgency: "This week", agentId: "deal-momentum" },
    ],
  },
  // d84 — Twitter/X Pyramid · At risk (cost cuts)
  "d84": {
    score: "at-risk",
    context: "Cost-cutting may force relocation to cheaper space",
    summary: "Twitter/X is evaluating cheaper alternatives as part of ongoing cost reduction. Existing space may be abandoned or significantly downsized.",
    signals: [
      "Tenant on record with CFO directive to cut real estate costs 40%",
      "Space is above-market; tenant seeking sub-market alternatives",
      "No renewal discussion initiated despite lease expiring in 9 months",
    ],
    recs: [
      { action: "Proactively offer below-market renewal to preempt departure", urgency: "This week", agentId: "deal-momentum" },
      { action: "Prepare backfill strategy for high-probability vacancy", urgency: "This week", agentId: "deal-momentum" },
    ],
  },

  // --- 200 Berkeley Street additions ---
  // d89 — Vertex Pharmaceuticals · At risk (budget, reduced sf)
  "d89": {
    score: "at-risk",
    context: "Budget cut — reconsidering square footage",
    summary: "Vertex is revisiting its space requirement after a budget revision, potentially reducing the deal size by 30%.",
    signals: [
      "CFO directive to reduce real estate spend by 30%",
      "Broker flagged Vertex may need only 35,000–40,000 sf",
      "NER expectation significantly below ask",
    ],
    recs: [
      { action: "Prepare tiered proposal at multiple size options", urgency: "This week", agentId: "deal-momentum" },
      { action: "Offer phased expansion rights to lock in smaller initial deal", urgency: "This week", agentId: "deal-momentum" },
    ],
  },
  // d90 — Rapid7 · Caution (stalled 16d)
  "d90": {
    score: "caution",
    context: "Stalled 16 days at LOI",
    summary: "Rapid7's legal team is reviewing LOI terms but has not returned redlines. Momentum risk is building.",
    signals: [
      "LOI under internal review for 16 days",
      "No redlines or counter received",
      "Competing landlord rumored to be pursuing tenant",
    ],
    recs: [
      { action: "Request status call with Rapid7 legal and real estate", urgency: "This week", agentId: "deal-momentum" },
      { action: "Set LOI expiration date to create urgency", urgency: "This week", agentId: "deal-momentum" },
    ],
  },
  // d91 — Brightcove · At risk (stalled 22d)
  "d91": {
    score: "at-risk",
    context: "Stalled 22 days — no contact after tour",
    summary: "Brightcove has been unresponsive for 22 days following their tour. No proposal requested and broker has not followed up.",
    signals: [
      "No outreach in 22 days post-tour",
      "Broker difficult to reach",
      "Competing Seaport District buildings actively targeting tenant",
    ],
    recs: [
      { action: "Send speculative proposal to re-engage", urgency: "This week", agentId: "deal-momentum" },
      { action: "Escalate to landlord rep for direct broker relationship call", urgency: "This week", agentId: "deal-momentum" },
    ],
  },
  // d92 — DraftKings · Caution (stalled 13d)
  "d92": {
    score: "caution",
    context: "Stalled 13 days — proposal not yet countered",
    summary: "DraftKings received a proposal 13 days ago but has not responded. Legal is reportedly reviewing but no feedback has come through.",
    signals: [
      "Proposal sent 7/3; no counter in 13 days",
      "Tenant rep says team is reviewing but timeline unclear",
      "Competing landlord submitted unsolicited proposal",
    ],
    recs: [
      { action: "Follow up with updated test-fit and design concepts", urgency: "This week", agentId: "deal-momentum" },
      { action: "Offer to host tenant's team for amenity preview", urgency: "This week", agentId: "deal-momentum" },
    ],
  },

  // --- One Peachtree Center additions ---
  // d96 — Cox Enterprises · At risk (footprint reduction)
  "d96": {
    score: "at-risk",
    context: "Consolidating — targeting 30% footprint reduction",
    summary: "Cox is consolidating Atlanta offices and targeting a 30% reduction in square footage at renewal, which significantly impacts NER and NPV.",
    signals: [
      "Cox confirmed consolidation to one primary Atlanta location",
      "Renewal proposal premised on 78,000 sf; tenant wants 55,000 sf",
      "Alternative buildings offering more aggressive TI for smaller footprint",
    ],
    recs: [
      { action: "Model 55,000 sf renewal scenario with enhanced TI", urgency: "This week", agentId: "deal-momentum" },
      { action: "Prepare backfill strategy for 23,000 sf vacated space", urgency: "This week", agentId: "deal-momentum" },
    ],
  },
  // d97 — Equifax · At risk (stalled 20d)
  "d97": {
    score: "at-risk",
    context: "Stalled 20 days — LOI execution delayed",
    summary: "Equifax LOI has been verbally agreed but execution is stalled due to internal procurement delays.",
    signals: [
      "LOI agreed 20 days ago; not yet signed",
      "Procurement review process adding unexpected delays",
      "Broker expressed concern about deal losing momentum",
    ],
    recs: [
      { action: "Request direct meeting with Equifax procurement team", urgency: "This week", agentId: "deal-momentum" },
      { action: "Offer LOI signing incentive tied to execution date", urgency: "This week", agentId: "deal-momentum" },
    ],
  },
  // d98 — Delta Air Lines · Caution (stalled 14d)
  "d98": {
    score: "caution",
    context: "Stalled 14 days post-tour",
    summary: "Delta toured the expansion space but has not followed up with a proposal request. Decision timeline has drifted.",
    signals: [
      "Tour completed; no proposal request in 14 days",
      "Delta real estate team cited Q3 budget cycle as factor",
      "Alternative Buckhead space also under evaluation",
    ],
    recs: [
      { action: "Proactively submit proposal to advance timeline", urgency: "This week", agentId: "deal-momentum" },
      { action: "Offer to schedule space planning study at no cost", urgency: "This week", agentId: "deal-momentum" },
    ],
  },
  // d99 — Invesco · Caution (stalled 11d)
  "d99": {
    score: "caution",
    context: "Stalled 11 days — proposal under internal review",
    summary: "Invesco's real estate committee is reviewing the proposal but no feedback has been provided in 11 days.",
    signals: [
      "Proposal submitted 7/4; no response as of today",
      "Internal committee review cycle typically 2 weeks",
      "Broker confirmed Invesco is not urgently motivated",
    ],
    recs: [
      { action: "Schedule committee presentation to accelerate review", urgency: "This week", agentId: "deal-momentum" },
      { action: "Provide market urgency data on comparable spaces", urgency: "This week", agentId: "deal-momentum" },
    ],
  },

  // --- Two Union Square additions ---
  // d103 — Alaska Airlines · At risk (downsizing post-merger)
  "d103": {
    score: "at-risk",
    context: "Post-merger downsizing — cutting 20% of footprint",
    summary: "Alaska Airlines is rationalizing real estate post-merger and plans to reduce Seattle footprint by 20%, putting renewal economics at significant risk.",
    signals: [
      "Merger integration team has mandated real estate consolidation",
      "Renewal proposal at full 54,000 sf is not viable for tenant",
      "Alternative sublease options in building under tenant evaluation",
    ],
    recs: [
      { action: "Model 43,000 sf renewal with enhanced incentive package", urgency: "This week", agentId: "deal-momentum" },
      { action: "Explore partnership with smaller tenant to backfill surplus", urgency: "This week", agentId: "deal-momentum" },
    ],
  },
  // d104 — F5 Networks · Caution (stalled 15d)
  "d104": {
    score: "caution",
    context: "Stalled 15 days — LOI terms not yet agreed",
    summary: "F5 and landlord are close on LOI terms but a sticking point on termination rights has stalled agreement for 15 days.",
    signals: [
      "LOI terms 90% agreed; termination rights clause is blocker",
      "Broker flagged potential timeline risk if not resolved this week",
      "F5 legal team has limited bandwidth due to other transactions",
    ],
    recs: [
      { action: "Propose modified termination clause with fee structure", urgency: "This week", agentId: "deal-momentum" },
      { action: "Arrange call between both legal teams to close outstanding items", urgency: "This week", agentId: "deal-momentum" },
    ],
  },
  // d105 — Weyerhaeuser · At risk (stalled 23d)
  "d105": {
    score: "at-risk",
    context: "Stalled 23 days — no contact after tour",
    summary: "Weyerhaeuser went dark after an initial tour 23 days ago. No broker follow-up and market intel suggests they may be looking at suburban options.",
    signals: [
      "No contact in 23 days post-tour",
      "Broker has not returned calls",
      "Market intel suggests suburban Bellevue buildings also in consideration",
    ],
    recs: [
      { action: "Reach out via alternate Weyerhaeuser contact to gauge interest", urgency: "This week", agentId: "deal-momentum" },
      { action: "Submit spec proposal highlighting transit access vs. suburban alternative", urgency: "This week", agentId: "deal-momentum" },
    ],
  },
}

export function getDealHealth(dealId: string | undefined, stage: StageValue, defaultScore: HealthScore = "on-track"): HealthEntry & { label: string; cls: string; textCls: string; bgCls: string } {
  const override = dealId ? HEALTH_OVERRIDES[dealId] : undefined
  const entry = override ?? HEALTH_BY_STAGE[stage][defaultScore]
  const scoreCfg = HEALTH_SCORE_CONFIG[entry.score]
  return { ...entry, label: scoreCfg.label, cls: scoreCfg.cls, textCls: scoreCfg.textCls, bgCls: scoreCfg.bgCls }
}

// ─── Main component ───────────────────────────────────────────────────────────

interface DealProfileProps {
  deal: Deal
  onBack: () => void
  status?: DealStatus
  onStatusChange?: (s: DealStatus) => void
  initialTab?: string
  onAddProposal?: () => void
}

export function DealProfile({ deal, onBack: _onBack, status: statusProp, onStatusChange, initialTab, onAddProposal }: DealProfileProps) {
  const [stage, setStage]           = React.useState<StageValue>(deal.stage as StageValue)
  const [internalStatus, setInternalStatus] = React.useState<DealStatus>(deal.status as DealStatus)
  const status    = statusProp ?? internalStatus
  const _setStatus = onStatusChange ?? setInternalStatus; void _setStatus
  const [tab, setTab]               = React.useState(initialTab ?? "info")
  const [rightTab, setRightTab]     = React.useState("updates")
  const [healthOpen, setHealthOpen] = React.useState(false)
  const [rightCollapsed, setRightCollapsed] = React.useState(false)
  const stageIdx = ALL_STAGES.indexOf(stage)

  const healthCfg = getDealHealth(deal.id, stage)

  return (
    <div className="flex flex-col gap-4 mt-4 pb-8">

      {/* Deal health modal */}
      <DialogPrimitive.Root open={healthOpen} onOpenChange={setHealthOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <DialogPrimitive.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border-transparent bg-sidebar-accent p-6 shadow-xl transition-all duration-150 data-ending-style:opacity-0 data-ending-style:scale-95 data-starting-style:opacity-0 data-starting-style:scale-95">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/70 mb-1">VTS agents</p>
                <div className="flex items-baseline gap-3">
                  <DialogPrimitive.Title className="text-xl font-semibold text-sidebar-foreground">Deal health</DialogPrimitive.Title>
                  <span className={cn("text-xl font-semibold", healthCfg.textCls)}>{healthCfg.label}</span>
                </div>
              </div>
              <DialogPrimitive.Close render={<Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 -mt-1 -mr-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-foreground/10"><X className="h-4 w-4" /></Button>} />
            </div>
            <div className="rounded-lg px-3 py-2.5 bg-sidebar-foreground/10 flex items-start gap-2.5 mb-5">
              <HeartPulse className="h-4 w-4 shrink-0 text-sidebar-primary mt-0.5" />
              <p className="text-sm leading-snug text-sidebar-foreground/80">{healthCfg.summary}</p>
            </div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/50 mb-3">Signals</p>
            <div className="flex flex-col gap-3">
              {healthCfg.signals.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-sidebar-foreground/80 leading-snug">
                  <Dot className="h-4 w-4 text-sidebar-foreground/40 shrink-0 mt-0.5" />
                  {s}
                </div>
              ))}
            </div>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* Financial KPI bar */}
      <FinancialBar deal={deal} stageIdx={stageIdx} onHealthClick={() => setHealthOpen(true)} />

      {/* Stage journey */}
      <StageJourneyBar currentStage={stage} onChange={s => { setStage(s); setRightTab("updates") }} />

      {/* Agent strip */}

      {/* Main content grid */}
      <div className="flex gap-4 items-stretch">

        {/* Left col: Info / Proposals / Encumbrances */}
        <div className="flex-[5] min-w-0 flex flex-col gap-4">
          <div className={cn(cardBase, "flex-1")}>
            <Tabs value={tab} onValueChange={v => setTab(v)} className="w-full">
              <TabsList variant="line" className="w-full mb-5 border-b border-border rounded-none bg-transparent p-0 h-auto gap-0 justify-start">
                {[
                  { value: "info",         label: "Info" },
                  { value: "proposals",    label: "Proposals" },
                  { value: "encumbrances", label: "Encumbrances", badge: DEAL_ENCUMBRANCES[deal.id]?.length, badgeCls: "bg-destructive text-primary-foreground" },
                ].map(({ value, label, badge, badgeCls }) => (
                  <TabsTrigger key={value} value={value} className="rounded-none !bg-transparent border-b-2 border-transparent data-active:border-primary data-active:!text-primary data-active:font-medium hover:!bg-transparent hover:text-foreground !shadow-none px-4 pb-2.5 pt-0 text-sm flex-none -mb-px">
                    {label}
                    {badge ? <span className={cn("ml-1 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-bold", badgeCls ?? "bg-destructive text-primary-foreground")}>{badge}</span> : null}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="info"><OverviewTab deal={deal} stageIdx={stageIdx} /></TabsContent>
              <TabsContent value="proposals"><ProposalsTab deal={deal} stageIdx={stageIdx} onAddProposal={onAddProposal} /></TabsContent>
              <TabsContent value="encumbrances"><EncumbrancesTab deal={deal} /></TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right col: Updates / Tasks / Docs / Reminders */}
        <div className={cn("flex flex-col gap-4 transition-all duration-300", rightCollapsed ? "w-14 shrink-0" : "flex-[3]")}>
          <div className={cn(cardBase, "overflow-hidden h-full", rightCollapsed && "!px-3 !py-3")}>
            <Tabs value={rightTab} onValueChange={v => setRightTab(v)} className="w-full">
              {/* Header: toggle left of tabs, always visible */}
              <div className="flex items-center border-b border-border mb-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger render={<div className="shrink-0 pb-1 mr-1" />}>
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => setRightCollapsed(c => !c)}
                        className="h-6 w-6 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <ChevronRight className={cn("h-3 w-3 transition-transform duration-300", rightCollapsed && "rotate-180")} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs font-medium">
                      {rightCollapsed ? "Expand" : "Collapse"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {!rightCollapsed && (
                  <TabsList variant="line" className="flex-1 rounded-none bg-transparent p-0 h-auto gap-0 justify-start">
                    {[
                      { value: "updates",   label: "Updates" },
                      { value: "tasks",     label: "Tasks", badge: STAGE_TASKS[stage]?.filter(t => !t.done).length || undefined, badgeCls: "bg-primary text-primary-foreground" },
                      { value: "documents", label: "Docs" },
                      { value: "reminders", label: "Reminders" },
                    ].map(({ value, label, badge, badgeCls }) => (
                      <TabsTrigger key={value} value={value} className="rounded-none !bg-transparent border-b-2 border-transparent data-active:border-primary data-active:!text-primary data-active:font-medium hover:!bg-transparent hover:text-foreground !shadow-none px-3 pb-2.5 pt-0 text-sm flex-none -mb-px">
                        {label}
                        {badge ? <span className={cn("ml-1 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-bold", badgeCls ?? "bg-destructive text-primary-foreground")}>{badge}</span> : null}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                )}
              </div>
              {!rightCollapsed && (
                <>
                  <TabsContent value="updates"><ActivityFeed deal={deal} stage={stage} /></TabsContent>
                  <TabsContent value="tasks"><TasksTab stage={stage} status={status} dealId={deal.id} /></TabsContent>
                  <TabsContent value="documents"><DocumentsTab stage={stage} /></TabsContent>
                  <TabsContent value="reminders"><p className="text-sm text-muted-foreground py-8 text-center">No reminders set.</p></TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </div>

      </div>
    </div>
  )
}
