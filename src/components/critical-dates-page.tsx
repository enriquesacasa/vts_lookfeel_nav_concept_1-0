import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FilterBar, toggleFilterValue, clearFilterKey } from "@/components/filter-chip"
import {
  Search, ChevronLeft, ChevronRight, Settings2, GripVertical, Eye, EyeOff,
  AlertTriangle, Clock,
} from "lucide-react"
import { AgentBtn } from "@/components/agent-btn"
import { TenantAvatar } from "@/components/tenant-avatar"
import {
  Table, TableHeader, TableBody, TableRow, TableCell, TableHead,
  SortableHead, useSortState,
} from "@/components/sortable-table"

// ── Types ──────────────────────────────────────────────────────────────────────

type DateCategory = "Expiring" | "Renewal" | "Option" | "Rent commencement" | "TI deadline" | "Inspection" | "Notice"
type DateUrgency  = "Critical" | "Upcoming" | "Monitoring" | "Completed"

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
  responsible: string
  notes: string
}

type SortKey = "asset" | "tenant" | "suite" | "sf" | "dateType" | "urgency" | "date" | "monthsOut" | "responsible"

interface AssetRef { id: string; name: string }

// ── Data ──────────────────────────────────────────────────────────────────────

const ROWS: CriticalDateRow[] = [
  { id: "1",  asset: "VTS Tower Headquarters", tenant: "Pfizer",            suite: "Suite 1200",   sf: 117000, dateType: "Expiring",          urgency: "Critical",   date: "Sep 15, 2026", dateSortable: 20260915, monthsOut: 2,  noticePeriod: "12 months",      responsible: "Asset Manager", notes: "Tenant evaluating renewal vs relocation" },
  { id: "2",  asset: "VTS Tower Headquarters", tenant: "Morgan Stanley",    suite: "Floors 8–11",  sf: 116000, dateType: "Expiring",          urgency: "Critical",   date: "Nov 1, 2026",  dateSortable: 20261101, monthsOut: 4,  noticePeriod: "12 months",      responsible: "Asset Manager", notes: "LOI in negotiation" },
  { id: "3",  asset: "VTS Tower Headquarters", tenant: "Deloitte LLP",      suite: "Suite 500",    sf: 43000,  dateType: "Rent commencement", urgency: "Upcoming",   date: "Dec 1, 2026",  dateSortable: 20261201, monthsOut: 5,  noticePeriod: "N/A",            responsible: "Property Manager", notes: "Confirm TI completion before rent start" },
  { id: "4",  asset: "VTS Tower Headquarters", tenant: "KPMG",              suite: "Suite 3400",   sf: 117000, dateType: "Renewal",           urgency: "Upcoming",   date: "Jan 31, 2027", dateSortable: 20270131, monthsOut: 6,  noticePeriod: "9 months",       responsible: "Leasing Agent", notes: "Renewal window opens" },
  { id: "5",  asset: "VTS Tower Headquarters", tenant: "Ernst & Young",     suite: "Suite 2200",   sf: 80100,  dateType: "Option",            urgency: "Upcoming",   date: "Mar 1, 2027",  dateSortable: 20270301, monthsOut: 8,  noticePeriod: "90 days",        responsible: "Asset Manager", notes: "Contraction option — reduces by 20,000 sf" },
  { id: "6",  asset: "VTS Tower Headquarters", tenant: "HSBC Holdings",     suite: "Suite 900",    sf: 69300,  dateType: "Notice",            urgency: "Upcoming",   date: "Apr 15, 2027", dateSortable: 20270415, monthsOut: 9,  noticePeriod: "10 business days", responsible: "Legal", notes: "ROFO latest notice date on FL9" },
  { id: "7",  asset: "VTS Tower Headquarters", tenant: "Latham & Watkins",  suite: "Floors 14–15", sf: 119000, dateType: "Renewal",           urgency: "Monitoring", date: "May 1, 2027",  dateSortable: 20270501, monthsOut: 10, noticePeriod: "9 months",       responsible: "Leasing Agent", notes: "Renewal window opens — strong retention candidate" },
  { id: "8",  asset: "VTS Tower Headquarters", tenant: "JPMorgan Chase",    suite: "Floor 6",      sf: 55800,  dateType: "Option",            urgency: "Monitoring", date: "Jun 30, 2027", dateSortable: 20270630, monthsOut: 11, noticePeriod: "60 days",        responsible: "Asset Manager", notes: "Expansion option deadline — adjacent floor available" },
  { id: "9",  asset: "VTS Tower Headquarters", tenant: "Skadden Arps",      suite: "Suite 1800",   sf: 91200,  dateType: "TI deadline",       urgency: "Critical",   date: "Oct 1, 2026",  dateSortable: 20261001, monthsOut: 3,  noticePeriod: "N/A",            responsible: "Property Manager", notes: "TI work must be complete by this date per lease" },
  { id: "10", asset: "VTS Tower Headquarters", tenant: "Citigroup",         suite: "Floors 20–22", sf: 134000, dateType: "Expiring",          urgency: "Monitoring", date: "Mar 31, 2028", dateSortable: 20280331, monthsOut: 18, noticePeriod: "12 months",      responsible: "Asset Manager", notes: "Early renewal discussions underway" },
  { id: "11", asset: "VTS Tower Headquarters", tenant: "McKinsey & Co.",    suite: "Suite 2900",   sf: 48600,  dateType: "Inspection",        urgency: "Upcoming",   date: "Nov 15, 2026", dateSortable: 20261115, monthsOut: 4,  noticePeriod: "30 days",        responsible: "Property Manager", notes: "Annual HVAC and systems inspection" },
  { id: "12", asset: "VTS Tower Headquarters", tenant: "Blackrock",         suite: "Floors 30–32", sf: 156000, dateType: "Renewal",           urgency: "Monitoring", date: "Sep 1, 2028",  dateSortable: 20280901, monthsOut: 24, noticePeriod: "12 months",      responsible: "Asset Manager", notes: "Anchor tenant — begin retention strategy Q1 2027" },
  { id: "13", asset: "VTS Tower Headquarters", tenant: "Goldman Sachs",     suite: "Floor 25",     sf: 52000,  dateType: "Notice",            urgency: "Upcoming",   date: "Feb 28, 2027", dateSortable: 20270228, monthsOut: 7,  noticePeriod: "5 business days", responsible: "Legal", notes: "ROFR notice window on adjacent suite 2600" },
  { id: "14", asset: "VTS Tower Headquarters", tenant: "Verizon Media",     suite: "Suite 1500",   sf: 38400,  dateType: "Expiring",          urgency: "Upcoming",   date: "Jun 1, 2027",  dateSortable: 20270601, monthsOut: 10, noticePeriod: "9 months",       responsible: "Leasing Agent", notes: "Tenant on sublease market — watch" },
  { id: "15", asset: "VTS Tower Headquarters", tenant: "Pfizer",            suite: "Suite 1200",   sf: 117000, dateType: "Inspection",        urgency: "Monitoring", date: "Jan 15, 2027", dateSortable: 20270115, monthsOut: 6,  noticePeriod: "30 days",        responsible: "Property Manager", notes: "Structural and MEP inspection per lease" },
]

const PAGE_SIZE = 15

// ── Column definitions ─────────────────────────────────────────────────────────

interface ColDef { id: SortKey | "noticePeriod" | "notes" | "responsible"; label: string; sortable: boolean; right?: boolean; defaultVisible: boolean }

const ALL_COLUMNS: ColDef[] = [
  { id: "asset",        label: "Asset",           sortable: true,  defaultVisible: true  },
  { id: "tenant",       label: "Tenant",          sortable: true,  defaultVisible: true  },
  { id: "suite",        label: "Space",           sortable: true,  defaultVisible: true  },
  { id: "sf",           label: "SF",              sortable: true,  right: true, defaultVisible: true  },
  { id: "dateType",     label: "Date type",       sortable: true,  defaultVisible: true  },
  { id: "urgency",      label: "Urgency",         sortable: true,  defaultVisible: true  },
  { id: "date",         label: "Date",            sortable: true,  defaultVisible: true  },
  { id: "monthsOut",    label: "Months out",      sortable: true,  right: true, defaultVisible: true  },
  { id: "noticePeriod", label: "Notice period",   sortable: false, defaultVisible: true  },
  { id: "responsible",  label: "Responsible",     sortable: true,  defaultVisible: true  },
  { id: "notes",        label: "Notes",           sortable: false, defaultVisible: false },
]

// ── Badge styles ──────────────────────────────────────────────────────────────

const URGENCY_CLS: Record<DateUrgency, string> = {
  "Critical":   "bg-destructive/10 text-destructive",
  "Upcoming":   "bg-warning/10 text-warning",
  "Monitoring": "bg-primary/10 text-primary",
  "Completed":  "bg-muted text-muted-foreground",
}

const TYPE_CLS: Record<DateCategory, string> = {
  "Expiring":          "bg-destructive/10 text-destructive",
  "Renewal":           "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "Option":            "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "Rent commencement": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "TI deadline":       "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  "Inspection":        "bg-muted text-muted-foreground",
  "Notice":            "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
}

// ── KPI bar ───────────────────────────────────────────────────────────────────

function CriticalDatesKpi({ rows }: { rows: CriticalDateRow[] }) {
  const critical   = rows.filter(r => r.urgency === "Critical").length
  const next90     = rows.filter(r => r.monthsOut <= 3).length
  const expiring   = rows.filter(r => r.dateType === "Expiring").length
  const renewals   = rows.filter(r => r.dateType === "Renewal").length
  const options    = rows.filter(r => r.dateType === "Option" || r.dateType === "Notice").length
  const sfAtRisk   = rows.filter(r => r.urgency === "Critical" || r.urgency === "Upcoming").reduce((s, r) => s + r.sf, 0)

  const kpis = [
    { label: "Critical dates",    value: String(rows.length),                sub: `${critical} require action`, trend: critical > 0 ? "warn" as const : undefined },
    { label: "Due within 90 days", value: String(next90),                    sub: "immediate attention",        trend: next90 > 0 ? "warn" as const : undefined },
    { label: "Lease expirations", value: String(expiring),                   sub: "upcoming" },
    { label: "Renewal windows",   value: String(renewals),                   sub: "opening soon" },
    { label: "Option / notice",   value: String(options),                    sub: "deadlines" },
    { label: "SF at risk",        value: `${(sfAtRisk / 1000).toFixed(0)}K`, sub: "critical or upcoming" },
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
const URGENCIES: DateUrgency[]   = ["Critical", "Upcoming", "Monitoring", "Completed"]
const RESPONSIBLES = [...new Set(ROWS.map(r => r.responsible))].sort()
const ALL_TENANTS  = [...new Set(ROWS.map(r => r.tenant))].sort()

const BASE_FILTER_DEFS = [
  { key: "dateType",    label: "Date type",   options: DATE_TYPES.map(v => ({ label: v, value: v })) },
  { key: "urgency",     label: "Urgency",     options: URGENCIES.map(v => ({ label: v, value: v })) },
  { key: "tenant",      label: "Tenant",      options: ALL_TENANTS.map(v => ({ label: v, value: v })) },
  { key: "responsible", label: "Responsible", options: RESPONSIBLES.map(v => ({ label: v, value: v })) },
]

// ── Main page ─────────────────────────────────────────────────────────────────

export function CriticalDatesPage({ assets, onRowClick }: { assets?: AssetRef[]; onRowClick?: (tenant: string) => void }) {
  const isMultiAsset = (assets?.length ?? 0) > 1
  const { sortKey, sortDir, handleSort: _handleSort } = useSortState<SortKey>("date")
  const [page, setPage]     = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({})

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

  const filtered = React.useMemo(() => {
    let r = [...ROWS]
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(s => s.tenant.toLowerCase().includes(q) || s.suite.toLowerCase().includes(q) || s.dateType.toLowerCase().includes(q))
    }
    for (const [key, values] of Object.entries(activeFilters)) {
      if (!values.length) continue
      r = r.filter(s => values.includes(String(s[key as keyof CriticalDateRow])))
    }
    r.sort((a, b) => {
      let av: string | number
      let bv: string | number
      if (sortKey === "sf")         { av = a.sf; bv = b.sf }
      else if (sortKey === "monthsOut") { av = a.monthsOut; bv = b.monthsOut }
      else if (sortKey === "date")   { av = a.dateSortable; bv = b.dateSortable }
      else { av = (a[sortKey] as string ?? "").toString().toLowerCase(); bv = (b[sortKey] as string ?? "").toString().toLowerCase() }
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
      <CriticalDatesKpi rows={ROWS} />

      <div className={cardBase}>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search dates…"
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
            {paginated.map((r, i) => (
              <TableRow key={r.id} onClick={() => onRowClick?.(r.tenant)} className={cn(
                "transition-colors",
                onRowClick ? "cursor-pointer hover:bg-muted/60" : "hover:bg-muted/40",
                i > 0 ? "border-t border-border/40" : "border-0",
              )}>
                {orderedCols.map(col => {
                  switch (col.id) {
                    case "asset":
                      return <TableCell key="asset" className="py-2.5 text-sm font-medium text-foreground whitespace-nowrap">{r.asset}</TableCell>
                    case "tenant":
                      return <TableCell key="tenant" className="py-2.5 whitespace-nowrap"><div className="flex items-center gap-2.5"><TenantAvatar name={r.tenant} /><span className="text-sm font-medium text-foreground">{r.tenant}</span></div></TableCell>
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
                    case "urgency":
                      return (
                        <TableCell key="urgency" className="py-2.5 whitespace-nowrap">
                          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", URGENCY_CLS[r.urgency])}>
                            {r.urgency === "Critical" && <AlertTriangle className="h-3 w-3 shrink-0" />}
                            {r.urgency === "Upcoming" && <Clock className="h-3 w-3 shrink-0" />}
                            {r.urgency}
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
                    case "noticePeriod":
                      return <TableCell key="noticePeriod" className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{r.noticePeriod}</TableCell>
                    case "responsible":
                      return <TableCell key="responsible" className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{r.responsible}</TableCell>
                    case "notes":
                      return <TableCell key="notes" className="py-2.5 text-xs text-muted-foreground max-w-[240px] truncate">{r.notes || <span className="text-muted-foreground/40">—</span>}</TableCell>
                    default:
                      return null
                  }
                })}
                <TableCell className="py-2.5 pl-2">
                  <AgentBtn entity="Critical date" label={`${r.tenant} · ${r.dateType} · ${r.suite} · ${r.date} · ${r.monthsOut} months out`} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
          <span className="text-xs text-muted-foreground">
            {filtered.length === 0 ? "0 dates" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
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
