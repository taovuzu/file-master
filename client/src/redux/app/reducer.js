import {
  OPEN_NAV_MENU,
  CLOSE_NAV_MENU,
  COLLAPSE_NAV_MENU,
  CHANGE_APP,
  DEFAULT_APP
} from
  './actions';

const initialState = {
  isNavMenuClose: false,
  currentApp: 'default'
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case OPEN_NAV_MENU:
      return { ...state, isNavMenuClose: false };
    case CLOSE_NAV_MENU:
      return { ...state, isNavMenuClose: true };
    case COLLAPSE_NAV_MENU:
      return { ...state, isNavMenuClose: !state.isNavMenuClose };
    case CHANGE_APP:
      return { ...state, currentApp: action.payload };
    case DEFAULT_APP:
      return { ...state, currentApp: 'default' };
    default:
      return state;
  }
}

export { initialState };