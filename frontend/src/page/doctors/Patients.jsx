import React, { useState, useEffect } from 'react';
import Dashboard from '../../components/Layout/Dashboard';
import { useDispatch, useSelector } from 'react-redux';
import { AppointmentConferm, getAllAppointment } from '../../Redux/appointment';
import { Calendar, Clock, User, Search, CheckCircle, XCircle, CircleCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Patients = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [dateRangeStart, setDateRangeStart] = useState(null);
    const [dateRangeEnd, setDateRangeEnd] = useState(null);
    const [filterMode, setFilterMode] = useState('single'); // 'single' or 'range'
    const [appointmentsByDate, setAppointmentsByDate] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    // Professional healthcare color scheme
    const colors = {
        primary: '#2B6CB0',      // Deep blue
        secondary: '#4299E1',    // Light blue
        accent: '#48BB78',       // Green
        danger: '#F56565',       // Red
        warning: '#ED8936',      // Orange
        background: '#F7FAFC',   // Light gray
        card: '#FFFFFF',         // White
        text: '#2D3748',         // Dark gray
        muted: '#718096'         // Gray
    };

    const appointments = useSelector((state) => state.appointment?.appointment);

    // Process appointments by date
    useEffect(() => {
        if (appointments?.length) {
            const byDate = appointments.reduce((acc, appointment) => {
                const date = appointment.date.split('T')[0];
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {});
            setAppointmentsByDate(byDate);
        }
    }, [appointments]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                await dispatch(getAllAppointment());
            } catch (error) {
                console.error("Error fetching appointments:", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (!appointments || appointments.length === 0) {
            fetchData();
        } else {
            setIsLoading(false);
        }
    }, [dispatch, appointments]);

    // Filter appointments based on search and selected date
    const filteredAppointments = appointments?.filter(appointment => {
        const matchesSearch =
            appointment._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (appointment.patientId?.name && appointment.patientId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            appointment?.token?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.patient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.mobile?.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesDate = true;
        
        if (filterMode === 'single' && selectedDate) {
            matchesDate = isSameDay(new Date(appointment.date), new Date(selectedDate));
        } else if (filterMode === 'range' && dateRangeStart && dateRangeEnd) {
            const appointmentDate = new Date(appointment.date);
            const rangeStart = new Date(dateRangeStart);
            const rangeEnd = new Date(dateRangeEnd);
            matchesDate = appointmentDate >= rangeStart && appointmentDate <= rangeEnd;
        }

        return matchesSearch && matchesDate;
    });

    // Calculate pagination
    const totalPages = Math.ceil((filteredAppointments?.length || 0) / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedAppointments = (selectedDate || (dateRangeStart && dateRangeEnd))
        ? filteredAppointments 
        : filteredAppointments?.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Reset to first page when filter/search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedDate, searchTerm, dateRangeStart, dateRangeEnd, filterMode]);

    // Get dates for current month view
    const getDaysInMonth = () => {
        const days = [];
        const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

        for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
            days.push(new Date(date));
        }
        return days;
    };

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

    const ConfirmAppointment = async (appointment_id) => {
        await dispatch(AppointmentConferm(appointment_id));
        await dispatch(getAllAppointment());
    };

    return (
        <Dashboard>
            <motion.div
                initial="hidden"
                animate="show"
                variants={containerVariants}
                className="space-y-6 p-4 sm:p-6"
                style={{ backgroundColor: colors.background, minHeight: '100vh' }}
            >
                {/* Appointments List Section */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white min-h-[calc(100vh-50px)] rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                    <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="relative w-full md:w-auto">
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="px-4 py-2 rounded-lg font-medium w-full md:w-auto"
                                style={{
                                    backgroundColor: `${colors.primary}20`,
                                    color: colors.primary
                                }}
                                onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                            >
                                {isDateFilterOpen ? 'Hide Calendar' : 'Filter by Date'}
                            </motion.button>

                            <AnimatePresence>
                                {isDateFilterOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                        transition={{ duration: 0.2 }}
                                        className="mt-3 md:mt-2 md:absolute md:top-full md:left-0 z-30 w-full md:w-[460px] bg-white rounded-xl shadow-xl p-4 border"
                                        style={{ borderColor: `${colors.primary}20` }}
                                    >
                                        <div className="flex justify-between items-center mb-4 gap-3">
                                            <h3 className="text-sm font-semibold" style={{ color: colors.text }}>Filter by Date</h3>
                                            <div className="flex items-center space-x-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.08 }}
                                                    whileTap={{ scale: 0.92 }}
                                                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                                    className="p-1 rounded-md hover:bg-gray-100"
                                                >
                                                    <ChevronLeft className="h-4 w-4" style={{ color: colors.primary }} />
                                                </motion.button>
                                                <span className="font-medium min-w-[120px] text-center text-sm" style={{ color: colors.text }}>
                                                    {format(currentMonth, 'MMMM yyyy')}
                                                </span>
                                                <motion.button
                                                    whileHover={{ scale: 1.08 }}
                                                    whileTap={{ scale: 0.92 }}
                                                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                                    className="p-1 rounded-md hover:bg-gray-100"
                                                >
                                                    <ChevronRight className="h-4 w-4" style={{ color: colors.primary }} />
                                                </motion.button>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mb-4">
                                            <button
                                                onClick={() => {
                                                    setFilterMode('single');
                                                    setDateRangeStart(null);
                                                    setDateRangeEnd(null);
                                                }}
                                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                                    filterMode === 'single'
                                                        ? 'text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                                style={filterMode === 'single' ? { backgroundColor: colors.primary } : {}}
                                            >
                                                Single Date
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setFilterMode('range');
                                                    setSelectedDate(null);
                                                }}
                                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                                    filterMode === 'range'
                                                        ? 'text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                                style={filterMode === 'range' ? { backgroundColor: colors.primary } : {}}
                                            >
                                                Date Range
                                            </button>
                                        </div>

                                        {filterMode === 'range' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                <div>
                                                    <label className="block text-xs font-medium mb-1" style={{ color: colors.text }}>Start Date</label>
                                                    <input
                                                        type="date"
                                                        value={dateRangeStart || ''}
                                                        onChange={(e) => setDateRangeStart(e.target.value)}
                                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                                                        style={{ borderColor: colors.primary + '40', '--tw-ring-color': colors.primary }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium mb-1" style={{ color: colors.text }}>End Date</label>
                                                    <input
                                                        type="date"
                                                        value={dateRangeEnd || ''}
                                                        onChange={(e) => setDateRangeEnd(e.target.value)}
                                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                                                        style={{ borderColor: colors.primary + '40', '--tw-ring-color': colors.primary }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {filterMode === 'single' && (
                                            <div className="mb-2">
                                                <div className="grid grid-cols-7 gap-1 mb-2">
                                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                                        <div key={day} className="text-center text-[10px] font-medium py-1" style={{ color: colors.muted }}>
                                                            {day}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="grid grid-cols-7 gap-1">
                                                    {getDaysInMonth().map((date) => {
                                                        const dateStr = format(date, 'yyyy-MM-dd');
                                                        const hasAppointments = appointmentsByDate[dateStr] > 0;
                                                        const isSelected = selectedDate && isSameDay(date, new Date(selectedDate));
                                                        const isToday = isSameDay(date, new Date());
                                                        return (
                                                            <motion.button
                                                                key={dateStr}
                                                                whileHover={hasAppointments ? { scale: 1.05 } : {}}
                                                                whileTap={hasAppointments ? { scale: 0.95 } : {}}
                                                                onClick={() => setSelectedDate(hasAppointments ? dateStr : null)}
                                                                className={`h-10 rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all
                                                            ${isSelected ? 'text-white shadow-md' : ''}
                                                            ${!isSelected && isToday ? 'border-2' : ''}
                                                            ${hasAppointments ? 'hover:shadow-md cursor-pointer' : 'text-gray-300 cursor-default'}
                                                            ${!hasAppointments && !isSelected ? 'bg-gray-50' : ''}
                                                        `}
                                                                style={{
                                                                    backgroundColor: isSelected ? colors.primary : 'transparent',
                                                                    borderColor: isToday ? colors.primary : 'transparent',
                                                                    color: isSelected ? 'white' : (isToday ? colors.primary : (hasAppointments ? colors.text : ''))
                                                                }}
                                                                disabled={!hasAppointments}
                                                            >
                                                                {date.getDate()}
                                                                {hasAppointments && (
                                                                    <motion.span
                                                                        className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : ''}`}
                                                                        style={{ backgroundColor: isSelected ? 'white' : colors.primary }}
                                                                        animate={{ scale: [1, 1.2, 1] }}
                                                                        transition={{ duration: 0.5, repeat: Infinity }}
                                                                    />
                                                                )}
                                                            </motion.button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <h2 className="text-xl font-semibold text-center flex-1" style={{ color: colors.text }}>
                            {selectedDate
                                ? `Appointments on ${format(new Date(selectedDate), 'MMMM d, yyyy')}`
                                : (dateRangeStart && dateRangeEnd)
                                ? `Appointments from ${format(new Date(dateRangeStart), 'MMM d')} to ${format(new Date(dateRangeEnd), 'MMM d')}`
                                : "All Patient Appointments"}
                        </h2>
                        <div className="relative w-full md:w-72">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4" style={{ color: colors.muted }} />
                            </div>
                            <motion.input
                                type="text"
                                placeholder="Search by ID or name..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                                style={{
                                    borderColor: colors.muted
                                }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                whileFocus={{
                                    borderColor: colors.primary,
                                    boxShadow: `0 0 0 3px ${colors.primary}20`
                                }}
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="w-full">
                            <div className="md:hidden space-y-4 p-4">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gray-200" />
                                                <div className="ml-3 space-y-2">
                                                    <div className="h-3 w-28 bg-gray-200 rounded" />
                                                    <div className="h-2 w-16 bg-gray-100 rounded" />
                                                </div>
                                            </div>
                                            <div className="h-6 w-14 bg-gray-100 rounded-full" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="space-y-2">
                                                <div className="h-2 w-16 bg-gray-100 rounded" />
                                                <div className="h-3 w-20 bg-gray-200 rounded" />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-2 w-12 bg-gray-100 rounded" />
                                                <div className="h-3 w-24 bg-gray-200 rounded" />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                            <div className="h-7 w-20 bg-gray-200 rounded-lg" />
                                            <div className="space-y-2 flex flex-col items-end">
                                                <div className="h-2 w-12 bg-gray-100 rounded" />
                                                <div className="h-3 w-10 bg-gray-200 rounded" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="hidden md:block overflow-auto max-h-[85vh]">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Patient</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Token</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Payment</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {Array.from({ length: 6 }).map((_, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center animate-pulse">
                                                        <div className="h-10 w-10 rounded-full bg-gray-200" />
                                                        <div className="ml-4 space-y-2">
                                                            <div className="h-3 w-28 bg-gray-200 rounded" />
                                                            <div className="h-2 w-16 bg-gray-100 rounded" />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-2 animate-pulse">
                                                        <div className="h-3 w-20 bg-gray-200 rounded" />
                                                        <div className="h-2 w-24 bg-gray-100 rounded" />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="h-3 w-10 bg-gray-200 rounded animate-pulse" />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="h-6 w-16 bg-gray-100 rounded-full animate-pulse" />
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="inline-block h-8 w-24 bg-gray-200 rounded-lg animate-pulse" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full">
                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4 p-4">
                                {paginatedAppointments?.length > 0 ? (
                                    paginatedAppointments.map((appointment) => (
                                        <div
                                            key={appointment._id}
                                            onClick={() => navigate(`/appointment/${appointment?._id}`)}
                                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                        <User className="h-5 w-5" style={{ color: colors.primary }} />
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="font-medium text-gray-900">
                                                            {appointment.patient || `Patient ${appointment._id.slice(-4)}`}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            ID: {appointment._id.slice(-6)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                                    #{appointment.token}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mb-4">
                                                <div>
                                                    <div className="text-gray-500 text-[10px] uppercase font-bold">Time & Slot</div>
                                                    <div className="text-sm font-medium text-gray-700">{appointment.slot}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-500 text-[10px] uppercase font-bold">Date</div>
                                                    <div className="text-sm font-medium text-gray-700">
                                                        {format(new Date(appointment.date), 'MMM d, yyyy')}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (window.confirm("Complete this appointment?")) {
                                                                    ConfirmAppointment(appointment?._id);
                                                                }
                                                            }}
                                                            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-sm"
                                                        >
                                                            Complete
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className={`text-[10px] uppercase font-bold mb-1 ${appointment.paymentStatus === 'completed' || appointment.paymentStatus === 'paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                                                        {appointment.paymentStatus || 'pending'}
                                                    </span>
                                                    <div className="text-xs font-bold text-gray-900">₹{appointment.booking_amount || 0}</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                        <Calendar className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                                        <p className="text-gray-500">No appointments found</p>
                                    </div>
                                )}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-auto max-h-[85vh]">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Patient</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Token</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Payment</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: colors.muted }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <AnimatePresence>
                                            {paginatedAppointments?.length > 0 ? (
                                                paginatedAppointments.map((appointment) => {
                                                    let finalStatus;
                                                    if (appointment.status === "completed") {
                                                        finalStatus = "Completed";
                                                    } else {
                                                        const today = new Date();
                                                        today.setHours(0, 0, 0, 0);
                                                        const appointmentDate = new Date(appointment.date);
                                                        appointmentDate.setHours(0, 0, 0, 0);
                                                        finalStatus = appointmentDate >= today ? "Active" : "Inactive";
                                                    }
                                                    return (
                                                        <motion.tr
                                                            key={appointment._id}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="hover:bg-gray-50 cursor-pointer"
                                                            onClick={() => navigate(`/appointment/${appointment?._id}`)}
                                                        >
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center">
                                                                    <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors.primary}20` }}>
                                                                        <User className="h-5 w-5" style={{ color: colors.primary }} />
                                                                    </div>
                                                                    <div className="ml-4">
                                                                        <div className="text-sm font-medium" style={{ color: colors.text }}>
                                                                            {appointment.patient || `Patient ${appointment._id.slice(-4)}`}
                                                                        </div>
                                                                        <div className="text-xs" style={{ color: colors.muted }}>
                                                                            ID: {appointment._id.slice(-6)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium" style={{ color: colors.text }}>{appointment.slot}</div>
                                                                <div className="text-xs" style={{ color: colors.muted }}>
                                                                    {format(new Date(appointment.date), 'MMM d, yyyy')}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium" style={{ color: colors.text }}>{appointment.token}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${finalStatus === 'Active' ? 'bg-green-100 text-green-800' :
                                                                    finalStatus === 'Completed' ? 'bg-blue-100 text-blue-800' :
                                                                        'bg-red-100 text-red-800'
                                                                    }`}>
                                                                    {finalStatus}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${appointment.paymentStatus === 'completed' || appointment.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                    {appointment.paymentStatus || 'Pending'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                                                                <Link to={`/appointment/${appointment?._id}`}>
                                                                    <button
                                                                        className="px-3 py-1 rounded-lg mr-2"
                                                                        style={{ backgroundColor: `${colors.primary}20`, color: colors.primary }}
                                                                    >
                                                                        View Details
                                                                    </button>
                                                                </Link>
                                                                {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                                                                    <button
                                                                        onClick={() => {
                                                                            if (window.confirm("Complete this appointment?")) {
                                                                                ConfirmAppointment(appointment?._id);
                                                                            }
                                                                        }}
                                                                        className="px-3 py-1 rounded-lg"
                                                                        style={{ backgroundColor: `${colors.accent}20`, color: colors.accent }}
                                                                    >
                                                                        Complete
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </motion.tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                                        No appointments found
                                                    </td>
                                                </tr>
                                            )}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                                {/* !dateRangeStart &&  */}
                                {/* Pagination Controls */}
                                {!selectedDate && (filteredAppointments?.length > ITEMS_PER_PAGE || currentPage > 1) && (
                                    <div className="bg-white px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                                        <div className="text-sm text-gray-600">
                                            Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredAppointments?.length)} of {filteredAppointments?.length}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Previous
                                            </button>
                                            <div className="flex items-center gap-2">
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                                                            currentPage === page
                                                                ? 'bg-blue-600 text-white'
                                                                : 'border border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </Dashboard>
    );
};

export default Patients;