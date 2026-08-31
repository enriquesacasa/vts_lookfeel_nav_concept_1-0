import * as React from "react"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card } from "@/components/ui/card"
import { LogoMenuContent } from "@/components/logo-menu-content"
import {
  ArrowUp, PanelLeft, ChevronDown, MoreHorizontal,
  FilePlus2, Mail, ExternalLink, Search, Mic, AudioLines,
  Plus, X, ArrowLeft, Play, ThumbsUp, Copy, RefreshCw,
  Clock, Activity,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "user" | "assistant"

interface AgentMessage {
  id: string
  role: Role
  content: string
  timestamp: string
}

interface AgentSession {
  id: string
  title: string
  time: string
  messages: AgentMessage[]
}

interface AgentType {
  id: string
  name: string
  description: string
}

interface ActiveAgent {
  id: string
  name: string
  schedule: string
  status: "active" | "paused"
  lastRun: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

interface AgentTypeDefaults {
  trigger: string
  frequency: string
  tone: string
  rcpAssetMgr: boolean
  rcpBroker: boolean
  rcpTenantRep: boolean
  rcpLawyer: boolean
  rcpOwner: boolean
  subject: string
  chatPrompt: string
}

const AGENT_TYPES: (AgentType & { defaults: AgentTypeDefaults })[] = [
  {
    id: "pipeline-velocity", name: "Pipeline velocity digest",
    description: "Weekly summary of deal stage movement, velocity trends, and stall risks across your portfolio",
    defaults: { trigger: "Scheduled", frequency: "Weekly", tone: "Concise", rcpAssetMgr: true, rcpBroker: false, rcpTenantRep: false, rcpLawyer: false, rcpOwner: false, subject: "Pipeline update · {Asset} | {Date}", chatPrompt: "Set up a weekly pipeline velocity digest for asset managers." },
  },
  {
    id: "stall-alert", name: "Deal stall alert",
    description: "Triggered when a deal has had no activity for N days · notifies broker and AM before momentum is lost",
    defaults: { trigger: "On threshold", frequency: "Daily", tone: "Direct", rcpAssetMgr: true, rcpBroker: true, rcpTenantRep: false, rcpLawyer: false, rcpOwner: false, subject: "Deal stall alert · {Asset} | {Date}", chatPrompt: "Alert the asset manager and broker when a deal has no update for 7 days." },
  },
  {
    id: "action-digest", name: "Action required digest",
    description: "Consolidates all open action items by deal party · brokers, tenant reps, lawyers · sent before they fall through the cracks",
    defaults: { trigger: "Scheduled", frequency: "Weekly", tone: "Concise", rcpAssetMgr: false, rcpBroker: true, rcpTenantRep: true, rcpLawyer: true, rcpOwner: false, subject: "Action items · {Agent name} | {Date}", chatPrompt: "Create a weekly action digest summarizing open items for each deal party." },
  },
  {
    id: "milestone", name: "Milestone alert",
    description: "Proactive alerts when lease expirations, option windows, or key deal milestones are approaching",
    defaults: { trigger: "On threshold", frequency: "Daily", tone: "Formal", rcpAssetMgr: true, rcpBroker: false, rcpTenantRep: false, rcpLawyer: true, rcpOwner: true, subject: "Milestone alert · {Asset} | {Date}", chatPrompt: "Notify me when a lease milestone or expiration date is approaching." },
  },
]

const ACTIVE_AGENTS: ActiveAgent[] = [
  { id: "a1", name: "VTS Tower · AM weekly velocity",    schedule: "Mon · 9:00 AM",          status: "active", lastRun: "Today, 9:01 AM" },
  { id: "a2", name: "Stall alert · 7-day threshold",     schedule: "Threshold · 7 days idle", status: "active", lastRun: "Yesterday, 2:14 PM" },
  { id: "a3", name: "Broker action digest · Fridays",    schedule: "Fri · 4:00 PM",           status: "active", lastRun: "Aug 22, 4:01 PM" },
  { id: "a4", name: "Lease expiration · 90-day notice",  schedule: "Threshold · 90 days out", status: "paused", lastRun: "Aug 15" },
]

const SESSIONS: AgentSession[] = [
  {
    id: "s1", title: "VTS Tower · AM weekly velocity", time: "Today",
    messages: [
      { id: "m1", role: "user",      timestamp: "8:55 AM", content: "Set up a weekly pipeline velocity digest for VTS Tower asset managers, every Monday at 9am. Include stall risks and stage movement." },
      { id: "m2", role: "assistant", timestamp: "9:01 AM", content: "Monitor configured for VTS Tower. It runs every Monday at 9:00 AM and sends a pipeline velocity summary to your asset managers, including deal stage movement, velocity trends, and any deals at risk of stalling. Adjust the content sections and recipient list in the settings panel." },
    ],
  },
  {
    id: "s2", title: "Stall alert · 7-day threshold", time: "Yesterday",
    messages: [
      { id: "m1", role: "user",      timestamp: "2:10 PM", content: "Alert the asset manager and broker when any deal goes 7 days without an update. I want to catch stalls before they become problems." },
      { id: "m2", role: "assistant", timestamp: "2:14 PM", content: "Stall alert configured with a 7-day idle threshold. It monitors all active deals and sends an alert to the assigned asset manager and broker as soon as a deal crosses the threshold. You can tune the threshold or add more recipients in the settings panel." },
    ],
  },
  {
    id: "s3", title: "Broker action digest · Fridays", time: "Aug 22",
    messages: [
      { id: "m1", role: "user",      timestamp: "3:55 PM", content: "Create a Friday afternoon digest that consolidates all open action items for brokers and tenant reps. Send it at 4pm so they can act before the weekend." },
      { id: "m2", role: "assistant", timestamp: "4:01 PM", content: "Action digest scheduled for every Friday at 4:00 PM. It consolidates open action items assigned to brokers, tenant reps, and lawyers across all active deals, and sends each party only their own items. Update the recipient list or content sections in the settings panel." },
    ],
  },
]

function generateAgentResponse(text: string): string {
  const l = text.toLowerCase()
  if (l.includes("stall") || l.includes("no update") || l.includes("inactive") || l.includes("idle"))
    return "Stall alert configured. It monitors all active deals and triggers when no update is recorded for your chosen threshold, then notifies the assigned asset manager and broker. Set the idle threshold and recipients in the settings panel."
  if (l.includes("velocity") || l.includes("pipeline") || l.includes("stage movement"))
    return "Pipeline velocity digest configured. It summarizes deal stage movement, velocity trends, and stall risks across your portfolio, and sends to asset managers on your chosen schedule. Review the content sections in the settings panel."
  if (l.includes("action") || l.includes("digest") || l.includes("broker") || l.includes("tenant rep"))
    return "Action required digest configured. It consolidates open action items by deal party and sends each recipient only their own items on your chosen schedule. Add or remove recipients in the settings panel."
  if (l.includes("milestone") || l.includes("expir") || l.includes("renewal") || l.includes("option") || l.includes("90 day") || l.includes("notice"))
    return "Milestone alert configured. It will notify asset managers, lawyers, and owners when lease expirations, option windows, or other key milestones are approaching. Set the advance notice window and recipients in the settings panel."
  if (l.includes("owner") || l.includes("portfolio") || l.includes("monthly"))
    return "Portfolio update configured. It will summarize ownership-level deal metrics and send to owners on your chosen schedule. Adjust the scope and content in the settings panel."
  return "Monitor configured. Adjust the schedule, trigger threshold, and recipients in the settings panel, then save and run it or let it fire on its schedule."
}

// ─── Left rail ────────────────────────────────────────────────────────────────

function AgentRail({
  activeAgentId,
  onSelectAgent,
  onSelectType,
  onNewAgent,
  collapsed,
  onToggleCollapse,
  logoOpen,
  onLogoOpenChange,
  isDark,
  onToggleDark,
}: {
  activeAgentId: string
  onSelectAgent: (id: string) => void
  onSelectType: (typeId: string) => void
  onNewAgent: () => void
  collapsed: boolean
  onToggleCollapse: () => void
  logoOpen: boolean
  onLogoOpenChange: (open: boolean) => void
  isDark: boolean
  onToggleDark?: () => void
}) {
  const [typesOpen, setTypesOpen]  = React.useState(true)
  const [agentsOpen, setAgentsOpen] = React.useState(true)

  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-3 gap-3 flex-1">
        <Button variant="ghost" size="icon" onClick={onToggleCollapse}>
          <PanelLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onToggleCollapse}>
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onNewAgent}>
          <FilePlus2 className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <Activity className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-56">
            {AGENT_TYPES.map(t => (
              <DropdownMenuItem key={t.id} className="gap-2 text-sm">
                <span className="truncate">{t.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <Clock className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-56">
            {ACTIVE_AGENTS.map(a => (
              <DropdownMenuItem key={a.id} className="gap-2 text-sm" onClick={() => onSelectAgent(a.id)}>
                <span className="truncate">{a.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 p-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Popover open={logoOpen} onOpenChange={onLogoOpenChange}>
            <PopoverTrigger render={<div />} nativeButton={false} className="cursor-pointer focus:outline-none" aria-label="Open settings">
              <Activity className="h-5 w-5 text-primary shrink-0" />
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0 overflow-hidden" align="start">
              <LogoMenuContent isDark={isDark} onToggleDark={onToggleDark} onClose={() => onLogoOpenChange(false)} />
            </PopoverContent>
          </Popover>
          <h2 className="text-xl font-semibold text-foreground">Deal monitor</h2>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onToggleCollapse}>
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* New agent button */}
      <Button variant="outline" size="sm" className="gap-1.5 w-full mb-4" onClick={onNewAgent}>
        <FilePlus2 className="h-3.5 w-3.5" />
        New monitor
      </Button>

      {/* Content */}
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto gap-4">

        {/* Monitor types */}
        <Collapsible open={typesOpen} onOpenChange={setTypesOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full mb-2">
            <span className="text-sm font-medium text-foreground">Monitor types</span>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", !typesOpen && "-rotate-90")} />
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-0.5">
            {AGENT_TYPES.map(t => (
              <Button key={t.id} variant="ghost"
                onClick={() => onSelectType(t.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all h-auto justify-start",
                  activeAgentId === `type:${t.id}` ? "bg-primary/10 text-primary" : "hover:bg-muted/60 text-foreground"
                )}>
                <Activity className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate">{t.name}</span>
              </Button>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Active monitors */}
        <Collapsible open={agentsOpen} onOpenChange={setAgentsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full mb-2">
            <span className="text-sm font-medium text-foreground">Active monitors</span>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", !agentsOpen && "-rotate-90")} />
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-0.5">
            {ACTIVE_AGENTS.map(agent => (
              <div key={agent.id}
                onClick={() => onSelectAgent(agent.id)}
                className={cn(
                  "group w-full flex items-start gap-2 px-3 py-2 rounded-xl text-left transition-all cursor-pointer",
                  activeAgentId === agent.id ? "bg-primary/10 text-primary" : "hover:bg-muted/60 text-foreground"
                )}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{agent.name}</p>
                  <p className={cn("text-[11px] mt-0.5", activeAgentId === agent.id ? "text-primary/70" : "text-muted-foreground")}>
                    {agent.schedule}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                      agent.status === "active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    )}>
                      {agent.status === "active" ? "Active" : "Paused"}
                    </span>
                    <span className={cn("text-[10px]", activeAgentId === agent.id ? "text-primary/70" : "text-muted-foreground")}>
                      {agent.lastRun}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    onClick={e => e.stopPropagation()}
                    className={cn(
                      "shrink-0 h-6 w-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity mt-0.5",
                      activeAgentId === agent.id ? "text-primary hover:bg-primary/20" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem className="gap-2 text-sm">
                      {agent.status === "active" ? "Pause" : "Resume"}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-sm">Rename</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-sm">Duplicate</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2 text-sm text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}

// ─── Chat panel ───────────────────────────────────────────────────────────────

function MessageRow({ msg }: { msg: AgentMessage }) {
  const isUser = msg.role === "user"
  return (
    <div className={cn("flex gap-2", isUser && "flex-row-reverse")}>
      <div className={cn("flex flex-col gap-1", isUser && "items-end")}>
        <div className={cn(
          "rounded-xl px-3 py-2.5 text-sm text-foreground leading-relaxed max-w-[240px]",
          isUser ? "bg-primary/10" : "bg-muted/40"
        )}>
          {msg.content.split("\n").map((line, i) => (
            <p key={i} className={i > 0 && line ? "mt-1.5" : i > 0 ? "mt-0.5" : ""}>{line}</p>
          ))}
        </div>
        {!isUser && (
          <div className="flex items-center gap-0.5 px-0.5">
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground h-5 w-5"><ThumbsUp className="h-3 w-3" /></Button>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground h-5 w-5"><Copy className="h-3 w-3" /></Button>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground h-5 w-5"><RefreshCw className="h-3 w-3" /></Button>
          </div>
        )}
      </div>
    </div>
  )
}

const EMPTY_SUGGESTIONS = [
  "Set up a weekly pipeline velocity email for asset managers",
  "Alert me when a deal has no update for 7 days",
  "Create a broker action digest every Friday at 4pm",
  "Add a monthly ownership portfolio update",
]

function AgentChatPanel({
  sessions,
  activeId,
  initPrompt,
}: {
  sessions: AgentSession[]
  activeId: string
  initPrompt?: string
}) {
  const [input, setInput]               = React.useState(initPrompt ?? "")
  const [localSessions, setLocalSessions] = React.useState(sessions)
  const bottomRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setLocalSessions(prev => {
      const existingIds = new Set(prev.map(s => s.id))
      const newOnes = sessions.filter(s => !existingIds.has(s.id))
      return newOnes.length > 0 ? [...newOnes, ...prev] : prev
    })
  }, [sessions])

  const active = localSessions.find(s => s.id === activeId) ?? localSessions[0]

  const sendText = (text: string) => {
    if (!text.trim()) return
    setInput("")
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const userMsg: AgentMessage  = { id: `u${Date.now()}`, role: "user",      content: text,           timestamp: now }
    const thinkId = `t${Date.now()}`
    const thinkMsg: AgentMessage = { id: thinkId,          role: "assistant", content: "Working on it…", timestamp: now }

    setLocalSessions(prev => prev.map(s =>
      s.id !== activeId ? s : { ...s, messages: [...s.messages, userMsg, thinkMsg] }
    ))

    setTimeout(() => {
      const reply: AgentMessage = {
        id: `r${Date.now()}`,
        role: "assistant",
        content: generateAgentResponse(text),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setLocalSessions(prev => prev.map(s =>
        s.id !== activeId ? s : { ...s, messages: [...s.messages.filter(m => m.id !== thinkId), reply] }
      ))
    }, 900)
  }

  React.useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [active?.messages.length])

  const isEmpty = (active?.messages ?? []).length === 0

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {isEmpty ? (
          <div className="flex flex-col justify-end h-full pb-1">
            <div className="flex flex-col gap-2">
              <div className="rounded-xl px-3 py-2.5 text-sm text-foreground leading-relaxed bg-muted/40 max-w-[85%]">
                Describe an agent to set up...
              </div>
              <div className="flex flex-wrap gap-2">
                {EMPTY_SUGGESTIONS.map(s => (
                  <Button key={s} variant="outline" size="sm"
                    className="rounded-full shrink-0 whitespace-nowrap"
                    onClick={() => sendText(s)}>
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          (active?.messages ?? []).map(msg => <MessageRow key={msg.id} msg={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-4 pb-4 pt-2">
        <div className="rounded-2xl border border-border bg-card px-4 pt-3 pb-2">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendText(input) } }}
            placeholder="Describe an agent to set up..."
            className="w-full resize-none text-sm border-none shadow-none bg-transparent focus-visible:ring-0 p-0 min-h-10"
            rows={1}
          />
          <div className="flex items-center justify-between mt-2">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Mic className="h-4 w-4" />
              </Button>
              {input.trim() ? (
                <Button size="icon" onClick={() => sendText(input)}>
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
  )
}

// ─── Settings panel ───────────────────────────────────────────────────────────

function AgentSettingsPanel({
  agentId,
  onClose,
}: {
  agentId: string
  onClose: () => void
}) {
  const isNew    = agentId === "new"
  const typeId   = agentId.startsWith("type:") ? agentId.slice(5) : null
  const typeData = typeId ? AGENT_TYPES.find(t => t.id === typeId) : null
  const agent    = ACTIVE_AGENTS.find(a => a.id === agentId)
  const d        = typeData?.defaults ?? { trigger: "Scheduled", frequency: "Weekly", tone: "Concise", rcpAssetMgr: true, rcpBroker: true, rcpTenantRep: true, rcpLawyer: true, rcpOwner: false, subject: "{Asset}: {Agent name} | {Date}", chatPrompt: "" }

  const [agentName, setAgentName]   = React.useState(isNew ? "" : (typeData?.name ?? agent?.name ?? ""))
  const [scope, setScope]           = React.useState("All assets")
  const [scopeValues, setScopeValues] = React.useState<string[]>([])
  const [trigger, setTrigger]       = React.useState(d.trigger)
  const [frequency, setFrequency]   = React.useState(d.frequency)
  const [day, setDay]               = React.useState("Monday")
  const [time, setTime]             = React.useState("9:00 AM")
  const [stallDays, setStallDays]   = React.useState("7")
  const [tone, setTone]             = React.useState(d.tone)
  const [subject, setSubject]       = React.useState(d.subject)

  // Recipients
  const [rcpAssetMgr, setRcpAssetMgr]   = React.useState(d.rcpAssetMgr)
  const [rcpBroker, setRcpBroker]       = React.useState(d.rcpBroker)
  const [rcpTenantRep, setRcpTenantRep] = React.useState(d.rcpTenantRep)
  const [rcpLawyer, setRcpLawyer]       = React.useState(d.rcpLawyer)
  const [rcpOwner, setRcpOwner]         = React.useState(d.rcpOwner)

  // Content sections
  const [incVelocity, setIncVelocity]     = React.useState(true)
  const [incStall, setIncStall]           = React.useState(true)
  const [incMilestone, setIncMilestone]   = React.useState(true)
  const [incActions, setIncActions]       = React.useState(true)
  const [incEconomic, setIncEconomic]     = React.useState(false)
  const [incComp, setIncComp]             = React.useState(false)

  const showSchedule  = trigger === "Scheduled" || trigger === "Both"
  const showThreshold = trigger === "On threshold" || trigger === "Both"

  const DAYS      = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  const TIMES     = ["7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "12:00 PM", "4:00 PM", "5:00 PM"]
  const FREQS     = ["Daily", "Weekly", "Bi-weekly", "Monthly"]

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-card/80 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-3">
          <Activity className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            value={agentName}
            onChange={e => setAgentName(e.target.value)}
            placeholder={isNew ? "Monitor name…" : undefined}
            className="text-sm font-medium border-transparent shadow-none bg-transparent focus-visible:border-input focus-visible:bg-card h-7 px-1.5 min-w-0 flex-1"
          />
          {agent && (
            <Badge
              variant="secondary"
              className={cn(
                "text-xs h-7 px-2.5 shrink-0",
                agent.status === "active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
              )}
            >
              {agent.status === "active" ? "Active" : "Paused"}
            </Badge>
          )}
          {(isNew || typeData) && (
            <Badge variant="secondary" className="text-xs h-7 px-2.5 shrink-0 bg-muted text-muted-foreground">
              Draft
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
            Save
          </Button>
          <Button size="sm" className="gap-1.5 text-xs h-7">
            <Play className="h-3.5 w-3.5" />
            Run now
          </Button>
          <div className="w-px h-4 bg-border/60 mx-1" />
          <Button variant="ghost" size="icon-sm" className="h-7 w-7 text-muted-foreground" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Settings content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
      <Card className="flex flex-col gap-6 px-6 py-5">

        {/* Section: Scope */}
        <div className="flex flex-col gap-3">
          <p className="text-base font-medium text-foreground">Scope</p>
          <ToggleGroup
            type="single"
            spacing={0}
            value={scope}
            onValueChange={v => { if (v && !Array.isArray(v)) { setScope(v); setScopeValues([]) } }}
          >
            <ToggleGroupItem value="All assets" variant="outline">All assets</ToggleGroupItem>
            <ToggleGroupItem value="Portfolio" variant="outline">Portfolio</ToggleGroupItem>
            <ToggleGroupItem value="Asset" variant="outline">Asset</ToggleGroupItem>
          </ToggleGroup>
          {scope === "Portfolio" && (
            <div className="flex flex-col gap-2">
              {["NYC Office Portfolio", "West Coast Portfolio", "Southeast Portfolio", "Mixed-Use Portfolio"].map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={scopeValues.includes(opt)}
                    onCheckedChange={checked => setScopeValues(prev => checked ? [...prev, opt] : prev.filter(v => v !== opt))}
                  />
                  <span className="text-sm text-foreground">{opt}</span>
                </label>
              ))}
            </div>
          )}
          {scope === "Asset" && (
            <div className="flex flex-col gap-2">
              {["VTS Tower HQ", "Empire State Bldg", "One Financial Plaza", "Willis Tower", "30 Hudson Yards", "Salesforce Tower", "200 Berkeley Street", "One World Trade Ctr", "Two Union Square"].map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={scopeValues.includes(opt)}
                    onCheckedChange={checked => setScopeValues(prev => checked ? [...prev, opt] : prev.filter(v => v !== opt))}
                  />
                  <span className="text-sm text-foreground">{opt}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Section: Trigger */}
        <div className="flex flex-col gap-3">
          <p className="text-base font-medium text-foreground">Trigger</p>
          <ToggleGroup
            type="single"
            spacing={0}
            value={trigger}
            onValueChange={v => { if (v) setTrigger(v as string) }}
          >
            <ToggleGroupItem value="Scheduled" variant="outline">Scheduled</ToggleGroupItem>
            <ToggleGroupItem value="On threshold" variant="outline">On threshold</ToggleGroupItem>
            <ToggleGroupItem value="Both" variant="outline">Both</ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Section: Schedule */}
        {showSchedule && (
          <div className="flex flex-col gap-3">
            <p className="text-base font-medium text-foreground">Schedule</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-foreground">Runs</span>
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}>
                  {frequency} <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {FREQS.map(f => (
                    <DropdownMenuItem key={f} className="text-sm" onClick={() => setFrequency(f)}>{f}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {frequency === "Weekly" && (
                <DropdownMenu>
                  <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}>
                    {day} <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {DAYS.map(d => (
                      <DropdownMenuItem key={d} className="text-sm" onClick={() => setDay(d)}>{d}</DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <span className="text-sm text-foreground">at</span>
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}>
                  {time} <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {TIMES.map(t => (
                    <DropdownMenuItem key={t} className="text-sm" onClick={() => setTime(t)}>{t}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}

        {/* Section: Stall threshold */}
        {showThreshold && (
          <div className="flex flex-col gap-3">
            <p className="text-base font-medium text-foreground">Stall threshold</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-foreground">Alert when a deal has no update for</span>
              <Input
                type="number"
                value={stallDays}
                onChange={e => setStallDays(e.target.value)}
                className="w-16 text-center h-8 text-sm"
              />
              <span className="text-sm text-foreground">days</span>
            </div>
          </div>
        )}

        {/* Section: Send to */}
        <div className="flex flex-col gap-3">
          <p className="text-base font-medium text-foreground">Send to</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={rcpAssetMgr} onCheckedChange={v => setRcpAssetMgr(!!v)} />
              <span className="text-sm text-foreground">Asset manager</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={rcpBroker} onCheckedChange={v => setRcpBroker(!!v)} />
              <span className="text-sm text-foreground">Broker</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={rcpTenantRep} onCheckedChange={v => setRcpTenantRep(!!v)} />
              <span className="text-sm text-foreground">Tenant rep</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={rcpLawyer} onCheckedChange={v => setRcpLawyer(!!v)} />
              <span className="text-sm text-foreground">Lawyer</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={rcpOwner} onCheckedChange={v => setRcpOwner(!!v)} />
              <span className="text-sm text-foreground">Owner</span>
            </label>
          </div>
        </div>

        {/* Section: Email tone */}
        <div className="flex flex-col gap-3">
          <p className="text-base font-medium text-foreground">Email tone</p>
          <ToggleGroup
            type="single"
            spacing={0}
            value={tone}
            onValueChange={v => { if (v) setTone(v as string) }}
          >
            <ToggleGroupItem value="Formal" variant="outline">Formal</ToggleGroupItem>
            <ToggleGroupItem value="Concise" variant="outline">Concise</ToggleGroupItem>
            <ToggleGroupItem value="Direct" variant="outline">Direct</ToggleGroupItem>
            <ToggleGroupItem value="Other" variant="outline">Other</ToggleGroupItem>
          </ToggleGroup>
          {tone === "Other" && (
            <Textarea
              placeholder="Describe the tone you want, e.g. friendly but authoritative, brief bullet points only…"
              className="text-sm resize-none min-h-[80px]"
            />
          )}
        </div>

        {/* Section: Subject line */}
        <div className="flex flex-col gap-3">
          <p className="text-base font-medium text-foreground">Subject line</p>
          <p className="text-xs text-muted-foreground -mt-1">Use variables to personalize each email automatically.</p>
          <Input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="e.g. Pipeline update: {Asset} | {Date}"
            className="text-sm h-8"
          />
          <div className="flex flex-wrap gap-1.5">
            {["{Asset}", "{Date}", "{Agent name}", "{Deal count}", "{Stage}"].map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setSubject(s => s + v)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Section: What to include */}
        <div className="flex flex-col gap-3">
          <p className="text-base font-medium text-foreground">What to include</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={incVelocity} onCheckedChange={v => setIncVelocity(!!v)} />
              <span className="text-sm text-foreground">Deal velocity and stage summary</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={incStall} onCheckedChange={v => setIncStall(!!v)} />
              <span className="text-sm text-foreground">Stalled deal alerts</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={incMilestone} onCheckedChange={v => setIncMilestone(!!v)} />
              <span className="text-sm text-foreground">Upcoming milestones</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={incActions} onCheckedChange={v => setIncActions(!!v)} />
              <span className="text-sm text-foreground">Action items per recipient</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={incEconomic} onCheckedChange={v => setIncEconomic(!!v)} />
              <span className="text-sm text-foreground">Economic summary (NOI, TI)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox checked={incComp} onCheckedChange={v => setIncComp(!!v)} />
              <span className="text-sm text-foreground">Comp data</span>
            </label>
          </div>
        </div>

        {/* Section: Email preview */}
        <div className="flex flex-col gap-3">
          <p className="text-base font-medium text-foreground">Email preview</p>
          <div className="rounded-xl border border-border bg-muted/30 p-4 flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">
              Based on current pipeline · 4 deals · 2 actions required · 1 stall alert
            </p>
            <div className="flex flex-col gap-0.5">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8 text-sm"
                onClick={() => { window.location.hash = "#/deal-monitor-email-am" }}>
                <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">Asset manager: pipeline velocity</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0" />
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8 text-sm"
                onClick={() => { window.location.hash = "#/deal-monitor-email-broker" }}>
                <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">Broker: action required</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0" />
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8 text-sm"
                onClick={() => { window.location.hash = "#/deal-monitor-email-tenant" }}>
                <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">Tenant rep: follow up</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0" />
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8 text-sm"
                onClick={() => { window.location.hash = "#/deal-monitor-email-lawyer" }}>
                <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">Lawyer: lease status</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0" />
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8 text-sm"
                onClick={() => { window.location.hash = "#/deal-monitor-email-owner" }}>
                <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">Owner: portfolio update</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground ml-auto shrink-0" />
              </Button>
            </div>
          </div>
        </div>

      </Card>
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

type MobileView = "rail" | "chat" | "settings"

export function DealStewardPage({ className, isDark = false, onToggleDark }: {
  className?: string
  isDark?: boolean
  onToggleDark?: () => void
}) {
  const [activeAgentId, setActiveAgentId] = React.useState<string>("a1")
  const [railCollapsed, setRailCollapsed] = React.useState(false)
  const [mobileView, setMobileView]       = React.useState<MobileView>("rail")
  const [logoOpen, setLogoOpen]           = React.useState(false)
  const [sessions]                        = React.useState<AgentSession[]>(SESSIONS)

  const goBack = () => {
    const prev = window.history.length > 1 ? null : "#/dashboard"
    if (prev) { window.location.hash = prev } else { window.history.back() }
  }

  return (
    <div className={cn(
      "flex flex-col h-screen overflow-hidden gap-4 p-4 transition-all duration-300",
      className
    )}>

      {/* Mobile back header */}
      {mobileView !== "rail" && (
        <div className="flex items-center md:hidden shrink-0">
          <Button variant="ghost" size="sm" className="gap-1.5 -ml-1"
            onClick={() => setMobileView(mobileView === "settings" ? "chat" : "rail")}>
            <ArrowLeft className="h-4 w-4" />
            {mobileView === "settings" ? "Chat" : "Back"}
          </Button>
          {mobileView === "chat" && (
            <Button variant="ghost" size="sm" className="ml-auto gap-1.5"
              onClick={() => setMobileView("settings")}>
              <Activity className="h-4 w-4" />
              Settings
            </Button>
          )}
        </div>
      )}

      {/* Panels */}
      <div className="flex flex-1 min-h-0 rounded-2xl overflow-hidden bg-card/70 backdrop-blur-md border border-border/70 divide-x divide-border/40">

        {/* 1: Agent rail */}
        <div className={cn(
          "shrink-0 flex flex-col overflow-hidden min-h-0 transition-all duration-300",
          railCollapsed ? "w-[48px]" : "w-[280px]",
          mobileView === "rail" ? "flex" : "hidden md:flex"
        )}>
          <AgentRail
            activeAgentId={activeAgentId}
            onSelectAgent={id => { setActiveAgentId(id); setMobileView("chat") }}
            onSelectType={typeId => { setActiveAgentId(`type:${typeId}`); setMobileView("chat") }}
            onNewAgent={() => { setActiveAgentId("new"); setMobileView("chat") }}
            collapsed={railCollapsed}
            onToggleCollapse={() => setRailCollapsed(p => !p)}
            logoOpen={logoOpen}
            onLogoOpenChange={setLogoOpen}
            isDark={isDark}
            onToggleDark={onToggleDark}
          />
        </div>

        {/* 2: Chat panel */}
        <div className={cn(
          "w-full md:w-[340px] shrink-0 flex flex-col overflow-hidden min-h-0 bg-card",
          mobileView === "chat" ? "flex" : "hidden md:flex"
        )}>
          <AgentChatPanel
            key={activeAgentId}
            sessions={sessions}
            activeId={SESSIONS.find(s => s.title.toLowerCase().includes(
              ACTIVE_AGENTS.find(a => a.id === activeAgentId)?.name.split(" ")[0].toLowerCase() ?? ""
            ))?.id ?? SESSIONS[0].id}
            initPrompt={activeAgentId === "new" ? "" : activeAgentId.startsWith("type:") ? (AGENT_TYPES.find(t => t.id === activeAgentId.slice(5))?.defaults.chatPrompt ?? "") : undefined}
          />
        </div>

        {/* 3: Settings panel */}
        <div className={cn(
          "flex-1 flex flex-col min-w-0 overflow-hidden",
          mobileView === "settings" ? "flex" : "hidden md:flex"
        )}>
          <AgentSettingsPanel key={activeAgentId} agentId={activeAgentId} onClose={goBack} />
        </div>

      </div>
    </div>
  )
}
