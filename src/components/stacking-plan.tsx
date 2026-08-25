import { useState, forwardRef, useImperativeHandle } from "react"
import { Settings2Icon, DownloadIcon, ChevronDownIcon, ConstructionIcon, ScrollTextIcon, HandshakeIcon, FileCheckIcon, ClockIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { FilterBar, toggleFilterValue, clearFilterKey, type FilterDef } from "@/components/filter-chip"

// Expiration bucket colors — semantic, intentionally not theme tokens
// vacant/available use theme-aware values; year buckets are fixed semantic colors
export const COLORS: Record<string, { bg: string; text: string; dashed?: boolean; darkBg?: string }> = {
  vacant:    { bg: "transparent", text: "oklch(0.60 0.02 258)", dashed: true },
  m2m:       { bg: "var(--color-destructive)", text: "#fff" },
  "2026":    { bg: "var(--color-chart-1)",     text: "#fff" },
  "2027":    { bg: "var(--color-chart-2)",     text: "#fff" },
  "2028":    { bg: "var(--color-chart-3)",     text: "#fff" },
  "2029":    { bg: "var(--color-chart-4)",     text: "#fff" },
  "2030":    { bg: "var(--color-chart-5)",     text: "#fff" },
  available: { bg: "oklch(0.26 0.006 258)", text: "oklch(0.72 0.018 278)" },
}

type ExpBucket = keyof typeof COLORS

type OptionDetail = {
  description: string
  fields: { label: string; value: string }[]
  legalSnippet: string
}

export const OPTION_DETAILS: Record<string, OptionDetail> = {
  "Renewal Option": {
    description: "Tenant's right to extend the lease for one additional term.",
    fields: [
      { label: "Renewal Term",     value: "5 years" },
      { label: "Rent Basis",       value: "Fair Market Rent" },
      { label: "Notice Required",  value: "12 months prior to expiration" },
      { label: "Notice Deadline",  value: "Dec 31, 2031" },
      { label: "Conditions",       value: "Tenant not in default" },
    ],
    legalSnippet: "Provided Tenant is not in default, Tenant shall have the option to renew this Lease for one (1) additional term of five (5) years upon written notice delivered no later than twelve (12) months prior to the expiration of the initial term, at Fair Market Rent as determined herein.",
  },
  "Expansion Option": {
    description: "Right to lease additional contiguous space in the Building.",
    fields: [
      { label: "Expansion Space",  value: "~4,500 rentable sf" },
      { label: "Location",         value: "Adjacent / Contiguous" },
      { label: "Rent Basis",       value: "Prevailing market rent" },
      { label: "Notice Required",  value: "60 days prior written notice" },
      { label: "Exercise Window",  value: "One-time right" },
    ],
    legalSnippet: "Tenant shall have a one-time option to expand the Premises to include the adjacent space of approximately 4,500 rentable square feet ('Expansion Space'), exercisable upon sixty (60) days prior written notice, at the then-prevailing market rent for comparable space in the Building.",
  },
  "Termination Option": {
    description: "Right to terminate the lease before its natural expiration.",
    fields: [
      { label: "Effective Date",   value: "End of month 60 of term" },
      { label: "Termination Date", value: "Dec 31, 2027" },
      { label: "Notice Deadline",  value: "Dec 31, 2026" },
      { label: "Notice Required",  value: "12 months prior written notice" },
      { label: "Termination Fee",  value: "6 months Base Rent + unamortized TI" },
    ],
    legalSnippet: "Tenant may terminate this Lease effective as of the last day of the sixtieth (60th) full calendar month by delivering written notice no later than twelve (12) months prior to such date, together with a termination fee equal to six (6) months of then-current Base Rent plus unamortized tenant improvement costs.",
  },
  "ROFO": {
    description: "Right of first offer before Landlord markets available space.",
    fields: [
      { label: "Trigger",          value: "Prior to marketing Available Space" },
      { label: "Response Period",  value: "10 business days from ROFO Notice" },
      { label: "Rent Basis",       value: "Terms specified in ROFO Notice" },
      { label: "Waiver",           value: "Failure to respond = automatic waiver" },
      { label: "Scope",            value: "Any Available Space in Building" },
    ],
    legalSnippet: "Landlord shall provide Tenant with written notice ('ROFO Notice') prior to marketing any Available Space for lease. Tenant shall have ten (10) business days from receipt to exercise its right to lease the Available Space at the terms specified therein. Failure to respond shall be deemed a waiver of Tenant's rights with respect to such space.",
  },
  "ROFR": {
    description: "Right of first refusal to match any bona fide third-party offer.",
    fields: [
      { label: "Trigger",          value: "Bona fide third-party written offer" },
      { label: "Response Period",  value: "5 business days from receipt" },
      { label: "Match Terms",      value: "Same terms and conditions as offer" },
      { label: "Scope",            value: "Any Available Space in Building" },
      { label: "Delivery",         value: "Copy of offer delivered to Tenant" },
    ],
    legalSnippet: "In the event Landlord receives a bona fide written offer from a third party to lease any Available Space, Landlord shall deliver a copy of such offer to Tenant. Tenant shall have five (5) business days to elect to lease such space on the same terms and conditions as the third-party offer by delivering written notice to Landlord.",
  },
}

export type Space = {
  suite: string
  sf: number
  tenant?: string
  dba?: string
  standardizedTenant?: string
  baseRent?: number
  grossRent?: number
  inPlaceRent?: number
  lcd?: string
  lxd?: string
  expBucket: ExpBucket
  deals?: number
  dealNote?: string
  industry?: string
  leaseOptions?: string[]
  listed?: boolean
  sublease?: boolean
  daysListed?: number
  daysVacant?: number
  committedLease?: boolean
  committedTenant?: string
  committedLcd?: string
  committedLxd?: string
  committedExpBucket?: ExpBucket
  executedDeal?: boolean
  internalNote?: string
  encumbrances?: {
    tenant: string
    suite: string
    optionType: string
    priority: number
    details: { label: string; value: string }[]
  }[]
}

export type Floor = { number: number; totalSf: number; spaces: Space[] }

export const floors: Floor[] = [
  {
    number: 15, totalSf: 18000,
    spaces: [{ suite: "1500", sf: 18000, expBucket: "vacant", listed: true, daysListed: 47, daysVacant: 62,
      encumbrances: [
        { tenant: "Blackstone Group", suite: "1300", optionType: "Expansion Option", priority: 1,
          details: [{ label: "Trigger", value: "Landlord offers space to market" }, { label: "Response Period", value: "60 days written notice" }, { label: "Priority", value: "1st right" }, { label: "Rent Basis", value: "Prevailing market rent" }] },
      ],
    }],
  },
  {
    number: 14, totalSf: 18000,
    spaces: [
      { suite: "1400", sf: 10000, tenant: "Blackstone Group", dba: "BX Real Estate", standardizedTenant: "Blackstone Inc.", baseRent: 102.50, grossRent: 118.75, inPlaceRent: 102.50, lcd: "07/01/20", lxd: "06/30/30", expBucket: "2030", industry: "Financial Services", leaseOptions: ["Renewal Option", "ROFO"] },
      { suite: "1410", sf: 8000, expBucket: "available", deals: 1, listed: true, daysListed: 112, daysVacant: 145, internalNote: "Under offer — do not market" },
    ],
  },
  {
    number: 13, totalSf: 18000,
    spaces: [{ suite: "1300", sf: 18000, tenant: "Blackstone Group", dba: "BX Real Estate", standardizedTenant: "Blackstone Inc.", baseRent: 102.50, grossRent: 118.75, inPlaceRent: 102.50, lcd: "07/01/20", lxd: "06/30/30", expBucket: "2030", industry: "Financial Services", leaseOptions: ["Renewal Option", "Expansion Option", "ROFO"] }],
  },
  {
    number: 12, totalSf: 18000,
    spaces: [{ suite: "1200", sf: 18000, tenant: "Vantage Point Capital", standardizedTenant: "Vantage Point Capital LP", baseRent: 98.35, grossRent: 113.20, inPlaceRent: 98.35, lcd: "01/01/23", lxd: "12/31/29", expBucket: "2029", industry: "Financial Services", leaseOptions: ["Renewal Option"], executedDeal: true }],
  },
  {
    number: 11, totalSf: 18000,
    spaces: [{ suite: "1100", sf: 18000, tenant: "Amazon MGM Studios", dba: "Amazon Studios", standardizedTenant: "Amazon.com Inc.", baseRent: 89.12, grossRent: 103.40, inPlaceRent: 89.12, lcd: "10/01/22", lxd: "09/30/29", expBucket: "2029", industry: "Media & Entertainment", leaseOptions: ["Renewal Option", "Expansion Option"],
      encumbrances: [
        { tenant: "Blackstone Group", suite: "1300", optionType: "Expansion Option", priority: 1,
          details: [{ label: "Trigger", value: "Space becomes available" }, { label: "Response Period", value: "60 days written notice" }, { label: "Priority", value: "1st right — senior claim" }, { label: "Rent Basis", value: "Prevailing market rent" }] },
      ],
    }],
  },
  {
    number: 10, totalSf: 18000,
    spaces: [{ suite: "1000", sf: 18000, tenant: "Amazon MGM Studios", dba: "Amazon Studios", standardizedTenant: "Amazon.com Inc.", baseRent: 89.12, grossRent: 103.40, inPlaceRent: 89.12, lcd: "10/01/20", lxd: "09/30/30", expBucket: "2030", industry: "Media & Entertainment" }],
  },
  {
    number: 9, totalSf: 20000,
    spaces: [{ suite: "0900", sf: 20000, expBucket: "vacant", deals: 1, dealNote: "Amazon MGM Studios | LCD 01/01/27", committedLease: true, committedTenant: "Amazon MGM Studios", committedLcd: "01/01/27", committedLxd: "12/31/30", committedExpBucket: "2030", listed: true, daysListed: 28, daysVacant: 90, internalNote: "Preferred deal in LOI stage",
      encumbrances: [
        { tenant: "Sullivan & Cromwell", suite: "0700", optionType: "ROFR", priority: 1,
          details: [{ label: "Trigger", value: "Bona fide third-party offer received" }, { label: "Response Period", value: "5 business days" }, { label: "Priority", value: "1st right" }, { label: "Match Terms", value: "Same as third-party offer" }, { label: "Notice Date", value: "Must notify by Dec 1, 2026" }] },
        { tenant: "Arthur & Brennan LLP", suite: "0400", optionType: "ROFO", priority: 2,
          details: [{ label: "Trigger", value: "Prior to marketing to market" }, { label: "Response Period", value: "10 business days" }, { label: "Priority", value: "2nd right — subordinate to Sullivan ROFR" }, { label: "Rent Basis", value: "As specified in ROFO Notice" }] },
        { tenant: "Amazon MGM Studios", suite: "1100", optionType: "Expansion Option", priority: 3,
          details: [{ label: "Trigger", value: "Space becomes available for lease" }, { label: "Response Period", value: "15 business days" }, { label: "Priority", value: "3rd right — subordinate to Sullivan ROFR and Arthur ROFO" }, { label: "Rent Basis", value: "Prevailing market rent" }, { label: "Notice Deadline", value: "Sep 30, 2029" }] },
      ],
    }],
  },
  {
    number: 8, totalSf: 20000,
    spaces: [{ suite: "0800", sf: 20000, tenant: "Sullivan & Cromwell", standardizedTenant: "Sullivan & Cromwell LLP", baseRent: 93.14, grossRent: 107.60, inPlaceRent: 93.14, lcd: "05/01/19", lxd: "04/30/29", expBucket: "2029", industry: "Legal", leaseOptions: ["Renewal Option", "Termination Option"],
      encumbrances: [
        { tenant: "Pacific Wealth Mngt.", suite: "0500", optionType: "ROFO", priority: 1,
          details: [{ label: "Trigger", value: "Sullivan & Cromwell vacates or markets" }, { label: "Response Period", value: "10 business days" }, { label: "Priority", value: "1st right" }, { label: "Rent Basis", value: "As specified in ROFO Notice" }, { label: "Notice Deadline", value: "Apr 30, 2029" }] },
      ],
    }],
  },
  {
    number: 7, totalSf: 20000,
    spaces: [{ suite: "0700", sf: 20000, tenant: "Sullivan & Cromwell", standardizedTenant: "Sullivan & Cromwell LLP", baseRent: 93.14, grossRent: 107.60, inPlaceRent: 93.14, lcd: "05/01/19", lxd: "04/30/29", expBucket: "2029", industry: "Legal", deals: 1, leaseOptions: ["Renewal Option", "ROFR"], executedDeal: true }],
  },
  {
    number: 6, totalSf: 20000,
    spaces: [
      { suite: "0600", sf: 6500, expBucket: "available", deals: 1, listed: true, daysListed: 210, daysVacant: 210 },
      { suite: "0620", sf: 5500, expBucket: "available", deals: 2, listed: true, sublease: true, daysListed: 180, daysVacant: 195, internalNote: "Sublease — Tenant marketing directly" },
      { suite: "0640", sf: 8000, expBucket: "available", deals: 1, listed: false, daysVacant: 310 },
    ],
  },
  {
    number: 5, totalSf: 20000,
    spaces: [{ suite: "0500", sf: 20000, tenant: "Pacific Wealth Mngt.", standardizedTenant: "Pacific Wealth Management LLC", baseRent: 89.60, grossRent: 104.10, inPlaceRent: 89.60, lcd: "12/01/21", lxd: "11/30/28", expBucket: "2028", industry: "Financial Services", leaseOptions: ["Renewal Option", "ROFO"],
      encumbrances: [
        { tenant: "Meridian Health Partners", suite: "0300", optionType: "Expansion Option", priority: 1,
          details: [{ label: "Trigger", value: "Pacific Wealth vacates or gives back space" }, { label: "Response Period", value: "60 days written notice" }, { label: "Priority", value: "1st right" }, { label: "Rent Basis", value: "Prevailing market rent" }, { label: "Deadline", value: "Nov 30, 2027" }] },
        { tenant: "Carlyle & Associates", suite: "0200", optionType: "ROFR", priority: 2,
          details: [{ label: "Trigger", value: "Bona fide third-party offer on this space" }, { label: "Response Period", value: "5 business days" }, { label: "Priority", value: "2nd right — subordinate to Meridian" }, { label: "Match Terms", value: "Same as third-party offer" }] },
      ],
    }],
  },
  {
    number: 4, totalSf: 20000,
    spaces: [{ suite: "0400", sf: 20000, tenant: "Arthur & Brennan LLP", standardizedTenant: "Arthur & Brennan LLP", baseRent: 87.00, grossRent: 101.50, inPlaceRent: 87.00, lcd: "01/01/20", lxd: "12/31/29", expBucket: "2029", industry: "Legal", leaseOptions: ["Renewal Option", "ROFO"], executedDeal: true }],
  },
  {
    number: 3, totalSf: 20000,
    spaces: [
      { suite: "0300", sf: 12000, tenant: "Meridian Health Partners", standardizedTenant: "Meridian Health Partners Inc.", baseRent: 85.50, grossRent: 99.80, inPlaceRent: 85.50, lcd: "04/01/18", lxd: "03/31/28", expBucket: "2028", industry: "Healthcare", leaseOptions: ["Renewal Option", "Expansion Option"] },
      { suite: "0320", sf: 8000, expBucket: "vacant", listed: true, daysListed: 55, daysVacant: 55,
        encumbrances: [
          { tenant: "Meridian Health Partners", suite: "0300", optionType: "Expansion Option", priority: 1,
            details: [{ label: "Trigger", value: "Space becomes available" }, { label: "Response Period", value: "60 days written notice" }, { label: "Priority", value: "1st right" }, { label: "Rent Basis", value: "Prevailing market rent" }, { label: "Deadline", value: "Mar 31, 2027" }] },
        ],
      },
    ],
  },
  {
    number: 2, totalSf: 20000,
    spaces: [{ suite: "0200", sf: 20000, tenant: "Carlyle & Associates", dba: "Carlyle Advisory", standardizedTenant: "The Carlyle Group Inc.", baseRent: 91.00, grossRent: 105.25, inPlaceRent: 91.00, lcd: "07/01/18", lxd: "06/30/28", expBucket: "2028", industry: "Financial Services", leaseOptions: ["Renewal Option", "Termination Option", "ROFR"], sublease: true }],
  },
  {
    number: 1, totalSf: 5000,
    spaces: [{ suite: "0100", sf: 5000, tenant: "CVS Health", standardizedTenant: "CVS Health Corporation", baseRent: 72.00, grossRent: 82.50, inPlaceRent: 72.00, lcd: "01/01/18", lxd: "12/31/27", expBucket: "2027", industry: "Retail", leaseOptions: ["Renewal Option"], executedDeal: true }],
  },
]

const LEGEND_KEYS: { label: string; key: ExpBucket }[] = [
  { label: "Vacant",    key: "vacant" },
  { label: "M2M",       key: "m2m" },
  { label: "2026",      key: "2026" },
  { label: "2027",      key: "2027" },
  { label: "2028",      key: "2028" },
  { label: "2029",      key: "2029" },
  { label: "2030",      key: "2030" },
  { label: "Available", key: "available" },
]

const allSpaces = floors.flatMap((f) => f.spaces)
const allTenants = [...new Set(allSpaces.filter((s) => s.tenant).map((s) => s.tenant!))]

export const FILTER_DEFS: FilterDef[] = [
  { key: "tenant",         label: "Tenant",         options: allTenants.map((t) => ({ label: t, value: t })) },
  { key: "space",          label: "Space",           options: allSpaces.map((s) => ({ label: `${s.suite} — ${(s.sf / 1000).toFixed(0)}K sf`, value: s.suite })) },
  { key: "size",           label: "Size",            options: [{ label: "Under 5,000 sf", value: "xs" }, { label: "5,000–10,000 sf", value: "sm" }, { label: "10,000–20,000 sf", value: "md" }, { label: "Over 20,000 sf", value: "lg" }] },
  { key: "expBucket", label: "LXD", options: LEGEND_KEYS.map(({ label, key }) => ({ label, value: key })) },
  { key: "industry",       label: "Industry",        options: ["Financial Services", "Legal", "Technology", "Healthcare", "Retail", "Media & Entertainment"].map((i) => ({ label: i, value: i })) },
  { key: "options",        label: "Options",         options: ["Renewal Option", "Expansion Option", "Termination Option", "ROFO", "ROFR"].map((o) => ({ label: o, value: o })) },
  { key: "encumbrances",   label: "Encumbrances",    options: ["Expansion Option", "ROFO", "ROFR"].map((o) => ({ label: o, value: o })) },
  { key: "availability",   label: "Availability",    options: [{ label: "Available", value: "available" }, { label: "Not Available", value: "not-available" }] },
  { key: "occupancy",      label: "Occupancy",       options: [{ label: "Occupied", value: "occupied" }, { label: "Vacant", value: "vacant" }] },
  { key: "listingStatus",  label: "Listing Status",  options: [{ label: "Listed", value: "listed" }, { label: "Not Listed", value: "not-listed" }] },
  { key: "subleaseStatus", label: "Sublease Status", options: [{ label: "Sublease", value: "sublease" }, { label: "Direct", value: "direct" }] },
]

export const VIEW_OPTIONS = [
  "Tenant Name", "DBA", "Standardized Tenant (ST)", "Industry", "Space", "Total Size",
  "LCD", "LXD", "In-place rent ($/sf/yr)", "Base rent ($/sf/yr)", "Gross rent ($/sf/yr)",
  "Days Listed", "Days Vacant", "Deals", "Executed Deal", "Committed Lease",
  "Options", "Encumbrances", "Internal Space Note", "0sf spaces",
]

export const DEFAULT_VIEW_OPTIONS = new Set([
  "Tenant Name", "Space", "Total Size", "LCD", "LXD", "Base rent ($/sf/yr)", "Options", "Deals", "Encumbrances",
])

type ViewType = "Condensed" | "Standard" | "Expanded"

const VIEW_CONFIG: Record<ViewType, { minHeight: number; padding: string; nameCls: string; metaCls: string }> = {
  Condensed: { minHeight: 48,  padding: "4px 8px",   nameCls: "text-xs",   metaCls: "text-[10px]" },
  Standard:  { minHeight: 84,  padding: "10px 12px", nameCls: "text-sm",   metaCls: "text-xs" },
  Expanded:  { minHeight: 120, padding: "14px 16px", nameCls: "text-base", metaCls: "text-sm" },
}

export function matchesFilters(space: Space, active: Record<string, string[]>): boolean {
  const f = (key: string) => active[key] ?? []
  if (f("tenant").length && (!space.tenant || !f("tenant").includes(space.tenant))) return false
  if (f("space").length && !f("space").includes(space.suite)) return false
  if (f("size").length) {
    const bucket = space.sf < 5000 ? "xs" : space.sf < 10000 ? "sm" : space.sf <= 20000 ? "md" : "lg"
    if (!f("size").includes(bucket)) return false
  }
  if (f("expBucket").length && !f("expBucket").includes(space.expBucket as string)) return false
  if (f("industry").length && (!space.industry || !f("industry").includes(space.industry))) return false
  if (f("options").length && !space.leaseOptions?.some((o) => f("options").includes(o))) return false
  if (f("encumbrances").length && !space.encumbrances?.some((e) => f("encumbrances").includes(e.optionType))) return false
  if (f("availability").length) {
    const isUnoccupied = space.expBucket === "available" || space.expBucket === "vacant"
    if (!f("availability").some((v) => (v === "available" ? isUnoccupied : !isUnoccupied))) return false
  }
  if (f("occupancy").length) {
    const isVacant = space.expBucket === "vacant" || space.expBucket === "available"
    const isOccupied = !!space.tenant && !isVacant
    if (!f("occupancy").some((v) => (v === "vacant" ? isVacant : isOccupied))) return false
  }
  if (f("listingStatus").length) {
    if (!f("listingStatus").some((v) => (v === "listed" ? !!space.listed : !space.listed))) return false
  }
  if (f("subleaseStatus").length) {
    if (!f("subleaseStatus").some((v) => (v === "sublease" ? !!space.sublease : !space.sublease))) return false
  }
  return true
}

type ExpirationMode = "in-place" | "in-place-committed" | "moving-forward" | "lease-abstract"

const EXPIRATION_MODE_LABELS: Record<ExpirationMode, string> = {
  "in-place":           "Expirations (In-Place)",
  "in-place-committed": "Expirations (In-Place + Committed)",
  "moving-forward":     "Expirations (Moving Forward)",
  "lease-abstract":     "Expirations (Lease Abstract)",
}

function parseMDY(s: string): Date {
  const [m, d, y] = s.split("/").map(Number)
  return new Date(y < 100 ? 2000 + y : y, m - 1, d)
}

function getExpBucketForYear(y: number): ExpBucket {
  if (y <= 2026) return "2026"
  if (y === 2027) return "2027"
  if (y === 2028) return "2028"
  if (y === 2029) return "2029"
  return "2030"
}

type Encumbrance = NonNullable<Space["encumbrances"]>[0]
function isEncumbranceActiveAtDate(enc: Encumbrance, date: Date): boolean {
  const sourceSpace = floors.flatMap((f) => f.spaces).find((s) => s.suite === enc.suite)
  if (!sourceSpace?.lxd) return false
  return date <= parseMDY(sourceSpace.lxd)
}

function getSpaceAtDate(space: Space, date: Date): Space {
  if (space.lxd && space.lcd) {
    const lcd = parseMDY(space.lcd)
    const lxd = parseMDY(space.lxd)
    if (date >= lcd && date <= lxd) {
      return { ...space, expBucket: getExpBucketForYear(lxd.getFullYear()) }
    }
  }
  if (space.committedLcd && space.committedLxd && space.committedTenant) {
    const lcd = parseMDY(space.committedLcd)
    const lxd = parseMDY(space.committedLxd)
    if (date >= lcd && date <= lxd) {
      const activeEncumbrances = space.encumbrances?.filter((e) => isEncumbranceActiveAtDate(e, date))
      return {
        ...space,
        tenant: space.committedTenant,
        lcd: space.committedLcd,
        lxd: space.committedLxd,
        expBucket: space.committedExpBucket ?? getExpBucketForYear(lxd.getFullYear()),
        leaseOptions: undefined,
        encumbrances: activeEncumbrances?.length ? activeEncumbrances : undefined,
        deals: undefined, listed: undefined, daysListed: undefined, daysVacant: undefined,
      }
    }
  }
  const activeEncumbrances = space.encumbrances?.filter((e) => isEncumbranceActiveAtDate(e, date))
  return {
    ...space,
    expBucket: "vacant",
    tenant: undefined, lcd: undefined, lxd: undefined,
    leaseOptions: undefined,
    encumbrances: activeEncumbrances?.length ? activeEncumbrances : undefined,
  }
}

const ALL_LXD_DATES = floors.flatMap((f) =>
  f.spaces.flatMap((s) => [s.lxd, s.committedLxd].filter(Boolean) as string[])
).map(parseMDY)
const SLIDER_MIN_DATE = new Date(2026, 5, 1)
const SLIDER_MAX_DATE = (() => {
  const last = ALL_LXD_DATES.reduce((a, b) => (b > a ? b : a), SLIDER_MIN_DATE)
  const d = new Date(last); d.setMonth(d.getMonth() + 1); return d
})()
const SLIDER_TOTAL_MONTHS =
  (SLIDER_MAX_DATE.getFullYear() - SLIDER_MIN_DATE.getFullYear()) * 12 +
  (SLIDER_MAX_DATE.getMonth() - SLIDER_MIN_DATE.getMonth())

function addMonths(base: Date, months: number): Date {
  const d = new Date(base); d.setMonth(d.getMonth() + months); return d
}
function formatSliderDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

// --- Expiration Mode Popover ---
function ExpirationModePopover({ mode, onSelect }: { mode: ExpirationMode; onSelect: (m: ExpirationMode) => void }) {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" size="sm" className="mr-2 shrink-0 gap-1 font-normal whitespace-nowrap max-w-[220px] sm:max-w-none truncate" />}>
        {mode === "moving-forward" && <ClockIcon className="size-3 shrink-0" />}
        <span className="truncate">{EXPIRATION_MODE_LABELS[mode]}</span>
        <ChevronDownIcon data-icon="inline-end" className="shrink-0" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <p className="text-xs font-semibold text-muted-foreground px-1 mb-1.5 uppercase tracking-wide">Expiration View</p>
        <div className="flex flex-col gap-0.5">
          {(["in-place", "in-place-committed", "moving-forward", "lease-abstract"] as ExpirationMode[]).map((m) => (
            <Button key={m} variant="ghost" size="sm" onClick={() => onSelect(m)}
              className={cn("w-full justify-start gap-2 h-auto py-2 font-normal", mode === m && "bg-primary/10 text-primary font-medium")}>
              {m === "moving-forward" && <ClockIcon className="size-3.5 shrink-0" />}
              <span>{EXPIRATION_MODE_LABELS[m]}</span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// --- View Settings Popover ---
function ViewSettingsPopover({ viewType, onViewTypeChange, enabledOptions, onToggleOption }: {
  viewType: ViewType; onViewTypeChange: (v: ViewType) => void
  enabledOptions: Set<string>; onToggleOption: (opt: string) => void
}) {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" size="sm" />}>
        <Settings2Icon data-icon="inline-start" />
        <span className="hidden sm:inline">View</span>
        <ChevronDownIcon data-icon="inline-end" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0 overflow-hidden">
        <div className="px-3 py-2.5 border-b border-border bg-muted/40">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">View Type</p>
        </div>
        <div className="p-2 border-b border-border">
          <ToggleGroup spacing={0} variant="outline" size="sm" value={[viewType]}
            onValueChange={(v) => { if (v && v !== viewType) onViewTypeChange(v as ViewType) }}
            className="w-full">
            {(["Condensed", "Standard", "Expanded"] as ViewType[]).map((vt) => (
              <ToggleGroupItem key={vt} value={vt} className="flex-1 text-xs">{vt}</ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="px-3 py-2.5 border-b border-border bg-muted/40">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">View Options</p>
        </div>
        <div className="max-h-64 overflow-y-auto py-1">
          {VIEW_OPTIONS.map((opt) => (
            <label key={opt} className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-muted cursor-pointer">
              <Checkbox checked={enabledOptions.has(opt)} onCheckedChange={() => onToggleOption(opt)} className="size-3.5" />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}


export type StackingPlanCommand =
  | { type: "setFilters"; filters: Record<string, string[]> }
  | { type: "clearFilters" }
  | { type: "setExpirationMode"; mode: ExpirationMode }
  | { type: "setSliderMonths"; months: number }
  | { type: "setViewType"; viewType: ViewType }

export type StackingPlanHandle = { applyCommand: (cmd: StackingPlanCommand) => void }

// --- Main Component ---
export const StackingPlan = forwardRef<StackingPlanHandle>(function StackingPlan(_, ref) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({})
  const [viewType, setViewType] = useState<ViewType>("Standard")
  const [enabledOptions, setEnabledOptions] = useState<Set<string>>(new Set(DEFAULT_VIEW_OPTIONS))
  const [expirationMode, setExpirationMode] = useState<ExpirationMode>("in-place")
  const [sliderMonths, setSliderMonths] = useState(0)

  type CircleInfo = { color: "blue" | "orange"; n: number }
  type HighlightState = { active: string; type: "options" | "encumbrances"; circles: Record<string, CircleInfo[]> }
  const [activeHighlight, setActiveHighlight] = useState<HighlightState | null>(null)

  function buildHighlight(space: Space, type: "options" | "encumbrances"): HighlightState {
    const circles: Record<string, CircleInfo[]> = {}
    const all = floors.flatMap((f) => f.spaces)
    if (type === "options") {
      const SOURCE_OPTS = new Set(["Renewal Option", "Termination Option"])
      ;(space.leaseOptions ?? []).forEach((optType, i) => {
        const n = i + 1
        if (SOURCE_OPTS.has(optType)) {
          circles[space.suite] = [...(circles[space.suite] ?? []), { color: "blue" as const, n }]
        } else {
          all.forEach((s) => {
            if (s.encumbrances?.some((e) => e.suite === space.suite && e.optionType === optType)) {
              circles[s.suite] = [...(circles[s.suite] ?? []), { color: "blue" as const, n }]
            }
          })
        }
      })
    } else {
      space.encumbrances?.forEach((e) => {
        circles[e.suite] = [{ color: "orange" as const, n: e.priority }]
      })
    }
    return { active: space.suite, type, circles }
  }

  useImperativeHandle(ref, () => ({
    applyCommand(cmd: StackingPlanCommand) {
      if (cmd.type === "setFilters") setActiveFilters(cmd.filters)
      else if (cmd.type === "clearFilters") setActiveFilters({})
      else if (cmd.type === "setExpirationMode") setExpirationMode(cmd.mode)
      else if (cmd.type === "setSliderMonths") setSliderMonths(cmd.months)
      else if (cmd.type === "setViewType") setViewType(cmd.viewType)
    },
  }))

  const cfg = VIEW_CONFIG[viewType]
  const show = (opt: string) => enabledOptions.has(opt)

  const toggleFilter = (key: string, value: string) =>
    setActiveFilters((prev) => toggleFilterValue(prev, key, value))
  const clearFilter = (key: string) =>
    setActiveFilters((prev) => clearFilterKey(prev, key))
  const clearAll = () => setActiveFilters({})
  const toggleOption = (opt: string) =>
    setEnabledOptions((prev) => { const n = new Set(prev); n.has(opt) ? n.delete(opt) : n.add(opt); return n })

  const sliderDate = addMonths(SLIDER_MIN_DATE, sliderMonths)

  const resolvedFloors = floors.map((floor) => {
    const spaces = floor.spaces.map((space) => {
      if (expirationMode === "in-place-committed" && space.committedLease && space.committedTenant) {
        return { ...space, expBucket: space.committedExpBucket ?? "2030", tenant: space.committedTenant, lcd: space.committedLcd, lxd: space.committedLxd } as Space
      }
      if (expirationMode === "moving-forward") return getSpaceAtDate(space, sliderDate)
      if (expirationMode === "lease-abstract") { if (!space.tenant) return null; return space }
      return space
    })
    return { ...floor, spaces: spaces.filter((s): s is Space => s !== null) }
  })

  const filteredFloors = resolvedFloors
    .map((floor) => {
      let spaces = floor.spaces.filter((s) => matchesFilters(s, activeFilters))
      if (!show("0sf spaces")) spaces = spaces.filter((s) => s.sf > 0)
      const totalSf = spaces.reduce((sum, s) => sum + s.sf, 0)
      return { ...floor, spaces, totalSf }
    })
    .filter((floor) => floor.spaces.length > 0)

  const totalSf = resolvedFloors.reduce((s, f) => s + f.totalSf, 0)
  const bucketStats = LEGEND_KEYS.map(({ label, key }) => {
    const sf = resolvedFloors.flatMap((f) => f.spaces).filter((s) => s.expBucket === key).reduce((s, sp) => s + sp.sf, 0)
    const pct = totalSf > 0 ? Math.round((sf / totalSf) * 100) : 0
    return { label, key, sf, pct }
  })

  return (
    <div className="flex flex-col flex-1 bg-white/70 dark:bg-white/8 backdrop-blur-md rounded-xl overflow-hidden mt-4 mb-6">

      {/* Filter bar */}
      <div className="px-3 py-3 border-b border-border">
        <FilterBar
          filters={FILTER_DEFS}
          active={activeFilters}
          onToggle={toggleFilter}
          onClear={clearFilter}
          onClearAll={clearAll}
          visibleCount={4}
        />
      </div>

      {/* Legend + controls bar */}
      <div className="flex flex-col border-b border-border">
        {/* Top row: expiration mode + controls (always single line) */}
        <div className="flex items-stretch border-b border-border sm:border-b-0">
          <div className="shrink-0 flex items-center px-3 py-2.5 sm:border-r border-border">
            <ExpirationModePopover mode={expirationMode} onSelect={setExpirationMode} />
          </div>
          {/* Legend — inline on sm+, hidden here on mobile */}
          <div className="hidden sm:flex items-center overflow-x-auto flex-1 min-w-0">
            {bucketStats.map(({ label, key, sf, pct }) => {
              const c = COLORS[key]
              const isActive = (activeFilters.expBucket ?? []).includes(key)
              return (
                <Button key={key} variant="ghost" onClick={() => toggleFilter("expBucket", key)}
                  className={cn("flex items-center gap-2 px-3 py-2 rounded-none border-0 border-r border-border last:border-r-0 shrink-0 h-full font-normal", isActive && "bg-primary/10")}>
                  <div className="size-3 rounded-sm shrink-0" style={{
                    background: c.dashed ? "transparent" : c.bg,
                    border: c.dashed ? "1.5px dashed var(--color-border)" : "none",
                    outline: isActive ? "2px solid var(--color-primary)" : "none",
                    outlineOffset: "1px",
                  }} />
                  <div className="flex flex-col leading-none gap-1 text-left">
                    <span className={cn("text-xs font-medium whitespace-nowrap", isActive ? "text-primary" : "text-foreground")}>{label}</span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{pct}% · {sf > 0 ? `${Math.round(sf / 1000)}K sf` : "—"}</span>
                  </div>
                </Button>
              )
            })}
          </div>
          <div className="ml-auto shrink-0 flex items-center gap-1.5 px-3 border-l border-border">
            <ViewSettingsPopover viewType={viewType} onViewTypeChange={setViewType} enabledOptions={enabledOptions} onToggleOption={toggleOption} />
            <Button size="sm" variant="outline" className="gap-1.5">
              <DownloadIcon className="size-4 shrink-0" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>
        {/* Legend row — mobile only, second row */}
        <div className="flex sm:hidden items-center overflow-x-auto border-b-0">
          {bucketStats.map(({ label, key, sf, pct }) => {
            const c = COLORS[key]
            const isActive = (activeFilters.expBucket ?? []).includes(key)
            return (
              <Button key={key} variant="ghost" onClick={() => toggleFilter("expBucket", key)}
                className={cn("flex items-center gap-2 px-3 py-2 rounded-none border-0 border-r border-border last:border-r-0 shrink-0 h-auto font-normal", isActive && "bg-primary/10")}>
                <div className="size-3 rounded-sm shrink-0" style={{
                  background: c.dashed ? "transparent" : c.bg,
                  border: c.dashed ? "1.5px dashed var(--color-border)" : "none",
                  outline: isActive ? "2px solid var(--color-primary)" : "none",
                  outlineOffset: "1px",
                }} />
                <div className="flex flex-col leading-none gap-1 text-left">
                  <span className={cn("text-xs font-medium whitespace-nowrap", isActive ? "text-primary" : "text-foreground")}>{label}</span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{pct}% · {sf > 0 ? `${Math.round(sf / 1000)}K sf` : "—"}</span>
                </div>
              </Button>
            )
          })}
        </div>

        {expirationMode === "moving-forward" && (
          <div className="flex items-center gap-3 px-4 py-3 border-t border-border bg-muted/20">
            <span className="text-xs text-muted-foreground shrink-0">{formatSliderDate(SLIDER_MIN_DATE)}</span>
            <input type="range" min={0} max={SLIDER_TOTAL_MONTHS} step={1} value={sliderMonths}
              onChange={(e) => setSliderMonths(Number(e.target.value))}
              className="flex-1 accent-primary cursor-pointer" />
            <span className="text-xs text-muted-foreground shrink-0">{formatSliderDate(SLIDER_MAX_DATE)}</span>
            <span className="text-xs font-semibold shrink-0 min-w-[80px] text-center rounded-md px-2 py-1 border border-border bg-background text-primary">
              {formatSliderDate(sliderDate)}
            </span>
          </div>
        )}
      </div>

      {/* Floor rows */}
      <div className="flex-1 overflow-y-auto">
        {filteredFloors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <p className="text-sm font-medium text-muted-foreground">No spaces match the selected filters</p>
            <Button variant="link" size="sm" onClick={clearAll} className="px-0 text-primary">Clear All Filters</Button>
          </div>
        ) : filteredFloors.map((floor) => {
          const vacantSf = floor.spaces.filter((s) => s.expBucket === "vacant" || s.expBucket === "available").reduce((s, sp) => s + sp.sf, 0)
          return (
            <div key={floor.number} className="flex border-b border-border last:border-b-0" style={{ minHeight: cfg.minHeight }}>
              {/* Floor label */}
              <div className="w-20 sm:w-28 shrink-0 flex flex-col justify-center px-2 sm:px-3 py-2 border-r border-border bg-muted/20">
                <span className={cn("font-semibold text-foreground tabular-nums", cfg.nameCls)}>Fl. {floor.number}</span>
                <span className={cn("text-muted-foreground tabular-nums hidden sm:block", cfg.metaCls)}>{floor.totalSf.toLocaleString()} sf</span>
                {vacantSf > 0 && <span className={cn("text-muted-foreground tabular-nums hidden sm:block", cfg.metaCls)}>{vacantSf.toLocaleString()} avail.</span>}
              </div>

              {/* Spaces */}
              <div className="flex flex-1 min-w-0">
                {floor.spaces.map((space) => {
                  const c = COLORS[space.expBucket]
                  const isVacant = space.expBucket === "vacant"
                  const isAvailable = space.expBucket === "available"
                  const widthPct = floor.totalSf > 0 ? (space.sf / floor.totalSf) * 100 : 100

                  const isActive = activeHighlight?.active === space.suite
                  const spaceCircles = activeHighlight?.circles[space.suite] ?? []
                  const isRelated = !isActive && spaceCircles.length > 0
                  const isDimmed = activeHighlight !== null && !isActive && !isRelated

                  return (
                    <div key={space.suite}
                      className="relative flex flex-col justify-between border-r border-black/10 dark:border-white/5 last:border-r-0 cursor-default transition-all overflow-hidden"
                      style={{
                        width: `${widthPct}%`,
                        flexShrink: 0,
                        background: c.bg,
                        color: c.text,
                        border: c.dashed ? "2px dashed var(--color-border)" : undefined,
                        padding: cfg.padding,
                        boxShadow: isActive
                          ? `inset 0 0 0 2.5px ${activeHighlight?.type === "options" ? "#2563eb" : "#ea580c"}`
                          : isRelated
                            ? `inset 0 0 0 2px ${activeHighlight?.type === "options" ? "rgb(37 99 235 / 0.4)" : "rgb(234 88 12 / 0.4)"}`
                            : undefined,
                        filter: isDimmed ? "brightness(0.75) saturate(0.5)" : undefined,
                        transition: "filter 0.15s ease, box-shadow 0.15s ease",
                      }}>

                      <div className="flex items-start justify-between gap-1">
                        <div className="min-w-0 flex flex-col gap-0.5 overflow-hidden">

                          {isVacant || isAvailable ? (
                            <>
                              {show("Space") && (
                                <div className="flex items-center gap-1 min-w-0">
                                  <p className={cn("font-semibold truncate", cfg.nameCls)}>{space.suite}</p>
                                  {spaceCircles.map((ci, i) => (
                                    <span key={i} className="size-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 text-white" style={{ background: ci.color === "blue" ? "#2563eb" : "#ea580c" }}>{ci.n}</span>
                                  ))}
                                </div>
                              )}
                              {show("Total Size") && <p className={cn("opacity-75", cfg.metaCls)}>{space.sf.toLocaleString()} sf</p>}
                              {show("Days Listed") && space.daysListed != null && <p className={cn("opacity-65", cfg.metaCls)}>{space.daysListed}d listed</p>}
                              {show("Days Vacant") && space.daysVacant != null && <p className={cn("opacity-65", cfg.metaCls)}>{space.daysVacant}d vacant</p>}
                              {space.dealNote && !space.committedLease && <p className={cn("opacity-65 mt-0.5", cfg.metaCls)}>▪ {space.dealNote}</p>}
                              {show("Internal Space Note") && space.internalNote && <p className={cn("opacity-55 mt-0.5 italic truncate", cfg.metaCls)}>{space.internalNote}</p>}
                            </>
                          ) : (
                            <>
                              {show("Tenant Name") && (
                                <div className="flex items-center gap-1 min-w-0">
                                  <p className={cn("font-semibold leading-tight truncate", cfg.nameCls)}>{space.tenant}</p>
                                  {spaceCircles.map((ci, i) => (
                                    <span key={i} className="size-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 text-white" style={{ background: ci.color === "blue" ? "#2563eb" : "#ea580c" }}>{ci.n}</span>
                                  ))}
                                </div>
                              )}
                              {show("DBA") && space.dba && <p className={cn("opacity-70 truncate", cfg.metaCls)}>DBA: {space.dba}</p>}
                              {show("Industry") && space.industry && <p className={cn("opacity-70 truncate", cfg.metaCls)}>{space.industry}</p>}
                              {show("Standardized Tenant (ST)") && space.standardizedTenant && <p className={cn("opacity-60 truncate", cfg.metaCls)}>ST: {space.standardizedTenant}</p>}
                              {(show("Space") || show("Total Size")) && (
                                <p className={cn("opacity-70 truncate", cfg.metaCls)}>
                                  {[show("Space") && space.suite, show("Total Size") && `${space.sf.toLocaleString()} sf`].filter(Boolean).join(" · ")}
                                </p>
                              )}
                              {(show("LCD") || show("LXD")) && (space.lcd || space.lxd) && (
                                <p className={cn("opacity-60 truncate", cfg.metaCls)}>
                                  {[show("LCD") && space.lcd && `LCD ${space.lcd}`, show("LXD") && space.lxd && `LXD ${space.lxd}`].filter(Boolean).join(" · ")}
                                </p>
                              )}
                              {(show("In-place rent ($/sf/yr)") || show("Base rent ($/sf/yr)") || show("Gross rent ($/sf/yr)")) && (
                                <p className={cn("opacity-60 truncate", cfg.metaCls)}>
                                  {[
                                    show("In-place rent ($/sf/yr)") && space.inPlaceRent != null && `IP $${space.inPlaceRent.toFixed(2)}`,
                                    show("Base rent ($/sf/yr)") && space.baseRent != null && `Base $${space.baseRent.toFixed(2)}`,
                                    show("Gross rent ($/sf/yr)") && space.grossRent != null && `Gross $${space.grossRent.toFixed(2)}`,
                                  ].filter(Boolean).join(" · ")}
                                </p>
                              )}
                              {show("Days Listed") && space.daysListed != null && <p className={cn("opacity-60", cfg.metaCls)}>{space.daysListed}d listed</p>}
                              {show("Internal Space Note") && space.internalNote && <p className={cn("opacity-55 italic truncate", cfg.metaCls)}>{space.internalNote}</p>}
                            </>
                          )}
                        </div>

                        {/* Badges column */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {show("Deals") && space.deals != null && (
                            <span className={cn("font-medium px-1.5 py-0.5 rounded whitespace-nowrap", cfg.metaCls)}
                              style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)", color: c.text }}>
                              {space.deals} {space.deals === 1 ? "Deal" : "Deals"}
                            </span>
                          )}
                          {show("Executed Deal") && space.executedDeal && (
                            <span className={cn("font-medium px-1.5 py-0.5 rounded flex items-center gap-1 whitespace-nowrap", cfg.metaCls)}
                              style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)", color: c.text }}>
                              <FileCheckIcon className="size-3 shrink-0" /> Executed
                            </span>
                          )}
                          {show("Committed Lease") && space.committedLease && (
                            <span className={cn("font-medium px-1.5 py-0.5 rounded flex items-center gap-1 whitespace-nowrap", cfg.metaCls)}
                              style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)", color: c.text }}>
                              <HandshakeIcon className="size-3 shrink-0" /> {space.dealNote ?? "Committed"}
                            </span>
                          )}

                          {/* Options badge */}
                          {show("Options") && space.leaseOptions && space.leaseOptions.length > 0 && (
                            <Popover onOpenChange={(open) => setActiveHighlight(open ? buildHighlight(space, "options") : null)}>
                              <PopoverTrigger className={cn("cursor-pointer flex items-center gap-1 font-medium px-1.5 py-0.5 rounded whitespace-nowrap hover:brightness-110 transition-all", cfg.metaCls)}
                                style={{ background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.35)", color: c.text }}>
                                <ScrollTextIcon className="size-3 text-blue-400 shrink-0" />
                                <span className="hidden sm:inline">{space.leaseOptions.length} {space.leaseOptions.length === 1 ? "Option" : "Options"}</span>
                                <span className="sm:hidden">{space.leaseOptions.length}</span>
                              </PopoverTrigger>
                              <PopoverContent side="left" align="start" className="w-80 p-0 overflow-hidden">
                                <div className="px-3 py-2.5 flex items-center gap-2 bg-muted/50 border-b border-border">
                                  <ScrollTextIcon className="size-3.5 text-blue-500" />
                                  <span className="text-sm font-semibold text-foreground">Lease Options</span>
                                  <span className="ml-auto text-xs text-muted-foreground">{space.suite} · {space.tenant ?? "Vacant"}</span>
                                </div>
                                <div className="max-h-[480px] overflow-y-auto">
                                  {space.leaseOptions.map((opt, i) => {
                                    const details = OPTION_DETAILS[opt]
                                    return (
                                      <div key={opt} className={cn("px-3 py-3", i > 0 && "border-t border-border")}>
                                        <div className="flex items-start gap-2 mb-2">
                                          <span className="mt-0.5 size-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 text-white bg-blue-600">{i + 1}</span>
                                          <p className="text-sm font-semibold leading-tight text-foreground">{opt}</p>
                                        </div>
                                        {details && (
                                          <div className="ml-6 flex flex-col gap-2">
                                            <div className="flex items-center gap-3">
                                              <Button variant="link" size="sm" className="px-0 h-auto text-xs text-primary">View in Abstract</Button>
                                              <Button variant="link" size="sm" className="px-0 h-auto text-xs text-primary">View in Lease</Button>
                                            </div>
                                            <div className="rounded-md border border-border overflow-hidden">
                                              {details.fields.map(({ label, value }, fi) => (
                                                <div key={label} className={cn("flex items-baseline gap-2 px-2.5 py-1.5", fi % 2 === 0 ? "bg-muted/50" : "bg-background")}>
                                                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap w-28 shrink-0">{label}</span>
                                                  <span className="text-xs text-foreground font-medium">{value}</span>
                                                </div>
                                              ))}
                                            </div>
                                            <div className="rounded-md bg-muted/50 border border-border px-2.5 py-2">
                                              <p className="text-xs text-foreground leading-relaxed italic">&ldquo;{details.legalSnippet}&rdquo;</p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}

                          {/* Encumbrances badge */}
                          {show("Encumbrances") && space.encumbrances && space.encumbrances.length > 0 && (
                            <Popover onOpenChange={(open) => setActiveHighlight(open ? buildHighlight(space, "encumbrances") : null)}>
                              <PopoverTrigger className={cn("cursor-pointer flex items-center gap-1 font-medium px-1.5 py-0.5 rounded whitespace-nowrap hover:brightness-110 transition-all", cfg.metaCls)}
                                style={{ background: "rgba(234,88,12,0.15)", border: "1px solid rgba(234,88,12,0.35)", color: c.text }}>
                                <ConstructionIcon className="size-3 text-orange-400 shrink-0" />
                                <span className="hidden sm:inline">{space.encumbrances.length} {space.encumbrances.length === 1 ? "Encumbrance" : "Encumbrances"}</span>
                                <span className="sm:hidden">{space.encumbrances.length}</span>
                              </PopoverTrigger>
                              <PopoverContent side="left" align="start" className="w-80 p-0 overflow-hidden">
                                <div className="px-3 py-2.5 flex items-center gap-2 bg-muted/50 border-b border-border">
                                  <ConstructionIcon className="size-3.5 text-orange-500" />
                                  <span className="text-sm font-semibold text-foreground">Encumbrances</span>
                                  <span className="ml-auto text-xs text-muted-foreground">{space.suite} · {space.tenant ?? "Vacant"}</span>
                                </div>
                                <div className="max-h-[480px] overflow-y-auto">
                                  {space.encumbrances.map((enc, i) => {
                                    const details = OPTION_DETAILS[enc.optionType]
                                    return (
                                      <div key={i} className={cn("px-3 py-3", i > 0 && "border-t border-border")}>
                                        <div className="flex items-start gap-2 mb-2">
                                          <span className="mt-0.5 size-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 text-white bg-orange-500">{enc.priority}</span>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold leading-tight text-foreground">{enc.optionType}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{enc.tenant} · Suite {enc.suite}</p>
                                          </div>
                                        </div>
                                        <div className="ml-6 flex flex-col gap-2">
                                          <div className="flex items-center gap-3">
                                            <Button variant="link" size="sm" className="px-0 h-auto text-xs text-primary">View in Abstract</Button>
                                            <Button variant="link" size="sm" className="px-0 h-auto text-xs text-primary">View in Lease</Button>
                                          </div>
                                          <div className="rounded-md border border-border overflow-hidden">
                                            {enc.details.map(({ label, value }, fi) => (
                                              <div key={label} className={cn("flex items-baseline gap-2 px-2.5 py-1.5", fi % 2 === 0 ? "bg-muted/50" : "bg-background")}>
                                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap w-28 shrink-0">{label}</span>
                                                <span className="text-xs text-foreground font-medium">{value}</span>
                                              </div>
                                            ))}
                                          </div>
                                          {details && (
                                            <div className="rounded-md bg-muted/50 border border-border px-2.5 py-2">
                                              <p className="text-xs text-foreground leading-relaxed italic">&ldquo;{details.legalSnippet}&rdquo;</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
