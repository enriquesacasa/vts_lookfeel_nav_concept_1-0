import * as React from "react"

const BASE = "/vts_lookfeel_nav_concept_1-0/logos/"

export const TENANT_LOGO: Record<string, string> = {
  // Stacking plan tenants
  "Blackstone Inc.":               `${BASE}blackrock.png`,
  "Vantage Point Capital LP":      `${BASE}salesforce.png`,
  "Amazon.com Inc.":               `${BASE}amazon.png`,
  "Sullivan & Cromwell LLP":       `${BASE}lw.png`,
  "Pacific Wealth Management LLC": `${BASE}stripe.png`,
  "Arthur & Brennan LLP":          `${BASE}lw.png`,
  "Meridian Health Partners Inc.": `${BASE}pfizer.png`,
  "The Carlyle Group Inc.":        `${BASE}goldmansachs.png`,
  "CVS Health Corporation":        `${BASE}pfizer.png`,
  // Stacking plan raw display names (used by options & rights rows)
  "Blackstone Group":              `${BASE}blackrock.png`,
  "Vantage Point Capital":         `${BASE}salesforce.png`,
  "Amazon MGM Studios":            `${BASE}amazon.png`,
  "Sullivan & Cromwell":           `${BASE}lw.png`,
  "Pacific Wealth Mngt.":          `${BASE}stripe.png`,
  "Meridian Health Partners":      `${BASE}pfizer.png`,
  "Carlyle & Associates":          `${BASE}goldmansachs.png`,
  "CVS Health":                    `${BASE}pfizer.png`,
  // Critical dates / options tenants
  "Pfizer":                        `${BASE}pfizer.png`,
  "Morgan Stanley":                `${BASE}morganstanley.png`,
  "Deloitte LLP":                  `${BASE}deloitte.png`,
  "KPMG":                          `${BASE}kpmg.png`,
  "Ernst & Young":                 `${BASE}ey.png`,
  "HSBC Holdings":                 `${BASE}hsbc.png`,
  "Latham & Watkins":              `${BASE}lw.png`,
  "JPMorgan Chase":                `${BASE}jpmorgan.png`,
  "Skadden Arps":                  `${BASE}lw.png`,
  "McKinsey & Co.":                `${BASE}mckinsey.png`,
  "Citigroup":                     `${BASE}stripe.png`,
  "Verizon Media":                 `${BASE}microsoft.png`,
  "Blackrock":                     `${BASE}blackrock.png`,
  // Other assets
  "Goldman Sachs":                 `${BASE}goldmansachs.png`,
  "Uber Technologies":             `${BASE}uber.png`,
}

export function TenantAvatar({ name }: { name: string }) {
  const [failed, setFailed] = React.useState(false)
  const src = TENANT_LOGO[name]
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
  if (src && !failed) {
    return (
      <img src={src} alt={name} onError={() => setFailed(true)}
        className="h-7 w-7 rounded-full object-contain bg-background ring-1 ring-border/30 shrink-0" />
    )
  }
  return (
    <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-medium text-primary-foreground shrink-0 ring-1 ring-border/30 bg-primary/80">
      {initials}
    </div>
  )
}
