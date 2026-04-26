import Razorpay from 'razorpay';
import crypto from 'crypto'
import dotenv from 'dotenv';
dotenv.config()
import mongoose from "mongoose";
import apponitment from "../model/apponitment.js";
import User from '../model/user.model.js';
import io from '../index.js';
import doctorNodel from '../model/doctor.nodel.js';
import hospitalModel from '../model/hospital.model.js';
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

export const createAppointment = async (req, res) => {
    const formatLocalDate = (inputDate) => {
        const date = new Date(inputDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatted = formatLocalDate(new Date());
        const getDayNameFromDate = (inputDate) => {
            const date = new Date(inputDate);
            return date.toLocaleDateString('en-US', { weekday: 'long' });
        };
    const formatTimeTo12Hour = (time24) => {
        if (!time24 || typeof time24 !== 'string') return '';
        const [hours, minutes] = time24.split(':').map(Number);
        if (Number.isNaN(hours) || Number.isNaN(minutes)) return '';

        const period = hours >= 12 ? 'PM' : 'AM';
        let hours12 = hours % 12;
        hours12 = hours12 === 0 ? 12 : hours12;
        return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    const timeToMinutes = (time) => {
        if (!time || typeof time !== 'string') return null;
        const [hours, minutes] = time.split(':').map(Number);
        if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
        return hours * 60 + minutes;
    };

    const parseSlotTimes = (slotString) => {
        if (!slotString || !slotString.includes(' - ')) return { start: null, end: null };
        const parts = slotString.split(' - ');
        return {
            start: timeToMinutesAny(parts[0]),
            end: timeToMinutesAny(parts[1])
        };
    };

    const timeToMinutesAny = (timeStr) => {
        if (!timeStr) return null;
        const cleanTime = timeStr.trim().toUpperCase();
        
        // Handle HH:MM (24h)
        if (!cleanTime.includes('AM') && !cleanTime.includes('PM')) {
            return timeToMinutes(cleanTime);
        }

        // Handle 12h format (09:00 AM)
        const match = cleanTime.match(/(\d+):(\d+)\s*(AM|PM)/);
        if (!match) return null;

        let hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        const period = match[3];

        if (period === 'PM' && hours < 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        return hours * 60 + minutes;
    };

    const buildSlotString = (slotData) => {
        const start = formatTimeTo12Hour(slotData?.startTime);
        const end = formatTimeTo12Hour(slotData?.endTime);
        if (!start || !end) return '';
        return `${start} - ${end}`;
    };


    try {
        const {
            patient,
            mobile,
            dob,
            patientId,
            doctorId,
            hospitalId,
            date,
            slot,
            startTime,
            endTime,
            amount,
            booking_amount,
            paymentStatus
        } = req.body;
        if (
            !patient ||
            !doctorId ||
            !hospitalId ||
            !date ||
            !booking_amount
        ) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        
        const doctor = await doctorNodel.findById(doctorId)

        const hospital = await hospitalModel.findById(hospitalId)

        if (doctor?.bookingEnabled === false) {
            return res.status(400).json({
                success: false,
                message: "Booking is disabled for this doctor"
            });
        }

        if (!doctor.status && req.user.role === 'patient') {
            return res.status(400).json({
                success: false,
                message: "Doctor is Inactive. Patients cannot book appointments."
            });
        }


        if (!hospital.status) {
            return res.status(400).json({
                success: false,
                message: `Hospital In Active`
            })
        }

        const existingAppointments = await apponitment.find({
            doctorId: doctorId,
            date: date,
            status: { $ne: 'cancelled' }
        });

        const dayName = getDayNameFromDate(date);
        const daySchedule = doctor?.weeklySchedule?.get
            ? doctor.weeklySchedule.get(dayName)
            : doctor?.weeklySchedule?.[dayName];

        const scheduleSlots = Array.isArray(daySchedule?.slots) ? daySchedule.slots : [];
        let slotString = typeof slot === 'string' ? slot.trim() : '';
        let selectedSlot = null;
        let rangeHadSlots = false;

        if (startTime && endTime && scheduleSlots.length > 0) {
            const exactMatch = scheduleSlots.find((weekSlot) => (
                timeToMinutes(weekSlot.startTime) === timeToMinutes(startTime) && 
                timeToMinutes(weekSlot.endTime) === timeToMinutes(endTime)
            ));

            if (exactMatch) {
                selectedSlot = exactMatch;
            } else {
                const requestedStart = timeToMinutes(startTime);
                const requestedEnd = timeToMinutes(endTime);

                if (requestedStart !== null && requestedEnd !== null && requestedStart < requestedEnd) {
                    const candidates = scheduleSlots
                        .filter((weekSlot) => {
                            const slotStart = timeToMinutes(weekSlot.startTime);
                            const slotEnd = timeToMinutes(weekSlot.endTime);

                            if (slotStart === null || slotEnd === null) return false;
                            return slotStart >= requestedStart && slotEnd <= requestedEnd;
                        })
                        .sort((firstSlot, secondSlot) => {
                            return timeToMinutes(firstSlot.startTime) - timeToMinutes(secondSlot.startTime);
                        });

                    rangeHadSlots = candidates.length > 0;

                    for (const candidate of candidates) {
                        if (candidate.bookingEnabled === false) {
                            continue;
                        }

                        if (Number.isInteger(candidate.maxAppointments) && candidate.maxAppointments > 0) {
                            // Find the entire contiguous block this candidate belongs to
                            // (Slots with same capacity and same booking status)
                            let blockStart = timeToMinutes(candidate.startTime);
                            let blockEnd = timeToMinutes(candidate.endTime);
                            
                            // Look backwards
                            let idx = scheduleSlots.findIndex(s => s.startTime === candidate.startTime);
                            for (let i = idx - 1; i >= 0; i--) {
                                const prev = scheduleSlots[i];
                                if (prev.maxAppointments === candidate.maxAppointments && 
                                    prev.bookingEnabled === candidate.bookingEnabled &&
                                    timeToMinutes(prev.endTime) === blockStart) {
                                    blockStart = timeToMinutes(prev.startTime);
                                } else {
                                    break;
                                }
                            }
                            // Look forwards
                            for (let i = idx + 1; i < scheduleSlots.length; i++) {
                                const next = scheduleSlots[i];
                                if (next.maxAppointments === candidate.maxAppointments && 
                                    next.bookingEnabled === candidate.bookingEnabled &&
                                    timeToMinutes(next.startTime) === blockEnd) {
                                    blockEnd = timeToMinutes(next.endTime);
                                } else {
                                    break;
                                }
                            }

                            const bookedCountInBlock = existingAppointments.filter((appointment) => {
                                let appStart = timeToMinutes(appointment.startTime);
                                let appEnd = timeToMinutes(appointment.endTime);
                                
                                // Fallback for existing appointments without explicit time fields
                                if (appStart === null || appEnd === null) {
                                    const parsed = parseSlotTimes(appointment.slot);
                                    appStart = parsed.start;
                                    appEnd = parsed.end;
                                }

                                if (appStart === null || appEnd === null) return false;
                                return appStart >= blockStart && appEnd <= blockEnd;
                            }).length;

                            if (bookedCountInBlock >= candidate.maxAppointments) {
                                continue;
                            }
                        }

                        selectedSlot = candidate;
                        break;
                    }

                    if (!selectedSlot) {
                        const message = rangeHadSlots 
                            ? "This time range is fully booked. Please select another slot."
                            : "No available slots found in this time range.";
                        return res.status(400).json({ success: false, message });
                    }
                }
            }
        }

        if (!selectedSlot && slotString && scheduleSlots.length > 0) {
            const matchedSlot = scheduleSlots.find((weekSlot) => {
                const weekSlotString = buildSlotString(weekSlot);
                return weekSlotString === slotString;
            });

            if (matchedSlot) {
                selectedSlot = matchedSlot;
            }
        }

        if (selectedSlot) {
            if (selectedSlot.bookingEnabled === false) {
                return res.status(400).json({
                    success: false,
                    message: "No more booking for this time slot"
                });
            }

            if (Number.isInteger(selectedSlot.maxAppointments) && selectedSlot.maxAppointments > 0) {
                // Find the entire contiguous block this selectedSlot belongs to
                let blockStart = timeToMinutes(selectedSlot.startTime);
                let blockEnd = timeToMinutes(selectedSlot.endTime);
                
                let idx = scheduleSlots.findIndex(s => s.startTime === selectedSlot.startTime && s.endTime === selectedSlot.endTime);
                if (idx !== -1) {
                    // Look backwards
                    for (let i = idx - 1; i >= 0; i--) {
                        const prev = scheduleSlots[i];
                        if (prev.maxAppointments === selectedSlot.maxAppointments && 
                            prev.bookingEnabled === selectedSlot.bookingEnabled &&
                            timeToMinutes(prev.endTime) === blockStart) {
                            blockStart = timeToMinutes(prev.startTime);
                        } else {
                            break;
                        }
                    }
                    // Look forwards
                    for (let i = idx + 1; i < scheduleSlots.length; i++) {
                        const next = scheduleSlots[i];
                        if (next.maxAppointments === selectedSlot.maxAppointments && 
                            next.bookingEnabled === selectedSlot.bookingEnabled &&
                            timeToMinutes(next.startTime) === blockEnd) {
                            blockEnd = timeToMinutes(next.endTime);
                        } else {
                            break;
                        }
                    }
                }

                const bookedCount = existingAppointments.filter((appointment) => {
                    let appStart = timeToMinutes(appointment.startTime);
                    let appEnd = timeToMinutes(appointment.endTime);
                    
                    if (appStart === null || appEnd === null) {
                        const parsed = parseSlotTimes(appointment.slot);
                        appStart = parsed.start;
                        appEnd = parsed.end;
                    }

                    if (appStart === null || appEnd === null) return false;
                    return appStart >= blockStart && appEnd <= blockEnd;
                }).length;

                if (bookedCount >= selectedSlot.maxAppointments) {
                    return res.status(400).json({
                        success: false,
                        message: "This time range is already fully booked."
                    });
                }
            }

            slotString = buildSlotString(selectedSlot);
        }

        if (!slotString && startTime && endTime) {
            const start = formatTimeTo12Hour(startTime);
            const end = formatTimeTo12Hour(endTime);
            if (start && end) {
                slotString = `${start} - ${end}`;
            }
        }

        if (!slotString) {
            return res.status(400).json({
                success: false,
                message: "A valid time slot is required for this booking."
            });
        }

        const newAppointment = new apponitment({
            patient,
            mobile,
            dob,
            patientId,
            doctorId,
            hospitalId,
            date,
            slot: slotString,
            startTime: selectedSlot ? selectedSlot.startTime : startTime,
            endTime: selectedSlot ? selectedSlot.endTime : endTime,
            amount,
            booking_amount,
            paymentMethod: 'Cash',
            paymentStatus: 'pending',
            appointmentNumber: existingAppointments.length + 1
        });
        const savedAppointment = await newAppointment.save();

        const appointmentDate = typeof date === 'string' ? date.split('T')[0] : formatLocalDate(date);

        if (appointmentDate === formatted) {
            io.emit("createAppointment", savedAppointment)
        }
        return res.status(201).json({
            success: true,
            savedAppointment
        });
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: error.message });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Verify the payment signature
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, error: 'Invalid signature' });
        }

        // Update appointment
        const appointment = await apponitment.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            {
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                status: 'confirmed',
                paymentStatus: "completed"

            },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ success: false, error: 'Appointment not found' });
        }

        res.json({ success: true, appointment });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, error: 'Server error' });
    }
}

// Get all appointments
export const getAppointments = async (req, res) => {
    try {
        const { role, _id } = req.user;
        const user = await User.findById(_id)
        let query = {};
        // Filter based on user role
        if (role === "patient") {
            query = {
                $or: [
                    { patientId: _id },
                    { mobile: user?.userid }
                ]
            };

        } else if (role === "doctor") {
            query.doctorId = _id;
        } else if (role === "hospital") {
            query.hospitalId = _id;
        } else if (role === "staff") {
            query.hospitalId = req.user.hospitalId;
        }

        const appointments = await apponitment.find(query)
            .populate("doctorId", "currentAppointment availability name specialty")
            .populate("hospitalId", "name city")
            .sort({ createdAt: -1 });

        return res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single appointment by ID
// export const getAppointmentById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         if (!mongoose.Types.ObjectId.isValid(id)) {
//             return res.status(400).json({ message: "Invalid appointment ID" });
//         }
//         const appointments = await apponitment.findById(id)
//             .populate("patientId", "name email mobile")
//             .populate("doctorId", "name specialty experience")
//             .populate("hospitalId", "name email location address phone city state");

//         if (!appointments) {
//             return res.status(404).json({ message: "Appointment not found" });
//         }

//         // Check if the requesting user has permission to view this appointment
//         // const { role, userId } = req.user;
//         // if (
//         //     role !== "admin" &&
//         //     appointment.patientId._id.toString() !== userId &&
//         //     appointment.doctorId._id.toString() !== userId &&
//         //     appointment.hospitalId._id.toString() !== userId
//         // ) {
//         //     return res.status(403).json({ message: "Unauthorized access" });
//         // }

//         res.status(200).json(appointments);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
export const getAppointmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.query; // 👈 get status from query (optional)

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid appointment ID" });
        }

        // Build filter object dynamically
        const filter = { _id: id };
        if (status) {
            filter.status = status; // add status filter only if provided
        }

        const appointment = await apponitment.findOne(filter)
            .populate("patientId", "name email mobile")
            .populate("doctorId", "name specialty experience")
            .populate("hospitalId", "name email location address phone city state");

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        res.status(200).json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllDashboard = async (req, res) => {
    try {
        const { role, _id } = req.user;
        const user = await User.findById(_id)
        let query = {};
        // Filter based on user role
        if (role === "patient") {
            query = {
                $or: [
                    { patientId: _id },
                    { mobile: user?.userid }
                ]
            };

        } else if (role === "doctor") {
            query.doctorId = _id;
        } else if (role === "hospital") {
            query.hospitalId = _id;
        } else if (role === "staff") {
            query.hospitalId = req.user.hospitalId;
        }

        const appointments = await apponitment.find(query)
            .populate("doctorId", "currentAppointment");

        return res.status(200).json({
            total_appointment: appointments.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
    try {
        const user = req.user;
        const userId = user?._id || user?.id;
        const { id } = req.params;
        var status = null;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid appointment ID" });
        }

        // if (!status || !["confirmed", "cancelled", "completed",'check-in'].includes(status)) {
        //     return res.status(400).json({ message: "Invalid status value" });
        // }

        const forceComplete = req.query?.forceComplete === 'true' || req.body?.forceComplete === true;

        // Doctor-specific availability guard
        if (user?.role === "doctor") {
            const doctor = await doctorNodel.findById(userId).select("active");
            if (!doctor) {
                return res.status(404).json({
                    success: false,
                    message: "Doctor not found"
                });
            }

            if (!doctor.active && !forceComplete) {
                return res.status(200).json({
                    success: false,
                    message: "Doctor inactive"
                });
            }
        }

        const appointment = await apponitment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (forceComplete) {
            if (appointment.status !== 'completed' && appointment.status !== 'cancelled') {
                status = 'completed';
            }
        } else if (appointment.status === 'confirmed') {
            status = 'check-in';
            // Update doctor's current appointment when someone checks in
            await doctorNodel.findByIdAndUpdate(
                appointment.doctorId,
                { currentAppointment: appointment.appointmentNumber },
                { new: true }
            );
        } else if (appointment.status === 'check-in') {
            status = 'completed';
        } else if (appointment.status === 'pending') {
            status = 'confirmed';
        }

        if (status) {
            appointment.status = status;
            const newAppointment = await appointment.save();
            const updatedDoctor = await doctorNodel.findById(appointment.doctorId);

            io.emit("doctorUpdate", updatedDoctor);
            io.emit("appointmentUpdate", newAppointment);
            return res.json(newAppointment);
        }

        return res.status(400).json({ message: "Invalid status transition or appointment already completed" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cancel an appointment
export const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid appointment ID" });
        }

        const appointment = await apponitment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Check if the appointment can be cancelled (not already completed or cancelled)
        if (appointment.status === "completed") {
            return res
                .status(400)
                .json({ message: "Completed appointments cannot be cancelled" });
        }

        if (appointment.status === "cancelled") {
            return res
                .status(400)
                .json({ message: "Appointment is already cancelled" });
        }


        appointment.status = "cancelled";
        const updatedAppointment = await appointment.save();

        io.emit("appointmentUpdate", updatedAppointment);

        return res.status(200).json({
            success: true,
            message: "Appointment cancelled successfully.",
            appointment: updatedAppointment
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


export const getToDayAppointment = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const { doctorId } = req.query; // allow optional doctor filter (e.g. ?doctorId=xxxx)

        // Validate IDs
        if (!mongoose.Types.ObjectId.isValid(loggedInUserId)) {
            return res.status(400).json({ message: "Invalid logged-in user ID" });
        }
        if (doctorId && !mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ message: "Invalid doctor ID filter" });
        }

        // Format today's date as YYYY-MM-DD
        const today = new Date().toISOString().split("T")[0];

        // Build base query
        let query = {
            date: today,
            status: { $ne: "cancelled" },
        };

        // Role-based filtering
        if (req.user.role === "hospital") {
            query.hospitalId = loggedInUserId;
        } else if (req.user.role === "doctor") {
            query.doctorId = loggedInUserId;
        } else if (req.user.role === "staff") {
            query.hospitalId = req.user.hospitalId;
        }

        // Apply doctor filter if provided
        if (doctorId) {
            query.doctorId = doctorId;
        }

        // Fetch appointments
        const appointments = await apponitment
            .find(query)
            .populate("doctorId", "name specialty")
            .populate("patientId", "name mobile email");

        return res.status(200).json({
            success: true,
            count: appointments.length,
            appointments,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// export const getToDayAppointment = async (req, res) => {
//     try {
//         const doctorId = req.user._id;
//         const { id } = req.params;
//         if (!mongoose.Types.ObjectId.isValid(doctorId)) {
//             return res.status(400).json({ message: "Invalid doctor ID" });
//         }
//         // Get start and end of today
//         const today = new Date();
//         const formatted = today.toISOString().split("T")[0];
//         // Get all appointments for this doctor created today that aren't cancelled
//         let appointments = null;
//         if (req.user.role == 'hospital') {
//             const appointment = await apponitment.find({
//                 hospitalId: doctorId,
//                 date: formatted,
//                 status: { $ne: 'cancelled' } // Exclude cancelled appointments
//             });

//             appointments = appointment
//         }
//         if (req.user.role == 'doctor') {

//             const appointment = await apponitment.find({
//                 doctorId,
//                 date: formatted,
//                 status: { $ne: 'cancelled' } // Exclude cancelled appointments
//             });

//             appointments = appointment

//         }

//         if (req.user.role == 'staff') {
//             const appointment = await apponitment.find({
//                 hospitalId: req.user.hospitalId,
//                 date: formatted,
//                 status: { $ne: 'cancelled' } // Exclude cancelled appointments
//             });
//             appointments = appointment
//         }

//         if (req.user.role == 'admin') {
//             const appointment = await apponitment.find({
//                 date: formatted,
//                 status: { $ne: 'cancelled' }
//             });

//             appointments = appointment
//         }




//         return res.status(200).json({
//             success: true,
//             appointments
//         });
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// }
// Get available slots for a doctor on a specific date
export const getAvailableSlots = async (req, res) => {
    try {
        const { doctorId, date } = req.params;

        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ message: "Invalid doctor ID" });
        }

        // Get all appointments for this doctor on this date that aren't cancelled
        const appointments = await Appointment.find({
            doctorId,
            date,
            status: { $ne: "cancelled" },
        });

        // This assumes you have some way to determine all possible slots
        // You might want to get this from the Doctor's schedule
        const allSlots = [
            "09:00-10:00",
            "10:00-11:00",
            "11:00-12:00",
            "12:00-13:00",
            "14:00-15:00",
            "15:00-16:00",
            "16:00-17:00",
        ];

        // Get booked slots
        const bookedSlots = appointments.map((appt) => appt.slot);

        // Filter out booked slots
        const availableSlots = allSlots.filter(
            (slot) => !bookedSlots.includes(slot)
        );

        res.status(200).json({ availableSlots });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid appointment ID" });
        }

        if (
            !paymentStatus ||
            !["pending", "completed", "failed"].includes(paymentStatus)
        ) {
            return res.status(400).json({ message: "Invalid payment status" });
        }

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Typically only admin or payment system should update payment status
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Unauthorized access" });
        }

        appointment.paymentStatus = paymentStatus;
        const updatedAppointment = await appointment.save();

        res.status(200).json(updatedAppointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAppointmentBydoctorIdAndHospitalIdAndAdminId = async (req, res) => {
    try {
        const doctorId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ message: "Invalid doctor ID" });
        }
        let appointments = null;
        if (req.user.role == 'hospital') {
            const appointment = await apponitment.find({
                hospitalId: doctorId,

            });

            appointments = appointment
        }
        if (req.user.role == 'doctor') {
            const appointment = await apponitment.find({
                doctorId,
            });

            appointments = appointment
        }
        return res.status(200).json({
            success: true,
            appointments
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export const getAppointmentByAppointmentId = async (req, res) => {
    try {
        const { patientId, doctorId, hospitalId } = req.params;
        return res.send(req.params)
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
