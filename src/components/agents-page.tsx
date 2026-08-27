import * as React from "react"
import { cn } from "@/lib/utils"
import {
  CheckCircle2, Loader2, Clock,
  Lock, Zap, Activity, ArrowLeft,
  Database, SlidersHorizontal, ChevronRight, HeartPulse, CalendarCheck,
  FileText, BarChart2, ClipboardCheck,
  BrainCircuit, Scale, GitMerge, TrendingUp, FileCheck2, Building2, DatabaseZap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { FilterBar, toggleFilterValue, clearFilterKey, type FilterDef, FILTER_TAB_GROUP_CLS, FILTER_TAB_ITEM_CLS } from "@/components/filter-chip"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AgentDef {
  id: string
  name: string
  tagline: string
  description: string
  impact: string
  category: string
  capabilities: string[]
  icon: React.ElementType
  available: boolean
  active?: boolean
}

interface AgentRun {
  id: string
  title: string
  asset: string
  dealId?: string
  status: "complete" | "running" | "pending"
  agentId: string
  category: string
  time: string
  summary?: string
  output?: string
  actionLabel?: string
  actionKind?: "confirm" | "review" | "dismiss" | "approve"
}

// ─── Data ─────────────────────────────────────────────────────────────────────

export const AGENTS: AgentDef[] = [
  {
    id: "deal-capture",
    name: "Deal Capture",
    tagline: "Create and update deals from the work already happening",
    description:
      "Parse calls, emails, texts, calendars, TIMs, and documents to create deals, capture requirements, log tours, and update stages automatically.",
    impact:
      "Less admin overhead, a more accurate pipeline, and deal records that reflect reality without anyone having to enter data manually.",
    category: "Cross-Cutting",
    capabilities: [
      "Detect new deals from inbound emails, calls, and calendar events",
      "Capture tenant requirements from conversations and documents",
      "Log tours and update deal stage based on activity signals",
      "Parse TIMs, LOIs, and lease documents to keep records current",
    ],
    icon: Database,
    available: true,
    active: true,
  },
  {
    id: "deal-health",
    name: "Deal Health",
    tagline: "Continuously determine what is active, stale, dead, or progressing",
    description:
      "Use activity across VTS, email, calendar, and Market to recommend follow-ups, stage changes, closures, duplicate cleanup, and related-deal consolidation.",
    impact:
      "A cleaner pipeline, fewer surprises, and always knowing which deals need attention and which are already closed in everything but name.",
    category: "Cross-Cutting",
    capabilities: [
      "Score each deal as active, progressing, stale, or dead based on recency and signal strength",
      "Recommend stage changes when activity confirms movement forward or backward",
      "Flag deals with no activity and suggest follow-up actions or closure",
      "Identify duplicates and related deals and recommend consolidation",
    ],
    icon: HeartPulse,
    available: true,
  },
  {
    id: "space-match",
    name: "Space Match",
    tagline: "Turn requirements into the best available space options",
    description:
      "Rank spaces against tenant needs, surface non-obvious fits, refine options over time, and identify what would need to change to create a viable block.",
    impact:
      "Faster shortlisting, fewer missed opportunities, and proposals built on a clearer understanding of what actually fits.",
    category: "Cross-Cutting",
    capabilities: [
      "Rank available spaces against tenant size, floor, and budget requirements",
      "Surface non-obvious fits based on contiguous availability and configuration",
      "Identify what would need to change to make a partial match viable",
      "Refine space options as requirements evolve through the deal",
    ],
    icon: SlidersHorizontal,
    available: true,
  },
  {
    id: "tour-agent",
    name: "Tour Coordinator",
    tagline: "Coordinate the tour and capture what happened",
    description:
      "Schedule across participants, send logistics and collateral, prompt stakeholders, log the tour, and summarize engagement afterward.",
    impact:
      "Fewer scheduling gaps, complete tour records, and a faster path from showing to follow-up.",
    category: "Cross-Cutting",
    capabilities: [
      "Coordinate scheduling across brokers, tenants, and property contacts",
      "Send tour logistics, collateral, and access instructions automatically",
      "Prompt stakeholders for confirmation and outstanding prep items",
      "Log the tour and generate an engagement summary afterward",
    ],
    icon: CalendarCheck,
    available: true,
  },
  {
    id: "proposal-builder",
    name: "Proposal Builder",
    tagline: "Build the proposal from everything VTS already knows",
    description:
      "Pull from active deals, executed leases, and market data to assemble a proposal and supporting context automatically.",
    impact:
      "Less time assembling documents, more time on strategy — proposals built from real data without starting from scratch.",
    category: "Cross-Cutting",
    capabilities: [
      "Pull deal terms, space details, and market comps into a proposal automatically",
      "Reference executed leases and precedent to support proposed economics",
      "Assemble supporting context including availability, market positioning, and tenant profile",
      "Update the proposal as deal terms evolve",
    ],
    icon: FileText,
    available: true,
  },
  {
    id: "scenario-modeling",
    name: "Scenario Modeling",
    tagline: "Model the deal before committing to a position",
    description:
      "Run different deal structures and financial scenarios so teams can understand the impact of changing terms and compare alternatives quickly.",
    impact:
      "Faster positioning decisions, clearer trade-off analysis, and less manual spreadsheet work when terms change.",
    category: "Cross-Cutting",
    capabilities: [
      "Model multiple deal structures side by side",
      "Calculate the financial impact of changing rent, TI, free rent, and term",
      "Compare scenarios against budget and underwriting assumptions",
      "Surface the break-even and key sensitivity points for each structure",
    ],
    icon: BarChart2,
    available: true,
  },
  {
    id: "approval-readiness",
    name: "Approval Readiness",
    tagline: "Turn a proposal into a decision-ready package",
    description:
      "Bring together the economics, precedent, scenarios, and key risks so stakeholders can approve, reject, or redirect the deal with less back-and-forth.",
    impact:
      "Fewer approval rounds, clearer decisions, and a package that gives stakeholders what they need without chasing down context.",
    category: "Cross-Cutting",
    capabilities: [
      "Consolidate economics, scenarios, and precedent into a single approval package",
      "Summarize key risks and open items for stakeholder review",
      "Flag anything that deviates from policy or underwriting thresholds",
      "Track approval status and surface outstanding decisions",
    ],
    icon: ClipboardCheck,
    available: true,
  },
  {
    id: "deal-intelligence",
    name: "Deal Intelligence",
    tagline: "Build the full picture before anyone has to ask",
    description:
      "Pull credit, comps, market trends, precedent, and deal history together automatically so teams walk in with context instead of questions.",
    impact:
      "Faster positioning, fewer surprises in negotiation, and a complete picture assembled before the first meeting.",
    category: "Cross-Cutting",
    capabilities: [
      "Aggregate credit, comps, market trends, and precedent into one view",
      "Surface relevant deal history and prior lease terms for the tenant",
      "Flag risks and anomalies before they surface in negotiations",
      "Refresh the intelligence package as new data becomes available",
    ],
    icon: BrainCircuit,
    available: true,
  },
  {
    id: "counsel-handoff",
    name: "Counsel Handoff",
    tagline: "Give counsel a package, not a blank page",
    description:
      "Extract LOI terms, flag unusual positions, attach relevant comps and context, and prepare the first-draft package so legal can start fast.",
    impact:
      "Faster legal turnaround, fewer back-and-forth clarification rounds, and less time spent translating deal context into legal briefs.",
    category: "Cross-Cutting",
    capabilities: [
      "Extract and structure all LOI terms into a clean handoff summary",
      "Flag positions that deviate from standard or prior executed leases",
      "Attach comparable transactions and relevant market context",
      "Draft the initial legal brief so counsel starts with structure",
    ],
    icon: Scale,
    available: true,
  },
  {
    id: "negotiation-guidance",
    name: "Negotiation Guidance",
    tagline: "Help teams resolve open terms faster",
    description:
      "Track positions and redlines, detect scope drift, surface precedent and market data, and recommend specific tradeoffs or responses.",
    impact:
      "Shorter negotiation cycles, better-supported positions, and fewer redline rounds before reaching agreement.",
    category: "Cross-Cutting",
    capabilities: [
      "Track open redlines and positions across all negotiation rounds",
      "Detect scope drift and flag terms that moved without agreement",
      "Surface precedent from comparable executed transactions",
      "Recommend specific tradeoffs and response strategies based on market data",
    ],
    icon: GitMerge,
    available: true,
  },
  {
    id: "deal-momentum",
    name: "Deal Momentum",
    tagline: "Keep stalled deals moving",
    description:
      "Identify what is stuck, who has the ball, what the delay is costing, and draft the next follow-up or escalation automatically.",
    impact:
      "Fewer deals lost to inertia, faster cycle times, and a clear action for every stalled deal.",
    category: "Cross-Cutting",
    capabilities: [
      "Identify deals with no activity and score the cost of continued delay",
      "Pinpoint who holds the ball and how long they have had it",
      "Draft targeted follow-up messages and escalation notes",
      "Recommend the next best action for each stalled deal",
    ],
    icon: TrendingUp,
    available: true,
  },
  {
    id: "execution-management",
    name: "Execution Management",
    tagline: "Take the deal from final terms through signature",
    description:
      "Verify documents and authority, assemble the execution set, route signatures, and track what is missing so nothing delays close.",
    impact:
      "Faster time from agreed terms to signed lease, with fewer errors and missed steps in the execution process.",
    category: "Cross-Cutting",
    capabilities: [
      "Verify signatory authority and document completeness before routing",
      "Assemble the full execution package in the correct order",
      "Route documents for signature and track outstanding approvals",
      "Alert on anything blocking execution and recommend resolution",
    ],
    icon: FileCheck2,
    available: true,
  },
  {
    id: "operational-handoff",
    name: "Operational Handoff",
    tagline: "Turn the executed lease into work automatically",
    description:
      "Notify property teams, create buildout and compliance tasks, carry forward constraints, dates, obligations, and owners.",
    impact:
      "No deals lost in the transition from signing to operations, with every obligation assigned and tracked from day one.",
    category: "Cross-Cutting",
    capabilities: [
      "Notify property management and operations teams at execution",
      "Create buildout, compliance, and move-in tasks from lease terms",
      "Carry forward key dates, obligations, and responsible parties",
      "Surface items that need owner assignment before the tenant moves in",
    ],
    icon: Building2,
    available: true,
  },
  {
    id: "data-writeback",
    name: "Data Writeback",
    tagline: "Make execution the end of data entry",
    description:
      "Extract final terms and write them back into VTS, reporting, financial models, and downstream systems automatically.",
    impact:
      "Accurate data in every system from day one, with no manual re-entry and no version drift across reporting and finance.",
    category: "Cross-Cutting",
    capabilities: [
      "Extract final economic terms from executed lease documents",
      "Write terms back into VTS deal records and reporting fields",
      "Sync data to financial models and downstream systems automatically",
      "Flag discrepancies between agreed terms and what was captured",
    ],
    icon: DatabaseZap,
    available: true,
  },
]

const ALL_RUNS: AgentRun[] = [
  // Deal Capture
  {
    id: "dc-1",
    title: "Amazon inquiry captured from forwarded email",
    asset: "VTS Tower – Floor 8",
    dealId: "d00",
    status: "complete",
    agentId: "deal-capture",
    category: "Deal Capture",
    time: "Just now",
    summary: "Deal created for Amazon.com (18,000 sf, Inquiry stage). Linked to Sarah Okonkwo at CBRE.",
    output: "Parsed inbound email from Sarah Okonkwo. Extracted tenant: Amazon.com, space: Suite 0800 Floor 8, size: 18,000 sf, rep: CBRE. Deal record created and staged at Inquiry.",
    actionLabel: "View deal",
    actionKind: "review",
  },
  {
    id: "dc-2",
    title: "KPMG expansion interest logged",
    asset: "VTS Tower – Floor 22",
    status: "complete",
    agentId: "deal-capture",
    category: "Deal Capture",
    time: "14 min ago",
    summary: "Inbound interest from Laura Chen at KPMG. New deal created for Floor 22 (est. 12,000 sf).",
    output: "Email from Laura Chen (lchen@kpmg.com) indicated expansion interest in Floor 22. No existing deal found. New deal created at Inquiry stage. Requirements not yet captured.",
    actionLabel: "Capture requirements",
    actionKind: "confirm",
  },
  {
    id: "dc-3",
    title: "Apex Capital stage update",
    asset: "VTS Tower – Floor 12",
    status: "complete",
    agentId: "deal-capture",
    category: "Deal Capture",
    time: "1 hr ago",
    summary: "Calendar event confirmed tour on Sep 5. Deal stage updated from Inquiry to Touring.",
    output: "Tour confirmation detected in calendar (Sep 5, 10am). Apex Capital deal moved from Inquiry to Touring. Space: Floor 12, 45,000 sf.",
    actionLabel: "Review change",
    actionKind: "review",
  },
  {
    id: "dc-4",
    title: "Scanning today's email and calendar",
    asset: "VTS Tower Headquarters",
    status: "running",
    agentId: "deal-capture",
    category: "Deal Capture",
    time: "Running now",
    summary: "Monitoring inbound channels for new deal signals.",
  },
  // Space Match
  {
    id: "sm-1",
    title: "Amazon space ranking complete",
    asset: "VTS Tower",
    dealId: "d08",
    status: "complete",
    agentId: "space-match",
    category: "Space Match",
    time: "8 min ago",
    summary: "4 spaces ranked. Suite 0800 is the strongest fit. Suite 0900 viable with minor reconfiguration.",
    output: "Ranked against Amazon requirement (18,000 sf, Floor 6+, open plan). Top match: Suite 0800 (18,000 sf, Floor 8) — meets all criteria. Suite 0900 (19,400 sf) viable with partial demise. Floors 2-3 excluded — below floor preference.",
    actionLabel: "Send to deal",
    actionKind: "confirm",
  },
  {
    id: "sm-2",
    title: "KPMG requirement needs clarification",
    asset: "VTS Tower – Floor 22",
    status: "complete",
    agentId: "space-match",
    category: "Space Match",
    time: "12 min ago",
    summary: "Size range unclear. Agent paused ranking pending requirement confirmation.",
    output: "Requirement captured from email: Floor 22 interest. Size not specified. Cannot rank spaces without size range. Flagged for broker confirmation before proceeding.",
    actionLabel: "Confirm requirements",
    actionKind: "confirm",
  },
  {
    id: "sm-3",
    title: "Refreshing rankings for Meridian Health",
    asset: "Northeast Corridor Portfolio",
    status: "running",
    agentId: "space-match",
    category: "Space Match",
    time: "Running now",
    summary: "Requirement updated — reranking available spaces.",
  },
  // Tour
  {
    id: "ta-1",
    title: "Amazon tour scheduled for Sep 3",
    asset: "VTS Tower – Floor 8",
    status: "complete",
    agentId: "tour-agent",
    category: "Tour Coordinator",
    time: "22 min ago",
    summary: "Tour confirmed with Sarah Okonkwo and Ryan Chen. Logistics and collateral sent.",
    output: "Scheduling coordinated across 4 participants. Calendar invite sent and accepted. Tour packet sent: floorplan, building overview, access instructions. Stakeholder prompts sent for outstanding prep items.",
    actionLabel: "View tour record",
    actionKind: "review",
  },
  {
    id: "ta-2",
    title: "Deloitte tour summary generated",
    asset: "VTS Tower – Suite 500",
    status: "complete",
    agentId: "tour-agent",
    category: "Tour Coordinator",
    time: "Yesterday",
    summary: "Tour completed. Positive feedback captured. Follow-up prompt sent to Marcus Bell.",
    output: "Tour logged Sep 1. Feedback from Marcus Bell: positive response to layout, concern about natural light on north side. Follow-up prompt sent. Deal stage eligible for Proposal.",
    actionLabel: "Move to proposal",
    actionKind: "confirm",
  },
  {
    id: "ta-3",
    title: "Apex Capital tour logistics pending",
    asset: "VTS Tower – Floor 12",
    status: "pending",
    agentId: "tour-agent",
    category: "Tour Coordinator",
    time: "Queued for Sep 5",
    summary: "Logistics package queued. Sending 48 hours before tour.",
  },
  // Deal Health
  {
    id: "dh-1",
    title: "Atlas Group flagged as at risk",
    asset: "VTS Tower – Floors 2-3",
    status: "complete",
    agentId: "deal-health",
    category: "Deal Health",
    time: "1 hr ago",
    summary: "No response to counter-proposal in 11 days. Competitor building engagement detected in Market.",
    output: "Last activity: Aug 14 (counter-proposal sent). No response. Market data shows Atlas Group toured 3 East 42nd St on Aug 19. Deal health score: At Risk. Recommend immediate outreach.",
    actionLabel: "Log follow-up",
    actionKind: "confirm",
  },
  {
    id: "dh-2",
    title: "Meridian Health marked stalled",
    asset: "VTS Tower – Suite 1800",
    status: "complete",
    agentId: "deal-health",
    category: "Deal Health",
    time: "2 hr ago",
    summary: "Lease out for 18 days with no activity. Legal counsel not yet engaged.",
    output: "Deal at Lease Out stage for 18 days. No email, calendar, or document activity since Aug 7. Legal counsel not confirmed on either side. Recommend follow-up call to broker.",
    actionLabel: "Send follow-up",
    actionKind: "confirm",
  },
  {
    id: "dh-3",
    title: "Daily pipeline health scan",
    asset: "VTS Tower Headquarters",
    status: "running",
    agentId: "deal-health",
    category: "Deal Health",
    time: "Running now",
    summary: "Scoring all 29 active deals against activity signals.",
  },
  {
    id: "dh-4",
    title: "Duplicate deal check",
    asset: "Northeast Corridor Portfolio",
    status: "pending",
    agentId: "deal-health",
    category: "Deal Health",
    time: "Queued",
    summary: "Checking for duplicate or related deals across portfolio.",
  },
  // Proposal Builder
  {
    id: "pb-1",
    title: "Amazon proposal assembled",
    asset: "VTS Tower – Floor 8",
    status: "complete",
    agentId: "proposal-builder",
    category: "Proposal Builder",
    time: "18 min ago",
    summary: "Proposal drafted for Amazon.com (18,000 sf, Inquiry stage). Comps pulled from 3 executed leases.",
    output: "Pulled deal terms, space details, and market comps. Referenced 3 executed leases on comparable floors. Assembled proposal draft with economics, availability context, and tenant profile. Ready for broker review.",
    actionLabel: "Review proposal",
    actionKind: "review",
  },
  {
    id: "pb-2",
    title: "Apex Capital proposal updated",
    asset: "VTS Tower – Floor 12",
    status: "complete",
    agentId: "proposal-builder",
    category: "Proposal Builder",
    time: "2 hr ago",
    summary: "Proposal updated after rent revision. TI allowance and free rent period refreshed.",
    output: "Deal terms changed: rent revised from $78 to $82 PSF. Proposal updated to reflect new economics. TI allowance and free rent period recalculated against updated term sheet. Precedent comps remain valid.",
    actionLabel: "Review change",
    actionKind: "review",
  },
  {
    id: "pb-3",
    title: "Building proposal context for Deloitte",
    asset: "VTS Tower – Suite 500",
    status: "running",
    agentId: "proposal-builder",
    category: "Proposal Builder",
    time: "Running now",
    summary: "Pulling executed leases and market data for Deloitte renewal proposal.",
  },
  {
    id: "pb-4",
    title: "KPMG proposal queued",
    asset: "VTS Tower – Floor 22",
    status: "pending",
    agentId: "proposal-builder",
    category: "Proposal Builder",
    time: "Queued",
    summary: "Waiting for requirements confirmation before building proposal.",
  },
  // Scenario Modeling
  {
    id: "sm2-1",
    title: "Amazon deal — 3 scenarios modeled",
    asset: "VTS Tower – Floor 8",
    status: "complete",
    agentId: "scenario-modeling",
    category: "Scenario Modeling",
    time: "30 min ago",
    summary: "Base, aggressive, and blended structures compared. Blended structure meets NOI target with 2-month free rent.",
    output: "Scenario A (base): $82 PSF, 7-year term, 6 months free rent. Scenario B (aggressive): $86 PSF, 5-year term, 3 months free rent. Scenario C (blended): $84 PSF, 7-year term, 2 months free rent — meets NOI target. Recommend Scenario C.",
    actionLabel: "Save to deal",
    actionKind: "confirm",
  },
  {
    id: "sm2-2",
    title: "Apex Capital — sensitivity analysis complete",
    asset: "VTS Tower – Floor 12",
    status: "complete",
    agentId: "scenario-modeling",
    category: "Scenario Modeling",
    time: "3 hr ago",
    summary: "Break-even rent identified at $79 PSF on a 7-year term. Deal is viable at proposed terms.",
    output: "Break-even analysis: $79 PSF at 7-year term with standard TI. Current proposal at $82 PSF provides $3 PSF margin. Sensitivity to TI: each $5 PSF increase in TI shifts break-even up $1.20 PSF. Deal viable as structured.",
    actionLabel: "View scenarios",
    actionKind: "review",
  },
  {
    id: "sm2-3",
    title: "Modeling Deloitte renewal structures",
    asset: "VTS Tower – Suite 500",
    status: "running",
    agentId: "scenario-modeling",
    category: "Scenario Modeling",
    time: "Running now",
    summary: "Running 4 term and rent combinations against underwriting.",
  },
  // Approval Readiness
  {
    id: "ar-1",
    title: "Amazon deal package ready for review",
    asset: "VTS Tower – Floor 8",
    status: "complete",
    agentId: "approval-readiness",
    category: "Approval Readiness",
    time: "10 min ago",
    summary: "Economics, scenarios, and precedent compiled. One open item flagged: TI above policy threshold.",
    output: "Package assembled: deal economics, 3 scenarios, 4 precedent comps, and risk summary. One deviation flagged: TI allowance ($85 PSF) exceeds standard policy ($75 PSF) — requires VP sign-off. All other terms within guidelines. Package routed to Sarah Chen for approval.",
    actionLabel: "Submit for approval",
    actionKind: "confirm",
  },
  {
    id: "ar-2",
    title: "Apex Capital package approved",
    asset: "VTS Tower – Floor 12",
    status: "complete",
    agentId: "approval-readiness",
    category: "Approval Readiness",
    time: "Yesterday",
    summary: "Package approved by Marcus Bell. Deal cleared for LOI.",
    output: "Approval received from Marcus Bell (VP Leasing) on Aug 24. All terms within policy. Deal cleared to proceed to LOI stage. No conditions attached to approval.",
    actionLabel: "Move to LOI",
    actionKind: "confirm",
  },
  {
    id: "ar-3",
    title: "Building Deloitte approval package",
    asset: "VTS Tower – Suite 500",
    status: "running",
    agentId: "approval-readiness",
    category: "Approval Readiness",
    time: "Running now",
    summary: "Compiling economics, scenarios, and risk summary for Deloitte renewal.",
  },
  {
    id: "ar-4",
    title: "KPMG approval package queued",
    asset: "VTS Tower – Floor 22",
    status: "pending",
    agentId: "approval-readiness",
    category: "Approval Readiness",
    time: "Queued",
    summary: "Waiting for proposal and scenarios to be finalized before assembling package.",
  },
  // Deal Intelligence
  {
    id: "di-1",
    title: "Amazon intelligence package assembled",
    asset: "VTS Tower – Floor 8",
    status: "complete",
    agentId: "deal-intelligence",
    category: "Deal Intelligence",
    time: "3 hours ago",
    summary: "Pulled credit profile, 6 comparable transactions, and prior lease history for Amazon.",
    output: "Credit: A+. Prior leases: 3 transactions in market (avg $52/sf NNN). Comps: 6 deals in submarket, avg $48–$54/sf. Market trend: absorption positive, concessions tightening. No adverse signals.",
    actionLabel: "View package",
    actionKind: "review",
  },
  {
    id: "di-2",
    title: "Salesforce deal intelligence running",
    asset: "One Market Plaza",
    status: "running",
    agentId: "deal-intelligence",
    category: "Deal Intelligence",
    time: "Running now",
    summary: "Aggregating credit, market trends, and precedent for Salesforce renewal.",
  },
  {
    id: "di-3",
    title: "Deloitte intelligence queued",
    asset: "VTS Tower – Suite 500",
    status: "pending",
    agentId: "deal-intelligence",
    category: "Deal Intelligence",
    time: "Queued",
    summary: "Waiting for deal record confirmation before pulling intelligence package.",
  },
  // Counsel Handoff
  {
    id: "ch-1",
    title: "CBRE LOI handoff package ready",
    asset: "VTS Tower – Floor 8",
    dealId: "d09",
    status: "complete",
    agentId: "counsel-handoff",
    category: "Counsel Handoff",
    time: "Yesterday",
    summary: "Extracted LOI terms, flagged 2 unusual positions, and prepared first-draft brief for outside counsel.",
    output: "LOI terms extracted: 10-year term, $50/sf NNN, $80/sf TI, 6 months free rent. Flags: Free rent above market (comparable avg 4 months); TI escalation clause non-standard. Comps attached: 3 transactions. Draft legal brief: ready.",
    actionLabel: "View handoff",
    actionKind: "review",
  },
  {
    id: "ch-2",
    title: "Deloitte renewal handoff running",
    asset: "VTS Tower – Suite 500",
    status: "running",
    agentId: "counsel-handoff",
    category: "Counsel Handoff",
    time: "Running now",
    summary: "Extracting LOI terms and preparing brief for Deloitte renewal negotiation.",
  },
  {
    id: "ch-3",
    title: "KPMG handoff queued",
    asset: "VTS Tower – Floor 22",
    status: "pending",
    agentId: "counsel-handoff",
    category: "Counsel Handoff",
    time: "Queued",
    summary: "LOI pending signature. Handoff package will run once LOI is executed.",
  },
  // Negotiation Guidance
  {
    id: "ng-1",
    title: "Amazon redline analysis complete",
    asset: "VTS Tower – Floor 8",
    status: "complete",
    agentId: "negotiation-guidance",
    category: "Negotiation Guidance",
    time: "2 hours ago",
    summary: "Tracked 14 open redlines, flagged 3 scope drifts, and recommended 2 tradeoff strategies.",
    output: "Open redlines: 14 (down from 22). Scope drift: Free rent moved from 4→6 months without agreement; TI carve-out introduced in round 3. Recommendations: Accept TI carve-out, push back on free rent using Q4 comps showing 3.8-month average. Precedent: 2 comparable deals at 4-month free rent in this submarket.",
    actionLabel: "View guidance",
    actionKind: "review",
  },
  {
    id: "ng-2",
    title: "Salesforce negotiation tracking active",
    asset: "One Market Plaza",
    status: "running",
    agentId: "negotiation-guidance",
    category: "Negotiation Guidance",
    time: "Running now",
    summary: "Monitoring open terms and redline history for Salesforce renewal.",
  },
  {
    id: "ng-3",
    title: "Deloitte negotiation guidance queued",
    asset: "VTS Tower – Suite 500",
    status: "pending",
    agentId: "negotiation-guidance",
    category: "Negotiation Guidance",
    time: "Queued",
    summary: "Guidance will activate once counsel returns first redline set.",
  },
  // Deal Momentum
  {
    id: "dm-1",
    title: "3 stalled deals escalated",
    asset: "VTS Tower",
    dealId: "d10",
    status: "complete",
    agentId: "deal-momentum",
    category: "Deal Momentum",
    time: "This morning",
    summary: "Identified 3 deals with no activity for 10+ days. Drafted follow-up messages and flagged cost of delay.",
    output: "Stalled deals: KPMG (14 days, $2,800/day cost of delay), WeWork (11 days, $1,900/day), TechCo (10 days, $3,100/day). Follow-ups drafted and sent. Escalation flagged to Sarah Chen for KPMG.",
    actionLabel: "Review follow-ups",
    actionKind: "approve",
  },
  {
    id: "dm-2",
    title: "WeWork follow-up sequence running",
    asset: "VTS Tower – Floor 14",
    status: "running",
    agentId: "deal-momentum",
    category: "Deal Momentum",
    time: "Running now",
    summary: "Drafting targeted follow-up for WeWork after 11 days of no response.",
  },
  {
    id: "dm-3",
    title: "Monthly stall report queued",
    asset: "All assets",
    status: "pending",
    agentId: "deal-momentum",
    category: "Deal Momentum",
    time: "Queued",
    summary: "Scheduled end-of-month stall analysis across all active deals.",
  },
  // Execution Management
  {
    id: "em-1",
    title: "Amazon lease execution package ready",
    asset: "VTS Tower – Floor 8",
    dealId: "d20",
    status: "complete",
    agentId: "execution-management",
    category: "Execution Management",
    time: "Yesterday",
    summary: "Assembled execution set, verified signatory authority, and routed for signature.",
    output: "Signatory verified: John Smith (VP Real Estate, authorized >$10M). Execution set: lease, exhibits A–D, guaranty. Routed: landlord signed 2/14, tenant routing 2/15. Outstanding: tenant CFO counter-signature.",
    actionLabel: "View execution set",
    actionKind: "review",
  },
  {
    id: "em-2",
    title: "Salesforce execution running",
    asset: "One Market Plaza",
    status: "running",
    agentId: "execution-management",
    category: "Execution Management",
    time: "Running now",
    summary: "Verifying signatory authority and assembling Salesforce renewal execution package.",
  },
  {
    id: "em-3",
    title: "Deloitte execution queued",
    asset: "VTS Tower – Suite 500",
    status: "pending",
    agentId: "execution-management",
    category: "Execution Management",
    time: "Queued",
    summary: "Execution management will begin once final terms are agreed.",
  },
  // Operational Handoff
  {
    id: "oh-1",
    title: "Amazon operational handoff complete",
    asset: "VTS Tower – Floor 8",
    status: "complete",
    agentId: "operational-handoff",
    category: "Operational Handoff",
    time: "3 days ago",
    summary: "Notified property team, created 12 buildout and compliance tasks, and assigned key dates.",
    output: "Notifications sent: Property Manager (James Lee), Compliance (Dana Park), Facilities (Mike Torres). Tasks created: 12 (buildout: 5, compliance: 4, move-in: 3). Key dates loaded: possession 4/1, rent commencement 6/1, expiration 5/31/2034. All owners assigned.",
    actionLabel: "View handoff summary",
    actionKind: "review",
  },
  {
    id: "oh-2",
    title: "Salesforce handoff running",
    asset: "One Market Plaza",
    status: "running",
    agentId: "operational-handoff",
    category: "Operational Handoff",
    time: "Running now",
    summary: "Creating operational tasks and notifying property team for Salesforce renewal.",
  },
  {
    id: "oh-3",
    title: "KPMG handoff queued",
    asset: "VTS Tower – Floor 22",
    status: "pending",
    agentId: "operational-handoff",
    category: "Operational Handoff",
    time: "Queued",
    summary: "Handoff will run automatically when lease execution is confirmed.",
  },
  // Data Writeback
  {
    id: "dw-1",
    title: "Amazon final terms written back",
    asset: "VTS Tower – Floor 8",
    dealId: "d22",
    status: "complete",
    agentId: "data-writeback",
    category: "Data Writeback",
    time: "3 days ago",
    summary: "Extracted 22 final economic terms and synced across VTS, financial model, and reporting.",
    output: "Terms extracted: 22. Written to VTS deal record: ✓. Reporting fields updated: ✓. Financial model sync: ✓. Discrepancies found: 1 (free rent duration: LOI 6 months, lease 5.5 months — flagged for review).",
    actionLabel: "Review discrepancies",
    actionKind: "approve",
  },
  {
    id: "dw-2",
    title: "Salesforce writeback running",
    asset: "One Market Plaza",
    status: "running",
    agentId: "data-writeback",
    category: "Data Writeback",
    time: "Running now",
    summary: "Extracting final terms from Salesforce renewal execution and syncing to VTS.",
  },
  {
    id: "dw-3",
    title: "KPMG writeback queued",
    asset: "VTS Tower – Floor 22",
    status: "pending",
    agentId: "data-writeback",
    category: "Data Writeback",
    time: "Queued",
    summary: "Will run automatically once lease execution is complete.",
  },
]

void ALL_RUNS // keep reference live

const STATUS_CONFIG = {
  complete: { icon: CheckCircle2, color: "text-success", label: "Complete" },
  running:  { icon: Loader2,      color: "text-primary", label: "Running" },
  pending:  { icon: Clock,        color: "text-muted-foreground", label: "Queued" },
}

const WORKFLOW_STEPS: Record<string, string[]> = {
  "deal-capture": [
    "Monitor email, calendar, texts, and calls for deal signals",
    "Create or match deal records from inbound activity",
    "Parse documents and TIMs to capture requirements and terms",
    "Log tours and update deal stage based on confirmed activity",
    "Notify the team when a new deal is created or a stage changes",
  ],
  "space-match": [
    "Ingest tenant requirements from the deal record",
    "Rank available spaces against size, floor, and budget criteria",
    "Surface non-obvious fits including partial and contiguous blocks",
    "Identify what changes would make a marginal space viable",
    "Refresh rankings as requirements or availability evolve",
  ],
  "tour-agent": [
    "Detect tour intent from deal activity or broker request",
    "Coordinate scheduling across all participants",
    "Send logistics, access instructions, and collateral",
    "Prompt stakeholders for outstanding confirmation items",
    "Log the completed tour and generate an engagement summary",
  ],
  "deal-health": [
    "Score each deal based on recency and signal strength",
    "Flag deals with no activity and recommend follow-up or closure",
    "Recommend stage changes when signals confirm forward movement",
    "Identify duplicate or related deals and suggest consolidation",
    "Surface a prioritized list of deals that need attention today",
  ],
  "proposal-builder": [
    "Pull deal terms, space details, and leasing context from VTS",
    "Reference executed leases and market data to support proposed economics",
    "Assemble the proposal document and supporting materials automatically",
    "Update the proposal as deal terms evolve through negotiation",
    "Flag missing information before the proposal goes to the tenant",
  ],
  "scenario-modeling": [
    "Ingest the current deal structure and economic assumptions",
    "Generate alternative deal structures based on defined variables",
    "Calculate the financial impact of each scenario against underwriting",
    "Surface break-even points and key sensitivities across structures",
    "Save and compare scenarios as the deal moves through negotiation",
  ],
  "approval-readiness": [
    "Consolidate deal economics, scenarios, and precedent into one package",
    "Summarize key risks, deviations, and open items for stakeholders",
    "Flag anything outside policy or underwriting thresholds",
    "Route the package to the appropriate approvers based on deal size",
    "Track approval status and surface outstanding decisions",
  ],
  "deal-intelligence": [
    "Identify the tenant and deal from the active record",
    "Pull credit profile, market data, comps, and deal history automatically",
    "Synthesize findings into a structured intelligence package",
    "Flag anomalies, risks, and items that need team attention",
    "Refresh the package as new data or deal context becomes available",
  ],
  "counsel-handoff": [
    "Extract all LOI and deal terms into a structured summary",
    "Identify positions that deviate from standard or prior transactions",
    "Attach comparable executed transactions and relevant market context",
    "Draft the initial legal brief with all required background",
    "Flag missing information before the package is sent to counsel",
  ],
  "negotiation-guidance": [
    "Ingest the current redline set and track changes across rounds",
    "Detect terms that moved without agreement and flag scope drift",
    "Surface precedent from comparable deals in the submarket",
    "Generate specific tradeoff recommendations based on market data",
    "Update guidance as new redlines and positions come in",
  ],
  "deal-momentum": [
    "Score all active deals by days since last activity",
    "Calculate the daily cost of delay for stalled deals",
    "Identify who holds the ball and how long they have had it",
    "Draft targeted follow-up messages or escalation notes",
    "Surface a prioritized list of deals that need immediate action",
  ],
  "execution-management": [
    "Verify signatory authority against the authorized signer list",
    "Check document completeness before assembling the execution set",
    "Assemble exhibits, guaranties, and lease documents in the correct order",
    "Route the package for signature and track each outstanding step",
    "Alert on anything blocking execution and recommend next actions",
  ],
  "operational-handoff": [
    "Detect lease execution and trigger the handoff workflow",
    "Notify property management, compliance, and facilities teams",
    "Create buildout, compliance, and move-in tasks from lease terms",
    "Load key dates and obligations into the property management system",
    "Assign owners and confirm all items are tracked before move-in",
  ],
  "data-writeback": [
    "Extract final economic terms from the executed lease document",
    "Map terms to the correct fields in VTS deal records",
    "Sync data to reporting, financial models, and downstream systems",
    "Flag any discrepancies between agreed terms and what was captured",
    "Confirm sync completion and surface items that need manual review",
  ],
}

// ─── Left Panel: Agent List ───────────────────────────────────────────────────

function AgentListItem({
  agent,
  selected,
  onSelect,
}: {
  agent: AgentDef
  selected: boolean
  onSelect: () => void
}) {
  const Icon = agent.icon
  return (
    <button
      onClick={agent.available ? onSelect : undefined}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
        agent.available ? "cursor-pointer" : "cursor-default opacity-60",
        selected
          ? "bg-primary/10 text-primary"
          : "hover:bg-muted/60 text-foreground"
      )}
    >
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
        selected ? "bg-primary/10 border-primary/20" : "bg-muted/60 border-border/50"
      )}>
        <Icon className={cn("h-4 w-4", selected ? "text-primary" : "text-muted-foreground")} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">
          {agent.name}
        </p>
        <p className="text-[11px] text-muted-foreground truncate">{agent.tagline}</p>
      </div>
      <div className="shrink-0 flex items-center gap-1">
        {agent.active && (
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
        )}
        {!agent.available && (
          <Lock className="h-3 w-3 text-muted-foreground/40" />
        )}
      </div>
    </button>
  )
}

// ─── Center Panel: Agent Detail ───────────────────────────────────────────────

const AGENT_STATS: Record<string, { label: string; value: string }[]> = {
  "deal-capture": [
    { label: "Deals created",   value: "12" },
    { label: "Stage updates",   value: "8"  },
    { label: "Sources watched", value: "5"  },
  ],
  "space-match": [
    { label: "Deals ranked",  value: "9"  },
    { label: "Spaces scored", value: "34" },
    { label: "Clarifications", value: "2" },
  ],
  "tour-agent": [
    { label: "Tours scheduled", value: "6" },
    { label: "Tours logged",    value: "4" },
    { label: "Pending",         value: "2" },
  ],
  "deal-health": [
    { label: "Deals scored", value: "29" },
    { label: "At risk",      value: "2"  },
    { label: "Stalled",      value: "3"  },
  ],
  "proposal-builder": [
    { label: "Proposals built", value: "7"  },
    { label: "Deals active",    value: "14" },
    { label: "Updated today",   value: "2"  },
  ],
  "scenario-modeling": [
    { label: "Scenarios run",  value: "18" },
    { label: "Deals modeled",  value: "6"  },
    { label: "Structures saved", value: "11" },
  ],
  "approval-readiness": [
    { label: "Packages ready", value: "3"  },
    { label: "Pending review", value: "2"  },
    { label: "Approved",       value: "8"  },
  ],
  "deal-intelligence": [
    { label: "Packages built",  value: "11" },
    { label: "Risks flagged",   value: "4"  },
    { label: "Comps pulled",    value: "38" },
  ],
  "counsel-handoff": [
    { label: "Packages sent",   value: "6"  },
    { label: "Flags raised",    value: "9"  },
    { label: "Avg turnaround",  value: "1.2d" },
  ],
  "negotiation-guidance": [
    { label: "Redlines tracked",  value: "84" },
    { label: "Drift detected",    value: "7"  },
    { label: "Recommendations",   value: "23" },
  ],
  "deal-momentum": [
    { label: "Stalls resolved",  value: "8"  },
    { label: "Follow-ups sent",  value: "14" },
    { label: "Avg delay saved",  value: "6d" },
  ],
  "execution-management": [
    { label: "Leases executed",  value: "5"  },
    { label: "Packages routed",  value: "8"  },
    { label: "Items resolved",   value: "11" },
  ],
  "operational-handoff": [
    { label: "Handoffs complete",  value: "5"  },
    { label: "Tasks created",      value: "58" },
    { label: "Dates loaded",       value: "34" },
  ],
  "data-writeback": [
    { label: "Terms extracted",    value: "112" },
    { label: "Discrepancies",      value: "3"   },
    { label: "Systems synced",     value: "4"   },
  ],
}

function AboutTab({ agent }: { agent: AgentDef }) {
  const steps = WORKFLOW_STEPS[agent.id] ?? []
  return (
    <div className="space-y-6">
      {/* Description + impact */}
      <div className="space-y-3">
        <p className="text-lg font-semibold text-foreground mb-3">About</p>
        <p className="text-sm text-foreground leading-relaxed">{agent.description}</p>
        {agent.impact && (
          <div className="flex items-start gap-2.5 rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
            <Zap className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground leading-snug">{agent.impact}</p>
          </div>
        )}
      </div>

      {/* Capabilities */}
      <div className="space-y-2">
        <p className="text-lg font-semibold text-foreground mb-3">Capabilities</p>
        {agent.capabilities.map((cap, i) => (
          <div key={i} className="flex items-start gap-3 rounded-xl border border-border/60 px-4 py-3 bg-muted/20">
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] font-semibold text-primary">{i + 1}</span>
            </div>
            <p className="text-sm text-foreground leading-snug">{cap}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      {steps.length > 0 && (
        <div className="space-y-2">
          <p className="text-lg font-semibold text-foreground mb-3">How it works</p>
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-semibold text-primary">{i + 1}</span>
              </div>
              <p className="text-sm text-foreground leading-snug">{step}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RunRow({ run, defaultOpen = false }: { run: AgentRun; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen)
  const cfg = STATUS_CONFIG[run.status]
  const StatusIcon = cfg.icon
  return (
    <div className={cn("rounded-xl border transition-all", open ? "border-border bg-muted/30" : "border-border/60 hover:bg-muted/40 hover:border-border")}>
      <button
        className="w-full flex items-start gap-3 px-4 py-3 text-left"
        onClick={() => setOpen(o => !o)}
      >
        <StatusIcon className={cn("h-4 w-4 mt-0.5 shrink-0", cfg.color, run.status === "running" && "animate-spin")} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-snug">{run.title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {run.dealId ? (
              <button
                className="hover:text-primary hover:underline transition-colors"
                onClick={e => { e.stopPropagation(); window.location.hash = `#/deals?deal=${run.dealId}` }}
              >{run.asset}</button>
            ) : run.asset}
            {" · "}{run.time}
          </p>
          {!open && run.summary && <p className="text-xs text-muted-foreground mt-1 leading-snug">{run.summary}</p>}
        </div>
        <ChevronRight className={cn("h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5 transition-transform", open && "rotate-90")} />
      </button>
      {open && (
        <div className="px-4 pb-3 pt-0 border-t border-border/60">
          {run.status === "running" && (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground">Running now — results will appear when complete.</p>
            </div>
          )}
          {run.status === "pending" && (
            <p className="text-xs text-muted-foreground py-2">{run.summary ?? "Queued and waiting to run."}</p>
          )}
          {run.status === "complete" && run.output && (
            <div className="mt-2 space-y-3">
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">{run.output}</p>
              {run.actionLabel && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className={cn("gap-1.5 text-xs h-7 px-3", run.actionKind === "confirm" && "bg-primary")}
                    onClick={() => { if (run.dealId) window.location.hash = `#/deals?deal=${run.dealId}` }}
                  >{run.actionLabel}</Button>
                  {run.actionKind !== "review" && <Button size="sm" variant="outline" className="text-xs h-7 px-3">Dismiss</Button>}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ActivityDetailTab({ agentId }: { agentId: string }) {
  const runs = ALL_RUNS.filter(r => r.agentId === agentId)
  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Activity className="h-6 w-6 text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">No runs yet</p>
      </div>
    )
  }
  return (
    <div className="space-y-2">
      <p className="text-lg font-semibold text-foreground mb-3">Recent runs</p>
      {runs.map((run, i) => <RunRow key={run.id} run={run} defaultOpen={i === 0 && run.status === "complete"} />)}
    </div>
  )
}

function AgentDetailPanel({ agent }: { agent: AgentDef }) {
  const [tab, setTab] = React.useState("about")
  const Icon = agent.icon

  if (!agent.available) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-64 text-center px-6">
        <div className="h-12 w-12 rounded-2xl bg-muted/60 border border-border/50 flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-muted-foreground/50" />
        </div>
        <p className="text-base font-medium text-foreground mb-1">{agent.name}</p>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs leading-relaxed">{agent.description}</p>
        <Badge variant="secondary" className="gap-1">
          <Lock className="h-3 w-3" />
          Coming Soon
        </Badge>
      </div>
    )
  }

  const stats = AGENT_STATS[agent.id] ?? []

  return (
    <div className="flex flex-col h-full">
      {/* Agent header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xl font-semibold text-foreground">{agent.name}</p>
            {agent.active && (
              <Badge className="bg-success/15 text-success border-success/20 text-xs h-5 px-2">Active</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 truncate">{agent.tagline}</p>
        </div>
      </div>

      {/* Stats */}
      {stats.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-5">
          {stats.map(s => (
            <div key={s.label} className="rounded-xl bg-muted/40 border border-border/60 px-3 py-3 text-center">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
              <p className="text-2xl font-medium text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <ToggleGroup
        type="single"
        value={tab}
        onValueChange={v => v && setTab(v as string)}
        className={cn(FILTER_TAB_GROUP_CLS, "w-full mb-5")}
      >
        <ToggleGroupItem value="about"    size="sm" className={cn(FILTER_TAB_ITEM_CLS, "flex-1 text-sm")}>About</ToggleGroupItem>
        <ToggleGroupItem value="activity" size="sm" className={cn(FILTER_TAB_ITEM_CLS, "flex-1 text-sm")}>Activity</ToggleGroupItem>
      </ToggleGroup>

      <div className="flex-1 overflow-y-auto">
        {tab === "activity" && <ActivityDetailTab agentId={agent.id} />}
        {tab === "about"    && <AboutTab agent={agent} />}
      </div>
    </div>
  )
}

// ─── Full Page Activity Tab ───────────────────────────────────────────────────

const PAGE_SIZE = 8

const ACTIVITY_FILTER_DEFS: FilterDef[] = [
  {
    key: "agent",
    label: "Agent",
    options: AGENTS.map(a => ({ label: a.name, value: a.id })),
  },
  {
    key: "status",
    label: "Status",
    options: [
      { label: "Complete", value: "complete" },
      { label: "Running",  value: "running"  },
      { label: "Queued",   value: "pending"  },
    ],
  },
]

function FullActivityTab() {
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({})
  const [page, setPage] = React.useState(0)

  function toggleFilter(key: string, value: string) {
    setActiveFilters(f => toggleFilterValue(f, key, value))
  }
  function clearFilter(key: string) {
    setActiveFilters(f => clearFilterKey(f, key))
  }
  function clearAll() { setActiveFilters({}) }

  const filtered = ALL_RUNS.filter(r => {
    const agents   = activeFilters["agent"]  ?? []
    const statuses = activeFilters["status"] ?? []
    return (agents.length   === 0 || agents.includes(r.agentId)) &&
           (statuses.length === 0 || statuses.includes(r.status))
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  React.useEffect(() => { setPage(0) }, [activeFilters])

  return (
    <div className="rounded-2xl bg-card/70 backdrop-blur-md p-5">
      {/* Header */}
      <div className="mb-5">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">Activity</p>
        <h2 className="text-xl font-semibold text-foreground">Recent agent runs</h2>
      </div>

      {/* Filters */}
      <div className="mb-5">
        <FilterBar
          filters={ACTIVITY_FILTER_DEFS}
          active={activeFilters}
          onToggle={toggleFilter}
          onClear={clearFilter}
          onClearAll={clearAll}
        />
      </div>

      {/* Runs */}
      <div className="flex flex-col gap-2 mb-4">
        {paged.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-sm text-muted-foreground">No runs match the current filters</p>
          </div>
        ) : (
          paged.map(run => <RunRow key={run.id} run={run} />)
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border/60">
          <p className="text-xs text-muted-foreground">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} runs
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AgentsPage({ className, defaultAgentId }: { className?: string; defaultAgentId?: string }) {
  const [tab, setTab] = React.useState("catalog")
  const [selectedId, setSelectedId] = React.useState<string | null>(defaultAgentId ?? null)
  const [mobileShowDetail, setMobileShowDetail] = React.useState(false)

  const selectedAgent = AGENTS.find(a => a.id === selectedId) ?? AGENTS[0]

  function selectAgent(id: string) {
    setSelectedId(id)
    setMobileShowDetail(true)
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>

      {/* Top bar */}
      <div className="flex items-center gap-3">
        {/* Mobile back button */}
        {mobileShowDetail && tab === "catalog" && (
          <Button variant="ghost" size="sm" className="md:hidden gap-1.5 -ml-1 shrink-0"
            onClick={() => setMobileShowDetail(false)}>
            <ArrowLeft className="h-4 w-4" />
            Agents
          </Button>
        )}
        <ToggleGroup type="single" value={tab} onValueChange={v => v && setTab(v as string)}
          className={cn(FILTER_TAB_GROUP_CLS, mobileShowDetail && "hidden md:flex")}>
          <ToggleGroupItem value="catalog"  size="sm" className={cn(FILTER_TAB_ITEM_CLS, "text-sm")}>Agents</ToggleGroupItem>
          <ToggleGroupItem value="activity" size="sm" className={cn(FILTER_TAB_ITEM_CLS, "text-sm")}>Activity</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {tab === "activity" && <FullActivityTab />}

      {tab === "catalog" && (
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] grid-rows-[1fr] gap-4 flex-1 min-h-0">

          {/* ── Left: Agent list (hidden on mobile when detail is showing) ── */}
          <div className={cn(
            "rounded-2xl bg-card/70 backdrop-blur-md p-4 flex flex-col gap-1 min-h-0 overflow-y-auto",
            mobileShowDetail ? "hidden md:flex" : "flex"
          )}>
            {AGENTS.map(agent => (
              <AgentListItem
                key={agent.id}
                agent={agent}
                selected={selectedAgent?.id === agent.id}
                onSelect={() => selectAgent(agent.id)}
              />
            ))}
          </div>

          {/* ── Right: Agent detail (hidden on mobile when list is showing) ── */}
          <div className={cn(
            "rounded-2xl bg-card/70 backdrop-blur-md p-5 overflow-y-auto min-h-0",
            mobileShowDetail ? "flex flex-col" : "hidden md:flex md:flex-col"
          )}>
            <AgentDetailPanel key={selectedAgent?.id} agent={selectedAgent!} />
          </div>

        </div>
      )}
    </div>
  )
}
