import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Table, TableHeader, TableBody, TableRow, TableCell,
  SortableHead, useSortState,
} from "@/components/sortable-table"
import { TenantAvatar, type Deal } from "@/components/deals-page"
import { getDealHealth, getLatestHumanUpdate } from "@/components/deal-profile"
import { AgentBtn } from "@/components/agent-btn"

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
  onHealthClick?: (dealId: string) => void
  className?: string
}

type SortKey = "tenant" | "asset" | "stage" | "status" | "ner" | "update" | "lastUpdated"

const STAGE_ORDER = ["Inquiry", "Touring", "Proposal", "LOI", "Legal", "Lease Out", "Executed"] as const
type Stage = typeof STAGE_ORDER[number]
const HEALTH_RANK: Record<string, number> = { "at-risk": 0, "caution": 1, "on-track": 2, "strong": 3 }

const LeasingActivity = React.forwardRef<HTMLDivElement, LeasingActivityProps>(
  ({ deals, onViewAll, onDealClick, onHealthClick, className }, ref) => {
    const { sortKey, sortDir, handleSort } = useSortState<SortKey>("status")

    const priority = deals.filter(d => {
      const score = getDealHealth(d.id, d.stage as any).score
      return score === "at-risk" || score === "caution"
    })

    const sorted = [...priority].sort((a, b) => {
      let av: string | number
      let bv: string | number
      if (sortKey === "stage") {
        av = STAGE_ORDER.indexOf(a.stage as Stage)
        bv = STAGE_ORDER.indexOf(b.stage as Stage)
      } else if (sortKey === "status") {
        av = HEALTH_RANK[getDealHealth(a.id, a.stage as any).score] ?? 2
        bv = HEALTH_RANK[getDealHealth(b.id, b.stage as any).score] ?? 2
      } else if (sortKey === "ner") {
        av = a.ner; bv = b.ner
      } else if (sortKey === "update") {
        av = a.lastUpdated; bv = b.lastUpdated
      } else if (sortKey === "lastUpdated") {
        av = a.lastUpdated; bv = b.lastUpdated
      } else {
        av = (a[sortKey as keyof Deal] as string | number).toString().toLowerCase()
        bv = (b[sortKey as keyof Deal] as string | number).toString().toLowerCase()
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === "asc" ? cmp : -cmp
    })

    return (
      <div ref={ref} className={cn(cardBase, className)}>
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 mb-6">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">Need attention</p>
            <h2 className="text-xl font-semibold text-foreground">{priority.length} deals</h2>
          </div>
          <Button variant="outline" size="sm" className="shrink-0" onClick={onViewAll}>
            View deals
          </Button>
        </div>

        <Table className="border-collapse">
          <TableHeader>
            <TableRow className="border-b border-border/60 hover:bg-transparent">
              <SortableHead col="tenant" sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Tenant</SortableHead>
              <SortableHead col="asset" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pl-4">Asset</SortableHead>
              <SortableHead col="stage" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pl-4">Stage</SortableHead>
              <SortableHead col="status" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pl-4">Health</SortableHead>
              <SortableHead col="update" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} className="pl-4">Latest update</SortableHead>
              <SortableHead col="ner" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} right className="pl-4">NER / budget</SortableHead>
              <SortableHead col="lastUpdated" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} right className="pl-4">Updated</SortableHead>
              <th className="w-[40px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((d, i) => {
              const healthCfg = getDealHealth(d.id, d.stage as any)
              const update = getLatestHumanUpdate(d.id, d.stage)
              const today = new Date()
              const last = new Date(d.lastUpdated)
              const days = Math.floor((today.getTime() - last.getTime()) / 86400000)
              const stale = days > 14
              const nerDiff = d.ner - d.budgetNer
              const nerPct = d.budgetNer > 0 ? Math.round((nerDiff / d.budgetNer) * 100) : 0

              return (
                <TableRow
                  key={d.id}
                  className={cn("cursor-pointer hover:bg-muted/40 transition-colors", i > 0 ? "border-t border-border/40" : "border-0")}
                  onClick={() => onDealClick?.(d)}
                >
                  {/* Tenant + deal type */}
                  <TableCell className="py-3 w-[120px]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <TenantAvatar name={d.tenant} />
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-sm font-medium text-foreground truncate">{d.tenant}</span>
                        <span className="inline-flex self-start items-center rounded px-1.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground">{d.dealType}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Asset */}
                  <TableCell className="py-3 pl-4 text-sm text-foreground/80 w-[110px]">
                    <span className="truncate block">{d.asset}</span>
                  </TableCell>

                  {/* Stage — static pill */}
                  <TableCell className="py-3 pl-4 w-[120px]">
                    <span className="inline-flex items-center rounded-md border border-border/60 bg-background px-2.5 py-1 text-sm text-foreground whitespace-nowrap">
                      {d.stage}
                    </span>
                  </TableCell>

                  {/* Health badge */}
                  <TableCell className="py-3 pl-4 w-[96px]" onClick={e => { e.stopPropagation(); onHealthClick?.(d.id) }}>
                    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity", healthCfg.cls)}>
                      {healthCfg.label}
                    </span>
                  </TableCell>

                  {/* Latest update */}
                  <TableCell className="py-3 pl-4 w-[180px] max-w-[180px]">
                    {update ? (
                      <div className="flex flex-col gap-0.5 max-w-[164px]">
                        <div className="flex items-baseline justify-between gap-1">
                          <span className="text-xs font-semibold text-foreground truncate">{update.name}</span>
                          <span className="text-[10px] text-muted-foreground shrink-0">{update.timestamp}</span>
                        </div>
                        <span className="text-xs text-muted-foreground line-clamp-2 leading-snug whitespace-normal">{update.message}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </TableCell>

                  {/* NER / budget */}
                  <TableCell className="py-3 pl-4 text-right tabular-nums whitespace-nowrap w-[108px]">
                    {d.ner > 0 ? (
                      <div className="text-right tabular-nums">
                        <div className="text-sm font-medium text-foreground">${d.ner.toFixed(2)}</div>
                        <div className={cn("text-[10px] font-medium", nerDiff >= 0 ? "text-success" : "text-destructive")}>
                          {nerDiff >= 0 ? "+" : ""}{nerPct}% vs ${d.budgetNer.toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/50 text-xs">—</span>
                    )}
                  </TableCell>

                  {/* Updated */}
                  <TableCell className="py-3 pl-4 text-right whitespace-nowrap w-[80px]">
                    <span className={cn("text-xs tabular-nums", stale ? "text-warning font-medium" : "text-muted-foreground")}>
                      {days === 0 ? "Today" : days === 1 ? "1d ago" : `${days}d ago`}
                    </span>
                  </TableCell>

                  {/* Sparkle */}
                  <TableCell className="py-3 pl-2 w-[40px]" onClick={e => e.stopPropagation()}>
                    <AgentBtn entity="Deal" label={`${d.tenant} — ${d.dealType} · ${d.sf.toLocaleString()} sf, ${d.space} at ${d.asset} · stage: ${d.stage}${d.note ? ` · ${d.note}` : ""}`} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    )
  }
)
LeasingActivity.displayName = "LeasingActivity"

export { LeasingActivity }
export type { LeasingActivityProps }
