import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../Helper/axiosInstance";
import toast from "react-hot-toast";

const initialState = {
    appointment: [],
    todayAppointments: [],
    loading: false,
    todayLoading: false,
    error: null,
    lastFetchDate: null, // Track when appointments were last fetched
    todayFetchTime: null, // Track when today's appointments were last fetched
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
    reducers: {
        clearTodayAppointments: (state) => {
            state.todayAppointments = [];
            state.todayFetchTime = null;
        },
        clearAllAppointments: (state) => {
            state.appointment = [];
            state.lastFetchDate = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // getAllAppointment handlers
            .addCase(getAllAppointment.pending, (state) => {
                if (!state.appointment || state.appointment.length === 0) {
                    state.loading = true;
                }
                state.error = null;
            })
            .addCase(getAllAppointment.fulfilled, (state, action) => {
                state.loading = false;
                state.appointment = action.payload;
                state.lastFetchDate = new Date().toISOString().split('T')[0];
            })
            .addCase(getAllAppointment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // todayAppointment handlers
            .addCase(todayAppointment.pending, (state) => {
                state.todayLoading = true;
                state.error = null;
            })
            .addCase(todayAppointment.fulfilled, (state, action) => {
                state.todayLoading = false;
                state.todayAppointments = action.payload?.appointments || action.payload?.data || [];
                state.todayFetchTime = new Date().getTime();
            })
            .addCase(todayAppointment.rejected, (state, action) => {
                state.todayLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearTodayAppointments, clearAllAppointments } = appointmentSlice.actions;
export default appointmentSlice.reducer;