import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { MessageSquare, Rocket, AlertTriangle, Sparkle } from "lucide-react"
import { AgentBtn } from "@/components/agent-btn"
import type { Deal } from "@/components/deals-page"
import { getDealHealth } from "@/components/deal-profile"

interface DealStep {
  icon: React.ElementType
  title: string
  description: string
  count: number
  names?: string
  agentLabel: string
}

interface DealActionsProps {
  deals?: Deal[]
  onDealClick?: (deal: Deal) => void
  className?: string
}

const DealActions = React.forwardRef<HTMLDivElement, DealActionsProps>(
  ({ deals, className }, ref) => {
    const steps = React.useMemo((): DealStep[] => {
      const allDeals = deals ?? []

      const stalled = allDeals.filter(d => getDealHealth(d.id, d.stage as any).score === "at-risk")
      const stalledNames = stalled.map(d => d.tenant).slice(0, 3).join(", ")

      const caution = allDeals.filter(d => getDealHealth(d.id, d.stage as any).score === "caution")
      const cautionNames = caution.map(d => d.tenant).slice(0, 3).join(", ")

      const lateStagePending = allDeals.filter(d => ["LOI", "Legal", "Lease Out"].includes(d.stage))
      const lateNames = lateStagePending.map(d => d.tenant).slice(0, 3).join(", ")

      return [
        {
          icon: MessageSquare,
          title: "Re-engage stalled deals",
          description: stalled.length > 0
            ? `${stalled.length} deal${stalled.length > 1 ? "s" : ""} with no recent progress`
            : "No stalled deals",
          count: stalled.length,
          names: stalledNames || undefined,
          agentLabel: `Re-engage stalled deals · ${stalledNames}`,
        },
        {
          icon: AlertTriangle,
          title: "Address deals at risk",
          description: caution.length > 0
            ? `${caution.length} deal${caution.length > 1 ? "s" : ""} showing early warning signals`
            : "No deals showing risk signals",
          count: caution.length,
          names: cautionNames || undefined,
          agentLabel: `Address deals at risk · ${cautionNames}`,
        },
        {
          icon: Rocket,
          title: "Accelerate to close",
          description: lateStagePending.length > 0
            ? `${lateStagePending.length} deal${lateStagePending.length > 1 ? "s" : ""} in LOI or later — push to execution`
            : "No late-stage deals pending",
          count: lateStagePending.length,
          names: lateNames || undefined,
          agentLabel: `Accelerate to close · ${lateNames}`,
        },
      ]
    }, [deals])

    const totalDeals = steps.reduce((s, step) => s + step.count, 0)

    return (
      <div ref={ref} className={cn(cardBase, "border-transparent flex flex-col gap-4 bg-sidebar-accent", className)}>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest mb-1 text-sidebar-foreground/70">VTS agents</p>
          <h2 className="text-xl font-semibold text-sidebar-foreground">Deal actions</h2>
        </div>

        <div className="rounded-lg px-3 py-2 flex items-center gap-2 bg-sidebar-foreground/10">
          <Sparkle className="h-4 w-4 shrink-0 text-sidebar-primary" />
          <p className="text-sm leading-snug text-sidebar-foreground/70">
            {totalDeals > 0
              ? <><span className="text-sidebar-primary font-medium">{totalDeals} deal{totalDeals > 1 ? "s" : ""}</span> need action across 3 steps</>
              : "Pipeline is on track"}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {steps.map((step, i) => (
            <div key={i} className="rounded-lg border border-primary/25 bg-primary/15 p-3 group/row agent-row">
              <div className="flex items-start gap-2.5">
                <step.icon className="h-4 w-4 mt-0.5 shrink-0 text-sidebar-primary" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-snug text-sidebar-foreground/90">{step.title}</p>
                    {step.count > 0 && (
                      <span className="text-sm font-medium tabular-nums shrink-0 text-sidebar-primary">{step.count}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1 gap-2">
                    <p className="text-sm text-sidebar-foreground/60 leading-snug">{step.description}</p>
                    {step.count > 0 && (
                      <AgentBtn variant="run" label={step.agentLabel} onClick={e => e.stopPropagation()} className="opacity-0 group-hover/row:opacity-100 shrink-0" />
                    )}
                  </div>
                  {step.names && (
                    <p className="text-xs mt-0.5 text-sidebar-foreground/45 truncate">{step.names}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
)
DealActions.displayName = "DealActions"

export { DealActions }
export type { DealActionsProps }
