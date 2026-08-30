import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"

// ─── VTS Logo ─────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function goBack() {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    window.location.hash = "#/deal-steward"
  }
}

// ─── Shared wrapper ───────────────────────────────────────────────────────────

interface EmailPreviewPageProps {
  title: string
  children: React.ReactNode
}

function EmailPreviewPage({ title, children }: EmailPreviewPageProps) {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border shrink-0 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold">Deal monitor</span>
          <span className="text-muted-foreground text-sm">·</span>
          <span className="text-sm">{title}</span>
          <Badge variant="secondary" className="text-xs">Preview</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { window.location.hash = "#/deal-steward" }}>
            Edit agent
          </Button>
          <Button size="sm">Send now</Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto flex items-start justify-center p-8 bg-muted/30">
        <div className="w-full max-w-2xl force-light">
          {children}
        </div>
      </div>
    </div>
  )
}

// ─── Shared email card shell ───────────────────────────────────────────────────

interface EmailCardProps {
  actionLabel: string
  from?: string
  recipients: string
  subject: string
  date?: string
  asset: string
  children: React.ReactNode
}

function EmailCard({ actionLabel, from, recipients, subject, date, asset, children }: EmailCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 font-sans">
      {/* VTS header */}
      <div className="px-8 py-6 flex items-center justify-between bg-sidebar">
        <VtsLogo height={28} color="white" />
        <span className="text-xs font-semibold uppercase tracking-widest text-white">{actionLabel}</span>
      </div>

      {/* Email meta */}
      <div className="px-8 py-4 border-b border-gray-100 bg-gray-50">
        <div className="grid grid-cols-[64px_1fr] gap-y-1.5 text-sm text-gray-500">
          <span className="font-medium text-gray-700">From</span>
          <span>{from ?? "VTS Deal Monitor <no-reply@vts.com>"}</span>
          <span className="font-medium text-gray-700">To</span>
          <span>{recipients}</span>
          <span className="font-medium text-gray-700">Subject</span>
          <span className="font-medium text-gray-900">{subject}</span>
          <span className="font-medium text-gray-700">Date</span>
          <span>{date ?? "Monday, August 29, 2026, 9:01 AM"}</span>
        </div>
      </div>

      {/* Body */}
      <div className="px-8 py-8 bg-white space-y-6">
        {children}
      </div>

      {/* Footer */}
      <div className="px-8 py-6 flex flex-col items-center gap-3 bg-gray-50 border-t border-gray-100">
        <VtsLogo height={20} color={VTS_PRIMARY} />
        <p className="text-xs text-center text-gray-400">Sent automatically by VTS Deal Monitor · {asset}</p>
      </div>
    </div>
  )
}

// ─── 1. AmPipelineEmailPage ────────────────────────────────────────────────────

export function AmPipelineEmailPage() {
  return (
    <EmailPreviewPage title="Asset manager — pipeline velocity">
      <EmailCard
        actionLabel="Weekly digest"
        recipients="Sarah Chen, Michael Torres (Asset management)"
        subject="VTS Tower HQ — Pipeline velocity | Mon Aug 29, 2026"
        asset="VTS Tower HQ"
      >
        {/* Eyebrow + headline */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">Pipeline velocity digest</p>
          <h3 className="text-2xl font-semibold tracking-tight text-gray-900">VTS Tower HQ · Week of Aug 25, 2026</h3>
          <p className="text-sm text-gray-500">8 active deals · $28.4M ARR in pipeline</p>
        </div>

        {/* AI insight callout */}
        <div className="bg-primary/5 border border-primary/15 rounded-xl px-4 py-3">
          <p className="text-sm text-gray-800 leading-relaxed">
            3 deals advanced stages this week. 2 deals are stalled — Apex Capital (18 days idle) and KPMG (26 days, waiting on board approval). Recommend proactive outreach before end of week.
          </p>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-xl border border-gray-200 p-3 text-center">
            <div className="text-lg font-bold text-gray-900">$28.4M</div>
            <div className="text-xs text-gray-500 mt-0.5">Pipeline ARR</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-3 text-center">
            <div className="text-lg font-bold text-gray-900">8</div>
            <div className="text-xs text-gray-500 mt-0.5">Active deals</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-3 text-center">
            <div className="text-lg font-bold text-red-600">2</div>
            <div className="text-xs text-gray-500 mt-0.5">Stalled</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-3 text-center">
            <div className="text-lg font-bold text-gray-900">1</div>
            <div className="text-xs text-gray-500 mt-0.5">Lease out this week</div>
          </div>
        </div>

        {/* Deal table */}
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tenant</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stage</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Days in stage</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">NER vs budget</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { tenant: "Starbucks", stage: "Legal", days: "12d", ner: "$52 vs $50", status: "On track", color: "green" },
                { tenant: "Apex Capital", stage: "Proposal", days: "18d", ner: "$48 vs $52", status: "Stalled", color: "red" },
                { tenant: "KPMG", stage: "Proposal", days: "26d", ner: "$49 vs $55", status: "Stalled", color: "red" },
                { tenant: "JPMorgan Chase", stage: "Legal", days: "9d", ner: "$75 vs $72", status: "On track", color: "green" },
                { tenant: "Deloitte", stage: "Legal", days: "5d", ner: "$72 vs $70", status: "On track", color: "green" },
                { tenant: "Google", stage: "LOI", days: "8d", ner: "$82 vs $80", status: "On track", color: "green" },
                { tenant: "Tesla", stage: "Proposal", days: "14d", ner: "$35 vs $33", status: "At risk", color: "amber" },
                { tenant: "Salesforce", stage: "Legal", days: "3d", ner: "$90 vs $88", status: "On track", color: "green" },
              ].map((row, i) => (
                <tr key={row.tenant} className={`${i < 7 ? "border-b border-gray-100" : ""} ${row.color === "red" ? "bg-red-50" : ""}`}>
                  <td className="px-3 py-2.5 font-medium text-gray-900">{row.tenant}</td>
                  <td className="px-3 py-2.5 text-gray-600">{row.stage}</td>
                  <td className="px-3 py-2.5 text-gray-600">{row.days}</td>
                  <td className="px-3 py-2.5 text-gray-600">{row.ner}</td>
                  <td className="px-3 py-2.5">
                    <Badge className={
                      row.color === "green" ? "bg-green-100 text-green-700 hover:bg-green-100 text-xs" :
                      row.color === "red" ? "bg-red-100 text-red-700 hover:bg-red-100 text-xs" :
                      "bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs"
                    }>{row.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div>
          <Button size="sm">View full pipeline</Button>
        </div>
      </EmailCard>
    </EmailPreviewPage>
  )
}

// ─── 2. BrokerActionEmailPage ─────────────────────────────────────────────────

export function BrokerActionEmailPage() {
  return (
    <EmailPreviewPage title="Broker — action required">
      <EmailCard
        actionLabel="Action required"
        recipients="Sarah Chen, Mark Torres, Anna Brooks (Brokers)"
        subject="Action required — 3 deals need your attention | Fri Aug 29"
        date="Friday, August 29, 2026, 8:00 AM"
        asset="VTS Tower HQ"
      >
        {/* Eyebrow + headline */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">Broker action digest</p>
          <h3 className="text-2xl font-semibold tracking-tight text-gray-900">3 deals need your attention</h3>
          <p className="text-sm text-gray-500">Friday, August 29, 2026 · VTS Tower HQ portfolio</p>
        </div>

        {/* AI insight callout */}
        <div className="bg-primary/5 border border-primary/15 rounded-xl px-4 py-3">
          <p className="text-sm text-gray-800 leading-relaxed">
            Apex Capital has been in Proposal for 18 days with no movement — a counter is awaiting your response. Amazon is blocked by an encumbrance on Suite 0800. Pfizer LOI counter expires in 4 days.
          </p>
        </div>

        {/* Action cards */}
        <div className="flex flex-col gap-4">
          {/* Apex Capital */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <span className="font-semibold text-sm text-gray-900">Apex Capital</span>
              <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">Urgent</Badge>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-gray-700">Counter-proposal response overdue — 18 days since last activity</p>
              <p className="text-xs text-gray-400 mt-1.5">Act before end of week to avoid losing deal momentum</p>
            </div>
          </div>

          {/* Amazon */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <span className="font-semibold text-sm text-gray-900">Amazon</span>
              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">High</Badge>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-gray-700">Encumbrance on Suite 0800 must be resolved before deal can advance to Proposal</p>
              <p className="text-xs text-gray-400 mt-1.5">Coordinate with legal to clear the encumbrance this week</p>
            </div>
          </div>

          {/* Pfizer */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <span className="font-semibold text-sm text-gray-900">Pfizer</span>
              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs">High</Badge>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-gray-700">LOI counter expires Aug 31 — confirm terms with tenant rep before deadline</p>
              <p className="text-xs text-gray-400 mt-1.5">4 days remaining to execute</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div>
          <Button size="sm">Open deals</Button>
        </div>
      </EmailCard>
    </EmailPreviewPage>
  )
}

// ─── 3. TenantFollowupEmailPage ───────────────────────────────────────────────

export function TenantFollowupEmailPage() {
  return (
    <EmailPreviewPage title="Tenant rep — follow up">
      <EmailCard
        actionLabel="Follow up"
        from="Sarah Chen <sarah.chen@propertyco.com>"
        recipients="Mark Torres (Tenant rep, CBRE)"
        subject="Follow-up: Apex Capital — Proposal stage | VTS Tower"
        date="Friday, August 29, 2026, 9:15 AM"
        asset="VTS Tower HQ"
      >
        {/* Eyebrow + headline */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">Deal follow-up</p>
          <h3 className="text-2xl font-semibold tracking-tight text-gray-900">Apex Capital · Floor 12</h3>
          <p className="text-sm text-gray-500">VTS Tower HQ · Proposal stage</p>
        </div>

        {/* Body paragraph */}
        <p className="text-sm text-gray-700 leading-relaxed">
          Hi Mark, I wanted to follow up on the counter-proposal for Apex Capital at Floor 12, VTS Tower. It has been 18 days since our last exchange and we would love to keep this deal moving. Let us know if there are any questions or concerns on your end.
        </p>

        {/* Deal summary card */}
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          {[
            ["Stage", "Proposal"],
            ["Space", "Floor 12"],
            ["Size", "45,000 sf"],
            ["NER", "$48.00 psf"],
            ["Last activity", "Aug 11, 2026"],
          ].map(([label, value], i) => (
            <div key={label} className={`flex items-center px-4 py-3 ${i < 4 ? "border-b border-gray-100" : ""} ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
              <span className="w-32 text-sm shrink-0 text-gray-500">{label}</span>
              <span className="text-sm font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div>
          <Button size="sm">Reply to Sarah Chen</Button>
        </div>
      </EmailCard>
    </EmailPreviewPage>
  )
}

// ─── 4. LawyerLeaseEmailPage ──────────────────────────────────────────────────

export function LawyerLeaseEmailPage() {
  return (
    <EmailPreviewPage title="Lawyer — lease status">
      <EmailCard
        actionLabel="Lease update"
        from="Sandra Li <sandra.li@propertyco.com>"
        recipients="Rachel Kim, Esq. (Outside counsel, Davis Polk)"
        subject="Lease status request: Deloitte LLP — Legal stage | VTS Tower"
        date="Friday, August 29, 2026, 10:30 AM"
        asset="VTS Tower HQ"
      >
        {/* Eyebrow + headline */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">Lease update request</p>
          <h3 className="text-2xl font-semibold tracking-tight text-gray-900">Deloitte LLP · Suite 500</h3>
          <p className="text-sm text-gray-500">VTS Tower HQ · Legal stage · Day 5</p>
        </div>

        {/* Body paragraph */}
        <p className="text-sm text-gray-700 leading-relaxed">
          Hi Rachel, we are following up on the latest draft lease for Deloitte at Suite 500. Could you confirm the current status and expected turnaround for the redline? The tenant is ready to move quickly and we want to keep the timeline on track.
        </p>

        {/* Status card */}
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          {[
            ["Stage", "Legal"],
            ["Deal size", "43,000 sf · 60-month term"],
            ["Last draft", "Aug 24, 2026"],
            ["Redline expected", "Aug 31, 2026"],
          ].map(([label, value], i) => (
            <div key={label} className={`flex items-center px-4 py-3 ${i < 3 ? "border-b border-gray-100" : ""} ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
              <span className="w-36 text-sm shrink-0 text-gray-500">{label}</span>
              <span className="text-sm font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div>
          <Button size="sm">Reply to Sandra Li</Button>
        </div>
      </EmailCard>
    </EmailPreviewPage>
  )
}

// ─── 5. OwnerUpdateEmailPage ──────────────────────────────────────────────────

export function OwnerUpdateEmailPage() {
  return (
    <EmailPreviewPage title="Owner — portfolio update">
      <EmailCard
        actionLabel="Monthly update"
        recipients="David Park (Owner, Park Capital Group)"
        subject="VTS Tower HQ — Monthly portfolio update | August 2026"
        date="Saturday, August 29, 2026, 8:00 AM"
        asset="VTS Tower HQ"
      >
        {/* Eyebrow + headline */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">Monthly portfolio update</p>
          <h3 className="text-2xl font-semibold tracking-tight text-gray-900">VTS Tower HQ · August 2026</h3>
          <p className="text-sm text-gray-500">8 active deals · 2 executed this month · 312,000 sf in negotiation</p>
        </div>

        {/* AI insight callout */}
        <div className="bg-primary/5 border border-primary/15 rounded-xl px-4 py-3">
          <p className="text-sm text-gray-800 leading-relaxed">
            Strong month — 2 leases executed totaling 71,000 sf. Pipeline ARR is up 12% vs July. 2 deals are at risk of stalling and may need owner-level intervention to unlock concessions.
          </p>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded-xl border border-gray-200 p-3 text-center">
            <div className="text-lg font-bold text-gray-900">$28.4M</div>
            <div className="text-xs text-gray-500 mt-0.5">Pipeline ARR</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-3 text-center">
            <div className="text-lg font-bold text-gray-900">8</div>
            <div className="text-xs text-gray-500 mt-0.5">Active deals</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-3 text-center">
            <div className="text-lg font-bold text-gray-900">2</div>
            <div className="text-xs text-gray-500 mt-0.5">Executed</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-3 text-center">
            <div className="text-lg font-bold text-gray-900">312K sf</div>
            <div className="text-xs text-gray-500 mt-0.5">In negotiation</div>
          </div>
        </div>

        {/* Deals summary table */}
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tenant</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stage</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">SF</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">NER</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { tenant: "Salesforce", stage: "Legal", sf: "38,000", ner: "$90", status: "On track", color: "green" },
                { tenant: "JPMorgan Chase", stage: "Legal", sf: "52,000", ner: "$75", status: "On track", color: "green" },
                { tenant: "Google", stage: "LOI", sf: "45,000", ner: "$82", status: "On track", color: "green" },
                { tenant: "Deloitte", stage: "Legal", sf: "43,000", ner: "$72", status: "On track", color: "green" },
                { tenant: "Starbucks", stage: "Legal", sf: "28,000", ner: "$52", status: "On track", color: "green" },
                { tenant: "Tesla", stage: "Proposal", sf: "55,000", ner: "$35", status: "At risk", color: "amber" },
                { tenant: "Apex Capital", stage: "Proposal", sf: "45,000", ner: "$48", status: "Stalled", color: "red" },
                { tenant: "KPMG", stage: "Proposal", sf: "51,000", ner: "$49", status: "Stalled", color: "red" },
              ].map((row, i) => (
                <tr key={row.tenant} className={`${i < 7 ? "border-b border-gray-100" : ""} ${row.color === "red" ? "bg-red-50" : ""}`}>
                  <td className="px-3 py-2.5 font-medium text-gray-900">{row.tenant}</td>
                  <td className="px-3 py-2.5 text-gray-600">{row.stage}</td>
                  <td className="px-3 py-2.5 text-gray-600">{row.sf}</td>
                  <td className="px-3 py-2.5 text-gray-600">{row.ner}</td>
                  <td className="px-3 py-2.5">
                    <Badge className={
                      row.color === "green" ? "bg-green-100 text-green-700 hover:bg-green-100 text-xs" :
                      row.color === "red" ? "bg-red-100 text-red-700 hover:bg-red-100 text-xs" :
                      "bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs"
                    }>{row.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div>
          <Button size="sm">View full portfolio</Button>
        </div>
      </EmailCard>
    </EmailPreviewPage>
  )
}
