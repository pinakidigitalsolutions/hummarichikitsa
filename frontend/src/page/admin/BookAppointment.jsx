import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GetDoctorHospitalId, getAllDoctors } from '../../Redux/doctorSlice';
import { AppointmentCreate } from '../../Redux/appointment';
import Dashboard from '../../components/Layout/Dashboard';
import axiosInstance from '../../Helper/axiosInstance';
import { jwtDecode } from "jwt-decode";
import { format, addDays, isToday, isTomorrow, isBefore } from 'date-fns';
import { motion } from 'framer-motion';

function BookAppointment() {
  const colors = { primary: '#0d9488' };
  const [isOpen, setIsOpen] = useState(false);
  const [whatsaapmessage, setwhatsaapMessage] = useState('');
  const [targetMobile, setTargetMobile] = useState('');

  // Helper function to convert 24-hour time to 12-hour format
  const formatTimeTo12Hour = (time24) => {
    if (!time24) return '';

    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    let hours12 = hours % 12;
    hours12 = hours12 === 0 ? 12 : hours12;
    const minutesStr = minutes.toString().padStart(2, '0');

    return `${hours12}:${minutesStr} ${period}`;
  };

  // Helper function to check if current time is within slot
  const isCurrentTimeInSlot = (slotStartTime, slotEndTime) => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

    const [startHours, startMinutes] = slotStartTime.split(':').map(Number);
    const startTimeInMinutes = startHours * 60 + startMinutes;

    const [endHours, endMinutes] = slotEndTime.split(':').map(Number);
    const endTimeInMinutes = endHours * 60 + endMinutes;

    return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
  };

  // Helper function to check if slot is selectable
  const isSlotSelectable = (slotStartTime, slotEndTime, slotDate) => {
    if (!isToday(new Date(slotDate))) return true;

    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

    const [startHours, startMinutes] = slotStartTime.split(':').map(Number);
    const startTimeInMinutes = startHours * 60 + startMinutes;

    if (isCurrentTimeInSlot(slotStartTime, slotEndTime)) {
      return true;
    }

    return currentTimeInMinutes < startTimeInMinutes;
  };

  // Helper function to get date label
  const getDateLabel = (date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, MMM d');
  };

  const getFormattedMessage = (data) => {
    const start = data?.startTime ? formatTimeTo12Hour(data.startTime) : "";
  const end = data?.endTime ? formatTimeTo12Hour(data.endTime) : "";

     const timeSlot =
    data?.slot ||
    (start && end ? `${start} - ${end}` : "");
    return `
Hello ${data.patient}, your appointment is confirmed.

Hospital: ${data?.hospital?.name}
Appointment No: ${data.appointmentNumber}
Token: ${data.token}

Date: ${data.date}
Time: ${timeSlot}

Booking Amount: ₹${data.booking_amount}
Payment: ${data.paymentStatus}

Track or manage your booking:
https://hummarichikitsa.vercel.app

Thank you – Hummari Chikitsa
    `.trim();
  };

  const handleWhatsAppSend = () => {
    const data = whatsaapmessage;
    const message = getFormattedMessage(data);

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/91${targetMobile || data.mobile}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSMSSend = () => {
    const data = whatsaapmessage;
    const message = getFormattedMessage(data);
    const smsUrl = `sms:${targetMobile || data.mobile}?body=${encodeURIComponent(message)}`;
    window.location.href = smsUrl;
  };

  // Date handling - New for next 7 days
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);

  const [hospitalId, setHospitalId] = useState(null);
  // const [doctors, setDoctors] = useState([]);
  const { doctors } = useSelector(state => state.doctors);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [activeSection, setActiveSection] = useState('patient');
  const [loading, setLoading] = useState({
    doctors: false,
    submitting: false
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const { isLoggedIn, data } = useSelector((store) => store.LoginAuth || {});
  const dispatch = useDispatch();

  const decoded = jwtDecode(localStorage.getItem('token'));

  // State management
  const [formData, setFormData] = useState({
    patient: '',
    mobile: '',
    dob: '',
    doctorId: '',
    booking_amount: '',
    paymentStatus: 'Cash',
    slot: '',
    startTime: '',
    endTime: ''
  });

  // Get time slots for selected date from doctor's weeklySchedule
  const getTimeSlotsForSelectedDate = (doctor, date) => {
    if (!date || !doctor?.weeklySchedule) return [];

    const selectedDay = format(new Date(date), 'EEEE');
    const daySchedule = doctor.weeklySchedule[selectedDay];

    if (!daySchedule || !daySchedule.enabled || !daySchedule.slots || daySchedule.slots.length === 0) {
      return [];
    }

    return daySchedule.slots.map(slot => {
      const startTime12 = formatTimeTo12Hour(slot.startTime);
      const endTime12 = formatTimeTo12Hour(slot.endTime);

      const selectable = isSlotSelectable(slot.startTime, slot.endTime, date);
      const isCurrentSlot = isToday(new Date(date)) &&
        isCurrentTimeInSlot(slot.startTime, slot.endTime);

      return {
        id: slot.slotId || `${selectedDay}-${slot.startTime}-${slot.endTime}`,
        time: `${startTime12} - ${endTime12}`,
        displayTime: `${startTime12} - ${endTime12}`,
        startTime: slot.startTime,
        endTime: slot.endTime,
        startTime12: startTime12,
        endTime12: endTime12,
        isCurrentSlot: isCurrentSlot,
        selectable: selectable
      };
    });
  };

  // Get available dates for next 7 days based on doctor's schedule
  const getAvailableDatesForDoctor = (doctor) => {
    if (!doctor?.weeklySchedule) return [];

    const today = new Date();
    const availableDates = [];

    // Get next 7 days including today
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i);
      const dateString = format(date, 'yyyy-MM-dd');
      const dayName = format(date, 'EEEE');

      // Skip if date is in the past (excluding today)
      if (isBefore(date, today) && !isToday(date)) {
        continue;
      }

      // Check if this day has enabled schedule with slots
      const daySchedule = doctor.weeklySchedule[dayName];
      if (daySchedule && daySchedule.enabled && daySchedule.slots && daySchedule.slots.length > 0) {
        // For today, count only selectable slots
        if (isToday(date)) {
          const now = new Date();
          const currentHours = now.getHours();
          const currentMinutes = now.getMinutes();
          const currentTimeInMinutes = currentHours * 60 + currentMinutes;

          const selectableSlots = daySchedule.slots.filter(slot => {
            const [slotStartHours, slotStartMinutes] = slot.startTime.split(':').map(Number);
            const slotStartTimeInMinutes = slotStartHours * 60 + slotStartMinutes;

            if (isCurrentTimeInSlot(slot.startTime, slot.endTime)) {
              return true;
            }

            return currentTimeInMinutes < slotStartTimeInMinutes;
          });

          if (selectableSlots.length > 0) {
            availableDates.push({
              date: dateString,
              label: getDateLabel(date),
              day: dayName,
              slots: selectableSlots.length,
              isToday: true
            });
          }
        } else {
          availableDates.push({
            date: dateString,
            label: getDateLabel(date),
            day: dayName,
            slots: daySchedule.slots.length,
            isToday: false
          });
        }
      }
    }

    return availableDates;
  };

useEffect(() => {
  const fetchDoctors = async () => {
    try {
      setLoading(prev => ({ ...prev, doctors: true }));

      const userResponse = await axiosInstance.get("/user/me");

      const currentHospitalId =
        userResponse?.data?.hospital?._id ||
        userResponse?.data?.user?.hospitalId?._id ||
        userResponse?.data?.user?.hospitalId ||
        null;

      setHospitalId(currentHospitalId);

      if (decoded?.role === "admin") {
        await dispatch(getAllDoctors());
      } else {
        if (currentHospitalId) {
          await dispatch(GetDoctorHospitalId(currentHospitalId));
        }
      }

    } catch (err) {
      setErrors(prev => ({ ...prev, doctors: "Failed to load doctors" }));
    } finally {
      setLoading(prev => ({ ...prev, doctors: false }));
    }
  };

  fetchDoctors();

}, [dispatch, decoded?.role]);

  useEffect(() => {
    if (decoded?.role !== 'doctor' || !Array.isArray(doctors) || doctors.length === 0) {
      return;
    }

    const doctor = doctors.find((item) => item?._id === decoded?.id);
    if (!doctor) {
      return;
    }

    setSelectedDoctor(doctor);

    const dates = getAvailableDatesForDoctor(doctor);
    const nextDate = dates[0]?.date || '';
    const nextSlots = nextDate ? getTimeSlotsForSelectedDate(doctor, nextDate) : [];

    setAvailableDates(dates);
    setSelectedDate(nextDate);
    setAvailableSlots(nextSlots);
    setSelectedSlot('');

    setFormData((prev) => ({
      ...prev,
      doctorId: doctor._id,
      booking_amount: doctor.consultationFee || prev.booking_amount || ''
    }));
  }, [decoded?.id, decoded?.role, doctors]);

  // Handle doctor selection change
  const handleDoctorChange = (e) => {
    const doctorId = e.target.value;
    const doctor = doctors.find(d => d._id === doctorId);

    setSelectedDoctor(doctor);

    if (doctor) {
      // Get available dates for this doctor
      const dates = getAvailableDatesForDoctor(doctor);
      setAvailableDates(dates);

      // Reset date and slot selection
      setSelectedDate('');
      setSelectedSlot('');
      setAvailableSlots([]);

      // Set booking amount
      setFormData(prev => ({
        ...prev,
        doctorId: doctorId,
        booking_amount: doctor.consultationFee || ''
      }));
    }
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot('');

    if (selectedDoctor) {
      const slots = getTimeSlotsForSelectedDate(selectedDoctor, date);
      setAvailableSlots(slots);
    }
  };

  // Auto-select first available date when doctor is selected
  useEffect(() => {
    if (selectedDoctor && availableDates.length > 0 && !selectedDate) {
      const firstDate = availableDates[0].date;
      setSelectedDate(firstDate);
      const slots = getTimeSlotsForSelectedDate(selectedDoctor, firstDate);
      setAvailableSlots(slots);
    }
  }, [selectedDoctor, availableDates]);

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'doctorId') {
      handleDoctorChange(e);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle amount change
  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        booking_amount: value
      }));
    }

    if (errors.booking_amount) {
      setErrors(prev => ({ ...prev, booking_amount: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.patient.trim()) newErrors.patient = 'Patient name is required';
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Invalid mobile number';
    if (!formData.doctorId) newErrors.doctorId = 'Please select a doctor';
    if (!selectedDate) newErrors.date = 'Please select a date';
    if (!selectedSlot) newErrors.slot = 'Please select a time slot';
    if (!formData.booking_amount || formData.booking_amount <= 0) newErrors.booking_amount = 'Invalid amount';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(prev => ({ ...prev, submitting: true }));

      // Find selected slot object
      const selectedSlotObj = availableSlots.find(slot => slot.displayTime === selectedSlot);

      const appointmentData = {
        ...formData,
        hospitalId: selectedDoctor?.hospitalId?._id || selectedDoctor?.hospitalId || hospitalId,
        date: selectedDate,
        slot: selectedSlot,
        startTime: selectedSlotObj?.startTime || '',
        endTime: selectedSlotObj?.endTime || ''
      };

      const response = await dispatch(AppointmentCreate(appointmentData));

      if (response.payload?.success) {
        setSuccess(`Appointment booked successfully! Token: ${response.payload.savedAppointment.token}`);

        // Reset form
        if (decoded.role === 'doctor') {
          const doctor = doctors.find((e) => decoded.id === e._id);
          setFormData({
            patient: '',
            mobile: '',
            dob: '',
            doctorId: decoded.id,
            paymentStatus: 'Cash',
            booking_amount: doctor?.consultationFee || '',
            slot: '',
            startTime: '',
            endTime: ''
          });
        } else {
          setFormData({
            patient: '',
            mobile: '',
            dob: '',
            doctorId: '',
            booking_amount: '',
            paymentStatus: 'Cash',
            slot: '',
            startTime: '',
            endTime: ''
          });
        }

        setSelectedDate('');
        setSelectedSlot('');
        setAvailableSlots([]);
        setActiveSection('patient');
        setwhatsaapMessage(response.payload.savedAppointment);
        setTargetMobile(response.payload.savedAppointment.mobile || '');
        setIsOpen(true);
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, form: err.response?.data?.message || 'Failed to book appointment' }));
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  return (
    <Dashboard>
      <>
        {/* Modal */}
        {isOpen && (
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Send Message</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Mobile Number
                </label>
                <div className="flex gap-2">
                  <div className="flex-shrink-0 flex items-center justify-center w-10 bg-gray-100 border border-gray-300 rounded-l-lg text-gray-500 text-sm">
                    +91
                  </div>
                  <input
                    type="tel"
                    value={targetMobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) setTargetMobile(val);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Default: {whatsaapmessage?.mobile}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleWhatsAppSend}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fab fa-whatsapp text-lg"></i>
                  WhatsApp
                </button>
                <button
                  onClick={handleSMSSend}
                  className="md:hidden flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <i className="fas fa-comment text-lg"></i>
                  SMS
                </button>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full mt-4 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="h-screen flex flex-col bg-gray-50">
          <div className="px-6 py-4 text-white">
            <h2 className="text-xl font-bold text-gray-700">Book Appointment</h2>
            <p className="text-gray-600 text-sm mt-1">Schedule a visit with our healthcare professionals</p>
          </div>

          {loading.doctors ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="flex-1 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="rounded-full h-8 w-8 border-t-2 border-b-2"
                  style={{ borderColor: colors.primary }}
                />
              </div>
              <p className="mt-4 text-gray-500 font-medium">Loading doctors list...</p>
            </div>
          ) : (
            <>
              <div className="flex border-b border-gray-200 bg-white px-4">

                {['patient', 'appointment', 'payment'].map((section) => {
                  let isDisabled = false;
                  
                  if (section === 'appointment' && activeSection !== 'appointment') {
                    // Patient tab must be complete
                    isDisabled = !formData.patient.trim() || !formData.mobile.trim() || !/^\d{10}$/.test(formData.mobile) || !formData.dob;
                  }
                  
                  if (section === 'payment' && activeSection !== 'payment') {
                    // Appointment tab must be complete
                    isDisabled = !formData.doctorId || !selectedDate || !selectedSlot;
                  }

                  return (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    disabled={isDisabled}
                    className={`px-4 py-3 text-sm font-medium capitalize flex items-center transition-colors ${
                      isDisabled 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : activeSection === section 
                          ? 'text-blue-600 border-b-2 border-blue-600' 
                          : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {section === 'patient' && (
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    )}
                    {section === 'appointment' && (
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    )}
                    {section === 'payment' && (
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                    )}
                    {section}
                  </button>
                );
                })}
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {errors.form && (
                  <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded flex items-center text-sm">
                    <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{errors.form}</span>
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded flex items-center text-sm">
                    <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{success}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Patient Information Section */}
                  {(activeSection === 'patient') && (
                    <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        Patient Details
                      </h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          name="patient"
                          value={formData.patient}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 text-sm ${errors.patient ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                          placeholder="Enter patient's full name"
                        />
                        {errors.patient && <p className="mt-1 text-xs text-red-600">{errors.patient}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                        <input
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 text-sm ${errors.mobile ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                          placeholder="10-digit mobile number"
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d{0,10}$/.test(value)) {
                              handleChange(e);
                            }
                          }}
                        />
                        {errors.mobile && <p className="mt-1 text-xs text-red-600">{errors.mobile}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                        <input
                          type="tel"
                          name="dob"
                          value={formData.dob}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                          placeholder="Patient's age"
                          required
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d*$/.test(value)) {
                              handleChange(e);
                            }
                          }}
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newErrors = {};
                            if (!formData.patient.trim()) newErrors.patient = 'Patient name is required';
                            if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
                            if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = 'Invalid mobile number';
                            if (!formData.dob) newErrors.dob = 'Age is required';
                            
                            if (Object.keys(newErrors).length > 0) {
                              setErrors(prev => ({ ...prev, ...newErrors }));
                              return;
                            }
                            setActiveSection('appointment');
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-gray-400"
                        >
                          Next: Appointment Details
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Appointment Details Section */}
                  {(activeSection === 'appointment') && (
                    <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        Appointment Details
                      </h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Doctor *</label>
                        <select
                          name="doctorId"
                          value={formData.doctorId}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 text-sm appearance-none ${errors.doctorId
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                            }`}
                          disabled={decoded.role === 'doctor'}
                        >
                          {decoded?.role === 'doctor' ? (
                            <>
                              {doctors?.filter((e) => decoded?.id === e?._id).map((doctor) => (
                                <option key={doctor._id} value={doctor._id}>
                                  {doctor.name} ({doctor.specialty})
                                </option>
                              ))}
                            </>
                          ) : (
                            <>
                              <option value="">Select a Doctor</option>
                              {doctors?.map((doctor) => (
                                <option key={doctor._id} value={doctor._id}>
                                  {doctor.name} ({doctor.specialty})
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                        {errors.doctorId && <p className="mt-1 text-xs text-red-600">{errors.doctorId}</p>}
                      </div>

                      {/* Date Selection for Next 7 Days */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date *</label>
                        {availableDates.length > 0 ? (
                          <div className="flex items-center gap-2 overflow-x-auto pb-2">
                            {availableDates.map((dateInfo) => (
                              <button
                                key={dateInfo.date}
                                type="button"
                                onClick={() => handleDateSelect(dateInfo.date)}
                                className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-medium shadow-md transition-all min-w-[120px] ${selectedDate === dateInfo.date
                                  ? 'bg-blue-700 text-white hover:bg-blue-800'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                  }`}
                              >
                                <div className="text-center">
                                  <div className="font-semibold">{dateInfo.label}</div>
                                  <div className="text-xs opacity-80 mt-1">
                                    {dateInfo.day}
                                  </div>
                                  {dateInfo.slots > 0 && (
                                    <div className="text-xs mt-1 bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                                      {dateInfo.slots} slots
                                    </div>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-gray-50 rounded-lg">
                            <svg className="mx-auto h-5 w-5 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <p className="text-sm text-gray-500">No dates available for selected doctor</p>
                            <p className="text-xs text-gray-400 mt-1">Please select another doctor</p>
                          </div>
                        )}
                        {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
                        {selectedDate && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Selected Date:</span>
                              <span className="text-sm font-semibold text-blue-600">{format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Time Slot Selection */}
                      {selectedDate && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Select Time Slot *</label>
                          {availableSlots.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {availableSlots.map((slot) => (
                                <button
                                  key={slot.id}
                                  type="button"
                                  onClick={() => setSelectedSlot(slot.displayTime)}
                                  disabled={!slot.selectable}
                                  className={`p-2 rounded-lg border transition-all duration-200 text-sm ${!slot.selectable
                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                    : selectedSlot === slot.displayTime
                                      ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                                      : 'bg-white border-gray-200 hover:border-teal-300 hover:bg-teal-50/30'
                                    } ${slot.isCurrentSlot ? 'border-2 border-green-500' : ''}`}
                                >
                                  {slot.displayTime}
                                  {slot.isCurrentSlot}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 bg-gray-50 rounded-lg">
                              <svg className="mx-auto h-5 w-5 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              <p className="text-sm text-gray-500">No time slots available for this date</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {isToday(new Date(selectedDate))
                                  ? "All available slots for today have passed"
                                  : "Doctor is not available on this day"}
                              </p>
                            </div>
                          )}
                          {/* {selectedSlot && (
                            <div className="mt-3 p-3 bg-teal-50 rounded-lg border border-teal-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <svg className="h-4 w-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                  </svg>
                                  <span className="text-sm font-medium text-gray-700">Selected Time</span>
                                </div>
                                <span className="text-sm font-semibold text-teal-800">
                                  {selectedSlot}
                                  {availableSlots.find(slot => slot.displayTime === selectedSlot)?.isCurrentSlot &&
                                    " (Current Slot)"}
                                </span>
                              </div>
                            </div>
                          )} */}
                          {errors.slot && <p className="mt-1 text-xs text-red-600">{errors.slot}</p>}
                        </div>
                      )}

                      <div className="flex justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setActiveSection('patient')}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                        >
                          Back to Patient Details
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newErrors = {};
                            if (!formData.doctorId) newErrors.doctorId = 'Please select a doctor';
                            if (!selectedDate) newErrors.date = 'Please select a date';
                            if (!selectedSlot) newErrors.slot = 'Please select a time slot';
                            
                            if (Object.keys(newErrors).length > 0) {
                              setErrors(prev => ({ ...prev, ...newErrors }));
                              return;
                            }
                            setActiveSection('payment');
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:bg-gray-400"
                        >
                          Next: Payment
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Payment Information Section */}
                  {(activeSection === 'payment') && (
                    <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h3 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        Payment Information
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Booking Amount *</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 text-sm">₹</span>
                            </div>
                            <input
                              type="tel"
                              name="booking_amount"
                              value={formData.booking_amount}
                              onChange={handleAmountChange}
                              className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-1 text-sm ${errors.booking_amount ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                              placeholder="Enter amount"
                            />
                            {errors.booking_amount && <p className="mt-1 text-xs text-red-600">{errors.booking_amount}</p>}
                          </div>
                          {decoded.role === 'doctor' && (
                            <p className="text-xs text-gray-500 mt-1">
                              Default consultation fee: ₹{selectedDoctor?.consultationFee}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
                          <select
                            name="paymentStatus"
                            value={formData.paymentStatus}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm appearance-none"
                          >
                            <option value="Cash">Cash</option>
                            <option value="online">Online</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-between pt-2">
                        <button
                          type="button"
                          onClick={() => setActiveSection('appointment')}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                        >
                          Back to Appointment
                        </button>
                        <button
                          type="submit"
                          disabled={loading.submitting}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center"
                        >
                          {loading.submitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                              </svg>
                              Book Appointment
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </>
          )}
        </div>
      </>
    </Dashboard>
  );
}

export default BookAppointment;