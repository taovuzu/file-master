import { createSlice } from '@reduxjs/toolkit';
import {
  resetState,
  updateSetting,
  updateManySettings,
  listSettings,
  uploadSetting } from
'./actions';

const INITIAL_SETTINGS_STATE = {};

const INITIAL_STATE = {
  result: INITIAL_SETTINGS_STATE,
  isLoading: false,
  isSuccess: false
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState: INITIAL_STATE,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(resetState, () => INITIAL_STATE);

    const handleAsync = (thunk) => {
      builder.
      addCase(thunk.pending, (state) => {
        state.isLoading = true;
      }).
      addCase(thunk.fulfilled, (state, { payload }) => {
        state.result = payload;
        state.isLoading = false;
        state.isSuccess = true;
      }).
      addCase(thunk.rejected, (state) => {
        state.isLoading = false;
        state.isSuccess = false;
      });
    };

    handleAsync(updateSetting);
    handleAsync(updateManySettings);
    handleAsync(listSettings);
    handleAsync(uploadSetting);
  }
});

export default settingsSlice.reducer;