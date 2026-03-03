// import { ChevronLeft, CalendarCheck } from 'lucide-react';
// import { User, Smartphone } from 'lucide-react';
// import { format, isSameDay, isBefore, addDays, isToday, isTomorrow } from 'date-fns';
// import { Check } from 'lucide-react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { MapPin, Star, Clock, Calendar, CreditCard, Award, BookOpen } from 'lucide-react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useEffect, useState } from 'react';
// import toast from 'react-hot-toast';
// import 'react-loading-skeleton/dist/skeleton.css';
// import { getAllHospital } from '../Redux/hospitalSlice';
// import { AppointmentCreate } from '../Redux/appointment';
// import { getAllDoctors } from '../Redux/doctorSlice';
// import Layout from '../components/Layout/Layout';
// import SignInButton from './SignInButton';
// import { jwtDecode } from "jwt-decode";
// const DoctorDetailPage = () => {
//     const todayDate = new Date();
//     const today = format(todayDate, 'yyyy-MM-dd');

//     // Helper function to get date label
//     const getDateLabel = (date) => {
//         if (isToday(date)) return 'Today';
//         if (isTomorrow(date)) return 'Tomorrow';

//         return format(date, 'EEE, MMM d');
//     };

//     // Helper function to convert 24-hour time to 12-hour format with AM/PM
//     const formatTimeTo12Hour = (time24) => {
//         if (!time24) return '';

//         // Split hours and minutes
//         const [hours, minutes] = time24.split(':').map(Number);

//         // Determine AM/PM
//         const period = hours >= 12 ? 'PM' : 'AM';

//         // Convert to 12-hour format
//         let hours12 = hours % 12;
//         hours12 = hours12 === 0 ? 12 : hours12; // 0 should be 12 AM

//         // Format minutes with leading zero if needed
//         const minutesStr = minutes.toString().padStart(2, '0');

//         return `${hours12}:${minutesStr} ${period}`;
//     };

//     const [selectDate, setSelectDate] = useState('');
//     const dispatch = useDispatch();
//     const currentUser = JSON.parse(localStorage.getItem('data')) || null;
//     const isLoggdIn = JSON.parse(localStorage.getItem('isLoggedIn')) || false;
//     const { doctorId } = useParams();
//     const navigate = useNavigate();
//     const hospitals = useSelector((state) => state.hospitals.hospitals);
//     const { doctors, loading: doctorsLoading } = useSelector((state) => state.doctors.doctors);
//     const { loading: hospitalsLoading } = useSelector((state) => state.hospitals);

//     // Find doctor and hospital data
//     const doctor = doctors?.find(d => d?._id === doctorId);
//     const hospital = doctor ? hospitals.find(h => h?._id === doctor?.hospitalId?._id) : null;
//     const [selectedSlot, setSelectedSlot] = useState('');
//     const [errormessage, setErrorMessage] = useState('');
//     const [patient, setPatient] = useState('');
//     const [mobile, setMobile] = useState('');
//     const [dob, setDob] = useState('');
//     const [isLoading, setIsLoading] = useState(true);
//     const [Loading, setLoading] = useState(false);
//     const [login, setlogin] = useState(false);
//     const token = localStorage.getItem('token');

//     // Get time slots for selected date from weeklySchedule
//     const getTimeSlotsForSelectedDate = () => {
//         if (!selectDate || !doctor?.weeklySchedule) return [];

//         // Get day name from selected date (e.g., "Monday")
//         const selectedDay = format(new Date(selectDate), 'EEEE');

//         // Get schedule for this day from weeklySchedule
//         const daySchedule = doctor.weeklySchedule[selectedDay];

//         if (!daySchedule || !daySchedule.enabled || !daySchedule.slots || daySchedule.slots.length === 0) {
//             return [];
//         }

//         // Convert slots to required format with 12-hour display
//         return daySchedule.slots.map(slot => {
//             const startTime12 = formatTimeTo12Hour(slot.startTime);
//             const endTime12 = formatTimeTo12Hour(slot.endTime);

//             return {
//                 id: slot.slotId || `${selectedDay}-${slot.startTime}-${slot.endTime}`,
//                 time: `${startTime12} - ${endTime12}`,
//                 displayTime: `${startTime12} - ${endTime12}`,
//                 startTime: slot.startTime,
//                 endTime: slot.endTime,
//                 startTime12: startTime12,
//                 endTime12: endTime12
//             };
//         });
//     };

//     // Get only enabled days for next 7 days
//     const getAvailableDates = () => {
//         if (!doctor?.weeklySchedule) return [];

//         const today = new Date();
//         const availableDates = [];

//         // Get next 7 days including today
//         for (let i = 0; i < 7; i++) {
//             const date = addDays(today, i);
//             const dateString = format(date, 'yyyy-MM-dd');
//             const dayName = format(date, 'EEEE');

//             // Skip if date is in the past (excluding today)
//             if (isBefore(date, today) && !isToday(date)) {
//                 continue;
//             }

//             // Check if this day has enabled schedule with slots
//             const daySchedule = doctor.weeklySchedule[dayName];
//             if (daySchedule && daySchedule.enabled && daySchedule.slots && daySchedule.slots.length > 0) {
//                 availableDates.push({
//                     date: dateString,
//                     label: getDateLabel(date),
//                     day: dayName,
//                     slots: daySchedule.slots.length
//                 });
//             }
//         }

//         return availableDates;
//     };
//     // Get available slots for selected date
//     const availableSlots = getTimeSlotsForSelectedDate();

//     // Get available dates
//     const availableDates = getAvailableDates();

//     // Handle booking submission
//     const handleBooking = async () => {
//         if (!isLoggdIn) {
//             setLoading(false);
//             setlogin(true);
//             return;
//         }

//         if (!selectDate) {
//             setErrorMessage('Please select a date');
//             return;
//         }

//         if (!selectedSlot) {
//             toast.error('Please select a time slot');
//             return;
//         }

//         if (!patient || patient.trim() === '') {
//             toast.error('Patient name is required');
//             return;
//         }

//         if (!mobile || mobile.length !== 10) {
//             toast.error('Please enter a valid 10-digit mobile number');
//             return;
//         }

//         // setLoading(true);

//         // Find the selected slot object
//         const selectedSlotObj = availableSlots.find(slot => slot.displayTime === selectedSlot);

//         if (!selectedSlotObj) {
//             toast.error('Invalid time slot selected');
//             setLoading(false);
//             return;
//         }

//         // Form data with selected time slot
//         const newAppointment = {
//             patient: patient.trim(),
//             mobile,
//             dob,
//             patientId: currentUser?._id,
//             doctorId: doctor?._id,
//             hospitalId: hospital?._id,
//             date: selectDate,
//             slot: selectedSlotObj.displayTime, // AM/PM format for display
//             startTime: selectedSlotObj.startTime, // 24-hour format for backend
//             endTime: selectedSlotObj.endTime, // 24-hour format for backend
//             amount: doctor?.consultationFee,
//             booking_amount: doctor?.consultationFee,
//             createdAt: new Date().toISOString()
//         };

//         console.log("Appointment Data:", newAppointment);

//         try {
//             const res = await dispatch(AppointmentCreate(newAppointment));
            
//             if (res?.payload?.success) {
//                 const mobileNumber = 91 + res?.payload.savedAppointment.mobile;

// const message = `
// Hello ${res?.payload.savedAppointment.patient}, your appointment is confirmed.

// Appointment No: ${res?.payload.savedAppointment.appointmentNumber}
// Token: ${res?.payload.savedAppointment.token}
// Date: ${format(new Date(selectDate), 'EEEE, MMMM d, yyyy')}
// Booking Amount: ₹${res?.payload.savedAppointment.booking_amount}
// Payment: ${res?.payload.savedAppointment.paymentStatus}
// Doctor: ${doctor?.name}
// Track or manage your booking:
// https://hummarichikitsa.vercel.app

// Thank you – Hummari Chikitsa
// `.trim();
                
//                 const encodedMessage = encodeURIComponent(message);
//                 const whatsappURL = `https://wa.me/${mobileNumber}?text=${encodedMessage}`;
//                 window.open(whatsappURL, "_blank");

//                 setLoading(false);

//                 navigate(`/confirmation/${res.payload?.savedAppointment?._id}`);
//                 return;
//             } else {
//                 toast.error(res?.payload?.message || 'Failed to create appointment');
//             }
//         } catch (error) {
//             console.error('Booking error:', error);
//             toast.error('An error occurred while booking');
//         }

//         setLoading(false);
//     };

//     // Fetch data on component mount
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 await Promise.all([
//                     dispatch(getAllHospital()),
//                     dispatch(getAllDoctors())
//                 ]);
//             } catch (error) {
//                 console.error('Error fetching data:', error);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchData();
//     }, [dispatch]);

//     useEffect(() => {
//         window.scrollTo({ top: 0, behavior: "smooth" });
//     }, []);

//     // Auto-select first available date on component mount
//     useEffect(() => {
//         if (availableDates.length > 0 && !selectDate) {
//             setSelectDate(availableDates[0].date);
//         }
//     }, [doctor, availableDates, selectDate]);

//     // Format experience text
//     const formatExperience = (years) => {
//         return years === 1 ? `${years} year` : `${years} years`;
//     };

//     // Format rating display
//     const formatRating = (rating) => {
//         if (!rating) return '0.0';
//         return rating % 1 === 0 ? rating.toFixed(1) : rating;
//     };

//     // Generate random reviews count (for demo)
//     const getRandomReviews = () => {
//         return Math.floor(Math.random() * 200) + 50;
//     };

//     // Clear error when date is selected
//     useEffect(() => {
//         if (selectDate) {
//             setErrorMessage('');
//         }
//     }, [selectDate]);

    

//     if (!doctor) {
//         return (
//             <Layout>
//                 <div className="container mx-auto px-4 py-8 text-center">
//                     <h2 className="text-2xl font-semibold text-gray-800 mb-4">Doctor not found</h2>
//                     <p className="text-gray-600 mb-6">The doctor you're looking for doesn't exist or has been removed.</p>
//                     <button
//                         onClick={() => navigate('/doctors')}
//                         className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
//                     >
//                         Browse Doctors
//                     </button>
//                 </div>
//             </Layout>
//         );
//     }

//     return (
//         <Layout>
//             {
//                 login && !token ? (
//                     <SignInButton />
//                 ) : (
//                     <div className="container mx-auto px-4 py-8">
//                         {/* Back button */}
//                         <button
//                             onClick={() => navigate(-1)}
//                             className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition"
//                         >
//                             <ChevronLeft className="h-5 w-5 mr-1" />
//                             Back
//                         </button>

//                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                             {/* Doctor Info */}
//                             <div className="lg:col-span-2 space-y-8">
//                                 {/* Doctor Profile Card */}
//                                 <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
//                                     <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
//                                         <div className="flex-shrink-0">
//                                             <img
//                                                 src={doctor?.profileImage || '/default-doctor.png'}
//                                                 alt={doctor?.name}
//                                                 className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
//                                             />
//                                         </div>
//                                         <div className="flex-grow">
//                                             <h1 className="text-2xl font-bold text-gray-900 mb-2">{doctor?.name}</h1>
//                                             <p className="text-teal-600 font-medium mb-2">{doctor?.specialization}</p>
//                                             <div className="flex flex-wrap gap-4 mb-3">
//                                                 <div className="flex items-center text-gray-600">
//                                                     <Award className="h-4 w-4 mr-1 text-teal-600" />
//                                                     <span>{formatExperience(doctor?.experience || 0)} exp.</span>
//                                                 </div>
//                                                 <div className="flex items-center text-gray-600">
//                                                     <Star className="h-4 w-4 mr-1 text-yellow-500" />
//                                                     <span>{formatRating(doctor?.rating || 0)}</span>
//                                                     <span className="text-sm text-gray-500 ml-1">
//                                                         ({getRandomReviews()} reviews)
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                             <div className="flex items-center text-gray-600">
//                                                 <MapPin className="h-4 w-4 mr-1 text-teal-600" />
//                                                 <span>{hospital?.name}</span>
//                                             </div>
//                                         </div>
//                                         <div className="flex-shrink-0">
//                                             <div className="text-2xl font-bold text-teal-700">
//                                                 ₹{doctor?.consultationFee}
//                                             </div>
//                                             <div className="text-sm text-gray-500">Consultation Fee</div>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* About */}
//                                 <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
//                                     <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//                                         <BookOpen className="h-5 w-5 text-teal-600 mr-2" />
//                                         About
//                                     </h2>
//                                     <p className="text-gray-600">
//                                         {doctor?.bio || 'No biography available for this doctor.'}
//                                     </p>
//                                 </div>

//                                 {/* Experience & Qualifications */}
//                                 <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
//                                     <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//                                         <Award className="h-5 w-5 text-teal-600 mr-2" />
//                                         Experience & Qualifications
//                                     </h2>
//                                     <div className="space-y-4">
//                                         <div className="border-l-4 border-teal-600 pl-4">
//                                             <h3 className="font-medium text-gray-800">Education</h3>
//                                             <p className="text-gray-600">{doctor?.qualification || 'Not specified'}</p>
//                                         </div>
//                                         <div className="border-l-4 border-teal-600 pl-4">
//                                             <h3 className="font-medium text-gray-800">Experience</h3>
//                                             <p className="text-gray-600">
//                                                 {formatExperience(doctor?.experience || 0)} of clinical experience
//                                             </p>
//                                         </div>
//                                         <div className="border-l-4 border-teal-600 pl-4">
//                                             <h3 className="font-medium text-gray-800">Languages</h3>
//                                             <p className="text-gray-600">English, Hindi</p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Hospital Info */}
//                                 <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
//                                     <div className="p-6">
//                                         <h2 className="text-xl font-semibold text-gray-800 mb-4">
//                                             Hospital Information
//                                         </h2>
//                                         <div className="flex flex-col md:flex-row">
//                                             <div className="md:w-1/3 mb-4 md:mb-0">
//                                                 <img
//                                                     src={hospital?.image || '/default-hospital.png'}
//                                                     alt={hospital?.name}
//                                                     className="w-full h-auto rounded-lg object-cover"
//                                                     style={{ maxHeight: '150px' }}
//                                                 />
//                                             </div>
//                                             <div className="md:w-2/3 md:pl-6">
//                                                 <h3 className="text-lg font-medium text-gray-800 mb-2">
//                                                     {hospital?.name || 'Hospital not specified'}
//                                                 </h3>
//                                                 <p className="text-gray-600 mb-3">
//                                                     {hospital?.address || ''}, {hospital?.city || ''}, {hospital?.state || ''}
//                                                 </p>
//                                                 <div className="flex items-center mb-4">
//                                                     <Star className="h-5 w-5 text-yellow-500 mr-1" />
//                                                     <span className="font-semibold text-gray-800">
//                                                         {formatRating(hospital?.rating || 0)}
//                                                     </span>
//                                                     <span className="text-gray-600 text-sm ml-1">
//                                                         ({getRandomReviews()} reviews)
//                                                     </span>
//                                                 </div>
//                                                 <div className="flex flex-wrap gap-2">
//                                                     {(hospital?.facilities || []).slice(0, 4).map((facility, index) => (
//                                                         <span
//                                                             key={index}
//                                                             className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full"
//                                                         >
//                                                             {facility}
//                                                         </span>
//                                                     ))}
//                                                     {(!hospital?.facilities || hospital.facilities.length === 0) && (
//                                                         <span className="text-gray-500 text-sm">No facilities listed</span>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Booking Section */}
//                             <div className="lg:col-span-1">
//                                 <div className="bg-white rounded-xl shadow-md p-6 sticky top-24 border border-gray-100">
//                                     <div className="border-b pb-4 mb-4">
//                                         <h2 className="text-xl font-semibold text-gray-800 mb-1">
//                                             Book Appointment
//                                         </h2>
//                                         <p className="text-gray-600">
//                                             Consultation Fee: ₹{doctor?.consultationFee || 0}
//                                         </p>
//                                     </div>

//                                     {/* Calendar Picker */}
//                                     <div className="mb-8">
//                                         <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
//                                             <Calendar className="h-4 w-4 text-teal-600" />
//                                             <span>Choose Appointment Date</span>
//                                         </label>

//                                         <div className="bg-white rounded-lg border border-gray-100 shadow-[0px_2px_8px_rgba(0,0,0,0.05)] overflow-hidden">
//                                             <div className="space-y-1">
//                                                 {/* Date Selection Buttons - Next 7 Days */}
//                                                 {availableDates.length > 0 ? (
//                                                     <div className="flex items-center gap-2 overflow-x-auto pb-2">
//                                                         {availableDates.map((dateInfo) => (
//                                                             <button
//                                                                 key={dateInfo.date}
//                                                                 type="button"
//                                                                 onClick={() => {
//                                                                     setSelectDate(dateInfo.date);
//                                                                     setSelectedSlot('');
//                                                                     setErrorMessage('');
//                                                                 }}
//                                                                 className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-medium shadow-md transition-all min-w-[120px] ${selectDate === dateInfo.date
//                                                                     ? 'bg-blue-700 text-white hover:bg-blue-800'
//                                                                     : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
//                                                                     }`}
//                                                             >
//                                                                 <div className="text-center">
//                                                                     <div className="font-semibold">{dateInfo.label}</div>
//                                                                     <div className="text-xs opacity-80 mt-1">
//                                                                         {dateInfo.day}
//                                                                     </div>
//                                                                     {dateInfo.slots > 0 && (
//                                                                         <div className="text-xs mt-1 bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
//                                                                             {dateInfo.slots} slots
//                                                                         </div>
//                                                                     )}
//                                                                 </div>
//                                                             </button>
//                                                         ))}
//                                                     </div>
//                                                 ) : (
//                                                     <div className="text-center py-4 bg-gray-50 rounded-lg">
//                                                         <Calendar className="mx-auto h-5 w-5 text-gray-400 mb-1" />
//                                                         <p className="text-sm text-gray-500">No dates available</p>
//                                                         <p className="text-xs text-gray-400 mt-1">Please check back later</p>
//                                                     </div>
//                                                 )}

//                                                 {/* Selected Date Display */}
//                                                 {selectDate && (
//                                                     <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-200">
//                                                         <div className="flex items-center justify-between">
//                                                             <div className="flex items-center gap-2">
//                                                                 <CalendarCheck className="h-4 w-4 text-teal-600" />
//                                                                 <span className="text-sm font-medium text-gray-700">
//                                                                     {format(new Date(selectDate), 'EEEE, MMMM d, yyyy')}
//                                                                 </span>
//                                                             </div>
//                                                             <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full">
//                                                                 {availableSlots.length} slots available
//                                                             </span>
//                                                         </div>
//                                                     </div>
//                                                 )}

//                                                 {/* Error Message */}
//                                                 {errormessage && (
//                                                     <div className="flex items-center text-red-500 text-xs py-2 ml-1">
//                                                         <svg
//                                                             xmlns="http://www.w3.org/2000/svg"
//                                                             className="h-3.5 w-3.5 mr-1"
//                                                             viewBox="0 0 20 20"
//                                                             fill="currentColor"
//                                                         >
//                                                             <path
//                                                                 fillRule="evenodd"
//                                                                 d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
//                                                                 clipRule="evenodd"
//                                                             />
//                                                         </svg>
//                                                         <p className='text-sm'>{errormessage}</p>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Time Slot Selection */}
//                                     <div className="mb-8">
//                                         <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
//                                             <Clock className="h-4 w-4 text-teal-600" />
//                                             <span>Select Time Slot</span>
//                                         </label>

//                                         {selectDate ? (
//                                             <div className="space-y-3">
//                                                 {availableSlots.length > 0 ? (
//                                                     <>
//                                                         <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//                                                             {availableSlots.map((slot) => (
//                                                                 <button
//                                                                     key={slot.id}
//                                                                     type="button"
//                                                                     onClick={() => setSelectedSlot(slot.displayTime)}
//                                                                     className={`
//                                                                         relative p-3 rounded-xl border transition-all duration-200
//                                                                         ${selectedSlot === slot.displayTime
//                                                                             ? 'bg-teal-600 text-white border-teal-700 shadow-md'
//                                                                             : 'bg-white border-gray-200 hover:border-teal-300 hover:bg-teal-50/30'
//                                                                         }
//                                                                     `}
//                                                                 >
//                                                                     <span className="block text-sm font-medium">{slot.displayTime}</span>
                                                                    

//                                                                     {selectedSlot === slot.displayTime && (
//                                                                         <div className="absolute -top-2 -right-2">
//                                                                             <div className="bg-teal-700 text-white p-1 rounded-full">
//                                                                                 <Check className="h-3 w-3" />
//                                                                             </div>
//                                                                         </div>
//                                                                     )}
//                                                                 </button>
//                                                             ))}
//                                                         </div>

//                                                         <div className="text-xs text-gray-500 mt-2">
//                                                             Showing slots for {format(new Date(selectDate), 'EEEE, MMMM d, yyyy')}
//                                                         </div>

//                                                         {selectedSlot && (
//                                                             <div className="mt-3 p-3 bg-teal-50 rounded-lg border border-teal-200">
//                                                                 <div className="flex items-center justify-between">
//                                                                     <div className="flex items-center gap-2">
//                                                                         <Clock className="h-4 w-4 text-teal-600" />
//                                                                         <span className="text-sm font-medium text-gray-700">
//                                                                             Selected Time
//                                                                         </span>
//                                                                     </div>
//                                                                     <span className="text-sm font-semibold text-teal-800">
//                                                                         {selectedSlot}
//                                                                     </span>
//                                                                 </div>
//                                                             </div>
//                                                         )}
//                                                     </>
//                                                 ) : (
//                                                     <div className="text-center py-6 bg-gray-50 rounded-lg">
//                                                         <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
//                                                         <p className="text-sm text-gray-500">No time slots available for this date</p>
//                                                         <p className="text-xs text-gray-400 mt-1">Doctor may not be available on this day</p>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         ) : (
//                                             <div className="text-center py-4 bg-gray-50 rounded-lg">
//                                                 <Clock className="mx-auto h-5 w-5 text-gray-400 mb-1" />
//                                                 <p className="text-sm text-gray-500">Please select a date first</p>
//                                             </div>
//                                         )}
//                                     </div>

//                                     {/* Patient Information Form */}
//                                     <div className="space-y-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
//                                         <h3 className="text-lg font-medium text-gray-800 mb-2">Patient Details</h3>

//                                         {/* Patient Name Field */}
//                                         <div className="space-y-1">
//                                             <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
//                                                 <User className="h-4 w-4 text-teal-600" />
//                                                 Patient Name
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 value={patient}
//                                                 onChange={(e) => setPatient(e.target.value)}
//                                                 placeholder="Enter full name"
//                                                 className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all placeholder:text-gray-400"
//                                                 required
//                                             />
//                                         </div>

//                                         {/* Mobile Number Field */}
//                                         <div className="space-y-1">
//                                             <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
//                                                 <Smartphone className="h-4 w-4 text-teal-600" />
//                                                 Mobile Number
//                                             </label>
//                                             <div className="relative">
//                                                 <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                                                     <span className="text-gray-500">+91</span>
//                                                 </div>
//                                                 <input
//                                                     type="tel"
//                                                     value={mobile}
//                                                     onChange={(e) => {
//                                                         const value = e.target.value;
//                                                         if (/^\d{0,10}$/.test(value)) {
//                                                             setMobile(value);
//                                                         }
//                                                     }}
//                                                     placeholder="98765 43210"
//                                                     className="w-full pl-12 px-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all placeholder:text-gray-400"
//                                                     inputMode="numeric"
//                                                     maxLength={10}
//                                                     required
//                                                 />
//                                             </div>
//                                             <p className="text-xs text-gray-500 mt-1">
//                                                 We'll send appointment confirmation via WhatsApp
//                                             </p>
//                                         </div>

//                                         {/* Date of Birth Field */}
//                                         <div className="space-y-1">
//                                             <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
//                                                 <Calendar className="h-4 w-4 text-teal-600" />
//                                                 Age
//                                             </label>
//                                             <input
//                                                 type="tel"
//                                                 value={dob}
//                                                 onChange={(e) => {
//                                                     const value = e.target.value;
//                                                     if (/^\d{0,3}$/.test(value)) {
//                                                         setDob(value);
//                                                     }
//                                                 }}
//                                                 placeholder="Enter age in years"
//                                                 className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all placeholder:text-gray-400"
//                                                 maxLength={3}
//                                             />
//                                         </div>
//                                     </div>

//                                     {/* Payment Summary */}
//                                     <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
//                                         <div className="flex justify-between items-center mb-2">
//                                             <span className="text-gray-600">Consultation Fee</span>
//                                             <span className="font-medium text-gray-800">₹{doctor?.consultationFee || 0}</span>
//                                         </div>
//                                         <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
//                                             <span>Booking Fee</span>
//                                             <span>₹0</span>
//                                         </div>
//                                         <div className="border-t pt-2 mt-2 flex justify-between items-center font-medium">
//                                             <span>Total Payable</span>
//                                             <span className="text-lg text-teal-800">₹{doctor?.consultationFee || 0}</span>
//                                         </div>
//                                     </div>

//                                     {/* Book Button */}
//                                     {Loading ? (
//                                         <button
//                                             className="w-full py-3 rounded-lg font-medium flex items-center justify-center transition bg-gray-300 text-gray-500 cursor-not-allowed"
//                                             disabled
//                                         >
//                                             <CreditCard className="h-5 w-5 mr-2" />
//                                             Wait....
//                                         </button>
//                                     ) : (
//                                         <button
//                                             onClick={handleBooking}
//                                             disabled={!patient || !selectDate || !mobile || mobile.length !== 10 || !selectedSlot}
//                                             className={`w-full py-3 rounded-lg font-medium flex items-center justify-center transition
//                                                 ${!patient || !selectDate || !mobile || mobile.length !== 10 || !selectedSlot
//                                                     ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                                                     : 'bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-700 hover:to-teal-600 shadow-md'
//                                                 }
//                                             `}
//                                         >
//                                             <CreditCard className="h-5 w-5 mr-2" />
//                                             {token ? 'Confirm Appointment' : 'Login to Book'}
//                                         </button>
//                                     )}

//                                     {!currentUser && (
//                                         <p className="text-center text-sm text-gray-500 mt-2">
//                                             Please login to book an appointment
//                                         </p>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )
//             }
//         </Layout>
//     );
// };

// export default DoctorDetailPage;


import { ChevronLeft, CalendarCheck } from 'lucide-react';
import { User, Smartphone } from 'lucide-react';
import { format, isSameDay, isBefore, addDays, isToday, isTomorrow } from 'date-fns';
import { Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Star, Clock, Calendar, CreditCard, Award, BookOpen } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import 'react-loading-skeleton/dist/skeleton.css';
import { getAllHospital } from '../Redux/hospitalSlice';
import { AppointmentCreate } from '../Redux/appointment';
import { getAllDoctors } from '../Redux/doctorSlice';
import Layout from '../components/Layout/Layout';
import SignInButton from './SignInButton';
import { jwtDecode } from "jwt-decode";

const DoctorDetailPage = () => {
    const todayDate = new Date();
    const today = format(todayDate, 'yyyy-MM-dd');

    // Helper function to get date label
    const getDateLabel = (date) => {
        if (isToday(date)) return 'Today';
        if (isTomorrow(date)) return 'Tomorrow';
        return format(date, 'EEE, MMM d');
    };

    // Helper function to convert 24-hour time to 12-hour format with AM/PM
    const formatTimeTo12Hour = (time24) => {
        if (!time24) return '';

        // Split hours and minutes
        const [hours, minutes] = time24.split(':').map(Number);

        // Determine AM/PM
        const period = hours >= 12 ? 'PM' : 'AM';

        // Convert to 12-hour format
        let hours12 = hours % 12;
        hours12 = hours12 === 0 ? 12 : hours12; // 0 should be 12 AM

        // Format minutes with leading zero if needed
        const minutesStr = minutes.toString().padStart(2, '0');

        return `${hours12}:${minutesStr} ${period}`;
    };

    // Helper function to check if current time is between slot start and end time
    const isCurrentTimeInSlot = (slotStartTime, slotEndTime) => {
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        
        // Convert current time to minutes since midnight
        const currentTimeInMinutes = currentHours * 60 + currentMinutes;
        
        // Convert slot start time to minutes since midnight
        const [startHours, startMinutes] = slotStartTime.split(':').map(Number);
        const startTimeInMinutes = startHours * 60 + startMinutes;
        
        // Convert slot end time to minutes since midnight
        const [endHours, endMinutes] = slotEndTime.split(':').map(Number);
        const endTimeInMinutes = endHours * 60 + endMinutes;
        
        // Check if current time is within slot
        return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
    };

    // Helper function to check if slot is selectable (for today only)
    const isSlotSelectable = (slotStartTime, slotEndTime, slotDate) => {
        // If not today, all slots are selectable
        if (!isToday(new Date(slotDate))) return true;
        
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTimeInMinutes = currentHours * 60 + currentMinutes;
        
        // Convert slot start time to minutes since midnight
        const [startHours, startMinutes] = slotStartTime.split(':').map(Number);
        const startTimeInMinutes = startHours * 60 + startMinutes;
        
        // For today, slot is selectable if:
        // 1. Current time is within the slot (between startTime and endTime)
        // OR
        // 2. Current time is before the slot start time (future slot)
        
        // Check if current time is within slot
        if (isCurrentTimeInSlot(slotStartTime, slotEndTime)) {
            return true;
        }
        
        // Check if slot is in future
        return currentTimeInMinutes < startTimeInMinutes;
    };

    const [selectDate, setSelectDate] = useState('');
    const dispatch = useDispatch();
    const currentUser = JSON.parse(localStorage.getItem('data')) || null;
    const isLoggdIn = JSON.parse(localStorage.getItem('isLoggedIn')) || false;
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const hospitals = useSelector((state) => state.hospitals.hospitals);
    const { doctors, loading: doctorsLoading } = useSelector((state) => state.doctors.doctors);
    const { loading: hospitalsLoading } = useSelector((state) => state.hospitals);

    // Find doctor and hospital data
    const doctor = doctors?.find(d => d?._id === doctorId);
    const hospital = doctor ? hospitals.find(h => h?._id === doctor?.hospitalId?._id) : null;
    const [selectedSlot, setSelectedSlot] = useState('');
    const [errormessage, setErrorMessage] = useState('');
    const [patient, setPatient] = useState('');
    const [mobile, setMobile] = useState('');
    const [dob, setDob] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [Loading, setLoading] = useState(false);
    const [login, setlogin] = useState(false);
    const token = localStorage.getItem('token');

    // Get time slots for selected date from weeklySchedule
    const getTimeSlotsForSelectedDate = () => {
        if (!selectDate || !doctor?.weeklySchedule) return [];

        // Get day name from selected date (e.g., "Monday")
        const selectedDay = format(new Date(selectDate), 'EEEE');

        // Get schedule for this day from weeklySchedule
        const daySchedule = doctor.weeklySchedule[selectedDay];

        if (!daySchedule || !daySchedule.enabled || !daySchedule.slots || daySchedule.slots.length === 0) {
            return [];
        }

        // Convert slots to required format with 12-hour display
        return daySchedule.slots.map(slot => {
            const startTime12 = formatTimeTo12Hour(slot.startTime);
            const endTime12 = formatTimeTo12Hour(slot.endTime);
            
            // Check if slot is selectable (for today only)
            const selectable = isSlotSelectable(slot.startTime, slot.endTime, selectDate);
            
            // Check if current time is within this slot (for today only)
            const isCurrentSlot = isToday(new Date(selectDate)) && 
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

    // Get only enabled days for next 7 days
    const getAvailableDates = () => {
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
                        
                        // Check if slot is selectable (current time is within slot OR slot is in future)
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

    // Get available slots for selected date
    const availableSlots = getTimeSlotsForSelectedDate();

    // Get available dates
    const availableDates = getAvailableDates();

    // Auto-select slot if current time is within a slot for today
    useEffect(() => {
        if (selectDate && isToday(new Date(selectDate)) && availableSlots.length > 0) {
            const currentSlot = availableSlots.find(slot => slot.isCurrentSlot);
            if (currentSlot && !selectedSlot) {
                setSelectedSlot(currentSlot.displayTime);
            }
        }
    }, [selectDate, availableSlots]);

    // Handle booking submission
    const handleBooking = async () => {
        if (!isLoggdIn) {
            setLoading(false);
            setlogin(true);
            return;
        }

        if (!selectDate) {
            setErrorMessage('Please select a date');
            return;
        }

        if (!selectedSlot) {
            toast.error('Please select a time slot');
            return;
        }

        if (!patient || patient.trim() === '') {
            toast.error('Patient name is required');
            return;
        }

        if (!mobile || mobile.length !== 10) {
            toast.error('Please enter a valid 10-digit mobile number');
            return;
        }

        // Check if selected slot is valid for today's current time
        if (isToday(new Date(selectDate))) {
            const selectedSlotObj = availableSlots.find(slot => slot.displayTime === selectedSlot);
            
            if (selectedSlotObj && !selectedSlotObj.selectable) {
                toast.error('This time slot is no longer available. Please select another slot.');
                return;
            }
        }

        setLoading(true);

        // Find the selected slot object
        const selectedSlotObj = availableSlots.find(slot => slot.displayTime === selectedSlot);

        if (!selectedSlotObj) {
            toast.error('Invalid time slot selected');
            setLoading(false);
            return;
        }

        // Form data with selected time slot
        const newAppointment = {
            patient: patient.trim(),
            mobile,
            dob,
            patientId: currentUser?._id,
            doctorId: doctor?._id,
            hospitalId: hospital?._id,
            date: selectDate,
            slot: selectedSlotObj.displayTime, // AM/PM format for display
            startTime: selectedSlotObj.startTime, // 24-hour format for backend
            endTime: selectedSlotObj.endTime, // 24-hour format for backend
            amount: doctor?.consultationFee,
            booking_amount: doctor?.consultationFee,
            createdAt: new Date().toISOString()
        };

        console.log("Appointment Data:", newAppointment);

        try {
            const res = await dispatch(AppointmentCreate(newAppointment));
            
            if (res?.payload?.success) {
                const mobileNumber = 91 + res?.payload.savedAppointment.mobile;

                const message = `
Hello ${res?.payload.savedAppointment.patient}, your appointment is confirmed.

Appointment No: ${res?.payload.savedAppointment.appointmentNumber}
Token: ${res?.payload.savedAppointment.token}
Date: ${format(new Date(selectDate), 'EEEE, MMMM d, yyyy')}
Booking Amount: ₹${res?.payload.savedAppointment.booking_amount}
Payment: ${res?.payload.savedAppointment.paymentStatus}
Doctor: ${doctor?.name}
Track or manage your booking:
https://hummarichikitsa.vercel.app

Thank you – Hummari Chikitsa
`.trim();
                
                const encodedMessage = encodeURIComponent(message);
                const whatsappURL = `https://wa.me/${mobileNumber}?text=${encodedMessage}`;
                window.open(whatsappURL, "_blank");

                setLoading(false);

                navigate(`/confirmation/${res.payload?.savedAppointment?._id}`);
                return;
            } else {
                toast.error(res?.payload?.message || 'Failed to create appointment');
            }
        } catch (error) {
            console.error('Booking error:', error);
            toast.error('An error occurred while booking');
        }

        setLoading(false);
    };

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                await Promise.all([
                    dispatch(getAllHospital()),
                    dispatch(getAllDoctors())
                ]);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [dispatch]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    // Auto-select first available date on component mount
    useEffect(() => {
        if (availableDates.length > 0 && !selectDate) {
            setSelectDate(availableDates[0].date);
        }
    }, [doctor, availableDates, selectDate]);

    // Format experience text
    const formatExperience = (years) => {
        return years === 1 ? `${years} year` : `${years} years`;
    };

    // Format rating display
    const formatRating = (rating) => {
        if (!rating) return '0.0';
        return rating % 1 === 0 ? rating.toFixed(1) : rating;
    };

    // Generate random reviews count (for demo)
    const getRandomReviews = () => {
        return Math.floor(Math.random() * 200) + 50;
    };

    // Clear error when date is selected
    useEffect(() => {
        if (selectDate) {
            setErrorMessage('');
        }
    }, [selectDate]);

    if (!doctor) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-8 text-center">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Doctor not found</h2>
                    <p className="text-gray-600 mb-6">The doctor you're looking for doesn't exist or has been removed.</p>
                    <button
                        onClick={() => navigate('/doctors')}
                        className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                    >
                        Browse Doctors
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {
                login && !token ? (
                    <SignInButton />
                ) : (
                    <div className="container mx-auto px-4 py-8">
                        {/* Back button */}
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition"
                        >
                            <ChevronLeft className="h-5 w-5 mr-1" />
                            Back
                        </button>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Doctor Info */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Doctor Profile Card */}
                                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                        <div className="flex-shrink-0">
                                            <img
                                                src={doctor?.photo || '/default-doctor.png'}
                                                alt={doctor?.name}
                                                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <h1 className="text-2xl font-bold text-gray-900 mb-2">{doctor?.name}</h1>
                                            <p className="text-teal-600 font-medium mb-2">{doctor?.specialization}</p>
                                            <div className="flex flex-wrap gap-4 mb-3">
                                                <div className="flex items-center text-gray-600">
                                                    <Award className="h-4 w-4 mr-1 text-teal-600" />
                                                    <span>{formatExperience(doctor?.experience || 0)} exp.</span>
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                                                    <span>{formatRating(doctor?.rating || 0)}</span>
                                                    <span className="text-sm text-gray-500 ml-1">
                                                        ({getRandomReviews()} reviews)
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <MapPin className="h-4 w-4 mr-1 text-teal-600" />
                                                <span>{hospital?.name}</span>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <div className="text-2xl font-bold text-teal-700">
                                                ₹{doctor?.consultationFee}
                                            </div>
                                            <div className="text-sm text-gray-500">Consultation Fee</div>
                                        </div>
                                    </div>
                                </div>

                                {/* About */}
                                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                        <BookOpen className="h-5 w-5 text-teal-600 mr-2" />
                                        About
                                    </h2>
                                    <p className="text-gray-600">
                                        {doctor?.bio || 'No biography available for this doctor.'}
                                    </p>
                                </div>

                                {/* Experience & Qualifications */}
                                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                        <Award className="h-5 w-5 text-teal-600 mr-2" />
                                        Experience & Qualifications
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="border-l-4 border-teal-600 pl-4">
                                            <h3 className="font-medium text-gray-800">Education</h3>
                                            <p className="text-gray-600">{doctor?.qualification || 'Not specified'}</p>
                                        </div>
                                        <div className="border-l-4 border-teal-600 pl-4">
                                            <h3 className="font-medium text-gray-800">Experience</h3>
                                            <p className="text-gray-600">
                                                {formatExperience(doctor?.experience || 0)} of clinical experience
                                            </p>
                                        </div>
                                        <div className="border-l-4 border-teal-600 pl-4">
                                            <h3 className="font-medium text-gray-800">Languages</h3>
                                            <p className="text-gray-600">English, Hindi</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Hospital Info */}
                                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                                    <div className="p-6">
                                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                            Hospital Information
                                        </h2>
                                        <div className="flex flex-col md:flex-row">
                                            <div className="md:w-1/3 mb-4 md:mb-0">
                                                <img
                                                    src={hospital?.image || '/default-hospital.png'}
                                                    alt={hospital?.name}
                                                    className="w-full h-auto rounded-lg object-cover"
                                                    style={{ maxHeight: '150px' }}
                                                />
                                            </div>
                                            <div className="md:w-2/3 md:pl-6">
                                                <h3 className="text-lg font-medium text-gray-800 mb-2">
                                                    {hospital?.name || 'Hospital not specified'}
                                                </h3>
                                                <p className="text-gray-600 mb-3">
                                                    {hospital?.address || ''}, {hospital?.city || ''}, {hospital?.state || ''}
                                                </p>
                                                <div className="flex items-center mb-4">
                                                    <Star className="h-5 w-5 text-yellow-500 mr-1" />
                                                    <span className="font-semibold text-gray-800">
                                                        {formatRating(hospital?.rating || 0)}
                                                    </span>
                                                    <span className="text-gray-600 text-sm ml-1">
                                                        ({getRandomReviews()} reviews)
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {(hospital?.facilities || []).slice(0, 4).map((facility, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full"
                                                        >
                                                            {facility}
                                                        </span>
                                                    ))}
                                                    {(!hospital?.facilities || hospital.facilities.length === 0) && (
                                                        <span className="text-gray-500 text-sm">No facilities listed</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Section */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl shadow-md p-6 sticky top-24 border border-gray-100">
                                    <div className="border-b pb-4 mb-4">
                                        <h2 className="text-xl font-semibold text-gray-800 mb-1">
                                            Book Appointment
                                        </h2>
                                        <p className="text-gray-600">
                                            Consultation Fee: ₹{doctor?.consultationFee || 0}
                                        </p>
                                    </div>

                                    {/* Calendar Picker */}
                                    <div className="mb-8">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                            <Calendar className="h-4 w-4 text-teal-600" />
                                            <span>Choose Appointment Date</span>
                                        </label>

                                        <div className="bg-white rounded-lg border border-gray-100 shadow-[0px_2px_8px_rgba(0,0,0,0.05)] overflow-hidden">
                                            <div className="space-y-1">
                                                {/* Date Selection Buttons - Next 7 Days */}
                                                {availableDates.length > 0 ? (
                                                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                                                        {availableDates.map((dateInfo) => (
                                                            <button
                                                                key={dateInfo.date}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectDate(dateInfo.date);
                                                                    setSelectedSlot('');
                                                                    setErrorMessage('');
                                                                }}
                                                                className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-medium shadow-md transition-all min-w-[120px] ${selectDate === dateInfo.date
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
                                                        <Calendar className="mx-auto h-5 w-5 text-gray-400 mb-1" />
                                                        <p className="text-sm text-gray-500">No dates available</p>
                                                        <p className="text-xs text-gray-400 mt-1">Please check back later</p>
                                                    </div>
                                                )}

                                                

                                                {/* Error Message */}
                                                {errormessage && (
                                                    <div className="flex items-center text-red-500 text-xs py-2 ml-1">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-3.5 w-3.5 mr-1"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                        <p className='text-sm'>{errormessage}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Time Slot Selection */}
                                    <div className="mb-8">
                                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                                            <Clock className="h-4 w-4 text-teal-600" />
                                            <span>Select Time Slot</span>
                                        </label>

                                        {selectDate ? (
                                            <div className="space-y-3">
                                                {availableSlots.length > 0 ? (
                                                    <>
                                                        <div className="grid  grid-cols-1 md:grid-cols-3 gap-3">
                                                            {availableSlots.map((slot) => (
                                                                <>
                                                                <button
                                                                    key={slot.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        if (slot.selectable) {
                                                                            setSelectedSlot(slot.displayTime);
                                                                        }
                                                                    }}
                                                                    disabled={!slot.selectable}
                                                                    className={`
                                                                        relative p-1 rounded-xl border transition-all duration-200
                                                                        ${!slot.selectable 
                                                                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                                            : selectedSlot === slot.displayTime
                                                                                ? 'bg-teal-600 text-white border-teal-700 shadow-md'
                                                                                : 'bg-white border-gray-200 hover:border-teal-300 hover:bg-teal-50/30'
                                                                        }
                                                                        ${slot.isCurrentSlot ? 'border-2 border-green-500' : ''}
                                                                    `}
                                                                >
                                                                    <span className="block text-sm font-medium">{slot.displayTime}</span>
                                                                </button>
                                                                </>
                                                            ))}
                                                        </div>

                                                        

                                                        {selectedSlot && (
                                                            <div className="mt-3 p-3 bg-teal-50 rounded-lg border border-teal-200">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="h-4 w-4 text-teal-600" />
                                                                        <span className="text-sm font-medium text-gray-700">
                                                                            Selected Time
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-sm font-semibold text-teal-800">
                                                                        {selectedSlot}
                                                                        {availableSlots.find(slot => slot.displayTime === selectedSlot)?.isCurrentSlot && 
                                                                            " (Current Slot)"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                                                        <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                                        <p className="text-sm text-gray-500">No time slots available for this date</p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {isToday(new Date(selectDate)) 
                                                                ? "All available slots for today have passed or are not selectable" 
                                                                : "Doctor may not be available on this day"}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 bg-gray-50 rounded-lg">
                                                <Clock className="mx-auto h-5 w-5 text-gray-400 mb-1" />
                                                <p className="text-sm text-gray-500">Please select a date first</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Patient Information Form */}
                                    <div className="space-y-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
                                        <h3 className="text-lg font-medium text-gray-800 mb-2">Patient Details</h3>

                                        {/* Patient Name Field */}
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                                <User className="h-4 w-4 text-teal-600" />
                                                Patient Name
                                            </label>
                                            <input
                                                type="text"
                                                value={patient}
                                                onChange={(e) => setPatient(e.target.value)}
                                                placeholder="Enter full name"
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all placeholder:text-gray-400"
                                                required
                                            />
                                        </div>

                                        {/* Mobile Number Field */}
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                                <Smartphone className="h-4 w-4 text-teal-600" />
                                                Mobile Number
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                    <span className="text-gray-500">+91</span>
                                                </div>
                                                <input
                                                    type="tel"
                                                    value={mobile}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (/^\d{0,10}$/.test(value)) {
                                                            setMobile(value);
                                                        }
                                                    }}
                                                    placeholder="98765 43210"
                                                    className="w-full pl-12 px-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all placeholder:text-gray-400"
                                                    inputMode="numeric"
                                                    maxLength={10}
                                                    required
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                We'll send appointment confirmation via WhatsApp
                                            </p>
                                        </div>

                                        {/* Date of Birth Field */}
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                                                <Calendar className="h-4 w-4 text-teal-600" />
                                                Age
                                            </label>
                                            <input
                                                type="tel"
                                                value={dob}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (/^\d{0,3}$/.test(value)) {
                                                        setDob(value);
                                                    }
                                                }}
                                                placeholder="Enter age in years"
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all placeholder:text-gray-400"
                                                maxLength={3}
                                            />
                                        </div>
                                    </div>

                                    {/* Payment Summary */}
                                    <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600">Consultation Fee</span>
                                            <span className="font-medium text-gray-800">₹{doctor?.consultationFee || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                                            <span>Booking Fee</span>
                                            <span>₹0</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2 flex justify-between items-center font-medium">
                                            <span>Total Payable</span>
                                            <span className="text-lg text-teal-800">₹{doctor?.consultationFee || 0}</span>
                                        </div>
                                    </div>

                                    {/* Book Button */}
                                    {Loading ? (
                                        <button
                                            className="w-full py-3 rounded-lg font-medium flex items-center justify-center transition bg-gray-300 text-gray-500 cursor-not-allowed"
                                            disabled
                                        >
                                            <CreditCard className="h-5 w-5 mr-2" />
                                            Wait....
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleBooking}
                                            disabled={!patient || !selectDate || !mobile || mobile.length !== 10 || !selectedSlot}
                                            className={`w-full py-3 rounded-lg font-medium flex items-center justify-center transition
                                                ${!patient || !selectDate || !mobile || mobile.length !== 10 || !selectedSlot
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-teal-600 to-teal-500 text-white hover:from-teal-700 hover:to-teal-600 shadow-md'
                                                }
                                            `}
                                        >
                                            <CreditCard className="h-5 w-5 mr-2" />
                                            {token ? 'Confirm Appointment' : 'Login to Book'}
                                        </button>
                                    )}

                                    {!currentUser && (
                                        <p className="text-center text-sm text-gray-500 mt-2">
                                            Please login to book an appointment
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </Layout>
    );
};

export default DoctorDetailPage;