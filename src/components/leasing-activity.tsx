import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AgentBtn } from "@/components/agent-btn"
import { TenantAvatar } from "@/components/tenant-avatar"
import {
  Table, TableHeader, TableBody, TableRow, TableCell, TableHead,
  SortableHead, useSortState,
} from "@/components/sortable-table"
import type { Deal } from "@/components/deals-page"

export type { Deal }

export interface DecisionItem {
  tenant: string
  action: string
  inApprovalFor: string
}

interface LeasingActivityProps {
  deals: Deal[]
  decisions?: DecisionItem[]
  onViewAll?: () => void
  onDealClick?: (deal: Deal) => void
  className?: string
}

type SortKey = "tenant" | "space" | "sf" | "stage" | "status" | "ner"

const STAGE_ORDER = ["Inquiry", "Touring", "Proposal", "LOI", "Legal", "Lease Out", "Executed"] as const
type Stage = typeof STAGE_ORDER[number]
const STATUS_ORDER: Array<Deal["status"]> = ["at-risk", "stalled", "active"]

const STATUS_PILL: Record<string, string> = {
  active:    "bg-success/10 text-success",
  stalled:   "bg-warning/10 text-warning",
  "at-risk": "bg-destructive/10 text-destructive",
  executed:  "bg-muted text-muted-foreground",
}

const STATUS_LABEL: Record<string, string> = {
  active:   "Active",
  stalled:  "Stalled",
  "at-risk":"At risk",
  executed: "Executed",
}

function fmtSf(n: number) { return `${(n / 1000).toFixed(0)}K sf` }

function RentDelta({ base, budget }: { base: number; budget: number }) {
  if (!base) return <div className="text-right text-sm text-muted-foreground tabular-nums">—</div>
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
  ({ deals, onViewAll, onDealClick, className }, ref) => {
    const { sortKey, sortDir, handleSort } = useSortState<SortKey>("status")

    const priority = deals.filter(d =>
      d.status === "at-risk" || d.status === "stalled"
    )

    const sorted = [...priority].sort((a, b) => {
      let av: string | number
      let bv: string | number
      if (sortKey === "stage") {
        av = STAGE_ORDER.indexOf(a.stage as Stage)
        bv = STAGE_ORDER.indexOf(b.stage as Stage)
      } else if (sortKey === "status") {
        av = STATUS_ORDER.indexOf(a.status as any)
        bv = STATUS_ORDER.indexOf(b.status as any)
      } else if (sortKey === "ner") {
        av = a.ner; bv = b.ner
      } else if (sortKey === "space") {
        av = a.space.toLowerCase(); bv = b.space.toLowerCase()
      } else {
        av = (a[sortKey] as string | number).toString().toLowerCase()
        bv = (b[sortKey] as string | number).toString().toLowerCase()
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      // default sort: at-risk/stalled first, then by stage descending
      if (sortKey === "tenant") {
        const urgencyA = STATUS_ORDER.indexOf(a.status as any)
        const urgencyB = STATUS_ORDER.indexOf(b.status as any)
        if (urgencyA !== urgencyB) return urgencyA - urgencyB
        return STAGE_ORDER.indexOf(b.stage as Stage) - STAGE_ORDER.indexOf(a.stage as Stage)
      }
      return sortDir === "asc" ? cmp : -cmp
    })

    return (
      <div ref={ref} className={cn(cardBase, className)}>
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 mb-6">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">Pipeline</p>
            <h2 className="text-xl font-semibold text-foreground">Priority deals</h2>
          </div>
          <Button variant="outline" size="sm" className="shrink-0" onClick={onViewAll}>
            View deals
          </Button>
        </div>

        <Table className="border-collapse">
          <TableHeader>
            <TableRow className="border-b-2 border-border/60 hover:bg-transparent">
              <SortableHead col="tenant" sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Tenant</SortableHead>
              <SortableHead col="space" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pl-3">Space</SortableHead>
              <SortableHead col="stage" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pl-3">Stage</SortableHead>
              <SortableHead col="status" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pl-3">Status</SortableHead>
              <SortableHead col="ner" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} right>NER / budget</SortableHead>
              <TableHead className="pb-2 pt-0 pl-2 w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((d, i) => (
              <TableRow key={d.id} className={cn("cursor-pointer hover:bg-muted/40 transition-colors", i > 0 ? "border-t border-border/40" : "border-0")} onClick={() => onDealClick?.(d)}>
                <TableCell className="py-2.5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <TenantAvatar name={d.tenant} />
                    <span className="text-sm font-medium text-foreground">{d.tenant}</span>
                  </div>
                </TableCell>
                <TableCell className="py-2.5 pl-3 text-sm text-muted-foreground whitespace-nowrap">
                  <div>{d.space}</div>
                  <div className="text-[10px]">{fmtSf(d.sf)}</div>
                </TableCell>
                <TableCell className="py-2.5 pl-3 whitespace-nowrap">
                  <div className="flex gap-1">
                    {STAGE_ORDER.map(s => (
                      <span key={s} className={cn(
                        "h-1.5 w-3 rounded-full transition-colors",
                        STAGE_ORDER.indexOf(s) <= STAGE_ORDER.indexOf(d.stage as Stage)
                          ? "bg-primary"
                          : "bg-muted-foreground/20"
                      )} />
                    ))}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{d.stage}</div>
                </TableCell>
                <TableCell className="py-2.5 pl-3">
                  <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", STATUS_PILL[d.status] ?? "bg-muted text-muted-foreground")}>
                    {STATUS_LABEL[d.status] ?? d.status}
                  </span>
                </TableCell>
                <TableCell className="py-2.5 pl-3">
                  <RentDelta base={d.ner} budget={d.budgetNer} />
                </TableCell>
                <TableCell className="py-2.5 pl-2 text-right whitespace-nowrap">
                  <AgentBtn entity="Deal" label={`${d.tenant} — ${d.stage} · ${d.sf.toLocaleString()} sf, ${d.space} · $${d.ner}/sf NER vs $${d.budgetNer}/sf budget · status: ${d.status}${d.stalledDays ? ` · stalled ${d.stalledDays} days` : ""}${d.note ? ` · ${d.note}` : ""}`} onClick={e => e.stopPropagation()} />
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
