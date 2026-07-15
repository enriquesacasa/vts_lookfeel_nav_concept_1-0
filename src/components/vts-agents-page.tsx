import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Sparkles, ArrowRight, Search, CheckCircle2, Loader2,
  Clock, ChevronRight, AlertTriangle,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

// ── Data ─────────────────────────────────────────────────────────────────────

const RECENT_RUNS = [
  {
    id: "1",
    title: "12-month lease expiry risk analysis",
    asset: "VTS Tower Headquarters",
    status: "complete" as const,
    category: "Lease Risk",
    time: "2 min ago",
    summary: "3 leases totaling $234K/mo expire before Oct 2026. Pfizer and Morgan Stanley are highest priority.",
  },
  {
    id: "2",
    title: "Vacancy outreach plan for Suite 2100",
    asset: "VTS Tower Headquarters",
    status: "complete" as const,
    category: "Leasing",
    time: "14 min ago",
    summary: "Identified 12 prospective tenants in the 30–40K sf range. Draft outreach ready for review.",
  },
  {
    id: "3",
    title: "Q3 NOI improvement opportunities",
    asset: "Northeast Corridor Portfolio",
    status: "running" as const,
    category: "Financial",
    time: "Running now",
  },
  {
    id: "4",
    title: "KPMG Suite 3400 renewal strategy",
    asset: "VTS Tower Headquarters",
    status: "pending" as const,
    category: "Lease Strategy",
    time: "Queued",
  },
  {
    id: "5",
    title: "Midtown Manhattan comparable lease transactions",
    asset: "Market",
    status: "complete" as const,
    category: "Market Intel",
    time: "1 hr ago",
    summary: "Avg asking rent up 4.2% YoY. 14 comps identified in the 40–120K sf range.",
  },
]

const AGENT_TYPES = [
  {
    id: "lease-risk",
    label: "Lease Risk",
    description: "Analyze expiring leases, renewal probability, and revenue exposure.",
    prompts: ["What leases expire in the next 6 months?", "Which tenants are most likely not to renew?"],
  },
  {
    id: "leasing",
    label: "Leasing",
    description: "Find prospects, draft outreach, and surface deal opportunities.",
    prompts: ["Find prospects for Floor 7 (52K sf)", "Draft a proposal for NovaTech Inc."],
  },
  {
    id: "financial",
    label: "Financial",
    description: "Model NOI scenarios, track budget variance, and flag anomalies.",
    prompts: ["What's driving the NOI variance this quarter?", "Model impact of 10% vacancy increase"],
  },
  {
    id: "market",
    label: "Market Intel",
    description: "Pull comparable deals, track trends, and benchmark performance.",
    prompts: ["What are comparable rents in Midtown?", "How does our occupancy compare to the market?"],
  },
]

const SUGGESTED = [
  "What are my highest-risk leases this quarter?",
  "Which vacant spaces have been empty the longest?",
  "Draft a renewal proposal for KPMG",
  "Summarize NOI performance vs budget",
  "Find prospects for Floor 7",
  "What's the renewal probability for Pfizer?",
]

const STATUS_CONFIG = {
  complete: { icon: CheckCircle2, color: "text-emerald-500", label: "Complete" },
  running:  { icon: Loader2,      color: "text-[#8C82FF]",   label: "Running"  },
  pending:  { icon: Clock,        color: "text-muted-foreground", label: "Queued" },
}

// ── Shared primitives (same as vts-dashboard) ─────────────────────────────────

const CARD = "border border-border bg-card"

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">
      {children}
    </p>
  )
}

function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <h2 className="text-xl font-semibold text-foreground">{children}</h2>
      {action}
    </div>
  )
}

function ViewAll({ label = "View All" }: { label?: string }) {
  return (
    <button className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 mt-0.5">
      {label} <ArrowRight className="h-3 w-3" />
    </button>
  )
}

function AgentCircleBtn({ label }: { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span />}>
        <button className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-[#E5E2FD] hover:bg-[#5528FF] text-[#280F96] hover:text-white transition-all duration-150 shrink-0">
          <Sparkles className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="bg-[#140532] text-white border-transparent font-medium text-xs"
        arrowClassName="fill-[#140532]"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

// ── Page header ───────────────────────────────────────────────────────────────

function AgentsHeader({ query, setQuery }: { query: string; setQuery: (v: string) => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100) }, [])

  return (
    <div>
      {/* Title bar */}
      <div className="flex items-center gap-4 py-4 border-b border-border">
        {/* Title */}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">AI · Automation</p>
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-primary shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">VTS Agents</h1>
          </div>
        </div>
        {/* Stats */}
        <div className="hidden md:flex items-center gap-6 ml-auto shrink-0">
          {[
            { label: "Agents Run", value: "142" },
            { label: "Running",    value: "1"   },
            { label: "Completed",  value: "98%" },
          ].map((s, i) => (
            <div key={s.label} className={cn("text-right", i > 0 && "pl-6 border-l border-border")}>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-sm font-semibold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0 md:ml-6">
          <button className="hidden sm:inline-flex items-center gap-1.5 border border-primary text-primary-foreground bg-primary hover:bg-primary/90 transition-colors px-3.5 py-1.5 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            Ask VTS AI
          </button>
          <button aria-label="Search" className="flex items-center justify-center h-8 w-8 border border-border hover:border-primary text-muted-foreground hover:text-primary transition-colors">
            <Search className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className={cn(CARD, "mt-3 px-4 py-3")}>
        <div className="flex items-center gap-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask VTS Agents anything about your portfolio…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button className={cn(
            "shrink-0 flex items-center justify-center h-7 w-7 transition-all duration-150",
            query ? "bg-primary text-white" : "bg-muted text-muted-foreground"
          )}>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
          {SUGGESTED.map(s => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="text-xs text-primary border border-primary/30 bg-primary/5 px-3 py-1 hover:bg-primary/10 hover:border-primary/50 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Running agent banner ──────────────────────────────────────────────────────

function RunningBanner() {
  return (
    <div className="border border-[#280F96] bg-[#140532] p-4 flex items-center gap-4">
      <div className="h-8 w-8 bg-[#5528FF]/20 flex items-center justify-center shrink-0">
        <Loader2 className="h-4 w-4 text-[#8C82FF] animate-spin" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">1 Agent Running</p>
        <p className="text-xs text-white/55 truncate">Q3 NOI improvement opportunities · Northeast Corridor Portfolio</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 border border-white/20 px-3 py-1.5 hover:bg-white/10 transition-colors">
          <AlertTriangle className="h-3 w-3" /> View Progress
        </button>
        <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#5528FF] hover:bg-[#280F96] px-3 py-1.5 transition-colors">
          All Agents <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

// ── Recent runs ───────────────────────────────────────────────────────────────

function RecentRunsCard({ className }: { className?: string; setQuery?: (v: string) => void }) {
  return (
    <div className={cn(CARD, className)}>
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <Eyebrow>History</Eyebrow>
        <SectionTitle action={<ViewAll label="All Runs" />}>Recent Agent Runs</SectionTitle>
      </div>

      {RECENT_RUNS.map((run) => {
        const cfg = STATUS_CONFIG[run.status]
        const StatusIcon = cfg.icon
        const statusChip =
          run.status === "complete" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
          run.status === "running"  ? "bg-[#E5E2FD] text-[#280F96] border-[#C2C8FF]" :
          "bg-muted text-muted-foreground border-border"

        return (
          <div
            key={run.id}
            className="flex items-start gap-3 px-4 py-3.5 border-b border-border last:border-0 hover:bg-muted/40 transition-colors group cursor-pointer"
          >
            <StatusIcon className={cn("h-4 w-4 mt-0.5 shrink-0", cfg.color, run.status === "running" && "animate-spin")} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-0.5">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">{run.title}</p>
                <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 border shrink-0 capitalize", statusChip)}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {run.asset} · {run.category} · {run.time}
              </p>
              {run.summary && (
                <p className="text-xs text-muted-foreground mt-1 leading-snug">{run.summary}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
              <AgentCircleBtn label="Re-run agent" />
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Agent types ───────────────────────────────────────────────────────────────

function AgentTypesCard({ className, setQuery }: { className?: string; setQuery: (v: string) => void }) {
  return (
    <div className={cn(CARD, className)}>
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <Eyebrow>Capabilities</Eyebrow>
        <SectionTitle>Agent Types</SectionTitle>
      </div>

      {AGENT_TYPES.map((type) => (
        <div
          key={type.id}
          className="px-4 py-3.5 border-b border-border last:border-0 group hover:bg-muted/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{type.label}</p>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-xs text-muted-foreground mb-2.5 leading-relaxed">{type.description}</p>
          <div className="flex flex-col gap-1.5">
            {type.prompts.map(p => (
              <button
                key={p}
                onClick={e => { e.stopPropagation(); setQuery(p) }}
                className="w-full text-left text-xs text-primary border border-primary/30 bg-primary/5 px-3 py-1.5 hover:bg-primary/10 hover:border-primary/50 transition-colors flex items-center justify-between gap-2"
              >
                <span>{p}</span>
                <ArrowRight className="h-3 w-3 shrink-0 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

export function VtsAgentsPage() {
  const [query, setQuery] = React.useState("")

  return (
    <div className="space-y-3 p-4">
      <AgentsHeader query={query} setQuery={setQuery} />
      <RunningBanner />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <RecentRunsCard className="md:col-span-2" setQuery={setQuery} />
        <AgentTypesCard setQuery={setQuery} />
      </div>
    </div>
  )
}
