import { renderBrandingOG, OG_SIZES, OG_ALT } from '@/features/og-image'

export const runtime = 'edge'
export const alt = OG_ALT
export const size = OG_SIZES.twitter
export const contentType = 'image/png'

export default function TwitterImage() {
  return renderBrandingOG(OG_SIZES.twitter)
}
