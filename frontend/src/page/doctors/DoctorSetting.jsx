import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import axiosInstance from '../../Helper/axiosInstance';
import Dashboard from '../../components/Layout/Dashboard';
import avatar from '../../../src/assets/logo-def.png';
import toast from 'react-hot-toast';
import { ChangePassword } from '../../Redux/doctorSlice';
import Slots from './Slots';
import { Link } from 'react-router-dom';
const DoctorSetting = () => {
    const dispatch = useDispatch()
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [showResignModal, setShowResignModal] = useState(false);
    const [resignationReason, setResignationReason] = useState('');
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axiosInstance.get("/user/me");
                setDoctor(response.data.user)
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        fetchData();
    }, [showResignModal, successMessage]);



    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                setLoading(true);


                setLoading(false);
            } catch (error) {
                console.error("Error fetching doctor data:", error);
                setLoading(false);
            }
        };

        fetchDoctorData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            // Replace with actual API call
            // await axiosInstance.patch("/doctor/profile", formData);

            setDoctor(formData);
            setEditing(false);
            setSuccessMessage('Profile updated successfully!');

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const handleStatusToggle = () => {
        if (doctor.status) {
            // If currently active, show resign modal
            setShowResignModal(true);
        } else {
            // If currently inactive, just activate
            toggleStatus();
        }
    };

    const toggleStatus = async () => {
        try {

            // Replace with actual API call
            await axiosInstance.post(`/doctor/active`, {
                resignationReason: " "
            });
            setSuccessMessage(`Profile ${!doctor.status ? 'activated' : 'deactivated'} successfully!`);
            setShowResignModal(false);
            setTimeout(() => setSuccessMessage(''), 3000);
            setResignationReason(''); // Reset resignation reason
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleResign = async () => {

        if (!resignationReason.trim()) {
            alert('Please provide a resignation reason');
            return;
        }

        try {

            const res = await axiosInstance.post(`/doctor/active`, {
                deactivationReason: resignationReason || ""
            })
            //   // Add API call for resignation here
            //   // await axiosInstance.post("/doctor/resign", {
            //   //   reason: resignationReason
            //   // });

            //   // After resignation, set status to inactive
            //   setDoctor(prev => ({ ...prev, status: false }));
            setSuccessMessage('Resignation submitted successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
            setShowResignModal(false);
            setResignationReason(''); // Reset resignation reason
        } catch (error) {
            console.error("Error submitting resignation:", error);
        }
    };


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

        await dispatch(ChangePassword({ currentPassword, newPassword }))

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    if (loading) {
        return (
            <Dashboard>
                <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </Dashboard>
        );
    }

    return (
        <Dashboard>
            <div className="min-h-screen bg-slate-50 px-4 py-6">
                <div className=" mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Doctor Profile Settings</h1>
                                <p className="text-slate-600 mt-2 text-sm md:text-base">
                                    Manage your professional profile and availability
                                </p>
                                {
                                    !doctor?.status && (
                                        <p className="text-red-600 bg-red-100 py-1 px-2 rounded-sm mt-2 text-sm md:text-base">
                                            {doctor?.deactivationReason}
                                        </p>

                                    )
                                }
                            </div>
                            <div className="mt-4 md:mt-0">
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${doctor?.status ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                    }`}>
                                    <div className={`h-2 w-2 rounded-full mr-2 ${doctor?.status ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                    {doctor?.status ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {successMessage && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-emerald-600">{successMessage}</span>
                            </div>
                        </div>
                    )}

                    {/* Profile Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                            <h2 className="text-lg md:text-xl font-semibold text-slate-800">Personal Information</h2>
                        </div>

                        <div className="p-6">
                            <div className="flex flex-col md:flex-row gap-6 mb-6">
                                <div className="flex-shrink-0">
                                    <img
                                        src={doctor?.photo || avatar}
                                        alt={doctor?.name}
                                        className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-slate-100" />
                                    {editing && (
                                        <button className="mt-3 text-sm text-blue-600 hover:text-blue-800">
                                            Change Photo
                                        </button>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                            {editing ? (
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={doctor.name}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            ) : (
                                                <p className="text-slate-900 font-medium">{doctor?.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Specialty</label>
                                            {editing ? (
                                                <input
                                                    type="text"
                                                    name="specialty"
                                                    value={doctor.specialty}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            ) : (
                                                <p className="text-slate-900 font-medium">{doctor?.specialty}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                            {editing ? (
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            ) : (
                                                <p className="text-slate-600">{doctor?.email}</p>
                                            )}
                                        </div>

                                        {/* <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                      {editing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-slate-600">{doctor.phone}</p>
                      )}
                    </div> */}

                                        {/* <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">License Number</label>
                      <p className="text-slate-600">{doctor.licenseNumber}</p>
                    </div> */}

                                        {/* <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                      {editing ? (
                        <input
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-slate-600">{doctor.department}</p>
                      )}
                    </div> */}
                                    </div>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                                {editing ? (
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                ) : (
                                    <p className="text-slate-600">{doctor?.bio}</p>
                                )}
                            </div>

                            {/* Education and Experience */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Education</label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            name="education"
                                            value={doctor?.qualification}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    ) : (
                                        <p className="text-slate-600">{doctor?.qualification}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Experience</label>
                                    {editing ? (
                                        <input
                                            type="text"
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    ) : (
                                        <p className="text-slate-600">{doctor?.experience}</p>
                                    )}
                                </div>
                            </div>

                            {/* Availability */}
                            {/* <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Availability</label>
                {editing ? (
                  <input
                    type="text"
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-slate-600">{doctor.availability}</p>
                )}
              </div> */}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                {editing ? (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditing(false);
                                                setFormData(doctor);
                                            }}
                                            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {/* <button
                      onClick={() => setEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit Profile
                    </button> */}
                                        <button
                                            onClick={handleStatusToggle}
                                            className={`px-4 py-2 rounded-lg transition-colors ${doctor?.status
                                                ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                }`}>
                                            {doctor?.status ? 'Set as Inactive' : 'Set as Active'}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <Link
                        to={`/doctor/add/slot`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
                    >
                        Add Availability
                    </Link>
                    {/* <Slots/> */}

                    {/* Statistics Card */}
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

                    {/* Quick Actions */}
                    {/* <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg md:text-xl font-semibold text-slate-800 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left">
                                <div className="text-blue-600 mb-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3极-9 8h10M5 21h14a2 2 0 002-2V7a2 2 极 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="font-medium text-slate-800">View Schedule</h3>
                                <p className="text极 text-slate-600">Check upcoming appointments</p>
                            </button>

                            <button className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left">
                                <div className="text-green-600 mb-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="font-medium text-slate-800">Patient Records</h3>
                                <p className="text-sm text-slate-600">Access patient history</p>
                            </button>

                            <button className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left">
                                <div className="text-purple-600 mb-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0极 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-medium text-slate-800">Settings</h3>
                                <p className="text-sm text-slate-600">Account preferences</p>
                            </button>
                        </div>
                    </div> */}
                </div>
            </div>

            {/* Resignation Modal */}
            {showResignModal && (
                <div className="fixed inset-0 bg-gray-100 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                >
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-4">Confirm Status Change</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Please provide a reason for deactivation:
                            </label>
                            <textarea
                                value={resignationReason}
                                onChange={(e) => setResignationReason(e.target.value)}
                                rows="3"
                                placeholder="Enter your reason for deactivation..."
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <p className="text-slate-600 mb-6">
                            This will make your profile unavailable for new appointments.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleResign}
                                disabled={!resignationReason.trim()}
                                className={`px-4 py-2 text-white rounded-lg transition-colors ${resignationReason.trim()
                                    ? 'bg-rose-600 hover:bg-rose-700'
                                    : 'bg-rose-400 cursor-not-allowed'
                                    }`}
                            >
                                Submit Resignation & Deactivate
                            </button>
                            <button
                                onClick={() => {
                                    setShowResignModal(false);
                                    setResignationReason('');
                                }}
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Dashboard>
    );
};

export default DoctorSetting;