/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { 
  userJourneyReducer, 
  initialState, 
  STORAGE_KEYS
} from '../state/userJourney';
import type { UserJourneyState, UserJourneyAction } from '../state/userJourney';
import { useStorage } from './StorageContext';

interface UserJourneyContextValue {
  state: UserJourneyState;
  dispatch: React.Dispatch<UserJourneyAction>;
  joinWatchtower: (timestamp: string) => void;
  reset: () => void;
}

const UserJourneyContext = createContext<UserJourneyContextValue | null>(null);

export interface UserJourneyProviderProps {
  children: React.ReactNode;
  onJourneyEvent?: (event: string, data?: unknown) => void;
}

export function UserJourneyProvider({ children, onJourneyEvent }: UserJourneyProviderProps) {
  const { adapter } = useStorage();
  const [state, dispatch] = useReducer(userJourneyReducer, initialState);

  // Track if we've initialized from storage to avoid race conditions
  const [isInitialized, setIsInitialized] = React.useState(false);
  
  // Initialize state from storage
  useEffect(() => {
    const hasVisited = adapter.getItem(STORAGE_KEYS.HAS_VISITED) === 'true';
    const joinedTimestamp = adapter.getItem(STORAGE_KEYS.JOINED_TIMESTAMP);
    
    dispatch({
      type: 'INITIALIZE',
      state: { hasVisited, joinedTimestamp }
    });
    setIsInitialized(true);
  }, [adapter]);

  // Sync state to storage whenever it changes  
  useEffect(() => {
    // Skip if not initialized yet to avoid clearing initial data
    if (!isInitialized) return;
    
    // Only update storage if value has actually changed
    if (state.hasVisited) {
      adapter.setItem(STORAGE_KEYS.HAS_VISITED, 'true');
    } else {
      // Don't store false values - rely on absence meaning false
      adapter.removeItem(STORAGE_KEYS.HAS_VISITED);
    }
    
    if (state.joinedTimestamp) {
      adapter.setItem(STORAGE_KEYS.JOINED_TIMESTAMP, state.joinedTimestamp);
    } else {
      adapter.removeItem(STORAGE_KEYS.JOINED_TIMESTAMP);
    }
  }, [state.hasVisited, state.joinedTimestamp, adapter, isInitialized]);

  // Event emission for testing
  useEffect(() => {
    if (onJourneyEvent) {
      if (state.modalState === 'showing') {
        onJourneyEvent('modal:showing');
      } else if (state.modalState === 'ready') {
        onJourneyEvent('modal:ready');
      } else if (state.modalState === 'closing') {
        onJourneyEvent('modal:closing');
      } else if (state.modalState === 'hidden') {
        onJourneyEvent('modal:hidden');
      }
    }
  }, [state.modalState, onJourneyEvent]);

  const joinWatchtower = useCallback((timestamp: string) => {
    dispatch({ type: 'START_JOIN' });
    
    // Show modal first with animation delay
    // @animation-timeout: modal appearance transition
    setTimeout(() => {
      dispatch({ type: 'SHOW_MODAL' });
      dispatch({ type: 'MODAL_READY' });
      
      // Then confirm join after a brief delay
      // @animation-timeout: state sync delay
      setTimeout(() => {
        dispatch({ type: 'CONFIRM_JOIN', timestamp });
        onJourneyEvent?.('join:confirmed', { timestamp });
      }, 100);
    }, 300);
  }, [onJourneyEvent]);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
    
    // Clear storage synchronously
    adapter.removeItem(STORAGE_KEYS.HAS_VISITED);
    adapter.removeItem(STORAGE_KEYS.JOINED_TIMESTAMP);
    
    // Notify event system
    requestAnimationFrame(() => {
      onJourneyEvent?.('reset:complete');
      dispatch({ type: 'RESET_COMPLETE' });
    });
  }, [adapter, onJourneyEvent]);

  return (
    <UserJourneyContext.Provider value={{ state, dispatch, joinWatchtower, reset }}>
      {children}
    </UserJourneyContext.Provider>
  );
}

export function useUserJourney() {
  const context = useContext(UserJourneyContext);
  if (!context) {
    throw new Error('useUserJourney must be used within UserJourneyProvider');
  }
  return context;
}