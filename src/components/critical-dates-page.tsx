import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FilterBar, toggleFilterValue, clearFilterKey } from "@/components/filter-chip"
import {
  Search, ChevronLeft, ChevronRight, Settings2, GripVertical, Eye, EyeOff,
  AlertTriangle, Clock, Bell, CheckCircle2, FileText, History, MoreHorizontal, ExternalLink,
} from "lucide-react"
import { TenantAvatar } from "@/components/tenant-avatar"
import { ADDITIONAL_CRITICAL_DATES } from "@/lib/critical-dates-new"
import {
  Table, TableHeader, TableBody, TableRow, TableCell, TableHead,
  SortableHead, useSortState,
} from "@/components/sortable-table"

// ── Types ──────────────────────────────────────────────────────────────────────

type DateCategory = "Expiring" | "Renewal" | "Option" | "Rent commencement" | "TI deadline" | "Inspection" | "Notice"
type DateUrgency  = "Critical" | "Upcoming" | "Monitoring" | "Completed"
type ActionStatus = "Pending" | "Notice sent" | "Awaiting response" | "Resolved"

interface ActivityEntry {
  id: string
  timestamp: string
  user: string
  action: string
  note?: string
}

interface CriticalDateRow {
  id: string
  asset: string
  tenant: string
  suite: string
  sf: number
  dateType: DateCategory
  urgency: DateUrgency
  date: string
  dateSortable: number
  monthsOut: number
  noticePeriod: string
  noticeDeadline?: string
  responsible: string
  notes: string
  leaseId?: string
  draftAction?: string
  status: ActionStatus
  activityLog: ActivityEntry[]
}

type SortKey = "asset" | "tenant" | "suite" | "sf" | "dateType" | "date" | "monthsOut" | "responsible" | "status"

interface AssetRef { id: string; name: string }

// ── Data ──────────────────────────────────────────────────────────────────────

const ROWS: CriticalDateRow[] = [
  {
    id: "1", asset: "VTS Tower Headquarters", tenant: "Pfizer", suite: "Suite 1200",
    sf: 117000, dateType: "Expiring", urgency: "Critical", date: "Sep 15, 2026",
    dateSortable: 20260915, monthsOut: 0, noticePeriod: "12 months",
    noticeDeadline: "Sep 15, 2025", responsible: "Asset Manager", leaseId: "l1",
    notes: "Tenant evaluating renewal vs relocation",
    draftAction: undefined,
    status: "Notice sent",
    activityLog: [
      { id: "a1", timestamp: "Sep 1, 2026 · 9:14 AM", user: "Enrique Sacasa", action: "Notice sent", note: "Sent formal notice to Pfizer counsel via email. Awaiting written response." },
      { id: "a2", timestamp: "Aug 15, 2026 · 2:00 PM", user: "Enrique Sacasa", action: "Note added", note: "Pfizer touring alternative spaces on Park Ave." },
    ],
  },
  {
    id: "2", asset: "VTS Tower Headquarters", tenant: "Morgan Stanley", suite: "Floors 8-11",
    sf: 116000, dateType: "Expiring", urgency: "Critical", date: "Nov 1, 2026",
    dateSortable: 20261101, monthsOut: 2, noticePeriod: "12 months",
    noticeDeadline: "Nov 1, 2025", responsible: "Asset Manager", leaseId: "l2",
    notes: "LOI in negotiation",
    draftAction: undefined,
    status: "Awaiting response",
    activityLog: [
      { id: "b1", timestamp: "Aug 20, 2026 · 11:30 AM", user: "Enrique Sacasa", action: "Notice sent", note: "Termination notice delivered per lease terms." },
    ],
  },
  {
    id: "3", asset: "VTS Tower Headquarters", tenant: "Deloitte LLP", suite: "Suite 500",
    sf: 43000, dateType: "Rent commencement", urgency: "Upcoming", date: "Dec 1, 2026",
    dateSortable: 20261201, monthsOut: 3, noticePeriod: "N/A",
    noticeDeadline: undefined, responsible: "Property Manager", leaseId: "l3",
    notes: "Confirm TI completion before rent start",
    draftAction: "Draft commencement letter",
    status: "Pending",
    activityLog: [],
  },
  {
    id: "4", asset: "VTS Tower Headquarters", tenant: "KPMG", suite: "Suite 3400",
    sf: 117000, dateType: "Renewal", urgency: "Upcoming", date: "Jan 31, 2027",
    dateSortable: 20270131, monthsOut: 5, noticePeriod: "9 months",
    noticeDeadline: "Apr 30, 2026", responsible: "Leasing Agent", leaseId: "l4",
    notes: "Renewal window opens",
    draftAction: "Draft renewal proposal",
    status: "Pending",
    activityLog: [],
  },
  {
    id: "5", asset: "VTS Tower Headquarters", tenant: "Ernst & Young", suite: "Suite 2200",
    sf: 80100, dateType: "Option", urgency: "Upcoming", date: "Mar 1, 2027",
    dateSortable: 20270301, monthsOut: 6, noticePeriod: "90 days",
    noticeDeadline: "Dec 1, 2026", responsible: "Asset Manager", leaseId: "l5",
    notes: "Contraction option -- reduces by 20,000 sf",
    draftAction: undefined,
    status: "Pending",
    activityLog: [],
  },
  {
    id: "6", asset: "VTS Tower Headquarters", tenant: "HSBC Holdings", suite: "Suite 900",
    sf: 69300, dateType: "Notice", urgency: "Upcoming", date: "Apr 15, 2027",
    dateSortable: 20270415, monthsOut: 7, noticePeriod: "10 business days",
    noticeDeadline: "Apr 1, 2027", responsible: "Legal", leaseId: "l6",
    notes: "ROFO latest notice date on FL9",
    draftAction: "Draft ROFO notice",
    status: "Pending",
    activityLog: [],
  },
  {
    id: "7", asset: "VTS Tower Headquarters", tenant: "Latham & Watkins", suite: "Floors 14-15",
    sf: 119000, dateType: "Renewal", urgency: "Monitoring", date: "May 1, 2027",
    dateSortable: 20270501, monthsOut: 8, noticePeriod: "9 months",
    noticeDeadline: "Aug 1, 2026", responsible: "Leasing Agent", leaseId: "l7",
    notes: "Renewal window opens -- strong retention candidate",
    draftAction: "Draft renewal proposal",
    status: "Pending",
    activityLog: [],
  },
  {
    id: "8", asset: "VTS Tower Headquarters", tenant: "JPMorgan Chase", suite: "Floor 6",
    sf: 55800, dateType: "Option", urgency: "Monitoring", date: "Jun 30, 2027",
    dateSortable: 20270630, monthsOut: 10, noticePeriod: "60 days",
    noticeDeadline: "May 1, 2027", responsible: "Asset Manager", leaseId: "l8",
    notes: "Expansion option deadline -- adjacent floor available",
    draftAction: undefined,
    status: "Pending",
    activityLog: [],
  },
  {
    id: "9", asset: "VTS Tower Headquarters", tenant: "Skadden Arps", suite: "Suite 1800",
    sf: 91200, dateType: "TI deadline", urgency: "Critical", date: "Oct 1, 2026",
    dateSortable: 20261001, monthsOut: 1, noticePeriod: "N/A",
    noticeDeadline: undefined, responsible: "Property Manager", leaseId: "l9",
    notes: "TI work must be complete by this date per lease",
    draftAction: undefined,
    status: "Pending",
    activityLog: [],
  },
  {
    id: "10", asset: "VTS Tower Headquarters", tenant: "Citigroup", suite: "Floors 20-22",
    sf: 134000, dateType: "Expiring", urgency: "Monitoring", date: "Mar 31, 2028",
    dateSortable: 20280331, monthsOut: 19, noticePeriod: "12 months",
    noticeDeadline: "Mar 31, 2027", responsible: "Asset Manager", leaseId: "l10",
    notes: "Early renewal discussions underway",
    draftAction: undefined,
    status: "Pending",
    activityLog: [],
  },
  {
    id: "11", asset: "VTS Tower Headquarters", tenant: "McKinsey & Co.", suite: "Suite 2900",
    sf: 48600, dateType: "Inspection", urgency: "Upcoming", date: "Nov 15, 2026",
    dateSortable: 20261115, monthsOut: 2, noticePeriod: "30 days",
    noticeDeadline: "Oct 15, 2026", responsible: "Property Manager", leaseId: "l11",
    notes: "Annual HVAC and systems inspection",
    draftAction: undefined,
    status: "Pending",
    activityLog: [],
  },
  {
    id: "12", asset: "VTS Tower Headquarters", tenant: "Blackrock", suite: "Floors 30-32",
    sf: 156000, dateType: "Renewal", urgency: "Monitoring", date: "Sep 1, 2028",
    dateSortable: 20280901, monthsOut: 24, noticePeriod: "12 months",
    noticeDeadline: "Sep 1, 2027", responsible: "Asset Manager", leaseId: "l12",
    notes: "Anchor tenant -- begin retention strategy Q1 2027",
    draftAction: "Draft renewal proposal",
    status: "Pending",
    activityLog: [],
  },
  {
    id: "13", asset: "VTS Tower Headquarters", tenant: "Goldman Sachs", suite: "Floor 25",
    sf: 52000, dateType: "Notice", urgency: "Upcoming", date: "Feb 28, 2027",
    dateSortable: 20270228, monthsOut: 6, noticePeriod: "5 business days",
    noticeDeadline: "Feb 21, 2027", responsible: "Legal", leaseId: "l13",
    notes: "ROFR notice window on adjacent suite 2600",
    draftAction: "Draft ROFR notice",
    status: "Pending",
    activityLog: [],
  },
  {
    id: "14", asset: "VTS Tower Headquarters", tenant: "Verizon Media", suite: "Suite 1500",
    sf: 38400, dateType: "Expiring", urgency: "Upcoming", date: "Jun 1, 2027",
    dateSortable: 20270601, monthsOut: 9, noticePeriod: "9 months",
    noticeDeadline: "Sep 1, 2026", responsible: "Leasing Agent", leaseId: "l14",
    notes: "Tenant on sublease market -- watch",
    draftAction: undefined,
    status: "Pending",
    activityLog: [],
  },
  {
    id: "15", asset: "VTS Tower Headquarters", tenant: "Pfizer", suite: "Suite 1200",
    sf: 117000, dateType: "Inspection", urgency: "Monitoring", date: "Jan 15, 2027",
    dateSortable: 20270115, monthsOut: 4, noticePeriod: "30 days",
    noticeDeadline: "Dec 15, 2026", responsible: "Property Manager", leaseId: "l15",
    notes: "Structural and MEP inspection per lease",
    draftAction: undefined,
    status: "Pending",
    activityLog: [],
  },
  ...ADDITIONAL_CRITICAL_DATES,
]

const PAGE_SIZE = 15

// ── Column definitions ─────────────────────────────────────────────────────────

interface ColDef {
  id: SortKey | "noticePeriod" | "noticeDeadline" | "notes" | "responsible" | "status"
  label: string
  sortable: boolean
  right?: boolean
  defaultVisible: boolean
}

const ALL_COLUMNS: ColDef[] = [
  { id: "asset",          label: "Asset",            sortable: true,  defaultVisible: true  },
  { id: "tenant",         label: "Tenant",           sortable: true,  defaultVisible: true  },
  { id: "suite",          label: "Space",            sortable: true,  defaultVisible: true  },
  { id: "sf",             label: "SF",               sortable: true,  right: true, defaultVisible: true  },
  { id: "dateType",       label: "Date type",        sortable: true,  defaultVisible: true  },
  { id: "status",         label: "Status",           sortable: true,  defaultVisible: true  },
  { id: "date",           label: "Date",             sortable: true,  defaultVisible: true  },
  { id: "monthsOut",      label: "Months out",       sortable: true,  right: true, defaultVisible: true  },
  { id: "noticeDeadline", label: "Notice deadline",  sortable: false, defaultVisible: true  },
  { id: "noticePeriod",   label: "Notice period",    sortable: false, defaultVisible: false },
  { id: "responsible",    label: "Responsible",      sortable: true,  defaultVisible: true  },
  { id: "notes",          label: "Notes",            sortable: false, defaultVisible: false },
]

// ── Badge styles ──────────────────────────────────────────────────────────────

const TYPE_CLS: Record<DateCategory, string> = {
  "Expiring":          "bg-destructive/10 text-destructive",
  "Renewal":           "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "Option":            "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "Rent commencement": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "TI deadline":       "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  "Inspection":        "bg-muted text-muted-foreground",
  "Notice":            "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
}

const STATUS_CLS: Record<ActionStatus, string> = {
  "Pending":           "bg-muted text-muted-foreground",
  "Notice sent":       "bg-primary/10 text-primary",
  "Awaiting response": "bg-warning/10 text-warning",
  "Resolved":          "bg-success/10 text-success",
}

// ── KPI bar ───────────────────────────────────────────────────────────────────

function CriticalDatesKpi({ rows }: { rows: CriticalDateRow[] }) {
  const actionRequired = rows.filter(r => r.status === "Pending").length
  const next90         = rows.filter(r => r.monthsOut <= 3).length
  const expiringSf     = rows.filter(r => r.dateType === "Expiring").reduce((s, r) => s + r.sf, 0)
  const awaiting       = rows.filter(r => r.status === "Awaiting response").length

  const kpis = [
    { label: "Action required",    value: String(actionRequired), sub: "Pending dates",          trend: actionRequired > 0 ? "warn" as const : undefined },
    { label: "Due within 90 days", value: String(next90),         sub: "Immediate attention",    trend: next90 > 0 ? "warn" as const : undefined },
    { label: "Awaiting response",  value: String(awaiting),       sub: "Notice sent, no reply",  trend: awaiting > 0 ? "warn" as const : undefined },
    { label: "Expiring lease SF",  value: `${(expiringSf / 1000).toFixed(0)}K sf`, sub: "Across expiring dates" },
  ]

  return (
    <div className={cn(cardBase, "!p-0 overflow-hidden flex flex-wrap divide-x divide-border/60")}>
      {kpis.map(k => (
        <div key={k.label} className="flex-1 min-w-[120px] px-5 py-4">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">{k.label}</p>
          <p className="text-2xl font-medium text-foreground">{k.value}</p>
          <p className={cn("text-xs font-medium mt-1.5 flex items-center gap-1",
            k.trend === "warn" ? "text-warning" : "text-muted-foreground"
          )}>
            {k.trend === "warn" && <AlertTriangle className="h-3 w-3 shrink-0" />}
            {k.sub}
          </p>
        </div>
      ))}
    </div>
  )
}

// ── Activity log dialog ───────────────────────────────────────────────────────

function ActivityLogDialog({
  row, extraEntries, onClose, onAddEntry,
}: {
  row: CriticalDateRow
  extraEntries: ActivityEntry[]
  onClose: () => void
  onAddEntry: (note: string) => void
}) {
  const [noteText, setNoteText] = React.useState("")
  const allEntries = [...row.activityLog, ...extraEntries]

  function submit() {
    if (!noteText.trim()) return
    onAddEntry(noteText.trim())
    setNoteText("")
  }

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent side="right" className="w-[440px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Activity log</SheetTitle>
          <p className="text-sm text-muted-foreground">{row.tenant} · {row.dateType} · {row.date}</p>
        </SheetHeader>
        <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1 py-4">
          {allEntries.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No activity recorded yet.</p>
          )}
          {allEntries.map(e => (
            <div key={e.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="w-px flex-1 bg-border/60 mt-1" />
              </div>
              <div className="pb-4 min-w-0">
                <p className="text-sm font-medium text-foreground">{e.action}</p>
                {e.note && <p className="text-sm text-muted-foreground mt-0.5">{e.note}</p>}
                <p className="text-xs text-muted-foreground/70 mt-1">{e.timestamp} · {e.user}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border/60 pt-3 space-y-2">
          <Textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Add a note..."
            className="text-sm resize-none"
            rows={2}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={submit} disabled={!noteText.trim()}>Add note</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ── Reminder dialog ───────────────────────────────────────────────────────────

function ReminderDialog({ row, onClose }: { row: CriticalDateRow; onClose: () => void }) {
  const [days, setDays] = React.useState("14")
  const [email, setEmail] = React.useState("enrique.sacasa@vts.com")
  const [saved, setSaved] = React.useState(false)

  function save() {
    setSaved(true)
    setTimeout(onClose, 1200)
  }

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent side="right" className="w-[360px]">
        <SheetHeader>
          <SheetTitle>Set reminder</SheetTitle>
          <p className="text-sm text-muted-foreground">{row.tenant} · {row.dateType} · {row.date}</p>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5 block">Days before date</label>
            <Input
              type="number"
              value={days}
              onChange={e => setDays(e.target.value)}
              min="1"
              className="h-8 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1.5 block">Notify</label>
            <Input
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={save} disabled={saved}>
            {saved ? <><CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />Saved</> : "Save reminder"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// ── Column manager ────────────────────────────────────────────────────────────

function ColumnManager({
  columns, visible, order, onToggle, onReorder,
}: {
  columns: ColDef[]; visible: Set<string>; order: string[]
  onToggle: (id: string) => void; onReorder: (next: string[]) => void
}) {
  const [dragging, setDragging] = React.useState<string | null>(null)
  const [dragOver, setDragOver] = React.useState<string | null>(null)
  const colMap = Object.fromEntries(columns.map(c => [c.id, c]))

  function onDropItem(targetId: string) {
    if (!dragging || dragging === targetId) return
    const next = [...order]
    const from = next.indexOf(dragging); const to = next.indexOf(targetId)
    next.splice(from, 1); next.splice(to, 0, dragging)
    onReorder(next); setDragging(null); setDragOver(null)
  }

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
            const col = colMap[id]; if (!col) return null
            return (
              <div key={id} draggable
                onDragStart={() => setDragging(id)}
                onDragEnd={() => { setDragging(null); setDragOver(null) }}
                onDragOver={e => { e.preventDefault(); setDragOver(id) }}
                onDrop={() => onDropItem(id)}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-grab active:cursor-grabbing select-none",
                  dragOver === id && dragging !== id ? "bg-primary/10" : "hover:bg-muted/60"
                )}
              >
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                <span className="flex-1 text-sm text-foreground">{col.label}</span>
                <button onClick={() => onToggle(id)} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                  {visible.has(id) ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ── Filter defs ───────────────────────────────────────────────────────────────

const DATE_TYPES: DateCategory[] = ["Expiring", "Renewal", "Option", "Rent commencement", "TI deadline", "Inspection", "Notice"]
const ACTION_STATUSES: ActionStatus[] = ["Pending", "Notice sent", "Awaiting response", "Resolved"]
const RESPONSIBLES = [...new Set(ROWS.map(r => r.responsible))].sort()
const ALL_TENANTS  = [...new Set(ROWS.map(r => r.tenant))].sort()

const BASE_FILTER_DEFS = [
  { key: "timeframe",   label: "Timeframe",     options: [{ label: "Next 6 months", value: "6" }, { label: "Next 12 months", value: "12" }] },
  { key: "dateType",    label: "Date type",     options: DATE_TYPES.map(v => ({ label: v, value: v })) },
  { key: "status",      label: "Status",        options: ACTION_STATUSES.map(v => ({ label: v, value: v })) },
  { key: "tenant",      label: "Tenant",        options: ALL_TENANTS.map(v => ({ label: v, value: v })) },
  { key: "responsible", label: "Responsible",   options: RESPONSIBLES.map(v => ({ label: v, value: v })) },
]

// ── Main page ─────────────────────────────────────────────────────────────────

export function CriticalDatesPage({ assets, onRowClick }: { assets?: AssetRef[]; onRowClick?: (tenant: string) => void }) {
  const isMultiAsset = (assets?.length ?? 0) > 1
  const { sortKey, sortDir, handleSort: _handleSort } = useSortState<SortKey>("date")
  const [page, setPage]         = React.useState(1)
  const [search, setSearch]     = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({})

  // Per-row overrideable state (status + extra activity entries)
  const [rowStatus, setRowStatus]       = React.useState<Record<string, ActionStatus>>({})
  const [rowActivity, setRowActivity]   = React.useState<Record<string, ActivityEntry[]>>({})

  // Dialog state
  const [activityRow, setActivityRow] = React.useState<CriticalDateRow | null>(null)
  const [reminderRow, setReminderRow] = React.useState<CriticalDateRow | null>(null)

  React.useEffect(() => {
    if (!isMultiAsset) setActiveFilters(prev => { const n = {...prev}; delete n.asset; return n })
  }, [isMultiAsset])

  const COLUMNS = React.useMemo(
    () => isMultiAsset ? ALL_COLUMNS : ALL_COLUMNS.filter(c => c.id !== "asset"),
    [isMultiAsset]
  )

  const FILTER_DEFS = React.useMemo(() => {
    if (!isMultiAsset || !assets?.length) return BASE_FILTER_DEFS
    return [{ key: "asset", label: "Asset", options: assets.map(a => ({ label: a.name, value: a.name })) }, ...BASE_FILTER_DEFS]
  }, [isMultiAsset, assets])

  const [visible, setVisible] = React.useState<Set<string>>(
    () => new Set(ALL_COLUMNS.filter(c => c.defaultVisible).map(c => c.id))
  )
  const [colOrder, setColOrder] = React.useState<string[]>(() => ALL_COLUMNS.map(c => c.id))

  function handleSort(key: SortKey) { _handleSort(key); setPage(1) }
  function toggleCol(id: string) {
    setVisible(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function onToggle(key: string, value: string) { setActiveFilters(prev => toggleFilterValue(prev, key, value)); setPage(1) }
  function onClear(key: string) { setActiveFilters(prev => clearFilterKey(prev, key)); setPage(1) }
  function onClearAll() { setActiveFilters({}); setPage(1) }

  function getStatus(r: CriticalDateRow): ActionStatus { return rowStatus[r.id] ?? r.status }

  function markNoticeSent(r: CriticalDateRow) {
    setRowStatus(prev => ({ ...prev, [r.id]: "Notice sent" }))
    const entry: ActivityEntry = {
      id: `auto-${Date.now()}`,
      timestamp: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }),
      user: "Enrique Sacasa",
      action: "Notice sent",
    }
    setRowActivity(prev => ({ ...prev, [r.id]: [...(prev[r.id] ?? []), entry] }))
  }

  function markAwaiting(r: CriticalDateRow) {
    setRowStatus(prev => ({ ...prev, [r.id]: "Awaiting response" }))
  }

  function markResolved(r: CriticalDateRow) {
    setRowStatus(prev => ({ ...prev, [r.id]: "Resolved" }))
    const entry: ActivityEntry = {
      id: `res-${Date.now()}`,
      timestamp: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }),
      user: "Enrique Sacasa",
      action: "Marked resolved",
    }
    setRowActivity(prev => ({ ...prev, [r.id]: [...(prev[r.id] ?? []), entry] }))
  }

  function addActivityNote(r: CriticalDateRow, note: string) {
    const entry: ActivityEntry = {
      id: `note-${Date.now()}`,
      timestamp: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }),
      user: "Enrique Sacasa",
      action: "Note added",
      note,
    }
    setRowActivity(prev => ({ ...prev, [r.id]: [...(prev[r.id] ?? []), entry] }))
  }

  const assetNames = React.useMemo(() => assets?.map(a => a.name), [assets])

  const filtered = React.useMemo(() => {
    let r = ROWS.map(row => ({ ...row, status: rowStatus[row.id] ?? row.status }))
    if (assetNames?.length) r = r.filter(row => assetNames.includes(row.asset))
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(s => s.tenant.toLowerCase().includes(q) || s.suite.toLowerCase().includes(q) || s.dateType.toLowerCase().includes(q))
    }
    for (const [key, values] of Object.entries(activeFilters)) {
      if (!values.length) continue
      if (key === "timeframe") {
        // Take the most permissive selected timeframe
        const maxMo = Math.max(...values.map(v => Number(v)))
        r = r.filter(s => s.monthsOut <= maxMo)
      } else {
        r = r.filter(s => values.includes(String(s[key as keyof CriticalDateRow])))
      }
    }
    r.sort((a, b) => {
      let av: string | number
      let bv: string | number
      if (sortKey === "sf")             { av = a.sf; bv = b.sf }
      else if (sortKey === "monthsOut") { av = a.monthsOut; bv = b.monthsOut }
      else if (sortKey === "date")      { av = a.dateSortable; bv = b.dateSortable }
      else { av = (a[sortKey as keyof CriticalDateRow] as string ?? "").toString().toLowerCase(); bv = (b[sortKey as keyof CriticalDateRow] as string ?? "").toString().toLowerCase() }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === "asc" ? cmp : -cmp
    })
    return r
  }, [search, activeFilters, sortKey, sortDir, rowStatus])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const orderedCols = colOrder
    .map(id => COLUMNS.find(c => c.id === id))
    .filter((c): c is ColDef => !!c && visible.has(c.id))

  return (
    <div className="space-y-4">
      <CriticalDatesKpi rows={ROWS.filter(r => !assetNames?.length || assetNames.includes(r.asset)).map(r => ({ ...r, status: rowStatus[r.id] ?? r.status }))} />

      <div className={cardBase}>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search dates..."
              className="pl-8 h-8 text-sm w-48"
            />
          </div>
          <FilterBar
            filters={FILTER_DEFS}
            active={activeFilters}
            onToggle={onToggle}
            onClear={onClear}
            onClearAll={onClearAll}
            visibleCount={4}
          />
          <div className="ml-auto">
            <ColumnManager columns={COLUMNS} visible={visible} order={colOrder} onToggle={toggleCol} onReorder={setColOrder} />
          </div>
        </div>

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
                  No critical dates match your filters.
                </TableCell>
              </TableRow>
            )}
            {paginated.map((r, i) => {
              const status = r.status
              return (
                <TableRow key={r.id} className={cn(
                  "transition-colors cursor-pointer hover:bg-muted/60",
                  i > 0 ? "border-t border-border/40" : "border-0",
                )} onClick={() => onRowClick?.(r.tenant)}>
                  {orderedCols.map(col => {
                    switch (col.id) {
                      case "status":
                        return (
                          <TableCell key="status" className="py-2.5 whitespace-nowrap">
                            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", STATUS_CLS[status])}>
                              {status}
                            </span>
                          </TableCell>
                        )
                      case "asset":
                        return <TableCell key="asset" className="py-2.5 text-sm font-medium text-foreground whitespace-nowrap">{r.asset}</TableCell>
                      case "tenant":
                        return (
                          <TableCell key="tenant" className="py-2.5 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <TenantAvatar name={r.tenant} />
                              <span className="text-sm font-medium text-foreground">{r.tenant}</span>
                              {r.leaseId && <ExternalLink className="h-3 w-3 text-muted-foreground/50" />}
                            </div>
                          </TableCell>
                        )
                      case "suite":
                        return <TableCell key="suite" className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{r.suite}</TableCell>
                      case "sf":
                        return <TableCell key="sf" className="py-2.5 text-right tabular-nums text-sm text-foreground whitespace-nowrap">{r.sf.toLocaleString()} sf</TableCell>
                      case "dateType":
                        return (
                          <TableCell key="dateType" className="py-2.5 whitespace-nowrap">
                            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", TYPE_CLS[r.dateType])}>
                              {r.dateType}
                            </span>
                          </TableCell>
                        )
                      case "date":
                        return <TableCell key="date" className="py-2.5 text-sm text-foreground whitespace-nowrap tabular-nums">{r.date}</TableCell>
                      case "monthsOut":
                        return (
                          <TableCell key="monthsOut" className="py-2.5 text-right tabular-nums whitespace-nowrap">
                            <span className={cn("text-sm font-medium",
                              r.monthsOut <= 3 ? "text-destructive" : r.monthsOut <= 6 ? "text-warning" : "text-muted-foreground"
                            )}>
                              {r.monthsOut} mo
                            </span>
                          </TableCell>
                        )
                      case "noticeDeadline":
                        return (
                          <TableCell key="noticeDeadline" className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">
                            {r.noticeDeadline
                              ? <span className={cn(r.noticePeriod !== "N/A" && r.monthsOut <= 3 ? "text-destructive font-medium" : "")}>{r.noticeDeadline}</span>
                              : <span className="text-muted-foreground/40">N/A</span>
                            }
                          </TableCell>
                        )
                      case "noticePeriod":
                        return <TableCell key="noticePeriod" className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{r.noticePeriod}</TableCell>
                      case "responsible":
                        return <TableCell key="responsible" className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{r.responsible}</TableCell>
                      case "notes":
                        return <TableCell key="notes" className="py-2.5 text-xs text-muted-foreground max-w-[240px] truncate">{r.notes || <span className="text-muted-foreground/40">--</span>}</TableCell>
                      default:
                        return null
                    }
                  })}
                  <TableCell className="py-2.5 pl-2" onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem onClick={() => markNoticeSent(r)} disabled={status === "Notice sent" || status === "Resolved"}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                          Mark notice sent
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => markAwaiting(r)} disabled={status !== "Notice sent"}>
                          <Clock className="h-3.5 w-3.5 mr-2" />
                          Move to awaiting response
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => markResolved(r)} disabled={status === "Resolved"}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-success" />
                          Mark resolved
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setReminderRow(r)}>
                          <Bell className="h-3.5 w-3.5 mr-2" />
                          Set reminder
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setActivityRow(r)}>
                          <History className="h-3.5 w-3.5 mr-2" />
                          View activity log
                        </DropdownMenuItem>
                        {r.draftAction && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <FileText className="h-3.5 w-3.5 mr-2" />
                              {r.draftAction}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
          <span className="text-xs text-muted-foreground">
            {filtered.length === 0 ? "0 dates" : `${(page - 1) * PAGE_SIZE + 1}--${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
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

      {activityRow && (
        <ActivityLogDialog
          row={activityRow}
          extraEntries={rowActivity[activityRow.id] ?? []}
          onClose={() => setActivityRow(null)}
          onAddEntry={note => addActivityNote(activityRow, note)}
        />
      )}
      {reminderRow && (
        <ReminderDialog row={reminderRow} onClose={() => setReminderRow(null)} />
      )}
    </div>
  )
}
