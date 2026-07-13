import * as React from "react"
import { cn } from "@/lib/utils"
import { VTSLogo } from "@/components/vts-logo"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
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
  TrendingUp,
  FileBarChart,
  Globe,
  MapPin,
  BookOpen,
  Share2,
  MessageSquare,
  Sparkles,
  Activity,
  BellRing,
  UserCircle,
  Settings,
  ChevronRight,
  ChevronDown,
  Menu,
  X as XIcon,
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

const portfolioItems: NavItem[] = [
  { id: "assets", label: "Assets", icon: Building2, children: [
    { id: "markets", label: "Markets", icon: Globe },
    { id: "cities",  label: "Cities",  icon: MapPin },
  ]},
]

const navStructure: NavItem[] = [
  { id: "dashboard",    label: "Dashboard",    icon: LayoutGrid },
  { id: "stacking",     label: "Stacking Plan", icon: Layers, children: [
    { id: "spaces",     label: "Spaces",        icon: SquareStack },
  ]},
  { id: "leases",       label: "Leases",        icon: FileText, children: [
    { id: "critical-dates",    label: "Critical Dates",    icon: CalendarDays },
    { id: "options-rights",    label: "Options & Rights",  icon: ShieldCheck },
    { id: "tenants",           label: "Tenants",           icon: Users },
  ]},
  { id: "deals",        label: "Deals",         icon: Handshake, children: [
    { id: "deal-tasks",        label: "Deal Tasks",        icon: ClipboardList },
    { id: "tenant-coord",      label: "Tenant Coordination", icon: UsersRound },
    { id: "requirements",      label: "Requirements",      icon: ListChecks },
  ]},
  { id: "budgets",      label: "Budgets",       icon: Wallet },
  { id: "appraisals",   label: "Appraisals",    icon: Scale },
  { id: "comps",        label: "Comps",         icon: BarChart2 },
  { id: "div-insights", label: "",              divider: true },
  { id: "market",       label: "Market",        icon: Globe, children: [
    { id: "buildings",          label: "Buildings",            icon: Building2 },
    { id: "listings",           label: "Listings",             icon: MapPin },
    { id: "tourbooks",          label: "My Tourbooks",         icon: BookOpen },
    { id: "shares",             label: "My Shares",            icon: Share2 },
    { id: "marketing-analytics",label: "Marketing Analytics",  icon: TrendingUp },
    { id: "inquiries",          label: "Inquiries",            icon: MessageSquare },
  ]},
  { id: "insights",     label: "Insights",      icon: TrendingUp, children: [
    { id: "leasing-activity",    label: "Leasing Activity Report", icon: FileBarChart },
    { id: "portfolio-dashboards",label: "Portfolio Dashboards",    icon: LayoutGrid },
    { id: "portfolio-alerts",    label: "Portfolio Alerts",        icon: BellRing },
    { id: "portfolio-reports",   label: "Portfolio Reports",       icon: ClipboardList },
    { id: "lease-charts",        label: "Lease Charts",            icon: BarChart2 },
  ]},
]

const aiItem = { id: "ai", label: "VTS AI", icon: Sparkles, accent: true, small: false }

const bottomItems = [
  { id: "abstraction",label: "Abstraction Management",  icon: FileText,    accent: false, small: true },
  { id: "activity",   label: "Activity Feed",            icon: Activity,    accent: false, small: true },
  { id: "reminders",  label: "Reminders",                icon: BellRing,    accent: false, small: true },
  { id: "avatar",     label: "Profile",                  icon: UserCircle,  accent: false, small: true },
]

const allFlatItems = [
  ...navStructure.flatMap(item => [item, ...(item.children ?? [])]),
  aiItem,
  ...bottomItems,
]

// ── Nav item row ─────────────────────────────────────────────────────────────

interface NavRowProps {
  id: string
  label: string
  icon: LucideIcon
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
      <Icon className={cn("shrink-0", isSmall ? "h-3.5 w-3.5" : "h-[18px] w-[18px]")} />
      {!collapsed && (
        <span className={cn("truncate", isSmall ? "text-xs font-normal" : "text-sm font-medium")}>
          {label}
        </span>
      )}
    </div>
  )

  if (!collapsed) return el

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger render={<div />}>{el}</TooltipTrigger>
      <TooltipContent side="right" className="bg-sidebar-primary text-sidebar-primary-foreground border-transparent text-xs font-medium" arrowClassName="bg-sidebar-primary fill-sidebar-primary">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

// ── Desktop sidebar ──────────────────────────────────────────────────────────

interface DesktopNavProps {
  className?: string
  onCollapsedChange?: (collapsed: boolean) => void
  assets?: Array<{ id: string; name: string; address: string }>
  selectedAssetId?: string
  onAssetChange?: (id: string) => void
  onLogoClick?: () => void
}

function DesktopNav({ className, onCollapsedChange, assets, selectedAssetId, onAssetChange, onLogoClick }: DesktopNavProps) {
  const [collapsed, setCollapsed] = React.useState(true)
  const [active, setActive] = React.useState("dashboard")
  const [openSections, setOpenSections] = React.useState<Set<string>>(new Set())
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const selectorRef = React.useRef<HTMLDivElement>(null)

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

  const toggle = (val: boolean) => {
    setCollapsed(val)
    onCollapsedChange?.(val)
  }

  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectedAsset = assets?.find(a => a.id === selectedAssetId)

  const filteredNav = React.useMemo(() => {
    const base = navStructure.filter(item => selectedAssetId !== "all" || item.id !== "stacking")
    if (selectedAssetId !== "all") return base
    const dashIdx = base.findIndex(i => i.id === "dashboard")
    return [...base.slice(0, dashIdx + 1), ...portfolioItems, ...base.slice(dashIdx + 1)]
  }, [selectedAssetId])

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
      <Tooltip delayDuration={0}>
        <TooltipTrigger render={<div className="absolute -right-3.5 top-4" />}>
          <button
            onClick={() => toggle(!collapsed)}
            aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
            className="flex items-center justify-center rounded-full p-1 text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors bg-sidebar border border-white/30 shadow-md"
          >
            <ChevronRight className={cn("h-3 w-3 transition-transform duration-300", !collapsed && "rotate-180")} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-sidebar-primary text-sidebar-primary-foreground border-transparent text-xs font-medium" arrowClassName="bg-sidebar-primary fill-sidebar-primary">
          {collapsed ? "Expand" : "Collapse"}
        </TooltipContent>
      </Tooltip>

      {/* Asset selector */}
      {assets && assets.length > 0 && (
        <div className="relative mb-2" ref={selectorRef}>
          {/* Trigger */}
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger render={<div />}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={selectedAsset?.name ?? "Select Asset"}
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
              <TooltipContent side="right" className="bg-sidebar-primary text-sidebar-primary-foreground border-transparent text-xs font-medium" arrowClassName="bg-sidebar-primary fill-sidebar-primary">
                {selectedAsset?.name ?? "Select Asset"}
              </TooltipContent>
            </Tooltip>
          ) : (
            <div
              role="button"
              tabIndex={0}
              onClick={() => setDropdownOpen(v => !v)}
              onKeyDown={e => (e.key === "Enter" || e.key === " ") && setDropdownOpen(v => !v)}
              className={cn(
                "rounded-xl px-2.5 py-2 w-full flex items-center gap-2.5 cursor-pointer transition-colors",
                dropdownOpen ? "bg-sidebar-accent/70" : "bg-sidebar-accent/40 hover:bg-sidebar-accent/60"
              )}
            >
              <Building2 className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/60" />
              <span className="text-xs font-medium text-sidebar-foreground flex-1">
                {selectedAsset?.name ?? "Select Asset"}
              </span>
              <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 text-sidebar-foreground/60 transition-transform duration-200", dropdownOpen && "rotate-180")} />
            </div>
          )}

          {/* Floating popover */}
          {dropdownOpen && (
            <div
              className={cn(
                "absolute z-[200] w-[240px]",
                collapsed ? "top-0 left-[calc(100%+12px)]" : "top-full left-0 mt-1"
              )}
            >
              <div className="rounded-xl border border-sidebar-border bg-sidebar shadow-xl shadow-black/40 overflow-hidden">
                <div className="px-3 pt-3 pb-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/60">Asset</p>
                </div>
                <div className="max-h-[300px] overflow-y-auto px-1.5 pb-1.5 flex flex-col gap-0.5">
                  {assets.map(asset => {
                    const isSelected = asset.id === selectedAssetId
                    return (
                      <div
                        key={asset.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => { onAssetChange?.(asset.id); setDropdownOpen(false) }}
                        onKeyDown={e => (e.key === "Enter" || e.key === " ") && (onAssetChange?.(asset.id), setDropdownOpen(false))}
                        className={cn(
                          "flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer transition-colors",
                          isSelected ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                        )}
                      >
                        {asset.id === "all"
                          ? <Layers className="h-3.5 w-3.5 shrink-0" />
                          : <Building2 className="h-3.5 w-3.5 shrink-0 opacity-60" />
                        }
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold">{asset.name}</span>
                          {asset.address && (
                            <span className="text-sidebar-foreground/70 truncate leading-tight" style={{ fontSize: "10px" }}>{asset.address}</span>
                          )}
                        </div>
                        {isSelected && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary shrink-0" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <Separator className="mb-3 bg-sidebar-border" />

      {/* Main nav */}
      <div className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
        {filteredNav.map(item => {
          if (item.divider) return <Separator key={item.id} className="my-1.5 bg-sidebar-border" />

          const hasChildren = !!item.children?.length
          const isOpen = openSections.has(item.id)

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
                    onClick={() => setActive(item.id)}
                    onKeyDown={e => (e.key === "Enter" || e.key === " ") && setActive(item.id)}
                    className="flex items-center gap-2.5 flex-1 px-2.5 py-2 cursor-pointer font-medium"
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
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
                    if (hasChildren) toggleSection(item.id)
                  }}
                />
              )}

              {/* Children */}
              {!collapsed && isOpen && item.children?.map(child => (
                <div key={child.id} className="pl-3">
                  <NavRow
                    {...child}
                    active={active === child.id}
                    collapsed={false}
                    sub
                    onClick={() => setActive(child.id)}
                  />
                </div>
              ))}
            </React.Fragment>
          )
        })}
        <NavRow
          key={aiItem.id}
          {...aiItem}
          active={active === aiItem.id}
          collapsed={collapsed}
          onClick={() => setActive(aiItem.id)}
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
            onClick={() => setActive(item.id)}
          />
        ))}
      </div>
    </nav>
  )
}

// ── Mobile ───────────────────────────────────────────────────────────────────

const TAB_ITEMS = navStructure.slice(0, 4)

function MobileNav({ onLogoClick }: { onLogoClick?: () => void }) {
  const [active, setActive] = React.useState("dashboard")
  const [sheetOpen, setSheetOpen] = React.useState(false)

  const handleSelect = (id: string) => {
    setActive(id)
    setSheetOpen(false)
  }

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 h-14">
        <svg width="555" height="160" viewBox="0 0 555 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[1.4rem] w-auto opacity-90 cursor-pointer" onClick={onLogoClick}>
          <path d="M262.948 37.923L282.271 99.5913L301.591 37.923H321.723L293.26 121.804H270.12L241.889 37.923H262.948Z" fill="white"/>
          <path d="M378.745 55.2793H351.903V37.923H425.601V55.2793H398.645V121.804H378.745V55.2793Z" fill="white"/>
          <path d="M491.06 52.3862C483.422 52.3862 477.756 55.2794 477.756 60.4835C477.756 64.6518 481.688 67.6581 487.475 68.9305L498.928 71.2439C512.464 74.021 529.588 78.1862 529.588 95.7721C529.588 113.358 511.885 123.31 494.416 123.31C472.895 123.31 458.78 112.549 455.771 94.4997H475.441C477.639 103.293 484.581 107.342 494.879 107.342C501.588 107.342 509.224 105.144 509.224 98.2023C509.224 92.7658 502.747 90.1023 493.604 88.1371L483.422 86.0533C469.77 83.1633 457.392 76.6841 457.392 61.6418C457.392 44.519 475.788 36.5351 492.217 36.5351C508.646 36.5351 524.265 43.7095 527.158 62.2215H507.604C505.636 55.9721 499.506 52.3862 491.06 52.3862Z" fill="white"/>
          <path d="M108.553 46.9088L136.165 65.2593L156.596 51.7396L108.553 19.812L108.485 19.8573L60.427 51.7926L80.8551 65.3125L108.485 46.953L108.553 46.9088Z" fill="white"/>
          <path d="M108.47 105.303L25.0786 53.0043V87.8887L108.47 140.187L108.485 140.179L191.889 87.8741V52.9871L108.485 105.293L108.47 105.303Z" fill="white"/>
        </svg>
        <button
          onClick={() => setSheetOpen(true)}
          aria-label="Open menu"
          className="flex items-center justify-center h-9 w-9 rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Backdrop */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => setSheetOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[280px] bg-sidebar border-r border-sidebar-border flex flex-col px-3 py-4 transition-transform duration-300 ease-in-out",
          sheetOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between mb-4 px-1">
          <svg width="555" height="160" viewBox="0 0 555 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[1.4rem] w-auto opacity-90">
            <path d="M262.948 37.923L282.271 99.5913L301.591 37.923H321.723L293.26 121.804H270.12L241.889 37.923H262.948Z" fill="white"/>
            <path d="M378.745 55.2793H351.903V37.923H425.601V55.2793H398.645V121.804H378.745V55.2793Z" fill="white"/>
            <path d="M491.06 52.3862C483.422 52.3862 477.756 55.2794 477.756 60.4835C477.756 64.6518 481.688 67.6581 487.475 68.9305L498.928 71.2439C512.464 74.021 529.588 78.1862 529.588 95.7721C529.588 113.358 511.885 123.31 494.416 123.31C472.895 123.31 458.78 112.549 455.771 94.4997H475.441C477.639 103.293 484.581 107.342 494.879 107.342C501.588 107.342 509.224 105.144 509.224 98.2023C509.224 92.7658 502.747 90.1023 493.604 88.1371L483.422 86.0533C469.77 83.1633 457.392 76.6841 457.392 61.6418C457.392 44.519 475.788 36.5351 492.217 36.5351C508.646 36.5351 524.265 43.7095 527.158 62.2215H507.604C505.636 55.9721 499.506 52.3862 491.06 52.3862Z" fill="white"/>
            <path d="M108.553 46.9088L136.165 65.2593L156.596 51.7396L108.553 19.812L108.485 19.8573L60.427 51.7926L80.8551 65.3125L108.485 46.953L108.553 46.9088Z" fill="white"/>
            <path d="M108.47 105.303L25.0786 53.0043V87.8887L108.47 140.187L108.485 140.179L191.889 87.8741V52.9871L108.485 105.293L108.47 105.303Z" fill="white"/>
          </svg>
          <button
            onClick={() => setSheetOpen(false)}
            className="flex items-center justify-center h-8 w-8 rounded-xl text-sidebar-foreground/50 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground transition-colors"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col gap-0.5 overflow-y-auto flex-1">
          {allFlatItems.filter(item => !("divider" in item) && item.icon).map(item => (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              onClick={() => handleSelect(item.id)}
              onKeyDown={e => (e.key === "Enter" || e.key === " ") && handleSelect(item.id)}
              aria-current={active === item.id ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer",
                active === item.id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                "accent" in item && item.accent && "text-sidebar-primary hover:text-sidebar-primary"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </div>
          ))}
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
  selectedAssetId?: string
  onAssetChange?: (id: string) => void
  onLogoClick?: () => void
}

export function AppNav({ className, onCollapsedChange, assets, selectedAssetId, onAssetChange, onLogoClick }: AppNavProps) {
  const isMobile = useIsMobile()
  if (isMobile) return <MobileNav onLogoClick={onLogoClick} />
  return <DesktopNav className={className} onCollapsedChange={onCollapsedChange} assets={assets} selectedAssetId={selectedAssetId} onAssetChange={onAssetChange} onLogoClick={onLogoClick} />
}
