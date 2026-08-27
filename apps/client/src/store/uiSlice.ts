import { createSlice } from '@reduxjs/toolkit';

export const uiSlice = createSlice({
  name: 'ui',
  initialState: { isCartOpen: false },
  reducers: {},
});
export default uiSlice.reducer;
