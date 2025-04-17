import { User } from "@/types/user";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface initialStateType {
  isSidebarCollapsed: boolean;
  isDarkMode: boolean;
  user: User | null;
  token: string | null;
  expireTime: number | null;
  isAuthenticated: boolean;
}

const initialState: initialStateType = {
  isSidebarCollapsed: false,
  isDarkMode: false,
  user: null,
  token: null,
  expireTime: null,
  isAuthenticated: false,
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setIsSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    setIsdarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    setAuthData: (
      state,
      action: PayloadAction<{ user: User; token: string; expireTime: number }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.expireTime = action.payload.expireTime;
      state.isAuthenticated = true;
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.expireTime = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setIsSidebarCollapsed, setIsdarkMode, setAuthData, logoutUser } =
  globalSlice.actions;
export default globalSlice.reducer;
