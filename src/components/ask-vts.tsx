import * as React from "react"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowUp, Sparkle, SquarePen, ArrowLeft, PanelLeft, Search, Clock, ChevronDown, Mic, AudioLines, Plus,
  MoreHorizontal, Share2, Pencil, Pin, Archive, Trash2, ThumbsUp, ThumbsDown, Copy, RefreshCw, ChevronRight,
} from "lucide-react"
import { useChatPattern } from "@/contexts/chat-pattern"
import { AGENTS } from "@/components/agents-page"

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "user" | "assistant"

interface Message {
  id: string
  role: Role
  content: string
  timestamp: string
  agents?: string[] // agent IDs to render as chips
}

interface Conversation {
  id: string
  title: string
  preview: string
  time: string
  messages: Message[]
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    title: "KPMG deal stall analysis",
    preview: "Cost of delay on the KPMG renewal",
    time: "Just now",
    messages: [
      { id: "m1", role: "user",      timestamp: "9:12 AM", content: "What's the cost of delay on the KPMG renewal?" },
      { id: "m2", role: "assistant", timestamp: "9:12 AM", content: "The KPMG renewal at Empire State Bldg (Suite 3400, 117,000 sf) has been stalled for 26 days.\n\nCost of delay: $3,705/day based on the budget NOI of $6.435M annually. Total delay cost so far: $96,330.\n\nThe blocker is board approval — Paul Simmons indicated the board review was pushed to mid-August. Two follow-up actions are ready:\n\n1. A targeted follow-up to Paul Simmons\n2. A CFO escalation draft\n\nWould you like me to surface those drafts for your review?" },
      { id: "m3", role: "user",      timestamp: "9:13 AM", content: "Yes, show me the CFO escalation draft." },
      { id: "m4", role: "assistant", timestamp: "9:13 AM", content: "Here's the CFO escalation draft from Deal Momentum:\n\nTo: CFO, KPMG\nSubject: 399 Park renewal — timing update requested\n\nWe wanted to follow up on the renewal discussion for KPMG's Suite 3400 at Empire State Building. The current proposal has been with your team for 26 days and we want to ensure we can hold the space through your board process.\n\nWould you be available for a brief call this week to confirm timing?\n\nShall I route this for your approval before it sends?" },
    ],
  },
  {
    id: "c2",
    title: "Amazon deal summary",
    preview: "Amazon inquiry at VTS Tower",
    time: "Yesterday",
    messages: [
      { id: "m1", role: "user",      timestamp: "2:05 PM", content: "Summarize the Amazon inquiry at VTS Tower." },
      { id: "m2", role: "assistant", timestamp: "2:05 PM", content: "Amazon.com — VTS Tower, Suite 0800 (Floor 8)\n\nType: New deal · 18,000 sf\nStage: Inquiry\nRep: Sarah Okonkwo · CBRE\nBudget NER: $98.00 PSF/yr\nBudget NOI: $1.76M/yr\n\nDeal Capture parsed the inbound email and created the record today at 8:50 AM. Tour request submitted for Sep 3. No proposal issued yet.\n\nDeal Intelligence is queued to pull credit, comps, and market context once requirements are confirmed." },
    ],
  },
  {
    id: "c3",
    title: "Deloitte legal status",
    preview: "Deloitte lease — redlines and open items",
    time: "Jul 15",
    messages: [
      { id: "m1", role: "user",      timestamp: "11:00 AM", content: "Where are we on the Deloitte lease?" },
      { id: "m2", role: "assistant", timestamp: "11:00 AM", content: "Deloitte LLP — VTS Tower HQ, Suite 500\n\nType: Expansion · 43,000 sf · Stage: Legal · Status: Active\nNER: $72.00 PSF vs $70.00 budget (+2.9%)\n\nLOI was executed and is now in legal review. Counsel Handoff extracted 18 LOI terms and flagged 2 unusual positions:\n\n1. TI escalation clause (non-standard)\n2. Subleasing rights at 75% (market is 85%)\n\nSkadden Arps (tenant) and Willkie Farr (landlord) are exchanging redlines. Negotiation Guidance is tracking 12 open items." },
    ],
  },
  {
    id: "c4",
    title: "Pipeline NOI vs budget",
    preview: "Deals above and below budget NOI",
    time: "Jul 14",
    messages: [
      { id: "m1", role: "user",      timestamp: "4:30 PM", content: "Which active deals are above budget NOI?" },
      { id: "m2", role: "assistant", timestamp: "4:30 PM", content: "Deals tracking above budget NOI:\n\nStarbucks — $1.48M vs $1.43M budget (+4.0%)\nDeloitte — $3.10M vs $3.01M budget (+2.9%)\nMorgan Stanley — touring, no NOI yet\n\nDeals below budget:\n\nApex Capital — $2.16M vs $2.34M (−7.7%)\nKPMG — $5.73M vs $6.44M (−11.0%)\nAtlas Group — $2.68M vs $3.05M (−12.1%)\n\nKPMG and Atlas Group are the largest gaps. Both are currently stalled." },
    ],
  },
]

function generateResponse(text: string): { content: string; agents: string[] } {
  const raw = _generateResponseRaw(text)
  // Extract agent names from the "**Suggested agents:**" section
  const agentSection = raw.match(/\*\*Suggested agents:\*\*([\s\S]*)$/)
  const agentNames = agentSection
    ? [...agentSection[1].matchAll(/\*\*([^*]+)\*\*/g)].map(m => m[1])
    : []
  const agents = agentNames
    .map(name => AGENTS.find(a => a.name === name)?.id)
    .filter((id): id is string => !!id)
  const content = raw.replace(/\n\n\*\*Suggested agents:\*\*[\s\S]*$/, "").trimEnd()
  return { content, agents }
}

function _generateResponseRaw(text: string): string {
  const l = text.toLowerCase()
  const tenant = text.split(" — ")[0]
  const hasTenant = text.includes(" — ")

  // Stalled deal
  if (l.includes("stalled")) {
    const days = text.match(/stalled (\d+) days/)?.[1]
    const stage = text.match(/· ([^·]+) · /)?.[1]
    return `**${tenant}** has been stalled in ${stage ?? "the current stage"} for ${days ?? "several"} days with no activity recorded.

Cost of delay is accumulating at the budget NOI rate — approximately $${Math.round(Math.random() * 800 + 200).toLocaleString()}/day based on this deal's economics. At ${days ?? "this"} days stalled, that's $${(parseInt(days ?? "14") * 950).toLocaleString()} in delayed value.

The most common unblock at this stage is a direct re-engagement from ownership or the leasing lead — not the broker. I can draft that outreach now.

**Suggested agents:**
— **Deal Momentum** can automatically surface this deal in daily follow-up queues and draft re-engagement sequences for your review.
— **Deal Health** is already scoring this deal as at-risk. It can flag similar stalls across your pipeline and prioritize which to address first.`
  }

  // At-risk / competitor
  if (l.includes("at-risk") || l.includes("competitor")) {
    return `**${tenant}** is showing competitor risk — a strong signal to act within the next 48 hours before momentum shifts.

The rent delta in your proposal may be creating an opening. Deals at this stage with a competing building in play close at roughly 60% of the normal rate unless ownership engages directly.

I can model what concessions would improve close probability without breaching budget NOI, and draft a countersign narrative tailored to ${tenant}'s stated concerns.

**Suggested agents:**
— **Scenario Modeling** can run the economics on TI, free rent, and NER trade-offs to find the strongest counter that still hits budget.
— **Deal Intelligence** has pulled credit and market comps for ${tenant} — reviewing those now may clarify their walk-away point.`
  }

  // LOI or Lease Out
  if (l.includes("loi") || l.includes("lease out")) {
    const rent = text.match(/\$(\d+\.\d+)\/sf base/)?.[1]
    const budgetRent = text.match(/\$(\d+\.\d+)\/sf budget/)?.[1]
    const above = rent && budgetRent && parseFloat(rent) > parseFloat(budgetRent)
    return `**${tenant}** is in ${l.includes("loi") ? "LOI" : "Lease Out"} — ${above ? `tracking ${rent && budgetRent ? `$${(parseFloat(rent) - parseFloat(budgetRent)).toFixed(2)}/sf above` : "above"} budget, which is good news` : "review the rent delta before execution"}.

${l.includes("lease out") ? "Legal review is the most common delay at this stage. The key is ensuring redlines don't stall on non-economic terms that could have been resolved earlier." : "LOI execution within 5 days of agreement is the benchmark — each day past that increases fall-through rate by roughly 4%."}

I can summarize all open items, flag anything non-standard, and draft a follow-up message to ${tenant}'s rep to confirm timeline.

**Suggested agents:**
— **Deal Momentum** tracks LOI-to-execution timelines and will flag this deal if it goes quiet.
— **Counsel Handoff** can extract all LOI terms, identify unusual positions, and prep a clean brief for your legal team.`
  }

  // Lease expiration
  if (l.includes("lease expiration")) {
    const sf = text.match(/([\d,]+) sf/)?.[1]
    const date = text.match(/· ([A-Z][a-z]+ \d+, \d{4})/)?.[1]
    const months = text.match(/\((\d+) months? out\)/)?.[1] ?? text.match(/(\d+) mo out/)?.[1]
    const urgent = parseInt(months ?? "12") <= 6
    return `**${tenant}** has a lease expiration ${date ? `on ${date}` : "coming up"}${sf ? ` covering ${sf} sf` : ""} — ${urgent ? "this is within your critical action window" : "early enough to shape the renewal on your terms"}.

${urgent ? `With ${months} months remaining, you should have a renewal proposal in front of ${tenant} within the next 2 weeks to avoid negotiating under time pressure.` : `You have time to build leverage. Pull comps, model scenarios, and get in front of ${tenant} before they start shopping alternatives.`}

The renewal NER target, TI budget, and term length are the three variables to align internally before outreach.

**Suggested agents:**
— **Deal Health** is tracking ${tenant}'s engagement signals and will flag any change in their renewal intent.
— **Negotiation Guidance** can model the optimal renewal economics and prep a structured proposal framework before your first conversation.`
  }

  // Renewal window
  if (l.includes("renewal window")) {
    const sf = text.match(/([\d,]+) sf/)?.[1]
    return `The renewal window for **${tenant}**${sf ? ` (${sf} sf)` : ""} is now open — this is the right moment to initiate a conversation before their search process begins.

Tenants who receive a proactive renewal proposal within the first 30 days of their window renew at 2× the rate of those who receive one after they've toured alternatives.

I recommend leading with occupancy certainty and a TI refresh rather than NER reduction — that framing has stronger close rates for tenants of this size.

**Suggested agents:**
— **Negotiation Guidance** can generate a renewal proposal framework with economics modeled against budget and market comps.
— **Deal Capture** will log all renewal-related conversations and ensure the deal record stays current as discussions progress.`
  }

  // Option (ROFO, contraction, expansion)
  if (l.includes("rofo") || l.includes("contraction") || l.includes("expansion option")) {
    const type = l.includes("rofo") ? "ROFO" : l.includes("contraction") ? "Contraction Option" : "Expansion Option"
    const date = text.match(/· ([A-Z][a-z]+ \d+, \d{4})/)?.[1]
    return `**${tenant}'s ${type}** notice deadline is ${date ? `${date}` : "approaching"}. Missing this date forfeits the option — it cannot be reinstated.

${type === "Contraction Option" ? "If exercised, this reduces your occupied sf and creates a vacancy you'll need to backfill. Model the NOI impact before the deadline to understand the trade-off." : type === "ROFO" ? "If ${tenant} exercises the ROFO, you'll need to assess impact on adjacent availability and pending deals for that space." : "Expansion options, if exercised, typically compress your adjacent vacancy — confirm you have the space to honor it."}

I'd recommend putting a decision brief in front of ownership now so there are no surprises at the deadline.

**Suggested agents:**
— **Approval Readiness** can prep an option-exercise scenario brief for internal review ahead of the deadline.
— **Scenario Modeling** can model the NOI impact of exercise vs. non-exercise to inform your response strategy.`
  }

  // Vacant space
  if (l.includes("vacant") || l.includes("days on market")) {
    const space = tenant
    const sf = text.match(/([\d,]+) sf/)?.[1]
    const days = text.match(/(\d+) days on market/)?.[1]
    const urgency = parseInt(days ?? "0") > 180 ? "critical" : parseInt(days ?? "0") > 90 ? "elevated" : "normal"
    return `**${space}**${sf ? ` (${sf} sf)` : ""} has been vacant for ${days ?? "an extended period"}. Vacancy cost${urgency === "critical" ? " at this duration" : ""} is significant — at market NER this represents roughly $${sf ? Math.round((parseInt(sf.replace(/,/g, "")) * 55) / 365 * parseInt(days ?? "90")).toLocaleString() : "substantial"} in foregone revenue to date.

${urgency === "critical" ? "At 180+ days, market perception risk increases. A price adjustment or TI improvement may be needed to reset the space's position." : "The space is within normal absorption range, but active prospecting should begin now."}

I can pull active requirements in the market that match this size and floor, rank them by fit, and draft an outreach brief for each broker.

**Suggested agents:**
— **Space Match** can rank all active tenant requirements against this space and surface the top 3–5 fits with a brief on each.
— **Deal Capture** can monitor inbound inquiries and automatically create deal records for any qualifying prospect that contacts you.`
  }

  // Proposal
  if (l.includes("proposal")) {
    return `**${tenant}** is in the Proposal stage${hasTenant ? "" : ""} — this is the highest-leverage moment to shape deal economics before the LOI locks terms.

A well-structured proposal that aligns with ${tenant}'s stated requirements typically closes 40% faster than one that requires multiple rounds of counters.

I can analyze the current rent delta against budget, model 2–3 economic scenarios (TI-led, NER-led, term-led), and draft a proposal narrative that leads with the strongest value framing.

**Suggested agents:**
— **Proposal Builder** can assemble a structured proposal package using live deal data and space specs.
— **Deal Intelligence** has pulled market comps and tenant credit for ${tenant} — use that context to calibrate your opening offer.`
  }

  // Generic deal
  if (hasTenant) {
    return `I've pulled the current state of the **${tenant}** deal from your pipeline.

Here's what stands out: the deal is in an active stage with no escalating blockers noted. The rent position relative to budget and the days-since-last-activity are the two metrics I'd watch most closely at this stage.

I can draft a next-step recommendation, pull activity history, or model the economics — just let me know where to focus.

**Suggested agents:**
— **Deal Health** is continuously monitoring this deal for stall signals and will alert you if engagement drops.
— **Deal Momentum** can surface this deal in your daily action queue with a recommended next action.`
  }

  return "I'm analyzing your request across all active deals and agent activity. In production this draws from live deal data, agent outputs, and portfolio intelligence."
}

const SUGGESTED = [
  { label: "Review pipeline health",   prompt: "Which deals need attention today?" },
  { label: "Surface stalled deals",    prompt: "Show me all stalled deals and their cost of delay." },
  { label: "Check NOI vs budget",      prompt: "Which active deals are above budget NOI?" },
  { label: "Summarize deal stages",    prompt: "How many deals are in each stage right now?" },
  { label: "Flag expiring leases",     prompt: "What leases expire in the next 90 days?" },
  { label: "Show agent activity",      prompt: "What have VTS Agents done in the last 24 hours?" },
]

// ─── Conversation list item ───────────────────────────────────────────────────

function ConvListItem({ conv, selected, onSelect }: {
  conv: Conversation
  selected: boolean
  onSelect: () => void
}) {
  const [hovered, setHovered] = React.useState(false)

  return (
    <div
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer",
        selected ? "bg-primary/10 text-primary" : "hover:bg-muted/60 text-foreground"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
    >
      <p className="text-sm font-semibold truncate flex-1">{conv.title}</p>

      {/* Fixed-width slot: timestamp or more menu — no layout shift */}
      <DropdownMenu>
        <DropdownMenuTrigger
          onClick={e => e.stopPropagation()}
          className={cn(
            "shrink-0 h-6 w-6 flex items-center justify-center rounded-md",
            hovered ? "visible" : "invisible",
            selected ? "text-primary hover:bg-primary/20" : "text-muted-foreground hover:bg-muted"
          )}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem className="gap-2 text-sm">
            <Share2 className="h-3.5 w-3.5" />Share
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-sm">
            <Pencil className="h-3.5 w-3.5" />Rename
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-sm">
            <Pin className="h-3.5 w-3.5" />Pin chat
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-sm">
            <Archive className="h-3.5 w-3.5" />Archive
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2 text-sm text-destructive focus:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    </div>
  )
}

// ─── Agent chip ───────────────────────────────────────────────────────────────

function AgentChip({ agentId }: { agentId: string }) {
  const agent = AGENTS.find(a => a.id === agentId)
  if (!agent) return null
  const Icon = agent.icon
  return (
    <button
      onClick={() => { window.location.hash = `#/ai/vts-tower?agent=${agentId}` }}
      className="flex items-center gap-3 rounded-xl border border-border/70 bg-card hover:bg-muted/60 hover:border-border px-3 py-2.5 transition-colors text-left group"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/15">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{agent.name}</p>
        <p className="text-[11px] text-muted-foreground truncate">{agent.tagline}</p>
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground transition-colors" />
    </button>
  )
}

// ─── Message row ──────────────────────────────────────────────────────────────

function MessageRow({ message }: { message: Message }) {
  const isUser = message.role === "user"
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div className={cn("flex flex-col gap-1 max-w-lg", isUser && "items-end", !isUser && message.agents && "max-w-xl")}>
        <div className={cn(
          "rounded-xl px-4 py-3 text-sm text-foreground leading-relaxed",
          isUser ? "bg-primary/10" : "bg-muted/40"
        )}>
          {message.content.split("\n").map((line, i) => {
            const parts = line.split(/\*\*(.+?)\*\*/g)
            const rendered = parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)
            return <p key={i} className={i > 0 && line ? "mt-1.5" : i > 0 ? "mt-1" : ""}>{rendered}</p>
          })}
        </div>
        {!isUser && message.agents && message.agents.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-1">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground px-1">Suggested agents</p>
            {message.agents.map(id => <AgentChip key={id} agentId={id} />)}
          </div>
        )}
        {!isUser && (
          <div className="flex items-center gap-0.5 px-1">
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground"><ThumbsUp className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground"><ThumbsDown className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground"><Copy className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground"><Share2 className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground"><RefreshCw className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function AskVTSPage({ className, newChatKey }: { className?: string; newChatKey?: number }) {
  const [activeId, setActiveId]             = React.useState(CONVERSATIONS[0].id)
  const [convs, setConvs]                   = React.useState<Conversation[]>(CONVERSATIONS)
  const [input, setInput]                   = React.useState("")
  const [mobileShowChat, setMobileShowChat] = React.useState(false)
  const [railCollapsed, setRailCollapsed]   = React.useState(false)
  const [recentsOpen, setRecentsOpen]       = React.useState(true)
  const [contextSuggestions, setContextSuggestions] = React.useState<string[]>([])
  const bottomRef = React.useRef<HTMLDivElement>(null)
  const pendingAutoRef = React.useRef<string | null>(null)

  const { pending, clearPending } = useChatPattern()

  const active = convs.find(c => c.id === activeId) ?? convs[0]

  const sendText = React.useCallback((text: string, convId: string) => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const userMsg: Message = { id: `u${Date.now()}`, role: "user", content: text, timestamp: now }
    const thinkId = `t${Date.now()}`
    const thinkMsg: Message = { id: thinkId, role: "assistant", content: "Thinking…", timestamp: now }
    setConvs(prev => prev.map(c =>
      c.id !== convId ? c : { ...c, messages: [...c.messages, userMsg, thinkMsg], preview: text, time: "Just now" }
    ))
    setTimeout(() => {
      setConvs(prev => prev.map(c => {
        if (c.id !== convId) return c
        const { content: replyContent, agents: replyAgents } = generateResponse(text)
        const reply: Message = {
          id: `r${Date.now()}`, role: "assistant",
          content: replyContent,
          agents: replyAgents.length > 0 ? replyAgents : undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
        return { ...c, messages: [...c.messages.filter(m => m.id !== thinkId), reply] }
      }))
    }, 1200)
  }, [])

  const send = () => {
    const text = input.trim()
    if (!text) return
    setInput("")
    sendText(text, activeId)
  }

  const newConversation = React.useCallback(() => {
    const id = `c${Date.now()}`
    setConvs(prev => [{ id, title: "New conversation", preview: "Start asking…", time: "Just now", messages: [] }, ...prev])
    setActiveId(id)
    setMobileShowChat(true)
  }, [])

  // Watch for activeId changes to fire pending auto-send
  React.useEffect(() => {
    const msg = pendingAutoRef.current
    if (!msg) return
    pendingAutoRef.current = null
    sendText(msg, activeId)
  }, [activeId, sendText])

  React.useEffect(() => {
    if (newChatKey && newChatKey > 0) {
      const msg = pending?.message ?? null
      const suggs = pending?.suggestions ?? []
      const transfer = pending?.transferMessages ?? null
      clearPending()
      setContextSuggestions(suggs)

      if (transfer && transfer.length > 0) {
        // Restore transferred popover conversation
        const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        const id = `c${Date.now()}`
        const restoredMessages: Message[] = transfer.map((m, i) => ({
          id: m.id ?? `tm${i}`,
          role: m.role,
          content: m.content,
          timestamp: now,
        }))
        setConvs(prev => [{ id, title: msg || "Conversation", preview: restoredMessages[0]?.content ?? "…", time: "Just now", messages: restoredMessages }, ...prev])
        setActiveId(id)
        setMobileShowChat(true)
      } else {
        if (msg) pendingAutoRef.current = msg
        newConversation()
      }
    }
  }, [newChatKey])

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [active?.messages.length])

  return (
    <div className={cn("flex flex-col gap-4", className)}>

      {/* Mobile back button */}
      {mobileShowChat && (
        <div className="flex items-center md:hidden shrink-0">
          <Button variant="ghost" size="sm" className="gap-1.5 -ml-1" onClick={() => setMobileShowChat(false)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      )}

      {/* Two-panel grid */}
      <div className={cn(
        "grid grid-rows-[1fr] gap-4 flex-1 min-h-0 transition-all duration-300",
        railCollapsed ? "grid-cols-1 md:grid-cols-[48px_1fr]" : "grid-cols-1 md:grid-cols-[300px_1fr]"
      )}>

        {/* Left: rail */}
        <div className={cn(
          "rounded-2xl bg-card/70 backdrop-blur-md flex flex-col min-h-0 overflow-hidden",
          mobileShowChat ? "hidden md:flex" : "flex"
        )}>
          {railCollapsed ? (
            <div className="flex flex-col items-center py-3 gap-3 flex-1">
              <Button variant="ghost" size="icon" onClick={() => setRailCollapsed(false)}>
                <PanelLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={newConversation}>
                <SquarePen className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
                  <Clock className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="w-56">
                  {convs.map(conv => (
                    <DropdownMenuItem
                      key={conv.id}
                      className="gap-2 text-sm"
                      onClick={() => { setActiveId(conv.id); setMobileShowChat(true) }}
                    >
                      <span className="truncate">{conv.title}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex flex-col flex-1 min-h-0 p-4">
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Sparkle className="h-5 w-5 text-primary shrink-0" />
                  <h2 className="text-xl font-semibold text-foreground">Ask VTS</h2>
                </div>
                <div className="flex items-center">
                  <Button variant="ghost" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setRailCollapsed(true)}>
                    <PanelLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button variant="outline" size="sm" className="gap-1.5 w-full mb-4" onClick={newConversation}>
                <SquarePen className="h-3.5 w-3.5" />
                New chat
              </Button>

              <Collapsible open={recentsOpen} onOpenChange={setRecentsOpen} className="flex flex-col flex-1 min-h-0">
                <CollapsibleTrigger className="flex items-center justify-between w-full mb-2">
                  <span className="text-sm font-medium text-foreground">Recents</span>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", !recentsOpen && "-rotate-90")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-col gap-0.5 flex-1 overflow-y-auto min-h-0">
                  {convs.map(conv => (
                    <ConvListItem
                      key={conv.id}
                      conv={conv}
                      selected={conv.id === activeId}
                      onSelect={() => { setActiveId(conv.id); setMobileShowChat(true) }}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </div>

        {/* Right: chat panel */}
        <div className={cn(
          "rounded-2xl backdrop-blur-md p-5 min-h-0 flex flex-col",
          "bg-card/70",
          mobileShowChat ? "flex" : "hidden md:flex"
        )}>

          {active.messages.length === 0 ? (
            /* Empty state: centered greeting + input */
            <div className="flex-1 flex flex-col items-center justify-center gap-10 px-4">
              <p className="text-4xl font-semibold text-foreground text-center">What do you want to tackle, Enrique?</p>
              <div className="w-full max-w-2xl">
                <div className="rounded-2xl border border-border bg-card px-4 pt-3 pb-2">
                  <Textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
                    placeholder="Ask anything about your portfolio…"
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
                        <Button size="icon" onClick={send}>
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
                <div className="flex flex-wrap gap-2 mt-12 justify-center">
                  {(contextSuggestions.length > 0 ? contextSuggestions.map(s => ({ label: s, prompt: s })) : SUGGESTED).map(s => (
                    <Button
                      key={s.label}
                      variant="outline"
                      onClick={() => { setInput(""); sendText(s.prompt, activeId) }}
                      className="rounded-full shrink-0 whitespace-nowrap"
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Chat layout: messages + input pinned to bottom */
            <>
              <div className="flex-1 overflow-y-auto flex flex-col gap-4 min-h-0">
                {active.messages.map(msg => (
                  <MessageRow key={msg.id} message={msg} />
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="flex flex-wrap gap-2 pt-4 pb-1 shrink-0">
                {(contextSuggestions.length > 0 ? contextSuggestions.map(s => ({ label: s, prompt: s })) : SUGGESTED.slice(0, 4)).map(s => (
                  <Button key={s.label} variant="outline" size="sm" className="shrink-0 whitespace-nowrap" onClick={() => { setInput(""); sendText(s.prompt, activeId) }}>
                    {s.label}
                  </Button>
                ))}
              </div>
              <div className="shrink-0 mt-2 rounded-2xl border border-border bg-card px-4 pt-3 pb-2">
                <Textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
                  placeholder="Ask anything about your portfolio, or resume something below…"
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
                      <Button size="icon" onClick={send}>
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
            </>
          )}

        </div>
      </div>
    </div>
  )
}
