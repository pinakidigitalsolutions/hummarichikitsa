import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../Helper/axiosInstance";
import toast from "react-hot-toast";

const initialState = {
  hospitals: [],
  loading: false,
  error: null,
};


export const LoginHospital = createAsyncThunk('/hospital/login', async (data) => {
  try {
    const response = axiosInstance.post('/hospital/login', data);
    toast.promise(response, {
      loading: "Login please wait.....",
      success: (data) => {
        return data?.data?.message;
      }
    })
    return (await response)?.data
  } catch (error) {
    toast.error(error?.response?.data?.message)
  }
})


export const GetHospitalById = createAsyncThunk('/hospital/get', async (id) => {
  try {
    const response = axiosInstance.get(`/hospital/${id}`);
    return (await response)?.data
  } catch (error) {
    toast.error(error?.response?.data?.message)
  }
})


export const createHospital = createAsyncThunk('/create/hospital', async (data) => {
  try {
    const response = axiosInstance.post('/hospital', data);
    toast.promise(response, {
      loading: " please wait.....",
      success: (data) => {
        return data?.data?.message;
      },
    })
    return (await response)?.data
  } catch (error) {
    toast.error(error.response.data.message);
  }

})

export const getAllHospital = createAsyncThunk(
  "hospitals/getAll", // Changed to match slice name
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/hospital");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch hospitals");
    }
  }
);

const hospitalSlice = createSlice({
  name: "hospitals",
  initialState,
  reducers: {}, // Fixed typo (was `reducers` before)
  extraReducers: (builder) => {
    builder
      .addCase(getAllHospital.fulfilled, (state, action) => {
        state.loading = false;
        state.hospitals = action.payload;
        // localStorage.setItem("hospitals", JSON.stringify(action.payload));
      })
      .addCase(LoginHospital.fulfilled, (state, action) => {
        localStorage.setItem("data", JSON.stringify(action?.payload?.user));
        localStorage.setItem("isLoggedIn", true);
        localStorage.setItem("role", action?.payload?.user?.role);
        state.isLoggedIn = true;
        state.data = action?.payload?.user;
        state.role = action?.payload?.user?.role;
       
      })
  },
});

export default hospitalSlice.reducer;