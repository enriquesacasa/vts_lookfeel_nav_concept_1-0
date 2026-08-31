import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FilterBar, toggleFilterValue, clearFilterKey } from "@/components/filter-chip"
import {
  Search, ChevronLeft, ChevronRight, Settings2, GripVertical, Eye, EyeOff,
  AlertTriangle, CheckCircle2,
} from "lucide-react"
import { AgentBtn } from "@/components/agent-btn"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table, TableHeader, TableBody, TableRow, TableCell, TableHead,
  SortableHead, useSortState,
} from "@/components/sortable-table"
import { DEALS } from "@/components/deals-page"

// ── Task definitions (mirroring deal-profile STAGE_TASKS) ────────────────────

type StageValue = "Inquiry" | "Touring" | "Proposal" | "LOI" | "Legal" | "Lease Out" | "Executed"
type TaskStatus = "Pending" | "Complete" | "Overdue"

interface StageDef {
  label: string
  required?: boolean
  done: boolean
}

const STAGE_TASKS: Record<StageValue, StageDef[]> = {
  "Inquiry":   [
    { label: "Qualify tenant requirements", required: true,  done: false },
    { label: "Schedule intro call",         required: true,  done: false },
    { label: "Add to deal pipeline",                         done: true  },
  ],
  "Touring":   [
    { label: "Prepare tour itinerary",      required: true,  done: true  },
    { label: "Collect tenant feedback",     required: true,  done: false },
    { label: "Shortlist top 2 suites",                       done: false },
    { label: "Schedule follow-up tour",                      done: false },
  ],
  "Proposal":  [
    { label: "Draft initial proposal",      required: true,  done: true  },
    { label: "Review proposal with landlord", required: true, done: false },
    { label: "Send proposal to tenant",     required: true,  done: false },
  ],
  "LOI":       [
    { label: "Counter lease terms",         required: true,  done: false },
    { label: "Align on TI allowance",       required: true,  done: false },
    { label: "Confirm free rent period",                     done: true  },
    { label: "Get legal review of redlines",                 done: false },
  ],
  "Legal":     [
    { label: "Review redlines with counsel",  required: true, done: false },
    { label: "Resolve subleasing rights flag",required: true, done: false },
    { label: "Confirm TI escalation clause",                  done: true  },
  ],
  "Lease Out": [
    { label: "Collect signatures from tenant",   required: true, done: false },
    { label: "Collect signatures from landlord", required: true, done: false },
    { label: "File executed lease",                              done: false },
  ],
  "Executed":  [
    { label: "Archive deal documents",  done: true  },
    { label: "Send close announcement", done: false },
    { label: "Log commission details",  done: false },
  ],
}

const ASSIGNEES: Record<StageValue, string> = {
  "Inquiry":   "Leasing Agent",
  "Touring":   "Leasing Agent",
  "Proposal":  "Asset Manager",
  "LOI":       "Asset Manager",
  "Legal":     "Legal",
  "Lease Out": "Property Manager",
  "Executed":  "Property Manager",
}

// ── Build flat rows ───────────────────────────────────────────────────────────

interface TaskRow {
  id: string
  dealId: string
  tenant: string
  asset: string
  space: string
  sf: number
  dealStage: StageValue
  dealStatus: string
  taskLabel: string
  taskStage: StageValue
  required: boolean
  status: TaskStatus
  assignee: string
  isCurrentStage: boolean
}

function buildRows(): TaskRow[] {
  const rows: TaskRow[] = []
  let seq = 0

  const activeDealStatuses = ["active", "stalled", "at-risk"]

  for (const deal of DEALS) {
    if (!activeDealStatuses.includes(deal.status)) continue
    const dealStage = deal.stage as StageValue
    const stageKeys = Object.keys(STAGE_TASKS) as StageValue[]
    const dealStageIdx = stageKeys.indexOf(dealStage)

    for (const [taskStage, tasks] of Object.entries(STAGE_TASKS) as [StageValue, StageDef[]][]) {
      const taskStageIdx = stageKeys.indexOf(taskStage)
      if (taskStageIdx > dealStageIdx) continue

      for (const task of tasks) {
        const isCurrentStage = taskStage === dealStage
        const status: TaskStatus = task.done
          ? "Complete"
          : (deal.status === "at-risk" || deal.status === "stalled") && isCurrentStage && task.required
            ? "Overdue"
            : "Pending"

        rows.push({
          id: `task-${seq++}`,
          dealId: deal.id,
          tenant: deal.tenant,
          asset: deal.asset,
          space: deal.space,
          sf: deal.sf,
          dealStage,
          dealStatus: deal.status,
          taskLabel: task.label,
          taskStage,
          required: task.required ?? false,
          status,
          assignee: ASSIGNEES[taskStage],
          isCurrentStage,
        })
      }
    }
  }
  return rows
}

const ALL_ROWS = buildRows()
const PAGE_SIZE = 15

// ── Column definitions ────────────────────────────────────────────────────────

type SortKey = "tenant" | "asset" | "sf" | "dealStage" | "taskStage" | "taskLabel" | "status" | "assignee" | "required"

interface ColDef { id: SortKey | "space" | "dealStatus"; label: string; sortable: boolean; right?: boolean; defaultVisible: boolean }

const ALL_COLUMNS: ColDef[] = [
  { id: "tenant",      label: "Tenant",         sortable: true,  defaultVisible: true  },
  { id: "asset",       label: "Asset",          sortable: true,  defaultVisible: true  },
  { id: "space",       label: "Space",          sortable: false, defaultVisible: false },
  { id: "sf",          label: "SF",             sortable: true,  right: true, defaultVisible: false },
  { id: "dealStage",   label: "Deal stage",     sortable: true,  defaultVisible: true  },
  { id: "dealStatus",  label: "Deal status",    sortable: true,  defaultVisible: true  },
  { id: "taskStage",   label: "Task stage",     sortable: true,  defaultVisible: false },
  { id: "taskLabel",   label: "Task",           sortable: true,  defaultVisible: true  },
  { id: "required",    label: "Required",       sortable: true,  defaultVisible: true  },
  { id: "status",      label: "Status",         sortable: true,  defaultVisible: true  },
  { id: "assignee",    label: "Assignee",       sortable: true,  defaultVisible: true  },
]

// ── Badge styles ──────────────────────────────────────────────────────────────

const TASK_STATUS_CLS: Record<TaskStatus, string> = {
  "Pending":  "bg-muted text-muted-foreground",
  "Complete": "bg-success/10 text-success",
  "Overdue":  "bg-destructive/10 text-destructive",
}

const DEAL_STATUS_CLS: Record<string, string> = {
  "active":   "bg-success/10 text-success",
  "stalled":  "bg-warning/10 text-warning",
  "at-risk":  "bg-destructive/10 text-destructive",
}

const STAGE_ORDER: StageValue[] = ["Inquiry", "Touring", "Proposal", "LOI", "Legal", "Lease Out", "Executed"]

// ── KPI bar ───────────────────────────────────────────────────────────────────

function DealTasksKpi({ rows }: { rows: TaskRow[] }) {
  const overdue    = rows.filter(r => r.status === "Overdue").length
  const pending    = rows.filter(r => r.status === "Pending").length
  const complete   = rows.filter(r => r.status === "Complete").length
  const required   = rows.filter(r => r.required && r.status !== "Complete").length
  const atRiskDeals = new Set(rows.filter(r => r.dealStatus === "at-risk").map(r => r.dealId)).size
  const activeDeals = new Set(rows.map(r => r.dealId)).size

  const kpis = [
    { label: "Total tasks",       value: String(rows.length),   sub: `${activeDeals} active deals` },
    { label: "Overdue",           value: String(overdue),       sub: "require immediate action", trend: overdue > 0 ? "warn" as const : undefined },
    { label: "Pending",           value: String(pending),       sub: "in progress" },
    { label: "Completed",         value: String(complete),      sub: `${Math.round((complete / Math.max(rows.length, 1)) * 100)}% completion rate` },
    { label: "Required open",     value: String(required),      sub: "blocking stage advance", trend: required > 0 ? "warn" as const : undefined },
    { label: "At-risk deals",     value: String(atRiskDeals),   sub: "with open tasks", trend: atRiskDeals > 0 ? "warn" as const : undefined },
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

const TASK_STATUSES: TaskStatus[] = ["Pending", "Overdue", "Complete"]
const ALL_TENANTS   = [...new Set(ALL_ROWS.map(r => r.tenant))].sort()
const ALL_ASSIGNEES = [...new Set(ALL_ROWS.map(r => r.assignee))].sort()

const FILTER_DEFS = [
  { key: "status",      label: "Status",       options: TASK_STATUSES.map(v => ({ label: v, value: v })) },
  { key: "required",    label: "Required",     options: [{ label: "Required", value: "true" }, { label: "Optional", value: "false" }] },
  { key: "dealStage",   label: "Deal stage",   options: STAGE_ORDER.map(v => ({ label: v, value: v })) },
  { key: "dealStatus",  label: "Deal status",  options: [{ label: "Active", value: "active" }, { label: "Stalled", value: "stalled" }, { label: "At risk", value: "at-risk" }] },
  { key: "assignee",    label: "Assignee",     options: ALL_ASSIGNEES.map(v => ({ label: v, value: v })) },
  { key: "tenant",      label: "Tenant",       options: ALL_TENANTS.map(v => ({ label: v, value: v })) },
]

// ── Main page ─────────────────────────────────────────────────────────────────

export function DealTasksPage({ onTaskClick }: { onTaskClick?: (dealId: string) => void }) {
  const [doneSet, setDoneSet] = React.useState<Set<string>>(
    () => new Set(ALL_ROWS.filter(r => r.status === "Complete").map(r => r.id))
  )

  const { sortKey, sortDir, handleSort: _handleSort } = useSortState<SortKey>("status")
  const [page, setPage]     = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({
    status: ["Pending", "Overdue"],
  })

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
    let r = [...ALL_ROWS]
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(s => s.tenant.toLowerCase().includes(q) || s.taskLabel.toLowerCase().includes(q) || s.asset.toLowerCase().includes(q))
    }
    for (const [key, values] of Object.entries(activeFilters)) {
      if (!values.length) continue
      r = r.filter(s => values.includes(String(s[key as keyof TaskRow])))
    }
    r.sort((a, b) => {
      let av: string | number
      let bv: string | number
      if (sortKey === "sf")          { av = a.sf; bv = b.sf }
      else if (sortKey === "dealStage" || sortKey === "taskStage") {
        av = STAGE_ORDER.indexOf(a[sortKey]); bv = STAGE_ORDER.indexOf(b[sortKey])
      }
      else if (sortKey === "required") { av = a.required ? 0 : 1; bv = b.required ? 0 : 1 }
      else { av = (a[sortKey] as string ?? "").toString().toLowerCase(); bv = (b[sortKey] as string ?? "").toString().toLowerCase() }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === "asc" ? cmp : -cmp
    })
    return r
  }, [search, activeFilters, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const orderedCols = colOrder
    .map(id => ALL_COLUMNS.find(c => c.id === id))
    .filter((c): c is ColDef => !!c && visible.has(c.id))

  return (
    <div className="space-y-4">
      <DealTasksKpi rows={ALL_ROWS} />

      <div className={cardBase}>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search tasks…"
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
            <ColumnManager columns={ALL_COLUMNS} visible={visible} order={colOrder} onToggle={toggleCol} onReorder={setColOrder} />
          </div>
        </div>

        <Table className="border-collapse">
          <TableHeader>
            <TableRow className="border-b-2 border-border/60 hover:bg-transparent">
              <TableHead className="pb-2 pt-0 w-8" />
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
                  No tasks match your filters.
                </TableCell>
              </TableRow>
            )}
            {paginated.map((r, i) => {
              const isDone = doneSet.has(r.id)
              const effectiveStatus: TaskStatus = isDone ? "Complete" : r.status === "Complete" ? "Pending" : r.status
              return (
              <TableRow key={r.id}
                onClick={() => onTaskClick?.(r.dealId)}
                className={cn(
                  "transition-colors",
                  i > 0 ? "border-t border-border/40" : "border-0",
                  onTaskClick ? "cursor-pointer hover:bg-primary/5" : "hover:bg-muted/40",
                  isDone && "opacity-50",
                )}>
                {/* Checkbox */}
                <TableCell className="py-2.5 pr-1 w-8" onClick={e => e.stopPropagation()}>
                  <Checkbox
                    checked={isDone}
                    onCheckedChange={() => setDoneSet(prev => { const n = new Set(prev); n.has(r.id) ? n.delete(r.id) : n.add(r.id); return n })}
                    className="size-4"
                  />
                </TableCell>
                {orderedCols.map(col => {
                  switch (col.id) {
                    case "tenant":
                      return <TableCell key="tenant" className="py-2.5 text-sm font-medium text-foreground whitespace-nowrap">{r.tenant}</TableCell>
                    case "asset":
                      return <TableCell key="asset" className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{r.asset}</TableCell>
                    case "space":
                      return <TableCell key="space" className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{r.space}</TableCell>
                    case "sf":
                      return <TableCell key="sf" className="py-2.5 text-right tabular-nums text-sm text-foreground whitespace-nowrap">{r.sf.toLocaleString()} sf</TableCell>
                    case "dealStage":
                      return <TableCell key="dealStage" className="py-2.5 text-sm text-foreground whitespace-nowrap">{r.dealStage}</TableCell>
                    case "dealStatus":
                      return (
                        <TableCell key="dealStatus" className="py-2.5 whitespace-nowrap">
                          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize", DEAL_STATUS_CLS[r.dealStatus] ?? "bg-muted text-muted-foreground")}>
                            {r.dealStatus === "at-risk" && <AlertTriangle className="h-3 w-3 shrink-0" />}
                            {r.dealStatus}
                          </span>
                        </TableCell>
                      )
                    case "taskStage":
                      return <TableCell key="taskStage" className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{r.taskStage}</TableCell>
                    case "taskLabel":
                      return (
                        <TableCell key="taskLabel" className="py-2.5 text-sm text-foreground">
                          <span className={cn(isDone && "line-through text-muted-foreground")}>{r.taskLabel}</span>
                        </TableCell>
                      )
                    case "required":
                      return (
                        <TableCell key="required" className="py-2.5 whitespace-nowrap">
                          {r.required
                            ? <span className="text-xs font-semibold text-warning">* Required</span>
                            : <span className="text-muted-foreground/40 text-sm">—</span>}
                        </TableCell>
                      )
                    case "status":
                      return (
                        <TableCell key="status" className="py-2.5 whitespace-nowrap">
                          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", TASK_STATUS_CLS[effectiveStatus])}>
                            {effectiveStatus === "Complete" && <CheckCircle2 className="h-3 w-3 shrink-0" />}
                            {effectiveStatus === "Overdue"  && <AlertTriangle className="h-3 w-3 shrink-0" />}
                            {effectiveStatus}
                          </span>
                        </TableCell>
                      )
                    case "assignee":
                      return <TableCell key="assignee" className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{r.assignee}</TableCell>
                    default:
                      return null
                  }
                })}
                <TableCell className="py-2.5 pl-2">
                  <AgentBtn entity="Task" label={`${r.tenant} · ${r.taskLabel} · ${r.dealStage} stage · ${r.status}`} />
                </TableCell>
              </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
          <span className="text-xs text-muted-foreground">
            {filtered.length === 0 ? "0 tasks" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
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
