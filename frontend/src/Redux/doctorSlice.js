import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../Helper/axiosInstance";
import toast from "react-hot-toast";

const initialState = {
  doctors: [],
  loading: false,
  error: null,
};


export const RegisterDoctor = createAsyncThunk('/register/doctor', async (data) => {
  try {
    const response = axiosInstance.post('doctor', data)
    toast.promise(response, {
      loading: 'wait doctor register',
      success: (data) => {
        return data?.data?.message
      }

    })
    return (await response)?.data
  } catch (error) {
    
    toast.error(error?.response?.data?.message)
  }
})
export const RegisterDoctorUpdate = createAsyncThunk('/register/doctor/update', async (data) => {
  try {
    const {id,formData}=data;
    
    const response = axiosInstance.put(`/doctor/${id}`, formData)
    toast.promise(response, {
      loading: 'wait doctor update...',
      success: (data) => {
        return data?.data?.message
      }
    })
    return (await response)?.data
  } catch (error) {
   
    toast.error(error?.response?.data?.message)
  }
})


export const deleteDoctor = createAsyncThunk('delete/doctor', async (id) => {
  try {
    // console.log(id)
    const response = axiosInstance.delete(`doctor/${id}`,)
    toast.promise(response, {
      loading: 'wait delete',
      success: (data) => {
        return data?.data?.message
      }

    })
    //  console.log((await response)?.data)
    return (await response)?.data
  } catch (error) {

    toast.error(error?.response?.data?.message)
  }
})




export const loginDoctor = createAsyncThunk('/doctor/login', async (data) => {
  try {
    const response = axiosInstance.post('/doctor/login', data)
    toast.promise(response, {
      loading: 'login please wait.',
      success: (data) => data?.data?.message,

    })
    return (await response)?.data
  } catch (error) {
    toast.error(error?.response?.data?.message)
  }
})

export const Logout = createAsyncThunk('/logout', async () => {
  try {
    const response = axiosInstance.get('/user/logout')
    toast.promise(response, {
      loading: "wait.....",
      success: (data) => data?.data?.message
    })
    return (await response)?.data
  } catch (error) {
    toast.error(error?.response?.data?.message)
  }
})


export const GetDoctor = createAsyncThunk('/get/doctor', async (id) => {
  try {
    const response = axiosInstance.get(`/doctor/${id}`)
    return (await response)?.data
  } catch (error) {
    toast.error(error?.response?.data?.message)
  }
})
export const GetDoctorHospitalId = createAsyncThunk('/get/doctor/hospital', async (id) => {
  try {
    const response = axiosInstance.get(`/doctor/${id}/hospital`)
    return (await response)?.data
  } catch (error) {
    toast.error(error?.response?.data?.message)
  }
})

export const ChangePassword = createAsyncThunk('/doctor/change/password', async (data) => {
  try {
    const response = axiosInstance.put(`/doctor/change/password`,data)
    return (await response)?.data
  } catch (error) {
    toast.error(error?.response?.data?.message)
  }
})

export const getAllDoctors = createAsyncThunk(
  "doctors/getAll", // Changed to match slice name
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/doctor");
      // console.log("doctors data (API):", response.data); // Should log now
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch hospitals");
    }
  }
);


const doctordSlice = createSlice({
  name: "doctors",
  initialState,
  // reducers: {
  //   setDoctors: (state, action) => {
  //     state.doctors = action.payload;
  //   },
  //   updateDoctor: (state, action) => {
  //     const index = state.doctors.findIndex(
  //       (d) => d._id === action.payload._id
  //     );
  //     if (index !== -1) {
  //       // Existing doctor ko update karo
  //       state.doctors[index] = action.payload;
  //     } else {
  //       // Naya doctor add karo
  //       state.doctors.push(action.payload);
  //     }
  //   },
  // },
  reducers: {
    updateDoctorStatus: (state, action) => {
      const updatedDoctor = action.payload;
      const index = state.doctors.findIndex(d => d._id === updatedDoctor._id);
      if (index !== -1) {
        state.doctors[index] = updatedDoctor;
      } else {
        state.doctors.push(updatedDoctor);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
  },
});




export const { updateDoctorStatus } = doctordSlice.actions;
export default doctordSlice.reducer;