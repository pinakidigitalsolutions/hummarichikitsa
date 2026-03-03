import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../Helper/axiosInstance";
import toast from "react-hot-toast";

const initialState = {
    appointment: [],
    state : false,
    state: null,
};

export const AppointmentCreate = createAsyncThunk(
    "appointment/create", // Changed to match slice name
    async (data) => {
        try {
            const response = axiosInstance.post("/appointment", data);
            toast.promise(response, {
                loading: "Creating your appointment",
                success: (data) => {
                    return data?.data?.message;
                },
                error: (error) => {
                    return error?.response?.data?.message || "Failed to create appointment";
                }
            });

            return (await response).data
        } catch (error) {
            return toast.error(error.response?.data?.message || "Failed to create appointment");
        }
    }
);
export const AppointmentConferm = createAsyncThunk(
    "appointment/confirmd", // Changed to match slice name
    async (data) => {
        try {
            
            const response = axiosInstance.patch(`/appointment/${data}/status`);
            toast.promise(response, {
                loading: "complete your appointment...",
                success: (data) => {
                    return data?.data?.message;
                },
                error: (error) => {
                    return error?.response?.data?.message || "Failed to book appointment. Please try again."
                }
            });
             
            return (await response).data
        } catch (error) {
            return toast.error(error.response?.data?.message || "Appointment booking failed.");
        }
    }
);
export const AppointmentCancelled = createAsyncThunk(
    "appointment/cancel", // Changed to match slice name
    async (data) => {
        try {
            
            const response = axiosInstance.patch(`/appointment/${data}/cancel`, {
                "status":"cancelled"
            });
            toast.promise(response, {
                loading: "cancelled your appointment...",
                success: (data) => {
                    return data?.data?.message;
                },
                error: (error) => {
                    return error?.response?.data?.message || "Failed to cancelled appointment. Please try again."
                }
            });

            return (await response).data
        } catch (error) {
            return toast.error(error.response?.data?.message || "Appointment cancelled failed.");
        }
    }
);

export const todayAppointment = createAsyncThunk('/today/appintment',async()=>{
       try {
            const response = axiosInstance.get('/appointment/today');
            return (await response)?.data
        } catch (error) {
            return toast.error(error.response?.data?.message);
        }
})

export const getAppointmentById = createAsyncThunk('/get/appintment',async(id)=>{
       try {
            const response = axiosInstance.get(`/appointment/${id}`);
            return (await response)?.data
        } catch (error) {
            return toast.error(error.response?.data?.message);
        }
})

export const getAllAppointment = createAsyncThunk(
    "appointment/getAll", // Changed to match slice name "appointment"
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/appointment/");
            // console.log("Appointment data from API:", response.data); // Log API response
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch appointments");
        }
    }
);

const appointmentSlice = createSlice({
    name: "appointment",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllAppointment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllAppointment.fulfilled, (state, action) => {
                state.loading = false;
                state.appointment = action.payload; // Changed from appointment to appointments
                // console.log("Appointment data in reducer:", action.payload); // Log the payload
            })
            .addCase(getAllAppointment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default appointmentSlice.reducer;