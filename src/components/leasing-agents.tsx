import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, Sparkles } from "lucide-react"
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
        className={cn(cardBase, "border-transparent flex flex-col gap-4 bg-[oklch(0.22_0.18_278)]", className)}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1 text-white/70">VTS Agents</p>
            <h2 className="text-xl font-semibold text-white/95">Leasing Actions</h2>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 text-white/80 border-white/25 bg-transparent hover:bg-white/10 hover:text-white dark:bg-white/8 dark:border-white/25 dark:text-white dark:hover:bg-white/15">
            View Active Agents
          </Button>
        </div>

        {/* Summary bar */}
        <div className="rounded-lg px-3 py-2 flex items-center gap-2 bg-white/10">
          <Sparkles className="h-4 w-4 shrink-0 text-violet-400" />
          <p className="text-sm leading-snug text-white/70">
            {atRisk.length} deal{atRisk.length !== 1 ? "s" : ""} need attention +{" "}
            <span className="text-violet-400 font-semibold">{decisions.length} approval{decisions.length !== 1 ? "s" : ""} pending</span>
          </p>
        </div>

        {/* Stalled & At Risk */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2 text-white/50">Stalled &amp; At Risk</p>
          {atRisk.length === 0 ? (
            <p className="text-sm text-white/40">No deals at risk</p>
          ) : (
            <div className="flex flex-col gap-2">
              {atRisk.map((d, i) => (
                <div key={i} className={cn(
                  "flex items-start gap-2.5 rounded-lg p-3 group/row",
                  d.status === "at-risk"
                    ? "bg-rose-400/15 border border-rose-400/25"
                    : "bg-orange-400/15 border border-orange-400/25"
                )}>
                  <AlertTriangle className={cn("h-4 w-4 mt-0.5 shrink-0", d.status === "at-risk" ? "text-rose-300" : "text-orange-300")} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-white/90">{d.tenant}</p>
                      <button className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-sm font-semibold opacity-0 group-hover/row:opacity-100 transition-all bg-white/10 hover:bg-white/20 text-white/80 shrink-0">
                        <Sparkles className="h-3 w-3" />
                        Run Agent
                      </button>
                    </div>
                    <p className="text-sm text-white/55">{d.space} · {d.stage}</p>
                    {d.note && <p className="text-sm text-white/45 mt-0.5">{d.note}</p>}
                    {d.stalledDays && <p className="text-sm font-semibold text-orange-300 mt-0.5">No activity in {d.stalledDays}d</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approvals Needed */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2 text-white/50">Approvals Needed</p>
          {decisions.length === 0 ? (
            <p className="text-sm text-white/40">No approvals pending</p>
          ) : (
            <div className="flex flex-col gap-2">
              {decisions.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-lg bg-violet-400/15 border border-violet-400/25 p-3 group/row">
                  <Clock className="h-4 w-4 mt-0.5 shrink-0 text-violet-300" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-white/90">{item.tenant}</p>
                      <button className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-sm font-semibold opacity-0 group-hover/row:opacity-100 transition-all bg-white/10 hover:bg-white/20 text-white/80 shrink-0">
                        <Sparkles className="h-3 w-3" />
                        Run Agent
                      </button>
                    </div>
                    <p className="text-sm text-white/55">{item.action}</p>
                    <p className="text-sm font-semibold text-violet-300 mt-0.5">In approval for {item.inApprovalFor}</p>
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
