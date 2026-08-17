import * as React from "react"
import { agentIconBtn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Sparkle } from "lucide-react"

interface AgentBtnProps {
  label: string
  onClick?: (e: React.MouseEvent) => void
}

export function AgentBtn({ label, onClick }: AgentBtnProps) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span />}>
        <Button variant="secondary" size="icon-sm" className={agentIconBtn} onClick={onClick}>
          <Sparkle className="h-3.5 w-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="bg-sidebar text-sidebar-foreground border-transparent font-medium" arrowClassName="fill-sidebar">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-medium text-sidebar-foreground">
            <Sparkle className="h-3 w-3" />
            Run Agent
          </div>
          <p className="text-sidebar-foreground/70 font-normal">{label}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
