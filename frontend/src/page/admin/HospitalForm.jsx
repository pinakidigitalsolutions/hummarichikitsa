import { useState, useEffect } from 'react';
import axios from 'axios'; // Assuming axios is installed and configured
import Dashboard from '../../components/Layout/Dashboard';
import { useDispatch } from 'react-redux';
import { createHospital } from '../../Redux/hospitalSlice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Default App component to make this runnable in a preview
export default function App() {
  return (
    <div className="bg-gray-100">
      <HospitalForm />
    </div>
  );
}
const HospitalForm = () => {
  const navigate = useNavigate()
  const [previewImage, setImagePreview] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    password: '',
    website: '',
    image: '',
    rating: 2.5, // Default rating
    specialties: [],
    facilities: [],
    currentSpecialty: '',
    currentFacility: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState('basic'); // 'basic', 'contact', 'services'

  // Sample suggestions for specialties and facilities
  const specialtySuggestions = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics',
    'Oncology', 'Dermatology', 'Gastroenterology', 'Urology',
    'ENT', 'Ophthalmology', 'Psychiatry', 'Pulmonology'
  ];

  const facilitySuggestions = [
    'Emergency Room', 'ICU', 'Pharmacy', 'Ambulance Service',
    'Laboratory', 'Radiology (X-Ray/MRI)', 'Cafeteria', 'Patient Parking',
    'Blood Bank', 'Physical Therapy', 'Operation Theaters', 'Waiting Area'
  ];

  useEffect(() => {
    // Clear success message after 5 seconds
    if (submitSuccess) {
      const timer = setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for the field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };


  const getImage = (event) => {
    event.preventDefault();
    const uploadedImage = event.target.files[0];
    if (uploadedImage) {
      setFormData({
        ...formData,
        image: uploadedImage,
      });
      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadedImage);
      fileReader.addEventListener("load", function () {
        setImagePreview(this.result);
      });
    }
  };


  const handleAddSpecialty = () => {
    if (formData.currentSpecialty.trim() && !formData.specialties.includes(formData.currentSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, prev.currentSpecialty.trim()],
        currentSpecialty: ''
      }));
      if (errors.specialties) {
        setErrors(prev => ({ ...prev, specialties: undefined }));
      }
    }
  };

  const handleRemoveSpecialty = (index) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  // --- Facilities Handlers ---
  const handleAddFacility = () => {
    if (formData.currentFacility.trim() && !formData.facilities.includes(formData.currentFacility.trim())) {
      setFormData(prev => ({
        ...prev,
        facilities: [...prev.facilities, prev.currentFacility.trim()],
        currentFacility: ''
      }));
      if (errors.facilities) {
        setErrors(prev => ({ ...prev, facilities: undefined }));
      }
    }
  };

  const handleRemoveFacility = (index) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.filter((_, i) => i !== index)
    }));
  };

  // --- Form Validation ---
  const validateForm = () => {
    const newErrors = {};
    // Basic Info
    if (!formData.name.trim()) newErrors.name = 'Hospital name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Pincode must be 6 digits';

    // Contact Info
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[0-9]{10,15}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number (10-15 digits)';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (formData.rating === 0) newErrors.rating = 'Rating is required';


    // Services
    if (formData.specialties.length === 0) newErrors.specialties = 'At least one specialty is required';
    if (formData.facilities.length === 0) newErrors.facilities = 'At least one facility is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const dispatch = useDispatch();
  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Determine which section has the first error and navigate to it
      const errorFields = Object.keys(errors);
      const basicFields = ['name', 'address', 'city', 'state', 'pincode'];
      const contactFields = ['phone', 'email', 'website', 'image', 'rating'];
      // const serviceFields = ['specialties', 'facilities']; // Already checked by validateForm

      if (errorFields.some(field => basicFields.includes(field))) {
        setActiveSection('basic');
      } else if (errorFields.some(field => contactFields.includes(field))) {
        setActiveSection('contact');
      } else {
        setActiveSection('services'); // Default to services if specific section not found
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false); // Reset success status
    setErrors({}); // Clear previous errors
    if (formData.password == null) {
      toast.error('password is required')
      return
    }
    // Simulate API call




    // const hospitalData = new FormData();
    // hospitalData.append("name", formData.name);
    // hospitalData.append("address", formData.address);
    // hospitalData.append("city", formData.city);
    // hospitalData.append("state", formData.state);
    // hospitalData.append("pincode", formData.pincode);
    // hospitalData.append("phone", formData.phone);
    // hospitalData.append("email", formData.email);
    // hospitalData.append("password", formData.password);
    // hospitalData.append("website", formData.website);
    // hospitalData.append("image", formData.image);
    // hospitalData.append("rating", formData.rating);
    // hospitalData.append("specialties[]", formData.specialties);
    // hospitalData.append("facilities[]", formData.facilities);
    // hospitalData.append("currentSpecialty", formData.currentSpecialty);
    // hospitalData.append("facilities", formData.facilities);

    const hospitalData = new FormData();

    // Append simple fields
    hospitalData.append("name", formData.name || "");
    hospitalData.append("address", formData.address || "");
    hospitalData.append("city", formData.city || "");
    hospitalData.append("state", formData.state || "");
    hospitalData.append("pincode", formData.pincode || "");
    hospitalData.append("phone", formData.phone || "");
    hospitalData.append("email", formData.email || "");
    hospitalData.append("password", formData.password || "");
    hospitalData.append("website", formData.website || "");
    hospitalData.append("rating", formData.rating || "");

    // Append image (if exists)
    if (formData.image) {
      hospitalData.append("image", formData.image);
    }

    // Append arrays (specialties and facilities)
    if (Array.isArray(formData.specialties)) {
      formData.specialties.forEach((specialty) => {
        hospitalData.append("specialties[]", specialty);
      });
    }

    if (Array.isArray(formData.facilities)) {
      formData.facilities.forEach((facility) => {
        hospitalData.append("facilities[]", facility);
      });
    }

    // Append currentSpecialty (if needed)
    if (formData.currentSpecialty) {
      hospitalData.append("currentSpecialty", formData.currentSpecialty);
    }

    const res = await dispatch(createHospital(hospitalData))
       if(res.payload.success){
         setIsSubmitting(false);
         navigate('/hospital/list')
         
       }
    // try {
    //   // Replace with your actual API endpoint
    //   // const response = await axios.post('/api/hospitals', formData);
    //   // console.log('API Response:', response.data);

    //   // Simulate a successful API call after 2 seconds
    //   await new Promise(resolve => setTimeout(resolve, 2000));

    //   setSubmitSuccess(true);
    //   // Reset form after successful submission
    //   // setFormData({
    //   //   name: '', address: '', city: '', state: '', pincode: '',
    //   //   phone: '', email: '', website: '', image: '', rating: 2.5,
    //   //   specialties: [], facilities: [],
    //   //   currentSpecialty: '', currentFacility: ''
    //   // });
    //   setActiveSection('basic'); // Go back to the first section
    //   window.scrollTo({ top: 0, behavior: 'smooth' });

    // } catch (err) {
    //   console.error('Submission Error:', err);
    //   let errorMessage = 'An unexpected error occurred. Please try again.';
    //   if (err.response && err.response.data && err.response.data.errors) {
    //     // If backend sends specific field errors
    //     setErrors(err.response.data.errors);
    //     errorMessage = 'Please correct the errors highlighted below.';
    //   } else if (err.message) {
    //     errorMessage = err.message;
    //   }
    //   setErrors(prev => ({ ...prev, general: errorMessage }));
    //   window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  // Helper to create input props
  const getInputProps = (name) => ({
    id: name,
    name: name,
    value: formData[name],
    onChange: handleChange,
    className: `w-full px-4 py-3 rounded-lg border ${errors[name] ? 'border-red-400 focus:ring-red-300 focus:border-red-500' : 'border-gray-300 focus:ring-blue-300 focus:border-blue-500'} focus:ring-2 transition-all shadow-sm`,
  });

  // Helper for error messages
  const renderError = (fieldName) => errors[fieldName] && <span className="text-red-500 text-xs mt-1">{errors[fieldName]}</span>;


  return (
    <Dashboard>
      <div className="min-h-screen bg-gradient-to-br   font-sans">
        <div className=" mx-auto">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-2 px-6 sm:px-8">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                <div className="mb-4 md:mb-0">
                  <h4 className="text-xl font-bold text-white tracking-tight">Hospital Registration</h4>
                  {/* <p className="text-blue-100 mt-2 max-w-lg text-sm sm:text-base">
                  Register your healthcare facility to join our network and reach more patients.
                </p> */}
                </div>
                {/* <div className="bg-white/20 p-3 rounded-full flex items-center justify-center shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div> */}
              </div>

              {/* Progress steps */}
              <div className="mt-2">
                <div className="flex items-center justify-between space-x-2 sm:space-x-4">
                  {['basic', 'contact', 'services'].map((section, index) => (
                    <button
                      key={section}
                      onClick={() => setActiveSection(section)}
                      className={`flex-1 text-center py-2 sm:py-3 px-1 sm:px-2 border-b-4 rounded-t-md transition-all duration-300 ease-in-out focus:outline-none
                                ${activeSection === section ? 'border-white text-white font-semibold scale-105' : 'border-transparent text-blue-200 hover:text-white hover:border-blue-300'}`}
                    >
                      <span className="flex items-center justify-center">
                        <span className={`flex items-center justify-center w-3 h-3 rounded-full mr-2 text-xs sm:text-sm font-bold transition-all duration-300 ease-in-out
                                        ${activeSection === section ? ' ring-white' : ' text-white group-hover:bg-blue-400'}`}>
                          {index + 1}
                        </span>
                        <span className="hidden sm:inline capitalize">{section} Info</span>
                        <span className="sm:hidden capitalize">{section.substring(0, 4)}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Status messages */}
            <div className="px-6 sm:px-8 pt-6">
              {submitSuccess && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md shadow-md animate-fadeIn">
                  <div className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-green-800 font-semibold">Registration Successful!</p>
                      <p className="text-green-700 text-sm mt-1">
                        Your hospital has been registered. Our team will review your submission.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {errors.general && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-md animate-fadeIn">
                  <div className="flex items-start">
                    <svg className="h-6 w-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-red-800 font-semibold">Submission Failed</p>
                      <p className="text-red-700 text-sm mt-1">{errors.general}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
              {/* Basic Information Section */}
              <div id="basic-section" className={`${activeSection !== 'basic' ? 'hidden' : ''} animate-fadeIn`}>
                <div className="bg-slate-50 p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-800 mb-6 pb-3 border-b border-slate-300 flex items-center">
                    <svg className="w-6 h-6 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    Basic Information
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Hospital Name <span className="text-red-500">*</span></label>
                      <input type="text" {...getInputProps('name')} placeholder="e.g. City General Hospital" />
                      {renderError('name')}
                    </div>
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-red-500">*</span></label>
                      <textarea {...getInputProps('address')} rows={3} placeholder="Full street address"></textarea>
                      {renderError('address')}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
                        <input type="text" {...getInputProps('city')} placeholder="City name" />
                        {renderError('city')}
                      </div>
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
                        <input type="text" {...getInputProps('state')} placeholder="State name" />
                        {renderError('state')}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">Pincode <span className="text-red-500">*</span></label>
                      <input type="text" {...getInputProps('pincode')} maxLength="6" placeholder="6-digit postal code" />
                      {renderError('pincode')}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button type="button" onClick={() => setActiveSection('contact')} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105">
                    Next: Contact Info
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                </div>
              </div>

              {/* Contact Information Section */}
              <div id="contact-section" className={`${activeSection !== 'contact' ? 'hidden' : ''} animate-fadeIn`}>
                <div className="bg-slate-50 p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-800 mb-6 pb-3 border-b border-slate-300 flex items-center">
                    <svg className="w-6 h-6 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                    Contact Information
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><span className="text-gray-500 text-sm">+91</span></div>
                        <input type="tel" {...getInputProps('phone')} placeholder="9876543210" className={`${getInputProps('phone').className} pl-12`} />
                      </div>
                      {renderError('phone')}
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                      <input type="email" {...getInputProps('email')} placeholder="contact@hospital.com" />
                      {renderError('email')}
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                      <input type="password" {...getInputProps('password')} placeholder="password" />
                      {renderError('password')}
                    </div>

                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">Website <span className="text-gray-500 text-xs">(Optional)</span></label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><span className="text-gray-500 text-sm">https://</span></div>
                        <input type="text" {...getInputProps('website')} placeholder="www.hospitalname.com" className={`${getInputProps('website').className} pl-16`} />
                      </div>
                      {renderError('website')}
                    </div>
                    <div>
                      <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Hospital Image</label>
                      <input type="file" onChange={getImage} placeholder="https://example.com/hospital-image.jpg" />
                      {renderError('image')}
                      {previewImage && !errors.image && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">Image preview:</p>
                          <img src={previewImage} alt="Hospital preview" className="h-28 w-auto object-cover rounded-lg border border-gray-200 shadow-sm" onError={(e) => { e.target.style.display = 'none'; /* Hide if broken */ }} />
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">Rating (0-5) <span className="text-red-500">*</span></label>
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <input type="range" id="rating" name="rating" min="0" max="5" step="0.1" value={formData.rating} onChange={handleChange} className="w-full h-2.5 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                        <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-md shadow-sm">
                          <span className="text-blue-700 font-semibold w-10 text-center text-lg">{parseFloat(formData.rating).toFixed(1)}</span>
                          <svg className="w-5 h-5 ml-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        </div>
                      </div>
                      {renderError('rating')}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-6">
                  <button type="button" onClick={() => setActiveSection('basic')} className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg shadow-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    Back
                  </button>
                  <button type="button" onClick={() => setActiveSection('services')} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105">
                    Next: Services
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                </div>
              </div>

              {/* Services Section */}
              <div id="services-section" className={`${activeSection !== 'services' ? 'hidden' : ''} animate-fadeIn`}>
                {/* Specialties Card */}
                <div className="bg-slate-50 p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                  <h3 className="text-xl font-semibold text-slate-800 mb-2 pb-3 border-b border-slate-300 flex items-center">
                    <svg className="w-6 h-6 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    Specialties <span className="text-red-500 ml-1">*</span>
                  </h3>
                  {renderError('specialties') && <div className="mb-3 -mt-2">{renderError('specialties')}</div>}

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="specialty-input" className="block text-sm font-medium text-gray-700 mb-1">Add medical specialties</label>
                      <div className="flex gap-3">
                        <input type="text" id="specialty-input" value={formData.currentSpecialty} onChange={(e) => setFormData({ ...formData, currentSpecialty: e.target.value })} className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all shadow-sm" placeholder="Type a specialty (e.g. Cardiology)" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialty())} />
                        <button type="button" onClick={handleAddSpecialty} className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors transform hover:scale-105">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                          Add
                        </button>
                      </div>
                    </div>
                    {specialtySuggestions.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">Common specialties (click to add):</p>
                        <div className="flex flex-wrap gap-2">
                          {specialtySuggestions.map((specialty, index) => (
                            <button key={`sugg-spec-${index}`} type="button" onClick={() => { if (!formData.specialties.includes(specialty)) { setFormData(prev => ({ ...prev, specialties: [...prev.specialties, specialty] })); if (errors.specialties) setErrors(prev => ({ ...prev, specialties: undefined })); } }} disabled={formData.specialties.includes(specialty)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${formData.specialties.includes(specialty) ? 'bg-blue-500 text-white cursor-default ring-2 ring-blue-300' : 'bg-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-700'}`}>
                              {specialty} {formData.specialties.includes(specialty) && <span className="ml-1">✓</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Selected specialties ({formData.specialties.length}):</p>
                      {formData.specialties.length === 0 ? (<p className="text-sm text-gray-500 italic">No specialties added yet.</p>) : (
                        <div className="flex flex-wrap gap-2.5">
                          {formData.specialties.map((specialty, index) => (
                            <span key={`sel-spec-${index}`} className="inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 shadow-sm">
                              {specialty}
                              <button type="button" onClick={() => handleRemoveSpecialty(index)} className="ml-2 -mr-1 p-0.5 inline-flex text-blue-500 hover:text-blue-700 hover:bg-blue-200 rounded-full focus:outline-none transition-colors" aria-label={`Remove ${specialty}`}>
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Facilities Card */}
                <div className="bg-slate-50 p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-semibold text-slate-800 mb-2 pb-3 border-b border-slate-300 flex items-center">
                    <svg className="w-6 h-6 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    Facilities <span className="text-red-500 ml-1">*</span>
                  </h3>
                  {renderError('facilities') && <div className="mb-3 -mt-2">{renderError('facilities')}</div>}

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="facility-input" className="block text-sm font-medium text-gray-700 mb-1">Add available facilities</label>
                      <div className="flex gap-3">
                        <input type="text" id="facility-input" value={formData.currentFacility} onChange={(e) => setFormData({ ...formData, currentFacility: e.target.value })} className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all shadow-sm" placeholder="Type a facility (e.g. ICU)" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFacility())} />
                        <button type="button" onClick={handleAddFacility} className="inline-flex items-center px-5 py-3 border border-transparent text-sm font-medium rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors transform hover:scale-105">
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                          Add
                        </button>
                      </div>
                    </div>
                    {facilitySuggestions.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">Common facilities (click to add):</p>
                        <div className="flex flex-wrap gap-2">
                          {facilitySuggestions.map((facility, index) => (
                            <button key={`sugg-fac-${index}`} type="button" onClick={() => { if (!formData.facilities.includes(facility)) { setFormData(prev => ({ ...prev, facilities: [...prev.facilities, facility] })); if (errors.facilities) setErrors(prev => ({ ...prev, facilities: undefined })); } }} disabled={formData.facilities.includes(facility)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${formData.facilities.includes(facility) ? 'bg-blue-500 text-white cursor-default ring-2 ring-blue-300' : 'bg-gray-200 text-gray-700 hover:bg-blue-100 hover:text-blue-700'}`}>
                              {facility} {formData.facilities.includes(facility) && <span className="ml-1">✓</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Selected facilities ({formData.facilities.length}):</p>
                      {formData.facilities.length === 0 ? (<p className="text-sm text-gray-500 italic">No facilities added yet.</p>) : (
                        <div className="flex flex-wrap gap-2.5">
                          {formData.facilities.map((facility, index) => (
                            <span key={`sel-fac-${index}`} className="inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 shadow-sm">
                              {facility}
                              <button type="button" onClick={() => handleRemoveFacility(index)} className="ml-2 -mr-1 p-0.5 inline-flex text-blue-500 hover:text-blue-700 hover:bg-blue-200 rounded-full focus:outline-none transition-colors" aria-label={`Remove ${facility}`}>
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8 pt-2 border-t border-gray-200">
                  <button type="button" onClick={() => setActiveSection('contact')} className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg shadow-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    Back
                  </button>
                  <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105">
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Register Hospital
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        {/* Simple CSS for fadeIn animation */}
        <style jsx global>{`
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: #2563eb; /* Tailwind blue-600 */
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 0 2px rgba(0,0,0,0.3);
        }
        input[type="range"]::-moz-range-thumb {
            width: 18px;
            height: 18px;
            background: #2563eb; /* Tailwind blue-600 */
            border-radius: 50%;
            cursor: pointer;
            border: 2px solid white;
            box-shadow: 0 0 2px rgba(0,0,0,0.3);
        }
      `}</style>
      </div>
    </Dashboard>
  );
};

