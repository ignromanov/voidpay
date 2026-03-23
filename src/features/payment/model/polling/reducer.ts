// ---------------------------------------------------------------------------
// Polling state reducer
// ---------------------------------------------------------------------------

export type PollingMode = 'idle' | 'auto-check' | 'manual' | 'aggressive' | 'watching'

export interface PollingState {
  mode: PollingMode
  sessionId: number
  isLoading: boolean
  error?: string
  cooldownUntil?: number
}

export type Action =
  | { type: 'START'; mode: PollingMode; sessionId: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_COOLDOWN_UNTIL'; payload: number | undefined }
  | { type: 'STOP' }

export const INITIAL_STATE: PollingState = {
  mode: 'idle',
  sessionId: 0,
  isLoading: false,
}

export function reducer(state: PollingState, action: Action): PollingState {
  switch (action.type) {
    case 'START': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { error: _e, ...rest } = state
      return {
        ...rest,
        mode: action.mode,
        sessionId: action.sessionId,
        isLoading: action.mode === 'auto-check' || action.mode === 'manual',
      }
    }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false, mode: 'idle' }
    case 'SET_COOLDOWN_UNTIL': {
      if (action.payload === undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { cooldownUntil: _c, ...rest } = state
        return rest
      }
      return { ...state, cooldownUntil: action.payload }
    }
    case 'STOP':
      return { ...state, mode: 'idle', isLoading: false }
    default:
      return state
  }
}
