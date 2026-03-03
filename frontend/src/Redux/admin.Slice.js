import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../Helper/axiosInstance";
import toast from "react-hot-toast";


export const AdminLogin = createAsyncThunk('/admin/login', async (data) => {
  try {
    const response = axiosInstance.post('/admin/login', data)
    toast.promise(response, {
      loading: 'login please wait.',
      success: (data) => data?.data?.message,
    })
    return (await response)?.data
  } catch (error) {
    toast.error(error?.response?.data?.message)
  }
})

