import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { GetDoctor } from '../../Redux/doctorSlice';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaCalendarAlt, FaClock, FaStar, FaUserMd, FaGraduationCap, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';
import Dashboard from '../../components/Layout/Dashboard';

const DoctorDetailsPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Professional healthcare color palette
  const colors = {
    primary: '#2b6cb0',  // Deep blue
    secondary: '#4299e1', // Lighter blue
    accent: '#48bb78',   // Green
    background: '#f7fafc', // Light gray
    text: '#2d3748',     // Dark gray
    lightText: '#718096' // Gray
  };

  const getDoctorById = async () => {
    const res = await dispatch(GetDoctor(doctorId));
    console.log(res.payload.doctor)
    setDoctor(res.payload.doctor);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleBookAppointment = () => {
    if (selectedDate && selectedSlot) {
      setIsBooking(true);
      // Simulate API call
      setTimeout(() => {
        setIsBooking(false);
        setBookingSuccess(true);
        setTimeout(() => setBookingSuccess(false), 3000);
      }, 1500);
    }
  };

  useEffect(() => {
    getDoctorById();
  }, []);

  return (
    <Dashboard>
      <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="flex items-center text-sm font-medium mb-6"
          style={{ color: colors.primary }}
        >
          <FaArrowLeft className="mr-2" />
          Back to Hospital
        </motion.button>

        {/* Main card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          {/* Doctor Header */}
          <div className="md:flex">
            <div className="md:w-1/3 p-6 flex justify-center items-start bg-gradient-to-b from-blue-50 to-white">
              <motion.div 
                whileHover={{ scale: 1.03 }}
                className="relative"
              >
                <img 
                  className="h-64 w-64 rounded-xl object-cover border-4 border-white shadow-md" 
                  src={doctor?.photo} 
                  alt={doctor?.name} 
                />
                {doctor?.status === 'active' && (
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
                    className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center"
                  >
                    <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                    Available
                  </motion.div>
                )}
              </motion.div>
            </div>
            
            <div className="md:w-2/3 p-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold" style={{ color: colors.text }}>
                    Dr. {doctor?.name}
                  </h1>
                  <div className="flex items-center mt-1">
                    <FaUserMd className="mr-2" style={{ color: colors.secondary }} />
                    <span style={{ color: colors.primary }} className="font-medium">
                      {doctor?.specialty}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                  <div className="flex items-center mr-2">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`text-lg ${i < doctor?.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium" style={{ color: colors.text }}>
                    {doctor?.rating}/5
                  </span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FaGraduationCap className="mr-2" style={{ color: colors.primary }} />
                    <h3 className="font-medium" style={{ color: colors.text }}>Qualification</h3>
                  </div>
                  <p style={{ color: colors.lightText }}>{doctor?.qualification}</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FaMoneyBillWave className="mr-2" style={{ color: colors.primary }} />
                    <h3 className="font-medium" style={{ color: colors.text }}>Consultation Fee</h3>
                  </div>
                  <p style={{ color: colors.lightText }}>${doctor?.consultationFee}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2" style={{ color: colors.text }}>About</h3>
                <p className="text-gray-600" style={{ color: colors.lightText }}>{doctor?.bio}</p>
                <h3 className="text-lg font-medium mb-2" style={{ color: colors.text }}>Email</h3>
                <p className="text-green-600" >{doctor?.email}</p>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold">{doctor?.experience}+</span>
                  </div>
                  <span style={{ color: colors.lightText }}>Years of experience</span>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Booking Section */}
          
        </motion.div>

        
      </div>
    </div>
    </Dashboard>
  );
};

export default DoctorDetailsPage;