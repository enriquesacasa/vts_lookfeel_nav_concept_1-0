import * as React from "react"
import { cn } from "@/lib/utils"
import { Search, Sparkle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useChatPattern, type TransferMessage } from "@/contexts/chat-pattern"
import { ChatPopoverContent } from "@/components/chat-popover"

interface BuildingHeaderProps {
  image?: string | React.ReactNode
  name: React.ReactNode
  address: string
  city: string
  badges?: React.ReactNode
  actions?: React.ReactNode
  className?: string
  onAskVts?: () => void
}

function BuildingHeader({ image, name, address, city, badges, actions, className }: BuildingHeaderProps) {
  const { pattern, openChat } = useChatPattern()
  const [popoverOpen, setPopoverOpen] = React.useState(false)

  const handleAskVts = () => {
    if (pattern === "popover") {
      setPopoverOpen(true)
    } else {
      openChat({})
    }
  }

  const askVtsBtn = (
    <Button className="hidden sm:inline-flex gap-1.5" onClick={handleAskVts}>
      <Sparkle className="h-3.5 w-3.5" />
      Ask VTS
    </Button>
  )

  return (
    <div className={cn(className)}>
      <div className="flex items-stretch gap-4 py-3">
        {image && (
          typeof image === "string"
            ? <div className="relative shrink-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden self-start">
                <img src={image as string} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30" />
              </div>
            : <>{image}</>
        )}
        <div className="flex-1 flex flex-col justify-between">
          {city && (
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {city}
            </p>
          )}
          <div className="flex items-center gap-6 flex-wrap">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium text-foreground leading-tight">
              {name}
            </h1>
            {actions}
          </div>
          <div>
            <p className="text-sm text-foreground">{address}</p>
            {badges && <div className="flex flex-wrap gap-1.5 mt-1">{badges}</div>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {pattern === "popover" ? (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen} modal={false}>
              <PopoverTrigger render={<span />}>
                {askVtsBtn}
              </PopoverTrigger>
              <PopoverContent side="bottom" align="end" className="p-0 overflow-hidden w-auto" sideOffset={8}>
                <ChatPopoverContent
                  initialMessage=""
                  suggestions={[]}
                  onClose={() => setPopoverOpen(false)}
                  onOpenFullScreen={(messages: TransferMessage[]) => {
                    setPopoverOpen(false)
                    openChat({ transferMessages: messages })
                  }}
                />
              </PopoverContent>
            </Popover>
          ) : askVtsBtn}
          <Button variant="outline" size="icon" aria-label="Search">
            <Search className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
BuildingHeader.displayName = "BuildingHeader"

export { BuildingHeader }
export type { BuildingHeaderProps }
