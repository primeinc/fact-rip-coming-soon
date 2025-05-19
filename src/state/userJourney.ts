// Centralized user journey state management
export interface UserJourneyState {
  hasVisited: boolean;
  joinedTimestamp: string | null;
  modalState: 'hidden' | 'showing' | 'ready' | 'closing';
  isLoading: boolean;
}

export type UserJourneyAction =
  | { type: 'INITIALIZE'; state: Partial<UserJourneyState> }
  | { type: 'START_JOIN' }
  | { type: 'SHOW_MODAL' }
  | { type: 'MODAL_READY' }
  | { type: 'CONFIRM_JOIN'; timestamp: string }
  | { type: 'CLOSE_MODAL' }
  | { type: 'MODAL_HIDDEN' }
  | { type: 'RESET' }
  | { type: 'RESET_COMPLETE' };

export const initialState: UserJourneyState = {
  hasVisited: false,
  joinedTimestamp: null,
  modalState: 'hidden',
  isLoading: false,
};

export function userJourneyReducer(
  state: UserJourneyState,
  action: UserJourneyAction
): UserJourneyState {
  switch (action.type) {
    case 'INITIALIZE':
      return { ...state, ...action.state };

    case 'START_JOIN':
      return { ...state, isLoading: true };

    case 'SHOW_MODAL':
      return { ...state, isLoading: false, modalState: 'showing' };

    case 'MODAL_READY':
      return { ...state, modalState: 'ready' };

    case 'CONFIRM_JOIN':
      return {
        ...state,
        hasVisited: true,
        joinedTimestamp: action.timestamp,
        modalState: 'ready',
      };

    case 'CLOSE_MODAL':
      return { ...state, modalState: 'closing' };

    case 'MODAL_HIDDEN':
      return { ...state, modalState: 'hidden' };

    case 'RESET':
      return { ...initialState, modalState: 'hidden' };

    case 'RESET_COMPLETE':
      return initialState;

    default:
      return state;
  }
}

// Storage keys as constants
export const STORAGE_KEYS = {
  HAS_VISITED: 'fact.rip.visited',
  JOINED_TIMESTAMP: 'fact.rip.joined',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];