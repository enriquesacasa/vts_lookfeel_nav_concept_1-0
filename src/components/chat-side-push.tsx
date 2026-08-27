import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkle, ArrowUp, X, Maximize2 } from "lucide-react"
import { useChatPattern, type TransferMessage } from "@/contexts/chat-pattern"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

function generateResponse(text: string): string {
  const l = text.toLowerCase()
  const tenant = text.split(" — ")[0]

  if (l.includes("stalled")) {
    const days = text.match(/stalled (\d+) days/)?.[1]
    return `**${tenant}** has been stalled for ${days ?? "several"} days. Cost of delay is accumulating — I can draft a re-engagement outreach or surface this in Deal Momentum's action queue.`
  }
  if (l.includes("lease expiration")) {
    const date = text.match(/· ([A-Z][a-z]+ \d+, \d{4})/)?.[1]
    return `**${tenant}**'s lease expires ${date ? `on ${date}` : "soon"}. I'd recommend initiating renewal discussions now. Want me to draft an opening proposal or pull comps?`
  }
  if (l.includes("renewal window")) {
    return `The renewal window for **${tenant}** is open. I can draft an opening renewal proposal or model the economics — which would be more useful?`
  }
  if (l.includes("vacant") || l.includes("days on market")) {
    const days = text.match(/(\d+) days on market/)?.[1]
    return `**${tenant}** has been vacant for ${days ?? "an extended period"}. Want me to pull active requirements or draft a marketing brief?`
  }
  if (l.includes("loi") || l.includes("lease out")) {
    return `**${tenant}** is in ${l.includes("loi") ? "LOI" : "Lease Out"}. I can summarize open items, flag non-standard positions, or draft a follow-up.`
  }
  if (l.includes("at-risk") || l.includes("competitor")) {
    return `**${tenant}** is showing competitor risk. Want me to model a counter-proposal or draft a re-engagement?`
  }
  return `I've pulled context on **${tenant}**. What would you like to do — draft an outreach, run a scenario, or surface related activity?`
}

export const SIDE_PUSH_WIDTH = 380

export function ChatSidePush() {
  const { sidePushOpen, closeSidePush, pending, clearPending, openChat } = useChatPattern()
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState("")
  const [suggestionsVisible, setSuggestionsVisible] = React.useState(false)
  const [suggestions, setSuggestions] = React.useState<string[]>([])
  const bottomRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const hasSentRef = React.useRef<string | null>(null)
  const initialMsgRef = React.useRef<string>("")
  const initialSuggsRef = React.useRef<string[]>([])

  React.useEffect(() => {
    if (!sidePushOpen || !pending?.message) return
    if (hasSentRef.current === pending.message) return
    hasSentRef.current = pending.message
    initialMsgRef.current = pending.message
    initialSuggsRef.current = pending.suggestions ?? []
    setSuggestions(pending.suggestions ?? [])
    setSuggestionsVisible(false)
    const userMsg: Message = { id: "u0", role: "user", content: pending.message }
    setMessages([userMsg, { id: "t0", role: "assistant", content: "Thinking…" }])
    clearPending()
    setTimeout(() => {
      setMessages([userMsg, { id: "r0", role: "assistant", content: generateResponse(pending.message) }])
      setSuggestionsVisible(true)
      setTimeout(() => inputRef.current?.focus(), 50)
    }, 900)
  }, [sidePushOpen, pending])

  React.useEffect(() => {
    if (!sidePushOpen) {
      setMessages([])
      setInput("")
      setSuggestionsVisible(false)
      hasSentRef.current = null
    }
  }, [sidePushOpen])

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  const sendText = (text: string) => {
    setSuggestionsVisible(false)
    const id = `u${Date.now()}`
    const thinkId = `t${Date.now()}`
    setMessages(prev => [...prev,
      { id, role: "user", content: text },
      { id: thinkId, role: "assistant", content: "Thinking…" },
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
    <div
      className={cn(
        "fixed top-0 right-0 h-full z-30 transition-all duration-300 ease-in-out pt-4 pb-4 pr-4",
        sidePushOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      style={{ width: sidePushOpen ? SIDE_PUSH_WIDTH : 0 }}
    >
      <div className="h-full flex flex-col rounded-2xl border border-border bg-card/70 backdrop-blur-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Sparkle className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Ask VTS</span>
          </div>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={() => {
              const transfer: TransferMessage[] = messages.filter(m => m.content !== "Thinking…")
              closeSidePush()
              openChat({ message: initialMsgRef.current, suggestions: initialSuggsRef.current, transferMessages: transfer })
            }}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground" onClick={closeSidePush}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0">
          {messages.map(msg => {
            const isUser = msg.role === "user"
            return (
              <div key={msg.id} className={cn("flex", isUser && "justify-end")}>
                <div className={cn(
                  "rounded-xl px-3.5 py-2.5 text-sm leading-relaxed max-w-[85%]",
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

        {/* Suggestion pills */}
        {suggestionsVisible && suggestions.length > 0 && (
          <div className="shrink-0 px-4 pb-3 flex flex-col gap-1.5">
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
        <div className="shrink-0 border-t border-border px-4 py-3">
          <div className="flex items-end gap-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="Ask a follow-up…"
              className="resize-none text-sm border-none shadow-none bg-transparent focus-visible:ring-0 p-0 min-h-0 flex-1"
              rows={1}
            />
            <Button size="icon" className="h-7 w-7 shrink-0" disabled={!input.trim()} onClick={send}>
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
