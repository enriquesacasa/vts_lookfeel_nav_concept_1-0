import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Menu, X } from "lucide-react"

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
  subject: "Deal Created: Amazon | VTS Tower – Floor 8",
  preview: "A new deal has been created: Amazon | VTS Tower – Floor 8...",
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
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 shrink-0">
        <h2 className="text-base font-semibold text-gray-900">Forward Email</h2>
      </div>
      <div className="flex-1 flex flex-col p-4 sm:p-6 gap-4 overflow-auto">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 w-14 shrink-0">To</span>
            <Input defaultValue="deals@vts.com" className="text-sm border-gray-300 bg-white" readOnly />
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
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={onSend}>Send</Button>
          <Button variant="outline" className="border-gray-300 text-gray-600" onClick={() => { window.location.hash = "#/email" }}>Discard</Button>
        </div>
      </div>
    </div>
  )
}

function ConfirmDetail({ onBack }: { onBack?: () => void }) {
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
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 leading-tight">Deal Created: Amazon | VTS Tower – Floor 8</h2>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm text-gray-500">
              <span className="font-medium text-gray-700">VTS</span>
              <span className="hidden sm:inline">&lt;noreply@vts.com&gt;</span>
              <span>· to me</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-gray-600 border-gray-300 shrink-0">Archive</Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="max-w-xl mx-auto">
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div className="bg-gray-900 px-5 py-4 flex items-center gap-3">
              <span className="inline-flex items-center rounded-md bg-blue-600 px-2.5 py-1 text-sm font-bold text-white">VTS</span>
              <span className="text-white text-sm font-medium">Automated Deal Notification</span>
            </div>
            <div className="px-5 sm:px-6 py-5 sm:py-6 space-y-5">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">A new deal has been created</h3>
                <p className="text-sm text-gray-500">VTS automatically created a deal from the email you forwarded to deals@vts.com.</p>
              </div>
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ["Tenant", "Amazon"],
                      ["Asset", "VTS Tower"],
                      ["Space", "Suite 0800 – Floor 8"],
                      ["Size", "18,000 sf"],
                      ["Stage", "Prospect"],
                      ["Created from", "Forwarded email"],
                    ].map(([label, value], i) => (
                      <tr key={label} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        <td className="px-4 py-2.5 text-gray-500 font-medium w-32">{label}</td>
                        <td className="px-4 py-2.5 text-gray-900">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { window.location.hash = "#/deals" }}>
                View Deal in VTS
              </Button>
            </div>
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-400 text-center">This deal was automatically created from the email you forwarded to deals@vts.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function EmailFlow({ step }: EmailFlowProps) {
  const [selectedEmail, setSelectedEmail] = React.useState("amazon")
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  // On mobile: show list or detail
  const [mobileView, setMobileView] = React.useState<"list" | "detail">("list")

  const confirmEmails = step === "confirm"
    ? [{ id: "vts-confirm", from: VTS_CONFIRM_EMAIL.from, email: VTS_CONFIRM_EMAIL.email, subject: VTS_CONFIRM_EMAIL.subject, preview: VTS_CONFIRM_EMAIL.preview, time: VTS_CONFIRM_EMAIL.time, unread: true }, ...EMAILS]
    : EMAILS

  React.useEffect(() => {
    if (step === "confirm") { setSelectedEmail("vts-confirm"); setMobileView("detail") }
    if (step === "forward") setMobileView("detail")
  }, [step])

  const handleEmailClick = (id: string) => {
    setSelectedEmail(id)
    setMobileView("detail")
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-3 sm:px-4 py-2 border-b border-gray-200 bg-white shrink-0">
        <button className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 md:hidden" onClick={() => setSidebarOpen(o => !o)}>
          <Menu className="w-5 h-5" />
        </button>
        <GmailLogo className="w-8 h-8 shrink-0" />
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
            <ForwardCompose onSend={() => { window.location.hash = "#/email-confirm" }} />
          ) : step === "confirm" && selectedEmail === "vts-confirm" ? (
            <ConfirmDetail onBack={() => setMobileView("list")} />
          ) : (
            <InboxDetail
              onForward={() => { window.location.hash = "#/email-forward" }}
              onBack={() => setMobileView("list")}
            />
          )}
        </div>
      </div>
    </div>
  )
}
