import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../Helper/axiosInstance";
const initialState = {
    isLoggedIn: localStorage.getItem("isLoggedIn") || false,
    data: JSON.parse(localStorage.getItem("data")) || {},

};



export const AuthMe = createAsyncThunk("auth/me", async () => {
    try {

        const responsePromise = axiosInstance.get("/user/me");
        const response = await responsePromise;
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch hospitals");
    }
}
);



const LoginAuthSlice = createSlice({
    name: "LoginAuth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(AuthMe.fulfilled, (state, action) => {
                // localStorage.setItem("data", JSON.stringify(action?.payload?.user));
                // localStorage.setItem("isLoggedIn", true);
                // localStorage.setItem("role", action?.payload?.user?.role);
                // localStorage.setItem("token", action?.payload?.token);
                state.isLoggedIn = true;
                state.data = action?.payload;
            })
    },
});

export default LoginAuthSlice.reducer;