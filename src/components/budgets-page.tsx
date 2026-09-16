import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { KpiBar } from "@/components/kpi-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FilterBar, toggleFilterValue, clearFilterKey } from "@/components/filter-chip"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search, ChevronLeft, ChevronRight, ChevronDown, Check,
  MoreHorizontal, Plus, Settings2, GripVertical, Eye, EyeOff, X,
} from "lucide-react"
import { AgentBtn } from "@/components/agent-btn"
import {
  Table, TableHeader, TableBody, TableRow, TableCell,
  SortableHead, useSortState,
} from "@/components/sortable-table"

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Budget {
  id: string
  label: string
  asset: string
  budgetYear: number | null
  floor: string
  space: string
  size: number
  startDate: string
  term: number
  baseRent: number
  baseRentStep?: { month: number; rent: number }
  esca: string | null
  ti: number
  freeRent: number
  nerSizeYr: number
  dateEntered: string
  archived: boolean
}

type SortKey = keyof Pick<Budget, "label" | "asset" | "budgetYear" | "floor" | "space" | "size" | "startDate" | "term" | "baseRent" | "esca" | "ti" | "freeRent" | "nerSizeYr" | "dateEntered">
type ViewFilter = "active" | "archived" | "all"

interface ColDef {
  id: string
  label: string
  sortable: boolean
  right?: boolean
  defaultVisible: boolean
}

// ── Column definitions ────────────────────────────────────────────────────────

const ALL_COLUMNS: ColDef[] = [
  { id: "status",      label: "Status",         sortable: false, defaultVisible: true  },
  { id: "label",       label: "Label",          sortable: true,  defaultVisible: true  },
  { id: "asset",       label: "Asset",          sortable: true,  defaultVisible: true  },
  { id: "budgetYear",  label: "Budget year",    sortable: true,  defaultVisible: true  },
  { id: "floor",       label: "Floor",          sortable: true,  defaultVisible: true  },
  { id: "space",       label: "Space",          sortable: true,  defaultVisible: true  },
  { id: "size",        label: "Size",           sortable: true,  right: true, defaultVisible: true  },
  { id: "startDate",   label: "Start date",     sortable: true,  defaultVisible: true  },
  { id: "term",        label: "Term (Mo.)",     sortable: true,  right: true, defaultVisible: true  },
  { id: "baseRent",    label: "Base rent",      sortable: true,  right: true, defaultVisible: true  },
  { id: "esca",        label: "ESCA",           sortable: true,  defaultVisible: false },
  { id: "ti",          label: "TI",             sortable: true,  right: true, defaultVisible: true  },
  { id: "freeRent",    label: "Free rent (Mo.)",sortable: true,  right: true, defaultVisible: false },
  { id: "nerSizeYr",   label: "NER/size/yr",    sortable: true,  right: true, defaultVisible: true  },
  { id: "dateEntered", label: "Date entered",   sortable: true,  defaultVisible: true  },
  { id: "actions",     label: "",               sortable: false, defaultVisible: true  },
]

// ── Mock data ─────────────────────────────────────────────────────────────────

export const BUDGETS: Budget[] = [
  // VTS Tower HQ — 2026 budget
  { id: "b01", label: "2026 Budget",        asset: "VTS Tower HQ",         budgetYear: 2026, floor: "Floor 14", space: "1400", size: 12500, startDate: "01/01/26", term: 84,  baseRent: 92.00, baseRentStep: { month: 37, rent: 105.00 }, esca: "3% fixed", ti: 85.00, freeRent: 6,  nerSizeYr: 88.40, dateEntered: "11/15/25", archived: false },
  { id: "b02", label: "2026 Budget",        asset: "VTS Tower HQ",         budgetYear: 2026, floor: "Floor 15", space: "1500", size: 8200,  startDate: "01/01/26", term: 84,  baseRent: 94.00, baseRentStep: { month: 37, rent: 108.00 }, esca: "3% fixed", ti: 85.00, freeRent: 6,  nerSizeYr: 90.10, dateEntered: "11/15/25", archived: false },
  { id: "b03", label: "High-rent scenario", asset: "VTS Tower HQ",         budgetYear: 2026, floor: "Floor 14", space: "1400", size: 12500, startDate: "01/01/26", term: 84,  baseRent: 100.00, baseRentStep: { month: 37, rent: 115.00 }, esca: "3.5% fixed", ti: 90.00, freeRent: 4, nerSizeYr: 96.20, dateEntered: "12/02/25", archived: false },
  { id: "b04", label: "Concession scenario",asset: "VTS Tower HQ",         budgetYear: 2026, floor: "Floor 14", space: "1400", size: 12500, startDate: "04/01/26", term: 120, baseRent: 88.00, baseRentStep: { month: 61, rent: 102.00 }, esca: "CPI capped 3%", ti: 100.00, freeRent: 12, nerSizeYr: 82.50, dateEntered: "12/10/25", archived: false },

  // Salesforce Tower — multi-floor
  { id: "b05", label: "Floors 22–24",       asset: "Salesforce Tower",     budgetYear: 2026, floor: "Floor 22", space: "2200", size: 18600, startDate: "06/01/26", term: 96,  baseRent: 115.00, baseRentStep: { month: 49, rent: 132.00 }, esca: "3% fixed", ti: 95.00, freeRent: 9,  nerSizeYr: 110.30, dateEntered: "01/08/26", archived: false },
  { id: "b06", label: "Floors 22–24",       asset: "Salesforce Tower",     budgetYear: 2026, floor: "Floor 23", space: "2300", size: 18600, startDate: "06/01/26", term: 96,  baseRent: 115.00, baseRentStep: { month: 49, rent: 132.00 }, esca: "3% fixed", ti: 95.00, freeRent: 9,  nerSizeYr: 110.30, dateEntered: "01/08/26", archived: false },
  { id: "b07", label: "Floors 22–24",       asset: "Salesforce Tower",     budgetYear: 2026, floor: "Floor 24", space: "2400", size: 18600, startDate: "06/01/26", term: 96,  baseRent: 118.00, baseRentStep: { month: 49, rent: 135.00 }, esca: "3% fixed", ti: 95.00, freeRent: 9,  nerSizeYr: 113.00, dateEntered: "01/08/26", archived: false },
  { id: "b08", label: "Sublease option",    asset: "Salesforce Tower",     budgetYear: 2026, floor: "Floor 22", space: "2200", size: 9300,  startDate: "09/01/26", term: 60,  baseRent: 98.00,  esca: "Market", ti: 60.00, freeRent: 3,  nerSizeYr: 95.50, dateEntered: "02/14/26", archived: false },

  // One Financial Plaza
  { id: "b09", label: "Tower floors",       asset: "One Financial Plaza",  budgetYear: 2025, floor: "Floor 8",  space: "800",  size: 7400,  startDate: "03/01/25", term: 72,  baseRent: 78.00, baseRentStep: { month: 37, rent: 88.00 }, esca: "3% fixed", ti: 75.00, freeRent: 6,  nerSizeYr: 74.80, dateEntered: "09/20/24", archived: false },
  { id: "b10", label: "Tower floors",       asset: "One Financial Plaza",  budgetYear: 2025, floor: "Floor 9",  space: "900",  size: 7400,  startDate: "03/01/25", term: 72,  baseRent: 78.00, baseRentStep: { month: 37, rent: 88.00 }, esca: "3% fixed", ti: 75.00, freeRent: 6,  nerSizeYr: 74.80, dateEntered: "09/20/24", archived: false },
  { id: "b11", label: "Lower floors",       asset: "One Financial Plaza",  budgetYear: 2025, floor: "Floor 3",  space: "300",  size: 5200,  startDate: "03/01/25", term: 60,  baseRent: 68.00, esca: "CPI capped 3%", ti: 65.00, freeRent: 4,  nerSizeYr: 65.20, dateEntered: "09/20/24", archived: false },

  // Empire State Bldg
  { id: "b12", label: "Full floor",         asset: "Empire State Bldg",    budgetYear: 2026, floor: "Floor 31", space: "3100", size: 21000, startDate: "07/01/26", term: 120, baseRent: 82.00, baseRentStep: { month: 61, rent: 96.00 }, esca: "3.5% fixed", ti: 80.00, freeRent: 10, nerSizeYr: 78.90, dateEntered: "03/01/26", archived: false },
  { id: "b13", label: "Partial floor",      asset: "Empire State Bldg",    budgetYear: 2026, floor: "Floor 31", space: "3101", size: 10500, startDate: "07/01/26", term: 84,  baseRent: 84.00, esca: "3% fixed", ti: 80.00, freeRent: 6,  nerSizeYr: 80.50, dateEntered: "03/15/26", archived: false },

  // Willis Tower (Chicago)
  { id: "b16", label: "Base case",          asset: "Willis Tower",         budgetYear: 2026, floor: "Floor 42", space: "4200", size: 16800, startDate: "04/01/26", term: 84,  baseRent: 65.00, baseRentStep: { month: 37, rent: 75.00 }, esca: "3% fixed",    ti: 55.00, freeRent: 6,  nerSizeYr: 61.40, dateEntered: "01/10/26", archived: false },
  { id: "b17", label: "High-rent scenario", asset: "Willis Tower",         budgetYear: 2026, floor: "Floor 42", space: "4200", size: 16800, startDate: "04/01/26", term: 84,  baseRent: 73.00, baseRentStep: { month: 37, rent: 84.00 }, esca: "3.5% fixed",  ti: 60.00, freeRent: 5,  nerSizeYr: 69.50, dateEntered: "01/24/26", archived: false },
  { id: "b18", label: "Sublease option",    asset: "Willis Tower",         budgetYear: 2026, floor: "Floor 38", space: "3800", size: 8400,  startDate: "07/01/26", term: 60,  baseRent: 58.00, esca: "Market",      ti: 40.00, freeRent: 3,  nerSizeYr: 55.30, dateEntered: "02/05/26", archived: false },

  // 30 Hudson Yards (NYC Hudson Yards)
  { id: "b19", label: "Base case",          asset: "30 Hudson Yards",      budgetYear: 2026, floor: "Floor 55", space: "5500", size: 22000, startDate: "06/01/26", term: 96,  baseRent: 112.00, baseRentStep: { month: 49, rent: 128.00 }, esca: "3% fixed",   ti: 95.00, freeRent: 9,  nerSizeYr: 107.20, dateEntered: "02/18/26", archived: false },
  { id: "b20", label: "High-rent scenario", asset: "30 Hudson Yards",      budgetYear: 2026, floor: "Floor 57", space: "5700", size: 22000, startDate: "06/01/26", term: 120, baseRent: 128.00, baseRentStep: { month: 61, rent: 146.00 }, esca: "3.5% fixed", ti: 110.00, freeRent: 12, nerSizeYr: 122.40, dateEntered: "03/01/26", archived: false },
  { id: "b21", label: "Partial floor",      asset: "30 Hudson Yards",      budgetYear: 2026, floor: "Floor 55", space: "5501", size: 11000, startDate: "09/01/26", term: 84,  baseRent: 118.00, esca: "3% fixed",     ti: 100.00, freeRent: 8,  nerSizeYr: 113.50, dateEntered: "03/15/26", archived: false },

  // One World Trade Ctr (NYC Downtown)
  { id: "b22", label: "Base case",          asset: "One World Trade Ctr",  budgetYear: 2026, floor: "Floor 68", space: "6800", size: 19500, startDate: "05/01/26", term: 96,  baseRent: 82.00, baseRentStep: { month: 49, rent: 94.00 }, esca: "3% fixed",    ti: 85.00, freeRent: 8,  nerSizeYr: 78.30, dateEntered: "01/28/26", archived: false },
  { id: "b23", label: "High-rent scenario", asset: "One World Trade Ctr",  budgetYear: 2026, floor: "Floor 70", space: "7000", size: 19500, startDate: "05/01/26", term: 120, baseRent: 93.00, baseRentStep: { month: 61, rent: 108.00 }, esca: "3.5% fixed", ti: 95.00, freeRent: 10, nerSizeYr: 89.10, dateEntered: "02/12/26", archived: false },
  { id: "b24", label: "Sublease option",    asset: "One World Trade Ctr",  budgetYear: 2026, floor: "Floor 65", space: "6500", size: 9750,  startDate: "08/01/26", term: 60,  baseRent: 75.00, esca: "Market",      ti: 65.00, freeRent: 4,  nerSizeYr: 72.20, dateEntered: "03/10/26", archived: false },

  // Transamerica Pyramid (San Francisco)
  { id: "b25", label: "Base case",          asset: "Transamerica Pyramid",  budgetYear: 2026, floor: "Floor 28", space: "2800", size: 14200, startDate: "07/01/26", term: 84,  baseRent: 96.00, baseRentStep: { month: 37, rent: 110.00 }, esca: "3% fixed",    ti: 90.00, freeRent: 7,  nerSizeYr: 91.80, dateEntered: "03/05/26", archived: false },
  { id: "b26", label: "High-rent scenario", asset: "Transamerica Pyramid",  budgetYear: 2026, floor: "Floor 30", space: "3000", size: 14200, startDate: "07/01/26", term: 96,  baseRent: 108.00, baseRentStep: { month: 49, rent: 124.00 }, esca: "3.5% fixed", ti: 100.00, freeRent: 9,  nerSizeYr: 103.50, dateEntered: "03/20/26", archived: false },
  { id: "b27", label: "Short-term option",  asset: "Transamerica Pyramid",  budgetYear: 2026, floor: "Floor 26", space: "2600", size: 7100,  startDate: "10/01/26", term: 48,  baseRent: 88.00, esca: "CPI capped 3%", ti: 70.00, freeRent: 4,  nerSizeYr: 85.20, dateEntered: "04/02/26", archived: false },

  // 200 Berkeley St (Boston)
  { id: "b28", label: "Base case",          asset: "200 Berkeley St",      budgetYear: 2026, floor: "Floor 12", space: "1200", size: 10500, startDate: "04/01/26", term: 72,  baseRent: 86.00, baseRentStep: { month: 37, rent: 98.00 }, esca: "3% fixed",    ti: 78.00, freeRent: 6,  nerSizeYr: 82.40, dateEntered: "01/15/26", archived: false },
  { id: "b29", label: "High-rent scenario", asset: "200 Berkeley St",      budgetYear: 2026, floor: "Floor 14", space: "1400", size: 10500, startDate: "04/01/26", term: 84,  baseRent: 96.00, baseRentStep: { month: 37, rent: 110.00 }, esca: "3.5% fixed", ti: 88.00, freeRent: 7,  nerSizeYr: 91.90, dateEntered: "02/01/26", archived: false },

  // One Peachtree Ctr (Atlanta)
  { id: "b30", label: "Base case",          asset: "One Peachtree Ctr",    budgetYear: 2026, floor: "Floor 22", space: "2200", size: 12000, startDate: "03/01/26", term: 72,  baseRent: 50.00, baseRentStep: { month: 37, rent: 57.00 }, esca: "3% fixed",    ti: 48.00, freeRent: 5,  nerSizeYr: 47.20, dateEntered: "11/20/25", archived: false },
  { id: "b31", label: "High-rent scenario", asset: "One Peachtree Ctr",    budgetYear: 2026, floor: "Floor 24", space: "2400", size: 12000, startDate: "03/01/26", term: 84,  baseRent: 56.00, baseRentStep: { month: 37, rent: 64.00 }, esca: "3.5% fixed", ti: 55.00, freeRent: 6,  nerSizeYr: 52.80, dateEntered: "12/05/25", archived: false },
  { id: "b32", label: "Sublease option",    asset: "One Peachtree Ctr",    budgetYear: 2026, floor: "Floor 18", space: "1800", size: 6000,  startDate: "06/01/26", term: 48,  baseRent: 44.00, esca: "Market",      ti: 35.00, freeRent: 3,  nerSizeYr: 42.10, dateEntered: "12/20/25", archived: false },

  // Two Union Square (Seattle)
  { id: "b33", label: "Base case",          asset: "Two Union Square",     budgetYear: 2026, floor: "Floor 36", space: "3600", size: 14500, startDate: "05/01/26", term: 84,  baseRent: 62.00, baseRentStep: { month: 37, rent: 71.00 }, esca: "3% fixed",    ti: 58.00, freeRent: 6,  nerSizeYr: 58.80, dateEntered: "01/05/26", archived: false },
  { id: "b34", label: "High-rent scenario", asset: "Two Union Square",     budgetYear: 2026, floor: "Floor 38", space: "3800", size: 14500, startDate: "05/01/26", term: 96,  baseRent: 70.00, baseRentStep: { month: 49, rent: 80.00 }, esca: "3.5% fixed", ti: 65.00, freeRent: 7,  nerSizeYr: 66.80, dateEntered: "01/22/26", archived: false },
  { id: "b35", label: "Partial floor",      asset: "Two Union Square",     budgetYear: 2026, floor: "Floor 34", space: "3400", size: 7250,  startDate: "08/01/26", term: 60,  baseRent: 55.00, esca: "CPI capped 3%", ti: 48.00, freeRent: 4,  nerSizeYr: 52.50, dateEntered: "02/10/26", archived: false },

  // Archived
  { id: "b14", label: "2024 initial draft", asset: "VTS Tower HQ",         budgetYear: 2024, floor: "Floor 14", space: "1400", size: 12500, startDate: "01/01/24", term: 84,  baseRent: 82.00, esca: "3% fixed", ti: 75.00, freeRent: 6,  nerSizeYr: 79.10, dateEntered: "08/10/23", archived: true  },
  { id: "b15", label: "2023 base case",     asset: "One Financial Plaza",  budgetYear: 2023, floor: "Floor 8",  space: "800",  size: 7400,  startDate: "01/01/23", term: 60,  baseRent: 70.00, esca: "3% fixed", ti: 65.00, freeRent: 4,  nerSizeYr: 67.30, dateEntered: "06/05/22", archived: true  },
  { id: "b36", label: "2024 base case",     asset: "Willis Tower",         budgetYear: 2024, floor: "Floor 40", space: "4000", size: 16800, startDate: "01/01/24", term: 72,  baseRent: 58.00, esca: "3% fixed", ti: 50.00, freeRent: 5,  nerSizeYr: 54.90, dateEntered: "07/15/23", archived: true  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtRent(n: number) { return `$${n.toFixed(2)}` }
function fmtNer(n: number)  { return `$${n.toFixed(2)}` }
function fmtSize(n: number) { return n.toLocaleString() }

// ── Column manager ────────────────────────────────────────────────────────────

function ColumnManager({
  columns, visible, order, onToggle, onReorder,
}: {
  columns: ColDef[]
  visible: Set<string>
  order: string[]
  onToggle: (id: string) => void
  onReorder: (next: string[]) => void
}) {
  const [dragging, setDragging] = React.useState<string | null>(null)
  const [dragOver, setDragOver] = React.useState<string | null>(null)

  const colMap = Object.fromEntries(columns.map(c => [c.id, c]))
  const manageable = order.filter(id => colMap[id]?.label)

  function onDragStart(id: string) { setDragging(id) }
  function onDragEnd() { setDragging(null); setDragOver(null) }
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

  return (
    <Popover>
      <PopoverTrigger className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-primary text-primary text-xs font-medium bg-transparent hover:bg-primary/10 transition-colors">
        <Settings2 className="h-3.5 w-3.5" />
        Columns
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <p className="text-xs font-medium text-muted-foreground px-2 pb-2">Drag to reorder</p>
        <div className="flex flex-col gap-0.5">
          {manageable.map(id => {
            const col = colMap[id]
            if (!col) return null
            const isVisible = visible.has(id)
            return (
              <div
                key={id}
                draggable
                onDragStart={() => onDragStart(id)}
                onDragEnd={onDragEnd}
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

// ── Filter definitions ────────────────────────────────────────────────────────

const UNIQUE_ASSETS     = Array.from(new Set(BUDGETS.map(b => b.asset))).sort()
const UNIQUE_FLOORS     = Array.from(new Set(BUDGETS.map(b => b.floor))).sort()
const UNIQUE_YEARS      = Array.from(new Set(BUDGETS.map(b => b.budgetYear).filter(Boolean))).sort() as number[]

const FILTER_DEFS = [
  { key: "asset",      label: "Asset",       options: UNIQUE_ASSETS.map(v => ({ label: v, value: v })) },
  { key: "floor",      label: "Floor",       options: UNIQUE_FLOORS.map(v => ({ label: v, value: v })) },
  { key: "budgetYear", label: "Budget year", options: UNIQUE_YEARS.map(v => ({ label: String(v), value: String(v) })) },
]

// ── Main component ────────────────────────────────────────────────────────────

const PAGE_SIZE = 15

export function BudgetsPage({ assetFilter }: { assetFilter?: string[] }) {
  const { sortKey, sortDir, handleSort: _handleSort } = useSortState<SortKey>("label")
  const [search, setSearch] = React.useState("")
  const [viewFilter, setViewFilter] = React.useState<ViewFilter>("active")
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({})
  const [page, setPage] = React.useState(1)

  function onToggle(key: string, value: string) { setActiveFilters(prev => toggleFilterValue(prev, key, value)); setPage(1) }
  function onClear(key: string) { setActiveFilters(prev => clearFilterKey(prev, key)); setPage(1) }
  function onClearAll() { setActiveFilters({}); setPage(1) }

  const [visible, setVisible] = React.useState<Set<string>>(
    () => new Set(ALL_COLUMNS.filter(c => c.defaultVisible).map(c => c.id))
  )
  const [colOrder, setColOrder] = React.useState<string[]>(ALL_COLUMNS.map(c => c.id))

  function handleSort(key: SortKey) { _handleSort(key); setPage(1) }
  function toggleCol(id: string) {
    setVisible(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  const orderedCols = colOrder
    .map(id => ALL_COLUMNS.find(c => c.id === id))
    .filter((c): c is ColDef => !!c && (c.id === "actions" || visible.has(c.id)))

  const filtered = React.useMemo(() => {
    let r = assetFilter?.length ? BUDGETS.filter(b => assetFilter.includes(b.asset)) : [...BUDGETS]
    if (viewFilter === "active")   r = r.filter(b => !b.archived)
    if (viewFilter === "archived") r = r.filter(b => b.archived)
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(b =>
        b.label.toLowerCase().includes(q) ||
        b.asset.toLowerCase().includes(q) ||
        b.floor.toLowerCase().includes(q) ||
        b.space.toLowerCase().includes(q)
      )
    }
    for (const [key, values] of Object.entries(activeFilters)) {
      if (!values.length) continue
      r = r.filter(b => values.includes(String(b[key as keyof Budget] ?? "")))
    }
    r.sort((a, b) => {
      const av = a[sortKey] ?? ""
      const bv = b[sortKey] ?? ""
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === "asc" ? cmp : -cmp
    })
    return r
  }, [assetFilter, search, viewFilter, activeFilters, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const allOnPage = paginated.length > 0 && paginated.every(b => selected.has(b.id))
  function toggleAll() {
    setSelected(prev => {
      const next = new Set(prev)
      if (allOnPage) paginated.forEach(b => next.delete(b.id))
      else paginated.forEach(b => next.add(b.id))
      return next
    })
  }
  function toggleRow(id: string) {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  const base            = assetFilter?.length ? BUDGETS.filter(b => assetFilter.includes(b.asset)) : BUDGETS
  const activeBudgets   = base.filter(b => !b.archived)
  const archivedBudgets = base.filter(b => b.archived)

  const kpis = [
    { label: "Active budgets",   value: String(activeBudgets.length) },
    { label: "Archived budgets", value: String(archivedBudgets.length) },
    { label: "Total spaces",     value: String(base.length) },
    { label: "Avg NER/sf/yr",    value: base.length ? fmtNer(base.reduce((a, b) => a + b.nerSizeYr, 0) / base.length) : "$–" },
  ]

  const VIEW_LABELS: Record<ViewFilter, string> = {
    active:   "Active budgets",
    archived: "Archived budgets",
    all:      "All budgets",
  }

  function renderCell(col: ColDef, b: Budget) {
    switch (col.id) {
      case "status":      return (
        <TableCell key={col.id} className="py-3 whitespace-nowrap">
          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            b.archived ? "bg-muted text-muted-foreground" : "bg-success/10 text-success"
          )}>
            {b.archived ? "Archived" : "Active"}
          </span>
        </TableCell>
      )
      case "label":       return <TableCell key={col.id} className="py-3 text-sm text-foreground whitespace-nowrap">{b.label || <span className="text-muted-foreground/40">—</span>}</TableCell>
      case "asset":       return <TableCell key={col.id} className="py-3 text-sm text-muted-foreground whitespace-nowrap">{b.asset}</TableCell>
      case "budgetYear":  return <TableCell key={col.id} className="py-3 text-sm text-muted-foreground whitespace-nowrap">{b.budgetYear ?? <span className="text-muted-foreground/40">—</span>}</TableCell>
      case "floor":       return <TableCell key={col.id} className="py-3 text-sm text-muted-foreground whitespace-nowrap">{b.floor}</TableCell>
      case "space":       return <TableCell key={col.id} className="py-3 text-sm text-muted-foreground whitespace-nowrap">{b.space}</TableCell>
      case "size":        return <TableCell key={col.id} className="py-3 text-right tabular-nums text-sm text-muted-foreground whitespace-nowrap">{fmtSize(b.size)}</TableCell>
      case "startDate":   return <TableCell key={col.id} className="py-3 text-sm text-muted-foreground whitespace-nowrap">{b.startDate}</TableCell>
      case "term":        return <TableCell key={col.id} className="py-3 text-right tabular-nums text-sm text-muted-foreground whitespace-nowrap">{b.term}</TableCell>
      case "baseRent":    return (
        <TableCell key={col.id} className="py-3 text-right tabular-nums text-sm text-muted-foreground whitespace-nowrap">
          <div>{fmtRent(b.baseRent)}</div>
          {b.baseRentStep && <div className="text-xs text-muted-foreground/60">{b.baseRentStep.month} - {b.term}: {fmtRent(b.baseRentStep.rent)}</div>}
        </TableCell>
      )
      case "esca":        return <TableCell key={col.id} className="py-3 text-sm text-muted-foreground whitespace-nowrap">{b.esca ?? <span className="text-muted-foreground/40">—</span>}</TableCell>
      case "ti":          return <TableCell key={col.id} className="py-3 text-right tabular-nums text-sm text-muted-foreground whitespace-nowrap">{fmtRent(b.ti)}</TableCell>
      case "freeRent":    return <TableCell key={col.id} className="py-3 text-right tabular-nums text-sm text-muted-foreground whitespace-nowrap">{b.freeRent}</TableCell>
      case "nerSizeYr":   return <TableCell key={col.id} className="py-3 text-right tabular-nums text-sm text-muted-foreground whitespace-nowrap">{fmtNer(b.nerSizeYr)}</TableCell>
      case "dateEntered": return <TableCell key={col.id} className="py-3 text-sm text-muted-foreground whitespace-nowrap">{b.dateEntered}</TableCell>
      case "actions":     return (
        <TableCell key={col.id} className="py-3 pl-1">
          <div className="flex items-center gap-1">
            <AgentBtn entity="Budget" label={`${b.label || "Unlabeled"} · ${b.asset} · ${b.floor} · ${b.space} · ${b.size.toLocaleString()} sf · base rent ${fmtRent(b.baseRent)} · NER ${fmtNer(b.nerSizeYr)}/sf/yr`} />
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-3.5 w-3.5" /></Button>} />
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem>{b.archived ? "Unarchive" : "Archive"}</DropdownMenuItem>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableCell>
      )
      default: return null
    }
  }

  return (
    <div className="space-y-4">
      <KpiBar kpis={kpis} />

      <div className={cardBase}>
        {/* Toolbar */}
        <div className={cn("flex flex-wrap items-center gap-2 mb-4", selected.size > 0 && "hidden")}>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="h-8 gap-1.5 text-sm font-medium">{VIEW_LABELS[viewFilter]}<ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /></Button>} />
            <DropdownMenuContent align="start" className="w-48">
              {(["active", "archived", "all"] as ViewFilter[]).map(v => (
                <DropdownMenuItem key={v} onClick={() => { setViewFilter(v); setPage(1) }}
                  className="flex items-center justify-between">
                  {VIEW_LABELS[v]}
                  {viewFilter === v && <Check className="h-3.5 w-3.5 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
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
            visibleCount={3}
          />

          <div className="ml-auto flex items-center gap-2">
            <ColumnManager
              columns={ALL_COLUMNS}
              visible={visible}
              order={colOrder}
              onToggle={toggleCol}
              onReorder={setColOrder}
            />
            <Button size="sm" className="h-8 gap-1.5 text-sm">
              <Plus className="h-3.5 w-3.5" />
              Add budget
            </Button>
          </div>
        </div>

        {/* Selection bar — replaces toolbar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setSelected(new Set())}
              className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
            >
              <span>{selected.size} selected</span>
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <Button size="sm" variant="outline" className="h-8 text-xs">Archive</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs">Duplicate</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs" disabled>Edit</Button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <Table className="border-collapse">
            <TableHeader>
              <TableRow className="border-b-2 border-border/60 hover:bg-transparent">
                <th className="pb-2 pt-0 w-8 pr-2 text-left">
                  <Checkbox checked={allOnPage} onCheckedChange={toggleAll} className="h-3.5 w-3.5" />
                </th>
                {orderedCols.map(col => col.id === "actions" ? (
                  <th key="actions" className="pb-2 pt-0 w-8" />
                ) : col.id === "status" ? (
                  <th key="status" className="pb-2 pt-0 text-xs font-medium text-muted-foreground text-left pr-4">Status</th>
                ) : (
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={orderedCols.length + 1} className="py-10 text-center text-sm text-muted-foreground">
                    No budgets match your filters.
                  </TableCell>
                </TableRow>
              )}
              {paginated.map((b, i) => (
                <TableRow
                  key={b.id}
                  className={cn(
                    "transition-colors hover:bg-muted/40",
                    i > 0 ? "border-t border-border/40" : "border-0",
                    selected.has(b.id) && "bg-primary/5"
                  )}
                >
                  <td className="py-3 pr-2 w-8">
                    <Checkbox checked={selected.has(b.id)} onCheckedChange={() => toggleRow(b.id)} className="h-3.5 w-3.5" />
                  </td>
                  {orderedCols.map(col => renderCell(col, b))}
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
