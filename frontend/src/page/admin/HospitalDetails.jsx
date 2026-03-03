// import { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import {
//     FaHospital, FaPhone, FaEnvelope, FaGlobe, FaStar,
//     FaMapMarkerAlt, FaEdit, FaUserMd, FaProcedures, FaBed,
//     FaSearch, FaPlus, FaCalendarAlt, FaChartLine, FaUsers,
//     FaTrash, FaEye, FaClinicMedical
// } from 'react-icons/fa';
// import Dashboard from '../../components/Layout/Dashboard';
// import axiosInstance from '../../Helper/axiosInstance';
// import { Link, useNavigate, useParams } from 'react-router-dom';
// import { useDispatch } from 'react-redux';
// import { deleteDoctor } from '../../Redux/doctorSlice';
// import { GetHospitalById } from '../../Redux/hospitalSlice';
// import { toast } from 'react-hot-toast';
// import { GetStaff, getStaffByHospitalId, StaffDelete } from '../../Redux/staffSlice';
// import avatar from '../../../src/assets/logo-def.png';

// const HospitalDetails = () => {
//     const navigate = useNavigate();
//     const [hospital, setHospital] = useState(null);
//     const dispatch = useDispatch();
//     const { id } = useParams();
//     const [activeTab, setActiveTab] = useState('overview');
//     const [doctor, setDoctor] = useState([]);
//     const [staff, setStaff] = useState([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [searchTerm, setSearchTerm] = useState('');

//     // Professional healthcare color scheme
//     const colors = {
//         primary: '#1e40af',           // Deep blue
//         secondary: '#3b82f6',         // Medium blue
//         accent: '#0ea5e9',            // Sky blue
//         success: '#10b981',           // Emerald green
//         danger: '#ef4444',            // Red
//         warning: '#f59e0b',           // Amber
//         background: '#f8fafc',        // Lightest blue-gray
//         card: '#ffffff',              // White
//         text: '#1e293b',              // Dark slate
//         muted: '#64748b',             // Slate
//         border: '#e2e8f0'             // Light border
//     };

//     const getHospitalById = async () => {
//         try {
//             const res = await dispatch(GetHospitalById(id));
//             setHospital(res?.payload);
//         } catch (error) {
//             console.error("Error fetching hospital:", error);
//             toast.error("Failed to load hospital data");
//         }
//     };
    
//     const getstaff = async () => {
//         try {
//             const res = await dispatch(getStaffByHospitalId(id))
//             const data = res?.payload
//             setStaff(data)
//         } catch (error) {
//             console.error("Error fetching staff:", error);
//             toast.error("Failed to load staff");
//         }
//     };

//     const deleteStaffId = async (id) => {
//         try {
//             const res = await dispatch(StaffDelete(id));
//             if (res?.payload?.success) {
//                 getstaff()
//             }
//         } catch (error) {
//             console.error("Error deleting staff:", error);
//             toast.error("Failed to delete staff");
//         }
//     };

//     const getDoctors = async () => {
//         try {
//             const res = await axiosInstance.get(`/doctor/?hospitalId=${id}`);
//             setDoctor(res.data);
//         } catch (error) {
//             console.error("Error fetching doctors:", error);
//             toast.error("Failed to load doctors");
//         }
//     };

//     const deleteDoctorHandler = async (doctorId) => {

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaHospital, FaPhone, FaEnvelope, FaGlobe, FaStar,
    FaMapMarkerAlt, FaEdit, FaUserMd, FaProcedures, FaBed,
    FaSearch, FaPlus, FaCalendarAlt, FaChartLine, FaUsers,
    FaTrash, FaEye, FaClinicMedical
} from 'react-icons/fa';
import Dashboard from '../../components/Layout/Dashboard';
import axiosInstance from '../../Helper/axiosInstance';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { deleteDoctor } from '../../Redux/doctorSlice';
import { GetHospitalById } from '../../Redux/hospitalSlice';
import { toast } from 'react-hot-toast';
import { GetStaff, getStaffByHospitalId, StaffDelete } from '../../Redux/staffSlice';
import avatar from '../../../src/assets/logo-def.png';

const HospitalDetails = () => {
    const navigate = useNavigate();
    const [hospital, setHospital] = useState(null);
    const dispatch = useDispatch();
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('overview');
    const [doctor, setDoctor] = useState([]);
    const [staff, setStaff] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Professional healthcare color scheme
    const colors = {
        primary: '#1e40af',           // Deep blue
        secondary: '#3b82f6',         // Medium blue
        accent: '#0ea5e9',            // Sky blue
        success: '#10b981',           // Emerald green
        danger: '#ef4444',            // Red
        warning: '#f59e0b',           // Amber
        background: '#f8fafc',        // Lightest blue-gray
        card: '#ffffff',              // White
        text: '#1e293b',              // Dark slate
        muted: '#64748b',             // Slate
        border: '#e2e8f0'             // Light border
    };

    const getHospitalById = async () => {
        try {
            const res = await dispatch(GetHospitalById(id));
            setHospital(res?.payload);
        } catch (error) {
            console.error("Error fetching hospital:", error);
            toast.error("Failed to load hospital data");
        }
    };
    
    const getstaff = async () => {
        try {
            const res = await dispatch(getStaffByHospitalId(id))
            const data = res?.payload
            setStaff(data)
        } catch (error) {
            console.error("Error fetching staff:", error);
            toast.error("Failed to load staff");
        }
    };

    const deleteStaffId = async (id) => {
        try {
            const res = await dispatch(StaffDelete(id));
            if (res?.payload?.success) {
                getstaff()
            }
        } catch (error) {
            console.error("Error deleting staff:", error);
            toast.error("Failed to delete staff");
        }
    };

    const getDoctors = async () => {
        try {
            const res = await axiosInstance.get(`/doctor/?hospitalId=${id}`);
            setDoctor(res.data.doctors);
        } catch (error) {
            console.error("Error fetching doctors:", error);
            toast.error("Failed to load doctors");
        }
    };

    const deleteDoctorHandler = async (doctorId) => {
        try {
            await dispatch(deleteDoctor(doctorId));
            getDoctors();
            toast.success("Doctor deleted successfully");
        } catch (error) {
            toast.error("Failed to delete doctor");
        }
    };

    useEffect(() => {
        getstaff()
        const fetchData = async () => {
            setIsLoading(true);
            try {
                await getHospitalById();
                await getDoctors();
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    console.log(doctor)

    // Filter doctors based on search term
    const filteredDoctors = doctor?.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const filteredStaff = staff?.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const statusBadgeVariants = {
        active: { backgroundColor: colors.success },
        deactive: { backgroundColor: colors.danger }
    };

    if (isLoading) {
        return (
            <Dashboard>
                <div className="flex justify-center items-center h-screen">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="rounded-full h-16 w-16 border-t-4 border-b-4"
                        style={{ borderColor: colors.primary }}
                    />
                </div>
            </Dashboard>
        );
    }

    if (!hospital) {
        return (
            <Dashboard>
                <div className="flex flex-col items-center justify-center h-screen p-4">
                    <div className="bg-red-100 p-4 rounded-full mb-4">
                        <FaHospital className="text-red-500 text-4xl" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold mb-2 text-center" style={{ color: colors.text }}>Hospital Not Found</h2>
                    <p className="text-center mb-6 text-sm md:text-base" style={{ color: colors.muted }}>
                        The hospital you're looking for doesn't exist or may have been removed
                    </p>
                    <button
                        onClick={() => navigate('/hospitals')}
                        className="px-6 py-2 rounded-lg font-medium transition-colors text-sm md:text-base"
                        style={{
                            backgroundColor: colors.primary,
                            color: 'white',
                        }}
                    >
                        Back to Hospitals
                    </button>
                </div>
            </Dashboard>
        );
    }

    return (
        <Dashboard>
            <motion.div
                initial="hidden"
                animate="show"
                variants={containerVariants}
                className="min-h-screen flex flex-col overflow-hidden"
                style={{ backgroundColor: colors.background }}
            >
                {/* Header Section */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col justify-between items-start p-4 md:p-6 gap-3 flex-shrink-0"
                    // style={{
                    //     // background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                    //     color: 'white'
                    // }}
                >
                    <div className="w-full">
                        <h1 className="text-xl md:text-3xl font-bold mb-1">Hospital Profile</h1>
                        <p className="text-xs md:text-sm opacity-90">
                            Detailed view and management of hospital information
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full">
                        <Link to={`/hospital/update/${id}`} className="flex-1 min-w-[140px]">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl shadow-md transition-all bg-[#009689] bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-xs md:text-sm w-full"
                            >
                                <FaEdit className="text-xs" /> Edit Profile
                            </motion.button>
                        </Link>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(-1)}
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl shadow-md transition-all bg-[#009689] text-white text-xs md:text-sm flex-1 min-w-[140px]"
                        >
                            Back to List
                        </motion.button>
                    </div>
                </motion.div>

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-3 p-3 md:p-6 flex-1 overflow-hidden">
                    {/* Left Sidebar - Hospital Info */}
                    <motion.div
                        variants={itemVariants}
                        className="w-full lg:w-1/3 flex flex-col h-full min-h-[400px] mb-4 lg:mb-0"
                    >
                        <div className="bg-white rounded-xl md:rounded-2xl shadow-md overflow-hidden flex-1 flex flex-col">
                            {/* Hospital Image */}
                            <div className="h-32 md:h-48 bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center relative">
                                {hospital?.image ? (
                                    <motion.img
                                        src={hospital.image}
                                        alt={hospital.name}
                                        className="h-full w-full object-cover"
                                        whileHover={{ scale: 1.02 }}
                                    />
                                ) : (
                                    <div className="p-6 rounded-lg flex items-center justify-center">
                                        <FaHospital className="text-4xl md:text-5xl" style={{ color: colors.primary }} />
                                    </div>
                                )}
                                <div className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-md">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                </div>
                            </div>

                            {/* Hospital Details */}
                            <div className="p-3 md:p-6 flex-1 flex flex-col overflow-auto">
                                <h2 className="text-lg md:text-2xl font-bold mb-2" style={{ color: colors.text }}>
                                    {hospital.name}
                                </h2>
                                <div className="flex items-start gap-2 mb-3" style={{ color: colors.muted }}>
                                    <FaMapMarkerAlt className="mt-0.5 flex-shrink-0" style={{ color: colors.primary }} />
                                    <span className="text-xs md:text-sm leading-tight">{hospital.address}, {hospital.city}, {hospital.state} - {hospital.pincode}</span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 p-2 rounded-lg border" style={{ borderColor: colors.border }}>
                                        <div className="p-1 rounded-full bg-blue-50 flex-shrink-0">
                                            <FaPhone className="text-xs md:text-sm" style={{ color: colors.primary }} />
                                        </div>
                                        <span className="text-xs md:text-sm truncate" style={{ color: colors.text }}>{hospital.phone}</span>
                                    </div>

                                    <div className="flex items-center gap-2 p-2 rounded-lg border" style={{ borderColor: colors.border }}>
                                        <div className="p-1 rounded-full bg-blue-50 flex-shrink-0">
                                            <FaEnvelope className="text-xs md:text-sm" style={{ color: colors.primary }} />
                                        </div>
                                        <span className="text-xs md:text-sm truncate" style={{ color: colors.text }}>{hospital.email}</span>
                                    </div>

                                    {hospital.website && (
                                        <a
                                            href={hospital.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 p-2 rounded-lg border hover:bg-blue-50 transition-colors"
                                            style={{ borderColor: colors.border }}
                                        >
                                            <div className="p-1 rounded-full bg-blue-50 flex-shrink-0">
                                                <FaGlobe className="text-xs md:text-sm" style={{ color: colors.primary }} />
                                            </div>
                                            <span style={{ color: colors.primary }} className="hover:underline text-xs md:text-sm truncate">
                                                {hospital.website.replace(/^https?:\/\//, '')}
                                            </span>
                                        </a>
                                    )}
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div className="p-2 rounded-lg text-center border" style={{ borderColor: colors.border }}>
                                        <div className="text-xs" style={{ color: colors.muted }}>Doctors</div>
                                        <div className="text-lg font-bold" style={{ color: colors.primary }}>{doctor?.length}</div>
                                    </div>
                                    <div className="p-2 rounded-lg text-center border" style={{ borderColor: colors.border }}>
                                        <div className="text-xs" style={{ color: colors.muted }}>Staff</div>
                                        <div className="text-lg font-bold" style={{ color: colors.accent }}>{staff?.length}</div>
                                    </div>
                                </div>

                                {/* Specialties */}
                                <div className="mb-4">
                                    <h3 className="text-sm md:text-md font-semibold mb-2" style={{ color: colors.text }}>Specialties</h3>
                                    <div className="flex flex-wrap gap-1">
                                        {hospital.specialties.map((specialty, index) => (
                                            <motion.span
                                                key={index}
                                                className="px-2 py-1 rounded-full text-xs border"
                                                style={{
                                                    borderColor: colors.border,
                                                    color: colors.primary
                                                }}
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                {specialty}
                                            </motion.span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Content - Tabs */}
                    <motion.div
                        variants={itemVariants}
                        className="w-full lg:w-2/3 flex flex-col h-full min-h-[500px]"
                    >
                        <div className="bg-white rounded-xl md:rounded-2xl shadow-md overflow-hidden flex-1 flex flex-col">
                            {/* Tabs Navigation */}
                            <div className="flex overflow-x-auto border-b no-scrollbar" style={{ borderColor: colors.border }}>
                                {[
                                    { id: 'overview', icon: <FaHospital className="text-xs md:text-base" />, label: 'Overview' },
                                    { id: 'doctors', icon: <FaUserMd className="text-xs md:text-base" />, label: 'Doctors' },
                                    { id: 'staff', icon: <FaUsers className="text-xs md:text-base" />, label: 'Staff' },
                                    { id: 'facilities', icon: <FaProcedures className="text-xs md:text-base" />, label: 'Facilities' },
                                    // { id: 'appointments', icon: <FaCalendarAlt className="text-xs md:text-base" />, label: 'Appointments' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex flex-col md:flex-row items-center px-2 py-2 md:px-4 md:py-3 font-medium text-xs md:text-sm whitespace-nowrap border-b-2 transition-colors flex-shrink-0 min-w-[80px] md:min-w-0 ${
                                            activeTab === tab.id 
                                                ? 'border-blue-500 text-blue-600' 
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        <span className="mb-1 md:mb-0 md:mr-1">{tab.icon}</span>
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="p-3 md:p-6 flex-1 overflow-auto">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="h-full"
                                    >
                                        {activeTab === 'overview' && (
                                            <div className="h-full">
                                                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4" style={{ color: colors.text }}>Hospital Overview</h3>
                                                <div className="prose max-w-none" style={{ color: colors.text }}>
                                                    <p className="mb-3 md:mb-4 text-sm md:text-base">Welcome to the comprehensive overview of {hospital.name}. This hospital is a leading healthcare provider in the region, offering top-notch medical services across various specialties.</p>

                                                    <div className="grid grid-cols-1 gap-3 md:gap-4 mb-4 md:mb-6">
                                                        <div className="p-3 md:p-4 rounded-lg border" style={{ borderColor: colors.border }}>
                                                            <h4 className="font-bold mb-2 flex items-center gap-2 text-sm md:text-base" style={{ color: colors.primary }}>
                                                                <FaClinicMedical /> Key Features
                                                            </h4>
                                                            <ul className="space-y-2">
                                                                {hospital.facilities.slice(0, 5).map((facility, index) => (
                                                                    <li key={index} className="flex items-start text-xs md:text-sm">
                                                                        <span className="inline-block w-2 h-2 rounded-full mt-2 mr-2 flex-shrink-0" style={{ backgroundColor: colors.accent }}></span>
                                                                        <span>{facility}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        <div className="p-3 md:p-4 rounded-lg border" style={{ borderColor: colors.border }}>
                                                            <h4 className="font-bold mb-2 flex items-center gap-2 text-sm md:text-base" style={{ color: colors.primary }}>
                                                                <FaUserMd /> Medical Team
                                                            </h4>
                                                            <p className="text-xs md:text-sm">Our hospital boasts a team of {doctor.length} highly qualified doctors across various specialties.</p>
                                                            <div className="mt-3">
                                                                <motion.button
                                                                    whileHover={{ scale: 1.02 }}
                                                                    whileTap={{ scale: 0.98 }}
                                                                    onClick={() => setActiveTab('doctors')}
                                                                    className="text-xs md:text-sm px-3 py-2 md:px-4 md:py-2 rounded-lg bg-blue-50 text-blue-600"
                                                                >
                                                                    View All Doctors
                                                                </motion.button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'doctors' && (
                                            <div className="h-full flex flex-col">
                                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 md:mb-4 gap-2 md:gap-3">
                                                    <h3 className="text-lg md:text-xl font-bold" style={{ color: colors.text }}>Medical Team</h3>
                                                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                                        <div className="relative w-full md:w-48">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <FaSearch className="text-gray-400 text-xs" />
                                                            </div>
                                                            <input
                                                                type="text"
                                                                placeholder="Search doctors..."
                                                                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm w-full focus:border-blue-500 focus:ring-blue-500"
                                                                value={searchTerm}
                                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                            />
                                                        </div>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => navigate(`/doctor/create/${hospital._id}`)}
                                                            className="px-3 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap flex items-center justify-center gap-1 bg-blue-600 text-white w-full md:w-auto"
                                                        >
                                                            <FaPlus className="text-xs" /> Add Doctor
                                                        </motion.button>
                                                    </div>
                                                </div>

                                                {/* Doctors Table */}
                                                <div className="border border-gray-200 rounded-lg bg-white flex-1 overflow-hidden flex flex-col">
                                                    {filteredDoctors.length > 0 ? (
                                                        <div className="overflow-auto flex-1">
                                                            <div className="min-w-[600px]"> {/* Minimum width for horizontal scrolling on mobile */}
                                                                <table className="w-full">
                                                                    <thead>
                                                                        <tr className="bg-gray-50">
                                                                            <th className="p-2 text-left text-xs font-medium text-gray-600">Doctor</th>
                                                                            <th className="p-2 text-left text-xs font-medium text-gray-600">Specialty</th>
                                                                            <th className="p-2 text-left text-xs font-medium text-gray-600">Exp</th>
                                                                            <th className="p-2 text-left text-xs font-medium text-gray-600">Fee</th>
                                                                            <th className="p-2 text-left text-xs font-medium text-gray-600">Status</th>
                                                                            <th className="p-2 text-right text-xs font-medium text-gray-600">Actions</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {filteredDoctors.map((doc) => (
                                                                            <motion.tr
                                                                                key={doc._id}
                                                                                initial={{ opacity: 0, y: 10 }}
                                                                                animate={{ opacity: 1, y: 0 }}
                                                                                transition={{ duration: 0.3 }}
                                                                                className="border-b border-gray-100 hover:bg-gray-50"
                                                                            >
                                                                                <td className="p-2">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                                                                            <img
                                                                                                className="h-full w-full object-cover"
                                                                                                src={doc.photo || avatar}
                                                                                                alt={doc.name}
                                                                                            />
                                                                                        </div>
                                                                                        <span className="text-xs md:text-sm truncate" style={{ color: colors.text }}>{doc.name}</span>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="p-2 text-xs text-gray-600 truncate max-w-[80px]">{doc.specialty}</td>
                                                                                <td className="p-2 text-xs" style={{ color: colors.text }}>{doc.experience}y</td>
                                                                                <td className="p-2 text-xs" style={{ color: colors.text }}>₹{doc.consultationFee}</td>
                                                                                <td className="p-2">
                                                                                    <motion.span
                                                                                        className="px-2 py-1 text-xs rounded-full text-white"
                                                                                        animate={doc.status}
                                                                                        variants={statusBadgeVariants}
                                                                                        style={{
                                                                                            display: 'inline-block',
                                                                                            minWidth: '50px',
                                                                                            textAlign: 'center'
                                                                                        }}
                                                                                    >
                                                                                        {doc.status}
                                                                                    </motion.span>
                                                                                </td>
                                                                                <td className="p-2">
                                                                                    <div className="flex justify-end gap-1">
                                                                                        <Link to={`/doctor/${doc._id}`}>
                                                                                            <motion.button
                                                                                                whileHover={{ scale: 1.05 }}
                                                                                                whileTap={{ scale: 0.95 }}
                                                                                                className="text-xs p-1 rounded bg-blue-50 text-blue-600"
                                                                                                title="View"
                                                                                            >
                                                                                                <FaEye />
                                                                                            </motion.button>
                                                                                        </Link>
                                                                                        <Link to={`/update/doctor/${doc._id}`}>
                                                                                            <motion.button
                                                                                                whileHover={{ scale: 1.05 }}
                                                                                                whileTap={{ scale: 0.95 }}
                                                                                                className="text-xs p-1 rounded bg-green-50 text-green-600"
                                                                                                title="Edit"
                                                                                            >
                                                                                                <FaEdit />
                                                                                            </motion.button>
                                                                                        </Link>
                                                                                        <motion.button
                                                                                            whileHover={{ scale: 1.05 }}
                                                                                            whileTap={{ scale: 0.95 }}
                                                                                            onClick={() => {
                                                                                                if (window.confirm('Are you sure you want to delete this doctor?')) {
                                                                                                    deleteDoctorHandler(doc._id);
                                                                                                }
                                                                                            }}
                                                                                            className="text-xs p-1 rounded bg-red-50 text-red-600"
                                                                                            title="Delete"
                                                                                        >
                                                                                            <FaTrash />
                                                                                        </motion.button>
                                                                                    </div>
                                                                                </td>
                                                                            </motion.tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 md:p-6 text-center flex-1 flex items-center justify-center">
                                                            <div className="flex flex-col items-center justify-center">
                                                                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center mb-3 bg-blue-50">
                                                                    <FaUserMd className="text-lg md:text-xl text-blue-500" />
                                                                </div>
                                                                <h3 className="text-sm md:text-md font-medium mb-1" style={{ color: colors.text }}>
                                                                    No doctors found
                                                                </h3>
                                                                <p className="text-xs text-gray-500">
                                                                    {searchTerm ? 'Try a different search term' : 'No doctors registered in this hospital'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {activeTab === 'staff' && (
                                            <div className="h-full flex flex-col">
                                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 md:mb-4 gap-2 md:gap-3">
                                                    <h3 className="text-lg md:text-xl font-bold" style={{ color: colors.text }}>Staff Members</h3>
                                                    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                                                        <div className="relative w-full md:w-48">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <FaSearch className="text-gray-400 text-xs" />
                                                            </div>
                                                            <input
                                                                type="text"
                                                                placeholder="Search staff..."
                                                                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs md:text-sm w-full focus:border-blue-500 focus:ring-blue-500"
                                                                value={searchTerm}
                                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                            />
                                                        </div>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => navigate(`/staff/register/${hospital._id}`)}
                                                            className="px-3 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap flex items-center justify-center gap-1 bg-blue-600 text-white w-full md:w-auto"
                                                        >
                                                            <FaPlus className="text-xs" /> Add Staff
                                                        </motion.button>
                                                    </div>
                                                </div>

                                                {/* Staff Table */}
                                                <div className="border border-gray-200 rounded-lg bg-white flex-1 overflow-hidden flex flex-col">
                                                    <div className="overflow-auto flex-1">
                                                        <div className="min-w-[500px]"> {/* Minimum width for horizontal scrolling */}
                                                            <table className="min-w-full divide-y divide-gray-200">
                                                                <thead className="bg-gray-50">
                                                                    <tr>
                                                                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                            Staff Member
                                                                        </th>
                                                                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                            Contact Info
                                                                        </th>
                                                                        <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                            Actions
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="bg-white divide-y divide-gray-200">
                                                                    {filteredStaff?.length > 0 ? (
                                                                        filteredStaff?.map((doc) => (
                                                                            <motion.tr
                                                                                key={doc._id}
                                                                                initial={{ opacity: 0, y: 10 }}
                                                                                animate={{ opacity: 1, y: 0 }}
                                                                                exit={{ opacity: 0 }}
                                                                                transition={{ duration: 0.3 }}
                                                                                className="hover:bg-gray-50 transition-colors"
                                                                            >
                                                                                <td className="px-3 py-2 whitespace-nowrap">
                                                                                    <div className="flex items-center">
                                                                                        <div>
                                                                                            <div className="text-xs md:text-sm font-medium text-gray-900 truncate max-w-[120px]">{doc.name}</div>
                                                                                            <div className="text-xs text-gray-500">{doc.role || 'Staff'}</div>
                                                                                        </div>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="px-3 py-2">
                                                                                    <div className="text-xs md:text-sm text-gray-900 truncate max-w-[120px]">{doc.email}</div>
                                                                                    <div className="text-xs text-gray-500">+91-{doc.number}</div>
                                                                                </td>
                                                                                <td className="px-3 py-2 whitespace-nowrap text-right text-xs font-medium">
                                                                                    <div className="flex justify-end space-x-1">
                                                                                        <motion.button
                                                                                            whileHover={{ scale: 1.05 }}
                                                                                            whileTap={{ scale: 0.95 }}
                                                                                            onClick={() => {
                                                                                                if (window.confirm('Are you sure you want to delete this staff member?')) {
                                                                                                    deleteStaffId(doc._id);
                                                                                                }
                                                                                            }}
                                                                                            className="inline-flex items-center p-1 rounded-md text-xs bg-red-50 text-red-600"
                                                                                            title="Delete"
                                                                                        >
                                                                                            <FaTrash />
                                                                                        </motion.button>
                                                                                    </div>
                                                                                </td>
                                                                            </motion.tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr>
                                                                            <td colSpan="3" className="px-4 py-6 md:px-6 md:py-8 text-center">
                                                                                <div className="flex flex-col items-center justify-center">
                                                                                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center mb-3 bg-blue-50">
                                                                                        <FaUsers className="text-lg md:text-xl text-blue-500" />
                                                                                    </div>
                                                                                    <h3 className="text-sm md:text-md font-medium mb-1 text-gray-900">
                                                                                        No staff members found
                                                                                    </h3>
                                                                                    <p className="text-xs text-gray-500">
                                                                                        {searchTerm ? 'Try a different search term' : 'No staff registered in this hospital'}
                                                                                    </p>
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
                                        )}

                                        {activeTab === 'facilities' && (
                                            <div className="h-full">
                                                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4" style={{ color: colors.text }}>Hospital Facilities</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                                                    {hospital.facilities.map((facility, index) => (
                                                        <motion.div
                                                            key={index}
                                                            className="p-2 md:p-3 rounded-lg border hover:shadow-md transition-shadow bg-white"
                                                            style={{ borderColor: colors.border }}
                                                            whileHover={{ scale: 1.02 }}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1 rounded-lg bg-blue-50 flex-shrink-0">
                                                                    <FaProcedures className="text-blue-500 text-xs md:text-sm" />
                                                                </div>
                                                                <span className="font-medium text-gray-900 text-xs md:text-sm truncate">{facility}</span>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'appointments' && (
                                            <div className="h-full flex items-center justify-center p-4">
                                                <div className="bg-gray-50 p-4 md:p-6 rounded-lg text-center max-w-md w-full">
                                                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center mb-3 mx-auto bg-blue-50">
                                                        <FaCalendarAlt className="text-lg md:text-xl text-blue-500" />
                                                    </div>
                                                    <h4 className="text-sm md:text-md font-medium mb-2 text-gray-900">Appointment Management</h4>
                                                    <p className="text-xs mb-4 text-gray-600">
                                                        View and manage all hospital appointments in one place
                                                    </p>
                                                    <button className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-600 text-white">
                                                        View Appointments
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </Dashboard>
    );
};

export default HospitalDetails;