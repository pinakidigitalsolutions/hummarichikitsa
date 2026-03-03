
// import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
// import { Link } from 'react-router-dom';
// import { Calendar, Clock, User, FileText, Search, CheckCircle, XCircle, ChevronRight, Filter } from 'lucide-react';
// import { AppointmentConferm, getAllAppointment, todayAppointment } from '../../Redux/appointment';
// import { getAllHospital } from '../../Redux/hospitalSlice';
// import { getAllDoctors, GetDoctorHospitalId } from '../../Redux/doctorSlice';
// import { useDispatch, useSelector } from 'react-redux';
// import Dashboard from '../../components/Layout/Dashboard';
// import axiosInstance from '../../Helper/axiosInstance';
// import socket from '../../Helper/socket';
// import { AuthMe } from '../../Redux/AuthLoginSlice';

// const DoctorDashboard = () => {
//     const [isOpen, setIsOpen] = useState(false);
//     const [phoneNumber, setPhoneNumber] = useState('');
//     const [message, setMessage] = useState('');
//     const [whatsaapmessage, setwhatsaapMessage] = useState('');

//     const handleSMSSend = () => {
//         const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
//         window.location.href = smsUrl;
//     };
//     const dispatch = useDispatch();
//     const [appointments, setAppointments] = useState([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [filterStatus, setFilterStatus] = useState('all');
//     const [filterDoctor, setFilterDoctor] = useState('all');
//     const [showFilters, setShowFilters] = useState(false);
//     const [Doctors, setDoctors] = useState([]);
//     const [active, setactive] = useState(true);

//     const { isLoggedIn, data } = useSelector((store) => store.LoginAuth || {});
//     const currentUser = data?.user || {};

//     const filterRef = useRef(null);

//     const handleWhatsAppSend = async(a) => {
//         const res = await axiosInstance.post('/doctor/changeStatus',{
//             appointmentId:a._id
//         })
//         await getAppointment();
//         await dispatch(getAllAppointment());
//     };

//     // Memoized status config
//     const statusConfig = useMemo(() => ({
//         active: {
//             text: 'Active',
//             bgColor: '#D1FAE5',
//             textColor: '#065F46',
//             icon: <Clock size={14} />
//         },
//         completed: {
//             text: 'Completed',
//             bgColor: '#DBEAFE',
//             textColor: '#1E40AF',
//             icon: <CheckCircle size={14} />
//         },
//         pending: {
//             text: 'Pending',
//             bgColor: '#FEF3C7',
//             textColor: '#92400E',
//             icon: <Clock size={14} />
//         },
//         confirmed: {
//             text: 'Confirmed',
//             bgColor: '#D1FAE5',
//             textColor: '#065F46',
//             icon: <CheckCircle size={14} />
//         },
//         cancelled: {
//             text: 'Cancelled',
//             bgColor: '#FEE2E2',
//             textColor: '#991B1B',
//             icon: <XCircle size={14} />
//         },
//         'check-in': {
//             text: 'Check In',
//             bgColor: '#E0E7FF',
//             textColor: '#3730A3',
//             icon: <Clock size={14} />
//         }
//     }), []);

//     // Memoized filter options - CORRECTED
//     const filterOptions = useMemo(() => [
//         { value: 'all', label: 'All Appointments' },
//         { value: 'confirmed', label: 'Confirmed' },
//         { value: 'check-in', label: 'Check In' },
//         { value: 'completed', label: 'Completed' },
//     ], []);

//     // Optimized getStatus function - SIMPLIFIED
//     const getStatus = useCallback((appointment) => {
//         return appointment.status || 'pending';
//     }, []);

//     // Optimized filtered appointments
//     const filteredAppointments = useMemo(() => {
//         return appointments?.filter(appointment => {
//             const matchesSearch =
//                 appointment?.token?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 appointment._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 appointment.patient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 appointment?.mobile?.toLowerCase().includes(searchTerm.toLowerCase());

//             // Direct status filter without mapping
//             const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus;

//             const matchesDoctor = filterDoctor === 'all' || appointment.doctorId._id === filterDoctor;

//             return matchesSearch && matchesFilter && matchesDoctor;
//         });
//     }, [appointments, searchTerm, filterStatus, filterDoctor]);

//     // Get appointments with status filter
//     const getAppointment = useCallback(async (status = 'all') => {
//         try {
//             const res = await dispatch(todayAppointment());
//             if (res.payload?.appointments) {
//                 setAppointments(res.payload.appointments);
//             } else if (res.payload?.data) {
//                 setAppointments(res.payload.data);
//             }
//         } catch (error) {
//             console.error("Error fetching appointments:", error);
//         }
//     }, [dispatch]);

//     // Handle filter change
//     const handleFilterChange = useCallback((status) => {
//         setFilterStatus(status);
//         setShowFilters(false);
//         getAppointment(status === 'all' ? 'all' : status);
//     }, [getAppointment]);

//     // Handle doctor filter change
//     const handleDoctorFilterChange = useCallback((doctorId) => {
//         setFilterDoctor(doctorId);
//     }, []);

//     // Optimized ConfirmAppointment function
//     const ConfirmAppointment = useCallback(async (appointment_id) => {
//         try {
//             const res = await dispatch(AppointmentConferm(appointment_id));

//             if (!res.payload.success) {
//                 setAppointments(prev => prev.map(app =>
//                     app._id === appointment_id
//                         ? { ...app }
//                         : app
//                 ));
//                 return
//             }

//             socket.emit("appointmentUpdate", { appointment_id });

//             // Update the appointment with new status
//             setAppointments(prev => prev.map(app =>
//                 app._id === appointment_id
//                     ? {
//                         ...app,
//                         status: getNextStatus(app.status)
//                     }
//                     : app
//             ));

//         } catch (error) {
//             console.log(error.response)
//             console.error("Error confirming appointment:", error);
//         }
//     }, [dispatch]);

//     // Helper function to get next status - UPDATED with correct flow
//     const getNextStatus = useCallback((currentStatus) => {
//         switch (currentStatus) {
//             case 'pending': return 'Check In';
//             case 'confirmed': return 'check-in';
//             case 'check-in': return 'completed';
//             case 'complete': return 'completed';
//             default: return currentStatus;
//         }
//     }, []);

//     // Get button text based on status - UPDATED
//     const getButtonText = useCallback((currentStatus) => {
//         switch (currentStatus) {
//             case 'pending': return 'Confirm';
//             case 'confirmed': return 'Complete';
//             case 'check-in': return 'Check In';
//             default: return 'Confirm';
//         }
//     }, []);

//     // Close filter when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (filterRef.current && !filterRef.current.contains(event.target)) {
//                 setShowFilters(false);
//             }
//         };

//         document.addEventListener('mousedown', handleClickOutside);
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, []);

//     // Optimized Socket.io event handlers
//     useEffect(() => {
//         const handleAppointmentUpdate = (data) => {
//             setAppointments(prev => {
//                 const exists = prev.some(a => a._id === data._id);
//                 if (exists) {
//                     return prev.map(a => (a._id === data._id ? { ...a, ...data } : a));
//                 }
//                 return [...prev, data];
//             });
//         };

//         const handleAppointmentCreate = (data) => {
//             setAppointments(prev => {
//                 const exists = prev.some(a => a._id === data._id);
//                 if (exists) {
//                     return prev.map(a => (a._id === data._id ? { ...a, ...data } : a));
//                 }
//                 return [...prev, data];
//             });
//         };

//         socket.on("appointmentUpdate", handleAppointmentUpdate);
//         socket.on("createAppointment", handleAppointmentCreate);

//         return () => {
//             socket.off("appointmentUpdate", handleAppointmentUpdate);
//             socket.off("createAppointment", handleAppointmentCreate);
//         };
//     }, []);

//     const ActiveDoctor = useCallback(async () => {
//         const res = await axiosInstance.put(`/doctor/${currentUser?._id}/active/doctor`)
//         setactive(res?.data.doctor.active)
//     }, [currentUser?._id]);

//     useEffect(() => {
//         const fetchDoctors = async () => {
//             try {
//                 const response = await axiosInstance.get("/user/me");
//                 var hospitalId = response?.data?.hospital?._id;

//                 if (hospitalId === undefined) {
//                     hospitalId = response?.data?.user?._id
//                 }

//                 const doctorsResponse = await dispatch(GetDoctorHospitalId(hospitalId));
//                 setDoctors(doctorsResponse.payload.doctors || []);
//             } catch (err) {
//                 console.error("Failed to load doctors:", err);
//             }
//         };

//         fetchDoctors();
//     }, [dispatch]);

//     useEffect(() => {
//         (async () => {
//             const res = await dispatch(AuthMe());
//             setactive(res.payload.user.active)
//         })()
//     }, [dispatch]);

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 await axiosInstance.patch('/appointment/hospital/patient');
//                 await getAppointment();
//                 await dispatch(getAllAppointment());
//                 await dispatch(getAllHospital());
//                 await dispatch(getAllDoctors());
//             } catch (error) {
//                 console.error("Error in initial data loading:", error);
//             }
//         };

//         fetchData();
//     }, [getAppointment, dispatch]);
//     const AppointmentRow = React.memo(({ appointment, index, ConfirmAppointment, getStatus, statusConfig, getButtonText }) => {

//         const status = getStatus(appointment);
//         const statusStyle = statusConfig[status] || statusConfig.pending;
//         return (
//             <tr className="hover:bg-gray-50 border-b border-gray-100">
//                 <td className="px-6 py-4">
//                     <div className="flex items-center">
//                         <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
//                             <User className="h-5 w-5 text-blue-600" />
//                         </div>
//                         <div className="ml-4">
//                             <div className="text-sm font-medium text-gray-900">
//                                 {appointment.patient || `Patient ${index + 1}`}
//                             </div>
//                             <div className="text-sm text-gray-500 mt-1">
//                                 {appointment?.mobile || 'No contact'}
//                             </div>
//                         </div>
//                     </div>
//                 </td>

//                 <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm font-medium text-gray-900">{appointment?.slot}</div>
//                     <div className="text-sm text-gray-500">{appointment?.date}</div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded border">
//                         {appointment?.token}
//                     </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 ">
//                         {appointment?.appointmentNumber}
//                     </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                     <span
//                         className={`px-4 py-1 text-sm rounded-xl font-medium shadow-sm
//       ${appointment?.paymentStatus === 'paid'
//                                 ? 'bg-green-50 text-green-600 shadow-green-100'
//                                 : 'bg-yellow-50 text-yellow-600 shadow-yellow-100'
//                             }`}
//                     >
//                         {appointment?.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
//                     </span>
//                 </td>

//                 <td className="px-6 py-4 whitespace-nowrap">
//                     <div
//                         className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
//                         style={{
//                             backgroundColor: statusStyle.bgColor,
//                             color: statusStyle.textColor,
//                             borderColor: statusStyle.textColor + '20'
//                         }}
//                     >
//                         {statusStyle.icon}
//                         <span className="ml-1.5">{statusStyle.text}</span>
//                     </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
//                     <div className="flex items-center justify-end space-x-2">
//                         <Link to={`/appointment/${appointment?._id}`}>
//                             <button className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors border border-blue-200">
//                                 View
//                             </button>
//                         </Link>
//                         {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
//                             <button
//                                 onClick={() => {
//                                     if (window.confirm("Are you sure you want to update this appointment?")) {
//                                         ConfirmAppointment(appointment?._id);
//                                     }
//                                 }}
//                                 className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors border border-green-200"
//                             >
//                                 {getButtonText(appointment.status)}
//                             </button>
//                         )}

//                         <td onClick={() => {
//                             handleWhatsAppSend(appointment)
//                         }} className="px-6 py-4 whitespace-nowrap">
//                             <span
//                                 className={`px-7 py-1 text-sm font-semibold rounded  cursor-pointer
//       ${appointment?.paymentStatus === 'paid'
//                                         ? 'bg-green-100 text-green-700 border border-green-300'
//                                         : 'bg-red-100 text-red-700 border border-red-300'
//                                     }`}
//                             >
//                                 {appointment?.paymentStatus === 'paid' ? 'Paid' : 'Paid'}
//                             </span>
//                         </td>

//                     </div>
//                 </td>
//             </tr>
//         );
//     });

//     // Memoized Mobile Appointment Card Component - UPDATED
//     const MobileAppointmentCard = React.memo(({ appointment, index, ConfirmAppointment, getStatus, statusConfig, getButtonText }) => {
//         const status = getStatus(appointment);
//         const statusStyle = statusConfig[status] || statusConfig.pending;

//         return (
//             <div className="bg-white rounded-lg shadow border p-4">
//                 {/* Patient Info */}
//                 <div className="flex justify-between items-start mb-3">
//                     <div className="flex items-center">
//                         <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
//                             <User className="h-5 w-5 text-blue-600" />
//                         </div>
//                         <div className="ml-3">
//                             <div className="text-sm font-medium text-gray-900">
//                                 {appointment.patient || `Patient ${index + 1}`}
//                             </div>
//                             <div className="text-xs text-gray-500 mt-1">
//                                 {appointment?.mobile || 'No contact'}
//                             </div>
//                             {appointment.doctor?.name && (
//                                 <div className="text-xs text-blue-600 font-medium mt-1">
//                                     Dr. {appointment.doctor.name}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                     <div
//                         className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
//                         style={{
//                             backgroundColor: statusStyle.bgColor,
//                             color: statusStyle.textColor
//                         }}
//                     >
//                         {statusStyle.icon}
//                         <span className="ml-1">{statusStyle.text}</span>
//                     </div>
//                 </div>

//                 {/* Details Grid */}
//                 <div className="grid grid-cols-2 gap-4 text-sm mb-3">
//                     <div>
//                         <div className="text-gray-500 text-xs">Time</div>
//                         <div className="font-medium text-sm">{appointment?.slot}</div>
//                         <div className="text-xs text-gray-500 mt-1">{appointment?.date}</div>
//                     </div>
//                     <div>
//                         <div className="text-gray-500 text-xs">Token</div>
//                         <div className="font-medium font-mono text-sm">{appointment?.token}</div>
//                     </div>
//                     <div className='flex items-center'>
//                         <div className="text-gray-500 text-xs">Appointment Number :</div>
//                         <div className="font-medium font-mono text-sm"> {appointment?.appointmentNumber}</div>
//                     </div>
//                 </div>

//                 {/* Actions */}
//                 <div className="flex space-x-2 pt-2">
//                     <Link to={`/appointment/${appointment?._id}`} className="flex-1">
//                         <button className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-[12px] hover:bg-blue-200 transition-colors border border-blue-200">
//                             View Details
//                         </button>
//                     </Link>
//                     {appointment.status !== 'completed' && (
//                         <button
//                             onClick={() => {
//                                 if (window.confirm("Are you sure you want to update this appointment?")) {
//                                     ConfirmAppointment(appointment?._id);
//                                 }
//                             }}
//                             className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-[12px] hover:bg-green-200 transition-colors border border-green-200"
//                         >
//                             {getButtonText(appointment.status)}
//                         </button>
//                     )}
//                     <button onClick={() => {
//                         handleWhatsAppSend()
//                     }}
//                         className='bg-green-100 flex-1  text-[12px] text-green-700 cursor-pointer py-1 px-2 rounded'>
//                         Paid
//                     </button>
//                 </div>
//             </div>
//         );
//     });

//     return (
//         <Dashboard>
//             {isOpen && (
//                 <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
//                         {/* Modal Header */}
//                         <div className="flex justify-between items-center mb-4">
//                             <h2 className="text-xl font-bold text-gray-800">Send Message</h2>
//                             <button
//                                 onClick={() => setIsOpen(false)}
//                                 className="text-gray-500 hover:text-gray-700 text-2xl"
//                             >
//                                 &times;
//                             </button>
//                         </div>
//                         {/* Action Buttons */}
//                         <div className="flex gap-3">
//                             {/* WhatsApp Button */}
//                             <button
//                                 onClick={handleWhatsAppSend}
//                                 className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
//                             >
//                                 <i className="fab fa-whatsapp text-lg"></i>
//                                 WhatsApp
//                             </button>

//                             {/* SMS Button */}
//                             <button
//                                 onClick={handleSMSSend}
//                                 className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
//                             >
//                                 <i className="fas fa-comment text-lg"></i>
//                                 SMS
//                             </button>
//                         </div>

//                         {/* Close Button */}
//                         <button
//                             onClick={() => setIsOpen(false)}
//                             className="w-full mt-4 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
//                         >
//                             Cancel
//                         </button>
//                     </div>
//                 </div>
//             )}
//             <div className="min-h-screen  bg-gray-50">
//                 <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                     {/* Header */}
//                     <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                         {/* Left Section */}
//                         <div>
//                             <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
//                                 Your appointments
//                             </h1>
//                             <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
//                                 Manage your appointments and patient schedule
//                             </p>
//                         </div>

//                         {/* Right Section */}
//                         <div>
//                             <Link
//                                 to="/book/appointment"
//                                 className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all text-sm sm:text-base text-center"
//                             >
//                                 Book Appointment
//                             </Link>
//                         </div>
//                     </div>

//                     {/* Appointments Card */}
//                     <div className="bg-white rounded-xl shadow-sm overflow-visible">
//                         {/* Card Header */}
//                         <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative">
//                             <div>
//                                 <div className="flex items-center space-x-2 mr-4">
//                                     <span className="font-semibold text-gray-700">Today's Appointments</span>
//                                     {currentUser?.role === 'doctor' && (
//                                         <button
//                                             onClick={ActiveDoctor}
//                                             className={`relative cursor-pointer w-20 h-8 rounded-full transition-all duration-300 flex items-center
//                         ${active ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gray-400"}`}
//                                         >
//                                             <span
//                                                 className={`absolute left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300
//                           ${active ? "translate-x-12" : "translate-x-0"}`}
//                                             ></span>
//                                             <span className="absolute text-white w-full text-xs font-semibold text-center">
//                                                 {active ? "ON" : "OFF"}
//                                             </span>
//                                         </button>
//                                     )}
//                                 </div>
//                                 <p className="text-sm text-gray-600 mt-1">
//                                     {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
//                                 </p>
//                             </div>

//                             <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//                                 {/* Search Input */}
//                                 <div className="relative">
//                                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                         <Search className="h-4 w-4 text-gray-400" />
//                                     </div>
//                                     <input
//                                         type="text"
//                                         placeholder="Search appointments..."
//                                         className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full"
//                                         value={searchTerm}
//                                         onChange={(e) => setSearchTerm(e.target.value)}
//                                     />
//                                 </div>

//                                 {/* Doctor Filter Dropdown */}
//                                 {currentUser?.role === 'staff' && (
//                                     <div className="relative">
//                                         <select
//                                             value={filterDoctor}
//                                             onChange={(e) => handleDoctorFilterChange(e.target.value)}
//                                             className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full bg-white appearance-none"
//                                         >
//                                             <option value="all">All Doctors</option>
//                                             {Doctors?.map((doctor) => (
//                                                 <option key={doctor?._id} value={doctor?._id}>
//                                                     {doctor?.name}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                         <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
//                                             <ChevronRight className="h-4 w-4 text-gray-400 transform rotate-90" />
//                                         </div>
//                                     </div>
//                                 )}

//                                 {/* Status Filter Dropdown */}
//                                 <div className="relative z-50" ref={filterRef}>
//                                     <button
//                                         onClick={() => setShowFilters(!showFilters)}
//                                         className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 w-full sm:w-auto bg-white transition-colors duration-200"
//                                     >
//                                         <Filter size={16} />
//                                         Filter
//                                         {filterStatus !== 'all' && (
//                                             <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
//                                                 {filterOptions.find(opt => opt.value === filterStatus)?.label}
//                                             </span>
//                                         )}
//                                     </button>

//                                     {showFilters && (
//                                         <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-xl z-[100] border border-gray-200">
//                                             <div className="py-1 max-h-60 overflow-y-auto">
//                                                 {filterOptions.map((option) => (
//                                                     <button
//                                                         key={option.value}
//                                                         onClick={() => handleFilterChange(option.value)}
//                                                         className={`block w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${filterStatus === option.value
//                                                             ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-500'
//                                                             : 'text-gray-700 hover:bg-gray-50'
//                                                             }`}
//                                                     >
//                                                         <div className="flex items-center">
//                                                             <span className="flex-1">{option.label}</span>
//                                                             {filterStatus === option.value && (
//                                                                 <CheckCircle size={14} className="text-blue-500 ml-2" />
//                                                             )}
//                                                         </div>
//                                                     </button>
//                                                 ))}
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Appointments Table */}
//                         <div className="overflow-x-auto">
//                             <div className="rounded-xl">
//                                 {/* Mobile Card View */}
//                                 <div className="md:hidden space-y-4 p-4">
//                                     {filteredAppointments?.length > 0 ? (
//                                         filteredAppointments.map((appointment, index) => (
//                                             <MobileAppointmentCard
//                                                 key={appointment._id}
//                                                 appointment={appointment}
//                                                 index={index}
//                                                 ConfirmAppointment={ConfirmAppointment}
//                                                 getStatus={getStatus}
//                                                 statusConfig={statusConfig}
//                                                 getButtonText={getButtonText}
//                                             />
//                                         ))
//                                     ) : (
//                                         <div className="bg-white rounded-lg shadow border p-8 text-center">
//                                             <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
//                                             <h3 className="text-lg font-medium text-gray-900 mb-2">
//                                                 No appointments found
//                                             </h3>
//                                             <p className="text-sm text-gray-500 mb-4">
//                                                 {searchTerm || filterStatus !== 'all' || filterDoctor !== 'all'
//                                                     ? 'Try adjusting your search or filter criteria'
//                                                     : 'No appointments found for the selected filter'}
//                                             </p>
//                                             {(searchTerm || filterStatus !== 'all' || filterDoctor !== 'all') && (
//                                                 <button
//                                                     onClick={() => {
//                                                         setSearchTerm('');
//                                                         setFilterStatus('all');
//                                                         setFilterDoctor('all');
//                                                     }}
//                                                     className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
//                                                 >
//                                                     Clear Filters
//                                                 </button>
//                                             )}
//                                         </div>
//                                     )}
//                                 </div>

//                                 {/* Desktop Table View */}
//                                 <div className="hidden md:block overflow-auto rounded-xl max-h-[90vh]">
//                                     <table className="min-w-full divide-y divide-gray-200">
//                                         <thead className="bg-gray-50 sticky top-0 z-10">
//                                             <tr>
//                                                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                     Patient
//                                                 </th>
//                                                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                     Date
//                                                 </th>
//                                                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                     Token
//                                                 </th>
//                                                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                     Appointment Number
//                                                 </th>
//                                                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                     Status
//                                                 </th>
//                                                 <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                     Payment
//                                                 </th>
//                                                 <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                     Actions
//                                                 </th>
//                                             </tr>
//                                         </thead>
//                                         <tbody className="bg-white divide-y divide-gray-200">
//                                             {filteredAppointments?.length > 0 ? (
//                                                 filteredAppointments.map((appointment, index) => (
//                                                     <AppointmentRow
//                                                         key={appointment._id}
//                                                         appointment={appointment}
//                                                         index={index}
//                                                         ConfirmAppointment={ConfirmAppointment}
//                                                         getStatus={getStatus}
//                                                         statusConfig={statusConfig}
//                                                         getButtonText={getButtonText}
//                                                     />
//                                                 ))
//                                             ) : (
//                                                 <tr>
//                                                     <td colSpan="6" className="px-6 py-12 text-center">
//                                                         <div className="flex flex-col items-center justify-center">
//                                                             <FileText className="h-16 w-16 mb-4 text-gray-400" />
//                                                             <h3 className="text-lg font-medium text-gray-900 mb-2">
//                                                                 No appointments found
//                                                             </h3>
//                                                             <p className="text-sm text-gray-500 mb-4">
//                                                                 {searchTerm || filterStatus !== 'all' || filterDoctor !== 'all'
//                                                                     ? 'Try adjusting your search or filter criteria'
//                                                                     : 'No appointments found for the selected filter'}
//                                                             </p>
//                                                             {(searchTerm || filterStatus !== 'all' || filterDoctor !== 'all') && (
//                                                                 <button
//                                                                     onClick={() => {
//                                                                         setSearchTerm('');
//                                                                         setFilterStatus('all');
//                                                                         setFilterDoctor('all');
//                                                                     }}
//                                                                     className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
//                                                                 >
//                                                                     Clear Filters
//                                                                 </button>
//                                                             )}
//                                                         </div>
//                                                     </td>
//                                                 </tr>
//                                             )}
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </Dashboard>
//     );
// };

// export default DoctorDashboard;

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, FileText, Search, CheckCircle, XCircle, ChevronRight, Filter, AlertCircle, Download, MoreVertical, Printer, Eye, Edit, Trash2, Phone, MessageSquare, Bell, BarChart3, TrendingUp } from 'lucide-react';
import { AppointmentConferm, getAllAppointment, todayAppointment } from '../../Redux/appointment';
import { getAllHospital } from '../../Redux/hospitalSlice';
import { getAllDoctors, GetDoctorHospitalId } from '../../Redux/doctorSlice';
import { useDispatch, useSelector } from 'react-redux';
import Dashboard from '../../components/Layout/Dashboard';
import axiosInstance from '../../Helper/axiosInstance';
import socket from '../../Helper/socket';
import { AuthMe } from '../../Redux/AuthLoginSlice';

const DoctorDashboard = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [message, setMessage] = useState('');
    const [whatsaapmessage, setwhatsaapMessage] = useState('');
    const [escalations, setEscalations] = useState([
        { id: 1, patient: 'John Doe', issue: 'Medication delay', priority: 'High', time: '10 mins ago', status: 'pending' },
        { id: 2, patient: 'Jane Smith', issue: 'Test results', priority: 'Medium', time: '30 mins ago', status: 'in-progress' },
        { id: 3, patient: 'Robert Brown', issue: 'Billing query', priority: 'Low', time: '1 hour ago', status: 'resolved' },
    ]);
    const [showEscalations, setShowEscalations] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Loading state

    const handleSMSSend = () => {
        const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
        window.location.href = smsUrl;
    };

    const dispatch = useDispatch();
    const [appointments, setAppointments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDoctor, setFilterDoctor] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [Doctors, setDoctors] = useState([]);
    const [active, setactive] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        checkIn: 0
    });

    const { isLoggedIn, data } = useSelector((store) => store.LoginAuth || {});
    const currentUser = data?.user || {};

    const filterRef = useRef(null);

    const handleWhatsAppSend = async (a) => {
        const res = await axiosInstance.post('/doctor/changeStatus', {
            appointmentId: a._id
        });
        await getAppointment();
        await dispatch(getAllAppointment());
    };

    // Memoized status config
    const statusConfig = useMemo(() => ({
        active: {
            text: 'Active',
            bgColor: '#D1FAE5',
            textColor: '#065F46',
            icon: <Clock size={14} />
        },
        completed: {
            text: 'Completed',
            bgColor: '#DBEAFE',
            textColor: '#1E40AF',
            icon: <CheckCircle size={14} />
        },
        pending: {
            text: 'Pending',
            bgColor: '#FEF3C7',
            textColor: '#92400E',
            icon: <Clock size={14} />
        },
        confirmed: {
            text: 'Confirmed',
            bgColor: '#D1FAE5',
            textColor: '#065F46',
            icon: <CheckCircle size={14} />
        },
        cancelled: {
            text: 'Cancelled',
            bgColor: '#FEE2E2',
            textColor: '#991B1B',
            icon: <XCircle size={14} />
        },
        'check-in': {
            text: 'Check In',
            bgColor: '#E0E7FF',
            textColor: '#3730A3',
            icon: <Clock size={14} />
        }
    }), []);

    // Memoized filter options
    const filterOptions = useMemo(() => [
        { value: 'all', label: 'All Appointments' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'check-in', label: 'Check In' },
        { value: 'completed', label: 'Completed' },
        { value: 'pending', label: 'Pending' },
    ], []);

    // Calculate appointment statistics
    const calculateStats = useCallback((appointments) => {
        const stats = {
            total: appointments?.length || 0,
            pending: appointments?.filter(a => a.status === 'pending')?.length || 0,
            confirmed: appointments?.filter(a => a.status === 'confirmed')?.length || 0,
            completed: appointments?.filter(a => a.status === 'completed')?.length || 0,
            checkIn: appointments?.filter(a => a.status === 'check-in')?.length || 0
        };
        setStats(stats);
    }, []);

    // Optimized getStatus function
    const getStatus = useCallback((appointment) => {
        return appointment.status || 'pending';
    }, []);

    // Optimized filtered appointments
    const filteredAppointments = useMemo(() => {
        const filtered = appointments?.filter(appointment => {
            const matchesSearch =
                appointment?.token?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment.patient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment?.mobile?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus;
            const matchesDoctor = filterDoctor === 'all' || appointment.doctorId._id === filterDoctor;

            return matchesSearch && matchesFilter && matchesDoctor;
        });

        calculateStats(filtered);
        return filtered;
    }, [appointments, searchTerm, filterStatus, filterDoctor, calculateStats]);

    // Get appointments with status filter
    const getAppointment = useCallback(async (status = 'all') => {
        try {
            setIsLoading(true);
            const res = await dispatch(todayAppointment());
            if (res.payload?.appointments) {
                setAppointments(res.payload.appointments);
                calculateStats(res.payload.appointments);
            } else if (res.payload?.data) {
                setAppointments(res.payload.data);
                calculateStats(res.payload.data);
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
        } finally {
            setIsLoading(false);
        }
    }, [dispatch, calculateStats]);

    // Handle filter change
    const handleFilterChange = useCallback((status) => {
        setFilterStatus(status);
        setShowFilters(false);
        getAppointment(status === 'all' ? 'all' : status);
    }, [getAppointment]);

    // Handle doctor filter change
    const handleDoctorFilterChange = useCallback((doctorId) => {
        setFilterDoctor(doctorId);
    }, []);

    // Optimized ConfirmAppointment function
    const ConfirmAppointment = useCallback(async (appointment_id) => {
        try {
            const res = await dispatch(AppointmentConferm(appointment_id));

            if (!res.payload.success) {
                setAppointments(prev => prev.map(app =>
                    app._id === appointment_id
                        ? { ...app }
                        : app
                ));
                return;
            }

            socket.emit("appointmentUpdate", { appointment_id });

            setAppointments(prev => prev.map(app =>
                app._id === appointment_id
                    ? {
                        ...app,
                        status: getNextStatus(app.status)
                    }
                    : app
            ));

        } catch (error) {
            console.error("Error confirming appointment:", error);
        }
    }, [dispatch]);

    // Helper function to get next status
    const getNextStatus = useCallback((currentStatus) => {
        switch (currentStatus) {
            case 'pending': return 'confirmed';
            case 'confirmed': return 'check-in';
            case 'check-in': return 'completed';
            default: return currentStatus;
        }
    }, []);

    // Get button text based on status
    const getButtonText = useCallback((currentStatus) => {
        switch (currentStatus) {
            case 'pending': return 'Confirm';
            case 'confirmed': return 'Check In';
            case 'check-in': return 'Complete';
            default: return 'Confirm';
        }
    }, []);

    // Handle escalation status change
    const handleEscalationStatus = useCallback((id, newStatus) => {
        setEscalations(prev => prev.map(esc =>
            esc.id === id ? { ...esc, status: newStatus } : esc
        ));
    }, []);

    // Close filter when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setShowFilters(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Socket.io event handlers
    useEffect(() => {
        const handleAppointmentUpdate = (data) => {
            setAppointments(prev => {
                const exists = prev.some(a => a._id === data._id);
                if (exists) {
                    return prev.map(a => (a._id === data._id ? { ...a, ...data } : a));
                }
                return [...prev, data];
            });
        };

        const handleAppointmentCreate = (data) => {
            setAppointments(prev => {
                const exists = prev.some(a => a._id === data._id);
                if (exists) {
                    return prev.map(a => (a._id === data._id ? { ...a, ...data } : a));
                }
                return [...prev, data];
            });
        };

        socket.on("appointmentUpdate", handleAppointmentUpdate);
        socket.on("createAppointment", handleAppointmentCreate);

        return () => {
            socket.off("appointmentUpdate", handleAppointmentUpdate);
            socket.off("createAppointment", handleAppointmentCreate);
        };
    }, []);

    const ActiveDoctor = useCallback(async () => {
        const res = await axiosInstance.put(`/doctor/${currentUser?._id}/active/doctor`);
        setactive(res?.data.doctor.active);
    }, [currentUser?._id]);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await axiosInstance.get("/user/me");
                var hospitalId = response?.data?.hospital?._id;

                if (hospitalId === undefined) {
                    hospitalId = response?.data?.user?._id;
                }

                const doctorsResponse = await dispatch(GetDoctorHospitalId(hospitalId));
                setDoctors(doctorsResponse.payload.doctors || []);
            } catch (err) {
                console.error("Failed to load doctors:", err);
            }
        };

        fetchDoctors();
    }, [dispatch]);

    useEffect(() => {
        (async () => {
            const res = await dispatch(AuthMe());
            setactive(res.payload.user.active);
        })();
    }, [dispatch]);

    useEffect(() => {
        (async () => {
            await axiosInstance.patch('/appointment/hospital/patient');
            await getAppointment();
            await dispatch(getAllAppointment());
            await dispatch(getAllHospital());
            await dispatch(getAllDoctors());
        })()
    }, [getAppointment, dispatch]);

    // Loading Component
    const LoadingScreen = () => (
        <div className="flex flex-col items-center justify-center min-h-[400px] py-12">
            {/* Main Spinner */}
            <div className="relative mb-6">
                <div className="h-20 w-20 border-4 border-blue-100 rounded-full"></div>
                <div className="absolute top-0 left-0 h-20 w-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Calendar className="h-8 w-8 text-blue-600 animate-pulse" />
                </div>
            </div>

            {/* Loading Text */}
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Appointments</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
                Please wait while we fetch today's appointment schedule...
            </p>

            {/* Progress Bar */}
            <div className="w-full max-w-sm bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 h-full rounded-full w-1/2 animate-slide"></div>
            </div>

            {/* Loading Dots */}
            <div className="flex space-x-2">
                <div className="h-2.5 w-2.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                <div className="h-2.5 w-2.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                <div className="h-2.5 w-2.5 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
            </div>

            {/* Stats Loading */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        </div>
    );

    // Skeleton Loading for Table
    const TableSkeleton = () => (
        <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="bg-white rounded-lg p-4 border border-gray-100 animate-pulse">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                            <div>
                                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-24"></div>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const AppointmentRow = React.memo(({ appointment, index, ConfirmAppointment, getStatus, statusConfig, getButtonText }) => {
        const status = getStatus(appointment);
        const statusStyle = statusConfig[status] || statusConfig.pending;

        return (
            <tr className="hover:bg-gray-50 border-b border-gray-100 transition-colors duration-150">
                <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        </div>
                        <div className="ml-3 sm:ml-4">
                            <div className="text-sm font-medium text-gray-900">
                                {appointment.patient || `Patient ${index + 1}`}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                {appointment?.mobile || 'No contact'}
                            </div>
                        </div>
                    </div>
                </td>

                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{appointment?.slot}</div>
                    <div className="text-xs sm:text-sm text-gray-500">{appointment?.date}</div>
                </td>

                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded border text-xs sm:text-sm">
                        {appointment?.token}
                    </div>
                </td>

                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                    <div className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1">
                        {appointment?.appointmentNumber}
                    </div>
                </td>

                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs sm:text-sm rounded-xl font-medium shadow-sm ${appointment?.paymentStatus === 'paid'
                        ? 'bg-green-50 text-green-600 border border-green-200'
                        : 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                        }`}>
                        {appointment?.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                    </span>
                </td>

                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium border"
                        style={{
                            backgroundColor: statusStyle.bgColor,
                            color: statusStyle.textColor,
                            borderColor: statusStyle.textColor + '20'
                        }}>
                        {statusStyle.icon}
                        <span className="ml-1.5">{statusStyle.text}</span>
                    </div>
                </td>

                <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                        <Link to={`/appointment/${appointment?._id}`}>
                            <button className="p-1.5 sm:p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="View">
                                <Eye className="h-4 w-4" />
                            </button>
                        </Link>

                        {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                            <button
                                onClick={() => {
                                    if (window.confirm("Update this appointment?")) {
                                        ConfirmAppointment(appointment?._id);
                                    }
                                }}
                                className="p-1.5 sm:p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                title={getButtonText(appointment.status)}
                            >
                                <CheckCircle className="h-4 w-4" />
                            </button>
                        )}

                        <button
                            onClick={() => handleWhatsAppSend(appointment)}
                            className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${appointment?.paymentStatus === 'paid'
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                        >
                            {appointment?.paymentStatus === 'paid' ? 'Paid' : 'Mark Paid'}
                        </button>

                        <button className="p-1.5 sm:p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors" title="More">
                            <MoreVertical className="h-4 w-4" />
                        </button>
                    </div>
                </td>
            </tr>
        );
    });

    const MobileAppointmentCard = React.memo(({ appointment, index, ConfirmAppointment, getStatus, statusConfig, getButtonText }) => {
        const status = getStatus(appointment);
        const statusStyle = statusConfig[status] || statusConfig.pending;

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                            <div className="font-medium text-gray-900">
                                {appointment.patient || `Patient ${index + 1}`}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                {appointment?.mobile || 'No contact'}
                            </div>
                        </div>
                    </div>
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                            backgroundColor: statusStyle.bgColor,
                            color: statusStyle.textColor
                        }}>
                        {statusStyle.icon}
                        <span className="ml-1">{statusStyle.text}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div>
                        <div className="text-gray-500 text-xs">Time</div>
                        <div className="font-medium">{appointment?.slot}</div>
                        <div className="text-xs text-gray-500 mt-1">{appointment?.date}</div>
                    </div>
                    <div>
                        <div className="text-gray-500 text-xs">Token</div>
                        <div className="font-mono font-medium">{appointment?.token}</div>
                    </div>
                    <div className="col-span-2">
                        <div className="text-gray-500 text-xs">Appointment Number</div>
                        <div className="font-mono font-medium"> {appointment?.appointmentNumber}</div>
                    </div>
                    <div className="col-span-2">
                        <div className="text-gray-500 text-xs">Payment Status</div>
                        <span className={`px-3 py-1 text-sm rounded-xl font-medium ${appointment?.paymentStatus === 'paid'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-yellow-50 text-yellow-600'
                            }`}>
                            {appointment?.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                    </div>
                </div>

                <div className="flex space-x-2 pt-3 border-t border-gray-100">
                    <Link to={`/appointment/${appointment?._id}`} className="flex-1">
                        <button className="w-full px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                            <Eye className="h-4 w-4" />
                            View
                        </button>
                    </Link>

                    {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                        <button
                            onClick={() => {
                                if (window.confirm("Update this appointment?")) {
                                    ConfirmAppointment(appointment?._id);
                                }
                            }}
                            className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg text-sm hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                        >
                            <CheckCircle className="h-4 w-4" />
                            {getButtonText(appointment.status)}
                        </button>
                    )}

                    <button
                        onClick={() => handleWhatsAppSend(appointment)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${appointment?.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                    >
                        {appointment?.paymentStatus === 'paid' ? 'Paid' : 'Mark Paid'}
                    </button>
                </div>
            </div>
        );
    });

    return (
        <Dashboard>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
                    {/* Header Section */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
                            <div className="flex-1">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    Today Appointments
                                </h1>

                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 shadow-sm">
                                        <Calendar className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium text-gray-700">
                                            {new Date().toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    {currentUser?.role === 'doctor' && (
                                        <button
                                            onClick={ActiveDoctor}
                                            className={`relative cursor-pointer w-20 h-8 rounded-full transition-all duration-300 flex items-center ${active ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gray-400"
                                                }`}
                                        >
                                            <span className={`absolute left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${active ? "translate-x-12" : "translate-x-0"
                                                }`} />
                                            <span className="absolute text-white w-full text-xs font-semibold text-center">
                                                {active ? "ON" : "OFF"}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link
                                    to="/book/appointment"
                                    className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl shadow-sm transition-all text-sm sm:text-base"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Book Appointment
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Loading Screen */}
                    {isLoading ? (
                        <LoadingScreen />
                    ) : (
                        /* Main Content Grid */
                        <div className="grid grid-cols-1 gap-6 mb-8">
                            {/* Appointments Section */}
                            <div className="">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                    {/* Appointments Header */}
                                    <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div>
                                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Today's Appointments</h2>
                                                <p className="text-sm text-gray-600 mt-1">Manage and track all patient appointments</p>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                                {/* Search */}
                                                <div className="relative flex-1 sm:flex-none">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <Search className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        placeholder="Search appointments..."
                                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full"
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                    />
                                                </div>

                                                {/* Doctor Filter */}
                                                {currentUser?.role === 'staff' && (
                                                    <div className="relative">
                                                        <select
                                                            value={filterDoctor}
                                                            onChange={(e) => handleDoctorFilterChange(e.target.value)}
                                                            className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-full bg-white"
                                                        >
                                                            <option value="all">All Doctors</option>
                                                            {Doctors?.map((doctor) => (
                                                                <option key={doctor?._id} value={doctor?._id}>
                                                                    {doctor?.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                                            <ChevronRight className="h-4 w-4 text-gray-400 transform rotate-90" />
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Status Filter */}
                                                <div className="relative" ref={filterRef}>
                                                    <button
                                                        onClick={() => setShowFilters(!showFilters)}
                                                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 w-full sm:w-auto bg-white transition-colors"
                                                    >
                                                        <Filter size={16} />
                                                        Filter
                                                        {filterStatus !== 'all' && (
                                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                                                {filterOptions.find(opt => opt.value === filterStatus)?.label}
                                                            </span>
                                                        )}
                                                    </button>

                                                    {showFilters && (
                                                        <div className="absolute right-0 mt-2 w-48 sm:w-64 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                                                            <div className="py-1 max-h-60 overflow-y-auto">
                                                                {filterOptions.map((option) => (
                                                                    <button
                                                                        key={option.value}
                                                                        onClick={() => handleFilterChange(option.value)}
                                                                        className={`block w-full text-left px-4 py-2.5 text-sm transition-colors ${filterStatus === option.value
                                                                            ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-500'
                                                                            : 'text-gray-700 hover:bg-gray-50'
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center">
                                                                            <span className="flex-1">{option.label}</span>
                                                                            {filterStatus === option.value && (
                                                                                <CheckCircle size={14} className="text-blue-500 ml-2" />
                                                                            )}
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Appointments List */}
                                    <div className="overflow-x-auto">
                                        {/* Mobile View */}
                                        <div className="md:hidden space-y-4 p-4">
                                            {filteredAppointments?.length > 0 ? (
                                                filteredAppointments.map((appointment, index) => (
                                                    <MobileAppointmentCard
                                                        key={appointment._id}
                                                        appointment={appointment}
                                                        index={index}
                                                        ConfirmAppointment={ConfirmAppointment}
                                                        getStatus={getStatus}
                                                        statusConfig={statusConfig}
                                                        getButtonText={getButtonText}
                                                    />
                                                ))
                                            ) : (
                                                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                                                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                                                    <p className="text-sm text-gray-500 mb-4">
                                                        {searchTerm || filterStatus !== 'all' || filterDoctor !== 'all'
                                                            ? 'Try adjusting your search or filter criteria'
                                                            : 'No appointments scheduled for today'}
                                                    </p>
                                                    {(searchTerm || filterStatus !== 'all' || filterDoctor !== 'all') && (
                                                        <button
                                                            onClick={() => {
                                                                setSearchTerm('');
                                                                setFilterStatus('all');
                                                                setFilterDoctor('all');
                                                            }}
                                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                                                        >
                                                            Clear Filters
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Desktop View */}
                                        <div className="hidden md:block">
                                            <div className="overflow-auto max-h-[calc(100vh-300px)]">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                                        <tr>
                                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Appt #</th>
                                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                            <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {filteredAppointments?.length > 0 ? (
                                                            filteredAppointments.map((appointment, index) => (
                                                                <AppointmentRow
                                                                    key={appointment._id}
                                                                    appointment={appointment}
                                                                    index={index}
                                                                    ConfirmAppointment={ConfirmAppointment}
                                                                    getStatus={getStatus}
                                                                    statusConfig={statusConfig}
                                                                    getButtonText={getButtonText}
                                                                />
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="7" className="px-6 py-12 text-center">
                                                                    <div className="flex flex-col items-center justify-center">
                                                                        <FileText className="h-16 w-16 mb-4 text-gray-400" />
                                                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                                                                        <p className="text-sm text-gray-500 mb-4">
                                                                            {searchTerm || filterStatus !== 'all' || filterDoctor !== 'all'
                                                                                ? 'Try adjusting your search or filter criteria'
                                                                                : 'No appointments scheduled for today'}
                                                                        </p>
                                                                        {(searchTerm || filterStatus !== 'all' || filterDoctor !== 'all') && (
                                                                            <button
                                                                                onClick={() => {
                                                                                    setSearchTerm('');
                                                                                    setFilterStatus('all');
                                                                                    setFilterDoctor('all');
                                                                                }}
                                                                                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                                                                            >
                                                                                Clear Filters
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Dashboard>
    );
};

// Add CSS animation for progress bar
const style = document.createElement('style');
style.textContent = `
    @keyframes slide {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(200%); }
    }
    .animate-slide {
        animation: slide 1.5s infinite ease-in-out;
    }
`;
document.head.appendChild(style);

const Plus = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

export default DoctorDashboard;