import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosInstance from '../../Helper/axiosInstance';
import { ChangePassword, getAllDoctors, GetDoctorHospitalId } from '../../Redux/doctorSlice';
import Dashboard from '../../components/Layout/Dashboard';
import avatar from '../../assets/logo-def.png';
import toast from 'react-hot-toast';
const Setting = () => {
  const dispatch = useDispatch()
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedHospital, setSelectedHospital] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  // State for hospital information
  const [hospitalInfo, setHospitalInfo] = useState(null);
  const [doctors, setDoctors] = useState([]);
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axiosInstance.get("/user/me");
        const res = await dispatch(GetDoctorHospitalId(response.data.user?._id))
        setHospitalInfo(response?.data?.user)
       
        setDoctors(res.payload.doctors);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }


    // const res =  dispatch(GetDoctorHospitalId(hospitalInfo?._id))

    fetchData();
  }, [selectedHospital, selectedDoctor]);



  // State for selected service/doctor and reason
  const [selectedService, setSelectedService] = useState(null);


  const [reason, setReason] = useState('');
  const [activeTab, setActiveTab] = useState('hospital');
  const [searchTerm, setSearchTerm] = useState('');

  // Toggle hospital status
  const toggleHospitalStatus = () => {

    setSelectedHospital(true);
    // setReason(hospitalInfo.deactivationReason || '');
  };

  // Toggle service status
  const toggleServiceStatus = (service) => {
    setSelectedService(service);
    setSelectedDoctor(null);
    setSelectedHospital(false);
    setReason(service.deactivationReason || '');
  };

  // Toggle doctor status
  const toggleDoctorStatus = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedService(null);
    setSelectedHospital(false);
    // setReason(doctor.deactivationReason || '');
  };

  // Confirm hospital status change
  const confirmHospitalStatusChange = async () => {


    // If deactivating hospital, also deactivate all services and doctors
    if (hospitalInfo) {
      //  alert(reason)
      const res = await axiosInstance.patch(`hospital/${hospitalInfo?._id}/status`, {
        status: !hospitalInfo.status,
        deactivationReason: reason || ""
      })
      setReason('');
      setSelectedHospital(false);

    }

    setSelectedHospital(false);

  };

  // Confirm service status change
  const confirmServiceStatusChange = () => {
    if (!selectedService) return;

    const updatedServices = services.map(service =>
      service.id === selectedService.id
        ? {
          ...service,
          active: !service.active,
          deactivationReason: !service.active ? '' : reason
        }
        : service
    );

    // If deactivating a service, also deactivate all doctors in that service
    if (selectedService.active) {
      const updatedDoctors = doctors.map(doctor =>
        doctor.serviceId === selectedService.id
          ? {
            ...doctor,
            active: false,
            deactivationReason: `Service ${selectedService.name} deactivated: ${reason}`
          }
          : doctor
      );
      setDoctors(updatedDoctors);
    }

    setServices(updatedServices);
    setSelectedService(null);
    setReason('');
  };

  // Confirm doctor status change
  const confirmDoctorStatusChange = async () => {
    // alert(selectedDoctor._id)
    if (!selectedDoctor) return;
    const updatedDoctors = doctors.map(doctor =>
      doctor._id === selectedDoctor._id
        ? {
          ...doctor,
          active: !doctor.active,
          deactivationReason: !doctor.active ? '' : reason
        }
        : doctor
    );
    alert(reason)

    const res = await axiosInstance.patch(`/doctor/${selectedDoctor._id}/status`, {
      deactivationReason: reason || ""
    })
    if (res.data.success) {

      setSelectedDoctor(null);
      setReason('');
    }
    setReason('');
  };

  // Get doctors by service
  // const getDoctorsByService = (serviceId) => {
  //   return doctors.filter(doctor => doctor.serviceId === serviceId);
  // };

  // Filter doctors based on search term
  const filteredDoctors = doctors?.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All field are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match!");
      return;
    }

   const res =  await dispatch(ChangePassword({ currentPassword, newPassword }))
    if(res.payload.success){
      toast.success(res.payload.message)
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };


      const [loading, setLoading] = useState(true);
  
      useEffect(() => {
          
          const timer = setTimeout(() => {
              setLoading(false);
          }, 2000);
  
          return () => clearTimeout(timer); 
      }, []);
  
      if (loading) {
          return (
              <Dashboard>
                  <div className="flex justify-center items-center h-full">
                    
                      <span className="Loader"></span>
                  </div>
              </Dashboard>
          );
      }

  return (
    <Dashboard>
      <div className="min-h-screen bg-slate-50 px-2 md:px-2">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Hospital Management System</h1>
            <p className="text-slate-600 mt-2 text-sm md:text-base">
              Manage your hospital's services, doctors, and overall availability.
            </p>
          </header>

          {/* Tabs */}
          <div className="flex mb-6 bg-white rounded-lg border border-slate-200 p-1">
            <button
              className={`flex-1 py-3 px-4 font-medium text-sm md:text-base transition-colors rounded-md flex items-center justify-center ${activeTab === 'hospital' ? 'bg-blue-50 text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('hospital')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Hospital
            </button>

            <button
              className={`flex-1 py-3 px-4 font-medium text-sm md:text-base transition-colors rounded-md flex items-center justify-center ${activeTab === 'doctors' ? 'bg-blue-50 text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('doctors')}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Doctors
            </button>
          </div>

          {/* Hospital Tab */}
          {activeTab === 'hospital' && (
            <div className="bg-white rounded-lg shadow-xs border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h2 className="text-lg md:text-xl font-semibold text-slate-800">Hospital Information</h2>
                <p className="text-slate-600 text-xs md:text-sm mt-1">
                  Manage your hospital's overall availability and information.
                </p>
              </div>

              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                  <div className="flex items-start mb-4 md:mb-0">
                    <div className={`h-5 w-5 rounded-full mr-4 mt-1 flex-shrink-0 ${hospitalInfo?.status ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    <div>
                      <h3 className="text-base md:text-lg font-medium text-slate-800">{hospitalInfo?.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${hospitalInfo?.status ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                          {hospitalInfo?.status ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {!hospitalInfo?.status && hospitalInfo?.deactivationReason && (
                        <p className="text-xs text-slate-600 mt-2 bg-slate-100 p-2 rounded-md">
                          <span className="font-medium">Reason:</span> {hospitalInfo.deactivationReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={toggleHospitalStatus}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center ${hospitalInfo?.status
                      ? 'bg-rose-500 text-white hover:bg-rose-600'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600'
                      }`}
                  >
                    {hospitalInfo?.status ? (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Deactivate Hospital
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Activate Hospital
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Contact Information</h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start">
                        <svg className="w-4 h-4 mr-2 mt-0.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {hospitalInfo?.address}
                      </li>
                      <li className="flex items-start">
                        <svg className="w-4 h-4 mr-2 mt-0.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 极 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {hospitalInfo?.phone}
                      </li>
                      <li className="flex items-start">
                        <svg className="w-4 h-4 mr-2 mt-0.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 极 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 极 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {hospitalInfo?.email}
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Administration</h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start">
                        <svg className="w-4 h-4 mr-2 mt-0.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns极="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>
                          <span className="font-medium">Administrator:</span> {hospitalInfo?.admin}
                        </span>
                      </li>
                      <li className="flex items-start">
                        <svg className="w-4 h-4 mr-2 mt-0.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          <span className="font-medium">Last updated:</span> Today at 10:30 AM
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                  <h2 className="text-lg md:text-xl font-semibold text-slate-800 mb-4">
                    Change Password
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Current Password */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>

                <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Important Note
                  </h4>
                  <p className="text-xs text-blue-600">
                    Deactivating the hospital will automatically deactivate all services and doctors. You will need to reactivate the hospital first before you can activate any services or doctors.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Services Tab */}


          {/* Doctors Tab */}
          {activeTab === 'doctors' && (
            <div className="bg-white rounded-lg shadow-xs border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-slate-800">Hospital Doctors</h2>
                  <p className="text-slate-600 text-xs md:text-sm mt-1">
                    Manage individual doctor availability. {!hospitalInfo.status && <span className="text-rose-600 font-medium">Hospital is currently deactivated. Doctors cannot be activated.</span>}
                  </p>
                </div>
                <div className="mt-3 md:mt-0">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 极 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search doctors..."
                      className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium极 text-slate-500 uppercase tracking-wider">
                        Specialty
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredDoctors.map(doctor => {

                      return (
                        <tr key={doctor._id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={` rounded-full }`}>
                              <img className=' h-10 w-10 rounded-full ' src={doctor.photo || avatar} alt="" />
                            </div>
                          </td>
                          <td className="px极6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">{doctor.name}</div>
                            {!doctor.status && doctor.deactivationReason && (
                              <div className="text-xs text-slate-500 mt-1">Reason: {doctor.deactivationReason}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {doctor.specialty}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-slate-500">
                              <div className={`h-3 w-3 rounded-full mr-2 ${doctor.status ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
                              {/* {service?.name} */}

                              {!doctor.status && (
                                <span className="ml-2 text-xs text-rose-500">(Service inactive)</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => toggleDoctorStatus(doctor)}
                              className={`px-3 py-1 rounded-lg font-medium text-sm transition-colors flex items-center ${doctor.status
                                ? 'bg-rose-500 text-white hover:bg-rose-600'
                                : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                }`}
                              disabled={(!hospitalInfo.status) && doctor.status}
                              title={(!hospitalInfo.status) && doctor.status ? "Cannot activate doctor when hospital or service is inactive" : ""}
                            >
                              {doctor.status ? (
                                <>
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Activate
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredDoctors.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0极" />
                    </svg>
                    <p className="mt-2">No doctors found matching your search.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Modal for Hospital */}
          {selectedHospital && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center mb-4">
                  <div className={`h-6 w-6 rounded-full mr-3 ${hospitalInfo.active ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    {hospitalInfo.active ? 'Deactivate Hospital' : 'Activate Hospital'}
                  </h2>
                </div>

                <p className="text-slate-600 mb-4">
                  You are about to {hospitalInfo.active ? 'deactivate' : 'activate'} {' '}
                  <span className="font-semibold text-blue-600">{hospitalInfo.name}</span>.
                  {hospitalInfo.active && ' This will also deactivate all services and doctors.'}
                </p>

                {hospitalInfo?.status && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Reason for deactivation (required)
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Please provide a reason for deactivating the hospital"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      required
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setSelectedHospital(false);
                      setReason('');
                    }}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmHospitalStatusChange}
                    disabled={hospitalInfo?.status && !reason}
                    className={`px-4 py-2 rounded-lg text-white transition-colors flex items-center ${hospitalInfo.status
                      ? reason
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-rose-300 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                  >
                    {hospitalInfo?.status ? (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6极12 12" />
                        </svg>
                        Deactivate Hospital
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Activate Hospital
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Status Modal for Service */}
          {selectedService && (

            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center mb-4">
                  {/* <div className={`h-6 w-6 rounded-full mr-3 ${selectedService?.active ? 'bg-rose-500' : 'bg-emerald-500`}}>
                </div> */}.
                  <div
                    className={`h-6 w-6 rounded-full mr-3 ${selectedService?.active ? "bg-rose-500" : "bg-emerald-500"
                      }`}
                  ></div>

                  <h2 className="text-xl font-semibold text-slate-800">
                    {selectedService.active ? 'Deactivate Service' : 'Activate Service'}
                  </h2>
                </div>

                <p className="text-slate-600 mb-4">
                  You are about to {selectedService.active ? 'deactivate' : 'activate'} the{' '}
                  <span className="font-semibold text-blue-600">{selectedService.name}</span> service.
                  {selectedService.active && ' This will also deactivate all doctors in this service.'}
                </p>

                {selectedService.active && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Reason for deactivation (required)
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Please provide a reason for deactivating this service"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      required
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setSelectedService(null);
                      setReason('');
                    }}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmServiceStatusChange}
                    disabled={selectedService.active && !reason}
                    className={`px-4 py-2 rounded-lg text-white transition-colors flex items-center ${selectedService.active
                      ? reason
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-rose-300 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                  >
                    {selectedService.active ? (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Deactivate Service
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4极 mr-1" fill="none" stroke极="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Activate Service
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}


          {selectedDoctor && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center mb-4">
                  <div className={`h-6 w-6 rounded-full mr-3 ${selectedDoctor.active ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    {selectedDoctor.status ? 'Deactivate Doctor' : 'Activate Doctor'}
                  </h2>
                </div>

                <p className="text-slate-600 mb-4">
                  You are about to {selectedDoctor.status ? 'deactivate' : 'activate'} {' '}
                  <span className="font-semibold text-blue-600">{selectedDoctor.name}</span>.
                </p>

                {selectedDoctor.status && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-极7 mb-2">
                      Reason for deactivation (required)
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Please provide a reason for deactivating this doctor"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      required
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setSelectedDoctor(null);
                      setReason('');
                    }}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDoctorStatusChange}
                    disabled={selectedDoctor.status && !reason}
                    className={`px-4 py-2 rounded-lg text-white transition-colors flex items-center ${selectedDoctor.status
                      ? reason
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-rose-300 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                  >
                    {selectedDoctor.status ? (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Deactivate Doctor
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13极4 4L19 7" />
                        </svg>
                        Activate Doctor
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Dashboard>
  );
};

export default Setting;