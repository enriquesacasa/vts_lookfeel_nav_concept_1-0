import * as React from "react"
import { AppNav } from "@/components/app-nav"
import { BuildingHeader } from "@/components/building-header"
import { AvailabilityOverview } from "@/components/availability-overview"
import type { VacantSpace } from "@/components/availability-overview"
import { LeasingActivity } from "@/components/leasing-activity"
import type { Deal, DecisionItem } from "@/components/leasing-activity"
import { TopTenants } from "@/components/top-tenants"
import { ExpiringTenants } from "@/components/expiring-tenants"
import { MultiDonutCard } from "@/components/multi-donut-card"
import { CriticalDates } from "@/components/critical-dates"
import type { CriticalDate } from "@/components/critical-dates"
import { FinancialPerformance } from "@/components/financial-performance"
import { ActionLevers } from "@/components/action-levers"
import { OccupancyCard } from "@/components/occupancy-card"
import type { MoveEvent, NearTermExpiration } from "@/components/occupancy-card"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import buildingImg from "@/assets/building.jpg"

export const ASSETS = [
  { id: "vts-tower", name: "VTS Tower Headquarters", address: "114 West 41st Street, New York, NY 10036" },
  { id: "one-financial", name: "One Financial Plaza", address: "1 Financial Plaza, Providence, RI 02903" },
  { id: "empire-state", name: "Empire State Building", address: "350 5th Ave, New York, NY 10118" },
  { id: "salesforce", name: "Salesforce Tower", address: "415 Mission St, San Francisco, CA 94105" },
  { id: "willis", name: "Willis Tower", address: "233 S Wacker Dr, Chicago, IL 60606" },
  { id: "hudson-yards", name: "30 Hudson Yards", address: "30 Hudson Yards, New York, NY 10001" },
  { id: "one-wtc", name: "One World Trade Center", address: "285 Fulton St, New York, NY 10007" },
  { id: "transamerica", name: "Transamerica Pyramid", address: "600 Montgomery St, San Francisco, CA 94111" },
  { id: "peachtree", name: "One Peachtree Center", address: "303 Peachtree St NE, Atlanta, GA 30308" },
  { id: "union-square", name: "Two Union Square", address: "601 Union St, Seattle, WA 98101" },
  { id: "200-berkeley", name: "200 Berkeley Street", address: "200 Berkeley St, Boston, MA 02116" },
]

const STATS = [
  { label: "Year Built", value: "2017" },
  { label: "Floors",     value: "52" },
  { label: "Owned By",   value: "View The Space" },
  { label: "Managed By", value: "CBRE" },
  { label: "Leased By",  value: "JLL" },
  { label: "RBA",        value: "900K", accent: true },
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
  { tenant: "NovaTech Inc.",   action: "Counter-proposal signature deadline",  dueBy: "5:00 PM" },
  { tenant: "Apex Capital",    action: "Board approval needed for rent concession", dueBy: "EOD" },
]

const PORTFOLIO_DEAL_STAGES = [
  { stage: "Proposals", status: 142, sizeSf: 2841200 },
  { stage: "Leases Out", status: 28, sizeSf: 891400 },
  { stage: "Dead Deals", status: 201, sizeSf: 8124500 },
  { stage: "Leases Executed", status: 284, sizeSf: 11204800 },
]

const TOP_TENANTS = [
  { name: "Ernst & Young",        pct: 8.9, value: "$112K/mo" },
  { name: "HSBC Holdings plc",    pct: 7.7, value: "$97K/mo" },
  { name: "Li & Fung Limited",    pct: 2.3, value: "$53K/mo" },
  { name: "Test Technology",      pct: 2.2, value: "$20K/mo" },
  { name: "One Digital Test",     pct: 1.4, value: "$29K/mo" },
  { name: "Zillow Group, Inc.",   pct: 1.3, value: "$24K/mo" },
  { name: "View the Space, Inc.", pct: 1.2, value: "$7.4K/mo" },
  { name: "Parker Warby Reta...", pct: 1.1, value: "$77K/mo" },
]

const EXPIRING = [
  { year: 2026, sf: 80,  revenue: "$923.8K" },
  { year: 2027, sf: 45,  revenue: "$528K" },
  { year: 2028, sf: 64,  revenue: "$861K" },
  { year: 2029, sf: 30,  revenue: "$412K" },
  { year: 2030, sf: 55,  revenue: "$750K" },
  { year: 2031, sf: 20,  revenue: "$289K" },
  { year: 2032, sf: 70,  revenue: "$1.1M" },
  { year: 2033, sf: 38,  revenue: "$521K" },
  { year: 2034, sf: 15,  revenue: "$198K" },
]

const INDUSTRY_SEGMENTS = [
  { label: "Technology",   pct: 35, colorVar: "--color-chart-1", dotClass: "bg-chart-1" },
  { label: "Finance",      pct: 25, colorVar: "--color-chart-2", dotClass: "bg-chart-2" },
  { label: "Healthcare",   pct: 20, colorVar: "--color-chart-3", dotClass: "bg-chart-3" },
  { label: "Retail",       pct: 12, colorVar: "--color-chart-4", dotClass: "bg-chart-4" },
  { label: "Other",        pct: 8,  colorVar: "--color-chart-5", dotClass: "bg-chart-5" },
]

const SIZE_SEGMENTS = [
  { label: "143,200 sf – 179,000 sf", pct: 54, colorVar: "--color-chart-1", dotClass: "bg-chart-1" },
  { label: "107,400 sf – 143,199 sf", pct: 0,  colorVar: "--color-chart-2", dotClass: "bg-chart-2" },
  { label: "71,600 sf – 107,399 sf",  pct: 13, colorVar: "--color-chart-3", dotClass: "bg-chart-3" },
  { label: "35,800 sf – 71,599 sf",   pct: 24, colorVar: "--color-chart-4", dotClass: "bg-chart-4" },
  { label: "0 sf – 35,799 sf",        pct: 9,  colorVar: "--color-chart-5", dotClass: "bg-chart-5" },
]

const RENT_SEGMENTS = [
  { label: "$76.00 – $93.00", pct: 4,  colorVar: "--color-chart-1", dotClass: "bg-chart-1" },
  { label: "$57.00 – $75.00", pct: 4,  colorVar: "--color-chart-2", dotClass: "bg-chart-2" },
  { label: "$38.00 – $56.00", pct: 0,  colorVar: "--color-chart-3", dotClass: "bg-chart-3" },
  { label: "$19.00 – $37.00", pct: 24, colorVar: "--color-chart-4", dotClass: "bg-chart-4" },
  { label: "$0.00 – $18.00",  pct: 68, colorVar: "--color-chart-5", dotClass: "bg-chart-5" },
]

const PORTFOLIO_STATS = [
  { label: "Total Assets", value: "11" },
  { label: "Total RBA", value: "9.8M" },
  { label: "Avg Occupancy", value: "71%" },
  { label: "Total Revenue", value: "$2.8M/mo", accent: true },
  { label: "Active Deals", value: "284" },
  { label: "Exp. Leases (1yr)", value: "42" },
]

const PORTFOLIO_TOP_TENANTS = [
  { name: "Ernst & Young", pct: 12.4, value: "$892K/mo" },
  { name: "HSBC Holdings plc", pct: 9.1, value: "$654K/mo" },
  { name: "Deloitte LLP", pct: 7.8, value: "$521K/mo" },
  { name: "JP Morgan Chase", pct: 6.2, value: "$448K/mo" },
  { name: "Google LLC", pct: 5.4, value: "$382K/mo" },
  { name: "Salesforce Inc.", pct: 4.1, value: "$298K/mo" },
  { name: "WeWork Companies", pct: 3.7, value: "$271K/mo" },
  { name: "Amazon.com Inc.", pct: 3.2, value: "$234K/mo" },
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

const MOVE_EVENTS: MoveEvent[] = [
  { tenant: "Deloitte LLP",     space: "Suite 500",   sf: 43000,  date: "Jul 1",  type: "move-in"  },
  { tenant: "Pfizer",           space: "Suite 1200",  sf: 117000, date: "Apr 15", type: "move-out" },
  { tenant: "NovaTech Inc.",    space: "Suite 800",   sf: 28500,  date: "Aug 1",  type: "move-in"  },
  { tenant: "Legacy Partners",  space: "Floor 3",     sf: 21000,  date: "Sep 1",  type: "move-out" },
]

const VACANT_SPACES: VacantSpace[] = [
  { space: "Suite 2100",  sf: 34200, daysVacant: 210 },
  { space: "Floor 7",     sf: 52000, daysVacant: 145 },
  { space: "Suite 400B",  sf: 12800, daysVacant: 62  },
  { space: "Floors 9–10", sf: 88000, daysVacant: 30  },
]

const NEAR_TERM_EXPIRATIONS: NearTermExpiration[] = [
  { tenant: "Pfizer",       space: "Suite 1200",  sf: 117000, date: "Apr 15, 2026" },
  { tenant: "Deloitte LLP", space: "Suite 500",   sf: 43000,  date: "Jul 1, 2026"  },
  { tenant: "Morgan Stanley", space: "Floors 8–11", sf: 116000, date: "Aug 1, 2026" },
]

const PORTFOLIO_EXPIRING = [
  { year: 2026, sf: 412, revenue: "$4.8M" },
  { year: 2027, sf: 284, revenue: "$3.2M" },
  { year: 2028, sf: 521, revenue: "$6.1M" },
  { year: 2029, sf: 198, revenue: "$2.3M" },
  { year: 2030, sf: 347, revenue: "$4.1M" },
  { year: 2031, sf: 142, revenue: "$1.7M" },
  { year: 2032, sf: 489, revenue: "$5.8M" },
  { year: 2033, sf: 224, revenue: "$2.6M" },
  { year: 2034, sf: 98, revenue: "$1.1M" },
]

export default function App() {
  const [navCollapsed, setNavCollapsed] = React.useState(true)
  const [selectedAssetId, setSelectedAssetId] = React.useState("vts-tower")
  const [darkMode, setDarkMode] = React.useState(false)
  const isMobile = useIsMobile()

  const toggleDark = () => {
    setDarkMode(d => {
      const next = !d
      document.documentElement.classList.toggle("dark", next)
      return next
    })
  }

  return (
    <div className="min-h-screen">
      <AppNav
        onCollapsedChange={setNavCollapsed}
        assets={ASSETS}
        selectedAssetId={selectedAssetId}
        onAssetChange={setSelectedAssetId}
        onLogoClick={toggleDark}
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
          <div className="space-y-4">
            <BuildingHeader
              image={buildingImg}
              name="VTS Tower Headquarters"
              address="114 West 41st Street"
              city="New York, NY 10036"
              stats={STATS}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AvailabilityOverview occupiedSf={957638} vacantSf={410416} vacantSpaces={VACANT_SPACES} />
              <CriticalDates dates={CRITICAL_DATES} className="md:col-span-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FinancialPerformance className="md:col-span-2" />
              <ActionLevers />
            </div>

            <LeasingActivity deals={ACTIVE_DEALS} decisions={DECISIONS_TODAY} />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <TopTenants tenants={TOP_TENANTS} className="md:col-span-2" />
              <MultiDonutCard
                eyebrow="Tenants"
                title="Industry Distribution"
                segments={INDUSTRY_SEGMENTS}
                centerLabel="10"
                centerSub="Industries"
              />
              <MultiDonutCard
                eyebrow="Tenants"
                title="Size Distribution"
                segments={SIZE_SEGMENTS}
                centerLabel="40.1K"
                centerSub="sf avg"
              />
            </div>

          </div>
      </main>
    </div>
  )
}
