import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaHospital, FaPhone, FaEnvelope, FaGlobe, FaStar, FaPlus,
    FaMapMarkerAlt, FaEdit, FaSearch, FaUserMd, FaProcedures, FaBed,
    FaClinicMedical, FaNotesMedical, FaUserNurse, FaUsers
} from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import Dashboard from '../../components/Layout/Dashboard';
import axiosInstance from '../../Helper/axiosInstance';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { deleteDoctor } from '../../Redux/doctorSlice';
import { getStaffByHospitalId, StaffDelete } from '../../Redux/staffSlice';
import avatar from '../../../src/assets/logo-def.png';
const MyHospital = () => {
    // Enhanced healthcare color scheme
    const colors = {
        primary: '#1a73e8',      // Professional blue
        secondary: '#4285f4',    // Google blue
        accent: '#34a853',       // Google green
        danger: '#ea4335',       // Google red
        warning: '#fbbc04',      // Google yellow
        background: '#f8f9fa',   // Light background
        card: '#ffffff',         // White
        text: '#202124',         // Dark text
        muted: '#5f6368',        // Muted text
        lightBorder: '#dadce0'   // Light border
    };

    const statusBadgeVariants = {
        active: { backgroundColor: colors.accent },
        deactive: { backgroundColor: colors.danger }
    };
       const [hospital,sethospital]=useState(null)
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState([])
    // const hospital = JSON.parse(localStorage.getItem('data')) || null;
    const dispatch = useDispatch();
    const deletedoctor = async (id) => {
        const res = await dispatch(deleteDoctor(id))
    }
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [staff, setStaff] = useState([]);
    const [stats, setStats] = useState({
        doctors: 0,
        appointments: 0,
        beds: 0
    });
    const filteredStaff = staff?.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filteredDoctors = doctor?.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const deleteStaffId = async (id) => {
        try {
            const res = await dispatch(StaffDelete(id));
            if (res?.payload?.success) {
                getstaff()
            }
        } catch (error) {
            console.error("Error fetching hospital:", error);
            toast.error("Failed to load hospital data");
        }
    };

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axiosInstance.get("/user/me");
                sethospital(response.data.user);
                
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        fetchData();
    }, []);




    const getstaff = async () => {
        try {
            "getStaffByHospitalId"
            const res = await dispatch(getStaffByHospitalId(hospital?._id))
            const data = res?.payload
            setStaff(data)

        } catch (error) {
            console.error("Error fetching doctors:", error);
            toast.error("Failed to load doctors");
        }
    };

    // Simulate loading animation for stats
    useEffect(() => {
        const timer = setTimeout(() => {
            setStats({
                doctors: 42,
                appointments: 18,
                beds: 56
            });
        }, 800);
        (
            async () => {
                getstaff()
                const res = axiosInstance.get(`/doctor/?hospitalId=${hospital?._id}`)
                const doc = (await res).data.doctors
                setDoctor(doc)

            }
        )()

        return () => clearTimeout(timer);
    }, [hospital]);



        const [loading, setLoading] = useState(true);
    
        useEffect(() => {
            
            const timer = setTimeout(() => {
                setLoading(false);
            }, 2000);
    
            return () => clearTimeout(timer); // cleanup
        }, []);
    
        if (loading) {
            return (
                <Dashboard>
                    <div className="flex justify-center items-center h-full">
                      
                        <span className="Loader"></span>
                    </div>
                </Dashboard>
            );
        }


    return (
        <Dashboard>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="min-h-screen bg-gray-50 py-4"
                style={{ height: '100vh', overflow: 'hidden' }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col">
                    {/* Header with animated edit button */}
                    <motion.div
                        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Hospital Management</h1>
                            <p className="text-gray-500 text-sm">View and manage hospital profile</p>
                        </div>
                        <Link to={`/hospital/update/${hospital?._id}`}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm shadow-md transition-all font-medium"
                            >
                                <FaEdit className="text-xs" /> Edit Profile
                            </motion.button>
                        </Link>
                    </motion.div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        {[
                            {
                                icon: <FaUserMd className="text-lg" />,
                                title: "Doctors",
                                value: doctor.length,
                                color: "blue",
                                bgColor: "bg-blue-100",
                                textColor: "text-blue-600"
                            },
                            {
                                icon: <FaUsers className="text-lg" />,
                                title: "Staff",
                                value: staff?.length,
                                color: "green",
                                bgColor: "bg-green-100",
                                textColor: "text-green-600"
                            },
                            {
                                icon: <FaBed className="text-lg" />,
                                title: "Beds",
                                value: hospital?.beds || 0,
                                color: "purple",
                                bgColor: "bg-purple-100",
                                textColor: "text-purple-600"
                            }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                className="bg-white p-3 rounded-lg shadow-sm border border-gray-100"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                                whileHover={{ y: -3, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-xs font-medium mb-1">{stat.title}</p>
                                        <p className={`text-xl font-bold ${stat.textColor}`}>
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.textColor}`}>
                                        {stat.icon}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Main Content Area with Tabs */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl shadow-sm border border-gray-100">
                        {/* Tabs */}
                        <motion.div
                            className="border-b border-gray-200"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="flex overflow-x-auto">
                                {[
                                    { id: 'overview', label: 'Overview', icon: <FaClinicMedical className="text-xs mr-1" /> },
                                    { id: 'facilities', label: 'Facilities', icon: <FaProcedures className="text-xs mr-1" /> },
                                    { id: 'reports', label: 'Reports', icon: <FaNotesMedical className="text-xs mr-1" /> },
                                    { id: 'doctor', label: 'Doctors', icon: <FaUserMd className="text-xs mr-1" /> },
                                    { id: 'staff', label: 'Staff', icon: <FaUserNurse className="text-xs mr-1" /> }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-3 py-2.5 font-medium text-xs capitalize flex items-center whitespace-nowrap ${activeTab === tab.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        {tab.icon} {tab.label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Tab Content Area - Scrollable */}
                        <div className="flex-1 overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="h-full overflow-y-auto"
                                >
                                    {activeTab === 'overview' && (
                                        <div className="p-4">
                                            <div className="flex flex-col md:flex-row gap-4 mb-6">
                                                {/* Hospital Image */}
                                                <div className="md:w-1/3 flex justify-center">
                                                    <div className="relative">
                                                        {hospital?.image ? (
                                                            <motion.img
                                                                src={hospital.image}
                                                                alt={hospital.name}
                                                                className="w-full h-40 object-cover rounded-lg shadow-md"
                                                                whileHover={{ scale: 1.02 }}
                                                            />
                                                        ) : (
                                                            <div className="w-full h-40 bg-blue-100 rounded-lg flex items-center justify-center">
                                                                <FaHospital className="text-blue-400 text-4xl" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Hospital Details */}
                                                <div className="md:w-2/3">
                                                    <h2 className="text-xl font-bold text-gray-800 mb-2">{hospital?.name}</h2>
                                                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                                                        <FaMapMarkerAlt className="text-blue-500 text-xs" />
                                                        <span>{hospital?.address}, {hospital?.city}, {hospital?.state} - {hospital?.pincode}</span>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        <div className="flex items-center gap-2 text-gray-700 bg-blue-50 px-2 py-1 rounded text-xs">
                                                            <FaPhone className="text-blue-500 text-xs" />
                                                            <span>{hospital?.phone}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-700 bg-blue-50 px-2 py-1 rounded text-xs">
                                                            <FaEnvelope className="text-blue-500 text-xs" />
                                                            <span>{hospital?.email}</span>
                                                        </div>
                                                        {hospital?.website && (
                                                            <a
                                                                href={hospital?.website}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded text-xs"
                                                            >
                                                                <FaGlobe className="text-blue-500 text-xs" />
                                                                <span className="truncate max-w-xs">{hospital.website.replace(/^https?:\/\//, '')}</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Specialties */}
                                            <div className="mb-4">
                                                <h3 className="text-md font-semibold text-gray-800 mb-2">Specialties</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {hospital?.specialties && hospital?.specialties.map((specialty, index) => (
                                                        <span
                                                            key={index}
                                                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
                                                        >
                                                            {specialty}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Facilities Preview */}
                                            <div>
                                                <h3 className="text-md font-semibold text-gray-800 mb-2">Key Facilities</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {hospital?.facilities && hospital?.facilities.slice(0, 4).map((facility, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center gap-2 bg-gray-50 p-2 rounded text-sm border border-gray-100"
                                                        >
                                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                                                            <span className="text-gray-700 truncate">{facility}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'facilities' && (
                                        <div className="p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {hospital.facilities && hospital.facilities.map((facility, index) => (
                                                    <div
                                                        key={index}
                                                        className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 bg-blue-100 rounded">
                                                                <FaProcedures className="text-blue-500 text-sm" />
                                                            </div>
                                                            <span className="font-medium">{facility}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'doctor' && (
                                        <div className="p-4 h-full flex flex-col">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                                                <h3 className="text-lg font-bold text-gray-800">Medical Team</h3>
                                                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                                    <div className="relative w-full md:w-48">
                                                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                                            <FaSearch className="text-gray-400 text-sm" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="Search doctors..."
                                                            className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-xs w-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                        />
                                                    </div>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => navigate(`/doctor/create/${hospital._id}`)}
                                                        className="px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700"
                                                    >
                                                        <FaPlus className="text-xs" /> Add Doctor
                                                    </motion.button>
                                                </div>
                                            </div>

                                            {/* Doctors Table */}
                                            <div className="flex-1 overflow-auto">
                                                {filteredDoctors.length > 0 ? (
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
                                                                <th className="p-2">Doctor</th>
                                                                <th className="p-2">Specialty</th>
                                                                <th className="p-2">Exp</th>
                                                                <th className="p-2">Fee</th>
                                                                <th className="p-2">Rating</th>
                                                                <th className="p-2">Status</th>
                                                                <th className="p-2 text-right">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-200">
                                                            {filteredDoctors.map((doc) => (
                                                                <tr key={doc._id} className="hover:bg-gray-50">
                                                                    <td className="p-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                                                                <img
                                                                                    className="h-full w-full object-cover"
                                                                                    src={doc.photo || avatar}
                                                                                    alt={doc.name}
                                                                                />
                                                                            </div>
                                                                            <span className="font-medium text-xs">{doc.name}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-2 text-gray-600 text-xs">{doc.specialty}</td>
                                                                    <td className="p-2 text-gray-600 text-xs">{doc.experience} yrs</td>
                                                                    <td className="p-2 text-gray-800 font-medium text-xs">₹{doc.consultationFee}</td>
                                                                    <td className="p-2">
                                                                        <div className="flex items-center">
                                                                            {[...Array(5)].map((_, i) => (
                                                                                <svg
                                                                                    key={i}
                                                                                    className={`w-3 h-3 ${i < Math.floor(doc.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                                                                    fill="currentColor"
                                                                                    viewBox="0 0 20 20"
                                                                                >
                                                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                                                </svg>
                                                                            ))}
                                                                            <span className="ml-1 text-xs text-gray-500">{doc.rating}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="p-2">
                                                                        <span
                                                                            className={`px-2 py-1 text-xs rounded-full font-medium ${doc.status  ? 'bg-green-100 h-2 w-2 rounded-full text-green-800' : 'bg-red-100 text-red-800'}`}
                                                                        >
                                                                            {doc.status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="p-2">
                                                                        <div className="flex justify-end gap-1">
                                                                            <Link to={`/doctor/${doc._id}`}>
                                                                                <button
                                                                                    className="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100"
                                                                                >
                                                                                    View
                                                                                </button>
                                                                            </Link>
                                                                            <Link to={`/update/doctor/${doc._id}`}>
                                                                                <button
                                                                                    className="text-xs px-2 py-1 rounded-md bg-green-50 text-green-600 hover:bg-green-100"
                                                                                >
                                                                                    Edit
                                                                                </button>
                                                                            </Link>
                                                                            <button
                                                                                onClick={() => {
                                                                                    if (window.confirm('Are you sure you want to delete this doctor?')) {
                                                                                        deletedoctor(doc._id);
                                                                                    }
                                                                                }}
                                                                                className="text-xs px-2 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                                                                            >
                                                                                Delete
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <div className="p-4 text-center h-full flex items-center justify-center">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <div className="h-12 w-12 rounded-full flex items-center justify-center mb-3 bg-blue-50 text-blue-500">
                                                                <FaUserMd className="text-xl" />
                                                            </div>
                                                            <h3 className="text-md font-medium text-gray-800 mb-1">
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
                                        <div className="p-4 h-full flex flex-col">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                                                <h3 className="text-lg font-bold text-gray-800">Staff Members</h3>
                                                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                                    <div className="relative w-full md:w-48">
                                                        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                                            <FaSearch className="text-gray-400 text-sm" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="Search staff..."
                                                            className="pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-xs w-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                                            value={searchTerm}
                                                            onChange={(e) => setSearchTerm(e.target.value)}
                                                        />
                                                    </div>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => navigate(`/staff/register/${hospital._id}`)}
                                                        className="px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700"
                                                    >
                                                        <FaPlus className="text-xs" /> Add Staff
                                                    </motion.button>
                                                </div>
                                            </div>

                                            {/* Staff Table */}
                                            <div className="flex-1 overflow-auto">
                                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                                Staff Member
                                                            </th>
                                                            <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                                                Contact Info
                                                            </th>
                                                            <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                                                Actions
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {filteredStaff?.length > 0 ? (
                                                            filteredStaff?.map((doc) => (
                                                                <tr key={doc._id} className="hover:bg-gray-50">
                                                                    <td className="px-3 py-3 whitespace-nowrap">
                                                                        <div className="flex items-center">
                                                                            <div>
                                                                                <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                                                                                <div className="text-xs text-gray-500">{doc.role || 'Staff'}</div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-3 py-3">
                                                                        <div className="text-sm text-gray-900">{doc.email}</div>
                                                                        <div className="text-xs text-gray-500">+91-{doc.number}</div>
                                                                    </td>
                                                                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                                        <div className="flex justify-end">
                                                                            <button
                                                                                onClick={() => {
                                                                                    if (window.confirm('Are you sure you want to delete this staff member?')) {
                                                                                        deleteStaffId(doc._id);
                                                                                    }
                                                                                }}
                                                                                className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded-md text-xs"
                                                                            >
                                                                                Delete
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan="3" className="px-3 py-8 text-center">
                                                                    <div className="flex flex-col items-center justify-center">
                                                                        <div className="h-12 w-12 rounded-full flex items-center justify-center mb-3 bg-blue-50 text-blue-500">
                                                                            <FaUserMd className="text-xl" />
                                                                        </div>
                                                                        <h3 className="text-md font-medium text-gray-800 mb-1">
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
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Dashboard>
    );
};

export default MyHospital;