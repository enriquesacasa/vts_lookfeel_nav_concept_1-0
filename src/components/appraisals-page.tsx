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

export interface Appraisal {
  id: string
  asset: string
  appraiser: string
  appraisedValue: number
  capRate: number
  pricePerSf: number
  date: string
  status: "Current" | "Stale" | "Pending"
  nextDue: string
}

type SortKey = "asset" | "appraiser" | "appraisedValue" | "capRate" | "pricePerSf" | "date" | "status" | "nextDue"

// ── Mock data ─────────────────────────────────────────────────────────────────

export const APPRAISALS: Appraisal[] = [
  { id: "a01", asset: "VTS Tower Headquarters", appraiser: "CBRE Valuation",          appraisedValue: 1_240_000_000, capRate: 4.8, pricePerSf: 1085, date: "Mar 15, 2026", status: "Current", nextDue: "Mar 15, 2027" },
  { id: "a02", asset: "VTS Tower Headquarters", appraiser: "JLL Valuations",           appraisedValue: 1_195_000_000, capRate: 5.0, pricePerSf: 1045, date: "Sep 10, 2025", status: "Current", nextDue: "Sep 10, 2026" },
  { id: "a03", asset: "VTS Tower Headquarters", appraiser: "Cushman & Wakefield",      appraisedValue: 1_210_000_000, capRate: 4.9, pricePerSf: 1060, date: "Jun 01, 2024", status: "Stale",   nextDue: "Jun 01, 2025" },
  { id: "a04", asset: "VTS Tower Headquarters", appraiser: "Newmark",                  appraisedValue: 1_255_000_000, capRate: 4.7, pricePerSf: 1098, date: "Dec 20, 2025", status: "Pending", nextDue: "Dec 20, 2026" },
  { id: "a05", asset: "One Financial Plaza",    appraiser: "CBRE Valuation",           appraisedValue:   520_000_000, capRate: 5.4, pricePerSf:  920, date: "Feb 28, 2026", status: "Current", nextDue: "Feb 28, 2027" },
  { id: "a06", asset: "One Financial Plaza",    appraiser: "JLL Valuations",           appraisedValue:   498_000_000, capRate: 5.6, pricePerSf:  881, date: "Aug 15, 2024", status: "Stale",   nextDue: "Aug 15, 2025" },
  { id: "a07", asset: "One Financial Plaza",    appraiser: "Cushman & Wakefield",      appraisedValue:   511_000_000, capRate: 5.5, pricePerSf:  904, date: "Nov 01, 2025", status: "Pending", nextDue: "Nov 01, 2026" },
  { id: "a08", asset: "Salesforce Tower",       appraiser: "CBRE Valuation",           appraisedValue:   875_000_000, capRate: 5.1, pricePerSf:  990, date: "Apr 05, 2026", status: "Current", nextDue: "Apr 05, 2027" },
  { id: "a09", asset: "Salesforce Tower",       appraiser: "Newmark",                  appraisedValue:   860_000_000, capRate: 5.2, pricePerSf:  972, date: "Jan 18, 2026", status: "Current", nextDue: "Jan 18, 2027" },
  { id: "a10", asset: "Salesforce Tower",       appraiser: "JLL Valuations",           appraisedValue:   890_000_000, capRate: 5.0, pricePerSf: 1006, date: "Jul 22, 2024", status: "Stale",   nextDue: "Jul 22, 2025" },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtValue(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
  return `$${(n / 1_000_000).toFixed(0)}M`
}

function fmtCapRate(n: number) {
  return `${n.toFixed(1)}%`
}

function fmtPsf(n: number) {
  return `$${n.toLocaleString()}/sf`
}

const STATUS_CLS: Record<Appraisal["status"], string> = {
  "Current": "bg-success/15 text-success",
  "Pending": "bg-primary/15 text-primary",
  "Stale":   "bg-destructive/15 text-destructive",
}

// ── Filter / sort setup ───────────────────────────────────────────────────────

const UNIQUE_ASSETS = Array.from(new Set(APPRAISALS.map(a => a.asset)))
const UNIQUE_APPRAISERS = Array.from(new Set(APPRAISALS.map(a => a.appraiser)))

const FILTER_DEFS = [
  {
    key: "asset",
    label: "Asset",
    options: UNIQUE_ASSETS.map(v => ({ label: v, value: v })),
  },
  {
    key: "appraiser",
    label: "Appraiser",
    options: UNIQUE_APPRAISERS.map(v => ({ label: v, value: v })),
  },
  {
    key: "status",
    label: "Status",
    options: (["Current", "Pending", "Stale"] as Appraisal["status"][]).map(v => ({ label: v, value: v })),
  },
]

// ── Main component ────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

export function AppraisalsPage() {
  const { sortKey, sortDir, handleSort: _handleSort } = useSortState<SortKey>("asset")
  const [search, setSearch] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({})
  const [page, setPage] = React.useState(1)

  function handleSort(key: SortKey) { _handleSort(key); setPage(1) }
  function onToggle(key: string, value: string) { setActiveFilters(prev => toggleFilterValue(prev, key, value)); setPage(1) }
  function onClear(key: string) { setActiveFilters(prev => clearFilterKey(prev, key)); setPage(1) }
  function onClearAll() { setActiveFilters({}); setPage(1) }

  const filtered = React.useMemo(() => {
    let r = [...APPRAISALS]
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(a =>
        a.asset.toLowerCase().includes(q) ||
        a.appraiser.toLowerCase().includes(q)
      )
    }
    for (const [key, values] of Object.entries(activeFilters)) {
      if (!values.length) continue
      r = r.filter(a => values.includes(String(a[key as keyof Appraisal])))
    }
    r.sort((a, b) => {
      let av: string | number
      let bv: string | number
      if (sortKey === "appraisedValue" || sortKey === "capRate" || sortKey === "pricePerSf") {
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
  const portfolioValue = APPRAISALS.reduce((a, v) => a + v.appraisedValue, 0)
  const avgCapRate = APPRAISALS.reduce((a, v) => a + v.capRate, 0) / APPRAISALS.length
  const avgPsf = APPRAISALS.reduce((a, v) => a + v.pricePerSf, 0) / APPRAISALS.length
  const dueIn90 = APPRAISALS.filter(a => a.status === "Pending").length

  const kpis = [
    { label: "Portfolio appraised value", value: fmtValue(portfolioValue) },
    { label: "Avg cap rate",              value: fmtCapRate(avgCapRate) },
    { label: "Avg price/sf",              value: fmtPsf(Math.round(avgPsf)) },
    { label: "Due in 90 days",            value: String(dueIn90), subtitle: "appraisals" },
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
                placeholder="Search appraisals..."
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
                <SortableHead col="asset"          sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Asset</SortableHead>
                <SortableHead col="appraiser"      sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Appraiser</SortableHead>
                <SortableHead col="appraisedValue" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} right>Appraised value</SortableHead>
                <SortableHead col="capRate"        sortKey={sortKey} sortDir={sortDir} onSort={handleSort} right>Cap rate</SortableHead>
                <SortableHead col="pricePerSf"     sortKey={sortKey} sortDir={sortDir} onSort={handleSort} right>Price/sf</SortableHead>
                <SortableHead col="date"           sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Date</SortableHead>
                <SortableHead col="status"         sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Status</SortableHead>
                <SortableHead col="nextDue"        sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Next due</SortableHead>
                <TableHead className="pb-2 pt-0 w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                    No appraisals match your filters.
                  </TableCell>
                </TableRow>
              )}
              {paginated.map((a, i) => (
                <TableRow
                  key={a.id}
                  className={cn(
                    "transition-colors hover:bg-muted/40",
                    i > 0 ? "border-t border-border/40" : "border-0"
                  )}
                >
                  <TableCell className="py-2.5 text-sm font-medium text-foreground whitespace-nowrap">{a.asset}</TableCell>
                  <TableCell className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{a.appraiser}</TableCell>
                  <TableCell className="py-2.5 text-right tabular-nums text-sm font-medium text-foreground whitespace-nowrap">{fmtValue(a.appraisedValue)}</TableCell>
                  <TableCell className="py-2.5 text-right tabular-nums text-sm text-foreground whitespace-nowrap">{fmtCapRate(a.capRate)}</TableCell>
                  <TableCell className="py-2.5 text-right tabular-nums text-sm text-foreground whitespace-nowrap">{fmtPsf(a.pricePerSf)}</TableCell>
                  <TableCell className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{a.date}</TableCell>
                  <TableCell className="py-2.5 whitespace-nowrap">
                    <Badge className={cn("rounded-full px-2 py-0.5 text-xs font-medium border-0", STATUS_CLS[a.status])}>
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{a.nextDue}</TableCell>
                  <TableCell className="py-2.5 pl-2">
                    <AgentBtn
                      entity="Appraisal"
                      label={`${a.asset} · ${a.appraiser} · ${fmtValue(a.appraisedValue)} · cap rate ${fmtCapRate(a.capRate)} · ${a.status} · next due ${a.nextDue}`}
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
            {filtered.length === 0 ? "0 appraisals" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
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
