---
name: vts-shadcn-standards
description: >
  Enforces VTS project UI standards: shadcn/ui components only, all styles via
  VTS theme tokens, no inline styles, no hardcoded colors. Use this skill
  WHENEVER writing, editing, or reviewing any React component, page, or UI
  element in this project — even for small changes. Covers new component
  authoring (CVA + cn() + forwardRef pattern), Tailwind class usage, theme
  token selection, and shadcn-compliant file structure. Trigger on: "make a
  component", "add UI", "build a page", "create a card/button/form/table/etc",
  "add styles", any JSX or TSX work.
---

# VTS shadcn/ui Standards

This project uses **React + Tailwind CSS v4 + shadcn/ui** with the **VTS theme**.
Every piece of UI must follow these rules without exception.

---

## Rule 1 — Reach for shadcn first

Before writing any custom component, check whether shadcn/ui already provides it:

```
Button, Badge, Card, Input, Textarea, Select, Checkbox, Switch,
Separator, Avatar, Tooltip, Popover, Dialog, Sheet, Drawer,
DropdownMenu, ContextMenu, Command, Combobox, Table, Tabs,
Accordion, Collapsible, ScrollArea, Skeleton, Progress,
NavigationMenu, Breadcrumb, Pagination, Sidebar, Toggle,
ToggleGroup, Alert, AlertDialog, Toast / Sonner, Form, Label,
Calendar, DatePicker, Chart (Recharts wrapper), Resizable …
```

Install a missing component with:
```bash
npx shadcn@latest add <component-name>
```

Only build a custom component when no shadcn primitive exists **and** the UI genuinely can't be composed from existing ones.

---

## Rule 2 — All styles via VTS theme tokens

Every className must reference a CSS variable from the VTS theme. Never write a
hardcoded color, size outside the scale, or `style={{…}}`.

### Correct token mapping

| Need | Token class |
|------|-------------|
| Page background | `bg-background` |
| Card / panel | `bg-card` |
| Sidebar | `bg-sidebar` |
| Primary action | `bg-primary text-primary-foreground` |
| Secondary / pill | `bg-secondary text-secondary-foreground` |
| Subtle fill | `bg-muted text-muted-foreground` |
| Accent highlight | `bg-accent text-accent-foreground` |
| Danger | `bg-destructive text-white` |
| Body text | `text-foreground` |
| Subdued text | `text-muted-foreground` |
| Dividers | `border-border` |
| Focus ring | `ring-ring` |
| Input bg | `bg-input` |

Use Tailwind's opacity modifier for translucency: `bg-primary/10`, `border-border/50`.

### What to avoid

```tsx
// ❌ hardcoded color
<div className="bg-[#7B5CF0]" />
<div className="text-purple-600" />

// ❌ inline style
<div style={{ backgroundColor: 'violet' }} />

// ❌ arbitrary value that isn't a token
<div className="bg-[oklch(0.48_0.24_278)]" />

// ✅ correct
<div className="bg-primary text-primary-foreground" />
```

---

## Rule 3 — New component authoring pattern

When a custom component is genuinely needed, follow the shadcn authoring pattern
exactly so it slots seamlessly into the design system.

### File location
```
src/components/ui/<component-name>.tsx   ← primitives / single-purpose
src/components/<component-name>.tsx      ← composed / feature components
```

### Template

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const componentVariants = cva(
  // base classes — always token-based
  "inline-flex items-center rounded-lg border border-border bg-card text-card-foreground",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "bg-transparent hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface ComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof componentVariants> {}

const MyComponent = React.forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(componentVariants({ variant, size }), className)}
      {...props}
    />
  )
)
MyComponent.displayName = "MyComponent"

export { MyComponent, componentVariants }
```

### Key requirements

- **`cn()`** — always merge classes through `cn()` from `@/lib/utils`, never string concatenation
- **`cva()`** — define variants via `class-variance-authority`, never conditional strings
- **`forwardRef`** — wrap every component; set `displayName`
- **Spread `{...props}`** — pass through all HTML attributes
- **Export both** the component and its variants object so consumers can reuse the variant logic

---

## Rule 4 — Typography

Use Tailwind's font utilities that map to the VTS theme:

```tsx
// Figtree Variable is --font-sans (set in theme)
<h1 className="font-sans text-3xl font-bold tracking-tight text-foreground" />
<p  className="font-sans text-sm text-muted-foreground" />
```

Never import or reference another font. Never set `font-family` directly.

---

## Rule 5 — Dark mode

The VTS theme provides `.dark` class variables. Never write `dark:` utilities
that reference hardcoded colors — only `dark:` variants of token classes are
allowed:

```tsx
// ❌
<div className="dark:bg-gray-900" />

// ✅ (token already handles dark via .dark CSS vars)
<div className="bg-background" />

// ✅ only when you need to override specifically
<div className="bg-card dark:bg-sidebar" />
```

---

## Rule 6 — Recharts charts

Use the shadcn `Chart` component wrapper (`@/components/ui/chart`) which wires
Recharts into the VTS theme palette. Map series to `--chart-1` … `--chart-5`.

```tsx
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"

const config = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  costs:   { label: "Costs",   color: "var(--chart-2)" },
}
```

---

## Rule 7 — Every screen must be mobile friendly

All pages and components must work correctly on mobile (≥320px). Use responsive
design from the start — never build desktop-only layouts.

- Use `useIsMobile()` from `@/hooks/use-mobile` to switch between mobile and desktop
  component variants when behavior genuinely differs (e.g. bottom tab bar vs sidebar)
- Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) for layout shifts
- Touch targets must be at least 44×44px (`min-w-[44px] min-h-[44px]` or `p-3`)
- No horizontal overflow — test at 375px width
- Floating/fixed elements must not overlap content; add matching padding to the page
  (`pb-20` for bottom bars, `pl-20` for sidebars)
- Use `max-h-[70dvh]` and `overflow-y-auto` on sheets/drawers so they don't overflow
- Bottom sheets use `side="bottom"` on shadcn `Sheet` with `rounded-t-2xl`

---

## Checklist before finishing any UI task

- [ ] Every component is a shadcn primitive or composed from one
- [ ] Zero hardcoded colors or hex/oklch values in classNames
- [ ] Zero `style={{…}}` attributes
- [ ] Custom components use `cva` + `cn()` + `forwardRef`
- [ ] Font is Figtree via `font-sans` only
- [ ] Charts use shadcn `ChartContainer` with `--chart-N` tokens
- [ ] Layout works at 375px width with no horizontal overflow
- [ ] Touch targets are at least 44px
- [ ] Fixed nav/bar padding applied to page content so nothing is obscured
