/**
 * VideoSection - Landing page product video walkthrough
 * Feature: 012-landing-page
 * User Story: US1 (First Impression), US2 (Convert to Action)
 *
 * Performance: preload="none" defers video fetch until user interaction.
 * Aspect-ratio box reserved via aspect-video to prevent CLS.
 * Reduced motion: autoplay suppressed; poster shown with native controls.
 * Off-screen: IntersectionObserver pauses video when scrolled out of view
 * and resumes when scrolled back in (skipped under reduced-motion).
 */

'use client'

import { useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'

import { track, AnalyticsEvent } from '@/features/analytics'
import { ArrowRightIcon } from '@/shared/ui/icons'
import { useReducedMotion } from '@/shared/ui'
import { Button } from '@/shared/ui/button'
import { Heading, Text } from '@/shared/ui/typography'

export function VideoSection() {
  const prefersReducedMotion = useReducedMotion()
  const hasTrackedRef = useRef(false)
  const sectionRef = useRef<HTMLElement>(null)
  const mobileVideoRef = useRef<HTMLVideoElement>(null)
  const desktopVideoRef = useRef<HTMLVideoElement>(null)

  const handlePlay = useCallback(() => {
    if (hasTrackedRef.current) return
    hasTrackedRef.current = true
    track(AnalyticsEvent.LANDING_VIDEO_PLAY)
  }, [])

  // Pause the off-screen video to avoid wasting data/battery.
  // Skip entirely under reduced-motion — videos aren't autoplaying anyway.
  useEffect(() => {
    if (prefersReducedMotion) return
    if (typeof window === 'undefined') return

    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        const mobile = mobileVideoRef.current
        const desktop = desktopVideoRef.current

        if (entry.isIntersecting) {
          mobile?.play().catch(() => {})
          desktop?.play().catch(() => {})
        } else {
          mobile?.pause()
          desktop?.pause()
        }
      },
      { threshold: 0 },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [prefersReducedMotion])

  return (
    <section
      ref={sectionRef}
      className="relative px-6 py-16 md:py-32"
      aria-labelledby="video-section-heading"
    >
      <div className="mx-auto max-w-4xl space-y-10 text-center">
        {/* Eyebrow */}
        <Text
          variant="label"
          className="text-violet-400"
        >
          See it in action
        </Text>

        {/* Headline */}
        <Heading variant="h1" as="h2" id="video-section-heading">
          Watch those three steps play out.
        </Heading>

        {/* Video */}
        <figure className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-violet-900/10">
          {/* Mobile: 9:16 vertical — hidden at md+ breakpoint */}
          {/* aspect-[9/16] reserves space before load (CLS prevention); max-h-[80vh] prevents dominating the viewport */}
          <div className="mx-auto block max-h-[80vh] max-w-sm aspect-[9/16] md:hidden">
            <video
              ref={mobileVideoRef}
              className="h-full w-full object-cover"
              src="/video/voidpay-9x16-v2.mp4"
              poster="/video/poster-scene5.png"
              muted
              autoPlay={!prefersReducedMotion}
              loop
              playsInline
              preload="none"
              controls={prefersReducedMotion}
              aria-label="VoidPay product walkthrough: creating and paying a crypto invoice"
              onPlay={handlePlay}
            />
          </div>

          {/* Desktop: 16:9 landscape — hidden below md breakpoint */}
          {/* aspect-video = 16/9 — reserves space before video loads (CLS prevention) */}
          <div className="hidden aspect-video w-full md:block">
            <video
              ref={desktopVideoRef}
              className="h-full w-full object-cover"
              src="/video/voidpay-16x9-v2.mp4"
              poster="/video/poster-scene5.png"
              muted
              autoPlay={!prefersReducedMotion}
              loop
              playsInline
              preload="none"
              controls={prefersReducedMotion}
              aria-label="VoidPay product walkthrough: creating and paying a crypto invoice"
              onPlay={handlePlay}
            />
          </div>

          <figcaption className="px-4 py-3 text-sm text-zinc-500">
            Silent by design. Captions tell the story.
          </figcaption>
        </figure>

        {/* CTA */}
        <div className="flex flex-col items-center pt-2">
          <Button
            variant="glow"
            size="lg"
            className="h-14 rounded-2xl px-8 text-base shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)]"
            asChild
          >
            <Link href="/create">
              Create your own
              <ArrowRightIcon size={16} />
            </Link>
          </Button>
          <span className="mt-3 text-sm text-zinc-400">
            No signup. Takes 30 seconds.
          </span>
        </div>
      </div>
    </section>
  )
}
