import { generateSocialImage, SOCIAL_IMAGE_PRESETS, SOCIAL_IMAGE_ALT } from './og-image-utils'

export const runtime = 'edge'
export const alt = SOCIAL_IMAGE_ALT
export const size = {
  width: SOCIAL_IMAGE_PRESETS.twitter.width,
  height: SOCIAL_IMAGE_PRESETS.twitter.height,
}
export const contentType = 'image/png'

export default function TwitterImage() {
  return generateSocialImage('twitter')
}
