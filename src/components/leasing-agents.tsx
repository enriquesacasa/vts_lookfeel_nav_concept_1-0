import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, Sparkle } from "lucide-react"
import type { Deal, DecisionItem } from "@/components/leasing-activity"

interface LeasingAgentsProps {
  deals: Deal[]
  decisions: DecisionItem[]
  className?: string
}

const LeasingAgents = React.forwardRef<HTMLDivElement, LeasingAgentsProps>(
  ({ deals, decisions, className }, ref) => {
    const atRisk = deals.filter(d => d.status === "stalled" || d.status === "at-risk")

    return (
      <div
        ref={ref}
        className={cn(cardBase, "border-transparent flex flex-col gap-4 bg-sidebar-accent", className)}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest mb-1 text-sidebar-foreground/70">VTS Agents</p>
            <h2 className="text-xl font-semibold text-sidebar-foreground">Leasing actions</h2>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 text-white/80 border-white/25 bg-transparent hover:bg-white/10 hover:text-white dark:bg-white/8 dark:border-white/25 dark:text-white dark:hover:bg-white/15">
            View active agents
          </Button>
        </div>

        {/* Summary bar */}
        <div className="rounded-lg px-3 py-2 flex items-center gap-2 bg-sidebar-foreground/10">
          <Sparkle fill="currentColor" className="h-4 w-4 shrink-0 text-sidebar-primary" />
          <p className="text-sm leading-snug text-sidebar-foreground/70">
            {atRisk.length} deal{atRisk.length !== 1 ? "s" : ""} need attention +{" "}
            <span className="text-sidebar-primary font-medium">{decisions.length} approval{decisions.length !== 1 ? "s" : ""} pending</span>
          </p>
        </div>

        {/* Stalled & At Risk */}
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest mb-2 text-sidebar-foreground/50">Stalled &amp; At Risk</p>
          {atRisk.length === 0 ? (
            <p className="text-sm text-sidebar-foreground/40">No deals at risk</p>
          ) : (
            <div className="flex flex-col gap-2">
              {atRisk.map((d, i) => (
                <div key={i} className={cn(
                  "flex items-start gap-2.5 rounded-lg p-3 group/row",
                  "bg-primary/15 border border-primary/25"
                )}>
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-sidebar-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-sidebar-foreground/90">{d.tenant}</p>
                      <button className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-sm font-medium opacity-0 group-hover/row:opacity-100 transition-all bg-sidebar-foreground/10 hover:bg-sidebar-foreground/20 text-sidebar-foreground/80 shrink-0">
                        <Sparkle fill="currentColor" className="h-3 w-3" />
                        Run agent
                      </button>
                    </div>
                    <p className="text-sm text-sidebar-foreground/55">{d.space} · {d.stage}</p>
                    {d.note && <p className="text-sm text-sidebar-foreground/45 mt-0.5">{d.note}</p>}
                    {d.stalledDays && <p className="text-sm font-medium text-sidebar-primary mt-0.5">No activity in {d.stalledDays}d</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approvals needed */}
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest mb-2 text-sidebar-foreground/50">Approvals needed</p>
          {decisions.length === 0 ? (
            <p className="text-sm text-sidebar-foreground/40">No approvals pending</p>
          ) : (
            <div className="flex flex-col gap-2">
              {decisions.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg bg-primary/15 border border-primary/25 p-3 group/row">
                  <Clock className="h-4 w-4 mt-0.5 shrink-0 text-sidebar-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-sidebar-foreground/90">{item.tenant}</p>
                      <button className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-sm font-medium opacity-0 group-hover/row:opacity-100 transition-all bg-sidebar-foreground/10 hover:bg-sidebar-foreground/20 text-sidebar-foreground/80 shrink-0">
                        <Sparkle fill="currentColor" className="h-3 w-3" />
                        Run agent
                      </button>
                    </div>
                    <p className="text-sm text-sidebar-foreground/55">{item.action}</p>
                    <p className="text-sm font-medium text-sidebar-primary mt-0.5">In approval for {item.inApprovalFor}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
)
LeasingAgents.displayName = "LeasingAgents"

export { LeasingAgents }
export type { LeasingAgentsProps }
