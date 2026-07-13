import * as React from "react"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"

interface BuildingStat {
  label: string
  value: string
  accent?: boolean
}

interface BuildingHeaderProps {
  image?: string
  name: string
  address: string
  city: string
  stats: BuildingStat[]
  className?: string
}

const BuildingHeader = React.forwardRef<HTMLDivElement, BuildingHeaderProps>(
  ({ name, address, city, stats, className }, ref) => (
    <div ref={ref} className={cn(
      "rounded-2xl overflow-hidden border border-white/20 shadow-sm",
      className
    )}>
      {/* Gradient hero section */}
      <div className="building-header-gradient px-6 pt-5 pb-7 relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {city && (
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70 mb-2">
                {city}
              </p>
            )}
            <h1 className="font-inter text-2xl md:text-3xl font-bold text-white leading-tight mb-1.5">
              {name}
            </h1>
            <p className="text-sm text-white/70">{address}</p>
          </div>
          <button aria-label="Search" className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full border border-white/20 bg-transparent text-white/70 hover:bg-white/10 transition-colors">
            <Search className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap divide-x divide-border/60 bg-white/70 dark:bg-white/8 backdrop-blur-md">
        {stats.map(({ label, value, accent }) => (
          <div key={label} className="flex-1 min-w-[90px] px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              {label}
            </p>
            <p className={cn(
              "text-lg font-semibold truncate",
              accent ? "text-primary" : "text-foreground"
            )}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
)
BuildingHeader.displayName = "BuildingHeader"

export { BuildingHeader }
export type { BuildingHeaderProps, BuildingStat }
