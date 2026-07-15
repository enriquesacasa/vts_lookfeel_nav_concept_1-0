import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronUp, ChevronDown, ChevronsUpDown, Sparkle } from "lucide-react"

type DateCategory = "expiring" | "renewal" | "options" | "all"
type SortKey = "tenant" | "type" | "space" | "date" | "monthsOut"
type SortDir = "asc" | "desc"

export interface CriticalDate {
  tenant: string
  type: string
  space: string
  sf: number
  date: string
  monthsOut: number
  category: Exclude<DateCategory, "all">
}

interface CriticalDatesProps {
  dates: CriticalDate[]
  className?: string
}

const TABS: { label: string; value: DateCategory }[] = [
  { label: "All", value: "all" },
  { label: "Expiring", value: "expiring" },
  { label: "Renewal", value: "renewal" },
  { label: "Options", value: "options" },
]

function urgency(months: number): "urgent" | "soon" | "later" {
  if (months <= 6) return "urgent"
  if (months <= 12) return "soon"
  return "later"
}

const PILL: Record<ReturnType<typeof urgency>, string> = {
  urgent: "bg-destructive/10 text-destructive",
  soon:   "bg-warning/10 text-warning",
  later:  "bg-primary/10 text-primary",
}

function fmtMonths(n: number) {
  if (n > 18) return "18+ mo"
  return `${n} mo`
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="h-3 w-3 opacity-40" />
  return sortDir === "asc"
    ? <ChevronUp className="h-3 w-3" />
    : <ChevronDown className="h-3 w-3" />
}

interface AIButtonProps {
  onClick: (e: React.MouseEvent) => void
}

function AIButton({ onClick }: AIButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span />}>
        <button
          onClick={onClick}
          className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground transition-all duration-150 shrink-0"
        >
          <Sparkle fill="currentColor" className="h-3 w-3" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-sidebar text-sidebar-foreground border-transparent font-medium"
        arrowClassName="fill-sidebar"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-medium text-sidebar-foreground">
            <Sparkle fill="currentColor" className="h-3 w-3" />
            Run Agent
          </div>
          <p className="text-sidebar-foreground/70 font-normal">Research this date and surface next steps</p>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

const CriticalDates = React.forwardRef<HTMLDivElement, CriticalDatesProps>(
  ({ dates, className }, ref) => {
    const [active, setActive] = React.useState<DateCategory>("all")
    const [sortKey, setSortKey] = React.useState<SortKey>("monthsOut")
    const [sortDir, setSortDir] = React.useState<SortDir>("asc")

    const filtered = active === "all" ? dates : dates.filter(d => d.category === active)

    const sorted = [...filtered].sort((a, b) => {
      let av: string | number = a[sortKey]
      let bv: string | number = b[sortKey]
      if (typeof av === "string") av = av.toLowerCase()
      if (typeof bv === "string") bv = bv.toLowerCase()
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === "asc" ? cmp : -cmp
    })

    function handleSort(key: SortKey) {
      if (key === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc")
      else { setSortKey(key); setSortDir("asc") }
    }

    function Th({ col, children, className: cls }: { col: SortKey; children: React.ReactNode; className?: string }) {
      return (
        <th
          onClick={() => handleSort(col)}
          className={cn(
            "pb-2 text-left text-[10px] font-medium uppercase tracking-widest cursor-pointer select-none whitespace-nowrap",
            sortKey === col ? "text-foreground/80" : "text-foreground/50",
            "hover:text-foreground/80 transition-colors",
            cls
          )}
        >
          <span className="inline-flex items-center gap-1">
            {children}
            <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
          </span>
        </th>
      )
    }

    return (
      <div ref={ref} className={cn(cardBase, "flex flex-col gap-4", className)}>
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">Upcoming 12 Mo</p>
            <h2 className="text-xl font-medium text-foreground">Critical Dates</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 text-primary border-primary bg-transparent hover:bg-primary/10 hover:text-primary dark:bg-white/8 dark:border-white/25 dark:text-white dark:hover:bg-white/15"
          >
            View Critical Dates
          </Button>
        </div>

        {/* Toggle bar */}
        <div className="flex gap-1 rounded-lg bg-muted/60 dark:bg-white/6 p-1">
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActive(tab.value)}
              className={cn(
                "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                active === tab.value
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:bg-background/70 dark:hover:bg-white/8 hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table — scrolls within card, never causes page scroll */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[520px]">
            <thead>
              <tr className="border-b-2 border-border/60">
                <Th col="tenant">Tenant</Th>
                <Th col="space" className="pl-3">Space</Th>
                <Th col="type" className="pl-3">Type</Th>
                <Th col="date" className="pl-3 text-right whitespace-nowrap">Date</Th>
                <Th col="monthsOut" className="pl-3 text-right whitespace-nowrap">Time</Th>
                <th className="pb-2 pl-3 w-8" />
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                    No dates in this category
                  </td>
                </tr>
              )}
              {sorted.map((d, i) => {
                const u = urgency(d.monthsOut)
                return (
                  <tr key={i} title="View Lease" className={cn("cursor-pointer hover:bg-muted/40 dark:hover:bg-white/4 transition-colors", i > 0 && "border-t border-border/40")}>
                    <td className="py-2.5 text-sm font-medium text-foreground whitespace-nowrap">
                      {d.tenant}
                    </td>
                    <td className="py-2.5 pl-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                      {d.space}
                    </td>
                    <td className="py-2.5 pl-3 text-sm text-muted-foreground">
                      <span className="truncate block">{d.type}</span>
                    </td>
                    <td className="py-2.5 pl-3 text-right font-medium whitespace-nowrap text-sm text-foreground">
                      {d.date}
                    </td>
                    <td className="py-2.5 pl-3 text-right whitespace-nowrap">
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tabular-nums", PILL[u])}>
                        {fmtMonths(d.monthsOut)}
                      </span>
                    </td>
                    <td className="py-2.5 pl-2 text-right whitespace-nowrap">
                      <AIButton onClick={e => e.stopPropagation()} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
)
CriticalDates.displayName = "CriticalDates"

export { CriticalDates }
export type { CriticalDatesProps }
