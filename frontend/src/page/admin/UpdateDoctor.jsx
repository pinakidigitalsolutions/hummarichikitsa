


import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Dashboard from '../../components/Layout/Dashboard';
import { useDispatch } from 'react-redux';
import { GetDoctor, RegisterDoctor, RegisterDoctorUpdate } from '../../Redux/doctorSlice';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaStar, FaUserMd, FaGraduationCap, FaMoneyBillWave, FaCheckCircle, FaPlus, FaUser, FaEnvelope, FaLock, FaStethoscope, FaBriefcaseMedical } from 'react-icons/fa';

const UpdateDoctor = () => {

    const colors = {
        primary: '#3b82f6',
        secondary: '#60a5fa',
        accent: '#10b981',
        background: '#f9fafb',
        text: '#1f2937',
        lightText: '#6b7280',
        border: '#e5e7eb',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        cardBg: '#ffffff',
        inputBg: '#f3f4f6'
    };

    const [previewImage, setImagePreview] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { doctorid } = useParams();

    // Initialize with empty doctor structure
    const [doctor, setDoctor] = useState({
        id: doctorid,
        name: '',
        password: '',
        email: '',
        specialty: 'Cardiology',
        qualification: '',
        experience: 0,
        photo: '',
        bio: '',
        rating: 0,
        consultationFee: 0,
        status: 'active',
        gender: ""
    });

    const [activeTab, setActiveTab] = useState('basic');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const specialties = [
        "Cardiology", "Neurology", "Orthopedics", "Pediatrics",
        "Dermatology", "Oncology", "Psychiatry", "General Medicine"
    ];

    const getDoctorById = async () => {
        try {
            const res = await dispatch(GetDoctor(doctorid));
            const data = res?.payload;
            if (data) {
                setDoctor(data);
                if (data.photo) {
                    setImagePreview(data.photo); // Assuming photo is a URL string
                }
            }
        } catch (error) {
            console.error("Error fetching doctor:", error);
        }
    };

    useEffect(() => {
        if (doctorid) {
            getDoctorById();
        }
    }, [doctorid]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDoctor(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('name', doctor.name);
        if (doctor.password) {
            formData.append('password', doctor.password);
        }
        formData.append('email', doctor.email);
        formData.append('specialty', doctor.specialty);
        formData.append('qualification', doctor.qualification);
        formData.append('experience', doctor.experience.toString());
        formData.append('bio', doctor.bio);
        formData.append('rating', doctor.rating.toString());
        formData.append('consultationFee', doctor.consultationFee.toString());
        if(doctor.status=='active'){

            formData.append('status', true);
        }else{
            formData.append('status', false);
        }
        formData.append('gender', doctor.gender);

        // Only append photo if it's a new file
        if (doctor.photo instanceof File) {
            formData.append('photo', doctor.photo);
        }

        try {

            if (doctorid) {
                await dispatch(RegisterDoctorUpdate({
                    id: doctorid,
                    formData: formData
                }));
                getDoctorById()
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getImage = (event) => {
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
            <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
                <div className="">
                    {/* Success Notification */}
                    <AnimatePresence>
                        {submitSuccess && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-sm flex items-center"
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
                        className="bg-white rounded-xl shadow-lg overflow-hidden border"
                        style={{
                            borderColor: colors.border,
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}
                    >
                        {/* Form Header */}
                        <div
                            className="px-6 py-4 flex justify-between items-center"
                            style={{
                                backgroundColor: '#2B6CB0',
                                backgroundImage: ''
                            }}
                        >
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    {doctor.id ? 'Edit Doctor Profile' : 'Add New Doctor'}
                                </h1>
                                <p className="text-blue-100 opacity-90">
                                    {doctor.id ? `Managing ${doctor.name}` : 'Create a new doctor profile'}
                                </p>
                            </div>
                            <motion.button
                                onClick={() => navigate(-1)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className=" bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200 flex items-center"
                            >
                                <FaArrowLeft className="mr-2" />
                                View All Doctors
                            </motion.button>
                        </div>

                        {/* Tab Navigation */}
                        <div className="border-b" style={{ borderColor: colors.border }}>
                            <nav className="flex -mb-px">
                                <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveTab('basic')}
                                    className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center ${activeTab === 'basic'
                                        ? `border-${colors.primary} text-${colors.primary}`
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <FaUser className="mr-2" />
                                    Basic Information
                                </motion.button>
                                <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveTab('professional')}
                                    className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center ${activeTab === 'professional'
                                        ? `border-${colors.primary} text-${colors.primary}`
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <FaBriefcaseMedical className="mr-2" />
                                    Professional Details
                                </motion.button>
                            </nav>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleSubmit} className="p-6">
                            <AnimatePresence mode="wait">
                                {activeTab === 'basic' && (
                                    <motion.div
                                        key="basic"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {/* Photo Upload */}
                                            <div className="md:col-span-1">
                                                <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                                                    Profile Photo
                                                </label>
                                                <div className="flex items-center">
                                                    <motion.div
                                                        whileHover={{ scale: 1.03 }}
                                                        className="relative"
                                                    >
                                                        <img
                                                            className="h-40 w-40 rounded-full object-cover border-4 shadow-md"
                                                            style={{
                                                                borderColor: colors.primary,
                                                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                                                            }}
                                                            src={previewImage || 'https://via.placeholder.com/150'}
                                                            alt="profile"
                                                        />
                                                        <input
                                                            hidden
                                                            onChange={getImage}
                                                            id="file"
                                                            type="file"
                                                            className="absolute bottom-0 right-0 opacity-0 w-10 h-10 cursor-pointer"
                                                        />
                                                        <motion.label
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.9 }}
                                                            htmlFor="file"
                                                            className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-sm cursor-pointer"
                                                            style={{
                                                                color: colors.primary,
                                                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                                                            }}
                                                        >
                                                            <FaPlus />
                                                        </motion.label>
                                                    </motion.div>
                                                </div>
                                            </div>

                                            {/* Basic Info */}
                                            <div className="md:col-span-2 space-y-6">
                                                <div>
                                                    <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                                                        Full Name
                                                    </label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <FaUserMd style={{ color: colors.lightText }} />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            id="name"
                                                            name="name"
                                                            value={doctor.name}
                                                            onChange={handleChange}
                                                            className="pl-10 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
                                                            style={{
                                                                borderColor: colors.border,
                                                                backgroundColor: colors.inputBg,
                                                                focusRing: colors.primary
                                                            }}
                                                            placeholder="Dr. Full Name"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                                                            Email ID
                                                        </label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <FaEnvelope style={{ color: colors.lightText }} />
                                                            </div>
                                                            <input
                                                                type="email"
                                                                id="email"
                                                                name="email"
                                                                value={doctor.email}
                                                                onChange={handleChange}
                                                                className="pl-10 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
                                                                style={{
                                                                    borderColor: colors.border,
                                                                    backgroundColor: colors.inputBg,
                                                                    focusRing: colors.primary
                                                                }}
                                                                placeholder="doctor@example.com"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                                                            Password
                                                        </label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <FaLock style={{ color: colors.lightText }} />
                                                            </div>
                                                            <input
                                                                type="password"
                                                                id="password"
                                                                name="password"
                                                                value={doctor.password}
                                                                onChange={handleChange}
                                                                className="pl-10 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
                                                                style={{
                                                                    borderColor: colors.border,
                                                                    backgroundColor: colors.inputBg,
                                                                    focusRing: colors.primary
                                                                }}
                                                                placeholder="••••••••"
                                                                required={!doctor.id}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label htmlFor="status" className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                                                        Status
                                                    </label>
                                                    <select
                                                        id="status"
                                                        name="status"
                                                        value={doctor.status}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
                                                        style={{
                                                            borderColor: colors.border,
                                                            backgroundColor: colors.inputBg,
                                                            focusRing: colors.primary
                                                        }}
                                                    >
                                                        <option value="active">Active</option>
                                                        <option value="inactive">Inactive</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label htmlFor="gender" className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                                                        Gender
                                                    </label>
                                                    <select
                                                        id="gender"
                                                        name="gender"
                                                        value={doctor.gender}
                                                        onChange={handleChange}
                                                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent 
    ${doctor.gender === 'male' ? 'select' : ''}`}
                                                        style={{
                                                            borderColor: colors.border,
                                                            backgroundColor: colors.inputBg,
                                                            focusRing: colors.primary,
                                                        }}
                                                    >
                                                        <option value="male">Male</option>
                                                        <option value="female">Female</option>
                                                    </select>

                                                </div>

                                                <div>
                                                    <label htmlFor="bio" className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                                                        Professional Bio
                                                    </label>
                                                    <textarea
                                                        id="bio"
                                                        name="bio"
                                                        rows={4}
                                                        value={doctor.bio}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
                                                        style={{
                                                            borderColor: colors.border,
                                                            backgroundColor: colors.inputBg,
                                                            focusRing: colors.primary
                                                        }}
                                                        placeholder="Brief professional bio..."
                                                    />
                                                </div>
                                            </div>
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
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="specialty" className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                                                    Specialty
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <FaStethoscope style={{ color: colors.lightText }} />
                                                    </div>
                                                    <select
                                                        id="specialty"
                                                        name="specialty"
                                                        value={doctor.specialty}
                                                        onChange={handleChange}
                                                        className="pl-10 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
                                                        style={{
                                                            borderColor: colors.border,
                                                            backgroundColor: colors.inputBg,
                                                            focusRing: colors.primary
                                                        }}
                                                        required
                                                    >
                                                        {specialties.map(spec => (
                                                            <option key={spec} value={spec}>{spec}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="qualification" className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                                                    Qualification
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <FaGraduationCap style={{ color: colors.lightText }} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        id="qualification"
                                                        name="qualification"
                                                        value={doctor.qualification}
                                                        onChange={handleChange}
                                                        className="pl-10 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
                                                        style={{
                                                            borderColor: colors.border,
                                                            backgroundColor: colors.inputBg,
                                                            focusRing: colors.primary
                                                        }}
                                                        placeholder="MD, PhD, etc."
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="experience" className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
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
                                                    className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
                                                    style={{
                                                        borderColor: colors.border,
                                                        backgroundColor: colors.inputBg,
                                                        focusRing: colors.primary
                                                    }}
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="consultationFee" className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
                                                    Consultation Fee (₹)
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <FaMoneyBillWave style={{ color: colors.lightText }} />
                                                    </div>
                                                    <input
                                                        type="number"
                                                        id="consultationFee"
                                                        name="consultationFee"
                                                        min="0"
                                                        value={doctor.consultationFee}
                                                        onChange={handleChange}
                                                        className="pl-10 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
                                                        style={{
                                                            borderColor: colors.border,
                                                            backgroundColor: colors.inputBg,
                                                            focusRing: colors.primary
                                                        }}
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="rating" className="block text-sm font-medium mb-1" style={{ color: colors.text }}>
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
                                                        className="w-20 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:border-transparent"
                                                        style={{
                                                            borderColor: colors.border,
                                                            backgroundColor: colors.inputBg,
                                                            focusRing: colors.primary
                                                        }}
                                                    />
                                                    <div className="ml-3 flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <FaStar
                                                                key={i}
                                                                className={`text-lg ${i < Math.floor(doctor.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Form Actions */}
                            <div className="mt-8 pt-6 border-t flex justify-between" style={{ borderColor: colors.border }}>
                                <motion.button
                                    whileHover={{ x: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="button"
                                    onClick={() => setActiveTab(activeTab === 'basic' ? 'basic' : 'basic')}
                                    className="px-4 py-2 border rounded-md shadow-sm text-sm font-medium flex items-center"
                                    style={{
                                        borderColor: colors.border,
                                        color: colors.text,
                                        backgroundColor: colors.inputBg
                                    }}
                                >
                                    <FaArrowLeft className="mr-2" />
                                    {activeTab === 'basic' ? 'Cancel' : 'Back'}
                                </motion.button>

                                {activeTab !== 'professional' ? (
                                    <motion.button
                                        whileHover={{ x: 2 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="button"
                                        onClick={() => setActiveTab('professional')}
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white flex items-center"
                                        style={{
                                            backgroundColor: colors.primary,
                                            hoverBackgroundColor: colors.secondary
                                        }}
                                    >
                                        Continue
                                        <FaArrowLeft className="ml-2 transform rotate-180" />
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white flex items-center"
                                        style={{
                                            backgroundColor: isSubmitting ? colors.lightText : colors.accent,
                                            hoverBackgroundColor: colors.success
                                        }}
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
                                )}
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </Dashboard>
    );
};

export default UpdateDoctor;