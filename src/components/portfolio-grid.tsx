import * as React from "react"
import { cn } from "@/lib/utils"
import { LayoutGrid, Table2, ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AgentBtn } from "@/components/agent-btn"
import {
  Table, TableHeader, TableBody, TableRow, TableCell,
  SortableHead, useSortState,
} from "@/components/sortable-table"
import { FilterBar, toggleFilterValue, clearFilterKey } from "@/components/filter-chip"
import type { FilterDef } from "@/components/filter-chip"
import { ASSET_KPIS, ASSET_DETAILS } from "@/App"
import { getDealHealth } from "@/components/deal-profile"
import type { Deal } from "@/components/deals-page"

type SortKey = "name" | "occupancy" | "avgNer" | "nerBudgetDelta" | "expiring12mo" | "needAttention" | "atRisk" | "caution" | "activeDeals"

const TABLE_FILTERS: FilterDef[] = [
  {
    key: "occupancy",
    label: "Occupancy",
    options: [
      { label: "90%+", value: "high" },
      { label: "75–90%", value: "mid" },
      { label: "Below 75%", value: "low" },
    ],
  },
  {
    key: "health",
    label: "Health",
    options: [
      { label: "At risk", value: "atRisk" },
      { label: "Critical", value: "caution" },
    ],
  },
  {
    key: "expiring",
    label: "Expiring",
    options: [
      { label: "Has expiries < 12 mo", value: "yes" },
      { label: "None expiring", value: "no" },
    ],
  },
  {
    key: "nerVsBudget",
    label: "NER vs budget",
    options: [
      { label: "Above budget", value: "above" },
      { label: "Below budget", value: "below" },
    ],
  },
]

interface Asset {
  id: string
  name: string
  address?: string
}

interface PortfolioGridProps {
  assets: Asset[]
  deals: Deal[]
  onAssetClick: (assetId: string) => void
}

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "name",           label: "Name" },
  { key: "occupancy",      label: "Occupancy" },
  { key: "avgNer",         label: "Avg NER" },
  { key: "nerBudgetDelta", label: "NER vs budget" },
  { key: "expiring12mo",   label: "Expiring < 12 mo" },
  { key: "needAttention",  label: "Need attention" },
  { key: "activeDeals",    label: "Active deals" },
]

function parseNer(s: string) { return parseFloat(s.replace(/[^0-9.]/g, "")) || 0 }
function parseDelta(s: string) {
  const n = parseFloat(s.replace(/[^0-9.]/g, "")) || 0
  return s.trimStart().startsWith("-") ? -n : n
}

export function PortfolioGrid({ assets, deals, onAssetClick }: PortfolioGridProps) {
  const [view, setView] = React.useState<"cards" | "table">("cards")
  const { sortKey, sortDir, handleSort } = useSortState<SortKey>("name")
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({})

  function onToggle(key: string, value: string) { setActiveFilters(prev => toggleFilterValue(prev, key, value)) }
  function onClear(key: string) { setActiveFilters(prev => clearFilterKey(prev, key)) }
  function onClearAll() { setActiveFilters({}) }

  const enriched = React.useMemo(() => assets.map(asset => {
    const kpi = ASSET_KPIS[asset.id]
    const detail = ASSET_DETAILS[asset.id]
    const assetDeals = deals.filter(d => d.asset === asset.name)
    const atRisk = assetDeals.filter(d => getDealHealth(d.id, d.stage as any).score === "at-risk")
    const caution = assetDeals.filter(d => getDealHealth(d.id, d.stage as any).score === "caution")
    return { asset, kpi, detail, atRisk, caution, needAttention: atRisk.length + caution.length }
  }), [assets, deals])

  const sorted = React.useMemo(() => [...enriched].sort((a, b) => {
    const ak = a.kpi, bk = b.kpi
    if (!ak || !bk) return 0
    let av: number | string, bv: number | string
    switch (sortKey) {
      case "name":           av = a.asset.name;              bv = b.asset.name; break
      case "occupancy":      av = ak.occupancy;               bv = bk.occupancy; break
      case "avgNer":         av = parseNer(ak.avgNer);        bv = parseNer(bk.avgNer); break
      case "nerBudgetDelta": av = parseDelta(ak.nerBudgetDelta); bv = parseDelta(bk.nerBudgetDelta); break
      case "expiring12mo":   av = ak.expiring12mo;            bv = bk.expiring12mo; break
      case "needAttention":  av = a.needAttention;            bv = b.needAttention; break
      case "atRisk":         av = a.atRisk.length;            bv = b.atRisk.length; break
      case "caution":        av = a.caution.length;           bv = b.caution.length; break
      case "activeDeals":    av = ak.activeDeals;             bv = bk.activeDeals; break
      default:               av = a.asset.name;               bv = b.asset.name
    }
    const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number)
    return sortDir === "asc" ? cmp : -cmp
  }), [enriched, sortKey, sortDir])

  const filtered = React.useMemo(() => sorted.filter(({ kpi, atRisk, caution }) => {
    if (!kpi) return true
    const occ = activeFilters.occupancy ?? []
    if (occ.length > 0) {
      const bucket = kpi.occupancy >= 90 ? "high" : kpi.occupancy >= 75 ? "mid" : "low"
      if (!occ.includes(bucket)) return false
    }
    const health = activeFilters.health ?? []
    if (health.length > 0) {
      const hasAtRisk = atRisk.length > 0
      const hasCaution = caution.length > 0
      if (!health.some(h => (h === "atRisk" && hasAtRisk) || (h === "caution" && hasCaution))) return false
    }
    const exp = activeFilters.expiring ?? []
    if (exp.length > 0) {
      const hasExp = kpi.expiring12mo > 0
      if (!exp.some(e => (e === "yes" && hasExp) || (e === "no" && !hasExp))) return false
    }
    const ner = activeFilters.nerVsBudget ?? []
    if (ner.length > 0) {
      if (!ner.some(n => (n === "above" && kpi.nerBudgetUp) || (n === "below" && !kpi.nerBudgetUp))) return false
    }
    return true
  }), [sorted, activeFilters])

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {view === "cards" && (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="h-8 gap-1.5 font-normal whitespace-nowrap text-primary border-primary/30 hover:bg-primary/5" />}>
              Sort: {SORT_OPTIONS.find(o => o.key === sortKey)?.label ?? "Name"}
              <ChevronDownIcon data-icon="inline-end" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {SORT_OPTIONS.map(opt => (
                <DropdownMenuItem
                  key={opt.key}
                  onClick={() => handleSort(opt.key)}
                  className={cn(sortKey === opt.key && "font-medium text-primary")}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {view === "table" && (
          <FilterBar filters={TABLE_FILTERS} active={activeFilters} onToggle={onToggle} onClear={onClear} onClearAll={onClearAll} chipClassName="h-8 text-primary border-primary/30 hover:bg-primary/5" />
        )}
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => setView("cards")}
            className={cn("h-8 w-8 text-primary border-primary/30 hover:bg-primary/5", view === "cards" && "bg-primary/10")}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setView("table")}
            className={cn("h-8 w-8 text-primary border-primary/30 hover:bg-primary/5", view === "table" && "bg-primary/10")}>
            <Table2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Card view */}
      {view === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(({ asset, kpi, detail, atRisk, caution, needAttention }) => {
            if (!kpi) return null
            return (
              <div
                key={asset.id}
                className="group cursor-pointer rounded-2xl overflow-hidden bg-white/70 dark:bg-white/8 backdrop-blur-md border border-border/70 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                onClick={() => onAssetClick(asset.id)}
              >
                <div className="relative h-44 overflow-hidden">
                  <img src={detail?.image} alt={asset.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {kpi.alert && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-destructive rounded-full px-2.5 py-1">
                        ⚠ {kpi.alert}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
                    <p className="text-[10px] font-medium uppercase tracking-widest text-white/60 mb-0.5">{detail?.city}</p>
                    <h3 className="font-semibold text-white text-base leading-tight">{asset.name}</h3>
                    <p className="text-xs text-white/60 truncate">{asset.address}</p>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", kpi.occupancy >= 90 ? "bg-success" : kpi.occupancy >= 75 ? "bg-primary" : "bg-warning")}
                        style={{ width: `${kpi.occupancy}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-foreground tabular-nums shrink-0">{kpi.occupancy}% occupied</span>
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-border/60">
                    <div className="pr-3">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Avg NER</p>
                      <p className="text-sm font-semibold text-foreground">{kpi.avgNer}</p>
                      <p className={cn("text-xs font-medium", kpi.nerBudgetUp ? "text-success" : "text-destructive")}>{kpi.nerBudgetDelta} vs budget</p>
                    </div>
                    <div className="px-3">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Expiring</p>
                      <p className="text-sm font-semibold text-foreground">{kpi.expiring12mo} lease{kpi.expiring12mo !== 1 ? "s" : ""}</p>
                      <p className={cn("text-xs font-medium", kpi.expiring12mo > 3 ? "text-destructive" : kpi.expiring12mo > 0 ? "text-warning" : "text-muted-foreground")}>
                        {kpi.expiring12mo === 0 ? "None" : kpi.expiring12mo > 3 ? "Action needed" : "12-month"}
                      </p>
                    </div>
                    <div className="pl-3">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Need attention</p>
                      <p className="text-sm font-semibold text-foreground">{needAttention} deal{needAttention !== 1 ? "s" : ""}</p>
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        {atRisk.length > 0 && (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border border-destructive/20 text-destructive bg-destructive/10">{atRisk.length} At risk</span>
                        )}
                        {caution.length > 0 && (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border border-warning/20 text-warning bg-warning/10">{caution.length} Critical</span>
                        )}
                        {needAttention === 0 && <span className="text-[10px] text-muted-foreground">None</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Table view */}
      {view === "table" && (
        <div className="rounded-2xl bg-card/70 backdrop-blur-md border border-border/70 p-5">
          <div className="overflow-x-auto">
          <Table className="border-collapse">
            <TableHeader>
              <TableRow className="border-b-2 border-border/60 hover:bg-transparent">
                <SortableHead col="name"           sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Asset</SortableHead>
                <SortableHead col="occupancy"      sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pl-4">Occupancy</SortableHead>
                <SortableHead col="avgNer"         sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pl-4" right>Avg NER</SortableHead>
                <SortableHead col="nerBudgetDelta" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pl-4" right>vs budget</SortableHead>
                <SortableHead col="expiring12mo"   sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pl-4" right>Expiring &lt; 12 mo</SortableHead>
                <SortableHead col="atRisk"         sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pl-4" right>At risk</SortableHead>
                <SortableHead col="caution"        sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pl-4" right>Critical</SortableHead>
                <SortableHead col="activeDeals"    sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pl-4" right>Active deals</SortableHead>
                <th className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(({ asset, kpi, detail, atRisk, caution }, i) => {
                if (!kpi) return null
                return (
                  <TableRow
                    key={asset.id}
                    className={cn("cursor-pointer hover:bg-muted/40 transition-colors", i > 0 ? "border-t border-border/40" : "border-0")}
                    onClick={() => onAssetClick(asset.id)}
                  >
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="shrink-0 w-8 h-8 rounded-md overflow-hidden border border-border/40">
                          <img src={detail?.image} alt={asset.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-medium text-foreground">{asset.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 pl-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1 rounded-full bg-border overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", kpi.occupancy >= 90 ? "bg-success" : kpi.occupancy >= 75 ? "bg-primary" : "bg-warning")}
                            style={{ width: `${kpi.occupancy}%` }}
                          />
                        </div>
                        <span className="text-sm tabular-nums text-foreground">{kpi.occupancy}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 pl-4 text-right tabular-nums font-medium text-foreground">{kpi.avgNer}</TableCell>
                    <TableCell className={cn("py-3 pl-4 text-right tabular-nums font-medium", kpi.nerBudgetUp ? "text-success" : "text-destructive")}>
                      {kpi.nerBudgetDelta}
                    </TableCell>
                    <TableCell className={cn("py-3 pl-4 text-right tabular-nums", kpi.expiring12mo > 3 ? "text-destructive font-medium" : kpi.expiring12mo > 0 ? "text-warning" : "text-muted-foreground")}>
                      {kpi.expiring12mo === 0 ? "—" : kpi.expiring12mo}
                    </TableCell>
                    <TableCell className="py-3 pl-4 text-right">
                      {atRisk.length > 0
                        ? <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border border-destructive/20 text-destructive bg-destructive/10">{atRisk.length} At risk</span>
                        : <span className="text-muted-foreground text-sm">—</span>}
                    </TableCell>
                    <TableCell className="py-3 pl-4 text-right">
                      {caution.length > 0
                        ? <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border border-warning/20 text-warning bg-warning/10">{caution.length} Critical</span>
                        : <span className="text-muted-foreground text-sm">—</span>}
                    </TableCell>
                    <TableCell className="py-3 pl-4 text-right tabular-nums text-foreground">{kpi.activeDeals}</TableCell>
                    <TableCell className="py-3 pl-2 w-10" onClick={e => e.stopPropagation()}>
                      <AgentBtn entity="Asset" label={asset.name} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          </div>
        </div>
      )}
    </div>
  )
}
