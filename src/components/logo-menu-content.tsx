import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sun, Moon, ChevronRight } from "lucide-react"

import { useChatPattern, type ChatPattern } from "@/contexts/chat-pattern"

interface LogoMenuContentProps {
  isDark?: boolean
  onToggleDark?: () => void
  onNavigate?: (hash: string) => void
  onClose?: () => void
}

const PROTOTYPE_LINKS = [
  { label: "Main view",      hash: "#/dashboard" },
  { label: "Inquiry email",  hash: "#/inquiry-email" },
]

const DOC_LINKS = [
  { label: "Theme showcase",   hash: "#/theme" },
  { label: "Agent principles", hash: "#/principles" },
]

const CHAT_PATTERNS: { id: ChatPattern; label: string; active: boolean }[] = [
  { id: "full-screen", label: "Full screen", active: true  },
  { id: "popover",     label: "Popover",     active: true  },
  { id: "side-over",   label: "Side over",   active: true  },
  { id: "side-push",   label: "Side push",   active: true  },
]

export function LogoMenuContent({ isDark = false, onToggleDark, onNavigate, onClose }: LogoMenuContentProps) {
  const { pattern, setPattern } = useChatPattern()

  const navigate = (hash: string) => {
    if (onNavigate) { onNavigate(hash) } else { window.location.hash = hash }
    onClose?.()
  }

  return (
    <>
      {/* Appearance */}
      <div className="px-3 py-2.5 border-b border-border">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Appearance</p>
        <div className="flex gap-2">
          <Button variant={isDark ? "ghost" : "default"} size="sm" className="flex-1 gap-1.5"
            onClick={() => { if (isDark) { onToggleDark?.(); onClose?.() } }}>
            <Sun className="h-3.5 w-3.5" /> Light
          </Button>
          <Button variant={isDark ? "default" : "ghost"} size="sm" className="flex-1 gap-1.5"
            onClick={() => { if (!isDark) { onToggleDark?.(); onClose?.() } }}>
            <Moon className="h-3.5 w-3.5" /> Dark
          </Button>
        </div>
      </div>
      {/* AI chat pattern */}
      <div className="px-3 py-2.5 border-b border-border">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">AI chat pattern</p>
        <div className="flex flex-col gap-1">
          {CHAT_PATTERNS.map(({ id, label, active }) => (
            <div key={id}
              onClick={() => active && setPattern(id)}
              className={`flex items-center justify-between px-2.5 py-2 rounded-lg transition-colors ${
                active ? "cursor-pointer hover:bg-muted/60" : "opacity-50 cursor-not-allowed"
              } ${pattern === id && active ? "bg-primary/10" : ""}`}
            >
              <span className={`text-sm ${pattern === id && active ? "text-primary font-medium" : "text-foreground"}`}>
                {label}
              </span>
              {active
                ? <span className={`h-2 w-2 rounded-full transition-colors ${pattern === id ? "bg-primary" : "bg-muted-foreground/25"}`} />
                : <Badge variant="secondary" className="text-[10px] h-4 px-1.5">Coming soon</Badge>
              }
            </div>
          ))}
        </div>
      </div>
      {/* Prototype */}
      <div className="px-3 py-2.5 border-b border-border">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Prototype</p>
        <div className="flex flex-col gap-0.5">
          {PROTOTYPE_LINKS.map(link => (
            <button key={link.hash} onClick={() => navigate(link.hash)}
              className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-sm text-foreground hover:bg-muted/60 transition-colors text-left">
              {link.label}
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            </button>
          ))}
        </div>
      </div>
      {/* Documentation */}
      <div className="px-3 py-2.5">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Documentation</p>
        <div className="flex flex-col gap-0.5">
          {DOC_LINKS.map(link => (
            <button key={link.hash} onClick={() => navigate(link.hash)}
              className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-sm text-foreground hover:bg-muted/60 transition-colors text-left">
              {link.label}
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
