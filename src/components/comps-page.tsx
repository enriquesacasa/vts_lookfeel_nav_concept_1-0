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

export interface Comp {
  id: string
  building: string
  tenant: string
  sf: number
  floor: string
  askingRent: number
  effectiveRent: number
  freeRent: number
  ti: number
  date: string
  term: number
  dealType: "Direct" | "Sublease"
  market: string
}

type SortKey = "building" | "tenant" | "sf" | "floor" | "askingRent" | "effectiveRent" | "freeRent" | "ti" | "date" | "term" | "dealType" | "market"

// ── Mock data ─────────────────────────────────────────────────────────────────

export const COMPS: Comp[] = [
  { id: "c01", building: "VTS Tower Headquarters",       tenant: "Goldman Sachs",           sf: 45000, floor: "Floors 28-29", askingRent: 105, effectiveRent: 96,  freeRent: 12, ti: 185, date: "Mar 2026", term: 120, dealType: "Direct",   market: "Midtown Manhattan"  },
  { id: "c02", building: "VTS Tower Headquarters",       tenant: "Sullivan & Cromwell LLP",  sf: 38000, floor: "Floor 22",     askingRent: 102, effectiveRent: 93,  freeRent: 10, ti: 175, date: "Jan 2026", term: 84,  dealType: "Direct",   market: "Midtown Manhattan"  },
  { id: "c03", building: "VTS Tower Headquarters",       tenant: "Fidelity Investments",     sf: 22000, floor: "Floor 17",     askingRent:  98, effectiveRent: 88,  freeRent:  8, ti: 160, date: "Nov 2025", term: 60,  dealType: "Direct",   market: "Midtown Manhattan"  },
  { id: "c04", building: "1221 Avenue of the Americas",  tenant: "Credit Suisse",            sf: 62000, floor: "Floors 11-12", askingRent: 110, effectiveRent: 100, freeRent: 14, ti: 200, date: "Apr 2026", term: 120, dealType: "Direct",   market: "Midtown Manhattan"  },
  { id: "c05", building: "1221 Avenue of the Americas",  tenant: "Davis Polk & Wardwell",    sf: 55000, floor: "Floors 30-31", askingRent: 112, effectiveRent: 102, freeRent: 15, ti: 210, date: "Feb 2026", term: 132, dealType: "Direct",   market: "Midtown Manhattan"  },
  { id: "c06", building: "1221 Avenue of the Americas",  tenant: "Marsh & McLennan",         sf: 30000, floor: "Floor 18",     askingRent: 108, effectiveRent:  97, freeRent: 12, ti: 190, date: "Dec 2025", term: 96,  dealType: "Sublease", market: "Midtown Manhattan"  },
  { id: "c07", building: "30 Hudson Yards",              tenant: "KKR & Co.",                sf: 80000, floor: "Floors 50-52", askingRent: 130, effectiveRent: 118, freeRent: 18, ti: 250, date: "May 2026", term: 144, dealType: "Direct",   market: "Hudson Yards"       },
  { id: "c08", building: "30 Hudson Yards",              tenant: "Warner Media",             sf: 48000, floor: "Floors 40-41", askingRent: 125, effectiveRent: 113, freeRent: 15, ti: 230, date: "Mar 2026", term: 120, dealType: "Direct",   market: "Hudson Yards"       },
  { id: "c09", building: "30 Hudson Yards",              tenant: "Pfizer Inc.",              sf: 35000, floor: "Floor 32",     askingRent: 122, effectiveRent: 109, freeRent: 14, ti: 220, date: "Jan 2026", term: 84,  dealType: "Sublease", market: "Hudson Yards"       },
  { id: "c10", building: "One Bryant Park",              tenant: "Bank of America",          sf: 95000, floor: "Floors 20-23", askingRent: 115, effectiveRent: 104, freeRent: 16, ti: 205, date: "Feb 2026", term: 120, dealType: "Direct",   market: "Midtown Manhattan"  },
  { id: "c11", building: "One Bryant Park",              tenant: "Skadden Arps",             sf: 42000, floor: "Floor 35",     askingRent: 118, effectiveRent: 107, freeRent: 14, ti: 215, date: "Oct 2025", term: 120, dealType: "Direct",   market: "Midtown Manhattan"  },
  { id: "c12", building: "55 Water Street",              tenant: "JPMorgan Chase",           sf: 70000, floor: "Floors 5-7",   askingRent:  88, effectiveRent:  78, freeRent: 10, ti: 145, date: "Apr 2026", term: 96,  dealType: "Direct",   market: "Downtown Manhattan" },
  { id: "c13", building: "55 Water Street",              tenant: "Deloitte LLP",             sf: 52000, floor: "Floors 8-9",   askingRent:  85, effectiveRent:  75, freeRent:  9, ti: 140, date: "Dec 2025", term: 84,  dealType: "Direct",   market: "Downtown Manhattan" },
  { id: "c14", building: "55 Water Street",              tenant: "AIG",                      sf: 28000, floor: "Floor 12",     askingRent:  82, effectiveRent:  72, freeRent:  8, ti: 130, date: "Aug 2025", term: 60,  dealType: "Sublease", market: "Downtown Manhattan" },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtSf(n: number) {
  return n.toLocaleString() + " sf"
}

function fmtRent(n: number) {
  return `$${n.toFixed(0)}/sf`
}

const DEAL_CLS: Record<Comp["dealType"], string> = {
  "Direct":   "bg-primary/10 text-primary",
  "Sublease": "bg-muted text-muted-foreground",
}

// ── Filter / sort setup ───────────────────────────────────────────────────────

const UNIQUE_MARKETS   = Array.from(new Set(COMPS.map(c => c.market)))
const UNIQUE_BUILDINGS = Array.from(new Set(COMPS.map(c => c.building)))

const FILTER_DEFS = [
  {
    key: "market",
    label: "Market",
    options: UNIQUE_MARKETS.map(v => ({ label: v, value: v })),
  },
  {
    key: "dealType",
    label: "Deal type",
    options: (["Direct", "Sublease"] as Comp["dealType"][]).map(v => ({ label: v, value: v })),
  },
  {
    key: "building",
    label: "Building",
    options: UNIQUE_BUILDINGS.map(v => ({ label: v, value: v })),
  },
]

// ── Main component ────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

export function CompsPage() {
  const { sortKey, sortDir, handleSort: _handleSort } = useSortState<SortKey>("date")
  const [search, setSearch] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({})
  const [page, setPage] = React.useState(1)

  function handleSort(key: SortKey) { _handleSort(key); setPage(1) }
  function onToggle(key: string, value: string) { setActiveFilters(prev => toggleFilterValue(prev, key, value)); setPage(1) }
  function onClear(key: string) { setActiveFilters(prev => clearFilterKey(prev, key)); setPage(1) }
  function onClearAll() { setActiveFilters({}); setPage(1) }

  const filtered = React.useMemo(() => {
    let r = [...COMPS]
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(c =>
        c.building.toLowerCase().includes(q) ||
        c.tenant.toLowerCase().includes(q) ||
        c.market.toLowerCase().includes(q)
      )
    }
    for (const [key, values] of Object.entries(activeFilters)) {
      if (!values.length) continue
      r = r.filter(c => values.includes(String(c[key as keyof Comp])))
    }
    r.sort((a, b) => {
      let av: string | number
      let bv: string | number
      if (sortKey === "sf" || sortKey === "askingRent" || sortKey === "effectiveRent" || sortKey === "freeRent" || sortKey === "ti" || sortKey === "term") {
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

  // KPIs (weighted by sf)
  const totalSf = COMPS.reduce((a, c) => a + c.sf, 0)
  const avgAsking    = COMPS.reduce((a, c) => a + c.askingRent * c.sf, 0) / totalSf
  const avgEffective = COMPS.reduce((a, c) => a + c.effectiveRent * c.sf, 0) / totalSf
  const avgFreeRent  = COMPS.reduce((a, c) => a + c.freeRent, 0) / COMPS.length
  const avgTi        = COMPS.reduce((a, c) => a + c.ti * c.sf, 0) / totalSf

  const kpis = [
    { label: "Avg asking rent",    value: `$${avgAsking.toFixed(0)}/sf` },
    { label: "Avg effective rent", value: `$${avgEffective.toFixed(0)}/sf` },
    { label: "Avg free rent",      value: `${avgFreeRent.toFixed(1)} mo` },
    { label: "Avg TI",             value: `$${avgTi.toFixed(0)}/sf` },
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
                placeholder="Search comps..."
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
                <SortableHead col="building"      sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Building</SortableHead>
                <SortableHead col="tenant"        sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Tenant</SortableHead>
                <SortableHead col="sf"            sortKey={sortKey} sortDir={sortDir} onSort={handleSort} right>Size</SortableHead>
                <SortableHead col="floor"         sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Floor</SortableHead>
                <SortableHead col="askingRent"    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} right>Asking ($/sf)</SortableHead>
                <SortableHead col="effectiveRent" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} right>Effective ($/sf)</SortableHead>
                <SortableHead col="freeRent"      sortKey={sortKey} sortDir={sortDir} onSort={handleSort} right>Free rent (mo)</SortableHead>
                <SortableHead col="ti"            sortKey={sortKey} sortDir={sortDir} onSort={handleSort} right>TI ($/sf)</SortableHead>
                <SortableHead col="date"          sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Date</SortableHead>
                <SortableHead col="term"          sortKey={sortKey} sortDir={sortDir} onSort={handleSort} right>Term (mo)</SortableHead>
                <SortableHead col="dealType"      sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Deal type</SortableHead>
                <TableHead className="pb-2 pt-0 w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} className="py-10 text-center text-sm text-muted-foreground">
                    No comps match your filters.
                  </TableCell>
                </TableRow>
              )}
              {paginated.map((c, i) => (
                <TableRow
                  key={c.id}
                  className={cn(
                    "transition-colors hover:bg-muted/40",
                    i > 0 ? "border-t border-border/40" : "border-0"
                  )}
                >
                  <TableCell className="py-2.5 text-sm font-medium text-foreground whitespace-nowrap max-w-[180px] truncate">{c.building}</TableCell>
                  <TableCell className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{c.tenant}</TableCell>
                  <TableCell className="py-2.5 text-right tabular-nums text-sm text-foreground whitespace-nowrap">{fmtSf(c.sf)}</TableCell>
                  <TableCell className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{c.floor}</TableCell>
                  <TableCell className="py-2.5 text-right tabular-nums text-sm text-foreground whitespace-nowrap">{fmtRent(c.askingRent)}</TableCell>
                  <TableCell className="py-2.5 text-right tabular-nums text-sm font-medium text-foreground whitespace-nowrap">{fmtRent(c.effectiveRent)}</TableCell>
                  <TableCell className="py-2.5 text-right tabular-nums text-sm text-foreground whitespace-nowrap">{c.freeRent}</TableCell>
                  <TableCell className="py-2.5 text-right tabular-nums text-sm text-foreground whitespace-nowrap">${c.ti}</TableCell>
                  <TableCell className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{c.date}</TableCell>
                  <TableCell className="py-2.5 text-right tabular-nums text-sm text-foreground whitespace-nowrap">{c.term}</TableCell>
                  <TableCell className="py-2.5 whitespace-nowrap">
                    <Badge className={cn("rounded-full px-2 py-0.5 text-xs font-medium border-0", DEAL_CLS[c.dealType])}>
                      {c.dealType}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2.5 pl-2">
                    <AgentBtn
                      entity="Comp"
                      label={`${c.building} · ${c.tenant} · ${fmtSf(c.sf)} · effective ${fmtRent(c.effectiveRent)} · TI $${c.ti}/sf · ${c.date} · ${c.dealType}`}
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
            {filtered.length === 0 ? "0 comps" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
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
