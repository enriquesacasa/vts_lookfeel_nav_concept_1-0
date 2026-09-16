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

export interface Comp {
  id: string
  label: string
  tenant: string
  currentAddress: string
  citySubmarket: string
  sf: number
  term: number
  rent: number
  esca: string | null
  ti: number
  freeRent: number
  lcd: string
  createdDate: string
  note: string | null
  industry: string
  dealType: "New deal" | "Expansion" | "Renewal" | "Sublease"
  archived: boolean
}

// Bucket helpers — used for range filters
function sfBucket(sf: number) {
  if (sf < 5_000)  return "< 5,000 SF"
  if (sf < 10_000) return "5,000–10,000 SF"
  if (sf < 25_000) return "10,000–25,000 SF"
  if (sf < 50_000) return "25,000–50,000 SF"
  if (sf < 100_000) return "50,000–100,000 SF"
  return "100,000+ SF"
}

function termBucket(mo: number) {
  if (mo <= 36)  return "0–36 mo"
  if (mo <= 60)  return "37–60 mo"
  if (mo <= 84)  return "61–84 mo"
  if (mo <= 120) return "85–120 mo"
  return "120+ mo"
}

function rentBucket(r: number) {
  if (r < 80)  return "< $80"
  if (r < 100) return "$80–$100"
  if (r < 120) return "$100–$120"
  return "$120+"
}


type SortKey = keyof Pick<Comp, "label" | "tenant" | "currentAddress" | "citySubmarket" | "sf" | "term" | "rent" | "esca" | "ti" | "freeRent" | "lcd" | "createdDate">
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
  { id: "status",         label: "Status",           sortable: false, defaultVisible: true  },
  { id: "label",          label: "Label",            sortable: true,  defaultVisible: true  },
  { id: "tenant",         label: "Tenant",           sortable: true,  defaultVisible: true  },
  { id: "currentAddress", label: "Current address",  sortable: true,  defaultVisible: true  },
  { id: "citySubmarket",  label: "City/submarket",   sortable: true,  defaultVisible: true  },
  { id: "sf",             label: "SF",               sortable: true,  right: true, defaultVisible: true  },
  { id: "term",           label: "Term (Mo.)",       sortable: true,  right: true, defaultVisible: true  },
  { id: "rent",           label: "Rent",             sortable: true,  right: true, defaultVisible: true  },
  { id: "esca",           label: "ESCA",             sortable: true,  defaultVisible: false },
  { id: "ti",             label: "TI",               sortable: true,  right: true, defaultVisible: true  },
  { id: "freeRent",       label: "FR",               sortable: true,  right: true, defaultVisible: true  },
  { id: "lcd",            label: "LCD",              sortable: true,  defaultVisible: true  },
  { id: "createdDate",    label: "Created date",     sortable: true,  defaultVisible: false },
  { id: "note",           label: "Note",             sortable: false, defaultVisible: false },
  { id: "actions",        label: "",                 sortable: false, defaultVisible: true  },
]

// ── Mock data ─────────────────────────────────────────────────────────────────

export const COMPS: Comp[] = [
  // VTS Tower HQ tenants
  { id: "c01", label: "Goldman Sachs expansion",    tenant: "Goldman Sachs",          currentAddress: "200 West St",          citySubmarket: "New York / Hudson Sq",     sf: 45000, term: 120, rent: 96.00, esca: "3% fixed",    ti: 185.00, freeRent: 12, lcd: "03/01/26", createdDate: "01/26/23", note: null,                  industry: "Financial services", dealType: "Expansion",  archived: false },
  { id: "c02", label: "Sullivan & Cromwell",        tenant: "Sullivan & Cromwell LLP", currentAddress: "125 Broad St",         citySubmarket: "New York / Midtown",       sf: 38000, term: 84,  rent: 93.00, esca: "3% fixed",    ti: 175.00, freeRent: 10, lcd: "01/15/26", createdDate: "03/12/25", note: "Verified with broker", industry: "Legal",               dealType: "New deal",   archived: false },
  { id: "c03", label: "Fidelity direct",            tenant: "Fidelity Investments",    currentAddress: "One Federal St",       citySubmarket: "Boston / Financial Dist",  sf: 22000, term: 60,  rent: 88.00, esca: "CPI cap 3%",  ti: 160.00, freeRent:  8, lcd: "11/01/25", createdDate: "08/05/25", note: null,                  industry: "Financial services", dealType: "New deal",   archived: false },
  { id: "c04", label: "Credit Suisse renewal",      tenant: "Credit Suisse",           currentAddress: "1221 Ave Americas",    citySubmarket: "New York / Midtown",       sf: 62000, term: 120, rent: 100.00, esca: "3% fixed",   ti: 200.00, freeRent: 14, lcd: "04/01/26", createdDate: "11/20/25", note: null,                  industry: "Financial services", dealType: "Renewal",    archived: false },
  { id: "c05", label: "Davis Polk new deal",        tenant: "Davis Polk & Wardwell",   currentAddress: "450 Lexington Ave",    citySubmarket: "New York / Midtown",       sf: 55000, term: 132, rent: 102.00, esca: "3.5% fixed", ti: 210.00, freeRent: 15, lcd: "02/01/26", createdDate: "09/18/25", note: "Comp list",           industry: "Legal",               dealType: "New deal",   archived: false },
  { id: "c06", label: "Marsh McLennan sublease",    tenant: "Marsh & McLennan",        currentAddress: "1166 Ave Americas",    citySubmarket: "New York / Midtown",       sf: 30000, term: 96,  rent: 97.00, esca: null,           ti: 190.00, freeRent: 12, lcd: "12/15/25", createdDate: "04/30/25", note: null,                  industry: "Insurance",           dealType: "Sublease",   archived: false },
  { id: "c07", label: "KKR flagship",               tenant: "KKR & Co.",               currentAddress: "9 W 57th St",          citySubmarket: "New York / Hudson Yards",  sf: 80000, term: 144, rent: 118.00, esca: "3% fixed",   ti: 250.00, freeRent: 18, lcd: "05/01/26", createdDate: "12/01/25", note: null,                  industry: "Private equity",      dealType: "New deal",   archived: false },
  { id: "c08", label: "Warner Media relocation",    tenant: "Warner Media",            currentAddress: "30 Rockefeller Plaza", citySubmarket: "New York / Hudson Yards",  sf: 48000, term: 120, rent: 113.00, esca: "3% fixed",   ti: 230.00, freeRent: 15, lcd: "03/15/26", createdDate: "07/22/25", note: null,                  industry: "Media & entertainment", dealType: "New deal", archived: false },
  { id: "c09", label: "Pfizer sublease",            tenant: "Pfizer Inc.",             currentAddress: "235 E 42nd St",        citySubmarket: "New York / Hudson Yards",  sf: 35000, term: 84,  rent: 109.00, esca: null,          ti: 220.00, freeRent: 14, lcd: "01/01/26", createdDate: "06/14/25", note: "Needs confirmation",  industry: "Pharmaceuticals",     dealType: "Sublease",   archived: false },
  { id: "c10", label: "BofA anchor renewal",        tenant: "Bank of America",         currentAddress: "One Bryant Park",      citySubmarket: "New York / Midtown",       sf: 95000, term: 120, rent: 104.00, esca: "3% fixed",   ti: 205.00, freeRent: 16, lcd: "02/15/26", createdDate: "10/08/25", note: null,                  industry: "Financial services", dealType: "Renewal",    archived: false },
  { id: "c11", label: "JPMorgan downtown",          tenant: "JPMorgan Chase",          currentAddress: "383 Madison Ave",      citySubmarket: "New York / Downtown",      sf: 70000, term: 96,  rent: 78.00,  esca: "CPI cap 3%", ti: 145.00, freeRent: 10, lcd: "04/01/26", createdDate: "02/03/26", note: null,                  industry: "Financial services", dealType: "New deal",   archived: false },
  // Chicago / Loop
  { id: "c14", label: "United Airlines HQ",          tenant: "United Airlines",         currentAddress: "233 S Wacker Dr",      citySubmarket: "Chicago / Loop",           sf: 62000, term: 120, rent: 72.00, esca: "3% fixed",    ti: 85.00, freeRent: 10, lcd: "02/01/26", createdDate: "10/15/25", note: null,                   industry: "Transportation",      dealType: "Renewal",    archived: false },
  { id: "c15", label: "Salesforce Chicago",          tenant: "Salesforce Inc.",         currentAddress: "111 W Illinois St",    citySubmarket: "Chicago / Loop",           sf: 45000, term: 96,  rent: 68.00, esca: "3% fixed",    ti: 75.00, freeRent: 8,  lcd: "05/01/26", createdDate: "01/20/26", note: null,                   industry: "Technology",          dealType: "New deal",   archived: false },
  { id: "c16", label: "PwC expansion",               tenant: "PwC",                     currentAddress: "One North Wacker",     citySubmarket: "Chicago / Loop",           sf: 38000, term: 84,  rent: 65.00, esca: "CPI cap 3%",  ti: 68.00, freeRent: 7,  lcd: "04/01/26", createdDate: "12/08/25", note: "Verified with broker",  industry: "Professional services", dealType: "Expansion", archived: false },
  { id: "c17", label: "Citadel renewal",             tenant: "Citadel",                 currentAddress: "131 S Dearborn St",    citySubmarket: "Chicago / Loop",           sf: 55000, term: 120, rent: 75.00, esca: "3.5% fixed",  ti: 90.00, freeRent: 12, lcd: "06/01/26", createdDate: "02/28/26", note: null,                   industry: "Financial services",  dealType: "Renewal",    archived: false },

  // San Francisco / Financial Dist
  { id: "c18", label: "Salesforce SF",               tenant: "Salesforce Inc.",         currentAddress: "415 Mission St",       citySubmarket: "San Francisco / Financial Dist", sf: 75000, term: 132, rent: 108.00, esca: "3% fixed",   ti: 145.00, freeRent: 14, lcd: "03/01/26", createdDate: "09/22/25", note: null,                   industry: "Technology",          dealType: "Renewal",    archived: false },
  { id: "c19", label: "Twitter/X sublease",          tenant: "Twitter/X",               currentAddress: "1355 Market St",       citySubmarket: "San Francisco / Financial Dist", sf: 42000, term: 60,  rent: 95.00, esca: null,          ti: 110.00, freeRent: 8,  lcd: "01/15/26", createdDate: "07/14/25", note: "Needs confirmation",   industry: "Technology",          dealType: "Sublease",   archived: false },
  { id: "c20", label: "Airbnb HQ renewal",           tenant: "Airbnb",                  currentAddress: "888 Brannan St",       citySubmarket: "San Francisco / Financial Dist", sf: 48000, term: 96,  rent: 102.00, esca: "3% fixed",  ti: 130.00, freeRent: 10, lcd: "04/01/26", createdDate: "11/30/25", note: null,                   industry: "Technology",          dealType: "Renewal",    archived: false },
  { id: "c21", label: "Stripe expansion",            tenant: "Stripe",                  currentAddress: "510 Townsend St",      citySubmarket: "San Francisco / Financial Dist", sf: 35000, term: 84,  rent: 110.00, esca: "3.5% fixed", ti: 150.00, freeRent: 12, lcd: "05/15/26", createdDate: "01/10/26", note: "Comp list",            industry: "Technology",          dealType: "Expansion",  archived: false },

  // Seattle / Downtown
  { id: "c22", label: "Amazon downtown",             tenant: "Amazon.com",              currentAddress: "410 Terry Ave N",      citySubmarket: "Seattle / Downtown",       sf: 80000, term: 120, rent: 68.00, esca: "3% fixed",    ti: 95.00, freeRent: 12, lcd: "02/15/26", createdDate: "08/18/25", note: null,                   industry: "Technology",          dealType: "New deal",   archived: false },
  { id: "c23", label: "Boeing relocation",           tenant: "Boeing",                  currentAddress: "100 N Riverside",      citySubmarket: "Seattle / Downtown",       sf: 55000, term: 96,  rent: 62.00, esca: "3% fixed",    ti: 78.00, freeRent: 8,  lcd: "05/01/26", createdDate: "12/04/25", note: null,                   industry: "Aerospace",           dealType: "New deal",   archived: false },
  { id: "c24", label: "Microsoft Seattle office",    tenant: "Microsoft",               currentAddress: "320 Westlake Ave N",   citySubmarket: "Seattle / Downtown",       sf: 48000, term: 84,  rent: 65.00, esca: "CPI cap 3%",  ti: 82.00, freeRent: 7,  lcd: "03/01/26", createdDate: "10/22/25", note: "Verified with broker",  industry: "Technology",          dealType: "Expansion",  archived: false },
  { id: "c25", label: "Starbucks headquarters",      tenant: "Starbucks Corporation",   currentAddress: "2401 Utah Ave S",      citySubmarket: "Seattle / Downtown",       sf: 65000, term: 144, rent: 70.00, esca: "3.5% fixed",  ti: 100.00, freeRent: 14, lcd: "06/01/26", createdDate: "02/14/26", note: null,                   industry: "Food & beverage",     dealType: "Renewal",    archived: false },

  // Atlanta / Midtown
  { id: "c26", label: "Delta Air Lines office",      tenant: "Delta Air Lines",         currentAddress: "1030 Delta Blvd",      citySubmarket: "Atlanta / Midtown",        sf: 44000, term: 84,  rent: 52.00, esca: "3% fixed",    ti: 55.00, freeRent: 6,  lcd: "03/15/26", createdDate: "11/05/25", note: null,                   industry: "Transportation",      dealType: "New deal",   archived: false },
  { id: "c27", label: "Cox Media Atlanta",           tenant: "Cox Enterprises",         currentAddress: "6205 Peachtree Dunwoody Rd", citySubmarket: "Atlanta / Midtown",   sf: 38000, term: 72,  rent: 48.00, esca: "3% fixed",    ti: 50.00, freeRent: 5,  lcd: "04/01/26", createdDate: "12/18/25", note: null,                   industry: "Media & entertainment", dealType: "Renewal",  archived: false },
  { id: "c28", label: "Home Depot expansion",        tenant: "Home Depot",              currentAddress: "2455 Paces Ferry Rd",  citySubmarket: "Atlanta / Midtown",        sf: 52000, term: 96,  rent: 56.00, esca: "3% fixed",    ti: 60.00, freeRent: 7,  lcd: "05/01/26", createdDate: "01/22/26", note: "Comp list",            industry: "Retail",              dealType: "Expansion",  archived: false },
  { id: "c29", label: "NCR Corporation HQ",          tenant: "NCR Corporation",         currentAddress: "864 Spring St NW",     citySubmarket: "Atlanta / Midtown",        sf: 30000, term: 60,  rent: 46.00, esca: "CPI cap 3%",  ti: 45.00, freeRent: 4,  lcd: "02/01/26", createdDate: "09/30/25", note: null,                   industry: "Technology",          dealType: "Renewal",    archived: false },

  // Providence / Downtown
  { id: "c30", label: "Fidelity Providence",         tenant: "Fidelity Investments",    currentAddress: "100 Westminster St",   citySubmarket: "Providence / Downtown",    sf: 22000, term: 60,  rent: 38.00, esca: "3% fixed",    ti: 42.00, freeRent: 4,  lcd: "01/15/26", createdDate: "08/20/25", note: null,                   industry: "Financial services",  dealType: "New deal",   archived: false },
  { id: "c31", label: "Textron renewal",             tenant: "Textron",                 currentAddress: "40 Westminster St",    citySubmarket: "Providence / Downtown",    sf: 18000, term: 72,  rent: 35.00, esca: "3% fixed",    ti: 38.00, freeRent: 3,  lcd: "03/01/26", createdDate: "10/12/25", note: null,                   industry: "Industrials",         dealType: "Renewal",    archived: false },
  { id: "c32", label: "CVS Health offices",          tenant: "CVS Health",              currentAddress: "1 CVS Dr",             citySubmarket: "Providence / Downtown",    sf: 28000, term: 84,  rent: 40.00, esca: "3% fixed",    ti: 45.00, freeRent: 5,  lcd: "04/15/26", createdDate: "12/01/25", note: "Verified with broker",  industry: "Healthcare",          dealType: "Expansion",  archived: false },
  { id: "c33", label: "Brown University offices",    tenant: "Brown University",        currentAddress: "164 Angell St",        citySubmarket: "Providence / Downtown",    sf: 15000, term: 60,  rent: 32.00, esca: "CPI cap 2.5%", ti: 35.00, freeRent: 3,  lcd: "02/01/26", createdDate: "09/08/25", note: null,                   industry: "Education",           dealType: "New deal",   archived: false },

  // Archived
  { id: "c12", label: "Deloitte 2023",              tenant: "Deloitte LLP",            currentAddress: "30 Rockefeller Plaza", citySubmarket: "New York / Downtown",      sf: 52000, term: 84,  rent: 75.00,  esca: "3% fixed",   ti: 140.00, freeRent:  9, lcd: "12/01/23", createdDate: "09/04/19", note: "Comp list",           industry: "Professional services", dealType: "Renewal",  archived: true  },
  { id: "c13", label: "AIG sublease 2022",          tenant: "AIG",                     currentAddress: "175 Water St",         citySubmarket: "New York / Downtown",      sf: 28000, term: 60,  rent: 72.00,  esca: null,          ti: 130.00, freeRent:  8, lcd: "08/01/22", createdDate: "01/26/23", note: null,                  industry: "Insurance",           dealType: "Sublease",   archived: true  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtRent(n: number) { return `$${n.toFixed(2)}` }
function fmtSf(n: number)   { return n.toLocaleString() }

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

const UNIQUE_SUBMARKETS = Array.from(new Set(COMPS.map(c => c.citySubmarket))).sort()
const UNIQUE_INDUSTRIES = Array.from(new Set(COMPS.map(c => c.industry))).sort()
const UNIQUE_LCD_YEARS  = Array.from(new Set(COMPS.map(c => `20${c.lcd.slice(-2)}`))).sort()

const SF_BUCKETS    = ["< 5,000 SF", "5,000–10,000 SF", "10,000–25,000 SF", "25,000–50,000 SF", "50,000–100,000 SF", "100,000+ SF"]
const TERM_BUCKETS  = ["0–36 mo", "37–60 mo", "61–84 mo", "85–120 mo", "120+ mo"]
const RENT_BUCKETS  = ["< $80", "$80–$100", "$100–$120", "$120+"]

const FILTER_DEFS = [
  { key: "_sfBucket",    label: "Requirement size", options: SF_BUCKETS.map(v => ({ label: v, value: v })) },
  { key: "citySubmarket",label: "Submarket",        options: UNIQUE_SUBMARKETS.map(v => ({ label: v, value: v })) },
  { key: "_lcdYear",     label: "LCD",              options: UNIQUE_LCD_YEARS.map(v => ({ label: v, value: v })) },
  { key: "industry",     label: "Industry",         options: UNIQUE_INDUSTRIES.map(v => ({ label: v, value: v })) },
  { key: "_termBucket",  label: "Term",             options: TERM_BUCKETS.map(v => ({ label: v, value: v })) },
  { key: "_rentBucket",  label: "Starting rent",    options: RENT_BUCKETS.map(v => ({ label: v, value: v })) },
]

// ── Main component ────────────────────────────────────────────────────────────

const PAGE_SIZE = 15

export function CompsPage({ cityFilter }: { cityFilter?: string[] }) {
  const { sortKey, sortDir, handleSort: _handleSort } = useSortState<SortKey>("lcd")
  const [search, setSearch] = React.useState("")
  const [viewFilter, setViewFilter] = React.useState<ViewFilter>("active")
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({})
  const [page, setPage] = React.useState(1)

  function handleSort(key: SortKey) { _handleSort(key); setPage(1) }
  function onToggle(key: string, value: string) { setActiveFilters(prev => toggleFilterValue(prev, key, value)); setPage(1) }
  function onClear(key: string) { setActiveFilters(prev => clearFilterKey(prev, key)); setPage(1) }
  function onClearAll() { setActiveFilters({}); setPage(1) }

  const [visible, setVisible] = React.useState<Set<string>>(
    () => new Set(ALL_COLUMNS.filter(c => c.defaultVisible).map(c => c.id))
  )
  const [colOrder, setColOrder] = React.useState<string[]>(ALL_COLUMNS.map(c => c.id))

  function toggleCol(id: string) {
    setVisible(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  const orderedCols = colOrder
    .map(id => ALL_COLUMNS.find(c => c.id === id))
    .filter((c): c is ColDef => !!c && (c.id === "actions" || visible.has(c.id)))

  const filtered = React.useMemo(() => {
    let r = cityFilter?.length ? COMPS.filter(c => cityFilter.some(city => c.citySubmarket.toLowerCase().includes(city.toLowerCase()))) : [...COMPS]
    if (viewFilter === "active")   r = r.filter(c => !c.archived)
    if (viewFilter === "archived") r = r.filter(c => c.archived)
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(c =>
        c.label.toLowerCase().includes(q) ||
        c.tenant.toLowerCase().includes(q) ||
        c.currentAddress.toLowerCase().includes(q) ||
        c.citySubmarket.toLowerCase().includes(q)
      )
    }
    for (const [key, values] of Object.entries(activeFilters)) {
      if (!values.length) continue
      if (key === "_sfBucket")   { r = r.filter(c => values.includes(sfBucket(c.sf)));     continue }
      if (key === "_termBucket") { r = r.filter(c => values.includes(termBucket(c.term))); continue }
      if (key === "_rentBucket") { r = r.filter(c => values.includes(rentBucket(c.rent))); continue }
      if (key === "_lcdYear")    { r = r.filter(c => values.includes(`20${c.lcd.slice(-2)}`)); continue }
      r = r.filter(c => values.includes(String(c[key as keyof Comp] ?? "")))
    }
    r.sort((a, b) => {
      const av = a[sortKey] ?? ""
      const bv = b[sortKey] ?? ""
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === "asc" ? cmp : -cmp
    })
    return r
  }, [cityFilter, search, viewFilter, activeFilters, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const allOnPage = paginated.length > 0 && paginated.every(c => selected.has(c.id))
  function toggleAll() {
    setSelected(prev => {
      const next = new Set(prev)
      if (allOnPage) paginated.forEach(c => next.delete(c.id))
      else paginated.forEach(c => next.add(c.id))
      return next
    })
  }
  function toggleRow(id: string) {
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })
  }

  const base          = cityFilter?.length ? COMPS.filter(c => cityFilter.some(city => c.citySubmarket.toLowerCase().includes(city.toLowerCase()))) : COMPS
  const activeComps   = base.filter(c => !c.archived)
  const archivedComps = base.filter(c => c.archived)
  const totalSf = activeComps.reduce((s, c) => s + c.sf, 0)
  const avgRent = totalSf > 0 ? activeComps.reduce((s, c) => s + c.rent * c.sf, 0) / totalSf : 0
  const avgTi   = totalSf > 0 ? activeComps.reduce((s, c) => s + c.ti * c.sf, 0) / totalSf : 0

  const kpis = [
    { label: "Active comps",    value: String(activeComps.length) },
    { label: "Archived",        value: String(archivedComps.length) },
    { label: "Avg rent",        value: activeComps.length ? `$${avgRent.toFixed(2)}` : "$–" },
    { label: "Avg TI",          value: activeComps.length ? `$${avgTi.toFixed(2)}` : "$–" },
  ]

  const VIEW_LABELS: Record<ViewFilter, string> = {
    active:   "Active comps",
    archived: "Archived comps",
    all:      "All comps",
  }

  function renderCell(col: ColDef, c: Comp) {
    switch (col.id) {
      case "status": return (
        <TableCell key={col.id} className="py-3 whitespace-nowrap">
          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
            c.archived ? "bg-muted text-muted-foreground" : "bg-success/10 text-success"
          )}>
            {c.archived ? "Archived" : "Active"}
          </span>
        </TableCell>
      )
      case "label":          return <TableCell key={col.id} className="py-3 text-sm text-foreground whitespace-nowrap">{c.label || <span className="text-muted-foreground/40">—</span>}</TableCell>
      case "tenant":         return <TableCell key={col.id} className="py-3 text-sm text-muted-foreground whitespace-nowrap">{c.tenant}</TableCell>
      case "currentAddress": return <TableCell key={col.id} className="py-3 text-sm text-muted-foreground whitespace-nowrap">{c.currentAddress || <span className="text-muted-foreground/40">—</span>}</TableCell>
      case "citySubmarket":  return <TableCell key={col.id} className="py-3 text-sm text-muted-foreground whitespace-nowrap">{c.citySubmarket || <span className="text-muted-foreground/40">—</span>}</TableCell>
      case "sf":             return <TableCell key={col.id} className="py-3 text-right tabular-nums text-sm text-muted-foreground whitespace-nowrap">{fmtSf(c.sf)}</TableCell>
      case "term":           return <TableCell key={col.id} className="py-3 text-right tabular-nums text-sm text-muted-foreground whitespace-nowrap">{c.term}</TableCell>
      case "rent":           return <TableCell key={col.id} className="py-3 text-right tabular-nums text-sm text-muted-foreground whitespace-nowrap">{fmtRent(c.rent)}</TableCell>
      case "esca":           return <TableCell key={col.id} className="py-3 text-sm text-muted-foreground whitespace-nowrap">{c.esca ?? <span className="text-muted-foreground/40">—</span>}</TableCell>
      case "ti":             return <TableCell key={col.id} className="py-3 text-right tabular-nums text-sm text-muted-foreground whitespace-nowrap">{fmtRent(c.ti)}</TableCell>
      case "freeRent":       return <TableCell key={col.id} className="py-3 text-right tabular-nums text-sm text-muted-foreground whitespace-nowrap">{c.freeRent}</TableCell>
      case "lcd":            return <TableCell key={col.id} className="py-3 text-sm text-muted-foreground whitespace-nowrap">{c.lcd}</TableCell>
      case "createdDate":    return <TableCell key={col.id} className="py-3 text-sm text-muted-foreground whitespace-nowrap">{c.createdDate}</TableCell>
      case "note":           return <TableCell key={col.id} className="py-3 text-sm text-muted-foreground whitespace-nowrap">{c.note ?? <span className="text-muted-foreground/40">—</span>}</TableCell>
      case "actions": return (
        <TableCell key={col.id} className="py-3 pl-1">
          <div className="flex items-center gap-1">
            <AgentBtn entity="Comp" label={`${c.label || "Unlabeled"} · ${c.tenant} · ${fmtSf(c.sf)} sf · rent ${fmtRent(c.rent)} · TI ${fmtRent(c.ti)} · LCD ${c.lcd}`} />
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-3.5 w-3.5" /></Button>} />
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem>{c.archived ? "Unarchive" : "Archive"}</DropdownMenuItem>
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
            <DropdownMenuContent align="start" className="w-44">
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
            visibleCount={6}
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
              Add comp
            </Button>
          </div>
        </div>

        {/* Selection bar */}
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
                    No comps match your filters.
                  </TableCell>
                </TableRow>
              )}
              {paginated.map((c, i) => (
                <TableRow
                  key={c.id}
                  className={cn(
                    "transition-colors hover:bg-muted/40",
                    i > 0 ? "border-t border-border/40" : "border-0",
                    selected.has(c.id) && "bg-primary/5"
                  )}
                >
                  <td className="py-3 pr-2 w-8">
                    <Checkbox checked={selected.has(c.id)} onCheckedChange={() => toggleRow(c.id)} className="h-3.5 w-3.5" />
                  </td>
                  {orderedCols.map(col => renderCell(col, c))}
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
