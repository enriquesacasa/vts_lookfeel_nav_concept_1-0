import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkle, ArrowUp, X, Maximize2 } from "lucide-react"
import { SUGGESTED } from "@/components/ask-vts"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface PopoverMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

interface ChatPopoverContentProps {
  initialMessage: string
  suggestions?: string[]
  onClose: () => void
  onOpenFullScreen: (messages: PopoverMessage[]) => void
}

function generateQuickResponse(text: string): string {
  const l = text.toLowerCase()
  const tenant = text.split(" — ")[0]

  if (l.includes("stalled")) {
    const days = text.match(/stalled (\d+) days/)?.[1]
    return `**${tenant}** has been stalled for ${days ?? "several"} days. Cost of delay is accumulating — I can draft a re-engagement outreach or surface this in Deal Momentum's action queue. What would you like to do?`
  }
  if (l.includes("lease expiration")) {
    const date = text.match(/· ([A-Z][a-z]+ \d+, \d{4})/)?.[1]
    return `**${tenant}**'s lease expires ${date ? `on ${date}` : "soon"}. I'd recommend initiating renewal discussions now. Want me to draft an opening proposal or pull comps for this space?`
  }
  if (l.includes("renewal window")) {
    return `The renewal window for **${tenant}** is open. I can draft an opening renewal proposal or model the economics — which would be more useful right now?`
  }
  if (l.includes("vacant") || l.includes("days on market")) {
    const space = tenant
    const days = text.match(/(\d+) days on market/)?.[1]
    return `**${space}** has been vacant for ${days ?? "an extended period"}. Want me to pull active requirements that fit this space, or draft a marketing brief?`
  }
  if (l.includes("loi") || l.includes("lease out")) {
    return `**${tenant}** is in ${l.includes("loi") ? "LOI" : "Lease Out"}. I can summarize open items, flag any non-standard positions, or draft a follow-up to keep things moving.`
  }
  if (l.includes("at-risk") || l.includes("competitor")) {
    return `**${tenant}** is showing competitor risk. Want me to model a counter-proposal or draft a re-engagement to address their concerns directly?`
  }
  return `I've pulled context on **${tenant}**. What would you like to do — draft an outreach, run a scenario, or surface related activity?`
}

export function ChatPopoverContent({ initialMessage, suggestions, onClose, onOpenFullScreen }: ChatPopoverContentProps) {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState("")
  const [suggestionsVisible, setSuggestionsVisible] = React.useState(false)
  const bottomRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const hasSentRef = React.useRef(false)

  React.useEffect(() => {
    if (hasSentRef.current) return
    if (!initialMessage) { setTimeout(() => inputRef.current?.focus(), 50); return }
    hasSentRef.current = true
    const userMsg: Message = { id: "u0", role: "user", content: initialMessage }
    const thinkId = "t0"
    setMessages([userMsg, { id: thinkId, role: "assistant", content: "Thinking…" }])
    setTimeout(() => {
      setMessages([userMsg, { id: "r0", role: "assistant", content: generateQuickResponse(initialMessage) }])
      setSuggestionsVisible(true)
      setTimeout(() => inputRef.current?.focus(), 50)
    }, 900)
  }, [initialMessage])

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  const sendText = (text: string) => {
    setSuggestionsVisible(false)
    const id = `u${Date.now()}`
    const thinkId = `t${Date.now()}`
    setMessages(prev => [...prev,
      { id, role: "user", content: text },
      { id: thinkId, role: "assistant", content: "Thinking…" }
    ])
    setTimeout(() => {
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== thinkId)
        return [...filtered, {
          id: `r${Date.now()}`, role: "assistant",
          content: "I'm analyzing your request in context of this deal. In production, this draws from live deal data, agent outputs, and portfolio intelligence.",
        }]
      })
    }, 1000)
  }

  const send = () => {
    const text = input.trim()
    if (!text) return
    setInput("")
    sendText(text)
  }

  return (
    <div className="flex flex-col w-80 h-[480px]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0">
        <div className="flex items-center gap-1.5">
          <Sparkle className="h-3.5 w-3.5 text-primary" />
          <span className="text-sm font-semibold text-foreground">Ask VTS</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={() => onOpenFullScreen(messages.filter(m => m.content !== "Thinking…"))}>
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={onClose}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col gap-2 px-3 py-4 overflow-y-auto">
          <p className="text-xs font-semibold text-foreground mb-1">What do you want to tackle?</p>
          {SUGGESTED.slice(0, 4).map((s) => (
            <button key={s.label} onClick={() => sendText(s.prompt)}
              className="text-left text-xs px-3 py-2 rounded-md border border-primary text-primary bg-transparent hover:bg-primary/10 transition-colors leading-snug w-full">
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className={cn("overflow-y-auto px-3 py-3 flex flex-col gap-3 min-h-0", messages.length === 0 ? "hidden" : "flex-1")}>
        {messages.map(msg => {
          const isUser = msg.role === "user"
          return (
            <div key={msg.id} className={cn("flex", isUser && "justify-end")}>
              <div className={cn(
                "rounded-xl px-3 py-2 text-xs leading-relaxed max-w-[85%]",
                isUser ? "bg-primary/10 text-foreground" : "bg-muted/50 text-foreground"
              )}>
                {msg.content.split("\n").map((line, i) => {
                  const ps = line.split(/\*\*(.+?)\*\*/g)
                  const rs = ps.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)
                  return <p key={i} className={i > 0 && line ? "mt-1" : i > 0 ? "mt-0.5" : ""}>{rs}</p>
                })}
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Suggestion pills — always in DOM to avoid layout shift */}
      {suggestions && suggestions.length > 0 && (
        <div className={cn("shrink-0 px-3 flex flex-col gap-1.5 transition-all duration-200 overflow-hidden", suggestionsVisible ? "opacity-100 pb-2 max-h-48" : "opacity-0 pointer-events-none pb-0 max-h-0")}>
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => sendText(s)}
              className="text-left text-xs px-3 py-2 rounded-md border border-primary text-primary bg-transparent hover:bg-primary/10 transition-colors leading-snug w-full"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 border-t border-border px-3 py-2.5">
        <div className="flex items-end gap-2">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder={messages.length === 0 ? "Ask anything about your portfolio…" : "Follow up…"}
            className="resize-none text-xs border-none shadow-none bg-transparent focus-visible:ring-0 p-0 min-h-0 flex-1"
            rows={1}
          />
          <Button size="icon" className="h-6 w-6 shrink-0" disabled={!input.trim()} onClick={send}>
            <ArrowUp className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
