// A guaranteed-to-render placeholder: an inline SVG data URI. Unlike a
// static file path (which 404s if it isn't actually in /public) or an
// external placeholder service (which can be slow, blocked, or down), this
// never makes a network request at all — it just always renders.
export const PLACEHOLDER_PRODUCT_IMAGE =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#f1f5f9"/>
      <g transform="translate(200,190)" fill="none" stroke="#cbd5e1" stroke-width="10" stroke-linecap="round" stroke-linejoin="round">
        <rect x="-60" y="-45" width="120" height="90" rx="10"/>
        <circle cx="-25" cy="-15" r="12"/>
        <path d="M -60 30 L -15 -5 L 20 20 L 60 -20 L 60 30 Z"/>
      </g>
      <text x="200" y="270" font-family="Arial, sans-serif" font-size="15" fill="#94a3b8" text-anchor="middle">No image</text>
    </svg>
  `);

// Attach to an <img>'s onError so a broken/deleted real URL also recovers
// gracefully instead of showing the browser's native broken-image icon.
export const handleProductImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.src !== PLACEHOLDER_PRODUCT_IMAGE) {
        img.src = PLACEHOLDER_PRODUCT_IMAGE;
    }
};