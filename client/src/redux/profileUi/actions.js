// Profile UI state migrated from profileContext

export const OPEN_PASSWORD_MODAL = 'profileUi/OPEN_PASSWORD_MODAL';
export const CLOSE_PASSWORD_MODAL = 'profileUi/CLOSE_PASSWORD_MODAL';
export const OPEN_PROFILE_PANEL = 'profileUi/OPEN_PROFILE_PANEL';
export const CLOSE_PROFILE_PANEL = 'profileUi/CLOSE_PROFILE_PANEL';

export const openPasswordModal = () => ({ type: OPEN_PASSWORD_MODAL });
export const closePasswordModal = () => ({ type: CLOSE_PASSWORD_MODAL });

export const openProfilePanel = (keyState = 'update') => ({ type: OPEN_PROFILE_PANEL, payload: { keyState } });
export const closeProfilePanel = () => ({ type: CLOSE_PROFILE_PANEL });


