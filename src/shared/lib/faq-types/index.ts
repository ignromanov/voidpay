/**
 * FAQ Types - Shared Layer Public API
 *
 * Exports the FaqItem type used by FAQ content modules across widgets.
 *
 * This module is in the shared layer (not entities/) to comply with FSD layer rules:
 * shared → entities → features → widgets → app
 *
 * Both widgets/landing and widgets/create define their own FAQ_ITEMS content;
 * this shared type prevents widget→widget imports (FSD AC4 constraint) while
 * giving both a single source of truth for the { question, answer } shape.
 */

export type FaqItem = {
  question: string
  answer: string
}
