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
  ArrowUp, PenLine, PanelLeft, ChevronDown,
  MoreHorizontal, Share2, Pencil, Trash2, ThumbsUp,
  Copy, RefreshCw, FileText, FilePlus2, Upload, Download, Mail,
  ExternalLink, Bold, Italic, AlignLeft, AlignCenter, AlignRight, AlignJustify,
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
  {
    id: "s3", title: "Apex Capital First Draft", time: "Aug 22",
    docTitle: "Apex Capital First Draft Lease",
    messages: [
      { id: "m1", role: "user",      timestamp: "11:05 AM", content: "Generate a first draft lease for Apex Capital, Floor 31, 8,500 sf." },
      { id: "m2", role: "assistant", timestamp: "11:06 AM", content: "First draft generated from the VTS standard form.\n\n**Key terms:**\n— Premises: Suite 3100, Floor 31, ~8,500 sf\n— Term: 5 years from February 1, 2027\n— Base rent: $78.00 PSF/yr NNN, 3% annual escalations\n— TI allowance: $65.00 PSF ($552,500)\n— Free rent: 6 months from commencement\n\nThis is marked as a draft for discussion only. Want me to flag any non-standard clauses or compare against recent comps?" },
    ],
  },
  {
    id: "s4", title: "Deloitte Expansion Notice", time: "Aug 20",
    docTitle: "Deloitte Expansion Option Notice",
    messages: [
      { id: "m1", role: "user",      timestamp: "3:22 PM", content: "Draft the expansion option notice for Deloitte. They want Floor 19." },
      { id: "m2", role: "assistant", timestamp: "3:23 PM", content: "Options notice drafted per Section 42 of the Deloitte lease.\n\n**Summary:**\n— Expansion space: Suite 1900, Floor 19, ~9,200 sf\n— Proposed commencement: January 1, 2027\n— Notice delivered 12+ months in advance, satisfying the lease requirement\n\nI flagged that delivery must be by certified mail per Section 42(b). Want me to draft an email cover note with a follow-up hard copy reminder?" },
    ],
  },
  {
    id: "s5", title: "Meridian Estoppel Cert.", time: "Aug 18",
    docTitle: "Meridian Health Estoppel Cert.",
    messages: [
      { id: "m1", role: "user",      timestamp: "10:14 AM", content: "Generate the estoppel certificate for Meridian Health. Lender is requesting it." },
      { id: "m2", role: "assistant", timestamp: "10:15 AM", content: "Estoppel certificate drafted from the Meridian Health lease record.\n\n**Confirmed:**\n— Lease in full force and effect, no modifications\n— Term expires April 30, 2031 with one 5-year renewal option at FMV\n— Rent current through August 2026, no prepaid rent\n— Security deposit: $97,500 on file\n— No defaults or outstanding claims by either party\n\nReady for tenant signature. Want me to send to Meridian's legal contact on file?" },
    ],
  },
]

const NEW_SESSION_ID = "s-new"

const NEW_SESSION: DocSession = {
  id: NEW_SESSION_ID,
  title: "New document",
  time: "",
  messages: [],
}

const BLANK_DOC = ""

const SAMPLE_KPMG_AMENDMENT = `LEASE AMENDMENT NO. 3

Date: August 26, 2026

Re: Lease dated January 15, 2019, as amended, between VTS Tower, LLC
("Landlord") and KPMG LLP ("Tenant") — Suite 1500, VTS Tower

This Third Amendment to Lease ("Amendment") is entered into as of
the date above between Landlord and Tenant.

1. EXPANSION PREMISES
Tenant shall lease Suite 2200, Floor 22, containing approximately
12,000 rentable square feet ("Expansion Premises"). Landlord shall
deliver the Expansion Premises on November 1, 2026.

2. EXPANSION TERM
The term for the Expansion Premises shall be coterminous with the
existing lease, expiring June 30, 2031.

3. BASE RENT — EXPANSION PREMISES
$[TBD] per rentable square foot per year, NNN, commencing on the
Expansion Commencement Date, with 3% annual escalations.

4. TENANT IMPROVEMENT ALLOWANCE
Landlord shall provide $60.00 PSF ($720,000) for the Expansion Premises.

5. ALL OTHER TERMS
All other terms and conditions of the original lease and prior
amendments remain in full force and effect.`

const SAMPLE_APEX_LEASE = `FIRST DRAFT LEASE AGREEMENT

Date: August 22, 2026

Between: VTS Tower, LLC ("Landlord")
And:     Apex Capital Partners LLC ("Tenant")

Re: Suite 3100, Floor 31, VTS Tower, New York, NY

1. PREMISES
Approximately 8,500 rentable square feet on Floor 31.

2. TERM
Five (5) years commencing February 1, 2027.

3. BASE RENT
Year 1: $78.00 PSF/yr NNN
Annual escalations: 3% per year.

4. TENANT IMPROVEMENT ALLOWANCE
$65.00 per rentable square foot ($552,500 total).

5. FREE RENT
Six (6) months abatement from commencement.

[DRAFT — for discussion purposes only. Not for distribution.]`

const SAMPLE_DELOITTE_NOTICE = `NOTICE OF EXERCISE OF EXPANSION OPTION

Date: August 20, 2026

To:   VTS Tower, LLC ("Landlord")
From: Deloitte LLP ("Tenant")

Re: Lease dated March 1, 2020 — Suite 1800, VTS Tower

Pursuant to Section 42 of the above-referenced Lease, Tenant hereby
exercises its Expansion Option for the following premises:

EXPANSION SPACE
Suite 1900, Floor 19, containing approximately 9,200 rentable square feet.

EXPANSION COMMENCEMENT DATE
January 1, 2027, or upon substantial completion of Landlord's Work.

NOTICE DELIVERY DATE
This notice is delivered more than 12 months prior to the proposed
Expansion Commencement Date, satisfying the notice requirement under
Section 42(b) of the Lease.

Tenant requests Landlord's written acknowledgment within 10 business days.`

const SAMPLE_MERIDIAN_ESTOPPEL = `TENANT ESTOPPEL CERTIFICATE

Date: August 18, 2026

Tenant:   Meridian Health Systems, Inc.
Landlord: VTS Tower, LLC
Premises: Suite 600, Floor 6, VTS Tower, New York, NY

The undersigned ("Tenant") hereby certifies to Landlord and its lender:

1. LEASE STATUS
The Lease dated May 1, 2021 is in full force and effect and has not
been modified except as noted herein.

2. TERM
The Lease term expires April 30, 2031. Tenant has one (1) renewal
option for five (5) years at fair market value.

3. RENT
Current monthly base rent: $48,750. No free rent periods are outstanding.
Tenant has paid rent through August 2026. No prepaid rent exists beyond
the current month.

4. NO DEFAULT
To Tenant's knowledge, neither Landlord nor Tenant is in default.
Tenant has no claims, defenses, or offsets against Landlord.

5. SECURITY DEPOSIT
Tenant has deposited $97,500 as a security deposit.

Signed by Tenant's authorized representative.`

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

const DOC_CONTENT: Record<string, string> = {
  d1: SAMPLE_LOI,
  d2: SAMPLE_KPMG_AMENDMENT,
  d3: SAMPLE_APEX_LEASE,
  d4: SAMPLE_DELOITTE_NOTICE,
  d5: SAMPLE_MERIDIAN_ESTOPPEL,
}

const DOC_SESSION_MAP: Record<string, string> = {
  d1: "s1",
  d2: "s2",
  d3: "s3",
  d4: "s4",
  d5: "s5",
}

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
              <Button key={t.id} variant="ghost" onClick={() => onNewFromTemplate(t)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-muted/60 text-foreground h-auto justify-start">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate">{t.name}</span>
              </Button>
            ))}
            <Button variant="ghost"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-muted/60 text-foreground h-auto justify-start">
              <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground">Upload template…</span>
            </Button>
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

const FOLLOWUP_QUESTIONS: Record<string, [string, string]> = {
  "loi":             ["What's the tenant name, premises size, and target floor?", "What are the proposed economic terms — base rent, TI allowance, and free rent period?"],
  "lease-amendment": ["Which tenant and lease needs amending? What's the current premises?", "What are the specific changes — additional space, modified rent, or updated term?"],
  "options-notice":  ["Which option is being exercised — renewal, expansion, or termination? For which tenant?", "What's the proposed effective date and any specific conditions to include?"],
  "first-draft":     ["What's the tenant name, premises size, and proposed floor?", "What are the proposed economic terms — base rent, TI allowance, free rent, and lease term?"],
  "estoppel":        ["Which tenant and lease is this for? Who is requesting the estoppel?", "Are there any lease modifications or outstanding matters to disclose?"],
  "nda":             ["Is this mutual or one-way? Who are the two parties?", "What's the purpose — deal discussions, property tour, or financing? Any special term or carve-outs?"],
  "__new__":         ["What type of document do you need — LOI, amendment, lease, notice, or something else?", "What deal or property is this for? Any specific parties or terms to include?"],
}

function getDraftContent(ctx: string, messages: DocMessage[]): string {
  const userAnswers = messages.filter(m => m.role === "user").map(m => m.content)
  const hint = userAnswers.join(" ").toLowerCase()
  if (ctx === "loi" || hint.includes("loi") || hint.includes("letter of intent")) return SAMPLE_LOI
  if (ctx === "lease-amendment" || hint.includes("amendment")) return SAMPLE_KPMG_AMENDMENT
  if (ctx === "first-draft" || hint.includes("first draft") || hint.includes("lease")) return SAMPLE_APEX_LEASE
  if (ctx === "options-notice" || hint.includes("option") || hint.includes("notice")) return SAMPLE_DELOITTE_NOTICE
  if (ctx === "estoppel" || hint.includes("estoppel")) return SAMPLE_MERIDIAN_ESTOPPEL
  if (ctx === "nda" || hint.includes("nda") || hint.includes("confidentiality")) return `CONFIDENTIALITY AGREEMENT

Date: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}

This Confidentiality Agreement ("Agreement") is entered into between the parties
identified above in connection with discussions regarding a potential transaction.

1. CONFIDENTIAL INFORMATION
Each party agrees to keep confidential all non-public information disclosed by
the other party in connection with the proposed transaction.

2. TERM
This Agreement shall remain in effect for two (2) years from the date above.

3. PERMITTED DISCLOSURE
Confidential information may be disclosed only to employees, advisors, or
representatives who have a need to know for purposes of evaluating the transaction.

4. NO BINDING OBLIGATION
This Agreement does not obligate either party to proceed with any transaction.

[DRAFT — for review and execution]`
  return BLANK_DOC
}

function ChatPanel({ sessions, activeId, onSelectSession: _onSelectSession, onNewSession: _onNewSession, templateContext, onSendSuggestion, onDraftReady }: {
  sessions: DocSession[]
  activeId: string
  onSelectSession: (id: string) => void
  onNewSession: () => void
  templateContext: string | null
  onSendSuggestion: (text: string) => void
  onDraftReady?: (content: string) => void
}) {
  const [input, setInput] = React.useState("")
  const [localSessions, setLocalSessions] = React.useState(sessions)
  const bottomRef = React.useRef<HTMLDivElement>(null)
  // Persist templateContext across renders — cleared only after draft is produced
  const ctxRef = React.useRef<string | null>(templateContext)
  React.useEffect(() => { if (templateContext) ctxRef.current = templateContext }, [templateContext])

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

    const currentMsgs = active?.messages ?? []
    const userMsgCount = currentMsgs.filter(m => m.role === "user").length

    // If we're in the generic new-doc state, detect doc type from the message and switch context
    if (ctxRef.current === "__new__" && userMsgCount === 0) {
      const t = text.toLowerCase()
      if (t.includes("loi") || t.includes("letter of intent")) ctxRef.current = "loi"
      else if (t.includes("amendment")) ctxRef.current = "lease-amendment"
      else if (t.includes("option") || t.includes("notice")) ctxRef.current = "options-notice"
      else if (t.includes("first draft") || t.includes("lease")) ctxRef.current = "first-draft"
      else if (t.includes("estoppel")) ctxRef.current = "estoppel"
      else if (t.includes("nda") || t.includes("confidentiality")) ctxRef.current = "nda"
    }

    const ctx = ctxRef.current

    setLocalSessions(prev => prev.map(s =>
      s.id !== activeId ? s : { ...s, messages: [...s.messages, userMsg, thinkMsg] }
    ))

    setTimeout(() => {
      const allMsgs = [...currentMsgs, userMsg]
      let replyContent: string
      let shouldDraft = false

      if (ctx && ctx !== "__new__") {
        const qs = FOLLOWUP_QUESTIONS[ctx]
        if (userMsgCount === 0) {
          replyContent = qs[0]
        } else if (userMsgCount === 1) {
          replyContent = qs[1]
        } else {
          replyContent = "Got it — I have everything I need. Give me a moment to draft this."
          shouldDraft = true
        }
      } else if (ctx === "__new__") {
        // Still unknown type — ask for clarification
        replyContent = FOLLOWUP_QUESTIONS["__new__"][userMsgCount === 0 ? 0 : 1] ?? "Got it — drafting now."
        if (userMsgCount >= 1) shouldDraft = true
      } else {
        replyContent = generateDocResponse(text)
      }

      setLocalSessions(prev => prev.map(s => {
        if (s.id !== activeId) return s
        const reply: DocMessage = { id: `r${Date.now()}`, role: "assistant", content: replyContent, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
        return { ...s, messages: [...s.messages.filter(m => m.id !== thinkId), reply] }
      }))

      if (shouldDraft) {
        setTimeout(() => {
          const draftContent = getDraftContent(ctx!, allMsgs)
          const doneMsg: DocMessage = { id: `done${Date.now()}`, role: "assistant", content: "Done — the draft is ready in the document panel. Review it and let me know if you want to change anything.", timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
          setLocalSessions(prev => prev.map(s =>
            s.id !== activeId ? s : { ...s, messages: [...s.messages, doneMsg] }
          ))
          ctxRef.current = null
          onDraftReady?.(draftContent)
        }, 1200)
      }
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

function TBtn({ children, title, active, onClick }: { children: React.ReactNode; title?: string; active?: boolean; onClick?: () => void }) {
  return (
    <Button variant="ghost" size="icon-sm" title={title} onClick={onClick}
      className={cn("h-7 w-7 shrink-0", active ? "bg-muted text-foreground" : "text-muted-foreground")}>
      {children}
    </Button>
  )
}

// ─── Document editor ──────────────────────────────────────────────────────────

function DocumentEditor({ title: _title, content }: { title: string; content: string }) {
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
          <DropdownMenuTrigger render={<Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground gap-1 shrink-0 w-[100px] justify-between" />}>
            Normal text <ChevronDown className="h-3 w-3" />
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
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" title="Alignment" className="h-7 w-7 text-muted-foreground shrink-0" />}>
            {alignIcon}
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
            className="outline-none font-serif text-sm leading-loose whitespace-pre-wrap text-foreground min-h-[800px] [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-medium [&_h3]:mb-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-0.5 [&_a]:text-primary [&_a]:underline"
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
    <div className="flex flex-col items-center justify-center h-full text-center px-10 bg-background">
      <p className="text-2xl font-bold text-foreground mb-8">What do you want to draft?</p>
      <div className="flex flex-wrap gap-2 justify-center max-w-lg">
        {TEMPLATES.map(t => (
          <Button key={t.id} variant="outline" onClick={() => onSelect(t)}
            className="rounded-full border-border px-4 py-2 text-sm text-primary font-medium hover:bg-muted/60 transition-colors h-auto">
            {t.name}
          </Button>
        ))}
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

type MobileView = "rail" | "chat" | "doc"

export function DocumentAgentPage({ className, isDark = false, onToggleDark }: { className?: string; isDark?: boolean; onToggleDark?: () => void }) {
  const [sessions, setSessions]         = React.useState<DocSession[]>([NEW_SESSION, ...SESSIONS])
  const [activeId, setActiveId]         = React.useState<string>(NEW_SESSION_ID)
  const [recentDocs, setRecentDocs]     = React.useState<RecentDoc[]>([{ id: "d-new", name: "New document", type: "Document", modified: "Just now" }, ...RECENT_DOCS])
  const [activeDocId, setActiveDocId]   = React.useState<string | null>("d-new")
  const [railCollapsed, setRailCollapsed] = React.useState(false)
  const [templateContext, setTemplateContext] = React.useState<string | null>("__new__")
  const [mobileView, setMobileView]     = React.useState<MobileView>("rail")
  const [logoOpen, setLogoOpen]         = React.useState(false)
  const [activeDoc, setActiveDoc]       = React.useState<{ title: string; content: string } | null>({ title: "New document", content: BLANK_DOC })

  const goBack = () => {
    const prev = window.history.length > 1 ? null : "#/dashboard"
    if (prev) { window.location.hash = prev } else { window.history.back() }
  }

  const openDoc = (title: string, docId: string | null = null) => {
    const content = docId && DOC_CONTENT[docId] ? DOC_CONTENT[docId] : SAMPLE_LOI
    setActiveDoc({ title, content })
    setActiveDocId(docId)
    setTemplateContext(null)
    if (docId && DOC_SESSION_MAP[docId]) {
      setActiveId(DOC_SESSION_MAP[docId])
    }
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
      <div className="flex flex-1 min-h-0 rounded-2xl overflow-hidden bg-card/70 backdrop-blur-md border border-border/70 divide-x divide-border/40">

      {/* ── 1: File rail (templates + recents) ── */}
      <div className={cn(
        "shrink-0 flex flex-col overflow-hidden min-h-0 transition-all duration-300",
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
        "w-full md:w-[340px] shrink-0 flex flex-col overflow-hidden min-h-0 bg-card",
        mobileView === "chat" ? "flex" : "hidden md:flex"
      )}>
        <ChatPanel
          sessions={sessions}
          activeId={activeId}
          onSelectSession={id => { setActiveId(id); const s = sessions.find(x => x.id === id); if (s?.docTitle) { openDoc(s.docTitle); setMobileView("doc") } }}
          onNewSession={newSession}
          templateContext={templateContext}
          onSendSuggestion={() => { setMobileView("doc") }}
          onDraftReady={content => {
            setActiveDoc(prev => prev ? { ...prev, content } : { title: "Draft", content })
            setTemplateContext(null)
            setMobileView("doc")
          }}
        />
      </div>

      {/* ── 3: Document editor ── */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 overflow-hidden",
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
                <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="gap-1.5 text-xs h-7" />}>
                  <Download className="h-3.5 w-3.5" />Export
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
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
