import * as React from "react"
import { AppNav } from "@/components/app-nav"
import { BuildingHeader } from "@/components/building-header"
import { AvailabilityOverview } from "@/components/availability-overview"
import type { VacantSpace } from "@/components/availability-overview"
import { LeasingActivity } from "@/components/leasing-activity"
import type { Deal, DecisionItem } from "@/components/leasing-activity"
import { CriticalDates } from "@/components/critical-dates"
import type { CriticalDate } from "@/components/critical-dates"
import { FinancialPerformance } from "@/components/financial-performance"
import { ActionLevers } from "@/components/action-levers"
import { KpiBar } from "@/components/kpi-bar"
import { LeasingAgents } from "@/components/leasing-agents"
import { AgentsPage } from "@/components/agents-page"
import { ProfileShell } from "@/components/profile-shell"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import buildingImg from "@/assets/building.jpg"

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

const ASSET_DETAILS: Record<string, { city: string; image: string }> = {
  "vts-tower":     { city: "Built 2017 · 52 floors · Office",   image: "https://loremflickr.com/400/300/office,glass,tower?lock=805" },
  "one-financial": { city: "Built 1992 · 36 floors · Office",   image: "https://loremflickr.com/400/300/office,building?lock=22" },
  "empire-state":  { city: "Built 1931 · 102 floors · Office",  image: "https://loremflickr.com/400/300/skyscraper,newyork?lock=33" },
  "salesforce":    { city: "Built 2018 · 61 floors · Office",   image: "https://loremflickr.com/400/300/modern,tower?lock=44" },
  "willis":        { city: "Built 1973 · 110 floors · Office",  image: "https://loremflickr.com/400/300/skyscraper,chicago?lock=55" },
  "hudson-yards":  { city: "Built 2019 · 73 floors · Office",   image: "https://loremflickr.com/400/300/architecture,facade?lock=66" },
  "one-wtc":       { city: "Built 2014 · 104 floors · Office",  image: "https://loremflickr.com/400/300/tower,glass?lock=77" },
  "transamerica":  { city: "Built 1972 · 48 floors · Office",   image: "https://loremflickr.com/400/300/architecture,pyramid?lock=88" },
  "peachtree":     { city: "Built 1992 · 60 floors · Office",   image: "https://loremflickr.com/400/300/highrise,office?lock=99" },
  "union-square":  { city: "Built 1989 · 56 floors · Office",   image: "https://loremflickr.com/400/300/building,corporate?lock=110" },
  "200-berkeley":  { city: "Built 1947 · 28 floors · Office",   image: "https://loremflickr.com/400/300/building,boston?lock=121" },
}

const STATS: { label: string; value: string; accent?: boolean }[] = []

const KPIS = [
  { label: "In-place NOI",           value: "$29.1M",    subtitle: "+9.4% vs budget",  trend: "up"   as const },
  { label: "Revenue at risk (12mo)", value: "$234K/mo",  subtitle: "-$18K vs budget",  trend: "down" as const },
  { label: "Pipeline upside",        value: "+$89K/mo",  subtitle: "+$12K vs budget",  trend: "up"   as const },
  { label: "Managed by",             value: "CBRE" },
  { label: "Leased by",              value: "JLL" },
  { label: "Owned by",               value: "View The Space" },
]

const ACTIVE_DEALS: Deal[] = [
  { tenant: "NovaTech Inc.",   space: "Suite 800",   sf: 28500,  stage: "LOI",       status: "active",   baseRent: 52.00, budgetRent: 50.00 },
  { tenant: "Apex Capital",    space: "Floor 12",    sf: 45000,  stage: "Proposal",  status: "active",   baseRent: 48.00, budgetRent: 52.00, note: "Counter awaiting response" },
  { tenant: "Meridian Health", space: "Suite 1800",  sf: 33000,  stage: "Lease Out", status: "stalled",  baseRent: 55.00, budgetRent: 55.00, stalledDays: 18 },
  { tenant: "Atlas Group",     space: "Floors 2–3",  sf: 61000,  stage: "Proposal",  status: "at-risk",  baseRent: 44.00, budgetRent: 50.00, note: "Considering competitor building" },
  { tenant: "Vertex Studios",  space: "Suite 600",   sf: 19800,  stage: "LOI",       status: "active",   baseRent: 58.00, budgetRent: 56.00 },
  { tenant: "Bluewave LLC",    space: "Suite 300",   sf: 12400,  stage: "Lease Out", status: "active",   baseRent: 51.00, budgetRent: 51.00 },
]

const DECISIONS_TODAY: DecisionItem[] = [
  { tenant: "NovaTech Inc.",   action: "Counter-proposal signature deadline",  inApprovalFor: "2 days" },
  { tenant: "Apex Capital",    action: "Board approval needed for rent concession", inApprovalFor: "5 days" },
]


const CRITICAL_DATES: CriticalDate[] = [
  { tenant: "Pfizer",              type: "Lease Expiration",              space: "Suite 1200",   sf: 117000, date: "Sep 15, 2026", monthsOut: 2,  category: "expiring" },
  { tenant: "Morgan Stanley",      type: "Lease Expiration",              space: "Floors 8–11",  sf: 116000, date: "Nov 1, 2026",  monthsOut: 4,  category: "expiring" },
  { tenant: "Deloitte LLP",        type: "Rent Commencement Date",        space: "Suite 500",    sf: 43000,  date: "Dec 1, 2026",  monthsOut: 5,  category: "expiring" },
  { tenant: "KPMG",                type: "Renewal Window Opens",          space: "Suite 3400",   sf: 117000, date: "Jan 31, 2027", monthsOut: 6,  category: "renewal"  },
  { tenant: "Ernst & Young",       type: "Contraction Option Deadline",   space: "Suite 2200",   sf: 80100,  date: "Mar 1, 2027",  monthsOut: 8,  category: "options"  },
  { tenant: "HSBC Holdings",       type: "ROFO Latest Notice Date",       space: "Suite 900",    sf: 69300,  date: "Apr 15, 2027", monthsOut: 9,  category: "options"  },
  { tenant: "Latham & Watkins",    type: "Renewal Window Opens",          space: "Floors 14–15", sf: 119000, date: "May 1, 2027",  monthsOut: 10, category: "renewal"  },
  { tenant: "JPMorgan Chase",      type: "Expansion Option Deadline",     space: "Floor 6",      sf: 55800,  date: "Jun 30, 2027", monthsOut: 11, category: "options"  },
]

const VACANT_SPACES: VacantSpace[] = [
  { space: "Suite 2100",  sf: 34200, daysVacant: 210 },
  { space: "Floor 7",     sf: 52000, daysVacant: 145 },
  { space: "Suite 400B",  sf: 12800, daysVacant: 62  },
  { space: "Floors 9–10", sf: 88000, daysVacant: 30  },
]

export default function App() {
  const [navCollapsed, setNavCollapsed] = React.useState(false)
  const [selectedAssetId, setSelectedAssetId] = React.useState("vts-tower")
  const [currentPage, setCurrentPage] = React.useState("dashboard")
  const [profileMode, setProfileMode] = React.useState(false)
  const [, setDarkMode] = React.useState(false)
  const isMobile = useIsMobile()

  const toggleDark = () => {
    setDarkMode(d => {
      const next = !d
      document.documentElement.classList.toggle("dark", next)
      return next
    })
  }

  const PAGE_LABELS: Record<string, string> = {
    "stacking": "Stacking plan", "spaces": "Spaces",
    "leases": "Leases", "critical-dates": "Critical dates", "options-rights": "Options & rights", "tenants": "Tenants",
    "deals": "Deals", "deal-tasks": "Deal tasks", "tenant-coord": "Tenant coordination", "requirements": "Requirements",
    "planning": "Planning", "budgets": "Budgets", "appraisals": "Appraisals", "comps": "Comps", "doc-vault": "Doc vault",
    "market": "Market", "buildings": "Buildings", "listings": "Listings", "tourbooks": "My tourbooks",
    "shares": "My shares", "marketing-analytics": "Marketing analytics", "inquiries": "Inquiries",
    "insights": "Insights", "leasing-activity": "Leasing activity report", "portfolio-dashboards": "Portfolio dashboards",
    "portfolio-alerts": "Portfolio alerts", "portfolio-reports": "Portfolio reports", "lease-charts": "Lease charts",
    "abstraction": "Abstraction management", "activity": "Activity feed", "reminders": "Reminders",
    "assets": "Assets", "markets": "Markets", "cities": "Cities",
  }

  const selectedPortfolio = PORTFOLIOS.find(p => p.id === selectedAssetId)
  const selectedAsset = ASSETS.find(a => a.id === selectedAssetId)

  const renderSelectionHeader = () => {
    if (selectedAssetId === "all") return (
      <div className="flex items-start gap-4 py-3 border-b border-border mb-4">
        <div className="flex-1">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">Portfolio</p>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-foreground leading-tight mb-1.5">All assets</h1>
          <p className="text-sm text-muted-foreground">11 properties across 5 markets</p>
        </div>
      </div>
    )
    if (selectedPortfolio) return (
      <div className="flex items-start gap-4 py-3 border-b border-border mb-4">
        <div className="flex-1">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">Portfolio</p>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-foreground leading-tight mb-1.5">{selectedPortfolio.name}</h1>
          <p className="text-sm text-muted-foreground">{selectedPortfolio.assetIds.length} properties</p>
        </div>
      </div>
    )
    if (selectedAsset) return (
      <div className="flex items-start gap-4 py-3 border-b border-border mb-4">
        <div className="flex-1">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">Asset</p>
          <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-foreground leading-tight mb-1.5">{selectedAsset.name}</h1>
          <p className="text-sm text-muted-foreground">{selectedAsset.address}</p>
        </div>
      </div>
    )
    return null
  }

  const renderPage = (page: string) => {
    if (page === "ai") return <AgentsPage />

    const assetDetail = ASSET_DETAILS[selectedAssetId]

    // Compute header props depending on selection
    const headerProps = (() => {
      if (selectedAssetId === "all") return {
        city: "Overview",
        name: "All assets",
        address: "11 properties across 5 markets",
        image: undefined,
        stats: [] as typeof STATS,
      }
      if (selectedPortfolio) return {
        city: "Portfolio",
        name: selectedPortfolio.name,
        address: `${selectedPortfolio.assetIds.length} properties`,
        image: undefined,
        stats: [] as typeof STATS,
      }
      return {
        city: assetDetail?.city ?? "Built 2017 · 52 floors · Office",
        name: selectedAsset?.name ?? "VTS Tower Headquarters",
        address: selectedAsset?.address ?? "114 West 41st Street, New York, NY 10036",
        image: assetDetail?.image ?? buildingImg,
        stats: STATS,
      }
    })()

    if (page === "dashboard" && (selectedAssetId === "all" || selectedPortfolio)) return (
      <div className="flex flex-col" style={{minHeight: 'calc(100vh - 2rem)'}}>
        <BuildingHeader {...headerProps} />
        <KpiBar kpis={[
          { label: "Total portfolio NOI", value: "$312M",   subtitle: "+4.2% vs budget",  trend: "up"   as const },
          { label: "Occupancy",           value: "91.4%",  subtitle: "+0.8% vs budget",  trend: "up"   as const },
          { label: "Total SF",            value: "4.2M sf", subtitle: "across all assets" },
          { label: "Markets",             value: selectedPortfolio ? String(new Set(selectedPortfolio.assetIds.map(() => "market")).size) : "5" },
        ]} className="mt-4" />
        <div className="flex flex-col items-center justify-center flex-1 text-center px-4 border border-border rounded-2xl bg-white dark:bg-card mt-4">
          <p className="text-sm text-muted-foreground">Portfolio dashboard content coming soon</p>
        </div>
      </div>
    )
    if (page !== "dashboard" && PAGE_LABELS[page]) {
      return (
        <div className="flex flex-col" style={{minHeight: 'calc(100vh - 2rem)'}}>
          <BuildingHeader {...headerProps} />
          <div className="flex flex-col items-center justify-center flex-1 text-center px-4 rounded-2xl bg-white dark:bg-card border border-border mt-4">
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
        <BuildingHeader {...headerProps} />
        <KpiBar kpis={KPIS} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AvailabilityOverview occupiedSf={957638} vacantSf={410416} vacantSpaces={VACANT_SPACES} />
          <CriticalDates dates={CRITICAL_DATES} className="md:col-span-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FinancialPerformance className="md:col-span-2" />
          <ActionLevers />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LeasingActivity deals={ACTIVE_DEALS} className="md:col-span-2" />
          <LeasingAgents deals={ACTIVE_DEALS} decisions={DECISIONS_TODAY} />
        </div>
      </div>
    )
  }

  if (profileMode) {
    return (
      <ProfileShell
        onExit={() => { setProfileMode(false); setCurrentPage("dashboard"); setNavCollapsed(false) }}
        assets={ASSETS}
        portfolios={PORTFOLIOS}
        selectedAssetId={selectedAssetId}
        onAssetChange={setSelectedAssetId}
      />
    )
  }

  return (
    <div className="min-h-screen">
      <AppNav
        onCollapsedChange={setNavCollapsed}
        assets={ASSETS}
        portfolios={PORTFOLIOS}
        selectedAssetId={selectedAssetId}
        onAssetChange={id => { setSelectedAssetId(id); setCurrentPage("dashboard") }}
        onLogoClick={toggleDark}
        onNavItemClick={id => {
          if (id === "avatar") { setProfileMode(true) }
          else setCurrentPage(id)
        }}
        activePage={currentPage}
      />

      <main
        className={cn(
          "transition-all duration-300 ease-in-out pt-4 pr-4 pb-4 overflow-x-hidden",
          isMobile
            ? "pl-4 pt-[72px]"
            : navCollapsed
              ? "pl-[104px]"
              : "pl-[264px]"
        )}
      >
        {renderPage(currentPage)}
      </main>
    </div>
  )
}
