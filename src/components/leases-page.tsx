import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { KpiBar } from "@/components/kpi-bar"
import { FilterBar, toggleFilterValue, clearFilterKey } from "@/components/filter-chip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Settings2, ChevronLeft, ChevronRight } from "lucide-react"
import { AgentBtn } from "@/components/agent-btn"
import { TenantAvatar } from "@/components/tenant-avatar"
import {
  Table, TableHeader, TableBody, TableRow, TableCell, TableHead,
  SortableHead, useSortState,
} from "@/components/sortable-table"

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Lease {
  id: string
  tenant: string
  asset: string
  floor: string
  suite: string
  sf: number
  baseRent: number       // $/sf/yr
  annualRent: number     // total annual rent
  lcd: string            // lease commencement date e.g. "01/15/2019"
  lxd: string            // lease expiration date e.g. "12/31/2029"
  term: number           // months
  remaining: number      // months remaining
  status: "Active" | "Expiring soon" | "Expired" | "Pending"
  type: "Direct" | "Sublease"
  options: string[]
}

type SortKey =
  | "tenant" | "asset" | "suite" | "sf" | "baseRent" | "annualRent"
  | "lcd" | "lxd" | "term" | "remaining" | "status" | "type"

// ── Mock data ─────────────────────────────────────────────────────────────────

export const LEASES: Lease[] = [
  // ── VTS Tower Headquarters — matches stacking plan exactly ──────────────────
  { id: "l01", tenant: "Blackstone Inc.",           asset: "VTS Tower Headquarters", floor: "Floor 14", suite: "1400", sf: 10000, baseRent: 102.50, annualRent: 1025000, lcd: "07/01/2020", lxd: "06/30/2030", term: 120, remaining: 46, status: "Active",        type: "Direct",   options: ["Renewal Option", "ROFO"] },
  { id: "l02", tenant: "Blackstone Inc.",           asset: "VTS Tower Headquarters", floor: "Floor 13", suite: "1300", sf: 18000, baseRent: 102.50, annualRent: 1845000, lcd: "07/01/2020", lxd: "06/30/2030", term: 120, remaining: 46, status: "Active",        type: "Direct",   options: ["Renewal Option", "Expansion Option", "ROFO"] },
  { id: "l03", tenant: "Vantage Point Capital LP",  asset: "VTS Tower Headquarters", floor: "Floor 12", suite: "1200", sf: 18000, baseRent: 98.35,  annualRent: 1770300, lcd: "01/01/2023", lxd: "12/31/2029", term: 84,  remaining: 40, status: "Active",        type: "Direct",   options: ["Renewal Option"] },
  { id: "l04", tenant: "Amazon.com Inc.",           asset: "VTS Tower Headquarters", floor: "Floor 11", suite: "1100", sf: 18000, baseRent: 89.12,  annualRent: 1604160, lcd: "10/01/2022", lxd: "09/30/2029", term: 84,  remaining: 37, status: "Active",        type: "Direct",   options: ["Renewal Option", "Expansion Option"] },
  { id: "l05", tenant: "Amazon.com Inc.",           asset: "VTS Tower Headquarters", floor: "Floor 10", suite: "1000", sf: 18000, baseRent: 89.12,  annualRent: 1604160, lcd: "10/01/2020", lxd: "09/30/2030", term: 120, remaining: 49, status: "Active",        type: "Direct",   options: [] },
  { id: "l06", tenant: "Sullivan & Cromwell LLP",   asset: "VTS Tower Headquarters", floor: "Floor 8",  suite: "0800", sf: 20000, baseRent: 93.14,  annualRent: 1862800, lcd: "05/01/2019", lxd: "04/30/2029", term: 120, remaining: 32, status: "Active",        type: "Direct",   options: ["Renewal Option", "Termination Option"] },
  { id: "l07", tenant: "Sullivan & Cromwell LLP",   asset: "VTS Tower Headquarters", floor: "Floor 7",  suite: "0700", sf: 20000, baseRent: 93.14,  annualRent: 1862800, lcd: "05/01/2019", lxd: "04/30/2029", term: 120, remaining: 32, status: "Active",        type: "Direct",   options: ["Renewal Option", "ROFR"] },
  { id: "l08", tenant: "Pacific Wealth Management LLC", asset: "VTS Tower Headquarters", floor: "Floor 5", suite: "0500", sf: 20000, baseRent: 89.60, annualRent: 1792000, lcd: "12/01/2021", lxd: "11/30/2028", term: 84, remaining: 27, status: "Active",       type: "Direct",   options: ["Renewal Option", "ROFO"] },
  { id: "l09", tenant: "Arthur & Brennan LLP",      asset: "VTS Tower Headquarters", floor: "Floor 4",  suite: "0400", sf: 20000, baseRent: 87.00,  annualRent: 1740000, lcd: "01/01/2020", lxd: "12/31/2029", term: 120, remaining: 40, status: "Active",        type: "Direct",   options: ["Renewal Option", "ROFO"] },
  { id: "l10", tenant: "Meridian Health Partners Inc.", asset: "VTS Tower Headquarters", floor: "Floor 3", suite: "0300", sf: 12000, baseRent: 85.50, annualRent: 1026000, lcd: "04/01/2018", lxd: "03/31/2028", term: 120, remaining: 19, status: "Active",      type: "Direct",   options: ["Renewal Option", "Expansion Option"] },
  { id: "l11", tenant: "The Carlyle Group Inc.",    asset: "VTS Tower Headquarters", floor: "Floor 2",  suite: "0200", sf: 20000, baseRent: 91.00,  annualRent: 1820000, lcd: "07/01/2018", lxd: "06/30/2028", term: 120, remaining: 22, status: "Active",        type: "Sublease", options: ["Renewal Option", "Termination Option", "ROFR"] },
  { id: "l12", tenant: "CVS Health Corporation",    asset: "VTS Tower Headquarters", floor: "Floor 1",  suite: "0100", sf: 5000,  baseRent: 72.00,  annualRent: 360000,  lcd: "01/01/2018", lxd: "12/31/2027", term: 120, remaining: 16, status: "Expiring soon", type: "Direct",   options: ["Renewal Option"] },
  // ── Critical dates tenants ──────────────────────────────────────────────────
  { id: "l13", tenant: "Pfizer",                    asset: "VTS Tower Headquarters", floor: "Floor 12", suite: "1200", sf: 117000, baseRent: 78.00, annualRent: 9126000, lcd: "09/15/2016", lxd: "09/15/2026", term: 120, remaining: 1,  status: "Expiring soon", type: "Direct",   options: ["Renewal Option"] },
  { id: "l14", tenant: "Morgan Stanley",            asset: "VTS Tower Headquarters", floor: "Floors 8-11", suite: "0800-1100", sf: 116000, baseRent: 95.00, annualRent: 11020000, lcd: "11/01/2016", lxd: "11/01/2026", term: 120, remaining: 2, status: "Expiring soon", type: "Direct", options: ["Renewal Option"] },
  { id: "l15", tenant: "Deloitte LLP",              asset: "VTS Tower Headquarters", floor: "Floor 5",  suite: "0500", sf: 43000, baseRent: 88.00,  annualRent: 3784000, lcd: "12/01/2026", lxd: "11/30/2036", term: 120, remaining: 123, status: "Pending",       type: "Direct",   options: [] },
  { id: "l16", tenant: "KPMG",                      asset: "VTS Tower Headquarters", floor: "Floor 34", suite: "3400", sf: 117000, baseRent: 92.00, annualRent: 10764000, lcd: "01/31/2017", lxd: "01/31/2027", term: 120, remaining: 5, status: "Active",        type: "Direct",   options: ["Renewal Option"] },
  { id: "l17", tenant: "Ernst & Young",             asset: "VTS Tower Headquarters", floor: "Floor 22", suite: "2200", sf: 80100,  baseRent: 94.00, annualRent: 7529400, lcd: "03/01/2017", lxd: "03/01/2027", term: 120, remaining: 7, status: "Active",        type: "Direct",   options: ["Contraction Option"] },
  { id: "l18", tenant: "HSBC Holdings",             asset: "VTS Tower Headquarters", floor: "Floor 9",  suite: "0900", sf: 69300,  baseRent: 85.00, annualRent: 5890500, lcd: "04/15/2017", lxd: "04/15/2030", term: 156, remaining: 44, status: "Active",       type: "Direct",   options: ["ROFO"] },
  { id: "l19", tenant: "Latham & Watkins",          asset: "VTS Tower Headquarters", floor: "Floors 14-15", suite: "1400-1500", sf: 119000, baseRent: 98.00, annualRent: 11662000, lcd: "05/01/2017", lxd: "05/01/2027", term: 120, remaining: 8, status: "Active", type: "Direct", options: ["Renewal Option"] },
  { id: "l20", tenant: "JPMorgan Chase",            asset: "VTS Tower Headquarters", floor: "Floor 6",  suite: "0600", sf: 55800,  baseRent: 82.00, annualRent: 4575600, lcd: "06/30/2017", lxd: "06/30/2030", term: 156, remaining: 46, status: "Active",       type: "Direct",   options: ["Expansion Option"] },
  { id: "l21", tenant: "Skadden Arps",              asset: "VTS Tower Headquarters", floor: "Floor 18", suite: "1800", sf: 91200,  baseRent: 96.00, annualRent: 8755200, lcd: "10/01/2021", lxd: "09/30/2031", term: 120, remaining: 61, status: "Active",       type: "Direct",   options: [] },
  { id: "l22", tenant: "Citigroup",                 asset: "VTS Tower Headquarters", floor: "Floors 20-22", suite: "2000-2200", sf: 134000, baseRent: 91.00, annualRent: 12194000, lcd: "03/31/2018", lxd: "03/31/2028", term: 120, remaining: 19, status: "Active", type: "Direct", options: ["Renewal Option"] },
  { id: "l23", tenant: "McKinsey & Co.",            asset: "VTS Tower Headquarters", floor: "Floor 29", suite: "2900", sf: 48600,  baseRent: 99.00, annualRent: 4811400, lcd: "11/15/2021", lxd: "11/15/2031", term: 120, remaining: 63, status: "Active",       type: "Direct",   options: [] },
  { id: "l24", tenant: "Blackrock",                 asset: "VTS Tower Headquarters", floor: "Floor 30", suite: "3000", sf: 52000,  baseRent: 97.00, annualRent: 5044000, lcd: "01/01/2022", lxd: "12/31/2031", term: 120, remaining: 65, status: "Active",       type: "Direct",   options: ["Renewal Option"] },
  { id: "l25", tenant: "Verizon Media",             asset: "VTS Tower Headquarters", floor: "Floor 25", suite: "2500", sf: 44000,  baseRent: 88.00, annualRent: 3872000, lcd: "06/01/2019", lxd: "05/31/2027", term: 96, remaining: 9, status: "Active",         type: "Direct",   options: [] },
  // ── Other assets ────────────────────────────────────────────────────────────
  { id: "l26", tenant: "Goldman Sachs",             asset: "One Financial Plaza",    floor: "Floor 11", suite: "1100", sf: 28000,  baseRent: 90.00, annualRent: 2520000, lcd: "03/01/2021", lxd: "02/28/2031", term: 120, remaining: 54, status: "Active",       type: "Direct",   options: ["ROFO"] },
  { id: "l27", tenant: "Uber Technologies",         asset: "Salesforce Tower",       floor: "Floor 18", suite: "1800A", sf: 28000, baseRent: 98.00, annualRent: 2744000, lcd: "09/01/2022", lxd: "08/31/2027", term: 60,  remaining: 12, status: "Expiring soon", type: "Direct",  options: [] },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtSf(n: number) {
  return n.toLocaleString() + " sf"
}

function fmtRent(n: number) {
  return `$${n.toFixed(2)}/sf`
}

function fmtAnnual(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  return `$${(n / 1000).toFixed(0)}K`
}

const STATUS_CLS: Record<Lease["status"], string> = {
  "Active":        "bg-success/15 text-success",
  "Expiring soon": "bg-warning/15 text-warning",
  "Expired":       "bg-muted text-muted-foreground",
  "Pending":       "bg-primary/15 text-primary",
}

function RemainingCell({ remaining }: { remaining: number }) {
  if (remaining <= 0) {
    return <span className="text-sm font-medium text-destructive">Expired</span>
  }
  const cls = remaining < 6
    ? "text-destructive"
    : remaining < 18
    ? "text-warning"
    : "text-foreground"
  return <span className={cn("text-sm font-medium tabular-nums", cls)}>{remaining}mo</span>
}

// ── Filter / sort setup ───────────────────────────────────────────────────────

const UNIQUE_ASSETS = Array.from(new Set(LEASES.map(l => l.asset)))

const FILTER_DEFS = [
  {
    key: "status",
    label: "Status",
    options: (["Active", "Expiring soon", "Expired", "Pending"] as Lease["status"][]).map(v => ({ label: v, value: v })),
  },
  {
    key: "type",
    label: "Type",
    options: (["Direct", "Sublease"] as Lease["type"][]).map(v => ({ label: v, value: v })),
  },
  {
    key: "asset",
    label: "Asset",
    options: UNIQUE_ASSETS.map(v => ({ label: v, value: v })),
  },
]

// ── Main component ────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

export function LeasesPage({ onLeaseClick }: { onLeaseClick?: (l: Lease) => void }) {
  const { sortKey, sortDir, handleSort: _handleSort } = useSortState<SortKey>("tenant")
  const [search, setSearch] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({})
  const [page, setPage] = React.useState(1)

  function handleSort(key: SortKey) { _handleSort(key); setPage(1) }
  function onToggle(key: string, value: string) { setActiveFilters(prev => toggleFilterValue(prev, key, value)); setPage(1) }
  function onClear(key: string) { setActiveFilters(prev => clearFilterKey(prev, key)); setPage(1) }
  function onClearAll() { setActiveFilters({}); setPage(1) }

  const filtered = React.useMemo(() => {
    let r = [...LEASES]
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(l =>
        l.tenant.toLowerCase().includes(q) ||
        l.asset.toLowerCase().includes(q) ||
        l.suite.toLowerCase().includes(q)
      )
    }
    for (const [key, values] of Object.entries(activeFilters)) {
      if (!values.length) continue
      r = r.filter(l => values.includes(String(l[key as keyof Lease])))
    }

    r.sort((a, b) => {
      let av: string | number
      let bv: string | number
      if (sortKey === "sf" || sortKey === "baseRent" || sortKey === "annualRent" || sortKey === "remaining" || sortKey === "term") {
        av = a[sortKey]; bv = b[sortKey]
      } else {
        av = (a[sortKey] as string).toLowerCase()
        bv = (b[sortKey] as string).toLowerCase()
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === "asc" ? cmp : -cmp
    })
    return r
  }, [search, activeFilters, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // KPIs computed from full dataset
  const totalLeases = LEASES.length
  const leasedSf = LEASES.filter(l => l.status !== "Expired").reduce((a, l) => a + l.sf, 0)
  const activeLeases = LEASES.filter(l => l.status === "Active" || l.status === "Expiring soon")
  const weightedRentNum = activeLeases.reduce((a, l) => a + l.baseRent * l.sf, 0)
  const weightedRentDen = activeLeases.reduce((a, l) => a + l.sf, 0)
  const avgBaseRent = weightedRentDen > 0 ? weightedRentNum / weightedRentDen : 0
  const expiring12mo = LEASES.filter(l => l.remaining > 0 && l.remaining <= 12).length

  const kpis = [
    { label: "Total leases",    value: String(totalLeases) },
    { label: "Leased SF",       value: fmtSf(leasedSf) },
    { label: "Avg base rent",   value: `$${avgBaseRent.toFixed(2)}/sf` },
    { label: "Expiring (12mo)", value: String(expiring12mo), trend: expiring12mo > 0 ? "down" as const : undefined },
  ]

  return (
    <div className="space-y-4">
      <KpiBar kpis={kpis} />

      {/* Toolbar */}
      <div className={cardBase}>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search leases…"
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
                <SortableHead col="tenant"     sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Tenant</SortableHead>
                <SortableHead col="asset"      sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Asset</SortableHead>
                <SortableHead col="suite"      sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Suite</SortableHead>
                <SortableHead col="sf"         sortKey={sortKey} sortDir={sortDir} onSort={handleSort} right>SF</SortableHead>
                <SortableHead col="baseRent"   sortKey={sortKey} sortDir={sortDir} onSort={handleSort} right>Base rent</SortableHead>
                <SortableHead col="annualRent" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} right>Annual rent</SortableHead>
                <SortableHead col="lcd"        sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>LCD</SortableHead>
                <SortableHead col="lxd"        sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>LXD</SortableHead>
                <SortableHead col="remaining"  sortKey={sortKey} sortDir={sortDir} onSort={handleSort} right>Remaining</SortableHead>
                <SortableHead col="status"     sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Status</SortableHead>
                <SortableHead col="type"       sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Type</SortableHead>
                <TableHead className="pb-2 pt-0 w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={12} className="py-10 text-center text-sm text-muted-foreground">
                    No leases match your filters.
                  </TableCell>
                </TableRow>
              )}
              {paginated.map((l, i) => (
                <TableRow
                  key={l.id}
                  className={cn(
                    "transition-colors",
                    onLeaseClick ? "cursor-pointer hover:bg-muted/60" : "hover:bg-muted/40",
                    i > 0 ? "border-t border-border/40" : "border-0",
                    l.status === "Expired" && "opacity-60"
                  )}
                  onClick={() => onLeaseClick?.(l)}
                >
                  <TableCell className="py-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <TenantAvatar name={l.tenant} />
                      <span className="text-sm font-medium text-foreground">{l.tenant}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{l.asset}</TableCell>
                  <TableCell className="py-2.5 text-sm text-foreground whitespace-nowrap">{l.suite}</TableCell>
                  <TableCell className="py-2.5 text-right tabular-nums text-sm font-medium text-foreground whitespace-nowrap">
                    {l.sf.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-2.5 text-right tabular-nums text-sm font-medium text-foreground whitespace-nowrap">
                    {fmtRent(l.baseRent)}
                  </TableCell>
                  <TableCell className="py-2.5 text-right tabular-nums text-sm text-foreground whitespace-nowrap">
                    {fmtAnnual(l.annualRent)}
                  </TableCell>
                  <TableCell className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{l.lcd}</TableCell>
                  <TableCell className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{l.lxd}</TableCell>
                  <TableCell className="py-2.5 text-right whitespace-nowrap">
                    <RemainingCell remaining={l.remaining} />
                  </TableCell>
                  <TableCell className="py-2.5 whitespace-nowrap">
                    <Badge className={cn("rounded-full px-2 py-0.5 text-xs font-medium border-0", STATUS_CLS[l.status])}>
                      {l.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2.5 whitespace-nowrap">
                    <span className="text-sm text-muted-foreground">{l.type}</span>
                  </TableCell>
                  <TableCell className="py-2.5 pl-2">
                    <AgentBtn
                      entity="Lease"
                      label={`${l.tenant} · ${l.suite} · ${l.sf.toLocaleString()} sf · ${fmtRent(l.baseRent)} · expires ${l.lxd} · ${l.status}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
          <span className="text-xs text-muted-foreground">
            {filtered.length === 0 ? "0 leases" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
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
