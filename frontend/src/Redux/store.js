import { configureStore } from '@reduxjs/toolkit';
import hospitalReducer from './hospitalSlice';
import doctorsReducer from './doctorSlice';
import appointment from './appointment';
import authSlice from './authSlice'
import LoginAuthSlice from './AuthLoginSlice'
import availabilityReducer from './availabilitySlice'
import dashboardReducer from './dashboardSlice';
 const store = configureStore({
  reducer: {
    auth:authSlice,
    hospitals: hospitalReducer,
    doctors: doctorsReducer,
    appointment:appointment,
    LoginAuth:LoginAuthSlice,
    availability:availabilityReducer,
    dashboard:dashboardReducer,
  },
});
export default store;