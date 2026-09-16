import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { TrendingUp, TrendingDown, Zap, Sparkle } from "lucide-react"
import { AgentBtn } from "@/components/agent-btn"
import type { CriticalDate } from "@/components/critical-dates"
import type { Deal } from "@/components/deals-page"

interface RentItem {
  type: "push" | "recover" | "optimize"
  text: string
  value: string
  impact: string
  detail?: string
}

const CONFIG = {
  push:     { icon: TrendingUp  },
  recover:  { icon: TrendingDown },
  optimize: { icon: Zap         },
}

function fmt$(k: number) {
  return k >= 1000 ? `$${(k / 1000).toFixed(1)}M` : `$${Math.round(k)}K`
}

function RentRow({ item, onRun }: { item: RentItem; onRun: () => void }) {
  const cfg = CONFIG[item.type]
  return (
    <div className="rounded-lg border border-primary/25 bg-primary/15 p-3 group/row agent-row">
      <div className="flex items-start gap-2.5">
        <cfg.icon className="h-4 w-4 mt-0.5 shrink-0 text-sidebar-primary" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm leading-snug text-sidebar-foreground/85">{item.text}</p>
            <span className="text-sm font-medium tabular-nums shrink-0 text-sidebar-primary">{item.value}</span>
          </div>
          <div className="flex items-center justify-between mt-1.5 gap-2">
            <span className="text-sm text-sidebar-foreground/60">{item.impact}</span>
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

const MARKET_RENT_PSF = 58
const AVG_RENT_PSF = 52

interface RentLeversProps {
  deals?: Deal[]
  criticalDates?: CriticalDate[]
  className?: string
}

const RentLevers = React.forwardRef<HTMLDivElement, RentLeversProps>(
  ({ deals, criticalDates, className }, ref) => {
    const items = React.useMemo((): RentItem[] => {
      // Below-market leases expiring — rent push opportunity
      const expiring = (criticalDates ?? []).filter(d => d.category === "expiring" && d.monthsOut <= 18)
      const belowMarket = expiring.filter(_d => AVG_RENT_PSF < MARKET_RENT_PSF)
      const pushUpsideK = belowMarket.reduce((s, d) => s + (d.sf * (MARKET_RENT_PSF - AVG_RENT_PSF)) / 1000, 0)
      const pushNames = belowMarket.map(d => d.tenant).slice(0, 3).join(" · ")

      // Active deals with NER below budget — recovery potential
      const belowBudget = (deals ?? []).filter(d => d.ner > 0 && d.ner < d.budgetNer)
      const recoveryK = belowBudget.reduce((s, d) => s + (d.sf * (d.budgetNer - d.ner)) / 1000, 0)
      const belowBudgetNames = belowBudget.map(d => d.tenant).slice(0, 3).join(" · ")

      // Renewal window leases — free rent / concession reduction opportunity
      const renewalWindow = (criticalDates ?? []).filter(d => d.category === "renewal" && d.monthsOut <= 12)
      const concessionUpsideK = renewalWindow.reduce((s, d) => s + (d.sf * 4) / 1000, 0)
      const renewalNames = renewalWindow.map(d => d.tenant).slice(0, 3).join(" · ")

      return [
        {
          type: "push",
          text: "Below-market leases expiring — push to market rent",
          value: pushUpsideK > 0 ? `+${fmt$(pushUpsideK)} NER` : "—",
          impact: belowMarket.length > 0 ? `${belowMarket.length} lease${belowMarket.length > 1 ? "s" : ""} at $${AVG_RENT_PSF}/sf vs $${MARKET_RENT_PSF}/sf market` : "No below-market expirations",
          detail: pushNames || undefined,
        },
        {
          type: "recover",
          text: "Active deals tracking below budget NER",
          value: recoveryK > 0 ? `${fmt$(recoveryK)} gap` : "—",
          impact: belowBudget.length > 0 ? `${belowBudget.length} deal${belowBudget.length > 1 ? "s" : ""} below budget` : "All deals at or above budget",
          detail: belowBudgetNames || undefined,
        },
        {
          type: "optimize",
          text: "Renewal windows open — reduce free rent concessions",
          value: concessionUpsideK > 0 ? `+${fmt$(concessionUpsideK)} NER` : "—",
          impact: renewalWindow.length > 0 ? `${renewalWindow.length} lease${renewalWindow.length > 1 ? "s" : ""} in renewal window` : "No active renewal windows",
          detail: renewalNames || undefined,
        },
      ]
    }, [deals, criticalDates])

    const totalUpsideK = items.reduce((s, item) => {
      const match = item.value.match(/\+([\d.]+)(K|M)/)
      if (!match) return s
      const n = parseFloat(match[1])
      return s + (match[2] === "M" ? n * 1000 : n)
    }, 0)

    return (
      <div ref={ref} className={cn(cardBase, "border-transparent flex flex-col gap-4 bg-sidebar-accent", className)}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest mb-1 text-sidebar-foreground/70">VTS agents</p>
            <h2 className="text-xl font-semibold text-sidebar-foreground">Rent levers</h2>
          </div>
        </div>

        <div className="rounded-lg px-3 py-2 flex items-center gap-2 bg-sidebar-foreground/10">
          <Sparkle className="h-4 w-4 shrink-0 text-sidebar-primary" />
          <p className="text-sm leading-snug text-sidebar-foreground/70">
            {items.length} rent opportunities identified:{" "}
            <span className="text-sidebar-primary font-medium">
              {totalUpsideK > 0 ? `+${fmt$(totalUpsideK)} NER upside` : "review needed"}
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {items.map((item, i) => (
            <RentRow key={i} item={item} onRun={() => {}} />
          ))}
        </div>
      </div>
    )
  }
)
RentLevers.displayName = "RentLevers"

export { RentLevers }
export type { RentLeversProps }
