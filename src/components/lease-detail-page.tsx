import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FileText, Calendar, Ruler, DollarSign, ChevronDown, Tag } from "lucide-react"
import type { Lease } from "@/components/leases-page"

export type LeaseStatus = "Active" | "Expiring soon" | "Expired" | "Pending"

const LEASE_STATUS_CONFIG: Record<LeaseStatus, { cls: string; dot: string }> = {
  "Active":        { cls: "text-success bg-success/10 border-success/20",         dot: "bg-success" },
  "Expiring soon": { cls: "text-warning bg-warning/10 border-warning/20",         dot: "bg-warning" },
  "Expired":       { cls: "text-muted-foreground bg-muted border-border",         dot: "bg-muted-foreground" },
  "Pending":       { cls: "text-primary bg-primary/10 border-primary/20",         dot: "bg-primary" },
}

const ALL_STATUSES: LeaseStatus[] = ["Active", "Expiring soon", "Expired", "Pending"]

export function LeaseStatusBadge({ status, onChange }: { status: LeaseStatus; onChange: (s: LeaseStatus) => void }) {
  const [open, setOpen] = React.useState(false)
  const cfg = LEASE_STATUS_CONFIG[status] ?? LEASE_STATUS_CONFIG["Active"]
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" className={cn("gap-1.5", cfg.cls)} />}>
        {status}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1" align="start">
        {ALL_STATUSES.map(opt => {
          const c = LEASE_STATUS_CONFIG[opt]
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

interface LeaseDetailPageProps {
  lease: Lease
}

export function LeaseDetailPage({ lease }: LeaseDetailPageProps) {
  const items = [
    { icon: Ruler,      label: "Size",         value: `${lease.sf.toLocaleString()} sf` },
    { icon: Tag,        label: "Suite",        value: lease.suite },
    { icon: DollarSign, label: "Base rent",    value: `$${lease.baseRent.toFixed(2)}/sf/yr` },
    { icon: DollarSign, label: "Annual rent",  value: `$${(lease.annualRent / 1000).toFixed(0)}K` },
    { icon: Calendar,   label: "Commenced",    value: lease.lcd },
    { icon: Calendar,   label: "Expires",      value: lease.lxd },
    { icon: FileText,   label: "Type",         value: lease.type },
    ...(lease.options.length ? [{ icon: FileText, label: "Options", value: lease.options.join(", ") }] : []),
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
          <FileText className="h-5 w-5 text-primary opacity-60" />
        </div>
        <p className="text-base font-medium text-foreground mb-1">Lease detail</p>
        <p className="text-sm text-muted-foreground max-w-xs">Full abstract, documents, rent schedule, and amendments coming soon.</p>
      </div>
    </div>
  )
}
