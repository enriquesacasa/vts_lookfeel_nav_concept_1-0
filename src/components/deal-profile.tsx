import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { FILTER_TAB_GROUP_CLS, FILTER_TAB_ITEM_CLS } from "@/components/filter-chip"
import {
  ChevronRight, Check, FileText, Download, Send,
  Building2, User, MapPin, Ruler, Tag, Calendar,
  CheckCircle2, Clock, AlertTriangle, HeartPulse, ChevronDown,
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

// ─── Stage journey ────────────────────────────────────────────────────────────

type StageValue = "Inquiry" | "Touring" | "Proposal" | "LOI" | "Legal" | "Lease Out" | "Executed"

const ALL_STAGES: StageValue[] = ["Inquiry", "Touring", "Proposal", "LOI", "Legal", "Lease Out", "Executed"]

function StageJourneyBar({ currentStage }: { currentStage: StageValue }) {
  const currentIdx = ALL_STAGES.indexOf(currentStage)

  return (
    <div className={cn(cardBase, "py-5")}>
      <div className="flex items-center">
        {ALL_STAGES.map((stage, i) => {
          const isPast   = i < currentIdx
          const isActive = stage === currentStage
          const isFuture = i > currentIdx

          return (
            <React.Fragment key={stage}>
              {i > 0 && (
                <div className={cn("flex-1 h-px", isPast ? "bg-primary" : "bg-border")} />
              )}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center border-2 transition-colors",
                  isActive && "bg-primary border-primary",
                  isPast   && "bg-primary/10 border-primary",
                  isFuture && "bg-muted border-border",
                )}>
                  {isPast   && <Check className="h-3 w-3 text-primary" />}
                  {isActive && <span className="h-2 w-2 rounded-full bg-primary-foreground" />}
                </div>
                <span className={cn(
                  "text-[10px] font-medium whitespace-nowrap",
                  isActive && "text-primary font-semibold",
                  isPast   && "text-muted-foreground",
                  isFuture && "text-muted-foreground/40",
                )}>
                  {stage}
                </span>
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

type DealStatus = "active" | "stalled" | "at-risk" | "executed"

const STATUS_CONFIG: Record<DealStatus, { label: string; Icon: React.ElementType; cls: string }> = {
  active:    { label: "Active",   Icon: CheckCircle2,  cls: "text-success bg-success/10 border-success/20" },
  stalled:   { label: "Stalled",  Icon: Clock,         cls: "text-warning bg-warning/10 border-warning/20" },
  "at-risk": { label: "At Risk",  Icon: AlertTriangle, cls: "text-destructive bg-destructive/10 border-destructive/20" },
  executed:  { label: "Executed", Icon: CheckCircle2,  cls: "text-success bg-success/10 border-success/20" },
}

function StatusBadge({ status }: { status: DealStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <Badge variant="outline" className={cn("gap-1 text-xs font-medium", cfg.cls)}>
      <cfg.Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  )
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function FieldRow({ icon: Icon, label, children }: { icon?: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-0">
      <div className="w-4 shrink-0 mt-0.5">
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground" />}
      </div>
      <span className="text-xs text-muted-foreground w-32 shrink-0 pt-px">{label}</span>
      <div className="text-sm text-foreground font-medium flex-1">{children}</div>
    </div>
  )
}

function OverviewTab({ deal }: { deal: Deal }) {
  const stageIdx = ALL_STAGES.indexOf(deal.stage as StageValue)

  return (
    <div>
      <FieldRow icon={User}      label="Tenant">  {deal.tenant}                                 </FieldRow>
      <FieldRow icon={Building2} label="Asset">   {deal.asset}                                  </FieldRow>
      <FieldRow icon={MapPin}    label="Space">   {deal.space}                                  </FieldRow>
      <FieldRow icon={Ruler}     label="Size">    {deal.sf.toLocaleString()} sf                 </FieldRow>
      <FieldRow icon={Tag}       label="Type">    {deal.dealType}                               </FieldRow>
      {deal.contact && <FieldRow icon={User} label="Contact">{deal.contact}</FieldRow>}
      <FieldRow label="Status"><StatusBadge status={deal.status as DealStatus} /></FieldRow>

      {stageIdx >= 0 && (
        <>
          <FieldRow label="Source">Email inbound · CBRE</FieldRow>
          <FieldRow label="Requirements">18,000 sf · Open floor plan · Downtown location preferred</FieldRow>
        </>
      )}
      {stageIdx >= 1 && (
        <>
          <FieldRow icon={Calendar} label="Tour Date">Sep 3, 2026 · 10:00 AM</FieldRow>
          <FieldRow label="Spaces Toured">Suite 0800 – Floor 8, Suite 0900 – Floor 9</FieldRow>
        </>
      )}
      {stageIdx >= 2 && (
        <>
          <FieldRow label="Asking Rent">$98.00 PSF/yr</FieldRow>
          <FieldRow label="TI Package">$75.00 PSF</FieldRow>
          <FieldRow label="Lease Term">7 years</FieldRow>
        </>
      )}
      {stageIdx >= 3 && (
        <>
          <FieldRow icon={Calendar} label="LOI Date">Oct 15, 2026</FieldRow>
          <FieldRow label="LOI Terms">$94.00 PSF · 7 yrs · $80 TI · 4 mo free rent</FieldRow>
          <FieldRow label="Counters">1 counter received</FieldRow>
        </>
      )}
      {stageIdx >= 4 && (
        <>
          <FieldRow icon={Calendar} label="Execution Target">Dec 1, 2026</FieldRow>
          <FieldRow label="Legal Counsel">Skadden Arps (Tenant) · Willkie Farr (Landlord)</FieldRow>
        </>
      )}
      {stageIdx >= 5 && (
        <>
          <FieldRow icon={Calendar} label="Execution Date">Dec 15, 2026</FieldRow>
          <FieldRow icon={Calendar} label="Effective Date">Jan 1, 2027</FieldRow>
        </>
      )}
    </div>
  )
}

// ─── Documents tab ────────────────────────────────────────────────────────────

type DocItem = { name: string; type: string; date: string }

function getDocuments(stage: StageValue): DocItem[] {
  const stageIdx = ALL_STAGES.indexOf(stage)
  const docs: DocItem[] = [
    { name: "Amazon Inquiry Email.pdf",       type: "Correspondence", date: "Aug 25, 2026" },
    { name: "VTS Tower Floorplan – FL8.pdf",  type: "Floor Plan",     date: "Aug 25, 2026" },
  ]
  if (stageIdx >= 1) {
    docs.push({ name: "Tour Confirmation – Sep 3.pdf", type: "Correspondence", date: "Aug 28, 2026" })
    docs.push({ name: "Suite 0800 Space Plan.pdf",     type: "Floor Plan",     date: "Sep 3, 2026"  })
  }
  if (stageIdx >= 2) {
    docs.push({ name: "Proposal 1 – VTS Tower.pdf",   type: "Proposal",       date: "Sep 18, 2026" })
  }
  if (stageIdx >= 3) {
    docs.push({ name: "Letter of Intent – Amazon.pdf", type: "LOI",            date: "Oct 15, 2026" })
  }
  return docs
}

function DocumentsTab({ deal }: { deal: Deal }) {
  const docs = getDocuments(deal.stage as StageValue)
  return (
    <div>
      {docs.map((doc, i) => (
        <div key={i} className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{doc.date}</p>
          </div>
          <Badge variant="secondary" className="text-[10px] shrink-0">{doc.type}</Badge>
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
    </div>
  )
}

// ─── Requirements tab ─────────────────────────────────────────────────────────

function RequirementsTab() {
  return (
    <div>
      <FieldRow label="Size Range">16,000 – 20,000 sf</FieldRow>
      <FieldRow label="Floors">6th floor or above</FieldRow>
      <FieldRow label="Target Occupancy">Q1 2027</FieldRow>
      <FieldRow label="Budget / SF">Up to $100.00 PSF/yr</FieldRow>
      <FieldRow label="Special Requirements">Dedicated server room · Open plan · 4:1,000 parking ratio</FieldRow>
    </div>
  )
}

// ─── Activity feed ────────────────────────────────────────────────────────────

type FeedEntry = { initials: string; name: string; timestamp: string; message: string; kind: "update" | "comment" }

const AMAZON_FEED: FeedEntry[] = [
  { initials: "SO",  name: "Sarah Okonkwo", timestamp: "Today · 9:14 AM", message: "Confirmed with the Amazon team — they want to move forward. Initial tour request submitted for Sep 3.",                          kind: "comment" },
  { initials: "VTS", name: "VTS System",    timestamp: "Today · 9:02 AM", message: "Deal created from inbound email. Stage set to Inquiry.",                                                                           kind: "update"  },
  { initials: "RC",  name: "Ryan Chen",     timestamp: "Today · 8:55 AM", message: "Forwarded the inquiry to Sarah Okonkwo at CBRE. She'll coordinate the tour schedule.",                                             kind: "comment" },
  { initials: "VTS", name: "VTS Agents",    timestamp: "Today · 8:50 AM", message: "Email parsed and matched to Amazon.com tenant record. Budget NER set to $98.00 based on current market rate.",                    kind: "update"  },
  { initials: "JL",  name: "Jessica Lee",   timestamp: "Today · 8:47 AM", message: "Received inbound inquiry from Amazon.com via email. 18,000 sf request on Floor 8, VTS Tower.",                                   kind: "comment" },
]

function ActivityFeed() {
  const [comment, setComment] = React.useState("")

  return (
    <div className="flex flex-col h-full gap-4">
      <p className="text-sm font-semibold text-foreground">Activity</p>

      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {AMAZON_FEED.map((entry, i) => (
          <div key={i} className={cn(
            "rounded-lg px-3 py-3 space-y-1.5",
            entry.kind === "update" ? "bg-muted/50" : "bg-card border border-border"
          )}>
            <div className="flex items-center gap-2">
              <div className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-semibold shrink-0",
                entry.kind === "update" ? "bg-muted-foreground/15 text-muted-foreground" : "bg-primary/10 text-primary"
              )}>
                {entry.initials}
              </div>
              <span className="text-xs font-semibold text-foreground flex-1 min-w-0 truncate">{entry.name}</span>
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

      <Separator />

      <div className="flex gap-2 items-end">
        <Textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Add a comment…"
          className="flex-1 resize-none text-sm min-h-[60px]"
          rows={2}
        />
        <Button
          size="sm"
          disabled={!comment.trim()}
          className="shrink-0 gap-1.5"
          onClick={() => setComment("")}
        >
          <Send className="h-3.5 w-3.5" />
          Post
        </Button>
      </div>
    </div>
  )
}

// ─── Deal Health card ─────────────────────────────────────────────────────────

// Health tiers: 1 = on track · 2 = attention needed · 3 = at risk · 4 = dead/lost
// Add new statuses here without touching the component.
const HEALTH_TIERS = {
  1: { cls: "text-success bg-success/10 border-success/20",           dot: "bg-success"     },
  2: { cls: "text-warning bg-warning/10 border-warning/20",           dot: "bg-warning"     },
  3: { cls: "text-destructive bg-destructive/10 border-destructive/20", dot: "bg-destructive" },
  4: { cls: "text-muted-foreground bg-muted/60 border-border",        dot: "bg-muted-foreground" },
} as const

type HealthTier = keyof typeof HEALTH_TIERS

const HEALTH_STATUSES: Record<string, { tier: HealthTier; label: string }> = {
  "on-track":        { tier: 1, label: "On Track"        },
  "closing":         { tier: 1, label: "Closing"         },
  "needs-follow-up": { tier: 2, label: "Needs Follow-Up" },
  "stalled":         { tier: 2, label: "Stalled"         },
  "at-risk":         { tier: 3, label: "At Risk"         },
  "disengaged":      { tier: 3, label: "Disengaged"      },
  "dormant":         { tier: 4, label: "Dormant"         },
  "closed-lost":     { tier: 4, label: "Closed Lost"     },
}

const DEAL_HEALTH_WHY = [
  "Email thread active in the last 72 hours with Sarah Okonkwo at CBRE",
  "Tour confirmed for Sep 3 — calendar invite accepted by all parties",
  "No counter-proposal overdue; last response received within SLA",
  "No competing deal detected for this space at this stage",
  "Tenant has not engaged with any competing properties in Market data",
]

const DEAL_HEALTH_RECOMMENDATIONS = [
  { action: "Send tour confirmation recap", urgency: "Today" },
  { action: "Prepare proposal draft for post-tour follow-up", urgency: "This week" },
]

function DealHealthCard() {
  const [open, setOpen] = React.useState(false)
  const statusKey = "on-track"
  const { tier, label } = HEALTH_STATUSES[statusKey]
  const cfg = HEALTH_TIERS[tier]

  return (
    <div className={cn(cardBase, "flex flex-col gap-3")}>
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
          <HeartPulse className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Deal Health Agent</p>
          <p className="text-sm font-semibold text-foreground leading-tight mt-0.5">This deal is progressing normally. No action required.</p>
        </div>
        <Badge variant="outline" className={cn("shrink-0 gap-1.5 font-medium", cfg.cls)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
          {label}
        </Badge>
      </div>

      {/* Recommendations */}
      <div className="flex flex-wrap gap-2">
        {DEAL_HEALTH_RECOMMENDATIONS.map(r => (
          <div key={r.action} className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5">
            <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
            <span className="text-xs text-foreground">{r.action}</span>
            <span className="text-[10px] text-muted-foreground">{r.urgency}</span>
          </div>
        ))}
      </div>

      {/* Why toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors w-fit"
      >
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", open && "rotate-180")} />
        {open ? "Hide reasoning" : "Why"}
      </button>

      {open && (
        <div className="flex flex-col gap-1.5 pt-1 border-t border-border/60">
          <p className="text-xs font-semibold text-foreground mb-1">Signals Used</p>
          {DEAL_HEALTH_WHY.map((signal, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-foreground/80 leading-snug">
              <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
              {signal}
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
  const [tab, setTab] = React.useState("overview")
  return (
    <div className="flex flex-col gap-4 mt-4 pb-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-xs text-muted-foreground px-1">
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

      {/* Stage journey */}
      <StageJourneyBar currentStage={deal.stage as StageValue} />

      {/* Deal Health */}
      <DealHealthCard />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

        {/* Left: tabbed detail */}
        <div className={cn(cardBase, "lg:col-span-2")}>
          <ToggleGroup type="single" value={tab} onValueChange={v => v && setTab(v as string)}
            className={cn(FILTER_TAB_GROUP_CLS, "w-full mb-4")}>
            <ToggleGroupItem value="overview"     size="sm" className={cn(FILTER_TAB_ITEM_CLS, "flex-1")}>Overview</ToggleGroupItem>
            <ToggleGroupItem value="documents"    size="sm" className={cn(FILTER_TAB_ITEM_CLS, "flex-1")}>Documents</ToggleGroupItem>
            <ToggleGroupItem value="requirements" size="sm" className={cn(FILTER_TAB_ITEM_CLS, "flex-1")}>Requirements</ToggleGroupItem>
          </ToggleGroup>
          {tab === "overview"     && <OverviewTab deal={deal} />}
          {tab === "documents"    && <DocumentsTab deal={deal} />}
          {tab === "requirements" && <RequirementsTab />}
        </div>

        {/* Right: activity feed */}
        <div className={cn(cardBase, "flex flex-col min-h-[520px]")}>
          <ActivityFeed />
        </div>

      </div>
    </div>
  )
}
