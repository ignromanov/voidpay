import { generateIcon, ICON_PRESETS } from './icon-utils'

export const size = {
  width: ICON_PRESETS.favicon.size,
  height: ICON_PRESETS.favicon.size,
}
export const contentType = 'image/png'

export default function Icon() {
  return generateIcon('favicon')
}
