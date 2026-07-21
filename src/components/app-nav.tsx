import * as React from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  LayoutGrid,
  Layers,
  SquareStack,
  Building2,
  FileText,
  CalendarDays,
  ShieldCheck,
  Users,
  Handshake,
  ClipboardList,
  UsersRound,
  ListChecks,
  Wallet,
  Scale,
  BarChart2,
  Calculator,
  Sparkle,
  Activity,
  BellRing,
  UserCircle,
  ChevronRight,
  ChevronDown,
  Menu,
  X as XIcon,
  Search,
  Archive,
  type LucideIcon,
} from "lucide-react"

interface NavChild {
  id: string
  label: string
  icon: LucideIcon
}

interface NavItem {
  id: string
  label: string
  icon?: LucideIcon
  children?: NavChild[]
  divider?: boolean
}

const portfolioItems: NavItem[] = []

const navStructure: NavItem[] = [
  { id: "dashboard",    label: "Overview",     icon: LayoutGrid },
  { id: "stacking",     label: "Stacking plan", icon: Layers, children: [
    { id: "spaces",     label: "Spaces",        icon: SquareStack },
  ]},
  { id: "leases",       label: "Leases",        icon: FileText, children: [
    { id: "critical-dates",    label: "Critical dates",    icon: CalendarDays },
    { id: "options-rights",    label: "Options & rights",  icon: ShieldCheck },
  ]},
  { id: "tenants",      label: "Tenants",       icon: Users },
  { id: "deals",        label: "Deals",         icon: Handshake, children: [
    { id: "requirements",      label: "Requirements",      icon: ListChecks },
    { id: "deal-tasks",        label: "Deal tasks",        icon: ClipboardList },
    { id: "tenant-coord",      label: "Tenant coordination", icon: UsersRound },
  ]},
  { id: "planning",     label: "Planning",      icon: Calculator, children: [
    { id: "budgets",    label: "Budgets",       icon: Wallet },
    { id: "appraisals", label: "Appraisals",    icon: Scale },
    { id: "comps",      label: "Comps",         icon: BarChart2 },
  ]},
  { id: "doc-vault",    label: "Doc vault",     icon: Archive },
]

const aiItem = { id: "ai", label: "VTS Agents", icon: Sparkle, accent: true, small: false }

const bottomItems = [
  { id: "activity",   label: "Activity feed",            icon: Activity,    accent: false, small: true },
  { id: "reminders",  label: "Reminders",                icon: BellRing,    accent: false, small: true },
  { id: "avatar",     label: "Profile",                  icon: UserCircle,  accent: false, small: true },
]


// ── Nav item row ─────────────────────────────────────────────────────────────

interface NavRowProps {
  id: string
  label: string
  icon?: LucideIcon
  active: boolean
  collapsed: boolean
  sub?: boolean
  small?: boolean
  accent?: boolean
  onClick: () => void
}

function NavRow({ label, icon: Icon, active, collapsed, sub = false, small = false, accent = false, onClick }: NavRowProps) {
  const isSmall = sub || small
  const el = (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => (e.key === "Enter" || e.key === " ") && onClick()}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-xl transition-colors cursor-pointer select-none outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring",
        collapsed ? "justify-center p-3 w-full" : "px-3 w-full",
        isSmall && !collapsed ? "py-2" : "py-2.5",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : accent
            ? "text-sidebar-primary hover:bg-sidebar-accent/60 hover:text-sidebar-primary"
            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
      )}
    >
      {Icon && <Icon className={cn("shrink-0", isSmall ? "h-3.5 w-3.5" : "h-[18px] w-[18px]")} />}
      {!collapsed && (
        <span className={cn("truncate", isSmall ? "text-xs font-normal" : "text-sm font-medium")}>
          {label}
        </span>
      )}
    </div>
  )

  if (!collapsed) return el

  return (
    <Tooltip>
      <TooltipTrigger render={<div />}>{el}</TooltipTrigger>
      <TooltipContent side="right" className="bg-[oklch(0.22_0.18_278)] text-white border-transparent text-xs font-medium" arrowClassName="fill-[oklch(0.22_0.18_278)]">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

// ── Desktop sidebar ──────────────────────────────────────────────────────────

interface Portfolio {
  id: string
  name: string
  assetIds: string[]
}

interface DesktopNavProps {
  className?: string
  onCollapsedChange?: (collapsed: boolean) => void
  assets?: Array<{ id: string; name: string; address: string }>
  portfolios?: Portfolio[]
  selectedAssetId?: string
  onAssetChange?: (id: string) => void
  onLogoClick?: () => void
  onNavItemClick?: (id: string) => void
  activePage?: string
}

function DesktopNav({ className, onCollapsedChange, assets, portfolios, selectedAssetId, onAssetChange, onLogoClick, onNavItemClick, activePage }: DesktopNavProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [active, setActive] = React.useState(activePage ?? "dashboard")

  React.useEffect(() => {
    if (activePage) setActive(activePage)
  }, [activePage])
  const [openSections, setOpenSections] = React.useState<Set<string>>(new Set())
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const selectorRef = React.useRef<HTMLDivElement>(null)
  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  const searchRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [dropdownOpen])

  React.useEffect(() => {
    if (dropdownOpen) setTimeout(() => searchRef.current?.focus(), 50)
    else setSearch("")
  }, [dropdownOpen])

  const toggle = (val: boolean) => {
    setCollapsed(val)
    onCollapsedChange?.(val)
    if (!val) {
      // When expanding, re-open the section that owns the active item
      const parentSection = navStructure.find(item =>
        item.id === active || item.children?.some(c => c.id === active)
      )
      if (parentSection?.children?.length) {
        setOpenSections(new Set([parentSection.id]))
      }
    }
  }

  const selectedAsset = assets?.find(a => a.id === selectedAssetId)
  const selectedPortfolio = portfolios?.find(p => p.id === selectedAssetId)
  const selectorLabel = selectedAssetId === "all" ? "All assets" : (selectedAsset?.name ?? selectedPortfolio?.name ?? "Select asset")

  const filteredNav = React.useMemo(() => {
    const isPortfolioOrAll = selectedAssetId === "all" || (portfolios ?? []).some(p => p.id === selectedAssetId)
    const base = navStructure.filter(item => !isPortfolioOrAll || item.id !== "stacking")
    if (!isPortfolioOrAll) return base
    const dashIdx = base.findIndex(i => i.id === "dashboard")
    return [...base.slice(0, dashIdx + 1), ...portfolioItems, ...base.slice(dashIdx + 1)]
  }, [selectedAssetId, portfolios])

  return (
    <nav
      className={cn(
        "fixed left-4 top-4 bottom-4 z-50",
        "flex flex-col rounded-2xl",
        "bg-sidebar backdrop-blur-md border border-sidebar-border",
        "shadow-xl shadow-black/30 nav-glow",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-[56px] py-4 px-2" : "w-[216px] py-4 px-3",
        className
      )}
    >
      {/* Logo */}
      <div
        className="relative flex items-center justify-center mb-4 px-1 overflow-hidden cursor-pointer"
        onClick={onLogoClick}
        title="Toggle dark mode"
      >
        {collapsed ? (
          <svg viewBox="0 0 167 121" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[1.12rem] w-auto shrink-0 opacity-90">
            <path d="M83.474 27.0968L111.087 45.4473L131.517 31.9276L83.474 -5.4248e-06L83.4063 0.0453396L35.3484 31.9807L55.7765 45.5005L83.4063 27.1411L83.474 27.0968Z" fill="white"/>
            <path d="M83.3916 85.4912L0 33.1923V68.0767L83.3916 120.375L83.4063 120.367L166.811 68.0622V33.1751L83.4063 85.4814L83.3916 85.4912Z" fill="white"/>
          </svg>
        ) : (
          <svg width="555" height="160" viewBox="0 0 555 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[1.4rem] w-auto shrink-0 opacity-90">
            <path d="M262.948 37.923L282.271 99.5913L301.591 37.923H321.723L293.26 121.804H270.12L241.889 37.923H262.948Z" fill="white"/>
            <path d="M378.745 55.2793H351.903V37.923H425.601V55.2793H398.645V121.804H378.745V55.2793Z" fill="white"/>
            <path d="M491.06 52.3862C483.422 52.3862 477.756 55.2794 477.756 60.4835C477.756 64.6518 481.688 67.6581 487.475 68.9305L498.928 71.2439C512.464 74.021 529.588 78.1862 529.588 95.7721C529.588 113.358 511.885 123.31 494.416 123.31C472.895 123.31 458.78 112.549 455.771 94.4997H475.441C477.639 103.293 484.581 107.342 494.879 107.342C501.588 107.342 509.224 105.144 509.224 98.2023C509.224 92.7658 502.747 90.1023 493.604 88.1371L483.422 86.0533C469.77 83.1633 457.392 76.6841 457.392 61.6418C457.392 44.519 475.788 36.5351 492.217 36.5351C508.646 36.5351 524.265 43.7095 527.158 62.2215H507.604C505.636 55.9721 499.506 52.3862 491.06 52.3862Z" fill="white"/>
            <path d="M108.553 46.9088L136.165 65.2593L156.596 51.7396L108.553 19.812L108.485 19.8573L60.427 51.7926L80.8551 65.3125L108.485 46.953L108.553 46.9088Z" fill="white"/>
            <path d="M108.47 105.303L25.0786 53.0043V87.8887L108.47 140.187L108.485 140.179L191.889 87.8741V52.9871L108.485 105.293L108.47 105.303Z" fill="white"/>
          </svg>
        )}
      </div>

      {/* Expand/collapse toggle */}
      <Tooltip>
        <TooltipTrigger render={<div className="absolute -right-3.5 top-4" />}>
          <button
            onClick={() => toggle(!collapsed)}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            className="flex items-center justify-center rounded-full p-1 text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors bg-sidebar border border-white/30 shadow-md"
          >
            <ChevronRight className={cn("h-3 w-3 transition-transform duration-300", !collapsed && "rotate-180")} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-[oklch(0.22_0.18_278)] text-white border-transparent text-xs font-medium" arrowClassName="fill-[oklch(0.22_0.18_278)]">
          {collapsed ? "Expand" : "Collapse"}
        </TooltipContent>
      </Tooltip>

      {/* Asset selector */}
      {assets && assets.length > 0 && (
        <div className="relative mb-2" ref={selectorRef}>
          {/* Trigger */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger render={<div />}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={selectorLabel}
                  onClick={() => setDropdownOpen(v => !v)}
                  onKeyDown={e => (e.key === "Enter" || e.key === " ") && setDropdownOpen(v => !v)}
                  className={cn(
                    "flex items-center justify-center p-3 w-full rounded-xl transition-colors cursor-pointer",
                    dropdownOpen ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                  )}
                >
                  <Building2 className="h-[18px] w-[18px] shrink-0" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[oklch(0.22_0.18_278)] text-white border-transparent text-xs font-medium" arrowClassName="fill-[oklch(0.22_0.18_278)]">
                {selectorLabel}
              </TooltipContent>
            </Tooltip>
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={() => setDropdownOpen(v => !v)}
              onKeyDown={e => (e.key === "Enter" || e.key === " ") && setDropdownOpen(v => !v)}
              className={cn(
                "rounded-xl px-3 py-2.5 w-full flex items-center gap-2.5 cursor-pointer transition-colors border",
                dropdownOpen
                  ? "bg-sidebar-accent/70 border-sidebar-foreground/30 dark:bg-white/20 dark:border-white/30"
                  : "bg-sidebar-accent/40 border-sidebar-foreground/20 hover:bg-sidebar-accent/60 dark:bg-white/12 dark:border-white/20 dark:hover:bg-white/18"
              )}
            >
              <Building2 className="h-[18px] w-[18px] shrink-0 text-sidebar-foreground/60" />
              <span className="text-sm font-medium text-sidebar-foreground flex-1">
                {selectorLabel}
              </span>
              <ChevronDown className={cn("h-4 w-4 shrink-0 text-sidebar-foreground/60 transition-transform duration-200", dropdownOpen && "rotate-180")} />
            </div>
          )}

          {/* Floating popover */}
          {dropdownOpen && (() => {
            const q = search.trim().toLowerCase()
            const filteredAssets = assets.filter(a =>
              a.name.toLowerCase().includes(q) || a.address.toLowerCase().includes(q)
            )
            const filteredPortfolios = (portfolios ?? []).filter(p =>
              p.name.toLowerCase().includes(q)
            )
            const select = (id: string) => { onAssetChange?.(id); setDropdownOpen(false) }
            return (
              <div
                className={cn(
                  "absolute z-[200] w-[340px]",
                  collapsed ? "top-0 left-[calc(100%+12px)]" : "top-full left-0 mt-1"
                )}
              >
                <div className="rounded-xl border border-sidebar-border bg-sidebar shadow-xl shadow-black/40 overflow-hidden flex flex-col">
                  {/* Search */}
                  <div className="px-2.5 pt-2.5 pb-2 border-b border-sidebar-border">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-sidebar-accent/40">
                      <Search className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/40" />
                      <input
                        ref={searchRef}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search properties…"
                        className="flex-1 bg-transparent text-xs text-sidebar-foreground placeholder:text-sidebar-foreground/40 outline-none"
                      />
                    </div>
                  </div>

                  <div className="max-h-[480px] overflow-y-auto">
                    {/* All assets option */}
                    {!q && (
                      <div className="px-1.5 pt-2 pb-1">
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => select("all")}
                          onKeyDown={e => (e.key === "Enter" || e.key === " ") && select("all")}
                          className={cn(
                            "flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg cursor-pointer transition-colors",
                            selectedAssetId === "all" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                          )}
                        >
                          <div className="h-8 w-8 rounded-md bg-sidebar-primary/20 flex items-center justify-center shrink-0">
                            <Layers className="h-[18px] w-[18px] text-sidebar-primary" />
                          </div>
                          <span className="text-sm font-medium">All assets</span>
                          {selectedAssetId === "all" && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary shrink-0" />}
                        </div>
                      </div>
                    )}
                    {/* Portfolios section */}
                    {filteredPortfolios.length > 0 && (
                      <div className="px-1.5 pt-2 pb-1">
                        <p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/50">Portfolios</p>
                        {filteredPortfolios.map(p => (
                          <div
                            key={p.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => select(p.id)}
                            onKeyDown={e => (e.key === "Enter" || e.key === " ") && select(p.id)}
                            className={cn(
                              "flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg cursor-pointer transition-colors",
                              selectedAssetId === p.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                            )}
                          >
                            <div className="h-8 w-8 rounded-md bg-sidebar-primary/20 flex items-center justify-center shrink-0">
                              <Layers className="h-[18px] w-[18px] text-sidebar-primary" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-medium truncate">{p.name}</span>
                              <span className="text-xs text-sidebar-foreground/60">{p.assetIds.length} properties</span>
                            </div>
                            {selectedAssetId === p.id && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary shrink-0" />}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Assets section */}
                    {filteredAssets.length > 0 && (
                      <div className="px-1.5 pt-2 pb-1.5">
                        <p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/50">Properties</p>
                        {filteredAssets.map(asset => {
                          const isSelected = asset.id === selectedAssetId
                          return (
                            <div
                              key={asset.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => select(asset.id)}
                              onKeyDown={e => (e.key === "Enter" || e.key === " ") && select(asset.id)}
                              className={cn(
                                "flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg cursor-pointer transition-colors",
                                isSelected ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                              )}
                            >
                              <Building2 className="h-[18px] w-[18px] shrink-0 opacity-50" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium truncate">{asset.name}</span>
                                <span className="text-xs text-sidebar-foreground/60 truncate">{asset.address}</span>
                              </div>
                              {isSelected && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary shrink-0" />}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {filteredAssets.length === 0 && filteredPortfolios.length === 0 && (
                      <div className="px-4 py-6 text-center text-xs text-sidebar-foreground/50">No results for "{search}"</div>
                    )}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Main nav */}
      <div className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
        {filteredNav.map(item => {
          if (item.divider) return <Separator key={item.id} className="my-1.5 bg-sidebar-border" />

          const hasChildren = !!item.children?.length
          const isOpen = openSections.has(item.id)
          const isChildActive = !!item.children?.some(c => c.id === active)

          return (
            <React.Fragment key={item.id}>
              {/* Parent row — clicking the chevron toggles, clicking the label sets active */}
              {hasChildren && !collapsed ? (
                <div className={cn(
                  "flex items-center gap-2.5 rounded-xl text-sm transition-colors select-none",
                  active === item.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => { setActive(item.id); onNavItemClick?.(item.id); setOpenSections(new Set([item.id])) }}
                    onKeyDown={e => (e.key === "Enter" || e.key === " ") && (setActive(item.id), onNavItemClick?.(item.id), setOpenSections(new Set([item.id])))}
                    className="flex items-center gap-2.5 flex-1 px-2.5 py-2 cursor-pointer font-medium"
                  >
                    {item.icon && <item.icon className="h-[18px] w-[18px] shrink-0" />}
                    <span className="truncate">{item.label}</span>
                  </div>
                  <button
                    onClick={() => toggleSection(item.id)}
                    className="pr-2 text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
                    aria-label={isOpen ? "Collapse section" : "Expand section"}
                  >
                    <ChevronRight className={cn("h-3 w-3 transition-transform duration-200", isOpen && "rotate-90")} />
                  </button>
                </div>
              ) : (
                <NavRow
                  {...item}
                  active={active === item.id}
                  collapsed={collapsed}
                  onClick={() => {
                    setActive(item.id)
                    onNavItemClick?.(item.id)
                    if (hasChildren) toggleSection(item.id)
                    else setOpenSections(new Set())
                  }}
                />
              )}

              {/* Children */}
              {((!collapsed && isOpen) || (collapsed && (active === item.id || isChildActive))) && item.children?.map(child => (
                <div key={child.id} className={cn(!collapsed && "pl-3")}>
                  <NavRow
                    {...child}
                    active={active === child.id}
                    collapsed={collapsed}
                    sub={!collapsed}
                    onClick={() => { setActive(child.id); onNavItemClick?.(child.id); setOpenSections(new Set([item.id])) }}
                  />
                </div>
              ))}
            </React.Fragment>
          )
        })}

        {/* VTS Agents */}
        <NavRow
          key={aiItem.id}
          {...aiItem}
          active={active === aiItem.id}
          collapsed={collapsed}
          onClick={() => { setActive(aiItem.id); onNavItemClick?.(aiItem.id) }}
        />
      </div>

      <Separator className="my-3 bg-sidebar-border" />

      {/* Bottom items */}
      <div className="flex flex-col gap-0.5">
        {bottomItems.map(item => (
          <NavRow
            key={item.id}
            {...item}
            active={active === item.id}
            collapsed={collapsed}
            onClick={() => { setActive(item.id); onNavItemClick?.(item.id) }}
          />
        ))}
      </div>
    </nav>
  )
}


// ── Mobile ───────────────────────────────────────────────────────────────────

interface MobileNavProps {
  onLogoClick?: () => void
  onNavItemClick?: (id: string) => void
  activePage?: string
  assets?: Array<{ id: string; name: string; address: string }>
  portfolios?: Portfolio[]
  selectedAssetId?: string
  onAssetChange?: (id: string) => void
}

function MobileNav({ onLogoClick, onNavItemClick, activePage, assets, portfolios, selectedAssetId, onAssetChange }: MobileNavProps) {
  const [active, setActive] = React.useState(activePage ?? "dashboard")
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [openSections, setOpenSections] = React.useState<Set<string>>(new Set())
  const [assetDropdownOpen, setAssetDropdownOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const searchRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => { if (activePage) setActive(activePage) }, [activePage])
  React.useEffect(() => {
    if (assetDropdownOpen) setTimeout(() => searchRef.current?.focus(), 50)
    else setSearch("")
  }, [assetDropdownOpen])

  const handleSelect = (id: string) => {
    setActive(id)
    setSheetOpen(false)
    onNavItemClick?.(id)
  }

  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectedAsset = assets?.find(a => a.id === selectedAssetId)
  const selectedPortfolio = portfolios?.find(p => p.id === selectedAssetId)
  const selectorLabel = selectedAssetId === "all" ? "All assets" : (selectedAsset?.name ?? selectedPortfolio?.name ?? "Select asset")

  const filteredNav = React.useMemo(() => {
    const isPortfolioOrAll = selectedAssetId === "all" || (portfolios ?? []).some(p => p.id === selectedAssetId)
    const base = navStructure.filter(item => !isPortfolioOrAll || item.id !== "stacking")
    if (!isPortfolioOrAll) return base
    const dashIdx = base.findIndex(i => i.id === "dashboard")
    return [...base.slice(0, dashIdx + 1), ...portfolioItems, ...base.slice(dashIdx + 1)]
  }, [selectedAssetId, portfolios])

  const VTSLogo = () => (
    <svg width="555" height="160" viewBox="0 0 555 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[1.4rem] w-auto opacity-90">
      <path d="M262.948 37.923L282.271 99.5913L301.591 37.923H321.723L293.26 121.804H270.12L241.889 37.923H262.948Z" fill="white"/>
      <path d="M378.745 55.2793H351.903V37.923H425.601V55.2793H398.645V121.804H378.745V55.2793Z" fill="white"/>
      <path d="M491.06 52.3862C483.422 52.3862 477.756 55.2794 477.756 60.4835C477.756 64.6518 481.688 67.6581 487.475 68.9305L498.928 71.2439C512.464 74.021 529.588 78.1862 529.588 95.7721C529.588 113.358 511.885 123.31 494.416 123.31C472.895 123.31 458.78 112.549 455.771 94.4997H475.441C477.639 103.293 484.581 107.342 494.879 107.342C501.588 107.342 509.224 105.144 509.224 98.2023C509.224 92.7658 502.747 90.1023 493.604 88.1371L483.422 86.0533C469.77 83.1633 457.392 76.6841 457.392 61.6418C457.392 44.519 475.788 36.5351 492.217 36.5351C508.646 36.5351 524.265 43.7095 527.158 62.2215H507.604C505.636 55.9721 499.506 52.3862 491.06 52.3862Z" fill="white"/>
      <path d="M108.553 46.9088L136.165 65.2593L156.596 51.7396L108.553 19.812L108.485 19.8573L60.427 51.7926L80.8551 65.3125L108.485 46.953L108.553 46.9088Z" fill="white"/>
      <path d="M108.47 105.303L25.0786 53.0043V87.8887L108.47 140.187L108.485 140.179L191.889 87.8741V52.9871L108.485 105.293L108.47 105.303Z" fill="white"/>
    </svg>
  )

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 h-14">
        <span onClick={onLogoClick} className="cursor-pointer"><VTSLogo /></span>
        <button onClick={() => setSheetOpen(true)} aria-label="Open menu"
          className="flex items-center justify-center h-9 w-9 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors">
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {sheetOpen && <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setSheetOpen(false)} />}

      <div className={cn(
        "fixed top-0 left-0 z-[60] h-full w-[280px] bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out",
        sheetOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-sidebar-border shrink-0">
          <VTSLogo />
          <button onClick={() => setSheetOpen(false)}
            className="flex items-center justify-center h-8 w-8 rounded-xl text-sidebar-foreground/50 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors">
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden px-3 py-3">
          {/* Asset selector */}
          {assets && assets.length > 0 && (
            <div className="relative mb-2">
              <div role="button" tabIndex={0}
                onClick={() => setAssetDropdownOpen(v => !v)}
                onKeyDown={e => (e.key === "Enter" || e.key === " ") && setAssetDropdownOpen(v => !v)}
                className={cn(
                  "rounded-xl px-3 py-2.5 w-full flex items-center gap-2.5 cursor-pointer transition-colors border border-sidebar-foreground/20",
                  assetDropdownOpen ? "bg-sidebar-accent/70 dark:bg-sidebar-accent" : "bg-sidebar-accent/40 hover:bg-sidebar-accent/60 dark:bg-sidebar-accent dark:hover:bg-sidebar-accent"
                )}>
                <Building2 className="h-[18px] w-[18px] shrink-0 text-sidebar-foreground/60" />
                <span className="text-sm font-medium text-sidebar-foreground flex-1">
                  {selectorLabel}
                </span>
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-sidebar-foreground/60 transition-transform duration-200", assetDropdownOpen && "rotate-180")} />
              </div>

              {assetDropdownOpen && (() => {
                const q = search.trim().toLowerCase()
                const filteredAssets = (assets ?? []).filter(a => a.name.toLowerCase().includes(q) || a.address.toLowerCase().includes(q))
                const filteredPortfolios = (portfolios ?? []).filter(p => p.name.toLowerCase().includes(q))
                const select = (id: string) => { onAssetChange?.(id); setAssetDropdownOpen(false) }
                return (
                  <>
                    <div className="fixed inset-0 z-[199]" onClick={() => setAssetDropdownOpen(false)} />
                    <div className="fixed left-3 right-3 top-[130px] z-[200] rounded-xl border border-sidebar-border bg-sidebar shadow-xl shadow-black/40 overflow-hidden flex flex-col">
                      <div className="px-2.5 pt-2.5 pb-2 border-b border-sidebar-border">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-sidebar-accent/40">
                          <Search className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/40" />
                          <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search properties…"
                            className="flex-1 bg-transparent text-xs text-sidebar-foreground placeholder:text-sidebar-foreground/40 outline-none" />
                        </div>
                      </div>
                      <div className="max-h-[280px] overflow-y-auto">
                        {!q && (
                          <div className="px-1.5 pt-2 pb-1">
                            <div role="button" tabIndex={0} onClick={() => select("all")} onKeyDown={e => (e.key === "Enter" || e.key === " ") && select("all")}
                              className={cn("flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg cursor-pointer transition-colors", selectedAssetId === "all" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/60")}>
                              <div className="h-8 w-8 rounded-md bg-sidebar-primary/20 flex items-center justify-center shrink-0">
                                <Layers className="h-[18px] w-[18px] text-sidebar-primary" />
                              </div>
                              <span className="text-sm font-medium">All assets</span>
                              {selectedAssetId === "all" && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary shrink-0" />}
                            </div>
                          </div>
                        )}
                        {filteredPortfolios.length > 0 && (
                          <div className="px-1.5 pt-2 pb-1">
                            <p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/50">Portfolios</p>
                            {filteredPortfolios.map(p => (
                              <div key={p.id} role="button" tabIndex={0} onClick={() => select(p.id)} onKeyDown={e => (e.key === "Enter" || e.key === " ") && select(p.id)}
                                className={cn("flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg cursor-pointer transition-colors", selectedAssetId === p.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/60")}>
                                <div className="h-8 w-8 rounded-md bg-sidebar-primary/20 flex items-center justify-center shrink-0">
                                  <Layers className="h-[18px] w-[18px] text-sidebar-primary" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-sm font-medium truncate">{p.name}</span>
                                  <span className="text-xs text-sidebar-foreground/60">{p.assetIds.length} properties</span>
                                </div>
                                {selectedAssetId === p.id && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary shrink-0" />}
                              </div>
                            ))}
                          </div>
                        )}
                        {filteredAssets.length > 0 && (
                          <div className="px-1.5 pt-2 pb-1.5">
                            <p className="px-2 pb-1 text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/50">Properties</p>
                            {filteredAssets.map(asset => (
                              <div key={asset.id} role="button" tabIndex={0} onClick={() => select(asset.id)} onKeyDown={e => (e.key === "Enter" || e.key === " ") && select(asset.id)}
                                className={cn("flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg cursor-pointer transition-colors", asset.id === selectedAssetId ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/60")}>
                                <Building2 className="h-[18px] w-[18px] shrink-0 opacity-50" />
                                <div className="flex flex-col min-w-0">
                                  <span className="text-sm font-medium truncate">{asset.name}</span>
                                  <span className="text-xs text-sidebar-foreground/60 truncate">{asset.address}</span>
                                </div>
                                {asset.id === selectedAssetId && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary shrink-0" />}
                              </div>
                            ))}
                          </div>
                        )}
                        {filteredAssets.length === 0 && filteredPortfolios.length === 0 && (
                          <div className="px-4 py-6 text-center text-xs text-sidebar-foreground/50">No results for "{search}"</div>
                        )}
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
          )}

          <Separator className="mb-2 bg-sidebar-border" />

          {/* Main nav */}
          <div className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
            {filteredNav.map(item => {
              if (item.divider) return <Separator key={item.id} className="my-1.5 bg-sidebar-border" />
              const hasChildren = !!item.children?.length
              const isOpen = openSections.has(item.id)
              return (
                <React.Fragment key={item.id}>
                  {hasChildren ? (
                    <div className={cn(
                      "flex items-center gap-2.5 rounded-xl text-sm transition-colors select-none",
                      active === item.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                    )}>
                      <div role="button" tabIndex={0}
                        onClick={() => { handleSelect(item.id); setOpenSections(new Set([item.id])) }}
                        onKeyDown={e => (e.key === "Enter" || e.key === " ") && (handleSelect(item.id), setOpenSections(new Set([item.id])))}
                        className="flex items-center gap-2.5 flex-1 px-2.5 py-2 cursor-pointer font-medium">
                        {item.icon && <item.icon className="h-[18px] w-[18px] shrink-0" />}
                        <span className="truncate">{item.label}</span>
                      </div>
                      <button onClick={() => toggleSection(item.id)}
                        className="pr-2 text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
                        aria-label={isOpen ? "Collapse" : "Expand"}>
                        <ChevronRight className={cn("h-3 w-3 transition-transform duration-200", isOpen && "rotate-90")} />
                      </button>
                    </div>
                  ) : (
                    <NavRow {...item} active={active === item.id} collapsed={false} onClick={() => { handleSelect(item.id); setOpenSections(new Set()) }} />
                  )}
                  {isOpen && item.children?.map(child => (
                    <div key={child.id} className="pl-3">
                      <NavRow {...child} active={active === child.id} collapsed={false} sub onClick={() => { handleSelect(child.id); setOpenSections(new Set([item.id])) }} />
                    </div>
                  ))}
                </React.Fragment>
              )
            })}

            <NavRow {...aiItem} active={active === aiItem.id} collapsed={false} onClick={() => handleSelect(aiItem.id)} />
          </div>

          <Separator className="my-2 bg-sidebar-border" />

          {/* Bottom items */}
          <div className="flex flex-col gap-0.5">
            {bottomItems.map(item => (
              <NavRow key={item.id} {...item} active={active === item.id} collapsed={false} onClick={() => handleSelect(item.id)} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// ── Export ───────────────────────────────────────────────────────────────────

interface AppNavProps {
  className?: string
  onCollapsedChange?: (collapsed: boolean) => void
  assets?: Array<{ id: string; name: string; address: string }>
  portfolios?: Portfolio[]
  selectedAssetId?: string
  onAssetChange?: (id: string) => void
  onLogoClick?: () => void
  onNavItemClick?: (id: string) => void
  activePage?: string
}

export function AppNav({ className, onCollapsedChange, assets, portfolios, selectedAssetId, onAssetChange, onLogoClick, onNavItemClick, activePage }: AppNavProps) {
  const isMobile = useIsMobile()
  if (isMobile) return <MobileNav onLogoClick={onLogoClick} onNavItemClick={onNavItemClick} activePage={activePage} assets={assets} portfolios={portfolios} selectedAssetId={selectedAssetId} onAssetChange={onAssetChange} />
  return <DesktopNav className={className} onCollapsedChange={onCollapsedChange} assets={assets} portfolios={portfolios} selectedAssetId={selectedAssetId} onAssetChange={onAssetChange} onLogoClick={onLogoClick} onNavItemClick={onNavItemClick} activePage={activePage} />
}
