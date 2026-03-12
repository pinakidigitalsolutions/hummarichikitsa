import "./App.css";
import "./Loader.css";
import Loading from "./components/Loading";
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import RequireAuth from "./components/RequireAuth";
import NotRequireAuth from "./components/NotRequireAuth";
import AdminRequire from "./components/AdminRequire";
import InternetChecker from "./components/InternetChecker";

// frequently used pages
import Home from "./page/Home";
import DoctorListPage from "./page/DoctorListPage";
import HospitalListPage from "./page/HospitalListPage";
import DoctorDetailPage from "./page/DoctorDetailPage";
import DoctorDashboard from "./page/doctors/DoctorDashboard";
import Patients from "./page/doctors/Patients";
import Appointment from "./page/Appointment";
import AppointmentDetails from "./page/doctors/Appointment";
import AppointmentDetailsPage from "./page/AppointmentDetails";
import BookAppointment from "./page/admin/BookAppointment";

import SignInButton from "./page/SignInButton";
import Setting from "./page/admin/Setting";
import DoctorSetting from "./page/doctors/DoctorSetting";
import UserProfilePopup from "./page/Profile";
import AnalyticsDashboard from "./page/admin/Analytics";
import BusinessScheduler from "./page/doctors/BusinessScheduler";

// lazy pages
const PaymentPage = lazy(() => import("./page/PaymentPage"));
const ConfirmationPage = lazy(() => import("./page/ConfirmationPage"));
const DoctorLogin = lazy(() => import("./page/doctors/DoctorLogin"));
const HospitalForm = lazy(() => import("./page/admin/HospitalForm"));
const HospitalList = lazy(() => import("./page/admin/HospitalList"));
const DoctorList = lazy(() => import("./page/admin/DoctorList"));
const DoctorForm = lazy(() => import("./page/admin/DoctorForm"));
const MyHospital = lazy(() => import("./page/admin/MyHospital"));
const Denied = lazy(() => import("./components/Denied"));
const HospitalDetails = lazy(() => import("./page/admin/HospitalDetails"));
const DoctorDetailsPage = lazy(() => import("./page/doctors/DoctorDetails"));
const StaffRegistrationForm = lazy(() => import("./page/admin/StaffRegister"));
const Payment = lazy(() => import("./page/Payment"));
const UpdateDoctor = lazy(() => import("./page/admin/UpdateDoctor"));
const Schedule = lazy(() => import("./page/doctors/Schedule"));
const NotFoundPage = lazy(() => import("./components/NotFoundPage"));
const Contact = lazy(() => import("./page/Contact"));

function App() {
  return (
    <InternetChecker>
      <Suspense fallback={<Loading />}>
        <Routes>

          {/* Public home page - accessible to all */}
          <Route path="/" element={<Home />} />

          {/* Public login routes */}
          <Route element={<NotRequireAuth />}>
            <Route path="/login" element={<SignInButton />} />
            <Route path="/doctor/login" element={<DoctorLogin />} />
          </Route>

          <Route path="/payment" element={<Payment />} />

          {/* Common authenticated routes */}
          <Route element={<AdminRequire allowedRoles={["doctor", "hospital", "admin", "staff"]} />}>
            <Route path="/profile" element={<UserProfilePopup />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/hospitals" element={<HospitalListPage />} />
            <Route path="/hospitals/:hospitalId/doctors" element={<DoctorListPage />} />

            <Route path="/doctors/:doctorId" element={<DoctorDetailPage />} />

            <Route path="/appointments" element={<Appointment />} />
            <Route path="/payment/:appointmentId" element={<PaymentPage />} />
            <Route path="/confirmation/:appointmentId" element={<ConfirmationPage />} />

            <Route path="/appointment_details_page/:id" element={<AppointmentDetailsPage />} />
          </Route>

          <Route path="/analytics/dashboard" element={<AnalyticsDashboard />} />

          {/* Doctor / hospital / admin */}
          <Route element={<RequireAuth allowedRoles={["doctor", "hospital", "admin", "staff"]} />}>
            <Route path="/dashboard" element={<AnalyticsDashboard />} />
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/patient" element={<Patients />} />
            <Route path="/book/appointment" element={<BookAppointment />} />
            <Route path="/appointment/:id" element={<AppointmentDetails />} />
            <Route path="/hospital/setting" element={<Setting />} />
          </Route>

          {/* Admin */}
          <Route element={<RequireAuth allowedRoles={["admin"]} />}>
            <Route path="/hospital/list" element={<HospitalList />} />
            <Route path="/hospital/create" element={<HospitalForm />} />
          </Route>

          {/* Doctor */}
          <Route element={<RequireAuth allowedRoles={["doctor"]} />}>
            <Route path="/schedule/:id" element={<Schedule />} />
            <Route path="/doctor/setting" element={<DoctorSetting />} />
            <Route path="/doctor/add/slot" element={<BusinessScheduler />} />
          </Route>

          {/* Hospital / Admin */}
          <Route element={<RequireAuth allowedRoles={["hospital", "admin"]} />}>
            <Route path="/staff/register/:hospitalid" element={<StaffRegistrationForm />} />
            <Route path="/doctor/list/:hospitalId" element={<DoctorList />} />
            <Route path="/doctor/create/:hospitalId" element={<DoctorForm />} />

            <Route path="/hospital" element={<MyHospital />} />
            <Route path="/hospital/:id" element={<HospitalDetails />} />

            <Route path="/admin/doctor/:doctorId" element={<DoctorDetailsPage />} />
            <Route path="/update/doctor/:doctorid" element={<UpdateDoctor />} />
          </Route>

          {/* Error pages */}
          <Route path="/denied" element={<Denied />} />
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </Suspense>
    </InternetChecker>
  );
}

export default App;