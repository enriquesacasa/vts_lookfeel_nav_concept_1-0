import * as React from "react"
import { cn } from "@/lib/utils"
import { Sun, Moon, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// ── Data ──────────────────────────────────────────────────────────────────────

const SECTIONS = [
  {
    kicker: "01 · Balance",
    title: "Where users lead, where agents lead, and where they work together",
    description: "The most effective AI experiences do not replace human judgment. They sharpen it. The interface should make the balance between user-led and agent-led action feel natural, not forced.",
    layout: "two" as const,
    cards: [
      {
        title: "Assess",
        body: "Sometimes the user evaluates and makes the call. Sometimes the agent surfaces what matters. Often, it is a combination of both.",
      },
      {
        title: "Act",
        body: "Some work should happen automatically. Some recommended by agents. Some should stay with the user. The experience should make that balance feel natural.",
      },
    ],
  },
  {
    kicker: "02 · Role",
    title: "Agents can assist decisions, automate work, and accelerate outcomes",
    description: "Not every agent interaction looks the same. Understanding the mode helps the interface communicate what is happening and set the right expectations.",
    layout: "three" as const,
    cards: [
      {
        title: "Assist",
        body: "Agents work alongside users to guide complex workflows and decisions, surfacing contextual intelligence and insights in real time.",
      },
      {
        title: "Automate",
        body: "Streamline and eliminate manual and repetitive coordination, routing, data entry, and other tasks.",
      },
      {
        title: "Accelerate",
        body: "Drastically speed up analysis, multi-step reviews, and decision making so teams can move faster.",
      },
    ],
  },
  {
    kicker: "03 · Foundation",
    title: "The core of VTS",
    description: "Agents are only as good as the foundation beneath them. Data, insights, and workflows are the three pillars that make agent actions meaningful, accurate, and trustworthy.",
    layout: "three" as const,
    cards: [
      {
        title: "Data",
        body: "A shared record of the property, the tenant, and the market around it.",
      },
      {
        title: "Insights",
        body: "The context behind what is happening. What changed, what matters, and where attention is needed.",
      },
      {
        title: "Workflows",
        body: "The work that moves things forward, from first inquiry through negotiation and execution.",
      },
    ],
  },
]

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ kicker, title, description }: { kicker: string; title: string; description?: string }) {
  return (
    <div className="mb-10">
      <p className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.07em] text-primary mb-3.5">{kicker}</p>
      <h2 className="text-[33px] font-semibold tracking-[-0.015em] text-foreground mb-3 leading-snug">{title}</h2>
      {description && <p className="text-base text-muted-foreground leading-relaxed max-w-[680px]">{description}</p>}
    </div>
  )
}

function PrincipleCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="p-6">
        <p className="text-base font-semibold text-foreground mb-2">{title}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface AgentPrinciplesProps {
  isDark: boolean
  onToggleDark: () => void
}

export function AgentPrinciples({ isDark, onToggleDark }: AgentPrinciplesProps) {
  const [logoOpen, setLogoOpen] = React.useState(false)

  return (
    <>
      <div className={cn(
        "fixed inset-0 -z-10",
        isDark ? "bg-[oklch(0.08_0.002_258)]" : "bg-[oklch(0.99_0.01_275)]"
      )} />
      <div className="max-w-6xl mx-auto pt-10 pb-[72px] px-4 space-y-[72px]">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div className="pb-[72px] border-b border-border">
          <div className="flex items-start justify-between mb-6">
            <Popover open={logoOpen} onOpenChange={setLogoOpen}>
              <PopoverTrigger>
                <button className="cursor-pointer focus:outline-none" aria-label="Open settings">
                  <svg width="555" height="160" viewBox="0 0 555 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto text-foreground hover:opacity-80 transition-opacity">
                    <path d="M262.948 37.923L282.271 99.5913L301.591 37.923H321.723L293.26 121.804H270.12L241.889 37.923H262.948Z" fill="currentColor"/>
                    <path d="M378.745 55.2793H351.903V37.923H425.601V55.2793H398.645V121.804H378.745V55.2793Z" fill="currentColor"/>
                    <path d="M491.06 52.3862C483.422 52.3862 477.756 55.2794 477.756 60.4835C477.756 64.6518 481.688 67.6581 487.475 68.9305L498.928 71.2439C512.464 74.021 529.588 78.1862 529.588 95.7721C529.588 113.358 511.885 123.31 494.416 123.31C472.895 123.31 458.78 112.549 455.771 94.4997H475.441C477.639 103.293 484.581 107.342 494.879 107.342C501.588 107.342 509.224 105.144 509.224 98.2023C509.224 92.7658 502.747 90.1023 493.604 88.1371L483.422 86.0533C469.77 83.1633 457.392 76.6841 457.392 61.6418C457.392 44.519 475.788 36.5351 492.217 36.5351C508.646 36.5351 524.265 43.7095 527.158 62.2215H507.604C505.636 55.9721 499.506 52.3862 491.06 52.3862Z" fill="currentColor"/>
                    <path d="M108.553 46.9088L136.165 65.2593L156.596 51.7396L108.553 19.812L108.485 19.8573L60.427 51.7926L80.8551 65.3125L108.485 46.953L108.553 46.9088Z" fill="currentColor"/>
                    <path d="M108.47 105.303L25.0786 53.0043V87.8887L108.47 140.187L108.485 140.179L191.889 87.8741V52.9871L108.485 105.293L108.47 105.303Z" fill="currentColor"/>
                  </svg>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0 overflow-hidden" align="start">
                {/* Appearance */}
                <div className="px-3 py-2.5 border-b border-border">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Appearance</p>
                  <div className="flex gap-2">
                    <Button variant={isDark ? "ghost" : "default"} size="sm" className="flex-1 gap-1.5"
                      onClick={() => { if (isDark) { onToggleDark(); setLogoOpen(false) } }}>
                      <Sun className="h-3.5 w-3.5" /> Light
                    </Button>
                    <Button variant={isDark ? "default" : "ghost"} size="sm" className="flex-1 gap-1.5"
                      onClick={() => { if (!isDark) { onToggleDark(); setLogoOpen(false) } }}>
                      <Moon className="h-3.5 w-3.5" /> Dark
                    </Button>
                  </div>
                </div>
                {/* Experience */}
                <div className="px-3 py-2.5 border-b border-border">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Experience</p>
                  <div className="flex flex-col gap-1">
                    {["Asset Manager", "Broker"].map(exp => (
                      <div key={exp} className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-muted/40 opacity-60 cursor-not-allowed">
                        <span className="text-sm text-foreground">{exp}</span>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">Coming Soon</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Prototype */}
                <div className="px-3 py-2.5 border-b border-border">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Prototype</p>
                  <div className="flex flex-col gap-0.5">
                    {[
                      { label: "Main View",     hash: "#/dashboard" },
                      { label: "Inquiry Email",           hash: "#/inquiry-email" },
                      { label: "Inquiry Email Forward",   hash: "#/inquiry-email-forward" },
                      { label: "Inquiry Email Confirm",   hash: "#/inquiry-email-confirm" },
                    ].map(link => (
                      <button key={link.hash}
                        onClick={() => { window.location.hash = link.hash; setLogoOpen(false) }}
                        className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-sm text-foreground hover:bg-muted/60 transition-colors text-left">
                        {link.label}
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                      </button>
                    ))}
                  </div>
                </div>
                {/* Documentation */}
                <div className="px-3 py-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">Documentation</p>
                  <div className="flex flex-col gap-0.5">
                    {[
                      { label: "Theme Showcase",   hash: "#/theme" },
                      { label: "Agent Principles", hash: "#/principles" },
                    ].map(link => (
                      <button key={link.hash}
                        onClick={() => { window.location.hash = link.hash; setLogoOpen(false) }}
                        className="flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-sm text-foreground hover:bg-muted/60 transition-colors text-left">
                        {link.label}
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                      </button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <div />
          </div>

          <h1 className="text-[60px] font-semibold tracking-[-0.02em] leading-[1.08] text-foreground mb-5 max-w-[780px]">
            Transform CRE.<br /><span className="text-primary">Agents that assist,<br />automate, and accelerate.</span>
          </h1>
          <p className="text-[19px] text-muted-foreground leading-relaxed max-w-[640px]">
            The principles that guide how VTS agents work alongside users. A framework for balancing automation with judgment, and making AI feel native to how commercial real estate gets done.
          </p>
        </div>

        {/* ── Sections ──────────────────────────────────────────────────────── */}
        {SECTIONS.map((section, i) => (
          <React.Fragment key={section.kicker}>
            <section>
              <SectionHeader kicker={section.kicker} title={section.title} description={section.description} />
              <div className={cn(
                "grid gap-4",
                section.layout === "two" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-3"
              )}>
                {section.cards.map(card => (
                  <PrincipleCard key={card.title} title={card.title} body={card.body} />
                ))}
              </div>
            </section>
            {i < SECTIONS.length - 1 && <Separator />}
          </React.Fragment>
        ))}

      </div>
    </>
  )
}
