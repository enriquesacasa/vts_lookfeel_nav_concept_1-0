import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Zap, ShieldAlert, Sparkles, TrendingUp } from "lucide-react"

interface ActionItem {
  type: "risk" | "upside" | "ops"
  text: string
  value: string
  impact: string
  detail?: string
}

const ACTIONS: ActionItem[] = [
  {
    type: "risk",
    text: "Leases expiring in < 12 mo",
    value: "$234K/mo",
    impact: "−$2.8M NOI at risk",
    detail: "Pfizer · Morgan Stanley · Deloitte LLP",
  },
  {
    type: "upside",
    text: "LOI+ deals → NOI upside if executed",
    value: "+$89K/mo",
    impact: "+$1.1M projected NOI",
    detail: "NovaTech · Vertex Studios · Bluewave LLC",
  },
  {
    type: "ops",
    text: "Outstanding AR > 30 days",
    value: "$41K",
    impact: "2 tenants past due",
    detail: "Meridian Health · Atlas Group",
  },
]

const CONFIG = {
  risk:   { bg: "bg-rose-400/15 border-rose-400/25",       icon: ShieldAlert,   color: "text-rose-300"    },
  upside: { bg: "bg-emerald-400/15 border-emerald-400/25", icon: Zap,           color: "text-emerald-300" },
  ops:    { bg: "bg-orange-400/15 border-orange-400/25",   icon: AlertTriangle, color: "text-orange-300"  },
}

function ActionRow({ item, onRun }: { item: ActionItem; onRun: () => void }) {
  const cfg = CONFIG[item.type]
  return (
    <div className={cn("rounded-lg border p-3 group/row", cfg.bg)}>
      <div className="flex items-start gap-2.5">
        <cfg.icon className={cn("h-4 w-4 mt-0.5 shrink-0", cfg.color)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm leading-snug text-white/85">{item.text}</p>
            <span className={cn("text-sm font-bold tabular-nums shrink-0", cfg.color)}>{item.value}</span>
          </div>
          <div className="flex items-center justify-between mt-1.5 gap-2">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 shrink-0 text-white/50" />
              <span className="text-sm text-white/60">{item.impact}</span>
            </div>
            <button
              onClick={onRun}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-all duration-150 opacity-0 group-hover/row:opacity-100 bg-white/10 hover:bg-white/20 text-white/80"
            >
              <Sparkles className="h-3 w-3" />
              Run Agent
            </button>
          </div>
          {item.detail && (
            <p className="text-sm mt-0.5 text-white/50">{item.detail}</p>
          )}
        </div>
      </div>
    </div>
  )
}

interface ActionLeversProps {
  className?: string
}

const ActionLevers = React.forwardRef<HTMLDivElement, ActionLeversProps>(
  ({ className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardBase, "border-transparent flex flex-col gap-4 bg-[oklch(0.22_0.18_278)]", className)}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-1 text-white/70">VTS Agents</p>
            <h2 className="text-xl font-semibold text-white/95">Financial Levers</h2>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 text-white/80 border-white/25 bg-transparent hover:bg-white/10 hover:text-white dark:bg-white/8 dark:border-white/25 dark:text-white dark:hover:bg-white/15">
            View Active Agents
          </Button>
        </div>

        {/* Summary bar */}
        <div className="rounded-lg px-3 py-2 flex items-center gap-2 bg-white/10">
          <Sparkles className="h-4 w-4 shrink-0 text-violet-400" />
          <p className="text-sm leading-snug text-white/70">
            3 financial improvements identified: <span className="text-violet-400 font-semibold">$1.1M upside</span>
          </p>
        </div>

        {/* Action items */}
        <div className="flex flex-col gap-2">
          {ACTIONS.map((item, i) => (
            <ActionRow key={i} item={item} onRun={() => {}} />
          ))}
        </div>

      </div>
    )
  }
)
ActionLevers.displayName = "ActionLevers"

export { ActionLevers }
export type { ActionLeversProps }
