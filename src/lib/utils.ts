import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const cardBase = "rounded-2xl bg-white/70 dark:bg-white/8 backdrop-blur-md p-5"

export const cardGradient = "radial-gradient(ellipse at 10% 90%, rgba(167, 193, 255, 0.05) 0%, transparent 70%), radial-gradient(ellipse at 60% 30%, rgba(196, 181, 253, 0.04) 0%, transparent 75%), rgba(255,255,255,0.7)"
