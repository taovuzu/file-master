import { createAsyncThunk, createAction } from '@reduxjs/toolkit';
import { request } from '@/request';
import storePersist from '@/redux/storePersist.js';


const normalizeSettings = (datas) => {
  const settingsCategory = {};
  datas.forEach((data) => {
    settingsCategory[data.settingCategory] = {
      ...settingsCategory[data.settingCategory],
      [data.settingKey]: data.settingValue
    };
  });
  return settingsCategory;
};


const saveSettingsToLocalStorage = (settings) => {
  storePersist.set('settings', settings);
};


export const resetState = createAction('settings/resetState');


const fetchAndStoreSettings = async (entity, rejectWithValue) => {
  const listRes = await request.listAll({ entity });
  if (!listRes.success) return rejectWithValue(listRes.error || 'Failed to fetch settings');
  const payload = normalizeSettings(listRes.result);
  saveSettingsToLocalStorage(payload);
  return payload;
};


export const updateSetting = createAsyncThunk(
  'settings/updateSetting',
  async ({ entity, settingKey, jsonData }, { rejectWithValue }) => {
    const res = await request.patch({
      entity: `${entity}/updateBySettingKey/${settingKey}`,
      jsonData
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
      jsonData
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