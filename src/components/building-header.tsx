import * as React from "react"
import { cn } from "@/lib/utils"
import { Search, Sparkle } from "lucide-react"

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
    <div ref={ref} className={cn("overflow-hidden", className)}>
      {/* Hero section */}
      <div className="flex items-start gap-4 py-3">
        {image && (
          <div className="relative shrink-0 w-16 h-16 sm:w-24 sm:h-24 rounded-xl overflow-hidden">
            <img src={image} alt={name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30" />
          </div>
        )}
        <div className="flex-1">
          {city && (
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">
              {city}
            </p>
          )}
          <h1 className="font-inter text-2xl sm:text-4xl font-semibold tracking-tight text-foreground leading-tight mb-1.5">
            {name}
          </h1>
          <p className="text-sm text-muted-foreground">{address}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-3.5 py-1.5 text-sm font-medium">
            <Sparkle fill="currentColor" className="h-3.5 w-3.5" />
            Ask VTS AI
          </button>
          <button aria-label="Search" className="flex items-center justify-center h-8 w-8 rounded-full border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
            <Search className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap divide-x divide-border/60 bg-white/70 dark:bg-white/8 backdrop-blur-md">
        {stats.map(({ label, value, accent }) => (
          <div key={label} className="flex-1 min-w-[90px] px-4 py-4">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">
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
