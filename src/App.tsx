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
import { DealsPage } from "@/components/deals-page"
import { ProfileShell } from "@/components/profile-shell"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import buildingImg from "@/assets/building.jpg"

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
    <div className="shrink-0 w-16 h-16 sm:w-24 sm:h-24 grid grid-cols-2 gap-px rounded-xl overflow-hidden">
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
  "vts-tower":     { city: "Built 2017 · 52 floors · Office",   image: "https://picsum.photos/seed/vts1/800/500" },
  "one-financial": { city: "Built 1992 · 36 floors · Office",   image: "https://picsum.photos/seed/fin2/800/500" },
  "empire-state":  { city: "Built 1931 · 102 floors · Office",  image: "https://picsum.photos/seed/emp3/800/500" },
  "salesforce":    { city: "Built 2018 · 61 floors · Office",   image: "https://picsum.photos/seed/sfc4/800/500" },
  "willis":        { city: "Built 1973 · 110 floors · Office",  image: "https://picsum.photos/seed/wil5/800/500" },
  "hudson-yards":  { city: "Built 2019 · 73 floors · Office",   image: "https://picsum.photos/seed/hud6/800/500" },
  "one-wtc":       { city: "Built 2014 · 104 floors · Office",  image: "https://picsum.photos/seed/wtc7/800/500" },
  "transamerica":  { city: "Built 1972 · 48 floors · Office",   image: "https://picsum.photos/seed/tra8/800/500" },
  "peachtree":     { city: "Built 1992 · 60 floors · Office",   image: "https://picsum.photos/seed/pea9/800/500" },
  "union-square":  { city: "Built 1989 · 56 floors · Office",   image: "https://picsum.photos/seed/uni10/800/500" },
  "200-berkeley":  { city: "Built 1947 · 28 floors · Office",   image: "https://picsum.photos/seed/ber11/800/500" },
}

export const ASSET_KPIS: Record<string, {
  occupancy: number; noi: string; noiBudgetDelta: string; noiBudgetUp: boolean;
  expiring12mo: number; activeDeals: number; alert?: string
}> = {
  "vts-tower":     { occupancy: 70, noi: "$29.1M", noiBudgetDelta: "+9.4%", noiBudgetUp: true,  expiring12mo: 3, activeDeals: 6 },
  "one-financial": { occupancy: 88, noi: "$18.4M", noiBudgetDelta: "+2.1%", noiBudgetUp: true,  expiring12mo: 1, activeDeals: 2 },
  "empire-state":  { occupancy: 94, noi: "$41.2M", noiBudgetDelta: "-1.3%", noiBudgetUp: false, expiring12mo: 5, activeDeals: 4, alert: "2 options expiring" },
  "salesforce":    { occupancy: 82, noi: "$55.8M", noiBudgetDelta: "+5.7%", noiBudgetUp: true,  expiring12mo: 2, activeDeals: 3 },
  "willis":        { occupancy: 76, noi: "$33.0M", noiBudgetDelta: "-3.1%", noiBudgetUp: false, expiring12mo: 4, activeDeals: 1, alert: "Below occupancy target" },
  "hudson-yards":  { occupancy: 97, noi: "$62.4M", noiBudgetDelta: "+11.2%", noiBudgetUp: true, expiring12mo: 0, activeDeals: 5 },
  "one-wtc":       { occupancy: 91, noi: "$48.7M", noiBudgetDelta: "+3.8%", noiBudgetUp: true,  expiring12mo: 2, activeDeals: 2 },
  "transamerica":  { occupancy: 68, noi: "$14.2M", noiBudgetDelta: "-6.5%", noiBudgetUp: false, expiring12mo: 6, activeDeals: 3, alert: "High vacancy risk" },
  "peachtree":     { occupancy: 85, noi: "$22.1M", noiBudgetDelta: "+1.9%", noiBudgetUp: true,  expiring12mo: 1, activeDeals: 0 },
  "union-square":  { occupancy: 93, noi: "$31.5M", noiBudgetDelta: "+4.4%", noiBudgetUp: true,  expiring12mo: 3, activeDeals: 4 },
  "200-berkeley":  { occupancy: 79, noi: "$19.8M", noiBudgetDelta: "-0.8%", noiBudgetUp: false, expiring12mo: 2, activeDeals: 1 },
}

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
    "dashboard": "Overview",
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

  const renderPage = (page: string) => {
    if (page === "ai") return <AgentsPage />

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
          stats: [] as { label: string; value: string; accent?: boolean }[],
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
          stats: [] as { label: string; value: string; accent?: boolean }[],
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
        stats: [] as { label: string; value: string; accent?: boolean }[],
      }
    })()

    // Show "AssetName PageLabel" with page label in mid-grey (includes "Overview" on dashboard)
    const pageLabel = PAGE_LABELS[page]
    const pagedHeaderProps = pageLabel
      ? { ...headerProps, name: (
          <span>
            <span className="font-semibold">{headerProps.name}</span>{" "}
            <span className="text-muted-foreground font-light"> | {pageLabel}</span>
          </span>
        )}
      : headerProps

    if (page === "deals") return (
      <div className="space-y-4">
        <BuildingHeader {...pagedHeaderProps} />
        <DealsPage />
      </div>
    )

    if (page === "dashboard" && (selectedAssetId === "all" || selectedPortfolio)) {
      const visibleAssets = selectedPortfolio
        ? ASSETS.filter(a => selectedPortfolio.assetIds.includes(a.id))
        : ASSETS
      return (
        <div className="space-y-4">
          <BuildingHeader {...pagedHeaderProps} />
          <KpiBar kpis={[
            { label: "Total portfolio NOI", value: "$312M",   subtitle: "+4.2% vs budget",  trend: "up"   as const },
            { label: "Occupancy",           value: "91.4%",  subtitle: "+0.8% vs budget",  trend: "up"   as const },
            { label: "Total SF",            value: "4.2M sf", subtitle: "across all assets" },
            { label: "Markets",             value: selectedPortfolio ? "1" : "5" },
          ]} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleAssets.map(asset => {
              const kpi = ASSET_KPIS[asset.id]
              const detail = ASSET_DETAILS[asset.id]
              if (!kpi) return null
              return (
                <div
                  key={asset.id}
                  className="group cursor-pointer rounded-2xl overflow-hidden bg-white/70 dark:bg-white/8 backdrop-blur-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                  onClick={() => { setSelectedAssetId(asset.id); setCurrentPage("dashboard") }}
                >
                  <div className="relative h-44 overflow-hidden">
                    <img src={detail?.image} alt={asset.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    {kpi.alert && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-destructive rounded-full px-2.5 py-1">
                          ⚠ {kpi.alert}
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
                      <p className="text-[10px] font-medium uppercase tracking-widest text-white/60 mb-0.5">{detail?.city}</p>
                      <h3 className="font-semibold text-white text-base leading-tight">{asset.name}</h3>
                      <p className="text-xs text-white/60 truncate">{asset.address}</p>
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
                        <div
                          className={cn("h-full rounded-full", kpi.occupancy >= 90 ? "bg-success" : kpi.occupancy >= 75 ? "bg-primary" : "bg-warning")}
                          style={{ width: `${kpi.occupancy}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground tabular-nums shrink-0">{kpi.occupancy}% occupied</span>
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-border/60">
                      <div className="pr-3">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">NOI</p>
                        <p className="text-sm font-semibold text-foreground">{kpi.noi}</p>
                        <p className={cn("text-xs font-medium", kpi.noiBudgetUp ? "text-success" : "text-destructive")}>{kpi.noiBudgetDelta} vs budget</p>
                      </div>
                      <div className="px-3">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Expiring</p>
                        <p className="text-sm font-semibold text-foreground">{kpi.expiring12mo} lease{kpi.expiring12mo !== 1 ? "s" : ""}</p>
                        <p className={cn("text-xs font-medium", kpi.expiring12mo > 3 ? "text-destructive" : kpi.expiring12mo > 0 ? "text-warning" : "text-muted-foreground")}>
                          {kpi.expiring12mo === 0 ? "None" : kpi.expiring12mo > 3 ? "Action needed" : "12-month"}
                        </p>
                      </div>
                      <div className="pl-3">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Deals</p>
                        <p className="text-sm font-semibold text-foreground">{kpi.activeDeals}</p>
                        <p className="text-xs text-muted-foreground">active</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }
    if (PAGE_LABELS[page] && page !== "dashboard") {
      return (
        <div className="flex flex-col" style={{minHeight: 'calc(100vh - 2rem)'}}>
          <BuildingHeader {...pagedHeaderProps} />
          <div className="flex flex-col items-center justify-center flex-1 text-center px-4 rounded-2xl bg-white/70 dark:bg-white/8 backdrop-blur-md mt-4">
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
        onAssetChange={id => {
          const newIsPortfolioOrAll = id === "all" || PORTFOLIOS.some(p => p.id === id)
          if (newIsPortfolioOrAll && (currentPage === "stacking" || currentPage === "spaces")) {
            setCurrentPage("dashboard")
          }
          setSelectedAssetId(id)
        }}
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
