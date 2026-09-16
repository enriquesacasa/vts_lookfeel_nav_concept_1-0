import * as React from "react"
import { AgentBtn } from "@/components/agent-btn"
import { AppNav } from "@/components/app-nav"
import { BuildingHeader } from "@/components/building-header"
import { AvailabilityOverview } from "@/components/availability-overview"
import type { VacantSpace } from "@/components/availability-overview"
import { LeasingActivity } from "@/components/leasing-activity"
import { CriticalDates } from "@/components/critical-dates"
import type { CriticalDate } from "@/components/critical-dates"
import { FinancialPerformance } from "@/components/financial-performance"
import { ActionLevers } from "@/components/action-levers"
import { DealActions } from "@/components/deal-actions"
import { PortfolioGrid } from "@/components/portfolio-grid"
import { KpiBar } from "@/components/kpi-bar"
import { AgentsPage } from "@/components/agents-page"
import { DealsPage, DEALS, DealHealthModal } from "@/components/deals-page"
import type { Deal as DealsPageDeal } from "@/components/deals-page"
import { DealProfile, TenantLogoImage, getDealHealth, type DealStatus } from "@/components/deal-profile"
import { ThemeShowcase } from "@/components/theme-showcase"
import { AgentPrinciples } from "@/components/agent-principles"
import { StackingPlan, type StackingPlanSpaceRef, type StackingPlanHandle, type StackingPlanCommand } from "@/components/stacking-plan"
import { SpacesPage, type Space as SpacesPageSpace } from "@/components/spaces-page"
import { SpaceDetailPage, SpaceStatusBadge, type SpaceRef, type SpaceStatus } from "@/components/space-detail-page"
import { PageBreadcrumb } from "@/components/page-breadcrumb"
import { LeasesPage, LEASES, type Lease } from "@/components/leases-page"
import { LeaseDetailPage, LeaseStatusBadge, type LeaseStatus } from "@/components/lease-detail-page"
import { EmailFlow } from "@/components/email-flow"
import { AskVTSPage } from "@/components/ask-vts"
import { DocumentAgentPage } from "@/components/document-agent-page"
import { ProposalBuilderPage } from "@/components/proposal-builder-page"
import { DealStewardPage } from "@/components/deal-steward-page"
import { AmPipelineEmailPage, BrokerActionEmailPage, TenantFollowupEmailPage, LawyerLeaseEmailPage, OwnerUpdateEmailPage } from "@/components/deal-steward-emails"
import { OptionsRightsPage } from "@/components/options-rights-page"
import { CriticalDatesPage } from "@/components/critical-dates-page"
import { BudgetsPage } from "@/components/budgets-page"
import { AppraisalsPage } from "@/components/appraisals-page"
import { CompsPage } from "@/components/comps-page"
import { PlanningPage } from "@/components/planning-page"
import { DealTasksPage } from "@/components/deal-tasks-page"
import { ChatPatternProvider, type ChatCommand } from "@/contexts/chat-pattern"
import { ChatSideOver } from "@/components/chat-side-over"
import { ChatSidePush, SIDE_PUSH_WIDTH } from "@/components/chat-side-push"
import { useChatPattern } from "@/contexts/chat-pattern"

const STACKING_COMMANDS: ChatCommand[] = [
  { label: "Fast-forward 18 months", reply: "Showing the stacking plan 18 months from now. Several leases expire in this window.", cmd: { type: "setSliderMonths", months: 18 } },
  { label: "Show 2028 expirations", reply: "Filtered to spaces expiring in 2028. Three tenants are in their renewal windows.", cmd: { type: "replaceFilters", filters: { expBucket: ["2028"] } } },
  { label: "Show vacant spaces", reply: "Filtered to all currently vacant spaces across the building.", cmd: { type: "replaceFilters", filters: { occupancy: ["vacant"] } } },
  { label: "Show near-term renewal risks", reply: "Filtered to leases expiring in 2027 and 2028. Five tenants are within their renewal windows — I'd recommend initiating outreach for Pacific Wealth, Meridian Health, and Carlyle first given their encumbrance positions.", cmd: { type: "replaceFilters", filters: { expBucket: ["2027", "2028"] } } },
]

// Maps stacking-plan display names → standardized LEASES tenant names
const TENANT_ALIAS: Record<string, string> = {
  "Blackstone Group":         "Blackstone Inc.",
  "Vantage Point Capital":    "Vantage Point Capital LP",
  "Amazon MGM Studios":       "Amazon.com Inc.",
  "Sullivan & Cromwell":      "Sullivan & Cromwell LLP",
  "Pacific Wealth Mngt.":     "Pacific Wealth Management LLC",
  "Meridian Health Partners": "Meridian Health Partners Inc.",
  "Carlyle & Associates":     "The Carlyle Group Inc.",
  "CVS Health":               "CVS Health Corporation",
}
function findLease(tenant: string, assetName?: string) {
  const key = TENANT_ALIAS[tenant] ?? tenant
  if (assetName) return LEASES.find(x => x.tenant === key && x.asset === assetName) ?? LEASES.find(x => x.tenant === key)
  return LEASES.find(x => x.tenant === key)
}

function AgentsViewAwareNav(props: React.ComponentProps<typeof AppNav>) {
  const { agentsView } = useChatPattern()
  return <AppNav {...props} hideAgentsPage={agentsView === "ask-vts"} />
}

function SidePushMain({ children, navCollapsed }: { children: React.ReactNode; navCollapsed: boolean }) {
  const { sidePushOpen } = useChatPattern()
  return (
    <main
      className={cn(
        "transition-all duration-300 ease-in-out pr-4 pb-4 overflow-x-hidden flex-1 flex flex-col overflow-y-auto",
        "pt-[72px] pl-4",
        navCollapsed ? "md:pt-4 md:pl-[104px]" : "md:pt-4 md:pl-[264px]"
      )}
      style={sidePushOpen ? { paddingRight: SIDE_PUSH_WIDTH + 16 } : undefined}
    >
      {children}
    </main>
  )
}
import { cn } from "@/lib/utils"
import { type LucideIcon, UserCircle, BellRing, Activity } from "lucide-react"
import buildingImg from "@/assets/building.jpg"

function GlobalPlaceholderPage({ icon: Icon, title, description }: {
  icon: LucideIcon
  title: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 rounded-2xl bg-card/70 backdrop-blur-md border border-border/70 min-h-[calc(100vh-1rem)]">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
        <Icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
      </div>
      <h1 className="text-2xl font-medium text-foreground mb-2">{title}</h1>
      <p className="text-sm text-muted-foreground max-w-xs">{description ?? "This page is a placeholder. Content coming soon."}</p>
    </div>
  )
}

const ASSET_MARKET: Record<string, string> = {
  "vts-tower":     "New York",
  "one-financial": "Providence",
  "empire-state":  "New York",
  "salesforce":    "San Francisco",
  "willis":        "Chicago",
  "hudson-yards":  "New York",
  "one-wtc":       "New York",
  "transamerica":  "San Francisco",
  "peachtree":     "Atlanta",
  "union-square":  "Seattle",
  "200-berkeley":  "Boston",
}

const PILL_BASE = "inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-1 text-sm font-medium tabular-nums transition-colors cursor-pointer select-none hover:bg-primary/20"

function HeaderPill({ label, items, onItemClick }: {
  label: string
  items: string[]
  onItemClick?: (index: number) => void
}) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <span className={PILL_BASE} onClick={() => setOpen(o => !o)}>{label}</span>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 min-w-52 rounded-xl border border-sidebar-border bg-sidebar shadow-xl shadow-black/40 overflow-hidden flex flex-col">
          {items.map((item, i) => (
            <button
              key={item}
              className={cn(
                "w-full text-left px-3 py-2 text-sm transition-colors",
                onItemClick
                  ? "text-sidebar-foreground hover:bg-sidebar-accent/60"
                  : "text-sidebar-foreground/80 cursor-default"
              )}
              onClick={() => { if (onItemClick) { onItemClick(i); setOpen(false) } }}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function MultiImage({ assetIds }: { assetIds: string[] }) {
  const ids = assetIds.slice(0, 4)
  return (
    <div className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 grid grid-cols-2 gap-px rounded-xl overflow-hidden">
      {ids.map(id => (
        <img key={id} src={ASSET_DETAILS[id]?.image} alt="" className="w-full h-full object-cover" />
      ))}
    </div>
  )
}

export const ASSETS = [
  { id: "vts-tower",     name: "VTS Tower Headquarters",  address: "114 West 41st Street, New York, NY 10036" },
  { id: "one-financial", name: "One Financial Plaza",      address: "1 Financial Plaza, Providence, RI 02903" },
  { id: "empire-state",  name: "Empire State Building",    address: "350 5th Ave, New York, NY 10118" },
  { id: "salesforce",    name: "Salesforce Tower",         address: "415 Mission St, San Francisco, CA 94105" },
  { id: "willis",        name: "Willis Tower",             address: "233 S Wacker Dr, Chicago, IL 60606" },
  { id: "hudson-yards",  name: "30 Hudson Yards",          address: "30 Hudson Yards, New York, NY 10001" },
  { id: "one-wtc",       name: "One World Trade Center",   address: "285 Fulton St, New York, NY 10007" },
  { id: "transamerica",  name: "Transamerica Pyramid",     address: "600 Montgomery St, San Francisco, CA 94111" },
  { id: "peachtree",     name: "One Peachtree Center",     address: "303 Peachtree St NE, Atlanta, GA 30308" },
  { id: "union-square",  name: "Two Union Square",         address: "601 Union St, Seattle, WA 98101" },
  { id: "200-berkeley",  name: "200 Berkeley Street",      address: "200 Berkeley St, Boston, MA 02116" },
]

export const PORTFOLIOS = [
  { id: "northeast",   name: "Northeast Corridor",  assetIds: ["vts-tower", "one-financial", "empire-state", "one-wtc", "200-berkeley"] },
  { id: "west-coast",  name: "West Coast Portfolio", assetIds: ["salesforce", "transamerica", "union-square"] },
  { id: "midwest",     name: "Midwest Holdings",     assetIds: ["willis", "hudson-yards", "peachtree"] },
]

export const ASSET_DETAILS: Record<string, { city: string; image: string }> = {
  "vts-tower":     { city: "Built 2017 · 52 floors · Office",   image: "https://images.unsplash.com/photo-1631085474949-d8a367d9d26d?w=800&h=500&fit=crop&crop=top&auto=format" },
  "one-financial": { city: "Built 1992 · 36 floors · Office",   image: "https://images.unsplash.com/photo-1554435493-93422e8220c8?w=800&h=500&fit=crop&auto=format" },
  "empire-state":  { city: "Built 1931 · 102 floors · Office",  image: "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?w=800&h=500&fit=crop&auto=format" },
  "salesforce":    { city: "Built 2018 · 61 floors · Office",   image: "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?w=800&h=500&fit=crop&auto=format" },
  "willis":        { city: "Built 1973 · 110 floors · Office",  image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=500&fit=crop&auto=format" },
  "hudson-yards":  { city: "Built 2019 · 73 floors · Office",   image: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&h=500&fit=crop&auto=format" },
  "one-wtc":       { city: "Built 2014 · 104 floors · Office",  image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=800&h=500&fit=crop&auto=format" },
  "transamerica":  { city: "Built 1972 · 48 floors · Office",   image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=500&fit=crop&auto=format" },
  "peachtree":     { city: "Built 1992 · 60 floors · Office",   image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=500&fit=crop&auto=format" },
  "union-square":  { city: "Built 1989 · 56 floors · Office",   image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop&auto=format" },
  "200-berkeley":  { city: "Built 1947 · 28 floors · Office",   image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop&auto=format" },
}

export const ASSET_KPIS: Record<string, {
  occupancy: number; avgNer: string; nerBudgetDelta: string; nerBudgetUp: boolean;
  expiring12mo: number; activeDeals: number; alert?: string
}> = {
  "vts-tower":     { occupancy: 70, avgNer: "$74/sf", nerBudgetDelta: "+9.4%", nerBudgetUp: true,  expiring12mo: 3, activeDeals: 6 },
  "one-financial": { occupancy: 88, avgNer: "$43/sf", nerBudgetDelta: "+2.1%", nerBudgetUp: true,  expiring12mo: 1, activeDeals: 2 },
  "empire-state":  { occupancy: 94, avgNer: "$57/sf", nerBudgetDelta: "-1.3%", nerBudgetUp: false, expiring12mo: 5, activeDeals: 4, alert: "2 options expiring" },
  "salesforce":    { occupancy: 82, avgNer: "$88/sf", nerBudgetDelta: "+5.7%", nerBudgetUp: true,  expiring12mo: 2, activeDeals: 3 },
  "willis":        { occupancy: 76, avgNer: "$46/sf", nerBudgetDelta: "-3.1%", nerBudgetUp: false, expiring12mo: 4, activeDeals: 1, alert: "Below occupancy target" },
  "hudson-yards":  { occupancy: 97, avgNer: "$83/sf", nerBudgetDelta: "+11.2%", nerBudgetUp: true, expiring12mo: 0, activeDeals: 5 },
  "one-wtc":       { occupancy: 91, avgNer: "$76/sf", nerBudgetDelta: "+3.8%", nerBudgetUp: true,  expiring12mo: 2, activeDeals: 2 },
  "transamerica":  { occupancy: 68, avgNer: "$38/sf", nerBudgetDelta: "-6.5%", nerBudgetUp: false, expiring12mo: 6, activeDeals: 3, alert: "High vacancy risk" },
  "peachtree":     { occupancy: 85, avgNer: "$33/sf", nerBudgetDelta: "+1.9%", nerBudgetUp: true,  expiring12mo: 1, activeDeals: 0 },
  "union-square":  { occupancy: 93, avgNer: "$56/sf", nerBudgetDelta: "+4.4%", nerBudgetUp: true,  expiring12mo: 3, activeDeals: 4 },
  "200-berkeley":  { occupancy: 79, avgNer: "$71/sf", nerBudgetDelta: "-0.8%", nerBudgetUp: false, expiring12mo: 2, activeDeals: 1 },
}

const _expiring12mo = LEASES.filter(l => l.remaining > 0 && l.remaining <= 12)
const _expiringSf   = _expiring12mo.reduce((a, l) => a + l.sf, 0)
const _lateStage    = DEALS.filter(d => ["LOI", "Legal", "Lease Out"].includes(d.stage) && d.status !== "executed")
const _lateStageNer = _lateStage.filter(d => d.ner > 0).reduce((a, d) => a + (d.ner * d.sf) / 12, 0)

const KPIS = [
  { label: "Avg NER",                value: "$74/sf",   subtitle: "+9.4% vs budget", trend: "up" as const },
  {
    label: "Expiring leases (12mo)",
    value: String(_expiring12mo.length),
    subtitle: `${(_expiringSf / 1000).toFixed(0)}K sf at risk`,
    trend: _expiring12mo.length > 3 ? "down" as const : undefined,
  },
  {
    label: "Late-stage deals",
    value: String(_lateStage.length),
    subtitle: `$${(_lateStageNer / 1000).toFixed(0)}K/mo projected NER`,
    trend: "up" as const,
  },
  { label: "WALT", value: "4.2 yrs", subtitle: "Weighted avg lease" },
]




const CRITICAL_DATES: CriticalDate[] = [
  { tenant: "Pfizer",              asset: "VTS Tower Headquarters", type: "Lease Expiration",              space: "Suite 1200",   sf: 117000, date: "Sep 15, 2026", monthsOut: 2,  category: "expiring" },
  { tenant: "Morgan Stanley",      asset: "VTS Tower Headquarters", type: "Lease Expiration",              space: "Floors 8–11",  sf: 116000, date: "Nov 1, 2026",  monthsOut: 4,  category: "expiring" },
  { tenant: "Deloitte LLP",        asset: "VTS Tower Headquarters", type: "Rent Commencement Date",        space: "Suite 500",    sf: 43000,  date: "Dec 1, 2026",  monthsOut: 5,  category: "expiring" },
  { tenant: "KPMG",                asset: "VTS Tower Headquarters", type: "Renewal Window Opens",          space: "Suite 3400",   sf: 117000, date: "Jan 31, 2027", monthsOut: 6,  category: "renewal"  },
  { tenant: "Ernst & Young",       asset: "One Financial Plaza",    type: "Contraction Option Deadline",   space: "Suite 2200",   sf: 80100,  date: "Mar 1, 2027",  monthsOut: 8,  category: "options"  },
  { tenant: "HSBC Holdings",       asset: "One Financial Plaza",    type: "ROFO Latest Notice Date",       space: "Suite 900",    sf: 69300,  date: "Apr 15, 2027", monthsOut: 9,  category: "options"  },
  { tenant: "Latham & Watkins",    asset: "Willis Tower",           type: "Renewal Window Opens",          space: "Floors 14–15", sf: 119000, date: "May 1, 2027",  monthsOut: 10, category: "renewal"  },
  { tenant: "JPMorgan Chase",      asset: "Willis Tower",           type: "Expansion Option Deadline",     space: "Floor 6",      sf: 55800,  date: "Jun 30, 2027", monthsOut: 11, category: "options"  },
]

const VACANT_SPACES: VacantSpace[] = [
  { space: "Suite 2100",  sf: 34200, daysVacant: 210 },
  { space: "Suite 1800",  sf: 33000, daysVacant: 145 },
  { space: "Suite 500",   sf: 43000, daysVacant: 62  },
  { space: "Floors 9–10", sf: 88000, daysVacant: 30  },
]

export default function App() {
  const [navCollapsed, setNavCollapsed] = React.useState(false)
  function parseHash() {
    const raw = window.location.hash.replace(/^#\//, "")
    const [pathPart, queryPart] = raw.split("?")
    const parts = pathPart.split("/")
    const page = parts[0] || "dashboard"
    const asset = parts[1] || "vts-tower"
    const params = new URLSearchParams(queryPart ?? "")
    return { page, asset, dealId: params.get("deal"), agentId: params.get("agent"), view: params.get("view") }
  }

  const programmaticNav = React.useRef(false)
  const [selectedAssetId, setSelectedAssetId] = React.useState(() => parseHash().asset)
  const [currentPage, setCurrentPage] = React.useState(() => parseHash().page)
  const [defaultAgentId, setDefaultAgentId] = React.useState(() => parseHash().agentId ?? undefined)
  const [agentView, setAgentView] = React.useState<"list" | "grid">(() => parseHash().view === "grid" ? "grid" : "list")
  const [selectedDeal, setSelectedDeal] = React.useState<DealsPageDeal | null>(() => {
    const { dealId } = parseHash()
    return dealId ? (DEALS.find(d => d.id === dealId) ?? null) : null
  })
  const [selectedDealStatus, setSelectedDealStatus] = React.useState<DealStatus>("active")
  const [selectedDealInitialTab, setSelectedDealInitialTab] = React.useState<string | undefined>(undefined)
  React.useEffect(() => {
    if (selectedDeal) setSelectedDealStatus(selectedDeal.status as DealStatus)
  }, [selectedDeal])
  const [pipelineToast, setPipelineToast] = React.useState(() => parseHash().dealId === "d00")
  const [selectedSpace, setSelectedSpace] = React.useState<SpaceRef | null>(null)
  const [selectedSpaceStatus, setSelectedSpaceStatus] = React.useState<SpaceStatus>("Available")
  const [selectedLease, setSelectedLease] = React.useState<Lease | null>(null)
  const [selectedLeaseStatus, setSelectedLeaseStatus] = React.useState<LeaseStatus>("Active")
  const [askVtsKey, setAskVtsKey] = React.useState(0)
  const [overviewHealthOpenId, setOverviewHealthOpenId] = React.useState<string | null>(null)
  const stackingPlanRef = React.useRef<StackingPlanHandle>(null)
  useChatPattern()
  const [isDark, setIsDark] = React.useState(() => document.documentElement.classList.contains("dark"))

  React.useEffect(() => {
    const globalPages = ["ai", "theme", "principles", "activity", "reminders", "avatar", "inquiry-email", "inquiry-email-forward", "inquiry-email-confirm", "ask-vts", "document-agent", "proposal-builder", "deal-monitor", "deal-monitor-email-am", "deal-monitor-email-broker", "deal-monitor-email-tenant", "deal-monitor-email-lawyer", "deal-monitor-email-owner"]
    let base = globalPages.includes(currentPage)
      ? `/${currentPage}`
      : `/${currentPage}/${selectedAssetId}`
    const params: string[] = []
    if (selectedDeal) params.push(`deal=${selectedDeal.id}`)
    if (currentPage === "ai" && agentView === "grid") params.push("view=grid")
    if (params.length) base += `?${params.join("&")}`
    if (window.location.hash !== `#${base}`) {
      programmaticNav.current = true
      window.location.hash = base
    }
  }, [currentPage, selectedAssetId, selectedDeal, agentView])

  React.useEffect(() => {
    if (pipelineToast) {
      const t = setTimeout(() => setPipelineToast(false), 3000)
      return () => clearTimeout(t)
    }
  }, [pipelineToast])

  React.useEffect(() => {
    const onHashChange = () => {
      if (programmaticNav.current) { programmaticNav.current = false; return }
      const { page, asset, dealId, agentId } = parseHash()
      setCurrentPage(page)
      if (page === "spaces") setSelectedSpace(null)
      if (page === "leases") setSelectedLease(null)
      setSelectedAssetId(asset)
      setDefaultAgentId(agentId ?? undefined)
      if (dealId) {
        const deal = DEALS.find(d => d.id === dealId) ?? null
        setSelectedDeal(deal)
        if (dealId === "d00") setPipelineToast(true)
      } else {
        setSelectedDeal(null)
      }
    }
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  const goAskVts = React.useCallback(() => {
    setCurrentPage("ask-vts")
    setAskVtsKey(k => k + 1)
  }, [])

  const toggleDark = () => {
    setIsDark(d => {
      const next = !d
      document.documentElement.classList.toggle("dark", next)
      return next
    })
  }

  const PAGE_LABELS: Record<string, string> = {
    "dashboard": "Overview",
    "stacking": "Stacking plan", "spaces": "Spaces",
    "leases": "Leases", "critical-dates": "Critical dates", "options-rights": "Options & rights", "tenants": "Tenants",
    "deals": "Deals", "deal-tasks": "Deal tasks", "tenant-coord": "Tenant coordination", "requirements": "Requirements",
    "planning": "Planning", "budgets": "Budgets", "appraisals": "Appraisals", "comps": "Comps", "doc-vault": "Doc vault",
    "market": "Market", "buildings": "Buildings", "listings": "Listings", "tourbooks": "My tourbooks",
    "shares": "My shares", "marketing-analytics": "Marketing analytics", "inquiries": "Inquiries",
    "insights": "Insights", "leasing-activity": "Leasing activity report", "portfolio-dashboards": "Portfolio dashboards",
    "portfolio-alerts": "Portfolio alerts", "portfolio-reports": "Portfolio reports", "lease-charts": "Lease charts",
    "abstraction": "Abstraction", "activity": "Activity feed", "reminders": "Reminders",
    "assets": "Assets", "markets": "Markets", "cities": "Cities",
    "ai": "VTS Agents",
  }

  const selectedPortfolio = PORTFOLIOS.find(p => p.id === selectedAssetId)
  const selectedAsset = ASSETS.find(a => a.id === selectedAssetId)
  const isMultiAsset = selectedAssetId === "all" || !!selectedPortfolio

  // Asset names currently in scope — used to scope asset filter options on list pages
  const allowedAssets: string[] = React.useMemo(() => {
    if (selectedAssetId === "all") return ASSETS.map(a => a.name)
    if (selectedPortfolio) return ASSETS.filter(a => selectedPortfolio.assetIds.includes(a.id)).map(a => a.name)
    if (selectedAsset) return [selectedAsset.name]
    return ASSETS.map(a => a.name)
  }, [selectedAssetId, selectedPortfolio, selectedAsset])

  // Maps App asset IDs → names used in budget/appraisal data
  const PLANNING_ASSET_NAMES: Record<string, string> = {
    "vts-tower":     "VTS Tower HQ",
    "salesforce":    "Salesforce Tower",
    "one-financial": "One Financial Plaza",
    "empire-state":  "Empire State Bldg",
    "willis":        "Willis Tower",
    "hudson-yards":  "30 Hudson Yards",
    "one-wtc":       "One World Trade Ctr",
    "transamerica":  "Transamerica Pyramid",
    "200-berkeley":  "200 Berkeley St",
    "peachtree":     "One Peachtree Ctr",
    "union-square":  "Two Union Square",
  }
  // Maps App asset IDs → city substrings used to filter comps by citySubmarket
  const PLANNING_CITY_PREFIXES: Record<string, string[]> = {
    "vts-tower":     ["New York"],
    "salesforce":    ["San Francisco"],
    "one-financial": ["Boston", "Providence"],
    "empire-state":  ["New York"],
    "willis":        ["Chicago"],
    "one-wtc":       ["New York"],
    "200-berkeley":  ["Boston"],
    "hudson-yards":  ["New York"],
    "transamerica":  ["San Francisco"],
    "union-square":  ["Seattle"],
    "peachtree":     ["Atlanta"],
  }

  const assetFilter: string[] = React.useMemo(() => {
    if (selectedAssetId === "all") return []
    if (selectedPortfolio) return selectedPortfolio.assetIds.map(id => PLANNING_ASSET_NAMES[id]).filter((v): v is string => !!v)
    if (selectedAsset) { const n = PLANNING_ASSET_NAMES[selectedAsset.id]; return n ? [n] : [] }
    return []
  }, [selectedAssetId, selectedPortfolio, selectedAsset])

  const cityFilter: string[] = React.useMemo(() => {
    if (selectedAssetId === "all") return []
    if (selectedPortfolio) return [...new Set(selectedPortfolio.assetIds.flatMap(id => PLANNING_CITY_PREFIXES[id] ?? []))]
    if (selectedAsset) return PLANNING_CITY_PREFIXES[selectedAsset.id] ?? []
    return []
  }, [selectedAssetId, selectedPortfolio, selectedAsset])

  const renderPage = (page: string) => {
    if (page === "theme") {
      return <ThemeShowcase isDark={isDark} onToggleDark={toggleDark} />
    }

    if (page === "principles") {
      return <AgentPrinciples isDark={isDark} onToggleDark={toggleDark} />
    }

    if (page === "avatar")    return <GlobalPlaceholderPage icon={UserCircle} title="Profile" />
    if (page === "reminders") return <GlobalPlaceholderPage icon={BellRing}    title="Reminders" />
    if (page === "activity")  return <GlobalPlaceholderPage icon={Activity}    title="Activity Feed" />

    if (page === "ask-vts") return <AskVTSPage className="h-[calc(100vh-2rem)] flex-1" newChatKey={askVtsKey} />
    if (page === "inquiry-email") return <EmailFlow step="inbox" />
    if (page === "inquiry-email-forward") return <EmailFlow step="forward" />
    if (page === "inquiry-email-confirm") return <EmailFlow step="confirm" />


    const assetDetail = ASSET_DETAILS[selectedAssetId]

    // Compute header props depending on selection
    const headerProps = (() => {
      if (selectedAssetId === "all") {
        const allMarkets = [...new Set(ASSETS.map(a => ASSET_MARKET[a.id]).filter(Boolean))].sort()
        return {
          city: "Overview",
          name: "All assets",
          address: "",
          image: <MultiImage assetIds={ASSETS.map(a => a.id)} />,
          badges: <>
            <HeaderPill label={`${ASSETS.length} Assets`} items={ASSETS.map(a => a.name)} onItemClick={i => { setSelectedAssetId(ASSETS[i].id); setCurrentPage("dashboard") }} />
            <HeaderPill label={`${allMarkets.length} Markets`} items={allMarkets} />
          </>,
        }
      }
      if (selectedPortfolio) {
        const portfolioAssets = ASSETS.filter(a => selectedPortfolio.assetIds.includes(a.id))
        const portfolioMarkets = [...new Set(selectedPortfolio.assetIds.map(id => ASSET_MARKET[id]).filter(Boolean))].sort()
        return {
          city: "Portfolio",
          name: selectedPortfolio.name,
          address: "",
          image: <MultiImage assetIds={selectedPortfolio.assetIds} />,
          badges: <>
            <HeaderPill label={`${selectedPortfolio.assetIds.length} Assets`} items={portfolioAssets.map(a => a.name)} onItemClick={i => { setSelectedAssetId(portfolioAssets[i].id); setCurrentPage("dashboard") }} />
            <HeaderPill label={`${portfolioMarkets.length} Market${portfolioMarkets.length !== 1 ? "s" : ""}`} items={portfolioMarkets} />
          </>,
        }
      }
      return {
        city: assetDetail?.city ?? "Built 2017 · 52 floors · Office",
        name: selectedAsset?.name ?? "VTS Tower Headquarters",
        address: selectedAsset?.address ?? "114 West 41st Street, New York, NY 10036",
        image: assetDetail?.image ?? buildingImg,
      }
    })()

    // Show "AssetName PageLabel" with page label in mid-grey (includes "Overview" on dashboard)
    const pageLabel = PAGE_LABELS[page]
    const pagedHeaderProps = pageLabel
      ? { ...headerProps, name: (
          <span>
            <span className="font-semibold">{headerProps.name}</span>{" "}
            <span className="text-muted-foreground font-light whitespace-nowrap">| {pageLabel}</span>
          </span>
        )}
      : headerProps

    if (page === "ai") {
      const agentsHeaderProps = {
        ...headerProps,
        image: undefined,
        name: (
          <span className="flex items-center gap-2">
            <svg width="555" height="160" viewBox="0 0 555 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-7 sm:h-8 lg:h-10 w-auto shrink-0">
              <path d="M262.948 37.923L282.271 99.5913L301.591 37.923H321.723L293.26 121.804H270.12L241.889 37.923H262.948Z" fill="currentColor"/>
              <path d="M378.745 55.2793H351.903V37.923H425.601V55.2793H398.645V121.804H378.745V55.2793Z" fill="currentColor"/>
              <path d="M491.06 52.3862C483.422 52.3862 477.756 55.2794 477.756 60.4835C477.756 64.6518 481.688 67.6581 487.475 68.9305L498.928 71.2439C512.464 74.021 529.588 78.1862 529.588 95.7721C529.588 113.358 511.885 123.31 494.416 123.31C472.895 123.31 458.78 112.549 455.771 94.4997H475.441C477.639 103.293 484.581 107.342 494.879 107.342C501.588 107.342 509.224 105.144 509.224 98.2023C509.224 92.7658 502.747 90.1023 493.604 88.1371L483.422 86.0533C469.77 83.1633 457.392 76.6841 457.392 61.6418C457.392 44.519 475.788 36.5351 492.217 36.5351C508.646 36.5351 524.265 43.7095 527.158 62.2215H507.604C505.636 55.9721 499.506 52.3862 491.06 52.3862Z" fill="currentColor"/>
              <path d="M108.553 46.9088L136.165 65.2593L156.596 51.7396L108.553 19.812L108.485 19.8573L60.427 51.7926L80.8551 65.3125L108.485 46.953L108.553 46.9088Z" fill="currentColor"/>
              <path d="M108.47 105.303L25.0786 53.0043V87.8887L108.47 140.187L108.485 140.179L191.889 87.8741V52.9871L108.485 105.293L108.47 105.303Z" fill="currentColor"/>
            </svg>
            <span className="font-light text-muted-foreground">| Agents</span>
          </span>
        ),
        address: undefined,
        city: undefined,
      }
      return (
        <div className="flex flex-col gap-4 h-[calc(100vh-2rem)]">
          <BuildingHeader {...agentsHeaderProps} />
          <AgentsPage className="flex-1 min-h-0" defaultAgentId={defaultAgentId} defaultView={agentView} onViewChange={setAgentView} />
        </div>
      )
    }

    if (page === "deals") {
      const dealHeaderProps = selectedDeal ? {
        city: selectedDeal.asset,
        name: (<span><span className="font-semibold">{selectedDeal.tenant}</span>{" "}<span className="text-muted-foreground font-light">| {selectedDeal.dealType}</span></span>),
        address: [selectedDeal.space, `${selectedDeal.sf.toLocaleString()} sf`].filter(Boolean).join(" · "),
        image: <div className="relative shrink-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden border border-border/30 shadow-sm"><TenantLogoImage name={selectedDeal.tenant} /></div>,
        actions: (
          <div className="flex items-center gap-2">
            <AgentBtn className="!size-9" entity="Deal" label={`${selectedDeal.tenant} — ${selectedDeal.stage} — ${selectedDealStatus}`} />
          </div>
        ),
      } : pagedHeaderProps
      return (
        <div className="space-y-4">
          {pipelineToast && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg bg-foreground text-background text-sm font-medium shadow-lg pointer-events-none animate-in fade-in slide-in-from-bottom-2">
              Amazon deal added to your pipeline.
            </div>
          )}
          <BuildingHeader {...dealHeaderProps} />
          {selectedDeal && (
            <PageBreadcrumb crumbs={[
              { label: "Deals", onClick: () => { setSelectedDeal(null); setSelectedDealInitialTab(undefined) } },
              { label: selectedDeal.tenant },
            ]} />
          )}
          {selectedDeal
            ? <DealProfile deal={selectedDeal} onBack={() => { setSelectedDeal(null); setSelectedDealInitialTab(undefined) }} status={selectedDealStatus} onStatusChange={setSelectedDealStatus} initialTab={selectedDealInitialTab} onAddProposal={() => setCurrentPage("proposal-builder")} />
            : <DealsPage key={selectedAssetId} onDealClick={(deal, initialTab) => { setSelectedDeal(deal); setSelectedDealInitialTab(initialTab) }} assetContext={isMultiAsset ? undefined : selectedAsset?.name} allowedAssets={isMultiAsset ? allowedAssets : undefined} />
          }
        </div>
      )
    }

    if (page === "dashboard" && (selectedAssetId === "all" || selectedPortfolio)) {
      const visibleAssets = selectedPortfolio
        ? ASSETS.filter(a => selectedPortfolio.assetIds.includes(a.id))
        : ASSETS
      return (
        <div className="space-y-4">
          <BuildingHeader {...pagedHeaderProps} />
          {(() => {
            const visibleAssetNames = new Set(visibleAssets.map(a => a.name))
            const portfolioExpiring = CRITICAL_DATES.filter(d => d.category === "expiring" && d.monthsOut <= 12 && (!d.asset || visibleAssetNames.has(d.asset)))
            const expiringCount = portfolioExpiring.length
            const expiringSf = portfolioExpiring.reduce((s, d) => s + d.sf, 0)
            const expiringSfStr = expiringSf >= 1000000 ? `${(expiringSf / 1000000).toFixed(1)}M sf` : `${Math.round(expiringSf / 1000)}K sf`
            const portfolioDeals = DEALS.filter(d => visibleAssetNames.has(d.asset))
            const portfolioAtRisk = portfolioDeals.filter(d => getDealHealth(d.id, d.stage as any).score === "at-risk")
            const portfolioCaution = portfolioDeals.filter(d => getDealHealth(d.id, d.stage as any).score === "caution")
            const portfolioNeedAttention = portfolioAtRisk.length + portfolioCaution.length
            return (
              <KpiBar kpis={[
                { label: "Avg portfolio NER",  value: "$62/sf",  subtitle: "+4.2% vs budget",  trend: "up" as const },
                { label: "Occupancy",          value: "91.4%",  subtitle: "+0.8% vs budget",  trend: "up" as const },
                { label: "Expiring < 12 mo",   value: `${expiringCount} lease${expiringCount !== 1 ? "s" : ""}`, subtitle: expiringSf > 0 ? expiringSfStr : "None expiring", trend: expiringCount > 2 ? "down" as const : undefined },
                {
                  label: "Need attention",
                  value: `${portfolioNeedAttention} deal${portfolioNeedAttention !== 1 ? "s" : ""}`,
                  subtitleNode: (
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      {portfolioAtRisk.length > 0 && (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border border-destructive/20 text-destructive bg-destructive/10">{portfolioAtRisk.length} At risk</span>
                      )}
                      {portfolioCaution.length > 0 && (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border border-warning/20 text-warning bg-warning/10">{portfolioCaution.length} Critical</span>
                      )}
                      {portfolioNeedAttention === 0 && <span className="text-xs text-muted-foreground">None</span>}
                    </div>
                  ),
                },
              ]} />
            )
          })()}
          <PortfolioGrid
            assets={visibleAssets}
            deals={DEALS}
            onAssetClick={id => { setSelectedAssetId(id); setCurrentPage("dashboard") }}
          />
        </div>
      )
    }
    if (page === "spaces") {
      const spacesAssets = selectedAssetId === "all"
        ? ASSETS
        : selectedPortfolio
          ? ASSETS.filter(a => selectedPortfolio.assetIds.includes(a.id))
          : selectedAsset ? [selectedAsset] : ASSETS

      const handleSpacesPageClick = (s: SpacesPageSpace) => {
        setSelectedSpace({ suite: s.space, floor: s.floor, sf: s.sf, status: s.status, rent: s.askingRent ?? undefined, condition: s.condition, assetName: selectedAsset?.name })
        setSelectedSpaceStatus((s.status as SpaceStatus) ?? "Available")
      }

      if (selectedSpace) {
        const spaceHeader = {
          ...pagedHeaderProps,
          name: (
            <span>
              <span className="font-semibold">{headerProps.name}</span>{" "}
              <span className="text-muted-foreground font-light whitespace-nowrap">| {selectedSpace.suite}</span>
            </span>
          ),
          actions: (
            <SpaceStatusBadge status={selectedSpaceStatus} onChange={setSelectedSpaceStatus} />
          ),
        }
        return (
          <div className="flex flex-col gap-4" style={{ minHeight: "calc(100vh - 2rem)" }}>
            <BuildingHeader {...spaceHeader} />
            <PageBreadcrumb crumbs={[
              { label: "Spaces", onClick: () => setSelectedSpace(null) },
              { label: selectedSpace.suite },
            ]} />
            <SpaceDetailPage space={selectedSpace} onBack={() => setSelectedSpace(null)} />
          </div>
        )
      }

      return (
        <div className="space-y-4">
          <BuildingHeader {...pagedHeaderProps} />
          <SpacesPage key={selectedAssetId} assets={spacesAssets} onSpaceClick={handleSpacesPageClick} />
        </div>
      )
    }
    if (page === "deal-tasks") {
      return (
        <div className="space-y-4">
          <BuildingHeader {...pagedHeaderProps} />
          <DealTasksPage key={selectedAssetId} onTaskClick={dealId => {
            const deal = DEALS.find(d => d.id === dealId) ?? null
            if (deal) {
              setSelectedDeal(deal)
              setSelectedDealInitialTab("tasks")
              setCurrentPage("deals")
            }
          }} assetContext={isMultiAsset ? undefined : selectedAsset?.name} />
        </div>
      )
    }
    if (page === "leases") {
      if (selectedLease) {
        const leaseHeader = {
          ...pagedHeaderProps,
          city: selectedLease.asset,
          name: (<span><span className="font-semibold">{selectedLease.tenant}</span>{" "}<span className="text-muted-foreground font-light">| Lease</span></span>),
          address: `Suite ${selectedLease.suite} · ${selectedLease.floor} · ${selectedLease.sf.toLocaleString()} sf`,
          image: <div className="relative shrink-0 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden border border-border/30 shadow-sm"><TenantLogoImage name={selectedLease.tenant} /></div>,
          actions: (
            <div className="flex items-center gap-2">
              <LeaseStatusBadge status={selectedLeaseStatus} onChange={setSelectedLeaseStatus} />
              <AgentBtn className="!size-9" entity="Lease" label={`${selectedLease.tenant} · ${selectedLease.asset} · Suite ${selectedLease.suite}`} />
            </div>
          ),
        }
        return (
          <div className="flex flex-col gap-4 min-h-[calc(100vh-2rem)]">
            <BuildingHeader {...leaseHeader} />
            <PageBreadcrumb crumbs={[
              { label: "Leases", onClick: () => setSelectedLease(null) },
              { label: selectedLease.tenant },
            ]} />
            <LeaseDetailPage lease={selectedLease} />
          </div>
        )
      }
      return (
        <div className="space-y-4">
          <BuildingHeader {...pagedHeaderProps} />
          <LeasesPage key={selectedAssetId} onLeaseClick={l => { setSelectedLease(l); setSelectedLeaseStatus(l.status as LeaseStatus) }} assetContext={isMultiAsset ? undefined : selectedAsset?.name} allowedAssets={isMultiAsset ? allowedAssets : undefined} />
        </div>
      )
    }
    if (page === "critical-dates") {
      const cdAssets = selectedAssetId === "all"
        ? ASSETS
        : selectedPortfolio
          ? ASSETS.filter(a => selectedPortfolio.assetIds.includes(a.id))
          : selectedAsset ? [selectedAsset] : ASSETS
      return (
        <div className="space-y-4">
          <BuildingHeader {...pagedHeaderProps} />
          <CriticalDatesPage key={selectedAssetId} assets={cdAssets} onRowClick={tenant => { const l = findLease(tenant, selectedAsset?.name); if (l) { setSelectedLease(l); setSelectedLeaseStatus(l.status as LeaseStatus); setCurrentPage("leases") } }} />
        </div>
      )
    }
    if (page === "options-rights") {
      const optionsAssets = selectedAssetId === "all"
        ? ASSETS
        : selectedPortfolio
          ? ASSETS.filter(a => selectedPortfolio.assetIds.includes(a.id))
          : selectedAsset ? [selectedAsset] : ASSETS
      return (
        <div className="space-y-4">
          <BuildingHeader {...pagedHeaderProps} />
          <OptionsRightsPage key={selectedAssetId} assets={optionsAssets} assetId={selectedAsset?.id} onRowClick={tenant => { const l = findLease(tenant, selectedAsset?.name); if (l) { setSelectedLease(l); setSelectedLeaseStatus(l.status as LeaseStatus); setCurrentPage("leases") } }} />
        </div>
      )
    }
    if (page === "stacking") {
      const handleStackingSpaceClick = (s: StackingPlanSpaceRef) => {
        setSelectedSpace({ suite: s.suite, floor: `Floor ${s.floor}`, sf: s.sf, status: s.status, tenant: s.tenant, rent: s.rent, expiry: s.expiry, assetName: selectedAsset?.name })
        setSelectedSpaceStatus((s.status as SpaceStatus) ?? "Available")
        setCurrentPage("spaces")
      }
      return (
        <div className="flex flex-col flex-1 min-h-0">
          <BuildingHeader {...pagedHeaderProps} onCommand={(cmd) => stackingPlanRef.current?.applyCommand(cmd as StackingPlanCommand)} commandSuggestions={STACKING_COMMANDS} />
          <StackingPlan ref={stackingPlanRef} onSpaceClick={handleStackingSpaceClick} />
        </div>
      )
    }

    if (page === "planning") {
      return (
        <div className="space-y-4">
          <BuildingHeader {...pagedHeaderProps} />
          <PlanningPage
            onViewBudgets={() => setCurrentPage("budgets")}
            onViewAppraisals={() => setCurrentPage("appraisals")}
            onViewComps={() => setCurrentPage("comps")}
            assetFilter={assetFilter}
            cityFilter={cityFilter}
          />
        </div>
      )
    }
    if (page === "budgets") {
      return (
        <div className="space-y-4">
          <BuildingHeader {...pagedHeaderProps} />
          <BudgetsPage assetFilter={assetFilter} />
        </div>
      )
    }
    if (page === "appraisals") {
      return (
        <div className="space-y-4">
          <BuildingHeader {...pagedHeaderProps} />
          <AppraisalsPage assetFilter={assetFilter} />
        </div>
      )
    }
    if (page === "comps") {
      return (
        <div className="space-y-4">
          <BuildingHeader {...pagedHeaderProps} />
          <CompsPage cityFilter={cityFilter} />
        </div>
      )
    }

    if (PAGE_LABELS[page] && page !== "dashboard") {
      return (
        <div className="flex flex-col" style={{minHeight: 'calc(100vh - 2rem)'}}>
          <BuildingHeader {...pagedHeaderProps} />
          <div className="flex flex-col items-center justify-center flex-1 text-center px-4 rounded-2xl bg-white/70 dark:bg-white/8 backdrop-blur-md border border-border/70 mt-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary opacity-60"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/></svg>
            </div>
            <h1 className="text-2xl font-medium text-foreground mb-2">{PAGE_LABELS[page]}</h1>
            <p className="text-sm text-muted-foreground max-w-xs">This page is a placeholder. Content coming soon.</p>
          </div>
        </div>
      )
    }
    return (
      <div className="space-y-4">
        <BuildingHeader {...pagedHeaderProps} />
        <KpiBar kpis={KPIS} />
        {(() => {
          const overviewDeals = selectedAsset ? DEALS.filter(d => d.asset === selectedAsset.name) : DEALS
          const overviewDates = selectedAsset ? CRITICAL_DATES.filter(d => d.asset === selectedAsset.name) : CRITICAL_DATES
          return (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AvailabilityOverview occupiedSf={957638} vacantSf={410416} vacantSpaces={VACANT_SPACES} deals={overviewDeals} onViewStackingPlan={() => setCurrentPage("stacking")} onSpaceClick={v => { setSelectedSpace({ suite: v.space, floor: "–", sf: v.sf, status: "Available", assetName: selectedAsset?.name }); setSelectedSpaceStatus("Available"); setCurrentPage("spaces") }} />
                <FinancialPerformance className="md:col-span-2" criticalDates={overviewDates} deals={overviewDeals} onViewReport={() => setCurrentPage("leases")} onNavigate={setCurrentPage} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LeasingActivity className="md:col-span-2" deals={overviewDeals} onViewAll={() => setCurrentPage("deals")}
                  onDealClick={d => { setSelectedDeal(d); setSelectedDealStatus(d.status as DealStatus); setCurrentPage("deals") }}
                  onHealthClick={id => setOverviewHealthOpenId(id)} />
                <DealActions deals={overviewDeals} />
              </div>
              {overviewHealthOpenId && <DealHealthModal dealId={overviewHealthOpenId} onClose={() => setOverviewHealthOpenId(null)} />}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CriticalDates dates={overviewDates} className="md:col-span-2" onViewAll={() => setCurrentPage("critical-dates")} onRowClick={tenant => { const l = findLease(tenant); if (l) { setSelectedLease(l); setSelectedLeaseStatus(l.status as LeaseStatus); setCurrentPage("leases") } }} />
                <ActionLevers deals={overviewDeals} criticalDates={overviewDates} onNavigate={setCurrentPage} />
              </div>
            </>
          )
        })()}
      </div>
    )
  }

  if (currentPage === "document-agent") {
    return (
      <ChatPatternProvider onOpenChat={goAskVts}>
        <DocumentAgentPage isDark={isDark} onToggleDark={toggleDark} />
      </ChatPatternProvider>
    )
  }

  if (currentPage === "proposal-builder") {
    return <ProposalBuilderPage isDark={isDark} onToggleDark={toggleDark} />
  }

  if (currentPage === "deal-monitor") {
    return (
      <ChatPatternProvider onOpenChat={goAskVts}>
        <DealStewardPage isDark={isDark} onToggleDark={toggleDark} />
      </ChatPatternProvider>
    )
  }

  if (currentPage === "deal-monitor-email-am")     return <AmPipelineEmailPage />
  if (currentPage === "deal-monitor-email-broker")  return <BrokerActionEmailPage />
  if (currentPage === "deal-monitor-email-tenant")  return <TenantFollowupEmailPage />
  if (currentPage === "deal-monitor-email-lawyer")  return <LawyerLeaseEmailPage />
  if (currentPage === "deal-monitor-email-owner")   return <OwnerUpdateEmailPage />

  const standalonePages = ["theme", "principles", "inquiry-email", "inquiry-email-forward", "inquiry-email-confirm"]
  if (standalonePages.includes(currentPage)) {
    return (
      <ChatPatternProvider onOpenChat={goAskVts}>
        <div className="min-h-screen">{renderPage(currentPage)}</div>
        <ChatSideOver />
      </ChatPatternProvider>
    )
  }

  return (
    <ChatPatternProvider onOpenChat={goAskVts}>
      <AppShell
        navCollapsed={navCollapsed}
        setNavCollapsed={setNavCollapsed}
        selectedAssetId={selectedAssetId}
        setSelectedAssetId={setSelectedAssetId}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setSelectedDeal={setSelectedDeal}
        onSpacesNav={() => setSelectedSpace(null)}
        onLeasesNav={() => setSelectedLease(null)}
        setAskVtsKey={setAskVtsKey}
        isDark={isDark}
        toggleDark={toggleDark}
        renderPage={renderPage}
      />
    </ChatPatternProvider>
  )
}

interface AppShellProps {
  navCollapsed: boolean
  setNavCollapsed: (v: boolean) => void
  selectedAssetId: string
  setSelectedAssetId: (id: string) => void
  currentPage: string
  setCurrentPage: (p: string) => void
  setSelectedDeal: (d: null) => void
  onSpacesNav: () => void
  onLeasesNav: () => void
  setAskVtsKey: (fn: (k: number) => number) => void
  isDark: boolean
  toggleDark: () => void
  renderPage: (page: string) => React.ReactNode
}

function AppShell({ navCollapsed, setNavCollapsed, selectedAssetId, setSelectedAssetId, currentPage, setCurrentPage, setSelectedDeal, onSpacesNav, onLeasesNav, setAskVtsKey, isDark, toggleDark, renderPage }: AppShellProps) {
  const { closeSideOver, closeSidePush, sidePushOpen } = useChatPattern()
  React.useEffect(() => {
    closeSideOver()
    closeSidePush()
  }, [currentPage])
  const prevSidePushRef = React.useRef(false)
  React.useEffect(() => {
    if (sidePushOpen && !prevSidePushRef.current) {
      setNavCollapsed(true)
    } else if (!sidePushOpen && prevSidePushRef.current) {
      setNavCollapsed(false)
    }
    prevSidePushRef.current = sidePushOpen
  }, [sidePushOpen])
  const handleNavItemClick = (id: string) => {
    setCurrentPage(id)
    setSelectedDeal(null)
    if (id === "spaces") onSpacesNav()
    if (id === "leases") onLeasesNav()
    if (id === "ask-vts") setAskVtsKey(k => k + 1)
  }
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <AgentsViewAwareNav
        collapsed={navCollapsed}
        onCollapsedChange={setNavCollapsed}
        assets={ASSETS}
        portfolios={PORTFOLIOS}
        selectedAssetId={selectedAssetId}
        onAssetChange={id => {
          const newIsPortfolioOrAll = id === "all" || PORTFOLIOS.some(p => p.id === id)
          if (newIsPortfolioOrAll && currentPage === "stacking") {
            setCurrentPage("dashboard")
          }
          setSelectedAssetId(id)
        }}
        isDark={isDark}
        onLogoClick={toggleDark}
        onNavItemClick={handleNavItemClick}
        activePage={currentPage}
      />
      <SidePushMain navCollapsed={navCollapsed}>
        {renderPage(currentPage)}
      </SidePushMain>
      <ChatSideOver />
      <ChatSidePush />
    </div>
  )
}
