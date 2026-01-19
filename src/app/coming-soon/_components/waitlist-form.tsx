'use client'

import * as React from 'react'

import { Button, Input } from '@/shared/ui'

type FormState = 'idle' | 'loading' | 'success' | 'error'

const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID

export function WaitlistForm() {
  const [email, setEmail] = React.useState('')
  const [state, setState] = React.useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) return

    if (!FORMSPREE_ID) {
      setErrorMessage('Waitlist is not configured. Please try again later.')
      setState('error')
      return
    }

    setState('loading')
    setErrorMessage('')

    try {
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setState('success')
        setEmail('')
      } else {
        const data = await response.json()
        setErrorMessage(data.error ?? 'Something went wrong. Please try again.')
        setState('error')
      }
    } catch {
      setErrorMessage('Network error. Please check your connection.')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-6 py-5 text-center backdrop-blur">
        <p className="text-lg font-semibold text-green-400">You&apos;re on the list!</p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">
          We&apos;ll notify you when VoidPay launches.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === 'loading'}
          required
          aria-label="Email address"
          className="h-12 flex-1 rounded-xl border-zinc-700 bg-zinc-900/80 text-base backdrop-blur transition-colors focus:border-violet-500/50"
        />
        <Button
          type="submit"
          variant="glow"
          size="lg"
          disabled={state === 'loading' || !email.trim()}
          className="h-12 rounded-xl px-6 whitespace-nowrap shadow-[0_0_30px_-8px_rgba(124,58,237,0.6)]"
        >
          {state === 'loading' ? 'Joining...' : 'Get Early Access'}
        </Button>
      </div>
      {state === 'error' && (
        <p className="mt-3 text-sm leading-relaxed text-red-400">{errorMessage}</p>
      )}
      <p className="mt-4 text-center text-xs tracking-wide text-zinc-500">
        No spam, ever. Unsubscribe anytime.
      </p>
    </form>
  )
}
