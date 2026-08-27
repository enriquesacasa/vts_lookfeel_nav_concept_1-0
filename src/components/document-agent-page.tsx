import * as React from "react"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { LogoMenuContent } from "@/components/logo-menu-content"
import {
  ArrowUp, PenLine, SquarePen, PanelLeft, ChevronDown,
  MoreHorizontal, Share2, Pencil, Trash2, ThumbsUp, ThumbsDown,
  Copy, RefreshCw, FileText, FilePlus2, Upload, Download, Mail,
  ChevronRight, ExternalLink, Bold, Italic, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link, List, ListOrdered, Underline, Strikethrough,
  Undo2, Redo2, Indent, Outdent, Table, Image,
  Sparkle, Search, Clock, Mic, AudioLines, Plus, Pin, Archive, X, ArrowLeft,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "user" | "assistant"

interface DocMessage {
  id: string
  role: Role
  content: string
  timestamp: string
}

interface DocSession {
  id: string
  title: string
  time: string
  messages: DocMessage[]
  docTitle?: string
}

interface DocTemplate {
  id: string
  name: string
  description: string
  category: string
}

interface RecentDoc {
  id: string
  name: string
  type: string
  modified: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TEMPLATES: DocTemplate[] = [
  { id: "loi",             name: "Letter of intent",           description: "Generate from proposal terms",    category: "Leasing" },
  { id: "lease-amendment", name: "Lease amendment",            description: "Modify existing lease terms",     category: "Leasing" },
  { id: "options-notice",  name: "Options & rights notice",    description: "Exercise or waive tenant options", category: "Leasing" },
  { id: "first-draft",     name: "First draft lease",          description: "Standard form from VTS library",  category: "Leasing" },
  { id: "estoppel",        name: "Tenant estoppel certificate",description: "Confirm lease status for lender", category: "Operations" },
  { id: "nda",             name: "Confidentiality agreement",  description: "NDA for deal discussions",         category: "General" },
]

const RECENT_DOCS: RecentDoc[] = [
  { id: "d1", name: "Amazon LOI — VTS Tower Fl. 8",     type: "LOI",           modified: "Today, 9:41 AM" },
  { id: "d2", name: "KPMG Lease Amendment No. 3",       type: "Amendment",     modified: "Yesterday" },
  { id: "d3", name: "Apex Capital First Draft Lease",   type: "Lease",         modified: "Aug 22" },
  { id: "d4", name: "Deloitte Expansion Option Notice", type: "Options notice", modified: "Aug 20" },
  { id: "d5", name: "Meridian Health Estoppel Cert.",   type: "Estoppel",      modified: "Aug 18" },
]

const SESSIONS: DocSession[] = [
  {
    id: "s1", title: "Amazon LOI", time: "Today",
    docTitle: "Amazon LOI — VTS Tower Fl. 8",
    messages: [
      { id: "m1", role: "user",      timestamp: "9:38 AM", content: "Draft an LOI for the Amazon deal at VTS Tower Floor 8. Pull from the current proposal." },
      { id: "m2", role: "assistant", timestamp: "9:39 AM", content: "I've pulled the current proposal terms for the Amazon deal and drafted the LOI.\n\n**What I used:**\n— Tenant: Amazon.com, Inc.\n— Premises: Suite 0800, Floor 8, VTS Tower\n— Rentable area: 18,000 sf\n— Base rent: $82.00 PSF/yr NNN\n— Term: 7 years from rent commencement\n— TI allowance: $85.00 PSF\n— Free rent: 2 months\n\n**One flag:** The TI allowance ($85 PSF) exceeds the standard policy threshold ($75 PSF) — flagged in the document. Let me know if you want to adjust before sending." },
      { id: "m3", role: "user",      timestamp: "9:41 AM", content: "Change the free rent to 3 months and update the document." },
      { id: "m4", role: "assistant", timestamp: "9:41 AM", content: "Done — free rent updated to 3 months throughout. Rent commencement date pushed accordingly. Ready for your review." },
    ],
  },
  {
    id: "s2", title: "KPMG Amendment No. 3", time: "Yesterday",
    docTitle: "KPMG Lease Amendment No. 3",
    messages: [
      { id: "m1", role: "user",      timestamp: "2:10 PM", content: "Draft Amendment No. 3 to the KPMG lease. They're adding Floor 22." },
      { id: "m2", role: "assistant", timestamp: "2:11 PM", content: "I've pulled the original KPMG lease and drafted Amendment No. 3 to add Floor 22 as expansion premises.\n\n**Key terms added:**\n— Expansion premises: Suite 2200, Floor 22 (~12,000 sf)\n— Expansion commencement: Subject to size confirmation\n— Rent: Left as [TBD] pending your input\n— Existing terms otherwise unchanged\n\nWant me to model the economics and fill in the expansion rent?" },
    ],
  },
]

const BLANK_DOC = ""

const SAMPLE_LOI = `LETTER OF INTENT

Date: August 27, 2026

To: VTS Tower, LLC ("Landlord")
From: Amazon.com, Inc. ("Tenant")

Re: Suite 0800, Floor 8, VTS Tower, New York, NY 10001

This Letter of Intent ("LOI") sets forth the proposed terms and
conditions under which Landlord and Tenant intend to enter into
a lease agreement for the above-referenced premises.

1. PREMISES
Suite 0800 on the 8th floor of VTS Tower, containing
approximately 18,000 rentable square feet ("Premises").

2. TERM
Seven (7) years from the date of rent commencement
("Commencement Date"), estimated to be on or about March 1, 2025.

3. BASE RENT
$82.00 per rentable square foot per year, triple net (NNN),
subject to annual escalations of 3% per year over the initial term.

4. TENANT IMPROVEMENT ALLOWANCE
Landlord shall provide Tenant with a Tenant Improvement Allowance
of $85.00 per rentable square foot ($1,530,000 total).

⚠ Note: TI allowance exceeds standard policy ($75 PSF). VP
sign-off recommended before sending.

5. FREE RENT
Tenant shall be entitled to three (3) months of free base rent
commencing on the Commencement Date.

6. SECURITY DEPOSIT
An amount equal to two (2) months of base rent.

7. THIS LOI IS NON-BINDING
This LOI is intended solely as a statement of intent and shall
not constitute a binding contract between the parties.`

function generateDocResponse(text: string): string {
  const l = text.toLowerCase()
  if (l.includes("change") || l.includes("update") || l.includes("edit") || l.includes("modify"))
    return "Done — updated throughout the document. All cross-references and defined terms reflect the change."
  if (l.includes("export") || l.includes("word") || l.includes("google"))
    return "Ready to export. Download as Word (.docx), PDF, or send directly to Google Docs in your VTS Shared Drive."
  if (l.includes("email") || l.includes("send"))
    return "Ready to send. I can pre-fill the recipient from the deal record and draft a cover note — want me to?"
  if (l.includes("loi") || l.includes("letter of intent"))
    return "LOI drafted from the current proposal terms. Two items flagged for your review before sending: TI above policy, and the commencement date is estimated."
  if (l.includes("amendment"))
    return "Amendment drafted and structured to match the original lease. All defined terms carried forward — new section added as the next article."
  if (l.includes("option") || l.includes("notice"))
    return "Options notice drafted. Delivery must be by certified mail per the lease — I can prep an email cover with a follow-up hard copy note."
  return "I can draft, revise, or finalize this document. I'll pull context from the deal record, executed leases, and VTS templates."
}

// ─── Left file rail ───────────────────────────────────────────────────────────

function FileRail({ onSelectDoc, onNewFromTemplate, onNewDoc, activeDocId, collapsed, onToggleCollapse, recentDocs, logoOpen, onLogoOpenChange, isDark, onToggleDark }: {
  onSelectDoc: (doc: RecentDoc) => void
  onNewFromTemplate: (t: DocTemplate) => void
  onNewDoc: () => void
  activeDocId: string | null
  collapsed: boolean
  onToggleCollapse: () => void
  recentDocs: RecentDoc[]
  logoOpen: boolean
  onLogoOpenChange: (open: boolean) => void
  isDark: boolean
  onToggleDark?: () => void
}) {
  const [templatesOpen, setTemplatesOpen] = React.useState(true)
  const [recentsOpen, setRecentsOpen] = React.useState(true)

  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-3 gap-3 flex-1">
        <Button variant="ghost" size="icon" onClick={onToggleCollapse}>
          <PanelLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onToggleCollapse}>
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onNewDoc}>
          <FilePlus2 className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <FileText className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-56">
            {TEMPLATES.map(t => (
              <DropdownMenuItem key={t.id} className="gap-2 text-sm" onClick={() => onNewFromTemplate(t)}>
                <span className="truncate">{t.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <Clock className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" className="w-56">
            {recentDocs.map(doc => (
              <DropdownMenuItem key={doc.id} className="gap-2 text-sm" onClick={() => onSelectDoc(doc)}>
                <span className="truncate">{doc.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 p-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Popover open={logoOpen} onOpenChange={onLogoOpenChange}>
            <PopoverTrigger render={<div />} nativeButton={false} className="cursor-pointer focus:outline-none" aria-label="Open settings">
              <PenLine className="h-5 w-5 text-primary shrink-0" />
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0 overflow-hidden" align="start">
              <LogoMenuContent isDark={isDark} onToggleDark={onToggleDark} onClose={() => onLogoOpenChange(false)} />
            </PopoverContent>
          </Popover>
          <h2 className="text-xl font-semibold text-foreground">Doc Drafting</h2>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onToggleCollapse}>
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* New document button */}
      <Button variant="outline" size="sm" className="gap-1.5 w-full mb-4" onClick={onNewDoc}>
        <FilePlus2 className="h-3.5 w-3.5" />
        New document
      </Button>

      {/* Content */}
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto gap-4">

        {/* Templates */}
        <Collapsible open={templatesOpen} onOpenChange={setTemplatesOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full mb-2">
            <span className="text-sm font-medium text-foreground">Templates</span>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", !templatesOpen && "-rotate-90")} />
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-0.5">
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => onNewFromTemplate(t)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-muted/60 text-foreground">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate">{t.name}</span>
              </button>
            ))}
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-muted/60 text-foreground">
              <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground">Upload template…</span>
            </button>
          </CollapsibleContent>
        </Collapsible>

        {/* Recents */}
        <Collapsible open={recentsOpen} onOpenChange={setRecentsOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full mb-2">
            <span className="text-sm font-medium text-foreground">Recents</span>
            <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", !recentsOpen && "-rotate-90")} />
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-0.5">
            {recentDocs.map(doc => (
              <div key={doc.id}
                onClick={() => onSelectDoc(doc)}
                className={cn(
                  "group w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-left transition-all cursor-pointer",
                  activeDocId === doc.id ? "bg-primary/10 text-primary" : "hover:bg-muted/60 text-foreground"
                )}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">{doc.name}</p>
                  <p className={cn("text-[11px] mt-0.5", activeDocId === doc.id ? "text-primary/70" : "text-muted-foreground")}>{doc.modified}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    onClick={e => e.stopPropagation()}
                    className={cn(
                      "shrink-0 h-6 w-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity",
                      activeDocId === doc.id ? "text-primary hover:bg-primary/20" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem className="gap-2 text-sm"><Share2 className="h-3.5 w-3.5" />Share</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-sm"><Pencil className="h-3.5 w-3.5" />Rename</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-sm"><Pin className="h-3.5 w-3.5" />Pin document</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-sm"><Archive className="h-3.5 w-3.5" />Archive</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="gap-2 text-sm text-destructive focus:text-destructive"><Trash2 className="h-3.5 w-3.5" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full justify-start px-3 text-muted-foreground text-xs h-8 mt-0.5">
              More
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}

// ─── Chat panel ───────────────────────────────────────────────────────────────

function MessageRow({ msg }: { msg: DocMessage }) {
  const isUser = msg.role === "user"
  return (
    <div className={cn("flex gap-2", isUser && "flex-row-reverse")}>
      <div className={cn("flex flex-col gap-1", isUser && "items-end")}>
        <div className={cn(
          "rounded-xl px-3 py-2.5 text-sm text-foreground leading-relaxed max-w-[240px]",
          isUser ? "bg-primary/10" : "bg-muted/40"
        )}>
          {msg.content.split("\n").map((line, i) => {
            const parts = line.split(/\*\*(.+?)\*\*/g)
            const rendered = parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)
            return <p key={i} className={i > 0 && line ? "mt-1.5" : i > 0 ? "mt-0.5" : ""}>{rendered}</p>
          })}
        </div>
        {!isUser && (
          <div className="flex items-center gap-0.5 px-0.5">
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground h-5 w-5"><ThumbsUp className="h-3 w-3" /></Button>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground h-5 w-5"><Copy className="h-3 w-3" /></Button>
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground h-5 w-5"><RefreshCw className="h-3 w-3" /></Button>
          </div>
        )}
      </div>
    </div>
  )
}

const TEMPLATE_SUGGESTIONS: Record<string, string[]> = {
  "loi":             ["Draft from current proposal", "Use Amazon deal terms", "Start from blank"],
  "lease-amendment": ["Pull from existing lease", "Add expansion space", "Modify rent terms"],
  "options-notice":  ["Exercise renewal option", "Exercise expansion option", "Waive option"],
  "first-draft":     ["Use standard VTS form", "Start from prior deal", "Upload my template"],
  "estoppel":        ["Pull from active lease", "Use standard form", "Custom clauses"],
  "nda":             ["Mutual NDA", "One-way NDA", "Deal-specific NDA"],
  "__new__":         ["Draft an LOI", "Create a lease amendment", "Write an options notice", "Start from a template"],
}

function ChatPanel({ sessions, activeId, onSelectSession, onNewSession, templateContext, onSendSuggestion }: {
  sessions: DocSession[]
  activeId: string
  onSelectSession: (id: string) => void
  onNewSession: () => void
  templateContext: string | null
  onSendSuggestion: (text: string) => void
}) {
  const [input, setInput] = React.useState("")
  const [localSessions, setLocalSessions] = React.useState(sessions)
  const bottomRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setLocalSessions(prev => {
      const existingIds = new Set(prev.map(s => s.id))
      const newOnes = sessions.filter(s => !existingIds.has(s.id))
      return newOnes.length > 0 ? [...newOnes, ...prev] : prev
    })
  }, [sessions])

  const active = localSessions.find(s => s.id === activeId) ?? localSessions[0]

  const sendText = (text: string) => {
    if (!text.trim()) return
    setInput("")
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const userMsg: DocMessage = { id: `u${Date.now()}`, role: "user", content: text, timestamp: now }
    const thinkId = `t${Date.now()}`
    const thinkMsg: DocMessage = { id: thinkId, role: "assistant", content: "Working on it…", timestamp: now }
    setLocalSessions(prev => prev.map(s =>
      s.id !== activeId ? s : { ...s, messages: [...s.messages, userMsg, thinkMsg] }
    ))
    setTimeout(() => {
      setLocalSessions(prev => prev.map(s => {
        if (s.id !== activeId) return s
        const reply: DocMessage = { id: `r${Date.now()}`, role: "assistant", content: generateDocResponse(text), timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
        return { ...s, messages: [...s.messages.filter(m => m.id !== thinkId), reply] }
      }))
    }, 900)
  }

  const send = () => { sendText(input); onSendSuggestion(input) }

  React.useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [active?.messages.length])

  const suggestions = templateContext ? (TEMPLATE_SUGGESTIONS[templateContext] ?? TEMPLATE_SUGGESTIONS["__new__"]) : null
  const isEmpty = (active?.messages ?? []).length === 0

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {isEmpty ? (
          <div className="flex flex-col justify-end h-full pb-1">
            {/* Assistant message + suggestions as one turn */}
            <div className="flex flex-col gap-2">
              <div className="rounded-xl px-3 py-2.5 text-sm text-foreground leading-relaxed bg-muted/40 max-w-[85%]">
                What would you like to draft?
              </div>
              {suggestions && (
                <div className="flex flex-wrap gap-2">
                  {suggestions.map(s => (
                    <Button key={s} variant="outline" size="sm"
                      className="rounded-full shrink-0 whitespace-nowrap"
                      onClick={() => { sendText(s); onSendSuggestion(s) }}>
                      {s}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          (active?.messages ?? []).map(msg => <MessageRow key={msg.id} msg={msg} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input — matches Ask VTS */}
      <div className="shrink-0 px-4 pb-4 pt-2">
        <div className="rounded-2xl border border-border bg-card px-4 pt-3 pb-2">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="What would you like to change or add?"
            className="w-full resize-none text-sm border-none shadow-none bg-transparent focus-visible:ring-0 p-0 min-h-10"
            rows={1}
          />
          <div className="flex items-center justify-between mt-2">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Mic className="h-4 w-4" />
              </Button>
              {input.trim() ? (
                <Button size="icon" onClick={() => sendText(input)}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
              ) : (
                <Button size="icon" onClick={() => {}}>
                  <AudioLines className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Toolbar separator ────────────────────────────────────────────────────────

function Sep() {
  return <div className="w-px h-4 bg-border/50 mx-0.5 shrink-0" />
}

function TBtn({ children, title, active }: { children: React.ReactNode; title?: string; active?: boolean }) {
  return (
    <Button variant="ghost" size="icon-sm" title={title}
      className={cn("h-7 w-7 shrink-0", active ? "bg-muted text-foreground" : "text-muted-foreground")}>
      {children}
    </Button>
  )
}

// ─── Document editor ──────────────────────────────────────────────────────────

function DocumentEditor({ title, content }: { title: string; content: string }) {
  const [align, setAlign] = React.useState<"left"|"center"|"right"|"justify">("left")
  const editorRef = React.useRef<HTMLDivElement>(null)

  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
  }

  const alignIcon = {
    left: <AlignLeft className="h-3.5 w-3.5" />,
    center: <AlignCenter className="h-3.5 w-3.5" />,
    right: <AlignRight className="h-3.5 w-3.5" />,
    justify: <AlignJustify className="h-3.5 w-3.5" />,
  }[align]

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-1.5 border-b border-border/60 bg-card shrink-0 overflow-x-auto">
        {/* History */}
        <TBtn title="Undo" onClick={() => exec("undo")}><Undo2 className="h-3.5 w-3.5" /></TBtn>
        <TBtn title="Redo" onClick={() => exec("redo")}><Redo2 className="h-3.5 w-3.5" /></TBtn>
        <Sep />

        {/* Style picker */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground gap-1 shrink-0 w-[100px] justify-between">
              Normal text <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuItem className="text-sm" onClick={() => exec("formatBlock", "p")}>Normal text</DropdownMenuItem>
            <DropdownMenuItem className="text-xl font-bold" onClick={() => exec("formatBlock", "h1")}>Heading 1</DropdownMenuItem>
            <DropdownMenuItem className="text-lg font-semibold" onClick={() => exec("formatBlock", "h2")}>Heading 2</DropdownMenuItem>
            <DropdownMenuItem className="text-base font-medium" onClick={() => exec("formatBlock", "h3")}>Heading 3</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Sep />

        {/* Inline formatting */}
        <TBtn title="Bold" onClick={() => exec("bold")}><Bold className="h-3.5 w-3.5" /></TBtn>
        <TBtn title="Italic" onClick={() => exec("italic")}><Italic className="h-3.5 w-3.5" /></TBtn>
        <TBtn title="Underline" onClick={() => exec("underline")}><Underline className="h-3.5 w-3.5" /></TBtn>
        <TBtn title="Strikethrough" onClick={() => exec("strikeThrough")}><Strikethrough className="h-3.5 w-3.5" /></TBtn>
        <Sep />

        {/* Lists */}
        <TBtn title="Bullet list" onClick={() => exec("insertUnorderedList")}><List className="h-3.5 w-3.5" /></TBtn>
        <TBtn title="Numbered list" onClick={() => exec("insertOrderedList")}><ListOrdered className="h-3.5 w-3.5" /></TBtn>
        <TBtn title="Indent" onClick={() => exec("indent")}><Indent className="h-3.5 w-3.5" /></TBtn>
        <TBtn title="Outdent" onClick={() => exec("outdent")}><Outdent className="h-3.5 w-3.5" /></TBtn>
        <Sep />

        {/* Alignment */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" title="Alignment" className="h-7 w-7 text-muted-foreground shrink-0">
              {alignIcon}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem className="gap-2 text-sm" onClick={() => { exec("justifyLeft"); setAlign("left") }}><AlignLeft className="h-3.5 w-3.5" />Left</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-sm" onClick={() => { exec("justifyCenter"); setAlign("center") }}><AlignCenter className="h-3.5 w-3.5" />Center</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-sm" onClick={() => { exec("justifyRight"); setAlign("right") }}><AlignRight className="h-3.5 w-3.5" />Right</DropdownMenuItem>
            <DropdownMenuItem className="gap-2 text-sm" onClick={() => { exec("justifyFull"); setAlign("justify") }}><AlignJustify className="h-3.5 w-3.5" />Justify</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Sep />

        {/* Insert */}
        <TBtn title="Insert link" onClick={() => { const url = prompt("URL"); if (url) exec("createLink", url) }}><Link className="h-3.5 w-3.5" /></TBtn>
        <TBtn title="Insert table"><Table className="h-3.5 w-3.5" /></TBtn>
        <TBtn title="Insert image"><Image className="h-3.5 w-3.5" /></TBtn>
        <Sep />

        {/* AI */}
        <Button variant="ghost" size="sm" className="h-7 px-2 gap-1 text-xs text-muted-foreground shrink-0">
          <Sparkle className="h-3 w-3 text-primary" />AI edit
        </Button>
      </div>

      {/* Document canvas */}
      <div className="flex-1 overflow-y-auto bg-muted/20 px-8 py-10">
        <div className="max-w-[720px] mx-auto bg-card shadow-sm rounded-sm border border-border/30 px-16 py-14 min-h-[900px]">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            className="outline-none text-sm text-foreground leading-relaxed min-h-[800px] [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-medium [&_h3]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-0.5 [&_a]:text-primary [&_a]:underline"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "14px", lineHeight: "1.9", whiteSpace: "pre-wrap" }}
            dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br>") }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyDocState({ onSelect }: { onSelect: (t: DocTemplate) => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 bg-background">
      <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center mb-5">
        <PenLine className="h-7 w-7 text-primary" />
      </div>
      <p className="text-lg font-semibold text-foreground mb-1.5">No document open</p>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">Pick a template from the left panel, describe what you need in the chat, or start from an existing document.</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {TEMPLATES.slice(0, 3).map(t => (
          <button key={t.id} onClick={() => onSelect(t)}
            className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm text-foreground hover:bg-muted/60 transition-colors">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            {t.name}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

type MobileView = "rail" | "chat" | "doc"

export function DocumentAgentPage({ className, isDark = false, onToggleDark }: { className?: string; isDark?: boolean; onToggleDark?: () => void }) {
  const [sessions, setSessions]         = React.useState<DocSession[]>(SESSIONS)
  const [activeId, setActiveId]         = React.useState(SESSIONS[0].id)
  const [recentDocs, setRecentDocs]     = React.useState<RecentDoc[]>(RECENT_DOCS)
  const [activeDocId, setActiveDocId]   = React.useState<string | null>(RECENT_DOCS[0].id)
  const [railCollapsed, setRailCollapsed] = React.useState(false)
  const [templateContext, setTemplateContext] = React.useState<string | null>(null)
  const [mobileView, setMobileView]     = React.useState<MobileView>("rail")
  const [logoOpen, setLogoOpen]         = React.useState(false)
  const [activeDoc, setActiveDoc]       = React.useState<{ title: string; content: string } | null>({
    title: SESSIONS[0].docTitle ?? SESSIONS[0].title,
    content: SAMPLE_LOI,
  })

  const goBack = () => {
    const prev = window.history.length > 1 ? null : "#/dashboard"
    if (prev) { window.location.hash = prev } else { window.history.back() }
  }

  const openDoc = (title: string, docId: string | null = null) => {
    setActiveDoc({ title, content: SAMPLE_LOI })
    setActiveDocId(docId)
    setTemplateContext(null)
  }

  const newFromTemplate = (t: DocTemplate) => {
    const id = `s${Date.now()}`
    const docId = `d${Date.now()}`
    setSessions(prev => [{ id, title: t.name, time: "Just now", messages: [], docTitle: t.name }, ...prev])
    setRecentDocs(prev => [{ id: docId, name: t.name, type: t.category, modified: "Just now" }, ...prev])
    setActiveId(id)
    setActiveDoc({ title: t.name, content: BLANK_DOC })
    setActiveDocId(docId)
    setTemplateContext(t.id)
    setMobileView("chat")
  }

  const newSession = () => {
    const id = `s${Date.now()}`
    const docId = `d${Date.now()}`
    setSessions(prev => [{ id, title: "New document", time: "Just now", messages: [] }, ...prev])
    setRecentDocs(prev => [{ id: docId, name: "New document", type: "Document", modified: "Just now" }, ...prev])
    setActiveId(id)
    setActiveDoc({ title: "New document", content: BLANK_DOC })
    setActiveDocId(docId)
    setTemplateContext("__new__")
    setMobileView("chat")
  }

  return (
    <div className={cn(
      "flex flex-col h-screen overflow-hidden gap-4 p-4 transition-all duration-300",
      className
    )}>

      {/* Mobile back header */}
      {mobileView !== "rail" && (
        <div className="flex items-center md:hidden shrink-0">
          <Button variant="ghost" size="sm" className="gap-1.5 -ml-1"
            onClick={() => setMobileView(mobileView === "doc" ? "chat" : "rail")}>
            <ArrowLeft className="h-4 w-4" />
            {mobileView === "doc" ? "Chat" : "Back"}
          </Button>
          {mobileView === "chat" && activeDoc && (
            <Button variant="ghost" size="sm" className="ml-auto gap-1.5"
              onClick={() => setMobileView("doc")}>
              <FileText className="h-4 w-4" />
              Open document
            </Button>
          )}
        </div>
      )}

      {/* Desktop + mobile panels */}
      <div className="flex flex-1 min-h-0 gap-4">

      {/* ── 1: File rail (templates + recents) ── */}
      <div className={cn(
        "shrink-0 flex flex-col rounded-2xl bg-card/70 backdrop-blur-md overflow-hidden min-h-0 transition-all duration-300",
        railCollapsed ? "w-[48px]" : "w-[280px]",
        mobileView === "rail" ? "flex" : "hidden md:flex"
      )}>
        <FileRail
          onSelectDoc={doc => { openDoc(doc.name, doc.id); setMobileView("doc") }}
          onNewFromTemplate={newFromTemplate}
          onNewDoc={newSession}
          activeDocId={activeDocId}
          recentDocs={recentDocs}
          collapsed={railCollapsed}
          onToggleCollapse={() => setRailCollapsed(p => !p)}
          logoOpen={logoOpen}
          onLogoOpenChange={setLogoOpen}
          isDark={isDark}
          onToggleDark={onToggleDark}
        />
      </div>

      {/* ── 2: Chat panel ── */}
      <div className={cn(
        "w-full md:w-[340px] shrink-0 flex flex-col rounded-2xl bg-card/70 backdrop-blur-md overflow-hidden min-h-0",
        mobileView === "chat" ? "flex" : "hidden md:flex"
      )}>
        <ChatPanel
          sessions={sessions}
          activeId={activeId}
          onSelectSession={id => { setActiveId(id); const s = sessions.find(x => x.id === id); if (s?.docTitle) { openDoc(s.docTitle); setMobileView("doc") } }}
          onNewSession={newSession}
          templateContext={templateContext}
          onSendSuggestion={() => { setTemplateContext(null); setMobileView("doc") }}
        />
      </div>

      {/* ── 3: Document editor ── */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 rounded-2xl overflow-hidden bg-card/70 backdrop-blur-md",
        mobileView === "doc" ? "flex" : "hidden md:flex"
      )}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-card/80 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm font-medium text-foreground truncate">
              {activeDoc ? activeDoc.title : "No document open"}
            </span>
            {activeDoc && <Badge variant="secondary" className="text-[10px] h-4 px-1.5 shrink-0">Draft</Badge>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {activeDoc && (<>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
                    <Download className="h-3.5 w-3.5" />Export
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem className="gap-2 text-sm"><FileText className="h-3.5 w-3.5" />Download as Word</DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 text-sm"><FileText className="h-3.5 w-3.5" />Download as PDF</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 text-sm"><ExternalLink className="h-3.5 w-3.5" />Open in Google Docs</DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 text-sm"><ExternalLink className="h-3.5 w-3.5" />Open in Word Online</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
                <Mail className="h-3.5 w-3.5" />Email
              </Button>
              <Button size="sm" className="gap-1.5 text-xs h-7">
                <Share2 className="h-3.5 w-3.5" />Share
              </Button>
              <div className="w-px h-4 bg-border/60 mx-1" />
            </>)}
            <Button variant="ghost" size="icon-sm" className="h-7 w-7 text-muted-foreground" onClick={goBack}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Doc body */}
        <div className="flex-1 overflow-hidden">
          {activeDoc
            ? <DocumentEditor title={activeDoc.title} content={activeDoc.content} />
            : <EmptyDocState onSelect={newFromTemplate} />
          }
        </div>
      </div>

      </div>{/* end desktop+mobile panels */}
    </div>
  )
}
