export { __resetPollingCounters } from './constants'
export { reducer, INITIAL_STATE } from './reducer'
export type { PollingMode, PollingState, Action } from './reducer'
export { createDoFetch } from './do-fetch'
export type { DoFetchParams, DoFetchRefs } from './do-fetch'
export { assignAggressiveLoop, assignWatchingLoop } from './loops'
export type { LoopRefs } from './loops'
export { setupVisibilityHandler } from './visibility-handler'
export type { VisibilityHandlerRefs, VisibilityHandlerCallbacks } from './visibility-handler'
export {
  MANUAL_COOLDOWN_MS,
  MAX_CONCURRENT_SESSIONS,
  nextSessionId,
  activeSessionCount,
  incrementActiveSessionCount,
  decrementActiveSessionCount,
} from './constants'
