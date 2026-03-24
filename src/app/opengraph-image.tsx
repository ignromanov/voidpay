import { renderBrandingOG, OG_SIZES, OG_ALT } from '@/features/og-image'

export const runtime = 'edge'
export const alt = OG_ALT
export const size = OG_SIZES.opengraph
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return renderBrandingOG(OG_SIZES.opengraph)
}
