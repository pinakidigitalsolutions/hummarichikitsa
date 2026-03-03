import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Dashboard from '../../components/Layout/Dashboard';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { GetHospitalById } from '../../Redux/hospitalSlice';
import axiosInstance from '../../Helper/axiosInstance';

const HospitalUpdateForm = () => {
    const { hospitalid } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [hospital, setHospital] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        email: '',
        website: '',
        rating: 2.5,
        specialties: [],
        facilities: [],
        currentSpecialty: '',
        currentFacility: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sample suggestions
    const specialtySuggestions = [
        'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics',
        'Oncology', 'Dermatology', 'Gastroenterology', 'Urology'
    ];

    const facilitySuggestions = [
        'Emergency Room', 'ICU', 'Pharmacy', 'Ambulance Service',
        'Laboratory', 'Radiology', 'Cafeteria', 'Patient Parking'
    ];

    // Fetch hospital data on component mount
    useEffect(() => {
        const fetchHospital = async () => {
            try {
                const res = await dispatch(GetHospitalById(hospitalid));
                const response = res.payload;
                setHospital(response);
                if (response?.image) {
                    setImagePreview(response.image);
                }
            } catch (error) {
                toast.error('Failed to fetch hospital data');
            }
        };
        fetchHospital();
    }, [hospitalid, dispatch]);

    // Populate form when hospital data is loaded
    useEffect(() => {
        if (hospital) {
            setFormData({
                name: hospital.name || '',
                address: hospital.address || '',
                city: hospital.city || '',
                state: hospital.state || '',
                pincode: hospital.pincode || '',
                phone: hospital.phone || '',
                email: hospital.email || '',
                website: hospital.website || '',
                rating: hospital.rating || 2.5,
                specialties: hospital.specialties || [],
                facilities: hospital.facilities || [],
                currentSpecialty: '',
                currentFacility: ''
            });
        }
    }, [hospital]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Specialties handlers
    const handleAddSpecialty = () => {
        if (formData.currentSpecialty.trim() && !formData.specialties.includes(formData.currentSpecialty.trim())) {
            setFormData(prev => ({
                ...prev,
                specialties: [...prev.specialties, prev.currentSpecialty.trim()],
                currentSpecialty: ''
            }));
        }
    };

    const handleRemoveSpecialty = (index) => {
        setFormData(prev => ({
            ...prev,
            specialties: prev.specialties.filter((_, i) => i !== index)
        }));
    };

    // Facilities handlers
    const handleAddFacility = () => {
        if (formData.currentFacility.trim() && !formData.facilities.includes(formData.currentFacility.trim())) {
            setFormData(prev => ({
                ...prev,
                facilities: [...prev.facilities, prev.currentFacility.trim()],
                currentFacility: ''
            }));
        }
    };

    const handleRemoveFacility = (index) => {
        setFormData(prev => ({
            ...prev,
            facilities: prev.facilities.filter((_, i) => i !== index)
        }));
    };

    // Form validation
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Hospital name is required';
        if (!formData.address.trim()) newErrors.address = 'Address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';
        if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (formData.specialties.length === 0) newErrors.specialties = 'At least one specialty is required';
        if (formData.facilities.length === 0) newErrors.facilities = 'At least one facility is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();

            // Append all form data
            formDataToSend.append('name', formData.name);
            formDataToSend.append('address', formData.address);
            formDataToSend.append('city', formData.city);
            formDataToSend.append('state', formData.state);
            formDataToSend.append('pincode', formData.pincode);
            formDataToSend.append('phone', formData.phone);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('website', formData.website);
            formDataToSend.append('rating', formData.rating);
  
            formData.specialties.forEach((specialty, index) => {
                formDataToSend.append(`specialties[${index}]`, specialty);
            });

            formData.facilities.forEach((facility, index) => {
                formDataToSend.append(`facilities[${index}]`, facility);
            });

            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }

            const res = await axiosInstance.put(`/hospital/${hospitalid}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data?.success) {
                toast.success('Hospital updated successfully!');
                navigate(-1);
            } else {
                toast.error(res.data?.message || 'Failed to update hospital');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred while updating the hospital');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper to create input props
    const getInputProps = (name) => ({
        id: name,
        name: name,
        value: formData[name],
        onChange: handleChange,
        className: `w-full px-4 py-3 rounded-xl border ${errors[name] ? 'border-red-400 focus:ring-red-300 focus:border-red-500'
            : 'border-gray-300 focus:ring-blue-300 focus:border-blue-500'
            } focus:ring-2 transition-all shadow-sm bg-white`,
    });

    // Helper for error messages
    const renderError = (fieldName) => errors[fieldName] && (
        <span className="text-red-500 text-xs mt-1">{errors[fieldName]}</span>
    );

    return (
        <Dashboard>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100  px-4   flex items-center justify-center">
                <div className="w-full ">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-6 sm:px-8">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Update Hospital</h2>
                                    <p className="mt-1 text-blue-100">Edit the details of {hospital?.name}</p>
                                </div>
                                <button
                                    onClick={() => navigate('/hospitals')}
                                    className="text-blue-100 hover:text-white transition-colors p-1 rounded-full hover:bg-blue-700"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto">
                            {/* Basic Information Section */}
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                    </svg>
                                    Basic Information
                                </h3>
                                <div className="grid gap-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Hospital Name*</label>
                                        <input type="text" {...getInputProps('name')} />
                                        {renderError('name')}
                                    </div>
                                    <div>
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address*</label>
                                        <textarea {...getInputProps('address')} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-blue-300 focus:border-blue-500 focus:ring-2 transition-all shadow-sm bg-white"></textarea>
                                        {renderError('address')}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City*</label>
                                            <input type="text" {...getInputProps('city')} />
                                            {renderError('city')}
                                        </div>
                                        <div>
                                            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State*</label>
                                            <input type="text" {...getInputProps('state')} />
                                            {renderError('state')}
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">Pincode*</label>
                                        <input type="text" {...getInputProps('pincode')} maxLength="6" />
                                        {renderError('pincode')}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information Section */}
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                    </svg>
                                    Contact Information
                                </h3>
                                <div className="grid gap-4">
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone*</label>
                                        <input type="tel" {...getInputProps('phone')} />
                                        {renderError('phone')}
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                                        <input type="email" {...getInputProps('email')} />
                                        {renderError('email')}
                                    </div>
                                    <div>
                                        <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                        <input  {...getInputProps('website')} />
                                    </div>
                                    <div>
                                        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Hospital Image</label>
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    id="image"
                                                    name="image"
                                                    onChange={handleImageChange}
                                                    accept="image/*"
                                                    className="block w-full text-sm text-gray-500
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-md file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-blue-50 file:text-blue-700
                                                    hover:file:bg-blue-100"
                                                />
                                            </div>
                                            {imagePreview && (
                                                <div className="w-20 h-20 rounded-md overflow-hidden border border-gray-200 shadow-sm">
                                                    <img src={imagePreview} alt="Hospital preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range"
                                                min="0"
                                                max="5"
                                                step="0.1"
                                                {...getInputProps('rating')}
                                                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                                            />
                                            <span className="text-lg font-medium text-blue-600 w-10 text-center">
                                                {formData.rating}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0</span>
                                            <span>5</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Services Section */}
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                    </svg>
                                    Services
                                </h3>

                                {/* Specialties */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialties*</label>
                                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={formData.currentSpecialty}
                                            onChange={(e) => setFormData({ ...formData, currentSpecialty: e.target.value })}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                                            placeholder="Add specialty"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddSpecialty}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {renderError('specialties')}

                                    <p className="text-sm text-gray-500 mb-2">Suggestions:</p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {specialtySuggestions.map((spec) => (
                                            <button
                                                key={spec}
                                                type="button"
                                                onClick={() => !formData.specialties.includes(spec) &&
                                                    setFormData({ ...formData, specialties: [...formData.specialties, spec] })}
                                                className={`px-3 py-1 text-sm rounded-full transition-colors shadow-sm ${formData.specialties.includes(spec)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                                    }`}
                                            >
                                                {spec}
                                            </button>
                                        ))}
                                    </div>

                                    <p className="text-sm text-gray-500 mb-2">Selected specialties:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.specialties.map((spec, index) => (
                                            <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm shadow-sm">
                                                {spec}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSpecialty(index)}
                                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Facilities */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Facilities*</label>
                                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={formData.currentFacility}
                                            onChange={(e) => setFormData({ ...formData, currentFacility: e.target.value })}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                                            placeholder="Add facility"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddFacility}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {renderError('facilities')}

                                    <p className="text-sm text-gray-500 mb-2">Suggestions:</p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {facilitySuggestions.map((fac) => (
                                            <button
                                                key={fac}
                                                type="button"
                                                onClick={() => !formData.facilities.includes(fac) &&
                                                    setFormData({ ...formData, facilities: [...formData.facilities, fac] })}
                                                className={`px-3 py-1 text-sm rounded-full transition-colors shadow-sm ${formData.facilities.includes(fac)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                                    }`}
                                            >
                                                {fac}
                                            </button>
                                        ))}
                                    </div>

                                    <p className="text-sm text-gray-500 mb-2">Selected facilities:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.facilities.map((fac, index) => (
                                            <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm shadow-sm">
                                                {fac}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveFacility(index)}
                                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => navigate('/hospitals')}
                                    className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center justify-center shadow-sm"
                                >
                                    {isSubmitting && (
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    {isSubmitting ? 'Updating...' : 'Update Hospital'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Dashboard>
    );
};

export default HospitalUpdateForm;