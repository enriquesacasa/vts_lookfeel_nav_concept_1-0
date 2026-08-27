import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { FILTER_TAB_GROUP_CLS, FILTER_TAB_ITEM_CLS } from "@/components/filter-chip"
import {
  ChevronRight, ChevronDown, Check, FileText, Download, Send,
  Building2, User, MapPin, Ruler, Tag, Calendar,
  CheckCircle2, Clock, AlertTriangle, HeartPulse, Zap, TrendingUp,
  TrendingDown, Minus, ExternalLink, Bot, ChevronUp,
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
  "Amazon.com":            "/vts_lookfeel_nav_concept_1-0/logos/amazon.png",
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

type StageValue = "Inquiry" | "Touring" | "Proposal" | "LOI" | "Legal" | "Lease Out" | "Executed"
type DealStatus = "active" | "stalled" | "at-risk" | "executed"

const ALL_STAGES: StageValue[] = ["Inquiry", "Touring", "Proposal", "LOI", "Legal", "Lease Out", "Executed"]

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<DealStatus, { label: string; Icon: React.ElementType; cls: string; dot: string }> = {
  active:    { label: "Active",   Icon: CheckCircle2,  cls: "text-success bg-success/10 border-success/20",         dot: "bg-success" },
  stalled:   { label: "Stalled",  Icon: Clock,         cls: "text-warning bg-warning/10 border-warning/20",          dot: "bg-warning" },
  "at-risk": { label: "At risk",  Icon: AlertTriangle, cls: "text-destructive bg-destructive/10 border-destructive/20", dot: "bg-destructive" },
  executed:  { label: "Executed", Icon: CheckCircle2,  cls: "text-success bg-success/10 border-success/20",         dot: "bg-success" },
}

function StatusBadge({ status, onChange }: { status: DealStatus; onChange: (s: DealStatus) => void }) {
  const [open, setOpen] = React.useState(false)
  const cfg = STATUS_CONFIG[status]
  const options: DealStatus[] = ["active", "stalled", "at-risk"]
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <span className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-80 cursor-pointer",
          cfg.cls
        )}>
          <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
          {cfg.label}
          <ChevronDown className="h-3 w-3 opacity-60" />
        </span>
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
    <div className={cn(cardBase, "py-4 overflow-x-auto")}>
      <div className="flex items-center min-w-max">
        {ALL_STAGES.map((stage, i) => {
          const isPast   = i < currentIdx
          const isActive = stage === currentStage
          const isFuture = i > currentIdx
          return (
            <React.Fragment key={stage}>
              {i > 0 && <div className={cn("flex-1 h-px min-w-[20px] mx-1", isPast ? "bg-primary/60" : "bg-border")} />}
              <button
                onClick={() => onChange(stage)}
                className="flex flex-col items-center gap-1.5 shrink-0 group"
              >
                <div className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center border-2 transition-all group-hover:scale-110",
                  isActive && "bg-primary border-primary shadow-sm shadow-primary/30",
                  isPast   && "bg-primary/15 border-primary/60",
                  isFuture && "bg-muted border-border group-hover:border-muted-foreground",
                )}>
                  {isPast   && <Check className="h-3 w-3 text-primary" />}
                  {isActive && <span className="h-2 w-2 rounded-full bg-primary-foreground" />}
                </div>
                <span className={cn(
                  "text-[10px] font-medium whitespace-nowrap transition-colors",
                  isActive && "text-primary font-semibold",
                  isPast   && "text-muted-foreground",
                  isFuture && "text-muted-foreground/40 group-hover:text-muted-foreground",
                )}>
                  {stage}
                </span>
              </button>
            </React.Fragment>
          )
        })}
      </div>
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

function KpiCell({ label, value, sub, trend }: { label: string; value: string; sub?: string; trend?: "up" | "down" | "flat" }) {
  const Icon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  const cls = trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground"
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold text-foreground leading-none">{value}</p>
      {sub && (
        <div className={cn("flex items-center gap-1 text-[11px] font-medium", cls)}>
          {trend && trend !== "flat" && <Icon className="h-3 w-3" />}
          <span>{sub}</span>
        </div>
      )}
    </div>
  )
}

function FinancialBar({ deal, stageIdx }: { deal: Deal; stageIdx: number }) {
  const nerDelta = delta(deal.ner, deal.budgetNer)
  const noiDelta = delta(deal.noi, deal.budgetNoi)
  const tlv = deal.ner && deal.term ? (deal.ner * deal.sf * (deal.term / 12) / 1_000_000) : null
  const daysOpen = Math.floor((Date.now() - new Date(deal.lastUpdated).getTime()) / 86_400_000)
  const tiCost = stageIdx >= 2 ? deal.sf * 80 : null

  return (
    <div className={cn(cardBase, "flex flex-wrap gap-x-8 gap-y-4 py-4")}>
      {deal.budgetNer > 0 && (
        <KpiCell
          label="NER"
          value={deal.ner ? `$${deal.ner.toFixed(2)}` : "—"}
          sub={deal.ner ? `${nerDelta.pct} vs budget` : `Budget $${deal.budgetNer.toFixed(2)}`}
          trend={deal.ner ? nerDelta.dir : undefined}
        />
      )}
      {deal.budgetNoi > 0 && (
        <KpiCell
          label="Annual NOI"
          value={deal.noi ? `$${(deal.noi / 1_000_000).toFixed(2)}M` : "—"}
          sub={deal.noi ? `${noiDelta.pct} vs budget` : `Budget $${(deal.budgetNoi / 1_000_000).toFixed(2)}M`}
          trend={deal.noi ? noiDelta.dir : undefined}
        />
      )}
      {tlv && (
        <KpiCell label="Total lease value" value={`$${tlv.toFixed(1)}M`} sub={`${deal.term} months`} />
      )}
      {tiCost && (
        <KpiCell label="TI investment" value={`$${(tiCost / 1_000_000).toFixed(2)}M`} sub="$80/sf est." />
      )}
      <KpiCell label="Days open" value={`${daysOpen}d`} sub={`Last update ${deal.lastUpdated}`} />
      {deal.sf && <KpiCell label="Size" value={`${deal.sf.toLocaleString()} sf`} sub={deal.dealType} />}
    </div>
  )
}

// ─── Agent strip ──────────────────────────────────────────────────────────────

const AGENT_INFO: Record<string, { name: string; tagline: string }> = {
  "deal-capture":        { name: "Deal Capture",        tagline: "Capture every deal signal automatically" },
  "deal-intelligence":   { name: "Deal Intelligence",   tagline: "Build the full picture before anyone has to ask" },
  "space-match":         { name: "Space Match",         tagline: "Find the right space for every requirement" },
  "tour-agent":          { name: "Tour Coordinator",    tagline: "Schedule and log every tour automatically" },
  "deal-health":         { name: "Deal Health",         tagline: "Know the strength of every deal" },
  "proposal-builder":    { name: "Proposal Builder",    tagline: "Build proposals from deal data automatically" },
  "scenario-modeling":   { name: "Scenario Modeling",   tagline: "Model the deal before committing" },
  "approval-readiness":  { name: "Approval Readiness",  tagline: "Turn a proposal into a decision-ready package" },
  "negotiation-guidance":{ name: "Negotiation Guidance",tagline: "Help teams resolve open terms faster" },
  "counsel-handoff":     { name: "Counsel Handoff",     tagline: "Give counsel a package, not a blank page" },
  "deal-momentum":       { name: "Deal Momentum",       tagline: "Keep stalled deals moving" },
  "execution-management":{ name: "Execution Management",tagline: "Take the deal from final terms through signature" },
  "operational-handoff": { name: "Operational Handoff", tagline: "Turn the executed lease into work automatically" },
  "data-writeback":      { name: "Data Writeback",      tagline: "Make execution the end of data entry" },
}

const STAGE_DEFAULT_AGENTS: Record<StageValue, string[]> = {
  "Inquiry":   ["deal-capture", "deal-intelligence", "deal-health"],
  "Touring":   ["space-match", "tour-agent", "deal-intelligence", "deal-health"],
  "Proposal":  ["proposal-builder", "scenario-modeling", "deal-momentum", "deal-health"],
  "LOI":       ["negotiation-guidance", "counsel-handoff", "approval-readiness", "deal-momentum"],
  "Legal":     ["counsel-handoff", "negotiation-guidance", "execution-management"],
  "Lease Out": ["execution-management", "approval-readiness"],
  "Executed":  ["operational-handoff", "data-writeback"],
}

// Featured agents per deal — one is the spotlight
const DEAL_AGENT_FOCUS: Record<string, { featuredId: string; insight: string }> = {
  "d00": {
    featuredId: "deal-capture",
    insight: "Parsed inbound email from Sarah Okonkwo at CBRE. Extracted tenant, space, size, and rep in 4 seconds. Deal record created and staged at Inquiry.",
  },
  "d08": {
    featuredId: "space-match",
    insight: "Ranked 14 available floors across 3 assets. Suite 2100 flagged as non-obvious fit — uninterrupted 54,000 sf plate matching Morgan Stanley's open-plan requirement and no column interference.",
  },
  "d10": {
    featuredId: "deal-momentum",
    insight: "Stalled 26 days. Cost of delay: $3,705/day ($96,330 total). Board approval is the blocker. Two follow-ups ready — one to Paul Simmons, one CFO escalation. Ready to send on your approval.",
  },
  "d09": {
    featuredId: "counsel-handoff",
    insight: "Extracted 18 LOI terms with citations. Flagged 2 unusual positions: TI escalation clause (non-standard) and subleasing rights at 75% (market is 85%). First-draft legal brief assembled and ready to route.",
  },
  "d20": {
    featuredId: "execution-management",
    insight: "Signatory verified: Luis Garcia (EVP, authorized >$15M). Execution package assembled: lease + 4 exhibits. Tracking 2 outstanding signatures — Salesforce CFO counter and Landlord VP. ETA: Dec 15.",
  },
  "d22": {
    featuredId: "data-writeback",
    insight: "Extracted 24 final terms from the Goldman Sachs executed lease. Written to VTS deal record: ✓. Financial model sync: ✓. Reporting fields: ✓. Zero discrepancies detected across all systems.",
  },
}

function AgentStrip({ deal, stage }: { deal: Deal; stage: StageValue }) {
  const focus = DEAL_AGENT_FOCUS[deal.id]
  const agentIds = STAGE_DEFAULT_AGENTS[stage] ?? []

  return (
    <div className="flex flex-col gap-3">
      {/* Featured agent spotlight */}
      {focus && (
        <div className={cn(cardBase, "bg-primary/5 border-primary/20 flex flex-col sm:flex-row gap-4")}>
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mt-0.5">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-base font-semibold text-primary">{AGENT_INFO[focus.featuredId]?.name}</p>
                <Badge variant="outline" className="text-[10px] text-primary border-primary/30 bg-primary/5">Active on this deal</Badge>
              </div>
              <p className="text-sm text-foreground/80 mt-1 leading-relaxed">{focus.insight}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5 self-start border-primary/30 text-primary hover:bg-primary/10"
            onClick={() => { window.location.hash = "#/agents" }}
          >
            View agent
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Supporting agents row */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {agentIds.filter(id => id !== focus?.featuredId).map(id => {
          const info = AGENT_INFO[id]
          if (!info) return null
          return (
            <button
              key={id}
              onClick={() => { window.location.hash = "#/agents" }}
              className={cn(
                "flex items-center gap-2 shrink-0 rounded-xl border border-border bg-card px-3 py-2",
                "hover:bg-muted/60 hover:border-border transition-colors text-left"
              )}
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted/60">
                <Bot className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground whitespace-nowrap">{info.name}</p>
                <p className="text-[10px] text-muted-foreground whitespace-nowrap max-w-[160px] truncate">{info.tagline}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Field row ────────────────────────────────────────────────────────────────

function FieldRow({ icon: Icon, label, children }: { icon?: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
      <div className="w-4 shrink-0 mt-0.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
      </div>
      <span className="text-xs text-muted-foreground w-32 shrink-0 pt-px">{label}</span>
      <div className="text-sm text-foreground font-medium flex-1">{children}</div>
    </div>
  )
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ deal, stageIdx }: { deal: Deal; stageIdx: number }) {
  return (
    <div>
      <FieldRow icon={User}      label="Tenant">{deal.tenant}</FieldRow>
      <FieldRow icon={Building2} label="Asset">{deal.asset}</FieldRow>
      <FieldRow icon={MapPin}    label="Space">{deal.space}</FieldRow>
      <FieldRow icon={Ruler}     label="Size">{deal.sf.toLocaleString()} sf</FieldRow>
      <FieldRow icon={Tag}       label="Type">{deal.dealType}</FieldRow>
      {deal.contact && <FieldRow icon={User} label="Contact">{deal.contact}</FieldRow>}
      {deal.term && <FieldRow icon={Calendar} label="Term">{deal.term} months ({(deal.term / 12).toFixed(0)} yrs)</FieldRow>}
      <FieldRow label="Source">Email inbound · CBRE</FieldRow>

      {/* Requirements section */}
      <div className="mt-4 mb-1">
        <p className="text-sm font-semibold text-foreground">Requirements</p>
      </div>
      <FieldRow icon={Ruler}    label="Size range">16,000 – 20,000 sf</FieldRow>
      <FieldRow label="Floors">6th floor or above</FieldRow>
      <FieldRow label="Target occupancy">Q1 2027</FieldRow>
      <FieldRow label="Budget / sf">Up to ${deal.budgetNer.toFixed(2)} PSF/yr</FieldRow>
      <FieldRow label="Special">Dedicated server room · Open plan · 4:1,000 parking</FieldRow>

      {stageIdx >= 1 && (
        <>
          <div className="mt-4 mb-1"><p className="text-sm font-semibold text-foreground">Tour</p></div>
          <FieldRow icon={Calendar} label="Tour date">Sep 3, 2026 · 10:00 AM</FieldRow>
          <FieldRow label="Spaces toured">Suite 0800 – Floor 8 · Suite 0900 – Floor 9</FieldRow>
        </>
      )}
      {stageIdx >= 2 && (
        <>
          <div className="mt-4 mb-1"><p className="text-sm font-semibold text-foreground">Proposal</p></div>
          <FieldRow label="Asking rent">$98.00 PSF/yr</FieldRow>
          <FieldRow label="TI package">$80.00 PSF</FieldRow>
          <FieldRow label="Free rent">4 months</FieldRow>
          <FieldRow label="Lease term">8 years</FieldRow>
        </>
      )}
      {stageIdx >= 3 && (
        <>
          <div className="mt-4 mb-1"><p className="text-sm font-semibold text-foreground">LOI</p></div>
          <FieldRow icon={Calendar} label="LOI date">Oct 15, 2026</FieldRow>
          <FieldRow label="LOI terms">$94.00 PSF · 8 yrs · $80 TI · 4 mo free rent</FieldRow>
          <FieldRow label="Counters">1 counter received</FieldRow>
          <FieldRow label="Legal counsel">Skadden Arps (Tenant) · Willkie Farr (Landlord)</FieldRow>
        </>
      )}
      {stageIdx >= 4 && (
        <>
          <div className="mt-4 mb-1"><p className="text-sm font-semibold text-foreground">Legal</p></div>
          <FieldRow icon={Calendar} label="Execution target">Dec 1, 2026</FieldRow>
          <FieldRow label="Open items">2 redlines · 1 insurance item</FieldRow>
        </>
      )}
      {stageIdx >= 5 && (
        <>
          <div className="mt-4 mb-1"><p className="text-sm font-semibold text-foreground">Execution</p></div>
          <FieldRow icon={Calendar} label="Execution date">Dec 15, 2026</FieldRow>
          <FieldRow icon={Calendar} label="Effective date">Jan 1, 2027</FieldRow>
          <FieldRow icon={Calendar} label="Expiry">Dec 31, 2034</FieldRow>
        </>
      )}
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

const PARTY_STYLE: Record<ProposalRound["party"], string> = {
  landlord: "text-primary bg-primary/5 border-primary/20",
  tenant:   "text-foreground bg-muted/50 border-border",
  agreed:   "text-success bg-success/5 border-success/20",
  prior:    "text-muted-foreground bg-muted/40 border-border",
}

function DeltaCell({ value, base, fmt = "dollar" }: { value: number; base: number; fmt?: "dollar" | "months" | "years" }) {
  if (!base) return <td className="px-3 py-2.5 text-sm font-medium text-foreground">{fmt === "dollar" ? `$${value.toFixed(2)}` : `${value}${fmt === "months" ? " mo" : " yr"}`}</td>
  const pct = ((value - base) / base) * 100
  const up = pct > 0
  const flat = Math.abs(pct) < 0.5
  const cls = flat ? "text-muted-foreground" : up ? "text-success" : "text-destructive"
  const sign = flat ? "" : up ? "+" : ""
  const formatted = fmt === "dollar" ? `$${value.toFixed(2)}` : fmt === "months" ? `${value} mo` : `${value} yr`
  return (
    <td className="px-3 py-2.5">
      <div className="text-sm font-medium text-foreground">{formatted}</div>
      {!flat && <div className={cn("text-[10px] font-medium", cls)}>{sign}{pct.toFixed(1)}%</div>}
    </td>
  )
}

function ProposalsTab({ deal, stageIdx }: { deal: Deal; stageIdx: number }) {
  if (stageIdx < 2) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
        <FileText className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No proposals yet. This deal is at the {deal.stage} stage.</p>
        <p className="text-xs text-muted-foreground/60">Proposals will appear here once the deal reaches the Proposal stage.</p>
      </div>
    )
  }

  const rounds = buildProposals(deal)
  const cols = ["Rent PSF", "TI PSF", "Free rent", "Term", "Escalation", "Options"]

  return (
    <div className="flex flex-col gap-5">
      {/* Negotiation tracker */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Negotiation history</p>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-3 py-2.5 text-xs font-semibold text-muted-foreground w-36">Round</th>
                {cols.map(c => <th key={c} className="px-3 py-2.5 text-xs font-semibold text-muted-foreground">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rounds.map((r, i) => {
                const base = i === 0 ? null : rounds[0]
                return (
                  <tr key={i} className={cn("border-b border-border/50 last:border-0", r.party === "agreed" && "bg-success/5")}>
                    <td className="px-3 py-2.5">
                      <div className="text-xs font-semibold text-foreground">{r.label}</div>
                      <div className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold border mt-0.5", PARTY_STYLE[r.party])}>
                        {r.party === "prior" ? "Prior" : r.party === "agreed" ? "Agreed" : r.party === "landlord" ? "Landlord" : "Tenant"}
                      </div>
                    </td>
                    <DeltaCell value={r.rent}     base={base?.rent ?? 0}     fmt="dollar"  />
                    <DeltaCell value={r.ti}       base={base?.ti ?? 0}       fmt="dollar"  />
                    <DeltaCell value={r.freeRent} base={base?.freeRent ?? 0} fmt="months"  />
                    <DeltaCell value={r.term}     base={base?.term ?? 0}     fmt="years"   />
                    <td className="px-3 py-2.5 text-sm text-foreground/80">{r.escalation}</td>
                    <td className="px-3 py-2.5 text-sm text-foreground/80">{r.options}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* vs. Prior lease (Renewals) */}
      {deal.dealType === "Renewal" && rounds[0]?.party === "prior" && (() => {
        const prior = rounds[0]
        const current = rounds[rounds.length - 1]
        const items: { label: string; prior: string; current: string; delta: string; up: boolean }[] = [
          { label: "Base rent",  prior: `$${prior.rent.toFixed(2)}/sf`, current: `$${current.rent.toFixed(2)}/sf`, delta: `+${(((current.rent - prior.rent) / prior.rent) * 100).toFixed(1)}%`, up: true },
          { label: "TI",        prior: `$${prior.ti}/sf`,              current: `$${current.ti}/sf`,              delta: `+${(((current.ti - prior.ti) / prior.ti) * 100).toFixed(1)}%`,        up: true },
          { label: "Free rent", prior: `${prior.freeRent} mo`,         current: `${current.freeRent} mo`,         delta: `+${current.freeRent - prior.freeRent} mo`,                             up: true },
          { label: "Term",      prior: `${prior.term} mo`,             current: `${current.term} mo`,             delta: `${current.term - prior.term > 0 ? "+" : ""}${current.term - prior.term} mo`, up: current.term >= prior.term },
        ]
        return (
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Vs. prior lease</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {items.map(item => (
                <div key={item.label} className={cn(cardBase, "flex flex-col gap-1 py-3")}>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-semibold text-foreground">{item.current}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground line-through">{item.prior}</span>
                    <span className={cn("text-[10px] font-semibold", item.up ? "text-success" : "text-destructive")}>{item.delta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Scenario summary */}
      {deal.ner > 0 && (
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Economic summary</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Net effective rent",   value: `$${deal.ner.toFixed(2)}/sf` },
              { label: "Annual NOI",            value: deal.noi ? `$${(deal.noi / 1_000_000).toFixed(2)}M` : "—" },
              { label: "Total lease value",     value: deal.term ? `$${((deal.ner * deal.sf * deal.term / 12) / 1_000_000).toFixed(1)}M` : "—" },
              { label: "TI investment",         value: `$${((deal.sf * 80) / 1_000_000).toFixed(2)}M` },
              { label: "TI payback (est.)",     value: deal.ner ? `${((deal.sf * 80) / (deal.ner * deal.sf) * 12).toFixed(1)} mo` : "—" },
              { label: "NER vs budget",         value: deal.budgetNer ? `${(((deal.ner - deal.budgetNer) / deal.budgetNer) * 100).toFixed(1)}%` : "—" },
            ].map(item => (
              <div key={item.label} className={cn(cardBase, "py-3")}>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-base font-semibold text-foreground mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
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
    docs.push({ name: "Suite 0800 space plan.pdf",     type: "Floor plan",     date: "Sep 3, 2026"  })
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

function DocumentsTab({ deal }: { deal: Deal }) {
  const docs = getDocuments(deal.stage as StageValue)
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
    { initials: "AI",  name: "Space Match",    timestamp: "Today · 2:05 PM", message: "Ranked 14 available floors. Suite 2100 flagged as best fit — 54,000 sf uninterrupted, open plan, no column interference.", kind: "agent"  },
    { initials: "DC",  name: "Derek Chan",     timestamp: "Today · 1:40 PM", message: "Morgan Stanley team confirmed tour interest. Coordinating schedule with facilities for Suite 2100 and 2200.", kind: "comment" },
    { initials: "AI",  name: "Tour Coordinator", timestamp: "Today · 1:45 PM", message: "Tour scheduled Sep 10 · 10:00 AM. Confirmation sent to Derek Chan and Morgan Stanley facilities team.", kind: "agent"  },
    { initials: "VTS", name: "VTS system",     timestamp: "Yesterday · 4:12 PM", message: "Stage updated: Inquiry → Touring.", kind: "update" },
  ],
  "d10": [
    { initials: "AI",  name: "Deal Momentum",  timestamp: "Today · 11:00 AM", message: "Stalled 26 days. Cost of delay: $3,705/day ($96,330 total). Follow-up drafted — awaiting your approval before sending.", kind: "agent"  },
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

function ActivityFeed({ deal }: { deal: Deal }) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [comment, setComment] = React.useState("")
  const feed = DEAL_FEEDS[deal.id] ?? GENERIC_FEED

  return (
    <div className="flex flex-col gap-0">
      {/* Header with collapse */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="flex items-center justify-between w-full py-1 mb-3 group"
      >
        <p className="text-sm font-semibold text-foreground">Activity</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
          <span>{collapsed ? "Show" : "Hide"}</span>
          {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
        </div>
      </button>

      {!collapsed && (
        <>
          <div className="flex flex-col gap-2 mb-4">
            {feed.map((entry, i) => (
              <div key={i} className={cn(
                "rounded-lg px-3 py-2.5 space-y-1.5",
                entry.kind === "update" ? "bg-muted/50" :
                entry.kind === "agent"  ? "bg-primary/5 border border-primary/15" :
                "bg-card border border-border"
              )}>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-semibold shrink-0",
                    entry.kind === "update" ? "bg-muted-foreground/15 text-muted-foreground" :
                    entry.kind === "agent"  ? "bg-primary/15 text-primary" :
                    "bg-foreground/10 text-foreground"
                  )}>
                    {entry.kind === "agent" ? <Bot className="h-3 w-3" /> : entry.initials}
                  </div>
                  <span className={cn(
                    "text-xs font-semibold flex-1 min-w-0 truncate",
                    entry.kind === "agent" ? "text-primary" : "text-foreground"
                  )}>{entry.name}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0">{entry.timestamp}</span>
                </div>
                <p className={cn(
                  "text-xs leading-relaxed pl-8",
                  entry.kind === "update" ? "text-muted-foreground" : "text-foreground/80"
                )}>
                  {entry.message}
                </p>
              </div>
            ))}
          </div>

          <Separator className="mb-4" />

          <div className="flex gap-2 items-end">
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 resize-none text-sm min-h-[60px]"
              rows={2}
            />
            <Button size="sm" disabled={!comment.trim()} className="shrink-0 gap-1.5" onClick={() => setComment("")}>
              <Send className="h-3.5 w-3.5" />
              Post
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Deal Health card ─────────────────────────────────────────────────────────

const HEALTH_TIERS = {
  1: { cls: "text-success bg-success/10 border-success/20",             dot: "bg-success"         },
  2: { cls: "text-warning bg-warning/10 border-warning/20",             dot: "bg-warning"         },
  3: { cls: "text-destructive bg-destructive/10 border-destructive/20", dot: "bg-destructive"     },
  4: { cls: "text-muted-foreground bg-muted/60 border-border",          dot: "bg-muted-foreground"},
} as const
type HealthTier = keyof typeof HEALTH_TIERS

const HEALTH_BY_STATUS: Record<string, { tier: HealthTier; label: string; summary: string; signals: string[]; recs: { action: string; urgency: string }[] }> = {
  active: {
    tier: 1, label: "On track",
    summary: "This deal is progressing normally. No immediate action required.",
    signals: [
      "Email thread active in the last 72 hours",
      "No counter-proposal overdue",
      "No competing deal detected for this space",
    ],
    recs: [{ action: "Prepare next step documentation", urgency: "This week" }],
  },
  stalled: {
    tier: 2, label: "Stalled",
    summary: "Deal has had no activity in over 10 days. Action recommended.",
    signals: [
      `No inbound communication detected for ${26} days`,
      "Last proposal sent — no counter received",
      "Competing opportunity detected at 2 other buildings",
    ],
    recs: [
      { action: "Send follow-up via Deal Momentum", urgency: "Today" },
      { action: "Schedule check-in call", urgency: "This week" },
    ],
  },
  "at-risk": {
    tier: 3, label: "At risk",
    summary: "Multiple risk signals detected. Immediate attention recommended.",
    signals: [
      "Tenant has been seen touring a competitor property",
      "Last communication over 14 days ago",
      "Budget gap of 12% detected vs. market rate",
    ],
    recs: [
      { action: "Escalate to senior leadership", urgency: "Today" },
      { action: "Prepare concession scenario", urgency: "Today" },
    ],
  },
  executed: {
    tier: 1, label: "Executed",
    summary: "Lease executed. Operational handoff in progress.",
    signals: ["Lease signed by all parties", "Effective date confirmed", "Operational tasks created"],
    recs: [{ action: "Confirm buildout timeline with property team", urgency: "This week" }],
  },
}

function DealHealthCard({ status }: { status: DealStatus }) {
  const [open, setOpen] = React.useState(false)
  const cfg = HEALTH_BY_STATUS[status] ?? HEALTH_BY_STATUS.active
  const style = HEALTH_TIERS[cfg.tier]

  return (
    <div className={cn(cardBase, "flex flex-col gap-3")}>
      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 mt-0.5">
          <HeartPulse className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-foreground leading-tight">Deal Health</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{cfg.summary}</p>
        </div>
        <Badge variant="outline" className={cn("shrink-0 gap-1.5 font-medium text-xs", style.cls)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
          {cfg.label}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {cfg.recs.map(r => (
          <div key={r.action} className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5">
            <Zap className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-xs text-foreground">{r.action}</span>
            <span className="text-[10px] text-muted-foreground">{r.urgency}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors w-fit"
      >
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")} />
        {open ? "Hide signals" : "Why"}
      </button>

      {open && (
        <div className="flex flex-col gap-1.5 pt-1 border-t border-border/60">
          <p className="text-xs font-semibold text-foreground mb-1">Signals</p>
          {cfg.signals.map((s, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-foreground/80 leading-snug">
              <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface DealProfileProps {
  deal: Deal
  onBack: () => void
}

export function DealProfile({ deal, onBack }: DealProfileProps) {
  const [stage, setStage]   = React.useState<StageValue>(deal.stage as StageValue)
  const [status, setStatus] = React.useState<DealStatus>(deal.status as DealStatus)
  const [tab, setTab]       = React.useState("overview")
  const stageIdx = ALL_STAGES.indexOf(stage)

  return (
    <div className="flex flex-col gap-4 mt-4 pb-8">

      {/* Breadcrumb + status */}
      <div className="flex items-center gap-2 flex-wrap">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Button
            variant="ghost" size="sm"
            onClick={onBack}
            className="h-auto p-0 text-xs font-normal text-muted-foreground hover:text-foreground hover:bg-transparent"
          >
            Deals
          </Button>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="text-foreground font-medium">{deal.tenant}</span>
        </nav>
        <div className="ml-auto">
          <StatusBadge status={status} onChange={setStatus} />
        </div>
      </div>

      {/* Stage journey */}
      <StageJourneyBar currentStage={stage} onChange={s => { setStage(s); setTab("overview") }} />

      {/* Financial KPI bar */}
      <FinancialBar deal={deal} stageIdx={stageIdx} />

      {/* Agent strip */}
      <AgentStrip deal={deal} stage={stage} />

      {/* Deal Health */}
      <DealHealthCard status={status} />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

        {/* Left: tabbed detail */}
        <div className={cn(cardBase, "lg:col-span-2")}>
          <ToggleGroup type="single" value={tab} onValueChange={v => v && setTab(v as string)}
            className={cn(FILTER_TAB_GROUP_CLS, "w-full mb-5")}>
            <ToggleGroupItem value="overview"  size="sm" className={cn(FILTER_TAB_ITEM_CLS, "flex-1 text-sm")}>Overview</ToggleGroupItem>
            <ToggleGroupItem value="proposals" size="sm" className={cn(FILTER_TAB_ITEM_CLS, "flex-1 text-sm")}>Proposals</ToggleGroupItem>
            <ToggleGroupItem value="documents" size="sm" className={cn(FILTER_TAB_ITEM_CLS, "flex-1 text-sm")}>Documents</ToggleGroupItem>
          </ToggleGroup>
          {tab === "overview"  && <OverviewTab deal={deal} stageIdx={stageIdx} />}
          {tab === "proposals" && <ProposalsTab deal={deal} stageIdx={stageIdx} />}
          {tab === "documents" && <DocumentsTab deal={deal} />}
        </div>

        {/* Right: activity feed */}
        <div className={cn(cardBase)}>
          <ActivityFeed deal={deal} />
        </div>

      </div>
    </div>
  )
}
