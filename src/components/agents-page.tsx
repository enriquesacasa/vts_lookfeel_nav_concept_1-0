import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import {
  Sparkle, ArrowRight, Clock, CheckCircle2, Loader2,
  AlertTriangle, FileText, Search, ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface AgentRun {
  id: string
  title: string
  asset: string
  status: "complete" | "running" | "pending"
  category: string
  time: string
  summary?: string
}

interface AgentType {
  id: string
  label: string
  description: string
  examplePrompts: string[]
}

const RECENT_RUNS: AgentRun[] = [
  {
    id: "1",
    title: "12-month lease expiry risk analysis",
    asset: "VTS Tower Headquarters",
    status: "complete",
    category: "Lease Risk",
    time: "2 min ago",
    summary: "3 leases totaling $234K/mo expire before Oct 2026. Pfizer and Morgan Stanley are highest priority.",
  },
  {
    id: "2",
    title: "Vacancy outreach plan for Suite 2100",
    asset: "VTS Tower Headquarters",
    status: "complete",
    category: "Leasing",
    time: "14 min ago",
    summary: "Identified 12 prospective tenants in the 30–40K sf range. Draft outreach ready for review.",
  },
  {
    id: "3",
    title: "Q3 NOI improvement opportunities",
    asset: "Northeast Corridor Portfolio",
    status: "running",
    category: "Financial",
    time: "Running now",
  },
  {
    id: "4",
    title: "KPMG Suite 3400 renewal strategy",
    asset: "VTS Tower Headquarters",
    status: "pending",
    category: "Lease Strategy",
    time: "Queued",
  },
  {
    id: "5",
    title: "Midtown Manhattan comparable lease transactions",
    asset: "Market",
    status: "complete",
    category: "Market Intel",
    time: "1 hr ago",
    summary: "Avg asking rent up 4.2% YoY. 14 comps identified in the 40–120K sf range.",
  },
]

const AGENT_TYPES: AgentType[] = [
  {
    id: "lease-risk",
    label: "Lease Risk",
    description: "Analyze expiring leases, renewal probability, and revenue exposure.",
    examplePrompts: [
      "What leases expire in the next 6 months?",
      "Which tenants are most likely not to renew?",
    ],
  },
  {
    id: "leasing",
    label: "Leasing",
    description: "Find prospects, draft outreach, and surface deal opportunities.",
    examplePrompts: [
      "Find prospects for Floor 7 (52K sf)",
      "Draft a proposal for NovaTech Inc.",
    ],
  },
  {
    id: "financial",
    label: "Financial",
    description: "Model NOI scenarios, track budget variance, and flag anomalies.",
    examplePrompts: [
      "What's driving the NOI variance this quarter?",
      "Model impact of 10% vacancy increase",
    ],
  },
  {
    id: "market",
    label: "Market Intel",
    description: "Pull comparable deals, track trends, and benchmark performance.",
    examplePrompts: [
      "What are comparable rents in Midtown?",
      "How does our occupancy compare to the market?",
    ],
  },
]

const STATUS_CONFIG = {
  complete: { icon: CheckCircle2, color: "text-emerald-500", label: "Complete" },
  running:  { icon: Loader2,      color: "text-violet-500",  label: "Running"  },
  pending:  { icon: Clock,        color: "text-muted-foreground", label: "Queued" },
}

const SUGGESTED = [
  "What are my highest-risk leases this quarter?",
  "Which vacant spaces have been empty the longest?",
  "Draft a renewal proposal for KPMG",
  "Summarize NOI performance vs budget",
  "Find prospects for Floor 7",
  "What's the renewal probability for Pfizer?",
]

interface AgentsPageProps {
  className?: string
}

export function AgentsPage({ className }: AgentsPageProps) {
  const [query, setQuery] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  return (
    <div className={cn("space-y-4", className)}>

      {/* Page header */}
      <div className="flex items-start gap-4 py-3">
        <div className="shrink-0 w-16 h-16 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center">
          <Sparkle fill="currentColor" className="h-7 w-7 sm:h-10 sm:w-10 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">AI · automation</p>
          <h1 className="font-inter text-2xl sm:text-4xl font-semibold text-foreground leading-tight mb-1.5">VTS Agents</h1>
          <p className="text-sm text-muted-foreground">Ask anything about your portfolio. Agents research, analyze, and act on your behalf.</p>
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

      {/* Query bar card */}
      <div className={cn(cardBase)}>
        <div className="flex items-center gap-3 rounded-xl bg-muted/50 border border-border px-4 py-3 focus-within:border-primary/40 focus-within:bg-background transition-colors">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask VTS Agents anything about your portfolio…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button className={cn(
            "shrink-0 flex items-center justify-center h-7 w-7 rounded-lg transition-all duration-150",
            query ? "bg-primary text-white" : "bg-muted text-muted-foreground"
          )}>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {SUGGESTED.map(s => (
            <button
              key={s}
              onClick={() => setQuery(s)}
              className="text-xs text-primary border border-primary/30 bg-primary/5 rounded-full px-3 py-1 hover:bg-primary/10 hover:border-primary/50 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Running agent banner */}
      <div className={cn(cardBase, "bg-[oklch(0.22_0.18_278)] border-transparent flex items-center gap-4")}>
        <Loader2 className="h-5 w-5 text-violet-400 animate-spin shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">1 agent running</p>
          <p className="text-sm text-white/60 truncate">Northeast Corridor Portfolio Q3 NOI improvement opportunities</p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0 text-white/80 border-white/25 bg-transparent hover:bg-white/10 hover:text-white">
          <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
          View progress
        </Button>
        <Button variant="outline" size="sm" className="shrink-0 text-white/80 border-white/25 bg-transparent hover:bg-white/10 hover:text-white">
          <FileText className="h-3.5 w-3.5 mr-1.5" />
          All agents
        </Button>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Recent Agent Runs — 2 cols */}
        <div className={cn(cardBase, "md:col-span-2")}>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">History</p>
              <h2 className="text-xl font-semibold text-foreground">Recent agent runs</h2>
            </div>
            <Button variant="outline" size="sm" className="shrink-0 text-primary border-primary bg-transparent hover:bg-primary/10 hover:text-primary dark:bg-white/8 dark:border-white/25 dark:text-white dark:hover:bg-white/15">
              View all runs
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {RECENT_RUNS.map(run => {
              const cfg = STATUS_CONFIG[run.status]
              const StatusIcon = cfg.icon
              return (
                <div key={run.id} className="flex items-start gap-3 rounded-xl border border-border/60 px-4 py-3.5 hover:bg-muted/50 hover:border-border cursor-pointer transition-all group">
                  <StatusIcon className={cn("h-4 w-4 mt-0.5 shrink-0", cfg.color, run.status === "running" && "animate-spin")} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors">{run.title}</p>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-muted-foreground">{run.asset}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="text-xs text-muted-foreground">{run.category}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span className="text-xs text-muted-foreground">{run.time}</span>
                    </div>
                    {run.summary && (
                      <p className="text-xs text-muted-foreground mt-1 leading-snug">{run.summary}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Agent Types */}
        <div className={cn(cardBase)}>
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">Capabilities</p>
              <h2 className="text-xl font-semibold text-foreground">Agent types</h2>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {AGENT_TYPES.map(type => (
              <div key={type.id} className="rounded-xl border border-border/60 px-4 py-3.5 hover:bg-muted/50 hover:border-border cursor-pointer transition-all group">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{type.label}</p>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-xs text-muted-foreground mb-2.5 leading-relaxed">{type.description}</p>
                <div className="flex flex-col gap-1.5">
                  {type.examplePrompts.map(p => (
                    <button
                      key={p}
                      onClick={e => { e.stopPropagation(); setQuery(p) }}
                      className="w-full text-left text-xs text-primary border border-primary/30 bg-primary/5 rounded-lg px-3 py-1.5 hover:bg-primary/10 hover:border-primary/50 transition-colors flex items-center justify-between gap-2"
                    >
                      <span>{p}</span>
                      <ArrowRight className="h-3 w-3 shrink-0 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
