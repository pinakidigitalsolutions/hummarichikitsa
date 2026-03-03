import { useState, useEffect } from 'react';
import { getAppointmentById } from '../../Redux/appointment';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaUserMd, FaCalendarAlt, FaClock, FaMoneyBillWave, FaPhone, FaFileAlt, FaHospital, FaDownload } from 'react-icons/fa';
import { IoMdCheckmarkCircle, IoMdCloseCircle } from 'react-icons/io';
import Dashboard from '../../components/Layout/Dashboard';
import { IoArrowBackCircle } from "react-icons/io5";
const AppointmentDetails = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [appointment, setAppointments] = useState(null);
    const [whatsaapmessage, setwhatsaapMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate()

    const handleWhatsAppSend = () => {
        const phoneNumber = whatsaapmessage.mobile;
        const data = whatsaapmessage
        const message = `
  Hello ${data.patient}, your appointment is confirmed.

Appointment No: ${data.appointmentNumber}
Token: ${data.token}
Date: ${data.date}
Booking Amount: ₹${data.booking_amount}
Payment: ${data.paymentStatus}

Track or manage your booking:
https://hummarichikitsa.vercel.app

Thank you – Hummari Chikitsa
      `.trim();

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/91${phoneNumber}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleSMSSend = () => {
        const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
        window.location.href = smsUrl;
    };
    const colors = {
        primary: '#4f46e5',       // Vibrant indigo
        secondary: '#10b981',     // Emerald green
        accent: '#f59e0b',        // Amber
        background: '#f8fafc',    // Light background
        text: '#1e293b',          // Dark text
        lightText: '#64748b',     // Gray text
        border: '#e2e8f0',        // Light border
        success: '#10b981',       // Success green
        error: '#ef4444',         // Error red
        cardBg: '#ffffff'         // White cards
    };

    const getAppointment = async () => {
        const res = await dispatch(getAppointmentById(id));
        setAppointments(res.payload);
        setIsLoading(false);
    };

    useEffect(() => {
        getAppointment();
    }, []);


    const formatDate = (dateString) => {
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-IN', options);
    };

    return (
        <Dashboard>
            {isOpen && (
                <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Send Message</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                &times;
                            </button>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            {/* WhatsApp Button */}
                            <button
                                onClick={handleWhatsAppSend}

                                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <i className="fab fa-whatsapp text-lg"></i>
                                WhatsApp
                            </button>

                            {/* SMS Button */}
                            <button
                                onClick={handleSMSSend}

                                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <i className="fas fa-comment text-lg"></i>
                                SMS
                            </button>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-full mt-4 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            <div className="min-h-screen bg-gray-50 py-1 px-4 ">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className=" mx-auto"
                >
                    {/* Header Card */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-200">
                        <div className="bg-blue-600 p-6 text-white">
                            <button
                                onClick={() => navigate(-1)}
                                className="text-white hover:text-blue-200 transition-colors"
                            >
                                <IoArrowBackCircle className="text-3xl" />
                            </button>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl font-bold">Appointment Details</h1>
                                    <p className="text-indigo-100 mt-1 text-sm">Token No: {appointment?.token}</p>
                                    <div onClick={() => {
                                        setwhatsaapMessage(appointment)
                                        setIsOpen(true)
                                    }
                                    }
                                        className='bg-green-100 text-center mt-2 text-green-700 cursor-pointer py-1 px-2  rounded'>
                                        send Appointment
                                    </div>
                                </div>
                                <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${appointment?.status === 'confirmed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-green-100 text-green-800'
                                    }`}>

                                    <IoMdCheckmarkCircle className="mr-1 text-lg" />

                                    {appointment?.status.charAt(0).toUpperCase() + appointment?.status.slice(1)}
                                </div>
                            </div>
                        </div>

                        {/* Appointment Summary */}
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-4 p-3 bg-indigo-50 rounded-lg">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <FaCalendarAlt className="text-indigo-600 text-lg" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Appointment Date</p>
                                    <p className="font-medium text-gray-900">{formatDate(appointment?.date)}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 p-3 bg-indigo-50 rounded-lg">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <FaClock className="text-indigo-600 text-lg" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Time Slot</p>
                                    <p className="font-medium text-gray-900">{appointment?.slot}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 p-3 bg-indigo-50 rounded-lg">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <FaMoneyBillWave className="text-indigo-600 text-lg" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Amount Paid</p>
                                    <p className="font-medium text-green-600">₹{appointment?.booking_amount}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 p-3 bg-indigo-50 rounded-lg">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <FaFileAlt className="text-indigo-600 text-lg" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payment Method</p>
                                    <p className="font-medium text-gray-900">{appointment?.paymentMethod}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Patient, Doctor, and Hospital Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Patient Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
                        >
                            <div className="bg-indigo-50 p-4 border-b border-gray-200">
                                <h2 className="font-semibold text-gray-800 flex items-center">
                                    <FaUser className="text-indigo-600 mr-2" />
                                    Patient Information
                                </h2>
                            </div>
                            <div className="p-4 space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Full Name</p>
                                    <p className="font-medium">{appointment?.patient}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Contact Number</p>
                                    <p className="font-medium">{appointment?.mobile}</p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Doctor Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
                        >
                            <div className="bg-green-50 p-4 border-b border-gray-200">
                                <h2 className="font-semibold text-gray-800 flex items-center">
                                    <FaUserMd className="text-green-600 mr-2" />
                                    Doctor Information
                                </h2>
                            </div>
                            <div className="p-4 space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Doctor Name</p>
                                    <p className="font-medium">{appointment?.doctorId?.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Specialization</p>
                                    <p className="font-medium">{appointment?.doctorId?.specialty}</p>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
                        >
                            <div className="bg-amber-50 p-4 border-b border-gray-200">
                                <h2 className="font-semibold text-gray-800 flex items-center">
                                    <FaHospital className="text-amber-600 mr-2" />
                                    Hospital Information
                                </h2>
                            </div>
                            <div className="p-4 space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Hospital Name</p>
                                    <p className="font-medium">{appointment?.hospitalId?.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider">Contact Number</p>
                                    <p className="font-medium">{appointment?.hospitalId?.phone}</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Action Buttons - Now with consistent styling */}
                    {/* <div className="flex justify-end space-x-4">
                    {appointment?.status === 'confirmed' && (
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center px-6 py-2 rounded-lg font-medium border border-red-500 text-red-500 hover:bg-red-50 transition-colors"
                        >
                            Cancel Appointment
                        </motion.button>
                    )}
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center px-6 py-2 rounded-lg font-medium border border-indigo-500 text-indigo-500 hover:bg-indigo-50 transition-colors"
                    >
                        <FaDownload className="mr-2" />
                        Download Receipt
                    </motion.button>
                </div> */}
                </motion.div>
            </div>
        </Dashboard>
    );
};

export default AppointmentDetails;