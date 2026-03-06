import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
const app = express();
import cors from 'cors'
app.use('/public', express.static('public'))

import { ALLOWED_ORIGINS } from './config/constants.js';

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true
}));

import userRouter from './router/user.router.js'
import appointmentRoute from './router/appointment.route.js';
import doctorRoutes from './router/doctor.route.js';
import hospitalRoutes from './router/hospital.route.js';
import StaffRoutes from './router/staff.route.js';
import AdminRoutes from './router/admin.route.js';
import DashboardRoutes from './router/userDashboardRoutes.js';
import { autoDoctorReset } from './middleware/autoDoctorReset.js';
app.use(autoDoctorReset);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/appointment', appointmentRoute)
app.use('/api/v1/doctor', doctorRoutes)
app.use('/api/v1/staff', StaffRoutes)
app.use('/api/v1/hospital', hospitalRoutes)
app.use('/api/v1/admin', AdminRoutes)
app.use('/api/v1/dashboard', DashboardRoutes)


app.use('/', (req, res) => {
  res.send('server is runing');
})
export default app