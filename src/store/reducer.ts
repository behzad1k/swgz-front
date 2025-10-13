import { Action, RootState } from '@/types/states.ts';

export const appReducer = (state: RootState, action: Action): RootState => {
  switch (action.type) {
    case 'SET_AUTH':
      return { ...state, auth: { ...state.auth, ...action.payload } };
    case 'SET_PLAYER':
      return { ...state, player: { ...state.player, ...action.payload } };
    case 'SET_LIBRARY':
      return { ...state, library: { ...state.library, ...action.payload } };
    case 'SET_DOWNLOADS':
      return { ...state, downloads: { ...state.downloads, ...action.payload } };
    case 'SET_APP':
      return { ...state, app: { ...state.app, ...action.payload } };
    case 'UPDATE_DOWNLOAD_PROGRESS':
      return {
        ...state,
        downloads: {
          ...state.downloads,
          active: {
            ...state.downloads.active,
            [action.payload.id]: {
              ...state.downloads.active[action.payload.id],
              progress: action.payload.progress,
            },
          },
        },
      };
    case 'COMPLETE_DOWNLOAD':
      const { [action.payload.id]: completed, ...remaining } = state.downloads.active;
      return {
        ...state,
        downloads: {
          ...state.downloads,
          active: remaining,
          completed: [...state.downloads.completed, completed],
        },
      };
    default:
      return state;
  }
};

export default appReducer;