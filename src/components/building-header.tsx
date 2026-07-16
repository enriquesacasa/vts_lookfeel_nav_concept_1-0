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
  city: string          // eyebrow text, e.g. "Asset Dashboard" or "Overview"
  stats?: BuildingStat[]
  className?: string
}

const BuildingHeader = React.forwardRef<HTMLDivElement, BuildingHeaderProps>(
  ({ image, name, address, city, stats = [], className }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-4 py-3 border-b border-border", className)}>
      {/* Thumbnail */}
      {image && (
        <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden hidden sm:block">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Title block */}
      <div className="flex-1 min-w-0">
        {city && (
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-0.5">
            {city}
          </p>
        )}
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground leading-tight">
          {name}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5 truncate">{address}</p>
      </div>

      {/* Stats */}
      {stats.length > 0 && (
        <div className="hidden md:flex items-stretch divide-x divide-border shrink-0">
          {stats.map(({ label, value, accent }) => (
            <div key={label} className="px-5 text-right">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-0.5">
                {label}
              </p>
              <p className={cn("text-sm font-semibold", accent ? "text-primary" : "text-foreground")}>
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
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
  )
)
BuildingHeader.displayName = "BuildingHeader"

export { BuildingHeader }
export type { BuildingHeaderProps, BuildingStat }
