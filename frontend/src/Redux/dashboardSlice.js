import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../Helper/axiosInstance";

const initialState = {
 dashboard: null,
 loading: false,
 error: null
};

export const getDashboardData = createAsyncThunk(
 "dashboard/get",
 async (params = {}, { rejectWithValue }) => {
   try {
     const response = await axiosInstance.get("/dashboard", { params });
     return response.data.data;
   } catch (error) {
     return rejectWithValue(error.response?.data?.message);
   }
 }
);

const dashboardSlice = createSlice({
 name: "dashboard",
 initialState,
 reducers: {},
 extraReducers: (builder) => {
   builder
     .addCase(getDashboardData.pending, (state) => {
       if (!state.dashboard) {
         state.loading = true;
       }
     })
     .addCase(getDashboardData.fulfilled, (state, action) => {
       state.loading = false;
       state.dashboard = action.payload;
     })
     .addCase(getDashboardData.rejected, (state, action) => {
       state.loading = false;
       state.error = action.payload;
     });
 }
});

export default dashboardSlice.reducer;