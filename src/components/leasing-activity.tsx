import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AgentBtn } from "@/components/agent-btn"
import {
  Table, TableHeader, TableBody, TableRow, TableCell, TableHead,
  SortableHead, useSortState,
} from "@/components/sortable-table"

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
  "at-risk": "At risk",
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

const LeasingActivity = React.forwardRef<HTMLDivElement, LeasingActivityProps>(
  ({ deals, className }, ref) => {
    const { sortKey, sortDir, handleSort } = useSortState<SortKey>("tenant")

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

    return (
      <div ref={ref} className={cn(cardBase, className)}>
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 mb-6">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">Pipeline</p>
            <h2 className="text-xl font-semibold text-foreground">Leasing activity</h2>
          </div>
          <Button variant="outline" size="sm" className="shrink-0">
            View all deals
          </Button>
        </div>

        <p className="text-sm font-semibold text-foreground mb-3">Active Deals</p>
        <Table className="border-collapse">
          <TableHeader>
            <TableRow className="border-b-2 border-border/60 hover:bg-transparent">
              <SortableHead col="tenant" sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Tenant</SortableHead>
              <SortableHead col="space" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pl-3">Space</SortableHead>
              <SortableHead col="stage" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pl-3">Stage</SortableHead>
              <SortableHead col="status" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pl-3">Status</SortableHead>
              <SortableHead col="baseRent" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} right>Base rent / budget</SortableHead>
              <TableHead className="pb-2 pt-0 pl-2 w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((d, i) => (
              <TableRow key={i} className={cn("cursor-pointer hover:bg-muted/40 transition-colors", i > 0 ? "border-t border-border/40" : "border-0")}>
                <TableCell className="py-2.5 font-medium text-foreground text-sm whitespace-nowrap">{d.tenant}</TableCell>
                <TableCell className="py-2.5 pl-3 text-sm text-muted-foreground whitespace-nowrap">
                  <div>{d.space}</div>
                  <div className="text-[10px]">{fmtSf(d.sf)}</div>
                </TableCell>
                <TableCell className="py-2.5 pl-3 whitespace-nowrap">
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
                </TableCell>
                <TableCell className="py-2.5 pl-3">
                  <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", STATUS_PILL[d.status])}>
                    {STATUS_LABEL[d.status]}
                  </span>
                </TableCell>
                <TableCell className="py-2.5 pl-3">
                  <RentDelta base={d.baseRent} budget={d.budgetRent} />
                </TableCell>
                <TableCell className="py-2.5 pl-2 text-right whitespace-nowrap">
                  <AgentBtn entity="Deal" label={`${d.tenant} — ${d.stage} · ${d.sf.toLocaleString()} sf, ${d.space} · $${d.baseRent}/sf base vs $${d.budgetRent}/sf budget · status: ${d.status}${d.stalledDays ? ` · stalled ${d.stalledDays} days` : ""}${d.note ? ` · ${d.note}` : ""}`} onClick={e => e.stopPropagation()} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }
)
LeasingActivity.displayName = "LeasingActivity"

export { LeasingActivity }
export type { LeasingActivityProps }
