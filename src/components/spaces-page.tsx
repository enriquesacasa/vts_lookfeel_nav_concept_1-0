import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { getSpaceEncumbranceCount } from "@/components/deal-profile"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FilterBar, toggleFilterValue, clearFilterKey } from "@/components/filter-chip"
import {
  Search, ChevronLeft, ChevronRight, TrendingUp, TrendingDown,
  Settings2, GripVertical, Eye, EyeOff, FileText,
} from "lucide-react"
import { AgentBtn } from "@/components/agent-btn"
import {
  Table, TableHeader, TableBody, TableRow, TableCell, TableHead,
  SortableHead, useSortState,
} from "@/components/sortable-table"

// ── Types ──────────────────────────────────────────────────────────────────────

type SpaceStatus   = "Available" | "Unavailable" | "Archived"
type ListingStatus = "Active" | "Inactive" | "Draft"
type Condition     = "As-Is" | "Pre-Built" | "Cold Dark Shell" | "Warm Shell"

export interface Space {
  id: string
  status: SpaceStatus
  floor: string
  floorNum: number
  space: string
  sf: number
  listingSf: number | null
  availability: string
  listingStatus: ListingStatus
  onMarketDate: string
  askingRent: number | null
  term: string
  condition: Condition
  days: number
  docs: number
  archivedDate: string | null
  asset: string
}

type SortKey = "status" | "floor" | "space" | "sf" | "listingSf" | "availability" |
               "listingStatus" | "onMarketDate" | "askingRent" | "term" | "condition" | "days" | "docs" | "asset" | "encumbrances"

// ── Mock data ─────────────────────────────────────────────────────────────────

const SPACES: Space[] = [
  // VTS Tower Headquarters — all 19 spaces across 15 floors, matches stacking-plan.tsx
  { id:"s01", asset:"VTS Tower Headquarters",  status:"Available",   floor:"Floor 15",  floorNum:15, space:"Suite 1500",   sf:18000, listingSf:18000, availability:"Immediate",       listingStatus:"Active",   onMarketDate:"2026-06-28", askingRent:62.00, term:"5–10 yr",  condition:"As-Is",            days:62,  docs:2, archivedDate:null },
  { id:"s21", asset:"VTS Tower Headquarters",  status:"Unavailable", floor:"Floor 14",  floorNum:14, space:"Suite 1400",   sf:10000, listingSf:null,  availability:"Jun 30, 2030",    listingStatus:"Inactive", onMarketDate:"2020-07-01", askingRent:null,  term:"TBD",      condition:"Pre-Built",        days:0,   docs:3, archivedDate:null },
  { id:"s02", asset:"VTS Tower Headquarters",  status:"Available",   floor:"Floor 14",  floorNum:14, space:"Suite 1410",   sf:8000,  listingSf:8000,  availability:"Immediate",       listingStatus:"Active",   onMarketDate:"2026-04-06", askingRent:62.00, term:"3–5 yr",   condition:"Pre-Built",        days:145, docs:3, archivedDate:null },
  { id:"s22", asset:"VTS Tower Headquarters",  status:"Unavailable", floor:"Floor 13",  floorNum:13, space:"Suite 1300",   sf:18000, listingSf:null,  availability:"Jun 30, 2030",    listingStatus:"Inactive", onMarketDate:"2020-07-01", askingRent:null,  term:"TBD",      condition:"As-Is",            days:0,   docs:2, archivedDate:null },
  { id:"s23", asset:"VTS Tower Headquarters",  status:"Unavailable", floor:"Floor 12",  floorNum:12, space:"Suite 1200",   sf:18000, listingSf:null,  availability:"Dec 31, 2029",    listingStatus:"Inactive", onMarketDate:"2023-01-01", askingRent:null,  term:"TBD",      condition:"Pre-Built",        days:0,   docs:2, archivedDate:null },
  { id:"s24", asset:"VTS Tower Headquarters",  status:"Unavailable", floor:"Floor 11",  floorNum:11, space:"Suite 1100",   sf:18000, listingSf:null,  availability:"Sep 30, 2029",    listingStatus:"Inactive", onMarketDate:"2022-10-01", askingRent:null,  term:"TBD",      condition:"As-Is",            days:0,   docs:1, archivedDate:null },
  { id:"s25", asset:"VTS Tower Headquarters",  status:"Unavailable", floor:"Floor 10",  floorNum:10, space:"Suite 1000",   sf:18000, listingSf:null,  availability:"Sep 30, 2030",    listingStatus:"Inactive", onMarketDate:"2020-10-01", askingRent:null,  term:"TBD",      condition:"As-Is",            days:0,   docs:1, archivedDate:null },
  { id:"s03", asset:"VTS Tower Headquarters",  status:"Available",   floor:"Floor 9",   floorNum:9,  space:"Suite 0900",   sf:20000, listingSf:20000, availability:"Jan 1, 2027",     listingStatus:"Active",   onMarketDate:"2026-06-01", askingRent:65.00, term:"5–10 yr",  condition:"Cold Dark Shell",  days:90,  docs:4, archivedDate:null },
  { id:"s26", asset:"VTS Tower Headquarters",  status:"Unavailable", floor:"Floor 8",   floorNum:8,  space:"Suite 0800",   sf:20000, listingSf:null,  availability:"Apr 30, 2029",    listingStatus:"Inactive", onMarketDate:"2019-05-01", askingRent:null,  term:"TBD",      condition:"As-Is",            days:0,   docs:2, archivedDate:null },
  { id:"s27", asset:"VTS Tower Headquarters",  status:"Unavailable", floor:"Floor 7",   floorNum:7,  space:"Suite 0700",   sf:20000, listingSf:null,  availability:"Apr 30, 2029",    listingStatus:"Inactive", onMarketDate:"2019-05-01", askingRent:null,  term:"TBD",      condition:"As-Is",            days:0,   docs:3, archivedDate:null },
  { id:"s04", asset:"VTS Tower Headquarters",  status:"Available",   floor:"Floor 6",   floorNum:6,  space:"Suite 0600",   sf:6500,  listingSf:6500,  availability:"Immediate",       listingStatus:"Active",   onMarketDate:"2026-02-01", askingRent:58.00, term:"3–5 yr",   condition:"As-Is",            days:210, docs:1, archivedDate:null },
  { id:"s05", asset:"VTS Tower Headquarters",  status:"Available",   floor:"Floor 6",   floorNum:6,  space:"Suite 0620",   sf:5500,  listingSf:5500,  availability:"Immediate",       listingStatus:"Active",   onMarketDate:"2026-03-02", askingRent:56.00, term:"2–5 yr",   condition:"As-Is",            days:180, docs:2, archivedDate:null },
  { id:"s06", asset:"VTS Tower Headquarters",  status:"Available",   floor:"Floor 6",   floorNum:6,  space:"Suite 0640",   sf:8000,  listingSf:null,  availability:"Immediate",       listingStatus:"Draft",    onMarketDate:"2025-10-23", askingRent:null,  term:"TBD",      condition:"As-Is",            days:310, docs:0, archivedDate:null },
  { id:"s28", asset:"VTS Tower Headquarters",  status:"Unavailable", floor:"Floor 5",   floorNum:5,  space:"Suite 0500",   sf:20000, listingSf:null,  availability:"Nov 30, 2028",    listingStatus:"Inactive", onMarketDate:"2021-12-01", askingRent:null,  term:"TBD",      condition:"As-Is",            days:0,   docs:2, archivedDate:null },
  { id:"s29", asset:"VTS Tower Headquarters",  status:"Unavailable", floor:"Floor 4",   floorNum:4,  space:"Suite 0400",   sf:20000, listingSf:null,  availability:"Dec 31, 2029",    listingStatus:"Inactive", onMarketDate:"2020-01-01", askingRent:null,  term:"TBD",      condition:"As-Is",            days:0,   docs:2, archivedDate:null },
  { id:"s30", asset:"VTS Tower Headquarters",  status:"Unavailable", floor:"Floor 3",   floorNum:3,  space:"Suite 0300",   sf:12000, listingSf:null,  availability:"Mar 31, 2028",    listingStatus:"Inactive", onMarketDate:"2018-04-01", askingRent:null,  term:"TBD",      condition:"As-Is",            days:0,   docs:1, archivedDate:null },
  { id:"s07", asset:"VTS Tower Headquarters",  status:"Available",   floor:"Floor 3",   floorNum:3,  space:"Suite 0320",   sf:8000,  listingSf:8000,  availability:"Immediate",       listingStatus:"Active",   onMarketDate:"2026-07-05", askingRent:55.00, term:"3–5 yr",   condition:"As-Is",            days:55,  docs:1, archivedDate:null },
  { id:"s31", asset:"VTS Tower Headquarters",  status:"Unavailable", floor:"Floor 2",   floorNum:2,  space:"Suite 0200",   sf:20000, listingSf:null,  availability:"Jun 30, 2028",    listingStatus:"Inactive", onMarketDate:"2018-07-01", askingRent:null,  term:"TBD",      condition:"As-Is",            days:0,   docs:3, archivedDate:null },
  { id:"s32", asset:"VTS Tower Headquarters",  status:"Unavailable", floor:"Floor 1",   floorNum:1,  space:"Suite 0100",   sf:5000,  listingSf:null,  availability:"Dec 31, 2027",    listingStatus:"Inactive", onMarketDate:"2018-01-01", askingRent:null,  term:"TBD",      condition:"As-Is",            days:0,   docs:1, archivedDate:null },
  { id:"s33", asset:"VTS Tower Headquarters",  status:"Archived",    floor:"Floor 11",  floorNum:11, space:"Suite 1150",   sf:4200,  listingSf:4200,  availability:"Was immediate",    listingStatus:"Inactive", onMarketDate:"2025-01-15", askingRent:60.00, term:"3–5 yr",   condition:"Pre-Built",        days:0,   docs:2, archivedDate:"2025-08-30" },
  { id:"s34", asset:"VTS Tower Headquarters",  status:"Archived",    floor:"Floor 6",   floorNum:6,  space:"Suite 0610",   sf:3800,  listingSf:3800,  availability:"Was immediate",    listingStatus:"Inactive", onMarketDate:"2024-09-01", askingRent:55.00, term:"2–3 yr",   condition:"As-Is",            days:0,   docs:1, archivedDate:"2025-04-12" },
  { id:"s35", asset:"VTS Tower Headquarters",  status:"Archived",    floor:"Floor 3",   floorNum:3,  space:"Suite 0310",   sf:6000,  listingSf:6000,  availability:"Was Mar 2025",     listingStatus:"Inactive", onMarketDate:"2024-06-01", askingRent:52.00, term:"3–5 yr",   condition:"As-Is",            days:0,   docs:3, archivedDate:"2025-06-01" },
  // Other assets
  { id:"s08", asset:"One Financial Plaza",      status:"Available",   floor:"Floor 12",  floorNum:12, space:"Suite 1200",   sf:34200, listingSf:34200, availability:"Sep 15, 2026",    listingStatus:"Active",   onMarketDate:"2026-03-01", askingRent:68.00, term:"7–10 yr",  condition:"Warm Shell",       days:181, docs:5, archivedDate:null },
  { id:"s09", asset:"Empire State Building",    status:"Available",   floor:"Floor 14",  floorNum:14, space:"Suite 1400",   sf:18600, listingSf:18600, availability:"Immediate",       listingStatus:"Active",   onMarketDate:"2026-02-14", askingRent:60.00, term:"3–7 yr",   condition:"Pre-Built",        days:196, docs:3, archivedDate:null },
  { id:"s10", asset:"Salesforce Tower",         status:"Available",   floor:"Floor 18",  floorNum:18, space:"Suite 1800A",  sf:28000, listingSf:28000, availability:"Nov 1, 2026",     listingStatus:"Active",   onMarketDate:"2026-05-20", askingRent:72.00, term:"5–10 yr",  condition:"Cold Dark Shell",  days:101, docs:2, archivedDate:null },
  { id:"s11", asset:"Salesforce Tower",         status:"Available",   floor:"Floor 21",  floorNum:21, space:"Suite 2100",   sf:34200, listingSf:34200, availability:"Immediate",       listingStatus:"Active",   onMarketDate:"2025-12-10", askingRent:75.00, term:"5–15 yr",  condition:"Warm Shell",       days:233, docs:6, archivedDate:null },
  { id:"s12", asset:"Salesforce Tower",         status:"Available",   floor:"Floor 24",  floorNum:24, space:"Full Floor",   sf:52000, listingSf:45000, availability:"Jan 1, 2027",     listingStatus:"Active",   onMarketDate:"2026-06-01", askingRent:82.00, term:"10–15 yr", condition:"Cold Dark Shell",  days:89,  docs:4, archivedDate:null },
  { id:"s13", asset:"Empire State Building",    status:"Available",   floor:"Floor 26",  floorNum:26, space:"Suite 2600",   sf:11200, listingSf:11200, availability:"Immediate",       listingStatus:"Draft",    onMarketDate:"2026-07-01", askingRent:78.00, term:"3–5 yr",   condition:"Pre-Built",        days:59,  docs:1, archivedDate:null },
  { id:"s14", asset:"Salesforce Tower",         status:"Available",   floor:"Floor 28",  floorNum:28, space:"Suite 2800",   sf:16500, listingSf:16500, availability:"Mar 1, 2027",     listingStatus:"Inactive", onMarketDate:"2026-06-15", askingRent:85.00, term:"5–10 yr",  condition:"As-Is",            days:75,  docs:2, archivedDate:null },
  { id:"s15", asset:"One Financial Plaza",      status:"Unavailable", floor:"Floor 11",  floorNum:11, space:"Floors 11–12", sf:62000, listingSf:null,  availability:"Dec 1, 2026",     listingStatus:"Inactive", onMarketDate:"2026-02-01", askingRent:null,  term:"TBD",      condition:"Cold Dark Shell",  days:0,   docs:1, archivedDate:null },
  { id:"s16", asset:"Empire State Building",    status:"Unavailable", floor:"Floor 15",  floorNum:15, space:"Suite 1500",   sf:24400, listingSf:null,  availability:"Jun 30, 2027",    listingStatus:"Inactive", onMarketDate:"2026-04-01", askingRent:null,  term:"TBD",      condition:"Warm Shell",       days:0,   docs:0, archivedDate:null },
  { id:"s17", asset:"Salesforce Tower",         status:"Unavailable", floor:"Floor 20",  floorNum:20, space:"Suite 2000",   sf:33000, listingSf:null,  availability:"Sep 1, 2027",     listingStatus:"Inactive", onMarketDate:"2026-05-01", askingRent:null,  term:"TBD",      condition:"Pre-Built",        days:0,   docs:3, archivedDate:null },
  { id:"s18", asset:"One Financial Plaza",      status:"Archived",    floor:"Floor 4",   floorNum:4,  space:"Suite 400B",   sf:12800, listingSf:12800, availability:"Was immediate",   listingStatus:"Inactive", onMarketDate:"2025-06-15", askingRent:48.00, term:"5 yr",     condition:"Pre-Built",        days:0,   docs:3, archivedDate:"2026-05-20" },
  { id:"s19", asset:"Empire State Building",    status:"Archived",    floor:"Floor 6",   floorNum:6,  space:"Suite 600",    sf:19800, listingSf:19800, availability:"Was Jun 2026",    listingStatus:"Inactive", onMarketDate:"2025-09-01", askingRent:55.00, term:"5–7 yr",   condition:"Warm Shell",       days:0,   docs:4, archivedDate:"2026-07-10" },
  { id:"s20", asset:"Salesforce Tower",         status:"Archived",    floor:"Floor 10",  floorNum:10, space:"Suite 1000",   sf:38000, listingSf:38000, availability:"Was Mar 2026",    listingStatus:"Inactive", onMarketDate:"2024-11-01", askingRent:60.00, term:"7–10 yr",  condition:"Cold Dark Shell",  days:0,   docs:1, archivedDate:"2026-04-15" },
]

const PAGE_SIZE = 10

// ── Column definitions ────────────────────────────────────────────────────────

interface ColDef {
  id: SortKey | "archivedDate"
  label: string
  sortable: boolean
  right?: boolean
  defaultVisible: boolean
}


const ALL_COLUMNS: ColDef[] = [
  { id:"asset",         label:"Asset",           sortable:true,  defaultVisible:true  },
  { id:"status",        label:"Status",          sortable:true,  defaultVisible:true  },
  { id:"floor",         label:"Floor",           sortable:true,  defaultVisible:true  },
  { id:"space",         label:"Space",           sortable:true,  defaultVisible:true  },
  { id:"sf",            label:"Size",            sortable:true,  right:true, defaultVisible:true  },
  { id:"listingSf",     label:"Listing size",    sortable:true,  right:true, defaultVisible:false },
  { id:"availability",  label:"Availability",    sortable:true,  defaultVisible:true  },
  { id:"listingStatus", label:"Listing status",  sortable:true,  defaultVisible:false },
  { id:"onMarketDate",  label:"On market date",  sortable:true,  defaultVisible:false },
  { id:"askingRent",    label:"Asking rent",     sortable:true,  right:true, defaultVisible:true  },
  { id:"term",          label:"Term",            sortable:true,  defaultVisible:true  },
  { id:"condition",     label:"Condition",       sortable:true,  defaultVisible:true  },
  { id:"days",          label:"Days",            sortable:true,  right:true, defaultVisible:true  },
  { id:"encumbrances",  label:"Encumbrances",    sortable:true,  defaultVisible:true  },
  { id:"docs",          label:"Docs",            sortable:false, right:true, defaultVisible:true  },
  { id:"archivedDate",  label:"Archived date",   sortable:false, defaultVisible:false },
] as ColDef[]

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtSf(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(0)}K sf` : `${n} sf`
}

const STATUS_CLS: Record<SpaceStatus, string> = {
  Available:   "bg-success/10 text-success",
  Unavailable: "bg-muted text-muted-foreground",
  Archived:    "bg-muted/60 text-muted-foreground/60",
}

const LISTING_CLS: Record<ListingStatus, string> = {
  Active:   "bg-primary/10 text-primary",
  Draft:    "bg-warning/10 text-warning",
  Inactive: "bg-muted text-muted-foreground",
}

// ── KPI bar ───────────────────────────────────────────────────────────────────

function SpacesKpi({ spaces }: { spaces: Space[] }) {
  const avail   = spaces.filter(s => s.status === "Available")
  const totalSf = avail.reduce((a, s) => a + s.sf, 0)
  const activeListings = avail.filter(s => s.listingStatus === "Active").length
  const withRent = avail.filter(s => s.askingRent !== null)
  const avgRent  = withRent.length ? withRent.reduce((a, s) => a + (s.askingRent ?? 0), 0) / withRent.length : 0
  const avgDays  = avail.length ? Math.round(avail.reduce((a, s) => a + s.days, 0) / avail.length) : 0
  const immediate = avail.filter(s => s.availability === "Immediate").length

  const kpis = [
    { label: "Available spaces",  value: String(avail.length),         sub: `${immediate} immediate` },
    { label: "Available SF",      value: fmtSf(totalSf),               sub: "total available" },
    { label: "Active listings",   value: String(activeListings),        sub: `of ${avail.length} available`, trend: activeListings / (avail.length || 1) >= 0.7 ? "up" as const : "down" as const },
    { label: "Avg asking rent",   value: `$${avgRent.toFixed(0)}/sf`,   sub: "active listings", trend: avgRent >= 65 ? "up" as const : "down" as const },
    { label: "Avg days on market",value: String(avgDays),               sub: "available spaces" },
  ]

  return (
    <div className={cn(cardBase, "!p-0 overflow-hidden flex flex-wrap divide-x divide-border/60")}>
      {kpis.map(k => (
        <div key={k.label} className="flex-1 min-w-[120px] px-5 py-4">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">{k.label}</p>
          <p className="text-2xl font-medium text-foreground">{k.value}</p>
          <p className={cn("text-xs font-medium mt-1.5 flex items-center gap-1",
            k.trend === "up" ? "text-success" : k.trend === "down" ? "text-destructive" : "text-muted-foreground"
          )}>
            {k.trend === "up" && <TrendingUp className="h-3 w-3 shrink-0" />}
            {k.trend === "down" && <TrendingDown className="h-3 w-3 shrink-0" />}
            {k.sub}
          </p>
        </div>
      ))}
    </div>
  )
}

// ── Column manager popover ────────────────────────────────────────────────────

function ColumnManager({
  columns, visible, order,
  onToggle, onReorder,
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

  return (
    <Popover>
      <PopoverTrigger className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-primary text-primary text-xs font-medium bg-transparent hover:bg-primary/10 transition-colors">
        <Settings2 className="h-3.5 w-3.5" />
        Columns
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <p className="text-xs font-medium text-muted-foreground px-2 pb-2">Drag to reorder</p>
        <div className="flex flex-col gap-0.5">
          {order.map(id => {
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

// ── Main page ─────────────────────────────────────────────────────────────────

const FLOORS_SORTED = Array.from(new Set(SPACES.map(s => s.floor))).sort((a, b) =>
  parseInt(a.replace(/\D/g, "")) - parseInt(b.replace(/\D/g, ""))
)

const BASE_FILTER_DEFS = [
  { key: "status",        label: "Status",          options: (["Available","Unavailable","Archived"] as SpaceStatus[]).map(v => ({ label: v, value: v })) },
  { key: "listingStatus", label: "Listing status",  options: (["Active","Draft","Inactive"] as ListingStatus[]).map(v => ({ label: v, value: v })) },
  { key: "condition",     label: "Condition",       options: (["As-Is","Pre-Built","Warm Shell","Cold Dark Shell"] as Condition[]).map(v => ({ label: v, value: v })) },
  { key: "floor",         label: "Floor",           options: FLOORS_SORTED.map(f => ({ label: f, value: f })) },
  { key: "availability",  label: "Availability",    options: Array.from(new Set(SPACES.map(s => s.availability))).map(v => ({ label: v, value: v })) },
  { key: "term",          label: "Term",            options: Array.from(new Set(SPACES.map(s => s.term))).map(v => ({ label: v, value: v })) },
]

interface AssetRef { id: string; name: string }

export function SpacesPage({ assets }: { assets?: AssetRef[] }) {
  const isMultiAsset = (assets?.length ?? 0) > 1
  const { sortKey, sortDir, handleSort: _handleSort } = useSortState<SortKey>("floor")
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({})

  // When switching between single/multi-asset view, reset asset filter
  React.useEffect(() => {
    if (!isMultiAsset) setActiveFilters(prev => { const n = {...prev}; delete n.asset; return n })
  }, [isMultiAsset])

  const COLUMNS = React.useMemo(
    () => isMultiAsset ? ALL_COLUMNS : ALL_COLUMNS.filter(c => c.id !== "asset"),
    [isMultiAsset]
  )

  const FILTER_DEFS = React.useMemo(() => {
    if (!isMultiAsset || !assets?.length) return BASE_FILTER_DEFS
    const assetFilter = { key: "asset", label: "Asset", options: assets.map(a => ({ label: a.name, value: a.name })) }
    return [assetFilter, ...BASE_FILTER_DEFS]
  }, [isMultiAsset, assets])

  // Column visibility + order
  const [visible, setVisible] = React.useState<Set<string>>(
    () => new Set(ALL_COLUMNS.filter(c => c.defaultVisible).map(c => c.id))
  )
  const [colOrder, setColOrder] = React.useState<string[]>(
    () => ALL_COLUMNS.map(c => c.id)
  )

  function handleSort(key: SortKey) { _handleSort(key); setPage(1) }
  function toggleCol(id: string) {
    setVisible(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  function onToggle(key: string, value: string) { setActiveFilters(prev => toggleFilterValue(prev, key, value)); setPage(1) }
  function onClear(key: string) { setActiveFilters(prev => clearFilterKey(prev, key)); setPage(1) }
  function onClearAll() { setActiveFilters({}); setPage(1) }

  const filtered = React.useMemo(() => {
    let r = isMultiAsset ? [...SPACES] : [...SPACES].filter(s => !assets?.length || assets.some(a => a.name === s.asset))
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(s => s.space.toLowerCase().includes(q) || s.floor.toLowerCase().includes(q) || s.condition.toLowerCase().includes(q) || s.asset.toLowerCase().includes(q))
    }
    for (const [key, values] of Object.entries(activeFilters)) {
      if (!values.length) continue
      r = r.filter(s => values.includes(String(s[key as keyof Space])))
    }

    r.sort((a, b) => {
      let av: string | number
      let bv: string | number
      if (sortKey === "floor") { av = a.floorNum; bv = b.floorNum }
      else if (sortKey === "sf")            { av = a.sf; bv = b.sf }
      else if (sortKey === "listingSf")     { av = a.listingSf ?? 0; bv = b.listingSf ?? 0 }
      else if (sortKey === "askingRent")    { av = a.askingRent ?? 0; bv = b.askingRent ?? 0 }
      else if (sortKey === "days")          { av = a.days; bv = b.days }
      else if (sortKey === "docs")          { av = a.docs; bv = b.docs }
      else if (sortKey === "encumbrances")  { av = getSpaceEncumbranceCount(a.id); bv = getSpaceEncumbranceCount(b.id) }
      else { av = (a[sortKey as keyof Space] as string ?? "").toString().toLowerCase(); bv = (b[sortKey as keyof Space] as string ?? "").toString().toLowerCase() }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === "asc" ? cmp : -cmp
    })
    return r
  }, [search, activeFilters, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const orderedCols = colOrder
    .map(id => COLUMNS.find(c => c.id === id))
    .filter((c): c is ColDef => !!c && visible.has(c.id))

  return (
    <div className="space-y-4">
      <SpacesKpi spaces={SPACES} />

      <div className={cardBase}>
        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search spaces…"
              className="pl-8 h-8 text-sm w-44"
            />
          </div>
          <FilterBar
            filters={FILTER_DEFS}
            active={activeFilters}
            onToggle={onToggle}
            onClear={onClear}
            onClearAll={onClearAll}
            visibleCount={6}
          />
          <div className="ml-auto">
            <ColumnManager
              columns={COLUMNS}
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
                >
                  {col.label}
                </SortableHead>
              ))}
              <TableHead className="pb-2 pt-0 w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={orderedCols.length + 1} className="py-10 text-center text-sm text-muted-foreground">
                  No spaces match your filters.
                </TableCell>
              </TableRow>
            )}
            {paginated.map((s, i) => (
              <TableRow key={s.id} className={cn(
                "hover:bg-muted/40 transition-colors",
                i > 0 ? "border-t border-border/40" : "border-0",
                s.status === "Archived" && "opacity-60"
              )}>
                {orderedCols.map(col => {
                  switch (col.id) {
                    case "asset":
                      return <TableCell key="asset" className="py-2.5 text-sm font-medium text-foreground whitespace-nowrap">{s.asset}</TableCell>
                    case "status":
                      return (
                        <TableCell key="status" className="py-2.5 whitespace-nowrap">
                          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", STATUS_CLS[s.status])}>
                            {s.status}
                          </span>
                        </TableCell>
                      )
                    case "floor":
                      return <TableCell key="floor" className="py-2.5 text-sm font-medium text-foreground whitespace-nowrap">{s.floor}</TableCell>
                    case "space":
                      return <TableCell key="space" className="py-2.5 text-sm text-foreground whitespace-nowrap">{s.space}</TableCell>
                    case "sf":
                      return <TableCell key="sf" className="py-2.5 text-right tabular-nums text-sm font-medium text-foreground whitespace-nowrap">{fmtSf(s.sf)}</TableCell>
                    case "listingSf":
                      return (
                        <TableCell key="listingSf" className="py-2.5 text-right tabular-nums text-sm text-foreground whitespace-nowrap">
                          {s.listingSf ? fmtSf(s.listingSf) : <span className="text-muted-foreground/40">—</span>}
                        </TableCell>
                      )
                    case "availability":
                      return <TableCell key="availability" className="py-2.5 text-sm text-foreground whitespace-nowrap">{s.availability}</TableCell>
                    case "listingStatus":
                      return (
                        <TableCell key="listingStatus" className="py-2.5 whitespace-nowrap">
                          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", LISTING_CLS[s.listingStatus])}>
                            {s.listingStatus}
                          </span>
                        </TableCell>
                      )
                    case "onMarketDate":
                      return <TableCell key="onMarketDate" className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{s.onMarketDate}</TableCell>
                    case "askingRent":
                      return (
                        <TableCell key="askingRent" className="py-2.5 text-right tabular-nums text-sm font-medium text-foreground whitespace-nowrap">
                          {s.askingRent != null ? `$${s.askingRent.toFixed(2)}/sf` : <span className="text-muted-foreground/40">—</span>}
                        </TableCell>
                      )
                    case "term":
                      return <TableCell key="term" className="py-2.5 text-sm text-foreground whitespace-nowrap">{s.term}</TableCell>
                    case "condition":
                      return <TableCell key="condition" className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{s.condition}</TableCell>
                    case "days":
                      return (
                        <TableCell key="days" className="py-2.5 text-right tabular-nums whitespace-nowrap">
                          {s.days > 0 ? (
                            <span className={cn("text-sm font-medium tabular-nums", s.days >= 180 ? "text-warning" : "text-foreground")}>
                              {s.days}d
                            </span>
                          ) : <span className="text-muted-foreground/40 text-sm">—</span>}
                        </TableCell>
                      )
                    case "encumbrances": {
                      const count = getSpaceEncumbranceCount(s.id)
                      return (
                        <TableCell key="encumbrances" className="py-2.5 whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            {count === 0
                              ? <span className="text-muted-foreground/40 text-xs">—</span>
                              : <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-sm font-bold bg-destructive text-white tabular-nums">{count}</span>
                            }
                          </div>
                        </TableCell>
                      )
                    }
                    case "docs":
                      return (
                        <TableCell key="docs" className="py-2.5 text-right whitespace-nowrap">
                          {s.docs > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <FileText className="h-3.5 w-3.5 shrink-0" />
                              {s.docs}
                            </span>
                          ) : <span className="text-muted-foreground/40 text-sm">—</span>}
                        </TableCell>
                      )
                    case "archivedDate":
                      return (
                        <TableCell key="archivedDate" className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">
                          {s.archivedDate ?? <span className="text-muted-foreground/40">—</span>}
                        </TableCell>
                      )
                    default:
                      return null
                  }
                })}
                <TableCell className="py-2.5 pl-2">
                  <AgentBtn entity="Space" label={`${s.floor} · ${s.space} · ${fmtSf(s.sf)} · ${s.status} · asking $${s.askingRent ?? "TBD"}/sf · ${s.availability}`} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
          <span className="text-xs text-muted-foreground">
            {filtered.length === 0 ? "0 spaces" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
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
  )
}
