import * as React from "react"
import { TENANT_DOMAIN } from "@/lib/tenant-data"

const BASE = "/vts_lookfeel_nav_concept_1-0/logos/"

export const TENANT_LOGO: Record<string, string> = {
  // Stacking plan tenants
  "Blackstone Inc.":               `${BASE}blackstone.png`,
  "Amazon.com Inc.":               `${BASE}amazon.png`,
  "Sullivan & Cromwell LLP":       `${BASE}sullcrom.png`,
  // Stacking plan raw display names (used by options & rights rows)
  "Blackstone Group":              `${BASE}blackstone.png`,
  "Amazon MGM Studios":            `${BASE}amazon.png`,
  "Sullivan & Cromwell":           `${BASE}sullcrom.png`,
  // Critical dates / options tenants
  "Pfizer":                        `${BASE}pfizer.png`,
  "Pfizer Inc.":                   `${BASE}pfizer.png`,
  "Morgan Stanley":                `${BASE}morganstanley.png`,
  "Deloitte LLP":                  `${BASE}deloitte.png`,
  "JPMorgan Chase":                `${BASE}jpmorgan.png`,
  "McKinsey & Co.":                `${BASE}mckinsey.png`,
  "Citigroup":                     `${BASE}citi.png`,
  "Blackrock":                     `${BASE}blackrock.png`,
  "BlackRock":                     `${BASE}blackrock.png`,
  // One Financial Plaza tenants
  "Fidelity Investments":          `${BASE}fidelity.png`,
  "Fidelity":                      `${BASE}fidelity.png`,
  "State Street":                  `${BASE}statestreet.png`,
  "State Street Corp":             `${BASE}statestreet.png`,
  "Liberty Mutual":                `${BASE}libertymutual.png`,
  "Liberty Mutual (Berk)":         `${BASE}libertymutual.png`,
  "MFS Investment Management":     `${BASE}mfs.png`,
  "MFS Investment Mgmt":           `${BASE}mfs.png`,
  "Putnam Investments":            `${BASE}putnam.png`,
  "Putnam":                        `${BASE}putnam.png`,
  "Wellington Management":         `${BASE}wellington.png`,
  "Wellington":                    `${BASE}wellington.png`,
  "Wellington Mgmt":               `${BASE}wellington.png`,
  "John Hancock":                  `${BASE}johnhancock.png`,
  "Nuveen":                        `${BASE}nuveen.png`,
  "Acadian Asset Management":      `${BASE}acadian.png`,
  "Acadian Asset Mgmt":            `${BASE}acadian.png`,
  "Acadian":                       `${BASE}acadian.png`,
  // Salesforce Tower tenants
  "Adobe":                         `${BASE}adobe.png`,
  "Adobe Systems":                 `${BASE}adobe.png`,
  "Cloudflare":                    `${BASE}cloudflare.png`,
  "Cloudflare (WTC)":              `${BASE}cloudflare.png`,
  "Lyft":                          `${BASE}lyft.png`,
  "OpenAI":                        `${BASE}openai.png`,
  "Snap":                          `${BASE}snap.png`,
  "Snap Inc.":                     `${BASE}snap.png`,
  "Databricks":                    `${BASE}databricks.png`,
  // Empire State Building tenants
  "Marsh & McLennan":              `${BASE}marsh.png`,
  "PwC":                           `${BASE}pwc.png`,
  "Citi":                          `${BASE}citi.png`,
  "Citi Private Bank":             `${BASE}citi.png`,
  "L'Oreal USA":                   `${BASE}loreal.png`,
  "PVH Corp":                      `${BASE}pvh.png`,
  "Accenture":                     `${BASE}accenture.png`,
  "Conde Nast":                    `${BASE}condenast.png`,
  "Conde Nast (WTC)":              `${BASE}condenast.png`,
  // Willis Tower tenants
  "Grainger":                      `${BASE}grainger.png`,
  "Exelon":                        `${BASE}exelon.png`,
  "Aon":                           `${BASE}aon.png`,
  "Aon plc":                       `${BASE}aon.png`,
  "United Airlines":               `${BASE}united.png`,
  "Kraft Heinz":                   `${BASE}kraftheinz.png`,
  "Abbott":                        `${BASE}abbott.png`,
  "Abbott Laboratories":           `${BASE}abbott.png`,
  "Tableau":                       `${BASE}tableau.png`,
  "Tableau Software":              `${BASE}tableau.png`,
  "Notion Labs":                   `${BASE}notion.png`,
  "Notion":                        `${BASE}notion.png`,
  // 30 Hudson Yards tenants
  "Wells Fargo":                   `${BASE}wellsfargo.png`,
  "Deutsche Bank":                 `${BASE}deutschebank.png`,
  "KKR":                           `${BASE}kkr.png`,
  "KKR & Co.":                     `${BASE}kkr.png`,
  "Apollo":                        `${BASE}apollo.png`,
  "Apollo Global Management":      `${BASE}apollo.png`,
  "Apollo Global Mgmt":            `${BASE}apollo.png`,
  // One WTC tenants
  "American Express":              `${BASE}amex.png`,
  "Spotify":                       `${BASE}spotify.png`,
  "Spotify (WTC)":                 `${BASE}spotify.png`,
  "LinkedIn":                      `${BASE}linkedin.png`,
  "AWS":                           `${BASE}amazon.png`,
  "Amazon Web Services":           `${BASE}amazon.png`,
  "ByteDance":                     `${BASE}bytedance.png`,
  // Transamerica Pyramid tenants
  "Charles Schwab":                `${BASE}schwab.png`,
  "Gap":                           `${BASE}gap.png`,
  "Gap Inc.":                      `${BASE}gap.png`,
  "DocuSign":                      `${BASE}docusign.png`,
  "Ripple":                        `${BASE}ripple.png`,
  "Ripple Labs":                   `${BASE}ripple.png`,
  "Levi Strauss":                  `${BASE}levi.png`,
  "First Republic":                `${BASE}firstrepublic.png`,
  "Dropbox":                       `${BASE}dropbox.png`,
  "Dropbox Inc.":                  `${BASE}dropbox.png`,
  "Twitter/X":                     `${BASE}x.png`,
  "Twitter/X (Pyramid)":           `${BASE}x.png`,
  // 200 Berkeley tenants
  "Biogen":                        `${BASE}biogen.png`,
  "DraftKings":                    `${BASE}draftkings.png`,
  "Morningstar":                   `${BASE}morningstar.png`,
  "Morningstar Inc.":              `${BASE}morningstar.png`,
  "Rapid7":                        `${BASE}rapid7.png`,
  "Vertex Pharma":                 `${BASE}vertexpharma.png`,
  "Vertex Pharmaceuticals":        `${BASE}vertexpharma.png`,
  "Wayfair":                       `${BASE}wayfair.png`,
  "Wayfair Inc.":                  `${BASE}wayfair.png`,
  // One Peachtree Center tenants
  "Cox":                           `${BASE}cox.png`,
  "Cox Enterprises":               `${BASE}cox.png`,
  "Truist":                        `${BASE}truist.png`,
  "Truist Financial":              `${BASE}truist.png`,
  "Invesco":                       `${BASE}invesco.png`,
  "Equifax":                       `${BASE}equifax.png`,
  "Delta":                         `${BASE}delta.png`,
  "Delta Air Lines":               `${BASE}delta.png`,
  "GE Digital":                    `${BASE}ge.png`,
  "NCR":                           `${BASE}ncr.png`,
  "NCR Corporation":               `${BASE}ncr.png`,
  // Two Union Square tenants
  "Nordstrom":                     `${BASE}nordstrom.png`,
  "Weyerhaeuser":                  `${BASE}weyerhaeuser.png`,
  "F5":                            `${BASE}f5.png`,
  "F5 Networks":                   `${BASE}f5.png`,
  "Alaska Airlines":               `${BASE}alaska-airlines.png`,
  "Expeditors":                    `${BASE}expeditors.png`,
  "Expeditors International":      `${BASE}expeditors.png`,
  "Expeditors Intl":               `${BASE}expeditors.png`,
  "T-Mobile":                      `${BASE}tmobile.png`,
  "REI":                           `${BASE}rei.png`,
  "REI Co-op":                     `${BASE}rei.png`,
  // Law firms
  "Latham & Watkins":              `${BASE}lw.png`,
  "Skadden Arps":                  `${BASE}skadden.png`,
  "Hogan Lovells":                 `${BASE}hoganlovells.png`,
  // Audit/consulting
  "KPMG":                          `${BASE}kpmg.png`,
  "Ernst & Young":                 `${BASE}ey.png`,
  // Financial / insurance
  "HSBC Holdings":                 `${BASE}hsbc.png`,
  "HSBC":                          `${BASE}hsbc.png`,
  "Stripe":                        `${BASE}stripe.png`,
  "Microsoft":                     `${BASE}microsoft.png`,
  "Cisco Systems":                 `${BASE}cisco.png`,
  // Other deals page tenants
  "Goldman Sachs":                 `${BASE}goldmansachs.png`,
  "Uber Technologies":             `${BASE}uber.png`,
  "Uber Technologies Inc.":        `${BASE}uber.png`,
  "Amazon.com":                    `${BASE}amazon.png`,
  "Starbucks Corporation":         `${BASE}starbucks.png`,
  "WeWork":                        `${BASE}wework.png`,
  "Google LLC":                    `${BASE}google.png`,
  "Tesla Inc.":                    `${BASE}tesla.png`,
  "Salesforce Inc.":               `${BASE}salesforce.png`,
  "Meta":                          `${BASE}meta.png`,
  "Meta Platforms":                `${BASE}meta.png`,
  "Airbnb":                        `${BASE}airbnb.png`,
  "Norfolk Southern":              `${BASE}norfolksouthern.png`,
  "Palantir Technologies":         `${BASE}palantir.png`,
  "Palantir":                      `${BASE}palantir.png`,
  "Workday Inc.":                  `${BASE}workday.png`,
  "Workday":                       `${BASE}workday.png`,
}

export function TenantAvatar({ name }: { name: string }) {
  const domain = TENANT_DOMAIN[name]
  const brandfetchSrc = domain ? `https://cdn.brandfetch.io/${domain}/w/128/h/128` : null
  const localSrc = TENANT_LOGO[name] || null
  const sources = [brandfetchSrc, localSrc].filter(Boolean) as string[]
  const [srcIdx, setSrcIdx] = React.useState(0)
  const src = sources[srcIdx] ?? null
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

  const handleError = () => {
    if (srcIdx < sources.length - 1) setSrcIdx(i => i + 1)
    else setSrcIdx(sources.length)
  }

  if (src) {
    return (
      <img src={src} alt={name} onError={handleError}
        className="h-7 w-7 rounded-full object-contain bg-background ring-1 ring-border/30 shrink-0" />
    )
  }
  return (
    <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-medium text-primary-foreground shrink-0 ring-1 ring-border/30 bg-primary/80">
      {initials}
    </div>
  )
}
