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
            const appointmentId = typeof data === 'object' ? data?.appointmentId : data;
            const forceComplete = typeof data === 'object' && data?.forceComplete === true;
            const url = forceComplete
                ? `/appointment/${appointmentId}/status?forceComplete=true`
                : `/appointment/${appointmentId}/status`;
            const response = forceComplete
                ? axiosInstance.patch(url, { forceComplete: true })
                : axiosInstance.patch(url);
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

export const markAppointmentPaid = createAsyncThunk(
    "appointment/markPaid",
    async (appointmentId, { rejectWithValue }) => {
        try {
            const response = axiosInstance.post('/doctor/changeStatus', { appointmentId });
            toast.promise(response, {
                loading: "Updating payment status...",
                success: (data) => data?.data?.message || "Payment updated",
                error: (error) => error?.response?.data?.message || "Failed to update payment status"
            });

            return (await response).data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to update payment status");
        }
    }
);

export const todayAppointment = createAsyncThunk('/today/appintment',async()=>{
       try {
            const response = axiosInstance.get('/appointment/today', { skipCache: true });
            return (await response)?.data
        } catch (error) {
            return toast.error(error.response?.data?.message);
        }
})

export const getAppointmentById = createAsyncThunk('/get/appintment',async(id)=>{
       try {
            const response = axiosInstance.get(`/appointment/${id}`, { skipCache: true });
            return (await response)?.data
        } catch (error) {
            return toast.error(error.response?.data?.message);
        }
})

export const getAllAppointment = createAsyncThunk(
    "appointment/getAll", // Changed to match slice name "appointment"
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/appointment/", { skipCache: true });
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
        mergeAppointmentFromSocket: (state, action) => {
            const updatedAppointment = action.payload;
            if (!updatedAppointment?._id) return;

            const index = state.appointment.findIndex((item) => item?._id === updatedAppointment._id);
            if (index !== -1) {
                state.appointment[index] = { ...state.appointment[index], ...updatedAppointment };
            } else {
                state.appointment.unshift(updatedAppointment);
            }

            const todayIndex = state.todayAppointments.findIndex((item) => item?._id === updatedAppointment._id);
            if (todayIndex !== -1) {
                state.todayAppointments[todayIndex] = { ...state.todayAppointments[todayIndex], ...updatedAppointment };
            }
        },
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
            })
            .addCase(AppointmentCreate.fulfilled, (state, action) => {
                const createdAppointment = action.payload?.savedAppointment;
                if (createdAppointment?._id) {
                    state.appointment.unshift(createdAppointment);
                }
            })
            .addCase(AppointmentConferm.fulfilled, (state, action) => {
                const updatedAppointment = action.payload;
                if (!updatedAppointment?._id) return;

                state.appointment = state.appointment.map((item) =>
                    item?._id === updatedAppointment._id ? { ...item, ...updatedAppointment } : item
                );
                state.todayAppointments = state.todayAppointments.map((item) =>
                    item?._id === updatedAppointment._id ? { ...item, ...updatedAppointment } : item
                );
            })
            .addCase(AppointmentCancelled.fulfilled, (state, action) => {
                const updatedAppointment = action.payload?.appointment;
                if (!updatedAppointment?._id) return;

                state.appointment = state.appointment.map((item) =>
                    item?._id === updatedAppointment._id ? { ...item, ...updatedAppointment } : item
                );
                state.todayAppointments = state.todayAppointments.map((item) =>
                    item?._id === updatedAppointment._id ? { ...item, ...updatedAppointment } : item
                );
            })
            .addCase(markAppointmentPaid.fulfilled, (state, action) => {
                const updatedAppointment = action.payload?.appointment;
                if (!updatedAppointment?._id) return;

                state.appointment = state.appointment.map((item) =>
                    item?._id === updatedAppointment._id ? { ...item, ...updatedAppointment } : item
                );
                state.todayAppointments = state.todayAppointments.map((item) =>
                    item?._id === updatedAppointment._id ? { ...item, ...updatedAppointment } : item
                );
            });
    },
});

export const { mergeAppointmentFromSocket, clearTodayAppointments, clearAllAppointments } = appointmentSlice.actions;
export default appointmentSlice.reducer;