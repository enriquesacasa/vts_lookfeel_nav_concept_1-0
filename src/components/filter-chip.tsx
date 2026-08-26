import * as React from "react"
import { ChevronDownIcon, XIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn, TOGGLE_INACTIVE, TOGGLE_HOVER } from "@/lib/utils"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface FilterOption {
  label: string
  value: string
}

export interface FilterDef {
  key: string
  label: string
  options: FilterOption[]
}

// ── FilterChip ────────────────────────────────────────────────────────────────
// A single filter pill: outline button trigger → popover with checkboxes.
// Active state: primary-tinted border + bg + count badge.

interface FilterChipProps {
  filter: FilterDef
  selected: string[]
  onToggle: (value: string) => void
  onClear: () => void
}

export function FilterChip({ filter, selected, onToggle, onClear }: FilterChipProps) {
  const isActive = selected.length > 0
  return (
    <Popover>
      <PopoverTrigger render={<Button
        variant="outline"
        size="sm"
        className={cn(
          "gap-1 font-normal whitespace-nowrap",
          isActive && "border-primary bg-primary/10 text-primary font-medium"
        )}
      />}>
        {filter.label}
        {isActive && (
          <Badge className="size-4 rounded-full p-0 flex items-center justify-center text-[10px]">
            {selected.length}
          </Badge>
        )}
        <ChevronDownIcon data-icon="inline-end" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-52 p-2">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-xs font-semibold text-foreground">{filter.label}</span>
          {isActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-auto px-1.5 py-0.5 text-xs text-muted-foreground"
            >
              <XIcon data-icon="inline-start" /> Clear
            </Button>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          {filter.options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer text-sm"
            >
              <Checkbox
                checked={selected.includes(opt.value)}
                onCheckedChange={() => onToggle(opt.value)}
                className="size-3.5"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ── FilterBar ─────────────────────────────────────────────────────────────────
// Renders a row of FilterChips with show-more / show-less and a Clear all link.
// Pass `visibleCount` to control how many chips show before "+N more".

interface FilterBarProps {
  filters: FilterDef[]
  active: Record<string, string[]>
  onToggle: (key: string, value: string) => void
  onClear: (key: string) => void
  onClearAll: () => void
  visibleCount?: number
  className?: string
}

export function FilterBar({
  filters,
  active,
  onToggle,
  onClear,
  onClearAll,
  visibleCount = 4,
  className,
}: FilterBarProps) {
  const [showAll, setShowAll] = React.useState(false)
  const hasAny = Object.values(active).some((v) => v.length > 0)
  const visible = showAll ? filters : filters.slice(0, visibleCount)
  const hidden = filters.length - visibleCount

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {visible.map((f) => (
        <FilterChip
          key={f.key}
          filter={f}
          selected={active[f.key] ?? []}
          onToggle={(v) => onToggle(f.key, v)}
          onClear={() => onClear(f.key)}
        />
      ))}

      {!showAll && hidden > 0 && (
        <button
          onClick={() => setShowAll(true)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          +{hidden} more
        </button>
      )}
      {showAll && (
        <button
          onClick={() => setShowAll(false)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Show less
        </button>
      )}

      {hasAny && (
        <button
          onClick={onClearAll}
          className="ml-auto text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Clear all
        </button>
      )}
    </div>
  )
}

// ── Filter state helpers ──────────────────────────────────────────────────────

export function toggleFilterValue(
  active: Record<string, string[]>,
  key: string,
  value: string
): Record<string, string[]> {
  const current = active[key] ?? []
  const next = current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value]
  return { ...active, [key]: next }
}

export function clearFilterKey(
  active: Record<string, string[]>,
  key: string
): Record<string, string[]> {
  const next = { ...active }
  delete next[key]
  return next
}

// ── Segmented tab class (ToggleGroup) ─────────────────────────────────────────
// Use this className on ToggleGroup + ToggleGroupItem for consistent tab-style
// mutually-exclusive filters (e.g. All / Expiring / Renewal).

export const FILTER_TAB_GROUP_CLS =
  "bg-muted/60 dark:bg-white/6 p-1 rounded-lg gap-0 overflow-x-auto"

export const FILTER_TAB_ITEM_CLS =
  `text-xs px-3 whitespace-nowrap rounded-md ${TOGGLE_INACTIVE} ${TOGGLE_HOVER}`
