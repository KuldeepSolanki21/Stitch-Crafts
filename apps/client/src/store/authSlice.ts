import { createSlice } from '@reduxjs/toolkit';

export const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, token: null },
  reducers: {},
});
export default authSlice.reducer;
