import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table"

export type SortDir = "asc" | "desc"

export interface ColumnDef<K extends string> {
  key: K | null
  label: string
  className?: string
  headClassName?: string
  right?: boolean
}

export function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="h-3 w-3 opacity-40 shrink-0" />
  return dir === "asc"
    ? <ChevronUp className="h-3 w-3 shrink-0" />
    : <ChevronDown className="h-3 w-3 shrink-0" />
}

export function SortableHead<K extends string>({
  col,
  sortKey,
  sortDir,
  onSort,
  right,
  className,
  children,
}: {
  col: K | null
  sortKey: K | null
  sortDir: SortDir
  onSort: (key: K) => void
  right?: boolean
  className?: string
  children: React.ReactNode
}) {
  const active = col !== null && col === sortKey
  return (
    <TableHead
      onClick={col ? () => onSort(col) : undefined}
      className={cn(
        "pb-2 pt-0 text-[10px] font-medium uppercase tracking-widest select-none whitespace-nowrap transition-colors",
        col ? "cursor-pointer hover:text-foreground/80" : "",
        active ? "text-foreground/80" : "text-foreground/50",
        right ? "text-right" : "text-left",
        className
      )}
    >
      <span className={cn("inline-flex items-center gap-1", right && "justify-end w-full")}>
        {children}
        {col && <SortIcon active={active} dir={sortDir} />}
      </span>
    </TableHead>
  )
}

export function useSortState<K extends string>(initial: K, initialDir: SortDir = "asc") {
  const [sortKey, setSortKey] = React.useState<K>(initial)
  const [sortDir, setSortDir] = React.useState<SortDir>(initialDir)

  function handleSort(key: K) {
    if (key === sortKey) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
  }

  return { sortKey, sortDir, handleSort }
}

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
}
