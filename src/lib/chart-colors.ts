// Resolves a CSS custom property to a hex/rgb string safe for SVG fill attributes.
// OKLCH values from getComputedStyle don't work as SVG presentation attributes;
// routing through a Canvas context forces browser-side sRGB conversion.

const _canvas = document.createElement("canvas")
_canvas.width = _canvas.height = 1
const _ctx = _canvas.getContext("2d")!
const _cache = new Map<string, string>()

export function cv(cssVar: string): string {
  if (_cache.has(cssVar)) return _cache.get(cssVar)!

  // Resolve the CSS variable to its computed color value
  const el = document.createElement("span")
  el.style.cssText = "position:absolute;visibility:hidden"
  el.style.color = `var(${cssVar})`
  document.documentElement.appendChild(el)
  const raw = getComputedStyle(el).color
  el.remove()

  // Paint through Canvas to guarantee an sRGB output (works with oklch, p3, etc.)
  _ctx.clearRect(0, 0, 1, 1)
  _ctx.fillStyle = raw
  _ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = _ctx.getImageData(0, 0, 1, 1).data
  const rgb = `rgb(${r},${g},${b})`
  _cache.set(cssVar, rgb)
  return rgb
}
