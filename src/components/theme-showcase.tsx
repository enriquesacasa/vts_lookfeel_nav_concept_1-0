import * as React from "react"
import { Sun, Moon, Check, ArrowRight, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// ── Data ─────────────────────────────────────────────────────────────────────

const COLOR_SECTIONS = [
  {
    title: "Primary",
    tokens: [
      { name: "Primary",            role: "Action / Active",   var: "--primary",            description: "The single chromatic anchor. Every primary button, active nav state, and focus ring resolves here — one filled action per view." },
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
      { name: "Border",  role: "Divider",     var: "--border",  description: "Structural hairlines between regions — table rows, panel edges, input outlines." },
      { name: "Ring",    role: "Focus",       var: "--ring",    description: "Focus rings on interactive elements — keyboard-navigable without distraction." },
      { name: "Accent",  role: "Hover fill",  var: "--accent",  description: "Hover fills and subtle interactive backgrounds that don't compete with primary." },
    ],
  },
  {
    title: "Sidebar",
    tokens: [
      { name: "Sidebar",               role: "Nav surface",       var: "--sidebar",               description: "Always dark regardless of page mode — wired to dark-mode values even in light. A fixed orientation anchor." },
      { name: "Sidebar Foreground",    role: "Nav text",          var: "--sidebar-foreground",    description: "Default text and icons inside the sidebar." },
      { name: "Sidebar Primary",       role: "Active accent",     var: "--sidebar-primary",       description: "Active nav item labels and the VTS Agents accent — brighter than --primary to read on the dark nav surface." },
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
      { name: "Chart 2", role: "Second series",    var: "--chart-2", description: "A cooler blue-violet for the second data series — within the indigo family." },
      { name: "Chart 3", role: "Third series",     var: "--chart-3", description: "A mauve-adjacent step, still in the 278–298 hue range." },
      { name: "Chart 4", role: "Fourth series",    var: "--chart-4", description: "Shifts slightly blue for the fourth series." },
      { name: "Chart 5", role: "Fifth series",     var: "--chart-5", description: "The coolest step — a soft blue-grey for the least-emphasized series." },
    ],
  },
]

const TYPE_SCALE = [
  { role: "Display",  meta: "60px · 600 · −0.02em",  className: "text-[60px] font-semibold tracking-[-0.02em] leading-[1.08]",  sample: "Built for how modern teams work" },
  { role: "H1",       meta: "38px · 600 · −0.018em", className: "text-[38px] font-semibold tracking-[-0.018em] leading-[1.2]",   sample: "One workspace, every team" },
  { role: "H2",       meta: "33px · 600 · −0.015em", className: "text-[33px] font-semibold tracking-[-0.015em] leading-snug",    sample: "Automate the busywork" },
  { role: "Body",     meta: "16px · 400 · 1.6 lh",   className: "text-base text-muted-foreground leading-relaxed max-w-lg",      sample: "Standard paragraph and component copy. Geist's open counters and even spacing keep long-form reading comfortable at any surface color, light or dark." },
  { role: "Small",    meta: "14px · 400",             className: "text-sm text-muted-foreground",                                  sample: "Helper text, timestamps, and metadata labels." },
  { role: "Caption",  meta: "12px · 500 · mono",      className: "font-mono text-xs font-medium text-muted-foreground",           sample: "Eyebrow labels, table headers, status chips." },
]

// --radius = 0.5rem (8px). Steps are computed multipliers of that base.
const RADIUS_STEPS = [
  { label: "sm",   cls: "rounded-sm",   px: "~5px",  desc: "Chips, badges, tight labels" },
  { label: "md",   cls: "rounded-md",   px: "~6px",  desc: "Input fields, small rows" },
  { label: "lg",   cls: "rounded-lg",   px: "8px",   desc: "Buttons, tags — the base radius" },
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
        <div className="w-32 shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border">
          {/* Logo */}
          <div className="flex items-center gap-1.5 px-3 py-3 border-b border-sidebar-border">
            <span className="w-4 h-4 rounded bg-sidebar-primary/20 flex items-center justify-center shrink-0">
              <span className="w-2 h-2 rounded-sm bg-sidebar-primary block" />
            </span>
            <span className="text-[11px] font-bold text-sidebar-foreground">VTS</span>
          </div>
          {/* Building switcher */}
          <div className="px-2 py-2 border-b border-sidebar-border">
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
  isSingleScale: boolean
  onToggleSingleScale: () => void
}

export function ThemeShowcase({ isDark, onToggleDark, isSingleScale, onToggleSingleScale }: ThemeShowcaseProps) {
  const [panelDark, setPanelDark] = React.useState(false)
  return (
    <>
      <div className={cn(
        "fixed inset-0 -z-10",
        isDark ? "bg-[oklch(0.08_0.002_258)]" : "bg-[oklch(0.99_0.01_275)]"
      )} />
    <div className="max-w-6xl mx-auto py-[72px] px-1 space-y-[72px]">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="pb-[72px] border-b border-border">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onToggleSingleScale}
            className="inline-flex items-center gap-2 font-mono text-[12px] font-medium text-primary border border-primary/30 bg-primary/8 rounded-full px-3 py-1.5 uppercase tracking-[0.06em] cursor-pointer hover:bg-primary/14 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            {isSingleScale ? "Geist, Single Scale" : "Geist, Dual Scales"}
          </button>
          <Button
            variant={isDark ? "outline" : "secondary"}
            onClick={onToggleDark}
            className={cn(
              "shrink-0 rounded-full gap-2",
              isDark && "bg-sidebar text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent"
            )}
          >
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {isDark ? "Dark Mode" : "Light Mode"}
          </Button>
        </div>
        <h1 className="text-[60px] font-semibold tracking-[-0.02em] leading-[1.08] text-foreground mb-5 max-w-[780px]">
          Designed for clarity.<br /><span className="text-primary">Built for action.</span>
        </h1>
        <p className="text-[19px] text-muted-foreground leading-relaxed max-w-[640px]">
          A foundation for VTS Reimagined, combining a refined indigo palette, Geist throughout, and consistent UI patterns. Built to make information clearer, actions easier to find, and AI and agents feel native to how CRE work gets done.
        </p>
      </div>

      {/* ── 01 Color ─────────────────────────────────────────────────────── */}
      <section>
        <SectionHeader
          kicker="01 — Color"
          title="One refined indigo, a working system around it"
          description="A single, considered refined indigo carries every primary action. Around it: a neutral secondary for lower-emphasis controls, four system colors for status and feedback, five chart colors within the same indigo family, and matched neutral scales for light and dark surfaces."
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
          kicker="02 — Gradients"
          title="The page surface, in both modes"
          description="Two gradients — one per mode — applied to the page body. Light mode runs a soft indigo wash from upper left to lower right, staying warm and barely-there. Dark mode deepens the same direction, fading from a muted violet into near-black. Both are defined as CSS utility classes in index.css, separate from the token system."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Light mode body — approximate representation */}
          <div className="rounded-xl overflow-hidden border border-border">
            <div className="h-28 bg-gradient-body-light" />
            <div className="p-3 space-y-1">
              <p className="text-sm font-semibold text-foreground">Page Background — Light</p>
              <p className="text-[10px] font-medium uppercase tracking-wide text-primary">Ambient / Body</p>
              <p className="font-mono text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5 inline-block mb-1">body (light mode)</p>
              <p className="text-xs text-muted-foreground leading-relaxed">Three layered radial gradients over a warm indigo base. Subtle warmth and a slight purple cast — never competes with content.</p>
            </div>
          </div>
          {/* Dark mode body */}
          <div className="rounded-xl overflow-hidden border border-border">
            <div className="h-28 bg-gradient-body-dark" />
            <div className="p-3 space-y-1">
              <p className="text-sm font-semibold text-foreground">Page Background — Dark</p>
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
          kicker="03 — Typography"
          title="Geist, top to bottom"
          description="One typeface across every role — both --font-heading and --font-sans are set to Geist Variable. Headings (h1–h6) use the heading token via @layer base; body and UI copy use font-sans. The same family, the same renderer, no switching cost."
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
            {[["400","body default",false],["500","interactive / labels",true],["600","heading default",true],["700","rare emphasis",false]].map(([weight, label, active]) => (
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
          kicker="04 — Applied"
          title="One token set. Two neutral scales."
          description="The same component, the same token classes, two modes. What changes: the neutral scale — background, card, muted, border, and text values all shift. What doesn't: the indigo primary, the sidebar, and every semantic status color stay locked to the same hue."
        />
        <div className="flex items-center justify-end mb-4">
          <Button
            variant={panelDark ? "outline" : "secondary"}
            onClick={() => setPanelDark(d => !d)}
            className={cn(
              "rounded-full gap-2",
              panelDark && "bg-sidebar text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent"
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
          kicker="05 — Elevation"
          title="Flat by default. Floating on purpose."
          description="Most of this system stays flat — surfaces separate using value contrast alone. Cards in the app use bg-card/70 with backdrop-blur-md for a glass layer in both modes. Elevation exists for one job: telling you something above the page deserves attention."
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
            <p className="text-sm font-semibold text-foreground mb-1">Raised — Glass</p>
            <p className="font-mono text-[10px] text-muted-foreground mb-2">bg-card/70 backdrop-blur-md</p>
            <p className="text-xs text-muted-foreground leading-relaxed">The actual card pattern used across the app — frosted glass, not a flat token. Consistent across stat tiles, building headers, and content cards.</p>
          </div>
          <div>
            <div className="h-16 rounded-xl mb-4 bg-popover/80 backdrop-blur-xl border border-border shadow-xl" />
            <p className="text-sm font-semibold text-foreground mb-1">Floating</p>
            <p className="font-mono text-[10px] text-muted-foreground mb-2">bg-popover/80 backdrop-blur-xl shadow-xl</p>
            <p className="text-xs text-muted-foreground leading-relaxed">Dropdowns, modals, tooltips — anything that overlays the page. Deep blur, a pronounced shadow, and a slightly brighter border.</p>
          </div>
        </div>
      </section>

      <Separator />

      {/* ── 06 Curves & Shapes ───────────────────────────────────────────── */}
      <section>
        <SectionHeader
          kicker="06 — Curves & Shapes"
          title="Radius, softness, and geometry"
          description="Corner radius is computed from a single --radius base of 0.5rem (8px) with multipliers. The scale runs from tight chips to generous hero banners — all derived from one source of truth."
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
          kicker="07 — Components"
          title="The ramp, applied to components"
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
              <Button>Create workspace</Button>
              <Button variant="secondary">Invite team</Button>
              <Button variant="outline">Export</Button>
              <Button variant="ghost">Learn more <ArrowRight className="h-3.5 w-3.5" /></Button>
              <Button variant="destructive">Delete</Button>
              <Button disabled>Disabled</Button>
            </div>
            <div className="px-5 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border pt-3">
              Indigo fill is reserved for the single primary action per view. Secondary uses the slate surface token — never a lighter tint of the brand color.
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
              Status uses dedicated semantic tokens — including --declined for lapsed deals — not a generic color system.
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
              Focus rings use the --ring token (a soft indigo halo at reduced opacity) — visible, not jarring. Field borders use --input, one step up from --background.
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
          kicker="08 — Navigation"
          title="Always dark. Always oriented."
          description="The sidebar stays dark regardless of page mode — sidebar tokens are wired to dark-mode values even in light. In dark mode, --sidebar and --card share the same oklch value (0.18 0.005 258), so the sidebar has zero value contrast from cards; separation comes from layout position alone."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-2xl overflow-hidden border border-border max-w-xs">
            <div className="bg-sidebar px-4 py-5 space-y-0.5">
              <p className="text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/40 px-3 mb-2">Navigation</p>
              {["Overview", "Leases", "Deals", "Planning", "VTS Agents", "Profile"].map((item, i) => (
                <div
                  key={item}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    i === 0
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : i === 4
                        ? "text-sidebar-primary hover:bg-sidebar-accent/60"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <div className={cn("h-1.5 w-1.5 rounded-full shrink-0",
                    i === 0 ? "bg-sidebar-primary" : i === 4 ? "bg-sidebar-primary" : "bg-sidebar-foreground/20"
                  )} />
                  {item}
                  {i === 4 && <ChevronRight className="h-3 w-3 ml-auto opacity-60" />}
                </div>
              ))}
            </div>
          </div>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-3 self-center">
            <p>The active item is marked by the sidebar-accent fill and sidebar-primary dot — a quiet signal, not a jarring highlight.</p>
            <p>VTS Agents gets the sidebar-primary text color at rest, distinguishing it from standard nav items without requiring a separate accent system.</p>
            <p className="text-xs font-mono text-muted-foreground/70">--sidebar-primary is brighter than --primary so it reads on the dark nav surface without a separate dark-mode override.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="pb-8 border-t border-border pt-8 text-xs text-muted-foreground">
        VTS Design System — foundations reference. Built to be retokenized and extended as the product surface grows.
      </div>

    </div>
    </>
  )
}
