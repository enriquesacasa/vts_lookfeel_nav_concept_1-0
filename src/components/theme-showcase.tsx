import * as React from "react"
import { Sun, Moon, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const COLOR_TOKENS = [
  { label: "Background",        var: "--background",        text: "foreground" },
  { label: "Foreground",        var: "--foreground",        text: "background" },
  { label: "Card",              var: "--card",              text: "card-foreground" },
  { label: "Primary",           var: "--primary",           text: "primary-foreground" },
  { label: "Secondary",         var: "--secondary",         text: "secondary-foreground" },
  { label: "Muted",             var: "--muted",             text: "muted-foreground" },
  { label: "Accent",            var: "--accent",            text: "accent-foreground" },
  { label: "Border",            var: "--border",            text: "foreground" },
  { label: "Destructive",       var: "--destructive",       text: "foreground" },
  { label: "Success",           var: "--success",           text: "foreground" },
  { label: "Warning",           var: "--warning",           text: "foreground" },
  { label: "Sidebar",           var: "--sidebar",           text: "sidebar-foreground" },
  { label: "Sidebar Accent",    var: "--sidebar-accent",    text: "sidebar-accent-foreground" },
]

function Swatch({ label, cssVar }: { label: string; cssVar: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="h-14 rounded-xl border border-border/40 shadow-sm"
        style={{ background: `var(${cssVar})` }}
      />
      <p className="text-[11px] font-medium text-foreground leading-tight">{label}</p>
      <p className="text-[10px] text-muted-foreground font-mono leading-tight">{cssVar}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-4">{title}</p>
      {children}
    </div>
  )
}

interface ThemeShowcaseProps {
  isDark: boolean
  onToggleDark: () => void
}

export function ThemeShowcase({ isDark, onToggleDark }: ThemeShowcaseProps) {
  return (
    <div className="flex flex-col rounded-2xl bg-white/70 dark:bg-white/8 backdrop-blur-md mt-4 p-6 gap-10" style={{ minHeight: "calc(100vh - 12rem)" }}>

      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-foreground mb-1">Theme showcase</h1>
          <p className="text-sm text-muted-foreground">Color tokens, typography, and components in both modes.</p>
        </div>
        <button
          onClick={onToggleDark}
          className={cn(
            "relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all border",
            isDark
              ? "bg-sidebar text-sidebar-foreground border-sidebar-border hover:bg-sidebar-accent"
              : "bg-secondary text-secondary-foreground border-border hover:bg-accent"
          )}
        >
          {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          {isDark ? "Dark mode" : "Light mode"}
        </button>
      </div>

      {/* Color swatches */}
      <Section title="Color tokens">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
          {COLOR_TOKENS.map(t => (
            <Swatch key={t.var} label={t.label} cssVar={t.var} />
          ))}
        </div>
      </Section>

      {/* Typography */}
      <Section title="Typography">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <p className="text-4xl font-medium text-foreground leading-tight">Display heading</p>
          <p className="text-2xl font-medium text-foreground leading-tight">Section heading</p>
          <p className="text-xl font-normal text-foreground leading-tight">Subheading</p>
          <p className="text-base text-foreground">Body text — The quick brown fox jumps over the lazy dog.</p>
          <p className="text-sm text-muted-foreground">Secondary / muted — Supporting information and labels.</p>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Eyebrow label</p>
          <p className="text-sm font-mono text-foreground">Monospace — var(--font-sans)</p>
        </div>
      </Section>

      {/* Buttons */}
      <Section title="Buttons">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-wrap gap-3 items-center">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>
      </Section>

      {/* Badges */}
      <Section title="Badges">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-wrap gap-2 items-center">
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
            <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium">
              AI Powered
            </span>
          </div>
        </div>
      </Section>

      {/* Inputs */}
      <Section title="Inputs">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            <Input placeholder="Default input" />
            <Input placeholder="Disabled input" disabled />
          </div>
        </div>
      </Section>

      {/* Surface hierarchy */}
      <Section title="Surface hierarchy">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Background", cls: "bg-background border border-border" },
            { label: "Card",       cls: "bg-card border border-border" },
            { label: "Muted",      cls: "bg-muted border border-border" },
          ].map(s => (
            <div key={s.label} className={cn("rounded-xl p-5", s.cls)}>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">{s.label}</p>
              <p className="text-sm text-foreground">Text on {s.label.toLowerCase()} surface.</p>
              <p className="text-xs text-muted-foreground mt-1">Muted supporting text.</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Sidebar preview */}
      <Section title="Sidebar">
        <div className="rounded-xl overflow-hidden border border-border max-w-xs">
          <div className="bg-sidebar px-4 py-5 space-y-1">
            {["Overview", "Leases", "Deals", "Planning", "Profile"].map((item, i) => (
              <div
                key={item}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  i === 0
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <div className={cn("h-1.5 w-1.5 rounded-full", i === 0 ? "bg-sidebar-primary" : "bg-sidebar-foreground/30")} />
                {item}
              </div>
            ))}
          </div>
        </div>
      </Section>

    </div>
  )
}
