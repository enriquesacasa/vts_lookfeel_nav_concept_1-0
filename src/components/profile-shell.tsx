import * as React from "react"
import { cn } from "@/lib/utils"
import {
  LayoutGrid, Layers, FileText, Handshake, Wallet, Scale, BarChart2, Calculator, Archive,
  Sparkle, BellRing, Activity, UserCircle,
  ChevronRight, ChevronDown, Building2, CalendarDays, Users,
  SquareStack, ShieldCheck, ClipboardList, UsersRound, ListChecks,
  PanelLeftClose, PanelLeftOpen, Search, Menu, X,
} from "lucide-react"
import { VtsAgentsPage } from "@/components/vts-agents-page"
import { VtsDashboard } from "@/components/vts-dashboard"

interface Asset { id: string; name: string; address: string }
interface Portfolio { id: string; name: string; assetIds: string[] }

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  children?: NavItem[]
  divider?: boolean
}

const PORTFOLIO_ITEMS: NavItem[] = []

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard",    label: "Overview",      icon: LayoutGrid },
  { id: "stacking",     label: "Stacking plan", icon: Layers, children: [
    { id: "spaces",     label: "Spaces",         icon: SquareStack },
  ]},
  { id: "leases",       label: "Leases",         icon: FileText, children: [
    { id: "critical-dates",   label: "Critical dates",    icon: CalendarDays },
    { id: "options-rights",   label: "Options & rights",  icon: ShieldCheck },
  ]},
  { id: "tenants",      label: "Tenants",        icon: Users },
  { id: "deals",        label: "Deals",          icon: Handshake, children: [
    { id: "deal-tasks",       label: "Deal tasks",          icon: ClipboardList },
    { id: "tenant-coord",     label: "Tenant coordination", icon: UsersRound },
    { id: "requirements",     label: "Requirements",        icon: ListChecks },
  ]},
  { id: "planning",     label: "Planning",         icon: Calculator, children: [
    { id: "budgets",    label: "Budgets",          icon: Wallet },
    { id: "appraisals", label: "Appraisals",       icon: Scale },
    { id: "comps",      label: "Comps",             icon: BarChart2 },
  ]},
  { id: "doc-vault",    label: "Doc vault",        icon: Archive },
]

const AI_ITEM = { id: "ai", label: "VTS Agents", icon: Sparkle }

const BOTTOM_ITEMS = [
  { id: "activity",    label: "Activity feed", icon: Activity },
  { id: "reminders",  label: "Reminders",     icon: BellRing },
  { id: "avatar",     label: "Profile",       icon: UserCircle },
]

// ── Placeholder page ─────────────────────────────────────────────────────────

function PlaceholderPage({ label, icon: Icon, selectionHeader }: { label: string; icon: React.ElementType; selectionHeader?: React.ReactNode }) {
  return (
    <div className="p-4 sm:p-6 space-y-4">
      {selectionHeader}
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4">
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-5">
          <Icon className="h-6 w-6 text-primary opacity-60" />
        </div>
        <h2 className="text-2xl font-medium text-foreground mb-2">{label}</h2>
        <p className="text-sm text-muted-foreground max-w-xs">This page is a placeholder. Content coming soon.</p>
      </div>
    </div>
  )
}

// ── Selection header (shared across overview + placeholder pages) ────────────

interface Stat { label: string; value: string }

function SelectionHeader({ name, subtitle, eyebrow, image, stats = [] }: {
  name: string; subtitle: string; eyebrow: string; image?: string; stats?: Stat[]
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border mb-4">
      {image && (
        <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden hidden sm:block">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-0.5">{eyebrow}</p>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground leading-tight">{name}</h1>
        <p className="text-sm text-muted-foreground mt-0.5 truncate">{subtitle}</p>
      </div>
      {stats.length > 0 && (
        <div className="hidden md:flex items-stretch divide-x divide-border shrink-0">
          {stats.map(s => (
            <div key={s.label} className="px-5 text-right">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-0.5">{s.label}</p>
              <p className="text-sm font-semibold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 shrink-0">
        <button className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-3.5 py-1.5 text-sm font-medium">
          <Sparkle fill="currentColor" className="h-3.5 w-3.5" />
          Ask VTS AI
        </button>
        <button aria-label="Search" className="flex items-center justify-center h-8 w-8 rounded-full border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
          <Search className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── Portfolio overview ────────────────────────────────────────────────────────

function PortfolioOverview({ name, subtitle }: { name: string; subtitle: string }) {
  return (
    <div className="p-4 sm:p-6 space-y-4">
      <SelectionHeader name={name} subtitle={subtitle} eyebrow="Portfolio"
        stats={[{ label: "Total NOI", value: "$312M" }, { label: "Occupancy", value: "91.4%" }, { label: "Markets", value: "5" }]}
      />
      <div className="flex flex-wrap divide-x divide-border/60 border border-border bg-card overflow-hidden rounded-lg">
        {[
          { label: "Total portfolio NOI", value: "$312M" },
          { label: "Occupancy",           value: "91.4%" },
          { label: "Total SF",            value: "4.2M sf" },
          { label: "Markets",             value: "5" },
        ].map(kpi => (
          <div key={kpi.label} className="flex-1 min-w-[120px] px-5 py-4">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">{kpi.label}</p>
            <p className="text-xl font-semibold text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-card p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-muted-foreground">Portfolio dashboard content coming soon</p>
      </div>
    </div>
  )
}

// ── Shell ─────────────────────────────────────────────────────────────────────

interface ProfileShellProps {
  onExit: () => void
  assets: Asset[]
  portfolios: Portfolio[]
  selectedAssetId: string
  onAssetChange: (id: string) => void
}

export function ProfileShell({ onExit, assets, portfolios, selectedAssetId, onAssetChange }: ProfileShellProps) {
  const [activePage, setActivePage] = React.useState("dashboard")
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const toggleDark = () => {
    document.documentElement.classList.toggle("dark")
  }
  const [openSections, setOpenSections] = React.useState<Set<string>>(new Set())
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const selectorRef = React.useRef<HTMLDivElement>(null)
  const searchRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node))
        setDropdownOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [dropdownOpen])

  React.useEffect(() => {
    if (dropdownOpen) setTimeout(() => searchRef.current?.focus(), 50)
    else setSearch("")
  }, [dropdownOpen])

  const selectedAsset = assets.find(a => a.id === selectedAssetId)
  const selectedPortfolio = portfolios.find(p => p.id === selectedAssetId)
  const selectorLabel = selectedAssetId === "all" ? "All assets" : (selectedAsset?.name ?? selectedPortfolio?.name ?? "Select asset")

  const filteredNavItems = React.useMemo(() => {
    const isPortfolioOrAll = selectedAssetId === "all" || !!portfolios.find(p => p.id === selectedAssetId)
    const base = NAV_ITEMS.filter(item => !isPortfolioOrAll || item.id !== "stacking")
    if (!isPortfolioOrAll) return base
    const dashIdx = base.findIndex(i => i.id === "dashboard")
    return [...base.slice(0, dashIdx + 1), ...PORTFOLIO_ITEMS, ...base.slice(dashIdx + 1)]
  }, [selectedAssetId, portfolios])

  const allFlat = filteredNavItems.flatMap(i => [i, ...(i.children ?? [])])
  const activeItem = [...allFlat, AI_ITEM, ...BOTTOM_ITEMS].find(i => i.id === activePage)

  const selectionHeader = selectedAssetId === "all"
    ? <SelectionHeader name="All assets" subtitle="11 properties across 5 markets" eyebrow="Overview"
        stats={[{ label: "Total NOI", value: "$312M" }, { label: "Occupancy", value: "91.4%" }, { label: "Total SF", value: "4.2M sf" }, { label: "Markets", value: "5" }]}
      />
    : selectedPortfolio
      ? <SelectionHeader name={selectedPortfolio.name} subtitle={`${selectedPortfolio.assetIds.length} properties`} eyebrow="Portfolio"
          stats={[{ label: "Total NOI", value: "$312M" }, { label: "Occupancy", value: "91.4%" }, { label: "Properties", value: String(selectedPortfolio.assetIds.length) }]}
        />
      : selectedAsset
        ? <SelectionHeader name={selectedAsset.name} subtitle={selectedAsset.address} eyebrow="Asset Dashboard"
            stats={[{ label: "Total SF", value: "1.37M" }, { label: "Floors", value: "52" }, { label: "Managed", value: "CBRE" }]}
          />
        : null

  const renderContent = () => {
    if (activePage === "dashboard" && (selectedAssetId === "all" || selectedPortfolio))
      return <PortfolioOverview
        name={selectedAssetId === "all" ? "All assets" : selectedPortfolio!.name}
        subtitle={selectedAssetId === "all" ? "11 properties across 5 markets" : `${selectedPortfolio!.assetIds.length} properties`}
      />
    if (activePage === "dashboard") return <VtsDashboard />
    if (activePage === "ai") return <VtsAgentsPage />
    if (activeItem && !("divider" in activeItem && activeItem.divider))
      return <PlaceholderPage label={activeItem.label} icon={activeItem.icon} selectionHeader={selectionHeader} />
    return null
  }

  const handleNavClick = (pageId: string) => {
    setActivePage(pageId)
    setMobileMenuOpen(false)
  }

  return (
    <div className="flex h-screen overflow-hidden vts-platform bg-background">

      {/* Mobile top header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-12 bg-[#140532] flex items-center px-4 gap-3 shrink-0">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex items-center justify-center h-8 w-8 text-white hover:bg-white/15 transition-colors rounded-md"
        >
          <Menu className="h-5 w-5" />
        </button>
        <svg onClick={toggleDark} width="555" height="160" viewBox="0 0 555 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[1.4rem] w-auto opacity-90 cursor-pointer">
          <path d="M262.948 37.923L282.271 99.5913L301.591 37.923H321.723L293.26 121.804H270.12L241.889 37.923H262.948Z" fill="white"/>
          <path d="M378.745 55.2793H351.903V37.923H425.601V55.2793H398.645V121.804H378.745V55.2793Z" fill="white"/>
          <path d="M491.06 52.3862C483.422 52.3862 477.756 55.2794 477.756 60.4835C477.756 64.6518 481.688 67.6581 487.475 68.9305L498.928 71.2439C512.464 74.021 529.588 78.1862 529.588 95.7721C529.588 113.358 511.885 123.31 494.416 123.31C472.895 123.31 458.78 112.549 455.771 94.4997H475.441C477.639 103.293 484.581 107.342 494.879 107.342C501.588 107.342 509.224 105.144 509.224 98.2023C509.224 92.7658 502.747 90.1023 493.604 88.1371L483.422 86.0533C469.77 83.1633 457.392 76.6841 457.392 61.6418C457.392 44.519 475.788 36.5351 492.217 36.5351C508.646 36.5351 524.265 43.7095 527.158 62.2215H507.604C505.636 55.9721 499.506 52.3862 491.06 52.3862Z" fill="white"/>
          <path d="M108.553 46.9088L136.165 65.2593L156.596 51.7396L108.553 19.812L108.485 19.8573L60.427 51.7926L80.8551 65.3125L108.485 46.953L108.553 46.9088Z" fill="white"/>
          <path d="M108.47 105.303L25.0786 53.0043V87.8887L108.47 140.187L108.485 140.179L191.889 87.8741V52.9871L108.485 105.293L108.47 105.303Z" fill="white"/>
        </svg>
      </header>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-screen flex flex-col z-50 bg-[#140532] transition-all duration-200",
        "w-[220px]",
        // Desktop collapse
        "md:w-auto",
        collapsed ? "md:w-[60px]" : "md:w-[220px]",
        // Mobile drawer
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>

        {/* Logo + toggle */}
        <div className={cn(
          "flex items-center pt-5 mb-4",
          collapsed ? "justify-center px-3" : "justify-between px-4"
        )}>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden flex items-center justify-center h-8 w-8 rounded-md text-white hover:bg-white/15 transition-colors shrink-0 mr-1"
          >
            <X className="h-5 w-5" />
          </button>
          {collapsed ? (
            <svg onClick={toggleDark} viewBox="0 0 167 121" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[1.5rem] w-auto opacity-90 shrink-0 cursor-pointer">
              <path d="M83.474 27.0968L111.087 45.4473L131.517 31.9276L83.474 -5.4248e-06L83.4063 0.0453396L35.3484 31.9807L55.7765 45.5005L83.4063 27.1411L83.474 27.0968Z" fill="white"/>
              <path d="M83.3916 85.4912L0 33.1923V68.0767L83.3916 120.375L83.4063 120.367L166.811 68.0622V33.1751L83.4063 85.4814L83.3916 85.4912Z" fill="white"/>
            </svg>
          ) : (
            <svg onClick={toggleDark} width="555" height="160" viewBox="0 0 555 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[1.6rem] w-auto opacity-90 shrink-0 cursor-pointer">
              <path d="M262.948 37.923L282.271 99.5913L301.591 37.923H321.723L293.26 121.804H270.12L241.889 37.923H262.948Z" fill="white"/>
              <path d="M378.745 55.2793H351.903V37.923H425.601V55.2793H398.645V121.804H378.745V55.2793Z" fill="white"/>
              <path d="M491.06 52.3862C483.422 52.3862 477.756 55.2794 477.756 60.4835C477.756 64.6518 481.688 67.6581 487.475 68.9305L498.928 71.2439C512.464 74.021 529.588 78.1862 529.588 95.7721C529.588 113.358 511.885 123.31 494.416 123.31C472.895 123.31 458.78 112.549 455.771 94.4997H475.441C477.639 103.293 484.581 107.342 494.879 107.342C501.588 107.342 509.224 105.144 509.224 98.2023C509.224 92.7658 502.747 90.1023 493.604 88.1371L483.422 86.0533C469.77 83.1633 457.392 76.6841 457.392 61.6418C457.392 44.519 475.788 36.5351 492.217 36.5351C508.646 36.5351 524.265 43.7095 527.158 62.2215H507.604C505.636 55.9721 499.506 52.3862 491.06 52.3862Z" fill="white"/>
              <path d="M108.553 46.9088L136.165 65.2593L156.596 51.7396L108.553 19.812L108.485 19.8573L60.427 51.7926L80.8551 65.3125L108.485 46.953L108.553 46.9088Z" fill="white"/>
              <path d="M108.47 105.303L25.0786 53.0043V87.8887L108.47 140.187L108.485 140.179L191.889 87.8741V52.9871L108.485 105.293L108.47 105.303Z" fill="white"/>
            </svg>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="flex items-center justify-center h-8 w-8 rounded-md text-white hover:bg-white/15 transition-colors shrink-0"
            >
              <PanelLeftClose className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="mx-auto mb-3 flex items-center justify-center h-8 w-8 rounded-md text-white hover:bg-white/15 transition-colors"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>
        )}

        {/* Asset selector */}
        <div className={cn("mb-2 relative", collapsed ? "px-2" : "px-3")} ref={selectorRef}>
          {collapsed ? (
            <button
              onClick={() => setDropdownOpen(v => !v)}
              title={selectorLabel}
              className="w-full flex items-center justify-center p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Building2 className="h-[15px] w-[15px]" />
            </button>
          ) : (
            <button
              onClick={() => setDropdownOpen(v => !v)}
              className={cn(
                "w-full flex items-center gap-2 rounded-xl px-3 py-2 border transition-colors",
                dropdownOpen
                  ? "bg-white/15 border-white/25"
                  : "bg-white/8 border-white/12 hover:bg-white/12"
              )}
            >
              <Building2 className="h-3.5 w-3.5 shrink-0 text-white/50" />
              <span className="text-xs font-medium text-white/80 flex-1 text-left">
                {selectorLabel}
              </span>
              <ChevronDown className={cn("h-3 w-3 shrink-0 text-white/40 transition-transform", dropdownOpen && "rotate-180")} />
            </button>
          )}

          {/* Dropdown */}
          {dropdownOpen && (() => {
            const q = search.trim().toLowerCase()
            const filteredAssets = assets.filter(a =>
              a.name.toLowerCase().includes(q) || a.address.toLowerCase().includes(q)
            )
            const filteredPortfolios = portfolios.filter(p => p.name.toLowerCase().includes(q))
            const select = (id: string) => { onAssetChange(id); setDropdownOpen(false) }
            return (
              <div className={cn(
                "absolute z-[200] w-[260px]",
                collapsed ? "top-0 left-[calc(100%+8px)]" : "top-full left-0 mt-1"
              )}>
                <div className="rounded-xl border border-white/15 bg-[#1a0a3d] shadow-xl overflow-hidden flex flex-col">
                  <div className="px-2.5 pt-2.5 pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/8">
                      <Search className="h-3.5 w-3.5 shrink-0 text-white/40" />
                      <input
                        ref={searchRef}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search properties…"
                        className="flex-1 bg-transparent text-xs text-white placeholder:text-white/40 outline-none"
                      />
                    </div>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto">
                    {!q && (
                      <div className="px-1.5 pt-2 pb-1">
                        <button onClick={() => select("all")}
                          className={cn("w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors text-left",
                            selectedAssetId === "all" ? "bg-[#5528FF] text-white" : "text-white/70 hover:bg-white/8 hover:text-white"
                          )}>
                          <Layers className="h-3.5 w-3.5 shrink-0 opacity-60" />
                          <p className="text-xs font-medium">All assets</p>
                        </button>
                      </div>
                    )}
                    {filteredPortfolios.length > 0 && (
                      <div className="px-1.5 pt-2 pb-1">
                        <p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-widest text-white/35">Portfolios</p>
                        {filteredPortfolios.map(p => (
                          <button key={p.id} onClick={() => select(p.id)}
                            className={cn("w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors text-left",
                              selectedAssetId === p.id ? "bg-[#5528FF] text-white" : "text-white/70 hover:bg-white/8 hover:text-white"
                            )}>
                            <Layers className="h-3.5 w-3.5 shrink-0 opacity-60" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate">{p.name}</p>
                              <p className="text-[10px] text-white/45">{p.assetIds.length} properties</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {filteredAssets.length > 0 && (
                      <div className="px-1.5 pt-2 pb-1.5">
                        <p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-widest text-white/35">Properties</p>
                        {filteredAssets.map(a => (
                          <button key={a.id} onClick={() => select(a.id)}
                            className={cn("w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors text-left",
                              selectedAssetId === a.id ? "bg-[#5528FF] text-white" : "text-white/70 hover:bg-white/8 hover:text-white"
                            )}>
                            <Building2 className="h-3.5 w-3.5 shrink-0 opacity-50" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium truncate">{a.name}</p>
                              <p className="text-[10px] text-white/45 truncate">{a.address}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {filteredAssets.length === 0 && filteredPortfolios.length === 0 && (
                      <p className="px-4 py-5 text-center text-xs text-white/40">No results for "{search}"</p>
                    )}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto pb-2 scrollbar-none">
          <div className={cn("space-y-0.5", collapsed ? "px-2" : "px-3")}>
            {filteredNavItems.map(item => {
              if (item.divider) return <div key={item.id} className="h-px bg-white/8 my-2" />
              const hasChildren = !!item.children?.length
              const isOpen = openSections.has(item.id)
              return (
                <React.Fragment key={item.id}>
                  <SidebarRow
                    item={item}
                    active={activePage === item.id}
                    collapsed={collapsed}
                    chevron={hasChildren && !collapsed ? (isOpen ? "down" : "right") : undefined}
                    onClick={() => {
                      handleNavClick(item.id)
                      if (hasChildren) setOpenSections(new Set([item.id]))
                      else setOpenSections(new Set())
                    }}
                  />
                  {!collapsed && isOpen && item.children?.map(child => (
                    <div key={child.id} className="pl-3">
                      <SidebarRow item={child} active={activePage === child.id} collapsed={false} onClick={() => { handleNavClick(child.id); setOpenSections(new Set([item.id])) }} />
                    </div>
                  ))}
                </React.Fragment>
              )
            })}
            <div className={cn(collapsed ? "px-0" : "")}>
              <SidebarRow item={AI_ITEM} active={activePage === "ai"} collapsed={collapsed} accent onClick={() => handleNavClick("ai")} />
            </div>
          </div>
        </nav>

        {/* Bottom items */}
        <div className={cn("pb-5", collapsed ? "px-2" : "px-3")}>
          <div className="h-px bg-white/8 mb-2" />
          {BOTTOM_ITEMS.map(item => (
            <SidebarRow
              key={item.id}
              item={item}
              active={activePage === item.id}
              collapsed={collapsed}
              onClick={item.id === "avatar" ? onExit : () => handleNavClick(item.id)}
            />
          ))}
        </div>
      </aside>

      {/* Content */}
      <main className={cn(
        "flex-1 overflow-y-auto transition-all duration-200",
        "ml-0 pt-12 md:pt-0",
        collapsed ? "md:ml-[60px]" : "md:ml-[220px]"
      )}>
        {renderContent()}
      </main>
    </div>
  )
}

// ── Row ───────────────────────────────────────────────────────────────────────

function SidebarRow({
  item, active, collapsed, accent = false, chevron, onClick,
}: {
  item: { id: string; label: string; icon: React.ElementType }
  active: boolean
  collapsed: boolean
  accent?: boolean
  chevron?: "right" | "down"
  onClick: () => void
}) {
  const Icon = item.icon
  return (
    <button
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        "w-full flex items-center gap-2.5 rounded-lg text-sm transition-all text-left",
        collapsed ? "justify-center p-2" : "px-2.5 py-1.5",
        active
          ? "bg-[#5528FF] text-white font-medium"
          : accent ? "text-white/50 hover:text-white hover:bg-white/8"
                   : "text-white/50 hover:text-white hover:bg-white/8"
      )}
    >
      <Icon className="h-[15px] w-[15px] shrink-0" />
      {!collapsed && <span className="truncate flex-1">{item.label}</span>}
      {!collapsed && chevron === "right" && <ChevronRight className="h-3 w-3 shrink-0 text-white/30" />}
      {!collapsed && chevron === "down" && <ChevronDown className="h-3 w-3 shrink-0 text-white/30" />}
      {!collapsed && !chevron && active && !accent && <ChevronRight className="h-3 w-3 shrink-0 opacity-40" />}
    </button>
  )
}
