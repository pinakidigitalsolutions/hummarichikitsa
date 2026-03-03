import { Router } from "express";
import { 
  ActiveDoctor, 
  ActiveDoctors, 
  addAvailability, 
  addBulkAvailability, 
  addDaySchedule, 
  addDoctorSlots, 
  ChangePassword, 
  changeStatus, 
  clearDoctorSlotsByDate, 
  createDoctor, 
  DeactivateAllDoctor, 
  deleteDoctor, 
  getAllDoctorSlots, 
  getAvailabilityByDateRange, 
  getDoctorAvailability, 
  getDoctorByHospitalId, 
  getDoctorById, 
  getDoctors, 
  getDoctorSchedule, 
  getDoctorSlotsByDate, 
  Login, 
  removeAvailability, 
  removeDoctorSlots, 
  updateDoctor, 
  updateDoctorSchedule, 
  updateDoctorSlots 
} from "../controller/doctor.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.js";

const router = Router();

// Authentication routes
router.post('/login', Login);

// Doctor CRUD routes
router.post("/", authenticate, authorize(["admin",'hospital']), upload.single('photo'), createDoctor);
router.get("/", getDoctors);
router.put("/change/password", authenticate, ChangePassword);
// router.get("/:id", authenticate, authorize(["admin",'hospital','doctor','staff']), getDoctorById);
router.get("/:hospitalId/hospital",getDoctorByHospitalId);
router.put("/:id", authenticate, authorize(["admin",'hospital','doctor']), upload.single('photo'), updateDoctor);
router.delete("/:id", authenticate, authorize(["admin",'hospital']), deleteDoctor);
router.put("/:id/active/doctor", authenticate, authorize(["doctor"]), ActiveDoctor);
router.post("/active", authenticate, authorize(["doctor"]), ActiveDoctors);

// SLOTS MANAGEMENT ROUTES
// router.post("/:id/slots", authenticate, authorize(["admin",'hospital','doctor']), addDoctorSlots);
// router.put("/:id/slots", authenticate, authorize(["admin",'hospital','doctor']), updateDoctorSlots);
// router.delete("/:id/slots", authenticate, authorize(["admin",'hospital','doctor']), removeDoctorSlots);
// router.delete("/:id/slots/clear", authenticate, authorize(["admin",'hospital','doctor']), clearDoctorSlotsByDate);
// router.get("/:id/slots/:date", authenticate, authorize(["admin",'hospital','doctor','staff']), getDoctorSlotsByDate);
// router.get("/:id/slots", authenticate, authorize(["admin",'hospital','doctor','staff']), getAllDoctorSlots);
router.patch("/DeactivateAllDoctor", authenticate , DeactivateAllDoctor);
router.post("/updateDoctorSchedule",authenticate,updateDoctorSchedule);
router.get('/getDoctorSchedule',authenticate ,getDoctorSchedule);
router.post("/changeStatus",authenticate,changeStatus)
// Add/update specific day schedule
// router.put("/:doctorId/schedule/:day", addDaySchedule);

export default router;