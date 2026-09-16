import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { CalendarClock, RefreshCw, ShieldAlert, Sparkle } from "lucide-react"
import { AgentBtn } from "@/components/agent-btn"
import type { CriticalDate } from "@/components/critical-dates"
import type { Deal } from "@/components/deals-page"

interface DateStep {
  icon: React.ElementType
  title: string
  description: string
  count: number
  names?: string
  agentLabel: string
}

interface ActionLeversProps {
  deals?: Deal[]
  criticalDates?: CriticalDate[]
  onNavigate?: (page: string) => void
  className?: string
}

const ActionLevers = React.forwardRef<HTMLDivElement, ActionLeversProps>(
  ({ criticalDates, className }, ref) => {
    const steps = React.useMemo((): DateStep[] => {
      const dates = criticalDates ?? []

      const expiring = dates.filter(d => d.category === "expiring" && d.monthsOut <= 12)
      const expiringNames = expiring.map(d => d.tenant).slice(0, 3).join(", ")

      const renewals = dates.filter(d => d.category === "renewal" && d.monthsOut <= 9)
      const renewalNames = renewals.map(d => d.tenant).slice(0, 3).join(", ")

      const options = dates.filter(d => d.category === "options" && d.monthsOut <= 6)
      const optionNames = options.map(d => d.tenant).slice(0, 3).join(", ")

      return [
        {
          icon: CalendarClock,
          title: "Leases expiring within 12 months",
          description: expiring.length > 0
            ? `${expiring.length} lease${expiring.length > 1 ? "s" : ""} — start renewal discussions now`
            : "No leases expiring in 12 months",
          count: expiring.length,
          names: expiringNames || undefined,
          agentLabel: `Leases expiring in 12 months · ${expiringNames}`,
        },
        {
          icon: RefreshCw,
          title: "Renewal windows closing soon",
          description: renewals.length > 0
            ? `${renewals.length} renewal${renewals.length > 1 ? "s" : ""} — send opening proposals`
            : "No renewal windows closing soon",
          count: renewals.length,
          names: renewalNames || undefined,
          agentLabel: `Renewal windows closing · ${renewalNames}`,
        },
        {
          icon: ShieldAlert,
          title: "Options and rights expiring",
          description: options.length > 0
            ? `${options.length} option${options.length > 1 ? "s" : ""} expiring — exercise or waive decisions needed`
            : "No options expiring in 6 months",
          count: options.length,
          names: optionNames || undefined,
          agentLabel: `Options expiring · ${optionNames}`,
        },
      ]
    }, [criticalDates])

    const totalItems = steps.reduce((s, step) => s + step.count, 0)

    return (
      <div ref={ref} className={cn(cardBase, "border-transparent flex flex-col gap-4 bg-sidebar-accent", className)}>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest mb-1 text-sidebar-foreground/70">VTS agents</p>
          <h2 className="text-xl font-semibold text-sidebar-foreground">Date actions</h2>
        </div>

        <div className="rounded-lg px-3 py-2 flex items-center gap-2 bg-sidebar-foreground/10">
          <Sparkle className="h-4 w-4 shrink-0 text-sidebar-primary" />
          <p className="text-sm leading-snug text-sidebar-foreground/70">
            {totalItems > 0
              ? <><span className="text-sidebar-primary font-medium">{totalItems} critical date{totalItems > 1 ? "s" : ""}</span> need attention</>
              : "No urgent critical dates"}
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
ActionLevers.displayName = "ActionLevers"

export { ActionLevers }
export type { ActionLeversProps }
