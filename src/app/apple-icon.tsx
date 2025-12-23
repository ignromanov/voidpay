import { generateIcon, ICON_PRESETS } from './icon-utils'

export const size = {
  width: ICON_PRESETS.apple.size,
  height: ICON_PRESETS.apple.size,
}
export const contentType = 'image/png'

export default function AppleIcon() {
  return generateIcon('apple')
}
