import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DealStage {
  stage: string
  status: number
  sizeSf: number
}

interface DealPipelineOverviewProps {
  stages: DealStage[]
  className?: string
}

function fmt(n: number) {
  return n.toLocaleString() + " sf"
}

const DealPipelineOverview = React.forwardRef<HTMLDivElement, DealPipelineOverviewProps>(
  ({ stages, className }, ref) => {
    const maxSf = Math.max(...stages.map(s => s.sizeSf))
    const totalStatus = stages.reduce((s, r) => s + r.status, 0)
    const totalSf = stages.reduce((s, r) => s + r.sizeSf, 0)

    return (
      <div ref={ref} className={cn(
        cardBase,
        className
      )}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">Overview</p>
            <h2 className="text-xl font-semibold text-foreground">Deal pipeline</h2>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 text-primary border-primary bg-transparent hover:bg-primary/10 hover:text-primary dark:bg-white/8 dark:border-white/25 dark:text-white dark:hover:bg-white/15">View deal pipeline</Button>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-border/60">
                <th className="text-left text-[10px] font-medium uppercase tracking-widest text-foreground/70 pb-2 w-[28%]">Stage</th>
                <th className="text-left text-[10px] font-medium uppercase tracking-widest text-foreground/70 pb-2 w-[8%]">#</th>
                <th className="pb-2" scope="col" aria-hidden="true" />
                <th className="text-right text-[10px] font-medium uppercase tracking-widest text-foreground/70 pb-2 whitespace-nowrap">Size</th>
              </tr>
            </thead>
            <tbody>
              {stages.map(({ stage, status, sizeSf }, i) => (
                <tr key={stage} className={cn(i > 0 && "border-t border-border/40")}>
                  <td className="py-1.5 text-xs text-foreground font-medium">{stage}</td>
                  <td className="py-1.5 text-xs text-muted-foreground">{status}</td>
                  <td className="py-1.5 pr-4 w-full">
                    <div className="h-2 w-full rounded-full bg-muted/60 dark:bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: maxSf > 0 ? `${(sizeSf / maxSf) * 100}%` : "0%" }}
                      />
                    </div>
                  </td>
                  <td className="py-1.5 text-right text-xs text-muted-foreground tabular-nums whitespace-nowrap">{fmt(sizeSf)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border">
                <td className="pt-3 text-xs font-medium text-foreground">Total</td>
                <td className="pt-3 text-xs font-medium text-foreground">{totalStatus}</td>
                <td />
                <td className="pt-3 text-right text-xs font-medium text-foreground tabular-nums whitespace-nowrap">{fmt(totalSf)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    )
  }
)
DealPipelineOverview.displayName = "DealPipelineOverview"

export { DealPipelineOverview }
export type { DealPipelineOverviewProps, DealStage }
