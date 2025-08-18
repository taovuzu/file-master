import {
  OPEN_PASSWORD_MODAL,
  CLOSE_PASSWORD_MODAL,
  OPEN_PROFILE_PANEL,
  CLOSE_PROFILE_PANEL,
} from './actions';

const initialState = {
  read: { isOpen: true },
  update: { isOpen: false },
  passwordModal: { isOpen: false },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case OPEN_PASSWORD_MODAL:
      return { ...state, passwordModal: { isOpen: true } };
    case CLOSE_PASSWORD_MODAL:
      return { ...state, passwordModal: { isOpen: false } };
    case OPEN_PROFILE_PANEL: {
      const { keyState = 'update' } = action.payload || {};
      return {
        ...initialState,
        read: { isOpen: false },
        [keyState]: { isOpen: true },
      };
    }
    case CLOSE_PROFILE_PANEL:
      return { ...initialState };
    default:
      return state;
  }
}

export { initialState };


