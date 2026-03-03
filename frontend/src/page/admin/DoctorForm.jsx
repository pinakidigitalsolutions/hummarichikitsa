import React, { useState } from 'react';
import Dashboard from '../../components/Layout/Dashboard';
import { useDispatch } from 'react-redux';
import { RegisterDoctor } from '../../Redux/doctorSlice';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaStar, FaUserMd, FaGraduationCap, FaMoneyBillWave, FaCheckCircle, FaPlus, FaUser, FaEnvelope, FaLock, FaStethoscope, FaBriefcaseMedical } from 'react-icons/fa';
import avatar from '../../../src/assets/logo-def.png';

const DoctorForm = ({ doctorData }) => {
  // Professional healthcare color palette
  const colors = {
    primary: '#2563eb',       // Blue (trust, professionalism)
    secondary: '#3b82f6',     // Lighter blue
    accent: '#10b981',        // Green (health, success)
    background: '#f8fafc',    // Very light gray
    text: '#1e293b',          // Dark gray
    lightText: '#64748b',     // Gray
    border: '#e2e8f0',        // Light border
    success: '#10b981',       // Green for success states
    warning: '#f59e0b',       // Orange for warnings
    error: '#ef4444',         // Red for errors
    cardBg: '#ffffff',        // White for cards
    inputBg: '#f1f5f9'        // Light gray for inputs
  };

  const [previewImage, setImagePreview] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hospitalId } = useParams();
  const [doctor, setDoctor] = useState(doctorData || {
    id: '',
    hospitalId: hospitalId,
    name: '',
    password: '',
    email: '',
    specialty: 'Cardiology',
    qualification: '',
    experience: '',
    photo: '',
    bio: '',
    gender: '',
    rating: 0,
    consultationFee: '',
    availableSlots: [],
    status: true
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [specialties, setSpecialties] = useState([
    "Cardiology", "Neurology", "Orthopedics", "Pediatrics",
    "Dermatology", "Oncology", "Psychiatry", "General Medicine"
  ]);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty)) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty('');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDoctor(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('id', doctor.id);
    formData.append('hospitalId', doctor.hospitalId);
    formData.append('name', doctor.name);
    formData.append('password', doctor.password);
    formData.append('email', doctor.email);
    formData.append('specialty', doctor.specialty);
    formData.append('qualification', doctor.qualification);
    formData.append('experience', doctor.experience.toString());
    formData.append('bio', doctor.bio);
    formData.append('rating', doctor.rating.toString());
    formData.append('consultationFee', doctor.consultationFee.toString());
    formData.append('status', doctor.status);
    formData.append('photo', doctor.photo);
    formData.append('gender', doctor.gender);

    try {
      await dispatch(RegisterDoctor(formData));
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        navigate(-1);
      }, 2000);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImage = (event) => {
    event.preventDefault();
    const uploadedImage = event.target.files[0];
    if (uploadedImage) {
      setDoctor({
        ...doctor,
        photo: uploadedImage,
      });
      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadedImage);
      fileReader.addEventListener("load", function () {
        setImagePreview(this.result);
      });
    }
  };

  return (
    <Dashboard>
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
        {/* Success Notification */}
        <AnimatePresence>
          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-green-50 border-l-4 border-green-500 text-green-700 p-3 flex items-center text-sm"
            >
              <FaCheckCircle className="mr-2 text-green-500" />
              <span>Doctor profile saved successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 flex flex-col bg-white rounded-t-xl shadow-lg overflow-hidden"
        >
          {/* Form Header */}
          <div className=" px-4 py-3 ">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold">
                  {doctor.id ? 'Edit Doctor Profile' : 'Add New Doctor'}
                </h1>
                <p className=" opacity-90 text-sm">
                  {doctor.id ? `Managing ${doctor.name}` : 'Create a new doctor profile'}
                </p>
              </div>
              <motion.button
                onClick={() => navigate(-1)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-opacity-20 hover:bg-opacity-30 text-white px-3 py-1.5 rounded text-xs font-medium transition duration-200 flex items-center"
              >
                <FaArrowLeft className="mr-1" />
                Back
              </motion.button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b flex" style={{ borderColor: colors.border }}>
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('basic')}
              className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-xs flex items-center ${activeTab === 'basic'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <FaUser className="mr-1" />
              Basic Info
            </motion.button>
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab('professional')}
              className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-xs flex items-center ${activeTab === 'professional'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              <FaBriefcaseMedical className="mr-1" />
              Professional
            </motion.button>
          </div>

          {/* Form Content - Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {activeTab === 'basic' && (
                  <motion.div
                    key="basic"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Photo Upload */}
                      <div className="md:col-span-1">
                        <label className="block text-xs font-medium mb-2 text-gray-700">
                          Profile Photo
                        </label>
                        <div className="flex items-center">
                          <motion.div
                            whileHover={{ scale: 1.03 }}
                            className="relative"
                          >
                            <img
                              className="h-32 w-32 rounded-full object-cover border-4 shadow-md border-blue-400"
                              src={previewImage || avatar}
                              alt="profile"
                            />
                            <input
                              hidden
                              onChange={getImage}
                              id="file"
                              type="file"
                              className="absolute bottom-0 right-0 opacity-0 w-8 h-8 cursor-pointer"
                            />
                            <motion.label
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              htmlFor="file"
                              className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-sm cursor-pointer text-blue-500"
                            >
                              <FaPlus className="text-xs" />
                            </motion.label>
                          </motion.div>
                        </div>
                      </div>

                      {/* Basic Info */}
                      <div className="md:col-span-2 space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-xs font-medium mb-1 text-gray-700">
                            Full Name
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaUserMd className="text-gray-400 text-sm" />
                            </div>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              value={doctor.name}
                              onChange={handleChange}
                              className="pl-10 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300 bg-gray-50"
                              placeholder="Dr. Full Name"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="email" className="block text-xs font-medium mb-1 text-gray-700">
                              Email ID
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaEnvelope className="text-gray-400 text-sm" />
                              </div>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                value={doctor.email}
                                onChange={handleChange}
                                className="pl-10 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300 bg-gray-50"
                                placeholder="doctor@example.com"
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="password" className="block text-xs font-medium mb-1 text-gray-700">
                              Password
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaLock className="text-gray-400 text-sm" />
                              </div>
                              <input
                                type="password"
                                id="password"
                                name="password"
                                value={doctor.password}
                                onChange={handleChange}
                                className="pl-10 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300 bg-gray-50"
                                placeholder="••••••••"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="status" className="block text-xs font-medium mb-1 text-gray-700">
                              Status
                            </label>
                            <select
                              id="status"
                              name="status"
                              value={doctor.status}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300 bg-gray-50"
                            >
                              <option>Select Status</option>
                              <option value="true">Active</option>
                              <option value="false">Inactive</option>
                              {/* <option value="onleave">On Leave</option> */}
                            </select>
                          </div>
                          <div>
                            <label htmlFor="gender" className="block text-xs font-medium mb-1 text-gray-700">
                              Gender
                            </label>
                            <select
                              id="gender"
                              name="gender"
                              value={doctor.gender}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300 bg-gray-50"
                            > 
                              <option >Select Gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="bio" className="block text-xs font-medium mb-1 text-gray-700">
                            Professional Bio
                          </label>
                          <textarea
                            id="bio"
                            name="bio"
                            rows={3}
                            value={doctor.bio}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300 bg-gray-50"
                            placeholder="Brief professional bio..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setActiveTab('professional')}
                        className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium flex items-center"
                      >
                        Continue to Professional Details
                        <FaArrowLeft className="ml-2 transform rotate-180" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'professional' && (
                  <motion.div
                    key="professional"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="specialty" className="block text-xs font-medium mb-1 text-gray-700">
                          Specialty
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaStethoscope className="text-gray-400 text-sm" />
                          </div>
                          <select
                            id="specialty"
                            name="specialty"
                            value={doctor.specialty}
                            onChange={handleChange}
                            className="pl-10 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300 bg-gray-50"
                            required
                          >
                            {specialties.map(spec => (
                              <option key={spec} value={spec}>{spec}</option>
                            ))}
                          </select>
                        </div>

                        {/* Add new specialty input */}
                        <div className="mt-2 flex">
                          <input
                            type="text"
                            value={newSpecialty}
                            onChange={(e) => setNewSpecialty(e.target.value)}
                            placeholder="Add new specialty"
                            className="flex-1 px-3 py-2 border rounded-l-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300 bg-gray-50"
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={handleAddSpecialty}
                            disabled={!newSpecialty.trim()}
                            className="px-3 py-2 bg-blue-600 text-white rounded-r-md text-sm disabled:opacity-50"
                          >
                            <FaPlus />
                          </motion.button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="qualification" className="block text-xs font-medium mb-1 text-gray-700">
                          Qualification
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaGraduationCap className="text-gray-400 text-sm" />
                          </div>
                          <input
                            type="text"
                            id="qualification"
                            name="qualification"
                            value={doctor.qualification}
                            onChange={handleChange}
                            className="pl-10 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300 bg-gray-50"
                            placeholder="MD, PhD, etc."
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="experience" className="block text-xs font-medium mb-1 text-gray-700">
                          Experience (years)
                        </label>
                        <input
                          type="number"
                          id="experience"
                          name="experience"
                          min="0"
                          max="50"
                          value={doctor.experience}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300 bg-gray-50"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="consultationFee" className="block text-xs font-medium mb-1 text-gray-700">
                          Consultation Fee (₹)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaMoneyBillWave className="text-gray-400 text-sm" />
                          </div>
                          <input
                            type="number"
                            id="consultationFee"
                            name="consultationFee"
                            min="0"
                            value={doctor.consultationFee}
                            onChange={handleChange}
                            className="pl-10 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300 bg-gray-50"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="rating" className="block text-xs font-medium mb-1 text-gray-700">
                          Rating
                        </label>
                        <div className="flex items-center">
                          <input
                            type="number"
                            id="rating"
                            name="rating"
                            min="0"
                            max="5"
                            step="0.1"
                            value={doctor.rating}
                            onChange={handleChange}
                            className="w-20 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300 bg-gray-50"
                          />
                          <div className="ml-3 flex">
                            {[...Array(5)].map((_, i) => (
                              <FaStar
                                key={i}
                                className={`text-sm ${i < Math.floor(doctor.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setActiveTab('basic')}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium"
                      >
                        Back to Basic Info
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium flex items-center disabled:opacity-70"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <FaCheckCircle className="mr-2" />
                            Save Doctor Profile
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </motion.div>
      </div>
    </Dashboard>
  );
};

export default DoctorForm;