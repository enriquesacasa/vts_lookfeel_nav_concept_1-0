/**
 * Saved positioning section — "Advantage, Mapped by Fit"
 *
 * To restore: import this file and drop <PositioningSection isDark={isDark} />
 * anywhere inside ThemeShowcase (or another page).
 *
 * Requires in the parent page's index.css:
 *   @keyframes vts-beacon { ... }  (already in src/index.css)
 *
 * Requires these imports in the consuming file:
 *   import { cn } from "@/lib/utils"
 *   import { SectionHeader } from "./theme-showcase"  // or inline the component
 */

import { cn } from "@/lib/utils"

function SectionHeader({ kicker, title, description }: { kicker: string; title: string; description?: string }) {
  return (
    <div className="mb-10">
      <p className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.07em] text-primary mb-3.5">{kicker}</p>
      <h2 className="text-[28px] font-semibold tracking-[-0.015em] leading-[1.2] text-foreground mb-3">{title}</h2>
      {description && <p className="text-[16px] text-muted-foreground leading-relaxed max-w-[680px]">{description}</p>}
    </div>
  )
}

export function PositioningSection({ isDark }: { isDark: boolean }) {
  const axisLabel = "text-[13px] font-semibold tracking-tight text-primary flex items-center justify-center text-center"
  const chipSub = isDark ? "rgba(200,200,215,0.9)" : "rgba(220,220,232,0.95)"
  const dots: { left: string; bottom: string; color: string; name: string; sub: string }[] = [
    { left: "13%", bottom: "13%", color: "#3ecf8e", name: "Ramp",   sub: "Corporate cards & spend" },
    { left: "20%", bottom: "21%", color: "#ff6b57", name: "Brex",   sub: "Corporate cards & travel" },
    { left: "33%", bottom: "36%", color: "#2dd4bf", name: "Glean",  sub: "Enterprise search & AI" },
    { left: "44%", bottom: "68%", color: "#f472b6", name: "Sierra", sub: "AI customer experience" },
    { left: "60%", bottom: "62%", color: "#f2c94c", name: "Hebbia", sub: "Institutional research AI" },
    { left: "72%", bottom: "74%", color: "#c3a1ff", name: "Harvey", sub: "Legal AI" },
  ]
  const vtsSvg = (
    <svg width="555" height="160" viewBox="0 0 555 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-[1.15rem] w-auto opacity-95">
      <path d="M262.948 37.923L282.271 99.5913L301.591 37.923H321.723L293.26 121.804H270.12L241.889 37.923H262.948Z" fill="white"/>
      <path d="M378.745 55.2793H351.903V37.923H425.601V55.2793H398.645V121.804H378.745V55.2793Z" fill="white"/>
      <path d="M491.06 52.3862C483.422 52.3862 477.756 55.2794 477.756 60.4835C477.756 64.6518 481.688 67.6581 487.475 68.9305L498.928 71.2439C512.464 74.021 529.588 78.1862 529.588 95.7721C529.588 113.358 511.885 123.31 494.416 123.31C472.895 123.31 458.78 112.549 455.771 94.4997H475.441C477.639 103.293 484.581 107.342 494.879 107.342C501.588 107.342 509.224 105.144 509.224 98.2023C509.224 92.7658 502.747 90.1023 493.604 88.1371L483.422 86.0533C469.77 83.1633 457.392 76.6841 457.392 61.6418C457.392 44.519 475.788 36.5351 492.217 36.5351C508.646 36.5351 524.265 43.7095 527.158 62.2215H507.604C505.636 55.9721 499.506 52.3862 491.06 52.3862Z" fill="white"/>
      <path d="M108.553 46.9088L136.165 65.2593L156.596 51.7396L108.553 19.812L108.485 19.8573L60.427 51.7926L80.8551 65.3125L108.485 46.953L108.553 46.9088Z" fill="white"/>
      <path d="M108.47 105.303L25.0786 53.0043V87.8887L108.47 140.187L108.485 140.179L191.889 87.8741V52.9871L108.485 105.293L108.47 105.303Z" fill="white"/>
    </svg>
  )

  return (
    <section>
      <SectionHeader
        kicker="· Positioning"
        title="Advantage, Mapped by Fit"
        description="Two variables explain most of enterprise software strategy: what a product is bought for, and how tightly it fits the market it serves. Cost and time savings are easy to copy. Competitive advantage compounds because it isn't. Horizontal tools spread value across every industry; vertical tools concentrate it inside one. Depth of fit is usually what turns efficiency into advantage."
      />

      <div className="w-full overflow-x-hidden">
        <div className="w-full pb-3" style={{ display: "grid", gridTemplateColumns: "0px 1fr 0px", gridTemplateRows: "auto 1fr auto", gap: "0 0" }}
          ref={(el) => {
            if (!el) return
            const mq = window.matchMedia("(min-width: 640px)")
            const apply = (matches: boolean) => {
              el.style.gridTemplateColumns = matches ? "36px 1fr 36px" : "0px 1fr 0px"
              el.style.gap = matches ? "0 14px" : "0 0"
            }
            apply(mq.matches)
            mq.addEventListener("change", (e) => apply(e.matches))
          }}
        >
          <div style={{ gridColumn: 2, gridRow: 1 }} className={cn(axisLabel, "pb-3 text-[11px] sm:text-[13px] sm:pb-4")}>↑ Competitive Advantage: Harder to Copy</div>
          <div style={{ gridColumn: 1, gridRow: 2, writingMode: "vertical-rl", transform: "rotate(180deg)", overflow: "hidden" }} className={cn(axisLabel, "hidden sm:flex")}>Broad, Horizontal Fit</div>
          <div style={{ gridColumn: 2, gridRow: 2 }} className="relative rounded-2xl border border-border bg-card overflow-visible min-h-[280px] sm:min-h-[420px] lg:min-h-[500px]" ref={(el) => {
            if (!el) return
            const setAR = () => { el.style.aspectRatio = window.innerWidth >= 640 ? "16/10" : "unset" }
            setAR(); window.addEventListener("resize", setAR)
          }}>
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-primary/[0.025]" />
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/[0.08]" />
            </div>
            <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-border z-10" />
            <div className="absolute left-1/2 top-0 bottom-0 border-l border-dashed border-border z-10" />
            <div className="absolute top-3 left-3 sm:top-5 sm:left-5 flex flex-col gap-0.5 sm:gap-1 z-10 max-w-[90px] sm:max-w-[160px]">
              <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.06em] text-foreground/70">Portable Advantage</span>
              <span className="hidden sm:block text-[11.5px] italic text-muted-foreground/75">One capability, valuable in every industry</span>
            </div>
            <div className="absolute top-3 right-3 sm:top-5 sm:right-5 flex flex-col gap-0.5 sm:gap-1 items-end z-10 max-w-[90px] sm:max-w-[160px]">
              <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.06em] text-primary">Defensible Moat</span>
              <span className="hidden sm:block text-[11.5px] italic text-muted-foreground/75 text-right">Undisputed authority in a single domain</span>
            </div>
            <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 flex flex-col gap-0.5 sm:gap-1 z-10 max-w-[90px] sm:max-w-[160px]">
              <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.06em] text-foreground/70">Commodity Efficiency</span>
              <span className="hidden sm:block text-[11.5px] italic text-muted-foreground/75">Same job, done cheaper, everywhere</span>
            </div>
            <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 flex flex-col gap-0.5 sm:gap-1 items-end z-10 max-w-[90px] sm:max-w-[160px]">
              <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-[0.06em] text-foreground/70">Niche Workhorse</span>
              <span className="hidden sm:block text-[11.5px] italic text-muted-foreground/75 text-right">Purpose-built efficiency for one workflow</span>
            </div>
            {dots.map((d) => (
              <div key={d.name} className="absolute z-20 flex flex-col-reverse items-center gap-1.5 sm:gap-2" style={{ left: d.left, bottom: d.bottom, transform: "translate(-50%, 50%)" }}>
                <div className="rounded-full shrink-0" style={{ width: 12, height: 12, background: d.color, boxShadow: "0 0 0 2px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.2)" }} />
                <div className="flex flex-col items-center gap-0.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-[rgba(14,14,20,0.75)] backdrop-blur-md whitespace-nowrap shadow-[0_8px_20px_-8px_rgba(0,0,0,0.5)]">
                  <span className="text-[11px] sm:text-[13px] font-semibold text-[#f0f0f4] leading-none">{d.name}</span>
                  <span className="hidden sm:block text-[11px] leading-none" style={{ color: chipSub }}>{d.sub}</span>
                </div>
              </div>
            ))}
            <div className="absolute z-30 flex flex-col-reverse items-center gap-1.5 sm:gap-2" style={{ left: "86%", bottom: "82%", transform: "translate(-50%, 50%)" }}>
              <div className="rounded-full shrink-0" style={{ width: 20, height: 20, background: "#684dff", animation: "vts-beacon 1.8s ease-out infinite", boxShadow: "0 0 0 2px rgba(0,0,0,0.3)" }} />
              <div className={cn("flex flex-col items-center gap-0.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-[rgba(14,14,20,0.75)] backdrop-blur-md whitespace-nowrap", "shadow-[0_0_0_1px_rgba(104,77,255,0.6),0_8px_20px_-8px_rgba(0,0,0,0.5)]")}>
                <div className="sm:hidden text-[11px] font-bold text-primary leading-none">VTS</div>
                <div className="hidden sm:block">{vtsSvg}</div>
                <span className="hidden sm:block text-[11px] leading-none" style={{ color: chipSub }}>CRE AI platform</span>
              </div>
            </div>
          </div>
          <div style={{ gridColumn: 3, gridRow: 2, writingMode: "vertical-rl", overflow: "hidden" }} className={cn(axisLabel, "hidden sm:flex")}>Deep, Vertical Fit</div>
          <div style={{ gridColumn: 2, gridRow: 3 }} className={cn(axisLabel, "pt-3 text-[11px] sm:text-[13px] sm:pt-4")}>Cost & Time Savings: Easy to Copy ↓</div>
        </div>
      </div>
    </section>
  )
}
