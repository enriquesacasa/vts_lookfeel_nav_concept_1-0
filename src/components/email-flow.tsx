import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ArrowLeft, ChevronRight, Menu, X } from "lucide-react"

interface EmailFlowProps {
  step: "inbox" | "forward" | "confirm"
}

const EMAILS = [
  {
    id: "amazon",
    from: "Sarah Okonkwo",
    email: "sarah.okonkwo@cbre.com",
    subject: "Amazon – Space Inquiry | VTS Tower, New York",
    preview: "Amazon is actively looking for 15,000–18,000 sf on floors 7–10...",
    time: "10:42 AM",
    unread: true,
  },
  {
    id: "pfizer",
    from: "James Whitfield",
    email: "j.whitfield@pfizer.com",
    subject: "Re: Suite 1200 Renewal Discussion",
    preview: "Following up on our last conversation about the renewal terms...",
    time: "9:15 AM",
    unread: false,
  },
  {
    id: "kpmg",
    from: "Laura Chen",
    email: "lchen@kpmg.com",
    subject: "KPMG Expansion – Floor 22 Interest",
    preview: "Our client is interested in the floor 22 availability...",
    time: "Yesterday",
    unread: false,
  },
  {
    id: "deloitte",
    from: "Marcus Bell",
    email: "m.bell@deloitte.com",
    subject: "Tour Feedback – Suite 500",
    preview: "Thanks for the tour yesterday. Here are our initial thoughts...",
    time: "Yesterday",
    unread: false,
  },
]

const FOLDERS = [
  { label: "Inbox", count: 3 },
  { label: "Sent", count: null },
  { label: "Drafts", count: 1 },
  { label: "Starred", count: null },
  { label: "Spam", count: null },
  { label: "Trash", count: null },
]

const VTS_CONFIRM_EMAIL = {
  from: "VTS",
  email: "noreply@vts.com",
  subject: "New Deal Ready: Amazon | VTS Tower – Floor 8",
  preview: "We picked up an inquiry from your forwarded email — review and add it to your pipeline.",
  time: "Just now",
  unread: true,
}

// Gmail M logo SVG
function GmailLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 75 75" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.25 62.5h12.5V37.5L6.25 28.125V62.5z" fill="#4285F4" />
      <path d="M56.25 62.5h12.5V28.125L56.25 37.5V62.5z" fill="#34A853" />
      <path d="M56.25 28.125L68.75 18.75V12.5h-6.25L37.5 31.25 12.5 12.5H6.25v6.25L18.75 28.125 37.5 43.75z" fill="#EA4335" />
      <path d="M6.25 12.5v6.25L18.75 28.125V12.5H6.25z" fill="#C5221F" />
      <path d="M56.25 12.5v15.625L68.75 18.75V12.5H56.25z" fill="#1B6CCF" />
      <path d="M18.75 28.125L6.25 18.75 18.75 12.5v15.625z" fill="#C5221F" />
      <path d="M56.25 12.5L68.75 18.75l-12.5 9.375V12.5z" fill="#1B6CCF" />
    </svg>
  )
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  return (
    <div className="w-56 shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm flex-1">+ Compose</Button>
        {onClose && (
          <button onClick={onClose} className="ml-2 p-1 text-gray-500 hover:text-gray-700 md:hidden">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <nav className="flex-1 p-2 overflow-auto">
        {FOLDERS.map(f => (
          <div key={f.label} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer ${f.label === "Inbox" ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"}`}>
            <span>{f.label}</span>
            {f.count != null && (
              <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{f.count}</span>
            )}
          </div>
        ))}
      </nav>
    </div>
  )
}

function EmailListItem({ email, selected, onClick }: { email: (typeof EMAILS)[0]; selected: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} className={`px-4 py-3 border-b border-gray-100 cursor-pointer ${selected ? "bg-blue-50 border-l-2 border-l-blue-600" : "hover:bg-gray-50"}`}>
      <div className="flex items-center justify-between mb-0.5">
        <span className={`text-sm truncate ${email.unread ? "font-semibold text-gray-900" : "text-gray-700"}`}>{email.from}</span>
        <span className="text-xs text-gray-400 shrink-0 ml-2">{email.time}</span>
      </div>
      <p className={`text-xs truncate ${email.unread ? "font-medium text-gray-800" : "text-gray-600"}`}>{email.subject}</p>
      <p className="text-xs text-gray-400 truncate mt-0.5">{email.preview}</p>
    </div>
  )
}

function InboxDetail({ onForward, onBack }: { onForward: () => void; onBack?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 shrink-0">
        <div className="flex items-start gap-3">
          {onBack && (
            <button onClick={onBack} className="mt-1 shrink-0 text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 leading-tight">Amazon – Space Inquiry | VTS Tower, New York</h2>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm text-gray-500">
              <span className="font-medium text-gray-700">Sarah Okonkwo</span>
              <span className="hidden sm:inline">&lt;sarah.okonkwo@cbre.com&gt;</span>
              <span>· to me</span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 hidden sm:flex">Reply</Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={onForward}>Forward</Button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="max-w-2xl text-sm text-gray-700 leading-relaxed space-y-4">
          <p>Hi Matt,</p>
          <p>Hope you're doing well. I'm reaching out on behalf of my client, Amazon, who is actively in the market for office space in Midtown Manhattan and has VTS Tower at the top of their shortlist.</p>
          <p>Amazon's real estate team is looking for <strong>15,000–18,000 sf</strong> on floors 7–10, targeting a <strong>Q3 2026 occupancy date</strong>. Given their expansion timeline, they're moving quickly and want to get a serious look at available inventory before the summer.</p>
          <p>I understand <strong>Suite 0800 on Floor 8 (18,000 sf)</strong> will be coming available as Morgan Stanley's lease approaches expiration in July 2026. That space checks all the boxes — high-floor views, full-floor identity, and the size is a near-perfect fit for Amazon's requirements.</p>
          <p>Could you please confirm:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Availability confirmation and expected delivery date for Suite 0800</li>
            <li>Asking rent and any existing TI package</li>
            <li>Marketing materials and floor plans</li>
          </ul>
          <p>Amazon's team is ready to move fast. We'd love to arrange tours for the <strong>week of March 10th</strong> — a Tuesday or Thursday morning would work best for them.</p>
          <p>Looking forward to working together on this.</p>
          <p>Best,<br /><strong>Sarah Okonkwo</strong><br />Senior Associate, Tenant Advisory<br />CBRE | New York<br />sarah.okonkwo@cbre.com</p>
        </div>
      </div>
    </div>
  )
}

function ForwardCompose({ onSend }: { onSend: () => void }) {
  const [sent, setSent] = React.useState(false)

  if (sent) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-4 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900 mb-1">Email Sent</p>
          <p className="text-sm text-gray-500">Forwarded to <span className="font-medium text-gray-700">deal.capture@vts.com</span>.<br />VTS will process it and confirm shortly.</p>
        </div>
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white mt-2"
          onClick={onSend}
        >
          Back to Inbox
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 shrink-0">
        <h2 className="text-base font-semibold text-gray-900">Forward Email</h2>
      </div>
      <div className="flex-1 flex flex-col p-4 sm:p-6 gap-4 overflow-auto">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 w-14 shrink-0">To</span>
            <Input defaultValue="deal.capture@vts.com" className="text-sm border-gray-300 bg-white" readOnly />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 w-14 shrink-0">Subject</span>
            <Input defaultValue="Fwd: Amazon – Space Inquiry | VTS Tower, New York" className="text-sm border-gray-300 bg-white" readOnly />
          </div>
        </div>
        <Separator className="bg-gray-200" />
        <div className="flex-1 text-sm text-gray-700 leading-relaxed space-y-4">
          <p className="text-gray-500 italic">FYI — forwarding this to VTS so a deal gets created automatically.</p>
          <div className="border-l-2 border-gray-300 pl-4 text-gray-500 space-y-2">
            <p className="text-xs text-gray-400">---------- Forwarded message ----------</p>
            <p><strong>From:</strong> Sarah Okonkwo &lt;sarah.okonkwo@cbre.com&gt;</p>
            <p><strong>To:</strong> matt.callahan@propertyco.com</p>
            <p><strong>Subject:</strong> Amazon – Space Inquiry | VTS Tower, New York</p>
            <Separator className="bg-gray-200 my-2" />
            <p>Hi Matt,</p>
            <p>Hope you're doing well. I'm reaching out on behalf of my client, Amazon, who is actively in the market for office space in Midtown Manhattan and has VTS Tower at the top of their shortlist.</p>
            <p>Amazon's real estate team is looking for 15,000–18,000 sf on floors 7–10, targeting a Q3 2026 occupancy date...</p>
          </div>
        </div>
        <div className="flex gap-2 pt-2 shrink-0">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setSent(true)}>Send</Button>
          <Button variant="outline" className="border-gray-300 text-gray-600" onClick={() => { window.location.hash = "#/email" }}>Discard</Button>
        </div>
      </div>
    </div>
  )
}

const VTS_PRIMARY = "oklch(0.51 0.175 277)"

const VTS_LOGO_PATHS = (
  <>
    <path d="M262.948 37.923L282.271 99.5913L301.591 37.923H321.723L293.26 121.804H270.12L241.889 37.923H262.948Z" fill="currentColor"/>
    <path d="M378.745 55.2793H351.903V37.923H425.601V55.2793H398.645V121.804H378.745V55.2793Z" fill="currentColor"/>
    <path d="M491.06 52.3862C483.422 52.3862 477.756 55.2794 477.756 60.4835C477.756 64.6518 481.688 67.6581 487.475 68.9305L498.928 71.2439C512.464 74.021 529.588 78.1862 529.588 95.7721C529.588 113.358 511.885 123.31 494.416 123.31C472.895 123.31 458.78 112.549 455.771 94.4997H475.441C477.639 103.293 484.581 107.342 494.879 107.342C501.588 107.342 509.224 105.144 509.224 98.2023C509.224 92.7658 502.747 90.1023 493.604 88.1371L483.422 86.0533C469.77 83.1633 457.392 76.6841 457.392 61.6418C457.392 44.519 475.788 36.5351 492.217 36.5351C508.646 36.5351 524.265 43.7095 527.158 62.2215H507.604C505.636 55.9721 499.506 52.3862 491.06 52.3862Z" fill="currentColor"/>
    <path d="M108.553 46.9088L136.165 65.2593L156.596 51.7396L108.553 19.812L108.485 19.8573L60.427 51.7926L80.8551 65.3125L108.485 46.953L108.553 46.9088Z" fill="currentColor"/>
    <path d="M108.47 105.303L25.0786 53.0043V87.8887L108.47 140.187L108.485 140.179L191.889 87.8741V52.9871L108.485 105.293L108.47 105.303Z" fill="currentColor"/>
  </>
)

function VtsLogo({ height, color }: { height: number; color: string }) {
  return (
    <svg viewBox="0 0 555 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ height, width: "auto", color }}>
      {VTS_LOGO_PATHS}
    </svg>
  )
}

const DEAL_ROWS: [string, string][] = [
  ["Stage", "Inquiry"],
  ["Tenant", "Amazon"],
  ["Asset", "VTS Tower"],
  ["Space", "Suite 0800 – Floor 8"],
  ["Size", "18,000 sf"],
  ["Tenant Rep", "Sarah Okonkwo · CBRE"],
  ["Source", "Forwarded email"],
]

function ConfirmDetail({ onBack }: { onBack?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Email toolbar */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 shrink-0">
        <div className="flex items-start gap-3">
          {onBack && (
            <button onClick={onBack} className="mt-1 shrink-0 text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 leading-tight">
              New Deal Ready: Amazon | VTS Tower – Floor 8
            </h2>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm text-gray-500">
              <span className="font-medium text-gray-700">VTS</span>
              <span className="hidden sm:inline">&lt;noreply@vts.com&gt;</span>
              <span>· to me</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 shrink-0">Archive</Button>
        </div>
      </div>

      {/* Email body */}
      <div className="flex-1 overflow-auto bg-muted/40 px-4 sm:px-8 py-6">
        <div className="max-w-lg mx-auto">
          <div className="rounded-2xl overflow-hidden shadow-sm border border-border">

            {/* Header */}
            <div className="px-8 py-7 flex items-center justify-between bg-sidebar">
              <VtsLogo height={28} color="white" />
              <span className="text-xs font-medium uppercase tracking-widest text-white">
                Action Required
              </span>
            </div>

            {/* Body */}
            <div className="bg-card px-8 py-8 space-y-6">
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">
                  New Deal Ready
                </p>
                <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                  Amazon · VTS Tower
                </h3>
              </div>

              {/* Deal Capture agent callout */}
              <div className="flex items-start gap-4 rounded-xl bg-primary/5 border border-primary/15 px-5 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 mt-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary">
                    <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.657 4.03 3 9 3s9-1.343 9-3V5"/><path d="M3 12c0 1.657 4.03 3 9 3s9-1.343 9-3"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary mb-1">Deal Capture Agent</p>
                  <p className="text-sm text-foreground/80 leading-relaxed">Parsed your forwarded email and extracted the deal details below.</p>
                </div>
              </div>

              {/* Deal details */}
              <div className="rounded-xl overflow-hidden border border-border">
                {DEAL_ROWS.map(([label, value], i) => (
                  <div key={label} className={`flex items-center px-5 py-3 ${i < DEAL_ROWS.length - 1 ? "border-b border-border" : ""} ${i % 2 === 0 ? "bg-card" : "bg-muted/40"}`}>
                    <span className="w-28 text-sm shrink-0 text-muted-foreground">{label}</span>
                    <span className="text-sm font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button className="w-full" size="lg" onClick={() => { window.location.hash = "#/deals?deal=d00" }}>
                  Add to Deal Pipeline
                </Button>
                <Button variant="outline" className="w-full" size="lg" onClick={onBack}>
                  This doesn't look right
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 flex flex-col items-center gap-3 bg-muted/60 border-t border-border">
              <VtsLogo height={20} color={VTS_PRIMARY} />
              <p className="text-xs text-center leading-relaxed text-muted-foreground">
                Forwarded to <span className="font-medium">deal.capture@vts.com</span> · Only you can approve this deal
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function EmailFlow({ step }: EmailFlowProps) {
  const [selectedEmail, setSelectedEmail] = React.useState<string | null>(step === "confirm" ? null : "amazon")
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [mobileView, setMobileView] = React.useState<"list" | "detail">("list")
  const [gmailLogoOpen, setGmailLogoOpen] = React.useState(false)

  const confirmEmails = step === "confirm"
    ? [{ id: "vts-confirm", from: VTS_CONFIRM_EMAIL.from, email: VTS_CONFIRM_EMAIL.email, subject: VTS_CONFIRM_EMAIL.subject, preview: VTS_CONFIRM_EMAIL.preview, time: VTS_CONFIRM_EMAIL.time, unread: true }, ...EMAILS]
    : EMAILS

  React.useEffect(() => {
    if (step === "confirm") { setSelectedEmail(null); setMobileView("list") }
    if (step === "forward") setMobileView("detail")
  }, [step])

  const handleEmailClick = (id: string) => {
    setSelectedEmail(id)
    setMobileView("detail")
  }

  return (
    <div className="force-light h-screen flex flex-col bg-white overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-3 sm:px-4 py-2 border-b border-gray-200 bg-white shrink-0">
        <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 md:hidden" onClick={() => setSidebarOpen(o => !o)}>
          <Menu className="w-5 h-5" />
        </button>
        <Popover open={gmailLogoOpen} onOpenChange={setGmailLogoOpen}>
          <PopoverTrigger render={<div className="shrink-0 cursor-pointer" />}>
            <GmailLogo className="w-8 h-8" />
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0 overflow-hidden" align="start">
            {/* Experience */}
            <div className="px-3 py-2.5 border-b border-border">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Experience</p>
              <div className="flex flex-col gap-1">
                {["Asset Manager", "Broker"].map(exp => (
                  <div key={exp} className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-muted/40 opacity-60 cursor-not-allowed">
                    <span className="text-sm text-foreground">{exp}</span>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">Coming Soon</Badge>
                  </div>
                ))}
              </div>
            </div>
            {/* Prototype */}
            <div className="px-3 py-2.5 border-b border-border">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Prototype</p>
              <div className="flex flex-col gap-0.5">
                {[
                  { label: "Main View",                hash: "#/dashboard" },
                  { label: "Inquiry Email",           hash: "#/inquiry-email" },
                  { label: "Inquiry Email Forward",   hash: "#/inquiry-email-forward" },
                  { label: "Inquiry Email Confirm",   hash: "#/inquiry-email-confirm" },
                ].map(link => (
                  <button key={link.hash}
                    onClick={() => { window.location.hash = link.hash; setGmailLogoOpen(false) }}
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
                {[
                  { label: "Theme Showcase",   hash: "#/theme" },
                  { label: "Agent Principles", hash: "#/principles" },
                ].map(link => (
                  <button key={link.hash}
                    onClick={() => { window.location.hash = link.hash; setGmailLogoOpen(false) }}
                    className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-sm text-foreground hover:bg-muted/60 transition-colors text-left">
                    {link.label}
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <div className="flex-1 max-w-xl">
          <input
            className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-700 outline-none focus:bg-white focus:shadow-sm border border-transparent focus:border-gray-300 transition-all"
            placeholder="Search mail"
            readOnly
          />
        </div>
        <div className="ml-auto shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold">M</div>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Sidebar — desktop always visible, mobile as drawer overlay */}
        <div className="hidden md:flex w-56 shrink-0 border-r border-gray-200 bg-gray-50 flex-col">
          <Sidebar />
        </div>
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 flex md:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="w-56 bg-gray-50 border-r border-gray-200 flex flex-col h-full mt-[49px]" onClick={e => e.stopPropagation()}>
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
            <div className="flex-1 bg-black/20" />
          </div>
        )}

        {/* Email list — hidden on mobile when viewing detail */}
        <div className={`
          flex flex-col min-h-0 border-r border-gray-200
          w-full md:w-72 md:shrink-0
          ${mobileView === "detail" ? "hidden md:flex" : "flex"}
        `}>
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between shrink-0">
            <span className="text-sm font-semibold text-gray-900">Inbox</span>
            <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">{step === "confirm" ? 4 : 3}</Badge>
          </div>
          <div className="flex-1 overflow-auto">
            {confirmEmails.map(email => (
              <EmailListItem key={email.id} email={email} selected={selectedEmail === email.id} onClick={() => handleEmailClick(email.id)} />
            ))}
          </div>
        </div>

        {/* Detail / compose — full width on mobile when viewing detail */}
        <div className={`
          flex-1 flex flex-col min-h-0 min-w-0
          ${mobileView === "list" ? "hidden md:flex" : "flex"}
        `}>
          {step === "forward" ? (
            <ForwardCompose onSend={() => { window.location.hash = "#/inquiry-email-confirm" }} />
          ) : selectedEmail === "vts-confirm" ? (
            <ConfirmDetail onBack={() => { setSelectedEmail(null); setMobileView("list") }} />
          ) : selectedEmail === "amazon" ? (
            <InboxDetail
              onForward={() => { window.location.hash = "#/inquiry-email-forward" }}
              onBack={() => setMobileView("list")}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
              Select an email to read
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
