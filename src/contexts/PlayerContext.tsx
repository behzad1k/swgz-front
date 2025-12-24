import { PlayerState } from '@/types/states';
import { initialPlayerState, PlayerAction, playerReducer } from '@store/playerSlice.ts';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';

type PlayerContextType = {
  state: PlayerState;
  dispatch: React.Dispatch<PlayerAction>;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(playerReducer, initialPlayerState);
  const stateRef = useRef(state);

  const value = useMemo(
    () => ({
      state,
      dispatch,
    }),
    [state]
  );

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

export const usePlayerContext = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayerContext must be used within PlayerProvider');
  }
  return context;
};

export default PlayerProvider;
