import * as React from "react"

export type ChatPattern = "full-screen" | "popover" | "side-over" | "side-push"
export type AgentsView = "ask-vts" | "vts-agents"

export interface TransferMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

export interface ChatContext {
  message?: string
  suggestions?: string[]
  transferMessages?: TransferMessage[]
}

interface ChatPatternContextValue {
  pattern: ChatPattern
  setPattern: (p: ChatPattern) => void
  pending: ChatContext | null
  openChat: (ctx: ChatContext) => void
  clearPending: () => void
  sideOverOpen: boolean
  closeSideOver: () => void
  sidePushOpen: boolean
  closeSidePush: () => void
  agentsView: AgentsView
  setAgentsView: (v: AgentsView) => void
}

const ChatPatternContext = React.createContext<ChatPatternContextValue>({
  pattern: "side-push",
  setPattern: () => {},
  pending: null,
  openChat: () => {},
  clearPending: () => {},
  sideOverOpen: false,
  closeSideOver: () => {},
  sidePushOpen: false,
  closeSidePush: () => {},
  agentsView: "ask-vts",
  setAgentsView: () => {},
})

export function useChatPattern() {
  return React.useContext(ChatPatternContext)
}

interface ChatPatternProviderProps {
  children: React.ReactNode
  onOpenChat: () => void
}

export function ChatPatternProvider({ children, onOpenChat }: ChatPatternProviderProps) {
  const [pattern, setPattern] = React.useState<ChatPattern>("side-push")
  const [pending, setPending] = React.useState<ChatContext | null>(null)
  const [sideOverOpen, setSideOverOpen] = React.useState(false)
  const [sidePushOpen, setSidePushOpen] = React.useState(false)
  const [agentsView, setAgentsView] = React.useState<AgentsView>("ask-vts")

  const openChat = React.useCallback((ctx: ChatContext) => {
    if (ctx.transferMessages || pattern === "full-screen") {
      setPending(ctx)
      onOpenChat()
    } else if (pattern === "side-over") {
      setPending(ctx)
      setSideOverOpen(true)
    } else if (pattern === "side-push" || pattern === "popover") {
      setPending(ctx)
      setSidePushOpen(true)
    }
  }, [pattern, onOpenChat])

  const clearPending = React.useCallback(() => setPending(null), [])
  const closeSideOver = React.useCallback(() => { setSideOverOpen(false); setPending(null) }, [])
  const closeSidePush = React.useCallback(() => { setSidePushOpen(false); setPending(null) }, [])

  return (
    <ChatPatternContext.Provider value={{ pattern, setPattern, pending, openChat, clearPending, sideOverOpen, closeSideOver, sidePushOpen, closeSidePush, agentsView, setAgentsView }}>
      {children}
    </ChatPatternContext.Provider>
  )
}
