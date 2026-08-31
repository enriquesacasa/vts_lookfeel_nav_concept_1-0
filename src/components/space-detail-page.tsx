import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FileText, Calendar, Ruler, DollarSign, Clock, Tag, Building2, ChevronDown } from "lucide-react"

export interface SpaceRef {
  suite: string
  floor: string
  sf: number
  status: string
  tenant?: string
  rent?: number
  expiry?: string
  condition?: string
  assetName?: string
}

export type SpaceStatus = "Available" | "Occupied" | "Unavailable" | "Vacant" | "Archived"

const SPACE_STATUS_CONFIG: Record<SpaceStatus, { cls: string; dot: string }> = {
  "Available":   { cls: "text-success bg-success/10 border-success/20",           dot: "bg-success" },
  "Vacant":      { cls: "text-success bg-success/10 border-success/20",           dot: "bg-success" },
  "Occupied":    { cls: "text-primary bg-primary/10 border-primary/20",           dot: "bg-primary" },
  "Unavailable": { cls: "text-muted-foreground bg-muted border-border",           dot: "bg-muted-foreground" },
  "Archived":    { cls: "text-muted-foreground bg-muted border-border",           dot: "bg-muted-foreground" },
}

const ALL_STATUSES: SpaceStatus[] = ["Available", "Occupied", "Unavailable", "Vacant", "Archived"]

export function SpaceStatusBadge({ status, onChange }: { status: SpaceStatus; onChange: (s: SpaceStatus) => void }) {
  const [open, setOpen] = React.useState(false)
  const cfg = SPACE_STATUS_CONFIG[status] ?? SPACE_STATUS_CONFIG["Unavailable"]
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" className={cn("gap-1.5", cfg.cls)} />}>
        {status}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1" align="start">
        {ALL_STATUSES.map(opt => {
          const c = SPACE_STATUS_CONFIG[opt]
          return (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false) }}
              className={cn(
                "w-full flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-muted",
                opt === status && "bg-muted"
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
              {opt}
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}

interface SpaceDetailPageProps {
  space: SpaceRef
  onBack?: () => void
}

export function SpaceDetailPage({ space }: SpaceDetailPageProps) {
  const items = [
    { icon: Ruler,      label: "Size",        value: `${space.sf.toLocaleString()} sf` },
    { icon: Building2,  label: "Floor",       value: space.floor },
    { icon: Tag,        label: "Suite",       value: space.suite },
    ...(space.rent    ? [{ icon: DollarSign, label: "Asking rent",   value: `$${space.rent.toFixed(2)}/sf` }] : []),
    ...(space.expiry  ? [{ icon: Calendar,   label: "Expiry",        value: space.expiry }] : []),
    ...(space.tenant  ? [{ icon: Clock,      label: "Tenant",        value: space.tenant }] : []),
    ...(space.condition ? [{ icon: FileText, label: "Condition",     value: space.condition }] : []),
  ]

  return (
    <div className="flex flex-col gap-4 flex-1">
<div className={cn(cardBase, "!p-0 overflow-hidden flex flex-wrap divide-x divide-border/60")}>
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex-1 min-w-[140px] px-5 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className="h-3 w-3 text-muted-foreground" />
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
            </div>
            <p className="text-sm font-medium text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <div className={cn(cardBase, "flex flex-col items-center justify-center text-center flex-1 min-h-[320px]")}>
        <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <Building2 className="h-5 w-5 text-primary opacity-60" />
        </div>
        <p className="text-base font-medium text-foreground mb-1">Space detail</p>
        <p className="text-sm text-muted-foreground max-w-xs">Full leasing history, documents, tours, and marketing details coming soon.</p>
      </div>
    </div>
  )
}
