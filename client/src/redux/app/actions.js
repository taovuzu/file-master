export const OPEN_NAV_MENU = 'app/OPEN_NAV_MENU';
export const CLOSE_NAV_MENU = 'app/CLOSE_NAV_MENU';
export const COLLAPSE_NAV_MENU = 'app/COLLAPSE_NAV_MENU';
export const CHANGE_APP = 'app/CHANGE_APP';
export const DEFAULT_APP = 'app/DEFAULT_APP';

export const openNavMenu = () => ({ type: OPEN_NAV_MENU });
export const closeNavMenu = () => ({ type: CLOSE_NAV_MENU });
export const collapseNavMenu = () => ({ type: COLLAPSE_NAV_MENU });

export const openApp = (appName) => ({ type: CHANGE_APP, payload: appName });
export const resetApp = () => ({ type: DEFAULT_APP });