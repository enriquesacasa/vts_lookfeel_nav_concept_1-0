import * as React from "react"
import { cn, agentIconBtn, sidebarBtn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sparkle } from "lucide-react"
import { useChatPattern, type TransferMessage } from "@/contexts/chat-pattern"
import { ChatPopoverContent } from "@/components/chat-popover"

interface AgentBtnProps {
  label?: string
  entity?: string
  onClick?: (e: React.MouseEvent) => void
  /** "icon" = icon-only with tooltip (default). "run" = inline text button. */
  variant?: "icon" | "run"
  className?: string
}

function getSuggestions(label: string): string[] {
  const l = label.toLowerCase()
  const tenant = label.split(" — ")[0]

  // Stalled deal
  if (l.includes("stalled")) {
    return [
      `What's the cost of delay on the ${tenant} deal per day?`,
      `Draft a re-engagement email to ${tenant}'s rep`,
      `Are there comparable deals that closed faster at this stage?`,
    ]
  }
  // At-risk deal
  if (l.includes("at-risk") || l.includes("competitor")) {
    return [
      `What concessions could win back ${tenant}?`,
      `Compare our proposal to likely competing buildings`,
      `What's the NOI impact if we lose ${tenant}?`,
    ]
  }
  // LOI / Legal / Lease Out
  if (l.includes("loi") || l.includes("legal") || l.includes("lease out")) {
    return [
      `Summarize open items and blockers for the ${tenant} deal`,
      `Draft a follow-up to accelerate ${tenant} to execution`,
      `What's the budget NOI delta if ${tenant} closes at current rent?`,
    ]
  }
  // Proposal
  if (l.includes("proposal")) {
    return [
      `What are the key risks in the ${tenant} proposal?`,
      `Model the economics if ${tenant} counters below budget`,
      `Draft a countersign narrative for ${tenant}`,
    ]
  }
  // Touring — Amazon: encumbrance-specific suggestions
  if (l.includes("touring") || l.includes("tour")) {
    if (tenant.toLowerCase().includes("amazon")) {
      return [
        `What encumbrances burden the spaces ${tenant} is touring and how do they affect deal viability?`,
        `Which encumbrance holders have priority rights over ${tenant}'s target spaces — and what's our exposure?`,
        `What feedback has ${tenant} given so far?`,
      ]
    }
    return [
      `Which spaces are the best fit for ${tenant} based on their requirements?`,
      `Draft a tour follow-up email for ${tenant}`,
      `What feedback has ${tenant} given so far?`,
    ]
  }
  // Inquiry
  if (l.includes("inquiry")) {
    return [
      `Run Space Match for ${tenant}'s requirements`,
      `Summarize the ${tenant} requirement and suggest next steps`,
      `Draft an intro email to ${tenant}'s broker`,
    ]
  }
  // Executed / closed
  if (l.includes("executed")) {
    return [
      `What were the final economics on the ${tenant} deal?`,
      `Are there any post-close tasks outstanding for ${tenant}?`,
      `How did the ${tenant} deal compare to budget?`,
    ]
  }
  // Lease expiration
  if (l.includes("lease expiration")) {
    return [
      `What's the NOI at risk if ${tenant} doesn't renew?`,
      `When should we start the renewal conversation with ${tenant}?`,
      `Pull comps for comparable renewals in this submarket`,
    ]
  }
  // Renewal window
  if (l.includes("renewal window")) {
    return [
      `Has ${tenant} signaled renewal intent yet?`,
      `Draft an opening renewal proposal for ${tenant}`,
      `What NER range should we target for the ${tenant} renewal?`,
    ]
  }
  // Options (ROFO, contraction, expansion)
  if (l.includes("rofo") || l.includes("contraction") || l.includes("expansion option")) {
    return [
      `What's the financial impact if ${tenant} exercises this option?`,
      `What should our response strategy be for ${tenant}'s option?`,
      `Are there other tenants whose plans would be affected?`,
    ]
  }
  // Vacant space
  if (l.includes("vacant") || l.includes("days on market")) {
    const space = label.split(" — ")[0]
    return [
      `What's the monthly carrying cost for ${space}?`,
      `Which active requirements are the best fit for ${space}?`,
      `Draft a marketing brief for ${space} targeting likely tenant profiles`,
    ]
  }
  return [
    "What actions should I take here?",
    "How does this compare to budget?",
    "Show me related activity from the last 30 days",
  ]
}

export function AgentBtn({ label, entity, onClick, variant = "icon", className }: AgentBtnProps) {
  const tooltipText = entity ? `Ask VTS about this ${entity}` : "Ask VTS"
  const { pattern, openChat } = useChatPattern()
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  const [hovered, setHovered] = React.useState(false)

  if (variant === "run") {
    const runMsg = label || "Ask VTS"
    const handleRun = (e: React.MouseEvent) => {
      openChat({ message: runMsg, suggestions: getSuggestions(runMsg) })
      onClick?.(e)
    }
    return (
      <Button variant="outline" size="sm" onClick={handleRun}
        className={cn("gap-1 shrink-0", sidebarBtn, className)}>
        <Sparkle className="h-3 w-3" />
        Ask VTS
      </Button>
    )
  }

  const msg = label || "Ask VTS"

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (pattern === "popover") {
      setPopoverOpen(true)
    } else {
      openChat({ message: msg, suggestions: getSuggestions(msg) })
      onClick?.(e)
    }
  }

  if (pattern === "popover") {
    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <Tooltip open={popoverOpen ? false : undefined}>
        <PopoverTrigger render={<span />}>
          <TooltipTrigger render={<span />}>
          <Button
            variant="secondary"
            size="icon-sm"
            onClick={handleClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={cn(
              agentIconBtn,
              "relative overflow-visible transition-all duration-300",
              hovered ? "agent-btn-active scale-105" : "",
              "active:scale-95",
              className
            )}
          >
            <span className={cn(
              "agent-glow-blob pointer-events-none absolute inset-[-5px] rounded-full opacity-0 blur-[8px] transition-opacity duration-400",
              "bg-gradient-to-br from-primary/80 via-primary to-primary/70",
              hovered && "opacity-40"
            )} />
            {hovered && (
              <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-primary/40 animate-sparkle-ping" />
            )}
            <Sparkle className={cn(
              "agent-sparkle-icon h-3.5 w-3.5 relative z-10 transition-transform duration-300",
              hovered ? "scale-105" : "",
            )} />
          </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <div className="flex items-center gap-1.5">
              <Sparkle className="h-3 w-3" />
              {tooltipText}
            </div>
          </TooltipContent>
        </PopoverTrigger>
        </Tooltip>
        <PopoverContent side="top" align="end" className="p-0 overflow-hidden w-auto" sideOffset={8}>
          <ChatPopoverContent
            initialMessage={msg}
            suggestions={getSuggestions(msg)}
            onClose={() => setPopoverOpen(false)}
            onOpenFullScreen={(messages: TransferMessage[]) => {
              setPopoverOpen(false)
              openChat({ message: msg, suggestions: getSuggestions(msg), transferMessages: messages })
            }}
          />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<span />}>
        <Button
          variant="secondary"
          size="icon-sm"
          onClick={handleClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={cn(
            agentIconBtn,
            "relative overflow-visible transition-all duration-300",
            hovered ? "agent-btn-active scale-105" : "",
            "active:scale-95",
            className
          )}
        >
          {/* Soft outer glow blob — blooms behind button on hover */}
          <span className={cn(
            "agent-glow-blob pointer-events-none absolute inset-[-5px] rounded-full opacity-0 blur-[8px] transition-opacity duration-400",
            "bg-gradient-to-br from-primary/80 via-primary to-primary/70",
            hovered && "opacity-40"
          )} />

          {/* Ping ring */}
          {hovered && (
            <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-primary/40 animate-sparkle-ping" />
          )}

          <Sparkle className={cn(
            "agent-sparkle-icon h-3.5 w-3.5 relative z-10 transition-transform duration-300",
            hovered ? "scale-105" : "",
            "group-active:scale-90"
          )} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <div className="flex items-center gap-1.5">
          <Sparkle className="h-3 w-3" />
          {tooltipText}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
