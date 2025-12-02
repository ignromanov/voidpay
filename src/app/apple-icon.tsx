import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#09090B',
        }}
      >
        {/* Черная дыра с subtle violet glow */}
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: '#000',
            border: '3px solid #7C3AED',
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.5)',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
