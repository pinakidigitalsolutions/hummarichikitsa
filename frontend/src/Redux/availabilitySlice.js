import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../Helper/axiosInstance';


// Async thunks
export const addAvailability = createAsyncThunk(
  'availability/addAvailability',
  async ({ doctorId, date, startTime, endTime,timeSlots,availabilityData }, { rejectWithValue }) => {
    try {
      
      const response = await axiosInstance.post(`/doctor/${doctorId}/availability`, {
        date,
        startTime,
        endTime,
        timeSlots,
        availabilityData
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add availability');
    }
  }
);

export const addBulkAvailability = createAsyncThunk(
  'availability/addBulkAvailability',
  async ({ doctorId, dates, startTime, endTime }, { rejectWithValue }) => {
    try {
      
      const response = await axiosInstance.post(`/doctor/${doctorId}/availability/bulk`, {
        dates,
        startTime,
        endTime
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add bulk availability');
    }
  }
);

export const removeAvailability = createAsyncThunk(
  'availability/removeAvailability',
  async ({ doctorId, dates }, { rejectWithValue }) => {
    try {
      
      const response =  axiosInstance.delete(`/doctor/${doctorId}/availability`, {
        data: { dates }
      });
      return (await response).data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove availability');
    }
  }
);

export const getDoctorAvailability = createAsyncThunk(
  'availability/getDoctorAvailability',
  async (doctorId, { rejectWithValue }) => {
    try {
      const response =  axiosInstance.get(`/doctor/${doctorId}/availability`);

      return (await response).data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch availability');
    }
  }
);

const availabilitySlice = createSlice({
  name: 'availability',
  initialState: {
    availability: [],
    loading: false,
    error: null,
    message: null,
    selectedDate: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setSelectedDates: (state, action) => {
      state.selectedDates = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Add Availability
      .addCase(addAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(addAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Bulk Availability
      .addCase(addBulkAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBulkAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(addBulkAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove Availability
      .addCase(removeAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(removeAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Doctor Availability
      .addCase(getDoctorAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDoctorAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.availability = action?.payload?.data?.doctor?.availability;
      })
      .addCase(getDoctorAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearMessage, setSelectedDate, setSelectedDates } = availabilitySlice.actions;
export default availabilitySlice.reducer;