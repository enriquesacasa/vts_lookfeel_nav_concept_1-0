import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Sparkle, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"

export interface Deal {
  tenant: string
  space: string
  sf: number
  stage: "Proposal" | "LOI" | "Lease Out" | "Executed"
  status: "active" | "stalled" | "at-risk"
  baseRent: number
  budgetRent: number
  stalledDays?: number
  note?: string
}

export interface DecisionItem {
  tenant: string
  action: string
  inApprovalFor: string
}

interface LeasingActivityProps {
  deals: Deal[]
  decisions?: DecisionItem[]
  className?: string
}

type SortKey = "tenant" | "space" | "sf" | "stage" | "status" | "baseRent"
type SortDir = "asc" | "desc"

const STAGE_ORDER = ["Proposal", "LOI", "Lease Out", "Executed"] as const
const STATUS_ORDER: Deal["status"][] = ["at-risk", "stalled", "active"]

const STATUS_PILL: Record<Deal["status"], string> = {
  active:    "bg-success/10 text-success",
  stalled:   "bg-warning/10 text-warning",
  "at-risk": "bg-destructive/10 text-destructive",
}

const STATUS_LABEL: Record<Deal["status"], string> = {
  active: "Active",
  stalled: "Stalled",
  "at-risk": "At Risk",
}

function fmtSf(n: number) { return `${(n / 1000).toFixed(0)}K sf` }

function RentDelta({ base, budget }: { base: number; budget: number }) {
  const diff = base - budget
  const pct = Math.round((diff / budget) * 100)
  const over = diff >= 0
  return (
    <div className="text-right tabular-nums">
      <div className="text-sm font-medium text-foreground">${base.toFixed(2)}</div>
      <div className={cn("text-[10px] font-medium", over ? "text-success" : "text-destructive")}>
        {over ? "+" : ""}{pct}% vs ${budget.toFixed(2)}
      </div>
    </div>
  )
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="h-3 w-3 opacity-40" />
  return sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
}

const LeasingActivity = React.forwardRef<HTMLDivElement, LeasingActivityProps>(
  ({ deals, className }, ref) => {
    const [sortKey, setSortKey] = React.useState<SortKey>("tenant")
    const [sortDir, setSortDir] = React.useState<SortDir>("asc")

    function handleSort(key: SortKey) {
      if (key === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc")
      else { setSortKey(key); setSortDir("asc") }
    }

    const sorted = [...deals].sort((a, b) => {
      let av: string | number
      let bv: string | number
      if (sortKey === "stage") {
        av = STAGE_ORDER.indexOf(a.stage)
        bv = STAGE_ORDER.indexOf(b.stage)
      } else if (sortKey === "status") {
        av = STATUS_ORDER.indexOf(a.status)
        bv = STATUS_ORDER.indexOf(b.status)
      } else if (sortKey === "space") {
        av = a.space.toLowerCase()
        bv = b.space.toLowerCase()
      } else if (sortKey === "tenant") {
        av = a.tenant.toLowerCase()
        bv = b.tenant.toLowerCase()
      } else {
        av = a[sortKey] as number
        bv = b[sortKey] as number
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === "asc" ? cmp : -cmp
    })

    function Th({ col, children, className: cls, right }: { col: SortKey; children: React.ReactNode; className?: string; right?: boolean }) {
      return (
        <th
          onClick={() => handleSort(col)}
          className={cn(
            "pb-2 text-[10px] font-medium uppercase tracking-widest cursor-pointer select-none whitespace-nowrap transition-colors",
            right ? "text-right pl-3" : "text-left",
            sortKey === col ? "text-foreground/80" : "text-foreground/50",
            "hover:text-foreground/80",
            cls
          )}
        >
          <span className={cn("inline-flex items-center gap-1", right && "justify-end w-full")}>
            {children}
            <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
          </span>
        </th>
      )
    }

    return (
      <div ref={ref} className={cn(cardBase, className)}>
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 mb-6">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">Pipeline</p>
            <h2 className="text-xl font-medium text-foreground">Leasing Activity</h2>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 text-primary border-primary bg-transparent hover:bg-primary/10 hover:text-primary dark:bg-white/8 dark:border-white/25 dark:text-white dark:hover:bg-white/15">
            View All Deals
          </Button>
        </div>

        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-3">Active Deals</p>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-border/60">
              <Th col="tenant">Tenant</Th>
              <Th col="space" className="pl-3">Space</Th>
              <Th col="stage" className="pl-3">Stage</Th>
              <Th col="status" className="pl-3">Status</Th>
              <Th col="baseRent" right>Base Rent / Budget</Th>
              <th className="pb-2 pl-2 w-8" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((d, i) => (
              <tr key={i} className={cn("cursor-pointer hover:bg-muted/40 dark:hover:bg-white/4 transition-colors", i > 0 && "border-t border-border/40")}>
                <td className="py-2.5 font-medium text-foreground text-sm whitespace-nowrap">{d.tenant}</td>
                <td className="py-2.5 pl-3 text-sm text-muted-foreground whitespace-nowrap">
                  <div>{d.space}</div>
                  <div className="text-[10px]">{fmtSf(d.sf)}</div>
                </td>
                <td className="py-2.5 pl-3 whitespace-nowrap">
                  <div className="flex gap-1">
                    {STAGE_ORDER.map(s => (
                      <span key={s} className={cn(
                        "h-1.5 w-5 rounded-full transition-colors",
                        STAGE_ORDER.indexOf(s) <= STAGE_ORDER.indexOf(d.stage)
                          ? "bg-primary"
                          : "bg-muted-foreground/20"
                      )} />
                    ))}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{d.stage}</div>
                </td>
                <td className="py-2.5 pl-3">
                  <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", STATUS_PILL[d.status])}>
                    {STATUS_LABEL[d.status]}
                  </span>
                </td>
                <td className="py-2.5 pl-3">
                  <RentDelta base={d.baseRent} budget={d.budgetRent} />
                </td>
                <td className="py-2.5 pl-2 text-right whitespace-nowrap">
                  <Tooltip>
                    <TooltipTrigger render={<span />}>
                      <button
                        onClick={e => e.stopPropagation()}
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
                        <p className="text-sidebar-foreground/70 font-normal">Analyze this deal and suggest next steps</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
)
LeasingActivity.displayName = "LeasingActivity"

export { LeasingActivity }
export type { LeasingActivityProps }
