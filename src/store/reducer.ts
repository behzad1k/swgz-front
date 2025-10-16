import { RootAction, RootState } from '@/types/states.ts';
import { AppAction, appReducer, initialAppState } from '@store/slices/appSlice.ts';
import { AuthAction, authReducer, initialAuthState } from '@store/slices/authSlice.ts';
import { initialLibraryState, LibraryAction, libraryReducer, } from '@store/slices/librarySlice.ts';
import { initialModalState, ModalAction, modalReducer } from '@store/slices/modalSlice.ts';
import { initialPlayerState, PlayerAction, playerReducer } from '@store/slices/playerSlice.ts';

export const rootReducer = (state: RootState, action: RootAction): RootState => {
  return {
    auth: authReducer(state.auth, action as AuthAction),
    library: libraryReducer(state.library, action as LibraryAction),
    player: playerReducer(state.player, action as PlayerAction),
    modal: modalReducer(state.modal, action as ModalAction),
    app: appReducer(state.app, action as AppAction)
  }
}

export const initialRootState: RootState = {
  app: initialAppState,
  auth: initialAuthState,
  library: initialLibraryState,
  modal: initialModalState,
  player: initialPlayerState
}

export default appReducer;