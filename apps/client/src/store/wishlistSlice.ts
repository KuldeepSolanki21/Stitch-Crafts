import { createSlice } from '@reduxjs/toolkit';

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [] },
  reducers: {},
});
export default wishlistSlice.reducer;
