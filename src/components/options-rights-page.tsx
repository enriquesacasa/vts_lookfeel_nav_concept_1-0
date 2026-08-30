import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FilterBar, toggleFilterValue, clearFilterKey } from "@/components/filter-chip"
import {
  Search, ChevronLeft, ChevronRight, Settings2, GripVertical, Eye, EyeOff,
  AlertTriangle,
} from "lucide-react"
import { AgentBtn } from "@/components/agent-btn"
import {
  Table, TableHeader, TableBody, TableRow, TableCell, TableHead,
  SortableHead, useSortState,
} from "@/components/sortable-table"
import { floors } from "@/components/stacking-plan"

// ── Types ──────────────────────────────────────────────────────────────────────

type OptionType = "Renewal Option" | "Expansion Option" | "Termination Option" | "ROFO" | "ROFR" | "Contraction Option"
type OptionStatus = "Active" | "Exercised" | "Expired" | "Expiring soon"

interface OptionRight {
  id: string
  asset: string
  tenant: string
  suite: string
  floor: string
  floorNum: number
  sf: number
  optionType: OptionType
  status: OptionStatus
  noticeDue: string
  leaseExpiry: string
  priority: number | null
  notes: string
}

type SortKey = "asset" | "tenant" | "suite" | "floor" | "sf" | "optionType" | "status" | "noticeDue" | "leaseExpiry" | "priority"

interface AssetRef { id: string; name: string }

// ── Derive rows from stacking-plan floors ─────────────────────────────────────

function buildRows(): OptionRight[] {
  const rows: OptionRight[] = []
  let seq = 0

  // Encumbrances (ROFR/ROFO/Expansion on available/vacant spaces)
  for (const f of floors) {
    for (const s of f.spaces) {
      if (s.encumbrances) {
        for (const enc of s.encumbrances) {
          rows.push({
            id: `enc-${seq++}`,
            asset: "VTS Tower Headquarters",
            tenant: enc.tenant,
            suite: s.suite,
            floor: `Floor ${f.number}`,
            floorNum: f.number,
            sf: s.sf,
            optionType: enc.optionType as OptionType,
            status: "Active",
            noticeDue: enc.details?.find(d => d.label.toLowerCase().includes("notice") || d.label.toLowerCase().includes("deadline"))?.value ?? "—",
            leaseExpiry: "—",
            priority: enc.priority ?? null,
            notes: enc.details?.find(d => d.label === "Trigger")?.value ?? "",
          })
        }
      }
      // Lease options (Renewal, Termination, Expansion on leased spaces)
      if (s.tenant && s.leaseOptions) {
        for (const opt of s.leaseOptions) {
          rows.push({
            id: `opt-${seq++}`,
            asset: "VTS Tower Headquarters",
            tenant: s.tenant,
            suite: s.suite,
            floor: `Floor ${f.number}`,
            floorNum: f.number,
            sf: s.sf,
            optionType: opt as OptionType,
            status: "Active",
            noticeDue: NOTICE_DEADLINES[`${s.suite}-${opt}`] ?? NOTICE_DEADLINES[opt] ?? "—",
            leaseExpiry: s.lxd ?? "—",
            priority: null,
            notes: "",
          })
        }
      }
    }
  }
  return rows
}

// Notice deadlines keyed by "suite-optionType" or just optionType as fallback
const NOTICE_DEADLINES: Record<string, string> = {
  "Renewal Option":       "12 months prior to expiry",
  "Termination Option":   "Dec 31, 2026",
  "0800-Termination Option": "Dec 31, 2026",
  "0200-Termination Option": "Jun 30, 2027",
  "Expansion Option":     "60 days written notice",
  "ROFO":                 "10 business days",
  "ROFR":                 "5 business days",
}

const ROWS = buildRows()

const PAGE_SIZE = 15

// ── Column definitions ─────────────────────────────────────────────────────────

interface ColDef { id: SortKey | "notes"; label: string; sortable: boolean; right?: boolean; defaultVisible: boolean }

const ALL_COLUMNS: ColDef[] = [
  { id: "asset",       label: "Asset",         sortable: true,  defaultVisible: true  },
  { id: "tenant",      label: "Tenant",        sortable: true,  defaultVisible: true  },
  { id: "floor",       label: "Floor",         sortable: true,  defaultVisible: true  },
  { id: "suite",       label: "Space",         sortable: true,  defaultVisible: true  },
  { id: "sf",          label: "SF",            sortable: true,  right: true, defaultVisible: true  },
  { id: "optionType",  label: "Option type",   sortable: true,  defaultVisible: true  },
  { id: "status",      label: "Status",        sortable: true,  defaultVisible: true  },
  { id: "noticeDue",   label: "Notice due",    sortable: false, defaultVisible: true  },
  { id: "leaseExpiry", label: "Lease expiry",  sortable: true,  defaultVisible: true  },
  { id: "priority",    label: "Priority",      sortable: true,  right: true, defaultVisible: true  },
  { id: "notes",       label: "Notes",         sortable: false, defaultVisible: false },
]

// ── Status styles ─────────────────────────────────────────────────────────────

const STATUS_CLS: Record<OptionStatus, string> = {
  "Active":         "bg-success/10 text-success",
  "Expiring soon":  "bg-warning/10 text-warning",
  "Exercised":      "bg-primary/10 text-primary",
  "Expired":        "bg-muted text-muted-foreground",
}

const TYPE_CLS: Record<OptionType, string> = {
  "Renewal Option":     "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "Expansion Option":   "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "Termination Option": "bg-destructive/10 text-destructive",
  "Contraction Option": "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  "ROFO":               "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "ROFR":               "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
}

// ── KPI bar ───────────────────────────────────────────────────────────────────

function OptionsKpi({ rows }: { rows: OptionRight[] }) {
  const active       = rows.filter(r => r.status === "Active").length
  const expiringSoon = rows.filter(r => r.status === "Expiring soon").length
  const renewals     = rows.filter(r => r.optionType === "Renewal Option").length
  const rofx         = rows.filter(r => r.optionType === "ROFO" || r.optionType === "ROFR").length
  const termination  = rows.filter(r => r.optionType === "Termination Option").length

  const kpis = [
    { label: "Total options & rights", value: String(rows.length),    sub: `${active} active` },
    { label: "Expiring soon",          value: String(expiringSoon),   sub: "require action", trend: expiringSoon > 0 ? "warn" as const : undefined },
    { label: "Renewal options",        value: String(renewals),       sub: "across leases" },
    { label: "ROFO / ROFR",           value: String(rofx),           sub: "first offer / refusal" },
    { label: "Termination options",    value: String(termination),    sub: "landlord exposure", trend: termination > 0 ? "warn" as const : undefined },
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

const OPTION_TYPES: OptionType[] = ["Renewal Option", "Expansion Option", "Termination Option", "ROFO", "ROFR", "Contraction Option"]
const STATUSES: OptionStatus[]   = ["Active", "Expiring soon", "Exercised", "Expired"]
const ALL_TENANTS = [...new Set(ROWS.map(r => r.tenant))].sort()

const BASE_FILTER_DEFS = [
  { key: "optionType", label: "Option type", options: OPTION_TYPES.map(v => ({ label: v, value: v })) },
  { key: "status",     label: "Status",      options: STATUSES.map(v => ({ label: v, value: v })) },
  { key: "tenant",     label: "Tenant",      options: ALL_TENANTS.map(v => ({ label: v, value: v })) },
]

// ── Main page ─────────────────────────────────────────────────────────────────

export function OptionsRightsPage({ assets }: { assets?: AssetRef[] }) {
  const isMultiAsset = (assets?.length ?? 0) > 1
  const { sortKey, sortDir, handleSort: _handleSort } = useSortState<SortKey>("tenant")
  const [page, setPage]   = React.useState(1)
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
      r = r.filter(s => s.tenant.toLowerCase().includes(q) || s.suite.toLowerCase().includes(q) || s.optionType.toLowerCase().includes(q))
    }
    for (const [key, values] of Object.entries(activeFilters)) {
      if (!values.length) continue
      r = r.filter(s => values.includes(String(s[key as keyof OptionRight])))
    }
    r.sort((a, b) => {
      let av: string | number
      let bv: string | number
      if (sortKey === "sf")          { av = a.sf; bv = b.sf }
      else if (sortKey === "priority") { av = a.priority ?? 99; bv = b.priority ?? 99 }
      else if (sortKey === "floor")    { av = a.floorNum; bv = b.floorNum }
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
      <OptionsKpi rows={ROWS} />

      <div className={cardBase}>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search options…"
              className="pl-8 h-8 text-sm w-48"
            />
          </div>
          <FilterBar
            filters={FILTER_DEFS}
            active={activeFilters}
            onToggle={onToggle}
            onClear={onClear}
            onClearAll={onClearAll}
            visibleCount={3}
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
                  No options match your filters.
                </TableCell>
              </TableRow>
            )}
            {paginated.map((r, i) => (
              <TableRow key={r.id} className={cn(
                "hover:bg-muted/40 transition-colors",
                i > 0 ? "border-t border-border/40" : "border-0",
              )}>
                {orderedCols.map(col => {
                  switch (col.id) {
                    case "asset":
                      return <TableCell key="asset" className="py-2.5 text-sm font-medium text-foreground whitespace-nowrap">{r.asset}</TableCell>
                    case "tenant":
                      return <TableCell key="tenant" className="py-2.5 text-sm font-medium text-foreground whitespace-nowrap">{r.tenant}</TableCell>
                    case "floor":
                      return <TableCell key="floor" className="py-2.5 text-sm text-foreground whitespace-nowrap">{r.floor}</TableCell>
                    case "suite":
                      return <TableCell key="suite" className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{r.suite}</TableCell>
                    case "sf":
                      return <TableCell key="sf" className="py-2.5 text-right tabular-nums text-sm text-foreground whitespace-nowrap">{r.sf.toLocaleString()} sf</TableCell>
                    case "optionType":
                      return (
                        <TableCell key="optionType" className="py-2.5 whitespace-nowrap">
                          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", TYPE_CLS[r.optionType])}>
                            {r.optionType}
                          </span>
                        </TableCell>
                      )
                    case "status":
                      return (
                        <TableCell key="status" className="py-2.5 whitespace-nowrap">
                          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", STATUS_CLS[r.status])}>
                            {r.status}
                          </span>
                        </TableCell>
                      )
                    case "noticeDue":
                      return <TableCell key="noticeDue" className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{r.noticeDue}</TableCell>
                    case "leaseExpiry":
                      return <TableCell key="leaseExpiry" className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{r.leaseExpiry}</TableCell>
                    case "priority":
                      return (
                        <TableCell key="priority" className="py-2.5 text-right whitespace-nowrap">
                          {r.priority != null
                            ? <span className="text-xs font-medium text-muted-foreground tabular-nums">{r.priority === 1 ? "1st" : r.priority === 2 ? "2nd" : `${r.priority}rd`}</span>
                            : <span className="text-muted-foreground/40 text-sm">—</span>}
                        </TableCell>
                      )
                    case "notes":
                      return <TableCell key="notes" className="py-2.5 text-xs text-muted-foreground max-w-[200px] truncate">{r.notes || <span className="text-muted-foreground/40">—</span>}</TableCell>
                    default:
                      return null
                  }
                })}
                <TableCell className="py-2.5 pl-2">
                  <AgentBtn entity="Option" label={`${r.tenant} · ${r.optionType} · ${r.floor} Suite ${r.suite} · ${r.sf.toLocaleString()} sf · expires ${r.leaseExpiry}`} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
          <span className="text-xs text-muted-foreground">
            {filtered.length === 0 ? "0 options" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
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
