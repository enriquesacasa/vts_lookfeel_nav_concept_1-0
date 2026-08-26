import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Send, Sparkle, Plus, User, ArrowLeft } from "lucide-react"

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

// ─── Mock conversations ───────────────────────────────────────────────────────

const CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    title: "KPMG deal stall analysis",
    preview: "What's the cost of delay on the KPMG renewal?",
    time: "Just now",
    messages: [
      { id: "m1", role: "user",      timestamp: "9:12 AM", content: "What's the cost of delay on the KPMG renewal?" },
      { id: "m2", role: "assistant", timestamp: "9:12 AM", content: "The KPMG renewal at Empire State Bldg (Suite 3400, 117,000 sf) has been stalled for 26 days.\n\n**Cost of delay:** $3,705/day based on the budget NOI of $6.435M annually. Total delay cost so far: **$96,330**.\n\nThe blocker is board approval — Paul Simmons indicated the board review was pushed to mid-August. Two follow-up actions are ready:\n\n1. A targeted follow-up to Paul Simmons\n2. A CFO escalation draft\n\nWould you like me to surface those drafts for your review?" },
      { id: "m3", role: "user",      timestamp: "9:13 AM", content: "Yes, show me the CFO escalation draft." },
      { id: "m4", role: "assistant", timestamp: "9:13 AM", content: "Here's the CFO escalation draft from Deal Momentum:\n\n---\n\n**To:** CFO, KPMG\n**Subject:** 399 Park renewal — timing update requested\n\nWe wanted to follow up on the renewal discussion for KPMG's Suite 3400 at Empire State Building. The current proposal has been with your team for 26 days and we want to ensure we can hold the space through your board process.\n\nWould you be available for a brief call this week to confirm timing and keep the process on track?\n\n---\n\nShall I route this for your approval before it sends?" },
    ],
  },
  {
    id: "c2",
    title: "Amazon deal summary",
    preview: "Summarize the Amazon inquiry at VTS Tower",
    time: "Yesterday",
    messages: [
      { id: "m1", role: "user",      timestamp: "2:05 PM", content: "Summarize the Amazon inquiry at VTS Tower." },
      { id: "m2", role: "assistant", timestamp: "2:05 PM", content: "**Amazon.com — VTS Tower, Suite 0800 (Floor 8)**\n\n- **Type:** New deal · 18,000 sf\n- **Stage:** Inquiry\n- **Rep:** Sarah Okonkwo · CBRE\n- **Budget NER:** $98.00 PSF/yr\n- **Budget NOI:** $1.76M/yr\n\nDeal Capture parsed the inbound email and created the record today at 8:50 AM. Tour request submitted for Sep 3. No proposal issued yet.\n\nDeal Intelligence is queued to pull credit, comps, and market context once requirements are confirmed." },
    ],
  },
  {
    id: "c3",
    title: "Deloitte legal status",
    preview: "Where are we on the Deloitte lease?",
    time: "Jul 15",
    messages: [
      { id: "m1", role: "user",      timestamp: "11:00 AM", content: "Where are we on the Deloitte lease?" },
      { id: "m2", role: "assistant", timestamp: "11:00 AM", content: "**Deloitte LLP — VTS Tower HQ, Suite 500**\n\n- **Type:** Expansion · 43,000 sf\n- **Stage:** Legal\n- **Status:** Active\n- **NER:** $72.00 PSF vs $70.00 budget (+2.9%)\n\nLOI was executed and is now in legal review. Counsel Handoff extracted 18 LOI terms and flagged 2 unusual positions:\n\n1. TI escalation clause (non-standard)\n2. Subleasing rights at 75% (market is 85%)\n\nSkadden Arps (tenant) and Willkie Farr (landlord) are exchanging redlines. Negotiation Guidance is tracking 12 open items." },
    ],
  },
  {
    id: "c4",
    title: "Pipeline NOI vs budget",
    preview: "Which active deals are above budget NOI?",
    time: "Jul 14",
    messages: [
      { id: "m1", role: "user",      timestamp: "4:30 PM", content: "Which active deals are above budget NOI?" },
      { id: "m2", role: "assistant", timestamp: "4:30 PM", content: "**Deals tracking above budget NOI:**\n\n| Tenant | NOI | Budget | Δ |\n|--------|-----|--------|---|\n| Starbucks | $1.48M | $1.43M | +4.0% |\n| Deloitte | $3.10M | $3.01M | +2.9% |\n| Morgan Stanley | — | $3.67M | (touring) |\n\n**Deals below budget:**\n\n| Tenant | NOI | Budget | Δ |\n|--------|-----|--------|---|\n| Apex Capital | $2.16M | $2.34M | −7.7% |\n| KPMG | $5.73M | $6.44M | −11.0% |\n| Atlas Group | $2.68M | $3.05M | −12.1% |\n\nKPMG and Atlas Group are the largest budget gaps. Both are stalled." },
    ],
  },
]

// ─── Suggested prompts ────────────────────────────────────────────────────────

const SUGGESTED: { label: string; prompt: string }[] = [
  { label: "Pipeline health",        prompt: "Which deals need attention today?" },
  { label: "Stalled deals",          prompt: "Show me all stalled deals and their cost of delay." },
  { label: "NOI vs budget",          prompt: "Which active deals are above budget NOI?" },
  { label: "Stage summary",          prompt: "How many deals are in each stage right now?" },
  { label: "Upcoming expirations",   prompt: "What leases expire in the next 90 days?" },
  { label: "Agent activity",         prompt: "What have VTS Agents done in the last 24 hours?" },
]

// ─── Inline markdown renderer (bold only) ─────────────────────────────────────

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return (
    <>
      {parts.map((part, j) =>
        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
      )}
    </>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div className={cn(
        "h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
        isUser ? "bg-foreground/8 border border-border" : "bg-primary/10 border border-primary/20"
      )}>
        {isUser
          ? <User className="h-3.5 w-3.5 text-muted-foreground" />
          : <Sparkle className="h-3.5 w-3.5 text-primary" />
        }
      </div>
      <div className={cn("flex flex-col gap-1 max-w-[78%]", isUser && "items-end")}>
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted/50 border border-border/60 text-foreground rounded-tl-sm"
        )}>
          {message.content.split("\n").map((line, i) => (
            <p key={i} className={cn(i > 0 && "mt-1.5", !line && "mt-2")}>
              {line ? <InlineMarkdown text={line} /> : null}
            </p>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground px-1">{message.timestamp}</span>
      </div>
    </div>
  )
}

// ─── Conversation list item ───────────────────────────────────────────────────

function ConvListItem({ conv, selected, onSelect }: {
  conv: Conversation
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex flex-col gap-0.5 px-3 py-2.5 rounded-xl text-left transition-all",
        selected
          ? "bg-primary/10 border border-primary/20"
          : "hover:bg-muted/60 border border-transparent"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className={cn("text-xs font-semibold leading-snug flex-1", selected ? "text-primary" : "text-foreground")}>
          {conv.title}
        </p>
        <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{conv.time}</span>
      </div>
      <p className="text-[11px] text-muted-foreground truncate leading-snug">{conv.preview}</p>
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AskVTSPage({ className }: { className?: string }) {
  const [activeId, setActiveId] = React.useState<string>(CONVERSATIONS[0].id)
  const [convs, setConvs] = React.useState<Conversation[]>(CONVERSATIONS)
  const [input, setInput] = React.useState("")
  const [mobileShowChat, setMobileShowChat] = React.useState(false)
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
      c.id === activeId
        ? { ...c, messages: [...c.messages, userMsg, thinkMsg], preview: text, time: "Just now" }
        : c
    ))

    setTimeout(() => {
      setConvs(prev => prev.map(c => {
        if (c.id !== activeId) return c
        const reply: Message = {
          id: `r${Date.now()}`,
          role: "assistant",
          content: "I'm analyzing your request across all active deals and agent activity. In production this would draw from live deal data, agent outputs, and portfolio intelligence.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
        return { ...c, messages: [...c.messages.filter(m => m.id !== thinkId), reply] }
      }))
    }, 1200)
  }

  const newConversation = () => {
    const id = `c${Date.now()}`
    const conv: Conversation = {
      id,
      title: "New conversation",
      preview: "Start asking…",
      time: "Just now",
      messages: [],
    }
    setConvs(prev => [conv, ...prev])
    setActiveId(id)
    setMobileShowChat(true)
  }

  const selectConv = (id: string) => {
    setActiveId(id)
    setMobileShowChat(true)
  }

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [active?.messages.length])

  return (
    <div className={cn("flex flex-col gap-4", className)}>

      {/* ── Top bar ── */}
      <div className="flex items-center gap-3">
        {mobileShowChat && (
          <Button variant="ghost" size="sm" className="md:hidden gap-1.5 -ml-1 shrink-0"
            onClick={() => setMobileShowChat(false)}>
            <ArrowLeft className="h-4 w-4" />
            History
          </Button>
        )}
        <div className={cn("flex items-center gap-2", mobileShowChat && "hidden md:flex")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <Sparkle className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">Ask VTS</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Portfolio intelligence</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px] text-primary border-primary/30 bg-primary/5 ml-auto hidden sm:inline-flex">
          Connected to live deal data
        </Badge>
      </div>

      {/* ── Two-panel grid (matches agents page) ── */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 flex-1 min-h-0">

        {/* ── Left: conversation history card ── */}
        <div className={cn(
          "rounded-2xl bg-card/70 backdrop-blur-md flex flex-col min-h-0 overflow-hidden",
          mobileShowChat ? "hidden md:flex" : "flex"
        )}>
          {/* Card header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 shrink-0">
            <p className="text-xs font-semibold text-foreground uppercase tracking-widest">History</p>
            <Button size="sm" variant="outline" className="h-6 gap-1 text-[11px] px-2" onClick={newConversation}>
              <Plus className="h-3 w-3" />
              New
            </Button>
          </div>
          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-0.5">
            {convs.map(conv => (
              <ConvListItem
                key={conv.id}
                conv={conv}
                selected={conv.id === activeId}
                onSelect={() => selectConv(conv.id)}
              />
            ))}
          </div>
        </div>

        {/* ── Right: chat panel ── */}
        <div className={cn(
          "rounded-2xl bg-card/70 backdrop-blur-md flex flex-col min-h-0 overflow-hidden",
          mobileShowChat ? "flex" : "hidden md:flex"
        )}>

          {/* Chat header */}
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border/60 shrink-0">
            <div>
              <p className="text-sm font-semibold text-foreground leading-tight">{active.title}</p>
              <p className="text-[11px] text-muted-foreground">{active.messages.length} messages</p>
            </div>
          </div>

          {/* Messages or empty state */}
          <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
            {active.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-5 text-center max-w-sm mx-auto">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                  <Sparkle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-base font-semibold text-foreground mb-1">Ask anything</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Ask about deals, portfolio performance, leasing activity, or agent outputs.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full text-left">
                  {SUGGESTED.map(s => (
                    <button
                      key={s.label}
                      onClick={() => setInput(s.prompt)}
                      className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-left hover:bg-muted/60 hover:border-border transition-colors"
                    >
                      <p className="text-xs font-semibold text-foreground">{s.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{s.prompt}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {active.messages.map(msg => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Quick-suggestion chips when a conversation is active */}
          {active.messages.length > 0 && (
            <div className="px-5 pb-2 flex gap-2 overflow-x-auto shrink-0">
              {SUGGESTED.slice(0, 4).map(s => (
                <button
                  key={s.label}
                  onClick={() => setInput(s.prompt)}
                  className="shrink-0 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors whitespace-nowrap"
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className="px-5 pb-5 pt-2 shrink-0">
            <div className="flex gap-2 items-end rounded-xl border border-border/60 bg-background/60 px-4 py-3">
              <Textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
                placeholder="Ask about deals, portfolio, agents, or market data…"
                className="flex-1 resize-none border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[36px] max-h-[120px] p-0 placeholder:text-muted-foreground"
                rows={1}
              />
              <Button
                size="sm"
                className="shrink-0 gap-1.5 h-8"
                disabled={!input.trim()}
                onClick={send}
              >
                <Send className="h-3.5 w-3.5" />
                Send
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
