import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { LogoMenuContent } from "@/components/logo-menu-content"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { FILTER_TAB_GROUP_CLS, FILTER_TAB_ITEM_CLS } from "@/components/filter-chip"
import {
  ArrowUp, Sparkle, FileText, Plus, ChevronDown,
  BarChart3, Table2, Settings2, Upload, X, Mic,
  ThumbsUp, Copy, RefreshCw, Search, AudioLines,
  Download, Share2, Mail, MoreHorizontal,
} from "lucide-react"

// ─── Mock data ────────────────────────────────────────────────────────────────

const METRICS = [
  { label: "NER ($/sf/yr)",               value: "$34.18", budget: "32.00" },
  { label: "NER to termination ($/sf/yr)", value: "$34.18", budget: null },
  { label: "NER with downtime ($/sf/yr)",  value: "$33.61", budget: null },
  { label: "NER with downtime ($/sf/mo)",  value: "$2.80",  budget: null },
  { label: "NPV",                          value: "$3,241,500", budget: "3,100,000", chevron: true },
  { label: "NPV ($/sf)",                   value: "$261.41",    budget: "250.00" },
]

const CASH_FLOW_ROWS: Array<{
  label: string
  mo1: number | string | null
  mo2: number | string | null
  mo3: number | string | null
  mo4: number | string | null
  total: number | null
  isCurrency?: boolean
  isDate?: boolean
  isNOI?: boolean
  isNeg?: boolean
  isNetCashFlow?: boolean
  isGrossTotal?: boolean
}> = [
  { label: "Start date",           mo1: "11/2026", mo2: "12/2026", mo3: "1/2027",  mo4: "2/2027",  total: null,     isDate: true },
  { label: "Base rent",            mo1: 37200,     mo2: 37200,     mo3: 37200,     mo4: 37200,     total: 3124800,  isCurrency: true },
  { label: "Gross revenue",        mo1: 37200,     mo2: 37200,     mo3: 37200,     mo4: 37200,     total: 3124800,  isGrossTotal: true },
  { label: "Net operating income", mo1: 37200,     mo2: 37200,     mo3: 37200,     mo4: 37200,     total: 3124800,  isCurrency: true, isNOI: true },
  { label: "Commissions",          mo1: -495000,   mo2: 0,         mo3: 0,         mo4: 0,         total: -495000,  isNeg: true },
  { label: "Capital",              mo1: -930000,   mo2: 0,         mo3: 0,         mo4: 0,         total: -930000,  isNeg: true },
  { label: "Net cash flow",        mo1: -1387800,  mo2: 37200,     mo3: 37200,     mo4: 37200,     total: 1699800,  isCurrency: true, isNetCashFlow: true },
]

const SUGGESTED_PROMPTS = [
  "Is this competitive for this market?",
  "What has Amazon asked for?",
  "How does this compare to round 1?",
  "Suggest a counter-proposal strategy",
]

// ─── Context data ─────────────────────────────────────────────────────────────

const TENANT_REQUIREMENTS = [
  { label: "Target size",  value: "12,000–14,000 sf" },
  { label: "Preferred term", value: "7–10 yr" },
  { label: "Max base rent", value: "$37.00/sf/yr" },
  { label: "TIA ask",      value: "$80/sf" },
  { label: "Free rent ask", value: "8 months" },
  { label: "Notes",        value: "Needs dedicated IT room and server closet on floor" },
]

const PROPOSAL_HISTORY = [
  {
    round: "Round 1",
    date: "Jul 14, 2026",
    items: [
      { label: "Base rent", value: "$38.00/sf/yr" },
      { label: "Free rent", value: "4 months" },
      { label: "TIA",       value: "$60/sf" },
      { label: "Term",      value: "84 months" },
    ],
    status: "Countered by tenant",
    statusVariant: "secondary" as const,
  },
  {
    round: "Round 2",
    date: "Aug 5, 2026",
    items: [
      { label: "Base rent", value: "$36.00/sf/yr" },
      { label: "Free rent", value: "6 months" },
      { label: "TIA",       value: "$75/sf" },
      { label: "Term",      value: "84 months" },
    ],
    status: "Active",
    statusVariant: "default" as const,
  },
]

const MARKET_BENCHMARKS = [
  { label: "Market range",  value: "$33–38/sf/yr", context: "Class A, downtown" },
  { label: "Building avg",  value: "$35.50/sf/yr", context: "Last 5 leases" },
  { label: "Budget",        value: "$32.00/sf/yr", context: "Owner minimum NER" },
  { label: "TIA market",    value: "$65–80/sf",    context: "7-yr term comps" },
]

type TabId = "info" | "term1" | "options"
type ViewMode = "table" | "chart"

// ─── Reusable form primitives ─────────────────────────────────────────────────

function FormRow({
  label, value, placeholder, required, hint,
}: {
  label: string; value?: string; placeholder?: string; required?: boolean; hint?: string
}) {
  return (
    <div className="flex items-start gap-3 min-h-[32px]">
      <span className="text-sm text-muted-foreground w-36 shrink-0 pt-1.5">
        {label}{required && <span className="text-warning ml-0.5">*</span>}
      </span>
      <div className="flex-1 space-y-0.5">
        <div className={cn(
          "h-8 rounded-md border border-input px-2.5 text-sm flex items-center bg-card",
          value ? "text-foreground" : "text-muted-foreground/50"
        )}>
          {value ?? placeholder}
        </div>
        {hint && (
          <p className="text-xs text-muted-foreground/60 px-0.5">{hint}</p>
        )}
      </div>
    </div>
  )
}

function CollapsibleSection({ label, children, defaultOpen = true, onAdd, badge }: {
  label: string
  children?: React.ReactNode
  defaultOpen?: boolean
  onAdd?: boolean
  badge?: string
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <div className="border-b border-border/60 last:border-0">
      <Button
        variant="ghost"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3 h-auto px-0 hover:bg-transparent"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{label}</span>
          {badge && <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{badge}</Badge>}
        </div>
        <div className="flex items-center gap-1.5">
          {onAdd && open && (
            <div
              onClick={e => e.stopPropagation()}
              className="h-5 w-5 rounded border border-border flex items-center justify-center text-primary hover:bg-muted"
            >
              <Plus className="h-3 w-3" />
            </div>
          )}
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", !open && "-rotate-90")} />
        </div>
      </Button>
      {open && children && <div className="pb-3 space-y-2.5">{children}</div>}
    </div>
  )
}

// ─── Financial sub-components ─────────────────────────────────────────────────

function MetricCard({ label, value, budget, chevron }: { label: string; value: string; budget: string | null; chevron?: boolean }) {
  const comparison = React.useMemo(() => {
    if (!budget) return null
    const numVal = parseFloat(value.replace(/[$,]/g, ""))
    const numBudget = parseFloat(budget.replace(/[$,]/g, ""))
    if (isNaN(numVal) || isNaN(numBudget)) return null
    const above = numVal >= numBudget
    const delta = Math.abs(numVal - numBudget)
    const isLarge = numBudget > 10000
    const formatted = isLarge
      ? `$${(delta / 1000).toFixed(0)}k`
      : `$${delta.toFixed(2)}`
    return { above, formatted }
  }, [value, budget])

  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground leading-none">{label}</p>
      <div className="flex items-baseline gap-1">
        <p className="text-base font-semibold text-foreground tracking-tight">{value}</p>
        {chevron && <ChevronDown className="h-3 w-3 text-muted-foreground" />}
      </div>
      {comparison && (
        <p className={cn("text-xs", comparison.above ? "text-success" : "text-destructive")}>
          {comparison.above ? "↑" : "↓"} {comparison.formatted} vs budget {budget}
        </p>
      )}
    </div>
  )
}

function CashFlowChart() {
  const months = Array.from({ length: 36 }, (_, i) => i + 1)
  const CHART_H = 120

  return (
    <div className="px-5 py-4">
      <div className="flex items-end gap-px" style={{ height: CHART_H }}>
        {months.map(mo => {
          const isFirst = mo === 1
          const val = isFirst ? -1387800 : 37200
          const maxAbs = 1387800
          const barH = Math.max(Math.abs(val) / maxAbs * CHART_H * 0.85, 4)
          return (
            <div key={mo} className="flex-1 flex flex-col justify-end" style={{ height: "100%" }}>
              {isFirst ? (
                <div className="w-full rounded-sm bg-muted-foreground/25" style={{ height: barH }} />
              ) : (
                <div
                  className="w-full rounded-sm"
                  style={{
                    height: barH,
                    backgroundColor: mo <= 20
                      ? "hsl(var(--muted-foreground) / 0.3)"
                      : "hsl(var(--primary) / 0.8)",
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
      <div className="flex justify-between mt-1.5">
        {[1, 12, 24, 36].map(mo => (
          <span key={mo} className="text-[9px] text-muted-foreground">MO {mo}</span>
        ))}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProposalBuilderPage({ className, isDark = false, onToggleDark }: {
  className?: string
  isDark?: boolean
  onToggleDark?: () => void
}) {
  const [activeTab, setActiveTab] = React.useState<TabId>("term1")
  const [aiOpen, setAiOpen] = React.useState(true)
  const [proposalAiVisible, setProposalAiVisible] = React.useState(true)
  const [viewMode, setViewMode] = React.useState<ViewMode>("table")
  const [logoOpen, setLogoOpen] = React.useState(false)
  const [chatInput, setChatInput] = React.useState("")
  const [messages, setMessages] = React.useState<{ role: "user" | "assistant"; content: string }[]>([])
  const bottomRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  function sendMessage(text: string) {
    const msg = text.trim()
    if (!msg) return
    setChatInput("")
    setMessages(prev => [
      ...prev,
      { role: "user", content: msg },
    ])
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: generateResponse(msg),
      }])
    }, 800)
  }

  const TABS: { id: TabId; label: string }[] = [
    { id: "info",    label: "Info" },
    { id: "term1",   label: "Term 1" },
    { id: "options", label: "Options and more" },
  ]

  return (
    <div className={cn("flex flex-col h-screen overflow-hidden gap-4 p-4", className)}>
      <div className="flex flex-1 min-h-0 rounded-2xl overflow-hidden bg-background divide-x divide-border/40">

        {/* ── Left: AI chat ────────────────────────────────────────────────── */}
        <div className="w-[340px] shrink-0 flex flex-col overflow-hidden min-h-0 bg-card">

          {/* Header */}
          <div className="flex items-center justify-between gap-2 px-4 pt-4 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <Popover open={logoOpen} onOpenChange={setLogoOpen}>
                <PopoverTrigger render={<div />} nativeButton={false} className="cursor-pointer focus:outline-none" aria-label="Open settings">
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0 overflow-hidden" align="start">
                  <LogoMenuContent isDark={isDark} onToggleDark={onToggleDark} onClose={() => setLogoOpen(false)} />
                </PopoverContent>
              </Popover>
              <h2 className="text-xl font-semibold text-foreground">Proposal builder</h2>
            </div>
            <div className="flex items-center">
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Proposal AI card */}
          {proposalAiVisible && (
            <div className="mx-4 mb-3 rounded-xl border border-primary/25 bg-primary/5 p-3 shrink-0 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkle className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Proposal AI</span>
                </div>
                <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground" onClick={() => setProposalAiVisible(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Upload an LOI to auto-fill the proposal.</p>
              <Button variant="default" size="sm" className="w-full gap-2">
                <Upload className="h-3.5 w-3.5" />Upload
              </Button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {messages.length === 0 ? (
              <div className="flex flex-col justify-end h-full pb-1">
                <div className="flex flex-wrap gap-2">
                    {SUGGESTED_PROMPTS.map(p => (
                      <Button key={p} variant="outline" size="sm"
                        className="rounded-full shrink-0 whitespace-nowrap"
                        onClick={() => sendMessage(p)}>
                        {p}
                      </Button>
                    ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={cn("flex gap-2", m.role === "user" && "flex-row-reverse")}>
                  <div className={cn("flex flex-col gap-1", m.role === "user" && "items-end")}>
                    <div className={cn(
                      "rounded-xl px-3 py-2.5 text-sm text-foreground leading-relaxed max-w-[248px]",
                      m.role === "user" ? "bg-primary/10" : "bg-muted/40"
                    )}>
                      {m.content}
                    </div>
                    {m.role === "assistant" && (
                      <div className="flex items-center gap-0.5 px-0.5">
                        <Button variant="ghost" size="icon-sm" className="text-muted-foreground h-5 w-5"><ThumbsUp className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon-sm" className="text-muted-foreground h-5 w-5"><Copy className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon-sm" className="text-muted-foreground h-5 w-5"><RefreshCw className="h-3 w-3" /></Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 px-4 pb-4 pt-2">
            <div className="rounded-2xl border border-border bg-card px-4 pt-3 pb-2">
              <Textarea
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(chatInput) } }}
                placeholder="What would you like to draft or evaluate?"
                className="w-full resize-none text-sm border-none shadow-none bg-transparent focus-visible:ring-0 p-0 min-h-10"
                rows={1}
              />
              <div className="flex items-center justify-between mt-2">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                  <Plus className="h-3.5 w-3.5" />Add
                </Button>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Mic className="h-4 w-4" />
                  </Button>
                  {chatInput.trim() ? (
                    <Button size="icon" onClick={() => sendMessage(chatInput)}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button size="icon" onClick={() => {}}>
                      <AudioLines className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Center: Form panel ───────────────────────────────────────────────── */}
        {aiOpen && (
          <div className="w-[400px] shrink-0 flex flex-col overflow-hidden min-h-0 bg-card">
            <div className="flex flex-col flex-1 min-h-0 px-4 pt-4">

            {/* Tabs */}
            <div className="flex items-center gap-0.5 pb-2 -mx-1 shrink-0">
              {TABS.map(tab => (
                <Button
                  key={tab.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap h-auto",
                    activeTab === tab.id
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </Button>
              ))}
              <Button variant="ghost" size="sm" className="ml-auto flex items-center gap-1 text-[11px] text-primary font-medium px-2 py-1 rounded-lg h-auto">
                <Plus className="h-3 w-3" />Term
              </Button>
            </div>

            <Separator />

            {/* Tab body */}
            <div className="flex-1 overflow-y-auto py-3">
              {activeTab === "info"    && <InfoTab />}
              {activeTab === "term1"   && <Term1Tab />}
              {activeTab === "options" && <OptionsTab />}
            </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-border/60 shrink-0">
              <Button variant="outline" size="sm" className="h-9 flex-1">Save</Button>
              <Button size="sm" className="h-9 flex-1">Save and draft LOI</Button>
            </div>
          </div>
        )}

        {/* ── Right: Financial view ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden min-h-0">

          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-card shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium text-foreground truncate">Amazon Inc. — VTS Tower, Fl. 8</span>
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 shrink-0">Draft</Badge>
              {!aiOpen && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-7 text-xs shrink-0"
                  onClick={() => setAiOpen(true)}
                >
                  <Sparkle className="h-3.5 w-3.5 text-primary" />
                  Proposal AI
                  <Badge variant="secondary" className="text-[9px] h-4 px-1">Beta</Badge>
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
                <Download className="h-3.5 w-3.5" />Export
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
                <Mail className="h-3.5 w-3.5" />Email
              </Button>
              <Button size="sm" className="gap-1.5 text-xs h-7">
                <Share2 className="h-3.5 w-3.5" />Share
              </Button>
              <div className="w-px h-4 bg-border/60 mx-1" />
              <Button variant="ghost" size="icon-sm" className="h-7 w-7 text-muted-foreground"
                onClick={() => { window.location.hash = "#/dashboard" }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">

            {/* Context card */}
            <div className="rounded-xl border border-border/60 bg-card">
              <div className="grid grid-cols-2 divide-x divide-border/40">
                <div className="p-5">
                  <TenantRequirementsCard />
                </div>
                <div className="p-5">
                  <MarketBenchmarkStrip />
                </div>
              </div>
            </div>

            {/* Metrics + cash flow card */}
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              {/* Key metrics */}
              <div className="p-5 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-foreground">Key metrics</h3>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                    <Settings2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                  {METRICS.map(m => <MetricCard key={m.label} {...m} />)}
                </div>
              </div>

              <Separator />

              {/* Cash flow */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-border/60">
                <h3 className="text-base font-semibold text-foreground">Cash flow</h3>
                <div className="flex items-center gap-1.5">
                  <ToggleGroup type="single" value={viewMode} onValueChange={v => v && setViewMode(v as ViewMode)} className={FILTER_TAB_GROUP_CLS}>
                    <ToggleGroupItem value="chart" size="sm" className={cn(FILTER_TAB_ITEM_CLS, "flex items-center gap-1")}>
                      <BarChart3 className="h-3 w-3" />Chart
                    </ToggleGroupItem>
                    <ToggleGroupItem value="table" size="sm" className={cn(FILTER_TAB_ITEM_CLS, "flex items-center gap-1")}>
                      <Table2 className="h-3 w-3" />Table
                    </ToggleGroupItem>
                  </ToggleGroup>
                  <Button variant="outline" size="sm" className="h-6 px-2 text-xs gap-1 font-normal">
                    Monthly <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                    <Settings2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              {viewMode === "table" ? <CashFlowTable /> : <CashFlowChart />}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Cash flow table ──────────────────────────────────────────────────────────

function CashFlowTable() {
  return (
    <div className="overflow-x-auto pb-4">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border/40">
            <th className="text-left font-medium text-muted-foreground px-5 py-2.5 w-44" />
            <th className="text-right font-semibold text-foreground px-4 py-2.5 w-32">Total</th>
            {["MO 1", "MO 2", "MO 3", "MO 4"].map(h => (
              <th key={h} className="text-right font-medium text-muted-foreground px-4 py-2.5 w-28">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CASH_FLOW_ROWS.map(row => (
            <tr
              key={row.label}
              className={cn(
                "border-b border-border/30 last:border-0",
                row.isNetCashFlow && "border-t border-border",
                row.isNOI && "border-t border-border/60"
              )}
            >
              <td className={cn("px-5 py-2 text-muted-foreground", (row.isNOI || row.isNetCashFlow || row.isGrossTotal) && "font-semibold text-foreground")}>
                {row.label}
              </td>
              {row.isDate ? (
                <>
                  <td />
                  {[row.mo1, row.mo2, row.mo3, row.mo4].map((v, j) => (
                    <td key={j} className="px-4 py-2 text-right text-muted-foreground">{v as string}</td>
                  ))}
                </>
              ) : (
                <>
                  <td className={cn(
                    "px-4 py-2 text-right font-medium tabular-nums",
                    row.isNetCashFlow
                      ? (row.total ?? 0) >= 0 ? "text-success" : "text-destructive"
                      : row.isNeg ? "text-muted-foreground"
                      : "text-foreground"
                  )}>
                    {row.isCurrency && (row.total ?? 0) >= 0 && "$ "}
                    {row.total !== null ? (row.total < 0 ? `(${Math.abs(row.total).toLocaleString()})` : row.total.toLocaleString()) : ""}
                  </td>
                  {[row.mo1, row.mo2, row.mo3, row.mo4].map((raw, j) => {
                    const v = raw as number
                    return (
                      <td key={j} className={cn(
                        "px-4 py-2 text-right tabular-nums",
                        row.isNetCashFlow
                          ? v >= 0 ? "text-success font-medium" : "text-destructive font-medium"
                          : row.isNeg ? "text-muted-foreground"
                          : "text-foreground"
                      )}>
                        {row.isCurrency && v >= 0 && "$ "}
                        {v < 0 ? `(${Math.abs(v).toLocaleString()})` : v > 0 ? v.toLocaleString() : "0.00"}
                      </td>
                    )
                  })}
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Context components ───────────────────────────────────────────────────────

function MarketBenchmarkStrip() {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-foreground">Market context</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {MARKET_BENCHMARKS.map(b => (
          <div key={b.label}>
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-0.5">{b.label}</p>
            <p className="text-base font-semibold text-foreground">{b.value}</p>
            <p className="text-xs text-muted-foreground">{b.context}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function TenantRequirementsCard() {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-foreground">Amazon requirements</h3>
      <div className="space-y-2">
        {TENANT_REQUIREMENTS.map(r => (
          <div key={r.label} className="flex items-start justify-between gap-3">
            <span className="text-xs text-muted-foreground shrink-0">{r.label}</span>
            <span className="text-xs font-medium text-foreground text-right">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProposalHistoryCard() {
  return (
    <div className="space-y-2.5">
      {PROPOSAL_HISTORY.map((round, idx) => (
        <div
          key={round.round}
          className={cn(
            "rounded-xl border p-3 space-y-2",
            idx === PROPOSAL_HISTORY.length - 1
              ? "border-primary/25 bg-primary/5"
              : "border-border/60 bg-background/40"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">{round.round}</span>
              <span className="text-xs text-muted-foreground">{round.date}</span>
            </div>
            <Badge
              variant={idx === PROPOSAL_HISTORY.length - 1 ? "default" : "secondary"}
              className="text-[9px] h-4 px-1.5"
            >
              {round.status}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {round.items.map(item => (
              <div key={item.label} className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className="text-xs font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Tab content ──────────────────────────────────────────────────────────────

function InfoTab() {
  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground"><span className="text-warning font-bold">*</span> Required</p>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Proposal template</p>
        <FormRow label="Template" placeholder="Select template" />
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">Proposal info</p>
        <FormRow label="Proposal name"  value="Amazon Inc. — VTS Tower" />
        <FormRow label="Proposal type"  value="Landlord Proposal" />
        <FormRow label="Proposal date"  value="08/05/2026" required />
        <FormRow label="Lease type"     value="Full Service Gross" />
        <FormRow label="Discount rate"  value="20 %" />
        <FormRow label="Execution date" placeholder="MM/DD/YYYY" />
      </div>
    </div>
  )
}

function Term1Tab() {
  return (
    <div className="space-y-3">
      <div>
        <CollapsibleSection label="Overview">
          <FormRow label="Term type"          value="New" />
          <FormRow label="Spaces"             value="Suite 800, Floor 8" />
          <FormRow label="Rentable size"      value="12,400 sf" required hint="Tenant ask: 12,000–14,000 sf" />
          <FormRow label="Downtime"           placeholder="mo" />
          <FormRow label="Tenant possession"  placeholder="MM/DD/YYYY" />
          <FormRow label="Tenant buildout"    placeholder="Days" />
          <FormRow label="Commencement date"  value="11/01/2026" required />
          <FormRow label="Term duration"      value="84 mo" required hint="Tenant preference: 7–10 yr" />
          <FormRow label="Rent commencement"  placeholder="MM/DD/YYYY" />
          <FormRow label="Lock-in end"        placeholder="MM/DD/YYYY" />
        </CollapsibleSection>

        <CollapsibleSection label="Income">
          <p className="text-xs font-semibold text-foreground">Base rent</p>
          <FormRow label="Starts (mo)" value="1" required />
          <FormRow
            label="Amount"
            value="36.00 $/sf/yr"
            required
            hint="Market: $33–38 · Building avg: $35.50 · Budget: $32.00"
          />
          <Button variant="ghost" size="sm" className="text-xs text-primary font-medium flex items-center gap-1 h-auto px-0">
            <Plus className="h-3 w-3" />Base rent
          </Button>
          <Separator className="my-1" />
          <p className="text-xs font-semibold text-muted-foreground">Base rent escalation</p>
          <Button variant="outline" size="icon" className="h-6 w-6 rounded text-primary hover:bg-muted">
            <Plus className="h-3 w-3" />
          </Button>
          <p className="text-xs font-semibold text-muted-foreground">Free rent</p>
          <FormRow label="Months" value="6 mo" hint="Tenant ask: 8 mo · Market typical: 4–8 mo" />
          <p className="text-xs font-semibold text-muted-foreground">Other income</p>
          <Button variant="outline" size="icon" className="h-6 w-6 rounded text-primary hover:bg-muted">
            <Plus className="h-3 w-3" />
          </Button>
        </CollapsibleSection>

        <CollapsibleSection label="Capital" defaultOpen={false}>
          <p className="text-xs font-semibold text-foreground">Tenant improvement allowance</p>
          <FormRow label="Amount" value="$75.00 $/sf" hint="Tenant ask: $80/sf · Market: $65–80/sf" />
        </CollapsibleSection>

        <CollapsibleSection label="Expenses and recoveries" defaultOpen={false} onAdd>
          <p className="text-xs text-muted-foreground">No expenses or recoveries added.</p>
        </CollapsibleSection>

        <CollapsibleSection label="Commission" defaultOpen={false}>
          <FormRow label="Type"         value="Landlord" />
          <FormRow label="Broker"       value="CBRE" />
          <FormRow label="Structure"    value="% of total rent" />
          <FormRow label="Amount"       value="4.00 %" required />
          <FormRow label="Payout month" value="1" required />
        </CollapsibleSection>

        <CollapsibleSection label="Remaining lease obligations" defaultOpen={false} onAdd />
      </div>
    </div>
  )
}

function OptionsTab() {
  return (
    <div>
      {/* Proposal history */}
      <CollapsibleSection label="Proposal history" badge="2 rounds">
        <ProposalHistoryCard />
      </CollapsibleSection>

      <CollapsibleSection label="Options and rights">
        <div className="space-y-2">
          {[
            { title: "Renewal option",       type: "Option",    desc: "1 × 5 yr at fair market value, 12 months notice required" },
            { title: "Right of first offer",  type: "Expansion", desc: "Adjacent suite on Floor 8, on same economic terms" },
          ].map(opt => (
            <div key={opt.title} className="rounded-xl border border-border/60 bg-background/60 p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">{opt.title}</span>
                <Badge variant="outline" className="text-[9px]">{opt.type}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{opt.desc}</p>
            </div>
          ))}
          <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-xs text-primary font-medium h-auto px-0">
            <Plus className="h-3.5 w-3.5" />Add option or right
          </Button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection label="Lease info" defaultOpen={false} onAdd />
      <CollapsibleSection label="Tenant risks" defaultOpen={false} onAdd />
      <CollapsibleSection label="Proposal notes" defaultOpen={false} onAdd />
    </div>
  )
}

// ─── Simulated AI response ────────────────────────────────────────────────────

function generateResponse(text: string): string {
  const t = text.toLowerCase()
  if (t.includes("competi")) return "This proposal is competitive for Class A space in this submarket. The $36.00/sf/yr base rent is in line with comparable deals closed in the past 6 months, which ranged from $33–38/sf/yr. The 6 months of free rent and $75/sf TIA are standard for a 7-year term, and close to what Amazon asked for."
  if (t.includes("amazon") || t.includes("requir") || t.includes("ask")) return "Amazon's requirements for Round 2: 12,000–14,000 sf on a 7–10 year term. They asked for $37.00/sf/yr max base rent (you're at $36.00, within that), $80/sf TIA (you're offering $75, a $5/sf gap), 8 months free rent (you're offering 6), and they need a dedicated IT room and server closet on the floor. The biggest gap is TIA: closing to $78/sf would cost ~$25K more but likely land the deal."
  if (t.includes("round") || t.includes("previous") || t.includes("history") || t.includes("compare")) return "Round 1 (Jul 14): $38.00/sf/yr, 4 months free, $60/sf TIA. Amazon countered, wanting lower rent, more free rent, and higher TIA. Round 2 (current, Aug 5): $36.00/sf/yr, 6 months free, $75/sf TIA. You've moved $2/sf on rent, added 2 months free, and increased TIA by $15/sf. The main remaining gap is the $5/sf TIA delta and the 2 months of free rent."
  if (t.includes("effective") || t.includes("rent")) return "After accounting for 6 months of free rent across the 84-month term, the effective base rent is approximately $33.43/sf/yr. After the $75/sf TIA ($930,000), the amortized landlord cost reduces the effective NER to approximately $34.18/sf/yr as shown in the metrics, comfortably above the $32.00/sf/yr budget."
  if (t.includes("memo") || t.includes("summary") || t.includes("summar")) return "Key deal points: 12,400 sf on Floor 8, 84-month term commencing 11/1/2026, $36.00/sf/yr base rent, 6 months free rent, $75/sf TIA, 4% landlord commission, renewal option 1×5 yr at FMV, right of first offer on adjacent suite. Effective NER: $34.18/sf/yr. NPV: $3.24M. This is Round 2; Amazon countered Round 1 requesting concessions on TIA and free rent."
  if (t.includes("counter")) return "Consider closing the TIA gap by moving from $75 to $78/sf ($37K more). This addresses Amazon's main sticking point while staying within the market range. Alternatively, offer 7 months free rent instead of 8 but increase TIA to $77/sf. Either move signals flexibility without materially impacting NER, which stays above the $32.00/sf/yr budget floor."
  return "I'm analyzing that against the current proposal terms for Amazon Inc. at VTS Tower, Floor 8. Based on the deal structure, here's what I found: the 84-month term with $36.00/sf/yr and 6 months free rent results in an effective NER of $34.18/sf/yr, which is above the budget threshold of $32.00/sf/yr. Would you like me to model any alternative scenarios?"
}
