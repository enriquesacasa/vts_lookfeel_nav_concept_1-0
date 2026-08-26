import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const cardBase = "rounded-2xl bg-card/70 backdrop-blur-md p-5"

export const sidebarBtn = "text-sidebar-foreground/85 border-current bg-transparent hover:bg-white/10"

export const agentIconBtn = "shrink-0 hover:bg-primary hover:text-primary-foreground active:bg-primary/80 active:scale-95 transition-all"

export const cardGradient = "radial-gradient(ellipse at 10% 90%, rgba(167, 193, 255, 0.05) 0%, transparent 70%), radial-gradient(ellipse at 60% 30%, rgba(196, 181, 253, 0.04) 0%, transparent 75%), rgba(255,255,255,0.7)"

// Shared toggle state tokens — used by toggle.tsx AND tabs.tsx to stay in sync.
// Always reference these instead of hardcoding hover/inactive colors in toggle controls.
export const TOGGLE_INACTIVE = "text-muted-foreground"
export const TOGGLE_HOVER    = "hover:bg-primary/10 hover:text-primary"
export const TOGGLE_ACTIVE   = "aria-pressed:bg-primary aria-pressed:text-primary-foreground aria-pressed:hover:bg-primary aria-pressed:hover:text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
export const TOGGLE_ACTIVE_TAB = "data-active:bg-primary data-active:text-primary-foreground data-active:hover:bg-primary data-active:hover:text-primary-foreground"
