import * as React from "react"
import { cn, cardBase } from "@/lib/utils"

const CardCtx = React.createContext(cardBase)
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FilterBar, toggleFilterValue, clearFilterKey } from "@/components/filter-chip"
import {
  Sparkle, Search, Settings2, GripVertical, Eye, EyeOff,
  ChevronLeft, ChevronRight, AlertTriangle, Clock,
  CheckCircle2,
} from "lucide-react"
import { AgentBtn } from "@/components/agent-btn"
import { getLatestHumanUpdate, getEncumbranceCount } from "@/components/deal-profile"
import { KpiBar } from "@/components/kpi-bar"
import {
  Table, TableHeader, TableBody, TableRow, TableCell,
  SortableHead, useSortState,
} from "@/components/sortable-table"

// ── Tenant logos ─────────────────────────────────────────────────────────────

export const TENANT_LOGO: Record<string, string> = {
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
  "WeWork":                "/vts_lookfeel_nav_concept_1-0/logos/wework.png",
  "Google LLC":            "/vts_lookfeel_nav_concept_1-0/logos/google.png",
  "Tesla Inc.":            "/vts_lookfeel_nav_concept_1-0/logos/tesla.png",
  "Cisco Systems":         "/vts_lookfeel_nav_concept_1-0/logos/cisco.png",
  "Salesforce Inc.":       "/vts_lookfeel_nav_concept_1-0/logos/salesforce.png",
  "BlackRock":             "/vts_lookfeel_nav_concept_1-0/logos/blackrock.png",
  "Goldman Sachs":         "/vts_lookfeel_nav_concept_1-0/logos/goldmansachs.png",
  "McKinsey & Co.":        "/vts_lookfeel_nav_concept_1-0/logos/mckinsey.png",
  "Spotify":               "/vts_lookfeel_nav_concept_1-0/logos/spotify.png",
  "Airbnb":                "/vts_lookfeel_nav_concept_1-0/logos/airbnb.png",
  "Stripe":                "/vts_lookfeel_nav_concept_1-0/logos/stripe.png",
  "Twitter/X":             "/vts_lookfeel_nav_concept_1-0/logos/x.png",
  "Uber Technologies":     "/vts_lookfeel_nav_concept_1-0/logos/uber.png",
  "Microsoft":             "/vts_lookfeel_nav_concept_1-0/logos/microsoft.png",
  "Meta Platforms":        "/vts_lookfeel_nav_concept_1-0/logos/meta.png",
  "Apex Capital":          "",
  "Meridian Health":       "",
  "Atlas Group":           "",
  "Vertex Studios":        "",
  "Bluewave LLC":          "",
}

function TenantAvatar({ name }: { name: string }) {
  const [failed, setFailed] = React.useState(false)
  const src = TENANT_LOGO[name]
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className="h-7 w-7 rounded-full object-contain bg-background ring-1 ring-border/30 shrink-0"
      />
    )
  }
  return (
    <div
      className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-medium text-primary-foreground shrink-0 ring-1 ring-border/30 bg-primary/80"
    >
      {initials}
    </div>
  )
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Stage = "Inquiry" | "Touring" | "Proposal" | "LOI" | "Legal" | "Lease Out" | "Executed"
type Status = "active" | "stalled" | "at-risk" | "executed"
type DealType = "New Deal" | "Renewal" | "Expansion"

export interface Deal {
  id: string
  tenant: string
  dealType: DealType
  asset: string
  space: string
  sf: number
  stage: Stage
  status: Status
  ner: number
  budgetNer: number
  noi: number
  budgetNoi: number
  lastUpdated: string
  contact?: string
  note?: string
  stalledDays?: number
  term?: number
}

// ── Mock data ─────────────────────────────────────────────────────────────────

export const DEALS: Deal[] = [
  { id:"d00", tenant:"Amazon.com",           dealType:"New Deal",  asset:"VTS Tower",            space:"Suite 0800 – Floor 8", sf:18000,  stage:"Inquiry",   status:"active",   ner:0,     budgetNer:98.00, noi:0,        budgetNoi:1764000,  lastUpdated:"2026-08-25", contact:"Sarah Okonkwo · CBRE" },
  { id:"d01", tenant:"Starbucks Corporation",dealType:"New Deal",  asset:"VTS Tower HQ",          space:"Suite 800",            sf:28500,  stage:"Legal",     status:"active",   ner:52.00, budgetNer:50.00, noi:1482000,  budgetNoi:1425000,  lastUpdated:"2026-07-14", term:84,  contact:"Sarah Chen" },
  { id:"d02", tenant:"Apex Capital",         dealType:"Renewal",   asset:"Empire State Bldg",     space:"Floor 12",             sf:45000,  stage:"Proposal",  status:"active",   ner:48.00, budgetNer:52.00, noi:2160000,  budgetNoi:2340000,  lastUpdated:"2026-07-10", term:60,  contact:"Mark Torres",  note:"Counter awaiting response" },
  { id:"d03", tenant:"Meridian Health",      dealType:"New Deal",  asset:"VTS Tower HQ",          space:"Suite 1800",           sf:33000,  stage:"Lease Out", status:"stalled",  ner:55.00, budgetNer:55.00, noi:1815000,  budgetNoi:1815000,  lastUpdated:"2026-06-26", term:120, contact:"Priya Nair",   stalledDays:18 },
  { id:"d04", tenant:"Atlas Group",          dealType:"Expansion", asset:"Salesforce Tower",      space:"Floors 2–3",           sf:61000,  stage:"Proposal",  status:"at-risk",  ner:44.00, budgetNer:50.00, noi:2684000,  budgetNoi:3050000,  lastUpdated:"2026-07-01", term:72,  contact:"James Wu",     note:"Considering competitor" },
  { id:"d05", tenant:"Vertex Studios",       dealType:"New Deal",  asset:"One Financial Plaza",   space:"Suite 600",            sf:19800,  stage:"LOI",       status:"active",   ner:58.00, budgetNer:56.00, noi:1148400,  budgetNoi:1108800,  lastUpdated:"2026-07-15", term:48,  contact:"Laura Kim" },
  { id:"d06", tenant:"Bluewave LLC",         dealType:"New Deal",  asset:"Willis Tower",          space:"Suite 300",            sf:12400,  stage:"Lease Out", status:"active",   ner:51.00, budgetNer:51.00, noi:632400,   budgetNoi:632400,   lastUpdated:"2026-07-12", term:36,  contact:"Tom Reyes" },
  { id:"d07", tenant:"Pfizer Inc.",          dealType:"Renewal",   asset:"30 Hudson Yards",       space:"Floors 18–20",         sf:88000,  stage:"LOI",       status:"active",   ner:62.00, budgetNer:60.00, noi:5456000,  budgetNoi:5280000,  lastUpdated:"2026-07-09", term:120, contact:"Anna Brooks" },
  { id:"d08", tenant:"Morgan Stanley",       dealType:"New Deal",  asset:"One World Trade Ctr",   space:"Suite 2200",           sf:54000,  stage:"Touring",   status:"active",   ner:0,     budgetNer:68.00, noi:0,        budgetNoi:3672000,  lastUpdated:"2026-07-13", term:84,  contact:"Derek Chan" },
  { id:"d09", tenant:"Deloitte LLP",         dealType:"Expansion", asset:"VTS Tower HQ",          space:"Suite 500",            sf:43000,  stage:"Legal",     status:"active",   ner:72.00, budgetNer:70.00, noi:3096000,  budgetNoi:3010000,  lastUpdated:"2026-07-15", term:60,  contact:"Sandra Li" },
  { id:"d10", tenant:"KPMG",                 dealType:"Renewal",   asset:"Empire State Bldg",     space:"Suite 3400",           sf:117000, stage:"Proposal",  status:"stalled",  ner:49.00, budgetNer:55.00, noi:5733000,  budgetNoi:6435000,  lastUpdated:"2026-06-20", term:96,  contact:"Paul Simmons", stalledDays:26, note:"Waiting on board approval" },
  { id:"d11", tenant:"Ernst & Young",        dealType:"New Deal",  asset:"Salesforce Tower",      space:"Suite 2200",           sf:80100,  stage:"Proposal",  status:"active",   ner:58.00, budgetNer:57.00, noi:4645800,  budgetNoi:4565700,  lastUpdated:"2026-07-08", term:72,  contact:"Claire Marsh" },
  { id:"d12", tenant:"HSBC Holdings",        dealType:"Renewal",   asset:"One Financial Plaza",   space:"Suite 900",            sf:69300,  stage:"Inquiry",   status:"active",   ner:0,     budgetNer:42.00, noi:0,        budgetNoi:2910600,  lastUpdated:"2026-07-14", contact:"Frank Lee" },
  { id:"d13", tenant:"Latham & Watkins",     dealType:"New Deal",  asset:"30 Hudson Yards",       space:"Floors 14–15",         sf:119000, stage:"LOI",       status:"at-risk",  ner:65.00, budgetNer:66.00, noi:7735000,  budgetNoi:7854000,  lastUpdated:"2026-07-03", term:60,  contact:"Grace Yu",     note:"Competitor offering lower TI" },
  { id:"d14", tenant:"JPMorgan Chase",       dealType:"Expansion", asset:"VTS Tower HQ",          space:"Floor 6",              sf:55800,  stage:"Legal",     status:"active",   ner:75.00, budgetNer:72.00, noi:4185000,  budgetNoi:4017600,  lastUpdated:"2026-07-16", term:120, contact:"Ryan Patel" },
  { id:"d15", tenant:"Amazon.com",           dealType:"New Deal",  asset:"Willis Tower",          space:"Floors 4–6",           sf:150000, stage:"Touring",   status:"active",   ner:0,     budgetNer:45.00, noi:0,        budgetNoi:6750000,  lastUpdated:"2026-07-11", contact:"Mia Zhao" },
  { id:"d16", tenant:"WeWork",               dealType:"Renewal",   asset:"Transamerica Pyramid",  space:"Floors 10–12",         sf:36000,  stage:"Lease Out", status:"stalled",  ner:38.00, budgetNer:40.00, noi:1368000,  budgetNoi:1440000,  lastUpdated:"2026-06-18", term:24,  contact:"Ethan Ross",   stalledDays:28, note:"Budget constraints" },
  { id:"d17", tenant:"Google LLC",           dealType:"New Deal",  asset:"200 Berkeley Street",   space:"Floors 5–8",           sf:200000, stage:"LOI",       status:"active",   ner:82.00, budgetNer:80.00, noi:16400000, budgetNoi:16000000, lastUpdated:"2026-07-14", term:144, contact:"Nina Patel" },
  { id:"d18", tenant:"Tesla Inc.",           dealType:"New Deal",  asset:"One Peachtree Center",  space:"Suite 1100",           sf:25000,  stage:"Proposal",  status:"active",   ner:35.00, budgetNer:33.00, noi:875000,   budgetNoi:825000,   lastUpdated:"2026-07-07", term:60,  contact:"Omar Khalid" },
  { id:"d19", tenant:"Cisco Systems",        dealType:"Renewal",   asset:"Two Union Square",      space:"Floors 20–22",         sf:72000,  stage:"LOI",       status:"active",   ner:58.00, budgetNer:55.00, noi:4176000,  budgetNoi:3960000,  lastUpdated:"2026-07-10", term:84,  contact:"Jenny Park" },
  { id:"d20", tenant:"Salesforce Inc.",      dealType:"Expansion", asset:"Salesforce Tower",      space:"Floor 30",             sf:40000,  stage:"Legal",     status:"active",   ner:90.00, budgetNer:88.00, noi:3600000,  budgetNoi:3520000,  lastUpdated:"2026-07-15", term:60,  contact:"Luis Garcia" },
  { id:"d21", tenant:"BlackRock",            dealType:"New Deal",  asset:"One World Trade Ctr",   space:"Floors 50–52",         sf:95000,  stage:"Proposal",  status:"at-risk",  ner:78.00, budgetNer:80.00, noi:7410000,  budgetNoi:7600000,  lastUpdated:"2026-06-30", term:120, contact:"Kate Morrison", note:"Slow on responses" },
  { id:"d22", tenant:"Goldman Sachs",        dealType:"Renewal",   asset:"30 Hudson Yards",       space:"Floors 5–9",           sf:185000, stage:"Executed",  status:"executed", ner:88.00, budgetNer:85.00, noi:16280000, budgetNoi:15725000, lastUpdated:"2026-07-01", term:120, contact:"Adam Chen" },
  { id:"d23", tenant:"McKinsey & Co.",       dealType:"New Deal",  asset:"Empire State Bldg",     space:"Suite 4200",           sf:32000,  stage:"LOI",       status:"active",   ner:71.00, budgetNer:70.00, noi:2272000,  budgetNoi:2240000,  lastUpdated:"2026-07-13", term:72,  contact:"Tara Singh" },
  { id:"d24", tenant:"Spotify",              dealType:"New Deal",  asset:"200 Berkeley Street",   space:"Suite 700",            sf:18500,  stage:"Touring",   status:"active",   ner:0,     budgetNer:76.00, noi:0,        budgetNoi:1406000,  lastUpdated:"2026-07-15", contact:"Ben Walsh" },
  { id:"d25", tenant:"Airbnb",               dealType:"New Deal",  asset:"Salesforce Tower",      space:"Floor 25",             sf:22000,  stage:"Inquiry",   status:"active",   ner:0,     budgetNer:82.00, noi:0,        budgetNoi:1804000,  lastUpdated:"2026-07-16", contact:"Lily Chen" },
  { id:"d26", tenant:"Stripe",               dealType:"Expansion", asset:"Two Union Square",      space:"Floor 15",             sf:15000,  stage:"Proposal",  status:"active",   ner:62.00, budgetNer:60.00, noi:930000,   budgetNoi:900000,   lastUpdated:"2026-07-12", term:48,  contact:"Raj Mehta" },
  { id:"d27", tenant:"Twitter/X",            dealType:"Renewal",   asset:"Salesforce Tower",      space:"Floors 10–12",         sf:65000,  stage:"LOI",       status:"stalled",  ner:45.00, budgetNer:52.00, noi:2925000,  budgetNoi:3380000,  lastUpdated:"2026-06-15", term:36,  contact:"Dana Fox",     stalledDays:31, note:"Seeking major concessions" },
  { id:"d28", tenant:"Uber Technologies",    dealType:"New Deal",  asset:"One Peachtree Center",  space:"Suite 800",            sf:30000,  stage:"Proposal",  status:"active",   ner:38.00, budgetNer:36.00, noi:1140000,  budgetNoi:1080000,  lastUpdated:"2026-07-09", term:60,  contact:"Kai Brown" },
  { id:"d29", tenant:"Microsoft",            dealType:"New Deal",  asset:"One World Trade Ctr",   space:"Floors 60–65",         sf:250000, stage:"Legal",     status:"active",   ner:92.00, budgetNer:90.00, noi:23000000, budgetNoi:22500000, lastUpdated:"2026-07-14", term:180, contact:"Helen Chow" },
  { id:"d30", tenant:"Meta Platforms",       dealType:"Expansion", asset:"30 Hudson Yards",       space:"Floors 25–28",         sf:130000, stage:"Executed",  status:"executed", ner:75.00, budgetNer:73.00, noi:9750000,  budgetNoi:9490000,  lastUpdated:"2026-06-28", term:96,  contact:"Sean Park" },
]

const STAGES: Stage[] = ["Inquiry", "Touring", "Proposal", "LOI", "Legal", "Lease Out", "Executed"]

const STATUS_CONFIG: Record<Status, { label: string; icon: React.ElementType; cls: string }> = {
  active:   { label: "Active",    icon: CheckCircle2, cls: "text-success bg-success/10" },
  stalled:  { label: "Stalled",   icon: Clock,        cls: "text-warning bg-warning/10" },
  "at-risk":{ label: "At Risk",   icon: AlertTriangle,cls: "text-destructive bg-destructive/10" },
  executed: { label: "Executed",  icon: CheckCircle2, cls: "text-success bg-success/10" },
}

// ── Column definitions ────────────────────────────────────────────────────────

type SortKey = "tenant" | "sf" | "stage" | "ner" | "noi" | "lastUpdated" | "status" | "encumbrances" | "dealType" | "asset"

interface ColDef {
  id: string
  label: string
  sortable: boolean
  right?: boolean
  defaultVisible: boolean
}

const ALL_COLUMNS: ColDef[] = [
  { id: "tenant",       label: "Tenant",         sortable: true,  defaultVisible: true  },
  { id: "asset",        label: "Asset / Space",  sortable: true,  defaultVisible: true  },
  { id: "sf",           label: "Size",           sortable: true,  right: true, defaultVisible: true  },
  { id: "dealType",     label: "Deal type",      sortable: true,  defaultVisible: false },
  { id: "stage",        label: "Stage",          sortable: true,  defaultVisible: true  },
  { id: "status",       label: "Status",         sortable: true,  defaultVisible: true  },
  { id: "update",       label: "Latest update",  sortable: false, defaultVisible: true  },
  { id: "encumbrances", label: "Encumbrances",   sortable: true,  defaultVisible: true  },
  { id: "ner",          label: "NER / Budget",   sortable: true,  right: true, defaultVisible: true  },
  { id: "noi",          label: "NOI / Budget",   sortable: true,  right: true, defaultVisible: true  },
  { id: "lastUpdated",  label: "Updated",        sortable: true,  right: true, defaultVisible: true  },
  { id: "actions",      label: "",               sortable: false, defaultVisible: true  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysSince(iso: string) {
  const now = new Date("2026-07-16")
  return Math.floor((now.getTime() - new Date(iso).getTime()) / 86400000)
}

function fmtSf(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(0)}K sf` : `${n} sf`
}

function stageIndex(s: Stage) { return STAGES.indexOf(s) }

const PAGE_SIZE = 10

// ── Filter definitions ────────────────────────────────────────────────────────

const ASSETS_IN_DEALS = Array.from(new Set(DEALS.map(d => d.asset))).sort()

const FILTER_DEFS = [
  { key: "status",   label: "Status",    options: (["active","stalled","at-risk","executed"] as Status[]).map(v => ({ label: STATUS_CONFIG[v].label, value: v })) },
  { key: "stage",    label: "Stage",     options: STAGES.map(v => ({ label: v, value: v })) },
  { key: "dealType", label: "Deal type", options: (["New Deal","Renewal","Expansion"] as DealType[]).map(v => ({ label: v, value: v })) },
  { key: "asset",    label: "Asset",     options: ASSETS_IN_DEALS.map(v => ({ label: v, value: v })) },
]

// ── Column manager popover ────────────────────────────────────────────────────

function ColumnManager({
  columns, visible, order, onToggle, onReorder,
}: {
  columns: ColDef[]
  visible: Set<string>
  order: string[]
  onToggle: (id: string) => void
  onReorder: (newOrder: string[]) => void
}) {
  const [dragging, setDragging] = React.useState<string | null>(null)
  const [dragOver, setDragOver] = React.useState<string | null>(null)

  function onDragStart(id: string) { setDragging(id) }
  function onDragEnd() { setDragging(null); setDragOver(null) }
  function onDragOverItem(id: string) { setDragOver(id) }
  function onDropItem(targetId: string) {
    if (!dragging || dragging === targetId) return
    const next = [...order]
    const from = next.indexOf(dragging)
    const to   = next.indexOf(targetId)
    next.splice(from, 1)
    next.splice(to, 0, dragging)
    onReorder(next)
    setDragging(null); setDragOver(null)
  }

  const colMap = Object.fromEntries(columns.map(c => [c.id, c]))
  const manageable = order.filter(id => colMap[id]?.label)

  return (
    <Popover>
      <PopoverTrigger className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-primary text-primary text-xs font-medium bg-transparent hover:bg-primary/10 transition-colors">
        <Settings2 className="h-3.5 w-3.5" />
        Columns
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <p className="text-xs font-medium text-muted-foreground px-2 pb-2">Drag to reorder</p>
        <div className="flex flex-col gap-0.5">
          {manageable.map(id => {
            const col = colMap[id]
            if (!col) return null
            const isVisible = visible.has(id)
            return (
              <div
                key={id}
                draggable
                onDragStart={() => onDragStart(id)}
                onDragEnd={onDragEnd}
                onDragOver={e => { e.preventDefault(); onDragOverItem(id) }}
                onDrop={() => onDropItem(id)}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-grab active:cursor-grabbing select-none",
                  dragOver === id && dragging !== id ? "bg-primary/10" : "hover:bg-muted/60"
                )}
              >
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                <span className="flex-1 text-sm text-foreground">{col.label}</span>
                <button
                  onClick={() => onToggle(id)}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ── Pipeline viz ──────────────────────────────────────────────────────────────

function PipelineViz({ deals, className }: { deals: Deal[]; className?: string }) {
  const byStageCounts = STAGES.map(s => ({
    stage: s,
    count: deals.filter(d => d.stage === s).length,
    sf: deals.filter(d => d.stage === s).reduce((a, d) => a + d.sf, 0),
    atRisk:  deals.filter(d => d.stage === s && d.status === "at-risk").length,
    stalled: deals.filter(d => d.stage === s && d.status === "stalled").length,
  }))
  const maxCount = Math.max(...byStageCounts.map(s => s.count), 1)
  const card = React.useContext(CardCtx)

  return (
    <div className={cn(card, "flex flex-col", className)}>
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">Deal Pipeline</p>
          <h2 className="text-xl font-semibold text-foreground">
            {deals.filter(d => d.stage !== "Executed").length} active deals
            <span className="text-muted-foreground font-normal text-base ml-2">· {fmtSf(deals.filter(d => d.stage !== "Executed").reduce((a, d) => a + d.sf, 0))} in pipeline</span>
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-destructive/70" />At Risk</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-warning/70" />Stalled</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-success/80" />Active</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-primary/80" />Executed</span>
        </div>
      </div>

      <div className="flex items-end gap-2 flex-1 min-h-0 mt-5">
        {byStageCounts.map(({ stage, count, sf, atRisk, stalled }) => {
          const active = count - atRisk - stalled
          const isExecuted = stage === "Executed"
          return (
            <React.Fragment key={stage}>
              {isExecuted && <div className="w-px self-stretch bg-border/50 mx-1" />}
              <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="text-xs font-medium text-muted-foreground tabular-nums">{count > 0 ? count : ""}</div>
                <div className="w-full relative px-1.5" style={{ height: `${Math.max(count / maxCount * 100, count > 0 ? 4 : 1)}%` }}>
                  <div className="w-full h-full rounded-t-md overflow-hidden flex flex-col-reverse">
                    {active  > 0 && <div className={cn("w-full", isExecuted ? "bg-primary" : "bg-success")} style={{ height: `${(active / count) * 100}%` }} />}
                    {stalled > 0 && <div className="w-full bg-warning/70"  style={{ height: `${(stalled / count) * 100}%` }} />}
                    {atRisk  > 0 && <div className="w-full bg-destructive/70" style={{ height: `${(atRisk / count) * 100}%` }} />}
                    {count === 0 && <div className="w-full h-1 bg-border rounded" />}
                  </div>
                </div>
                <div className="text-xs text-center leading-tight font-medium text-muted-foreground">{stage}</div>
                {sf > 0 && <div className="text-[10px] text-muted-foreground/70">{fmtSf(sf)}</div>}
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

// ── AI insight card ───────────────────────────────────────────────────────────

const AI_ACTIONS = [
  { text: "4 deals stalling 20+ days",   value: "276K sf",   data: "Atlas Group, KPMG, WeWork, Twitter/X" },
  { text: "3 at-risk deals need review", value: "3 at-risk", data: "BlackRock, Atlas Group, Latham & Watkins" },
  { text: "LOI+ pipeline upside",        value: "+$89K/mo",  data: "Top 5 LOI deals on track to execute" },
]

function AiInsightCard() {
  const card = React.useContext(CardCtx)
  const isV2 = card !== cardBase
  return (
    <div className={cn(
      isV2
        ? "border border-sidebar-border bg-sidebar flex flex-col gap-0"
        : cn(card, "border-transparent flex flex-col gap-4 bg-sidebar-accent")
    )}>
      <div className={cn("flex items-center justify-between gap-2", isV2 ? "px-4 py-3 border-b border-sidebar-border" : "")}>
        <div className={cn("flex items-center gap-2.5", !isV2 && "flex-col items-start gap-0")}>
          {isV2 && <div className="h-7 w-7 bg-ai/20 flex items-center justify-center shrink-0">
            <Sparkle className="h-4 w-4 text-sidebar-primary" />
          </div>}
          {!isV2 && <p className="text-[10px] font-medium uppercase tracking-widest mb-1 text-sidebar-foreground/70">VTS agents</p>}
          <p className={cn("font-medium text-sidebar-foreground", isV2 ? "text-sm" : "text-xl font-medium")}>
            {isV2 ? "Ask VTS" : "Deal intelligence"}
          </p>
        </div>
      </div>

      <div className={cn("flex items-center gap-2", isV2 ? "px-4 py-2.5 border-b border-sidebar-border" : "rounded-lg px-3 py-2 bg-sidebar-foreground/10")}>
        <Sparkle className="h-4 w-4 shrink-0 text-sidebar-primary" />
        <p className="text-sm leading-snug text-sidebar-foreground/70">
          3 deal risks identified: <span className="text-sidebar-primary font-medium">$1.8M NOI at risk</span>
        </p>
      </div>

      <div className={cn("flex flex-col", isV2 ? "" : "gap-2")}>
        {AI_ACTIONS.map((item, i) => (
          <div key={i} className={cn(
            "group/row",
            isV2
              ? "flex items-center gap-3 px-4 py-3 border-b border-sidebar-border/50 last:border-0 hover:bg-sidebar-accent/40 transition-colors"
              : "flex items-center gap-3 rounded-lg border border-primary/25 bg-primary/15 px-3 py-2.5 agent-row"
          )}>
            <Sparkle className="h-3.5 w-3.5 shrink-0 text-sidebar-primary" />
            <p className="text-sm text-sidebar-foreground/85 flex-1 min-w-0 truncate">{item.text}</p>
            <div className="relative shrink-0">
              <span className="text-sm font-medium tabular-nums text-sidebar-primary transition-opacity duration-150 group-hover/row:opacity-0">{item.value}</span>
              <AgentBtn variant="run" label={`${item.text} · ${item.value}${item.data ? ` · ${item.data}` : ""}`} className="absolute inset-y-0 right-0 opacity-0 group-hover/row:opacity-100 transition-opacity duration-150 my-auto h-auto py-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── KPI summary ───────────────────────────────────────────────────────────────

function KpiSummary({ deals }: { deals: Deal[] }) {
  const active = deals.filter(d => d.status !== "executed")
  const totalSf = active.reduce((a, d) => a + d.sf, 0)
  const withNer = active.filter(d => d.ner > 0)
  const avgNer = withNer.length ? withNer.reduce((a, d) => a + d.ner, 0) / withNer.length : 0
  const atRisk = deals.filter(d => d.status === "at-risk").length
  const stalled = deals.filter(d => d.status === "stalled").length
  const executed = deals.filter(d => d.stage === "Executed").length

  return (
    <KpiBar kpis={[
      { label: "Active deals",   value: String(active.length),   subtitle: `${executed} executed this month` },
      { label: "Pipeline SF",    value: fmtSf(totalSf),          subtitle: "across active pipeline" },
      { label: "Avg NER / sf",   value: `$${avgNer.toFixed(0)}`, subtitle: "active deals only", trend: avgNer >= 60 ? "up" : "down" },
      {
        label: "Need attention",
        value: String(atRisk + stalled),
        subtitleNode: (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", STATUS_CONFIG["at-risk"].cls)}>{atRisk} At Risk</span>
            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", STATUS_CONFIG["stalled"].cls)}>{stalled} Stalled</span>
          </div>
        ),
      },
    ]} />
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function DealsPage({ onDealClick }: { onDealClick?: (deal: Deal) => void }) {
  const card = cardBase
  const [keyword, setKeyword] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({})
  const { sortKey, sortDir, handleSort: _handleSort } = useSortState<SortKey>("lastUpdated", "desc")
  const [page, setPage] = React.useState(1)

  // Column visibility + order
  const [visible, setVisible] = React.useState<Set<string>>(
    () => new Set(ALL_COLUMNS.filter(c => c.defaultVisible).map(c => c.id))
  )
  const [colOrder, setColOrder] = React.useState<string[]>(
    () => ALL_COLUMNS.map(c => c.id)
  )

  function toggleCol(id: string) {
    setVisible(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  function onFilterToggle(key: string, value: string) { setActiveFilters(prev => toggleFilterValue(prev, key, value)); setPage(1) }
  function onFilterClear(key: string) { setActiveFilters(prev => clearFilterKey(prev, key)); setPage(1) }
  function onClearAll() { setActiveFilters({}); setPage(1) }

  const filtered = React.useMemo(() => {
    let r = [...DEALS]
    if (keyword) {
      const q = keyword.toLowerCase()
      r = r.filter(d => d.tenant.toLowerCase().includes(q) || d.asset.toLowerCase().includes(q) || d.space.toLowerCase().includes(q))
    }
    for (const [key, values] of Object.entries(activeFilters)) {
      if (!values.length) continue
      r = r.filter(d => values.includes(String(d[key as keyof Deal])))
    }
    r.sort((a, b) => {
      let av: string | number, bv: string | number
      if (sortKey === "stage")             { av = stageIndex(a.stage); bv = stageIndex(b.stage) }
      else if (sortKey === "tenant")       { av = a.tenant.toLowerCase(); bv = b.tenant.toLowerCase() }
      else if (sortKey === "status")       { av = a.status; bv = b.status }
      else if (sortKey === "encumbrances") { av = getEncumbranceCount(a.id); bv = getEncumbranceCount(b.id) }
      else if (sortKey === "asset")        { av = a.asset.toLowerCase(); bv = b.asset.toLowerCase() }
      else if (sortKey === "dealType")     { av = a.dealType; bv = b.dealType }
      else                                 { av = a[sortKey] as number | string; bv = b[sortKey] as number | string }
      if (av < bv) return sortDir === "asc" ? -1 : 1
      if (av > bv) return sortDir === "asc" ? 1 : -1
      return 0
    })
    return r
  }, [keyword, activeFilters, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSort(key: SortKey) { _handleSort(key); setPage(1) }

  const orderedCols = colOrder
    .map(id => ALL_COLUMNS.find(c => c.id === id))
    .filter((c): c is ColDef => !!c && visible.has(c.id))

  return (
    <CardCtx.Provider value={card}>
    <div className="space-y-4">
      <KpiSummary deals={DEALS} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        <div className="md:col-span-2 flex">
          <PipelineViz deals={DEALS} className="flex-1" />
        </div>
        <AiInsightCard />
      </div>

      {/* Deals table */}
      <div className={cn(card)}>
        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={keyword}
              onChange={e => { setKeyword(e.target.value); setPage(1) }}
              placeholder="Search tenant, asset…"
              className="pl-8 h-8 text-sm w-48"
            />
          </div>
          <FilterBar
            filters={FILTER_DEFS}
            active={activeFilters}
            onToggle={onFilterToggle}
            onClear={onFilterClear}
            onClearAll={onClearAll}
            visibleCount={4}
          />
          <div className="ml-auto">
            <ColumnManager
              columns={ALL_COLUMNS}
              visible={visible}
              order={colOrder}
              onToggle={toggleCol}
              onReorder={setColOrder}
            />
          </div>
        </div>

        {/* Table */}
        <Table className="border-collapse">
          <TableHeader>
            <TableRow className="border-b-2 border-border/60 hover:bg-transparent">
              {orderedCols.map(col => (
                <SortableHead
                  key={col.id}
                  col={col.sortable ? col.id as SortKey : null}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                  right={col.right}
                  className={col.right ? "pl-3" : col.id === "tenant" ? undefined : "pl-4"}
                >
                  {col.label}
                </SortableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 && (
              <TableRow><TableCell colSpan={orderedCols.length} className="py-10 text-center text-sm text-muted-foreground">No deals match your filters.</TableCell></TableRow>
            )}
            {paginated.map((deal, i) => {
              const days = daysSince(deal.lastUpdated)
              const stale = days >= 14
              const statusCfg = STATUS_CONFIG[deal.status]
              const nerDiff = deal.ner - deal.budgetNer
              const nerPct = deal.budgetNer > 0 ? Math.round((nerDiff / deal.budgetNer) * 100) : 0
              const noiDiff = deal.noi - deal.budgetNoi
              const noiPct = deal.budgetNoi > 0 ? Math.round((noiDiff / deal.budgetNoi) * 100) : 0
              function fmtNoi(n: number) { return n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K` }
              return (
                <TableRow key={deal.id} onClick={() => onDealClick?.(deal)} className={cn("cursor-pointer hover:bg-muted/40 transition-colors", i > 0 ? "border-t border-border/40" : "border-0")}>
                  {orderedCols.map(col => {
                    switch (col.id) {
                      case "tenant":
                        return (
                          <TableCell key="tenant" className="py-3">
                            <div className="flex items-center gap-2.5">
                              <TenantAvatar name={deal.tenant} />
                              <div>
                                <div className="font-medium text-foreground">{deal.tenant}</div>
                                <div className="text-[11px] text-muted-foreground">{deal.dealType}</div>
                              </div>
                            </div>
                          </TableCell>
                        )
                      case "asset":
                        return (
                          <TableCell key="asset" className="py-3 pl-4">
                            <div className="text-foreground/80 truncate max-w-[140px]">{deal.asset}</div>
                            <div className="text-[11px] text-muted-foreground">{deal.space}</div>
                          </TableCell>
                        )
                      case "sf":
                        return <TableCell key="sf" className="py-3 pl-4 text-right tabular-nums font-medium text-foreground whitespace-nowrap">{fmtSf(deal.sf)}</TableCell>
                      case "dealType":
                        return <TableCell key="dealType" className="py-3 pl-4 text-sm text-foreground/80 whitespace-nowrap">{deal.dealType}</TableCell>
                      case "stage":
                        return (
                          <TableCell key="stage" className="py-3 pl-4 whitespace-nowrap">
                            <div className="flex gap-1">
                              {STAGES.map(s => (
                                <span key={s} className={cn(
                                  "h-1.5 w-4 rounded-full transition-colors",
                                  stageIndex(s) <= stageIndex(deal.stage) ? "bg-primary" : "bg-muted-foreground/20"
                                )} />
                              ))}
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{deal.stage}</div>
                          </TableCell>
                        )
                      case "status":
                        return (
                          <TableCell key="status" className="py-3 pl-4">
                            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", statusCfg.cls)}>
                              {statusCfg.label}
                            </span>
                          </TableCell>
                        )
                      case "update":
                        return (
                          <TableCell key="update" className="py-3 pl-4 whitespace-normal max-w-[220px]">
                            {(() => {
                              const u = getLatestHumanUpdate(deal.id, deal.stage)
                              if (!u) return <span className="text-muted-foreground/40 text-xs">—</span>
                              return (
                                <div>
                                  <span className="text-xs text-foreground/80 line-clamp-2 leading-normal">{u.message}</span>
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    <span className="font-semibold text-foreground/70">{u.name}</span>
                                    {" · "}{u.timestamp}
                                  </div>
                                </div>
                              )
                            })()}
                          </TableCell>
                        )
                      case "encumbrances":
                        return (
                          <TableCell key="encumbrances" className="py-3 pl-4 whitespace-nowrap">
                            <div className="flex items-center justify-center">
                              {(() => {
                                const count = getEncumbranceCount(deal.id)
                                if (count === 0) return <span className="text-muted-foreground/40 text-xs">—</span>
                                return (
                                  <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-sm font-bold bg-destructive text-white tabular-nums">{count}</span>
                                )
                              })()}
                            </div>
                          </TableCell>
                        )
                      case "ner":
                        return (
                          <TableCell key="ner" className="py-3 pl-3 text-right tabular-nums whitespace-nowrap">
                            {deal.ner > 0 ? (
                              <div className="text-right tabular-nums">
                                <div className="text-sm font-medium text-foreground">${deal.ner.toFixed(2)}</div>
                                <div className={cn("text-[10px] font-medium", nerDiff >= 0 ? "text-success" : "text-destructive")}>
                                  {nerDiff >= 0 ? "+" : ""}{nerPct}% vs ${deal.budgetNer.toFixed(2)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/50 text-xs">—</span>
                            )}
                          </TableCell>
                        )
                      case "noi":
                        return (
                          <TableCell key="noi" className="py-3 pl-3 text-right tabular-nums whitespace-nowrap">
                            {deal.noi > 0 ? (
                              <div className="text-right tabular-nums">
                                <div className="text-sm font-medium text-foreground">{fmtNoi(deal.noi)}</div>
                                <div className={cn("text-[10px] font-medium", noiDiff >= 0 ? "text-success" : "text-destructive")}>
                                  {noiDiff >= 0 ? "+" : ""}{noiPct}% vs {fmtNoi(deal.budgetNoi)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/50 text-xs">—</span>
                            )}
                          </TableCell>
                        )
                      case "lastUpdated":
                        return (
                          <TableCell key="lastUpdated" className="py-3 pl-4 text-right">
                            <span className={cn("text-xs tabular-nums", stale ? "text-warning font-medium" : "text-muted-foreground")}>
                              {days === 0 ? "Today" : days === 1 ? "1d ago" : `${days}d ago`}
                            </span>
                          </TableCell>
                        )
                      case "actions":
                        return (
                          <TableCell key="actions" className="py-3 pl-2">
                            <AgentBtn entity="Deal" label={`${deal.tenant} — ${deal.dealType} · ${deal.sf.toLocaleString()} sf, ${deal.space} at ${deal.asset} · stage: ${deal.stage}${deal.note ? ` · ${deal.note}` : ""}`} />
                          </TableCell>
                        )
                      default:
                        return null
                    }
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
          <span className="text-xs text-muted-foreground">
            {filtered.length === 0 ? "0 deals" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <Button key={p} variant={p === page ? "default" : "outline"} size="sm" className="h-7 w-7 p-0 text-xs" onClick={() => setPage(p)}>{p}</Button>
            ))}
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
    </CardCtx.Provider>
  )
}
