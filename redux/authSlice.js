import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null,
  refreshToken: null,
  expiration: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.expiration = Date.now() + 1000 * 60 * 60 * 24;
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.expiration = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
