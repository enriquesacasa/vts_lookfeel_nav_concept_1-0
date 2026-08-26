import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Send, Sparkle, Plus, ChevronRight, User } from "lucide-react"

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
  { label: "Pipeline health",   prompt: "Which deals need attention today?" },
  { label: "Stalled deals",     prompt: "Show me all stalled deals and their cost of delay." },
  { label: "NOI vs budget",     prompt: "Which active deals are above budget NOI?" },
  { label: "Stage summary",     prompt: "How many deals are in each stage right now?" },
  { label: "Upcoming expirations", prompt: "What leases expire in the next 90 days?" },
  { label: "Agent activity",    prompt: "What have VTS Agents done in the last 24 hours?" },
]

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div className={cn(
        "h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
        isUser ? "bg-foreground/10" : "bg-primary/10"
      )}>
        {isUser
          ? <User className="h-3.5 w-3.5 text-foreground" />
          : <Sparkle className="h-3.5 w-3.5 text-primary" />
        }
      </div>
      <div className={cn("flex flex-col gap-1 max-w-[80%]", isUser && "items-end")}>
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted/60 border border-border/60 text-foreground rounded-tl-sm"
        )}>
          {message.content.split("\n").map((line, i) => {
            // Bold (**text**)
            const parts = line.split(/\*\*(.*?)\*\*/g)
            return (
              <p key={i} className={i > 0 ? "mt-1.5" : ""}>
                {parts.map((part, j) =>
                  j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                )}
              </p>
            )
          })}
        </div>
        <span className="text-[10px] text-muted-foreground px-1">{message.timestamp}</span>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AskVTSPage() {
  const [activeId, setActiveId] = React.useState<string | null>(CONVERSATIONS[0].id)
  const [convs, setConvs] = React.useState<Conversation[]>(CONVERSATIONS)
  const [input, setInput] = React.useState("")
  const [showHistory, setShowHistory] = React.useState(true)
  const bottomRef = React.useRef<HTMLDivElement>(null)

  const active = convs.find(c => c.id === activeId) ?? null

  const send = () => {
    const text = input.trim()
    if (!text || !activeId) return
    setInput("")

    const userMsg: Message = {
      id: `u${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
    const thinkingMsg: Message = {
      id: `a${Date.now()}`,
      role: "assistant",
      content: "Thinking…",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setConvs(prev => prev.map(c =>
      c.id === activeId
        ? { ...c, messages: [...c.messages, userMsg, thinkingMsg], preview: text, time: "Just now" }
        : c
    ))

    setTimeout(() => {
      const reply: Message = {
        id: `ar${Date.now()}`,
        role: "assistant",
        content: "I'm analyzing your request across all active deals and agent activity. I'll have a full answer for you shortly — this would connect to live deal data, agent outputs, and portfolio intelligence in production.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setConvs(prev => prev.map(c =>
        c.id === activeId
          ? { ...c, messages: [...c.messages.filter(m => m.id !== thinkingMsg.id), userMsg, reply] }
          : c
      ))
    }, 1200)
  }

  const newConversation = () => {
    const id = `c${Date.now()}`
    const conv: Conversation = {
      id,
      title: "New conversation",
      preview: "Start a new conversation",
      time: "Just now",
      messages: [],
    }
    setConvs(prev => [conv, ...prev])
    setActiveId(id)
  }

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [active?.messages])

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden">

      {/* Left: history panel */}
      <div className={cn(
        "flex flex-col border-r border-border bg-card transition-all duration-200 shrink-0",
        showHistory ? "w-64" : "w-0 overflow-hidden"
      )}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <p className="text-sm font-semibold text-foreground">History</p>
          <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs" onClick={newConversation}>
            <Plus className="h-3.5 w-3.5" />
            New
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {convs.map(conv => (
            <button
              key={conv.id}
              onClick={() => setActiveId(conv.id)}
              className={cn(
                "w-full flex flex-col gap-0.5 px-4 py-3 text-left transition-colors border-b border-border/40 last:border-0",
                conv.id === activeId ? "bg-primary/8 border-l-2 border-l-primary" : "hover:bg-muted/50"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className={cn("text-xs font-semibold truncate flex-1", conv.id === activeId ? "text-primary" : "text-foreground")}>{conv.title}</p>
                <span className="text-[10px] text-muted-foreground shrink-0">{conv.time}</span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">{conv.preview}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Right: chat area */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0">

        {/* Chat header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-card shrink-0">
          <button
            onClick={() => setShowHistory(h => !h)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className={cn("h-4 w-4 transition-transform", showHistory && "rotate-180")} />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Sparkle className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {active?.title ?? "Ask VTS"}
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] text-primary border-primary/30 bg-primary/5 ml-auto">
            Connected to live deal data
          </Badge>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
          {!active || active.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 text-center max-w-lg mx-auto">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                <Sparkle className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground mb-1">Ask VTS</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ask anything about your deals, portfolio, leasing activity, or agents. Answers draw from live deal data, agent outputs, and market context.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 w-full">
                {SUGGESTED.map(s => (
                  <button
                    key={s.label}
                    onClick={() => setInput(s.prompt)}
                    className={cn(
                      cardBase,
                      "text-left px-3 py-2.5 hover:bg-muted/60 hover:border-border transition-colors"
                    )}
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

        {/* Suggested chips when there are messages */}
        {active && active.messages.length > 0 && (
          <div className="px-6 pb-2 flex gap-2 overflow-x-auto shrink-0">
            {SUGGESTED.slice(0, 3).map(s => (
              <button
                key={s.label}
                onClick={() => setInput(s.prompt)}
                className="shrink-0 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-6 pb-6 pt-2 shrink-0">
          <div className={cn(cardBase, "flex gap-3 items-end p-3")}>
            <Textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Ask about deals, portfolio, agents, or market data…"
              className="flex-1 resize-none border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[40px] max-h-[160px] p-0"
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
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Ask VTS connects to live deal data, agent outputs, and portfolio intelligence.
          </p>
        </div>

      </div>
    </div>
  )
}
