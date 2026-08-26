import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Send, Sparkle, SquarePen, ArrowLeft, PanelLeft, Search, Clock,
  MoreHorizontal, Share2, Pencil, Pin, Archive, Trash2,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "user" | "assistant"

interface Message {
  id: string
  role: Role
  content: string
  timestamp: string
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

const SUGGESTED = [
  { label: "Pipeline health",      prompt: "Which deals need attention today?" },
  { label: "Stalled deals",        prompt: "Show me all stalled deals and their cost of delay." },
  { label: "NOI vs budget",        prompt: "Which active deals are above budget NOI?" },
  { label: "Stage summary",        prompt: "How many deals are in each stage right now?" },
  { label: "Upcoming expirations", prompt: "What leases expire in the next 90 days?" },
  { label: "Agent activity",       prompt: "What have VTS Agents done in the last 24 hours?" },
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
            "shrink-0 h-6 w-6 items-center justify-center rounded-md",
            hovered ? "flex" : "hidden",
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

      {!hovered && (
        <span className={cn(
          "shrink-0 text-[10px] font-medium rounded-md px-1.5 py-0.5 whitespace-nowrap",
          selected ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
        )}>
          {conv.time}
        </span>
      )}
    </div>
  )
}

// ─── Message row ──────────────────────────────────────────────────────────────

function MessageRow({ message }: { message: Message }) {
  const isUser = message.role === "user"
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
        isUser ? "bg-muted/60 border-border/50" : "bg-primary/10 border-primary/20"
      )}>
        <Sparkle className={cn("h-4 w-4", isUser ? "text-muted-foreground" : "text-primary")} />
      </div>
      <div className={cn("flex flex-col gap-1 max-w-lg", isUser && "items-end")}>
        <div className={cn(
          "rounded-xl border px-4 py-3 text-sm text-foreground leading-relaxed",
          isUser ? "bg-primary/10 border-primary/20" : "bg-muted/20 border-border/60"
        )}>
          {message.content.split("\n").map((line, i) => (
            <p key={i} className={i > 0 && line ? "mt-1.5" : i > 0 ? "mt-1" : ""}>{line}</p>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground px-1">{message.timestamp}</p>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function AskVTSPage({ className }: { className?: string }) {
  const [activeId, setActiveId]             = React.useState(CONVERSATIONS[0].id)
  const [convs, setConvs]                   = React.useState<Conversation[]>(CONVERSATIONS)
  const [input, setInput]                   = React.useState("")
  const [mobileShowChat, setMobileShowChat] = React.useState(false)
  const [railCollapsed, setRailCollapsed]   = React.useState(false)
  const bottomRef = React.useRef<HTMLDivElement>(null)

  const active = convs.find(c => c.id === activeId) ?? convs[0]

  const send = () => {
    const text = input.trim()
    if (!text) return
    setInput("")
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const userMsg: Message = { id: `u${Date.now()}`, role: "user", content: text, timestamp: now }
    const thinkId = `t${Date.now()}`
    const thinkMsg: Message = { id: thinkId, role: "assistant", content: "Thinking…", timestamp: now }
    setConvs(prev => prev.map(c =>
      c.id !== activeId ? c : { ...c, messages: [...c.messages, userMsg, thinkMsg], preview: text, time: "Just now" }
    ))
    setTimeout(() => {
      setConvs(prev => prev.map(c => {
        if (c.id !== activeId) return c
        const reply: Message = {
          id: `r${Date.now()}`, role: "assistant",
          content: "I'm analyzing your request across all active deals and agent activity. In production this draws from live deal data, agent outputs, and portfolio intelligence.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
        return { ...c, messages: [...c.messages.filter(m => m.id !== thinkId), reply] }
      }))
    }, 1200)
  }

  const newConversation = () => {
    const id = `c${Date.now()}`
    setConvs(prev => [{ id, title: "New conversation", preview: "Start asking…", time: "Just now", messages: [] }, ...prev])
    setActiveId(id)
    setMobileShowChat(true)
    setRailCollapsed(false)
  }

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
            <div className="flex flex-col items-center py-4 gap-1 flex-1">
              <Button variant="ghost" size="icon" onClick={() => setRailCollapsed(false)}>
                <PanelLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={newConversation}>
                <SquarePen className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
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
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Sparkle className="h-5 w-5 text-foreground shrink-0" />
                  <h2 className="text-xl font-semibold text-foreground">Ask VTS</h2>
                </div>
                <div className="flex items-center">
                  <Button variant="ghost" size="icon" onClick={newConversation}>
                    <SquarePen className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setRailCollapsed(true)}>
                    <PanelLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* New chat */}
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1.5">Recents</p>

              {/* List */}
              <div className="flex flex-col gap-0.5 flex-1 overflow-y-auto min-h-0">
                {convs.map(conv => (
                  <ConvListItem
                    key={conv.id}
                    conv={conv}
                    selected={conv.id === activeId}
                    onSelect={() => { setActiveId(conv.id); setMobileShowChat(true) }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: chat panel */}
        <div className={cn(
          "rounded-2xl bg-card/70 backdrop-blur-md p-5 min-h-0 flex flex-col",
          mobileShowChat ? "flex" : "hidden md:flex"
        )}>

          {/* Messages / empty state */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-4 min-h-0">
            {active.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-64 text-center px-6">
                <div className="h-12 w-12 rounded-2xl bg-muted/60 border border-border/50 flex items-center justify-center mb-4">
                  <Sparkle className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-base font-medium text-foreground mb-1">Ask VTS</p>
                <p className="text-sm text-muted-foreground mb-5 max-w-xs leading-relaxed">
                  Ask about deals, portfolio performance, leasing activity, or agent outputs.
                </p>
                <div className="grid grid-cols-2 gap-2 w-full max-w-sm text-left">
                  {SUGGESTED.map(s => (
                    <button
                      key={s.label}
                      onClick={() => setInput(s.prompt)}
                      className="rounded-xl border border-border/60 px-3 py-3 bg-muted/20 text-left hover:bg-muted/40 hover:border-border transition-colors"
                    >
                      <p className="text-sm font-medium text-foreground leading-snug">{s.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{s.prompt}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {active.messages.map(msg => (
                  <MessageRow key={msg.id} message={msg} />
                ))}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Suggestion chips */}
          {active.messages.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pt-4 pb-1 shrink-0">
              {SUGGESTED.slice(0, 4).map(s => (
                <Button
                  key={s.label}
                  variant="outline"
                  size="sm"
                  className="shrink-0 whitespace-nowrap"
                  onClick={() => setInput(s.prompt)}
                >
                  {s.label}
                </Button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2 items-end pt-4 shrink-0 border-t border-border/60 mt-4">
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Ask about deals, portfolio, agents, or market data…"
              className="flex-1 resize-none text-sm"
              rows={1}
            />
            <Button size="sm" className="gap-1.5 shrink-0" disabled={!input.trim()} onClick={send}>
              <Send className="h-3.5 w-3.5" />
              Send
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}
