export const selectSettingsState = (state) => state.settings;

export const selectAllSettings = (state) => state.settings.result;

export const selectSettingsLoading = (state) => state.settings.isLoading;

export const selectSettingsSuccess = (state) => state.settings.isSuccess;

export const selectSettingsCategory = (category) => (state) =>
state.settings.result?.[category] || {};

export const selectSettingValue = (category, key) => (state) =>
state.settings.result?.[category]?.[key];

export const selectAppLanguage = (state) =>
state.settings.result?.general?.language || 'en';