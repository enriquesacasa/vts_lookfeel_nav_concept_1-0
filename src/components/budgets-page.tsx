import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { KpiBar } from "@/components/kpi-bar"
import { FilterBar, toggleFilterValue, clearFilterKey } from "@/components/filter-chip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Settings2, ChevronLeft, ChevronRight } from "lucide-react"
import { AgentBtn } from "@/components/agent-btn"
import {
  Table, TableHeader, TableBody, TableRow, TableCell, TableHead,
  SortableHead, useSortState,
} from "@/components/sortable-table"

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Budget {
  id: string
  asset: string
  category: "Revenue" | "Expense" | "CapEx"
  budget: number
  actual: number
  varianceDollar: number
  variancePct: number
  period: string
  status: "On track" | "At risk" | "Over budget"
}

type SortKey = "asset" | "category" | "budget" | "actual" | "varianceDollar" | "variancePct" | "period" | "status"

// ── Mock data ─────────────────────────────────────────────────────────────────

export const BUDGETS: Budget[] = [
  { id: "b01", asset: "VTS Tower Headquarters", category: "Revenue", budget: 28500000, actual: 29100000, varianceDollar: 600000,   variancePct:  2.1,  period: "Q2 2026", status: "On track"   },
  { id: "b02", asset: "VTS Tower Headquarters", category: "Revenue", budget: 27800000, actual: 27200000, varianceDollar: -600000,  variancePct: -2.2,  period: "Q1 2026", status: "At risk"    },
  { id: "b03", asset: "VTS Tower Headquarters", category: "Expense", budget: 8400000,  actual: 8750000,  varianceDollar: 350000,   variancePct:  4.2,  period: "Q2 2026", status: "At risk"    },
  { id: "b04", asset: "VTS Tower Headquarters", category: "Expense", budget: 8200000,  actual: 8180000,  varianceDollar: -20000,   variancePct: -0.2,  period: "Q1 2026", status: "On track"   },
  { id: "b05", asset: "VTS Tower Headquarters", category: "CapEx",   budget: 3200000,  actual: 3850000,  varianceDollar: 650000,   variancePct: 20.3,  period: "Q2 2026", status: "Over budget" },
  { id: "b06", asset: "VTS Tower Headquarters", category: "CapEx",   budget: 1500000,  actual: 1480000,  varianceDollar: -20000,   variancePct: -1.3,  period: "Q1 2026", status: "On track"   },
  { id: "b07", asset: "One Financial Plaza",    category: "Revenue", budget: 12400000, actual: 12600000, varianceDollar: 200000,   variancePct:  1.6,  period: "Q2 2026", status: "On track"   },
  { id: "b08", asset: "One Financial Plaza",    category: "Revenue", budget: 12100000, actual: 11800000, varianceDollar: -300000,  variancePct: -2.5,  period: "Q1 2026", status: "At risk"    },
  { id: "b09", asset: "One Financial Plaza",    category: "Expense", budget: 3900000,  actual: 3860000,  varianceDollar: -40000,   variancePct: -1.0,  period: "Q2 2026", status: "On track"   },
  { id: "b10", asset: "One Financial Plaza",    category: "CapEx",   budget: 950000,   actual: 1100000,  varianceDollar: 150000,   variancePct: 15.8,  period: "Q2 2026", status: "Over budget" },
  { id: "b11", asset: "Salesforce Tower",       category: "Revenue", budget: 18200000, actual: 18500000, varianceDollar: 300000,   variancePct:  1.6,  period: "Q2 2026", status: "On track"   },
  { id: "b12", asset: "Salesforce Tower",       category: "Revenue", budget: 17900000, actual: 18100000, varianceDollar: 200000,   variancePct:  1.1,  period: "Q1 2026", status: "On track"   },
  { id: "b13", asset: "Salesforce Tower",       category: "Expense", budget: 5600000,  actual: 5750000,  varianceDollar: 150000,   variancePct:  2.7,  period: "Q2 2026", status: "At risk"    },
  { id: "b14", asset: "Salesforce Tower",       category: "CapEx",   budget: 2100000,  actual: 2080000,  varianceDollar: -20000,   variancePct: -1.0,  period: "Q2 2026", status: "On track"   },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDollars(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `$${(n / 1000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

function fmtVariance(n: number) {
  const abs = Math.abs(n)
  const s = abs >= 1_000_000 ? `$${(abs / 1_000_000).toFixed(1)}M` : `$${(abs / 1000).toFixed(0)}K`
  return n >= 0 ? `+${s}` : `-${s}`
}

function fmtPct(n: number) {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`
}

const STATUS_CLS: Record<Budget["status"], string> = {
  "On track":   "bg-success/15 text-success",
  "At risk":    "bg-warning/15 text-warning",
  "Over budget":"bg-destructive/15 text-destructive",
}

// ── Filter / sort setup ───────────────────────────────────────────────────────

const UNIQUE_ASSETS = Array.from(new Set(BUDGETS.map(b => b.asset)))

const FILTER_DEFS = [
  {
    key: "asset",
    label: "Asset",
    options: UNIQUE_ASSETS.map(v => ({ label: v, value: v })),
  },
  {
    key: "category",
    label: "Category",
    options: (["Revenue", "Expense", "CapEx"] as Budget["category"][]).map(v => ({ label: v, value: v })),
  },
  {
    key: "status",
    label: "Status",
    options: (["On track", "At risk", "Over budget"] as Budget["status"][]).map(v => ({ label: v, value: v })),
  },
]

// ── Main component ────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

export function BudgetsPage() {
  const { sortKey, sortDir, handleSort: _handleSort } = useSortState<SortKey>("asset")
  const [search, setSearch] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({})
  const [page, setPage] = React.useState(1)

  function handleSort(key: SortKey) { _handleSort(key); setPage(1) }
  function onToggle(key: string, value: string) { setActiveFilters(prev => toggleFilterValue(prev, key, value)); setPage(1) }
  function onClear(key: string) { setActiveFilters(prev => clearFilterKey(prev, key)); setPage(1) }
  function onClearAll() { setActiveFilters({}); setPage(1) }

  const filtered = React.useMemo(() => {
    let r = [...BUDGETS]
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(b =>
        b.asset.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.period.toLowerCase().includes(q)
      )
    }
    for (const [key, values] of Object.entries(activeFilters)) {
      if (!values.length) continue
      r = r.filter(b => values.includes(String(b[key as keyof Budget])))
    }
    r.sort((a, b) => {
      let av: string | number
      let bv: string | number
      if (sortKey === "budget" || sortKey === "actual" || sortKey === "varianceDollar" || sortKey === "variancePct") {
        av = a[sortKey]; bv = b[sortKey]
      } else {
        av = String(a[sortKey]).toLowerCase()
        bv = String(b[sortKey]).toLowerCase()
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === "asc" ? cmp : -cmp
    })
    return r
  }, [search, activeFilters, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // KPIs
  const revRows = BUDGETS.filter(b => b.category === "Revenue")
  const totalNoiBudget = revRows.reduce((a, b) => a + b.budget, 0)
  const totalVariance = BUDGETS.reduce((a, b) => a + b.varianceDollar, 0)
  const capExCommitted = BUDGETS.filter(b => b.category === "CapEx").reduce((a, b) => a + b.actual, 0)
  const assetStatuses = UNIQUE_ASSETS.map(asset => {
    const rows = BUDGETS.filter(b => b.asset === asset)
    return rows.every(b => b.status === "On track")
  })
  const assetsOnTrack = assetStatuses.filter(Boolean).length

  const kpis = [
    { label: "Total NOI budget",  value: fmtDollars(totalNoiBudget) },
    { label: "Budget variance",   value: fmtVariance(totalVariance), trend: totalVariance >= 0 ? "up" as const : "down" as const },
    { label: "CapEx committed",   value: fmtDollars(capExCommitted) },
    { label: "Assets on track",   value: `${assetsOnTrack} / ${UNIQUE_ASSETS.length}` },
  ]

  return (
    <div className="space-y-4">
      <KpiBar kpis={kpis} />

      <div className={cardBase}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search budgets..."
                className="pl-8 h-8 text-sm w-44"
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
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs rounded-full">
                <Settings2 className="h-3.5 w-3.5" />
                Configure
              </Button>
            </div>
          </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table className="border-collapse">
            <TableHeader>
              <TableRow className="border-b-2 border-border/60 hover:bg-transparent">
                <SortableHead col="asset"         sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Asset</SortableHead>
                <SortableHead col="category"      sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Category</SortableHead>
                <SortableHead col="budget"        sortKey={sortKey} sortDir={sortDir} onSort={handleSort} right>Budget</SortableHead>
                <SortableHead col="actual"        sortKey={sortKey} sortDir={sortDir} onSort={handleSort} right>Actual</SortableHead>
                <SortableHead col="varianceDollar" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} right>Variance ($)</SortableHead>
                <SortableHead col="variancePct"   sortKey={sortKey} sortDir={sortDir} onSort={handleSort} right>Variance (%)</SortableHead>
                <SortableHead col="period"        sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Period</SortableHead>
                <SortableHead col="status"        sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Status</SortableHead>
                <TableHead className="pb-2 pt-0 w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                    No budgets match your filters.
                  </TableCell>
                </TableRow>
              )}
              {paginated.map((b, i) => (
                <TableRow
                  key={b.id}
                  className={cn(
                    "transition-colors hover:bg-muted/40",
                    i > 0 ? "border-t border-border/40" : "border-0"
                  )}
                >
                  <TableCell className="py-2.5 text-sm font-medium text-foreground whitespace-nowrap">{b.asset}</TableCell>
                  <TableCell className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{b.category}</TableCell>
                  <TableCell className="py-2.5 text-right tabular-nums text-sm text-foreground whitespace-nowrap">{fmtDollars(b.budget)}</TableCell>
                  <TableCell className="py-2.5 text-right tabular-nums text-sm text-foreground whitespace-nowrap">{fmtDollars(b.actual)}</TableCell>
                  <TableCell className={cn("py-2.5 text-right tabular-nums text-sm font-medium whitespace-nowrap", b.varianceDollar >= 0 ? "text-success" : "text-destructive")}>
                    {fmtVariance(b.varianceDollar)}
                  </TableCell>
                  <TableCell className={cn("py-2.5 text-right tabular-nums text-sm font-medium whitespace-nowrap", b.variancePct >= 0 ? "text-success" : "text-destructive")}>
                    {fmtPct(b.variancePct)}
                  </TableCell>
                  <TableCell className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{b.period}</TableCell>
                  <TableCell className="py-2.5 whitespace-nowrap">
                    <Badge className={cn("rounded-full px-2 py-0.5 text-xs font-medium border-0", STATUS_CLS[b.status])}>
                      {b.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2.5 pl-2">
                    <AgentBtn
                      entity="Budget"
                      label={`${b.asset} · ${b.category} · ${b.period} · budget ${fmtDollars(b.budget)} · actual ${fmtDollars(b.actual)} · ${b.status}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/40">
          <span className="text-xs text-muted-foreground">
            {filtered.length === 0 ? "0 budgets" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
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
