import { useState, useEffect } from 'react';
import { getAppointmentById } from '../../Redux/appointment';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaUserMd, FaCalendarAlt, FaClock, FaMoneyBillWave, FaPhone, FaFileAlt, FaHospital, FaDownload } from 'react-icons/fa';
import { IoMdCheckmarkCircle, IoMdCloseCircle } from 'react-icons/io';
import Dashboard from '../../components/Layout/Dashboard';
import { IoArrowBackCircle } from "react-icons/io5";
import axiosInstance from '../../Helper/axiosInstance';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
const AppointmentDetails = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [appointment, setAppointments] = useState(null);
    const [whatsaapmessage, setwhatsaapMessage] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [targetMobile, setTargetMobile] = useState('');
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate()

    const getFormattedMessage = (data) => {
        return `
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

    const handleMarkAsPaid = async () => {
        try {
            const res = await axiosInstance.post('/doctor/changeStatus', {
                appointmentId: appointment._id
            });
            if (res.data.success) {
                toast.success("Payment status updated!");
                getAppointment(); // Refresh data
            }
        } catch (error) {
            console.error("Error updating payment status:", error);
            toast.error("Failed to update payment status");
        }
    };

    const handleDownloadReceipt = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(79, 70, 229); // Indigo-600
        doc.text("Hummari Chikitsa", 105, 20, { align: "center" });

        doc.setFontSize(14);
        doc.setTextColor(100);
        doc.text("Appointment Receipt", 105, 30, { align: "center" });

        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);

        // Appointment Info
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(`Token Number: ${appointment?.token}`, 20, 50);
        doc.text(`Appointment Number: ${appointment?.appointmentNumber}`, 120, 50);
        doc.text(`Date: ${appointment?.date}`, 20, 60);
        doc.text(`Slot: ${appointment?.slot}`, 120, 60);

        doc.line(20, 65, 190, 65);

        // Patient Info
        doc.setFontSize(14);
        doc.text("Patient Details", 20, 75);
        doc.setFontSize(12);
        doc.text(`Name: ${appointment?.patient}`, 20, 85);
        doc.text(`Contact: ${appointment?.mobile}`, 20, 95);

        // Doctor & Hospital Info
        doc.setFontSize(14);
        doc.text("Medical Details", 20, 110);
        doc.setFontSize(12);
        doc.text(`Doctor: ${appointment?.doctorId?.name}`, 20, 120);
        doc.text(`Specialty: ${appointment?.doctorId?.specialty}`, 20, 130);
        doc.text(`Hospital: ${appointment?.hospitalId?.name}`, 20, 140);
        doc.text(`Location: ${appointment?.hospitalId?.city}`, 20, 150);

        doc.line(20, 155, 190, 155);

        // Payment Info
        doc.setFontSize(14);
        doc.text("Payment Summary", 20, 165);
        doc.setFontSize(12);
        doc.text(`Amount Paid: Rs. ${appointment?.booking_amount}`, 20, 175);
        doc.text(`Payment Status: ${appointment?.paymentStatus}`, 20, 185);
        doc.text(`Payment Method: ${appointment?.paymentMethod || 'Cash'}`, 20, 195);

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("This is a computer-generated receipt.", 105, 250, { align: "center" });
        doc.text("https://hummarichikitsa.vercel.app", 105, 255, { align: "center" });

        doc.save(`Receipt_AP-${appointment?.token}.pdf`);
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

                                className="md:hidden flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
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
            <div className="min-h-screen bg-gray-50 py-1 px-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <span className="Loader"></span>
                        <p className="text-gray-600 font-medium mt-4 animate-pulse">Loading appointment details...</p>
                    </div>
                ) : !appointment ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                        <div className="bg-red-50 p-4 rounded-full mb-4">
                            <IoMdCloseCircle className="text-red-500 text-5xl" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Appointment Not Found</h2>
                        <p className="text-gray-600 mt-2">The appointment you are looking for does not exist or has been removed.</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Go Back
                        </button>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mx-auto"
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
                                        <div className="flex gap-2">
                                            <div onClick={() => {
                                                setwhatsaapMessage(appointment)
                                                setTargetMobile(appointment?.mobile || '')
                                                setIsOpen(true)
                                            }}
                                                className='flex-1 bg-green-100 text-center mt-2 text-green-700 cursor-pointer py-1 px-2 rounded text-xs font-medium hover:bg-green-200 transition-colors'>
                                                Send Details
                                            </div>
                                            <div onClick={handleMarkAsPaid}
                                                className={`flex-1 text-center mt-2 cursor-pointer py-1 px-2 rounded text-xs font-medium transition-colors ${appointment?.paymentStatus === 'paid'
                                                    ? 'bg-green-600 text-white cursor-default'
                                                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    }`}>
                                                {appointment?.paymentStatus === 'paid' ? 'Paid' : 'Mark Paid'}
                                            </div>
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

                        <div className="flex justify-end space-x-4 mt-6">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleMarkAsPaid}
                                className={`flex items-center px-6 py-2 rounded-lg font-medium transition-colors ${appointment?.paymentStatus === 'paid'
                                    ? 'bg-green-600 text-white cursor-default'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                                    }`}
                            >
                                {appointment?.paymentStatus === 'paid' ? 'Confirmed Paid' : 'Mark as Paid'}
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleDownloadReceipt}
                                className="flex items-center px-6 py-2 rounded-lg font-medium border border-indigo-500 text-indigo-500 hover:bg-indigo-50 transition-colors"
                            >
                                <FaDownload className="mr-2" />
                                Download Receipt
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </div>
        </Dashboard>
    );
};

export default AppointmentDetails;