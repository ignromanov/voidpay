import { ImageResponse } from 'next/og'

export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          borderRadius: '4px',
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#8b5cf6',
          }}
        >
          V
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
