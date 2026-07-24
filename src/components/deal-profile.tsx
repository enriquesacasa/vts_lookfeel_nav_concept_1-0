import * as React from "react"
import { ChevronRight, Handshake } from "lucide-react"
import type { Deal } from "@/components/deals-page"

export const TENANT_LOGO: Record<string, string> = {
  "Starbucks Corporation": "/vts_lookfeel_nav_concept_1-0/logos/starbucks.png",
  "Pfizer Inc.":           "/vts_lookfeel_nav_concept_1-0/logos/pfizer.png",
  "Morgan Stanley":        "/vts_lookfeel_nav_concept_1-0/logos/morganstanley.png",
  "Deloitte LLP":          "/vts_lookfeel_nav_concept_1-0/logos/deloitte.png",
  "KPMG":                  "/vts_lookfeel_nav_concept_1-0/logos/kpmg.png",
  "Ernst & Young":         "/vts_lookfeel_nav_concept_1-0/logos/ey.png",
  "HSBC Holdings":         "/vts_lookfeel_nav_concept_1-0/logos/hsbc.png",
  "Latham & Watkins":      "/vts_lookfeel_nav_concept_1-0/logos/lw.png",
  "JPMorgan Chase":        "/vts_lookfeel_nav_concept_1-0/logos/jpmorgan.png",
  "Amazon.com":            "/vts_lookfeel_nav_concept_1-0/logos/amazon.png",
  "WeWork":                "/vts_lookfeel_nav_concept_1-0/logos/wework.png",
  "Google LLC":            "/vts_lookfeel_nav_concept_1-0/logos/google.png",
  "Tesla Inc.":            "/vts_lookfeel_nav_concept_1-0/logos/tesla.png",
  "Cisco Systems":         "/vts_lookfeel_nav_concept_1-0/logos/cisco.png",
  "Salesforce Inc.":       "/vts_lookfeel_nav_concept_1-0/logos/salesforce.png",
  "BlackRock":             "/vts_lookfeel_nav_concept_1-0/logos/blackrock.png",
  "Goldman Sachs":         "/vts_lookfeel_nav_concept_1-0/logos/goldmansachs.png",
  "McKinsey & Co.":        "/vts_lookfeel_nav_concept_1-0/logos/mckinsey.png",
  "Spotify":               "/vts_lookfeel_nav_concept_1-0/logos/spotify.png",
  "Airbnb":                "/vts_lookfeel_nav_concept_1-0/logos/airbnb.png",
  "Stripe":                "/vts_lookfeel_nav_concept_1-0/logos/stripe.png",
  "Twitter/X":             "/vts_lookfeel_nav_concept_1-0/logos/x.png",
  "Uber Technologies":     "/vts_lookfeel_nav_concept_1-0/logos/uber.png",
  "Microsoft":             "/vts_lookfeel_nav_concept_1-0/logos/microsoft.png",
  "Meta Platforms":        "/vts_lookfeel_nav_concept_1-0/logos/meta.png",
}

export function TenantLogoImage({ name }: { name: string }) {
  const [failed, setFailed] = React.useState(false)
  const src = TENANT_LOGO[name]
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
  const hue = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360

  if (src && !failed) {
    return (
      <div className="h-full w-full bg-white flex items-center justify-center p-2">
        <img src={src} alt={name} className="max-h-full max-w-full object-contain" onError={() => setFailed(true)} />
      </div>
    )
  }
  return (
    <div className="h-full w-full flex items-center justify-center text-white font-semibold text-lg" style={{ background: `hsl(${hue} 60% 45%)` }}>
      {initials}
    </div>
  )
}

interface DealProfileProps {
  deal: Deal
  onBack: () => void
  variant?: "v1" | "v2"
}

export function DealProfile({ deal, onBack, variant = "v1" }: DealProfileProps) {
  const breadcrumb = (
    <nav className="inline-flex items-center gap-1 text-xs text-muted-foreground mb-4">
      <button onClick={onBack} className="hover:text-foreground transition-colors">Deals</button>
      <ChevronRight className="h-3 w-3 shrink-0" />
      <span className="text-foreground font-medium">{deal.tenant}</span>
    </nav>
  )

  const iconAndContent = (
    <>
      <div className="rounded-full bg-secondary p-3 flex items-center justify-center mb-5">
        <Handshake className="w-6 h-6 text-primary opacity-60" />
      </div>
      <h1 className="text-2xl font-medium text-foreground mb-2">Deal profile</h1>
      <p className="text-sm text-muted-foreground max-w-xs">This page is a placeholder. Content coming soon.</p>
    </>
  )

  if (variant === "v2") {
    return (
      <div className="flex flex-col min-h-[40vh] text-center px-4">
        {breadcrumb}
        <div className="flex flex-col items-center justify-center flex-1">
          {iconAndContent}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col rounded-2xl bg-white/70 dark:bg-white/8 backdrop-blur-md mt-4 p-4" style={{ minHeight: "calc(100vh - 12rem)" }}>
      {breadcrumb}
      <div className="flex flex-col items-center justify-center flex-1 text-center">
        {iconAndContent}
      </div>
    </div>
  )
}
