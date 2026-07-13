import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock } from "lucide-react"

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
  dueBy: string
}

interface LeasingActivityProps {
  deals: Deal[]
  decisions: DecisionItem[]
  className?: string
}

const STAGE_ORDER = ["Proposal", "LOI", "Lease Out", "Executed"] as const

const STATUS_PILL: Record<Deal["status"], string> = {
  active:   "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
  stalled:  "bg-orange-500/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
  "at-risk": "bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
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
      <div className={cn("text-[10px] font-semibold", over ? "text-emerald-500" : "text-rose-500")}>
        {over ? "+" : ""}{pct}% vs ${budget.toFixed(2)}
      </div>
    </div>
  )
}

const LeasingActivity = React.forwardRef<HTMLDivElement, LeasingActivityProps>(
  ({ deals, decisions, className }, ref) => {
    const atRisk = deals.filter(d => d.status === "stalled" || d.status === "at-risk")
    const active = deals.filter(d => d.status === "active")

    return (
      <div ref={ref} className={cn(cardBase, className)}>
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 mb-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Pipeline</p>
            <h2 className="text-xl font-semibold text-foreground">Leasing Activity</h2>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 text-primary border-primary bg-transparent hover:bg-primary/10 hover:text-primary dark:bg-white/8 dark:border-white/25 dark:text-white dark:hover:bg-white/15">
            View All Deals
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Active Deals Table */}
          <div className="lg:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Active Deals</p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-border/60">
                  <th className="pb-2 text-left text-[10px] font-bold uppercase tracking-widest text-foreground/50">Tenant</th>
                  <th className="pb-2 pl-3 text-left text-[10px] font-bold uppercase tracking-widest text-foreground/50">Space</th>
                  <th className="pb-2 pl-3 text-left text-[10px] font-bold uppercase tracking-widest text-foreground/50">Stage</th>
                  <th className="pb-2 pl-3 text-left text-[10px] font-bold uppercase tracking-widest text-foreground/50">Status</th>
                  <th className="pb-2 pl-3 text-right text-[10px] font-bold uppercase tracking-widest text-foreground/50">Base Rent / Budget</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((d, i) => (
                  <tr key={i} className={cn("cursor-pointer hover:bg-muted/40 dark:hover:bg-white/4 transition-colors", i > 0 && "border-t border-border/40")}>
                    <td className="py-2.5 font-semibold text-foreground text-sm whitespace-nowrap">{d.tenant}</td>
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
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold", STATUS_PILL[d.status])}>
                        {STATUS_LABEL[d.status]}
                      </span>
                    </td>
                    <td className="py-2.5 pl-3">
                      <RentDelta base={d.baseRent} budget={d.budgetRent} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right: At Risk + Decisions */}
          <div className="flex flex-col gap-5">

            {/* Stalled & At Risk */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Stalled & At Risk</p>
              {atRisk.length === 0 ? (
                <p className="text-sm text-muted-foreground">No deals at risk</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {atRisk.map((d, i) => (
                    <div key={i} className={cn(
                      "flex items-start gap-2.5 rounded-lg p-3",
                      d.status === "at-risk" ? "bg-rose-500/8 border border-rose-500/20" : "bg-orange-500/8 border border-orange-500/20"
                    )}>
                      <AlertTriangle className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", d.status === "at-risk" ? "text-rose-500" : "text-orange-500")} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{d.tenant}</p>
                        <p className="text-xs text-muted-foreground">{d.space} · {d.stage}</p>
                        {d.note && <p className="text-xs text-muted-foreground mt-0.5">{d.note}</p>}
                        {d.stalledDays && <p className="text-[10px] font-semibold text-orange-500 mt-0.5">No activity in {d.stalledDays}d</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="h-px bg-border/50" />

            {/* Decisions Needed Today */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Decisions Needed Today</p>
              {decisions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No decisions pending</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {decisions.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-lg bg-primary/6 border border-primary/15 p-3">
                      <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{item.tenant}</p>
                        <p className="text-xs text-muted-foreground">{item.action}</p>
                        <p className="text-[10px] font-semibold text-primary mt-0.5">Due {item.dueBy}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    )
  }
)
LeasingActivity.displayName = "LeasingActivity"

export { LeasingActivity }
export type { LeasingActivityProps }
