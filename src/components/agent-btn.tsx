import * as React from "react"
import { cn, agentIconBtn, sidebarBtn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Sparkle } from "lucide-react"

interface AgentBtnProps {
  label?: string
  onClick?: (e: React.MouseEvent) => void
  /** "icon" = icon-only with tooltip (default). "run" = inline text button. */
  variant?: "icon" | "run"
  className?: string
}

export function AgentBtn({ label, onClick, variant = "icon", className }: AgentBtnProps) {
  const [hovered, setHovered] = React.useState(false)

  if (variant === "run") {
    return (
      <Button variant="outline" size="sm" onClick={onClick}
        className={cn("gap-1 shrink-0", sidebarBtn, className)}>
        <Sparkle className="h-3 w-3" />
        Run Agent
      </Button>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<span />}>
        <Button
          variant="secondary"
          size="icon-sm"
          onClick={onClick}
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
            "bg-gradient-to-br from-[oklch(0.60_0.18_265)] via-[oklch(0.52_0.20_277)] to-[oklch(0.56_0.17_293)]",
            hovered && "opacity-40"
          )} />

          {/* Ping ring */}
          {hovered && (
            <span className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[oklch(0.51_0.175_277/0.4)] animate-sparkle-ping" />
          )}

          <Sparkle className={cn(
            "agent-sparkle-icon h-3.5 w-3.5 relative z-10 transition-transform duration-300",
            hovered ? "scale-105" : "",
            "group-active:scale-90"
          )} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-sidebar text-sidebar-foreground border-transparent font-medium" arrowClassName="fill-sidebar">
        <div className="flex items-center gap-1.5">
          <Sparkle className="h-3 w-3 animate-sparkle-spin" />
          Ask VTS
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
