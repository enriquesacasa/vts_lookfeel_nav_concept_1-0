import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { LogoMenuContent } from "@/components/logo-menu-content"
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
  "Effective rent after free rent and TIA?",
  "Summarize for an approval memo",
  "Suggest a counter-proposal strategy",
]

type TabId = "info" | "term1" | "options"
type ViewMode = "table" | "chart"

// ─── Reusable form primitives ─────────────────────────────────────────────────

function FormRow({ label, value, placeholder, required }: { label: string; value?: string; placeholder?: string; required?: boolean }) {
  return (
    <div className="flex items-center gap-3 min-h-[32px]">
      <span className="text-sm text-muted-foreground w-36 shrink-0">
        {label}{required && <span className="text-primary ml-0.5">*</span>}
      </span>
      <div className={cn(
        "flex-1 h-8 rounded-md border border-input px-2.5 text-sm flex items-center bg-background",
        value ? "text-foreground" : "text-muted-foreground/50"
      )}>
        {value ?? placeholder}
      </div>
    </div>
  )
}

function CollapsibleSection({ label, children, defaultOpen = true, onAdd }: {
  label: string
  children?: React.ReactNode
  defaultOpen?: boolean
  onAdd?: boolean
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <div className="border-b border-border/60 last:border-0">
      <Button
        variant="ghost"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3 h-auto px-0 hover:bg-transparent"
      >
        <span className="text-sm font-semibold text-foreground">{label}</span>
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
  return (
    <div className="space-y-1 py-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex items-center gap-1">
        <p className="text-[22px] font-semibold text-foreground tracking-tight leading-none">{value}</p>
        {chevron && <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
      </div>
      {budget && <p className="text-xs text-muted-foreground">Budget: {budget}</p>}
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
  const [viewMode, setViewMode] = React.useState<ViewMode>("table")
  const [logoOpen, setLogoOpen] = React.useState(false)
  const [chatInput, setChatInput] = React.useState("")
  const [messages, setMessages] = React.useState<{ role: "user" | "assistant"; content: string }[]>([
    {
      role: "assistant",
      content: "I've loaded the proposal for Amazon Inc. at VTS Tower. I can help you evaluate deal competitiveness, model term scenarios, draft talking points, or summarize key economics. What would you like to explore?",
    },
  ])
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
      <div className="flex flex-1 min-h-0 gap-4">

        {/* ── Left: Form panel ─────────────────────────────────────────────── */}
        <div className="w-[400px] shrink-0 flex flex-col rounded-2xl bg-card/70 backdrop-blur-md overflow-hidden min-h-0">

          <div className="flex flex-col flex-1 min-h-0 px-4 pt-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-3">
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
            <Button variant="outline" size="sm" className="h-8 text-xs">Save</Button>
            <Button size="sm" className="h-8 text-xs flex-1">Save and generate LOI</Button>
          </div>
        </div>

        {/* ── Center: AI chat ───────────────────────────────────────────────── */}
        {aiOpen && (
          <div className="w-[340px] shrink-0 flex flex-col rounded-2xl bg-card/70 backdrop-blur-md overflow-hidden min-h-0">

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {messages.length <= 1 ? (
                <div className="flex flex-col justify-end h-full pb-1">
                  <div className="flex flex-col gap-2">
                    <div className="rounded-xl px-3 py-2.5 text-sm text-foreground leading-relaxed bg-muted/40 max-w-[85%]">
                      {messages[0]?.content ?? "How can I help with this proposal?"}
                    </div>
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
        )}

        {/* ── Right: Financial view ─────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 rounded-2xl bg-card/70 backdrop-blur-md overflow-hidden min-h-0">

          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-card/80 shrink-0">
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
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <h2 className="text-xl font-semibold text-foreground">Term 1 cash flow</h2>

            {/* Metrics card */}
            <div className="rounded-xl border border-border/60 bg-background/50 p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-foreground">Metrics</h3>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                {METRICS.map(m => <MetricCard key={m.label} {...m} />)}
              </div>
            </div>

            {/* Net cash flow card */}
            <div className="rounded-xl border border-border/60 bg-background/50 overflow-hidden">
              {/* Card header */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-border/60">
                <span className="text-sm font-semibold text-foreground">Net cash flow</span>
                <span className="text-sm text-muted-foreground">Frequency</span>
                <div className="flex items-center gap-1 border border-border rounded-lg px-2.5 h-7 text-xs text-foreground cursor-pointer hover:bg-muted">
                  Monthly <ChevronDown className="h-3 w-3 ml-1 text-muted-foreground" />
                </div>
                <div className="flex gap-0.5 ml-1">
                  {(["chart", "table"] as ViewMode[]).map(v => (
                    <Button
                      key={v}
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewMode(v)}
                      className={cn(
                        "h-7 px-3 rounded-md text-xs font-medium capitalize transition-colors flex items-center gap-1",
                        viewMode === v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {v === "chart" ? <><BarChart3 className="h-3 w-3" />Chart</> : <><Table2 className="h-3 w-3" />Table</>}
                    </Button>
                  ))}
                  <Button variant="ghost" size="sm" className="h-7 px-3 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground">Total</Button>
                  <Button variant="ghost" size="sm" className="h-7 px-3 rounded-md text-xs font-medium bg-foreground text-background">/Area</Button>
                </div>
                <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                  <Settings2 className="h-4 w-4" />
                </Button>
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
    <div className="overflow-x-auto">
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

// ─── Tab content ──────────────────────────────────────────────────────────────

function InfoTab() {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-primary/25 bg-primary/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkle className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Proposal AI</span>
          <Badge variant="secondary" className="text-[9px] h-4 px-1.5">Beta</Badge>
        </div>
        <p className="text-xs text-muted-foreground">Drag and drop or upload your LOI to auto-fill the proposal.</p>
        <Button variant="default" size="sm" className="w-full gap-2">
          <Upload className="h-3.5 w-3.5" />Upload to start
        </Button>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Proposal template</p>
        <FormRow label="Template" placeholder="Select template" />
      </div>

      <Separator />

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Proposal info</p>
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
    <div>
      <CollapsibleSection label="Overview">
        <FormRow label="Term type"          value="New" />
        <FormRow label="Spaces"             value="Suite 800, Floor 8" />
        <FormRow label="Rentable size"      value="12,400 sf" required />
        <FormRow label="Downtime"           placeholder="mo" />
        <FormRow label="Tenant possession"  placeholder="MM/DD/YYYY" />
        <FormRow label="Tenant buildout"    placeholder="Days" />
        <FormRow label="Commencement date"  value="11/01/2026" required />
        <FormRow label="Term duration"      value="84 mo" required />
        <FormRow label="Rent commencement"  placeholder="MM/DD/YYYY" />
        <FormRow label="Lock-in end"        placeholder="MM/DD/YYYY" />
      </CollapsibleSection>

      <CollapsibleSection label="Income">
        <p className="text-xs font-semibold text-foreground">Base rent</p>
        <FormRow label="Starts (mo)" value="1" required />
        <FormRow label="Amount"      value="36.00 $/sf/yr" required />
        <Button variant="ghost" size="sm" className="text-xs text-primary font-medium flex items-center gap-1 h-auto px-0">
          <Plus className="h-3 w-3" />Base rent
        </Button>
        <Separator className="my-1" />
        <p className="text-xs font-semibold text-muted-foreground">Base rent escalation</p>
        <Button variant="outline" size="icon" className="h-6 w-6 rounded text-primary hover:bg-muted">
          <Plus className="h-3 w-3" />
        </Button>
        <p className="text-xs font-semibold text-muted-foreground">Free rent</p>
        <FormRow label="Months" value="6 mo" />
        <p className="text-xs font-semibold text-muted-foreground">Other income</p>
        <Button variant="outline" size="icon" className="h-6 w-6 rounded text-primary hover:bg-muted">
          <Plus className="h-3 w-3" />
        </Button>
      </CollapsibleSection>

      <CollapsibleSection label="Capital" defaultOpen={false}>
        <p className="text-xs font-semibold text-foreground">Tenant improvement allowance</p>
        <FormRow label="Amount" value="$75.00 $/sf" />
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
  )
}

function OptionsTab() {
  return (
    <div>
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
  if (t.includes("competi")) return "This proposal is competitive for Class A space in this submarket. The $36.00/sf/yr base rent is in line with comparable deals closed in the past 6 months, which ranged from $33–$38/sf/yr. The 6 months of free rent and $75/sf TIA are standard for a 7-year term."
  if (t.includes("effective") || t.includes("rent")) return "After accounting for 6 months of free rent across the 84-month term, the effective base rent is approximately $33.43/sf/yr. After the $75/sf TIA ($930,000), the amortized landlord cost reduces the effective NER to approximately $34.18/sf/yr as shown in the metrics."
  if (t.includes("memo") || t.includes("summary") || t.includes("summar")) return "Key deal points: 12,400 sf on Floor 8, 84-month term commencing 11/1/2026, $36.00/sf/yr base rent, 6 months free rent, $75/sf TIA, 4% landlord commission, renewal option 1×5 yr at FMV, right of first offer on adjacent suite. Effective NER: $34.18/sf/yr. NPV: $3.24M."
  if (t.includes("counter")) return "Consider countering on the TIA — proposing $65/sf instead of $75/sf would save $124,000 in upfront capital while remaining competitive. Alternatively, reducing free rent from 6 to 4 months improves the NER by ~$0.50/sf/yr. If the tenant pushes back on rent, offer a stepped structure: $34 Year 1, escalating at 3% per year."
  return "I'm analyzing that against the current proposal terms for Amazon Inc. at VTS Tower, Floor 8. Based on the deal structure, here's what I found: the 84-month term with $36.00/sf/yr and 6 months free rent results in an effective NER of $34.18/sf/yr, which is slightly above the budget threshold of $32.00/sf/yr. Would you like me to model any alternative scenarios?"
}
