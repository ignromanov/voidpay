'use client'

/**
 * Global Error Boundary — last-resort safety net.
 *
 * Catches errors that escape all route-level error boundaries,
 * including errors in the root layout (fonts, Navigation, Footer).
 *
 * CRITICAL: Must be 100% self-contained.
 * - No Tailwind classes (CSS may not have loaded)
 * - No @/shared/* imports (design system may be broken)
 * - Renders own <html>/<body> (replaces root layout)
 * - Inline styles only, using VoidPay design tokens as raw values
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          background: '#09090b',
          color: '#fafafa',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '1rem',
        }}
      >
        <div
          role="alert"
          style={{
            maxWidth: '480px',
            width: '100%',
            margin: 'auto',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(244,63,94,0.3)',
            borderRadius: '12px',
            padding: '1.5rem 1.25rem',
            textAlign: 'center',
            boxShadow: '0 0 50px -10px rgba(244,63,94,0.15)',
          }}
        >
          {/* Icon — inline SVG AlertTriangle */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: '1px solid rgba(244,63,94,0.2)',
              background: 'rgba(244,63,94,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              margin: '0 0 0.5rem',
              color: '#fafafa',
            }}
          >
            Critical Error
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: '0.95rem',
              color: 'rgba(244,63,94,0.8)',
              margin: '0 0 1.5rem',
              lineHeight: 1.5,
            }}
          >
            VoidPay encountered an unexpected error. Please try refreshing the page.
          </p>

          {/* Error Digest */}
          {error.digest && (
            <div
              style={{
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '20px',
                padding: '0.375rem 1rem',
                display: 'inline-block',
                marginBottom: '1.5rem',
              }}
            >
              <code
                style={{
                  fontSize: '0.75rem',
                  color: '#a1a1aa',
                  fontFamily: 'ui-monospace, monospace',
                }}
              >
                Error ID: {error.digest}
              </code>
            </div>
          )}

          {/* Dev-only Error Message */}
          {process.env.NODE_ENV === 'development' && (
            <div
              style={{
                background: 'rgba(244,63,94,0.05)',
                border: '1px solid rgba(244,63,94,0.2)',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                marginBottom: '1.5rem',
                textAlign: 'left',
              }}
            >
              <code
                style={{
                  fontSize: '0.8rem',
                  color: '#fb7185',
                  fontFamily: 'ui-monospace, monospace',
                  wordBreak: 'break-word',
                }}
              >
                {error.message}
              </code>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={reset}
              style={{
                minHeight: '44px',
                padding: '0.625rem 1.25rem',
                background: 'transparent',
                color: '#fb7185',
                border: '1px solid rgba(244,63,94,0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                fontFamily: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Try again
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- global-error replaces root layout, Next.js Link unavailable */}
            <a
              href="/"
              style={{
                minHeight: '44px',
                padding: '0.625rem 1.25rem',
                background: 'transparent',
                color: '#a1a1aa',
                border: '1px solid rgba(161,161,170,0.2)',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Return home
            </a>
          </div>

          {/* Branding */}
          <p
            style={{
              fontSize: '0.7rem',
              color: '#52525b',
              marginTop: '1.5rem',
              marginBottom: 0,
            }}
          >
            VoidPay — Stateless Crypto Invoicing
          </p>
        </div>
      </body>
    </html>
  )
}
