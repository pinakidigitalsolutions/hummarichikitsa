import React, { useState, useEffect } from 'react';
import Dashboard from '../../components/Layout/Dashboard';
import { useDispatch, useSelector } from 'react-redux';
import { AppointmentConferm, getAllAppointment } from '../../Redux/appointment';
import { Calendar, Clock, User, Search, CheckCircle, XCircle, CircleCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { data, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Patients = () => {
    const dispatch = useDispatch();
    const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [appointmentsByDate, setAppointmentsByDate] = useState({});
    const [isLoading, setIsLoading] = useState(true);
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
        setIsLoading(false);
    }, [appointments]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                await dispatch(getAllAppointment());
            } catch (error) {
                console.error("Error fetching appointments:", error);
            }
        };
        if (!appointments || appointments.length === 0) {

            fetchData();
        }
    }, [dispatch]);

    // Filter appointments based on search and selected date
    const filteredAppointments = appointments?.filter(appointment => {
        // Search term conditions from both filters
        const matchesSearch =
            appointment._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (appointment.patientId?.name && appointment.patientId.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            appointment?.token?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.patient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            appointment.mobile?.toLowerCase().includes(searchTerm.toLowerCase());

        // Date condition from first filter
        const matchesDate = selectedDate ? isSameDay(new Date(appointment.date), new Date(selectedDate)) : true;

        return matchesSearch && matchesDate;
    });

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

    const statusBadgeVariants = {
        confirmed: { backgroundColor: colors.accent },
        booked: { backgroundColor: colors.warning },
        cancelled: { backgroundColor: colors.danger },
        completed: { backgroundColor: colors.primary }
    };

    const ConfirmAppointment = async (appointment_id) => {
        await dispatch(AppointmentConferm(appointment_id));
        await dispatch(getAllAppointment());
    };


    const [loading, setLoading] = useState(true);

    useEffect(() => {
        
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer); // cleanup
    }, []);
    return (
        <Dashboard>


            <motion.div
                initial="hidden"
                animate="show"
                variants={containerVariants}
                className="space-y-6 p-6"
                style={{ backgroundColor: colors.background, minHeight: '100vh' }}
            >
                {/* Date Filter Section */}

                {isDateFilterOpen && (
                    <motion.div
                        variants={itemVariants}

                    >
                        <motion.div
                            variants={itemVariants}
                            className="bg-white rounded-xl shadow-sm p-6 transition-all hover:shadow-md"
                            style={{ borderLeft: `4px solid ${colors.primary}` }}
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                                <h3 className="text-lg font-semibold" style={{ color: colors.text }}>Filter by Date</h3>
                                <div className="flex items-center space-x-3">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                                        className="p-1 rounded-md hover:bg-gray-100"
                                    >
                                        <ChevronLeft className="h-5 w-5" style={{ color: colors.primary }} />
                                    </motion.button>
                                    <span className="font-medium" style={{ color: colors.text }}>
                                        {format(currentMonth, 'MMMM yyyy')}
                                    </span>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                                        className="p-1 rounded-md hover:bg-gray-100"
                                    >
                                        <ChevronRight className="h-5 w-5" style={{ color: colors.primary }} />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Mini Calendar */}
                            <div className="mb-4">
                                <div className="grid grid-cols-7 gap-1 mb-2">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                        <div key={day} className="text-center text-xs font-medium py-1" style={{ color: colors.muted }}>
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
                                                className={`h-12 rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all
                                            ${isSelected ? 'bg-blue-600 text-white' : ''}
                                            ${!isSelected && isToday ? 'border-2' : ''}
                                            ${hasAppointments ? 'hover:bg-blue-50 cursor-pointer' : 'text-gray-300 cursor-default'}
                                            ${!hasAppointments && !isSelected ? 'bg-gray-50' : ''}
                                        `}
                                                style={{
                                                    borderColor: isToday ? colors.primary : 'transparent',
                                                    color: isSelected ? 'white' : (isToday ? colors.primary : (hasAppointments ? colors.text : ''))
                                                }}
                                                disabled={!hasAppointments}
                                            >
                                                {date.getDate()}
                                                {hasAppointments && (
                                                    <motion.span
                                                        className={`w-2 h-2 rounded-full mt-1 
                                                    ${isSelected ? 'bg-white' : 'bg-blue-500'}`}
                                                        animate={{
                                                            scale: [1, 1.2, 1]
                                                        }}
                                                        transition={{
                                                            duration: 0.5,
                                                            repeat: Infinity
                                                        }}
                                                    />
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>

                            <AnimatePresence>
                                {selectedDate && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex justify-between items-center rounded-lg px-4 py-3 mb-2"
                                        style={{ backgroundColor: `${colors.primary}10` }}
                                    >
                                        <span className="text-sm font-medium" style={{ color: colors.primary }}>
                                            Showing appointments for {format(new Date(selectedDate), 'MMMM d, yyyy')}
                                        </span>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedDate(null)}
                                            className="text-sm font-medium px-3 py-1 rounded-md"
                                            style={{
                                                backgroundColor: `${colors.primary}20`,
                                                color: colors.primary
                                            }}
                                        >
                                            Clear filter
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="mt-4 px-3 py-1 rounded-md"
                            style={{
                                backgroundColor: `${colors.danger}10`,
                                color: colors.danger
                            }}
                            onClick={() => setIsDateFilterOpen(false)}
                        >
                            Close
                        </motion.button>
                    </motion.div>
                )}



                {/* Appointments Table */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                    <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 rounded-lg font-medium"
                            style={{
                                backgroundColor: `${colors.primary}20`,
                                color: colors.primary
                            }}
                            onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                        >
                            Filter by Date
                        </motion.button>
                        <h2 className="text-xl font-semibold" style={{ color: colors.text }}>
                            {selectedDate
                                ? `Appointments on ${format(new Date(selectedDate), 'MMMM d, yyyy')}`
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
                                    borderColor: colors.muted,
                                    focusRingColor: colors.primary
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
                        <div className="p-8 flex justify-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="rounded-full h-12 w-12 border-t-2 border-b-2"
                                style={{ borderColor: colors.primary }}
                            />
                        </div>
                    ) : (

                        <div className="overflow-auto rounded-xl" style={{ maxHeight: '630px' }}>
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
                                        {filteredAppointments?.length > 0 ? (
                                            filteredAppointments.map((appointment) => {
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
                                                        className="hover:bg-gray-50"
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
                                                            <motion.span
                                                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${finalStatus === 'Active'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : finalStatus === 'completed'
                                                                        ? 'bg-yellow-100 text-yellow-800'
                                                                        : finalStatus === 'Inactive'
                                                                            ? 'bg-red-100 text-red-800'
                                                                            : 'bg-blue-100 text-blue-800'
                                                                    }`}
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    scale: 1,
                                                                    transition: { type: 'spring', stiffness: 300 }
                                                                }}
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                {finalStatus.charAt(0).toUpperCase() + finalStatus.slice(1)}
                                                            </motion.span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                            ${appointment.paymentStatus === 'completed'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                {appointment.paymentStatus.charAt(0).toUpperCase() + appointment.paymentStatus.slice(1)}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <Link to={`/appointment/${appointment?._id}`}>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    className="px-3 py-1 rounded-lg"
                                                                    style={{
                                                                        backgroundColor: `${colors.primary}20`,
                                                                        color: colors.primary
                                                                    }}
                                                                >
                                                                    View Details
                                                                </motion.button>
                                                            </Link>

                                                            {
                                                                appointment.status !== 'completed' && (
                                                                    <motion.button
                                                                        onClick={() => {
                                                                            if (window.confirm("Are you sure you want to mark this appointment as completed?")) {
                                                                                ConfirmAppointment(appointment?._id);
                                                                            }
                                                                        }}
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        className="px-3 py-1 rounded-lg mr-2"
                                                                        style={{
                                                                            backgroundColor: `${colors.primary}20`,
                                                                            color: colors.primary
                                                                        }}
                                                                    >
                                                                        Complete
                                                                    </motion.button>
                                                                )
                                                            }
                                                        </td>
                                                    </motion.tr>
                                                )
                                            }
                                            )
                                        ) : (
                                            <motion.tr
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <td colSpan="5" className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <Calendar className="h-12 w-12 mb-4" style={{ color: colors.muted }} />
                                                        <h3 className="text-lg font-medium mb-1" style={{ color: colors.text }}>
                                                            No appointments found
                                                        </h3>
                                                        <p className="text-sm" style={{ color: colors.muted }}>
                                                            {searchTerm ? 'Try a different search term' : 'No appointments scheduled'}
                                                        </p>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        )}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>

                    )}
                </motion.div>
            </motion.div>
        </Dashboard>
    );
};

export default Patients;