import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../Helper/axiosInstance";
import toast from "react-hot-toast";

export const GetStaff = createAsyncThunk('/get/staff', async (id) => {
    try {
        const response = axiosInstance.get(`/staff`)
        return (await response)?.data
    } catch (error) {
        toast.error(error?.response?.data?.message)
    }
})


export const StaffLogin = createAsyncThunk('/staff/login', async (data) => {
    try {
        const response = axiosInstance.post(`/staff/login`,data)
        toast.promise(response, {
            loading: 'login please wait.',
            success: (data) => data?.data?.message,

        })
        return (await response)?.data
    } catch (error) {
        toast.error(error?.response?.data?.message)
    }
})

export const StaffDelete = createAsyncThunk('/staff/delete', async (id) => {
    try {
        const response = axiosInstance.delete(`/staff/delete/${id}`)
        toast.promise(response, {
            loading: 'remove  please wait.',
            success: (data) => data?.data?.message,
           
        })
        return (await response)?.data
    } catch (error) {
        toast.error(error?.response?.data?.message)
    }
})
export const getStaffByHospitalId = createAsyncThunk('/staff/get', async (id) => {
    try {
       
        const response = axiosInstance.get(`/staff/${id}`)
        return (await response)?.data
    } catch (error) {
        // toast.error(error?.response?.data?.message)
    }
})