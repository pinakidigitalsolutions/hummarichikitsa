import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, FileText, Search, CheckCircle, XCircle, ChevronRight, Filter, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppointmentConferm, getAllAppointment, todayAppointment } from '../../Redux/appointment';
import { getAllHospital } from '../../Redux/hospitalSlice';
import { getAllDoctors } from '../../Redux/doctorSlice';
import { useDispatch, useSelector } from 'react-redux';
import Dashboard from '../../components/Layout/Dashboard';
import axiosInstance from '../../Helper/axiosInstance';
import socket from '../../Helper/socket';
import { AuthMe } from '../../Redux/AuthLoginSlice';

const StaffDasboard = () => {
  const dispatch = useDispatch();
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [active, setactive] = useState(true);

  const { isLoggedIn, data } = useSelector((store) => store.LoginAuth || {});
  const currentUser = data?.user || {};
  
  // Use ref for filter dropdown
  const filterRef = useRef(null);

  // Professional healthcare color scheme
  const colors = {
    primary: '#2563EB',
    secondary: '#0EA5E9',
    accent: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#1E293B',
    muted: '#64748B',
    border: '#E2E8F0'
  };

  // Filter appointments based on search and filter status
  const filteredAppointments = appointments?.filter(appointment => {
    const matchesSearch =
      appointment?.token?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment?.mobile?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  // Get appointments with status filter
  const getAppointment = useCallback(async (status = 'all') => {
    setIsLoading(true);
    try {
      const res = await dispatch(todayAppointment());
      if (res.payload?.appointments) {
        setAppointments(res.payload.appointments);
      } else if (res.payload?.data) {
        setAppointments(res.payload.data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  // Handle filter change
  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setShowFilters(false);
    getAppointment(status === 'all' ? 'all' : status);
  };

  const ConfirmAppointment = async (appointment_id) => {
    try {
      await dispatch(AppointmentConferm(appointment_id));
      socket.emit("appointmentUpdate", { appointment_id });
      getAppointment(filterStatus === 'all' ? 'all' : filterStatus);
    } catch (error) {
      console.error("Error confirming appointment:", error);
    }
  };

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
      console.log("🟢 Socket createAppointment received:", data);
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

  const ActiveDoctor = async () => {
    const res = await axiosInstance.put(`/doctor/${currentUser?.data?._id}/active/doctor`)
    localStorage.setItem("data", JSON.stringify(res?.data?.getDoctor));
    setactive(res?.data?.getDoctor?.active)
    
  }

  useEffect(() => {
   (async()=>{
    const res = await dispatch(AuthMe());
   setactive(res.payload.user.active)
   })()
  }, []);
   
  useEffect(() => {
    const fetchData = async () => {
      try {
        await axiosInstance.patch('/appointment/hospital/patient');
        await getAppointment();
        await dispatch(getAllAppointment());
        await dispatch(getAllHospital());
        await dispatch(getAllDoctors());
      } catch (error) {
        console.error("Error in initial data loading:", error);
      }
    };

    fetchData();
  }, [dispatch, getAppointment]);

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
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const statusConfig = {
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
  };

  const getStatus = (appointment) => {
    if (appointment.status === "completed") return "completed";
    if (appointment.status === "cancelled") return "cancelled";
    if (appointment.status === "pending") return "pending";
    if (appointment.status === "confirmed") return "confirmed";
    if (appointment.status === "check-in") return "check-in";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(appointment.date);
    appointmentDate.setHours(0, 0, 0, 0);

    return appointmentDate >= today ? "active" : "cancelled";
  };

  const stats = [
    {
      title: 'Total Appointments',
      value: appointments?.length || 0,
      icon: <Calendar size={20} />,
      color: colors.primary,
      change: '+12%'
    },
    {
      title: 'Completed',
      value: appointments?.filter(a => a.status === 'completed').length || 0,
      icon: <CheckCircle size={20} />,
      color: colors.accent,
      change: '+5%'
    },
    {
      title: 'Pending',
      value: appointments?.filter(a => a.status === 'pending').length || 0,
      icon: <Clock size={20} />,
      color: colors.warning,
      change: '-2%'
    },
    {
      title: 'Check In',
      value: appointments?.filter(a => a.status === 'check-in').length || 0,
      icon: <User size={20} />,
      color: colors.secondary,
      change: '+3%'
    }
  ];

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All Appointments' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'check-in', label: 'Check In' }
  ];

  return (
    <Dashboard>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your appointments and patient schedule</p>
          </div>

          {/* Stats Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-xl shadow-sm p-6 border-l-4"
                style={{ borderLeftColor: stat.color }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {isLoading ? (
                        <div className="h-8 w-12 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        stat.value
                      )}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-full"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    {stat.icon}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Appointments Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm overflow-visible"
          >
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative"> 
              <div>
                <div className="flex items-center space-x-2 mr-4">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#009689] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#009689]"></span>
                  </span>
                  <span className="font-semibold text-gray-700">Today's Appointments</span>
                  {currentUser?.role === 'doctor' && (
                    <button
                      onClick={ActiveDoctor}
                      className={`relative cursor-pointer w-20 h-8 rounded-full transition-all duration-300 flex items-center 
                        ${active ? "bg-gray-400" : "bg-gradient-to-r from-emerald-500 to-teal-600"}`}
                    >
                      <span
                        className={`absolute left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 
                          ${active ? "translate-x-12" : "translate-x-0"}`}
                      ></span>
                      <span className="absolute text-white w-full text-xs font-semibold text-center">
                        {active ? "OFF" : "ON"}
                      </span>
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
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

                {/* Fixed Filter Dropdown - Responsive for all devices */}
                <div className="relative z-50" ref={filterRef}>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 w-full sm:w-auto bg-white transition-colors duration-200"
                  >
                    <Filter size={16} />
                    Filter
                    {filterStatus !== 'all' && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                        {filterOptions.find(opt => opt.value === filterStatus)?.label}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showFilters && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-xl z-[100] border border-gray-200"
                        // Mobile view ke liye fixed positioning hatayi aur normal absolute rakha
                      >
                        <div className="py-1 max-h-60 overflow-y-auto"> {/* Scroll agar options zyada ho */}
                          {filterOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleFilterChange(option.value)}
                              className={`block w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${filterStatus === option.value
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Appointments Table */}
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-3 text-gray-600">Loading appointments...</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="rounded-xl">
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4 p-4">
                    <AnimatePresence>
                      {filteredAppointments?.length > 0 ? (
                        filteredAppointments.map((appointment, index) => {
                          const status = getStatus(appointment);
                          const statusStyle = statusConfig[status] || statusConfig.pending;

                          return (
                            <motion.div
                              key={appointment._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                              className="bg-white rounded-lg shadow border p-4"
                            >
                              {/* Patient Info */}
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-blue-600" />
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">
                                      {appointment.patient || `Patient ${index + 1}`}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {appointment?.mobile || 'No contact'}
                                    </div>
                                  </div>
                                </div>
                                <div
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: statusStyle.bgColor,
                                    color: statusStyle.textColor
                                  }}
                                >
                                  {statusStyle.icon}
                                  <span className="ml-1">{statusStyle.text}</span>
                                </div>
                              </div>

                              {/* Details Grid */}
                              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                <div>
                                  <div className="text-gray-500 text-xs">Time</div>
                                  <div className="font-medium text-sm">{appointment?.slot}</div>
                                  <div className="text-xs text-gray-500 mt-1">{appointment?.date}</div>
                                </div>
                                <div>
                                  <div className="text-gray-500 text-xs">Token</div>
                                  <div className="font-medium font-mono text-sm">{appointment?.token}</div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex space-x-2 pt-2">
                                <Link to={`/appointment/${appointment?._id}`} className="flex-1">
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors border border-blue-200"
                                  >
                                    View Details
                                  </motion.button>
                                </Link>
                                {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                                  <motion.button
                                    onClick={() => {
                                      if (window.confirm("Are you sure you want to update this appointment?")) {
                                        ConfirmAppointment(appointment?._id);
                                      }
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors border border-green-200"
                                  >
                                    {appointment.status === 'check-in' ? 'Check-in' : 
                                     appointment.status === 'confirmed' ? 'Complete' : 
                                     'Confirm'}
                                  </motion.button>
                                )}
                              </div>
                            </motion.div>
                          );
                        })
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="bg-white rounded-lg shadow border p-8 text-center"
                        >
                          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No appointments found
                          </h3>
                          <p className="text-sm text-gray-500 mb-4">
                            {searchTerm || filterStatus !== 'all'
                              ? 'Try adjusting your search or filter criteria'
                              : 'No appointments found for the selected filter'}
                          </p>
                          {(searchTerm || filterStatus !== 'all') && (
                            <button
                              onClick={() => {
                                setSearchTerm('');
                                setFilterStatus('all');
                              }}
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                            >
                              Clear Filters
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-auto rounded-xl max-h-96">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Patient
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Token
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <AnimatePresence>
                          {filteredAppointments?.length > 0 ? (
                            filteredAppointments.map((appointment, index) => {
                              const status = getStatus(appointment);
                              const statusStyle = statusConfig[status] || statusConfig.pending;

                              return (
                                <motion.tr
                                  key={appointment._id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="hover:bg-gray-50 border-b border-gray-100"
                                >
                                  <td className="px-6 py-4">
                                    <div className="flex items-center">
                                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <User className="h-5 w-5 text-blue-600" />
                                      </div>
                                      <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                          {appointment.patient || `Patient ${index + 1}`}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-1">
                                          {appointment?.mobile || 'No contact'}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{appointment?.slot}</div>
                                    <div className="text-sm text-gray-500">{appointment?.date}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded border">
                                      {appointment?.token}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div
                                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
                                      style={{
                                        backgroundColor: statusStyle.bgColor,
                                        color: statusStyle.textColor,
                                        borderColor: statusStyle.textColor + '20'
                                      }}
                                    >
                                      {statusStyle.icon}
                                      <span className="ml-1.5">{statusStyle.text}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-2">
                                      <Link to={`/appointment/${appointment?._id}`}>
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors border border-blue-200"
                                        >
                                          View
                                        </motion.button>
                                      </Link>
                                      {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                                        <motion.button
                                          onClick={() => {
                                            if (window.confirm("Are you sure you want to update this appointment?")) {
                                              ConfirmAppointment(appointment?._id);
                                            }
                                          }}
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors border border-green-200"
                                        >
                                          {appointment.status === 'check-in' ? 'Check-in' : 
                                           appointment.status === 'confirmed' ? 'Complete' : 
                                           'Confirm'}
                                        </motion.button>
                                      )}
                                    </div>
                                  </td>
                                </motion.tr>
                              );
                            })
                          ) : (
                            <motion.tr
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <td colSpan="5" className="px-6 py-12 text-center">
                                <div className="flex flex-col items-center justify-center">
                                  <FileText className="h-16 w-16 mb-4 text-gray-400" />
                                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No appointments found
                                  </h3>
                                  <p className="text-sm text-gray-500 mb-4">
                                    {searchTerm || filterStatus !== 'all'
                                      ? 'Try adjusting your search or filter criteria'
                                      : 'No appointments found for the selected filter'}
                                  </p>
                                  {(searchTerm || filterStatus !== 'all') && (
                                    <button
                                      onClick={() => {
                                        setSearchTerm('');
                                        setFilterStatus('all');
                                      }}
                                      className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                                    >
                                      Clear Filters
                                    </button>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Dashboard>
  );
};

export default StaffDasboard;