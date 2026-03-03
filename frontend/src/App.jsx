
import './App.css'
import './Loader.css'
import Loading from './components/Loading';
import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from './components/RequireAuth';
import NotRequireAuth from './components/NotRequireAuth';
import InternetChecker from './components/InternetChecker';
import SignInButton from './page/SignInButton';
import Setting from './page/admin/Setting';
import DoctorSetting from './page/doctors/DoctorSetting';
import UserProfilePopup from './page/Profile';
import AdminRequire from './components/AdminRequire';
import AnalyticsDashboard from './page/admin/Analytics';
import PrivateRoute from './page/PrivateRoute';
import BusinessScheduler from './page/doctors/BusinessScheduler';


// import Homes from './pages/Dashboard/Home';
// import AppLayout from './AdminDashboard/layout/AppLayout'

const Home = lazy(() => import('./page/Home'));

import DoctorListPage from './page/DoctorListPage'
import HospitalListPage from './page/HospitalListPage'
import DoctorDetailPage from './page/DoctorDetailPage'
import PaymentPage from './page/PaymentPage'
import ConfirmationPage from './page/ConfirmationPage'
import DoctorDashboard from './page/doctors/DoctorDashboard'
import DoctorLogin from './page/doctors/DoctorLogin'
import HospitalForm from './page/admin/HospitalForm'
import HospitalList from './page/admin/HospitalList'
import DoctorList from './page/admin/DoctorList'
import DoctorForm  from './page/admin/DoctorForm'
import MyHospital from './page/admin/MyHospital'
import Denied  from './components/Denied'
import Patients from './page/doctors/Patients'
import AppointmentDetails  from './page/doctors/Appointment'
import AppointmentDetailsPage from './page/AppointmentDetails'
import HospitalDetails from './page/admin/HospitalDetails'
import DoctorDetailsPage  from './page/doctors/DoctorDetails'
// import HospitalUpdateForm from './page/admin/UpdateHospita'
import StaffRegistrationForm from './page/admin/StaffRegister'
import BookAppointment from './page/admin/BookAppointment'
import Payment from './page/Payment'
import UpdateDoctor from './page/admin/UpdateDoctor'
import Schedule from './page/doctors/Schedule'
import NotFoundPage from './components/NotFoundPage'
import Appointment from './page/Appointment'
import Contact from './page/Contact'
function App() {
  // const { isLoggedIn } = useSelector((state) => state?.auth)
  // useEffect(() => {
  //   // Right-click disable
  //   const handleContextMenu = (e) => e.preventDefault();
  //   document.addEventListener("contextmenu", handleContextMenu);

  //   // DevTools shortcuts disable
  //   const handleKeyDown = (e) => {
  //     if (
  //       e.key === "F12" ||
  //       (e.ctrlKey && e.shiftKey && ["I", "J"].includes(e.key)) ||
  //       (e.ctrlKey && e.key === "U")
  //     ) {
  //       e.preventDefault();
  //       alert("Inspect is disabled!");
  //     }
  //   };
  //   document.addEventListener("keydown", handleKeyDown);

  //   return () => {
  //     document.removeEventListener("contextmenu", handleContextMenu);
  //     document.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, []);

  return (

    <>
      <InternetChecker>

        <Suspense fallback={<Loading />}>
          <Routes>

            <Route element={<NotRequireAuth />}>
              {/* <Route path="/login" element={<MobileOTPLogin />} /> */}
              <Route path="/login" element={<SignInButton />} />
              <Route path='/doctor/login' element={<DoctorLogin />} />
            </Route>

            <Route path='/payment' element={<Payment />} />
            <Route element={<AdminRequire allowedRoles={["doctor", 'hospital', 'admin', 'staff']} />}>
              <Route path="/" element={<Home />} />
              
              <Route path="profile" element={<UserProfilePopup />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/hospitals/:hospitalId/doctors" element={<DoctorListPage />} />
              <Route path="/hospitals" element={<HospitalListPage />} />
              <Route path="/doctors/:doctorId" element={<DoctorDetailPage />} />
              <Route path="/appointments" element={<Appointment />} />
              <Route path="/payment/:appointmentId" element={<PaymentPage />} />
              <Route path="/confirmation/:appointmentId" element={<ConfirmationPage />} />
              <Route path="/appointment_details_page/:id" element={<AppointmentDetailsPage />} />
            </Route>
            <Route path="/analytics/dashboard" element={<AnalyticsDashboard />} />
            <Route element={<RequireAuth allowedRoles={["doctor", 'hospital', 'admin', 'staff']} />}>
              <Route path='/doctor/dashboard' element={<DoctorDashboard />} />
              <Route path='/patient' element={<Patients />} />
              <Route path='/book/appointment' element={<BookAppointment />} />
              <Route path='/appointment/:id' element={<AppointmentDetails />} />
              <Route path='/hospital/setting' element={<Setting />} />
            </Route>
            <Route element={<RequireAuth allowedRoles={["admin"]} />}>

              <Route path='/hospital/list' element={<HospitalList />} />
              <Route path='/hospital/create' element={<HospitalForm />} />

            </Route>

            <Route element={<RequireAuth allowedRoles={['doctor']} />}>
              <Route path='/schedule/:id' element={<Schedule />} />
              <Route path='/doctor/setting' element={<DoctorSetting />} />
              <Route path="/doctor/add/slot" element={<BusinessScheduler />} />
            </Route>

            <Route element={<RequireAuth allowedRoles={['hospital', "admin"]} />}>
              <Route path="/staff/register/:hospitalid" element={<StaffRegistrationForm />} />
              <Route path='/doctor/list/:hospitalId' element={<DoctorList />} />
              <Route path='/doctor/create/:hospitalId' element={<DoctorForm />} />
              <Route path='/hospital' element={<MyHospital />} />
              <Route path='/hospital/:id' element={<HospitalDetails />} />
              <Route path='/doctor/:doctorId' element={<DoctorDetailsPage />} />
              <Route path='/update/doctor/:doctorid' element={<UpdateDoctor />} />
              {/* <Route path='/hospital/update/:hospitalid' element={<HospitalUpdateForm />} /> */}
            </Route>


            {/* admin */}
            <Route path="*" element={<NotFoundPage />} />
            <Route path="/denied" element={<Denied />} />
          </Routes >
        </Suspense>
      </InternetChecker>
    </>
  )
}

export default App
