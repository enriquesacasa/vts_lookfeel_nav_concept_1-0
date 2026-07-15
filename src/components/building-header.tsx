import * as React from "react"
import { cn } from "@/lib/utils"
import { Search, Sparkles } from "lucide-react"

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
  ({ image, name, address, city, stats, className }, ref) => (
    <div ref={ref} className={cn(
      "rounded-2xl overflow-hidden border border-white/20 shadow-sm",
      className
    )}>
      {/* Gradient hero section */}
      <div className="building-header-gradient px-6 pt-5 pb-5 relative">
        <div className="flex items-start gap-4">
          {image && (
            <div className="shrink-0 w-16 h-16 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-white/20 shadow-md">
              <img src={image} alt={name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1">
            {city && (
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70 mb-2">
                {city}
              </p>
            )}
            <h1 className="font-inter text-xl sm:text-3xl font-bold text-white leading-tight mb-1.5">
              {name}
            </h1>
            <p className="text-sm text-white/70">{address}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/20 text-white hover:bg-white/30 transition-colors px-3.5 py-1.5 text-sm font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              Ask VTS AI
            </button>
            <button aria-label="Search" className="flex items-center justify-center h-8 w-8 rounded-full border border-white/40 bg-white/20 text-white hover:bg-white/30 transition-colors">
              <Search className="h-3.5 w-3.5" />
            </button>
          </div>
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
