import * as React from "react"
import { Sun, Moon, Check, ArrowRight, ChevronRight, CheckCircle2, Loader2, Clock, Sparkle, LayoutGrid, FileText, Handshake, Calculator, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn, cardBase } from "@/lib/utils"
import { AgentBtn } from "@/components/agent-btn"

// ── Data ─────────────────────────────────────────────────────────────────────

const COLOR_SECTIONS = [
  {
    title: "Primary",
    tokens: [
      { name: "Primary",            role: "Action / Active",   var: "--primary",            description: "The single chromatic anchor. Every primary button, active nav state, and focus ring resolves here. One filled action per view." },
      { name: "Primary Foreground", role: "Text on Primary",   var: "--primary-foreground",  description: "Foreground text and icons placed directly on a primary-filled surface." },
    ],
  },
  {
    title: "Surfaces",
    tokens: [
      { name: "Background", role: "Page canvas",    var: "--background", description: "The base page surface. In light mode it carries a subtle indigo ambient gradient. In dark mode, a faint lavender radial bloom over near-black." },
      { name: "Card",        role: "Raised surface", var: "--card",       description: "Cards and panels one step above the page. Rendered as bg-card/70 with backdrop-blur-md in both light and dark modes." },
      { name: "Muted",       role: "Subtle fill",    var: "--muted",      description: "Table headers, input backgrounds, and any region that needs a quieter fill than card." },
      { name: "Secondary",   role: "Control surface",var: "--secondary",  description: "Secondary button backgrounds and non-primary interactive surfaces." },
    ],
  },
  {
    title: "Text",
    tokens: [
      { name: "Foreground",         role: "Primary text",  var: "--foreground",          description: "All primary body copy and headings." },
      { name: "Muted Foreground",   role: "Supporting",    var: "--muted-foreground",    description: "Labels, captions, placeholders, and de-emphasised metadata." },
      { name: "Card Foreground",    role: "Text on card",  var: "--card-foreground",     description: "Text color on raised card surfaces." },
    ],
  },
  {
    title: "Border & Structure",
    tokens: [
      { name: "Border",  role: "Divider",     var: "--border",  description: "Structural hairlines between regions: table rows, panel edges, and input outlines." },
      { name: "Ring",    role: "Focus",       var: "--ring",    description: "Focus rings on interactive elements, keyboard-navigable without distraction." },
      { name: "Accent",  role: "Hover fill",  var: "--accent",  description: "Hover fills and subtle interactive backgrounds that don't compete with primary." },
    ],
  },
  {
    title: "Sidebar",
    tokens: [
      { name: "Sidebar",               role: "Nav surface",       var: "--sidebar",               description: "Always dark regardless of page mode. Wired to dark-mode values even in light. A fixed orientation anchor." },
      { name: "Sidebar Foreground",    role: "Nav text",          var: "--sidebar-foreground",    description: "Default text and icons inside the sidebar." },
      { name: "Sidebar Primary",       role: "Active accent",     var: "--sidebar-primary",       description: "Active nav item labels and the VTS Agents accent. Brighter than --primary to read on the dark nav surface." },
      { name: "Sidebar Accent",        role: "Hover / selected",  var: "--sidebar-accent",        description: "Hover and selected state fills inside the navigation shell." },
    ],
  },
  {
    title: "System",
    tokens: [
      { name: "Destructive", role: "Error / Danger",   var: "--destructive", description: "Errors, deletion confirmations, and irreversible actions." },
      { name: "Success",     role: "Positive",          var: "--success",     description: "Completion states, positive deltas, and executed deals." },
      { name: "Warning",     role: "Caution",           var: "--warning",     description: "Near-expiry dates, budget risk, and items needing attention." },
      { name: "Declined",    role: "Declined / Lapsed", var: "--declined",    description: "Declined deals, lapsed options, and other negative-but-not-destructive states. A violet rather than red to stay within the indigo family." },
    ],
  },
  {
    title: "Charts",
    tokens: [
      { name: "Chart 1", role: "Primary series",   var: "--chart-1", description: "Matches --primary. The highlighted bar, the active line, the first series." },
      { name: "Chart 2", role: "Second series",    var: "--chart-2", description: "A cooler blue-violet for the second data series, within the indigo family." },
      { name: "Chart 3", role: "Third series",     var: "--chart-3", description: "A mauve-adjacent step, still in the 278–298 hue range." },
      { name: "Chart 4", role: "Fourth series",    var: "--chart-4", description: "Shifts slightly blue for the fourth series." },
      { name: "Chart 5", role: "Fifth series",     var: "--chart-5", description: "A soft blue-grey for the least-emphasized series." },
    ],
  },
]

const TYPE_SCALE = [
  { role: "Display",  meta: "60px · 600 · −0.02em",        className: "text-[60px] font-semibold tracking-[-0.02em] leading-[1.08]",                               sample: "Built for how modern teams work" },
  { role: "H1",       meta: "38px · 600 · −0.018em",       className: "text-[38px] font-semibold tracking-[-0.018em] leading-[1.2]",                               sample: "One workspace, every team" },
  { role: "H2",       meta: "33px · 600 · −0.015em",       className: "text-[33px] font-semibold tracking-[-0.015em] leading-snug",                                sample: "Automate the busywork" },
  { role: "H3",       meta: "20px · 600",                   className: "text-xl font-semibold",                                                                     sample: "Recent agent runs" },
  { role: "Body",     meta: "16px · 400 · 1.6 lh",         className: "text-base text-muted-foreground leading-relaxed max-w-lg",                                  sample: "Standard paragraph and component copy. Geist's open counters and even spacing keep long-form reading comfortable at any surface color, light or dark." },
  { role: "Small",    meta: "14px · 400",                   className: "text-sm text-muted-foreground",                                                             sample: "Helper text, timestamps, and metadata labels." },
  { role: "Eyebrow",  meta: "10px · 500 · uppercase",       className: "text-[10px] font-medium uppercase tracking-widest text-muted-foreground",                   sample: "VTS Agents · Lease risk · 2 min ago" },
  { role: "Mono",     meta: "11.5px · 600 · mono",          className: "font-mono text-[11.5px] font-semibold uppercase tracking-[0.07em] text-primary",            sample: "03 · Typography" },
]

// --radius = 0.5rem (8px). Steps are computed multipliers of that base.
const RADIUS_STEPS = [
  { label: "sm",   cls: "rounded-sm",   px: "~5px",  desc: "Chips, badges, tight labels" },
  { label: "md",   cls: "rounded-md",   px: "~6px",  desc: "Input fields, small rows" },
  { label: "lg",   cls: "rounded-lg",   px: "8px",   desc: "Buttons and tags. The base radius." },
  { label: "xl",   cls: "rounded-xl",   px: "~11px", desc: "Building image thumbnails" },
  { label: "2xl",  cls: "rounded-2xl",  px: "~14px", desc: "Cards, panels, stat tiles" },
  { label: "3xl",  cls: "rounded-3xl",  px: "~18px", desc: "Modals, large overlays" },
  { label: "4xl",  cls: "rounded-4xl",  px: "~21px", desc: "Hero banners, full-page sheets" },
  { label: "full", cls: "rounded-full", px: "∞",     desc: "Pills, avatars, toggle tracks" },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ kicker, title, description }: { kicker: string; title: string; description?: string }) {
  return (
    <div className="mb-10">
      <p className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.07em] text-primary mb-3.5">{kicker}</p>
      <h2 className="text-[33px] font-semibold tracking-[-0.015em] text-foreground mb-3 leading-snug">{title}</h2>
      {description && <p className="text-base text-muted-foreground leading-relaxed max-w-[680px]">{description}</p>}
    </div>
  )
}

function Swatch({ name, role, cssVar, description }: { name: string; role: string; cssVar: string; description: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border bg-card">
      <div className="h-16 bg-[var(--sw)]" style={{ "--sw": `var(${cssVar})` } as React.CSSProperties} />
      <div className="p-3 space-y-1">
        <p className="text-sm font-semibold text-foreground leading-none">{name}</p>
        <p className="text-[10px] font-medium uppercase tracking-wide text-primary">{role}</p>
        <p className="font-mono text-[11px] text-muted-foreground bg-muted rounded px-1.5 py-0.5 inline-block">{cssVar}</p>
        <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">{description}</p>
      </div>
    </div>
  )
}

// Mini wireframe — uses only theme token classes, no hardcoded colors
function MiniPanel({ mode }: { mode: "light" | "dark" }) {
  const dark = mode === "dark"
  return (
    <div className={cn(
      "rounded-2xl overflow-hidden border border-border text-[11px]",
      dark ? "dark bg-background text-foreground" : "force-light bg-background text-foreground"
    )}>
      <div className="flex min-h-[260px]">
        {/* Sidebar — always dark, matching the real nav */}
        <div className="w-32 shrink-0 flex flex-col bg-sidebar border-r border-sidebar-foreground/80">
          {/* Logo */}
          <div className="flex items-center gap-1.5 px-3 py-3 border-b border-sidebar-foreground/80">
            <span className="w-4 h-4 rounded bg-sidebar-primary/20 flex items-center justify-center shrink-0">
              <span className="w-2 h-2 rounded-sm bg-sidebar-primary block" />
            </span>
            <span className="text-[11px] font-bold text-sidebar-foreground">VTS</span>
          </div>
          {/* Building switcher */}
          <div className="px-2 py-2 border-b border-sidebar-foreground/80">
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-sidebar-accent">
              <span className="w-4 h-4 rounded bg-muted-foreground/20 shrink-0" />
              <span className="text-[9px] font-medium text-sidebar-foreground leading-tight truncate">VTS Tower HQ</span>
            </div>
          </div>
          {/* Nav items */}
          <div className="flex flex-col gap-0.5 px-2 py-2 flex-1">
            {[["Overview", true],["Stacking Plan",false],["Leases",false],["Deals",false],["VTS Agents",false]].map(([label, active]) => (
              <div key={String(label)} className={cn(
                "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[9px]",
                active ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" : "text-sidebar-foreground/60"
              )}>
                <span className={cn("w-1 h-1 rounded-full shrink-0", active ? "bg-sidebar-primary" : "bg-sidebar-foreground/25")} />
                {label}
              </div>
            ))}
          </div>
        </div>
        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {/* Building header */}
          <div className="px-4 py-2.5 border-b border-border bg-card/70 backdrop-blur-md flex items-center justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-medium">Built 2017 · Office</p>
              <p className="font-bold text-[13px] text-foreground leading-tight">VTS Tower Headquarters</p>
            </div>
            <span className="text-[9px] px-2 py-1 rounded-full font-semibold bg-primary text-primary-foreground">Ask VTS AI</span>
          </div>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-px border-b border-border bg-border">
            {[["In-Place NOI","$29.1M","+9.4%","text-primary"],["Revenue at Risk","$234K/mo","−$18K","text-destructive"],["Pipeline","$89K/mo","+$12K","text-primary"]].map(([label,val,delta,color]) => (
              <div key={String(label)} className="px-3 py-2 bg-background">
                <p className="text-[8px] uppercase text-muted-foreground mb-0.5">{label}</p>
                <p className="font-bold text-[12px] text-foreground">{val}</p>
                <p className={cn("text-[9px] font-medium", color)}>{delta}</p>
              </div>
            ))}
          </div>
          {/* Content area */}
          <div className="flex-1 p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-[11px] text-foreground">Critical Dates</p>
              <span className="text-[9px] px-2 py-1 rounded border border-border bg-card text-muted-foreground">View all</span>
            </div>
            <table className="w-full text-[9.5px]">
              <thead>
                <tr className="border-b border-border">
                  {["Tenant","Type","Date"].map(h => (
                    <th key={h} className="text-left pb-1 font-semibold uppercase text-[8px] text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[["Pfizer","Lease Expiration","Sep 15, 2026"],["Morgan Stanley","Lease Expiration","Nov 1, 2026"],["Deloitte LLP","Rent Commencement","Dec 1, 2026"]].map(([tenant,type,date]) => (
                  <tr key={String(tenant)} className="border-b last:border-0 border-border">
                    <td className="py-1 text-foreground font-medium">{tenant}</td>
                    <td className="text-muted-foreground">{type}</td>
                    <td className="text-foreground">{date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface ThemeShowcaseProps {
  isDark: boolean
  onToggleDark: () => void
}

export function ThemeShowcase({ isDark, onToggleDark }: ThemeShowcaseProps) {
  const [panelDark, setPanelDark] = React.useState(false)
  return (
    <>
      <div className={cn(
        "fixed inset-0 -z-10",
        isDark ? "bg-[oklch(0.08_0.002_258)]" : "bg-[oklch(0.99_0.01_275)]"
      )} />
    <div className="max-w-6xl mx-auto pt-10 pb-[72px] px-1 space-y-[72px]">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="pb-[72px] border-b border-border">
        <div className="flex items-start justify-between mb-6">
          <Popover>
            <PopoverTrigger>
              <button className="cursor-pointer focus:outline-none" aria-label="Open appearance settings">
                <svg width="555" height="160" viewBox="0 0 555 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto text-foreground hover:opacity-80 transition-opacity">
                  <path d="M262.948 37.923L282.271 99.5913L301.591 37.923H321.723L293.26 121.804H270.12L241.889 37.923H262.948Z" fill="currentColor"/>
                  <path d="M378.745 55.2793H351.903V37.923H425.601V55.2793H398.645V121.804H378.745V55.2793Z" fill="currentColor"/>
                  <path d="M491.06 52.3862C483.422 52.3862 477.756 55.2794 477.756 60.4835C477.756 64.6518 481.688 67.6581 487.475 68.9305L498.928 71.2439C512.464 74.021 529.588 78.1862 529.588 95.7721C529.588 113.358 511.885 123.31 494.416 123.31C472.895 123.31 458.78 112.549 455.771 94.4997H475.441C477.639 103.293 484.581 107.342 494.879 107.342C501.588 107.342 509.224 105.144 509.224 98.2023C509.224 92.7658 502.747 90.1023 493.604 88.1371L483.422 86.0533C469.77 83.1633 457.392 76.6841 457.392 61.6418C457.392 44.519 475.788 36.5351 492.217 36.5351C508.646 36.5351 524.265 43.7095 527.158 62.2215H507.604C505.636 55.9721 499.506 52.3862 491.06 52.3862Z" fill="currentColor"/>
                  <path d="M108.553 46.9088L136.165 65.2593L156.596 51.7396L108.553 19.812L108.485 19.8573L60.427 51.7926L80.8551 65.3125L108.485 46.953L108.553 46.9088Z" fill="currentColor"/>
                  <path d="M108.47 105.303L25.0786 53.0043V87.8887L108.47 140.187L108.485 140.179L191.889 87.8741V52.9871L108.485 105.293L108.47 105.303Z" fill="currentColor"/>
                </svg>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 space-y-4" align="start">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Appearance</p>
                <div className="flex gap-2">
                  <Button
                    variant={isDark ? "ghost" : "default"}
                    size="sm"
                    onClick={() => { if (isDark) onToggleDark() }}
                    className="flex-1 gap-1.5"
                  >
                    <Sun className="h-3.5 w-3.5" /> Light
                  </Button>
                  <Button
                    variant={isDark ? "default" : "ghost"}
                    size="sm"
                    onClick={() => { if (!isDark) onToggleDark() }}
                    className="flex-1 gap-1.5"
                  >
                    <Moon className="h-3.5 w-3.5" /> Dark
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Experience</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-foreground">Asset Manager</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-muted-foreground">Broker</span>
                    <Badge variant="outline" className="text-muted-foreground">Coming Soon</Badge>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <div />
        </div>
        <h1 className="text-[60px] font-semibold tracking-[-0.02em] leading-[1.08] text-foreground mb-5 max-w-[780px]">
          Designed for clarity.<br /><span className="text-primary">Built for speed.</span><br />Powered by agents.
        </h1>
        <p className="text-[19px] text-muted-foreground leading-relaxed max-w-[640px]">
          A foundation for VTS Reimagined, combining a refined indigo palette, Geist throughout, and consistent UI patterns. Built to make information clearer, actions easier to find, and AI and agents feel native to how CRE work gets done.
        </p>
      </div>

      {/* ── 01 Color ─────────────────────────────────────────────────────── */}
      <section>
        <SectionHeader
          kicker="01 · Color"
          title="One refined indigo, a working system around it."
          description="A single oklch indigo carries every primary action. Around it: a neutral secondary for lower-emphasis controls, four semantic status colors, five chart colors within the same hue family, and two neutral ramps sharing the same chroma and hue axis: one for light surfaces, one for dark."
        />
        <div className="space-y-8">
          {COLOR_SECTIONS.map(section => (
            <div key={section.title}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">{section.title}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {section.tokens.map(t => (
                  <Swatch key={t.var} name={t.name} role={t.role} cssVar={t.var} description={t.description} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* ── 02 Gradients ─────────────────────────────────────────────────── */}
      <section>
        <SectionHeader
          kicker="02 · Gradients"
          title="The page surface, in both modes."
          description="Two gradients applied to the base surface, one per mode. Light mode layers soft radial washes in the same oklch hue family as the primary ramp, staying warm and barely-there. Dark mode fades from a muted violet bloom into near-black. Both are CSS utility classes in index.css, separate from the token ramps."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Light mode body — approximate representation */}
          <div className="rounded-xl overflow-hidden border border-border">
            <div className="h-28 bg-gradient-body-light" />
            <div className="p-3 space-y-1">
              <p className="text-sm font-semibold text-foreground">Page Background: Light</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-primary">Ambient / Body</p>
              <p className="font-mono text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5 inline-block mb-1">body (light mode)</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Three layered radial gradients over a warm indigo base. Subtle warmth and a slight purple cast that never competes with content.</p>
            </div>
          </div>
          {/* Dark mode body */}
          <div className="rounded-xl overflow-hidden border border-border">
            <div className="h-28 bg-gradient-body-dark" />
            <div className="p-3 space-y-1">
              <p className="text-sm font-semibold text-foreground">Page Background: Dark</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-primary">Ambient / Body</p>
              <p className="font-mono text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5 inline-block mb-1">body (dark mode)</p>
              <p className="text-xs text-muted-foreground leading-relaxed">A lavender radial bloom (#CAC7FC at 30% opacity) over near-black. Connects dark surfaces back to the indigo palette without adding noise.</p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── 03 Typography ────────────────────────────────────────────────── */}
      <section>
        <SectionHeader
          kicker="03 · Typography"
          title="Geist, top to bottom."
          description="One typeface across every role. Both --font-heading and --font-sans are set to Geist Variable. Headings (h1–h6) use the heading token via @layer base; body and UI copy use font-sans. The same family, the same renderer, no switching cost."
        />
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {TYPE_SCALE.map((row, i) => (
            <div key={row.role} className={cn("flex flex-col sm:flex-row sm:items-baseline gap-3 px-6 py-5", i > 0 && "border-t border-border")}>
              <div className="shrink-0 w-44">
                <p className="text-xs font-semibold text-foreground">{row.role}</p>
                <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{row.meta}</p>
              </div>
              <p className={cn("text-foreground", row.className)}>{row.sample}</p>
            </div>
          ))}
          <div className="border-t border-border px-6 py-4 flex flex-wrap gap-2">
            {[["400","body · paragraph",true],["500","labels · eyebrows",true],["600","headings · card titles",true]].map(([weight, label, active]) => (
              <span key={String(weight)} className={cn("font-mono text-xs px-3 py-1.5 rounded-full border",
                active ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground"
              )}>{weight} · {label}</span>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* ── 04 Applied ───────────────────────────────────────────────────── */}
      {/* ── 04 Applied ───────────────────────────────────────────────────── */}
      <section>
        <SectionHeader
          kicker="04 · Applied"
          title="One token set. Two neutral ramps."
          description="The same component, the same token classes, two modes. What changes is the neutral ramp: background, card, muted, border, and foreground surfaces all shift together. What stays locked: the indigo primary, the sidebar surface, and every semantic status color."
        />
        <div className="flex items-center justify-end mb-4">
          <Button
            variant={panelDark ? "outline" : "secondary"}
            onClick={() => setPanelDark(d => !d)}
            className={cn(
              "rounded-full gap-2",
              panelDark && "bg-sidebar text-sidebar-foreground border-sidebar-foreground/80 hover:bg-sidebar-accent"
            )}
          >
            {panelDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {panelDark ? "Dark Mode" : "Light Mode"}
          </Button>
        </div>
        <MiniPanel mode={panelDark ? "dark" : "light"} />
      </section>

      <Separator />

      {/* ── 05 Elevation ─────────────────────────────────────────────────── */}
      <section>
        <SectionHeader
          kicker="05 · Elevation"
          title="Flat by default. Floating on purpose."
          description="Three surface levels: base, raised glass, and floating. Base is the page canvas. Raised glass sits one ramp step above it using bg-card/70 with backdrop-blur-md, the pattern used across stat tiles, building headers, and content cards. Floating surfaces step further again with deeper blur and shadow, reserved for popovers and modals."
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="h-16 rounded-xl mb-4 bg-background border border-border" />
            <p className="text-sm font-semibold text-foreground mb-1">Base</p>
            <p className="font-mono text-[10px] text-muted-foreground mb-2">bg-background</p>
            <p className="text-xs text-muted-foreground leading-relaxed">The page canvas. Separation from cards comes from a one-step value difference, never a shadow.</p>
          </div>
          <div>
            <div className="h-16 rounded-xl mb-4 bg-card/70 backdrop-blur-md border border-border shadow-sm" />
            <p className="text-sm font-semibold text-foreground mb-1">Raised Glass</p>
            <p className="font-mono text-[10px] text-muted-foreground mb-2">bg-card/70 backdrop-blur-md</p>
            <p className="text-xs text-muted-foreground leading-relaxed">The actual card pattern used across the app. Frosted glass, not a flat token. Consistent across stat tiles, building headers, and content cards.</p>
          </div>
          <div>
            <div className="h-16 rounded-xl mb-4 bg-popover/80 backdrop-blur-xl border border-border shadow-xl" />
            <p className="text-sm font-semibold text-foreground mb-1">Floating</p>
            <p className="font-mono text-[10px] text-muted-foreground mb-2">bg-popover/80 backdrop-blur-xl shadow-xl</p>
            <p className="text-xs text-muted-foreground leading-relaxed">Dropdowns, modals, and tooltips. Deep blur, a pronounced shadow, and a slightly brighter border.</p>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── 06 Curves & Shapes ───────────────────────────────────────────── */}
      <section>
        <SectionHeader
          kicker="06 · Curves & Shapes"
          title="Radius, softness, and geometry."
          description="Corner radius is computed from a single --radius base of 0.5rem (8px) with multipliers. The scale runs from tight chips to generous hero banners, all derived from one source of truth."
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {RADIUS_STEPS.map(({ label, cls, px, desc }) => (
            <div key={label} className="flex flex-col items-center gap-3">
              <div className={cn("w-full aspect-square bg-primary/15 border-2 border-primary/30", cls)} />
              <div className="text-center">
                <p className="font-mono text-xs font-semibold text-foreground">{label}</p>
                <p className="font-mono text-[10px] text-primary">{px}</p>
                <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* ── 07 Components ────────────────────────────────────────────────── */}
      <section>
        <SectionHeader
          kicker="07 · Components"
          title="Tokens, applied to Components."
          description="shadcn/ui components with VTS tokens wired in: one refined indigo for every primary action and focus state, slate for secondary emphasis, and Geist carrying every label."
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Buttons */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Button</p>
              <p className="text-xs text-muted-foreground font-mono">primary · secondary · ghost</p>
            </div>
            <div className="p-5 flex flex-wrap gap-3 items-center">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost <ArrowRight className="h-3.5 w-3.5" /></Button>
              <Button variant="destructive">Destructive</Button>
              <Button disabled>Disabled</Button>
            </div>
            <div className="px-5 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">
              Indigo fill is reserved for the single primary action per view. Secondary uses the slate surface token, never a lighter tint of the brand color.
            </div>
          </div>

          {/* Badges */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Badge</p>
              <p className="text-xs text-muted-foreground font-mono">status · system · brand</p>
            </div>
            <div className="p-5 flex flex-wrap gap-2 items-center">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <span className="inline-flex items-center gap-1 rounded-full bg-success/15 text-success px-2.5 py-1 text-xs font-medium">
                <Check className="h-3 w-3" /> Success
              </span>
              <span className="inline-flex items-center rounded-full bg-warning/15 text-warning px-2.5 py-1 text-xs font-medium">
                Warning
              </span>
              <span className="inline-flex items-center rounded-full bg-declined/15 text-declined px-2.5 py-1 text-xs font-medium">
                Declined
              </span>
              <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium">
                AI Powered
              </span>
            </div>
            <div className="px-5 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">
              Status uses dedicated semantic tokens, including --declined for lapsed deals. Not a generic color system.
            </div>
          </div>

          {/* Inputs */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Input & Select</p>
              <p className="text-xs text-muted-foreground font-mono">text field · disabled</p>
            </div>
            <div className="p-5 space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-foreground">Workspace name</p>
                <Input defaultValue="VTS Tower Headquarters" />
                <p className="text-xs text-muted-foreground">Visible to everyone on your team.</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-foreground">Plan</p>
                <Input placeholder="Disabled input" disabled />
              </div>
            </div>
            <div className="px-5 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">
              Focus rings use the --ring token, a soft indigo halo at reduced opacity. Visible, not jarring. Field borders use --input, one step up from --background.
            </div>
          </div>

          {/* Surface hierarchy */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <p className="text-sm font-semibold text-foreground">Surface Hierarchy</p>
              <p className="text-xs text-muted-foreground font-mono">background · card · muted</p>
            </div>
            <div className="p-5 grid grid-cols-3 gap-3">
              {[
                { label: "Background", cls: "bg-background border border-border" },
                { label: "Card",       cls: "bg-card/70 backdrop-blur-md border border-border shadow-sm" },
                { label: "Muted",      cls: "bg-muted border border-border" },
              ].map(s => (
                <div key={s.label} className={cn("rounded-xl p-3", s.cls)}>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1.5">{s.label}</p>
                  <p className="text-xs text-foreground leading-snug">Text on {s.label.toLowerCase()}.</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Muted copy.</p>
                </div>
              ))}
            </div>
            <div className="px-5 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">
              The Card surface in this app uses bg-card/70 backdrop-blur-md in both light and dark modes.
            </div>
          </div>

        </div>
      </section>

      <Separator />

      {/* ── 08 Navigation ────────────────────────────────────────────────── */}
      <section>
        <SectionHeader
          kicker="08 · Navigation"
          title="Always dark. Always oriented."
          description="The sidebar surface uses its own token ramp, wired to dark values in both modes. In light mode it sits as a dark island against the light base surface. In dark mode, the sidebar and card surfaces share the same oklch lightness (0.18), so separation comes from layout position alone, not value contrast."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-2xl overflow-hidden border border-border max-w-xs">
            <div className="bg-sidebar px-4 py-5 space-y-0.5">
              <p className="text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/40 px-3 mb-2">Navigation</p>
              {[
                { label: "Overview",   icon: LayoutGrid,  active: true,  accent: false },
                { label: "Leases",     icon: FileText,    active: false, accent: false },
                { label: "Deals",      icon: Handshake,   active: false, accent: false },
                { label: "Planning",   icon: Calculator,  active: false, accent: false },
                { label: "VTS Agents", icon: Sparkle,     active: false, accent: true  },
                { label: "Profile",    icon: UserCircle,  active: false, accent: false },
              ].map(({ label, icon: Icon, active, accent }) => (
                <div
                  key={label}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : accent
                        ? "text-sidebar-primary hover:bg-sidebar-accent/60"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {label}
                  {accent && <ChevronRight className="h-3 w-3 ml-auto opacity-60" />}
                </div>
              ))}
            </div>
          </div>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-3 self-center">
            <p>The active item is marked by the sidebar-accent fill and sidebar-primary dot. A quiet signal, not a jarring highlight.</p>
            <p>VTS Agents gets the sidebar-primary text color at rest, distinguishing it from standard nav items without requiring a separate accent system.</p>
            <p className="text-xs font-mono text-muted-foreground/70">--sidebar-primary is brighter than --primary so it reads on the dark nav surface without a separate dark-mode override.</p>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader
          kicker="09 · AI + Agents"
          title="Intelligence belongs in the workflow."
          description="AI is part of the system, not a separate visual layer. Agents use the same components, surface ramps, states, and interaction patterns as everything else in VTS."
        />

        {/* System Principles — full width */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden mb-10">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground">How Agents Behave</p>
            <p className="text-xs text-muted-foreground font-mono">context · output · control · auditability</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {[
              { icon: Sparkle,      title: "Context is pre-loaded.",      body: "Agents receive the full row, card, or asset context on dispatch. No re-prompting. No copy-paste. The user taps and the agent knows." },
              { icon: ArrowRight,   title: "Output lives in the flow.",    body: "Findings render in cards, rows, and sidebar panels. Not modals. The visual weight of an agent result matches a human-authored one." },
              { icon: CheckCircle2, title: "Actions are recommended, not automatic.", body: "Agents surface next steps and draft actions. The user approves. Control stays with the team, speed comes from the AI." },
              { icon: Clock,        title: "Runs are tracked and auditable.", body: "Every agent run has a timestamp, an asset, a category, and a result. Nothing is a black box. History is always one click away." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex flex-col gap-2 p-5">
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <p className="text-sm font-semibold text-foreground leading-snug">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Row 1: Entry point + Deal Intelligence panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          {/* Left: sparkle entry point */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-foreground mb-3">Entry Point: Every Row</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">Every data row in VTS carries a contextual agent trigger. One tap dispatches an agent with full row context pre-loaded. No copy-paste, no prompt engineering.</p>
              {/* Simulated table row with sparkle */}
              <div className={cn(cardBase, "p-0 overflow-hidden")}>
                <div className="px-4 py-2 border-b border-border/40 flex items-center gap-4 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  <span className="flex-1">Tenant</span><span className="w-24 text-right">Space</span><span className="w-20 text-right">Time</span><span className="w-8" />
                </div>
                {[
                  { tenant: "Pfizer", space: "Suite 1200", time: "2 mo", urgent: true },
                  { tenant: "Morgan Stanley", space: "Floors 8–11", time: "4 mo", urgent: false },
                  { tenant: "Deloitte", space: "Suite 3400", time: "6 mo", urgent: false },
                  { tenant: "KPMG", space: "Floor 22", time: "1 mo", urgent: true },
                  { tenant: "WeWork", space: "Floors 14–16", time: "3 mo", urgent: true },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/40 transition-colors border-b border-border/30 last:border-0">
                    <span className="flex-1 text-sm font-medium text-foreground">{row.tenant}</span>
                    <span className="w-24 text-right text-xs text-muted-foreground">{row.space}</span>
                    <span className="w-20 flex justify-end">
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
                        row.urgent ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                      )}>{row.time}</span>
                    </span>
                    <span className="w-8 flex justify-end">
                      <AgentBtn label={`Analyze ${row.tenant} expiration and recommend next steps`} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Deal Intelligence panel */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">Proactive Intelligence Panel</p>
            <p className="text-sm text-muted-foreground leading-relaxed">Agents don't wait to be asked. They run continuously and surface findings in the sidebar, prioritized by revenue impact rather than recency.</p>
            <div className={cn(cardBase, "bg-sidebar border-transparent space-y-2")}>
              <div className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/50 mb-1">VTS Agents</p>
                  <h3 className="text-xl font-semibold text-sidebar-foreground">Deal Intelligence</h3>
                </div>
                <Button variant="outline" size="sm" className="shrink-0 text-sidebar-foreground border-current bg-transparent hover:bg-white/10 text-xs">View Active Agents</Button>
              </div>
              <div className="rounded-lg bg-primary/15 border border-primary/25 px-3 py-2.5 flex items-center gap-2.5">
                <Sparkle className="h-4 w-4 shrink-0 text-sidebar-primary" />
                <p className="text-sm text-sidebar-foreground">3 deal risks identified: <span className="text-sidebar-primary font-medium">$1.8M NOI at risk</span></p>
              </div>
              {[
                { label: "4 deals stalling 20+ days", value: "276K sf" },
                { label: "3 at-risk deals need review", value: "3 at-risk" },
                { label: "LOI+ pipeline upside", value: "+$89K/mo" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2.5 flex items-center gap-2.5">
                  <Sparkle className="h-3.5 w-3.5 shrink-0 text-sidebar-primary" />
                  <p className="flex-1 text-sm text-sidebar-foreground">{label}</p>
                  <p className="text-sm font-medium text-sidebar-primary tabular-nums">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Status + Recent Runs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 mt-10">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Live Status</p>
            <div className={cn(cardBase, "bg-sidebar border-transparent flex items-center gap-4")}>
              <Loader2 className="h-5 w-5 text-violet-400 animate-spin shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground">1 agent running</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">Northeast Corridor Portfolio · Q3 NOI improvement</p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0 text-sidebar-foreground border-current bg-transparent hover:bg-white/10 text-xs">View</Button>
            </div>
            <div className={cn(cardBase, "space-y-1.5")}>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-3">Recent Runs</p>
              {[
                { icon: CheckCircle2, color: "text-success", title: "12-month lease expiry risk analysis", meta: "VTS Tower · Lease risk · 2 min ago", summary: "3 leases totaling $234K/mo expire before Oct 2026." },
                { icon: CheckCircle2, color: "text-success", title: "Vacancy outreach plan for Suite 2100", meta: "VTS Tower · Leasing · 14 min ago", summary: "12 prospects identified. Draft outreach ready." },
                { icon: Clock,        color: "text-muted-foreground", title: "KPMG Suite 3400 renewal strategy", meta: "VTS Tower · Lease strategy · Queued", summary: null },
              ].map(({ icon: Icon, color, title, meta, summary }) => (
                <div key={title} className="flex items-start gap-3 rounded-xl border border-border/60 px-4 py-3.5 hover:bg-muted/50 hover:border-border cursor-pointer transition-all group">
                  <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors">{title}</p>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{meta}</p>
                    {summary && <p className="text-xs text-muted-foreground mt-1 leading-snug">{summary}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>


      </section>


      {/* Footer */}
      <div className="pb-8 border-t border-border pt-8 text-xs text-muted-foreground">
        VTS Design System foundations reference. Built to be retokenized and extended as the product surface grows.
      </div>

    </div>
    </>
  )
}
