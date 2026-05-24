import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../Helper/axiosInstance";
const initialState = {
    isLoggedIn: localStorage.getItem("isLoggedIn") || false,
    data: JSON.parse(localStorage.getItem("data")) || {},

};



export const AuthMe = createAsyncThunk("auth/me", async () => {
    try {

        const responsePromise = axiosInstance.get("/user/me", { skipCache: true });
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
                // Persist updated auth data so reloads reflect latest info
                try {
                    localStorage.setItem("data", JSON.stringify(action?.payload));
                    localStorage.setItem("isLoggedIn", true);
                    if (action?.payload?.user?.role) localStorage.setItem("role", action.payload.user.role);
                    if (action?.payload?.token) localStorage.setItem("token", action.payload.token);
                } catch (err) {
                    console.warn('Failed to persist auth data to localStorage', err);
                }
                state.isLoggedIn = true;
                state.data = action?.payload;
            })
    },
});

export default LoginAuthSlice.reducer;