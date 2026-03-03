import React, { useEffect, useState } from 'react';
import Dashboard from '../../components/Layout/Dashboard';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getAllHospital } from '../../Redux/hospitalSlice';
import axiosInstance from '../../Helper/axiosInstance';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, ChevronLeft, ChevronRight, Eye, Trash2, Filter, MoreVertical, Building } from 'lucide-react';
import hospital_img from '../../../src/assets/hospital_image.png';

const HospitalList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const hospitals = useSelector((state) => state?.hospitals?.hospitals);
    const itemsPerPage = 8;

    // Professional healthcare color scheme
    const colors = {
        primary: '#2563eb',      // Deep blue
        secondary: '#3b82f6',    // Light blue
        accent: '#10b981',       // Green
        danger: '#ef4444',       // Red
        warning: '#f59e0b',      // Orange
        background: '#f8fafc',   // Light gray
        card: '#FFFFFF',         // White
        text: '#1e293b',         // Dark gray
        muted: '#64748b'         // Gray
    };

    // Filter hospitals based on search and status
    const filteredHospitals = hospitals?.filter(hospital => {
        // alert(hospital.status === statusFilter)/
        
        const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hospital.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hospital.city.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' ||  statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredHospitals?.length / itemsPerPage);
    const currentItems = filteredHospitals?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const updateStatus = async (id, status) => {
        try {
            const res = await axiosInstance.put(`/hospital/${id}/status`);
            if (res.data.success) {
                toast.success(res.data.message);
                dispatch(getAllHospital());
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await axiosInstance.delete(`/hospital/${id}`);
            if (res.data.success) {
                toast.success(res.data.message);
                dispatch(getAllHospital());
            }
        } catch (error) {
            toast.error('Failed to delete hospital');
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                await dispatch(getAllHospital());
            } catch (error) {
                toast.error('Failed to load hospitals');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [dispatch]);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <Dashboard>
            <div className="h-screen flex flex-col" style={{ backgroundColor: colors.background }}>
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4"
                   
                >
                    <div>
                        <h1 className="text-xl font-bold ">Hospital Management</h1>
                        <p className="mt-1 text-xs" >
                            Manage all registered hospitals
                        </p>
                    </div>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <Link to='/hospital/create'>
                            <button
                                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium shadow-sm"
                                style={{
                                    backgroundColor: colors.accent,
                                    color: 'white'
                                }}
                            >
                                <Plus size={16} />
                                Add Hospital
                            </button>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Filters Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-4 shadow-sm"
                >
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                            <div className="relative rounded-md">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={16} style={{ color: colors.muted }} />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-10 pr-3 py-2 text-sm rounded-md border focus:outline-none focus:ring-1"
                                    style={{
                                        borderColor: colors.muted,
                                        focusRingColor: colors.primary
                                    }}
                                    placeholder="Search hospitals..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Bar */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-3 gap-2 p-4 bg-white border-b"
                >
                    <div className="text-center p-2 rounded-md bg-blue-50">
                        <p className="text-xs text-blue-700">Total Hospitals</p>
                        <p className="font-bold text-blue-900">{hospitals?.length || 0}</p>
                    </div>
                    <div className="text-center p-2 rounded-md bg-green-50">
                        <p className="text-xs text-green-700">Active</p>
                        <p className="font-bold text-green-900">{hospitals?.filter(h => h.status).length || 0}</p>
                    </div>
                    <div className="text-center p-2 rounded-md bg-red-50">
                        <p className="text-xs text-red-700">Inactive</p>
                        <p className="font-bold text-red-900">{hospitals?.filter(h => !h.status).length || 0}</p>
                    </div>
                </motion.div>

                {/* Hospitals Table */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="flex-1 overflow-hidden flex flex-col"
                    >
                        {isLoading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="rounded-full h-8 w-8 border-t-2 border-b-2"
                                    style={{ borderColor: colors.primary }}
                                />
                            </div>
                        ) : (
                            <>
                                <div className="flex-1 overflow-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Hospital</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Location</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Specialities</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Status</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            <AnimatePresence>
                                                {currentItems?.length > 0 ? (
                                                    currentItems.map((hospital) => (
                                                        <motion.tr
                                                            key={hospital._id}
                                                            variants={itemVariants}
                                                            className="hover:bg-gray-50"
                                                        >
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center">
                                                                    <div className="h-8 w-8 flex-shrink-0 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                                                        {hospital.image ? (
                                                                            <img
                                                                                className="h-full w-full object-cover"
                                                                                src={hospital.image}
                                                                                alt={hospital.name}
                                                                            />
                                                                        ) : (
                                                                            <Building size={16} className="text-gray-500" />
                                                                        )}
                                                                    </div>
                                                                    <div className="ml-3">
                                                                        <div className="text-sm font-medium" style={{ color: colors.text }}>
                                                                            {hospital.name}
                                                                        </div>
                                                                        <div className="text-xs" style={{ color: colors.muted }}>
                                                                            {hospital.email}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="text-sm" style={{ color: colors.text }}>
                                                                    {hospital.city}, {hospital.state}
                                                                </div>
                                                                <div className="text-xs" style={{ color: colors.muted }}>
                                                                    {hospital.address?.substring(0, 20)}...
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex flex-wrap gap-1">
                                                                    {hospital.specialties?.slice(0, 2).map((specialty, i) => (
                                                                        <span
                                                                            key={i}
                                                                            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                                                                            style={{
                                                                                backgroundColor: `${colors.primary}20`,
                                                                                color: colors.primary
                                                                            }}
                                                                        >
                                                                            {specialty}
                                                                        </span>
                                                                    ))}
                                                                    {hospital.specialties?.length > 2 && (
                                                                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" style={{ backgroundColor: `${colors.muted}20`, color: colors.muted }}>
                                                                            +{hospital.specialties.length - 2}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <button
                                                                    onClick={() => updateStatus(hospital._id)}
                                                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium text-white ${hospital.status  ? 'bg-green-500' : 'bg-red-500'}`}
                                                                >
                                                                    {hospital?.status ? "Active" : "InActive"}
                                                                </button>
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.1 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        onClick={() => navigate(`/hospital/${hospital._id}`)}
                                                                        className="p-1 rounded"
                                                                        style={{ color: colors.primary }}
                                                                        title="View details"
                                                                    >
                                                                        <Eye size={16} />
                                                                    </motion.button>
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.1 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        onClick={() => {
                                                                            if (window.confirm("Are you sure you want to delete this hospital?")) {
                                                                                handleDelete(hospital._id);
                                                                            }
                                                                        }}
                                                                        className="p-1 rounded"
                                                                        style={{ color: colors.danger }}
                                                                        title="Delete hospital"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </motion.button>
                                                                </div>
                                                            </td>
                                                        </motion.tr>
                                                    ))
                                                ) : (
                                                    <motion.tr
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                    >
                                                        <td colSpan="5" className="px-4 py-12 text-center">
                                                            <div className="flex flex-col items-center justify-center">
                                                                <div className="h-12 w-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${colors.primary}10` }}>
                                                                    <Search size={24} style={{ color: colors.primary }} />
                                                                </div>
                                                                <h3 className="text-sm font-medium mb-1" style={{ color: colors.text }}>
                                                                    No hospitals found
                                                                </h3>
                                                                <p className="text-xs" style={{ color: colors.muted }}>
                                                                    {searchTerm ? 'Try a different search term' : 'No hospitals registered yet'}
                                                                </p>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                )}
                                            </AnimatePresence>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t">
                                        <div className="hidden sm:block">
                                            <p className="text-xs" style={{ color: colors.muted }}>
                                                Showing <span className="font-medium" style={{ color: colors.text }}>
                                                    {(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium" style={{ color: colors.text }}>
                                                    {Math.min(currentPage * itemsPerPage, filteredHospitals.length)}</span> of <span className="font-medium" style={{ color: colors.text }}>
                                                    {filteredHospitals.length}</span> results
                                            </p>
                                        </div>
                                        <div className="flex-1 flex justify-between sm:justify-end">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="relative inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium"
                                                style={{
                                                    color: currentPage === 1 ? colors.muted : colors.text,
                                                    backgroundColor: colors.card
                                                }}
                                            >
                                                <ChevronLeft size={16} />
                                                Previous
                                            </button>
                                            <div className="hidden sm:flex items-center mx-4">
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    let pageNum;
                                                    if (totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage >= totalPages - 2) {
                                                        pageNum = totalPages - 4 + i;
                                                    } else {
                                                        pageNum = currentPage - 2 + i;
                                                    }
                                                    
                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => setCurrentPage(pageNum)}
                                                            className={`mx-1 px-2 py-1 rounded text-xs ${currentPage === pageNum ? 'font-bold' : ''}`}
                                                            style={{
                                                                backgroundColor: currentPage === pageNum ? colors.primary : 'transparent',
                                                                color: currentPage === pageNum ? 'white' : colors.text,
                                                            }}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}
                                                {totalPages > 5 && <span className="mx-1 text-gray-500">...</span>}
                                            </div>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="relative inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium"
                                                style={{
                                                    color: currentPage === totalPages ? colors.muted : colors.text,
                                                    backgroundColor: colors.card
                                                }}
                                            >
                                                Next
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                </div>
            </div>
        </Dashboard>
    );
};

export default HospitalList;