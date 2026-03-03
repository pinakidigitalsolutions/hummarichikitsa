
// import React, { useEffect, useState } from 'react';
// import { Calendar, CreditCard, MapPin, Clock, Frown, PlusCircle } from 'lucide-react';
// import { useDispatch, useSelector } from 'react-redux';
// import { getAllAppointment } from '../Redux/appointment';
// import { getAllDoctors } from '../Redux/doctorSlice';
// import { getAllHospital } from '../Redux/hospitalSlice';
// import avatar from '../../src/assets/logo-def.png';
// import { Link } from 'react-router-dom';
// import Layout from '../components/Layout/Layout';
// import socket from '../Helper/socket';

// function Appointment() {
//     const hospital = useSelector((state) => state.hospitals.hospitals);
//     const appoint = useSelector((state) => state.appointment?.appointment);
//     const dispatch = useDispatch();
//     const doct = useSelector((state) => state?.doctors?.doctors.doctors);

//     const isLoading = useSelector((state) => state.appointment?.loading);
//     const [activeTab, setActiveTab] = useState('active');
//     const [doctors, setdoctors] = useState([])
//     const [appointments, setappointments] = useState([])

//     useEffect(() => {
//         setdoctors(doct)
//     }, [doct])

//     useEffect(() => {
//         if (appoint) {
//             setappointments(appoint);
//         }
//     }, [appoint]);

//     useEffect(() => {
//         socket.on("appointmentUpdate", (data) => {
//             setappointments((prev) => {
//                 const exists = prev.some((a) => a._id === data._id);
//                 if (exists) {
//                     return prev.map((a) => (a._id === data._id ? data : a));
//                 }
//                 return [...prev, data];
//             });
//         });

//         socket.on("doctorUpdate", (data) => {
//             setdoctors((prev) => {
//                 const exists = prev.some((a) => a._id === data._id);
//                 if (exists) {
//                     return prev.map((a) => (a._id === data._id ? data : a));
//                 }
//                 return [...prev, data];
//             });
//         })

//         socket.on("doctoractive", (data) => {
//             setdoctors((prev) => {
//                 const exists = prev.some((a) => a._id === data._id);
//                 if (exists) {
//                     return prev.map((a) => (a._id === data._id ? data : a));
//                 }
//                 return [...prev, data];
//             });
//         })

//         return () => {
//             socket.off("appointmentUpdate");
//             socket.off("doctorUpdate");
//             socket.off("doctoractive");
//         };
//     }, [dispatch]);

//     useEffect(() => {
//         (async () => {
//             if (!doctors || doctors.length === 0) {
//                 await dispatch(getAllDoctors())
//             }
//             if (!hospital || hospital.length === 0) {
//                 await dispatch(getAllHospital())
//             }
//         })()
//     }, [])

//     useEffect(() => {
//         if (!appointments || appointments.length === 0) {
//             (async () => {
//                 await dispatch(getAllAppointment())
//             })()
//         }
//     }, [])

//     // Filter appointments based on tab selection
//     const filteredAppointments = appointments?.filter(appointment => {
//         if (activeTab === 'active') {
//             if (appointment.status === "completed") return false;

//             const today = new Date();
//             today.setHours(0, 0, 0, 0);
//             const appointmentDate = new Date(appointment.date);
//             appointmentDate.setHours(0, 0, 0, 0);

//             return appointmentDate >= today;
//         } else {
//             if (appointment.status === "completed") return true;

//             const today = new Date();
//             today.setHours(0, 0, 0, 0);
//             const appointmentDate = new Date(appointment.date);
//             appointmentDate.setHours(0, 0, 0, 0);

//             return appointmentDate < today;
//         }
//     }) || [];

//     // Helper function to get time slot
//     const getTimeSlot = (appointment) => {
//         try {
//             const doctor = doctors?.find(d => d?._id === (appointment?.doctorId?._id || appointment.doctorId));

//             if (!doctor?.availability) return 'Time not available';

//             // Find availability for the specific appointment date
//             const availabilityForDate = doctor.availability.find(avail => 
//                 avail?.date === appointment?.date
//             );

//             if (!availabilityForDate?.display || !Array.isArray(availabilityForDate.display)) {
//                 return 'Time not available';
//             }

//             // Get the first time slot or a default message
//             return availabilityForDate.display[0] || 'Time not available';
//         } catch (error) {
//             console.error('Error getting time slot:', error);
//             return 'Time not available';
//         }
//     };

//     useEffect(() => {
//         window.scrollTo({ top: 0, behavior: "smooth" });
//     }, []);

//     if (isLoading) {
//         return (
//             <Layout>
//                 <div className="flex justify-center items-center h-[100vh]">
//                     <span className="Loader"></span>
//                 </div>
//             </Layout>
//         );
//     }

//     return (
//         <Layout>
//             <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
//                     <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>

//                     {/* Tab Navigation */}
//                     <div className="flex bg-white rounded-lg shadow-sm p-1 border border-gray-200">
//                         <button
//                             onClick={() => setActiveTab('active')}
//                             className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'active'
//                                 ? 'bg-blue-600 text-white'
//                                 : 'text-gray-600 hover:text-gray-900'}`}
//                         >
//                             Active
//                         </button>
//                         <button
//                             onClick={() => setActiveTab('completed')}
//                             className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'completed'
//                                 ? 'bg-blue-600 text-white'
//                                 : 'text-gray-600 hover:text-gray-900'}`}
//                         >
//                             Completed
//                         </button>
//                     </div>

//                     <Link
//                         to="/hospitals"
//                         className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors duration-150"
//                     >
//                         <PlusCircle className="w-5 h-5 mr-2" />
//                         Book New Appointment
//                     </Link>
//                 </div>

//                 {filteredAppointments.length === 0 ? (
//                     <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 p-12 text-center">
//                         <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
//                             <Frown className="h-6 w-6 text-blue-600" />
//                         </div>
//                         <h3 className="mt-4 text-lg font-medium text-gray-900">
//                             {activeTab === 'active' ? 'No Active Appointments' : 'No Completed Appointments'}
//                         </h3>
//                         <p className="mt-2 text-sm text-gray-500">
//                             {activeTab === 'active'
//                                 ? "You don't have any upcoming appointments"
//                                 : "Your completed appointments will appear here"}
//                         </p>
//                         <div className="mt-6">
//                             {activeTab === 'active' && (
//                                 <Link
//                                     to="/hospitals"
//                                     className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                                 >
//                                     <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
//                                     Book Appointment
//                                 </Link>
//                             )}
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                         {filteredAppointments.map((appointment) => {
//                             const doctor = doctors?.find(d => d?._id === (appointment?.doctorId?._id || appointment.doctorId));
//                             const hospitalInfo = hospital?.find(h => h._id === appointment?.hospitalId);

//                             // Get time slot using helper function
//                             const timeSlot = getTimeSlot(appointment);

//                             // Determine status for display
//                             let displayStatus;
//                             let statusColor;
//                             if (appointment.status === "completed") {
//                                 displayStatus = "Completed";
//                                 statusColor = "bg-blue-100 text-blue-800";
//                             } else {
//                                 const today = new Date();
//                                 today.setHours(0, 0, 0, 0);
//                                 const appointmentDate = new Date(appointment.date);
//                                 appointmentDate.setHours(0, 0, 0, 0);

//                                 if (appointmentDate < today) {
//                                     displayStatus = "Completed";
//                                     statusColor = "bg-blue-100 text-blue-800";
//                                 } else if (appointmentDate.getTime() === today.getTime()) {
//                                     displayStatus = "Active";
//                                     statusColor = "bg-[#009689] text-white";
//                                 } else {
//                                     displayStatus = "Active";
//                                     statusColor = "bg-[#009689] text-white";
//                                 }
//                             }

//                             return (
//                                 <div key={appointment._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
//                                     {/* Status Header */}
//                                     <div className="px-4 py-2 border-b border-gray-100">
//                                         <div className="flex justify-between items-center">
//                                             <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor}`}>
//                                                 {displayStatus}
//                                             </span>

//                                             {/* Live Status Indicator */}
//                                             {displayStatus !== "Completed" && doctor?.active && (
//                                                 <div className="flex items-center text-xs text-green-600">
//                                                     <span className="relative flex h-2 w-2 mr-1">
//                                                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
//                                                         <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
//                                                     </span>
//                                                     Live
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </div>

//                                     <div className="p-4">
//                                         {/* Doctor Info - Compact */}
//                                         {displayStatus !== "Completed" && !doctor?.active && (
//                                             <div className="bg-amber-50 rounded-lg px-1 mb-3 border border-amber-100">
//                                                 <p className="text-xs text-red-700 text-center">
//                                                     Doctor is OUT now, He is not actively looking for a patient please wait for him to start.
//                                                 </p>
//                                             </div>
//                                         )}
//                                         {displayStatus !== "Completed" && doctor?.active && (
//                                             <div className="bg-green-50 rounded-lg p-2 mb-3 border border-green-100">
//                                                 <div className="flex justify-between text-xs">
//                                                     <div className="text-gray-700">
//                                                         Currently Serving: <span className="font-semibold text-green-600">{doctor?.currentAppointment}</span>
//                                                     </div>
//                                                     <div className="text-gray-700">
//                                                         Your Turn: <span className="font-semibold text-blue-600">{appointment?.appointmentNumber}</span>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         )}
//                                         <div className="flex items-start space-x-3 mb-3">
//                                             <div className="relative flex-shrink-0">
//                                                 <img
//                                                     src={doctor?.image || avatar}
//                                                     className="w-12 h-12 rounded-lg object-cover border border-gray-200"
//                                                     alt={doctor?.name}
//                                                 />
//                                                 <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
//                                                     <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
//                                                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
//                                                     </svg>
//                                                 </div>
//                                             </div>
//                                             <div className="flex-1 min-w-0">
//                                                 <h3 className="font-semibold text-gray-900 text-sm truncate">{doctor?.name}</h3>
//                                                 <p className="text-xs text-gray-600 truncate">{doctor?.specialty}</p>
//                                                 <div className="flex items-center text-xs text-gray-500 mt-1">
//                                                     <svg className="w-3 h-3 mr-1 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-8 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
//                                                     </svg>
//                                                     <span className="truncate">{hospitalInfo?.name}</span>
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         {/* Appointment Details */}
//                                         <div className="flex-col items-center justify-between text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mb-3">
//                                             <div className="flex items-center mb-1">
//                                                 <Calendar className="w-3 h-3 mr-1 text-blue-500" />
//                                                 {new Date(appointment.date).toLocaleDateString('en-US', {
//                                                     month: 'short',
//                                                     day: 'numeric',
//                                                     year: 'numeric'
//                                                 })}
//                                             </div>
//                                             <div className="flex items-center">
//                                                 <Clock className="w-3 h-3 mr-1 text-blue-500" />
//                                                 {timeSlot}
//                                             </div>
//                                         </div>

//                                         {/* Footer with Payment and Action */}
//                                         <div className="flex items-center justify-between">
//                                             <div className="text-xs text-gray-600 flex items-center">
//                                                 <CreditCard className="w-3 h-3 mr-1 text-blue-500" />
//                                                 ₹{appointment.booking_amount}
//                                             </div>
//                                             <Link
//                                                 to={`/appointment_details_page/${appointment._id}`}
//                                                 className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors"
//                                             >
//                                                 Details
//                                                 <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
//                                                 </svg>
//                                             </Link>
//                                         </div>
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 )}
//             </div>
//         </Layout>
//     )
// }

// export default Appointment;

import React, { useEffect, useState } from 'react';
import { Calendar, CreditCard, MapPin, Clock, Frown, PlusCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllAppointment } from '../Redux/appointment';
import { getAllDoctors } from '../Redux/doctorSlice';
import { getAllHospital } from '../Redux/hospitalSlice';
import avatar from '../../src/assets/logo-def.png';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import socket from '../Helper/socket';

function Appointment() {
    const hospital = useSelector((state) => state.hospitals.hospitals);
    const appoint = useSelector((state) => state.appointment?.appointment);
    const dispatch = useDispatch();
    const doct = useSelector((state) => state?.doctors?.doctors.doctors);

    const isLoading = useSelector((state) => state.appointment?.loading);
    const [activeTab, setActiveTab] = useState('active');
    const [doctors, setdoctors] = useState([])
    const [appointments, setappointments] = useState([])

    useEffect(() => {
        setdoctors(doct)
    }, [doct])

    useEffect(() => {
        if (appoint) {
            setappointments(appoint);
        }
    }, [appoint]);

    useEffect(() => {
        socket.on("appointmentUpdate", (data) => {
            setappointments((prev) => {
                const exists = prev.some((a) => a._id === data._id);
                if (exists) {
                    return prev.map((a) => (a._id === data._id ? data : a));
                }
                return [...prev, data];
            });
        });

        socket.on("doctorUpdate", (data) => {
            setdoctors((prev) => {
                const exists = prev.some((a) => a._id === data._id);
                if (exists) {
                    return prev.map((a) => (a._id === data._id ? data : a));
                }
                return [...prev, data];
            });
        })

        socket.on("doctoractive", (data) => {
            setdoctors((prev) => {
                const exists = prev.some((a) => a._id === data._id);
                if (exists) {
                    return prev.map((a) => (a._id === data._id ? data : a));
                }
                return [...prev, data];
            });
        })

        return () => {
            socket.off("appointmentUpdate");
            socket.off("doctorUpdate");
            socket.off("doctoractive");
        };
    }, [dispatch]);

    useEffect(() => {
        (async () => {
            if (!doctors || doctors.length === 0) {
                await dispatch(getAllDoctors())
            }
            if (!hospital || hospital.length === 0) {
                await dispatch(getAllHospital())
            }
        })()
    }, [])

    useEffect(() => {
        if (!appointments || appointments.length === 0) {
            (async () => {
                await dispatch(getAllAppointment())
            })()
        }
    }, [])

    // Check if appointment is for today
    const isToday = (appointmentDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const appointment = new Date(appointmentDate);
        appointment.setHours(0, 0, 0, 0);
        return appointment.getTime() === today.getTime();
    };

    // Filter appointments based on tab selection
    const filteredAppointments = appointments?.filter(appointment => {
        if (activeTab === 'active') {
            if (appointment.status === "completed") return false;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const appointmentDate = new Date(appointment.date);
            appointmentDate.setHours(0, 0, 0, 0);

            return appointmentDate >= today;
        } else {
            if (appointment.status === "completed") return true;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const appointmentDate = new Date(appointment.date);
            appointmentDate.setHours(0, 0, 0, 0);

            return appointmentDate < today;
        }
    }) || [];

    // Helper function to get time slot
    const getTimeSlot = (appointment) => {
        try {
            const doctor = doctors?.find(d => d?._id === (appointment?.doctorId?._id || appointment.doctorId));

            if (!doctor?.availability) return 'Time not available';

            // Find availability for the specific appointment date
            const availabilityForDate = doctor.availability.find(avail =>
                avail?.date === appointment?.date
            );

            if (!availabilityForDate?.display || !Array.isArray(availabilityForDate.display)) {
                return 'Time not available';
            }

            // Get the first time slot or a default message
            return availabilityForDate.display[0] || 'Time not available';
        } catch (error) {
            console.error('Error getting time slot:', error);
            return 'Time not available';
        }
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    if (isLoading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-[100vh]">
                    <span className="Loader"></span>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>

                    {/* Tab Navigation */}
                    <div className="flex bg-white rounded-lg shadow-sm p-1 border border-gray-200">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'active'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'completed'
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Completed
                        </button>
                    </div>

                    <Link
                        to="/hospitals"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md shadow-sm transition-colors duration-150"
                    >
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Book New Appointment
                    </Link>
                </div>

                {filteredAppointments.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 p-12 text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                            <Frown className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">
                            {activeTab === 'active' ? 'No Active Appointments' : 'No Completed Appointments'}
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            {activeTab === 'active'
                                ? "You don't have any upcoming appointments"
                                : "Your completed appointments will appear here"}
                        </p>
                        <div className="mt-6">
                            {activeTab === 'active' && (
                                <Link
                                    to="/hospitals"
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                                    Book Appointment
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAppointments.map((appointment) => {
                            const doctor = doctors?.find(d => d?._id === (appointment?.doctorId?._id || appointment.doctorId));
                            const hospitalInfo = hospital?.find(h => h._id === appointment?.hospitalId);

                            // Get time slot using helper function
                            const timeSlot = getTimeSlot(appointment);

                            // Check if appointment is for today
                            const appointmentIsToday = isToday(appointment.date);

                            // Determine status for display
                            let displayStatus;
                            let statusColor;
                            if (appointment.status === "completed") {
                                displayStatus = "Completed";
                                statusColor = "bg-blue-100 text-blue-800";
                            } else {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const appointmentDate = new Date(appointment.date);
                                appointmentDate.setHours(0, 0, 0, 0);

                                if (appointmentDate < today) {
                                    displayStatus = "Completed";
                                    statusColor = "bg-blue-100 text-blue-800";
                                } else if (appointmentDate.getTime() === today.getTime()) {
                                    displayStatus = "Active";
                                    statusColor = "bg-[#009689] text-white";
                                } else {
                                    displayStatus = "Active";
                                    statusColor = "bg-[#009689] text-white";
                                }
                            }

                            return (
                                <div key={appointment._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
                                    {/* Status Header */}
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <div className="flex justify-between items-center">
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor}`}>
                                                {displayStatus}
                                            </span>

                                            {/* Live Status Indicator - ONLY FOR TODAY'S APPOINTMENTS */}
                                            {appointmentIsToday && displayStatus !== "Completed" && doctor?.active && (
                                                <div className="flex items-center text-xs text-green-600">
                                                    <span className="relative flex h-2 w-2 mr-1">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                    </span>
                                                    Live
                                                </div>
                                            )}
                                            {appointmentIsToday && displayStatus !== "Completed" && !doctor?.active && (
                                                <div className="flex items-center   px-1 text-wrap  border-amber-100">
                                                    <p className="text-xs text-red-700 text-center">
                                                        Doctor is OUT now, He is not actively looking for a patient please wait for him to start.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        {/* Doctor Info - Compact - ONLY FOR TODAY'S APPOINTMENTS */}

                                        {appointmentIsToday && displayStatus !== "Completed" && doctor?.active && (
                                            <div className="bg-green-50 rounded-lg p-2 mb-3 border border-green-100">
                                                <div className="flex justify-between text-xs">
                                                    <div className="text-gray-700">
                                                        Currently Serving: <span className="font-semibold text-green-600">{doctor?.currentAppointment}</span>
                                                    </div>
                                                    <div className="text-gray-700">
                                                        Your Turn: <span className="font-semibold text-blue-600">{appointment?.appointmentNumber}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-start space-x-3 mb-3">
                                            <div className="relative flex-shrink-0">
                                                <img
                                                    src={doctor?.image || avatar}
                                                    className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                                    alt={doctor?.name}
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 text-sm truncate">{doctor?.name}</h3>
                                                <p className="text-xs text-gray-600 truncate">{doctor?.specialty}</p>
                                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                                    <svg className="w-3 h-3 mr-1 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-8 0H3m2 0h4M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                                    </svg>
                                                    <span className="truncate">{hospitalInfo?.name}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Appointment Details */}
                                        <div className="flex-col items-center justify-between text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mb-3">
                                            <div className="flex items-center mb-1">
                                                <Calendar className="w-3 h-3 mr-1 text-blue-500" />
                                                {new Date(appointment.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="w-3 h-3 mr-1 text-blue-500" />
                                                {appointment.slot}
                                            </div>
                                        </div>

                                        {/* Footer with Payment and Action */}
                                        <div className="flex items-center justify-between">
                                            <div className="text-xs text-gray-600 flex items-center">
                                                <CreditCard className="w-3 h-3 mr-1 text-blue-500" />
                                                ₹{appointment.booking_amount}
                                            </div>
                                            <Link
                                                to={`/appointment_details_page/${appointment._id}`}
                                                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors"
                                            >
                                                Details
                                                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default Appointment;