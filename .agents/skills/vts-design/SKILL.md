---
name: vts-design
description: >
  VTS visual design language and layout patterns extracted from the VTS product
  and marketing UI. Use this skill WHENEVER building any page, section, hero,
  card, stat, badge, navigation, sidebar, or layout in this project. Covers
  dark hero sections, lavender marketing backgrounds, AI badges, pill buttons,
  stat cards, layered card compositions, gradient sections, status badges,
  document icons, and the 4-point star motif. Trigger on: "make a page",
  "build a hero", "add a section", "create a layout", "design a dashboard",
  "make it look like VTS", any layout or visual composition request.
---

# VTS Design Language

Extracted from VTS product UI and marketing screenshots. Every surface built
in this project should feel like it belongs in the VTS ecosystem.

---

## Color contexts

VTS uses two distinct background contexts — never mix them arbitrarily.

### Dark context (product UI, hero sections)
```
bg-background (dark) → oklch(0.115 0.022 278) — deep charcoal-violet
bg-card (dark)       → oklch(0.165 0.026 278) — raised panel, slightly lighter
bg-sidebar (dark)    → oklch(0.135 0.024 278) — app shell sidebar
```
Use dark context for: hero banners, product screenshots, AI feature sections,
navigation bars, sidebars.

### Light context (marketing pages, content sections)
```
bg-background (light) → oklch(0.974 0.014 280) — soft lavender white
bg-card (light)       → oklch(1 0.004 280)      — white card on lavender
bg-muted (light)      → oklch(0.945 0.018 278)  — subtle section divider
```
Use light context for: feature breakdowns, testimonials, content grids, footers.

### Accent gradient (AI / hero sections)
Deep violet-to-purple gradient used behind AI feature sections:
```tsx
className="bg-gradient-to-br from-[hsl(var(--primary)/0.9)] to-[hsl(var(--accent)/0.6)]"
```
Or as a full dark section with a purple glow overlay:
```tsx
className="relative bg-sidebar overflow-hidden"
// + absolute radial gradient pseudo-element for the purple bloom
```

---

## Typography scale

All type uses Figtree Variable (`font-sans`). VTS headlines are bold and tight.

| Use | Classes |
|-----|---------|
| Marketing hero H1 | `text-5xl md:text-7xl font-bold tracking-tighter text-foreground leading-none` |
| Section H2 | `text-4xl md:text-5xl font-bold tracking-tight text-foreground` |
| Card title | `text-xl font-semibold tracking-tight text-foreground` |
| Body | `text-sm text-muted-foreground leading-relaxed` |
| Label / eyebrow | `text-xs font-semibold uppercase tracking-widest text-muted-foreground` |
| Stat number | `text-4xl font-bold text-foreground` |
| Stat label | `text-xs font-semibold uppercase tracking-wide text-muted-foreground` |

**Accent color in headlines** — the VTS hero puts key words in primary:
```tsx
<h1 className="text-5xl font-bold tracking-tighter">
  Proposals as easy as{" "}
  <span className="text-primary">drag and drop</span>
</h1>
```

---

## The 4-point star (AI motif)

VTS uses a 4-pointed star SVG as the AI icon throughout the product and marketing.
Use it as a Badge prefix, section eyebrow, or standalone decorative element.

```tsx
// SparkleIcon — inline SVG, sized via className
function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
    </svg>
  )
}

// AI badge usage
<div className="flex items-center gap-1.5 text-primary">
  <SparkleIcon className="h-3.5 w-3.5" />
  <span className="text-xs font-semibold uppercase tracking-widest">AI Powered</span>
</div>
```

---

## Buttons & CTAs

### Primary (filled violet)
Standard shadcn `Button` with default variant — maps to VTS primary.
```tsx
<Button>Get a demo</Button>
```

### Outline pill (marketing CTA)
```tsx
<Button
  variant="outline"
  className="rounded-full px-8 font-semibold tracking-wide uppercase text-xs border-foreground/30"
>
  Learn More
</Button>
```

### Icon pill (sidebar / add action)
```tsx
<Button variant="outline" className="rounded-full gap-2">
  <PlusIcon className="h-4 w-4" />
  Add deal
</Button>
```

---

## Cards & panels

### Standard card (light context)
```tsx
<Card className="rounded-2xl border-border/60 shadow-sm">
  <CardContent className="p-6">…</CardContent>
</Card>
```

### Dark raised panel (product UI)
```tsx
<div className="rounded-2xl bg-card border border-border/40 p-6">…</div>
```

### Frosted / translucent card (layered compositions)
```tsx
<div className="rounded-2xl bg-card/70 backdrop-blur-md border border-border/30 p-6">…</div>
```

### Layered card composition (hero imagery)
VTS stacks cards with depth — a background card slightly offset behind a
foreground card, with a photo or UI screenshot inside one of them:
```tsx
<div className="relative w-fit">
  {/* back card — slightly larger, offset down-left */}
  <div className="absolute -bottom-4 -left-4 w-full h-full rounded-3xl bg-card/60 backdrop-blur-sm border border-border/20" />
  {/* front card */}
  <div className="relative rounded-3xl overflow-hidden bg-card border border-border/40 shadow-xl">
    <img src={…} className="w-full object-cover" />
  </div>
</div>
```

---

## Stat cards

Dark cards showing a metric label + large number, used in the product and
marketing hero sections.

```tsx
<div className="rounded-xl bg-card border border-border/40 p-4 min-w-[140px]">
  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
    2025 Predicted sqft
  </p>
  <p className="text-4xl font-bold text-foreground">34M</p>
</div>
```

For side-by-side stat pairs (as seen in the market playbook card):
```tsx
<div className="flex gap-px rounded-xl overflow-hidden border border-border/40">
  <StatCard label="2025 Predicted sqft" value="34M" />
  <StatCard label="2025 Actual sqft"    value="37.5M" className="bg-card/60" />
</div>
```

---

## Status badges

From the document table in the product UI:

```tsx
// Expert verified — green
<Badge className="bg-green-500/15 text-green-600 border-green-500/30 font-medium">
  Expert verified
</Badge>

// Processing — neutral muted
<Badge variant="secondary" className="text-muted-foreground font-medium">
  Processing
</Badge>

// General pattern — map status to token
const statusVariant = {
  active:    "bg-primary/10 text-primary border-primary/20",
  expiring:  "bg-yellow-500/15 text-yellow-600 border-yellow-500/30",
  expired:   "bg-destructive/10 text-destructive border-destructive/20",
  processing:"bg-muted text-muted-foreground",
} satisfies Record<string, string>
```

---

## Top navigation bar (product)

Dark full-width nav with logo left, links center, actions right:

```tsx
<nav className="h-14 bg-sidebar border-b border-border/40 flex items-center px-4 gap-6">
  <VTSLogo className="h-6 w-auto text-foreground" />
  <div className="flex items-center gap-1 text-sm">
    {["Market","Lease","Insights"].map(item => (
      <Button key={item} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
        {item}
      </Button>
    ))}
    <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
      <SparkleIcon className="h-3.5 w-3.5 text-primary" /> VTS AI
    </Button>
  </div>
  <div className="ml-auto">
    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
      <SearchIcon className="h-4 w-4" /> Search
    </Button>
  </div>
</nav>
```

---

## Sidebar (product)

Dark sidebar, ~220px, nav items as ghost buttons, section labels as eyebrows:

```tsx
<aside className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col gap-1 p-3">
  {/* Building card */}
  <div className="rounded-xl overflow-hidden mb-4">
    <img src={buildingImg} className="w-full h-20 object-cover" />
    <div className="bg-card/90 px-3 py-2">
      <p className="text-sm font-semibold text-sidebar-foreground">100 North Tampa</p>
      <p className="text-xs text-muted-foreground">100 North Tampa Street</p>
    </div>
  </div>

  <p className="px-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-2 mb-1">
    Tools
  </p>
  {tools.map(item => (
    <Button key={item} variant="ghost" size="sm"
      className="justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
      {item}
    </Button>
  ))}
</aside>
```

---

## Section layout patterns

### Full-width dark hero
```tsx
<section className="bg-sidebar text-foreground px-6 py-20 md:py-32">
  <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
    <div>
      <AiBadge />
      <h1>…</h1>
      <Button>…</Button>
    </div>
    <LayeredCardComposition />
  </div>
</section>
```

### Lavender marketing section
```tsx
<section className="bg-background px-6 py-20">
  <div className="max-w-6xl mx-auto">…</div>
</section>
```

### Gradient AI feature band
```tsx
<section className="relative bg-sidebar overflow-hidden px-6 py-20">
  {/* purple bloom */}
  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-accent/20 pointer-events-none" />
  <div className="relative max-w-6xl mx-auto">…</div>
</section>
```

---

## File / document icons

VTS uses rounded-rectangle file type icons (DOC, PDF, LOI) with a page-fold
corner. Use shadcn `Card` + a small label:

```tsx
<div className="flex flex-col items-center gap-1 w-16">
  <div className="w-12 h-14 rounded-lg bg-card border-2 border-border flex flex-col items-center justify-center gap-1 relative">
    {/* fold corner */}
    <div className="absolute top-0 right-0 w-3 h-3 bg-background border-l border-b border-border rounded-bl-md" />
    <div className="w-7 h-px bg-muted-foreground/40 rounded" />
    <div className="w-7 h-px bg-muted-foreground/40 rounded" />
    <div className="w-7 h-px bg-muted-foreground/40 rounded" />
  </div>
  <span className="text-xs font-semibold text-muted-foreground">PDF</span>
</div>
```

For the "active/selected" state (violet border as seen on the PDF icon):
```tsx
className="border-2 border-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.3)]"
```

---

## Spacing & radius conventions

| Token | Value | Use |
|-------|-------|-----|
| `rounded-lg` | 0.5rem | inputs, small chips |
| `rounded-xl` | 0.7rem | stat cards, small panels |
| `rounded-2xl` | 1rem | main cards |
| `rounded-3xl` | 1.4rem | hero image containers |
| `rounded-full` | 9999px | pill badges, avatar, CTA buttons |
| Section padding | `px-6 py-20` | standard section |
| Card padding | `p-6` | standard card |
| Gap between items | `gap-3` / `gap-6` | inline / grid |

---

## Shadows

```tsx
// Subtle card lift (light context)
"shadow-sm border border-border/60"

// Prominent card (dark overlay)
"shadow-xl shadow-black/20"

// Glow (AI / primary element)
"shadow-lg shadow-primary/20"
```
