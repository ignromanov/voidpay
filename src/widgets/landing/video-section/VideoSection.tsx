/**
 * VideoSection - Landing page product video walkthrough
 * Feature: 012-landing-page
 * User Story: US1 (First Impression), US2 (Convert to Action)
 *
 * Performance: preload="none" defers video fetch until user interaction.
 * Only the video for the active viewport is mounted — no double-fetch.
 * Aspect-ratio box reserved to prevent CLS during SSR → client transition.
 * Reduced motion: autoplay suppressed; poster shown with native controls.
 * Mobile: autoplay disabled entirely so preload="none" actually defers the
 * 2.7MB fetch. Poster shown with native controls for tap-to-play affordance.
 * Off-screen: IntersectionObserver pauses video when scrolled out of view
 * and resumes when scrolled back in (skipped under reduced-motion or mobile).
 */

'use client'

import { useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'

import { track, AnalyticsEvent } from '@/features/analytics'
import { ArrowRightIcon } from '@/shared/ui/icons'
import { useReducedMotion } from '@/shared/ui'
import { Button } from '@/shared/ui/button'
import { Heading, Text } from '@/shared/ui/typography'
import { useIsMobile } from '@/shared/lib'

export function VideoSection() {
  const prefersReducedMotion = useReducedMotion()
  const isMobile = useIsMobile()
  const hasTrackedRef = useRef(false)
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlay = useCallback(() => {
    if (hasTrackedRef.current) return
    hasTrackedRef.current = true
    track(AnalyticsEvent.LANDING_VIDEO_PLAY)
  }, [])

  // Pause the off-screen video to avoid wasting data/battery.
  // Skip under reduced-motion or mobile — videos aren't autoplaying in those cases.
  useEffect(() => {
    if (prefersReducedMotion) return
    if (isMobile) return
    if (typeof window === 'undefined') return

    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        const video = videoRef.current

        if (entry.isIntersecting) {
          video?.play().catch(() => {})
        } else {
          video?.pause()
        }
      },
      { threshold: 0 },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [prefersReducedMotion, isMobile])

  const videoSrc = isMobile ? '/video/voidpay-9x16-v2.mp4' : '/video/voidpay-16x9-v2.mp4'
  const wrapperClassName = isMobile
    ? 'mx-auto max-h-[80vh] max-w-sm aspect-[9/16]'
    : 'aspect-video w-full'

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

        {/* Video — only the active-viewport variant is mounted to prevent double-fetch */}
        <figure className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-violet-900/10">
          <div className={wrapperClassName}>
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              src={videoSrc}
              poster="/video/poster-scene5.webp"
              muted
              autoPlay={!prefersReducedMotion && !isMobile}
              loop
              playsInline
              preload="none"
              controls={prefersReducedMotion || isMobile}
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
