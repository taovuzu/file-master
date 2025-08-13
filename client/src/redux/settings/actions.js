import { createAsyncThunk, createAction } from '@reduxjs/toolkit';
import { request } from '@/request';

// Helper to normalize settings list into { category: { key: value } } shape
const normalizeSettings = (datas) => {
  const settingsCategory = {};
  datas.forEach((data) => {
    settingsCategory[data.settingCategory] = {
      ...settingsCategory[data.settingCategory],
      [data.settingKey]: data.settingValue,
    };
  });
  return settingsCategory;
};

// Helper to save settings to localStorage
const saveSettingsToLocalStorage = (settings) => {
  window.localStorage.setItem('settings', JSON.stringify(settings));
};

// Sync actions
export const resetState = createAction('settings/resetState');

// async handler
const fetchAndStoreSettings = async (entity, rejectWithValue) => {
  const listRes = await request.listAll({ entity });
  if (!listRes.success) return rejectWithValue(listRes.error || 'Failed to fetch settings');
  const payload = normalizeSettings(listRes.result);
  saveSettingsToLocalStorage(payload);
  return payload;
};

// Async thunks
export const updateSetting = createAsyncThunk(
  'settings/updateSetting',
  async ({ entity, settingKey, jsonData }, { rejectWithValue }) => {
    const res = await request.patch({
      entity: `${entity}/updateBySettingKey/${settingKey}`,
      jsonData,
    });
    if (!res.success) return rejectWithValue(res.error || 'Failed to update setting');
    return await fetchAndStoreSettings(entity, rejectWithValue);
  }
);

export const updateManySettings = createAsyncThunk(
  'settings/updateManySettings',
  async ({ entity, jsonData }, { rejectWithValue }) => {
    const res = await request.patch({
      entity: `${entity}/updateManySetting`,
      jsonData,
    });
    if (!res.success) return rejectWithValue(res.error || 'Failed to update many settings');
    return await fetchAndStoreSettings(entity, rejectWithValue);
  }
);

export const listSettings = createAsyncThunk(
  'settings/listSettings',
  async ({ entity }, { rejectWithValue }) => {
    return await fetchAndStoreSettings(entity, rejectWithValue);
  }
);

export const uploadSetting = createAsyncThunk(
  'settings/uploadSetting',
  async ({ entity, settingKey, jsonData }, { rejectWithValue }) => {
    const res = await request.upload({ entity, id: settingKey, jsonData });
    if (!res.success) return rejectWithValue(res.error || 'Failed to upload setting');
    return await fetchAndStoreSettings(entity, rejectWithValue);
  }
);
