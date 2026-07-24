import * as React from "react"
import { cn } from "@/lib/utils"
import { Sparkle, Search } from "lucide-react"

interface Stat { label: string; value: string }

export function PageHeader({ name, subtitle, eyebrow, image, stats = [] }: {
  name: string | React.ReactNode; subtitle: string; eyebrow: string; image?: string | React.ReactNode; stats?: Stat[]
}) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-border">
      {image && (
        <div className="aspect-video h-[72px] overflow-hidden shrink-0 hidden sm:block">
          {typeof image === "string"
            ? <img src={image} alt={name} className="h-full w-full object-cover" />
            : <div className="h-full w-full">{image}</div>
          }
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-0.5">{eyebrow}</p>
        <h1 className="text-2xl sm:text-3xl font-medium text-foreground leading-tight">{name}</h1>
        <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block truncate">{subtitle}</p>
      </div>
      {stats.length > 0 && (
        <div className="hidden md:flex items-center gap-6 ml-auto shrink-0">
          {stats.map((s, i) => (
            <div key={s.label} className={cn("text-right", i > 0 && "pl-6 border-l border-border")}>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-sm font-medium text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 shrink-0 md:ml-6">
        <button className="hidden sm:inline-flex items-center gap-1.5 border border-primary bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-3.5 py-1.5 text-xs font-medium">
          <Sparkle fill="currentColor" className="h-3.5 w-3.5" />
          Ask VTS AI
        </button>
        <button aria-label="Search" className="flex items-center justify-center h-8 w-8 border border-border hover:border-primary text-muted-foreground hover:text-primary transition-colors">
          <Search className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
