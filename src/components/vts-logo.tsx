import * as React from "react"
import { cn } from "@/lib/utils"
import logoSrc from "@/assets/vts_nav_logo.jpg"

interface VTSLogoProps {
  className?: string
}

const VTSLogo = React.forwardRef<HTMLImageElement, VTSLogoProps>(
  ({ className }, ref) => (
    <img
      ref={ref}
      src={logoSrc}
      alt="VTS"
      className={cn("h-7 w-auto shrink-0 mix-blend-lighten", className)}
    />
  )
)
VTSLogo.displayName = "VTSLogo"

export { VTSLogo }
