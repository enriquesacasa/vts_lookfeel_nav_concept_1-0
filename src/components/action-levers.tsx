import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { AlertTriangle, Zap, ShieldAlert, Sparkle, TrendingUp } from "lucide-react"
import { AgentBtn } from "@/components/agent-btn"
import type { CriticalDate } from "@/components/critical-dates"
import type { Deal } from "@/components/deals-page"
import { getDealHealth } from "@/components/deal-profile"

interface ActionItem {
  type: "risk" | "upside" | "ops"
  text: string
  value: string
  impact: string
  detail?: string
}

const CONFIG = {
  risk:   { icon: ShieldAlert   },
  upside: { icon: Zap           },
  ops:    { icon: AlertTriangle },
}

function fmt$(k: number) {
  return k >= 1000 ? `$${(k / 1000).toFixed(1)}M` : `$${Math.round(k)}K`
}

function ActionRow({ item, onRun, onNavigate }: { item: ActionItem; onRun: () => void; onNavigate?: () => void }) {
  const cfg = CONFIG[item.type]
  return (
    <div className="rounded-lg border border-primary/25 bg-primary/15 p-3 group/row agent-row cursor-pointer" onClick={onNavigate}>
      <div className="flex items-start gap-2.5">
        <cfg.icon className="h-4 w-4 mt-0.5 shrink-0 text-sidebar-primary" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm leading-snug text-sidebar-foreground/85">{item.text}</p>
            <span className="text-sm font-medium tabular-nums shrink-0 text-sidebar-primary">{item.value}</span>
          </div>
          <div className="flex items-center justify-between mt-1.5 gap-2">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 shrink-0 text-sidebar-foreground/50" />
              <span className="text-sm text-sidebar-foreground/60">{item.impact}</span>
            </div>
            <AgentBtn variant="run" label={`${item.text} · ${item.value} · ${item.impact}${item.detail ? ` · ${item.detail}` : ""}`} onClick={e => { e.stopPropagation(); onRun() }} className="opacity-0 group-hover/row:opacity-100" />
          </div>
          {item.detail && (
            <p className="text-sm mt-0.5 text-sidebar-foreground/50">{item.detail}</p>
          )}
        </div>
      </div>
    </div>
  )
}

const AVG_RENT_PSF = 52

interface ActionLeversProps {
  deals?: Deal[]
  criticalDates?: CriticalDate[]
  onNavigate?: (page: string) => void
  className?: string
}

const ActionLevers = React.forwardRef<HTMLDivElement, ActionLeversProps>(
  ({ deals, criticalDates, onNavigate, className }, ref) => {
    const PAGE_MAP: Record<ActionItem["type"], string> = {
      risk: "leases",
      upside: "deals",
      ops: "leases",
    }

    const actions = React.useMemo((): ActionItem[] => {
      // Row 1 — expiring leases < 12 mo
      const expiring = (criticalDates ?? []).filter(d => d.category === "expiring" && d.monthsOut <= 12)
      const expiringRentMonthlyK = expiring.reduce((s, d) => s + (d.sf * AVG_RENT_PSF) / 1000 / 12, 0)
      const expiringNerK = expiring.reduce((s, d) => s + (d.sf * AVG_RENT_PSF) / 1000, 0)
      const expiringNames = expiring.map(d => d.tenant).join(" · ")

      // Row 2 — late-stage deals (Lease Out+)
      const CREDIBLE = new Set(["Lease Out", "Executed"])
      const lateDeals = (deals ?? []).filter(d => CREDIBLE.has(d.stage))
      const lateMonthlyK = lateDeals.reduce((s, d) => s + (d.sf * d.ner) / 1000 / 12, 0)
      const lateNerK = lateDeals.reduce((s, d) => s + (d.sf * d.ner) / 1000, 0)
      const lateNames = lateDeals.map(d => d.tenant).slice(0, 3).join(" · ")

      // Row 3 — at-risk deals (stalled / at-risk health)
      const atRisk = (deals ?? []).filter(d => getDealHealth(d.id, d.stage as any).score === "at-risk")
      const atRiskNerK = atRisk.reduce((s, d) => s + (d.sf * d.budgetNer) / 1000, 0)
      const atRiskNames = atRisk.map(d => d.tenant).slice(0, 3).join(" · ")

      return [
        {
          type: "risk",
          text: "Leases expiring in < 12 mo",
          value: expiringRentMonthlyK > 0 ? `${fmt$(expiringRentMonthlyK)}/mo` : "—",
          impact: expiringNerK > 0 ? `−${fmt$(expiringNerK)} NER exposure` : "No expirations",
          detail: expiringNames || undefined,
        },
        {
          type: "upside",
          text: "Late-stage deals — projected NER if executed",
          value: lateMonthlyK > 0 ? `+${fmt$(lateMonthlyK)}/mo` : "—",
          impact: lateNerK > 0 ? `+${fmt$(lateNerK)} projected NER` : "No late-stage deals",
          detail: lateNames || undefined,
        },
        {
          type: "ops",
          text: "At-risk deals requiring attention",
          value: atRisk.length > 0 ? `${atRisk.length} deal${atRisk.length > 1 ? "s" : ""}` : "—",
          impact: atRiskNerK > 0 ? `${fmt$(atRiskNerK)} NER at risk` : "No at-risk deals",
          detail: atRiskNames || undefined,
        },
      ]
    }, [deals, criticalDates])

    const upside = actions.find(a => a.type === "upside")
    const upsideVal = upside?.value ?? "—"

    return (
      <div
        ref={ref}
        className={cn(cardBase, "border-transparent flex flex-col gap-4 bg-sidebar-accent", className)}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest mb-1 text-sidebar-foreground/70">VTS agents</p>
            <h2 className="text-xl font-semibold text-sidebar-foreground">Financial levers</h2>
          </div>
        </div>

        {/* Summary bar */}
        <div className="rounded-lg px-3 py-2 flex items-center gap-2 bg-sidebar-foreground/10">
          <Sparkle className="h-4 w-4 shrink-0 text-sidebar-primary" />
          <p className="text-sm leading-snug text-sidebar-foreground/70">
            {actions.length} financial improvements identified: <span className="text-sidebar-primary font-medium">{upsideVal} upside</span>
          </p>
        </div>

        {/* Action items */}
        <div className="flex flex-col gap-2">
          {actions.map((item, i) => (
            <ActionRow key={i} item={item} onRun={() => {}} onNavigate={onNavigate ? () => onNavigate(PAGE_MAP[item.type]) : undefined} />
          ))}
        </div>

      </div>
    )
  }
)
ActionLevers.displayName = "ActionLevers"

export { ActionLevers }
export type { ActionLeversProps }
