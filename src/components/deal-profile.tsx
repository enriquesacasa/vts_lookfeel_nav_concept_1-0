import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/sortable-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { FILTER_TAB_GROUP_CLS, FILTER_TAB_ITEM_CLS } from "@/components/filter-chip"
import {
  ChevronDown, Check, FileText, Download, Send,
  Building2, User, MapPin, Ruler, Tag, Calendar,
  CheckCircle2, Clock, AlertTriangle, HeartPulse, Zap,
  Bot,
  Briefcase, Globe, Mail, DollarSign, Layers, Target,
  Star, Home, SquareStack, Scale, Trophy,
} from "lucide-react"
import { AGENT_ICON_MAP, AGENTS } from "@/components/agents-page"
import { TENANT_LOGO, type Deal } from "@/components/deals-page"

// ─── Tenant logo ──────────────────────────────────────────────────────────────

const TENANT_DOMAIN: Record<string, string> = {
  "Starbucks Corporation": "starbucks.com",
  "Pfizer Inc.":           "pfizer.com",
  "Morgan Stanley":        "morganstanley.com",
  "Deloitte LLP":          "deloitte.com",
  "KPMG":                  "kpmg.com",
  "Ernst & Young":         "ey.com",
  "HSBC Holdings":         "hsbc.com",
  "Latham & Watkins":      "lw.com",
  "JPMorgan Chase":        "jpmorgan.com",
  "Amazon.com":            "amazon.com",
  "WeWork":                "wework.com",
  "Google LLC":            "google.com",
  "Tesla Inc.":            "tesla.com",
  "Cisco Systems":         "cisco.com",
  "Salesforce Inc.":       "salesforce.com",
  "BlackRock":             "blackrock.com",
  "Goldman Sachs":         "goldmansachs.com",
  "McKinsey & Co.":        "mckinsey.com",
  "Spotify":               "spotify.com",
  "Airbnb":                "airbnb.com",
  "Stripe":                "stripe.com",
  "Twitter/X":             "x.com",
  "Uber Technologies":     "uber.com",
  "Microsoft":             "microsoft.com",
  "Meta Platforms":        "meta.com",
}

export function TenantLogoImage({ name }: { name: string }) {
  const domain = TENANT_DOMAIN[name]
  const clearbitSrc = domain ? `https://logo.clearbit.com/${domain}?size=256` : null
  const brandfetchSrc = domain ? `https://cdn.brandfetch.io/${domain}/w/256/h/256` : null
  const localSrc = TENANT_LOGO[name] || null
  const sources = [clearbitSrc, brandfetchSrc, localSrc].filter(Boolean) as string[]
  const [srcIdx, setSrcIdx] = React.useState(0)
  const src = sources[srcIdx] ?? null
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  const handleError = () => {
    if (srcIdx < sources.length - 1) setSrcIdx(i => i + 1)
    else setSrcIdx(sources.length) // exhausted — show initials
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
  stalled:   { label: "Stalled",  Icon: Clock,         cls: "text-warning bg-warning/10 border-warning/20",          dot: "bg-warning" },
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
      <div className="flex items-center flex-wrap gap-y-2">
        {ALL_STAGES.map((stage, i) => {
          const isPast   = i < currentIdx
          const isActive = stage === currentStage
          const isFuture = i > currentIdx
          return (
            <React.Fragment key={stage}>
              {i > 0 && (
                <div className={cn("flex-1 h-px min-w-3 mx-1.5", isPast ? "bg-primary-foreground/50" : "bg-primary-foreground/20")} />
              )}
              <button
                onClick={() => { if (i > currentIdx) onChange(stage) }}
                className={cn("flex items-center gap-1.5 shrink-0 group", isPast && "cursor-default")}
              >
                <div className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center transition-all",
                  isActive && "bg-primary-foreground",
                  isPast   && "bg-primary-foreground/50",
                  isFuture && "bg-transparent border border-primary-foreground/40 group-hover:border-primary-foreground/70",
                )}>
                  {isPast   && <Check className="h-2.5 w-2.5 text-primary" />}
                </div>
                <span className={cn(
                  "text-xs whitespace-nowrap transition-colors",
                  isActive && "text-primary-foreground font-semibold",
                  isPast   && "text-primary-foreground/85 font-medium",
                  isFuture && "text-primary-foreground/55 group-hover:text-primary-foreground/80",
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
  const cls = trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground"
  return (
    <div className="flex-1 min-w-[120px] px-5 py-4 flex flex-col gap-0.5">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <p className="text-2xl font-medium text-foreground leading-none">{value}</p>
      {sub && <p className={cn("text-xs font-medium mt-1", cls)}>{sub}</p>}
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
    <div className={cn(cardBase, "flex flex-wrap divide-x divide-border/60 !p-0 overflow-hidden")}>
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
          <FieldRow icon={MapPin}     label="Spaces toured">Suite 0800 – Floor 8 · Suite 0900 – Floor 9</FieldRow>
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

const PARTY_STYLE: Record<ProposalRound["party"], string> = {
  landlord: "text-primary bg-primary/5 border-primary/20",
  tenant:   "text-foreground bg-muted/50 border-border",
  agreed:   "text-success bg-success/5 border-success/20",
  prior:    "text-muted-foreground bg-muted/40 border-border",
}

function DeltaCell({ value, base, fmt = "dollar" }: { value: number; base: number; fmt?: "dollar" | "months" | "years" }) {
  if (!base) return <TableCell className="px-3 py-2.5 text-sm font-medium text-foreground">{fmt === "dollar" ? `$${value.toFixed(2)}` : `${value}${fmt === "months" ? " mo" : " yr"}`}</TableCell>
  const pct = ((value - base) / base) * 100
  const up = pct > 0
  const flat = Math.abs(pct) < 0.5
  const cls = flat ? "text-muted-foreground" : up ? "text-success" : "text-destructive"
  const sign = flat ? "" : up ? "+" : ""
  const formatted = fmt === "dollar" ? `$${value.toFixed(2)}` : fmt === "months" ? `${value} mo` : `${value} yr`
  return (
    <TableCell className="px-3 py-2.5">
      <div className="text-sm font-medium text-foreground">{formatted}</div>
      {!flat && <div className={cn("text-xs font-medium", cls)}>{sign}{pct.toFixed(1)}%</div>}
    </TableCell>
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
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
                <TableHead className="px-3 py-2.5 text-xs font-semibold text-muted-foreground w-36">Round</TableHead>
                {cols.map(c => <TableHead key={c} className="px-3 py-2.5 text-xs font-semibold text-muted-foreground">{c}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rounds.map((r, i) => {
                const base = i === 0 ? null : rounds[0]
                return (
                  <TableRow key={i} className={cn("border-b border-border/50 last:border-0 hover:bg-transparent", r.party === "agreed" && "bg-success/5")}>
                    <TableCell className="px-3 py-2.5">
                      <div className="text-xs font-semibold text-foreground">{r.label}</div>
                      <div className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-semibold border mt-0.5", PARTY_STYLE[r.party])}>
                        {r.party === "prior" ? "Prior" : r.party === "agreed" ? "Agreed" : r.party === "landlord" ? "Landlord" : "Tenant"}
                      </div>
                    </TableCell>
                    <DeltaCell value={r.rent}     base={base?.rent ?? 0}     fmt="dollar"  />
                    <DeltaCell value={r.ti}       base={base?.ti ?? 0}       fmt="dollar"  />
                    <DeltaCell value={r.freeRent} base={base?.freeRent ?? 0} fmt="months"  />
                    <DeltaCell value={r.term}     base={base?.term ?? 0}     fmt="years"   />
                    <TableCell className="px-3 py-2.5 text-sm text-foreground/80">{r.escalation}</TableCell>
                    <TableCell className="px-3 py-2.5 text-sm text-foreground/80">{r.options}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
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
                    <span className="text-xs text-muted-foreground line-through">{item.prior}</span>
                    <span className={cn("text-xs font-semibold", item.up ? "text-success" : "text-destructive")}>{item.delta}</span>
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

// ─── Tasks tab ────────────────────────────────────────────────────────────────

type TaskItem = { id: number; label: string; done: boolean; due?: string; assignee?: string }

const STAGE_TASKS: Record<StageValue, TaskItem[]> = {
  "Inquiry":    [{ id: 1, label: "Qualify tenant requirements", done: false, due: "This week", assignee: "You" }, { id: 2, label: "Schedule intro call", done: false, due: "Fri", assignee: "You" }, { id: 3, label: "Add to deal pipeline", done: true, assignee: "You" }],
  "Touring":    [{ id: 1, label: "Prepare tour itinerary", done: true, assignee: "You" }, { id: 2, label: "Collect tenant feedback", done: false, due: "After tour", assignee: "You" }, { id: 3, label: "Shortlist top 2 suites", done: false, due: "This week", assignee: "You" }, { id: 4, label: "Schedule follow-up tour", done: false, due: "Next week", assignee: "You" }],
  "Proposal":   [{ id: 1, label: "Draft initial proposal", done: true, assignee: "You" }, { id: 2, label: "Review proposal with landlord", done: false, due: "Wed", assignee: "You" }, { id: 3, label: "Send proposal to tenant", done: false, due: "Thu", assignee: "You" }],
  "LOI":        [{ id: 1, label: "Counter lease terms", done: false, due: "Mon", assignee: "You" }, { id: 2, label: "Align on TI allowance", done: false, due: "This week", assignee: "You" }, { id: 3, label: "Confirm free rent period", done: true, assignee: "You" }, { id: 4, label: "Get legal review of redlines", done: false, due: "Next week", assignee: "Legal" }],
  "Legal":      [{ id: 1, label: "Review redlines with counsel", done: false, due: "Mon", assignee: "Legal" }, { id: 2, label: "Resolve subleasing rights flag", done: false, due: "This week", assignee: "You" }, { id: 3, label: "Confirm TI escalation clause", done: true, assignee: "Legal" }],
  "Lease Out":  [{ id: 1, label: "Collect signatures - tenant", done: false, due: "This week", assignee: "You" }, { id: 2, label: "Collect signatures - landlord", done: false, due: "This week", assignee: "You" }, { id: 3, label: "File executed lease", done: false, due: "After signing", assignee: "You" }],
  "Executed":   [{ id: 1, label: "Archive deal documents", done: true, assignee: "You" }, { id: 2, label: "Send close announcement", done: false, due: "This week", assignee: "You" }, { id: 3, label: "Log commission details", done: false, assignee: "You" }],
}

function TasksTab({ stage }: { stage: StageValue }) {
  const [tasks, setTasks] = React.useState<TaskItem[]>(() => STAGE_TASKS[stage] ?? [])
  React.useEffect(() => { setTasks(STAGE_TASKS[stage] ?? []) }, [stage])

  const toggle = (id: number) => setTasks(ts => ts.map(t => t.id === id ? { ...t, done: !t.done } : t))

  return (
    <div className="flex flex-col gap-1">
      {tasks.map(task => (
        <button key={task.id} onClick={() => toggle(task.id)}
          className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent/50 transition-colors text-left w-full group">
          <div className={cn(
            "mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors",
            task.done ? "bg-primary border-primary" : "border-border group-hover:border-primary/60"
          )}>
            {task.done && <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
          <div className="flex-1 min-w-0">
            <span className={cn("text-sm", task.done ? "line-through text-muted-foreground" : "text-foreground")}>{task.label}</span>
            {(task.due || task.assignee) && (
              <div className="flex gap-2 mt-0.5">
                {task.due && <span className="text-xs text-muted-foreground">{task.due}</span>}
                {task.assignee && <span className="text-xs text-muted-foreground/60">{task.assignee}</span>}
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
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
    { optionType: "ROFO", holder: "Sullivan & Cromwell", suite: "Suite 0800", floor: "Floor 8", sf: 18000, priority: 1, expiry: "Apr 30, 2029", notes: "Must be exercised within 30 days of landlord offering the space to market" },
    { optionType: "Expansion Option", holder: "Meridian Health Partners", suite: "Suite 0800", floor: "Floor 8", sf: 18000, priority: 2, expiry: "Mar 31, 2028", notes: "One-time right; exercisable during the 6-month window before the triggering event" },
  ],
  "d01": [
    { optionType: "ROFO", holder: "Starbucks Corporation", suite: "Suite 750", floor: "Floor 7", sf: 8200, priority: 1, expiry: "Dec 31, 2027", notes: "Must exercise within 30 days of landlord notice" },
    { optionType: "Expansion Option", holder: "Starbucks Corporation", suite: "Suite 900", floor: "Floor 9", sf: 12000, priority: 1, expiry: "Jun 30, 2028" },
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
    { optionType: "Expansion Option", holder: "Vertex Studios", suite: "Suite 650", floor: "Floor 6", sf: 9800, priority: 1, expiry: "Sep 30, 2027" },
  ],
}

const HEALTH_REC_OVERRIDES: Record<string, { summary?: string; signals?: string[]; recs: { action: string; urgency: string; agentId: string }[] }> = {
  "d00": {
    summary: "2 encumbrances detected on Suite 0800. Rights holders must be notified before the space can be offered to Amazon.",
    signals: [
      "ROFO held by Sullivan & Cromwell — 1st priority, expires Apr 30, 2029",
      "Expansion Option held by Meridian Health Partners — 2nd priority, expires Mar 31, 2028",
      "Both rights encumber Suite 0800 · 18,000 sf — Amazon's target space",
    ],
    recs: [
      { action: "Draft ROFO notice to Sullivan & Cromwell for Suite 0800", urgency: "Before proceeding", agentId: "doc-drafting" },
      { action: "Draft expansion option notice to Meridian Health Partners for Suite 0800", urgency: "This week", agentId: "doc-drafting" },
    ],
  },
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
            <span className="mt-0.5 size-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-primary-foreground bg-primary">{enc.priority}</span>
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
    { initials: "AI",  name: "Space Match",    timestamp: "Today · 2:05 PM", message: "Ranked 14 available floors. Suite 2100 flagged as best fit — 54,000 sf uninterrupted, open plan, no column interference.", kind: "agent"  },
    { initials: "DC",  name: "Derek Chan",     timestamp: "Today · 1:40 PM", message: "Morgan Stanley team confirmed tour interest. Coordinating schedule with facilities for Suite 2100 and 2200.", kind: "comment" },
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
    { initials: "AI",  name: "Space Match",      timestamp: "Today · 2:05 PM",  message: "Ranked 14 available floors. Suite 2100 flagged as best fit — 54,000 sf uninterrupted, open plan, no column interference.", kind: "agent" },
    { initials: "AI",  name: "Tour Coordinator", timestamp: "Today · 1:45 PM",  message: "Tour scheduled Sep 10 · 10:00 AM. Confirmation sent to Derek Chan and Morgan Stanley facilities team.", kind: "agent" },
    { initials: "DC",  name: "Derek Chan",       timestamp: "Today · 1:40 PM",  message: "Morgan Stanley team confirmed tour interest. Coordinating schedule with facilities for Suite 2100 and 2200.", kind: "comment" },
    { initials: "VTS", name: "VTS system",       timestamp: "Yesterday · 4:12 PM", message: "Stage updated: Inquiry → Touring.", kind: "update" },
  ],
  "Proposal": [
    { initials: "AI",  name: "Proposal Builder", timestamp: "Today · 11:00 AM", message: "Proposal assembled for Suite 2100: 54,000 sf · $98 NER · 10-year term · $120 TI allowance. Ready for review.", kind: "agent" },
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
            <p className="text-sm font-semibold text-primary leading-none">{entry.name}</p>
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
  const stageFeed = getStageFeeds(stage)
  const dealFeed = DEAL_FEEDS[deal.id] ?? []
  const seen = new Set(stageFeed.map(e => e.message))
  const feed = [...stageFeed, ...dealFeed.filter(e => !seen.has(e.message))]

  return (
    <div className="flex flex-col gap-0">
      <div className="flex flex-col gap-3">
        {/* Composer */}
        <div className="rounded-xl border border-border bg-card p-3 flex flex-col gap-2">
          <Textarea value={draft} onChange={e => setDraft(e.target.value)}
            placeholder="Post an update…"
            className="resize-none text-sm min-h-[60px] border-0 bg-transparent p-0 focus-visible:ring-0 shadow-none"
            rows={2}
          />
          <div className="flex items-center justify-between gap-2">
            <Button size="sm" variant="outline" className="gap-1.5 text-primary border-primary/30 hover:bg-primary/5"
              onClick={() => setDraft("Draft a deal update for Amazon.com summarizing current stage, recent activity, and next steps.")}>
              <Zap className="h-3.5 w-3.5" />
              Draft with VTS
            </Button>
            <Button size="sm" disabled={!draft.trim()} className="gap-1.5" onClick={() => setDraft("")}>
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

// ─── Deal Health card ─────────────────────────────────────────────────────────

const HEALTH_TIERS = {
  1: { cls: "text-success bg-success/10 border-success/20",             dot: "bg-success"         },
  2: { cls: "text-warning bg-warning/10 border-warning/20",             dot: "bg-warning"         },
  3: { cls: "text-destructive bg-destructive/10 border-destructive/20", dot: "bg-destructive"     },
  4: { cls: "text-muted-foreground bg-muted/60 border-border",          dot: "bg-muted-foreground"},
} as const
type HealthTier = keyof typeof HEALTH_TIERS

type HealthEntry = { tier: HealthTier; label: string; summary: string; signals: string[]; recs: { action: string; urgency: string; agentId: string }[] }

const HEALTH_BY_STAGE: Record<StageValue, Partial<Record<DealStatus, HealthEntry>>> = {
  "Inquiry": {
    active: { tier: 1, label: "On track", summary: "Requirement captured. Coordinating tour schedule with the tenant team.", signals: ["Inbound inquiry parsed and logged", "Tenant rep identified: Sarah Okonkwo at CBRE", "Space requirement matched to 3 available suites"], recs: [{ action: "Schedule initial tours", urgency: "This week", agentId: "tour-agent" }] },
    stalled: { tier: 2, label: "Stalled", summary: "No tour scheduled yet. Inquiry risks going cold.", signals: ["Requirement captured 8 days ago", "No tour date confirmed", "Competing buildings may be scheduling faster"], recs: [{ action: "Re-engage tenant rep", urgency: "Today", agentId: "deal-momentum" }, { action: "Schedule tour", urgency: "Today", agentId: "tour-agent" }] },
    "at-risk": { tier: 3, label: "At risk", summary: "Inquiry has not progressed. Tenant may be disengaging.", signals: ["12 days since inquiry", "No response to outreach", "Competitor tour detected"], recs: [{ action: "Send urgent re-engagement", urgency: "Today", agentId: "deal-momentum" }, { action: "Analyze deal intelligence", urgency: "Today", agentId: "deal-intelligence" }] },
  },
  "Touring": {
    active: { tier: 1, label: "On track", summary: "Tours underway. Capturing tenant feedback and matching spaces.", signals: ["Tour scheduled for Sep 10 · 10:00 AM", "Suite 2100 ranked best fit", "No competing tour detected"], recs: [{ action: "Prepare proposal for top-ranked suite", urgency: "This week", agentId: "proposal-builder" }] },
    stalled: { tier: 2, label: "Stalled", summary: "Tour completed but no follow-up from tenant rep.", signals: ["Tour completed 9 days ago", "No feedback received", "Proposal not yet requested"], recs: [{ action: "Follow up on tour feedback", urgency: "Today", agentId: "deal-momentum" }, { action: "Prepare proactive proposal", urgency: "This week", agentId: "proposal-builder" }] },
    "at-risk": { tier: 3, label: "At risk", summary: "Tenant toured a competitor property. Engagement declining.", signals: ["Competitor tour detected at 2 other buildings", "Last communication 14 days ago", "No proposal request received"], recs: [{ action: "Model concession scenarios", urgency: "Today", agentId: "scenario-modeling" }, { action: "Send differentiation brief", urgency: "Today", agentId: "deal-momentum" }] },
  },
  "Proposal": {
    active: { tier: 1, label: "On track", summary: "Proposal delivered. Monitoring for counter and feedback.", signals: ["Proposal sent to tenant team", "No counter overdue", "Deal Monitor watching engagement signals"], recs: [{ action: "Prepare counter-proposal scenarios", urgency: "This week", agentId: "scenario-modeling" }] },
    stalled: { tier: 2, label: "Stalled", summary: "Proposal sent with no counter received. Follow-up needed.", signals: ["Proposal delivered 11 days ago", "No counter received", "Board review may be causing delay"], recs: [{ action: "Send follow-up on proposal", urgency: "Today", agentId: "deal-momentum" }, { action: "Model alternative proposal terms", urgency: "This week", agentId: "scenario-modeling" }] },
    "at-risk": { tier: 3, label: "At risk", summary: "Multiple risk signals on proposal stage. Intervention recommended.", signals: ["Tenant seen touring competitor", "Budget gap of 12% vs market", "Last communication 14 days ago"], recs: [{ action: "Model concession scenarios", urgency: "Today", agentId: "scenario-modeling" }, { action: "Analyze deal intelligence", urgency: "Today", agentId: "deal-intelligence" }] },
  },
  "LOI": {
    active: { tier: 1, label: "On track", summary: "LOI executed. Preparing legal package for counsel.", signals: ["LOI signed by all parties", "Key terms extracted: 18 fields", "2 flags raised: TI escalation and subleasing rights"], recs: [{ action: "Prepare counsel handoff package", urgency: "This week", agentId: "counsel-handoff" }] },
    stalled: { tier: 2, label: "Stalled", summary: "LOI signed but legal package not yet initiated.", signals: ["LOI executed 7 days ago", "No counsel engaged yet", "Clock running on exclusivity window"], recs: [{ action: "Initiate counsel handoff", urgency: "Today", agentId: "counsel-handoff" }, { action: "Flag exclusivity timeline risk", urgency: "Today", agentId: "deal-momentum" }] },
    "at-risk": { tier: 3, label: "At risk", summary: "LOI terms at risk. Open items need immediate resolution.", signals: ["Subleasing rights dispute unresolved", "TI escalation clause flagged", "Exclusivity window closing in 5 days"], recs: [{ action: "Escalate flagged terms to counsel", urgency: "Today", agentId: "counsel-handoff" }, { action: "Prepare negotiation guidance", urgency: "Today", agentId: "negotiation-guidance" }] },
  },
  "Legal": {
    active: { tier: 1, label: "On track", summary: "Legal review underway. Tracking open redlines.", signals: ["12 open redlines tracked", "Both counsel parties engaged", "No scope drift detected"], recs: [{ action: "Monitor redline resolution progress", urgency: "This week", agentId: "negotiation-guidance" }] },
    stalled: { tier: 2, label: "Stalled", summary: "Legal review stalled. Redlines not progressing.", signals: ["No redline movement in 8 days", "Scope drift detected on subleasing rights", "Tenant counsel unresponsive"], recs: [{ action: "Escalate stalled redlines", urgency: "Today", agentId: "negotiation-guidance" }, { action: "Prepare concession on open items", urgency: "Today", agentId: "scenario-modeling" }] },
    "at-risk": { tier: 3, label: "At risk", summary: "Critical legal issues detected. Immediate attention required.", signals: ["Subleasing rights moved without agreement", "3 rounds of redlines unresolved", "Tenant threatening to walk"], recs: [{ action: "Convene negotiation call", urgency: "Today", agentId: "negotiation-guidance" }, { action: "Escalate to senior leadership", urgency: "Today", agentId: "deal-health" }] },
  },
  "Lease Out": {
    active: { tier: 1, label: "On track", summary: "Lease out for signature. Tracking outstanding signatures.", signals: ["2 outstanding signatures: Tenant CFO and Landlord VP", "Execution package assembled", "Effective date confirmed"], recs: [{ action: "Track signature completion", urgency: "This week", agentId: "execution-management" }] },
    stalled: { tier: 2, label: "Stalled", summary: "Lease out but no signatures received yet.", signals: ["Lease sent 6 days ago", "No signatures returned", "Signatory availability unconfirmed"], recs: [{ action: "Follow up with signatories", urgency: "Today", agentId: "execution-management" }, { action: "Re-engage tenant rep", urgency: "Today", agentId: "deal-momentum" }] },
    "at-risk": { tier: 3, label: "At risk", summary: "Signature process at risk. Deal may not close.", signals: ["Tenant CFO travel delay", "Landlord VP approval pending board", "Competing lease opportunity detected"], recs: [{ action: "Escalate signature urgency", urgency: "Today", agentId: "execution-management" }, { action: "Prepare contingency scenarios", urgency: "Today", agentId: "scenario-modeling" }] },
  },
  "Executed": {
    active: { tier: 1, label: "On track", summary: "Lease executed. Operational handoff in progress.", signals: ["Lease signed by all parties", "Effective date Jan 1, 2027", "16 operational tasks created"], recs: [{ action: "Complete operational handoff", urgency: "This week", agentId: "operational-handoff" }, { action: "Sync final terms to all systems", urgency: "This week", agentId: "data-writeback" }] },
    stalled: { tier: 2, label: "Stalled", summary: "Execution complete but handoff tasks not started.", signals: ["Lease executed 3 days ago", "Property management not notified", "Buildout tasks not created"], recs: [{ action: "Initiate operational handoff", urgency: "Today", agentId: "operational-handoff" }, { action: "Sync final terms", urgency: "Today", agentId: "data-writeback" }] },
    "at-risk": { tier: 3, label: "At risk", summary: "Post-execution tasks falling behind. Tenant move-in at risk.", signals: ["Buildout permit delayed", "Property management handoff incomplete", "Move-in date conflicts detected"], recs: [{ action: "Escalate buildout timeline", urgency: "Today", agentId: "operational-handoff" }, { action: "Resolve move-in conflicts", urgency: "Today", agentId: "data-writeback" }] },
  },
}

function RecRow({ action, urgency, agentId }: { action: string; urgency: string; agentId: string }) {
  const agent = AGENTS.find(a => a.id === agentId)
  const AgentIcon = agent ? (AGENT_ICON_MAP[agent.name] ?? Bot) : Bot

  return (
    <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 border border-primary/25 bg-primary/15">
      <Zap className="h-3.5 w-3.5 shrink-0 text-sidebar-primary" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-sidebar-foreground/90">{action}</p>
        <p className="text-xs text-sidebar-foreground/55">{urgency}</p>
      </div>
      {agent && (
        <Button variant="outline" size="sm" onClick={() => {}}
          className="gap-1.5 shrink-0 text-sidebar-foreground/85 border-current bg-transparent hover:bg-sidebar-foreground/10">
          <AgentIcon className="h-3 w-3" />
          {agent.name}
        </Button>
      )}
    </div>
  )
}

function DealHealthCard({ status, stage, dealId }: { status: DealStatus; stage: StageValue; dealId?: string }) {
  const stageHealth = HEALTH_BY_STAGE[stage]
  const baseCfg = stageHealth?.[status] ?? stageHealth?.active ?? HEALTH_BY_STAGE["Inquiry"].active!
  const override = dealId ? HEALTH_REC_OVERRIDES[dealId] : undefined
  const cfg = override ? { ...baseCfg, ...override } : baseCfg
  return (
    <div className={cn(cardBase, "border-transparent flex flex-col gap-4 bg-sidebar-accent")}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest mb-1 text-sidebar-foreground/70">VTS agents</p>
          <h2 className="text-xl font-semibold text-sidebar-foreground">Deal Health</h2>
        </div>
      </div>

      <div className="rounded-lg px-3 py-2 flex items-center gap-3 bg-sidebar-foreground/10">
        <HeartPulse className="h-3.5 w-3.5 shrink-0 text-sidebar-primary" />
        <p className="text-xs leading-snug text-sidebar-foreground/70 flex-1">{cfg.summary}</p>
        <Popover>
          <PopoverTrigger render={<Button variant="outline" size="sm" className="shrink-0 gap-1.5 text-sidebar-foreground/85 border-current bg-transparent hover:bg-sidebar-foreground/10" />}>
            Signals
            <ChevronDown className="h-3 w-3" />
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end">
            <p className="text-xs font-semibold text-foreground mb-2">Signals</p>
            <div className="flex flex-col gap-2">
              {cfg.signals.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-foreground/80 leading-snug">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                  {s}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-2">
        {cfg.recs.map(r => (
          <RecRow key={r.action} action={r.action} urgency={r.urgency} agentId={r.agentId} />
        ))}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface DealProfileProps {
  deal: Deal
  onBack: () => void
  status?: DealStatus
  onStatusChange?: (s: DealStatus) => void
}

export function DealProfile({ deal, onBack: _onBack, status: statusProp, onStatusChange }: DealProfileProps) {
  const [stage, setStage]           = React.useState<StageValue>(deal.stage as StageValue)
  const [internalStatus, setInternalStatus] = React.useState<DealStatus>(deal.status as DealStatus)
  const status    = statusProp ?? internalStatus
  const _setStatus = onStatusChange ?? setInternalStatus; void _setStatus
  const [tab, setTab]               = React.useState("updates")
  const stageIdx = ALL_STAGES.indexOf(stage)

  return (
    <div className="flex flex-col gap-4 mt-4 pb-8">

      {/* Financial KPI bar */}
      <FinancialBar deal={deal} stageIdx={stageIdx} />

      {/* Stage journey */}
      <StageJourneyBar currentStage={stage} onChange={s => { setStage(s); setTab("updates") }} />

      {/* Agent strip */}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">

        {/* Left col: Deal Health + tabbed content */}
        <div className="lg:col-span-3 flex flex-col gap-4 h-full">
          <DealHealthCard status={status} stage={stage} dealId={deal.id} />

          <div className={cn(cardBase, "flex-1")}>
            <ToggleGroup type="single" value={tab} onValueChange={v => v && setTab(v as string)}
              className={cn(FILTER_TAB_GROUP_CLS, "w-full mb-5")}>
              <ToggleGroupItem value="updates"   size="sm" className={cn(FILTER_TAB_ITEM_CLS, "flex-1 text-sm")}>Updates</ToggleGroupItem>
              <ToggleGroupItem value="tasks"        size="sm" className={cn(FILTER_TAB_ITEM_CLS, "flex-1 text-sm")}>Tasks</ToggleGroupItem>
              <ToggleGroupItem value="encumbrances" size="sm" className={cn(FILTER_TAB_ITEM_CLS, "flex-1 text-sm")}>
                Encumbrances
                {(DEAL_ENCUMBRANCES[deal.id]?.length ?? 0) > 0 && (
                  <span className="ml-0.5 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-bold bg-destructive text-white">{DEAL_ENCUMBRANCES[deal.id].length}</span>
                )}
              </ToggleGroupItem>
              <ToggleGroupItem value="tours"        size="sm" className={cn(FILTER_TAB_ITEM_CLS, "flex-1 text-sm")}>Tours</ToggleGroupItem>
              <ToggleGroupItem value="proposals"    size="sm" className={cn(FILTER_TAB_ITEM_CLS, "flex-1 text-sm")}>Proposals</ToggleGroupItem>
              <ToggleGroupItem value="leases"       size="sm" className={cn(FILTER_TAB_ITEM_CLS, "flex-1 text-sm")}>Legal</ToggleGroupItem>
              <ToggleGroupItem value="documents"    size="sm" className={cn(FILTER_TAB_ITEM_CLS, "flex-1 text-sm")}>Docs</ToggleGroupItem>
            </ToggleGroup>
            {tab === "updates"      && <ActivityFeed deal={deal} stage={stage} />}
            {tab === "tasks"        && <TasksTab stage={stage} />}
            {tab === "tours"        && <p className="text-sm text-muted-foreground py-8 text-center">No tours scheduled.</p>}
            {tab === "proposals"    && <ProposalsTab deal={deal} stageIdx={stageIdx} />}
            {tab === "leases"       && <p className="text-sm text-muted-foreground py-8 text-center">No leases on file.</p>}
            {tab === "encumbrances" && <EncumbrancesTab deal={deal} />}
            {tab === "documents"    && <DocumentsTab stage={stage} />}
          </div>
        </div>

        {/* Right: info */}
        <div className={cn(cardBase, "lg:col-span-1 overflow-y-auto max-h-[80vh] lg:max-h-none")}>
          <p className="text-sm font-semibold text-foreground mb-4">Info</p>
          <OverviewTab deal={deal} stageIdx={stageIdx} />
        </div>

      </div>
    </div>
  )
}
