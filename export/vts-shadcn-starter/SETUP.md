# VTS Shadcn Starter — Setup Guide

Everything you need to prototype with the VTS design system in shadcn/ui.

---

## 1. Scaffold a new project

```bash
npm create vite@latest my-prototype -- --template react-ts
cd my-prototype
npm install
```

## 2. Initialize shadcn with the base-nova style

```bash
npx shadcn@latest init
```

When prompted, choose:
- **Style**: `base-nova`
- **Base color**: `neutral`
- **CSS variables**: yes
- **Tailwind config**: leave blank (Tailwind v4 handles it)

Or drop the `components.json` from this folder into your project root — it has the right settings already.

## 3. Apply the VTS theme

Copy `vts-theme.css` contents into your `src/index.css`, replacing the default `:root` and `.dark` blocks that shadcn generated.

Your `src/index.css` should start with:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@fontsource-variable/geist";

@custom-variant dark (&:is(.dark *));

@theme inline {
    --font-heading: 'Geist Variable', sans-serif;
    --font-sans: 'Geist Variable', sans-serif;

    --color-sidebar-ring: var(--sidebar-ring);
    --color-sidebar-border: var(--sidebar-border);
    --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
    --color-sidebar-accent: var(--sidebar-accent);
    --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
    --color-sidebar-primary: var(--sidebar-primary);
    --color-sidebar-foreground: var(--sidebar-foreground);
    --color-sidebar: var(--sidebar);

    --color-chart-5: var(--chart-5);
    --color-chart-4: var(--chart-4);
    --color-chart-3: var(--chart-3);
    --color-chart-2: var(--chart-2);
    --color-chart-1: var(--chart-1);

    --color-ring: var(--ring);
    --color-input: var(--input);
    --color-border: var(--border);
    --color-destructive: var(--destructive);
    --color-success: var(--success);
    --color-warning: var(--warning);
    --color-declined: var(--declined);
    --color-accent-foreground: var(--accent-foreground);
    --color-accent: var(--accent);
    --color-muted-foreground: var(--muted-foreground);
    --color-muted: var(--muted);
    --color-secondary-foreground: var(--secondary-foreground);
    --color-secondary: var(--secondary);
    --color-primary-foreground: var(--primary-foreground);
    --color-primary: var(--primary);
    --color-popover-foreground: var(--popover-foreground);
    --color-popover: var(--popover);
    --color-card-foreground: var(--card-foreground);
    --color-card: var(--card);
    --color-foreground: var(--foreground);
    --color-background: var(--background);

    --radius-sm: calc(var(--radius) * 0.6);
    --radius-md: calc(var(--radius) * 0.8);
    --radius-lg: var(--radius);
    --radius-xl: calc(var(--radius) * 1.4);
    --radius-2xl: calc(var(--radius) * 1.8);
    --radius-3xl: calc(var(--radius) * 2.2);
    --radius-4xl: calc(var(--radius) * 2.6);
}

/* paste vts-theme.css contents here */
```

## 4. Install the Geist font

```bash
npm install @fontsource-variable/geist
```

## 5. Add shadcn components as needed

```bash
npx shadcn@latest add button card badge input select tooltip
```

Browse all available components: https://ui.shadcn.com/docs/components

---

## Claude Code Skills

The skills used to build this prototype are part of the **VTS Superpowers** Claude Code plugin (`viewthespace/ai-context` on the Claude marketplace).

To install in Claude Code, ask Claude:
> "Install the vtssuperpowers plugin from viewthespace/ai-context"

Key skills used in this project:
- `vtssuperpowers:brainstorming` — design-first workflow before any implementation
- `vtssuperpowers:writing-plans` — structured implementation planning
- `shadcn` — component lookup, usage examples, and audit checklist
- `code-review` — catch hardcoded colors and style violations

---

## Design Conventions

| Rule | Detail |
|------|--------|
| Colors | Always use theme tokens (`text-foreground`, `bg-primary`, etc.) — never hex, rgb, or hardcoded Tailwind colors |
| Typography | Geist Variable for all text; heading weight 600–700 |
| Radius | Use `--radius-*` scale: sm → 4xl |
| Dark mode | Use `.dark` class on `<html>` — tokens switch automatically |
| Sidebar | Always dark (even in light mode) — uses `sidebar-*` token family |
| Copy | Title Case for all UI labels, buttons, tabs, and headings |
| Icons | Lucide only (`lucide-react`) |
| Charts | Reference `var(--color-chart-1)` through `var(--color-chart-5)` |

---

## Color Reference

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--primary` | `oklch(0.51 0.175 277)` | `oklch(0.72 0.175 277)` | Periwinkle — main brand accent |
| `--destructive` | `oklch(0.56 0.17 22)` | `oklch(0.64 0.15 22)` | Red — errors, risk |
| `--success` | `oklch(0.53 0.14 155)` | `oklch(0.62 0.13 155)` | Green — positive states |
| `--warning` | `oklch(0.61 0.13 58)` | `oklch(0.70 0.11 58)` | Amber — caution |
| `--declined` | `oklch(0.53 0.14 295)` | `oklch(0.63 0.13 298)` | Purple — declined/inactive |
| `--chart-1..5` | See vts-theme.css | See vts-theme.css | Data visualization |
