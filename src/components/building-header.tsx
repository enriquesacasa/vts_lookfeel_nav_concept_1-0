import * as React from "react"
import { cn } from "@/lib/utils"
import { Search, Sparkle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useChatPattern, type TransferMessage } from "@/contexts/chat-pattern"
import { ChatPopoverContent } from "@/components/chat-popover"

interface BuildingStat {
  label: string
  value: string
  accent?: boolean
}

interface BuildingHeaderProps {
  image?: string | React.ReactNode
  name: React.ReactNode
  address: string
  city: string
  stats: BuildingStat[]
  badges?: React.ReactNode
  actions?: React.ReactNode
  className?: string
  onAskVts?: () => void
}

function BuildingHeader({ image, name, address, city, stats, badges, actions, className }: BuildingHeaderProps) {
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
      {/* Hero section */}
      <div className="flex items-center gap-4 py-3">
        {image && (
          typeof image === "string"
            ? <div className="relative shrink-0 w-16 h-16 sm:w-24 sm:h-24 rounded-xl overflow-hidden">
                <img src={image as string} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30" />
              </div>
            : <>{image}</>
        )}
        <div className="flex-1">
          {city && (
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
              {city}
            </p>
          )}
          <div className="flex items-center gap-6 mb-1.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-foreground leading-tight">
              {name}
            </h1>
            {actions}
          </div>
          <p className="text-sm text-foreground">{address}</p>
          {badges && <div className="flex flex-wrap gap-1.5 mt-2">{badges}</div>}
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

      {/* Stats row */}
      <div className="flex flex-wrap divide-x divide-border/60 bg-card/70 backdrop-blur-md">
        {stats.map(({ label, value, accent }) => (
          <div key={label} className="flex-1 min-w-[110px] px-4 py-4">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">
              {label}
            </p>
            <p className={cn(
              "text-lg font-medium truncate",
              accent ? "text-primary" : "text-foreground"
            )}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
BuildingHeader.displayName = "BuildingHeader"

export { BuildingHeader }
export type { BuildingHeaderProps, BuildingStat }
