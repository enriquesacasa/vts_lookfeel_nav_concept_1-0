import * as React from "react"
import { cn, cardBase } from "@/lib/utils"
import { KpiBar } from "@/components/kpi-bar"
import { FilterBar, toggleFilterValue, clearFilterKey } from "@/components/filter-chip"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Settings2, ChevronLeft, ChevronRight, GripVertical, Eye, EyeOff, Plus, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { AgentBtn } from "@/components/agent-btn"
import { TenantAvatar } from "@/components/tenant-avatar"
import { ADDITIONAL_LEASES } from "@/lib/lease-data-new"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Table, TableHeader, TableBody, TableRow, TableCell, TableHead,
  SortableHead, useSortState,
} from "@/components/sortable-table"

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Lease {
  id: string
  tenant: string
  asset: string
  floor: string
  suite: string
  sf: number
  baseRent: number          // $/sf/yr in-place base
  annualRent: number        // total annual base rent
  additionalRentPsf: number // $/sf/yr additional (TMI/CAM)
  grossRentPsf: number      // $/sf/yr base + additional
  marketRentPsf: number     // $/sf/yr market comparable
  renewalStatus: string     // "Renewal option" | "Negotiating" | "Not renewing" | ""
  salesR12?: number         // trailing 12-mo sales (retail only)
  ocr?: number              // occupancy cost ratio % (retail only)
  lastUpdate: string        // MM/DD/YYYY
  lcd: string
  lxd: string
  executionDate: string
  terminationDate: string   // "" if none
  terminationType: string   // "Landlord only" | "Tenant only" | "Mutual" | ""
  rentReviewDate: string    // "" if none
  tenantAct: string         // e.g. "Retail Leases Act" | ""
  passingRentYr: number     // annual passing rent
  passingRentPsf: number    // passing rent $/sf/yr
  nextRent: number          // next step rent $/sf/yr (0 if none)
  term: number
  remaining: number
  leaseStatus: "In Place" | "Committed" | "Subleased" | "Expired"
  status: "Active" | "Expiring soon" | "Expired" | "Pending"
  type: "Direct" | "Sublease"
  options: string[]
}

type SortKey =
  | "tenant" | "asset" | "suite" | "sf" | "baseRent" | "annualRent"
  | "lcd" | "lxd" | "term" | "remaining" | "status" | "type"
  | "marketRentPsf" | "lastUpdate" | "grossRentPsf"

// ── Mock data ─────────────────────────────────────────────────────────────────

export const LEASES: Lease[] = [
  { id: "l01", tenant: "Blackstone Inc.",           asset: "VTS Tower Headquarters", floor: "Floor 14", suite: "1400",      sf: 10000,  baseRent: 102.50, annualRent: 1025000,  additionalRentPsf: 28.50, grossRentPsf: 131.00, marketRentPsf: 118.00, renewalStatus: "Renewal option",  lastUpdate: "07/10/2026", lcd: "07/01/2020", lxd: "06/30/2030", executionDate: "05/15/2020", terminationDate: "",           terminationType: "",              rentReviewDate: "07/01/2025", tenantAct: "",                 passingRentYr: 1025000,  passingRentPsf: 102.50, nextRent: 107.60, term: 120, remaining: 46, leaseStatus: "In Place",   status: "Active",        type: "Direct",   options: ["Renewal Option", "ROFO"] },
  { id: "l02", tenant: "Blackstone Inc.",           asset: "VTS Tower Headquarters", floor: "Floor 13", suite: "1300",      sf: 18000,  baseRent: 102.50, annualRent: 1845000,  additionalRentPsf: 28.50, grossRentPsf: 131.00, marketRentPsf: 118.00, renewalStatus: "Renewal option",  lastUpdate: "07/10/2026", lcd: "07/01/2020", lxd: "06/30/2030", executionDate: "05/15/2020", terminationDate: "",           terminationType: "",              rentReviewDate: "07/01/2025", tenantAct: "",                 passingRentYr: 1845000,  passingRentPsf: 102.50, nextRent: 107.60, term: 120, remaining: 46, leaseStatus: "In Place",   status: "Active",        type: "Direct",   options: ["Renewal Option", "Expansion Option", "ROFO"] },
  { id: "l03", tenant: "Vantage Point Capital LP",  asset: "VTS Tower Headquarters", floor: "Floor 12", suite: "1200",      sf: 18000,  baseRent: 98.35,  annualRent: 1770300,  additionalRentPsf: 26.40, grossRentPsf: 124.75, marketRentPsf: 112.00, renewalStatus: "Negotiating",     lastUpdate: "06/28/2026", lcd: "01/01/2023", lxd: "12/31/2029", executionDate: "11/18/2022", terminationDate: "",           terminationType: "",              rentReviewDate: "01/01/2026", tenantAct: "",                 passingRentYr: 1770300,  passingRentPsf: 98.35,  nextRent: 103.27, term: 84,  remaining: 40, leaseStatus: "In Place",   status: "Active",        type: "Direct",   options: ["Renewal Option"] },
  { id: "l04", tenant: "Amazon.com Inc.",           asset: "VTS Tower Headquarters", floor: "Floor 11", suite: "1100",      sf: 18000,  baseRent: 89.12,  annualRent: 1604160,  additionalRentPsf: 24.80, grossRentPsf: 113.92, marketRentPsf: 108.00, renewalStatus: "Not renewing",    lastUpdate: "07/01/2026", lcd: "10/01/2022", lxd: "09/30/2029", executionDate: "08/20/2022", terminationDate: "",           terminationType: "",              rentReviewDate: "10/01/2025", tenantAct: "",                 passingRentYr: 1604160,  passingRentPsf: 89.12,  nextRent: 93.58,  term: 84,  remaining: 37, leaseStatus: "In Place",   status: "Active",        type: "Direct",   options: ["Renewal Option", "Expansion Option"] },
  { id: "l05", tenant: "Amazon.com Inc.",           asset: "VTS Tower Headquarters", floor: "Floor 10", suite: "1000",      sf: 18000,  baseRent: 89.12,  annualRent: 1604160,  additionalRentPsf: 24.80, grossRentPsf: 113.92, marketRentPsf: 108.00, renewalStatus: "Not renewing",    lastUpdate: "07/01/2026", lcd: "10/01/2020", lxd: "09/30/2030", executionDate: "08/20/2020", terminationDate: "",           terminationType: "",              rentReviewDate: "10/01/2025", tenantAct: "",                 passingRentYr: 1604160,  passingRentPsf: 89.12,  nextRent: 93.58,  term: 120, remaining: 49, leaseStatus: "In Place",   status: "Active",        type: "Direct",   options: [] },
  { id: "l06", tenant: "Sullivan & Cromwell LLP",   asset: "VTS Tower Headquarters", floor: "Floor 8",  suite: "0800",      sf: 20000,  baseRent: 93.14,  annualRent: 1862800,  additionalRentPsf: 27.10, grossRentPsf: 120.24, marketRentPsf: 110.00, renewalStatus: "Renewal option",  lastUpdate: "05/20/2026", lcd: "05/01/2019", lxd: "04/30/2029", executionDate: "03/12/2019", terminationDate: "04/30/2027", terminationType: "Tenant only",   rentReviewDate: "05/01/2024", tenantAct: "",                 passingRentYr: 1862800,  passingRentPsf: 93.14,  nextRent: 97.80,  term: 120, remaining: 32, leaseStatus: "In Place",   status: "Active",        type: "Direct",   options: ["Renewal Option", "Termination Option"] },
  { id: "l07", tenant: "Sullivan & Cromwell LLP",   asset: "VTS Tower Headquarters", floor: "Floor 7",  suite: "0700",      sf: 20000,  baseRent: 93.14,  annualRent: 1862800,  additionalRentPsf: 27.10, grossRentPsf: 120.24, marketRentPsf: 110.00, renewalStatus: "Renewal option",  lastUpdate: "05/20/2026", lcd: "05/01/2019", lxd: "04/30/2029", executionDate: "03/12/2019", terminationDate: "",           terminationType: "",              rentReviewDate: "05/01/2024", tenantAct: "",                 passingRentYr: 1862800,  passingRentPsf: 93.14,  nextRent: 97.80,  term: 120, remaining: 32, leaseStatus: "In Place",   status: "Active",        type: "Direct",   options: ["Renewal Option", "ROFR"] },
  { id: "l08", tenant: "Pacific Wealth Management", asset: "VTS Tower Headquarters", floor: "Floor 5",  suite: "0500",      sf: 20000,  baseRent: 89.60,  annualRent: 1792000,  additionalRentPsf: 25.50, grossRentPsf: 115.10, marketRentPsf: 106.00, renewalStatus: "Negotiating",     lastUpdate: "06/15/2026", lcd: "12/01/2021", lxd: "11/30/2028", executionDate: "10/08/2021", terminationDate: "",           terminationType: "",              rentReviewDate: "12/01/2024", tenantAct: "",                 passingRentYr: 1792000,  passingRentPsf: 89.60,  nextRent: 94.08,  term: 84,  remaining: 27, leaseStatus: "In Place",   status: "Active",        type: "Direct",   options: ["Renewal Option", "ROFO"] },
  { id: "l09", tenant: "Arthur & Brennan LLP",      asset: "VTS Tower Headquarters", floor: "Floor 4",  suite: "0400",      sf: 20000,  baseRent: 87.00,  annualRent: 1740000,  additionalRentPsf: 24.00, grossRentPsf: 111.00, marketRentPsf: 104.00, renewalStatus: "Renewal option",  lastUpdate: "04/30/2026", lcd: "01/01/2020", lxd: "12/31/2029", executionDate: "11/22/2019", terminationDate: "",           terminationType: "",              rentReviewDate: "01/01/2025", tenantAct: "",                 passingRentYr: 1740000,  passingRentPsf: 87.00,  nextRent: 91.35,  term: 120, remaining: 40, leaseStatus: "In Place",   status: "Active",        type: "Direct",   options: ["Renewal Option", "ROFO"] },
  { id: "l10", tenant: "Meridian Health Partners",  asset: "VTS Tower Headquarters", floor: "Floor 3",  suite: "0300",      sf: 12000,  baseRent: 85.50,  annualRent: 1026000,  additionalRentPsf: 23.20, grossRentPsf: 108.70, marketRentPsf: 102.00, renewalStatus: "Negotiating",     lastUpdate: "07/05/2026", lcd: "04/01/2018", lxd: "03/31/2028", executionDate: "02/14/2018", terminationDate: "",           terminationType: "",              rentReviewDate: "04/01/2023", tenantAct: "",                 passingRentYr: 1026000,  passingRentPsf: 85.50,  nextRent: 89.78,  term: 120, remaining: 19, leaseStatus: "In Place",   status: "Active",        type: "Direct",   options: ["Renewal Option", "Expansion Option"] },
  { id: "l11", tenant: "The Carlyle Group Inc.",    asset: "VTS Tower Headquarters", floor: "Floor 2",  suite: "0200",      sf: 20000,  baseRent: 91.00,  annualRent: 1820000,  additionalRentPsf: 26.00, grossRentPsf: 117.00, marketRentPsf: 108.00, renewalStatus: "Not renewing",    lastUpdate: "06/01/2026", lcd: "07/01/2018", lxd: "06/30/2028", executionDate: "05/10/2018", terminationDate: "06/30/2026", terminationType: "Mutual",        rentReviewDate: "07/01/2023", tenantAct: "",                 passingRentYr: 1820000,  passingRentPsf: 91.00,  nextRent: 0,      term: 120, remaining: 22, leaseStatus: "Subleased",  status: "Active",        type: "Sublease", options: ["Renewal Option", "Termination Option", "ROFR"] },
  { id: "l12", tenant: "CVS Health Corporation",    asset: "VTS Tower Headquarters", floor: "Floor 1",  suite: "0100",      sf: 5000,   baseRent: 72.00,  annualRent: 360000,   additionalRentPsf: 18.00, grossRentPsf: 90.00,  marketRentPsf: 85.00,  renewalStatus: "Renewal option",  salesR12: 2800000, ocr: 12.9, lastUpdate: "07/08/2026", lcd: "01/01/2018", lxd: "12/31/2027", executionDate: "11/15/2017", terminationDate: "",           terminationType: "",              rentReviewDate: "01/01/2023", tenantAct: "Retail Leases Act", passingRentYr: 360000,   passingRentPsf: 72.00,  nextRent: 75.60,  term: 120, remaining: 16, leaseStatus: "In Place",   status: "Expiring soon", type: "Direct",   options: ["Renewal Option"] },
  { id: "l13", tenant: "Pfizer",                    asset: "VTS Tower Headquarters", floor: "Floor 12", suite: "1200",      sf: 117000, baseRent: 78.00,  annualRent: 9126000,  additionalRentPsf: 22.00, grossRentPsf: 100.00, marketRentPsf: 112.00, renewalStatus: "Negotiating",     lastUpdate: "07/12/2026", lcd: "09/15/2016", lxd: "09/15/2026", executionDate: "07/20/2016", terminationDate: "",           terminationType: "",              rentReviewDate: "",           tenantAct: "",                 passingRentYr: 9126000,  passingRentPsf: 78.00,  nextRent: 0,      term: 120, remaining: 1,  leaseStatus: "In Place",   status: "Expiring soon", type: "Direct",   options: ["Renewal Option"] },
  { id: "l14", tenant: "Morgan Stanley",            asset: "VTS Tower Headquarters", floor: "Floors 8-11", suite: "0800-1100", sf: 116000, baseRent: 95.00, annualRent: 11020000, additionalRentPsf: 27.50, grossRentPsf: 122.50, marketRentPsf: 115.00, renewalStatus: "Negotiating",  lastUpdate: "07/14/2026", lcd: "11/01/2016", lxd: "11/01/2026", executionDate: "09/08/2016", terminationDate: "",           terminationType: "",              rentReviewDate: "",           tenantAct: "",                 passingRentYr: 11020000, passingRentPsf: 95.00,  nextRent: 0,      term: 120, remaining: 2,  leaseStatus: "In Place",   status: "Expiring soon", type: "Direct",   options: ["Renewal Option"] },
  { id: "l15", tenant: "Deloitte LLP",              asset: "VTS Tower Headquarters", floor: "Floor 5",  suite: "0500",      sf: 43000,  baseRent: 88.00,  annualRent: 3784000,  additionalRentPsf: 25.00, grossRentPsf: 113.00, marketRentPsf: 106.00, renewalStatus: "",                lastUpdate: "06/30/2026", lcd: "12/01/2026", lxd: "11/30/2036", executionDate: "04/22/2026", terminationDate: "",           terminationType: "",              rentReviewDate: "12/01/2031", tenantAct: "",                 passingRentYr: 3784000,  passingRentPsf: 88.00,  nextRent: 92.40,  term: 120, remaining: 123, leaseStatus: "Committed",  status: "Pending",      type: "Direct",   options: [] },
  { id: "l16", tenant: "KPMG",                      asset: "VTS Tower Headquarters", floor: "Floor 34", suite: "3400",      sf: 117000, baseRent: 92.00,  annualRent: 10764000, additionalRentPsf: 26.50, grossRentPsf: 118.50, marketRentPsf: 113.00, renewalStatus: "Not renewing",    lastUpdate: "07/02/2026", lcd: "01/31/2017", lxd: "01/31/2027", executionDate: "11/30/2016", terminationDate: "",           terminationType: "",              rentReviewDate: "01/31/2022", tenantAct: "",                 passingRentYr: 10764000, passingRentPsf: 92.00,  nextRent: 0,      term: 120, remaining: 5,  leaseStatus: "In Place",   status: "Active",        type: "Direct",   options: ["Renewal Option"] },
  { id: "l17", tenant: "Ernst & Young",             asset: "VTS Tower Headquarters", floor: "Floor 22", suite: "2200",      sf: 80100,  baseRent: 94.00,  annualRent: 7529400,  additionalRentPsf: 27.00, grossRentPsf: 121.00, marketRentPsf: 114.00, renewalStatus: "Renewal option",  lastUpdate: "06/20/2026", lcd: "03/01/2017", lxd: "03/01/2027", executionDate: "01/10/2017", terminationDate: "",           terminationType: "",              rentReviewDate: "03/01/2022", tenantAct: "",                 passingRentYr: 7529400,  passingRentPsf: 94.00,  nextRent: 98.70,  term: 120, remaining: 7,  leaseStatus: "In Place",   status: "Active",        type: "Direct",   options: ["Contraction Option"] },
  { id: "l18", tenant: "HSBC Holdings",             asset: "VTS Tower Headquarters", floor: "Floor 9",  suite: "0900",      sf: 69300,  baseRent: 85.00,  annualRent: 5890500,  additionalRentPsf: 24.00, grossRentPsf: 109.00, marketRentPsf: 108.00, renewalStatus: "Renewal option",  lastUpdate: "05/15/2026", lcd: "04/15/2017", lxd: "04/15/2030", executionDate: "02/28/2017", terminationDate: "",           terminationType: "",              rentReviewDate: "04/15/2022", tenantAct: "",                 passingRentYr: 5890500,  passingRentPsf: 85.00,  nextRent: 89.25,  term: 156, remaining: 44, leaseStatus: "In Place",   status: "Active",        type: "Direct",   options: ["ROFO"] },
  { id: "l19", tenant: "Latham & Watkins",          asset: "VTS Tower Headquarters", floor: "Floors 14-15", suite: "1400-1500", sf: 119000, baseRent: 98.00, annualRent: 11662000, additionalRentPsf: 28.00, grossRentPsf: 126.00, marketRentPsf: 116.00, renewalStatus: "Renewal option", lastUpdate: "06/10/2026", lcd: "05/01/2017", lxd: "05/01/2027", executionDate: "03/15/2017", terminationDate: "",          terminationType: "",              rentReviewDate: "05/01/2022", tenantAct: "",                 passingRentYr: 11662000, passingRentPsf: 98.00,  nextRent: 102.90, term: 120, remaining: 8,  leaseStatus: "In Place",   status: "Active",        type: "Direct",   options: ["Renewal Option"] },
  { id: "l20", tenant: "JPMorgan Chase",            asset: "VTS Tower Headquarters", floor: "Floor 6",  suite: "0600",      sf: 55800,  baseRent: 82.00,  annualRent: 4575600,  additionalRentPsf: 23.50, grossRentPsf: 105.50, marketRentPsf: 108.00, renewalStatus: "Renewal option",  lastUpdate: "07/09/2026", lcd: "06/30/2017", lxd: "06/30/2030", executionDate: "04/25/2017", terminationDate: "",           terminationType: "",              rentReviewDate: "06/30/2022", tenantAct: "",                 passingRentYr: 4575600,  passingRentPsf: 82.00,  nextRent: 86.10,  term: 156, remaining: 46, leaseStatus: "In Place",   status: "Active",        type: "Direct",   options: ["Expansion Option"] },
  { id: "l21", tenant: "Skadden Arps",              asset: "VTS Tower Headquarters", floor: "Floor 18", suite: "1800",      sf: 91200,  baseRent: 96.00,  annualRent: 8755200,  additionalRentPsf: 27.50, grossRentPsf: 123.50, marketRentPsf: 116.00, renewalStatus: "Renewal option",  lastUpdate: "04/22/2026", lcd: "10/01/2021", lxd: "09/30/2031", executionDate: "08/05/2021", terminationDate: "",           terminationType: "",              rentReviewDate: "10/01/2026", tenantAct: "",                 passingRentYr: 8755200,  passingRentPsf: 96.00,  nextRent: 100.80, term: 120, remaining: 61, leaseStatus: "In Place",   status: "Active",        type: "Direct",   options: [] },
  { id: "l22", tenant: "Citigroup",                 asset: "VTS Tower Headquarters", floor: "Floors 20-22", suite: "2000-2200", sf: 134000, baseRent: 91.00, annualRent: 12194000, additionalRentPsf: 26.00, grossRentPsf: 117.00, marketRentPsf: 112.00, renewalStatus: "Renewal option", lastUpdate: "07/06/2026", lcd: "03/31/2018", lxd: "03/31/2028", executionDate: "01/30/2018", terminationDate: "",          terminationType: "",              rentReviewDate: "03/31/2023", tenantAct: "",                 passingRentYr: 12194000, passingRentPsf: 91.00,  nextRent: 95.55,  term: 120, remaining: 19, leaseStatus: "In Place",   status: "Active",        type: "Direct",   options: ["Renewal Option"] },
  { id: "l23", tenant: "McKinsey & Co.",            asset: "VTS Tower Headquarters", floor: "Floor 29", suite: "2900",      sf: 48600,  baseRent: 99.00,  annualRent: 4811400,  additionalRentPsf: 28.50, grossRentPsf: 127.50, marketRentPsf: 118.00, renewalStatus: "Renewal option",  lastUpdate: "03/18/2026", lcd: "11/15/2021", lxd: "11/15/2031", executionDate: "09/20/2021", terminationDate: "",           terminationType: "",              rentReviewDate: "11/15/2026", tenantAct: "",                 passingRentYr: 4811400,  passingRentPsf: 99.00,  nextRent: 103.95, term: 120, remaining: 63, leaseStatus: "In Place",   status: "Active",        type: "Direct",   options: [] },
  { id: "l24", tenant: "Blackrock",                 asset: "VTS Tower Headquarters", floor: "Floor 30", suite: "3000",      sf: 52000,  baseRent: 97.00,  annualRent: 5044000,  additionalRentPsf: 28.00, grossRentPsf: 125.00, marketRentPsf: 118.00, renewalStatus: "Renewal option",  lastUpdate: "06/25/2026", lcd: "01/01/2022", lxd: "12/31/2031", executionDate: "10/28/2021", terminationDate: "",           terminationType: "",              rentReviewDate: "01/01/2027", tenantAct: "",                 passingRentYr: 5044000,  passingRentPsf: 97.00,  nextRent: 101.85, term: 120, remaining: 65, leaseStatus: "In Place",   status: "Active",        type: "Direct",   options: ["Renewal Option"] },
  { id: "l25", tenant: "Verizon Media",             asset: "VTS Tower Headquarters", floor: "Floor 25", suite: "2500",      sf: 44000,  baseRent: 88.00,  annualRent: 3872000,  additionalRentPsf: 25.00, grossRentPsf: 113.00, marketRentPsf: 106.00, renewalStatus: "Not renewing",    lastUpdate: "07/03/2026", lcd: "06/01/2019", lxd: "05/31/2027", executionDate: "04/10/2019", terminationDate: "",           terminationType: "",              rentReviewDate: "06/01/2024", tenantAct: "",                 passingRentYr: 3872000,  passingRentPsf: 88.00,  nextRent: 0,      term: 96,  remaining: 9,  leaseStatus: "In Place",   status: "Active",        type: "Direct",   options: [] },
  { id: "l26", tenant: "Goldman Sachs",             asset: "One Financial Plaza",    floor: "Floor 11", suite: "1100",      sf: 28000,  baseRent: 90.00,  annualRent: 2520000,  additionalRentPsf: 25.50, grossRentPsf: 115.50, marketRentPsf: 108.00, renewalStatus: "Renewal option",  lastUpdate: "05/30/2026", lcd: "03/01/2021", lxd: "02/28/2031", executionDate: "01/12/2021", terminationDate: "",           terminationType: "",              rentReviewDate: "03/01/2026", tenantAct: "",                 passingRentYr: 2520000,  passingRentPsf: 90.00,  nextRent: 94.50,  term: 120, remaining: 54, leaseStatus: "In Place",   status: "Active",        type: "Direct",   options: ["ROFO"] },
  { id: "l27", tenant: "Uber Technologies",         asset: "Salesforce Tower",       floor: "Floor 18", suite: "1800A",     sf: 28000,  baseRent: 98.00,  annualRent: 2744000,  additionalRentPsf: 28.00, grossRentPsf: 126.00, marketRentPsf: 116.00, renewalStatus: "Not renewing",    lastUpdate: "07/11/2026", lcd: "09/01/2022", lxd: "08/31/2027", executionDate: "07/15/2022", terminationDate: "",           terminationType: "",              rentReviewDate: "",           tenantAct: "",                 passingRentYr: 2744000,  passingRentPsf: 98.00,  nextRent: 0,      term: 60,  remaining: 12, leaseStatus: "In Place",   status: "Expiring soon", type: "Direct",   options: [] },
  ...(ADDITIONAL_LEASES as unknown as Lease[]),
]

// ── Column definitions ────────────────────────────────────────────────────────

interface ColDef {
  key: string
  label: string
  defaultVisible: boolean
  right?: boolean
  sortKey?: SortKey
  render: (l: Lease) => React.ReactNode
}

function fmtSf(n: number)    { return n.toLocaleString() + " sf" }
function fmtRentPsf(n: number) { return `$${n.toFixed(2)}/sf/yr` }
function fmtRentYr(n: number)  { return n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M/yr` : `$${(n / 1000).toFixed(0)}K/yr` }
function fmtPct(n: number)   { return `${n.toFixed(1)}%` }

const LEASE_STATUS_CLS: Record<Lease["leaseStatus"], string> = {
  "In Place":  "bg-success/15 text-success",
  "Committed": "bg-primary/15 text-primary",
  "Subleased": "bg-warning/15 text-warning",
  "Expired":   "bg-muted text-muted-foreground",
}

const ALL_COLS: ColDef[] = [
  { key: "leaseStatus", label: "Lease status", defaultVisible: true, render: l => (
      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", LEASE_STATUS_CLS[l.leaseStatus])}>
        {l.leaseStatus}
      </span>
    )
  },
  { key: "lcd",               label: "LCD",                         defaultVisible: true,  sortKey: "lcd",  render: l => <span className="text-muted-foreground">{l.lcd}</span> },
  { key: "lxd",               label: "LXD",                         defaultVisible: true,  sortKey: "lxd",  render: l => <span className="text-muted-foreground">{l.lxd}</span> },
  { key: "inPlaceBasePsf",    label: "In-place base rent/sf/yr",    defaultVisible: true,  right: true,  sortKey: "baseRent",     render: l => <span className="tabular-nums">{fmtRentPsf(l.baseRent)}</span> },
  { key: "inPlaceBaseYr",     label: "In-place base rent/yr",       defaultVisible: true,  right: true,  sortKey: "annualRent",   render: l => <span className="tabular-nums">{fmtRentYr(l.annualRent)}</span> },
  { key: "inPlaceAddlPsf",    label: "In-place additional rent/sf/yr", defaultVisible: true, right: true, render: l => <span className="tabular-nums">{fmtRentPsf(l.additionalRentPsf)}</span> },
  { key: "inPlaceGrossPsf",   label: "In-place gross rent/sf/yr",   defaultVisible: true,  right: true,  sortKey: "grossRentPsf", render: l => <span className="tabular-nums">{fmtRentPsf(l.grossRentPsf)}</span> },
  { key: "marketRentPsf",     label: "Market rent/sf/yr",           defaultVisible: false, right: true,  sortKey: "marketRentPsf",render: l => <span className="tabular-nums">{fmtRentPsf(l.marketRentPsf)}</span> },
  { key: "marketRentYr",      label: "Market rent/yr",              defaultVisible: false, right: true,  render: l => <span className="tabular-nums">{fmtRentYr(l.marketRentPsf * l.sf)}</span> },
  { key: "rentVsMarket",      label: "Rent vs. market",             defaultVisible: false, right: true,  render: l => {
      const diff = ((l.baseRent - l.marketRentPsf) / l.marketRentPsf) * 100
      return <span className={cn("tabular-nums font-medium", diff >= 0 ? "text-success" : "text-destructive")}>{diff > 0 ? "+" : ""}{diff.toFixed(1)}%</span>
    }
  },
  { key: "renewalStatus",     label: "Renewal status",              defaultVisible: false, render: l => l.renewalStatus ? <span className="text-muted-foreground">{l.renewalStatus}</span> : <span className="text-muted-foreground/40">—</span> },
  { key: "salesR12",          label: "Sales (R12)",                 defaultVisible: true,  right: true,  render: l => l.salesR12 != null ? <span className="tabular-nums">{fmtRentYr(l.salesR12)}</span> : <span className="text-muted-foreground/40">N/A</span> },
  { key: "ocr",               label: "Occupancy cost ratio",        defaultVisible: true,  right: true,  render: l => l.ocr != null ? <span className="tabular-nums">{fmtPct(l.ocr)}</span> : <span className="text-muted-foreground/40">N/A</span> },
  { key: "lastUpdate",        label: "Last update",                 defaultVisible: true,  sortKey: "lastUpdate", render: l => <span className="text-muted-foreground">{l.lastUpdate}</span> },
  { key: "executionDate",     label: "Execution date",              defaultVisible: false, render: l => <span className="text-muted-foreground">{l.executionDate || "—"}</span> },
  { key: "terminationDate",   label: "Termination date",            defaultVisible: false, render: l => l.terminationDate ? <span className="text-muted-foreground">{l.terminationDate}</span> : <span className="text-muted-foreground/40">—</span> },
  { key: "terminationType",   label: "Termination type",            defaultVisible: false, render: l => l.terminationType ? <span className="text-muted-foreground">{l.terminationType}</span> : <span className="text-muted-foreground/40">—</span> },
  { key: "rentReviewDate",    label: "Rent review date",            defaultVisible: false, render: l => l.rentReviewDate ? <span className="text-muted-foreground">{l.rentReviewDate}</span> : <span className="text-muted-foreground/40">—</span> },
  { key: "tenantAct",         label: "Tenant act",                  defaultVisible: false, render: l => l.tenantAct ? <span className="text-muted-foreground">{l.tenantAct}</span> : <span className="text-muted-foreground/40">—</span> },
  { key: "passingRentYr",     label: "Passing rent/yr",             defaultVisible: false, right: true,  render: l => <span className="tabular-nums">{fmtRentYr(l.passingRentYr)}</span> },
  { key: "passingRentPsf",    label: "Passing rent/sf/yr",          defaultVisible: false, right: true,  render: l => <span className="tabular-nums">{fmtRentPsf(l.passingRentPsf)}</span> },
  { key: "nextRent",          label: "Next rent",                   defaultVisible: false, right: true,  render: l => l.nextRent > 0 ? <span className="tabular-nums">{fmtRentPsf(l.nextRent)}</span> : <span className="text-muted-foreground/40">—</span> },
]

// ── Helpers ───────────────────────────────────────────────────────────────────


// ── Column manager ────────────────────────────────────────────────────────────

function ColumnManager({
  columns, visible, order, onToggle, onReorder,
}: {
  columns: ColDef[]
  visible: Set<string>
  order: string[]
  onToggle: (key: string) => void
  onReorder: (next: string[]) => void
}) {
  const [dragging, setDragging] = React.useState<string | null>(null)
  const [dragOver, setDragOver] = React.useState<string | null>(null)

  const colMap = Object.fromEntries(columns.map(c => [c.key, c]))
  const manageable = order.filter(k => colMap[k])

  function onDragStart(k: string) { setDragging(k) }
  function onDragEnd() { setDragging(null); setDragOver(null) }
  function onDropItem(targetKey: string) {
    if (!dragging || dragging === targetKey) return
    const next = [...order]
    const from = next.indexOf(dragging)
    const to   = next.indexOf(targetKey)
    next.splice(from, 1)
    next.splice(to, 0, dragging)
    onReorder(next)
    setDragging(null); setDragOver(null)
  }

  return (
    <Popover>
      <PopoverTrigger className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-primary text-primary text-xs font-medium bg-transparent hover:bg-primary/10 transition-colors">
        <Settings2 className="h-3.5 w-3.5" />
        Columns
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <p className="text-xs font-medium text-muted-foreground px-2 pb-2">Drag to reorder</p>
        <div className="flex flex-col gap-0.5">
          {manageable.map(k => {
            const col = colMap[k]
            const isVisible = visible.has(k)
            return (
              <div
                key={k}
                draggable
                onDragStart={() => onDragStart(k)}
                onDragEnd={onDragEnd}
                onDragOver={e => { e.preventDefault(); setDragOver(k) }}
                onDrop={() => onDropItem(k)}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-grab active:cursor-grabbing select-none",
                  dragOver === k && dragging !== k ? "bg-primary/10" : "hover:bg-muted/60"
                )}
              >
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                <span className="flex-1 text-sm text-foreground">{col.label}</span>
                <button onClick={() => onToggle(k)} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
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

// ── Filter / sort setup ───────────────────────────────────────────────────────

const UNIQUE_ASSETS = Array.from(new Set(LEASES.map(l => l.asset)))

const FILTER_DEFS = [
  { key: "leaseStatus", label: "Lease status", options: (["In Place", "Committed", "Subleased", "Expired"] as Lease["leaseStatus"][]).map(v => ({ label: v, value: v })) },
  { key: "type",        label: "Asset type",   options: (["Direct", "Sublease"] as Lease["type"][]).map(v => ({ label: v, value: v })) },
  { key: "asset",       label: "Asset",        options: UNIQUE_ASSETS.map(v => ({ label: v, value: v })) },
]

// ── Main component ────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

export function LeasesPage({ onLeaseClick, assetContext, allowedAssets }: { onLeaseClick?: (l: Lease) => void; assetContext?: string; allowedAssets?: string[] }) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const { sortKey, sortDir, handleSort: _handleSort } = useSortState<SortKey>("tenant")
  const [search, setSearch] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({})
  const [page, setPage] = React.useState(1)
  const [visibleCols, setVisibleCols] = React.useState<Set<string>>(
    () => new Set(ALL_COLS.filter(c => c.defaultVisible).map(c => c.key))
  )
  const [colOrder, setColOrder] = React.useState<string[]>(() => ALL_COLS.map(c => c.key))

  function handleSort(key: SortKey) { _handleSort(key); setPage(1) }
  function onToggle(key: string, value: string) { setActiveFilters(prev => toggleFilterValue(prev, key, value)); setPage(1) }
  function onClear(key: string) { setActiveFilters(prev => clearFilterKey(prev, key)); setPage(1) }
  function onClearAll() { setActiveFilters({}); setPage(1) }

  function toggleCol(key: string) {
    setVisibleCols(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const colMap = Object.fromEntries(ALL_COLS.map(c => [c.key, c]))
  const activeCols = colOrder.filter(k => visibleCols.has(k)).map(k => colMap[k]).filter(Boolean)

  const filterDefs = React.useMemo(() => {
    if (assetContext) return FILTER_DEFS.filter(f => f.key !== "asset")
    if (allowedAssets) return FILTER_DEFS.map(f => f.key === "asset" ? { ...f, options: allowedAssets.map(v => ({ label: v, value: v })) } : f)
    return FILTER_DEFS
  }, [assetContext, allowedAssets])

  const filtered = React.useMemo(() => {
    let r = assetContext ? LEASES.filter(l => l.asset === assetContext) : [...LEASES]
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(l => l.tenant.toLowerCase().includes(q) || l.asset.toLowerCase().includes(q) || l.suite.toLowerCase().includes(q))
    }
    for (const [key, values] of Object.entries(activeFilters)) {
      if (!values.length) continue
      r = r.filter(l => values.includes(String(l[key as keyof Lease])))
    }
    r.sort((a, b) => {
      let av: string | number
      let bv: string | number
      if (["sf","baseRent","annualRent","remaining","term","marketRentPsf","grossRentPsf"].includes(sortKey)) {
        av = a[sortKey as keyof Lease] as number; bv = b[sortKey as keyof Lease] as number
      } else {
        av = (a[sortKey as keyof Lease] as string).toLowerCase()
        bv = (b[sortKey as keyof Lease] as string).toLowerCase()
      }
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === "asc" ? cmp : -cmp
    })
    return r
  }, [search, activeFilters, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const scopedLeases = assetContext ? LEASES.filter(l => l.asset === assetContext) : LEASES
  const totalLeases  = scopedLeases.length
  const leasedSf     = scopedLeases.filter(l => l.status !== "Expired").reduce((a, l) => a + l.sf, 0)
  const activeLeases = scopedLeases.filter(l => l.status === "Active" || l.status === "Expiring soon")
  const avgBaseRent  = activeLeases.reduce((a, l) => a + l.baseRent * l.sf, 0) / (activeLeases.reduce((a, l) => a + l.sf, 0) || 1)
  const expiring12mo = scopedLeases.filter(l => l.remaining > 0 && l.remaining <= 12).length

  const kpis = [
    { label: "Total leases",    value: String(totalLeases) },
    { label: "Leased SF",       value: fmtSf(leasedSf) },
    { label: "Avg base rent",   value: `$${avgBaseRent.toFixed(2)}/sf` },
    { label: "Expiring (12mo)", value: String(expiring12mo), trend: expiring12mo > 0 ? "down" as const : undefined },
  ]

  const allOnPage = paginated.length > 0 && paginated.every(l => selected.has(l.id))
  function toggleAll() {
    setSelected(prev => {
      const next = new Set(prev)
      if (allOnPage) { paginated.forEach(l => next.delete(l.id)) }
      else { paginated.forEach(l => next.add(l.id)) }
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

  const totalCols = 4 + activeCols.length + 1 + 1 // fixed + active + agent btn + checkbox

  return (
    <div className="space-y-4">
      <KpiBar kpis={kpis} />

      <div className={cardBase}>
        {/* Selection bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setSelected(new Set())} className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors">
              <span>{selected.size} selected</span>
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <Button size="sm" variant="outline" className="h-8 text-xs">Export</Button>
            <Button size="sm" variant="outline" className="h-8 text-xs">Archive</Button>
          </div>
        )}

        <div className={cn("flex flex-wrap items-center gap-2 mb-4", selected.size > 0 && "hidden")}>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leases…" className="pl-8 h-8 text-sm w-44" />
          </div>
          <FilterBar filters={filterDefs} active={activeFilters} onToggle={onToggle} onClear={onClear} onClearAll={onClearAll} visibleCount={3} />
          <div className="ml-auto flex items-center gap-2">
            <ColumnManager columns={ALL_COLS} visible={visibleCols} order={colOrder} onToggle={toggleCol} onReorder={setColOrder} />
            <Button size="sm" className="h-8 gap-1.5 text-sm"><Plus className="h-3.5 w-3.5" />Add lease</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="border-collapse">
            <TableHeader>
              <TableRow className="border-b-2 border-border/60 hover:bg-transparent">
                <th className="pb-2 pt-0 w-8 pr-2 text-left">
                  <Checkbox checked={allOnPage} onCheckedChange={toggleAll} className="h-3.5 w-3.5" />
                </th>
                <SortableHead col="tenant" sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Tenant</SortableHead>
                <SortableHead col="asset"  sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Asset</SortableHead>
                <SortableHead col="suite"  sortKey={sortKey} sortDir={sortDir} onSort={handleSort}>Spaces</SortableHead>
                <SortableHead col="sf"     sortKey={sortKey} sortDir={sortDir} onSort={handleSort} right>Total lease size</SortableHead>
                {activeCols.map(col => (
                  col.sortKey
                    ? <SortableHead key={col.key} col={col.sortKey} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} right={col.right}>{col.label}</SortableHead>
                    : <TableHead key={col.key} className={cn("pb-2 pt-0 text-[10px] font-medium uppercase tracking-widest text-foreground/50 whitespace-nowrap", col.right && "text-right")}>{col.label}</TableHead>
                ))}
                <TableHead className="pb-2 pt-0 w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={totalCols} className="py-10 text-center text-sm text-muted-foreground">No leases match your filters.</TableCell>
                </TableRow>
              )}
              {paginated.map((l, i) => (
                <TableRow
                  key={l.id}
                  className={cn("transition-colors", onLeaseClick ? "cursor-pointer hover:bg-muted/60" : "hover:bg-muted/40", i > 0 ? "border-t border-border/40" : "border-0", l.status === "Expired" && "opacity-60", selected.has(l.id) && "bg-primary/5")}
                  onClick={() => onLeaseClick?.(l)}
                >
                  <td className="py-3 pr-2 w-8" onClick={e => e.stopPropagation()}>
                    <Checkbox checked={selected.has(l.id)} onCheckedChange={() => toggleRow(l.id)} className="h-3.5 w-3.5" />
                  </td>
                  <TableCell className="py-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <TenantAvatar name={l.tenant} />
                      <span className="text-sm font-medium text-foreground">{l.tenant}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 text-sm text-muted-foreground whitespace-nowrap">{l.asset}</TableCell>
                  <TableCell className="py-2.5 text-sm text-foreground whitespace-nowrap">{l.suite}</TableCell>
                  <TableCell className="py-2.5 text-right text-sm font-medium text-foreground whitespace-nowrap tabular-nums">{l.sf.toLocaleString()}</TableCell>
                  {activeCols.map(col => (
                    <TableCell key={col.key} className={cn("py-2.5 text-sm whitespace-nowrap", col.right && "text-right")}>
                      {col.render(l)}
                    </TableCell>
                  ))}
                  <TableCell className="py-2.5 pl-2">
                    <AgentBtn entity="Lease" label={`${l.tenant} · ${l.suite} · ${l.sf.toLocaleString()} sf · $${l.baseRent}/sf · expires ${l.lxd} · ${l.status}`} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
          <span className="text-xs text-muted-foreground">
            {filtered.length === 0 ? "0 leases" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <Button key={p} variant={p === page ? "default" : "outline"} size="sm" className="h-7 w-7 p-0 text-xs" onClick={() => setPage(p)}>{p}</Button>
            ))}
            <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </div>
    </div>
  )
}
