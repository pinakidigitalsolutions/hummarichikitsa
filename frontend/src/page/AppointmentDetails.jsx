import { useState, useEffect } from 'react';
import { AppointmentCancelled, AppointmentConferm, getAppointmentById } from '../Redux/appointment';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Calendar, Clock, User, Phone, MapPin, Hospital, BriefcaseMedical, ArrowLeft, AlertCircle } from 'lucide-react';
import Header from '../components/Header';

const AppointmentDetailsPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [appointment, setAppointments] = useState(null);
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const getAppointment = async () => {
        const res = await dispatch(getAppointmentById(id));
        setAppointments(res.payload);
        setIsLoading(false);
    };

    const ConfirmAppointment = async (appointment_id) => {
        await dispatch(AppointmentConferm(appointment_id));
        getAppointment();
    };

    const CancelledAppointment = async (appointment_id) => {
        await dispatch(AppointmentCancelled(appointment_id));
        getAppointment();
    };

    useEffect(() => {
        getAppointment();
    }, []);

    const statusColors = {
        confirmed: 'bg-emerald-100 text-emerald-800',
        pending: 'bg-amber-100 text-amber-800',
        cancelled: 'bg-red-100 text-red-800'
    };

    const statusIcons = {
        confirmed: <CheckCircle className="h-4 w-4 mr-1" />,
        pending: <AlertCircle className="h-4 w-4 mr-1" />,
        cancelled: <XCircle className="h-4 w-4 mr-1" />
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    console.log(appointment)

    return (
       <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors group"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2 transition-transform group-hover:-translate-x-1" />
                        <span className="font-medium">Back to Appointments</span>
                    </button>

                    {/* Main Card */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 border border-gray-100">
                        {/* Header Section */}
                        <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-6 text-white">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold">Appointment Details</h1>
                                    <div className="flex items-center mt-3">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[appointment?.status]}`}>
                                            {statusIcons[appointment?.status]}
                                            {appointment?.status.charAt(0).toUpperCase() + appointment?.status.slice(1)}
                                        </span>
                                        <span className="ml-3 text-blue-100 text-sm bg-white/10 px-2 py-1 rounded">
                                            Token No: {appointment?.token}
                                        </span>
                                    </div>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg shadow-inner">
                                    <Calendar className="h-7 w-7 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Appointment Overview */}
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                                Appointment Summary
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Date Card */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-100">
                                    <div className="flex items-center mb-2">
                                        <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                                        <span className="text-sm font-medium text-gray-600">Date</span>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-800">
                                        {formatDate(appointment?.date)}
                                    </p>
                                </div>

                                {/* Time Slot Card */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-100">
                                    <div className="flex items-center mb-2">
                                        <Clock className="h-5 w-5 text-blue-600 mr-2" />
                                        <span className="text-sm font-medium text-gray-600">Time Slot</span>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-800">{appointment?.slot}</p>
                                </div>

                                {/* Fees Paid Card */}
                                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border border-emerald-100">
                                    <div className="flex items-center mb-2">
                                        <svg className="h-5 w-5 text-emerald-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-600">Fees Paid</span>
                                    </div>
                                    <p className="text-lg font-semibold text-emerald-700">₹{appointment?.booking_amount}</p>
                                </div>

                                {/* Payment Status Card */}
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-100">
                                    <div className="flex items-center mb-2">
                                        <svg className="h-5 w-5 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-600">Payment Status</span>
                                    </div>
                                    <p className="text-lg font-semibold text-purple-700 capitalize">{appointment?.paymentStatus}</p>
                                </div>

                                {/* Payment Method Card */}
                                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-100">
                                    <div className="flex items-center mb-2">
                                        <svg className="h-5 w-5 text-amber-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-600">Payment Method</span>
                                    </div>
                                    <p className="text-lg font-semibold text-amber-700 capitalize">{appointment?.paymentMethod}</p>
                                </div>
                            </div>
                        </div>

                        {/* Details Sections */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                            {/* Patient Card */}
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="bg-blue-100 p-2.5 rounded-lg">
                                        <User className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-800">Patient Information</h2>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1.5">
                                            <div className="h-2.5 w-2.5 rounded-full bg-blue-600"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Full Name</p>
                                            <p className="font-medium text-gray-800">{appointment?.patient}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1.5">
                                            <div className="h-2.5 w-2.5 rounded-full bg-blue-600"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Mobile</p>
                                            <p className="font-medium text-gray-800">{appointment?.mobile}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1.5">
                                            <div className="h-2.5 w-2.5 rounded-full bg-blue-600"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Date of Birth</p>
                                            <p className="font-medium text-gray-800">{appointment?.dob || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Doctor Card */}
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="bg-emerald-100 p-2.5 rounded-lg">
                                        <BriefcaseMedical className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-800">Doctor Information</h2>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1.5">
                                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-600"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Name</p>
                                            <p className="font-medium text-gray-800">Dr. {appointment?.doctorId?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1.5">
                                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-600"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Specialization</p>
                                            <p className="font-medium text-gray-800">{appointment?.doctorId?.specialty}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1.5">
                                            <div className="h-2.5 w-2.5 rounded-full bg-emerald-600"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Experience</p>
                                            <p className="font-medium text-gray-800">{appointment?.doctorId?.experience || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hospital Card */}
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="bg-purple-100 p-2.5 rounded-lg">
                                        <Hospital className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-800">Hospital Information</h2>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1.5">
                                            <div className="h-2.5 w-2.5 rounded-full bg-purple-600"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Name</p>
                                            <p className="font-medium text-gray-800">{appointment?.hospitalId?.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1.5">
                                            <div className="h-2.5 w-2.5 rounded-full bg-purple-600"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Address</p>
                                            <p className="font-medium text-gray-800">{appointment?.hospitalId?.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1.5">
                                            <div className="h-2.5 w-2.5 rounded-full bg-purple-600"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Contact</p>
                                            <p className="font-medium text-gray-800">{appointment?.hospitalId?.phone || 'Not specified'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50">
                            <div className="flex flex-wrap justify-center gap-4">
                                {appointment?.status === 'pending' && (
                                    <button
                                        onClick={() => ConfirmAppointment(appointment?._id)}
                                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                                    >
                                        <CheckCircle className="h-5 w-5" />
                                        Confirm Appointment
                                    </button>
                                )}

                                <button
                                    onClick={() => navigate(`/doctors/${appointment?.doctorId?._id}`)}
                                    className="px-6 py-3 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Book Follow-up
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Important Notes Section */}
                    <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-orange-100">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <AlertCircle className="h-6 w-6 text-orange-500" />
                            Important Notes
                        </h2>
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-start gap-3">
                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-orange-100 text-orange-600 text-sm mt-0.5 flex-shrink-0">1</span>
                                <span>Please arrive 15 minutes before your scheduled appointment time</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-orange-100 text-orange-600 text-sm mt-0.5 flex-shrink-0">2</span>
                                <span>Bring your ID and any relevant medical records</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-orange-100 text-orange-600 text-sm mt-0.5 flex-shrink-0">3</span>
                                <span>Face masks are required in all clinical areas</span>
                            </li>
                            {/* <li className="flex items-start gap-3">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-orange-100 text-orange-600 text-sm mt-0.5 flex-shrink-0">4</span>
                            <span>Cancellations require 24 hours notice to avoid fees</span>
                        </li> */}
                        </ul>
                    </div>
                </div>
            </div> 
    );
};

export default AppointmentDetailsPage;