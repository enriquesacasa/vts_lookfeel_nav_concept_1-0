import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { FilterBar, toggleFilterValue, clearFilterKey } from "@/components/filter-chip"
import {
  Sparkle, Search, Settings2, GripVertical, Eye, EyeOff,
  ChevronLeft, ChevronRight, AlertTriangle, Clock,
  CheckCircle2, ChevronDown, HeartPulse, Dot, X, Plus, MoreHorizontal,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { AgentBtn } from "@/components/agent-btn"
import { getLatestHumanUpdate, getEncumbranceCount, getDealHealth } from "@/components/deal-profile"
import { KpiBar } from "@/components/kpi-bar"
import {
  Table, TableHeader, TableBody, TableRow, TableCell,
  SortableHead, useSortState,
} from "@/components/sortable-table"

const CardCtx = React.createContext(cardBase)

// ── Tenant logos ─────────────────────────────────────────────────────────────

export { TENANT_LOGO, TENANT_DOMAIN } from "@/lib/tenant-data"
import { TENANT_LOGO, TENANT_DOMAIN } from "@/lib/tenant-data"

export function TenantAvatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const domain = TENANT_DOMAIN[name]
  const clearbitSrc = domain ? `https://logo.clearbit.com/${domain}?size=64` : null
  const brandfetchSrc = domain ? `https://cdn.brandfetch.io/${domain}/w/64/h/64` : null
  const localSrc = TENANT_LOGO[name] || null
  const sources = [clearbitSrc, brandfetchSrc, localSrc].filter(Boolean) as string[]
  const [srcIdx, setSrcIdx] = React.useState(0)
  const src = sources[srcIdx] ?? null
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
  const cls = size === "md"
    ? "h-9 w-9 rounded-full object-contain bg-background ring-1 ring-border/30 shrink-0"
    : "h-7 w-7 rounded-full object-contain bg-background ring-1 ring-border/30 shrink-0"
  const fallbackCls = size === "md"
    ? "h-9 w-9 rounded-full flex items-center justify-center text-xs font-medium text-primary-foreground shrink-0 ring-1 ring-border/30 bg-primary/80"
    : "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-medium text-primary-foreground shrink-0 ring-1 ring-border/30 bg-primary/80"
  if (src) {
    return (
      <img src={src} alt={name}
        onError={() => setSrcIdx(i => i < sources.length - 1 ? i + 1 : sources.length)}
        className={cls} />
    )
  }
  return <div className={fallbackCls}>{initials}</div>
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Stage = "Inquiry" | "Touring" | "Proposal" | "LOI" | "Legal" | "Lease Out" | "Executed"
type Status = "active" | "stalled" | "at-risk" | "executed"
type DealType = "New Deal" | "Renewal" | "Expansion"

export interface Deal {
  id: string
  tenant: string
  dealType: DealType
  asset: string
  floor: string
  space: string
  sf: number
  stage: Stage
  status: Status
  ner: number
  budgetNer: number
  npv?: number
  budgetNpv?: number
  lastUpdated: string
  contact?: string
  note?: string
  stalledDays?: number
  term?: number
}

// ── Mock data ─────────────────────────────────────────────────────────────────

export const DEALS: Deal[] = [
  { id:"d00", tenant:"Amazon.com",           dealType:"New Deal",  asset:"VTS Tower Headquarters", floor:"Fl. 8",      space:"Suite 0800", sf:18000,  stage:"Inquiry",   status:"active",   ner:0,     budgetNer:98.00,  lastUpdated:"2026-08-25", contact:"Sarah Okonkwo · CBRE" },
  { id:"d01", tenant:"Starbucks Corporation",dealType:"New Deal",  asset:"VTS Tower Headquarters", floor:"",           space:"Suite 800",  sf:28500,  stage:"Legal",     status:"active",   ner:52.00, budgetNer:50.00,  lastUpdated:"2026-07-14", term:84,  contact:"Sarah Chen" },
  { id:"d02", tenant:"Apex Capital",         dealType:"Renewal",   asset:"Empire State Building",  floor:"Fl. 12",     space:"",           sf:45000,  stage:"Proposal",  status:"active",   ner:48.00, budgetNer:52.00,  lastUpdated:"2026-07-10", term:60,  contact:"Mark Torres",  note:"Counter awaiting response" },
  { id:"d03", tenant:"Meridian Health",      dealType:"New Deal",  asset:"VTS Tower Headquarters", floor:"",           space:"Suite 1800", sf:33000,  stage:"Lease Out", status:"stalled",  ner:55.00, budgetNer:55.00,  lastUpdated:"2026-06-26", term:120, contact:"Priya Nair",   stalledDays:18 },
  { id:"d04", tenant:"Atlas Group",          dealType:"Expansion", asset:"Salesforce Tower",       floor:"Fls. 2–3",   space:"",           sf:61000,  stage:"Proposal",  status:"at-risk",  ner:44.00, budgetNer:50.00,  lastUpdated:"2026-07-01", term:72,  contact:"James Wu",     note:"Considering competitor" },
  { id:"d05", tenant:"Vertex Studios",       dealType:"New Deal",  asset:"One Financial Plaza",    floor:"",           space:"Suite 600",  sf:19800,  stage:"LOI",       status:"active",   ner:58.00, budgetNer:56.00,  lastUpdated:"2026-07-15", term:48,  contact:"Laura Kim" },
  { id:"d06", tenant:"Bluewave LLC",         dealType:"New Deal",  asset:"Willis Tower",           floor:"",           space:"Suite 300",  sf:12400,  stage:"Lease Out", status:"active",   ner:51.00, budgetNer:51.00,   lastUpdated:"2026-07-12", term:36,  contact:"Tom Reyes" },
  { id:"d07", tenant:"Pfizer Inc.",          dealType:"Renewal",   asset:"30 Hudson Yards",        floor:"Fls. 18–20", space:"",           sf:88000,  stage:"LOI",       status:"active",   ner:62.00, budgetNer:60.00,  lastUpdated:"2026-07-09", term:120, contact:"Anna Brooks" },
  { id:"d08", tenant:"Morgan Stanley",       dealType:"New Deal",  asset:"One World Trade Center", floor:"",           space:"Suite 2200", sf:54000,  stage:"Touring",   status:"active",   ner:0,     budgetNer:68.00,  lastUpdated:"2026-07-13", term:84,  contact:"Derek Chan" },
  { id:"d09", tenant:"Deloitte LLP",         dealType:"Expansion", asset:"VTS Tower Headquarters", floor:"",           space:"Suite 500",  sf:43000,  stage:"Legal",     status:"active",   ner:72.00, budgetNer:70.00,  lastUpdated:"2026-07-15", term:60,  contact:"Sandra Li" },
  { id:"d10", tenant:"KPMG",                 dealType:"Renewal",   asset:"Empire State Building",  floor:"Fl. 34",     space:"Suite 3400", sf:117000, stage:"Proposal",  status:"stalled",  ner:49.00, budgetNer:55.00,  lastUpdated:"2026-06-20", term:96,  contact:"Paul Simmons", stalledDays:26, note:"Waiting on board approval" },
  { id:"d11", tenant:"Ernst & Young",        dealType:"New Deal",  asset:"Salesforce Tower",       floor:"Fl. 22",     space:"Suite 2200", sf:80100,  stage:"Proposal",  status:"active",   ner:58.00, budgetNer:57.00,  lastUpdated:"2026-07-08", term:72,  contact:"Claire Marsh" },
  { id:"d12", tenant:"HSBC Holdings",        dealType:"Renewal",   asset:"One Financial Plaza",    floor:"",           space:"Suite 900",  sf:69300,  stage:"Inquiry",   status:"active",   ner:0,     budgetNer:42.00,  lastUpdated:"2026-07-14", contact:"Frank Lee" },
  { id:"d13", tenant:"Latham & Watkins",     dealType:"New Deal",  asset:"30 Hudson Yards",        floor:"Fls. 14–15", space:"",           sf:119000, stage:"LOI",       status:"at-risk",  ner:65.00, budgetNer:66.00,  lastUpdated:"2026-07-03", term:60,  contact:"Grace Yu",     note:"Competitor offering lower TI" },
  { id:"d14", tenant:"JPMorgan Chase",       dealType:"Expansion", asset:"VTS Tower Headquarters", floor:"Fl. 6",      space:"",           sf:55800,  stage:"Legal",     status:"active",   ner:75.00, budgetNer:72.00,  lastUpdated:"2026-07-16", term:120, contact:"Ryan Patel" },
  { id:"d15", tenant:"Amazon.com",           dealType:"New Deal",  asset:"Willis Tower",           floor:"Fls. 4–6",   space:"",           sf:150000, stage:"Touring",   status:"active",   ner:0,     budgetNer:45.00,  lastUpdated:"2026-07-11", contact:"Mia Zhao" },
  { id:"d16", tenant:"WeWork",               dealType:"Renewal",   asset:"Transamerica Pyramid",   floor:"Fls. 10–12", space:"",           sf:36000,  stage:"Lease Out", status:"stalled",  ner:38.00, budgetNer:40.00,  lastUpdated:"2026-06-18", term:24,  contact:"Ethan Ross",   stalledDays:28, note:"Budget constraints" },
  { id:"d17", tenant:"Google LLC",           dealType:"New Deal",  asset:"200 Berkeley Street",    floor:"Fls. 5–8",   space:"",           sf:200000, stage:"LOI",       status:"active",   ner:82.00, budgetNer:80.00, lastUpdated:"2026-07-14", term:144, contact:"Nina Patel" },
  { id:"d18", tenant:"Tesla Inc.",           dealType:"New Deal",  asset:"One Peachtree Center",   floor:"",           space:"Suite 1100", sf:25000,  stage:"Proposal",  status:"active",   ner:35.00, budgetNer:33.00,   lastUpdated:"2026-07-07", term:60,  contact:"Omar Khalid" },
  { id:"d19", tenant:"Cisco Systems",        dealType:"Renewal",   asset:"Two Union Square",       floor:"Fls. 20–22", space:"",           sf:72000,  stage:"LOI",       status:"active",   ner:58.00, budgetNer:55.00,  lastUpdated:"2026-07-10", term:84,  contact:"Jenny Park" },
  { id:"d20", tenant:"Salesforce Inc.",      dealType:"Expansion", asset:"Salesforce Tower",       floor:"Fl. 30",     space:"",           sf:40000,  stage:"Legal",     status:"active",   ner:90.00, budgetNer:88.00,  lastUpdated:"2026-07-15", term:60,  contact:"Luis Garcia" },
  { id:"d21", tenant:"BlackRock",            dealType:"New Deal",  asset:"One World Trade Center", floor:"Fls. 50–52", space:"",           sf:95000,  stage:"Proposal",  status:"at-risk",  ner:78.00, budgetNer:80.00,  lastUpdated:"2026-06-30", term:120, contact:"Kate Morrison", note:"Slow on responses" },
  { id:"d22", tenant:"Goldman Sachs",        dealType:"Renewal",   asset:"30 Hudson Yards",        floor:"Fls. 5–9",   space:"",           sf:185000, stage:"Executed",  status:"executed", ner:88.00, budgetNer:85.00, lastUpdated:"2026-07-01", term:120, contact:"Adam Chen" },
  { id:"d23", tenant:"McKinsey & Co.",       dealType:"New Deal",  asset:"Empire State Building",  floor:"",           space:"Suite 4200", sf:32000,  stage:"LOI",       status:"active",   ner:71.00, budgetNer:70.00,  lastUpdated:"2026-07-13", term:72,  contact:"Tara Singh" },
  { id:"d24", tenant:"Spotify",              dealType:"New Deal",  asset:"200 Berkeley Street",    floor:"",           space:"Suite 700",  sf:18500,  stage:"Touring",   status:"active",   ner:0,     budgetNer:76.00,  lastUpdated:"2026-07-15", contact:"Ben Walsh" },
  { id:"d25", tenant:"Airbnb",               dealType:"New Deal",  asset:"Salesforce Tower",       floor:"Fl. 25",     space:"",           sf:22000,  stage:"Inquiry",   status:"active",   ner:0,     budgetNer:82.00,  lastUpdated:"2026-07-16", contact:"Lily Chen" },
  { id:"d26", tenant:"Stripe",               dealType:"Expansion", asset:"Two Union Square",       floor:"Fl. 15",     space:"",           sf:15000,  stage:"Proposal",  status:"active",   ner:62.00, budgetNer:60.00,   lastUpdated:"2026-07-12", term:48,  contact:"Raj Mehta" },
  { id:"d27", tenant:"Twitter/X",            dealType:"Renewal",   asset:"Salesforce Tower",       floor:"Fls. 10–12", space:"",           sf:65000,  stage:"LOI",       status:"stalled",  ner:45.00, budgetNer:52.00,  lastUpdated:"2026-06-15", term:36,  contact:"Dana Fox",     stalledDays:31, note:"Seeking major concessions" },
  { id:"d28", tenant:"Uber Technologies",    dealType:"New Deal",  asset:"One Peachtree Center",   floor:"",           space:"Suite 800",  sf:30000,  stage:"Proposal",  status:"active",   ner:38.00, budgetNer:36.00,  lastUpdated:"2026-07-09", term:60,  contact:"Kai Brown" },
  { id:"d29", tenant:"Microsoft",            dealType:"New Deal",  asset:"One World Trade Center", floor:"Fls. 60–65", space:"",           sf:250000, stage:"Legal",     status:"active",   ner:92.00, budgetNer:90.00, lastUpdated:"2026-07-14", term:180, contact:"Helen Chow" },
  { id:"d30", tenant:"Meta Platforms",       dealType:"Expansion", asset:"30 Hudson Yards",        floor:"Fls. 25–28", space:"",           sf:130000, stage:"Executed",  status:"executed", ner:75.00, budgetNer:73.00,  lastUpdated:"2026-06-28", term:96,  contact:"Sean Park" },
  // Additional deals to round out thin assets
  { id:"d31", tenant:"Dropbox Inc.",         dealType:"New Deal",  asset:"Transamerica Pyramid",   floor:"Fls. 5–6",   space:"",           sf:22000,  stage:"Proposal",  status:"active",   ner:36.00, budgetNer:35.00,   lastUpdated:"2026-07-11", term:60,  contact:"James Okafor" },
  { id:"d32", tenant:"Notion Labs",          dealType:"New Deal",  asset:"Transamerica Pyramid",   floor:"",           space:"Suite 1200", sf:8500,   stage:"Touring",   status:"active",   ner:0,     budgetNer:34.00,   lastUpdated:"2026-07-16", contact:"Amy Lin" },
  { id:"d33", tenant:"Morningstar Inc.",     dealType:"Renewal",   asset:"Willis Tower",           floor:"Fl. 42",     space:"Suite 4200", sf:31000,  stage:"LOI",       status:"active",   ner:47.00, budgetNer:46.00,  lastUpdated:"2026-07-10", term:84,  contact:"David Kim" },
  { id:"d34", tenant:"Fidelity Investments", dealType:"New Deal",  asset:"One Financial Plaza",    floor:"Fls. 14–15", space:"",           sf:58000,  stage:"Proposal",  status:"active",   ner:44.00, budgetNer:43.00,  lastUpdated:"2026-07-09", term:96,  contact:"Rachel Wong" },
  { id:"d35", tenant:"Tableau Software",     dealType:"Expansion", asset:"Two Union Square",       floor:"Fls. 12–13", space:"",           sf:28000,  stage:"LOI",       status:"active",   ner:55.00, budgetNer:54.00,  lastUpdated:"2026-07-14", term:60,  contact:"Chris Lee" },
  { id:"d36", tenant:"NCR Corporation",      dealType:"Renewal",   asset:"One Peachtree Center",   floor:"Fls. 8–9",   space:"",           sf:47000,  stage:"Legal",     status:"active",   ner:32.00, budgetNer:31.00,  lastUpdated:"2026-07-15", term:120, contact:"Maya Patel" },
  { id:"d37", tenant:"Wayfair Inc.",         dealType:"New Deal",  asset:"200 Berkeley Street",    floor:"",           space:"Suite 1500", sf:24000,  stage:"Proposal",  status:"active",   ner:70.00, budgetNer:68.00,  lastUpdated:"2026-07-08", term:72,  contact:"Sam Rivera" },

  // VTS Tower Headquarters — fill to 10 (need 5 more: d38–d42, 2 priority)
  { id:"d38", tenant:"Accenture",            dealType:"Renewal",   asset:"VTS Tower Headquarters", floor:"Fl. 11",     space:"Suite 1100", sf:37000,  stage:"LOI",       status:"active",   ner:68.00, budgetNer:67.00,  lastUpdated:"2026-07-13", term:72,  contact:"Diane Park" },
  { id:"d39", tenant:"Hogan Lovells",        dealType:"New Deal",  asset:"VTS Tower Headquarters", floor:"",           space:"Suite 2400", sf:29000,  stage:"Proposal",  status:"stalled",  ner:71.00, budgetNer:72.00,  lastUpdated:"2026-07-01", term:60,  contact:"Ross Egan",    stalledDays:14 },
  { id:"d40", tenant:"Boston Consulting Grp",dealType:"New Deal",  asset:"VTS Tower Headquarters", floor:"",           space:"Suite 1900", sf:21500,  stage:"Touring",   status:"at-risk",  ner:0,     budgetNer:78.00,  lastUpdated:"2026-06-28", contact:"Fiona Walsh",  note:"Competitor shortlisted" },
  { id:"d41", tenant:"Workday Inc.",         dealType:"New Deal",  asset:"VTS Tower Headquarters", floor:"",           space:"Suite 700",  sf:16800,  stage:"Inquiry",   status:"active",   ner:0,     budgetNer:74.00,  lastUpdated:"2026-07-16", contact:"Kevin Ho" },
  { id:"d42", tenant:"Palantir Technologies",dealType:"Expansion", asset:"VTS Tower Headquarters", floor:"Fl. 4",      space:"",           sf:12200,  stage:"Lease Out", status:"active",   ner:76.00, budgetNer:75.00,   lastUpdated:"2026-07-14", term:48,  contact:"Zara Patel" },

  // Empire State Building — fill to 10 (need 7 more: d43–d49, 2 priority)
  { id:"d43", tenant:"Verizon",              dealType:"Renewal",   asset:"Empire State Building",  floor:"Fl. 27",     space:"Suite 2700", sf:68000,  stage:"Proposal",  status:"stalled",  ner:53.00, budgetNer:58.00,  lastUpdated:"2026-06-23", term:84,  contact:"Glen Marsh",   stalledDays:22, note:"Awaiting board sign-off" },
  { id:"d44", tenant:"PVH Corp",             dealType:"New Deal",  asset:"Empire State Building",  floor:"Fl. 18",     space:"Suite 1800", sf:44000,  stage:"Touring",   status:"active",   ner:0,     budgetNer:56.00,  lastUpdated:"2026-07-06", contact:"Naomi Torres" },
  { id:"d45", tenant:"Citi",                 dealType:"New Deal",  asset:"Empire State Building",  floor:"Fls. 20–21", space:"",           sf:82000,  stage:"LOI",       status:"active",   ner:60.00, budgetNer:58.00,  lastUpdated:"2026-07-13", term:96,  contact:"Hugo Kim" },
  { id:"d46", tenant:"Marsh & McLennan",     dealType:"Renewal",   asset:"Empire State Building",  floor:"Fl. 31",     space:"Suite 3100", sf:51000,  stage:"Legal",     status:"active",   ner:62.00, budgetNer:61.00,  lastUpdated:"2026-07-15", term:60,  contact:"Irene Wu" },
  { id:"d47", tenant:"PwC",                  dealType:"Expansion", asset:"Empire State Building",  floor:"Fl. 14",     space:"",           sf:38500,  stage:"Lease Out", status:"active",   ner:65.00, budgetNer:63.00,  lastUpdated:"2026-07-14", term:72,  contact:"Sam Obi" },
  { id:"d48", tenant:"L'Oreal USA",          dealType:"New Deal",  asset:"Empire State Building",  floor:"",           space:"Suite 1500", sf:27000,  stage:"Inquiry",   status:"active",   ner:0,     budgetNer:54.00,  lastUpdated:"2026-07-16", contact:"Clara Bain" },
  { id:"d49", tenant:"Conde Nast",           dealType:"New Deal",  asset:"Empire State Building",  floor:"",           space:"Suite 3800", sf:33000,  stage:"Proposal",  status:"active",   ner:58.00, budgetNer:57.00,  lastUpdated:"2026-07-10", term:60,  contact:"Emma Stone" },

  // Salesforce Tower — fill to 10 (need 5 more: d50–d54, 1 priority)
  { id:"d50", tenant:"Lyft",                 dealType:"New Deal",  asset:"Salesforce Tower",       floor:"",           space:"Suite 1400", sf:18500,  stage:"Touring",   status:"stalled",  ner:0,     budgetNer:80.00,  lastUpdated:"2026-07-03", contact:"Toni Walsh",   stalledDays:12 },
  { id:"d51", tenant:"Adobe Systems",        dealType:"Expansion", asset:"Salesforce Tower",       floor:"Fls. 35–36", space:"",           sf:62000,  stage:"Legal",     status:"active",   ner:94.00, budgetNer:92.00,  lastUpdated:"2026-07-15", term:120, contact:"Jen Lai" },
  { id:"d52", tenant:"Snap Inc.",            dealType:"New Deal",  asset:"Salesforce Tower",       floor:"",           space:"Suite 2100", sf:22000,  stage:"Proposal",  status:"active",   ner:85.00, budgetNer:83.00,  lastUpdated:"2026-07-11", term:48,  contact:"Noah Carr" },
  { id:"d53", tenant:"OpenAI",               dealType:"New Deal",  asset:"Salesforce Tower",       floor:"Fls. 28–29", space:"",           sf:48000,  stage:"LOI",       status:"active",   ner:100.00,budgetNer:98.00,  lastUpdated:"2026-07-14", term:60,  contact:"Aria Chen" },
  { id:"d54", tenant:"Cloudflare",           dealType:"New Deal",  asset:"Salesforce Tower",       floor:"",           space:"Suite 1700", sf:14500,  stage:"Inquiry",   status:"active",   ner:0,     budgetNer:88.00,  lastUpdated:"2026-07-16", contact:"Pete Lam" },

  // One Financial Plaza — fill to 10 (need 7 more: d55–d61, 3 priority)
  { id:"d55", tenant:"State Street Corp",    dealType:"Renewal",   asset:"One Financial Plaza",    floor:"Fls. 8–10",  space:"",           sf:91000,  stage:"Proposal",  status:"at-risk",  ner:40.00, budgetNer:45.00,  lastUpdated:"2026-06-29", term:84,  contact:"Bill Nguyen",  note:"Budget cuts may reduce footprint" },
  { id:"d56", tenant:"Liberty Mutual",       dealType:"New Deal",  asset:"One Financial Plaza",    floor:"Fls. 18–19", space:"",           sf:73000,  stage:"LOI",       status:"stalled",  ner:43.00, budgetNer:44.00,  lastUpdated:"2026-07-01", term:96,  contact:"Ana Reyes",    stalledDays:16 },
  { id:"d57", tenant:"John Hancock",         dealType:"New Deal",  asset:"One Financial Plaza",    floor:"",           space:"Suite 1100", sf:38000,  stage:"Touring",   status:"stalled",  ner:0,     budgetNer:41.00,  lastUpdated:"2026-06-25", contact:"Mike Dunn",    stalledDays:21 },
  { id:"d58", tenant:"Putnam Investments",   dealType:"Expansion", asset:"One Financial Plaza",    floor:"Fl. 7",      space:"",           sf:22000,  stage:"Proposal",  status:"active",   ner:46.00, budgetNer:45.00,   lastUpdated:"2026-07-12", term:60,  contact:"Dana Kim" },
  { id:"d59", tenant:"Wellington Mgmt",      dealType:"New Deal",  asset:"One Financial Plaza",    floor:"",           space:"Suite 2200", sf:57000,  stage:"Inquiry",   status:"active",   ner:0,     budgetNer:47.00,  lastUpdated:"2026-07-16", contact:"Meg Liu" },
  { id:"d60", tenant:"MFS Investment Mgmt",  dealType:"Renewal",   asset:"One Financial Plaza",    floor:"Fl. 13",     space:"Suite 1300", sf:34000,  stage:"Lease Out", status:"active",   ner:48.00, budgetNer:47.00,  lastUpdated:"2026-07-13", term:72,  contact:"Rob Chan" },
  { id:"d61", tenant:"Nuveen",               dealType:"New Deal",  asset:"One Financial Plaza",    floor:"",           space:"Suite 900",  sf:19500,  stage:"Legal",     status:"active",   ner:50.00, budgetNer:49.00,   lastUpdated:"2026-07-14", term:48,  contact:"Cass Hill" },

  // Willis Tower — fill to 10 (need 7 more: d62–d68, 4 priority)
  { id:"d62", tenant:"United Airlines",      dealType:"Renewal",   asset:"Willis Tower",           floor:"Fls. 11–14", space:"",           sf:124000, stage:"Proposal",  status:"stalled",  ner:42.00, budgetNer:48.00,  lastUpdated:"2026-06-21", term:96,  contact:"Paul Reed",    stalledDays:24, note:"Cost-reduction program pausing decision" },
  { id:"d63", tenant:"Exelon",               dealType:"New Deal",  asset:"Willis Tower",           floor:"Fls. 5–6",   space:"",           sf:56000,  stage:"LOI",       status:"at-risk",  ner:46.00, budgetNer:49.00,  lastUpdated:"2026-07-02", term:72,  contact:"Lea Phan",     note:"Actively viewing competitor building" },
  { id:"d64", tenant:"Hyatt Hotels",         dealType:"Expansion", asset:"Willis Tower",           floor:"",           space:"Suite 2200", sf:17000,  stage:"Touring",   status:"stalled",  ner:0,     budgetNer:46.00,   lastUpdated:"2026-07-03", contact:"Bea Kim",      stalledDays:13 },
  { id:"d65", tenant:"Aon plc",              dealType:"Renewal",   asset:"Willis Tower",           floor:"Fls. 42–44", space:"",           sf:98000,  stage:"Proposal",  status:"stalled",  ner:50.00, budgetNer:52.00,  lastUpdated:"2026-06-29", term:60,  contact:"Mara Voss",    stalledDays:17 },
  { id:"d66", tenant:"Kraft Heinz",          dealType:"New Deal",  asset:"Willis Tower",           floor:"",           space:"Suite 1800", sf:29000,  stage:"Inquiry",   status:"active",   ner:0,     budgetNer:44.00,  lastUpdated:"2026-07-16", contact:"Ivan Park" },
  { id:"d67", tenant:"Abbott Laboratories",  dealType:"New Deal",  asset:"Willis Tower",           floor:"Fls. 7–8",   space:"",           sf:62000,  stage:"Legal",     status:"active",   ner:53.00, budgetNer:52.00,  lastUpdated:"2026-07-15", term:120, contact:"Lena Braun" },
  { id:"d68", tenant:"Grainger",             dealType:"Renewal",   asset:"Willis Tower",           floor:"Fl. 9",      space:"Suite 900",  sf:41000,  stage:"Lease Out", status:"active",   ner:48.00, budgetNer:47.00,  lastUpdated:"2026-07-13", term:60,  contact:"Sal Torres" },

  // 30 Hudson Yards — fill to 10 (need 6 more: d69–d74, 3 priority)
  { id:"d69", tenant:"Apollo Global Mgmt",   dealType:"New Deal",  asset:"30 Hudson Yards",        floor:"Fls. 40–41", space:"",           sf:58000,  stage:"Proposal",  status:"at-risk",  ner:90.00, budgetNer:95.00,  lastUpdated:"2026-07-01", term:84,  contact:"Leo Hart",     note:"Evaluating Hudson Yards competitor" },
  { id:"d70", tenant:"KKR & Co.",            dealType:"Expansion", asset:"30 Hudson Yards",        floor:"Fls. 12–13", space:"",           sf:44000,  stage:"LOI",       status:"stalled",  ner:88.00, budgetNer:90.00,  lastUpdated:"2026-06-27", term:72,  contact:"Jin Yu",       stalledDays:19 },
  { id:"d71", tenant:"Blackstone",           dealType:"New Deal",  asset:"30 Hudson Yards",        floor:"",           space:"Suite 2800", sf:32000,  stage:"Touring",   status:"stalled",  ner:0,     budgetNer:92.00,  lastUpdated:"2026-07-02", contact:"Vera Kim",     stalledDays:15 },
  { id:"d72", tenant:"Citi Private Bank",    dealType:"New Deal",  asset:"30 Hudson Yards",        floor:"Fls. 22–23", space:"",           sf:77000,  stage:"Legal",     status:"active",   ner:86.00, budgetNer:84.00,  lastUpdated:"2026-07-15", term:120, contact:"Elsa Park" },
  { id:"d73", tenant:"Deutsche Bank",        dealType:"New Deal",  asset:"30 Hudson Yards",        floor:"",           space:"Suite 3300", sf:24000,  stage:"Inquiry",   status:"active",   ner:0,     budgetNer:88.00,  lastUpdated:"2026-07-16", contact:"Carl Braun" },
  { id:"d74", tenant:"Wells Fargo",          dealType:"New Deal",  asset:"30 Hudson Yards",        floor:"Fls. 36–37", space:"",           sf:91000,  stage:"Lease Out", status:"active",   ner:82.00, budgetNer:80.00,  lastUpdated:"2026-07-14", term:96,  contact:"Tara Moon" },

  // One World Trade Center — fill to 10 (need 7 more: d75–d81, 2 priority)
  { id:"d75", tenant:"Conde Nast (WTC)",     dealType:"Renewal",   asset:"One World Trade Center", floor:"Fls. 20–24", space:"",           sf:186000, stage:"Proposal",  status:"at-risk",  ner:70.00, budgetNer:75.00, lastUpdated:"2026-06-30", term:120, contact:"Holly Dean",   note:"Content budget cuts threatening renewal" },
  { id:"d76", tenant:"Spotify (WTC)",        dealType:"New Deal",  asset:"One World Trade Center", floor:"",           space:"Suite 4100", sf:28000,  stage:"Touring",   status:"stalled",  ner:0,     budgetNer:72.00,  lastUpdated:"2026-07-04", contact:"Yuki Sato",    stalledDays:11 },
  { id:"d77", tenant:"Amazon Web Services",  dealType:"New Deal",  asset:"One World Trade Center", floor:"Fls. 30–32", space:"",           sf:112000, stage:"LOI",       status:"active",   ner:88.00, budgetNer:86.00,  lastUpdated:"2026-07-14", term:144, contact:"Priya Gill" },
  { id:"d78", tenant:"American Express",     dealType:"Expansion", asset:"One World Trade Center", floor:"Fl. 41",     space:"",           sf:43000,  stage:"Proposal",  status:"active",   ner:74.00, budgetNer:73.00,  lastUpdated:"2026-07-11", term:72,  contact:"Jon Fields" },
  { id:"d79", tenant:"LinkedIn",             dealType:"New Deal",  asset:"One World Trade Center", floor:"Fls. 44–45", space:"",           sf:68000,  stage:"Legal",     status:"active",   ner:80.00, budgetNer:78.00,  lastUpdated:"2026-07-15", term:84,  contact:"May Chen" },
  { id:"d80", tenant:"ByteDance",            dealType:"New Deal",  asset:"One World Trade Center", floor:"",           space:"Suite 5500", sf:35000,  stage:"Inquiry",   status:"active",   ner:0,     budgetNer:76.00,  lastUpdated:"2026-07-16", contact:"Andy Xu" },
  { id:"d81", tenant:"Cloudflare (WTC)",     dealType:"Expansion", asset:"One World Trade Center", floor:"Fl. 38",     space:"",           sf:17000,  stage:"Lease Out", status:"active",   ner:78.00, budgetNer:76.00,  lastUpdated:"2026-07-13", term:36,  contact:"Sky Liu" },

  // Transamerica Pyramid — fill to 10 (need 7 more: d82–d88, 3 priority)
  { id:"d82", tenant:"DocuSign",             dealType:"Renewal",   asset:"Transamerica Pyramid",   floor:"Fls. 14–15", space:"",           sf:41000,  stage:"Proposal",  status:"at-risk",  ner:34.00, budgetNer:38.00,  lastUpdated:"2026-07-02", term:60,  contact:"Nate Cody",    note:"Remote-work policy limiting footprint" },
  { id:"d83", tenant:"Levi Strauss",         dealType:"New Deal",  asset:"Transamerica Pyramid",   floor:"Fls. 8–9",   space:"",           sf:28000,  stage:"LOI",       status:"stalled",  ner:36.00, budgetNer:37.00,  lastUpdated:"2026-07-02", term:72,  contact:"Rosa Vega",    stalledDays:14 },
  { id:"d84", tenant:"Twitter/X (Pyramid)",  dealType:"Renewal",   asset:"Transamerica Pyramid",   floor:"",           space:"Suite 600",  sf:15000,  stage:"Touring",   status:"at-risk",  ner:0,     budgetNer:35.00,   lastUpdated:"2026-06-27", contact:"Jay Obi",      note:"Cost-cutting may force relocation" },
  { id:"d85", tenant:"Gap Inc.",             dealType:"Renewal",   asset:"Transamerica Pyramid",   floor:"Fl. 18",     space:"Suite 1800", sf:22000,  stage:"Legal",     status:"active",   ner:38.00, budgetNer:37.00,   lastUpdated:"2026-07-14", term:48,  contact:"Flo Marsh" },
  { id:"d86", tenant:"Charles Schwab",       dealType:"New Deal",  asset:"Transamerica Pyramid",   floor:"",           space:"Suite 2000", sf:33000,  stage:"Inquiry",   status:"active",   ner:0,     budgetNer:39.00,  lastUpdated:"2026-07-16", contact:"Owen Lee" },
  { id:"d87", tenant:"First Republic",       dealType:"Expansion", asset:"Transamerica Pyramid",   floor:"Fl. 7",      space:"",           sf:19000,  stage:"Proposal",  status:"active",   ner:40.00, budgetNer:39.00,   lastUpdated:"2026-07-11", term:60,  contact:"Kay Dunn" },
  { id:"d88", tenant:"Ripple Labs",          dealType:"New Deal",  asset:"Transamerica Pyramid",   floor:"",           space:"Suite 1000", sf:11500,  stage:"Lease Out", status:"active",   ner:42.00, budgetNer:41.00,   lastUpdated:"2026-07-13", term:36,  contact:"Cam Yee" },

  // 200 Berkeley Street — fill to 10 (need 7 more: d89–d95, 4 priority)
  { id:"d89", tenant:"Vertex Pharmaceuticals",dealType:"New Deal", asset:"200 Berkeley Street",    floor:"Fls. 10–11", space:"",           sf:55000,  stage:"Proposal",  status:"at-risk",  ner:68.00, budgetNer:74.00,  lastUpdated:"2026-07-01", term:84,  contact:"Dana Lu",      note:"Budget reduced; reconsidering square footage" },
  { id:"d90", tenant:"Rapid7",               dealType:"Renewal",   asset:"200 Berkeley Street",    floor:"Fl. 6",      space:"Suite 600",  sf:23000,  stage:"LOI",       status:"stalled",  ner:74.00, budgetNer:76.00,  lastUpdated:"2026-06-30", term:48,  contact:"Leo Quinn",    stalledDays:16 },
  { id:"d91", tenant:"Brightcove",           dealType:"Renewal",   asset:"200 Berkeley Street",    floor:"",           space:"Suite 400",  sf:14000,  stage:"Touring",   status:"stalled",  ner:0,     budgetNer:72.00,  lastUpdated:"2026-06-24", contact:"Nia Walsh",    stalledDays:22 },
  { id:"d92", tenant:"DraftKings",           dealType:"New Deal",  asset:"200 Berkeley Street",    floor:"",           space:"Suite 900",  sf:18500,  stage:"Proposal",  status:"stalled",  ner:78.00, budgetNer:79.00,  lastUpdated:"2026-07-03", term:60,  contact:"Reed Fox",     stalledDays:13 },
  { id:"d93", tenant:"Liberty Mutual (Berk)",dealType:"Renewal",   asset:"200 Berkeley Street",    floor:"Fls. 3–4",   space:"",           sf:48000,  stage:"Legal",     status:"active",   ner:73.00, budgetNer:72.00,  lastUpdated:"2026-07-15", term:60,  contact:"Phil Ross" },
  { id:"d94", tenant:"Biogen",               dealType:"Expansion", asset:"200 Berkeley Street",    floor:"Fls. 12–13", space:"",           sf:66000,  stage:"Lease Out", status:"active",   ner:82.00, budgetNer:80.00,  lastUpdated:"2026-07-14", term:120, contact:"Erin Ho" },
  { id:"d95", tenant:"Acadian Asset Mgmt",   dealType:"New Deal",  asset:"200 Berkeley Street",    floor:"",           space:"Suite 200",  sf:9500,   stage:"Inquiry",   status:"active",   ner:0,     budgetNer:76.00,   lastUpdated:"2026-07-16", contact:"Amy Cole" },

  // One Peachtree Center — fill to 10 (need 7 more: d96–d102, 4 priority)
  { id:"d96", tenant:"Cox Enterprises",      dealType:"Renewal",   asset:"One Peachtree Center",   floor:"Fls. 20–22", space:"",           sf:78000,  stage:"Proposal",  status:"at-risk",  ner:30.00, budgetNer:34.00,  lastUpdated:"2026-07-02", term:60,  contact:"Tom Ellis",    note:"Consolidating to reduce footprint by 30%" },
  { id:"d97", tenant:"Equifax",              dealType:"New Deal",  asset:"One Peachtree Center",   floor:"Fls. 14–15", space:"",           sf:52000,  stage:"LOI",       status:"stalled",  ner:33.00, budgetNer:34.00,  lastUpdated:"2026-06-27", term:72,  contact:"Bea Torres",   stalledDays:20 },
  { id:"d98", tenant:"Delta Air Lines",      dealType:"Expansion", asset:"One Peachtree Center",   floor:"",           space:"Suite 1600", sf:24000,  stage:"Touring",   status:"stalled",  ner:0,     budgetNer:32.00,   lastUpdated:"2026-07-02", contact:"Ron Shaw",     stalledDays:14 },
  { id:"d99", tenant:"Invesco",              dealType:"New Deal",  asset:"One Peachtree Center",   floor:"Fl. 10",     space:"Suite 1000", sf:31000,  stage:"Proposal",  status:"stalled",  ner:35.00, budgetNer:35.00,  lastUpdated:"2026-07-04", term:60,  contact:"Lia Park",     stalledDays:11 },
  { id:"d100",tenant:"Norfolk Southern",     dealType:"Renewal",   asset:"One Peachtree Center",   floor:"Fls. 24–26", space:"",           sf:91000,  stage:"Legal",     status:"active",   ner:34.00, budgetNer:33.00,  lastUpdated:"2026-07-15", term:120, contact:"Walt Gray" },
  { id:"d101",tenant:"Truist Financial",     dealType:"Expansion", asset:"One Peachtree Center",   floor:"Fls. 4–5",   space:"",           sf:44000,  stage:"Lease Out", status:"active",   ner:36.00, budgetNer:35.00,  lastUpdated:"2026-07-14", term:84,  contact:"Faye Kim" },
  { id:"d102",tenant:"GE Digital",           dealType:"New Deal",  asset:"One Peachtree Center",   floor:"",           space:"Suite 1200", sf:17000,  stage:"Inquiry",   status:"active",   ner:0,     budgetNer:33.00,   lastUpdated:"2026-07-16", contact:"Sean Marsh" },

  // Two Union Square — fill to 10 (need 7 more: d103–d109, 3 priority)
  { id:"d103",tenant:"Alaska Airlines",      dealType:"Renewal",   asset:"Two Union Square",       floor:"Fls. 16–17", space:"",           sf:54000,  stage:"Proposal",  status:"at-risk",  ner:50.00, budgetNer:56.00,  lastUpdated:"2026-07-01", term:60,  contact:"Deb Wren",     note:"Downsizing post-merger; cutting 20% of footprint" },
  { id:"d104",tenant:"F5 Networks",          dealType:"New Deal",  asset:"Two Union Square",       floor:"Fls. 8–9",   space:"",           sf:38000,  stage:"LOI",       status:"stalled",  ner:58.00, budgetNer:59.00,  lastUpdated:"2026-06-30", term:72,  contact:"Ty Olsen",     stalledDays:15 },
  { id:"d105",tenant:"Weyerhaeuser",         dealType:"New Deal",  asset:"Two Union Square",       floor:"",           space:"Suite 1400", sf:29000,  stage:"Touring",   status:"stalled",  ner:0,     budgetNer:55.00,  lastUpdated:"2026-06-24", contact:"Les Craig",    stalledDays:23 },
  { id:"d106",tenant:"Expeditors Intl",      dealType:"Expansion", asset:"Two Union Square",       floor:"Fl. 11",     space:"",           sf:21000,  stage:"Legal",     status:"active",   ner:60.00, budgetNer:59.00,  lastUpdated:"2026-07-15", term:48,  contact:"Cleo Park" },
  { id:"d107",tenant:"T-Mobile",             dealType:"New Deal",  asset:"Two Union Square",       floor:"Fls. 4–5",   space:"",           sf:47000,  stage:"Proposal",  status:"active",   ner:62.00, budgetNer:61.00,  lastUpdated:"2026-07-11", term:60,  contact:"Mia Ross" },
  { id:"d108",tenant:"Nordstrom",            dealType:"Expansion", asset:"Two Union Square",       floor:"",           space:"Suite 2500", sf:16000,  stage:"Inquiry",   status:"active",   ner:0,     budgetNer:58.00,   lastUpdated:"2026-07-16", contact:"Bex Lane" },
  { id:"d109",tenant:"REI Co-op",            dealType:"New Deal",  asset:"Two Union Square",       floor:"Fls. 6–7",   space:"",           sf:34000,  stage:"Lease Out", status:"active",   ner:57.00, budgetNer:56.00,  lastUpdated:"2026-07-13", term:72,  contact:"Gil Tran" },
]

const STAGES: Stage[] = ["Inquiry", "Touring", "Proposal", "LOI", "Legal", "Lease Out", "Executed"]

const STATUS_CONFIG: Record<Status, { label: string; icon: React.ElementType; cls: string }> = {
  active:   { label: "Active",    icon: CheckCircle2, cls: "text-success bg-success/10" },
  stalled:  { label: "Critical",   icon: Clock,        cls: "text-warning bg-warning/10" },
  "at-risk":{ label: "At Risk",   icon: AlertTriangle,cls: "text-destructive bg-destructive/10" },
  executed: { label: "Executed",  icon: CheckCircle2, cls: "text-success bg-success/10" },
}

// ── Column definitions ────────────────────────────────────────────────────────

type SortKey = "tenant" | "sf" | "stage" | "ner" | "lastUpdated" | "status" | "encumbrances" | "dealType" | "asset" | "floor" | "space" | "update"

interface ColDef {
  id: string
  label: string
  sortable: boolean
  right?: boolean
  defaultVisible: boolean
  w?: string
}

const ALL_COLUMNS: ColDef[] = [
  { id: "tenant",       label: "Tenant",         sortable: true,  defaultVisible: true,  w: "w-[110px]" },
  { id: "dealType",     label: "Deal type",      sortable: true,  defaultVisible: false, w: "w-[84px]"  },
  { id: "asset",        label: "Asset",          sortable: true,  defaultVisible: true,  w: "w-[110px]" },
  { id: "floor",        label: "Floor",          sortable: true,  defaultVisible: false, w: "w-[60px]"  },
  { id: "space",        label: "Space",          sortable: true,  defaultVisible: true,  w: "w-[76px]"  },
  { id: "sf",           label: "Size",           sortable: true,  right: true, defaultVisible: false, w: "w-[72px]"  },
  { id: "stage",        label: "Stage",          sortable: true,  defaultVisible: true,  w: "w-[120px]" },
  { id: "status",       label: "Health",         sortable: true,  defaultVisible: true,  w: "w-[96px]"  },
  { id: "update",       label: "Latest update",  sortable: true,  defaultVisible: true,  w: "w-[180px] max-w-[180px]" },
  { id: "encumbrances", label: "Encumbrances",   sortable: true,  defaultVisible: true,  w: "w-[44px]"  },
  { id: "ner",          label: "NER / Budget",   sortable: true,  right: true, defaultVisible: true,  w: "w-[108px]" },
  { id: "ner_vs_budget", label: "NER vs budget",  sortable: false, right: true, defaultVisible: false, w: "w-[112px]" },
  { id: "lastUpdated",  label: "Updated",        sortable: true,  right: true, defaultVisible: true,  w: "w-[80px]"  },
  { id: "actions",      label: "",               sortable: false, defaultVisible: true,  w: "w-[40px]"  },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysSince(iso: string) {
  const now = new Date("2026-07-16")
  return Math.floor((now.getTime() - new Date(iso).getTime()) / 86400000)
}

function fmtSf(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(0)}K sf` : `${n} sf`
}

function stageIndex(s: Stage) { return STAGES.indexOf(s) }

const PAGE_SIZE = 10

// ── Filter definitions ────────────────────────────────────────────────────────

const ASSETS_IN_DEALS = Array.from(new Set(DEALS.map(d => d.asset))).sort()

const FILTER_DEFS = [
  { key: "health",   label: "Health",    options: [
    { label: "Strong",   value: "strong"   },
    { label: "On track", value: "on-track" },
    { label: "Critical",  value: "caution"  },
    { label: "At risk",  value: "at-risk"  },
  ]},
  { key: "stage",    label: "Stage",     options: STAGES.map(v => ({ label: v, value: v })) },
  { key: "dealType", label: "Deal type", options: (["New Deal","Renewal","Expansion"] as DealType[]).map(v => ({ label: v, value: v })) },
  { key: "asset",    label: "Asset",     options: ASSETS_IN_DEALS.map(v => ({ label: v, value: v })) },
]

// ── Column manager popover ────────────────────────────────────────────────────

function ColumnManager({
  columns, visible, order, onToggle, onReorder,
}: {
  columns: ColDef[]
  visible: Set<string>
  order: string[]
  onToggle: (id: string) => void
  onReorder: (newOrder: string[]) => void
}) {
  const [dragging, setDragging] = React.useState<string | null>(null)
  const [dragOver, setDragOver] = React.useState<string | null>(null)

  function onDragStart(id: string) { setDragging(id) }
  function onDragEnd() { setDragging(null); setDragOver(null) }
  function onDragOverItem(id: string) { setDragOver(id) }
  function onDropItem(targetId: string) {
    if (!dragging || dragging === targetId) return
    const next = [...order]
    const from = next.indexOf(dragging)
    const to   = next.indexOf(targetId)
    next.splice(from, 1)
    next.splice(to, 0, dragging)
    onReorder(next)
    setDragging(null); setDragOver(null)
  }

  const colMap = Object.fromEntries(columns.map(c => [c.id, c]))
  const manageable = order.filter(id => colMap[id]?.label)

  return (
    <Popover>
      <PopoverTrigger className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-primary text-primary text-xs font-medium bg-transparent hover:bg-primary/10 transition-colors">
        <Settings2 className="h-3.5 w-3.5" />
        Columns
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <p className="text-xs font-medium text-muted-foreground px-2 pb-2">Drag to reorder</p>
        <div className="flex flex-col gap-0.5">
          {manageable.map(id => {
            const col = colMap[id]
            if (!col) return null
            const isVisible = visible.has(id)
            return (
              <div
                key={id}
                draggable
                onDragStart={() => onDragStart(id)}
                onDragEnd={onDragEnd}
                onDragOver={e => { e.preventDefault(); onDragOverItem(id) }}
                onDrop={() => onDropItem(id)}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-grab active:cursor-grabbing select-none",
                  dragOver === id && dragging !== id ? "bg-primary/10" : "hover:bg-muted/60"
                )}
              >
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                <span className="flex-1 text-sm text-foreground">{col.label}</span>
                <button
                  onClick={() => onToggle(id)}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ── Card manager popover ──────────────────────────────────────────────────────

const CARD_DEFS: { id: string; label: string }[] = [
  { id: "attention", label: "Need attention" },
  { id: "ner",       label: "NER vs budget"  },
  { id: "agents",    label: "VTS agents"     },
  { id: "pipeline",  label: "Deal pipeline"  },
]

function CardManager({
  visible, order, onToggle, onReorder,
}: {
  visible: Set<string>
  order: string[]
  onToggle: (id: string) => void
  onReorder: (newOrder: string[]) => void
}) {
  const [dragging, setDragging] = React.useState<string | null>(null)
  const [dragOver, setDragOver] = React.useState<string | null>(null)

  function onDragStart(id: string) { setDragging(id) }
  function onDragEnd() { setDragging(null); setDragOver(null) }
  function onDropItem(targetId: string) {
    if (!dragging || dragging === targetId) return
    const next = [...order]
    const from = next.indexOf(dragging)
    const to   = next.indexOf(targetId)
    next.splice(from, 1)
    next.splice(to, 0, dragging)
    onReorder(next)
    setDragging(null); setDragOver(null)
  }

  const cardMap = Object.fromEntries(CARD_DEFS.map(c => [c.id, c]))

  return (
    <Popover>
      <PopoverTrigger className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-primary text-primary text-xs font-medium bg-transparent hover:bg-primary/10 transition-colors">
        <Settings2 className="h-3.5 w-3.5" />
        Cards
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2">
        <p className="text-xs font-medium text-muted-foreground px-2 pb-2">Drag to reorder</p>
        <div className="flex flex-col gap-0.5">
          {order.map(id => {
            const card = cardMap[id]
            if (!card) return null
            const isVisible = visible.has(id)
            return (
              <div
                key={id}
                draggable
                onDragStart={() => onDragStart(id)}
                onDragEnd={onDragEnd}
                onDragOver={e => { e.preventDefault(); setDragOver(id) }}
                onDrop={() => onDropItem(id)}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-grab active:cursor-grabbing select-none",
                  dragOver === id && dragging !== id ? "bg-primary/10" : "hover:bg-muted/60"
                )}
              >
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                <span className="flex-1 text-sm text-foreground">{card.label}</span>
                <button onClick={() => onToggle(id)} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                  {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ── Pipeline viz ──────────────────────────────────────────────────────────────

function PipelineViz({ deals }: { deals: Deal[] }) {
  const byStageCounts = STAGES.map(s => ({
    stage: s,
    count: deals.filter(d => d.stage === s).length,
    sf: deals.filter(d => d.stage === s).reduce((a, d) => a + d.sf, 0),
    atRisk:  deals.filter(d => d.stage === s && getDealHealth(d.id, d.stage as any).score === "at-risk").length,
    stalled: deals.filter(d => d.stage === s && getDealHealth(d.id, d.stage as any).score === "caution").length,
  }))
  const maxCount = Math.max(...byStageCounts.map(s => s.count), 1)
  const card = React.useContext(CardCtx)

  return (
    <div className={cn(card, "flex flex-col")}>
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">Deal pipeline</p>
          <h2 className="text-xl font-semibold text-foreground">
            {deals.filter(d => d.stage !== "Executed").length} active deals
            <span className="text-muted-foreground font-normal text-base ml-2">· {fmtSf(deals.filter(d => d.stage !== "Executed").reduce((a, d) => a + d.sf, 0))} in pipeline</span>
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-destructive/70" />At risk</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-warning/70" />Critical</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-success/80" />Active</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-primary/80" />Executed</span>
        </div>
      </div>
      <div className="flex items-end gap-2 flex-1 min-h-[100px] mt-5">
        {byStageCounts.map(({ stage, count, sf, atRisk, stalled }) => {
          const active = count - atRisk - stalled
          const isExecuted = stage === "Executed"
          return (
            <React.Fragment key={stage}>
              {isExecuted && <div className="w-px self-stretch bg-border/50 mx-1" />}
              <div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="text-xs font-medium text-muted-foreground tabular-nums">{count > 0 ? count : ""}</div>
                <div className="w-full relative px-1.5" style={{ height: `${Math.max(count / maxCount * 100, count > 0 ? 4 : 1)}%` }}>
                  <div className="w-full h-full rounded-t-md overflow-hidden flex flex-col-reverse">
                    {active  > 0 && <div className={cn("w-full", isExecuted ? "bg-primary" : "bg-success")} style={{ height: `${(active / count) * 100}%` }} />}
                    {stalled > 0 && <div className="w-full bg-warning/70" style={{ height: `${(stalled / count) * 100}%` }} />}
                    {atRisk  > 0 && <div className="w-full bg-destructive/70" style={{ height: `${(atRisk / count) * 100}%` }} />}
                    {count === 0 && <div className="w-full h-1 bg-border rounded" />}
                  </div>
                </div>
                <div className="text-xs text-center leading-tight font-medium text-muted-foreground">{stage}</div>
                {sf > 0 && <div className="text-[10px] text-muted-foreground/70">{fmtSf(sf)}</div>}
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

// ── Action queue ──────────────────────────────────────────────────────────────

const ACTION_URGENCY: { score: string; label: string; cls: string; next: string }[] = [
  { score: "at-risk",  label: "At risk",  cls: "text-destructive bg-destructive/10 border-destructive/20", next: "Escalate today" },
  { score: "caution",  label: "Critical",  cls: "text-warning bg-warning/10 border-warning/20",             next: "Review this week" },
  { score: "on-track", label: "Stale",    cls: "text-muted-foreground bg-muted/60 border-border",          next: "Check in" },
]

const CARD_PAGE_SIZE = 5

function ActionQueue({ deals, onDealClick, onHealthClick }: { deals: Deal[]; onDealClick?: (deal: Deal) => void; onHealthClick?: (dealId: string) => void }) {
  const card = React.useContext(CardCtx)
  const [page, setPage] = React.useState(0)

  const rows = React.useMemo(() => {
    const active = deals.filter(d => d.stage !== "Executed")
    return active
      .map(d => {
        const health = getDealHealth(d.id, d.stage as any)
        const days = daysSince(d.lastUpdated)
        return { deal: d, health, days }
      })
      .filter(({ health, days }) => health.score === "at-risk" || health.score === "caution" || days >= 14)
      .sort((a, b) => {
        const rank: Record<string, number> = { "at-risk": 0, "caution": 1 }
        const ar = rank[a.health.score] ?? 2
        const br = rank[b.health.score] ?? 2
        if (ar !== br) return ar - br
        return b.days - a.days
      })
  }, [deals])

  const totalPages = Math.max(1, Math.ceil(rows.length / CARD_PAGE_SIZE))
  const paginated = rows.slice(page * CARD_PAGE_SIZE, (page + 1) * CARD_PAGE_SIZE)

  return (
    <div className={cn(card, "flex flex-col gap-0 p-0 overflow-hidden")}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-0.5">Need attention</p>
          <p className="text-xl font-semibold text-foreground">{rows.length} deals</p>
        </div>
      </div>
      <div className="flex flex-col divide-y divide-border/40 flex-1">
        {paginated.map(({ deal, health, days }) => {
          const urgencyCfg = ACTION_URGENCY.find(u => u.score === health.score) ?? ACTION_URGENCY[2]
          return (
            <div
              key={deal.id}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => onDealClick?.(deal)}
            >
              <TenantAvatar name={deal.tenant} />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground truncate block">{deal.tenant}</span>
                <span className="text-xs text-muted-foreground">{deal.stage} · {days}d no update</span>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span
                  className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity", urgencyCfg.cls)}
                  onClick={e => { e.stopPropagation(); onHealthClick?.(deal.id) }}
                >{urgencyCfg.label}</span>
                <span className="text-xs text-muted-foreground">{urgencyCfg.next}</span>
              </div>
            </div>
          )
        })}
        {rows.length === 0 && (
          <p className="px-5 py-8 text-sm text-muted-foreground text-center">No deals need immediate attention</p>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-border/40">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted/60 text-muted-foreground disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs text-muted-foreground">{page + 1} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted/60 text-muted-foreground disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

// ── NER performance board ─────────────────────────────────────────────────────

function NerBoard({ deals, onDealClick }: { deals: Deal[]; onDealClick?: (deal: Deal) => void }) {
  const card = React.useContext(CardCtx)
  const [page, setPage] = React.useState(0)

  const rows = React.useMemo(() => {
    return deals
      .filter(d => d.stage !== "Executed" && d.ner > 0 && d.budgetNer > 0)
      .map(d => ({ deal: d, diff: d.ner - d.budgetNer, pct: Math.round(((d.ner - d.budgetNer) / d.budgetNer) * 100) }))
      .sort((a, b) => a.pct - b.pct)
  }, [deals])

  const allNer = rows.reduce((a, r) => a + r.deal.ner * r.deal.sf, 0)
  const allBudget = rows.reduce((a, r) => a + r.deal.budgetNer * r.deal.sf, 0)
  const portfolioDiff = allBudget > 0 ? Math.round(((allNer - allBudget) / allBudget) * 100) : 0

  const totalPages = Math.max(1, Math.ceil(rows.length / CARD_PAGE_SIZE))
  const paginated = rows.slice(page * CARD_PAGE_SIZE, (page + 1) * CARD_PAGE_SIZE)

  return (
    <div className={cn(card, "flex flex-col gap-0 p-0 overflow-hidden")}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-0.5">NER vs budget</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className={cn("text-2xl font-semibold tabular-nums", portfolioDiff >= 0 ? "text-success" : "text-destructive")}>
              {portfolioDiff >= 0 ? "+" : ""}{portfolioDiff}%
            </span>
            <span className="text-sm font-normal text-muted-foreground">avg</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-border/40 flex-1">
        {paginated.map(({ deal, pct }) => {
          const isAbove = pct >= 0
          const barW = Math.min(Math.abs(pct), 40)
          return (
            <div
              key={deal.id}
              className="flex items-center gap-3 px-5 py-2.5 hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => onDealClick?.(deal)}
            >
              <TenantAvatar name={deal.tenant} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{deal.tenant}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", isAbove ? "bg-success" : "bg-destructive")}
                      style={{ width: `${(barW / 40) * 100}%`, marginLeft: isAbove ? "50%" : `${50 - barW * 1.25}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0 w-16">
                <p className={cn("text-sm font-semibold tabular-nums", isAbove ? "text-success" : "text-destructive")}>
                  {isAbove ? "+" : ""}{pct}%
                </p>
                <p className="text-xs text-muted-foreground">${deal.ner.toFixed(0)}/sf</p>
              </div>
            </div>
          )
        })}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-border/40">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted/60 text-muted-foreground disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs text-muted-foreground">{page + 1} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted/60 text-muted-foreground disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

// ── VTS agent card ────────────────────────────────────────────────────────────

const AI_ACTIONS: { icon: React.ElementType; text: string; value: string; impact: string; data: string }[] = [
  { icon: AlertTriangle, text: "Draft counter-proposals for at-risk renewals", value: "3 renewals", impact: "KPMG · Verizon · United Airlines",           data: "KPMG, Verizon, United Airlines" },
  { icon: ChevronDown,   text: "Deals below NER budget by 10%+",               value: "6 deals",    impact: "Top underperformers by NER variance",         data: "NER underperformers" },
  { icon: Clock,         text: "Summarize stalled deals for weekly report",     value: "24 deals",   impact: "Last updated 14+ days ago",                   data: "Stalled 14+ days" },
]

function AiInsightCard({ deals }: { deals: Deal[] }) {
  const card = React.useContext(CardCtx)
  const atRiskCount = deals.filter(d => d.stage !== "Executed" && getDealHealth(d.id, d.stage as any).score === "at-risk").length
  const belowBudget = deals.filter(d => d.ner > 0 && d.budgetNer > 0 && d.ner < d.budgetNer * 0.9).length

  return (
    <div className={cn(card, "border-transparent flex flex-col gap-4 bg-sidebar-accent")}>
      <div>
        <p className="text-[10px] font-medium uppercase tracking-widest mb-1 text-sidebar-foreground/70">VTS agents</p>
        <p className="text-xl font-semibold text-sidebar-foreground">Deal intelligence</p>
      </div>

      <div className="rounded-lg px-3 py-2 bg-sidebar-foreground/10 flex items-center gap-2">
        <Sparkle className="h-4 w-4 shrink-0 text-sidebar-primary" />
        <p className="text-sm leading-snug text-sidebar-foreground/70">
          {atRiskCount} at-risk deals · <span className="text-sidebar-primary font-medium">{belowBudget} below NER budget</span>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {AI_ACTIONS.map((item, i) => {
          const Icon = item.icon
          return (
            <div key={i} className="rounded-lg border border-primary/25 bg-primary/15 p-3 group/row agent-row cursor-pointer">
              <div className="flex items-start gap-2.5">
                <Icon className="h-4 w-4 mt-0.5 shrink-0 text-sidebar-primary" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm leading-snug text-sidebar-foreground/85">{item.text}</p>
                    <span className="text-sm font-medium tabular-nums shrink-0 text-sidebar-primary">{item.value}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5 gap-2">
                    <span className="text-sm text-sidebar-foreground/60">{item.impact}</span>
                    <AgentBtn variant="run" label={`${item.text} · ${item.value} · ${item.data}`} className="opacity-0 group-hover/row:opacity-100" />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── KPI summary ───────────────────────────────────────────────────────────────

function KpiSummary({ deals }: { deals: Deal[] }) {
  const active = deals.filter(d => d.stage !== "Executed")
  const totalSf = active.reduce((a, d) => a + d.sf, 0)
  const withNer = active.filter(d => d.ner > 0 && d.budgetNer > 0)
  const avgNer = withNer.length ? withNer.reduce((a, d) => a + d.ner, 0) / withNer.length : 0
  const avgBudgetNer = withNer.length ? withNer.reduce((a, d) => a + d.budgetNer, 0) / withNer.length : 0
  const nerVsBudgetPct = avgBudgetNer > 0 ? Math.round(((avgNer - avgBudgetNer) / avgBudgetNer) * 100) : 0
  const atRisk = active.filter(d => getDealHealth(d.id, d.stage as any).score === "at-risk").length
  const caution = active.filter(d => getDealHealth(d.id, d.stage as any).score === "caution").length
  const executed = deals.filter(d => d.stage === "Executed").length

  return (
    <KpiBar kpis={[
      { label: "Active deals",   value: String(active.length),   subtitle: `${executed} executed this month` },
      { label: "Pipeline SF",    value: fmtSf(totalSf),          subtitle: "across active pipeline" },
      {
        label: "Avg NER / sf",
        value: `$${avgNer.toFixed(0)}`,
        trend: nerVsBudgetPct >= 0 ? "up" : "down",
        subtitleNode: (
          <span className={cn("text-xs font-medium", nerVsBudgetPct >= 0 ? "text-success" : "text-destructive")}>
            {nerVsBudgetPct >= 0 ? "+" : ""}{nerVsBudgetPct}% vs budget
          </span>
        ),
      },
      {
        label: "Need attention",
        value: `${atRisk + caution} deals`,
        subtitleNode: (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border border-destructive/20", STATUS_CONFIG["at-risk"].cls)}>{atRisk} At Risk</span>
            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border border-warning/20", STATUS_CONFIG["stalled"].cls)}>{caution} Critical</span>
          </div>
        ),
      },
    ]} />
  )
}

// ── Shared deal health modal ───────────────────────────────────────────────────

export function DealHealthModal({ dealId, onClose }: { dealId: string; onClose: () => void }) {
  const hDeal = DEALS.find(d => d.id === dealId)
  if (!hDeal) return null
  const hCfg = getDealHealth(hDeal.id, hDeal.stage as any)
  return (
    <DialogPrimitive.Root open onOpenChange={open => { if (!open) onClose() }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <DialogPrimitive.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border-transparent bg-sidebar-accent p-6 shadow-xl transition-all duration-150 data-ending-style:opacity-0 data-ending-style:scale-95 data-starting-style:opacity-0 data-starting-style:scale-95">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/70 mb-1">VTS agents</p>
              <div className="flex items-baseline gap-3">
                <DialogPrimitive.Title className="text-xl font-semibold text-sidebar-foreground">Deal health</DialogPrimitive.Title>
                <span className={cn("text-xl font-semibold", hCfg.textCls)}>{hCfg.label}</span>
              </div>
            </div>
            <DialogPrimitive.Close render={<Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 -mt-1 -mr-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-foreground/10"><X className="h-4 w-4" /></Button>} />
          </div>
          <div className="rounded-lg px-3 py-2.5 bg-sidebar-foreground/10 flex items-start gap-2.5 mb-5">
            <HeartPulse className="h-4 w-4 shrink-0 text-sidebar-primary mt-0.5" />
            <p className="text-sm leading-snug text-sidebar-foreground/80">{hCfg.summary}</p>
          </div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/50 mb-3">Signals</p>
          <div className="flex flex-col gap-3">
            {hCfg.signals.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-sidebar-foreground/80 leading-snug">
                <Dot className="h-4 w-4 text-sidebar-foreground/40 shrink-0 mt-0.5" />
                {s}
              </div>
            ))}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function DealsPage({ onDealClick, assetContext, allowedAssets }: { onDealClick?: (deal: Deal, initialTab?: string) => void; assetContext?: string; allowedAssets?: string[] }) {
  const card = cardBase
  const [keyword, setKeyword] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({})
  const filterDefs = React.useMemo(() => {
    if (assetContext) return FILTER_DEFS.filter(f => f.key !== "asset")
    if (allowedAssets) return FILTER_DEFS.map(f => f.key === "asset" ? { ...f, options: allowedAssets.map(v => ({ label: v, value: v })) } : f)
    return FILTER_DEFS
  }, [assetContext, allowedAssets])
  const [stageOverrides, setStageOverrides] = React.useState<Record<string, Stage>>({})
  const [healthOpenId, setHealthOpenId] = React.useState<string | null>(null)
  const [composerOpenId, setComposerOpenId] = React.useState<string | null>(null)
  const [composerDraft, setComposerDraft] = React.useState("")
  const [localComments, setLocalComments] = React.useState<Record<string, { message: string; name: string; timestamp: string }>>({})

  function postComment(dealId: string) {
    const text = composerDraft.trim()
    if (!text) return
    setLocalComments(prev => ({ ...prev, [dealId]: { message: text, name: "You", timestamp: "Just now" } }))
    setComposerDraft("")
    setComposerOpenId(null)
  }
  const { sortKey, sortDir, handleSort: _handleSort } = useSortState<SortKey>("lastUpdated", "desc")
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [page, setPage] = React.useState(1)

  // Card visibility + order — persisted to localStorage
  const [visibleCards, setVisibleCards] = React.useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("deals:visibleCards")
      return saved ? new Set(JSON.parse(saved)) : new Set(["attention", "ner", "agents"])
    } catch { return new Set(["attention", "ner", "agents"]) }
  })
  const [cardOrder, setCardOrder] = React.useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("deals:cardOrder")
      return saved ? JSON.parse(saved) : ["attention", "ner", "agents", "pipeline"]
    } catch { return ["attention", "ner", "agents", "pipeline"] }
  })
  function toggleCard(id: string) {
    setVisibleCards(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      localStorage.setItem("deals:visibleCards", JSON.stringify([...n]))
      return n
    })
  }
  function updateCardOrder(order: string[]) {
    setCardOrder(order)
    localStorage.setItem("deals:cardOrder", JSON.stringify(order))
  }

  // Column visibility + order
  const [visible, setVisible] = React.useState<Set<string>>(
    () => new Set(ALL_COLUMNS.filter(c => c.defaultVisible).map(c => c.id))
  )
  const [colOrder, setColOrder] = React.useState<string[]>(
    () => ALL_COLUMNS.map(c => c.id)
  )

  function toggleCol(id: string) {
    setVisible(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }
  function onFilterToggle(key: string, value: string) { setActiveFilters(prev => toggleFilterValue(prev, key, value)); setPage(1) }
  function onFilterClear(key: string) { setActiveFilters(prev => clearFilterKey(prev, key)); setPage(1) }
  function onClearAll() { setActiveFilters({}); setPage(1) }

  const scopedDeals = React.useMemo(() =>
    assetContext
      ? DEALS.filter(d => d.asset === assetContext)
      : allowedAssets?.length
        ? DEALS.filter(d => allowedAssets.includes(d.asset))
        : [...DEALS]
  , [assetContext, allowedAssets])

  const filtered = React.useMemo(() => {
    let r = [...scopedDeals]
    if (keyword) {
      const q = keyword.toLowerCase()
      r = r.filter(d => d.tenant.toLowerCase().includes(q) || d.asset.toLowerCase().includes(q) || d.space.toLowerCase().includes(q))
    }
    for (const [key, values] of Object.entries(activeFilters)) {
      if (!values.length) continue
      if (key === "health") {
        r = r.filter(d => values.includes(getDealHealth(d.id, d.stage as any).score))
      } else {
        r = r.filter(d => values.includes(String(d[key as keyof Deal])))
      }
    }
    r.sort((a, b) => {
      let av: string | number, bv: string | number
      if (sortKey === "stage")             { av = stageIndex(a.stage); bv = stageIndex(b.stage) }
      else if (sortKey === "tenant")       { av = a.tenant.toLowerCase(); bv = b.tenant.toLowerCase() }
      else if (sortKey === "status")       { const rank: Record<string,number> = { "strong":0,"on-track":1,"caution":2,"at-risk":3 }; av = rank[getDealHealth(a.id, a.stage as any).score] ?? 1; bv = rank[getDealHealth(b.id, b.stage as any).score] ?? 1 }
      else if (sortKey === "encumbrances") { av = getEncumbranceCount(a.id); bv = getEncumbranceCount(b.id) }
      else if (sortKey === "asset")        { av = a.asset.toLowerCase(); bv = b.asset.toLowerCase() }
      else if (sortKey === "floor")        { av = a.floor.toLowerCase(); bv = b.floor.toLowerCase() }
      else if (sortKey === "space")        { av = a.space.toLowerCase(); bv = b.space.toLowerCase() }
      else if (sortKey === "dealType")     { av = a.dealType; bv = b.dealType }
      else if (sortKey === "update")       { av = a.lastUpdated; bv = b.lastUpdated }
      else                                 { av = a[sortKey] as number | string; bv = b[sortKey] as number | string }
      if (av < bv) return sortDir === "asc" ? -1 : 1
      if (av > bv) return sortDir === "asc" ? 1 : -1
      return 0
    })
    return r
  }, [keyword, activeFilters, sortKey, sortDir, scopedDeals])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSort(key: SortKey) { _handleSort(key); setPage(1) }

  const allOnPage = paginated.length > 0 && paginated.every(d => selected.has(d.id))
  function toggleAll() {
    setSelected(prev => {
      const next = new Set(prev)
      if (allOnPage) { paginated.forEach(d => next.delete(d.id)) }
      else { paginated.forEach(d => next.add(d.id)) }
      return next
    })
  }
  function toggleRow(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const orderedCols = colOrder
    .map(id => ALL_COLUMNS.find(c => c.id === id))
    .filter((c): c is ColDef => !!c && visible.has(c.id))

  return (
    <>
    <CardCtx.Provider value={card}>
    <div className="space-y-4">
      <KpiSummary deals={scopedDeals} />

      {/* Insight cards */}
      {(() => {
        const active = cardOrder.filter(id => visibleCards.has(id))
        if (!active.length) return null
        const CARD_MAP: Record<string, React.ReactNode> = {
          attention: <ActionQueue key="attention" deals={scopedDeals} onDealClick={d => onDealClick?.(d, undefined)} onHealthClick={setHealthOpenId} />,
          ner:       <NerBoard   key="ner"       deals={scopedDeals} onDealClick={d => onDealClick?.(d, undefined)} />,
          agents:    <AiInsightCard key="agents" deals={scopedDeals} />,
          pipeline:  <PipelineViz  key="pipeline" deals={scopedDeals} />,
        }
        const cols = active.length
        return (
          <div
            className={cn(
              "grid gap-4 items-stretch",
              cols === 1 ? "grid-cols-1" : cols === 2 ? "grid-cols-1 md:grid-cols-2" : cols === 3 ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
            )}
          >
            {active.map(id => CARD_MAP[id])}
          </div>
        )
      })()}

      {/* Deals table */}
      <div className={cn(card)}>
        {/* Selection bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setSelected(new Set())} className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors">
              <span>{selected.size} selected</span>
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <Button size="sm" variant="outline" className="h-8 text-xs">Change stage</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs">Comment</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs">Add requirement</Button>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-input bg-background text-sm hover:bg-accent hover:text-accent-foreground transition-colors focus:outline-none">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem>Move to dead</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Filters row */}
        <div className={cn("flex flex-wrap items-center gap-2 mb-4", selected.size > 0 && "hidden")}>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={keyword}
              onChange={e => { setKeyword(e.target.value); setPage(1) }}
              placeholder="Search tenant, asset…"
              className="pl-8 h-8 text-sm w-48"
            />
          </div>
          <FilterBar
            filters={filterDefs}
            active={activeFilters}
            onToggle={onFilterToggle}
            onClear={onFilterClear}
            onClearAll={onClearAll}
            visibleCount={4}
          />
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <CardManager visible={visibleCards} order={cardOrder} onToggle={toggleCard} onReorder={updateCardOrder} />
            <ColumnManager
              columns={ALL_COLUMNS}
              visible={visible}
              order={colOrder}
              onToggle={toggleCol}
              onReorder={setColOrder}
            />
            <Button size="sm" className="h-8 gap-1.5 text-sm"><Plus className="h-3.5 w-3.5" />Add deal</Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto -mx-5 px-5">
        <Table className="border-collapse">
          <TableHeader>
            <TableRow className="border-b-2 border-border/60 hover:bg-transparent">
              <th className="pb-2 pt-0 w-8 pr-2 text-left">
                <Checkbox checked={allOnPage} onCheckedChange={toggleAll} className="h-3.5 w-3.5" />
              </th>
              {orderedCols.map(col => (
                <SortableHead
                  key={col.id}
                  col={col.sortable ? col.id as SortKey : null}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                  right={col.right}
                  className={cn(col.w, col.right ? "pl-3" : col.id === "tenant" ? undefined : "pl-4")}
                >
                  {col.label}
                </SortableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 && (
              <TableRow><TableCell colSpan={orderedCols.length + 1} className="py-10 text-center text-sm text-muted-foreground">No deals match your filters.</TableCell></TableRow>
            )}
            {paginated.map((deal, i) => {
              const days = daysSince(deal.lastUpdated)
              const stale = days >= 14
              const healthCfg = getDealHealth(deal.id, deal.stage as any)
              const nerDiff = deal.ner - deal.budgetNer
              const nerPct = deal.budgetNer > 0 ? Math.round((nerDiff / deal.budgetNer) * 100) : 0
              return (
                <TableRow key={deal.id} onClick={() => onDealClick?.(deal, undefined)} className={cn("cursor-pointer hover:bg-muted/40 transition-colors", i > 0 ? "border-t border-border/40" : "border-0", selected.has(deal.id) && "bg-primary/5")}>
                  <td className="py-3 pr-2 w-8" onClick={e => e.stopPropagation()}>
                    <Checkbox checked={selected.has(deal.id)} onCheckedChange={() => toggleRow(deal.id)} className="h-3.5 w-3.5" />
                  </td>
                  {orderedCols.map(col => {
                    const w = col.w ?? ""
                    switch (col.id) {
                      case "tenant":
                        return (
                          <TableCell key="tenant" className={cn("py-3", w)}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              <TenantAvatar name={deal.tenant} />
                              <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="text-sm font-medium text-foreground truncate">{deal.tenant}</span>
                                <span className="inline-flex self-start items-center rounded px-1.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground">{deal.dealType}</span>
                              </div>
                            </div>
                          </TableCell>
                        )
                      case "dealType":
                        return <TableCell key="dealType" className={cn("py-3 pl-4 text-sm text-foreground/80", w)}><span className="truncate block">{deal.dealType}</span></TableCell>
                      case "asset":
                        return <TableCell key="asset" className={cn("py-3 pl-4 text-sm text-foreground/80", w)}><span className="truncate block">{deal.asset}</span></TableCell>
                      case "floor":
                        return <TableCell key="floor" className={cn("py-3 pl-4 text-sm text-muted-foreground", w)}>{deal.floor || <span className="text-foreground/20">—</span>}</TableCell>
                      case "space":
                        return <TableCell key="space" className={cn("py-3 pl-4 text-sm text-muted-foreground", w)}><span className="truncate block">{deal.space || <span className="text-foreground/20">—</span>}</span></TableCell>
                      case "sf":
                        return <TableCell key="sf" className={cn("py-3 pl-4 text-right tabular-nums font-medium text-foreground whitespace-nowrap", w)}>{fmtSf(deal.sf)}</TableCell>
                      case "stage": {
                        const currentStage = stageOverrides[deal.id] ?? deal.stage
                        return (
                          <TableCell key="stage" className={cn("py-3 pl-4", w)} onClick={e => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background px-2.5 py-1 text-sm text-foreground hover:bg-muted/50 transition-colors focus:outline-none w-full justify-between">
                                <span className="truncate">{currentStage}</span>
                                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-36">
                                {STAGES.map(s => (
                                  <DropdownMenuItem
                                    key={s}
                                    onClick={() => setStageOverrides(prev => ({ ...prev, [deal.id]: s }))}
                                    className={cn(currentStage === s && "font-medium text-primary")}
                                  >
                                    {s}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )
                      }
                      case "status":
                        return (
                          <TableCell key="status" className={cn("py-3 pl-4", w)} onClick={e => { e.stopPropagation(); setHealthOpenId(deal.id) }}>
                            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity", healthCfg.cls)}>
                              {healthCfg.label}
                            </span>
                          </TableCell>
                        )
                      case "update":
                        return (
                          <TableCell key="update" className="py-3 pl-4 w-[180px] max-w-[180px]" onClick={e => e.stopPropagation()}>
                            {(() => {
                              const u = localComments[deal.id] ?? getLatestHumanUpdate(deal.id, deal.stage)
                              const isOpen = composerOpenId === deal.id
                              if (isOpen) return (
                                <div className="flex flex-col gap-1.5" onClick={e => e.stopPropagation()}>
                                  <textarea
                                    autoFocus
                                    rows={2}
                                    value={composerDraft}
                                    onChange={e => setComposerDraft(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); postComment(deal.id) } if (e.key === "Escape") { setComposerOpenId(null); setComposerDraft("") } }}
                                    placeholder="Leave an update..."
                                    className="w-full resize-none rounded border border-border bg-background px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                  />
                                  <div className="flex items-center gap-1.5">
                                    <button className="text-xs text-primary hover:underline font-medium" onClick={() => postComment(deal.id)}>Post</button>
                                    <button className="text-xs text-muted-foreground hover:underline" onClick={() => { setComposerOpenId(null); setComposerDraft("") }}>Cancel</button>
                                  </div>
                                </div>
                              )
                              if (!u) return (
                                <button className="text-xs text-primary hover:underline" onClick={() => { setComposerOpenId(deal.id); setComposerDraft("") }}>Leave an update</button>
                              )
                              return (
                                <div className="flex flex-col gap-0.5 max-w-[164px]">
                                  <div className="flex items-baseline justify-between gap-1">
                                    <span className="text-xs font-semibold text-foreground truncate">{u.name}</span>
                                    <span className="text-[10px] text-muted-foreground shrink-0">{u.timestamp}</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground line-clamp-2 leading-snug whitespace-normal">{u.message}</span>
                                  <button className="text-xs text-primary hover:underline text-left mt-0.5" onClick={() => { setComposerOpenId(deal.id); setComposerDraft("") }}>Leave an update</button>
                                </div>
                              )
                            })()}
                          </TableCell>
                        )
                      case "encumbrances":
                        return (
                          <TableCell key="encumbrances" className={cn("py-3 pl-4", w)}>
                            <div className="flex items-center justify-center">
                              {(() => {
                                const count = getEncumbranceCount(deal.id)
                                if (count === 0) return <span className="text-muted-foreground/40 text-xs">—</span>
                                return (
                                  <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-sm font-bold bg-destructive text-white tabular-nums">{count}</span>
                                )
                              })()}
                            </div>
                          </TableCell>
                        )
                      case "ner":
                        return (
                          <TableCell key="ner" className={cn("py-3 pl-3 text-right tabular-nums whitespace-nowrap", w)}>
                            {deal.ner > 0 ? (
                              <div className="text-right tabular-nums">
                                <div className="text-sm font-medium text-foreground">${deal.ner.toFixed(2)}</div>
                                <div className={cn("text-[10px] font-medium", nerDiff >= 0 ? "text-success" : "text-destructive")}>
                                  {nerDiff >= 0 ? "+" : ""}{nerPct}% vs ${deal.budgetNer.toFixed(2)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/50 text-xs">—</span>
                            )}
                          </TableCell>
                        )
                      case "ner_vs_budget":
                        return (
                          <TableCell key="ner_vs_budget" className={cn("py-3 pl-3 text-right tabular-nums whitespace-nowrap", w)}>
                            {deal.ner > 0 ? (
                              <div className="text-right tabular-nums">
                                <div className="text-sm font-medium text-foreground">${deal.ner.toFixed(2)}/sf</div>
                                <div className={cn("text-[10px] font-medium", nerDiff >= 0 ? "text-success" : "text-destructive")}>
                                  {nerDiff >= 0 ? "+" : ""}{nerPct}% vs ${deal.budgetNer.toFixed(2)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/50 text-xs">—</span>
                            )}
                          </TableCell>
                        )
                      case "lastUpdated":
                        return (
                          <TableCell key="lastUpdated" className={cn("py-3 pl-4 text-right whitespace-nowrap", w)}>
                            <span className={cn("text-xs tabular-nums", stale ? "text-warning font-medium" : "text-muted-foreground")}>
                              {days === 0 ? "Today" : days === 1 ? "1d ago" : `${days}d ago`}
                            </span>
                          </TableCell>
                        )
                      case "actions":
                        return (
                          <TableCell key="actions" className={cn("py-3 pl-2", w)}>
                            <AgentBtn entity="Deal" label={`${deal.tenant} — ${deal.dealType} · ${deal.sf.toLocaleString()} sf, ${deal.space} at ${deal.asset} · stage: ${deal.stage}${deal.note ? ` · ${deal.note}` : ""}`} />
                          </TableCell>
                        )
                      default:
                        return null
                    }
                  })}
                  <td className="py-3 pl-1 pr-2 w-8" onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors focus:outline-none">
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem>Set reminder</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </TableRow>
              )
            })}
            <TableRow className="border-t border-border/40 hover:bg-muted/30 transition-colors cursor-pointer group">
              <td colSpan={orderedCols.length + 2} className="py-2.5 px-3">
                <button className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                  Add deal
                </button>
              </td>
            </TableRow>
          </TableBody>
        </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
          <span className="text-xs text-muted-foreground">
            {filtered.length === 0 ? "0 deals" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <Button key={p} variant={p === page ? "default" : "outline"} size="sm" className="h-7 w-7 p-0 text-xs" onClick={() => setPage(p)}>{p}</Button>
            ))}
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
    </CardCtx.Provider>

    {/* Health modal */}

    {healthOpenId && <DealHealthModal dealId={healthOpenId} onClose={() => setHealthOpenId(null)} />}
    </>
  )
}
